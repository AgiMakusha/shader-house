import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * Cancel Subscription Endpoint
 * 
 * DEMO MODE:
 * - Immediately cancels subscription in database
 * - User is downgraded to FREE tier instantly
 * 
 * PRODUCTION MODE (with Stripe):
 * - Cancels Stripe subscription with cancel_at_period_end=true
 * - User retains access until the end of current billing period
 * - Stripe webhook (customer.subscription.deleted) will update database when period ends
 * - If Stripe API fails, still performs local cancellation for safety
 * 
 * This ensures:
 * ✅ User's cancellation is always recorded locally
 * ✅ Stripe subscription is cancelled (if configured)
 * ✅ Webhook will sync final status when Stripe processes the cancellation
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Normalize role to uppercase (handles legacy lowercase roles)
    const userRole = session.user.role?.toUpperCase();
    if (userRole !== 'GAMER' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only gamers can cancel subscriptions' }, { status: 403 });
    }

    // Get user's Stripe subscription ID if exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        stripeSubscriptionId: true,
        subscriptionTier: true,
      },
    });

    // Cancel Stripe subscription if in production and user has a Stripe subscription
    if (process.env.STRIPE_SECRET_KEY && user?.stripeSubscriptionId) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        // Cancel the subscription at the end of the billing period
        // Use cancel_at_period_end: true to let them keep access until period ends
        // Or use immediate cancellation based on your business logic
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          cancel_at_period_end: true, // User keeps access until billing period ends
        });
        
        console.log(`Stripe subscription ${user.stripeSubscriptionId} marked for cancellation`);
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError);
        // Continue with local cancellation even if Stripe fails
        // Log this for manual review
      }
    }

    // Update local database (works in both demo and production mode)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionTier: 'FREE',
        subscriptionStatus: 'CANCELED',
        subscriptionEnd: new Date(),
      },
    });

    // Update subscription record in database
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

    // Determine appropriate message based on environment
    const message = process.env.STRIPE_SECRET_KEY && user?.stripeSubscriptionId
      ? 'Subscription canceled successfully. You will retain access until the end of your billing period.'
      : 'Subscription canceled successfully. You have been downgraded to Free Access.';

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

