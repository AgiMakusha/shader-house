import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { checkAccountStatus, getDashboardLink } from '@/lib/payments/connect';

/**
 * Get Stripe Connect Account Status
 * 
 * GET /api/payments/connect/status
 * 
 * Returns the status of the developer's Stripe Connect account.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role?.toUpperCase() !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Only developers can check payout status' },
        { status: 403 }
      );
    }

    const status = await checkAccountStatus(session.user.id);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    console.error('Error checking account status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



