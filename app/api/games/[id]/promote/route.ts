import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { promoteToRelease } from '@/lib/queries/games';
import { notifyGameUpdate, notifyGamePublished } from '@/lib/notifications/triggers';
import { prisma } from '@/lib/db/prisma';
import { canPerformAction } from '@/lib/security/email-verification-guard';

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

    // Check email verification for publishing games
    const verificationCheck = canPerformAction(session, 'publish_game');
    if (!verificationCheck.allowed) {
      return NextResponse.json(
        { error: verificationCheck.reason },
        { status: 403 }
      );
    }

    const { id: gameId } = await params;

    const game = await promoteToRelease(gameId, session.user.id);

    // Get full game data including slug for notifications
    const fullGame = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, title: true, slug: true },
    });

    // Notify developer about successful game publication
    if (fullGame) {
      try {
        console.log(`🔔 Notifying developer about game publication: ${fullGame.title}`);
        await notifyGamePublished(
          session.user.id,
          gameId,
          fullGame.title,
          fullGame.slug
        );
        console.log(`✅ Developer publication notification sent`);
      } catch (notificationError) {
        console.error('❌ Error sending developer publication notification:', notificationError);
      }
    }

    // Notify all gamers about the game promotion to full release
    if (fullGame) {
      try {
        console.log(`🔔 Game promoted to release: ${fullGame.title} (${gameId})`);
        
        // Get all gamers (not just purchasers/favoriters)
        const allGamers = await prisma.user.findMany({
          where: {
            role: 'GAMER',
          },
          select: { id: true },
        });

        console.log(`📢 Notifying ${allGamers.length} gamers about game promotion`);

        // Send notifications to all gamers
        const notificationPromises = allGamers.map((gamer) =>
          notifyGameUpdate(
            gamer.id,
            gameId,
            fullGame.title,
            `${fullGame.title} has been promoted to full release! Check it out now!`,
            fullGame.slug
          ).catch((error) => {
            console.error(`Error notifying gamer ${gamer.id}:`, error);
            return null; // Continue with other notifications even if one fails
          })
        );

        await Promise.all(notificationPromises);
        console.log(`✅ Notified ${allGamers.length} gamers about game promotion`);
      } catch (notificationError) {
        console.error('❌ Error sending game promotion notifications:', notificationError);
        // Don't fail the request if notifications fail
      }
    }

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





