import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { promoteToRelease } from '@/lib/queries/games';

/**
 * POST /api/games/:id/promote
 * Promote a beta game to full release
 * Only the game owner can promote
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: gameId } = await params;

    const game = await promoteToRelease(gameId, session.user.id);

    return NextResponse.json({
      success: true,
      game,
      message: 'Game promoted to full release successfully',
    });
  } catch (error: any) {
    console.error('Promote game error:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to promote game' },
      { status: 400 }
    );
  }
}

