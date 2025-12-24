import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Eye, Download } from "lucide-react";

import { getGameBySlug } from "@/lib/queries/games";
import { getSession } from "@/lib/auth/session";
import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { FavoriteButton } from "@/components/games/FavoriteButton";
import { RatingForm } from "@/components/games/RatingForm";
import { RatingDisplay } from "@/components/games/RatingDisplay";
import { PurchaseButton } from "@/components/games/PurchaseButton";
import { GameAccessTracker } from "@/components/games/GameAccessTracker";
import { RecentReviews } from "@/components/games/RecentReviews";
import { SimilarGames } from "@/components/games/SimilarGames";
import { VersionHistory } from "@/components/games/VersionHistory";
import ReportButton from "@/components/reports/ReportButton";
import { TipButton } from "@/components/payments";
import { DeveloperNameLink } from "./DeveloperNameLink";


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    viewOnly?: string;
  }>;
}

export default async function GameDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { viewOnly } = await searchParams;
  const session = await getSession();
  const game = await getGameBySlug(slug, session?.user?.id);
  const isViewOnly = viewOnly === 'true';

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
      {session?.user?.id && !isViewOnly && <GameAccessTracker gameId={game.id} />}

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12">
        {/* View-Only Banner */}
        {isViewOnly && (
          <div className="w-full max-w-6xl mb-6">
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
                VIEW ONLY MODE - You can browse games and participate in discussions
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="w-full max-w-6xl mb-8 flex items-center justify-between">
          <Link
            href={isViewOnly ? "/games?viewOnly=true" : "/games"}
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
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1
                      className="text-4xl font-bold pixelized"
                      style={{
                        textShadow: "0 0 12px rgba(120, 200, 120, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.9)",
                        color: "rgba(180, 220, 180, 0.95)",
                      }}
                    >
                      {game.title}
                    </h1>
                    {session?.user && !isOwner && !isViewOnly && (
                      <TipButton
                        developerId={game.developerId}
                        developerName={game.developer.name}
                        variant="small"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span
                        className="text-lg"
                        style={{ color: "rgba(200, 240, 200, 0.7)" }}
                      >
                        by{" "}
                      </span>
                      <DeveloperNameLink
                        developerId={game.developerId}
                        developerName={game.developer.name}
                      />
                    </div>

                    {/* Compact Rating Display */}
                    <div className="flex items-center gap-2">
                      {/* Star Display */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const fillPercentage = Math.min(Math.max(game.avgRating - (star - 1), 0), 1) * 100;
                          const isActive = fillPercentage > 0;
                          return (
                            <div 
                              key={star} 
                              className="relative w-5 h-5"
                              style={{
                                filter: isActive 
                                  ? "drop-shadow(0 0 4px rgba(250, 220, 100, 0.6))"
                                  : "none"
                              }}
                            >
                              {/* Empty star */}
                              <svg
                                className="absolute inset-0 w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="rgba(200, 240, 200, 0.3)"
                                strokeWidth="1.5"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              {/* Filled star */}
                              <svg
                                className="absolute inset-0 w-5 h-5"
                                viewBox="0 0 24 24"
                                style={{
                                  clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`,
                                }}
                              >
                                <path
                                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                  fill="rgba(250, 220, 100, 0.95)"
                                  stroke="rgba(250, 220, 100, 0.95)"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Numeric Rating */}
                      <span
                        className="text-lg font-bold"
                        style={{ color: "rgba(200, 240, 200, 0.9)" }}
                      >
                        {game.avgRating > 0 ? game.avgRating.toFixed(1) : 'N/A'}
                      </span>
                      
                      {/* Review Count */}
                      {game._count.ratings > 0 && (
                        <span
                          className="text-sm"
                          style={{ color: "rgba(200, 240, 200, 0.6)" }}
                        >
                          ({game._count.ratings} {game._count.ratings === 1 ? 'review' : 'reviews'})
                        </span>
                      )}
                    </div>
                  </div>
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
                      {game.screenshots.map((screenshot: string, index: number) => (
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

                {session?.user && !isOwner && !isViewOnly && (
                  <RatingForm
                    gameId={game.id}
                    userRating={game.userRating}
                  />
                )}

                {/* Recent Reviews */}
                {game.ratings.length > 0 && (
                  <RecentReviews reviews={game.ratings} />
                )}
              </GameCardContent>
            </GameCard>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <GameCard>
              <GameCardContent className="p-6">
                {/* Price */}
                <p
                  className="text-3xl font-bold pixelized text-center mb-5"
                  style={{
                    textShadow: "0 0 10px rgba(120, 200, 120, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.9)",
                    color: "rgba(150, 250, 150, 0.95)",
                  }}
                >
                  {price}
                </p>
                
                {/* Action Buttons - Stacked */}
                <div className="flex flex-col gap-3">
                  {session?.user && !isViewOnly && session.user.role !== 'DEVELOPER' && (
                    <PurchaseButton
                      gameId={game.id}
                      priceCents={game.priceCents}
                      gameFileUrl={game.gameFileUrl}
                      externalUrl={game.externalUrl}
                      isPurchased={game.isPurchased}
                      userTier={userTier as any}
                    />
                  )}
                  
                  {(!isViewOnly || session?.user?.role === 'DEVELOPER') && (
                    <>
                      {/* Community Link */}
                      <Link
                        href={isViewOnly ? `/games/${game.slug}/community?viewOnly=true` : `/games/${game.slug}/community`}
                        className="w-full px-5 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-sm hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: "linear-gradient(135deg, rgba(100, 180, 100, 0.25) 0%, rgba(80, 160, 80, 0.15) 100%)",
                          border: "1px solid rgba(180, 240, 180, 0.35)",
                          color: "rgba(200, 240, 200, 0.95)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
                        }}
                      >
                        <MessageSquare size={16} style={{ color: "rgba(200, 240, 200, 0.9)" }} />
                        Community Discussion
                      </Link>
                      
                      {!session?.user && (
                        <Link
                          href="/login"
                          className="w-full px-5 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all flex items-center justify-center text-sm hover:scale-[1.02] active:scale-[0.98]"
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
                    </>
                  )}
                  
                  {session?.user && !isViewOnly && (
                    <FavoriteButton
                      gameId={game.id}
                      initialFavorited={game.isFavorited}
                      initialCount={game._count.favorites}
                    />
                  )}
                </div>
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
                      {game.platforms.map((platform: string) => (
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
                      {game.gameTags.map(({ tag }: { tag: { slug: string; name: string } }) => (
                        <Link
                          key={tag.slug}
                          href={isViewOnly ? `/games?tags=${tag.slug}&viewOnly=true` : `/games?tags=${tag.slug}`}
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

                  {game.downloads > 0 && (
                    <div>
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: "rgba(200, 240, 200, 0.6)" }}
                      >
                        Downloads
                      </p>
                      <p
                        className="text-sm font-semibold flex items-center gap-1"
                        style={{ color: "rgba(200, 240, 200, 0.9)" }}
                      >
                        <Download size={12} />
                        {game.downloads.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {game.currentVersion && game.currentVersion !== "1.0.0" && (
                    <div>
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: "rgba(200, 240, 200, 0.6)" }}
                      >
                        Version
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "rgba(200, 240, 200, 0.9)" }}
                      >
                        v{game.currentVersion}
                      </p>
                    </div>
                  )}

                  {/* Report Game Button */}
                  {session?.user && !isOwner && !isViewOnly && (
                    <div className="pt-2 border-t border-white/10">
                      <ReportButton
                        type="GAME"
                        targetId={game.id}
                        targetName={game.title}
                        variant="full"
                      />
                    </div>
                  )}
                </div>
              </GameCardContent>
            </GameCard>

            {/* Version History */}
            <VersionHistory gameId={game.id} currentVersion={game.currentVersion} />

            {/* Similar Games */}
            <SimilarGames gameId={game.id} limit={4} />
          </div>
        </div>
      </main>
    </div>
  );
}

