import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionFromRequest } from '@/lib/auth/session';

// GET - Fetch a single devlog by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSessionFromRequest(request);
    const userId = session?.user?.id;

    const devlog = await prisma.devlog.findUnique({
      where: { slug },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            role: true,
            bio: true,
            developerProfile: {
              select: {
                studioName: true,
                verificationStatus: true,
                tools: true,
                portfolioUrl: true,
              },
            },
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            tagline: true,
            releaseStatus: true,
          },
        },
        comments: {
          where: { parentId: null },
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
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!devlog) {
      return NextResponse.json({ error: 'Devlog not found' }, { status: 404 });
    }

    // Check if unpublished devlog can be accessed
    if (!devlog.isPublished) {
      if (!userId || userId !== devlog.developerId) {
        return NextResponse.json({ error: 'Devlog not found' }, { status: 404 });
      }
    }

    // Increment view count
    await prisma.devlog.update({
      where: { id: devlog.id },
      data: { views: { increment: 1 } },
    });

    // Check if user has liked and is subscribed
    let isLiked = false;
    let isSubscribed = false;
    
    if (userId) {
      const [like, subscription] = await Promise.all([
        prisma.devlogLike.findUnique({
          where: {
            devlogId_userId: {
              devlogId: devlog.id,
              userId,
            },
          },
        }),
        prisma.devlogSubscription.findUnique({
          where: {
            userId_developerId: {
              userId,
              developerId: devlog.developerId,
            },
          },
        }),
      ]);
      isLiked = !!like;
      isSubscribed = !!subscription;
    }

    return NextResponse.json({
      devlog: {
        ...devlog,
        isLiked,
        isSubscribed,
        isOwner: userId === devlog.developerId,
      },
    });
  } catch (error) {
    console.error('Error fetching devlog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devlog' },
      { status: 500 }
    );
  }
}

// PATCH - Update a devlog
export async function PATCH(
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
    
    // Find the devlog
    const existingDevlog = await prisma.devlog.findUnique({
      where: { slug },
      select: { id: true, developerId: true, isPublished: true },
    });

    if (!existingDevlog) {
      return NextResponse.json({ error: 'Devlog not found' }, { status: 404 });
    }

    // Check ownership
    if (existingDevlog.developerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      coverImage,
      mediaUrls,
      category,
      tags,
      gameId,
      isPublished,
    } = body;

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (mediaUrls !== undefined) updateData.mediaUrls = mediaUrls;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (gameId !== undefined) updateData.gameId = gameId || null;
    
    // Handle publish status change
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      if (isPublished && !existingDevlog.isPublished) {
        updateData.publishedAt = new Date();
      }
    }

    const devlog = await prisma.devlog.update({
      where: { id: existingDevlog.id },
      data: updateData,
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ devlog });
  } catch (error) {
    console.error('Error updating devlog:', error);
    return NextResponse.json(
      { error: 'Failed to update devlog' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a devlog
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
    
    // Find the devlog
    const devlog = await prisma.devlog.findUnique({
      where: { slug },
      select: { id: true, developerId: true },
    });

    if (!devlog) {
      return NextResponse.json({ error: 'Devlog not found' }, { status: 404 });
    }

    // Check ownership
    if (devlog.developerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.devlog.delete({
      where: { id: devlog.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting devlog:', error);
    return NextResponse.json(
      { error: 'Failed to delete devlog' },
      { status: 500 }
    );
  }
}
