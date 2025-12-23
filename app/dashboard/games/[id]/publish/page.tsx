"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { DollarSign, CheckCircle, AlertTriangle, ArrowLeft, Sparkles } from "lucide-react";

import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { useAudio } from "@/components/audio/AudioProvider";

interface Game {
  id: string;
  title: string;
  coverUrl: string;
  slug: string;
  publishingFeePaid: boolean;
}

export default function PublishGamePage() {
  const router = useRouter();
  const params = useParams();
  const { play } = useAudio();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/${params.id}`);
        if (!response.ok) {
          router.push("/profile/developer");
          return;
        }
        const data = await response.json();
        setGame(data);

        // If already paid, redirect to game page
        if (data.publishingFeePaid) {
          router.push(`/games/${data.slug}`);
        }
      } catch (error) {
        console.error("Error fetching game:", error);
        setError("Failed to load game details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [params.id, router]);

  const handlePayPublishingFee = async () => {
    if (isProcessing || !game) return;

    setIsProcessing(true);
    setError("");
    play("success");

    try {
      const response = await fetch("/api/payments/publishing-fee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId: game.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      // If Stripe returns a checkout URL, redirect to it
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Demo mode - payment completed immediately
      play("success");
      router.push(`/games/${game.slug}`);
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error.message || "Failed to process payment");
      play("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipForNow = () => {
    play("success");
    router.push("/profile/developer/projects");
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div
            className="text-xl font-semibold pixelized"
            style={{ color: "rgba(200, 240, 200, 0.9)" }}
          >
            Loading...
          </div>
        </motion.div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(240, 220, 140, 0.2) 0%, rgba(220, 180, 100, 0.15) 100%)",
                    border: "2px solid rgba(240, 220, 140, 0.4)",
                  }}
                >
                  <DollarSign
                    className="w-8 h-8"
                    style={{ color: "rgba(240, 220, 140, 0.95)" }}
                  />
                </div>
                <h1
                  className="text-2xl font-bold pixelized mb-2"
                  style={{
                    textShadow: "0 0 12px rgba(120, 200, 120, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.9)",
                    color: "rgba(180, 220, 180, 0.95)",
                  }}
                >
                  Publish Your Game
                </h1>
                <p
                  className="text-sm"
                  style={{ color: "rgba(200, 240, 200, 0.7)" }}
                >
                  Almost there! Pay the one-time publishing fee to make{" "}
                  <strong style={{ color: "rgba(150, 250, 150, 0.95)" }}>{game.title}</strong>{" "}
                  live on Shader House.
                </p>
              </div>

              {/* Game Preview */}
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "rgba(100, 200, 100, 0.05)",
                  border: "1px solid rgba(200, 240, 200, 0.2)",
                }}
              >
                <div className="flex items-center gap-4">
                  {game.coverUrl && (
                    <img
                      src={game.coverUrl}
                      alt={game.title}
                      className="w-20 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: "rgba(200, 240, 200, 0.9)" }}
                    >
                      {game.title}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(200, 240, 200, 0.6)" }}
                    >
                      Ready to publish
                    </p>
                  </div>
                </div>
              </div>

              {/* Fee Details */}
              <div
                className="p-4 rounded-lg space-y-3"
                style={{
                  background: "linear-gradient(135deg, rgba(240, 220, 140, 0.1) 0%, rgba(220, 180, 100, 0.08) 100%)",
                  border: "1px solid rgba(240, 220, 140, 0.3)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: "rgba(200, 240, 200, 0.8)" }}>Publishing Fee</span>
                  <span
                    className="text-xl font-bold pixelized"
                    style={{
                      color: "rgba(240, 220, 140, 0.95)",
                      textShadow: "0 0 6px rgba(240, 220, 140, 0.4)",
                    }}
                  >
                    $50 USD
                  </span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-start gap-2">
                    <Sparkles
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "rgba(150, 255, 150, 0.9)" }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "rgba(200, 240, 200, 0.7)" }}
                    >
                      One-time fee per game. You'll earn <strong style={{ color: "rgba(150, 255, 150, 0.95)" }}>85%</strong> of all sales revenue.
                    </p>
                  </div>
                </div>
              </div>

              {/* What You Get */}
              <div className="space-y-2">
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(200, 240, 200, 0.6)" }}
                >
                  What's Included
                </p>
                <ul className="space-y-2">
                  {[
                    "Full marketplace listing",
                    "Secure payment processing",
                    "Developer analytics dashboard",
                    "Community discussion forums",
                    "Beta testing tools",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "rgba(200, 240, 200, 0.8)" }}
                    >
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "rgba(150, 255, 150, 0.9)" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="p-3 rounded-lg flex items-start gap-2"
                  style={{
                    background: "rgba(180, 60, 60, 0.15)",
                    border: "1px solid rgba(255, 120, 120, 0.3)",
                  }}
                >
                  <AlertTriangle
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: "rgba(255, 180, 180, 0.95)" }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: "rgba(255, 180, 180, 0.95)" }}
                  >
                    {error}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <motion.button
                  onClick={handlePayPublishingFee}
                  disabled={isProcessing}
                  className="w-full px-6 py-4 rounded-lg font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.4)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  whileHover={!isProcessing ? { scale: 1.02 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                >
                  {isProcessing ? "Processing..." : "Pay $50 & Publish"}
                </motion.button>

                <button
                  onClick={handleSkipForNow}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 text-sm transition-all disabled:opacity-50"
                  style={{ color: "rgba(200, 240, 200, 0.6)" }}
                >
                  Skip for now (game will be hidden)
                </button>
              </div>

              {/* Back Link */}
              <div className="text-center pt-2">
                <Link
                  href={`/dashboard/games/${game.id}/edit`}
                  className="inline-flex items-center gap-1 text-xs transition-all hover:underline"
                  style={{ color: "rgba(200, 240, 200, 0.6)" }}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Edit game details
                </Link>
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>
      </main>
    </div>
  );
}

