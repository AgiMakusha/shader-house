import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionFromRequest } from '@/lib/auth/session';
import { createNotification } from '@/lib/notifications/service';

// POST - Like a devlog
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
    
    const devlog = await prisma.devlog.findUnique({
      where: { slug },
      select: { id: true, developerId: true, title: true },
    });

    if (!devlog) {
      return NextResponse.json({ error: 'Devlog not found' }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.devlogLike.findUnique({
      where: {
        devlogId_userId: {
          devlogId: devlog.id,
          userId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      );
    }

    // Create like
    await prisma.devlogLike.create({
      data: {
        devlogId: devlog.id,
        userId,
      },
    });

    // Update like count
    await prisma.devlog.update({
      where: { id: devlog.id },
      data: { likeCount: { increment: 1 } },
    });

    // Notify developer (if not self-like)
    if (devlog.developerId !== userId) {
      const liker = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, displayName: true },
      });
      
      await createNotification({
        userId: devlog.developerId,
        type: 'DEVLOG_LIKE',
        title: 'New Like on Your Devlog',
        message: `${liker?.displayName || liker?.name || 'Someone'} liked your devlog "${devlog.title}"`,
        link: `/devlogs/${slug}`,
        metadata: {
          devlogId: devlog.id,
          likerId: userId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error liking devlog:', error);
    return NextResponse.json(
      { error: 'Failed to like devlog' },
      { status: 500 }
    );
  }
}

// DELETE - Unlike a devlog
export async function DELETE(
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
    
    const devlog = await prisma.devlog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!devlog) {
      return NextResponse.json({ error: 'Devlog not found' }, { status: 404 });
    }

    // Delete like
    await prisma.devlogLike.delete({
      where: {
        devlogId_userId: {
          devlogId: devlog.id,
          userId,
        },
      },
    });

    // Update like count
    await prisma.devlog.update({
      where: { id: devlog.id },
      data: { likeCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not liked' }, { status: 400 });
    }
    console.error('Error unliking devlog:', error);
    return NextResponse.json(
      { error: 'Failed to unlike devlog' },
      { status: 500 }
    );
  }
}
