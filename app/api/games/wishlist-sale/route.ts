import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { notifyWishlistSale } from '@/lib/notifications/triggers';

/**
 * POST /api/games/wishlist-sale
 * Trigger wishlist sale notifications when a game's price is reduced.
 * This should be called when a developer updates their game's price.
 * 
 * Body: { gameId: string, newPrice: number, oldPrice: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameId, newPrice, oldPrice } = body;

    if (!gameId || typeof newPrice !== 'number' || typeof oldPrice !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: gameId, newPrice, oldPrice' },
        { status: 400 }
      );
    }

    // Verify the game exists and user owns it
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        slug: true,
        title: true,
        developerId: true,
        priceCents: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the game developer can trigger sale notifications' },
        { status: 403 }
      );
    }

    // Check if this is actually a price reduction
    if (newPrice >= oldPrice) {
      return NextResponse.json(
        { error: 'New price must be lower than old price to trigger sale notifications' },
        { status: 400 }
      );
    }

    // Calculate discount percentage
    const discountPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

    // Find all users who have wishlisted this game and haven't been notified yet
    // Also filter to users who had added it when the price was higher
    const wishlistedUsers = await prisma.favorite.findMany({
      where: {
        gameId: game.id,
        notifiedForSale: false,
        OR: [
          { priceAtFavorite: null }, // Legacy favorites without price tracking
          { priceAtFavorite: { gt: newPrice } }, // Only notify if price dropped below their wishlist price
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            notifyWishlistSales: true,
          },
        },
      },
    });

    // Filter to users who want sale notifications
    const usersToNotify = wishlistedUsers.filter(
      fav => fav.user.notifyWishlistSales !== false
    );

    // Send notifications
    const notificationPromises = usersToNotify.map(async (fav) => {
      try {
        await notifyWishlistSale(
          fav.user.id,
          game.id,
          game.title,
          oldPrice,
          newPrice,
          discountPercent,
          game.slug
        );

        // Mark as notified to prevent duplicate notifications
        await prisma.favorite.update({
          where: { id: fav.id },
          data: { notifiedForSale: true },
        });

        return { userId: fav.user.id, success: true };
      } catch (err) {
        console.error(`Failed to notify user ${fav.user.id}:`, err);
        return { userId: fav.user.id, success: false, error: err };
      }
    });

    const results = await Promise.allSettled(notificationPromises);
    const successCount = results.filter(
      r => r.status === 'fulfilled' && (r.value as any).success
    ).length;

    console.log(`🔔 Sale notification sent for ${game.title}: ${successCount}/${usersToNotify.length} users notified`);

    return NextResponse.json({
      success: true,
      game: {
        id: game.id,
        title: game.title,
        oldPrice,
        newPrice,
        discountPercent,
      },
      notifications: {
        eligible: wishlistedUsers.length,
        sent: successCount,
      },
    });
  } catch (error: any) {
    console.error('POST /api/games/wishlist-sale error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send sale notifications' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/games/wishlist-sale?gameId=xxx
 * Check how many users would be notified if the game goes on sale
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { error: 'Missing gameId parameter' },
        { status: 400 }
      );
    }

    // Verify the game exists and user owns it
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        title: true,
        developerId: true,
        priceCents: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the game developer can view wishlist stats' },
        { status: 403 }
      );
    }

    // Count wishlisted users
    const totalWishlisted = await prisma.favorite.count({
      where: { gameId: game.id },
    });

    const eligibleForNotification = await prisma.favorite.count({
      where: {
        gameId: game.id,
        notifiedForSale: false,
      },
    });

    return NextResponse.json({
      game: {
        id: game.id,
        title: game.title,
        currentPrice: game.priceCents,
      },
      wishlist: {
        total: totalWishlisted,
        eligibleForSaleNotification: eligibleForNotification,
      },
    });
  } catch (error: any) {
    console.error('GET /api/games/wishlist-sale error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get wishlist stats' },
      { status: 500 }
    );
  }
}



