/**
 * Notification triggers for various events
 * Import and use these functions when events occur
 */

import { createNotification } from './service';
import { NotificationType } from '@prisma/client';

/**
 * Trigger notification when user is granted beta access
 */
export async function notifyBetaAccessGranted(userId: string, gameId: string, gameTitle: string) {
  return createNotification({
    userId,
    type: NotificationType.BETA_ACCESS_GRANTED,
    title: 'Beta Access Granted!',
    message: `You've been granted access to beta test "${gameTitle}". Start testing and provide feedback to help shape the game!`,
    link: `/profile/gamer/beta/${gameId}`,
    metadata: { gameId, gameTitle },
  });
}

/**
 * Trigger notification when developer responds to feedback
 */
export async function notifyFeedbackResponse(
  userId: string,
  gameId: string,
  gameTitle: string,
  feedbackId: string
) {
  return createNotification({
    userId,
    type: NotificationType.FEEDBACK_RESPONSE,
    title: 'Developer Responded to Your Feedback',
    message: `The developer of "${gameTitle}" has responded to your feedback. Check out their response!`,
    link: `/profile/gamer/beta/${gameId}?feedback=${feedbackId}`,
    metadata: { gameId, gameTitle, feedbackId },
  });
}

/**
 * Trigger notification when a game is updated
 */
export async function notifyGameUpdate(
  userId: string,
  gameId: string,
  gameTitle: string,
  changelog?: string,
  gameSlug?: string
) {
  // Use slug if provided, otherwise use gameId
  const link = gameSlug ? `/games/${gameSlug}` : `/games/${gameId}`;
  
  return createNotification({
    userId,
    type: NotificationType.GAME_UPDATE,
    title: `"${gameTitle}" Has Been Updated!`,
    message: changelog || `A new update is available for "${gameTitle}". Check out what's new!`,
    link,
    metadata: { gameId, gameTitle, changelog, gameSlug },
  });
}

/**
 * Trigger notification when achievement is unlocked
 */
export async function notifyAchievementUnlocked(
  userId: string,
  achievementId: string,
  achievementName: string,
  achievementDescription?: string
) {
  return createNotification({
    userId,
    type: NotificationType.ACHIEVEMENT_UNLOCKED,
    title: `Achievement Unlocked: ${achievementName}`,
    message: achievementDescription || `Congratulations! You've unlocked the "${achievementName}" achievement!`,
    link: `/profile/gamer/achievements`,
    metadata: { achievementId, achievementName },
  });
}

/**
 * Trigger notification when subscription changes
 */
export async function notifySubscriptionChanged(
  userId: string,
  type: 'CHANGED' | 'RENEWED' | 'CANCELED',
  tier: string
) {
  const messages = {
    CHANGED: `Your subscription has been updated to ${tier}.`,
    RENEWED: `Your ${tier} subscription has been renewed successfully.`,
    CANCELED: `Your ${tier} subscription has been canceled.`,
  };

  const notificationType: NotificationType =
    type === 'RENEWED'
      ? NotificationType.SUBSCRIPTION_RENEWED
      : type === 'CANCELED'
      ? NotificationType.SUBSCRIPTION_CANCELED
      : NotificationType.SUBSCRIPTION_CHANGED;

  return createNotification({
    userId,
    type: notificationType,
    title: `Subscription ${type === 'CANCELED' ? 'Canceled' : type === 'RENEWED' ? 'Renewed' : 'Updated'}`,
    message: messages[type],
    link: `/profile/gamer/subscription`,
    metadata: { type, tier },
  });
}

/**
 * Trigger notification when a new beta game is published
 * Notifies all Pro subscribers (gamers with Creator Support Pass)
 */
export async function notifyBetaGamePublished(
  userId: string,
  gameId: string,
  gameTitle: string,
  gameSlug?: string
) {
  const link = gameSlug ? `/games/${gameSlug}` : `/games/${gameId}`;
  
  return createNotification({
    userId,
    type: NotificationType.BETA_ACCESS_GRANTED, // Using BETA_ACCESS_GRANTED type for beta game notifications
    title: 'New Beta Game Available!',
    message: `A new beta game "${gameTitle}" is now available for testing! Join the beta and help shape the game.`,
    link,
    metadata: { gameId, gameTitle, gameSlug },
  });
}

/**
 * Trigger notification when a new beta task is created
 * Notifies all beta testers of the game
 */
export async function notifyBetaTaskCreated(
  userId: string,
  gameId: string,
  gameTitle: string,
  taskTitle: string,
  taskId: string
) {
  return createNotification({
    userId,
    type: NotificationType.BETA_ACCESS_GRANTED, // Using BETA_ACCESS_GRANTED since it's beta-related and uses notifyBetaAccess preference
    title: `New Task: ${taskTitle}`,
    message: `A new task has been added to "${gameTitle}" beta test. Complete it to earn rewards!`,
    link: `/profile/gamer/beta/${gameId}?task=${taskId}`,
    metadata: { gameId, gameTitle, taskId, taskTitle },
  });
}

// ============================================
// DEVELOPER NOTIFICATIONS (MVP)
// ============================================

/**
 * Trigger notification when a new beta tester joins the developer's game
 */
export async function notifyNewBetaTester(
  developerId: string,
  gameId: string,
  gameTitle: string,
  testerName: string,
  gameSlug?: string
) {
  // Link to the main beta management page where developer can see all testers
  return createNotification({
    userId: developerId,
    type: NotificationType.NEW_BETA_TESTER,
    title: 'New Beta Tester Joined',
    message: `${testerName} has joined the beta test for "${gameTitle}". Welcome them to your testing community!`,
    link: '/profile/developer/beta',
    metadata: { gameId, gameTitle, testerName, gameSlug },
  });
}

/**
 * Trigger notification when a beta tester submits feedback
 */
export async function notifyNewFeedback(
  developerId: string,
  gameId: string,
  gameTitle: string,
  feedbackType: 'BUG' | 'SUGGESTION' | 'GENERAL',
  feedbackTitle: string,
  testerName: string,
  gameSlug?: string
) {
  const typeLabels = {
    BUG: 'Bug Report',
    SUGGESTION: 'Suggestion',
    GENERAL: 'Feedback',
  };
  
  // Link to the game's feedback page where developer can review all feedback
  return createNotification({
    userId: developerId,
    type: NotificationType.NEW_FEEDBACK,
    title: `New ${typeLabels[feedbackType]}: ${feedbackTitle}`,
    message: `${testerName} submitted ${feedbackType === 'BUG' ? 'a bug report' : 'feedback'} for "${gameTitle}". Review and respond to help improve your game!`,
    link: `/profile/developer/beta/${gameId}/feedback`,
    metadata: { gameId, gameTitle, feedbackType, feedbackTitle, testerName, gameSlug },
  });
}

/**
 * Trigger notification when someone reviews the developer's game
 */
export async function notifyNewReview(
  developerId: string,
  gameId: string,
  gameTitle: string,
  stars: number,
  reviewerName: string,
  comment?: string,
  gameSlug?: string
) {
  const link = gameSlug ? `/games/${gameSlug}` : `/games/${gameId}`;
  
  // Create a star display (e.g., "★★★★☆")
  const starDisplay = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  
  return createNotification({
    userId: developerId,
    type: NotificationType.NEW_REVIEW,
    title: `New ${stars}-Star Review`,
    message: comment 
      ? `${reviewerName} reviewed "${gameTitle}" (${starDisplay}): "${comment.substring(0, 100)}${comment.length > 100 ? '...' : ''}"`
      : `${reviewerName} gave "${gameTitle}" a ${stars}-star rating (${starDisplay}). Check it out!`,
    link,
    metadata: { gameId, gameTitle, stars, reviewerName, comment, gameSlug },
  });
}

/**
 * Trigger notification when a game is published/promoted to release
 */
export async function notifyGamePublished(
  developerId: string,
  gameId: string,
  gameTitle: string,
  gameSlug?: string
) {
  const link = gameSlug ? `/games/${gameSlug}` : `/games/${gameId}`;
  
  return createNotification({
    userId: developerId,
    type: NotificationType.GAME_PUBLISHED,
    title: 'Game Published Successfully',
    message: `Congratulations! "${gameTitle}" has been promoted to full release and is now available to all players!`,
    link,
    metadata: { gameId, gameTitle, gameSlug },
  });
}

/**
 * Trigger notification when a gamer creates a bug report or suggestion thread
 * in the game's community section
 */
export async function notifyNewCommunityThread(
  developerId: string,
  gameId: string,
  gameTitle: string,
  threadCategory: 'BUG_REPORT' | 'SUGGESTION',
  threadTitle: string,
  authorName: string,
  gameSlug?: string
) {
  const categoryLabel = threadCategory === 'BUG_REPORT' ? 'Bug Report' : 'Suggestion';
  const link = gameSlug 
    ? `/games/${gameSlug}/community` 
    : `/games/${gameId}/community`;
  
  return createNotification({
    userId: developerId,
    type: NotificationType.NEW_COMMUNITY_THREAD,
    title: `New ${categoryLabel} in Community`,
    message: `${authorName} posted a ${categoryLabel.toLowerCase()} for "${gameTitle}": "${threadTitle}"`,
    link,
    metadata: { gameId, gameTitle, threadCategory, threadTitle, authorName, gameSlug },
  });
}

// ============================================
// WISHLIST NOTIFICATIONS
// ============================================

/**
 * Trigger notification when a wishlisted game goes on sale
 */
export async function notifyWishlistSale(
  userId: string,
  gameId: string,
  gameTitle: string,
  oldPriceCents: number,
  newPriceCents: number,
  discountPercent: number,
  gameSlug?: string
) {
  const link = gameSlug ? `/games/${gameSlug}` : `/games/${gameId}`;
  
  // Format prices for display
  const oldPrice = oldPriceCents === 0 ? 'Free' : `$${(oldPriceCents / 100).toFixed(2)}`;
  const newPrice = newPriceCents === 0 ? 'Free' : `$${(newPriceCents / 100).toFixed(2)}`;
  
  return createNotification({
    userId,
    type: NotificationType.WISHLIST_SALE,
    title: `${gameTitle} is on sale!`,
    message: `A game on your wishlist is now ${discountPercent}% off! "${gameTitle}" dropped from ${oldPrice} to ${newPrice}. Don't miss this deal!`,
    link,
    metadata: { gameId, gameTitle, oldPriceCents, newPriceCents, discountPercent, gameSlug },
  });
}

