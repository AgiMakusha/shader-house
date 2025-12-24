import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { createNotification } from '@/lib/notifications/service';
import { NotificationType } from '@prisma/client';

/**
 * POST /api/notifications/test
 * Test endpoint to create a notification (for debugging)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type = 'BETA_ACCESS_GRANTED', title, message } = body;

    const result = await createNotification({
      userId: session.user.id,
      type: type as NotificationType,
      title: title || 'Test Notification',
      message: message || 'This is a test notification to verify the system is working.',
      link: '/profile/gamer',
    });

    return NextResponse.json({
      success: true,
      result,
      message: 'Test notification created',
    });
  } catch (error: any) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test notification' },
      { status: 500 }
    );
  }
}



