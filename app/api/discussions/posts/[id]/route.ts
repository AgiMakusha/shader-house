/**
 * Individual Post API
 * PATCH: Update post (mark helpful, edit content)
 * DELETE: Delete post
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { awardReward } from '@/lib/rewards/utils';

const updatePostSchema = z.object({
  content: z.string().min(10).optional(),
  isHelpful: z.boolean().optional(),
});

/**
 * PATCH /api/discussions/posts/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    const validated = updatePostSchema.parse(body);
    
    // Get post to check permissions
    const post = await prisma.discussionPost.findUnique({
      where: { id },
      include: {
        thread: {
          include: {
            game: {
              select: {
                developerId: true,
              },
            },
          },
        },
      },
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const isAuthor = post.userId === session.user.id;
    const isDeveloper = post.thread.game.developerId === session.user.id;
    const isThreadAuthor = post.thread.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    // Only author can edit content
    if (validated.content !== undefined && !isAuthor) {
      return NextResponse.json(
        { error: 'Only the author can edit this post' },
        { status: 403 }
      );
    }
    
    // Only thread author or dev can mark as helpful
    if (
      validated.isHelpful !== undefined &&
      !isThreadAuthor &&
      !isDeveloper &&
      !isAdmin
    ) {
      return NextResponse.json(
        { error: 'Only the thread author or developer can mark posts as helpful' },
        { status: 403 }
      );
    }
    
    // Update post
    const updated = await prisma.discussionPost.update({
      where: { id },
      data: validated,
    });
    
    // Award reward if marked as helpful (and not already awarded)
    if (validated.isHelpful && !post.isHelpful) {
      await awardReward(
        post.userId,
        'HELPFUL_MARKED',
        `Post marked as helpful`,
        { threadId: post.threadId, postId: id }
      );
    }
    
    return NextResponse.json({ post: updated });
  } catch (error: any) {
    console.error('Error updating post:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/discussions/posts/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Get post to check permissions
    const post = await prisma.discussionPost.findUnique({
      where: { id },
      include: {
        thread: {
          include: {
            game: {
              select: {
                developerId: true,
              },
            },
          },
        },
      },
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const isAuthor = post.userId === session.user.id;
    const isDeveloper = post.thread.game.developerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    if (!isAuthor && !isDeveloper && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this post' },
        { status: 403 }
      );
    }
    
    // Delete post (cascades to replies and votes)
    await prisma.discussionPost.delete({
      where: { id },
    });
    
    // Decrement thread reply count
    await prisma.discussionThread.update({
      where: { id: post.threadId },
      data: {
        replyCount: { decrement: 1 },
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
