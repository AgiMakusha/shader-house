import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { hasFeatureAccess, FeatureFlag } from '@/lib/subscriptions/types';
import { notifyBetaAccessGranted, notifyNewBetaTester } from '@/lib/notifications/triggers';

/**
 * POST /api/beta/join
 * Join a beta test for a game
 * Requires Pro subscription AND NDA acceptance
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user from database to get current subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has Pro subscription
    if (!hasFeatureAccess(user.subscriptionTier, FeatureFlag.BETA_ACCESS)) {
      return NextResponse.json(
        { error: 'Beta access requires Creator Support Pass subscription' },
        { status: 403 }
      );
    }

    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Check if game exists and is in beta
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, releaseStatus: true, title: true },
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

    // Check if user has accepted NDA for this game
    const ndaAcceptance = await prisma.ndaAcceptance.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId,
        },
      },
    });

    if (!ndaAcceptance || ndaAcceptance.revokedAt) {
      return NextResponse.json(
        { 
          error: 'NDA agreement required', 
          code: 'NDA_REQUIRED',
          message: 'You must accept the NDA before joining this beta test'
        },
        { status: 403 }
      );
    }

    // Check if already joined
    const existing = await prisma.betaTester.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Already joined this beta test', tester: existing },
        { status: 200 }
      );
    }

    // Create beta tester record
    const tester = await prisma.betaTester.create({
      data: {
        userId: session.user.id,
        gameId,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
          },
        },
      },
    });

    // Send notification to gamer about beta access
    try {
      console.log(`🔔 Attempting to send beta access notification for user ${session.user.id}, game ${gameId}`);
      const result = await notifyBetaAccessGranted(session.user.id, gameId, game.title);
      console.log(`✅ Beta access notification result:`, result);
    } catch (notificationError) {
      console.error('❌ Error sending beta access notification:', notificationError);
      // Don't fail the request if notification fails
    }

    // Get game developer and tester name to notify developer
    const gameWithDeveloper = await prisma.game.findUnique({
      where: { id: gameId },
      select: { 
        developerId: true, 
        title: true, 
        slug: true,
      },
    });

    const testerUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, displayName: true },
    });

    // Notify developer about new beta tester
    if (gameWithDeveloper && testerUser) {
      try {
        const testerName = testerUser.displayName || testerUser.name || 'A new tester';
        console.log(`🔔 Notifying developer ${gameWithDeveloper.developerId} about new beta tester`);
        await notifyNewBetaTester(
          gameWithDeveloper.developerId,
          gameId,
          gameWithDeveloper.title,
          testerName,
          gameWithDeveloper.slug
        );
        console.log(`✅ Developer notification sent`);
      } catch (notificationError) {
        console.error('❌ Error sending developer notification:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully joined beta test for ${game.title}`,
      tester,
    });
  } catch (error: any) {
    console.error('POST /api/beta/join error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join beta test' },
      { status: 500 }
    );
  }
}

