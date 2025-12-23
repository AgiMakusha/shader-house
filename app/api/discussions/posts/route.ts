/**
 * Discussion Posts API
 * GET: Get posts for a thread (with nested replies)
 * POST: Create a new post/reply
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { awardReward } from '@/lib/rewards/utils';

const createPostSchema = z.object({
  threadId: z.string().min(1),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  parentId: z.string().optional(), // For nested replies
});

/**
 * GET /api/discussions/posts
 * Get posts for a thread with nested replies
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const postId = searchParams.get('postId'); // For fetching nested replies
    
    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }
    
    const session = await getSessionFromRequest(request);
    
    // Get posts with author info
    const posts = await prisma.discussionPost.findMany({
      where: {
        threadId,
        parentId: postId || null, // Top-level or specific parent
      },
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
        replies: {
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
          orderBy: {
            createdAt: 'asc',
          },
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
            replies: true,
          },
        },
      },
      orderBy: [
        { isHelpful: 'desc' },
        { createdAt: 'asc' },
      ],
    });
    
    // Calculate vote totals for each post
    const postsWithVotes = await Promise.all(
      posts.map(async (post) => {
        const voteStats = await prisma.discussionVote.groupBy({
          by: ['value'],
          where: { postId: post.id },
          _count: true,
        });
        
        const upvotes = voteStats.find((v) => v.value === 1)?._count || 0;
        const downvotes = voteStats.find((v) => v.value === -1)?._count || 0;
        
        return {
          ...post,
          upvotes,
          downvotes,
          userVote: post.votes?.[0]?.value || 0,
        };
      })
    );
    
    return NextResponse.json({ posts: postsWithVotes });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discussions/posts
 * Create a new post/reply
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validated = createPostSchema.parse(body);
    
    // Verify thread exists and is not locked
    const thread = await prisma.discussionThread.findUnique({
      where: { id: validated.threadId },
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
    
    if (thread.isLocked) {
      return NextResponse.json(
        { error: 'Thread is locked' },
        { status: 403 }
      );
    }
    
    // Check if replying to a valid parent post
    if (validated.parentId) {
      const parent = await prisma.discussionPost.findUnique({
        where: { id: validated.parentId },
      });
      
      if (!parent || parent.threadId !== validated.threadId) {
        return NextResponse.json(
          { error: 'Invalid parent post' },
          { status: 400 }
        );
      }
    }
    
    // Check if author is the game developer
    const isDevPost = thread.game.developerId === session.user.id;
    
    // Create post
    const post = await prisma.discussionPost.create({
      data: {
        threadId: validated.threadId,
        userId: session.user.id,
        content: validated.content,
        parentId: validated.parentId,
        isDevPost,
      },
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
      },
    });
    
    // Update thread reply count
    await prisma.discussionThread.update({
      where: { id: validated.threadId },
      data: {
        replyCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });
    
    // Award XP and Points
    const reward = await awardReward(
      session.user.id,
      'POST_CREATED',
      `Posted reply in thread`,
      { threadId: validated.threadId, postId: post.id }
    );
    
    return NextResponse.json({
      post,
      reward,
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
