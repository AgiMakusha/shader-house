import { NextRequest, NextResponse } from 'next/server';
import { rateGame } from '@/lib/queries/games';
import { ratingSchema } from '@/lib/validations/game';
import { getSessionFromRequest } from '@/lib/auth/session';

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

    const body = await request.json();
    const validated = ratingSchema.parse(body);

    const rating = await rateGame(id, session.user.id, validated);

    return NextResponse.json(rating);
  } catch (error: any) {
    console.error('POST /api/games/[id]/rate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rate game' },
      { status: 400 }
    );
  }
}



