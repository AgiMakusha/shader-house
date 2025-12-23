import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

// Current NDA version - increment when terms change
const CURRENT_NDA_VERSION = '1.0';

/**
 * GET /api/beta/nda/[gameId]
 * Check if user has accepted NDA for a specific game
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await params;

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { 
        id: true, 
        title: true, 
        developerId: true,
        developer: {
          select: {
            name: true,
            displayName: true,
            developerProfile: {
              select: { studioName: true }
            }
          }
        }
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if user has accepted NDA
    const ndaAcceptance = await prisma.ndaAcceptance.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId,
        },
      },
    });

    const hasAccepted = !!ndaAcceptance && !ndaAcceptance.revokedAt;
    const needsUpdate = ndaAcceptance && ndaAcceptance.version !== CURRENT_NDA_VERSION && !ndaAcceptance.revokedAt;

    // Get developer/studio name
    const developerName = game.developer.developerProfile?.studioName || 
                          game.developer.displayName || 
                          game.developer.name;

    return NextResponse.json({
      hasAccepted,
      needsUpdate, // True if user needs to accept new version
      currentVersion: CURRENT_NDA_VERSION,
      acceptedVersion: ndaAcceptance?.version || null,
      acceptedAt: ndaAcceptance?.acceptedAt || null,
      gameTitle: game.title,
      developerName,
    });
  } catch (error: any) {
    console.error('GET /api/beta/nda/[gameId] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check NDA status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/beta/nda/[gameId]
 * Accept NDA for a specific game
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await params;

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Check if game exists and is in beta
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { 
        id: true, 
        title: true, 
        releaseStatus: true,
        developer: {
          select: {
            name: true,
            displayName: true,
            developerProfile: {
              select: { studioName: true }
            }
          }
        }
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.releaseStatus !== 'BETA') {
      return NextResponse.json(
        { error: 'This game is not in beta testing' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { confirmed } = body;

    if (!confirmed) {
      return NextResponse.json(
        { error: 'You must confirm acceptance of the NDA' },
        { status: 400 }
      );
    }

    // Get IP and user agent for audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Upsert NDA acceptance (create or update)
    const ndaAcceptance = await prisma.ndaAcceptance.upsert({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId,
        },
      },
      update: {
        version: CURRENT_NDA_VERSION,
        acceptedAt: new Date(),
        ipAddress,
        userAgent,
        revokedAt: null,
        revokedReason: null,
      },
      create: {
        userId: session.user.id,
        gameId,
        version: CURRENT_NDA_VERSION,
        ipAddress,
        userAgent,
      },
    });

    const developerName = game.developer.developerProfile?.studioName || 
                          game.developer.displayName || 
                          game.developer.name;

    return NextResponse.json({
      success: true,
      message: `NDA accepted for "${game.title}"`,
      ndaAcceptance: {
        id: ndaAcceptance.id,
        version: ndaAcceptance.version,
        acceptedAt: ndaAcceptance.acceptedAt,
        gameTitle: game.title,
        developerName,
      },
    });
  } catch (error: any) {
    console.error('POST /api/beta/nda/[gameId] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept NDA' },
      { status: 500 }
    );
  }
}

