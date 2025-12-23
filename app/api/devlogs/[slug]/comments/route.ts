import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionFromRequest } from '@/lib/auth/session';
import { createNotification } from '@/lib/notifications/service';

// GET - Fetch comments for a devlog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const devlog = await prisma.devlog.findUnique({
      where: { slug },
      select: { id: true, isPublished: true, developerId: true },
    });

    if (!devlog) {
      return NextResponse.json({ error: 'Devlog not found' }, { status: 404 });
    }

    const comments = await prisma.devlogComment.findMany({
      where: {
        devlogId: devlog.id,
        parentId: null, // Only top-level comments
      },
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
        replies: {
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
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ comments, developerId: devlog.developerId });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { slug } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const devlog = await prisma.devlog.findUnique({
      where: { slug },
      select: { id: true, developerId: true, title: true },
    });

    if (!devlog) {
      return NextResponse.json({ error: 'Devlog not found' }, { status: 404 });
    }

    // Verify parent comment exists if replying
    let parentComment = null;
    if (parentId) {
      parentComment = await prisma.devlogComment.findUnique({
        where: { id: parentId },
        select: { 
          devlogId: true, 
          userId: true,
          author: {
            select: { name: true, displayName: true },
          },
        },
      });
      
      if (!parentComment || parentComment.devlogId !== devlog.id) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 400 }
        );
      }
    }

    const comment = await prisma.devlogComment.create({
      data: {
        devlogId: devlog.id,
        userId,
        content: content.trim(),
        parentId: parentId || null,
      },
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

    const commenter = comment.author;
    const commenterName = commenter.displayName || commenter.name;

    // If this is a reply, notify the parent comment author
    if (parentComment && parentComment.userId !== userId) {
      await createNotification({
        userId: parentComment.userId,
        type: 'DEVLOG_COMMENT',
        title: 'Reply to Your Comment',
        message: `${commenterName} replied to your comment on "${devlog.title}"`,
        link: `/devlogs/${slug}#comment-${comment.id}`,
        metadata: {
          devlogId: devlog.id,
          commentId: comment.id,
          parentCommentId: parentId,
          commenterId: userId,
        },
      });
    }

    // Notify developer about new comment (if not self-comment and not already notified)
    if (devlog.developerId !== userId && devlog.developerId !== parentComment?.userId) {
      await createNotification({
        userId: devlog.developerId,
        type: 'DEVLOG_COMMENT',
        title: 'New Comment on Your Devlog',
        message: `${commenterName} commented on "${devlog.title}"`,
        link: `/devlogs/${slug}#comment-${comment.id}`,
        metadata: {
          devlogId: devlog.id,
          commentId: comment.id,
          commenterId: userId,
        },
      });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
