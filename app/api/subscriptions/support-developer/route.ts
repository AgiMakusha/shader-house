import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { supportDeveloper } from '@/lib/subscriptions/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { developerId } = await req.json();

    if (!developerId) {
      return NextResponse.json(
        { error: 'Developer ID required' },
        { status: 400 }
      );
    }

    const result = await supportDeveloper(session.user.id, developerId);

    return NextResponse.json({ success: true, support: result });
  } catch (error: any) {
    console.error('Error supporting developer:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}

