import { NextRequest, NextResponse } from 'next/server';
import { rateGame } from '@/lib/queries/games';
import { ratingSchema } from '@/lib/validations/game';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { notifyNewReview } from '@/lib/notifications/triggers';

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

    // Notify developer about new review
    const game = await prisma.game.findUnique({
      where: { id },
      select: { developerId: true, title: true, slug: true },
    });

    const reviewer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, displayName: true },
    });

    if (game && reviewer && game.developerId !== session.user.id) {
      try {
        const reviewerName = reviewer.displayName || reviewer.name || 'A player';
        console.log(`🔔 Notifying developer ${game.developerId} about new review`);
        await notifyNewReview(
          game.developerId,
          id,
          game.title,
          validated.stars,
          reviewerName,
          validated.comment,
          game.slug
        );
        console.log(`✅ Developer review notification sent`);
      } catch (notificationError) {
        console.error('❌ Error sending developer review notification:', notificationError);
      }
    }

    return NextResponse.json(rating);
  } catch (error: any) {
    console.error('POST /api/games/[id]/rate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rate game' },
      { status: 400 }
    );
  }
}



