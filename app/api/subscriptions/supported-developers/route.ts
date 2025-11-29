import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { getSupportedDevelopers } from '@/lib/subscriptions/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supported = await getSupportedDevelopers(session.user.id);

    return NextResponse.json({ supported });
  } catch (error) {
    console.error('Error fetching supported developers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

