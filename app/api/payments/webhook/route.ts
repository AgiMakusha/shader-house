import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { stripe, isStripeConfigured } from '@/lib/payments/stripe';
import Stripe from 'stripe';

/**
 * Stripe Webhook Handler for Payments
 * 
 * POST /api/payments/webhook
 * 
 * Handles events for:
 * - Game purchases (checkout.session.completed with type=game_purchase)
 * - Publishing fees (checkout.session.completed with type=publishing_fee)
 * - Tips (checkout.session.completed with type=tip)
 * - Refunds (charge.refunded)
 * 
 * Configure webhook in Stripe Dashboard:
 * URL: https://yourdomain.com/api/payments/webhook
 * Events: checkout.session.completed, charge.refunded, account.updated
 */
export async function POST(req: NextRequest) {
  // Skip if Stripe not configured
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json({ received: true, skipped: true });
  }

  const webhookSecret = process.env.STRIPE_PAYMENTS_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_PAYMENTS_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Received payment webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        switch (metadata.type) {
          case 'game_purchase':
            await handleGamePurchase(session, metadata);
            break;
          case 'publishing_fee':
            await handlePublishingFee(session, metadata);
            break;
          case 'tip':
            await handleTip(session, metadata);
            break;
          default:
            console.log('Unknown checkout type:', metadata.type);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      case 'account.updated': {
        // Connect account status update
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdate(account);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

/**
 * Handle successful game purchase
 */
async function handleGamePurchase(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const { gameId, userId, developerId, platformFee, developerAmount } = metadata;

  console.log(`Processing game purchase: ${gameId} by user ${userId}`);

  // Check if purchase already exists (idempotency)
  const existing = await prisma.purchase.findFirst({
    where: {
      OR: [
        { stripeSessionId: session.id },
        { stripePaymentId: session.payment_intent as string },
      ],
    },
  });

  if (existing) {
    console.log('Purchase already recorded, skipping');
    return;
  }

  // Create purchase record
  await prisma.purchase.create({
    data: {
      gameId,
      userId,
      pricePaid: session.amount_total || 0,
      platformFee: parseInt(platformFee) || 0,
      developerAmount: parseInt(developerAmount) || 0,
      stripePaymentId: session.payment_intent as string,
      stripeSessionId: session.id,
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
      directSales: { increment: parseInt(developerAmount) || 0 },
      unitsSold: { increment: 1 },
    },
    create: {
      developerId,
      month: firstDayOfMonth,
      directSales: parseInt(developerAmount) || 0,
      unitsSold: 1,
    },
  });

  // Get game and buyer info for notification
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { title: true },
  });
  const buyer = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, displayName: true },
  });
  const buyerName = buyer?.displayName || buyer?.name || 'Someone';
  const gameTitle = game?.title || 'your game';
  const amountCents = session.amount_total || 0;
  const devAmount = parseInt(developerAmount) || 0;

  // Create notification for the developer
  await prisma.notification.create({
    data: {
      userId: developerId,
      type: 'GAME_PURCHASED',
      title: 'New game sale!',
      message: `${buyerName} purchased "${gameTitle}" for $${(amountCents / 100).toFixed(2)}. You earned $${(devAmount / 100).toFixed(2)}!`,
      link: '/profile/developer/revenue',
      metadata: {
        gameId,
        gameTitle,
        amount: amountCents,
        developerAmount: devAmount,
        buyerId: userId,
        buyerName,
      },
    },
  });

  console.log(`Game purchase completed: ${gameId}`);
}

/**
 * Handle successful publishing fee payment
 */
async function handlePublishingFee(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const { gameId, developerId } = metadata;

  console.log(`Processing publishing fee for game: ${gameId}`);

  // Check if already recorded
  const existing = await prisma.publishingFee.findFirst({
    where: {
      OR: [
        { stripeSessionId: session.id },
        { stripePaymentId: session.payment_intent as string },
      ],
    },
  });

  if (existing) {
    console.log('Publishing fee already recorded, skipping');
    return;
  }

  // Create publishing fee record
  await prisma.publishingFee.create({
    data: {
      gameId,
      developerId,
      amountCents: session.amount_total || 5000,
      stripePaymentId: session.payment_intent as string,
      stripeSessionId: session.id,
      paymentStatus: 'completed',
    },
  });

  // NOTE: We do NOT change the game's releaseStatus here.
  // The game keeps its original status (BETA or RELEASED) as set by the developer.
  // The publishing fee just makes the game visible in the marketplace.

  console.log(`Publishing fee completed for game: ${gameId}`);
}

/**
 * Handle successful tip payment
 */
async function handleTip(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const { fromUserId, toUserId, platformFee, developerAmount, message } = metadata;

  console.log(`Processing tip from ${fromUserId} to ${toUserId}`);

  // Check if already recorded
  const existing = await prisma.tip.findFirst({
    where: { stripePaymentId: session.payment_intent as string },
  });

  if (existing) {
    console.log('Tip already recorded, skipping');
    return;
  }

  // Create tip record
  await prisma.tip.create({
    data: {
      fromUserId,
      toUserId,
      amountCents: session.amount_total || 0,
      platformFee: parseInt(platformFee) || 0,
      developerAmount: parseInt(developerAmount) || 0,
      message: message || null,
      stripePaymentId: session.payment_intent as string,
      paymentStatus: 'completed',
    },
  });

  // Update developer revenue
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  await prisma.developerRevenue.upsert({
    where: {
      developerId_month: {
        developerId: toUserId,
        month: firstDayOfMonth,
      },
    },
    update: {
      tips: { increment: parseInt(developerAmount) || 0 },
    },
    create: {
      developerId: toUserId,
      month: firstDayOfMonth,
      tips: parseInt(developerAmount) || 0,
    },
  });

  // Get tipper's name for the notification
  const tipper = await prisma.user.findUnique({
    where: { id: fromUserId },
    select: { name: true, displayName: true },
  });
  const tipperName = tipper?.displayName || tipper?.name || 'Someone';
  const amountCents = session.amount_total || 0;
  const devAmount = parseInt(developerAmount) || 0;

  // Create notification for the developer
  await prisma.notification.create({
    data: {
      userId: toUserId,
      type: 'TIP_RECEIVED',
      title: 'You received a tip!',
      message: message 
        ? `${tipperName} sent you a $${(amountCents / 100).toFixed(2)} tip: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`
        : `${tipperName} sent you a $${(amountCents / 100).toFixed(2)} tip! You'll receive $${(devAmount / 100).toFixed(2)}.`,
      link: '/profile/developer/revenue',
      metadata: {
        amount: amountCents,
        developerAmount: devAmount,
        fromUserId,
        fromUserName: tipperName,
      },
    },
  });

  console.log(`Tip completed from ${fromUserId} to ${toUserId}`);
}

/**
 * Handle refund
 */
async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  console.log(`Processing refund for payment: ${paymentIntentId}`);

  // Update purchase if exists
  const purchase = await prisma.purchase.findFirst({
    where: { stripePaymentId: paymentIntentId },
  });

  if (purchase) {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        paymentStatus: 'refunded',
        refundedAt: new Date(),
      },
    });

    // Decrease developer revenue
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const game = await prisma.game.findUnique({
      where: { id: purchase.gameId },
      select: { developerId: true },
    });

    if (game) {
      await prisma.developerRevenue.updateMany({
        where: {
          developerId: game.developerId,
          month: firstDayOfMonth,
        },
        data: {
          directSales: { decrement: purchase.developerAmount || 0 },
          unitsSold: { decrement: 1 },
        },
      });
    }
  }

  // Update tip if exists
  const tip = await prisma.tip.findFirst({
    where: { stripePaymentId: paymentIntentId },
  });

  if (tip) {
    await prisma.tip.update({
      where: { id: tip.id },
      data: { paymentStatus: 'refunded' },
    });

    // Decrease developer tips
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    await prisma.developerRevenue.updateMany({
      where: {
        developerId: tip.toUserId,
        month: firstDayOfMonth,
      },
      data: {
        tips: { decrement: tip.developerAmount },
      },
    });
  }

  console.log(`Refund processed for payment: ${paymentIntentId}`);
}

/**
 * Handle Connect account status update
 */
async function handleAccountUpdate(account: Stripe.Account) {
  console.log(`Account updated: ${account.id}`);

  const status = account.charges_enabled && account.payouts_enabled
    ? 'active'
    : account.requirements?.currently_due?.length
    ? 'restricted'
    : 'pending';

  await prisma.developerProfile.updateMany({
    where: { stripeAccountId: account.id },
    data: {
      stripeAccountStatus: status,
      payoutEnabled: account.payouts_enabled || false,
      ...(status === 'active' ? { stripeOnboardedAt: new Date() } : {}),
    },
  });
}

