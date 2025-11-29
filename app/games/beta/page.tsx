"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Particles from "@/components/fx/Particles";
import { FlaskConical, Lock, Crown, Users } from "lucide-react";
import { FeatureFlag, hasFeatureAccess, SubscriptionTier } from "@/lib/subscriptions/types";
import { FeatureGuard } from "@/components/subscriptions/FeatureGuard";

interface BetaGame {
  id: string;
  title: string;
  developer: string;
  description: string;
  coverUrl: string;
  testingPhase: 'alpha' | 'beta' | 'release-candidate';
  testersCount: number;
  feedbackCount: number;
  slug: string;
  externalUrl: string | null;
}

export default function BetaAccessPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [betaGames, setBetaGames] = useState<BetaGame[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/auth/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);

        // Mock beta games data
        setBetaGames([
          {
            id: '1',
            title: 'Neon Rogue Beta',
            developer: 'Pixel Studios',
            description: 'Testing new procedural generation system and combat mechanics',
            coverUrl: '/placeholder-game.jpg',
            testingPhase: 'beta',
            testersCount: 45,
            feedbackCount: 127,
            slug: 'neon-rogue',
            externalUrl: 'https://example.com/game',
          },
          {
            id: '2',
            title: 'Space Trader Alpha',
            developer: 'Cosmic Games',
            description: 'Early alpha testing - economy balancing and multiplayer features',
            coverUrl: '/placeholder-game.jpg',
            testingPhase: 'alpha',
            testersCount: 12,
            feedbackCount: 34,
            slug: 'space-trader',
            externalUrl: 'https://example.com/game',
          },
          {
            id: '3',
            title: 'Dungeon Master RC',
            developer: 'Cave Devs',
            description: 'Release candidate - final bug testing before launch',
            coverUrl: '/placeholder-game.jpg',
            testingPhase: 'release-candidate',
            testersCount: 89,
            feedbackCount: 245,
            slug: 'dungeon-master',
            externalUrl: 'https://example.com/game',
          },
        ]);
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Particles />
        <p style={{ color: "rgba(200, 240, 200, 0.7)", fontFamily: '"Press Start 2P", monospace', fontSize: '12px' }}>
          Loading...
        </p>
      </div>
    );
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'alpha':
        return { bg: 'rgba(255, 100, 100, 0.2)', border: 'rgba(255, 150, 150, 0.4)', text: 'rgba(255, 180, 180, 0.95)' };
      case 'beta':
        return { bg: 'rgba(100, 150, 255, 0.2)', border: 'rgba(150, 180, 255, 0.4)', text: 'rgba(180, 200, 255, 0.95)' };
      case 'release-candidate':
        return { bg: 'rgba(150, 255, 100, 0.2)', border: 'rgba(180, 255, 150, 0.4)', text: 'rgba(200, 255, 180, 0.95)' };
      default:
        return { bg: 'rgba(150, 150, 150, 0.2)', border: 'rgba(200, 200, 200, 0.3)', text: 'rgba(220, 220, 220, 0.9)' };
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'alpha':
        return 'Alpha Test';
      case 'beta':
        return 'Beta Test';
      case 'release-candidate':
        return 'Release Candidate';
      default:
        return phase;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Particles />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-start p-6 pt-12">
        {/* Header */}
        <div className="w-full max-w-6xl mb-8">
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            <Link
              href="/profile/gamer"
              style={{
                color: "rgba(200, 240, 200, 0.75)",
                fontSize: "11px",
                fontFamily: '"Press Start 2P", monospace',
                textDecoration: "none",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(200, 240, 200, 0.95)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(200, 240, 200, 0.75)";
              }}
            >
              ← Back to Profile
            </Link>
            <Link
              href="/games"
              style={{
                color: "rgba(200, 240, 200, 0.75)",
                fontSize: "11px",
                fontFamily: '"Press Start 2P", monospace',
                textDecoration: "none",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(200, 240, 200, 0.95)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(200, 240, 200, 0.75)";
              }}
            >
              Browse All Games →
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <FlaskConical size={32} style={{ color: "rgba(150, 200, 255, 0.9)" }} />
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, rgba(150, 200, 255, 0.95) 0%, rgba(100, 150, 200, 0.85) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: '"Press Start 2P", monospace',
                textShadow: "0 0 20px rgba(150, 200, 255, 0.5)",
              }}
            >
              Beta Access
            </h1>
          </div>

          <p
            style={{
              color: "rgba(200, 240, 200, 0.7)",
              fontSize: "10px",
              fontFamily: '"Press Start 2P", monospace',
              lineHeight: "1.6",
              maxWidth: "800px",
            }}
          >
            Test upcoming games before release and provide feedback directly to developers you support
          </p>
        </div>

        <div className="w-full max-w-6xl">
          <FeatureGuard
            feature={FeatureFlag.BETA_ACCESS}
            userTier={user?.subscriptionTier as SubscriptionTier}
          >
            {/* Beta Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {betaGames.map((game) => {
                const phaseColors = getPhaseColor(game.testingPhase);
                return (
                  <div
                    key={game.id}
                    style={{
                      background: "linear-gradient(145deg, rgba(30, 50, 50, 0.45) 0%, rgba(20, 40, 40, 0.55) 100%)",
                      border: "1px solid rgba(100, 180, 200, 0.35)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(100, 180, 200, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Cover Image Placeholder */}
                    <div
                      style={{
                        width: "100%",
                        height: "180px",
                        background: "linear-gradient(135deg, rgba(50, 80, 100, 0.5) 0%, rgba(30, 60, 80, 0.7) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <FlaskConical size={48} style={{ color: "rgba(150, 200, 255, 0.3)" }} />
                      
                      {/* Phase Badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: phaseColors.bg,
                          border: `1px solid ${phaseColors.border}`,
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "8px",
                          color: phaseColors.text,
                          fontFamily: '"Press Start 2P", monospace',
                          textTransform: "uppercase",
                        }}
                      >
                        {getPhaseLabel(game.testingPhase)}
                      </div>
                    </div>

                    <div style={{ padding: "20px" }}>
                      <h3
                        style={{
                          fontSize: "14px",
                          color: "rgba(180, 230, 255, 0.95)",
                          fontFamily: '"Press Start 2P", monospace',
                          marginBottom: "8px",
                        }}
                      >
                        {game.title}
                      </h3>

                      <p
                        style={{
                          fontSize: "9px",
                          color: "rgba(150, 200, 220, 0.7)",
                          fontFamily: '"Press Start 2P", monospace',
                          marginBottom: "12px",
                        }}
                      >
                        by {game.developer}
                      </p>

                      <p
                        style={{
                          fontSize: "9px",
                          color: "rgba(200, 240, 200, 0.7)",
                          fontFamily: '"Press Start 2P", monospace',
                          lineHeight: "1.5",
                          marginBottom: "16px",
                        }}
                      >
                        {game.description}
                      </p>

                      {/* Stats */}
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          marginBottom: "16px",
                          padding: "12px",
                          background: "rgba(20, 40, 50, 0.4)",
                          borderRadius: "8px",
                          border: "1px solid rgba(100, 180, 200, 0.2)",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "8px",
                              color: "rgba(150, 200, 220, 0.6)",
                              fontFamily: '"Press Start 2P", monospace',
                              marginBottom: "4px",
                            }}
                          >
                            Testers
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "rgba(180, 230, 255, 0.95)",
                              fontFamily: '"Press Start 2P", monospace',
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <Users size={12} />
                            {game.testersCount}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "8px",
                              color: "rgba(150, 200, 220, 0.6)",
                              fontFamily: '"Press Start 2P", monospace',
                              marginBottom: "4px",
                            }}
                          >
                            Feedback
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "rgba(180, 230, 255, 0.95)",
                              fontFamily: '"Press Start 2P", monospace',
                            }}
                          >
                            {game.feedbackCount}
                          </div>
                        </div>
                      </div>

                      {/* Play Button */}
                      {game.externalUrl && (
                        <a
                          href={game.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "12px",
                            background: "linear-gradient(135deg, rgba(150, 200, 255, 0.3) 0%, rgba(100, 150, 200, 0.4) 100%)",
                            border: "1px solid rgba(180, 220, 255, 0.5)",
                            borderRadius: "8px",
                            color: "rgba(200, 240, 255, 0.95)",
                            fontSize: "10px",
                            fontFamily: '"Press Start 2P", monospace',
                            textAlign: "center",
                            textDecoration: "none",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(150, 200, 255, 0.4) 0%, rgba(100, 150, 200, 0.5) 100%)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(150, 200, 255, 0.3) 0%, rgba(100, 150, 200, 0.4) 100%)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          Join Test →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {betaGames.length === 0 && (
              <div
                style={{
                  background: "linear-gradient(145deg, rgba(30, 50, 50, 0.3) 0%, rgba(20, 40, 40, 0.4) 100%)",
                  border: "1px solid rgba(100, 180, 200, 0.3)",
                  borderRadius: "12px",
                  padding: "48px",
                  textAlign: "center",
                }}
              >
                <FlaskConical size={64} style={{ color: "rgba(150, 200, 255, 0.3)", margin: "0 auto 24px" }} />
                <h3
                  style={{
                    fontSize: "14px",
                    color: "rgba(180, 230, 255, 0.9)",
                    fontFamily: '"Press Start 2P", monospace',
                    marginBottom: "12px",
                  }}
                >
                  No Beta Tests Available
                </h3>
                <p
                  style={{
                    fontSize: "10px",
                    color: "rgba(200, 240, 200, 0.7)",
                    fontFamily: '"Press Start 2P", monospace',
                    lineHeight: "1.6",
                  }}
                >
                  Support developers to get access to their beta builds
                </p>
              </div>
            )}
          </FeatureGuard>
        </div>
      </main>
    </div>
  );
}

