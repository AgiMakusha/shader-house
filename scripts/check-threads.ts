import { prisma } from '../lib/db/prisma';

async function main() {
  // Check threads for 'cat' game
  const catGame = await prisma.game.findFirst({
    where: { slug: 'cat' },
    select: { 
      id: true, 
      title: true, 
      developerId: true,
      developer: { select: { email: true, name: true } }
    }
  });
  
  console.log('=== CAT GAME ===');
  console.log(`Developer: ${catGame?.developer.email} (ID: ${catGame?.developerId})`);
  
  // Check threads
  const threads = await prisma.discussionThread.findMany({
    where: { gameId: catGame?.id },
    include: {
      author: { select: { id: true, email: true, name: true } }
    }
  });
  
  console.log('\n=== THREADS FOR CAT GAME ===');
  for (const t of threads) {
    console.log(`[${t.category}] "${t.title}" by ${t.author.email} (ID: ${t.author.id})`);
    console.log(`  Author is developer: ${t.author.id === catGame?.developerId}`);
  }
}

main().finally(() => prisma.$disconnect());
