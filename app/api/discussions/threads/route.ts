/**
 * Discussion Threads API
 * GET: List threads for a game
 * POST: Create a new thread
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { awardReward } from '@/lib/rewards/utils';
import { ThreadCategory } from '@prisma/client';
import { notifyNewCommunityThread } from '@/lib/notifications/triggers';
import { checkSpam } from '@/lib/security/spam-detection';
import { checkContentRateLimit, recordContentPost, checkCooldown, recordPostTime } from '@/lib/security/content-rate-limit';
import { isEmailVerified, getUnverifiedEmailError } from '@/lib/security/email-verification-guard';
import { logSecurityEvent } from '@/lib/security/audit-log';

// Validation schema
const createThreadSchema = z.object({
  gameId: z.string().min(1),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  category: z.enum(['GENERAL', 'BUG_REPORT', 'SUGGESTION', 'SHOWCASE', 'ANNOUNCEMENT']),
  mediaUrls: z.array(
    z.string().refine(
      (url) => {
        // Accept both relative URLs (starting with /) and absolute URLs
        return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
      },
      { message: 'Invalid URL format' }
    )
  ).optional(),
});

/**
 * GET /api/discussions/threads
 * List threads for a game
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const category = searchParams.get('category') as ThreadCategory | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }
    
    const skip = (page - 1) * limit;
    
    const where: any = { gameId };
    if (category) {
      where.category = category;
    }
    
    // Get threads with author info and vote counts
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
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.discussionThread.count({ where }),
    ]);
    
    return NextResponse.json({
      threads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discussions/threads
 * Create a new thread
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // 1. Email verification check
    const emailCheck = await isEmailVerified(session.user.id);
    if (!emailCheck.verified) {
      logSecurityEvent('CONTENT_BLOCKED_UNVERIFIED', {
        userId: session.user.id,
        ipAddress: clientIP,
        endpoint: '/api/discussions/threads',
        details: { action: 'create_thread' },
        success: false,
      });
      return NextResponse.json(getUnverifiedEmailError(), { status: 403 });
    }
    
    // 2. Cooldown check (minimum time between posts)
    const cooldownCheck = checkCooldown(session.user.id, 'thread');
    if (!cooldownCheck.canPost) {
      return NextResponse.json(
        { error: `Please wait ${cooldownCheck.waitSeconds} seconds before creating another thread.` },
        { status: 429 }
      );
    }
    
    // 3. Rate limit check
    const rateLimitCheck = checkContentRateLimit(session.user.id, 'thread');
    if (!rateLimitCheck.allowed) {
      logSecurityEvent('CONTENT_BLOCKED_RATE_LIMIT', {
        userId: session.user.id,
        ipAddress: clientIP,
        endpoint: '/api/discussions/threads',
        details: { 
          limitType: rateLimitCheck.limitType,
          resetAt: new Date(rateLimitCheck.resetAt).toISOString(),
        },
        success: false,
      });
      return NextResponse.json(
        { 
          error: `You've reached the thread limit. Try again later.`,
          resetAt: new Date(rateLimitCheck.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }
    
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const validated = createThreadSchema.parse(body);
    
    // 4. Spam detection check
    const spamCheckTitle = checkSpam(validated.title);
    const spamCheckContent = checkSpam(validated.content);
    
    if (spamCheckTitle.isSpam || spamCheckContent.isSpam) {
      logSecurityEvent('CONTENT_FLAGGED_SPAM', {
        userId: session.user.id,
        ipAddress: clientIP,
        endpoint: '/api/discussions/threads',
        details: {
          titleScore: spamCheckTitle.score,
          contentScore: spamCheckContent.score,
          reasons: [...spamCheckTitle.reasons, ...spamCheckContent.reasons],
        },
        success: false,
      });
      return NextResponse.json(
        { error: 'Your post was flagged as potential spam. Please revise and try again.' },
        { status: 400 }
      );
    }
    
    // Normalize mediaUrls - ensure it's always an array
    const mediaUrls = Array.isArray(validated.mediaUrls) 
      ? validated.mediaUrls.filter(url => typeof url === 'string' && url.trim().length > 0)
      : [];
    
    // Verify game exists and get game name
    const game = await prisma.game.findUnique({
      where: { id: validated.gameId },
      select: { id: true, title: true, developerId: true },
    });
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Check user role (normalize to uppercase for comparison)
    const userRole = session.user.role?.toUpperCase();
    const isDeveloper = userRole === 'DEVELOPER';
    
    // Developers can only create threads in GENERAL and ANNOUNCEMENT categories
    if (isDeveloper && !['GENERAL', 'ANNOUNCEMENT'].includes(validated.category)) {
      return NextResponse.json(
        { error: 'Developers can only create threads in General discussions and Announcement categories' },
        { status: 403 }
      );
    }
    
    // Only developers can create announcements
    if (
      validated.category === 'ANNOUNCEMENT' &&
      game.developerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Only developers can create announcements' },
        { status: 403 }
      );
    }
    
    // Validate media URLs (only for Showcase, max 5)
    if (mediaUrls.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 media files allowed' },
        { status: 400 }
      );
    }
    
    // Only Showcase threads can have media
    if (mediaUrls.length > 0 && validated.category !== 'SHOWCASE') {
      return NextResponse.json(
        { error: 'Media uploads are only allowed for Showcase threads' },
        { status: 400 }
      );
    }

    // Create thread with game name
    const thread = await prisma.discussionThread.create({
      data: {
        gameId: validated.gameId,
        userId: session.user.id,
        title: validated.title,
        content: validated.content,
        category: validated.category,
        gameName: game.title, // Store the game name when thread is created
        mediaUrls: mediaUrls, // Store media URLs for Showcase threads
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            level: true,
            badges: true,
          },
        },
      },
    });
    
    // Record rate limit usage and cooldown
    recordContentPost(session.user.id, 'thread');
    recordPostTime(session.user.id, 'thread');
    
    // Award XP and Points (don't fail thread creation if reward fails)
    let reward = null;
    try {
      reward = await awardReward(
        session.user.id,
        'THREAD_CREATED',
        `Created thread: ${validated.title}`,
        { threadId: thread.id }
      );
    } catch (rewardError: any) {
      console.error('Failed to award reward for thread creation:', rewardError);
      // Thread was created successfully, so we continue even if reward fails
      // Return a default reward structure to maintain API compatibility
      reward = {
        xpEarned: 0,
        pointsEarned: 0,
        newXp: 0,
        newPoints: 0,
        newLevel: 1,
        leveledUp: false,
      };
    }

    // Notify developer when gamers post BUG_REPORT or SUGGESTION threads
    // Only notify if the thread author is NOT the developer themselves
    if (
      (validated.category === 'BUG_REPORT' || validated.category === 'SUGGESTION') &&
      game.developerId !== session.user.id
    ) {
      try {
        // Get author name for notification
        const author = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, displayName: true },
        });
        
        // Get game slug for better linking
        const gameWithSlug = await prisma.game.findUnique({
          where: { id: validated.gameId },
          select: { slug: true },
        });
        
        const authorName = author?.displayName || author?.name || 'A player';
        
        console.log(`🔔 Notifying developer ${game.developerId} about new community thread`);
        await notifyNewCommunityThread(
          game.developerId,
          validated.gameId,
          game.title,
          validated.category as 'BUG_REPORT' | 'SUGGESTION',
          validated.title,
          authorName,
          gameWithSlug?.slug
        );
        console.log(`✅ Developer community thread notification sent`);
      } catch (notificationError) {
        console.error('❌ Error sending developer community thread notification:', notificationError);
        // Don't fail the request if notification fails
      }
    }
    
    return NextResponse.json({
      thread,
      reward,
    });
  } catch (error: any) {
    // Log detailed error information
    console.error('=== Thread Creation Error ===');
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error stack:', error?.stack);
    console.error('Error full object:', JSON.stringify(error, null, 2));
    console.error('===========================');
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMsg = error.issues[0].message || 'Invalid input provided';
      console.error('Validation error:', error.issues);
      return NextResponse.json(
        { error: errorMsg, details: error.issues },
        { status: 400 }
      );
    }
    
    // Handle Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A thread with this title already exists' },
        { status: 409 }
      );
    }
    
    if (error?.code === 'P2003') {
      const field = error?.meta?.field_name || 'reference';
      return NextResponse.json(
        { error: `Invalid ${field}. The game or user may not exist.` },
        { status: 400 }
      );
    }
    
    // Handle database connection errors
    if (error?.code === 'P1001' || error?.message?.includes('connect') || error?.message?.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }
    
    // Handle missing required fields
    if (error?.message?.includes('required') || error?.message?.includes('missing')) {
      return NextResponse.json(
        { error: `Missing required information: ${error.message}` },
        { status: 400 }
      );
    }
    
    // Return specific error message if available, otherwise generic
    const errorMessage = error?.message || 'Failed to create thread. Please check your input and try again.';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        // Include error details in development
        ...(process.env.NODE_ENV === 'development' && { 
          details: {
            code: error?.code,
            message: error?.message,
            stack: error?.stack?.split('\n').slice(0, 5).join('\n'),
          }
        })
      },
      { status: 500 }
    );
  }
}
