import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getGameBySlug } from "@/lib/queries/games";
import { getSession } from "@/lib/auth/session";
import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { FavoriteButton } from "@/components/games/FavoriteButton";
import { RatingForm } from "@/components/games/RatingForm";
import { RatingDisplay } from "@/components/games/RatingDisplay";
import { PurchaseButton } from "@/components/games/PurchaseButton";
import { GameAccessTracker } from "@/components/games/GameAccessTracker";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getSession();
  const game = await getGameBySlug(slug, session?.user?.id);

  if (!game) {
    notFound();
  }

  // Fetch user's subscription tier if logged in
  let userTier: string | null = null;
  if (session?.user?.id) {
    const { prisma } = await import("@/lib/db/prisma");
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    });
    userTier = user?.subscriptionTier || 'FREE';
  }

  const price = game.priceCents === 0 ? 'Free' : `$${(game.priceCents / 100).toFixed(2)}`;
  const isOwner = session?.user?.id === game.developerId;

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      {/* Track game access for achievements (invisible component) */}
      {session?.user?.id && <GameAccessTracker gameId={game.id} />}

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12">
        {/* Header */}
        <div className="w-full max-w-6xl mb-8 flex items-center justify-between">
          <Link
            href="/games"
            className="text-sm font-semibold uppercase tracking-wider hover:underline transition-all"
            style={{ color: "rgba(200, 240, 200, 0.75)" }}
          >
            ← Back to Games
          </Link>
          
          {isOwner && (
            <Link
              href={`/dashboard/games/${game.id}/edit`}
              className="px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                border: "1px solid rgba(200, 240, 200, 0.3)",
                color: "rgba(200, 240, 200, 0.95)",
              }}
            >
              Edit Game
            </Link>
          )}
        </div>

        {/* Main Content */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <GameCard>
              <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
                <Image
                  src={game.coverUrl}
                  alt={game.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
              <GameCardContent className="p-8 space-y-6">
                {/* Title and Developer */}
                <div>
                  <h1
                    className="text-4xl font-bold mb-2 pixelized"
                    style={{
                      textShadow: "0 0 12px rgba(120, 200, 120, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.9)",
                      color: "rgba(180, 220, 180, 0.95)",
                    }}
                  >
                    {game.title}
                  </h1>
                  <p
                    className="text-lg"
                    style={{ color: "rgba(200, 240, 200, 0.7)" }}
                  >
                    by{" "}
                    <span className="font-semibold" style={{ color: "rgba(150, 250, 150, 0.9)" }}>
                      {game.developer.name}
                    </span>
                  </p>
                </div>

                {/* Tagline */}
                <p
                  className="text-xl font-semibold"
                  style={{ color: "rgba(200, 240, 200, 0.85)" }}
                >
                  {game.tagline}
                </p>

                {/* Description */}
                <div>
                  <h2
                    className="text-xl font-bold mb-3 pixelized"
                    style={{
                      textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                      color: "rgba(180, 220, 180, 0.95)",
                    }}
                  >
                    About This Game
                  </h2>
                  <p
                    className="whitespace-pre-wrap leading-relaxed"
                    style={{ color: "rgba(200, 240, 200, 0.8)" }}
                  >
                    {game.description}
                  </p>
                </div>

                {/* Screenshots */}
                {game.screenshots.length > 0 && (
                  <div>
                    <h2
                      className="text-xl font-bold mb-4 pixelized"
                      style={{
                        textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                        color: "rgba(180, 220, 180, 0.95)",
                      }}
                    >
                      Screenshots
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {game.screenshots.map((screenshot, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={screenshot}
                            alt={`${game.title} screenshot ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GameCardContent>
            </GameCard>

            {/* Ratings Section */}
            <GameCard>
              <GameCardContent className="p-8 space-y-6">
                <h2
                  className="text-2xl font-bold pixelized"
                  style={{
                    textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                    color: "rgba(180, 220, 180, 0.95)",
                  }}
                >
                  Ratings & Reviews
                </h2>

                <RatingDisplay
                  avgRating={game.avgRating}
                  totalRatings={game._count.ratings}
                  distribution={game.ratingDistribution}
                />

                {session?.user && !isOwner && (
                  <RatingForm
                    gameId={game.id}
                    userRating={game.userRating}
                  />
                )}

                {/* Recent Reviews */}
                {game.ratings.length > 0 && (
                  <div className="space-y-4 pt-6 border-t" style={{ borderColor: "rgba(200, 240, 200, 0.2)" }}>
                    <h3
                      className="text-lg font-bold pixelized"
                      style={{ color: "rgba(180, 220, 180, 0.9)" }}
                    >
                      Recent Reviews
                    </h3>
                    {game.ratings.map((rating) => (
                      <div
                        key={rating.id}
                        className="p-4 rounded-lg"
                        style={{
                          background: "rgba(100, 200, 100, 0.05)",
                          border: "1px solid rgba(200, 240, 200, 0.15)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {rating.user.image && (
                              <Image
                                src={rating.user.image}
                                alt={(rating.user as any).displayName || rating.user.name || 'User'}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            )}
                            <span
                              className="font-semibold"
                              style={{ color: "rgba(200, 240, 200, 0.9)" }}
                            >
                              {(rating.user as any).displayName || rating.user.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className="w-4 h-4"
                                fill={star <= rating.stars ? "currentColor" : "none"}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{
                                  color: star <= rating.stars
                                    ? "rgba(250, 200, 100, 0.9)"
                                    : "rgba(200, 240, 200, 0.3)",
                                }}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                              </svg>
                            ))}
                          </div>
                        </div>
                        {rating.comment && (
                          <p
                            className="text-sm"
                            style={{ color: "rgba(200, 240, 200, 0.75)" }}
                          >
                            {rating.comment}
                          </p>
                        )}
                        <p
                          className="text-xs mt-2"
                          style={{ color: "rgba(200, 240, 200, 0.5)" }}
                        >
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </GameCardContent>
            </GameCard>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <GameCard>
              <GameCardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p
                    className="text-3xl font-bold pixelized mb-2"
                    style={{
                      textShadow: "0 0 10px rgba(120, 200, 120, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.9)",
                      color: "rgba(150, 250, 150, 0.95)",
                    }}
                  >
                    {price}
                  </p>
                  {session?.user && (
                    <PurchaseButton
                      gameId={game.id}
                      priceCents={game.priceCents}
                      gameFileUrl={game.gameFileUrl}
                      externalUrl={game.externalUrl}
                      isPurchased={game.isPurchased}
                      userTier={userTier as any}
                    />
                  )}
                  {!session?.user && (
                    <Link
                      href="/login"
                      className="block w-full px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all text-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
                        border: "1px solid rgba(200, 240, 200, 0.4)",
                        color: "rgba(200, 240, 200, 0.95)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      Login to Purchase
                    </Link>
                  )}
                </div>

                {session?.user && (
                  <FavoriteButton
                    gameId={game.id}
                    initialFavorited={game.isFavorited}
                    initialCount={game._count.favorites}
                  />
                )}
              </GameCardContent>
            </GameCard>

            {/* Info Card */}
            <GameCard>
              <GameCardContent className="p-6 space-y-4">
                <h3
                  className="text-lg font-bold pixelized"
                  style={{
                    textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                    color: "rgba(180, 220, 180, 0.95)",
                  }}
                >
                  Game Info
                </h3>

                <div className="space-y-3">
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: "rgba(200, 240, 200, 0.6)" }}
                    >
                      Platforms
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {game.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            background: "rgba(100, 200, 100, 0.2)",
                            color: "rgba(150, 250, 150, 0.9)",
                            border: "1px solid rgba(200, 240, 200, 0.2)",
                          }}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: "rgba(200, 240, 200, 0.6)" }}
                    >
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {game.gameTags.map(({ tag }) => (
                        <Link
                          key={tag.slug}
                          href={`/games?tags=${tag.slug}`}
                          className="px-2 py-1 rounded text-xs font-semibold hover:opacity-80 transition-opacity"
                          style={{
                            background: "rgba(100, 200, 100, 0.2)",
                            color: "rgba(150, 250, 150, 0.9)",
                            border: "1px solid rgba(200, 240, 200, 0.2)",
                          }}
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: "rgba(200, 240, 200, 0.6)" }}
                    >
                      Released
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "rgba(200, 240, 200, 0.9)" }}
                    >
                      {new Date(game.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: "rgba(200, 240, 200, 0.6)" }}
                    >
                      Views
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "rgba(200, 240, 200, 0.9)" }}
                    >
                      {game.views.toLocaleString()}
                    </p>
                  </div>
                </div>
              </GameCardContent>
            </GameCard>
          </div>
        </div>
      </main>
    </div>
  );
}

