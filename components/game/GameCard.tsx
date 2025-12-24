"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { useAudio } from "@/components/audio/AudioProvider";

// PERFORMANCE FIX: Removed Framer Motion, using CSS animations instead

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

    const cardClasses = cn(
      "relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm",
      "shadow-lg shadow-black/20",
      interactive && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 card-interactive-3d",
      className
    );

    // PERFORMANCE FIX: Replaced expensive backdrop-filter with static background
    const cardStyle = {
      background: `
        radial-gradient(circle at top left, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%),
        rgba(15, 35, 15, 0.85)
      `,
      boxShadow: `
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        0 8px 32px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.1)
      `,
    };

    if (asChild) {
      return (
        <div
          ref={ref}
          className={cardClasses}
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={interactive ? 0 : undefined}
          role={interactive ? "button" : undefined}
          data-testid={testId}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cardClasses}
        style={cardStyle}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? "button" : undefined}
        data-testid={testId}
        {...props}
      >
        {children}
      </div>
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