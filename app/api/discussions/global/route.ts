/**
 * Global Discussion Threads API
 * GET: List threads across all games for Community Hub
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/discussions/global
 * List threads across all games with filtering
 * 
 * Query params:
 * - filter: 'all' | 'hot' | 'recent' | 'trending'
 * - page: number (default: 1)
 * - limit: number (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const skip = (page - 1) * limit;
    
    // Base where clause - no gameId filter means all games
    const where: any = {};
    
    // Build orderBy based on filter
    let orderBy: any[] = [];
    
    switch (filter) {
      case 'hot':
        // Hot threads: high engagement (replyCount + views + votes)
        // Order by engagement score, then by recent activity
        orderBy = [
          { isPinned: 'desc' },
          { replyCount: 'desc' },
          { views: 'desc' },
          { updatedAt: 'desc' },
        ];
        // Filter for threads with significant engagement
        where.OR = [
          { replyCount: { gte: 5 } },
          { views: { gte: 50 } },
        ];
        break;
        
      case 'recent':
        // Most recently created threads
        orderBy = [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
        
      case 'trending':
        // Trending: high activity in last 24-48 hours
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        where.OR = [
          { createdAt: { gte: twoDaysAgo } },
          { updatedAt: { gte: twoDaysAgo } },
        ];
        
        orderBy = [
          { isPinned: 'desc' },
          { replyCount: 'desc' },
          { views: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
        
      case 'all':
      default:
        // All threads, ordered by pinned first, then by recent activity
        orderBy = [
          { isPinned: 'desc' },
          { updatedAt: 'desc' },
        ];
        break;
    }
    
    // Get threads with author info, game info, and vote counts
    const [threads, total] = await Promise.all([
      prisma.discussionThread.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              displayName: true,
              image: true,
              level: true,
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
            },
          },
          _count: {
            select: {
              posts: true,
              votes: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.discussionThread.count({ where }),
    ]);
    
    // Transform threads to include replyCount from _count
    const transformedThreads = threads.map((thread) => ({
      ...thread,
      replyCount: thread._count.posts,
    }));
    
    return NextResponse.json({
      threads: transformedThreads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching global threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}



