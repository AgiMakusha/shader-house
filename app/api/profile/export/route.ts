import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// GET - Export all user data (GDPR compliance)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        developerProfile: true,
        accounts: {
          select: {
            id: true,
            provider: true,
            type: true,
          },
        },
        ratings: {
          include: {
            game: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
        favorites: {
          include: {
            game: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
        purchases: {
          include: {
            game: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
        betaTester: {
          include: {
            game: {
              select: {
                title: true,
                slug: true,
              },
            },
            feedback: true,
            completedTasks: {
              include: {
                task: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
        threads: {
          select: {
            id: true,
            title: true,
            content: true,
            category: true,
            createdAt: true,
          },
        },
        posts: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
        notifications: {
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            createdAt: true,
            isRead: true,
          },
        },
        rewards: {
          select: {
            type: true,
            xpEarned: true,
            pointsEarned: true,
            reason: true,
            createdAt: true,
          },
        },
        devlogs: {
          select: {
            id: true,
            title: true,
            content: true,
            category: true,
            createdAt: true,
            publishedAt: true,
          },
        },
        devlogComments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive fields
    const exportData = {
      exportedAt: new Date().toISOString(),
      userData: {
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        publicEmail: user.publicEmail,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        emailVerified: user.emailVerified,
        image: user.image,
        
        // Subscription
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        
        // Gamification
        xp: user.xp,
        level: user.level,
        points: user.points,
        badges: user.badges,
        
        // Preferences
        wantsNewsletter: user.wantsNewsletter,
        wantsDigestNewsletter: user.wantsDigestNewsletter,
        showOnlineStatus: user.showOnlineStatus,
        emailNotifications: user.emailNotifications,
        inAppNotifications: user.inAppNotifications,
        
        // Developer profile (if exists)
        developerProfile: user.developerProfile ? {
          developerType: user.developerProfile.developerType,
          teamSize: user.developerProfile.teamSize,
          studioName: user.developerProfile.studioName,
          tools: user.developerProfile.tools,
          portfolioUrl: user.developerProfile.portfolioUrl,
          studioBio: user.developerProfile.studioBio,
          verificationStatus: user.developerProfile.verificationStatus,
          isIndieEligible: user.developerProfile.isIndieEligible,
          createdAt: user.developerProfile.createdAt,
        } : null,
      },
      
      linkedAccounts: user.accounts.map(a => ({
        provider: a.provider,
        type: a.type,
      })),
      
      gameActivity: {
        ratings: user.ratings.map(r => ({
          game: r.game.title,
          stars: r.stars,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
        favorites: user.favorites.map(f => ({
          game: f.game.title,
          addedAt: f.createdAt,
        })),
        purchases: user.purchases.map(p => ({
          game: p.game.title,
          pricePaid: p.pricePaid,
          purchasedAt: p.createdAt,
        })),
      },
      
      betaTesting: user.betaTester.map(bt => ({
        game: bt.game.title,
        bugsReported: bt.bugsReported,
        tasksCompleted: bt.tasksCompleted,
        timeSpent: bt.timeSpent,
        joinedAt: bt.createdAt,
        feedback: bt.feedback.map(f => ({
          type: f.type,
          title: f.title,
          description: f.description,
          createdAt: f.createdAt,
        })),
        completedTasks: bt.completedTasks.map(tc => ({
          task: tc.task.title,
          report: tc.report,
          submittedAt: tc.submittedAt,
        })),
      })),
      
      communityActivity: {
        threads: user.threads,
        posts: user.posts,
        devlogs: user.devlogs,
        devlogComments: user.devlogComments,
      },
      
      rewardHistory: user.rewards,
      notifications: user.notifications,
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="shader-house-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

