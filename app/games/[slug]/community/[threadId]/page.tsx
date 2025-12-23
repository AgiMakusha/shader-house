import { Suspense } from 'react';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import Particles from '@/components/fx/Particles';
import { ThreadDetailClient } from './ThreadDetailClient';

interface PageProps {
  params: Promise<{ slug: string; threadId: string }>;
  searchParams: Promise<{ viewOnly?: string }>;
}

export default async function ThreadDetailPage({ params, searchParams }: PageProps) {
  const session = await getSession();
  const { slug, threadId } = await params;
  const { viewOnly } = await searchParams;
  const isViewOnly = viewOnly === 'true';

  // Get game
  const game = await prisma.game.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      developerId: true,
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
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/community"
              className="text-sm hover:underline"
              style={{ color: 'rgba(180, 240, 180, 0.7)' }}
            >
              ← Back to Community Hub
            </Link>
            <span style={{ color: 'rgba(150, 180, 150, 0.5)' }}>•</span>
            <Link
              href={isViewOnly ? `/games/${slug}/community?viewOnly=true` : `/games/${slug}/community`}
              className="text-sm hover:underline"
              style={{ color: 'rgba(180, 240, 180, 0.7)' }}
            >
              Back to {game.title} Community
            </Link>
          </div>
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
                VIEW ONLY MODE - {session?.user?.role === 'DEVELOPER' ? 'You can browse and comment in discussions' : 'You can browse discussions but cannot comment'}
              </p>
            </div>
          </div>
        )}

        {/* Client Component for Thread Detail */}
        <Suspense fallback={<div>Loading thread...</div>}>
          <ThreadDetailClient
            threadId={threadId}
            gameId={game.id}
            gameSlug={game.slug}
            gameDeveloperId={game.developerId}
            isDeveloper={isDeveloper}
            isLoggedIn={!!session?.user}
            userId={session?.user?.id}
            userLevel={session?.user?.level || 1}
            userRole={session?.user?.role}
            viewOnly={isViewOnly}
          />
        </Suspense>
      </div>
    </div>
  );
}





