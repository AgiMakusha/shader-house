import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * POST /api/games/[id]/access
 * Track when a user accesses/plays a game
 * Used for achievements and analytics
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params; // Await params in Next.js 15+
    console.log('🎮 POST /api/games/[id]/access - Game ID:', gameId);
    
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      console.log('❌ Unauthorized - No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', session.user.email);

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, title: true },
    });

    if (!game) {
      console.log('❌ Game not found:', gameId);
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    console.log('✅ Game found:', game.title);

    // Create or update game access record (upsert to avoid duplicates)
    const gameAccess = await prisma.gameAccess.upsert({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId: gameId,
        },
      },
      update: {
        accessedAt: new Date(), // Update last accessed time
      },
      create: {
        userId: session.user.id,
        gameId: gameId,
      },
    });

    console.log('✅ Game access tracked successfully:', {
      userId: session.user.id,
      gameId: gameId,
      accessedAt: gameAccess.accessedAt,
    });

    return NextResponse.json({ 
      success: true,
      gameAccess,
      message: 'Game access tracked',
    });
  } catch (error: any) {
    console.error('❌ POST /api/games/[id]/access error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track game access' },
      { status: 500 }
    );
  }
}

