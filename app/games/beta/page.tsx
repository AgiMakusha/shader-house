"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Particles from "@/components/fx/Particles";
import { FlaskConical, Lock, Crown, Users, Shield } from "lucide-react";
import { FeatureFlag, hasFeatureAccess, SubscriptionTier } from "@/lib/subscriptions/types";
import { FeatureGuard } from "@/components/subscriptions/FeatureGuard";
import { useToast } from "@/hooks/useToast";
import NdaModal from "@/components/beta/NdaModal";

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

interface NdaStatus {
  hasAccepted: boolean;
  gameTitle: string;
  developerName: string;
}

export default function BetaAccessPage() {
  const router = useRouter();
  const { success, error, ToastComponent } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [betaGames, setBetaGames] = useState<BetaGame[]>([]);
  const [joinedTests, setJoinedTests] = useState<Set<string>>(new Set());
  const [joiningGame, setJoiningGame] = useState<string | null>(null);
  
  // NDA Modal State
  const [ndaModalOpen, setNdaModalOpen] = useState(false);
  const [ndaGameId, setNdaGameId] = useState<string | null>(null);
  const [ndaStatus, setNdaStatus] = useState<NdaStatus | null>(null);
  const [ndaAccepted, setNdaAccepted] = useState<Set<string>>(new Set());
  const [checkingNda, setCheckingNda] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);

        // Fetch real beta games from API
        const gamesResponse = await fetch("/api/games/beta");
        let games: BetaGame[] = [];
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          games = gamesData.games || [];
          setBetaGames(games);
        }

        // Fetch joined tests to show status
        const testsResponse = await fetch("/api/beta/my-tests");
        if (testsResponse.ok) {
          const testsData = await testsResponse.json();
          const joined = new Set(testsData.tests.map((t: any) => t.gameId));
          setJoinedTests(joined);
        }
        
        // Check NDA status for all beta games
        if (games.length > 0) {
          // Check NDA for each game in parallel
          const ndaChecks = await Promise.all(
            games.map(async (game: BetaGame) => {
              try {
                const ndaRes = await fetch(`/api/beta/nda/${game.id}`);
                if (ndaRes.ok) {
                  const ndaData = await ndaRes.json();
                  return { gameId: game.id, hasAccepted: ndaData.hasAccepted };
                }
              } catch {
                return { gameId: game.id, hasAccepted: false };
              }
              return { gameId: game.id, hasAccepted: false };
            })
          );
          
          const acceptedNdas = new Set(
            ndaChecks.filter(c => c.hasAccepted).map(c => c.gameId)
          );
          setNdaAccepted(acceptedNdas);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Check NDA status for a game
  const checkNdaStatus = async (gameId: string): Promise<NdaStatus | null> => {
    try {
      const response = await fetch(`/api/beta/nda/${gameId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (err) {
      console.error("Error checking NDA status:", err);
      return null;
    }
  };

  // Handle NDA acceptance
  const handleNdaAccept = async () => {
    if (!ndaGameId) return;
    
    try {
      const response = await fetch(`/api/beta/nda/${ndaGameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true }),
      });

      if (response.ok) {
        // NDA accepted, update state and close modal
        setNdaAccepted(prev => new Set([...prev, ndaGameId]));
        setNdaModalOpen(false);
        
        // Now automatically join the beta
        const game = betaGames.find(g => g.id === ndaGameId);
        if (game) {
          success(`NDA accepted! Joining beta test for "${game.title}"...`);
          // Slight delay for better UX
          setTimeout(() => {
            completeJoinBeta(ndaGameId, game.title);
          }, 500);
        }
      } else {
        const data = await response.json();
        error(data.error || "Failed to accept NDA");
      }
    } catch (err) {
      console.error("Error accepting NDA:", err);
      error("An error occurred while accepting the NDA");
    }
  };

  // Complete the beta join after NDA is accepted
  const completeJoinBeta = async (gameId: string, gameTitle: string) => {
    setJoiningGame(gameId);

    try {
      const response = await fetch("/api/beta/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      if (response.ok) {
        setJoinedTests(prev => new Set([...prev, gameId]));
        success(`Successfully joined beta test for "${gameTitle}"! Go to "My Beta Tests" to start testing.`);
      } else {
        const data = await response.json();
        error(data.error || "Failed to join beta test");
      }
    } catch (err) {
      console.error("Error joining beta:", err);
      error("An error occurred while joining the beta test");
    } finally {
      setJoiningGame(null);
    }
  };

  const handleJoinBeta = async (gameId: string, gameTitle: string) => {
    setJoiningGame(gameId);
    setCheckingNda(true);

    try {
      // First check if NDA is already accepted
      if (ndaAccepted.has(gameId)) {
        // Already accepted in this session, proceed to join
        await completeJoinBeta(gameId, gameTitle);
        return;
      }

      // Check NDA status from API
      const status = await checkNdaStatus(gameId);
      
      if (status?.hasAccepted) {
        // NDA already accepted, proceed to join
        setNdaAccepted(prev => new Set([...prev, gameId]));
        await completeJoinBeta(gameId, gameTitle);
      } else {
        // Need to show NDA modal
        setNdaGameId(gameId);
        setNdaStatus(status);
        setNdaModalOpen(true);
        setJoiningGame(null);
      }
    } catch (err) {
      console.error("Error checking NDA:", err);
      error("An error occurred while checking NDA status");
      setJoiningGame(null);
    } finally {
      setCheckingNda(false);
    }
  };

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
              ← Back to Gamer Hub
            </Link>
            <Link
              href="/profile/gamer/beta"
              style={{
                color: "rgba(150, 200, 255, 0.85)",
                fontSize: "11px",
                fontFamily: '"Press Start 2P", monospace',
                textDecoration: "none",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(150, 220, 255, 0.95)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(150, 200, 255, 0.85)";
              }}
            >
              My Beta Tests →
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

                      {/* NDA Required Badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "12px",
                          padding: "8px 12px",
                          background: ndaAccepted.has(game.id)
                            ? "rgba(100, 200, 100, 0.1)"
                            : "rgba(100, 180, 200, 0.1)",
                          border: `1px solid ${ndaAccepted.has(game.id) ? "rgba(150, 250, 150, 0.3)" : "rgba(100, 180, 200, 0.3)"}`,
                          borderRadius: "6px",
                        }}
                      >
                        <Shield size={12} style={{ 
                          color: ndaAccepted.has(game.id) 
                            ? "rgba(150, 250, 150, 0.8)" 
                            : "rgba(100, 180, 200, 0.7)" 
                        }} />
                        <span
                          style={{
                            fontSize: "8px",
                            color: ndaAccepted.has(game.id)
                              ? "rgba(150, 250, 150, 0.9)"
                              : "rgba(150, 200, 220, 0.8)",
                            fontFamily: '"Press Start 2P", monospace',
                          }}
                        >
                          {ndaAccepted.has(game.id) ? "NDA Accepted" : "NDA Required"}
                        </span>
                      </div>

                      {/* Join Beta Button */}
                      {joinedTests.has(game.id) ? (
                        <Link
                          href="/profile/gamer/beta"
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "12px",
                            background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.4) 100%)",
                            border: "1px solid rgba(150, 250, 150, 0.5)",
                            borderRadius: "8px",
                            color: "rgba(200, 255, 200, 0.95)",
                            fontSize: "10px",
                            fontFamily: '"Press Start 2P", monospace',
                            textAlign: "center",
                            textDecoration: "none",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.5) 100%)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.4) 100%)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          Joined • Go to Dashboard
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleJoinBeta(game.id, game.title)}
                          disabled={joiningGame === game.id || checkingNda}
                          style={{
                            width: "100%",
                            padding: "12px",
                            background: joiningGame === game.id || checkingNda
                              ? "linear-gradient(135deg, rgba(150, 200, 255, 0.2) 0%, rgba(100, 150, 200, 0.3) 100%)"
                              : "linear-gradient(135deg, rgba(150, 200, 255, 0.3) 0%, rgba(100, 150, 200, 0.4) 100%)",
                            border: "1px solid rgba(180, 220, 255, 0.5)",
                            borderRadius: "8px",
                            color: "rgba(200, 240, 255, 0.95)",
                            fontSize: "10px",
                            fontFamily: '"Press Start 2P", monospace',
                            textAlign: "center",
                            cursor: joiningGame === game.id || checkingNda ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            opacity: joiningGame === game.id || checkingNda ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                          onMouseEnter={(e) => {
                            if (joiningGame !== game.id && !checkingNda) {
                              e.currentTarget.style.background = "linear-gradient(135deg, rgba(150, 200, 255, 0.4) 0%, rgba(100, 150, 200, 0.5) 100%)";
                              e.currentTarget.style.transform = "translateY(-2px)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (joiningGame !== game.id && !checkingNda) {
                              e.currentTarget.style.background = "linear-gradient(135deg, rgba(150, 200, 255, 0.3) 0%, rgba(100, 150, 200, 0.4) 100%)";
                              e.currentTarget.style.transform = "translateY(0)";
                            }
                          }}
                        >
                          {joiningGame === game.id ? (
                            "Joining..."
                          ) : checkingNda ? (
                            "Checking..."
                          ) : ndaAccepted.has(game.id) ? (
                            <>Join Beta Test</>
                          ) : (
                            <>
                              <Shield size={12} />
                              Review NDA & Join
                            </>
                          )}
                        </button>
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

      {/* Toast Notifications */}
      <ToastComponent />

      {/* NDA Modal */}
      <NdaModal
        isOpen={ndaModalOpen}
        onClose={() => {
          setNdaModalOpen(false);
          setNdaGameId(null);
          setNdaStatus(null);
        }}
        onAccept={handleNdaAccept}
        gameTitle={ndaStatus?.gameTitle || betaGames.find(g => g.id === ndaGameId)?.title || "Unknown Game"}
        developerName={ndaStatus?.developerName || betaGames.find(g => g.id === ndaGameId)?.developer || "Unknown Developer"}
        isLoading={joiningGame === ndaGameId}
      />
    </div>
  );
}

