import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import {
  calculateGameSaleSplit,
  formatCurrency,
  GAME_SALE_PLATFORM_FEE_PERCENT,
  GAME_SALE_DEVELOPER_PERCENT,
} from '@/lib/payments/config';

/**
 * Game Purchase API
 * 
 * Revenue Split: 
 * - Platform: 15%
 * - Developer: 85%
 * 
 * DEMO MODE: Simulates purchase and tracks revenue
 * PRODUCTION MODE: Would use Stripe Connect for real payments
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
          select: { id: true, name: true },
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
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
    }

    // Free games can be "purchased" immediately
    if (game.priceCents === 0) {
      const purchase = await prisma.purchase.create({
        data: {
          gameId: id,
          userId: session.user.id,
          pricePaid: 0,
        },
      });

      return NextResponse.json({ 
        success: true,
        purchase,
        message: 'Game added to your library'
      });
    }

    // Calculate revenue split (85% developer, 15% platform)
    const split = calculateGameSaleSplit(game.priceCents);

    // For paid games, in production you would:
    // 1. Create Stripe Checkout Session with Connect
    // 2. Set application_fee_amount to platformFee
    // 3. Set transfer_data.destination to developer's Stripe account
    // 4. Handle webhook to confirm purchase
    
    // DEMO MODE: Simulate purchase and track revenue
    const purchase = await prisma.purchase.create({
      data: {
        gameId: id,
        userId: session.user.id,
        pricePaid: game.priceCents,
      },
    });

    // Update developer revenue (demo mode - immediate)
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

    return NextResponse.json({
      success: true,
      purchase,
      message: 'Purchase successful! (Demo mode)',
      breakdown: {
        totalPaid: formatCurrency(split.totalPrice),
        developerReceives: formatCurrency(split.developerAmount),
        platformFee: formatCurrency(split.platformFee),
        developerPercent: `${GAME_SALE_DEVELOPER_PERCENT}%`,
        platformPercent: `${GAME_SALE_PLATFORM_FEE_PERCENT}%`,
      },
      // In production, return Stripe checkout URL:
      // checkoutUrl: stripeSession.url,
    });
  } catch (error: any) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process purchase' },
      { status: 500 }
    );
  }
}



