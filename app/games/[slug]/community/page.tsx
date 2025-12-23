import { Suspense } from 'react';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { GameCommunityClient } from './GameCommunityClient';
import Particles from '@/components/fx/Particles';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string; page?: string; viewOnly?: string }>;
}

export default async function GameCommunityPage({ params, searchParams }: PageProps) {
  const session = await getSession();
  const { slug } = await params;
  const { category, page, viewOnly } = await searchParams;
  const isViewOnly = viewOnly === 'true';

  // Get game
  const game = await prisma.game.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      developerId: true,
      developer: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
    },
  });

  if (!game) {
    notFound();
  }

  const isDeveloper = session?.user?.id === game.developerId;

  return (
    <div className="min-h-screen relative" style={{ background: 'rgba(20, 30, 20, 0.95)' }}>
      <Particles />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={isViewOnly ? `/games/${slug}?viewOnly=true` : `/games/${slug}`}
              className="text-sm hover:underline"
              style={{ color: 'rgba(180, 240, 180, 0.7)' }}
            >
              ← Back to {game.title}
            </Link>
            
            {session?.user && (
              <Link
                href={session.user.role === 'DEVELOPER' ? '/profile/developer' : '/profile/gamer'}
                className="text-sm hover:underline"
                style={{ color: 'rgba(180, 240, 180, 0.7)' }}
              >
                {session.user.role === 'DEVELOPER' ? 'Back to Developer Hub' : 'Back to Gamer Hub'} →
              </Link>
            )}
          </div>

          <h1
            className="text-4xl font-bold mb-2 pixelized"
            style={{
              color: 'rgba(180, 240, 180, 0.95)',
              textShadow: '0 0 12px rgba(120, 200, 120, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.8)',
            }}
          >
            {game.title} - Community
          </h1>
          <p style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
            Discuss, share feedback, and connect with other players
          </p>
        </div>

        {/* View-Only Banner */}
        {isViewOnly && (
          <div className="mb-6">
            <div
              className="px-6 py-4 rounded-lg border"
              style={{
                background: "linear-gradient(135deg, rgba(250, 200, 100, 0.2) 0%, rgba(230, 180, 80, 0.15) 100%)",
                borderColor: "rgba(250, 200, 100, 0.4)",
              }}
            >
              <p
                className="text-sm font-semibold text-center pixelized flex items-center justify-center gap-2"
                style={{
                  color: "rgba(250, 220, 140, 0.95)",
                  textShadow: "0 0 6px rgba(250, 200, 100, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                }}
              >
                <Eye size={16} style={{ color: "rgba(250, 220, 140, 0.95)" }} />
                VIEW ONLY MODE - {session?.user?.role === 'DEVELOPER' ? 'You can browse and participate in discussions' : 'You can browse discussions but cannot create threads or comment'}
              </p>
            </div>
          </div>
        )}

        {/* Client Component for Discussion Board */}
        <Suspense fallback={<div>Loading discussions...</div>}>
          <GameCommunityClient
            gameId={game.id}
            gameSlug={game.slug}
            isDeveloper={isDeveloper}
            isLoggedIn={!!session?.user}
            userRole={session?.user?.role}
            initialCategory={category || 'ALL'}
            initialPage={parseInt(page || '1')}
            viewOnly={isViewOnly}
          />
        </Suspense>
      </div>
    </div>
  );
}

