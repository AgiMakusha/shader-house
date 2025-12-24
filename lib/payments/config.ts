/**
 * Shader House Payment Configuration
 * 
 * Revenue split model for the indie game marketplace.
 * All monetary values are in cents unless otherwise specified.
 */

// ===========================================
// PLATFORM FEES (as percentages)
// ===========================================

/**
 * Platform commission on direct game sales
 * Developer receives: 85%
 * Platform receives: 15%
 */
export const GAME_SALE_PLATFORM_FEE_PERCENT = 15;
export const GAME_SALE_DEVELOPER_PERCENT = 100 - GAME_SALE_PLATFORM_FEE_PERCENT; // 85%

/**
 * Platform commission on tips and donations
 * Developer receives: 85%
 * Platform receives: 15%
 */
export const DONATION_PLATFORM_FEE_PERCENT = 15;
export const DONATION_DEVELOPER_PERCENT = 100 - DONATION_PLATFORM_FEE_PERCENT; // 85%

/**
 * Platform commission on Creator Support subscription revenue
 * Split among supported developers after platform fee
 */
export const CREATOR_SUPPORT_PLATFORM_FEE_PERCENT = 15;

/**
 * Platform commission on Gamer Pro playtime revenue pool
 */
export const PRO_PLAYTIME_PLATFORM_FEE_PERCENT = 15;

// ===========================================
// FIXED FEES (in cents)
// ===========================================

/**
 * One-time fee for publishing a game on the platform
 * $50.00 USD
 */
export const GAME_PUBLISHING_FEE_CENTS = 5000; // $50.00

/**
 * Minimum payout threshold for developers
 * $25.00 USD - developers must earn at least this before requesting payout
 */
export const MINIMUM_PAYOUT_THRESHOLD_CENTS = 2500; // $25.00

// ===========================================
// SUBSCRIPTION PRICES (in cents)
// ===========================================

/**
 * Creator Support Pass monthly price
 */
export const CREATOR_SUPPORT_PRICE_CENTS = 1499; // $14.99/month

/**
 * Gamer Pro Pass monthly price (future)
 */
export const GAMER_PRO_PRICE_CENTS = 1200; // $12.00/month

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Calculate platform fee for a game sale
 * @param priceCents - Sale price in cents
 * @returns Object with platformFee, developerAmount, and breakdown
 */
export function calculateGameSaleSplit(priceCents: number) {
  const platformFee = Math.round(priceCents * (GAME_SALE_PLATFORM_FEE_PERCENT / 100));
  const developerAmount = priceCents - platformFee;

  return {
    totalPrice: priceCents,
    platformFee,
    developerAmount,
    platformPercent: GAME_SALE_PLATFORM_FEE_PERCENT,
    developerPercent: GAME_SALE_DEVELOPER_PERCENT,
  };
}

/**
 * Calculate platform fee for a donation/tip
 * @param amountCents - Donation amount in cents
 * @returns Object with platformFee, developerAmount, and breakdown
 */
export function calculateDonationSplit(amountCents: number) {
  const platformFee = Math.round(amountCents * (DONATION_PLATFORM_FEE_PERCENT / 100));
  const developerAmount = amountCents - platformFee;

  return {
    totalAmount: amountCents,
    platformFee,
    developerAmount,
    platformPercent: DONATION_PLATFORM_FEE_PERCENT,
    developerPercent: DONATION_DEVELOPER_PERCENT,
  };
}

/**
 * Calculate Creator Support subscription split
 * @param subscriptionCents - Monthly subscription price
 * @param supportedDeveloperCount - Number of developers being supported
 * @returns Object with platform fee and per-developer amount
 */
export function calculateCreatorSupportSplit(
  subscriptionCents: number = CREATOR_SUPPORT_PRICE_CENTS,
  supportedDeveloperCount: number
) {
  if (supportedDeveloperCount <= 0) {
    return {
      totalAmount: subscriptionCents,
      platformFee: subscriptionCents,
      perDeveloperAmount: 0,
      developerCount: 0,
    };
  }

  const platformFee = Math.round(subscriptionCents * (CREATOR_SUPPORT_PLATFORM_FEE_PERCENT / 100));
  const developerPool = subscriptionCents - platformFee;
  const perDeveloperAmount = Math.floor(developerPool / supportedDeveloperCount);

  return {
    totalAmount: subscriptionCents,
    platformFee,
    developerPool,
    perDeveloperAmount,
    developerCount: supportedDeveloperCount,
  };
}

/**
 * Format cents as USD currency string
 * @param cents - Amount in cents
 * @returns Formatted string like "$9.99"
 */
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Convert dollars to cents
 * @param dollars - Amount in dollars
 * @returns Amount in cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars
 * @param cents - Amount in cents
 * @returns Amount in dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

// ===========================================
// TYPE DEFINITIONS
// ===========================================

export interface PaymentSplit {
  totalAmount: number;
  platformFee: number;
  developerAmount: number;
  platformPercent: number;
  developerPercent: number;
}

export interface RevenueBreakdown {
  directSales: number;
  creatorSupport: number;
  proPlaytime: number;
  tips: number;
  total: number;
}

export type PaymentType = 'GAME_SALE' | 'DONATION' | 'CREATOR_SUPPORT' | 'PRO_PLAYTIME';



