import { NextRequest, NextResponse } from 'next/server';
import { getGames, createGame, getTags } from '@/lib/queries/games';
import { gameQuerySchema, gameUpsertSchema } from '@/lib/validations/game';
import { getSessionFromRequest } from '@/lib/auth/session';
import { notifyBetaGamePublished } from '@/lib/notifications/triggers';
import { prisma } from '@/lib/db/prisma';
import { ReleaseStatus } from '@prisma/client';
import { canPerformAction } from '@/lib/security/email-verification-guard';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      q: searchParams.get('q') || undefined,
      tags: searchParams.get('tags') || undefined,
      platform: searchParams.get('platform') || undefined,
      priceFilter: searchParams.get('priceFilter') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
      developer: searchParams.get('developer') || undefined,
    };

    const validated = gameQuerySchema.parse(queryParams);
    
    // Pass userId if developer='me' is requested
    const userId = validated.developer === 'me' ? session?.user?.id : undefined;
    
    // Check status filter
    const statusParam = searchParams.get('status');
    
    console.log('🎮 API /games:', {
      developer: validated.developer,
      sessionUserId: session?.user?.id,
      passedUserId: userId,
      statusParam,
    });
    
    const [result, tags] = await Promise.all([
      getGames(validated, userId, statusParam),
      getTags(),
    ]);

    return NextResponse.json({
      ...result,
      tags,
    });
  } catch (error: any) {
    console.error('GET /api/games error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch games' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Normalize role to uppercase (handles legacy lowercase roles)
    const userRole = session.user.role?.toUpperCase();
    if (userRole !== 'DEVELOPER' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only developers can create games' }, { status: 403 });
    }

    // Check email verification for uploading games
    const verificationCheck = canPerformAction(session, 'upload_game');
    if (!verificationCheck.allowed) {
      return NextResponse.json(
        { error: verificationCheck.reason },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = gameUpsertSchema.safeParse(body);

    if (!validation.success) {
      // Return Zod validation errors in a format the frontend can handle
      // Convert to plain objects to ensure JSON serialization
      try {
        // Safely access error structure
        if (!validation.error) {
          return NextResponse.json(
            [{ code: 'custom', path: [], message: 'Validation failed' }],
            { status: 400 }
          );
        }

        const errorArray = Array.isArray(validation.error.issues) 
          ? validation.error.issues 
          : (validation.error.issues || []);
        
        if (!Array.isArray(errorArray) || errorArray.length === 0) {
          return NextResponse.json(
            [{ code: 'custom', path: [], message: 'Validation failed' }],
            { status: 400 }
          );
        }

        const errors = errorArray.map((err: any) => {
          const path = err.path && Array.isArray(err.path) 
            ? err.path.map((p: any) => String(p)) 
            : (err.path ? [String(err.path)] : []);
          
          return {
            code: err.code || 'custom',
            path: path,
            message: String(err.message || 'Validation error'),
          };
        });
        return NextResponse.json(
          errors,
          { status: 400 }
        );
      } catch (parseError) {
        // Fallback if error parsing fails
        console.error('Error parsing validation errors:', parseError, validation);
        return NextResponse.json(
          [{ code: 'custom', path: [], message: 'Validation failed' }],
          { status: 400 }
        );
      }
    }

    const game = await createGame(validation.data, session.user.id);

    // Fetch the game again to ensure we have the latest data including releaseStatus
    const fullGame = await prisma.game.findUnique({
      where: { id: game.id },
      select: {
        id: true,
        title: true,
        slug: true,
        releaseStatus: true,
      },
    });

    if (!fullGame) {
      console.error(`❌ Game not found after creation: ${game.id}`);
      return NextResponse.json(game, { status: 201 });
    }

    // Log game creation details for debugging
    console.log(`🎮 Game created: ${fullGame.title} (${fullGame.id}), releaseStatus: ${fullGame.releaseStatus}`);

    // If game is published as BETA, notify all gamers (including FREE tier)
    if (fullGame.releaseStatus === ReleaseStatus.BETA) {
      console.log(`✅ Game is BETA status, proceeding with notifications...`);
      try {
        console.log(`🔔 New beta game published: ${game.title} (${game.id})`);
        
        // Get all gamers regardless of subscription tier (FREE, CREATOR_SUPPORT, GAMER_PRO)
        const allGamers = await prisma.user.findMany({
          where: {
            role: 'GAMER',
            // No subscription tier filter - includes FREE, CREATOR_SUPPORT, and GAMER_PRO
          },
          select: { 
            id: true,
            subscriptionTier: true, // Include for logging
          },
        });

        // Log breakdown by subscription tier for debugging
        const tierCounts = allGamers.reduce((acc, gamer) => {
          const tier = gamer.subscriptionTier || 'FREE';
          acc[tier] = (acc[tier] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        console.log(`📢 Notifying ${allGamers.length} gamers about new beta game (tier breakdown:`, tierCounts, ')');

        // Notify all gamers (FREE, CREATOR_SUPPORT, and GAMER_PRO)
        const notificationPromises = allGamers.map((gamer) =>
          notifyBetaGamePublished(gamer.id, fullGame.id, fullGame.title, fullGame.slug).catch((error) => {
            console.error(`Error notifying gamer ${gamer.id} (${gamer.subscriptionTier}):`, error);
            return null; // Continue with other notifications even if one fails
          })
        );

        const results = await Promise.allSettled(notificationPromises);
        
        // Log detailed results
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`❌ Failed to notify ${allGamers[index].id} (${allGamers[index].subscriptionTier}):`, result.reason);
          } else if (result.status === 'fulfilled' && result.value) {
            console.log(`✅ Successfully notified ${allGamers[index].id} (${allGamers[index].subscriptionTier}):`, result.value);
          }
        });
        
        console.log(`✅ Notification summary: ${successful} successful, ${failed} failed out of ${allGamers.length} gamers (all tiers including FREE)`);
      } catch (notificationError) {
        console.error('❌ Error sending beta game published notifications:', notificationError);
        console.error('Error stack:', notificationError instanceof Error ? notificationError.stack : 'No stack trace');
        // Don't fail the request if notifications fail
      }
    } else {
      console.log(`⏭️  Game is not BETA status (${fullGame.releaseStatus}), skipping notifications`);
    }

    return NextResponse.json(fullGame || game, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/games error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create game' },
      { status: 400 }
    );
  }
}

