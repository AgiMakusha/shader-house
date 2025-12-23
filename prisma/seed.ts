import { PrismaClient, Platform, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create users
  const adminPassword = await hash('Admin123!', 10);
  const developerPassword = await hash('developer123', 10);
  const gamerPassword = await hash('gamer123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shaderhouse.com' },
    update: {},
    create: {
      email: 'admin@shaderhouse.com',
      name: 'Platform Admin',
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  const developer = await prisma.user.upsert({
    where: { email: 'developer@shaderhouse.com' },
    update: {},
    create: {
      email: 'developer@shaderhouse.com',
      name: 'Alex Developer',
      password: developerPassword,
      role: Role.DEVELOPER,
      emailVerified: new Date(),
    },
  });

  const gamer1 = await prisma.user.upsert({
    where: { email: 'gamer1@shaderhouse.com' },
    update: {},
    create: {
      email: 'gamer1@shaderhouse.com',
      name: 'Sam Gamer',
      password: gamerPassword,
      role: Role.GAMER,
      emailVerified: new Date(),
    },
  });

  const gamer2 = await prisma.user.upsert({
    where: { email: 'gamer2@shaderhouse.com' },
    update: {},
    create: {
      email: 'gamer2@shaderhouse.com',
      name: 'Jordan Player',
      password: gamerPassword,
      role: Role.GAMER,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Users created');

  // Create tags
  const tagData = [
    { name: 'Action', slug: 'action' },
    { name: 'Adventure', slug: 'adventure' },
    { name: 'RPG', slug: 'rpg' },
    { name: 'Strategy', slug: 'strategy' },
    { name: 'Puzzle', slug: 'puzzle' },
    { name: 'Platformer', slug: 'platformer' },
    { name: 'Indie', slug: 'indie' },
    { name: 'Multiplayer', slug: 'multiplayer' },
    { name: 'Singleplayer', slug: 'singleplayer' },
    { name: '2D', slug: '2d' },
    { name: '3D', slug: '3d' },
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

  console.log('✅ Tags created');

  // Create games
  const gamesData = [
    {
      slug: 'pixel-quest-adventures',
      title: 'Pixel Quest Adventures',
      tagline: 'Embark on a retro-style adventure through mystical lands',
      description: 'Pixel Quest Adventures is a charming retro-style platformer that takes you on an epic journey through vibrant pixel art worlds. Battle enemies, solve puzzles, and discover hidden secrets as you quest to save the kingdom from an ancient evil. With tight controls, challenging levels, and a nostalgic soundtrack, this game is perfect for both veteran gamers and newcomers alike.',
      coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
      screenshots: [
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200',
      ],
      priceCents: 1499,
      platforms: [Platform.WINDOWS, Platform.MAC, Platform.LINUX],
      externalUrl: 'https://example.com/play/pixel-quest',
      tagSlugs: ['platformer', 'indie', 'retro', '2d', 'singleplayer'],
    },
    {
      slug: 'cyber-nexus',
      title: 'Cyber Nexus',
      tagline: 'Hack the system in this cyberpunk strategy game',
      description: 'In Cyber Nexus, you play as an elite hacker in a dystopian future where corporations control everything. Use your skills to infiltrate secure systems, gather intelligence, and lead a revolution against the oppressive regime. With deep strategy mechanics, branching storylines, and stunning neon-soaked visuals, every decision matters in this thrilling cyberpunk adventure.',
      coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
      screenshots: [
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
      ],
      priceCents: 2999,
      platforms: [Platform.WINDOWS, Platform.WEB],
      externalUrl: 'https://example.com/play/cyber-nexus',
      tagSlugs: ['strategy', 'indie', 'singleplayer', '3d'],
    },
    {
      slug: 'dungeon-masters',
      title: 'Dungeon Masters',
      tagline: 'Build and defend your dungeon in this tower defense RPG',
      description: 'Dungeon Masters combines tower defense with RPG elements in a unique gameplay experience. Design your dungeon, place traps and monsters, and defend against waves of heroes trying to steal your treasure. Level up your minions, unlock powerful spells, and become the ultimate dungeon overlord. Play solo or team up with friends in co-op mode.',
      coverUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
      screenshots: [
        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200',
        'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200',
      ],
      priceCents: 1999,
      platforms: [Platform.WINDOWS, Platform.MAC, Platform.ANDROID, Platform.IOS],
      externalUrl: 'https://example.com/play/dungeon-masters',
      tagSlugs: ['strategy', 'rpg', 'multiplayer', '2d', 'indie'],
    },
    {
      slug: 'space-odyssey-2077',
      title: 'Space Odyssey 2077',
      tagline: 'Explore the cosmos in this open-world space adventure',
      description: 'Set in the year 2077, Space Odyssey takes you on an interstellar journey across a vast, procedurally generated universe. Trade with alien civilizations, mine asteroids, engage in epic space battles, and uncover the mysteries of ancient alien artifacts. With stunning visuals, realistic physics, and endless exploration possibilities, the cosmos is yours to discover.',
      coverUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800',
      screenshots: [
        'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=1200',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
      ],
      priceCents: 3999,
      platforms: [Platform.WINDOWS, Platform.MAC],
      externalUrl: 'https://example.com/play/space-odyssey',
      tagSlugs: ['adventure', 'action', 'singleplayer', '3d', 'indie'],
    },
    {
      slug: 'puzzle-paradise',
      title: 'Puzzle Paradise',
      tagline: 'Relax and solve beautiful puzzles',
      description: 'Puzzle Paradise offers a serene gaming experience with hundreds of hand-crafted puzzles. From classic jigsaw puzzles to innovative new mechanics, each level is designed to challenge your mind while providing a relaxing atmosphere. Perfect for casual gaming sessions, with cloud save support and daily challenges to keep you coming back.',
      coverUrl: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800',
      screenshots: [
        'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=1200',
      ],
      priceCents: 0,
      platforms: [Platform.WEB, Platform.ANDROID, Platform.IOS],
      externalUrl: 'https://example.com/play/puzzle-paradise',
      tagSlugs: ['puzzle', 'indie', 'singleplayer', '2d'],
    },
    {
      slug: 'battle-royale-legends',
      title: 'Battle Royale Legends',
      tagline: 'Drop in, loot up, and be the last one standing',
      description: 'Battle Royale Legends brings intense multiplayer action to your screen. Drop onto a massive island with 99 other players, scavenge for weapons and gear, and fight to be the last one standing. With regular updates, new maps, and seasonal events, there\'s always something new to discover. Team up with friends or go solo in this free-to-play phenomenon.',
      coverUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
      screenshots: [
        'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
      ],
      priceCents: 0,
      platforms: [Platform.WINDOWS, Platform.MAC, Platform.ANDROID, Platform.IOS],
      externalUrl: 'https://example.com/play/battle-royale',
      tagSlugs: ['action', 'multiplayer', '3d'],
    },
    {
      slug: 'fantasy-realm-chronicles',
      title: 'Fantasy Realm Chronicles',
      tagline: 'An epic RPG adventure awaits',
      description: 'Fantasy Realm Chronicles is a classic RPG experience with modern gameplay mechanics. Create your hero, choose your class, and embark on a 50+ hour adventure through a richly detailed fantasy world. With deep character customization, tactical combat, and meaningful choices that affect the story, this is an RPG fan\'s dream come true.',
      coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
      screenshots: [
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200',
        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200',
      ],
      priceCents: 4999,
      platforms: [Platform.WINDOWS, Platform.MAC, Platform.LINUX],
      externalUrl: 'https://example.com/play/fantasy-realm',
      tagSlugs: ['rpg', 'adventure', 'singleplayer', '3d', 'indie'],
    },
    {
      slug: 'racing-legends-pro',
      title: 'Racing Legends Pro',
      tagline: 'Feel the adrenaline of high-speed racing',
      description: 'Racing Legends Pro delivers the most realistic racing simulation on mobile and desktop. With officially licensed cars, real-world tracks, and advanced physics, every race feels authentic. Compete in career mode, challenge friends in multiplayer, or perfect your lap times in time trials. Customize your vehicles and dominate the leaderboards.',
      coverUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800',
      screenshots: [
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200',
      ],
      priceCents: 2499,
      platforms: [Platform.WINDOWS, Platform.ANDROID, Platform.IOS],
      externalUrl: 'https://example.com/play/racing-legends',
      tagSlugs: ['action', 'multiplayer', '3d'],
    },
    {
      slug: 'mystery-manor',
      title: 'Mystery Manor',
      tagline: 'Solve the mystery in this point-and-click adventure',
      description: 'Mystery Manor is a captivating point-and-click adventure game set in a mysterious Victorian mansion. Investigate strange occurrences, solve intricate puzzles, and uncover dark secrets hidden within the manor\'s walls. With beautiful hand-drawn artwork, atmospheric sound design, and a gripping narrative, this game will keep you guessing until the very end.',
      coverUrl: 'https://images.unsplash.com/photo-1580234797602-22c37b2a6d6e?w=800',
      screenshots: [
        'https://images.unsplash.com/photo-1580234797602-22c37b2a6d6e?w=1200',
      ],
      priceCents: 1299,
      platforms: [Platform.WINDOWS, Platform.MAC, Platform.WEB],
      externalUrl: 'https://example.com/play/mystery-manor',
      tagSlugs: ['adventure', 'puzzle', 'singleplayer', '2d', 'indie'],
    },
    {
      slug: 'tower-defense-ultimate',
      title: 'Tower Defense Ultimate',
      tagline: 'The ultimate tower defense experience',
      description: 'Tower Defense Ultimate takes the classic tower defense formula and perfects it. With 50+ unique towers, 100+ levels, and endless mode, there\'s always a new challenge waiting. Plan your strategy, upgrade your defenses, and stop the enemy waves from reaching your base. Features both single-player campaign and competitive multiplayer modes.',
      coverUrl: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800',
      screenshots: [
        'https://images.unsplash.com/photo-1556438064-2d7646166914?w=1200',
      ],
      priceCents: 999,
      platforms: [Platform.WEB, Platform.ANDROID, Platform.IOS],
      externalUrl: 'https://example.com/play/tower-defense',
      tagSlugs: ['strategy', 'multiplayer', '2d', 'indie'],
    },
  ];

  for (const gameData of gamesData) {
    const { tagSlugs, ...gameFields } = gameData;
    
    const game = await prisma.game.upsert({
      where: { slug: gameData.slug },
      update: {},
      create: {
        ...gameFields,
        developerId: developer.id,
      },
    });

    // Connect tags
    for (const tagSlug of tagSlugs) {
      const tag = tags.find((t) => t.slug === tagSlug);
      if (tag) {
        await prisma.gameTag.upsert({
          where: {
            gameId_tagId: {
              gameId: game.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            gameId: game.id,
            tagId: tag.id,
          },
        });
      }
    }
  }

  console.log('✅ Games created');

  // Create sample ratings
  const games = await prisma.game.findMany();
  
  for (const game of games.slice(0, 5)) {
    await prisma.rating.create({
      data: {
        gameId: game.id,
        userId: gamer1.id,
        stars: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: 'Great game! Really enjoyed playing it.',
      },
    });

    await prisma.rating.create({
      data: {
        gameId: game.id,
        userId: gamer2.id,
        stars: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: 'Highly recommended!',
      },
    });

    // Update avgRating
    const ratings = await prisma.rating.findMany({
      where: { gameId: game.id },
    });
    const avgRating = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
    
    await prisma.game.update({
      where: { id: game.id },
      data: { avgRating },
    });
  }

  console.log('✅ Ratings created');

  // Create sample favorites
  for (const game of games.slice(0, 3)) {
    await prisma.favorite.create({
      data: {
        gameId: game.id,
        userId: gamer1.id,
      },
    });

    await prisma.game.update({
      where: { id: game.id },
      data: { favCount: { increment: 1 } },
    });
  }

  console.log('✅ Favorites created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Test accounts:');
  console.log('Admin: admin@shaderhouse.com / Admin123!');
  console.log('Developer: developer@shaderhouse.com / developer123');
  console.log('Gamer 1: gamer1@shaderhouse.com / gamer123');
  console.log('Gamer 2: gamer2@shaderhouse.com / gamer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

