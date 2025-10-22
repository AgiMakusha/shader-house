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
        transition: { duration: 0.2, ease: "easeOut" }
      },
      hover: { 
        scale: 1.02, 
        rotateY: 2,
        transition: { duration: 0.2, ease: "easeOut" }
      },
      tap: { 
        scale: 0.98,
        transition: { duration: 0.1, ease: "easeOut" }
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
        repeating-linear-gradient(
          0deg,
          rgba(40, 60, 40, 0.9) 0px,
          rgba(50, 70, 50, 0.8) 2px,
          rgba(35, 55, 35, 0.9) 4px,
          rgba(45, 65, 45, 0.8) 6px,
          rgba(40, 60, 40, 0.9) 8px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(40, 60, 40, 0.9) 0px,
          rgba(50, 70, 50, 0.8) 2px,
          rgba(35, 55, 35, 0.9) 4px,
          rgba(45, 65, 45, 0.8) 6px,
          rgba(40, 60, 40, 0.9) 8px
        )
      `,
      backgroundSize: '8px 8px',
      boxShadow: `
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 4px 12px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.05)
      `,
      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
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