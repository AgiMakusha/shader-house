import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { deleteUploadedFile } from '@/lib/utils/file-manager';

/**
 * DELETE /api/games/:id/file
 * Removes the uploaded game file from a game
 * Only the game owner can delete the file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gameId = params.id;

    // Fetch the game and verify ownership
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        developerId: true,
        gameFileUrl: true,
        externalUrl: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // RULE 1: Only the game owner can delete files
    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the game owner can delete files' },
        { status: 403 }
      );
    }

    if (!game.gameFileUrl) {
      return NextResponse.json(
        { error: 'No game file to delete' },
        { status: 400 }
      );
    }

    // Check if there's an alternative (external URL)
    if (!game.externalUrl) {
      return NextResponse.json(
        { error: 'Cannot delete file: Game must have either a file or external URL' },
        { status: 400 }
      );
    }

    // Delete the physical file
    await deleteUploadedFile(game.gameFileUrl);

    // Update database to remove file URL
    await prisma.game.update({
      where: { id: gameId },
      data: {
        gameFileUrl: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Game file deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete game file error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete game file' },
      { status: 500 }
    );
  }
}

