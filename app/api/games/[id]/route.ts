import { NextRequest, NextResponse } from 'next/server';
import { updateGame } from '@/lib/queries/games';
import { gameUpsertSchema } from '@/lib/validations/game';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { notifyWishlistSale } from '@/lib/notifications/triggers';

/**
 * GET /api/games/[id]
 * Fetch a single game by ID with publishingFeePaid status
 * Used by the publish page to check payment status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);

    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        publishingFee: {
          select: {
            paymentStatus: true,
          },
        },
      } as any,
    }) as any;

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Only the game developer can access their own unpublished games
    const publishingFeePaid = game.publishingFee?.paymentStatus === 'completed';
    const isDeveloper = session?.user?.id === game.developerId;

    if (!publishingFeePaid && !isDeveloper) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: game.id,
      title: game.title,
      coverUrl: game.coverUrl,
      slug: game.slug,
      publishingFeePaid,
    });
  } catch (error: any) {
    console.error('GET /api/games/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch game' },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = gameUpsertSchema.parse(body);

    // Get current price before update to check for price drop
    const currentGame = await prisma.game.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true, priceCents: true, title: true, slug: true },
    });

    const oldPrice = currentGame?.priceCents || 0;
    const newPrice = validated.priceCents;

    const game = await updateGame(id, validated, session.user.id);

    // If price dropped, send wishlist sale notifications
    if (currentGame && newPrice < oldPrice) {
      const discountPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
      
      // Find users who wishlisted at a higher price
      const wishlistedUsers = await prisma.favorite.findMany({
        where: {
          gameId: currentGame.id,
          notifiedForSale: false,
          OR: [
            { priceAtFavorite: null },
            { priceAtFavorite: { gt: newPrice } },
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

      const usersToNotify = wishlistedUsers.filter(
        fav => fav.user.notifyWishlistSales !== false
      );

      // Send notifications in background
      Promise.allSettled(
        usersToNotify.map(async (fav) => {
          try {
            await notifyWishlistSale(
              fav.user.id,
              currentGame.id,
              currentGame.title,
              oldPrice,
              newPrice,
              discountPercent,
              currentGame.slug
            );
            await prisma.favorite.update({
              where: { id: fav.id },
              data: { notifiedForSale: true },
            });
          } catch (err) {
            console.error(`Failed to notify user ${fav.user.id} of sale:`, err);
          }
        })
      ).then((results) => {
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        console.log(`🔔 Price drop for ${currentGame.title}: notified ${successCount}/${usersToNotify.length} wishlisted users`);
      });
    }

    return NextResponse.json(game);
  } catch (error: any) {
    console.error('PATCH /api/games/[id] error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Game not found') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update game' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // RULE 1: Only game owner can delete (not even admins for safety)
    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the game owner can delete this game' },
        { status: 403 }
      );
    }

    // Delete associated uploaded files before deleting game
    const { deleteUploadedFile } = await import('@/lib/utils/file-manager');
    if (game.gameFileUrl) {
      await deleteUploadedFile(game.gameFileUrl);
    }

    await prisma.game.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/games/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete game' },
      { status: 400 }
    );
  }
}



