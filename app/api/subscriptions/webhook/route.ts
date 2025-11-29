import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Stripe Webhook Handler
 * 
 * This endpoint receives events from Stripe to keep subscriptions synchronized.
 * 
 * IMPORTANT: This endpoint must be publicly accessible (no authentication)
 * Security is provided by Stripe signature verification.
 * 
 * Webhook Events Handled:
 * 
 * 1. checkout.session.completed
 *    - Triggered when user completes payment
 *    - Activates Creator Support Pass subscription
 *    - Saves Stripe subscription ID to database
 *    - User is redirected to /membership?success=true
 * 
 * 2. customer.subscription.updated
 *    - Triggered when subscription status changes
 *    - Updates subscription status (ACTIVE, PAST_DUE, etc.)
 * 
 * 3. customer.subscription.deleted
 *    - Triggered when subscription is fully cancelled
 *    - Downgrades user to FREE tier
 *    - Happens at end of billing period
 * 
 * 4. invoice.payment_failed
 *    - Triggered when payment fails
 *    - Marks subscription as PAST_DUE
 *    - Stripe will retry payment automatically
 * 
 * Setup Instructions:
 * See STRIPE_SETUP.md for webhook configuration
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Only process webhooks if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('Stripe not configured, skipping webhook processing');
      return NextResponse.json({ received: true, skipped: true });
    }

    // Verify Stripe webhook signature
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        console.log(`Checkout completed for user ${session.metadata.userId}`);
        
        // Update user subscription
        await prisma.user.update({
          where: { id: session.metadata.userId },
          data: {
            subscriptionTier: session.metadata.tier as any,
            subscriptionStatus: 'ACTIVE',
            subscriptionStart: new Date(),
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });

        // Create subscription record
        await prisma.subscription.create({
          data: {
            userId: session.metadata.userId,
            tier: session.metadata.tier as any,
            status: 'ACTIVE',
            priceInCents: session.amount_total || 1499,
            currency: session.currency?.toUpperCase() || 'USD',
            stripeSubscriptionId: session.subscription as string,
            startDate: new Date(),
          },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        console.log(`Subscription updated: ${subscription.id} - status: ${subscription.status}`);
        
        // Map Stripe status to our status
        const status = subscription.status === 'active' ? 'ACTIVE' 
          : subscription.status === 'past_due' ? 'PAST_DUE'
          : subscription.status === 'canceled' ? 'CANCELED'
          : 'INACTIVE';

        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            subscriptionStatus: status as any,
          },
        });

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: status as any,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        console.log(`Subscription deleted: ${subscription.id}`);
        
        // User loses access immediately
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            subscriptionTier: 'FREE',
            subscriptionStatus: 'CANCELED',
            subscriptionEnd: new Date(),
          },
        });

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELED',
            canceledAt: new Date(),
            endDate: new Date(),
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        console.log(`Payment failed for subscription: ${invoice.subscription}`);
        
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: {
            subscriptionStatus: 'PAST_DUE',
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

