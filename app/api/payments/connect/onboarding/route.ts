import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { getOnboardingLink } from '@/lib/payments/connect';

/**
 * Get Stripe Connect Onboarding Link
 * 
 * GET /api/payments/connect/onboarding
 * 
 * Returns a URL to complete or refresh Stripe onboarding.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role?.toUpperCase() !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Only developers can access payout settings' },
        { status: 403 }
      );
    }

    const result = await getOnboardingLink(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate onboarding link' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      onboardingUrl: result.onboardingUrl,
    });
  } catch (error: any) {
    console.error('Error getting onboarding link:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



