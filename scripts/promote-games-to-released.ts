import { PrismaClient, ReleaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Promoting all BETA games to RELEASED...');

  // Update all BETA games to RELEASED
  const result = await prisma.game.updateMany({
    where: {
      releaseStatus: ReleaseStatus.BETA,
    },
    data: {
      releaseStatus: ReleaseStatus.RELEASED,
    },
  });

  console.log(`✅ Promoted ${result.count} games from BETA to RELEASED`);

  // Show all games now
  const allGames = await prisma.game.findMany({
    select: {
      title: true,
      releaseStatus: true,
    },
    orderBy: {
      title: 'asc',
    },
  });

  console.log(`\n📊 All games (${allGames.length} total):`);
  allGames.forEach(game => {
    console.log(`  ${game.releaseStatus === ReleaseStatus.RELEASED ? '✅' : '🔵'} ${game.title} (${game.releaseStatus})`);
  });

  console.log(`\n🎉 Done! All games should now be visible on /games page`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

