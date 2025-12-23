import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { createConnectAccount, getOnboardingLink } from '@/lib/payments/connect';

/**
 * Create Stripe Connect Account for Developer
 * 
 * POST /api/payments/connect/create
 * 
 * Creates a Stripe Express account and returns the onboarding URL.
 * Developer must complete onboarding to receive payments.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only developers can create Connect accounts
    if (session.user.role?.toUpperCase() !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Only developers can create payout accounts' },
        { status: 403 }
      );
    }

    // Create the Connect account
    const result = await createConnectAccount(session.user.id, session.user.email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create account' },
        { status: 400 }
      );
    }

    // Get onboarding link
    const onboardingResult = await getOnboardingLink(session.user.id);

    return NextResponse.json({
      success: true,
      accountId: result.accountId,
      onboardingUrl: onboardingResult.onboardingUrl,
      message: 'Stripe account created. Complete onboarding to receive payments.',
    });
  } catch (error: any) {
    console.error('Error creating Connect account:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

