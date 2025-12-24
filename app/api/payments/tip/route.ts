import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { stripe, isStripeConfigured, getBaseUrl } from '@/lib/payments/stripe';
import {
  calculateDonationSplit,
  formatCurrency,
  dollarsToCents,
  DONATION_PLATFORM_FEE_PERCENT,
  DONATION_DEVELOPER_PERCENT,
} from '@/lib/payments/config';

/**
 * Tip/Donation API
 * 
 * POST /api/payments/tip
 * Body: { 
 *   developerId: string, 
 *   amount: number (in dollars), 
 *   message?: string 
 * }
 * 
 * Creates a Stripe Checkout session for tipping a developer.
 * Revenue split: 85% to developer, 15% platform fee.
 * 
 * DEMO MODE: Records tip without payment
 * PRODUCTION MODE: Processes real payment via Stripe Connect
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { developerId, amount, message } = await req.json();

    if (!developerId) {
      return NextResponse.json({ error: 'Developer ID required' }, { status: 400 });
    }

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Minimum tip amount is $1.00' },
        { status: 400 }
      );
    }

    if (amount > 1000) {
      return NextResponse.json(
        { error: 'Maximum tip amount is $1,000.00' },
        { status: 400 }
      );
    }

    // Can't tip yourself
    if (developerId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot tip yourself' },
        { status: 400 }
      );
    }

    // Get developer info
    const developer = await prisma.user.findUnique({
      where: { id: developerId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        developerProfile: {
          select: {
            stripeAccountId: true,
            payoutEnabled: true,
          },
        },
      },
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    if (developer.role !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Can only tip developers' },
        { status: 400 }
      );
    }

    // Convert to cents and calculate split
    const amountCents = dollarsToCents(amount);
    const split = calculateDonationSplit(amountCents);

    // DEMO MODE - No Stripe configured
    if (!isStripeConfigured() || !stripe) {
      // Create tip record
      const tip = await prisma.tip.create({
        data: {
          fromUserId: session.user.id,
          toUserId: developerId,
          amountCents: split.totalAmount,
          platformFee: split.platformFee,
          developerAmount: split.developerAmount,
          message: message || null,
          paymentStatus: 'completed',
        },
      });

      // Update developer revenue
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      await prisma.developerRevenue.upsert({
        where: {
          developerId_month: {
            developerId,
            month: firstDayOfMonth,
          },
        },
        update: {
          tips: { increment: split.developerAmount },
        },
        create: {
          developerId,
          month: firstDayOfMonth,
          tips: split.developerAmount,
        },
      });

      // Get tipper's name for the notification
      const tipper = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, displayName: true },
      });
      const tipperName = tipper?.displayName || tipper?.name || 'Someone';

      // Create notification for the developer
      await prisma.notification.create({
        data: {
          userId: developerId,
          type: 'TIP_RECEIVED',
          title: 'You received a tip!',
          message: message 
            ? `${tipperName} sent you a ${formatCurrency(split.totalAmount)} tip: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`
            : `${tipperName} sent you a ${formatCurrency(split.totalAmount)} tip! You'll receive ${formatCurrency(split.developerAmount)}.`,
          link: '/profile/developer/revenue',
          metadata: {
            tipId: tip.id,
            amount: split.totalAmount,
            developerAmount: split.developerAmount,
            fromUserId: session.user.id,
            fromUserName: tipperName,
          },
        },
      });

      return NextResponse.json({
        success: true,
        demo: true,
        tip,
        message: `Tip sent successfully! (Demo mode)`,
        breakdown: {
          totalPaid: formatCurrency(split.totalAmount),
          developerReceives: formatCurrency(split.developerAmount),
          platformFee: formatCurrency(split.platformFee),
          developerPercent: `${DONATION_DEVELOPER_PERCENT}%`,
          platformPercent: `${DONATION_PLATFORM_FEE_PERCENT}%`,
        },
      });
    }

    // PRODUCTION MODE - Real Stripe Checkout
    const developerStripeId = developer.developerProfile?.stripeAccountId;

    // Check if developer can receive payments
    if (!developerStripeId || !developer.developerProfile?.payoutEnabled) {
      return NextResponse.json(
        {
          error: 'This developer has not completed their payment setup yet.',
          code: 'DEVELOPER_NOT_ONBOARDED',
        },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session with Connect
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Tip for ${developer.name}`,
              description: message
                ? `"${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`
                : `Support ${developer.name} on Shader House`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      // Split payment: platform keeps application_fee_amount, rest goes to developer
      payment_intent_data: {
        application_fee_amount: split.platformFee,
        transfer_data: {
          destination: developerStripeId,
        },
        metadata: {
          type: 'tip',
          fromUserId: session.user.id,
          toUserId: developerId,
        },
      },
      metadata: {
        type: 'tip',
        fromUserId: session.user.id,
        toUserId: developerId,
        developerName: developer.name,
        platformFee: split.platformFee.toString(),
        developerAmount: split.developerAmount.toString(),
        message: message?.slice(0, 500) || '',
      },
      success_url: `${getBaseUrl()}/profile/developer/${developer.id}?tipped=true&amount=${amount}`,
      cancel_url: `${getBaseUrl()}/profile/developer/${developer.id}?tip_canceled=true`,
      customer_email: session.user.email,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      breakdown: {
        totalPaid: formatCurrency(split.totalAmount),
        developerReceives: formatCurrency(split.developerAmount),
        platformFee: formatCurrency(split.platformFee),
        developerPercent: `${DONATION_DEVELOPER_PERCENT}%`,
        platformPercent: `${DONATION_PLATFORM_FEE_PERCENT}%`,
      },
    });
  } catch (error: any) {
    console.error('Tip error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process tip' },
      { status: 500 }
    );
  }
}

/**
 * Get tips for a developer
 * 
 * GET /api/payments/tip?developerId=xxx&limit=10
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const developerId = searchParams.get('developerId');
    const limit = parseInt(searchParams.get('limit') || '10');

    // If no developerId, get tips received by current user (if developer)
    const targetId = developerId || session.user.id;

    const tips = await prisma.tip.findMany({
      where: {
        toUserId: targetId,
        paymentStatus: 'completed',
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 50),
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Get total tips received
    const totalResult = await prisma.tip.aggregate({
      where: {
        toUserId: targetId,
        paymentStatus: 'completed',
      },
      _sum: {
        developerAmount: true,
      },
      _count: true,
    });

    return NextResponse.json({
      tips: tips.map((t) => ({
        id: t.id,
        amount: formatCurrency(t.amountCents),
        developerAmount: formatCurrency(t.developerAmount),
        message: t.message,
        createdAt: t.createdAt,
        from: t.fromUser,
      })),
      total: {
        amount: formatCurrency(totalResult._sum.developerAmount || 0),
        count: totalResult._count,
      },
    });
  } catch (error: any) {
    console.error('Error fetching tips:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tips' },
      { status: 500 }
    );
  }
}

