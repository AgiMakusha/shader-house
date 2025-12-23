import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { stripe, isStripeConfigured, getBaseUrl } from '@/lib/payments/stripe';
import { GAME_PUBLISHING_FEE_CENTS, formatCurrency } from '@/lib/payments/config';

/**
 * Publishing Fee API
 * 
 * POST /api/payments/publishing-fee
 * Body: { gameId: string }
 * 
 * Creates a Stripe Checkout session for the $50 publishing fee.
 * Game will be activated after successful payment.
 * 
 * DEMO MODE: Marks game as published without payment
 * PRODUCTION MODE: Requires $50 payment via Stripe
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role?.toUpperCase() !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Only developers can publish games' },
        { status: 403 }
      );
    }

    const { gameId } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    // Get game and verify ownership
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        publishingFee: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only publish your own games' },
        { status: 403 }
      );
    }

    // Check if already paid
    if (game.publishingFee && game.publishingFee.paymentStatus === 'completed') {
      return NextResponse.json(
        { error: 'Publishing fee already paid for this game' },
        { status: 400 }
      );
    }

    // DEMO MODE - No Stripe configured
    if (!isStripeConfigured() || !stripe) {
      // Create publishing fee record
      await prisma.publishingFee.upsert({
        where: { gameId },
        update: {
          paymentStatus: 'completed',
          paidAt: new Date(),
        },
        create: {
          gameId,
          developerId: session.user.id,
          amountCents: GAME_PUBLISHING_FEE_CENTS,
          paymentStatus: 'completed',
        },
      });

      // NOTE: We do NOT change the game's releaseStatus here.
      // The game keeps its original status (BETA or RELEASED) as set by the developer.
      // The publishing fee just makes the game visible in the marketplace.

      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Game published successfully! (Demo mode - no payment required)',
        fee: formatCurrency(GAME_PUBLISHING_FEE_CENTS),
        releaseStatus: game.releaseStatus, // Return current status for reference
      });
    }

    // PRODUCTION MODE - Real Stripe Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Game Publishing Fee',
              description: `Publish "${game.title}" on Shader House`,
            },
            unit_amount: GAME_PUBLISHING_FEE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'publishing_fee',
        gameId: game.id,
        gameSlug: game.slug,
        developerId: session.user.id,
      },
      success_url: `${getBaseUrl()}/dashboard/games/${game.id}/edit?published=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/dashboard/games/${game.id}/edit?publish_canceled=true`,
      customer_email: session.user.email,
    });

    // Create pending publishing fee record
    await prisma.publishingFee.upsert({
      where: { gameId },
      update: {
        stripeSessionId: checkoutSession.id,
        paymentStatus: 'pending',
      },
      create: {
        gameId,
        developerId: session.user.id,
        amountCents: GAME_PUBLISHING_FEE_CENTS,
        stripeSessionId: checkoutSession.id,
        paymentStatus: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      fee: formatCurrency(GAME_PUBLISHING_FEE_CENTS),
    });
  } catch (error: any) {
    console.error('Publishing fee error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process publishing fee' },
      { status: 500 }
    );
  }
}

/**
 * Check publishing fee status
 * 
 * GET /api/payments/publishing-fee?gameId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    const fee = await prisma.publishingFee.findUnique({
      where: { gameId },
    });

    return NextResponse.json({
      hasPaid: fee?.paymentStatus === 'completed',
      status: fee?.paymentStatus || 'unpaid',
      amount: formatCurrency(GAME_PUBLISHING_FEE_CENTS),
      amountCents: GAME_PUBLISHING_FEE_CENTS,
      paidAt: fee?.paidAt || null,
    });
  } catch (error: any) {
    console.error('Error checking publishing fee:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}

