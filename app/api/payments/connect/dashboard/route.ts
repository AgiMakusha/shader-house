import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { getDashboardLink } from '@/lib/payments/connect';

/**
 * Get Stripe Express Dashboard Link
 * 
 * GET /api/payments/connect/dashboard
 * 
 * Returns a login link to the Stripe Express Dashboard
 * where developers can view their payouts and settings.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role?.toUpperCase() !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Only developers can access payout dashboard' },
        { status: 403 }
      );
    }

    const result = await getDashboardLink(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate dashboard link' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      dashboardUrl: result.onboardingUrl,
    });
  } catch (error: any) {
    console.error('Error getting dashboard link:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

