// Script to clean up unverified accounts older than specified days
// Usage: npx tsx scripts/cleanup-unverified-accounts.ts [days]
// Default: 7 days (accounts older than 7 days without verification)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default: delete accounts older than 7 days
const DEFAULT_DAYS = 7;

async function cleanupUnverifiedAccounts() {
  const daysArg = process.argv[2];
  const days = daysArg ? parseInt(daysArg, 10) : DEFAULT_DAYS;

  if (isNaN(days) || days < 1) {
    console.error("❌ Invalid number of days. Must be a positive integer.");
    console.error("Usage: npx tsx scripts/cleanup-unverified-accounts.ts [days]");
    console.error("Example: npx tsx scripts/cleanup-unverified-accounts.ts 7");
    process.exit(1);
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  console.log(`\n🧹 Cleaning up unverified accounts older than ${days} days...`);
  console.log(`   Cutoff date: ${cutoffDate.toISOString()}\n`);

  try {
    // Find unverified accounts older than cutoff date
    const unverifiedAccounts = await prisma.user.findMany({
      where: {
        emailVerified: null, // Not verified
        createdAt: {
          lt: cutoffDate, // Created before cutoff date
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
        _count: {
          select: {
            games: true,
            purchases: true,
            ratings: true,
            favorites: true,
          },
        },
      },
    });

    if (unverifiedAccounts.length === 0) {
      console.log("✅ No unverified accounts found to clean up.\n");
      await prisma.$disconnect();
      return;
    }

    console.log(`📊 Found ${unverifiedAccounts.length} unverified account(s) to delete:\n`);

    // Show summary
    let totalGames = 0;
    let totalPurchases = 0;
    let totalRatings = 0;
    let totalFavorites = 0;

    unverifiedAccounts.forEach((account, index) => {
      const age = Math.floor((Date.now() - account.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`  ${index + 1}. ${account.name} (${account.email})`);
      console.log(`     Role: ${account.role}, Age: ${age} days`);
      console.log(`     Games: ${account._count.games}, Purchases: ${account._count.purchases}`);
      console.log(`     Ratings: ${account._count.ratings}, Favorites: ${account._count.favorites}`);
      console.log("");

      totalGames += account._count.games;
      totalPurchases += account._count.purchases;
      totalRatings += account._count.ratings;
      totalFavorites += account._count.favorites;
    });

    console.log(`📈 Summary:`);
    console.log(`   Total accounts: ${unverifiedAccounts.length}`);
    console.log(`   Total games: ${totalGames}`);
    console.log(`   Total purchases: ${totalPurchases}`);
    console.log(`   Total ratings: ${totalRatings}`);
    console.log(`   Total favorites: ${totalFavorites}\n`);

    // Safety check: Don't delete accounts with purchases or games
    const accountsWithActivity = unverifiedAccounts.filter(
      (acc) => acc._count.games > 0 || acc._count.purchases > 0
    );

    if (accountsWithActivity.length > 0) {
      console.log(`⚠️  WARNING: Found ${accountsWithActivity.length} account(s) with activity:`);
      accountsWithActivity.forEach((acc) => {
        console.log(`   - ${acc.email} (${acc._count.games} games, ${acc._count.purchases} purchases)`);
      });
      console.log("\n❌ These accounts will NOT be deleted for safety.\n");
    }

    // Filter out accounts with activity
    const accountsToDelete = unverifiedAccounts.filter(
      (acc) => acc._count.games === 0 && acc._count.purchases === 0
    );

    if (accountsToDelete.length === 0) {
      console.log("✅ No accounts to delete (all have activity).\n");
      await prisma.$disconnect();
      return;
    }

    // Confirm deletion
    console.log(`🗑️  Ready to delete ${accountsToDelete.length} account(s) without activity.`);
    console.log(`   This action cannot be undone!\n`);

    // In production, you might want to add a confirmation prompt
    // For now, we'll proceed with deletion
    console.log("🚀 Starting deletion...\n");

    let deletedCount = 0;
    let errorCount = 0;

    // Delete accounts one by one (Prisma will handle cascading deletes)
    for (const account of accountsToDelete) {
      try {
        await prisma.user.delete({
          where: { id: account.id },
        });
        deletedCount++;
        console.log(`   ✅ Deleted: ${account.email}`);
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error deleting ${account.email}:`, error);
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Deleted: ${deletedCount} account(s)`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount} account(s)`);
    }
    console.log("");

    // Show remaining unverified accounts
    const remaining = await prisma.user.count({
      where: {
        emailVerified: null,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    if (remaining > 0) {
      console.log(`ℹ️  ${remaining} unverified account(s) still remain (have activity or errors).\n`);
    }
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUnverifiedAccounts();

