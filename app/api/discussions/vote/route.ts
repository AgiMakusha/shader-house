/**
 * Discussion Voting API
 * POST: Vote on a thread or post
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { awardReward } from '@/lib/rewards/utils';
import { canPerformAction } from '@/lib/rewards/utils';

const voteSchema = z.object({
  threadId: z.string().optional(),
  postId: z.string().optional(),
  value: z.number().int().min(-1).max(1), // -1 downvote, 0 remove, 1 upvote
}).refine(
  (data) => (data.threadId && !data.postId) || (!data.threadId && data.postId),
  'Must provide either threadId or postId, not both'
);

/**
 * POST /api/discussions/vote
 * Vote on a thread or post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validated = voteSchema.parse(body);
    
    // Get user level to check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { level: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user can vote (level 3+)
    if (!canPerformAction(user.level, 'upvote')) {
      return NextResponse.json(
        { error: `You must be level 3 or higher to vote` },
        { status: 403 }
      );
    }
    
    const targetId = validated.threadId || validated.postId;
    const targetType = validated.threadId ? 'thread' : 'post';
    
    // Check if target exists
    if (targetType === 'thread') {
      const thread = await prisma.discussionThread.findUnique({
        where: { id: validated.threadId },
        select: { userId: true },
      });
      
      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      }
      
      // Can't vote on own thread
      if (thread.userId === session.user.id) {
        return NextResponse.json(
          { error: 'Cannot vote on your own thread' },
          { status: 400 }
        );
      }
    } else {
      const post = await prisma.discussionPost.findUnique({
        where: { id: validated.postId },
        select: { userId: true },
      });
      
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      
      // Can't vote on own post
      if (post.userId === session.user.id) {
        return NextResponse.json(
          { error: 'Cannot vote on your own post' },
          { status: 400 }
        );
      }
    }
    
    // Get existing vote
    const existingVote = await prisma.discussionVote.findFirst({
      where: {
        userId: session.user.id,
        ...(validated.threadId ? { threadId: validated.threadId } : { postId: validated.postId }),
      },
    });
    
    let result;
    let authorId: string;
    
    // Get author ID for rewards
    if (targetType === 'thread') {
      const thread = await prisma.discussionThread.findUnique({
        where: { id: validated.threadId },
        select: { userId: true },
      });
      authorId = thread!.userId;
    } else {
      const post = await prisma.discussionPost.findUnique({
        where: { id: validated.postId },
        select: { userId: true },
      });
      authorId = post!.userId;
    }
    
    if (validated.value === 0) {
      // Remove vote
      if (existingVote) {
        await prisma.discussionVote.delete({
          where: { id: existingVote.id },
        });
      }
      result = { action: 'removed', value: 0 };
    } else if (existingVote) {
      // Update existing vote
      await prisma.discussionVote.update({
        where: { id: existingVote.id },
        data: { value: validated.value },
      });
      
      // Award/remove reward based on change
      if (existingVote.value !== validated.value && validated.value === 1) {
        await awardReward(
          authorId,
          'UPVOTE_RECEIVED',
          `Received upvote on ${targetType}`,
          {
            threadId: validated.threadId,
            postId: validated.postId,
          }
        );
      }
      
      result = { action: 'updated', value: validated.value };
    } else {
      // Create new vote
      await prisma.discussionVote.create({
        data: {
          userId: session.user.id,
          threadId: validated.threadId,
          postId: validated.postId,
          value: validated.value,
        },
      });
      
      // Award reward for upvote
      if (validated.value === 1) {
        await awardReward(
          authorId,
          'UPVOTE_RECEIVED',
          `Received upvote on ${targetType}`,
          {
            threadId: validated.threadId,
            postId: validated.postId,
          }
        );
      }
      
      result = { action: 'created', value: validated.value };
    }
    
    // Get updated vote counts
    const voteStats = await prisma.discussionVote.groupBy({
      by: ['value'],
      where: validated.threadId
        ? { threadId: validated.threadId }
        : { postId: validated.postId },
      _count: true,
    });
    
    const upvotes = voteStats.find((v) => v.value === 1)?._count || 0;
    const downvotes = voteStats.find((v) => v.value === -1)?._count || 0;
    
    return NextResponse.json({
      ...result,
      upvotes,
      downvotes,
      total: upvotes - downvotes,
    });
  } catch (error: any) {
    // Error is returned to client and shown via Toast notification
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}
