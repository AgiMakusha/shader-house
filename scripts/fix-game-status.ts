import { PrismaClient, ReleaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing game release statuses...');

  // Get all games
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      releaseStatus: true,
    },
  });

  console.log(`\n📊 Found ${games.length} games:`);
  
  let updated = 0;
  
  for (const game of games) {
    console.log(`\n${game.title}:`);
    console.log(`  Current status: ${game.releaseStatus || 'NULL'}`);
    
    if (game.releaseStatus !== ReleaseStatus.RELEASED && game.releaseStatus !== ReleaseStatus.BETA) {
      // Update to RELEASED
      await prisma.game.update({
        where: { id: game.id },
        data: { releaseStatus: ReleaseStatus.RELEASED },
      });
      console.log(`  ✅ Updated to: RELEASED`);
      updated++;
    } else {
      console.log(`  ⏭️  Already set (${game.releaseStatus})`);
    }
  }

  console.log(`\n🎉 Done!`);
  console.log(`   Updated: ${updated} games`);
  console.log(`   Total: ${games.length} games`);
  console.log(`\n✅ All games should now be visible on /games page`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

