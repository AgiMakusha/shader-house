// Admin API route for revenue statistics
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { isStripeConfigured, isStripeConnectConfigured } from "@/lib/payments/stripe";
import {
  GAME_SALE_PLATFORM_FEE_PERCENT,
  DONATION_PLATFORM_FEE_PERCENT,
  CREATOR_SUPPORT_PLATFORM_FEE_PERCENT,
  GAME_PUBLISHING_FEE_CENTS,
  formatCurrency,
} from "@/lib/payments/config";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Fetch all revenue data in parallel
    const [
      purchases,
      tips,
      publishingFees,
      subscriptions,
      recentPurchases,
      recentTips,
      recentPublishingFees,
    ] = await Promise.all([
      // Aggregate purchases
      prisma.purchase.aggregate({
        where: { paymentStatus: "completed" },
        _sum: {
          pricePaid: true,
          platformFee: true,
          developerAmount: true,
        },
        _count: true,
      }),
      // Aggregate tips
      prisma.tip.aggregate({
        where: { paymentStatus: "completed" },
        _sum: {
          amountCents: true,
          platformFee: true,
          developerAmount: true,
        },
        _count: true,
      }),
      // Aggregate publishing fees
      prisma.publishingFee.aggregate({
        where: { paymentStatus: "completed" },
        _sum: {
          amountCents: true,
        },
        _count: true,
      }),
      // Aggregate subscriptions (active and completed payments)
      prisma.subscription.aggregate({
        where: { status: "ACTIVE" },
        _sum: {
          priceInCents: true,
        },
        _count: true,
      }),
      // Recent purchases
      prisma.purchase.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        where: { paymentStatus: "completed" },
        select: {
          id: true,
          pricePaid: true,
          platformFee: true,
          developerAmount: true,
          paymentStatus: true,
          createdAt: true,
          game: {
            select: {
              title: true,
              slug: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      // Recent tips
      prisma.tip.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        where: { paymentStatus: "completed" },
        select: {
          id: true,
          amountCents: true,
          platformFee: true,
          developerAmount: true,
          message: true,
          createdAt: true,
          fromUser: {
            select: {
              name: true,
            },
          },
          toUser: {
            select: {
              name: true,
            },
          },
        },
      }),
      // Recent publishing fees
      prisma.publishingFee.findMany({
        take: 10,
        orderBy: { paidAt: "desc" },
        where: { paymentStatus: "completed" },
        select: {
          id: true,
          amountCents: true,
          paidAt: true,
          game: {
            select: {
              title: true,
              slug: true,
            },
          },
          developer: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Calculate totals
    const totalPurchaseRevenue = purchases._sum.pricePaid || 0;
    const purchasePlatformFees = purchases._sum.platformFee || 0;
    const purchaseDeveloperPayouts = purchases._sum.developerAmount || 0;

    const totalTipRevenue = tips._sum.amountCents || 0;
    const tipPlatformFees = tips._sum.platformFee || 0;
    const tipDeveloperPayouts = tips._sum.developerAmount || 0;

    const totalPublishingFees = publishingFees._sum.amountCents || 0;

    // For subscriptions, platform keeps everything (it's a platform service)
    const totalSubscriptionRevenue = subscriptions._sum.priceInCents || 0;

    // Total platform revenue = all platform fees + publishing fees + subscriptions
    const totalPlatformRevenue =
      purchasePlatformFees +
      tipPlatformFees +
      totalPublishingFees +
      totalSubscriptionRevenue;

    // Total volume = all money that flowed through
    const totalVolume =
      totalPurchaseRevenue + totalTipRevenue + totalPublishingFees + totalSubscriptionRevenue;

    // Total developer payouts
    const totalDeveloperPayouts = purchaseDeveloperPayouts + tipDeveloperPayouts;

    // Stripe configuration status
    const stripeStatus = {
      configured: isStripeConfigured(),
      connectConfigured: isStripeConnectConfigured(),
      mode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "test",
      webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    };

    // Fee configuration
    const feeConfig = {
      gameSaleFee: GAME_SALE_PLATFORM_FEE_PERCENT,
      tipFee: DONATION_PLATFORM_FEE_PERCENT,
      creatorSupportFee: CREATOR_SUPPORT_PLATFORM_FEE_PERCENT,
      publishingFee: GAME_PUBLISHING_FEE_CENTS,
    };

    return NextResponse.json({
      overview: {
        totalVolume,
        totalPlatformRevenue,
        totalDeveloperPayouts,
        formatted: {
          totalVolume: formatCurrency(totalVolume),
          totalPlatformRevenue: formatCurrency(totalPlatformRevenue),
          totalDeveloperPayouts: formatCurrency(totalDeveloperPayouts),
        },
      },
      breakdown: {
        gameSales: {
          count: purchases._count,
          totalRevenue: totalPurchaseRevenue,
          platformFees: purchasePlatformFees,
          developerPayouts: purchaseDeveloperPayouts,
          formatted: {
            totalRevenue: formatCurrency(totalPurchaseRevenue),
            platformFees: formatCurrency(purchasePlatformFees),
            developerPayouts: formatCurrency(purchaseDeveloperPayouts),
          },
        },
        tips: {
          count: tips._count,
          totalRevenue: totalTipRevenue,
          platformFees: tipPlatformFees,
          developerPayouts: tipDeveloperPayouts,
          formatted: {
            totalRevenue: formatCurrency(totalTipRevenue),
            platformFees: formatCurrency(tipPlatformFees),
            developerPayouts: formatCurrency(tipDeveloperPayouts),
          },
        },
        publishingFees: {
          count: publishingFees._count,
          totalRevenue: totalPublishingFees,
          formatted: {
            totalRevenue: formatCurrency(totalPublishingFees),
          },
        },
        subscriptions: {
          activeCount: subscriptions._count,
          monthlyRevenue: totalSubscriptionRevenue,
          formatted: {
            monthlyRevenue: formatCurrency(totalSubscriptionRevenue),
          },
        },
      },
      recentTransactions: {
        purchases: recentPurchases.map((p) => ({
          ...p,
          type: "purchase" as const,
          formattedAmount: formatCurrency(p.pricePaid),
          formattedPlatformFee: formatCurrency(p.platformFee || 0),
        })),
        tips: recentTips.map((t) => ({
          ...t,
          type: "tip" as const,
          formattedAmount: formatCurrency(t.amountCents),
          formattedPlatformFee: formatCurrency(t.platformFee),
        })),
        publishingFees: recentPublishingFees.map((pf) => ({
          ...pf,
          type: "publishing_fee" as const,
          formattedAmount: formatCurrency(pf.amountCents),
        })),
      },
      stripeStatus,
      feeConfig,
    });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    return NextResponse.json({ error: "Failed to fetch revenue statistics" }, { status: 500 });
  }
}

