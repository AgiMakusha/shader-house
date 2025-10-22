"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GameIcon } from "@/components/game/GameIcon";
import { 
  GameHouse, 
  GameController, 
  BuildTools, 
  RocketLaunch, 
  ChatBubble, 
  TrophyCup, 
  LightningBolt, 
  LibraryStack, 
  UploadCloud, 
  AnalyticsEye, 
  GearSettings 
} from "@/components/icons";
import Particles from "@/components/fx/Particles";

const iconData = [
  { name: "GameHouse", component: GameHouse, description: "Magical house for indie games" },
  { name: "GameController", component: GameController, description: "Gaming controller" },
  { name: "BuildTools", component: BuildTools, description: "Development tools" },
  { name: "RocketLaunch", component: RocketLaunch, description: "Launch and deploy" },
  { name: "ChatBubble", component: ChatBubble, description: "Communication" },
  { name: "TrophyCup", component: TrophyCup, description: "Achievements and rewards" },
  { name: "LightningBolt", component: LightningBolt, description: "Speed and performance" },
  { name: "LibraryStack", component: LibraryStack, description: "Knowledge and resources" },
  { name: "UploadCloud", component: UploadCloud, description: "Cloud upload" },
  { name: "AnalyticsEye", component: AnalyticsEye, description: "Analytics and insights" },
  { name: "GearSettings", component: GearSettings, description: "Settings and configuration" },
];

const tones = ["primary", "secondary"] as const;
const sizes = [24, 48, 88] as const;

export default function IconsPage() {
  const [selectedSize, setSelectedSize] = useState<number>(88);

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
        <div className="text-center space-y-8 max-w-6xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 
              className="text-3xl md:text-5xl font-bold tracking-wider uppercase pixelized mb-4"
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
              Icon Library
            </h1>
            <p 
              className="text-lg font-semibold tracking-wide uppercase pixelized"
              style={{
                textShadow: `
                  0 0 8px rgba(120, 200, 120, 0.7),
                  0 0 16px rgba(100, 180, 100, 0.5),
                  1px 1px 0px rgba(0, 0, 0, 0.8)
                `,
                color: 'rgba(180, 220, 180, 0.9)',
              }}
            >
              Professional indie icon set with duotone design
            </p>
          </motion.div>

          {/* Size Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex justify-center space-x-4"
          >
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-lg font-semibold tracking-wide uppercase pixelized transition-all duration-200 ${
                  selectedSize === size 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
                style={{
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                }}
              >
                {size}px
              </button>
            ))}
          </motion.div>

          {/* Icon Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {iconData.map((icon, index) => (
              <motion.div
                key={icon.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  ease: "easeOut",
                  delay: index * 0.1 
                }}
                className="space-y-4"
              >
                {/* Icon with different tones */}
                <div className="flex justify-center space-x-4">
                  {tones.map((tone) => (
                    <div key={tone} className="text-center">
                      <GameIcon 
                        tone={tone} 
                        size={selectedSize} 
                        glow 
                        rounded={false}
                        aria-hidden
                        className="mb-2"
                      >
                        <icon.component 
                          className="w-2/3 h-2/3" 
                          title={`${icon.name} - ${tone}`}
                          tone={tone}
                        />
                      </GameIcon>
                      <p 
                        className="text-xs font-semibold tracking-wide uppercase pixelized"
                        style={{
                          textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                          color: 'rgba(200, 240, 200, 0.8)',
                        }}
                      >
                        {tone}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Icon info */}
                <div className="text-center">
                  <h3 
                    className="text-lg font-bold tracking-wider uppercase pixelized mb-1"
                    style={{
                      textShadow: `
                        0 0 8px rgba(120, 200, 120, 0.7),
                        0 0 16px rgba(100, 180, 100, 0.5),
                        1px 1px 0px rgba(0, 0, 0, 0.8)
                      `,
                      color: 'rgba(180, 220, 180, 0.9)',
                    }}
                  >
                    {icon.name}
                  </h3>
                  <p 
                    className="text-sm font-semibold tracking-wide uppercase pixelized"
                    style={{
                      textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                      color: 'rgba(200, 240, 200, 0.8)',
                    }}
                  >
                    {icon.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Design Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            className="mt-12 p-6 rounded-lg"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(40, 60, 40, 0.9) 0%, 
                  rgba(50, 70, 50, 0.8) 50%, 
                  rgba(35, 55, 35, 0.9) 100%
                )
              `,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: `
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                0 1px 3px rgba(0, 0, 0, 0.3)
              `,
            }}
          >
            <h2 
              className="text-xl font-bold tracking-wider uppercase pixelized mb-4"
              style={{
                textShadow: `
                  0 0 8px rgba(120, 200, 120, 0.7),
                  0 0 16px rgba(100, 180, 100, 0.5),
                  1px 1px 0px rgba(0, 0, 0, 0.8)
                `,
                color: 'rgba(180, 220, 180, 0.9)',
              }}
            >
              Design System
            </h2>
            <div className="space-y-2 text-sm">
              <p 
                className="font-semibold tracking-wide uppercase pixelized"
                style={{
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                  color: 'rgba(200, 240, 200, 0.8)',
                }}
              >
                • 24px base grid with 1.75px stroke weight
              </p>
              <p 
                className="font-semibold tracking-wide uppercase pixelized"
                style={{
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                  color: 'rgba(200, 240, 200, 0.8)',
                }}
              >
                • Duotone design with primary and secondary inks
              </p>
              <p 
                className="font-semibold tracking-wide uppercase pixelized"
                style={{
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                  color: 'rgba(200, 240, 200, 0.8)',
                }}
              >
                • Soft mint ink (primary) and violet ink (secondary)
              </p>
              <p 
                className="font-semibold tracking-wide uppercase pixelized"
                style={{
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                  color: 'rgba(200, 240, 200, 0.8)',
                }}
              >
                • Crisp at all sizes with aligned half-pixel coordinates
              </p>
              <p 
                className="font-semibold tracking-wide uppercase pixelized"
                style={{
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                  color: 'rgba(200, 240, 200, 0.8)',
                }}
              >
                • Harmonizes with forest/ambient design theme
              </p>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}