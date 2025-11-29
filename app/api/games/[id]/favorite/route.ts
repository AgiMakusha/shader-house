import { NextRequest, NextResponse } from 'next/server';
import { toggleFavorite } from '@/lib/queries/games';
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

    const result = await toggleFavorite(id, session.user.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('POST /api/games/[id]/favorite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle favorite' },
      { status: 400 }
    );
  }
}



