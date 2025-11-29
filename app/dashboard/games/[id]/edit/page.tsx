import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameForm } from "@/components/games/GameForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGamePage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Normalize role to uppercase (handles legacy lowercase roles)
  const userRole = session.user.role?.toUpperCase();
  if (userRole !== "DEVELOPER") {
    redirect("/profile/gamer");
  }

  // Fetch game with tags
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      gameTags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!game) {
    notFound();
  }

  // Check ownership
  if (game.developerId !== session.user.id) {
    redirect("/profile/developer");
  }

  const initialData = {
    id: game.id,
    title: game.title,
    tagline: game.tagline,
    description: game.description,
    coverUrl: game.coverUrl,
    screenshots: game.screenshots,
    priceCents: game.priceCents,
    platforms: game.platforms,
    gameFileUrl: game.gameFileUrl || '',
    externalUrl: game.externalUrl || '',
    releaseStatus: game.releaseStatus,
    tags: game.gameTags.map(gt => gt.tag.name),
  };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12">
        {/* Header */}
        <div className="w-full max-w-4xl mb-8 flex items-center justify-between">
          <div>
            <p
              className="text-xs uppercase tracking-[0.3em] pixelized"
              style={{ color: "rgba(200, 240, 200, 0.6)" }}
            >
              Dashboard
            </p>
            <h1
              className="text-4xl font-bold tracking-wider uppercase pixelized"
              style={{
                textShadow: `
                  0 0 12px rgba(120, 200, 120, 0.8),
                  0 0 24px rgba(100, 180, 100, 0.6),
                  2px 2px 0px rgba(0, 0, 0, 0.9)
                `,
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              Edit Game
            </h1>
            <p
              className="mt-2 text-sm pixelized"
              style={{
                color: "rgba(200, 240, 200, 0.65)",
                textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)",
              }}
            >
              Update your game information
            </p>
          </div>

          <Link
            href={`/games/${game.slug}`}
            className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all"
            style={{ color: "rgba(200, 240, 200, 0.75)" }}
          >
            ← Back to Game
          </Link>
        </div>

        {/* Form */}
        <div className="w-full max-w-4xl mb-12">
          <GameCard>
            <GameCardContent className="p-8">
              <GameForm mode="edit" initialData={initialData} />
            </GameCardContent>
          </GameCard>
        </div>
      </main>
    </div>
  );
}



