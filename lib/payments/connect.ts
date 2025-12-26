/**
 * Stripe Connect Functions
 * 
 * Handles developer account creation and onboarding for receiving payments.
 * Uses Stripe Express accounts for simplified onboarding.
 */

import { stripe, isStripeConfigured, getBaseUrl } from './stripe';
import { prisma } from '@/lib/db/prisma';

export interface ConnectAccountResult {
  success: boolean;
  accountId?: string;
  onboardingUrl?: string;
  error?: string;
}

/**
 * Create a Stripe Connect Express account for a developer
 */
export async function createConnectAccount(
  developerId: string,
  email: string
): Promise<ConnectAccountResult> {
  // Demo mode
  if (!isStripeConfigured() || !stripe) {
    // In demo mode, simulate account creation
    const demoAccountId = `acct_demo_${developerId.slice(0, 8)}`;
    
    // Use upsert to create profile if it doesn't exist
    await prisma.developerProfile.upsert({
      where: { userId: developerId },
      create: {
        userId: developerId,
        stripeAccountId: demoAccountId,
        stripeAccountStatus: 'active',
        stripeOnboardedAt: new Date(),
        payoutEnabled: true,
        // Required fields with defaults (for developers who haven't completed verification)
        developerType: 'INDIE',
        teamSize: 1,
        hasPublisher: false,
        ownsIP: true,
        fundingSources: ['SELF'],
        companyType: 'NONE',
        evidenceLinks: [],
        attestIndie: false,
        isIndieEligible: false,
      },
      update: {
        stripeAccountId: demoAccountId,
        stripeAccountStatus: 'active',
        stripeOnboardedAt: new Date(),
        payoutEnabled: true,
      },
    });

    return {
      success: true,
      accountId: demoAccountId,
      onboardingUrl: `${getBaseUrl()}/profile/developer/settings?stripe=demo_success`,
    };
  }

  try {
    // Check if developer already has an account
    const existingProfile = await prisma.developerProfile.findUnique({
      where: { userId: developerId },
      select: { stripeAccountId: true },
    });

    if (existingProfile?.stripeAccountId) {
      // Return existing account
      return {
        success: true,
        accountId: existingProfile.stripeAccountId,
      };
    }

    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      metadata: {
        developerId,
        platform: 'shader_house',
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      settings: {
        payouts: {
          schedule: {
            interval: 'weekly',
            weekly_anchor: 'friday',
          },
        },
      },
    });

    // Save account ID to database (create profile if it doesn't exist)
    await prisma.developerProfile.upsert({
      where: { userId: developerId },
      create: {
        userId: developerId,
        stripeAccountId: account.id,
        stripeAccountStatus: 'pending',
        // Required fields with defaults (for developers who haven't completed verification)
        developerType: 'INDIE',
        teamSize: 1,
        hasPublisher: false,
        ownsIP: true,
        fundingSources: ['SELF'],
        companyType: 'NONE',
        evidenceLinks: [],
        attestIndie: false,
        isIndieEligible: false,
      },
      update: {
        stripeAccountId: account.id,
        stripeAccountStatus: 'pending',
      },
    });

    return {
      success: true,
      accountId: account.id,
    };
  } catch (error: any) {
    console.error('Error creating Connect account:', error);
    return {
      success: false,
      error: error.message || 'Failed to create Stripe account',
    };
  }
}

/**
 * Generate an onboarding link for a developer to complete their Stripe setup
 */
export async function getOnboardingLink(
  developerId: string
): Promise<ConnectAccountResult> {
  // Demo mode
  if (!isStripeConfigured() || !stripe) {
    return {
      success: true,
      onboardingUrl: `${getBaseUrl()}/profile/developer/settings?stripe=demo_success`,
    };
  }

  try {
    // Get developer's Stripe account ID
    const profile = await prisma.developerProfile.findUnique({
      where: { userId: developerId },
      select: { stripeAccountId: true },
    });

    if (!profile?.stripeAccountId) {
      return {
        success: false,
        error: 'No Stripe account found. Please create one first.',
      };
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: profile.stripeAccountId,
      refresh_url: `${getBaseUrl()}/profile/developer/settings?stripe=refresh`,
      return_url: `${getBaseUrl()}/profile/developer/settings?stripe=success`,
      type: 'account_onboarding',
    });

    return {
      success: true,
      onboardingUrl: accountLink.url,
    };
  } catch (error: any) {
    console.error('Error generating onboarding link:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate onboarding link',
    };
  }
}

/**
 * Check the status of a developer's Stripe Connect account
 */
export async function checkAccountStatus(
  developerId: string
): Promise<{
  hasAccount: boolean;
  status: string | null;
  payoutEnabled: boolean;
  requiresOnboarding: boolean;
  dashboardUrl?: string;
}> {
  const profile = await prisma.developerProfile.findUnique({
    where: { userId: developerId },
    select: {
      stripeAccountId: true,
      stripeAccountStatus: true,
      payoutEnabled: true,
    },
  });

  if (!profile?.stripeAccountId) {
    return {
      hasAccount: false,
      status: null,
      payoutEnabled: false,
      requiresOnboarding: true,
    };
  }

  // Demo mode
  if (!isStripeConfigured() || !stripe) {
    return {
      hasAccount: true,
      status: profile.stripeAccountStatus || 'active',
      payoutEnabled: profile.payoutEnabled,
      requiresOnboarding: false,
    };
  }

  try {
    // Fetch actual account status from Stripe
    const account = await stripe.accounts.retrieve(profile.stripeAccountId);

    const status = account.charges_enabled && account.payouts_enabled
      ? 'active'
      : account.requirements?.currently_due?.length
      ? 'restricted'
      : 'pending';

    const payoutEnabled = account.payouts_enabled || false;

    // Update local database (create profile if it doesn't exist)
    await prisma.developerProfile.upsert({
      where: { userId: developerId },
      create: {
        userId: developerId,
        stripeAccountId: profile.stripeAccountId,
        stripeAccountStatus: status,
        payoutEnabled,
        // Required fields with defaults (for developers who haven't completed verification)
        developerType: 'INDIE',
        teamSize: 1,
        hasPublisher: false,
        ownsIP: true,
        fundingSources: ['SELF'],
        companyType: 'NONE',
        evidenceLinks: [],
        attestIndie: false,
        isIndieEligible: false,
        ...(status === 'active' ? { stripeOnboardedAt: new Date() } : {}),
      },
      update: {
        stripeAccountStatus: status,
        payoutEnabled,
        ...(status === 'active' && !profile.payoutEnabled
          ? { stripeOnboardedAt: new Date() }
          : {}),
      },
    });

    // Generate login link for Stripe Express Dashboard
    let dashboardUrl: string | undefined;
    if (account.charges_enabled) {
      const loginLink = await stripe.accounts.createLoginLink(profile.stripeAccountId);
      dashboardUrl = loginLink.url;
    }

    return {
      hasAccount: true,
      status,
      payoutEnabled,
      requiresOnboarding: !account.details_submitted,
      dashboardUrl,
    };
  } catch (error: any) {
    console.error('Error checking account status:', error);
    return {
      hasAccount: true,
      status: profile.stripeAccountStatus || 'unknown',
      payoutEnabled: profile.payoutEnabled,
      requiresOnboarding: true,
    };
  }
}

/**
 * Get Stripe Express Dashboard login link for a developer
 */
export async function getDashboardLink(
  developerId: string
): Promise<ConnectAccountResult> {
  if (!isStripeConfigured() || !stripe) {
    return {
      success: true,
      onboardingUrl: `${getBaseUrl()}/profile/developer/revenue`,
    };
  }

  try {
    const profile = await prisma.developerProfile.findUnique({
      where: { userId: developerId },
      select: { stripeAccountId: true },
    });

    if (!profile?.stripeAccountId) {
      return {
        success: false,
        error: 'No Stripe account found',
      };
    }

    const loginLink = await stripe.accounts.createLoginLink(profile.stripeAccountId);

    return {
      success: true,
      onboardingUrl: loginLink.url,
    };
  } catch (error: any) {
    console.error('Error generating dashboard link:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate dashboard link',
    };
  }
}



