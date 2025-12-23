"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/components/audio/AudioProvider";

type GameCardProps = {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  "data-testid"?: string;
  asChild?: boolean;
};

const GameCard = forwardRef<HTMLDivElement, GameCardProps>(
  ({ 
    children, 
    className, 
    interactive = false,
    onClick,
    "data-testid": testId,
    asChild = false,
    ...props 
  }, ref) => {
    const { play } = useAudio();

    const handleMouseEnter = () => {
      if (interactive) {
        play('hover');
      }
    };

    const handleClick = () => {
      if (interactive) {
        play('door');
        onClick?.();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (interactive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleClick();
      }
    };

    const cardVariants = {
      rest: { 
        scale: 1, 
        rotateY: 0,
        transition: { duration: 0.2, ease: "easeOut" as const }
      },
      hover: { 
        scale: 1.02, 
        rotateY: 2,
        transition: { duration: 0.2, ease: "easeOut" as const }
      },
      tap: { 
        scale: 0.98,
        transition: { duration: 0.1, ease: "easeOut" as const }
      }
    };

    const cardClasses = cn(
      "relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm",
      "shadow-lg shadow-black/20",
      interactive && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40",
      className
    );

    const cardStyle = {
      background: `
        radial-gradient(circle at top left, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
        rgba(255, 255, 255, 0.08)
      `,
      backdropFilter: 'blur(12px) saturate(180%)',
      boxShadow: `
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        0 8px 32px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.1)
      `,
    };

    if (asChild) {
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          style={cardStyle}
          variants={interactive ? cardVariants : undefined}
          initial="rest"
          whileHover={interactive ? "hover" : undefined}
          whileTap={interactive ? "tap" : undefined}
          onMouseEnter={handleMouseEnter}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={interactive ? 0 : undefined}
          role={interactive ? "button" : undefined}
          data-testid={testId}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cardClasses}
        style={cardStyle}
        variants={interactive ? cardVariants : undefined}
        initial="rest"
        whileHover={interactive ? "hover" : undefined}
        whileTap={interactive ? "tap" : undefined}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? "button" : undefined}
        data-testid={testId}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GameCard.displayName = "GameCard";

const GameCardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col items-center justify-center p-6 text-center", className)}
      {...props}
    />
  )
);

GameCardContent.displayName = "GameCardContent";

export { GameCard, GameCardContent };