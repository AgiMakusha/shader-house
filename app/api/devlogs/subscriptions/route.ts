import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionFromRequest } from '@/lib/auth/session';

// GET - Get user's devlog subscriptions
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const subscriptions = await prisma.devlogSubscription.findMany({
      where: { userId },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            role: true,
            developerProfile: {
              select: {
                studioName: true,
                verificationStatus: true,
              },
            },
            _count: {
              select: {
                devlogs: {
                  where: { isPublished: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST - Subscribe to a developer
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { developerId, notifyNewPost = true } = body;

    if (!developerId) {
      return NextResponse.json(
        { error: 'Developer ID is required' },
        { status: 400 }
      );
    }

    // Verify developer exists and is actually a developer
    const developer = await prisma.user.findUnique({
      where: { id: developerId },
      select: { id: true, role: true },
    });

    if (!developer || developer.role !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    }

    // Can't subscribe to yourself
    if (developerId === userId) {
      return NextResponse.json(
        { error: 'Cannot subscribe to yourself' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.devlogSubscription.findUnique({
      where: {
        userId_developerId: {
          userId,
          developerId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      );
    }

    const subscription = await prisma.devlogSubscription.create({
      data: {
        userId,
        developerId,
        notifyNewPost,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from a developer
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const developerId = searchParams.get('developerId');

    if (!developerId) {
      return NextResponse.json(
        { error: 'Developer ID is required' },
        { status: 400 }
      );
    }

    await prisma.devlogSubscription.delete({
      where: {
        userId_developerId: {
          userId,
          developerId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not subscribed' }, { status: 400 });
    }
    console.error('Error unsubscribing:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
