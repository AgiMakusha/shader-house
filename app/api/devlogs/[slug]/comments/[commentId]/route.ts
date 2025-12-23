import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionFromRequest } from '@/lib/auth/session';

// DELETE - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; commentId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { slug, commentId } = await params;
    
    // Find the devlog
    const devlog = await prisma.devlog.findUnique({
      where: { slug },
      select: { id: true, developerId: true },
    });

    if (!devlog) {
      return NextResponse.json({ error: 'Devlog not found' }, { status: 404 });
    }

    // Find the comment
    const comment = await prisma.devlogComment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, devlogId: true },
    });

    if (!comment || comment.devlogId !== devlog.id) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check permission: comment author or devlog author can delete
    if (comment.userId !== userId && devlog.developerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.devlogComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

// PATCH - Update a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; commentId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { slug, commentId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Find the devlog
    const devlog = await prisma.devlog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!devlog) {
      return NextResponse.json({ error: 'Devlog not found' }, { status: 404 });
    }

    // Find the comment
    const comment = await prisma.devlogComment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, devlogId: true },
    });

    if (!comment || comment.devlogId !== devlog.id) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Only comment author can edit
    if (comment.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedComment = await prisma.devlogComment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            role: true,
            level: true,
            badges: true,
          },
        },
      },
    });

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}
