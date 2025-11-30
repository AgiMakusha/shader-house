"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Particles from "@/components/fx/Particles";
import { Trophy, Star, Medal, Award, Sparkles, Lock, Gamepad2, Heart, FlaskConical, MessageSquare, Crown, Target, Users, Zap } from "lucide-react";
import { FeatureFlag, hasFeatureAccess, SubscriptionTier } from "@/lib/subscriptions/types";
import { FeatureGuard } from "@/components/subscriptions/FeatureGuard";

type IconType = 'gamepad' | 'heart' | 'flask' | 'message' | 'crown';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function AchievementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [betaStats, setBetaStats] = useState<any>(null);

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
        
        // Fetch beta testing stats
        try {
          const statsResponse = await fetch("/api/beta/stats");
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setBetaStats(statsData.stats);
          }
        } catch (error) {
          console.error("Error fetching beta stats:", error);
        }
        
        // Load achievements (mock data for now)
        setAchievements([
          {
            id: '1',
            name: 'First Steps',
            description: 'Complete your first game',
            icon: 'gamepad',
            unlocked: true,
            unlockedAt: new Date(),
            rarity: 'common',
          },
          {
            id: '2',
            name: 'Supporter',
            description: 'Support your first developer',
            icon: 'heart',
            unlocked: true,
            unlockedAt: new Date(),
            rarity: 'common',
          },
          {
            id: '3',
            name: 'Game Tester',
            description: 'Test 5 beta games',
            icon: 'flask',
            unlocked: false,
            progress: 2,
            maxProgress: 5,
            rarity: 'rare',
          },
          {
            id: '4',
            name: 'Community Leader',
            description: 'Write 10 helpful reviews',
            icon: 'message',
            unlocked: false,
            progress: 4,
            maxProgress: 10,
            rarity: 'epic',
          },
          {
            id: '5',
            name: 'Legend',
            description: 'Unlock all other achievements',
            icon: 'crown',
            unlocked: false,
            rarity: 'legendary',
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

  const getAchievementIcon = (iconType: IconType, unlocked: boolean, rarity: string) => {
    const colors = getRarityColor(rarity);
    
    // Base style for all icons
    const baseColor = unlocked ? colors.text : 'rgba(150, 150, 150, 0.4)';
    const baseFilter = unlocked 
      ? `drop-shadow(0 0 8px ${colors.text.replace('0.9', '0.6')})` 
      : "grayscale(100%) opacity(0.5)";

    switch (iconType) {
      case 'gamepad':
        // First Steps - Gaming controller with subtle pulse
        return (
          <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gamepad2 
              size={44}
              style={{
                color: baseColor,
                filter: baseFilter,
              }}
            />
          </div>
        );
      
      case 'heart':
        // Supporter - Heart with warm glow
        return (
          <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart 
              size={42}
              fill={unlocked ? colors.text.replace('0.9', '0.3') : 'transparent'}
              style={{
                color: baseColor,
                filter: unlocked ? `drop-shadow(0 0 12px ${colors.text.replace('0.9', '0.7')})` : baseFilter,
              }}
            />
          </div>
        );
      
      case 'flask':
        // Game Tester - Flask with liquid effect
        return (
          <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlaskConical 
              size={42}
              style={{
                color: baseColor,
                filter: baseFilter,
              }}
            />
            {unlocked && (
              <div style={{
                position: 'absolute',
                bottom: '8px',
                width: '16px',
                height: '16px',
                background: colors.text.replace('0.9', '0.4'),
                borderRadius: '50%',
                filter: `blur(3px)`,
              }} />
            )}
          </div>
        );
      
      case 'message':
        // Community Leader - Message with multiple layers
        return (
          <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare 
              size={44}
              style={{
                color: baseColor,
                filter: baseFilter,
              }}
            />
            <Star 
              size={16}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                color: baseColor,
                filter: unlocked ? `drop-shadow(0 0 4px ${colors.text.replace('0.9', '0.8')})` : 'none',
                opacity: unlocked ? 1 : 0,
              }}
            />
          </div>
        );
      
      case 'crown':
        // Legend - Crown with sparkle effect
        return (
          <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Crown 
              size={48}
              fill={unlocked ? colors.text.replace('0.9', '0.2') : 'transparent'}
              style={{
                color: baseColor,
                filter: unlocked 
                  ? `drop-shadow(0 0 16px ${colors.text.replace('0.9', '0.9')}) drop-shadow(0 0 8px ${colors.text.replace('0.9', '0.6')})` 
                  : baseFilter,
              }}
            />
            {unlocked && (
              <>
                <Sparkles 
                  size={14}
                  style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    color: colors.text,
                    filter: `drop-shadow(0 0 4px ${colors.text.replace('0.9', '0.8')})`,
                  }}
                />
                <Sparkles 
                  size={12}
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '2px',
                    color: colors.text,
                    opacity: 0.7,
                  }}
                />
              </>
            )}
          </div>
        );
      
      default:
        return <Star size={40} style={{ color: baseColor, filter: baseFilter }} />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return { bg: 'rgba(150, 150, 150, 0.2)', border: 'rgba(200, 200, 200, 0.3)', text: 'rgba(220, 220, 220, 0.9)' };
      case 'rare':
        return { bg: 'rgba(80, 120, 200, 0.2)', border: 'rgba(100, 150, 255, 0.3)', text: 'rgba(150, 200, 255, 0.9)' };
      case 'epic':
        return { bg: 'rgba(140, 80, 180, 0.2)', border: 'rgba(180, 100, 255, 0.3)', text: 'rgba(200, 150, 255, 0.9)' };
      case 'legendary':
        return { bg: 'rgba(220, 150, 50, 0.2)', border: 'rgba(255, 200, 100, 0.3)', text: 'rgba(255, 220, 150, 0.9)' };
      default:
        return { bg: 'rgba(150, 150, 150, 0.2)', border: 'rgba(200, 200, 200, 0.3)', text: 'rgba(220, 220, 220, 0.9)' };
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Particles />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-start p-6 pt-12">
        {/* Header */}
        <div className="w-full max-w-4xl mb-8">
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

          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, rgba(200, 240, 200, 0.95) 0%, rgba(150, 200, 150, 0.85) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "16px",
              fontFamily: '"Press Start 2P", monospace',
              textShadow: "0 0 20px rgba(200, 240, 200, 0.5)",
            }}
          >
            Achievements
          </h1>
        </div>

        <div className="w-full max-w-4xl">
          {/* Beta Testing Stats - Available to all users */}
          {betaStats && (
              <div
                style={{
                  background: "linear-gradient(145deg, rgba(40, 60, 80, 0.45) 0%, rgba(30, 50, 70, 0.55) 100%)",
                  border: "1px solid rgba(150, 200, 255, 0.35)",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <FlaskConical size={32} style={{ color: "rgba(150, 200, 255, 0.9)" }} />
                  <div>
                    <h2
                      style={{
                        fontSize: "16px",
                        color: "rgba(200, 240, 200, 0.95)",
                        fontFamily: '"Press Start 2P", monospace',
                        marginBottom: "4px",
                      }}
                    >
                      Beta Testing Stats
                    </h2>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "rgba(200, 240, 200, 0.7)",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      Your contributions across all beta tests
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Total XP */}
                  <div
                    style={{
                      background: "rgba(250, 220, 100, 0.1)",
                      border: "1px solid rgba(250, 220, 100, 0.3)",
                      borderRadius: "8px",
                      padding: "16px",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={20} style={{ color: "rgba(250, 220, 100, 0.9)" }} />
                      <span
                        style={{
                          fontSize: "9px",
                          color: "rgba(200, 240, 200, 0.7)",
                          fontFamily: '"Press Start 2P", monospace',
                        }}
                      >
                        Total XP
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "rgba(250, 220, 100, 0.95)",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      {betaStats.totalXP}
                    </p>
                  </div>

                  {/* Total Points */}
                  <div
                    style={{
                      background: "rgba(150, 200, 255, 0.1)",
                      border: "1px solid rgba(150, 200, 255, 0.3)",
                      borderRadius: "8px",
                      padding: "16px",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={20} style={{ color: "rgba(150, 200, 255, 0.9)" }} />
                      <span
                        style={{
                          fontSize: "9px",
                          color: "rgba(200, 240, 200, 0.7)",
                          fontFamily: '"Press Start 2P", monospace',
                        }}
                      >
                        Total Points
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "rgba(150, 200, 255, 0.95)",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      {betaStats.totalPoints}
                    </p>
                  </div>

                  {/* Tasks Completed */}
                  <div
                    style={{
                      background: "rgba(150, 250, 150, 0.1)",
                      border: "1px solid rgba(150, 250, 150, 0.3)",
                      borderRadius: "8px",
                      padding: "16px",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={20} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                      <span
                        style={{
                          fontSize: "9px",
                          color: "rgba(200, 240, 200, 0.7)",
                          fontFamily: '"Press Start 2P", monospace',
                        }}
                      >
                        Tasks Done
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "rgba(150, 250, 150, 0.95)",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      {betaStats.totalTasksCompleted}
                    </p>
                  </div>

                  {/* Bugs Reported */}
                  <div
                    style={{
                      background: "rgba(250, 150, 150, 0.1)",
                      border: "1px solid rgba(250, 150, 150, 0.3)",
                      borderRadius: "8px",
                      padding: "16px",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={20} style={{ color: "rgba(250, 150, 150, 0.9)" }} />
                      <span
                        style={{
                          fontSize: "9px",
                          color: "rgba(200, 240, 200, 0.7)",
                          fontFamily: '"Press Start 2P", monospace',
                        }}
                      >
                        Bugs Found
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "rgba(250, 150, 150, 0.95)",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      {betaStats.totalBugsReported}
                    </p>
                  </div>

                  {/* Games Tested */}
                  <div
                    style={{
                      background: "rgba(200, 150, 255, 0.1)",
                      border: "1px solid rgba(200, 150, 255, 0.3)",
                      borderRadius: "8px",
                      padding: "16px",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Gamepad2 size={20} style={{ color: "rgba(200, 150, 255, 0.9)" }} />
                      <span
                        style={{
                          fontSize: "9px",
                          color: "rgba(200, 240, 200, 0.7)",
                          fontFamily: '"Press Start 2P", monospace',
                        }}
                      >
                        Games Tested
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "rgba(200, 150, 255, 0.95)",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      {betaStats.totalGamesTested}
                    </p>
                  </div>

                  {/* Active Tests */}
                  <div
                    style={{
                      background: "rgba(100, 200, 200, 0.1)",
                      border: "1px solid rgba(100, 200, 200, 0.3)",
                      borderRadius: "8px",
                      padding: "16px",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={20} style={{ color: "rgba(100, 200, 200, 0.9)" }} />
                      <span
                        style={{
                          fontSize: "9px",
                          color: "rgba(200, 240, 200, 0.7)",
                          fontFamily: '"Press Start 2P", monospace',
                        }}
                      >
                        Active Tests
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "rgba(100, 200, 200, 0.95)",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      {betaStats.activeTests}
                    </p>
                  </div>
                </div>
              </div>
            )}

          <FeatureGuard
            feature={FeatureFlag.ACHIEVEMENTS}
            userTier={user?.subscriptionTier as SubscriptionTier}
          >
            {/* Progress Overview */}
            <div
              style={{
                background: "linear-gradient(145deg, rgba(30, 50, 40, 0.45) 0%, rgba(20, 40, 30, 0.55) 100%)",
                border: "1px solid rgba(140, 220, 140, 0.35)",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "32px",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Trophy size={32} style={{ color: "rgba(240, 220, 140, 0.9)" }} />
                  <div>
                    <h2
                      style={{
                        fontSize: "16px",
                        color: "rgba(200, 240, 200, 0.95)",
                        fontFamily: '"Press Start 2P", monospace',
                        marginBottom: "4px",
                      }}
                    >
                      Your Progress
                    </h2>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "rgba(200, 240, 200, 0.7)",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      {unlockedCount} of {totalCount} unlocked
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "rgba(240, 220, 140, 0.95)",
                    fontFamily: '"Press Start 2P", monospace',
                  }}
                >
                  {completionPercentage}%
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "12px",
                  background: "rgba(20, 30, 20, 0.6)",
                  borderRadius: "6px",
                  overflow: "hidden",
                  border: "1px solid rgba(140, 220, 140, 0.3)",
                }}
              >
                <div
                  style={{
                    width: `${completionPercentage}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, rgba(150, 240, 150, 0.8) 0%, rgba(100, 200, 100, 0.9) 100%)",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const colors = getRarityColor(achievement.rarity);
                return (
                  <div
                    key={achievement.id}
                    style={{
                      background: `linear-gradient(145deg, ${colors.bg} 0%, ${colors.bg} 100%)`,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "12px",
                      padding: "20px",
                      opacity: achievement.unlocked ? 1 : 0.6,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Rarity Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "8px",
                        color: colors.text,
                        fontFamily: '"Press Start 2P", monospace',
                        textTransform: "uppercase",
                      }}
                    >
                      {achievement.rarity}
                    </div>

                    <div className="flex items-start gap-4">
                      <div>
                        {getAchievementIcon(achievement.icon, achievement.unlocked, achievement.rarity)}
                      </div>

                      <div className="flex-1">
                        <h3
                          style={{
                            fontSize: "12px",
                            color: colors.text,
                            fontFamily: '"Press Start 2P", monospace',
                            marginBottom: "8px",
                          }}
                        >
                          {achievement.name}
                        </h3>
                        <p
                          style={{
                            fontSize: "9px",
                            color: "rgba(200, 240, 200, 0.7)",
                            fontFamily: '"Press Start 2P", monospace',
                            lineHeight: "1.5",
                            marginBottom: "8px",
                          }}
                        >
                          {achievement.description}
                        </p>

                        {/* Progress Bar for incomplete achievements */}
                        {!achievement.unlocked && achievement.maxProgress && (
                          <div className="mt-3">
                            <div className="flex justify-between mb-1">
                              <span
                                style={{
                                  fontSize: "8px",
                                  color: "rgba(200, 240, 200, 0.6)",
                                  fontFamily: '"Press Start 2P", monospace',
                                }}
                              >
                                Progress
                              </span>
                              <span
                                style={{
                                  fontSize: "8px",
                                  color: colors.text,
                                  fontFamily: '"Press Start 2P", monospace',
                                }}
                              >
                                {achievement.progress}/{achievement.maxProgress}
                              </span>
                            </div>
                            <div
                              style={{
                                width: "100%",
                                height: "8px",
                                background: "rgba(20, 30, 20, 0.6)",
                                borderRadius: "4px",
                                overflow: "hidden",
                                border: `1px solid ${colors.border}`,
                              }}
                            >
                              <div
                                style={{
                                  width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%`,
                                  height: "100%",
                                  background: `linear-gradient(90deg, ${colors.text} 0%, ${colors.text} 100%)`,
                                  transition: "width 0.3s ease",
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Unlocked Badge */}
                        {achievement.unlocked && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "rgba(100, 200, 100, 0.2)",
                              border: "1px solid rgba(150, 240, 150, 0.3)",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              fontSize: "8px",
                              color: "rgba(180, 240, 180, 0.9)",
                              fontFamily: '"Press Start 2P", monospace',
                              marginTop: "8px",
                            }}
                          >
                            <Sparkles size={10} />
                            Unlocked
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </FeatureGuard>
        </div>
      </main>
    </div>
  );
}
