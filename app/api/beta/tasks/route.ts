import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { notifyBetaTaskCreated } from '@/lib/notifications/triggers';

/**
 * POST /api/beta/tasks
 * Create a new task for a beta game
 * Developer only
 */

const createTaskSchema = z.object({
  gameId: z.string(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['BUG_REPORT', 'SUGGESTION', 'PLAY_LEVEL', 'TEST_FEATURE']),
  xpReward: z.number().int().min(0).max(1000).default(50),
  rewardPoints: z.number().int().min(0).max(100).default(10),
  isOptional: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createTaskSchema.parse(body);

    // Verify game ownership and get game details
    const game = await prisma.game.findUnique({
      where: { id: validated.gameId },
      select: { id: true, title: true, slug: true, developerId: true },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the game owner can create tasks' },
        { status: 403 }
      );
    }

    // Get the current max order for this game
    const maxOrderTask = await prisma.betaTask.findFirst({
      where: { gameId: validated.gameId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = (maxOrderTask?.order ?? -1) + 1;

    // Create task
    const task = await prisma.betaTask.create({
      data: {
        gameId: validated.gameId,
        title: validated.title,
        description: validated.description,
        type: validated.type,
        xpReward: validated.xpReward,
        rewardPoints: validated.rewardPoints,
        isOptional: validated.isOptional,
        order: nextOrder,
      },
    });

    // Notify all beta testers of this game about the new task
    if (game) {
      try {
        console.log(`🔔 New beta task created: ${validated.title} for game ${game.title} (${validated.gameId})`);
        
        // Get all beta testers for this game with user details for debugging
        const betaTesters = await prisma.betaTester.findMany({
          where: { gameId: validated.gameId },
          select: { 
            userId: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                inAppNotifications: true,
                notifyGameUpdates: true,
              }
            }
          },
        });

        console.log(`📢 Found ${betaTesters.length} beta testers for game ${game.title}:`, 
          betaTesters.map(t => ({ userId: t.userId, email: t.user.email, name: t.user.name }))
        );

        if (betaTesters.length === 0) {
          console.log(`⚠️ No beta testers found for game ${game.title} (${validated.gameId})`);
        }

        // Notify all beta testers
        const notificationResults = await Promise.allSettled(
          betaTesters.map((tester) =>
            notifyBetaTaskCreated(
              tester.userId,
              validated.gameId,
              game.title,
              validated.title,
              task.id
            )
          )
        );

        // Log results
        const successful = notificationResults.filter(r => r.status === 'fulfilled').length;
        const failed = notificationResults.filter(r => r.status === 'rejected').length;
        
        notificationResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`❌ Error notifying beta tester ${betaTesters[index].userId} (${betaTesters[index].user.email}):`, result.reason);
          } else {
            console.log(`✅ Successfully notified ${betaTesters[index].user.email} (${betaTesters[index].userId})`);
          }
        });

        console.log(`✅ Notification summary: ${successful} successful, ${failed} failed out of ${betaTesters.length} beta testers`);
      } catch (notificationError) {
        console.error('❌ Error sending beta task notifications:', notificationError);
        console.error('Error stack:', notificationError instanceof Error ? notificationError.stack : 'No stack trace');
        // Don't fail the request if notifications fail
      }
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/beta/tasks error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}





