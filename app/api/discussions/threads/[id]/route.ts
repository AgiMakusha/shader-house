/**
 * Individual Thread API
 * GET: Get thread details
 * PATCH: Update thread (pin, lock, mark solved)
 * DELETE: Delete thread
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const updateThreadSchema = z.object({
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isSolved: z.boolean().optional(),
});

/**
 * GET /api/discussions/threads/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);
    
    // Increment view count
    await prisma.discussionThread.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    
    // Get thread with all details
    const thread = await prisma.discussionThread.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            level: true,
            points: true,
            badges: true,
            role: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            developerId: true,
            developer: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        posts: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                displayName: true,
                image: true,
                level: true,
                points: true,
                badges: true,
                role: true,
              },
            },
            votes: true,
            _count: {
              select: {
                replies: true,
              },
            },
          },
          where: {
            parentId: null, // Only top-level posts
          },
          orderBy: [
            { isHelpful: 'desc' },
            { createdAt: 'asc' },
          ],
        },
        votes: session?.user
          ? {
              where: {
                userId: session.user.id,
              },
            }
          : false,
        _count: {
          select: {
            posts: true,
            votes: true,
          },
        },
      },
    });
    
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }
    
    // Calculate vote totals
    const voteStats = await prisma.discussionVote.groupBy({
      by: ['value'],
      where: { threadId: id },
      _count: true,
    });
    
    const upvotes = voteStats.find((v) => v.value === 1)?._count || 0;
    const downvotes = voteStats.find((v) => v.value === -1)?._count || 0;
    
    return NextResponse.json({
      ...thread,
      upvotes,
      downvotes,
      userVote: thread.votes?.[0]?.value || 0,
    });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/discussions/threads/[id]
 * Update thread (pin, lock, solve)
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
    const validated = updateThreadSchema.parse(body);
    
    // Get thread to check permissions
    const thread = await prisma.discussionThread.findUnique({
      where: { id },
      include: {
        game: {
          select: {
            developerId: true,
          },
        },
      },
    });
    
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }
    
    // Check permissions
    const isDeveloper = thread.game.developerId === session.user.id;
    const isAuthor = thread.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    // Only devs/admins can pin or lock
    if (
      (validated.isPinned !== undefined || validated.isLocked !== undefined) &&
      !isDeveloper &&
      !isAdmin
    ) {
      return NextResponse.json(
        { error: 'Only developers and admins can pin or lock threads' },
        { status: 403 }
      );
    }
    
    // Author or dev can mark as solved
    if (
      validated.isSolved !== undefined &&
      !isAuthor &&
      !isDeveloper &&
      !isAdmin
    ) {
      return NextResponse.json(
        { error: 'Only the author or developer can mark thread as solved' },
        { status: 403 }
      );
    }
    
    // Update thread
    const updated = await prisma.discussionThread.update({
      where: { id },
      data: validated,
    });
    
    return NextResponse.json({ thread: updated });
  } catch (error: any) {
    console.error('Error updating thread:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update thread' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/discussions/threads/[id]
 * Delete thread (author, dev, or admin only)
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
    
    // Get thread to check permissions
    const thread = await prisma.discussionThread.findUnique({
      where: { id },
      include: {
        game: {
          select: {
            developerId: true,
          },
        },
      },
    });
    
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }
    
    // Check permissions
    const isDeveloper = thread.game.developerId === session.user.id;
    const isAuthor = thread.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    if (!isAuthor && !isDeveloper && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this thread' },
        { status: 403 }
      );
    }
    
    // Delete thread (cascades to posts and votes)
    await prisma.discussionThread.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
}
