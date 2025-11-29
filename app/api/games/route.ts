import { NextRequest, NextResponse } from 'next/server';
import { getGames, createGame, getTags } from '@/lib/queries/games';
import { gameQuerySchema, gameUpsertSchema } from '@/lib/validations/game';
import { getSessionFromRequest } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      q: searchParams.get('q') || undefined,
      tags: searchParams.get('tags') || undefined,
      platform: searchParams.get('platform') || undefined,
      priceFilter: searchParams.get('priceFilter') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
      developer: searchParams.get('developer') || undefined,
    };

    const validated = gameQuerySchema.parse(queryParams);
    
    // Pass userId if developer='me' is requested
    const userId = validated.developer === 'me' ? session?.user?.id : undefined;
    
    // Check if we should include all statuses (for developer viewing their own games)
    const statusParam = searchParams.get('status');
    const includeAllStatuses = validated.developer === 'me' || statusParam === 'beta';
    
    console.log('🎮 API /games:', {
      developer: validated.developer,
      sessionUserId: session?.user?.id,
      passedUserId: userId,
      includeAllStatuses,
    });
    
    const [result, tags] = await Promise.all([
      getGames(validated, userId, includeAllStatuses),
      getTags(),
    ]);

    return NextResponse.json({
      ...result,
      tags,
    });
  } catch (error: any) {
    console.error('GET /api/games error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch games' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Normalize role to uppercase (handles legacy lowercase roles)
    const userRole = session.user.role?.toUpperCase();
    if (userRole !== 'DEVELOPER' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only developers can create games' }, { status: 403 });
    }

    const body = await request.json();
    const validated = gameUpsertSchema.parse(body);

    const game = await createGame(validated, session.user.id);

    return NextResponse.json(game, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/games error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create game' },
      { status: 400 }
    );
  }
}

