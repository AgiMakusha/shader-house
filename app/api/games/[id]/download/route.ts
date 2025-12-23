import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * POST /api/games/[id]/download
 * Track a game download and return the download URL
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);

    // Find the game
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        gameFileUrl: true,
        externalUrl: true,
        priceCents: true,
        developerId: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if user has access to download (purchased or free game)
    if (game.priceCents > 0 && session?.user) {
      const hasPurchased = await prisma.purchase.findUnique({
        where: {
          gameId_userId: {
            gameId: game.id,
            userId: session.user.id,
          },
        },
      });

      // Allow developer to download their own game
      const isDeveloper = game.developerId === session.user.id;

      if (!hasPurchased && !isDeveloper) {
        return NextResponse.json(
          { error: 'You must purchase this game to download it' },
          { status: 403 }
        );
      }
    }

    // Increment download count
    await prisma.game.update({
      where: { id: game.id },
      data: { downloads: { increment: 1 } },
    });

    // Track game access if user is logged in
    if (session?.user) {
      await prisma.gameAccess.upsert({
        where: {
          userId_gameId: {
            userId: session.user.id,
            gameId: game.id,
          },
        },
        update: {
          accessedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          gameId: game.id,
        },
      });
    }

    // Return download URL
    const downloadUrl = game.gameFileUrl || game.externalUrl;

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'No download available for this game' },
        { status: 404 }
      );
    }

    console.log(`📥 Download tracked for ${game.title} by user ${session?.user?.id || 'anonymous'}`);

    return NextResponse.json({
      success: true,
      game: {
        id: game.id,
        title: game.title,
      },
      downloadUrl,
    });
  } catch (error: any) {
    console.error('POST /api/games/[id]/download error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process download' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/games/[id]/download
 * Get download count for a game
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      select: {
        id: true,
        title: true,
        downloads: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({
      gameId: game.id,
      title: game.title,
      downloads: game.downloads,
    });
  } catch (error: any) {
    console.error('GET /api/games/[id]/download error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get download count' },
      { status: 500 }
    );
  }
}

