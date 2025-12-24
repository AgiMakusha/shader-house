import { PrismaClient, Platform, ReleaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎮 Creating test games...');

  // Find the developer user
  const developer = await prisma.user.findFirst({
    where: {
      email: 'developer@shaderhouse.com',
    },
  });

  if (!developer) {
    console.error('❌ Developer user not found. Please run the seed first.');
    return;
  }

  console.log(`✅ Found developer: ${developer.name}`);

  // Check existing games
  const existingGames = await prisma.game.findMany({
    select: { title: true, slug: true },
  });

  console.log(`📊 Existing games: ${existingGames.length}`);
  existingGames.forEach(game => console.log(`  - ${game.title} (${game.slug})`));

  // Find or create tags
  const tagData = [
    { name: 'Action', slug: 'action' },
    { name: 'Adventure', slug: 'adventure' },
    { name: 'RPG', slug: 'rpg' },
    { name: 'Strategy', slug: 'strategy' },
    { name: 'Puzzle', slug: 'puzzle' },
    { name: 'Platformer', slug: 'platformer' },
    { name: 'Indie', slug: 'indie' },
    { name: 'Singleplayer', slug: 'singleplayer' },
    { name: '2D', slug: '2d' },
    { name: 'Retro', slug: 'retro' },
  ];

  const tags = await Promise.all(
    tagData.map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      })
    )
  );

  console.log('✅ Tags ready');

  // Games to create
  const gamesData = [
    {
      slug: 'pixel-quest-adventures',
      title: 'Pixel Quest Adventures',
      tagline: 'Embark on a retro-style adventure through mystical lands',
      description: 'Pixel Quest Adventures is a charming retro-style platformer that takes you on an epic journey through vibrant pixel art worlds. Battle enemies, solve puzzles, and discover hidden secrets as you quest to save the kingdom from an ancient evil.',
      coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
      priceCents: 1499,
      platforms: [Platform.WINDOWS, Platform.MAC, Platform.LINUX],
      releaseStatus: ReleaseStatus.RELEASED,
      tagSlugs: ['platformer', 'indie', 'retro', '2d', 'singleplayer'],
    },
    {
      slug: 'cyber-nexus',
      title: 'Cyber Nexus',
      tagline: 'Hack the system in this cyberpunk strategy game',
      description: 'Dive into a neon-lit cyberpunk world where you play as a master hacker navigating through corporate conspiracies. Use your skills to infiltrate systems, gather intelligence, and take down corrupt mega-corporations.',
      coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
      priceCents: 1999,
      platforms: [Platform.WINDOWS, Platform.MAC],
      releaseStatus: ReleaseStatus.RELEASED,
      tagSlugs: ['strategy', 'indie', 'singleplayer'],
    },
    {
      slug: 'dungeon-masters',
      title: 'Dungeon Masters',
      tagline: 'Build and defend your dungeon empire',
      description: 'Become the ultimate Dungeon Master! Design intricate dungeons, summon powerful monsters, and defend your lair against waves of adventurers seeking treasure and glory.',
      coverUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
      priceCents: 0,
      platforms: [Platform.WINDOWS, Platform.MAC, Platform.LINUX],
      releaseStatus: ReleaseStatus.RELEASED,
      tagSlugs: ['strategy', 'indie', 'singleplayer'],
    },
    {
      slug: 'space-odyssey-2077',
      title: 'Space Odyssey 2077',
      tagline: 'Explore the vast cosmos in this sci-fi epic',
      description: 'Embark on an interstellar journey across the galaxy. Discover alien civilizations, trade resources, engage in space combat, and uncover the mysteries of the universe.',
      coverUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800',
      priceCents: 2499,
      platforms: [Platform.WINDOWS],
      releaseStatus: ReleaseStatus.RELEASED,
      tagSlugs: ['adventure', 'indie', 'singleplayer'],
    },
    {
      slug: 'puzzle-paradise',
      title: 'Puzzle Paradise',
      tagline: 'Challenge your mind with hundreds of brain teasers',
      description: 'A collection of mind-bending puzzles that will test your logic, pattern recognition, and problem-solving skills. Perfect for puzzle enthusiasts of all ages.',
      coverUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800',
      priceCents: 999,
      platforms: [Platform.WINDOWS, Platform.MAC, Platform.LINUX],
      releaseStatus: ReleaseStatus.RELEASED,
      tagSlugs: ['puzzle', 'indie', 'singleplayer'],
    },
    {
      slug: 'battle-royale-legends',
      title: 'Battle Royale Legends',
      tagline: 'Last one standing wins in this intense multiplayer showdown',
      description: 'Drop into a massive arena with 100 players and fight to be the last one standing. Scavenge for weapons, build defenses, and outsmart your opponents.',
      coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      priceCents: 0,
      platforms: [Platform.WINDOWS, Platform.MAC],
      releaseStatus: ReleaseStatus.RELEASED,
      tagSlugs: ['action', 'indie'],
    },
    {
      slug: 'fantasy-realm-chronicles',
      title: 'Fantasy Realm Chronicles',
      tagline: 'An epic RPG adventure awaits',
      description: 'Journey through a rich fantasy world filled with magic, dragons, and ancient prophecies. Create your hero, master powerful spells, and save the realm from darkness.',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      priceCents: 2999,
      platforms: [Platform.WINDOWS, Platform.MAC, Platform.LINUX],
      releaseStatus: ReleaseStatus.RELEASED,
      tagSlugs: ['rpg', 'adventure', 'indie', 'singleplayer'],
    },
    {
      slug: 'racing-legends-pro',
      title: 'Racing Legends Pro',
      tagline: 'High-speed racing action with realistic physics',
      description: 'Experience the thrill of professional racing with stunning graphics and realistic vehicle physics. Compete in championships, customize your cars, and become a racing legend.',
      coverUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
      priceCents: 1999,
      platforms: [Platform.WINDOWS],
      releaseStatus: ReleaseStatus.RELEASED,
      tagSlugs: ['action', 'indie', 'singleplayer'],
    },
    {
      slug: 'mystery-manor',
      title: 'Mystery Manor',
      tagline: 'Solve the haunting mysteries of the abandoned mansion',
      description: 'Explore a mysterious Victorian mansion filled with secrets, puzzles, and supernatural occurrences. Uncover the dark history of the manor and its former inhabitants.',
      coverUrl: 'https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=800',
      priceCents: 1499,
      platforms: [Platform.WINDOWS, Platform.MAC],
      releaseStatus: ReleaseStatus.RELEASED,
      tagSlugs: ['adventure', 'puzzle', 'indie', 'singleplayer'],
    },
    {
      slug: 'tower-defense-ultimate',
      title: 'Tower Defense Ultimate',
      tagline: 'Build, upgrade, and defend against endless waves',
      description: 'The ultimate tower defense experience with dozens of tower types, upgrade paths, and challenging enemy waves. Plan your strategy and defend your base!',
      coverUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800',
      priceCents: 1299,
      platforms: [Platform.WINDOWS, Platform.MAC, Platform.LINUX],
      releaseStatus: ReleaseStatus.RELEASED,
      tagSlugs: ['strategy', 'indie', 'singleplayer'],
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const gameData of gamesData) {
    const { tagSlugs, ...gameFields } = gameData;
    
    // Check if game already exists
    const existing = await prisma.game.findUnique({
      where: { slug: gameData.slug },
    });

    if (existing) {
      console.log(`⏭️  Skipping ${gameData.title} (already exists)`);
      skipped++;
      continue;
    }

    // Create game
    const game = await prisma.game.create({
      data: {
        ...gameFields,
        developerId: developer.id,
      },
    });

    // Connect tags
    for (const tagSlug of tagSlugs) {
      const tag = tags.find((t) => t.slug === tagSlug);
      if (tag) {
        await prisma.gameTag.create({
          data: {
            gameId: game.id,
            tagId: tag.id,
          },
        });
      }
    }

    console.log(`✅ Created: ${game.title}`);
    created++;
  }

  console.log(`\n🎉 Done!`);
  console.log(`   Created: ${created} games`);
  console.log(`   Skipped: ${skipped} games (already exist)`);
  console.log(`   Total in DB: ${existingGames.length + created} games`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });








