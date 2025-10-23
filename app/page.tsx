"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameIcon } from "@/components/game/GameIcon";
import { GameHouse } from "@/components/icons";
import Particles from "@/components/fx/Particles";

// Timing constants - easy to adjust for different pacing
const CARD_IN_MS = 500;        // Card fade/scale in duration
const ICON_DELAY_MS = 300;      // Icon appears after card starts
const TITLE_DELAY_MS = 700;     // Title appears after card starts
const SLOGAN_DELAY_MS = 1000;   // Slogan appears after card starts
const IDLE_VISIBLE_MS = 5000;   // Time card remains before auto-nav
const FADE_OUT_MS = 400;        // Pre-navigation curtain duration
const REDUCED_MOTION_MS = 1200; // Quick auto-nav for reduced motion users

export default function Page() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Pre-fetch the register page for instant navigation
    router.prefetch('/register');
  }, [router]);

  useEffect(() => {
    if (shouldReduceMotion) {
      // Reduced motion: quick sequence, then auto-navigate
      console.log('home: reduced-motion-sequence');
      const timer = setTimeout(() => {
        console.log('home: reduced-motion-auto-nav');
        handleNavigation();
      }, REDUCED_MOTION_MS);
      return () => clearTimeout(timer);
    }

    // Normal sequence: staged reveals, then auto-navigate
    console.log('home: card_in');
    
    const iconTimer = setTimeout(() => {
      console.log('home: icon_in');
    }, ICON_DELAY_MS);

    const titleTimer = setTimeout(() => {
      console.log('home: title_in');
    }, TITLE_DELAY_MS);

    const sloganTimer = setTimeout(() => {
      console.log('home: slogan_in');
    }, SLOGAN_DELAY_MS);

    const autoNavTimer = setTimeout(() => {
      console.log('home: auto_nav');
      handleNavigation();
    }, IDLE_VISIBLE_MS);

    return () => {
      clearTimeout(iconTimer);
      clearTimeout(titleTimer);
      clearTimeout(sloganTimer);
      clearTimeout(autoNavTimer);
    };
  }, [shouldReduceMotion]);

  const handleNavigation = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    setIsVisible(false);
    
    setTimeout(() => {
      router.push('/register');
    }, FADE_OUT_MS);
  };

  const handleCardClick = () => {
    console.log('home: card_clicked');
    handleNavigation();
  };

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: CARD_IN_MS / 1000, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: CARD_IN_MS / 1000, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: "easeOut",
        delay: shouldReduceMotion ? 0 : (ICON_DELAY_MS - CARD_IN_MS) / 1000
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        delay: shouldReduceMotion ? 0 : (TITLE_DELAY_MS - CARD_IN_MS) / 1000
      }
    }
  };

  const sloganVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        delay: shouldReduceMotion ? 0 : (SLOGAN_DELAY_MS - CARD_IN_MS) / 1000
      }
    }
  };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      {/* Fade-out curtain overlay */}
      <motion.div
        className="absolute inset-0 z-10"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: !isVisible ? 1 : 0,
          filter: !isVisible ? "blur(4px) brightness(0.85)" : "blur(0px) brightness(1)",
        }}
        transition={{ 
          duration: FADE_OUT_MS / 1000, 
          ease: "easeInOut" 
        }}
        style={{
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex min-h-dvh items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <GameCard
            interactive={true}
            onClick={handleCardClick}
            data-testid="home-card"
            className="h-64"
          >
            <GameCardContent>
              {/* Pixel House Icon */}
              <motion.div
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                className="mb-1"
              >
                <GameIcon 
                  size={88} 
                  glow 
                  rounded={false}
                  aria-hidden
                  data-testid="home-icon"
                >
                  <GameHouse className="w-2/3 h-2/3 icon-ink" title="Shader House" />
                </GameIcon>
              </motion.div>

              {/* Title */}
              <motion.h2
                variants={titleVariants}
                initial="hidden"
                animate="visible"
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
                Shader House
              </motion.h2>

              {/* Slogan */}
              <motion.p
                variants={sloganVariants}
                initial="hidden"
                animate="visible"
                className="text-sm font-semibold tracking-wide uppercase pixelized"
                style={{
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                  color: 'rgba(200, 240, 200, 0.8)',
                }}
              >
                Where indie games shine
              </motion.p>
            </GameCardContent>
          </GameCard>
        </motion.div>
      </div>
    </div>
  );
}