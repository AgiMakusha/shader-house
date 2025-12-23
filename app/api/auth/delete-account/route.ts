import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, destroySession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';
import { sendEmail } from '@/lib/email/service';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to confirm account deletion"),
  confirmation: z.literal("DELETE MY ACCOUNT", {
    errorMap: () => ({ message: 'Please type "DELETE MY ACCOUNT" exactly to confirm' }),
  }),
  reason: z.string().optional(),
});

// Rate limit: 3 attempts per hour (strict to prevent abuse)
const DELETE_RATE_LIMIT = { maxRequests: 3, windowMs: 60 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getSessionFromRequest(req);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete your account' },
        { status: 401 }
      );
    }

    // Get client info for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent');
    
    // Check rate limit
    const clientId = getClientIdentifier(clientIP, userAgent, session.user.email);
    const rateLimit = checkRateLimit(`delete-account:${clientId}`, DELETE_RATE_LIMIT);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many deletion attempts. Please try again later.',
          retryAfter: new Date(rateLimit.resetAt).toISOString()
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validation = deleteAccountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { password, reason } = validation.data;

    // Get user from database with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        // Include related data counts for logging
        _count: {
          select: {
            games: true,
            ratings: true,
            favorites: true,
            purchases: true,
            threads: true,
            posts: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For users with passwords, verify the password
    if (user.password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Incorrect password. Please enter your current password to confirm deletion.' },
          { status: 401 }
        );
      }
    }

    // Check for active subscriptions that need cancellation
    if (user.stripeSubscriptionId && user.subscriptionStatus === 'ACTIVE') {
      // Note: In production, you would cancel the Stripe subscription here
      // For now, we'll just warn about it
      console.log(`Warning: User ${user.id} has active subscription ${user.stripeSubscriptionId}`);
      // TODO: Cancel Stripe subscription before deletion
      // await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    }

    // Log deletion for audit purposes (GDPR requires keeping some records)
    const deletionLog = {
      userId: user.id,
      email: user.email,
      deletedAt: new Date().toISOString(),
      reason: reason || 'Not provided',
      role: user.role,
      dataDeleted: user._count,
      ipAddress: clientIP,
    };
    
    console.log('Account deletion initiated:', JSON.stringify(deletionLog, null, 2));

    // Perform GDPR-compliant deletion
    // The cascade delete in Prisma schema will handle related records
    await prisma.$transaction(async (tx) => {
      // Delete user - cascade deletes will handle:
      // - Account (OAuth connections)
      // - VerificationTokens
      // - DeveloperProfile
      // - Games (and their related data)
      // - Ratings
      // - Favorites
      // - Purchases
      // - GameAccess
      // - Subscriptions
      // - DeveloperSupport
      // - PlaytimeEntry
      // - ClaimedGame
      // - BetaTester (and related)
      // - DiscussionThreads
      // - DiscussionPosts
      // - DiscussionVotes
      // - RewardHistory
      // - Notifications
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    // Destroy the session
    await destroySession();

    // Send confirmation email (if email service is configured)
    try {
      await sendAccountDeletionConfirmationEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send deletion confirmation email:', emailError);
      // Don't fail the deletion if email fails
    }

    console.log(`Account ${user.id} (${user.email}) successfully deleted`);

    return NextResponse.json({
      success: true,
      message: 'Your account has been permanently deleted. We\'re sorry to see you go.',
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting your account. Please try again or contact support.' },
      { status: 500 }
    );
  }
}

// GET endpoint to get account data export (GDPR data portability)
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to export your data' },
        { status: 401 }
      );
    }

    // Get all user data for export
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        developerProfile: true,
        accounts: {
          select: {
            provider: true,
            createdAt: true,
          },
        },
        games: {
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        ratings: {
          select: {
            stars: true,
            comment: true,
            createdAt: true,
            game: {
              select: {
                title: true,
              },
            },
          },
        },
        favorites: {
          select: {
            createdAt: true,
            game: {
              select: {
                title: true,
              },
            },
          },
        },
        purchases: {
          select: {
            pricePaid: true,
            createdAt: true,
            game: {
              select: {
                title: true,
              },
            },
          },
        },
        threads: {
          select: {
            title: true,
            content: true,
            category: true,
            createdAt: true,
          },
        },
        posts: {
          select: {
            content: true,
            createdAt: true,
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
        subscriptions: {
          select: {
            tier: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive fields
    const { password, ...safeUser } = user as any;

    // Format the data for export
    const exportData = {
      exportDate: new Date().toISOString(),
      exportType: 'GDPR Data Export',
      userData: {
        profile: {
          id: safeUser.id,
          email: safeUser.email,
          name: safeUser.name,
          displayName: safeUser.displayName,
          bio: safeUser.bio,
          role: safeUser.role,
          createdAt: safeUser.createdAt,
          updatedAt: safeUser.updatedAt,
        },
        subscription: {
          tier: safeUser.subscriptionTier,
          status: safeUser.subscriptionStatus,
          history: safeUser.subscriptions,
        },
        gamification: {
          xp: safeUser.xp,
          level: safeUser.level,
          points: safeUser.points,
          badges: safeUser.badges,
        },
        preferences: {
          wantsNewsletter: safeUser.wantsNewsletter,
          wantsDigestNewsletter: safeUser.wantsDigestNewsletter,
          showOnlineStatus: safeUser.showOnlineStatus,
          emailNotifications: safeUser.emailNotifications,
          inAppNotifications: safeUser.inAppNotifications,
        },
        connectedAccounts: safeUser.accounts,
        developerProfile: safeUser.developerProfile,
        games: safeUser.games,
        ratings: safeUser.ratings,
        favorites: safeUser.favorites,
        purchases: safeUser.purchases,
        communityPosts: {
          threads: safeUser.threads,
          posts: safeUser.posts,
        },
        rewardHistory: safeUser.rewards,
      },
    };

    // Return as JSON (could also return as downloadable file)
    return NextResponse.json({
      success: true,
      data: exportData,
    });

  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'An error occurred while exporting your data' },
      { status: 500 }
    );
  }
}

// Helper function to send deletion confirmation email
async function sendAccountDeletionConfirmationEmail(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deleted</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2d3748;
            font-size: 28px;
            margin: 0 0 10px 0;
          }
          .content {
            margin-bottom: 30px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Deleted</h1>
          </div>
          
          <div class="content">
            <p>Hi ${name},</p>
            <p>This email confirms that your Shader House account has been permanently deleted as requested.</p>
            
            <p>What was deleted:</p>
            <ul>
              <li>Your profile and personal information</li>
              <li>Your games and game files (if you were a developer)</li>
              <li>Your reviews, ratings, and favorites</li>
              <li>Your community posts and discussions</li>
              <li>Your subscription and payment history</li>
              <li>All other account-related data</li>
            </ul>
            
            <p>This action cannot be undone. If you ever want to return to Shader House, you'll need to create a new account.</p>
            
            <p>We're sorry to see you go. If you have any feedback about your experience, we'd love to hear from you.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Shader House. All rights reserved.</p>
            <p>This is an automated email confirming your account deletion request.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hi ${name},

This email confirms that your Shader House account has been permanently deleted as requested.

What was deleted:
- Your profile and personal information
- Your games and game files (if you were a developer)
- Your reviews, ratings, and favorites
- Your community posts and discussions
- Your subscription and payment history
- All other account-related data

This action cannot be undone. If you ever want to return to Shader House, you'll need to create a new account.

We're sorry to see you go.

© ${new Date().getFullYear()} Shader House
  `;

  return sendEmail({
    to: email,
    subject: 'Your Shader House account has been deleted',
    html,
    text,
  });
}

