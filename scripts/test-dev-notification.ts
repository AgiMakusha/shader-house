import { prisma } from '../lib/db/prisma';
import { notifyNewCommunityThread, notifyNewBetaTester, notifyNewFeedback, notifyNewReview, notifyGamePublished } from '../lib/notifications/triggers';

async function main() {
  // Get the cat game
  const catGame = await prisma.game.findFirst({
    where: { slug: 'cat' },
    select: { id: true, title: true, slug: true, developerId: true }
  });
  
  if (!catGame) {
    console.log('Cat game not found!');
    return;
  }
  
  console.log(`Testing notifications for game: ${catGame.title}`);
  console.log(`Developer ID: ${catGame.developerId}`);
  
  // Test 1: NEW_COMMUNITY_THREAD
  console.log('\n1. Testing notifyNewCommunityThread...');
  try {
    const result = await notifyNewCommunityThread(
      catGame.developerId,
      catGame.id,
      catGame.title,
      'BUG_REPORT',
      'Test Bug Report Thread',
      'Test Player',
      catGame.slug
    );
    console.log('   Result:', result ? 'SUCCESS' : 'SKIPPED (notifications disabled)');
  } catch (e: any) {
    console.log('   ERROR:', e.message);
  }
  
  // Test 2: NEW_BETA_TESTER
  console.log('\n2. Testing notifyNewBetaTester...');
  try {
    const result = await notifyNewBetaTester(
      catGame.developerId,
      catGame.id,
      catGame.title,
      'Test Gamer',
      catGame.slug
    );
    console.log('   Result:', result ? 'SUCCESS' : 'SKIPPED (notifications disabled)');
  } catch (e: any) {
    console.log('   ERROR:', e.message);
  }
  
  // Test 3: NEW_FEEDBACK
  console.log('\n3. Testing notifyNewFeedback...');
  try {
    const result = await notifyNewFeedback(
      catGame.developerId,
      catGame.id,
      catGame.title,
      'BUG',
      'Test Bug Title',
      'Test Tester',
      catGame.slug
    );
    console.log('   Result:', result ? 'SUCCESS' : 'SKIPPED (notifications disabled)');
  } catch (e: any) {
    console.log('   ERROR:', e.message);
  }
  
  // Test 4: NEW_REVIEW
  console.log('\n4. Testing notifyNewReview...');
  try {
    const result = await notifyNewReview(
      catGame.developerId,
      catGame.id,
      catGame.title,
      5,
      'Test Reviewer',
      'Great game!',
      catGame.slug
    );
    console.log('   Result:', result ? 'SUCCESS' : 'SKIPPED (notifications disabled)');
  } catch (e: any) {
    console.log('   ERROR:', e.message);
  }
  
  // Test 5: GAME_PUBLISHED
  console.log('\n5. Testing notifyGamePublished...');
  try {
    const result = await notifyGamePublished(
      catGame.developerId,
      catGame.id,
      catGame.title,
      catGame.slug
    );
    console.log('   Result:', result ? 'SUCCESS' : 'SKIPPED (notifications disabled)');
  } catch (e: any) {
    console.log('   ERROR:', e.message);
  }
  
  // Check what notifications exist now
  console.log('\n=== DEVELOPER NOTIFICATIONS AFTER TEST ===');
  const devNotifs = await prisma.notification.findMany({
    where: {
      userId: catGame.developerId
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  for (const n of devNotifs) {
    console.log(`[${n.type}] ${n.title}`);
  }
}

main().finally(() => prisma.$disconnect());
