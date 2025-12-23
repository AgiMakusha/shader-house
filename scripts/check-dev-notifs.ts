import { prisma } from '../lib/db/prisma';

async function main() {
  // Find all developers
  const developers = await prisma.user.findMany({
    where: { role: 'DEVELOPER' },
    select: { id: true, email: true, name: true }
  });
  
  console.log('=== DEVELOPERS ===');
  console.log(JSON.stringify(developers, null, 2));
  
  // Find all notifications
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15,
    include: {
      user: {
        select: { email: true, name: true, role: true }
      }
    }
  });
  
  console.log('\n=== RECENT NOTIFICATIONS ===');
  for (const n of notifications) {
    console.log(`[${n.type}] ${n.title} -> ${n.user.email} (${n.user.role})`);
  }
  
  // Check developer-specific notifications
  const devNotifs = await prisma.notification.findMany({
    where: {
      type: {
        in: ['NEW_BETA_TESTER', 'NEW_FEEDBACK', 'NEW_REVIEW', 'GAME_PUBLISHED', 'NEW_COMMUNITY_THREAD']
      }
    },
    include: {
      user: { select: { email: true, role: true } }
    }
  });
  
  console.log('\n=== DEVELOPER-TYPE NOTIFICATIONS ===');
  console.log(`Found ${devNotifs.length} developer notifications`);
  for (const n of devNotifs) {
    console.log(`  [${n.type}] ${n.title} -> ${n.user.email}`);
  }
  
  // Check who owns the games
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      developerId: true,
      developer: {
        select: { email: true, name: true }
      }
    }
  });
  
  console.log('\n=== GAMES AND THEIR DEVELOPERS ===');
  for (const g of games) {
    console.log(`"${g.title}" (${g.slug}) -> ${g.developer.email}`);
  }
}

main().finally(() => prisma.$disconnect());
