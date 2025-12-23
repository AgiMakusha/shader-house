import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { notifyGameUpdate } from '@/lib/notifications/triggers';

// Validation schema for creating a version
const createVersionSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in format X.Y.Z (e.g., 1.0.0)'),
  title: z.string().max(100).optional(),
  changelog: z.string().min(10, 'Changelog must be at least 10 characters'),
  releaseType: z.enum(['MAJOR', 'MINOR', 'PATCH', 'HOTFIX']).default('PATCH'),
  gameFileUrl: z.string().optional(),
});

// GET /api/games/[id]/versions - Get all versions for a game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the game (by ID or slug)
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      select: { id: true, slug: true, title: true, currentVersion: true },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get all versions, ordered by release date (newest first)
    const versions = await prisma.gameVersion.findMany({
      where: { gameId: game.id },
      orderBy: { releasedAt: 'desc' },
      select: {
        id: true,
        version: true,
        title: true,
        changelog: true,
        releaseType: true,
        gameFileUrl: true,
        releasedAt: true,
      },
    });

    return NextResponse.json({
      game: {
        id: game.id,
        slug: game.slug,
        title: game.title,
        currentVersion: game.currentVersion,
      },
      versions,
    });
  } catch (error: any) {
    console.error('GET /api/games/[id]/versions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

// POST /api/games/[id]/versions - Create a new version (developer only)
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

    // Find the game
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Verify ownership
    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the game developer can create versions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createVersionSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues || [];
      return NextResponse.json(
        { error: errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { version, title, changelog, releaseType, gameFileUrl } = validation.data;

    // Check if this version already exists
    const existingVersion = await prisma.gameVersion.findUnique({
      where: {
        gameId_version: {
          gameId: game.id,
          version,
        },
      },
    });

    if (existingVersion) {
      return NextResponse.json(
        { error: 'This version already exists' },
        { status: 400 }
      );
    }

    // Create the version
    const newVersion = await prisma.gameVersion.create({
      data: {
        gameId: game.id,
        version,
        title: title || null,
        changelog,
        releaseType,
        gameFileUrl: gameFileUrl || null,
      },
    });

    // Update the game's current version
    await prisma.game.update({
      where: { id: game.id },
      data: {
        currentVersion: version,
        gameFileUrl: gameFileUrl || game.gameFileUrl, // Update if new file provided
      },
    });

    // Notify all users who have favorited/wishlisted or purchased the game
    const usersToNotify = await prisma.$queryRaw<{ userId: string }[]>`
      SELECT DISTINCT user_id as "userId"
      FROM (
        SELECT user_id FROM favorites WHERE game_id = ${game.id}
        UNION
        SELECT user_id FROM purchases WHERE game_id = ${game.id}
        UNION
        SELECT user_id FROM game_access WHERE game_id = ${game.id}
      ) as users
    `;

    // Send notifications
    const updateTitle = title || `v${version} Update`;
    const notificationPromises = usersToNotify.map((user) =>
      notifyGameUpdate(
        user.userId,
        game.id,
        game.title,
        `${updateTitle}: ${changelog.substring(0, 100)}${changelog.length > 100 ? '...' : ''}`,
        game.slug
      ).catch((err) => {
        console.error(`Failed to notify user ${user.userId}:`, err);
        return null;
      })
    );

    await Promise.allSettled(notificationPromises);

    console.log(`🎮 Version ${version} created for ${game.title}, notified ${usersToNotify.length} users`);

    return NextResponse.json({
      version: newVersion,
      notifiedUsers: usersToNotify.length,
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/games/[id]/versions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create version' },
      { status: 500 }
    );
  }
}

