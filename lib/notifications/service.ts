import { prisma } from '@/lib/db/prisma';
import { sendEmail as sendEmailService } from '@/lib/email/service';
import { NotificationType } from '@prisma/client';

export interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean; // Override user preference for critical notifications
}

/**
 * Create a notification for a user
 * Automatically sends email if user has email notifications enabled
 */
export async function createNotification(options: CreateNotificationOptions) {
  const { userId, type, title, message, link, metadata, sendEmail: forceEmail } = options;

  // Get user preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      emailNotifications: true,
      inAppNotifications: true,
      notifyBetaAccess: true,
      notifyFeedbackResponse: true,
      notifyGameUpdates: true,
      notifyAchievements: true,
      notifySubscription: true,
      notifyDevlogs: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user wants this type of notification
  // Default to true if preference is null/undefined (for existing users without preferences set)
  const inAppNotifications = user.inAppNotifications ?? true;
  const emailNotifications = user.emailNotifications ?? true;
  
  let shouldNotify = inAppNotifications;
  let shouldEmail = forceEmail || false;

  switch (type) {
    case 'BETA_ACCESS_GRANTED':
      const notifyBeta = user.notifyBetaAccess ?? true;
      shouldNotify = shouldNotify && notifyBeta;
      shouldEmail = (forceEmail || emailNotifications) && notifyBeta;
      break;
    case 'FEEDBACK_RESPONSE':
      const notifyFeedback = user.notifyFeedbackResponse ?? true;
      shouldNotify = shouldNotify && notifyFeedback;
      shouldEmail = (forceEmail || emailNotifications) && notifyFeedback;
      break;
    case 'GAME_UPDATE':
      const notifyGame = user.notifyGameUpdates ?? true;
      shouldNotify = shouldNotify && notifyGame;
      shouldEmail = (forceEmail || emailNotifications) && notifyGame;
      break;
    case 'ACHIEVEMENT_UNLOCKED':
      const notifyAchievement = user.notifyAchievements ?? true;
      shouldNotify = shouldNotify && notifyAchievement;
      shouldEmail = (forceEmail || emailNotifications) && notifyAchievement;
      break;
    case 'SUBSCRIPTION_CHANGED':
    case 'SUBSCRIPTION_RENEWED':
    case 'SUBSCRIPTION_CANCELED':
      const notifySub = user.notifySubscription ?? true;
      shouldNotify = shouldNotify && notifySub;
      shouldEmail = (forceEmail || emailNotifications) && notifySub;
      break;
    case 'WISHLIST_SALE':
      // Check wishlist sale preference (need to add to user select)
      shouldNotify = inAppNotifications;
      shouldEmail = forceEmail || emailNotifications;
      break;
    case 'NEW_DEVLOG':
    case 'DEVLOG_COMMENT':
    case 'DEVLOG_COMMENT_REPLY':
    case 'DEVLOG_LIKE':
      const notifyDevlogs = user.notifyDevlogs ?? true;
      shouldNotify = shouldNotify && notifyDevlogs;
      shouldEmail = (forceEmail || emailNotifications) && notifyDevlogs;
      break;
    default:
      // SYSTEM notifications always show
      break;
  }

  // Create in-app notification
  if (shouldNotify) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          link: link || null,
          metadata: metadata || {},
        },
      });
      console.log(`✅ Notification created: ${type} for user ${userId} (${user.email})`, notification.id);
    } catch (error) {
      console.error(`❌ Error creating notification: ${type} for user ${userId}`, error);
      throw error; // Re-throw to be caught by caller
    }
  } else {
    console.log(`⏭️  Notification skipped: ${type} for user ${userId} (preferences disabled)`, {
      inAppNotifications,
      emailNotifications,
      notifyBetaAccess: user.notifyBetaAccess,
      notifyFeedbackResponse: user.notifyFeedbackResponse,
      notifyGameUpdates: user.notifyGameUpdates,
      notifyAchievements: user.notifyAchievements,
      notifySubscription: user.notifySubscription,
    });
  }

  // Send email notification
  if (shouldEmail) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const notificationUrl = link ? `${appUrl}${link}` : `${appUrl}/profile/gamer`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
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
              font-size: 24px;
              margin: 0 0 10px 0;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background-color: #48bb78;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              text-align: center;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #38a169;
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
              <h1>🏠 Shader House</h1>
            </div>
            
            <div class="content">
              <h2 style="color: #2d3748; margin-top: 0;">${title}</h2>
              <p>${message.replace(/\n/g, '<br>')}</p>
              
              ${link ? `
                <div style="text-align: center;">
                  <a href="${notificationUrl}" class="button">View Details</a>
                </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Shader House. All rights reserved.</p>
              <p>You can manage your notification preferences in your <a href="${appUrl}/profile/gamer/settings">settings</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmailService({
      to: user.email,
      subject: `Shader House: ${title}`,
      html: emailHtml,
      text: `${title}\n\n${message}${link ? `\n\nView: ${notificationUrl}` : ''}`,
    });
  }

  const result = { success: true, notified: shouldNotify, emailed: shouldEmail };
  console.log(`📬 Notification service result for ${type}:`, result);
  return result;
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

