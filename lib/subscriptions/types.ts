export type SubscriptionTier = 'FREE' | 'CREATOR_SUPPORT';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  interval: 'month';
  description: string;
  features: string[];
  highlighted?: boolean;
  stripePriceId?: string;
}

// Feature flags for each tier
export enum FeatureFlag {
  // Free Access Features
  BUY_GAMES = 'BUY_GAMES',
  COMMUNITY_REVIEWS = 'COMMUNITY_REVIEWS',
  FREE_DEMOS = 'FREE_DEMOS',
  CLOUD_SAVES = 'CLOUD_SAVES',
  USER_PROFILES = 'USER_PROFILES',
  NEWSLETTER = 'NEWSLETTER',
  
  // Creator Support Pass Features
  UNLIMITED_LIBRARY = 'UNLIMITED_LIBRARY',
  SUPPORT_DEVELOPERS = 'SUPPORT_DEVELOPERS',
  BETA_ACCESS = 'BETA_ACCESS',
  EXCLUSIVE_COSMETICS = 'EXCLUSIVE_COSMETICS',
  GAME_TEST_ACCESS = 'GAME_TEST_ACCESS',
  VOTING_POWER = 'VOTING_POWER',
  DEV_COMMUNITY = 'DEV_COMMUNITY',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'FREE',
    name: 'Free Access',
    price: 0,
    currency: 'USD',
    interval: 'month',
    description: 'Perfect for casual gamers',
    features: [
      'Buy games individually',
      'Access to community & reviews',
      'Free demos & limited F2P games',
      'Cloud saves for purchased games',
      'User profiles & wishlists',
      'Shader House digest newsletter',
    ],
  },
  {
    id: 'CREATOR_SUPPORT',
    name: 'Creator Support Pass',
    price: 14.99,
    currency: 'USD',
    interval: 'month',
    description: 'Support indie developers and game community',
    features: [
      'Free Access subscription',
      'Unlimited access to the entire game library',
      'Support developers directly',
      'Access to all beta builds from supported devs',
      'Exclusive in-game cosmetics',
      'Game test access',
      'Voting power on updates & features',
      'Direct dev community access',
      'Achievements & badges',
    ],
    highlighted: true,
  },
];

export function getSubscriptionPlan(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === tier) || SUBSCRIPTION_PLANS[0];
}

export function canAccessFeature(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  const tierHierarchy: Record<SubscriptionTier, number> = {
    FREE: 0,
    CREATOR_SUPPORT: 1,
  };

  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

// Feature access mapping
const FEATURE_ACCESS: Record<FeatureFlag, SubscriptionTier[]> = {
  // Free Access Features (available to all)
  [FeatureFlag.BUY_GAMES]: ['FREE', 'CREATOR_SUPPORT'],
  [FeatureFlag.COMMUNITY_REVIEWS]: ['FREE', 'CREATOR_SUPPORT'],
  [FeatureFlag.FREE_DEMOS]: ['FREE', 'CREATOR_SUPPORT'],
  [FeatureFlag.CLOUD_SAVES]: ['FREE', 'CREATOR_SUPPORT'],
  [FeatureFlag.USER_PROFILES]: ['FREE', 'CREATOR_SUPPORT'],
  [FeatureFlag.NEWSLETTER]: ['FREE', 'CREATOR_SUPPORT'],
  
  // Creator Support Pass Exclusive Features
  [FeatureFlag.UNLIMITED_LIBRARY]: ['CREATOR_SUPPORT'],
  [FeatureFlag.SUPPORT_DEVELOPERS]: ['CREATOR_SUPPORT'],
  [FeatureFlag.BETA_ACCESS]: ['CREATOR_SUPPORT'],
  [FeatureFlag.EXCLUSIVE_COSMETICS]: ['CREATOR_SUPPORT'],
  [FeatureFlag.GAME_TEST_ACCESS]: ['CREATOR_SUPPORT'],
  [FeatureFlag.VOTING_POWER]: ['CREATOR_SUPPORT'],
  [FeatureFlag.DEV_COMMUNITY]: ['CREATOR_SUPPORT'],
  [FeatureFlag.ACHIEVEMENTS]: ['CREATOR_SUPPORT'],
};

export function hasFeatureAccess(
  userTier: SubscriptionTier | undefined | null,
  feature: FeatureFlag
): boolean {
  if (!userTier) return false;
  return FEATURE_ACCESS[feature].includes(userTier);
}

export function getFeatureDescription(feature: FeatureFlag): string {
  const descriptions: Record<FeatureFlag, string> = {
    [FeatureFlag.BUY_GAMES]: 'Purchase games individually at your own pace',
    [FeatureFlag.COMMUNITY_REVIEWS]: 'Read and write game reviews, join discussions',
    [FeatureFlag.FREE_DEMOS]: 'Access free demos and F2P games',
    [FeatureFlag.CLOUD_SAVES]: 'Your progress is saved in the cloud for purchased games',
    [FeatureFlag.USER_PROFILES]: 'Create your profile and manage wishlists',
    [FeatureFlag.NEWSLETTER]: 'Get the latest indie game news and updates',
    [FeatureFlag.UNLIMITED_LIBRARY]: 'Play any game in our library without buying',
    [FeatureFlag.SUPPORT_DEVELOPERS]: 'Directly support your favorite indie devs',
    [FeatureFlag.BETA_ACCESS]: 'Early access to beta builds from developers you support',
    [FeatureFlag.EXCLUSIVE_COSMETICS]: 'Unique cosmetics and items in supported games',
    [FeatureFlag.GAME_TEST_ACCESS]: 'Help test games before they launch',
    [FeatureFlag.VOTING_POWER]: 'Vote on game features and updates',
    [FeatureFlag.DEV_COMMUNITY]: 'Exclusive Discord channels with developers',
    [FeatureFlag.ACHIEVEMENTS]: 'Unlock achievements and earn special badges',
  };
  return descriptions[feature];
}

