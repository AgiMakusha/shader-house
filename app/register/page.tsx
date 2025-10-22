"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameIcon } from "@/components/game/GameIcon";
import { BuildTools, GameController } from "@/components/icons";
import Particles from "@/components/fx/Particles";

export default function RegisterPage() {
  const router = useRouter();

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent, path: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(path);
    }
  };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      <motion.main 
        className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6"
        initial={{ opacity: 0, y: 6 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.6, 
            ease: [0.22, 1, 0.36, 1] 
          } 
        }}
      >
        <div className="text-center space-y-8 max-w-4xl w-full">
          {/* Hero Header */}
          <motion.h1 
            className="text-3xl md:text-5xl font-bold tracking-wider uppercase pixelized"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              textShadow: `
                0 0 10px rgba(100, 200, 100, 0.6),
                0 0 20px rgba(80, 160, 80, 0.4),
                2px 2px 0px rgba(0, 0, 0, 0.8),
                4px 4px 0px rgba(0, 0, 0, 0.6)
              `,
              color: 'rgba(150, 250, 150, 0.95)',
            }}
          >
            Choose your path
          </motion.h1>

          {/* Game Style Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Developer Card */}
            <GameCard
              interactive={true}
              onClick={() => handleCardClick('/register/developer')}
              className="h-64"
              data-testid="developer-card"
            >
              <GameCardContent>
                <div className="mb-2">
                  <GameIcon 
                    tone="primary" 
                    size={88} 
                    glow 
                    rounded={false}
                    aria-hidden
                    data-testid="developer-icon"
                  >
                    <BuildTools className="w-2/3 h-2/3 icon-ink" title="Developer tools" />
                  </GameIcon>
                </div>
                <h2 
                  className="text-2xl font-bold tracking-wider uppercase pixelized"
                  style={{
                    textShadow: `
                      0 0 8px rgba(120, 200, 120, 0.7),
                      0 0 16px rgba(100, 180, 100, 0.5),
                      1px 1px 0px rgba(0, 0, 0, 0.8)
                    `,
                    color: 'rgba(180, 220, 180, 0.9)',
                  }}
                >
                  I build games
                </h2>
                <p 
                  className="text-sm font-semibold tracking-wide uppercase pixelized"
                  style={{
                    textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                    color: 'rgba(200, 240, 200, 0.8)',
                  }}
                >
                  Developer
                </p>
              </GameCardContent>
            </GameCard>

            {/* Gamer Card */}
            <GameCard
              interactive={true}
              onClick={() => handleCardClick('/register/gamer')}
              className="h-64"
              data-testid="gamer-card"
            >
              <GameCardContent>
                <div className="mb-2">
                  <GameIcon 
                    tone="secondary" 
                    size={88} 
                    glow 
                    rounded={false}
                    aria-hidden
                    data-testid="gamer-icon"
                  >
                    <GameController className="w-2/3 h-2/3 icon-ink" title="Gamer" />
                  </GameIcon>
                </div>
                <h2 
                  className="text-2xl font-bold tracking-wider uppercase pixelized"
                  style={{
                    textShadow: `
                      0 0 8px rgba(120, 200, 120, 0.7),
                      0 0 16px rgba(100, 180, 100, 0.5),
                      1px 1px 0px rgba(0, 0, 0, 0.8)
                    `,
                    color: 'rgba(180, 220, 180, 0.9)',
                  }}
                >
                  I play games
                </h2>
                <p 
                  className="text-sm font-semibold tracking-wide uppercase pixelized"
                  style={{
                    textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                    color: 'rgba(200, 240, 200, 0.8)',
                  }}
                >
                  Gamer
                </p>
              </GameCardContent>
            </GameCard>
          </div>
        </div>
      </motion.main>
    </div>
  );
}