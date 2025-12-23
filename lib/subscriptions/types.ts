export type SubscriptionTier = 'FREE' | 'CREATOR_SUPPORT' | 'GAMER_PRO';

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
    description: 'Full platform access for indie game lovers',
    features: [
      'Buy games individually',
      'Access to community & reviews',
      'Free demos & limited F2P games',
      'Cloud saves for purchased games',
      'User profiles & wishlists',
      'Shader House digest newsletter',
      'Access to all beta builds',
      'Game test access',
      'Support developers directly',
      'Exclusive in-game cosmetics',
      'Voting power on updates & features',
      'Direct dev community access',
      'Achievements & badges',
    ],
  },
  // COMMENTED OUT - Creator Support Pass (may be used in future)
  // {
  //   id: 'CREATOR_SUPPORT',
  //   name: 'Creator Support Pass',
  //   price: 14.99,
  //   currency: 'USD',
  //   interval: 'month',
  //   description: 'Support indie developers and game community',
  //   features: [
  //     'Free Access subscription',
  //     'Unlimited access to the entire game library',
  //     'Support developers directly',
  //     'Access to all beta builds from supported devs',
  //     'Exclusive in-game cosmetics',
  //     'Game test access',
  //     'Voting power on updates & features',
  //     'Direct dev community access',
  //     'Achievements & badges',
  //   ],
  //   highlighted: true,
  // },
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
    GAMER_PRO: 1, // Same level as CREATOR_SUPPORT
  };

  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

// Feature access mapping
// NOTE: Most features now available to FREE tier. Creator Support Pass commented out but logic preserved.
const FEATURE_ACCESS: Record<FeatureFlag, SubscriptionTier[]> = {
  // Free Access Features (available to all)
  [FeatureFlag.BUY_GAMES]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  [FeatureFlag.COMMUNITY_REVIEWS]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  [FeatureFlag.FREE_DEMOS]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  [FeatureFlag.CLOUD_SAVES]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  [FeatureFlag.USER_PROFILES]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  [FeatureFlag.NEWSLETTER]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  
  // MOVED TO FREE: Beta Access, Testing, Achievements, Community Features
  [FeatureFlag.BETA_ACCESS]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  [FeatureFlag.GAME_TEST_ACCESS]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  [FeatureFlag.ACHIEVEMENTS]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  [FeatureFlag.SUPPORT_DEVELOPERS]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  [FeatureFlag.EXCLUSIVE_COSMETICS]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  [FeatureFlag.VOTING_POWER]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  [FeatureFlag.DEV_COMMUNITY]: ['FREE', 'CREATOR_SUPPORT', 'GAMER_PRO'],
  
  // Pro Features (Creator Support Pass & Gamer Pro) - Only unlimited library access
  [FeatureFlag.UNLIMITED_LIBRARY]: ['CREATOR_SUPPORT', 'GAMER_PRO'],
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

