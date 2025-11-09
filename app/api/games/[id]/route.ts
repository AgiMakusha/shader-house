import { NextRequest, NextResponse } from 'next/server';
import { updateGame } from '@/lib/queries/games';
import { gameUpsertSchema } from '@/lib/validations/game';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = gameUpsertSchema.parse(body);

    const game = await updateGame(params.id, validated, session.user.id);

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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const game = await prisma.game.findUnique({
      where: { id: params.id },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.developerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.game.delete({
      where: { id: params.id },
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

