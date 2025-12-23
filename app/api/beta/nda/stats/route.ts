import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/beta/nda/stats
 * Get NDA acceptance statistics for developer's games
 * Only accessible by developers
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a developer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Only developers can access NDA statistics' },
        { status: 403 }
      );
    }

    // Get optional gameId filter
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    // Build query filter
    const gameFilter = gameId
      ? { id: gameId, developerId: session.user.id }
      : { developerId: session.user.id };

    // Get all developer's games with NDA stats
    const games = await prisma.game.findMany({
      where: gameFilter,
      select: {
        id: true,
        title: true,
        slug: true,
        releaseStatus: true,
        _count: {
          select: {
            ndaAcceptances: true,
            betaTesters: true,
          },
        },
        ndaAcceptances: {
          select: {
            id: true,
            userId: true,
            version: true,
            acceptedAt: true,
            revokedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                displayName: true,
                email: true,
              },
            },
          },
          orderBy: {
            acceptedAt: 'desc',
          },
        },
      },
    });

    // Format response
    const stats = games.map((game) => {
      const activeNdas = game.ndaAcceptances.filter((nda) => !nda.revokedAt);
      const revokedNdas = game.ndaAcceptances.filter((nda) => nda.revokedAt);

      return {
        gameId: game.id,
        gameTitle: game.title,
        gameSlug: game.slug,
        releaseStatus: game.releaseStatus,
        totalNdaAcceptances: activeNdas.length,
        revokedNdas: revokedNdas.length,
        totalBetaTesters: game._count.betaTesters,
        // Users who accepted NDA
        acceptances: activeNdas.map((nda) => ({
          userId: nda.userId,
          userName: nda.user.displayName || nda.user.name,
          userEmail: nda.user.email,
          version: nda.version,
          acceptedAt: nda.acceptedAt,
        })),
      };
    });

    // Calculate overall summary
    const summary = {
      totalGames: games.length,
      totalNdaAcceptances: stats.reduce((sum, g) => sum + g.totalNdaAcceptances, 0),
      totalBetaTesters: stats.reduce((sum, g) => sum + g.totalBetaTesters, 0),
      gamesInBeta: games.filter((g) => g.releaseStatus === 'BETA').length,
    };

    return NextResponse.json({
      summary,
      games: stats,
    });
  } catch (error: any) {
    console.error('GET /api/beta/nda/stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch NDA statistics' },
      { status: 500 }
    );
  }
}

