import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get game
    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        gameId_userId: {
          gameId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
    }

    // Free games can be "purchased" immediately
    if (game.priceCents === 0) {
      const purchase = await prisma.purchase.create({
        data: {
          gameId: id,
          userId: session.user.id,
          pricePaid: 0,
        },
      });

      return NextResponse.json({ 
        success: true,
        purchase,
        message: 'Game added to your library'
      });
    }

    // For paid games, in a real app you would:
    // 1. Create a payment intent with Stripe/PayPal
    // 2. Return the client secret
    // 3. Handle the payment confirmation in a webhook
    
    // For now, we'll simulate a successful purchase
    // TODO: Integrate with actual payment provider
    const purchase = await prisma.purchase.create({
      data: {
        gameId: id,
        userId: session.user.id,
        pricePaid: game.priceCents,
      },
    });

    return NextResponse.json({
      success: true,
      purchase,
      message: 'Purchase successful! (Demo mode)',
      // In production, return payment intent:
      // clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process purchase' },
      { status: 500 }
    );
  }
}



