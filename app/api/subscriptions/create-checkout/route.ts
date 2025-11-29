import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * Create Subscription Checkout Endpoint
 * 
 * DEMO MODE (No Stripe Keys):
 * - Immediately activates subscription in database
 * - Returns { success: true } to show success modal
 * - No payment processing (testing only)
 * 
 * PRODUCTION MODE (With Stripe):
 * - Creates/retrieves Stripe Customer
 * - Creates Stripe Checkout Session
 * - Returns { url: stripeCheckoutUrl } to redirect user
 * - User completes payment on Stripe
 * - Stripe webhook (checkout.session.completed) activates subscription
 * - User redirected back with success=true parameter
 * 
 * This ensures:
 * ✅ Smooth demo experience for testing
 * ✅ Secure payment processing in production via Stripe
 * ✅ Automatic subscription activation via webhooks
 * ✅ Customer records stored in both Stripe and local database
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tier } = await req.json();

    if (!tier || tier !== 'CREATOR_SUPPORT') {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Production mode with Stripe integration
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_CREATOR_SUPPORT_PRICE_ID) {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      // Create or get Stripe customer
      let stripeCustomerId = null;
      const existingUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { stripeCustomerId: true },
      });

      if (existingUser?.stripeCustomerId) {
        stripeCustomerId = existingUser.stripeCustomerId;
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: session.user.email,
          metadata: {
            userId: session.user.id,
          },
        });
        stripeCustomerId = customer.id;
        
        // Save customer ID to database
        await prisma.user.update({
          where: { id: session.user.id },
          data: { stripeCustomerId: customer.id },
        });
      }

      // Create Stripe Checkout Session
      const stripeSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_CREATOR_SUPPORT_PRICE_ID, // Set this in .env
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/membership?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/membership`,
        metadata: {
          userId: session.user.id,
          tier: tier,
        },
      });

      return NextResponse.json({ url: stripeSession.url });
    }

    // Demo mode: Update subscription directly
    
    // Cancel any existing active subscriptions first
    await prisma.subscription.updateMany({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        endDate: new Date(),
      },
    });
    
    // Update user's subscription tier
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: 'ACTIVE',
        subscriptionStart: new Date(),
      },
    });

    // Create new subscription record
    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        tier: tier,
        status: 'ACTIVE',
        priceInCents: 1499, // Creator Support Pass is $14.99
        currency: 'USD',
        startDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

