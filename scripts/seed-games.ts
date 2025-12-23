import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGames() {
  console.log('🌱 Seeding games...');

  // First, create a developer user if doesn't exist
  let developer = await prisma.user.findFirst({
    where: { role: 'DEVELOPER' },
  });

  if (!developer) {
    console.log('Creating developer account...');
    developer = await prisma.user.create({
      data: {
        email: 'dev@shaderhouse.com',
        name: 'Shader House Studios',
        password: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', // "password"
        role: 'DEVELOPER',
        emailVerified: new Date(),
      },
    });
    console.log('✓ Developer created');
  }

  // Create developer profile if doesn't exist
  const devProfile = await prisma.developerProfile.findUnique({
    where: { userId: developer.id },
  });

  if (!devProfile) {
    await prisma.developerProfile.create({
      data: {
        userId: developer.id,
        developerType: 'INDIE',
        teamSize: 1,
        hasPublisher: false,
        ownsIP: true,
        fundingSources: ['SELF'],
        companyType: 'NONE',
        attestIndie: true,
        verificationStatus: 'APPROVED',
        isIndieEligible: true,
      },
    });
    console.log('✓ Developer profile created');
  }

  // Sample games data
  const games = [
    {
      title: 'Neon Rogue',
      slug: 'neon-rogue',
      tagline: 'Fast-paced cyberpunk roguelike adventure',
      description: 'Dive into a neon-lit cyberpunk world where every run is unique. Battle through procedurally generated levels, collect powerful upgrades, and face off against challenging bosses. Features intense combat, deep progression systems, and stunning pixel art graphics.',
      priceCents: 1499, // $14.99
      coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop',
      externalUrl: 'https://example.com/neon-rogue',
      platforms: ['WINDOWS', 'MAC', 'LINUX'],
      tags: ['roguelike', 'action', 'cyberpunk', 'pixel-art'],
    },
    {
      title: 'Space Trader',
      slug: 'space-trader',
      tagline: 'Build your interstellar trading empire',
      description: 'Start as a humble space trader and build your way to a galactic business empire. Trade goods between star systems, upgrade your ships, hire crew members, and navigate political intrigue. Features deep economic simulation and emergent storytelling.',
      priceCents: 999, // $9.99
      coverUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop',
      externalUrl: 'https://example.com/space-trader',
      platforms: ['WINDOWS', 'MAC'],
      tags: ['strategy', 'simulation', 'space', 'trading'],
    },
    {
      title: 'Epic RPG Quest',
      slug: 'epic-rpg-quest',
      tagline: 'A grand adventure awaits',
      description: 'Embark on an epic journey through a richly detailed fantasy world. Create your hero, gather companions, complete quests, and shape the fate of kingdoms. Features deep character customization, branching storylines, and tactical combat. Over 100 hours of content.',
      priceCents: 2499, // $24.99
      coverUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop',
      externalUrl: 'https://example.com/epic-rpg',
      platforms: ['WINDOWS', 'MAC', 'LINUX'],
      tags: ['rpg', 'fantasy', 'adventure', 'story-rich'],
    },
    {
      title: 'Pixel Adventure Demo',
      slug: 'pixel-adventure-demo',
      tagline: 'Free platformer action',
      description: 'Try our free platformer demo! Jump, run, and explore colorful pixel worlds. This demo features the first 3 levels of our upcoming full game. Perfect for testing the unlimited library access feature!',
      priceCents: 0, // Free
      coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop',
      externalUrl: 'https://example.com/pixel-adventure',
      platforms: ['WINDOWS', 'MAC', 'LINUX', 'WEB'],
      tags: ['platformer', 'pixel-art', 'casual', 'free'],
    },
    {
      title: 'Dungeon Crawler',
      slug: 'dungeon-crawler',
      tagline: 'Explore dangerous dungeons',
      description: 'Venture into procedurally generated dungeons filled with monsters, traps, and treasure. Upgrade your equipment, learn new skills, and see how deep you can go. Each run presents new challenges and rewards.',
      priceCents: 799, // $7.99
      coverUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop',
      externalUrl: 'https://example.com/dungeon-crawler',
      platforms: ['WINDOWS', 'LINUX'],
      tags: ['roguelike', 'dungeon-crawler', 'action', 'rpg'],
    },
    {
      title: 'Retro Racer',
      slug: 'retro-racer',
      tagline: 'High-speed arcade racing',
      description: 'Experience the thrill of arcade racing with this retro-inspired game. Race through vibrant tracks, perform drifts and tricks, and compete for the best times. Features synthwave soundtrack and nostalgic pixel graphics.',
      priceCents: 1299, // $12.99
      coverUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&h=600&fit=crop',
      externalUrl: 'https://example.com/retro-racer',
      platforms: ['WINDOWS', 'MAC'],
      tags: ['racing', 'arcade', 'retro', 'multiplayer'],
    },
  ];

  // Create games
  for (const gameData of games) {
    const { tags, platforms, ...gameInfo } = gameData;

    const existingGame = await prisma.game.findUnique({
      where: { slug: gameData.slug },
    });

    if (existingGame) {
      console.log(`⊘ Game "${gameData.title}" already exists, skipping...`);
      continue;
    }

    const game = await prisma.game.create({
      data: {
        ...gameInfo,
        developerId: developer.id,
        platforms: platforms as any,
      },
    });

    // Create tags
    for (const tagName of tags) {
      let tag = await prisma.tag.findUnique({
        where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-'),
          },
        });
      }

      await prisma.gameTag.create({
        data: {
          gameId: game.id,
          tagId: tag.id,
        },
      });
    }

    console.log(`✓ Created game: ${game.title} ($${(game.priceCents / 100).toFixed(2)})`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\nTest accounts created:');
  console.log('Developer: dev@shaderhouse.com / password');
  console.log('\nGames created:', games.length);
}

seedGames()
  .catch((e) => {
    console.error('Error seeding games:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

