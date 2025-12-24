/**
 * Migration script to add publishing fee records for existing games
 * 
 * This script should be run once to migrate existing games that were
 * created before the publishing fee requirement was implemented.
 * 
 * Run with: npx tsx scripts/migrate-publishing-fees.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting publishing fee migration...\n');

  // Get all games that don't have a publishing fee entry
  const gamesWithoutFee = await prisma.game.findMany({
    where: {
      publishingFee: null,
    },
    select: {
      id: true,
      title: true,
      developerId: true,
      releaseStatus: true,
    },
  });

  console.log(`📊 Found ${gamesWithoutFee.length} games without publishing fee entries\n`);

  if (gamesWithoutFee.length === 0) {
    console.log('✅ No migration needed - all games have publishing fee entries');
    return;
  }

  // Create publishing fee entries for all existing games
  // Mark them as completed since they were published before the fee requirement
  let migratedCount = 0;
  let errorCount = 0;

  for (const game of gamesWithoutFee) {
    try {
      await prisma.publishingFee.create({
        data: {
          gameId: game.id,
          developerId: game.developerId,
          amountCents: 0, // Free - grandfathered in
          paymentStatus: 'completed',
          paidAt: new Date(),
        },
      });
      console.log(`  ✅ ${game.title} (${game.releaseStatus})`);
      migratedCount++;
    } catch (error: any) {
      console.error(`  ❌ ${game.title}: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📈 Migration Summary:`);
  console.log(`  - Games migrated: ${migratedCount}`);
  console.log(`  - Errors: ${errorCount}`);
  console.log(`\n✅ Migration complete!`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



