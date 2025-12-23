import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { stripe, isStripeConfigured, getBaseUrl } from '@/lib/payments/stripe';
import {
  calculateGameSaleSplit,
  formatCurrency,
  GAME_SALE_PLATFORM_FEE_PERCENT,
  GAME_SALE_DEVELOPER_PERCENT,
} from '@/lib/payments/config';

/**
 * Create Stripe Checkout Session for Game Purchase
 * 
 * POST /api/games/[id]/checkout
 * 
 * Creates a Stripe Checkout session with Connect for payment splitting:
 * - 85% goes to developer (via Connect)
 * - 15% stays with platform (application fee)
 * 
 * DEMO MODE: Simulates purchase without real payment
 * PRODUCTION MODE: Creates real Stripe Checkout session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get game with developer info
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            email: true,
            developerProfile: {
              select: {
                stripeAccountId: true,
                payoutEnabled: true,
              },
            },
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        gameId_userId: {
          gameId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json({ error: 'You already own this game' }, { status: 400 });
    }

    // Free games - add to library directly
    if (game.priceCents === 0) {
      const purchase = await prisma.purchase.create({
        data: {
          gameId: id,
          userId: session.user.id,
          pricePaid: 0,
          platformFee: 0,
          developerAmount: 0,
          paymentStatus: 'completed',
        },
      });

      return NextResponse.json({
        success: true,
        free: true,
        purchase,
        message: 'Game added to your library!',
      });
    }

    // Calculate revenue split
    const split = calculateGameSaleSplit(game.priceCents);

    // DEMO MODE - No Stripe configured
    if (!isStripeConfigured() || !stripe) {
      // Simulate purchase
      const purchase = await prisma.purchase.create({
        data: {
          gameId: id,
          userId: session.user.id,
          pricePaid: game.priceCents,
          platformFee: split.platformFee,
          developerAmount: split.developerAmount,
          paymentStatus: 'completed',
        },
      });

      // Update developer revenue
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      await prisma.developerRevenue.upsert({
        where: {
          developerId_month: {
            developerId: game.developerId,
            month: firstDayOfMonth,
          },
        },
        update: {
          directSales: { increment: split.developerAmount },
          unitsSold: { increment: 1 },
        },
        create: {
          developerId: game.developerId,
          month: firstDayOfMonth,
          directSales: split.developerAmount,
          unitsSold: 1,
        },
      });

      // Get buyer's name for the notification
      const buyer = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, displayName: true },
      });
      const buyerName = buyer?.displayName || buyer?.name || 'Someone';

      // Create notification for the developer
      await prisma.notification.create({
        data: {
          userId: game.developerId,
          type: 'GAME_PURCHASED',
          title: 'New game sale!',
          message: `${buyerName} purchased "${game.title}" for ${formatCurrency(game.priceCents)}. You earned ${formatCurrency(split.developerAmount)}!`,
          link: '/profile/developer/revenue',
          metadata: {
            gameId: game.id,
            gameTitle: game.title,
            amount: game.priceCents,
            developerAmount: split.developerAmount,
            buyerId: session.user.id,
            buyerName,
          },
        },
      });

      return NextResponse.json({
        success: true,
        demo: true,
        purchase,
        message: 'Purchase successful! (Demo mode)',
        breakdown: {
          totalPaid: formatCurrency(split.totalPrice),
          developerReceives: formatCurrency(split.developerAmount),
          platformFee: formatCurrency(split.platformFee),
          developerPercent: `${GAME_SALE_DEVELOPER_PERCENT}%`,
          platformPercent: `${GAME_SALE_PLATFORM_FEE_PERCENT}%`,
        },
      });
    }

    // PRODUCTION MODE - Real Stripe Checkout
    const developerStripeId = game.developer.developerProfile?.stripeAccountId;

    // Check if developer can receive payments
    if (!developerStripeId || !game.developer.developerProfile?.payoutEnabled) {
      return NextResponse.json(
        { 
          error: 'This developer has not completed their payment setup yet. Please try again later.',
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
              name: game.title,
              description: game.tagline || `Purchase ${game.title} on Shader House`,
              images: game.coverUrl ? [game.coverUrl] : undefined,
            },
            unit_amount: game.priceCents,
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
          gameId: game.id,
          gameName: game.title,
          developerId: game.developerId,
          developerName: game.developer.name,
        },
      },
      metadata: {
        type: 'game_purchase',
        gameId: game.id,
        gameSlug: game.slug,
        userId: session.user.id,
        developerId: game.developerId,
        platformFee: split.platformFee.toString(),
        developerAmount: split.developerAmount.toString(),
      },
      success_url: `${getBaseUrl()}/games/${game.slug}?purchased=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/games/${game.slug}?canceled=true`,
      customer_email: session.user.email,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      breakdown: {
        totalPaid: formatCurrency(split.totalPrice),
        developerReceives: formatCurrency(split.developerAmount),
        platformFee: formatCurrency(split.platformFee),
        developerPercent: `${GAME_SALE_DEVELOPER_PERCENT}%`,
        platformPercent: `${GAME_SALE_PLATFORM_FEE_PERCENT}%`,
      },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

