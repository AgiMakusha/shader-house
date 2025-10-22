import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type GameIconProps = {
  children: React.ReactNode;
  size?: number; // px; default 72
  tone?: "primary" | "secondary" | "warning" | "success"; // default "primary"
  className?: string;
  glow?: boolean; // default true
  rounded?: boolean; // default true (rounded container)
  "aria-hidden"?: boolean;
  "data-testid"?: string;
};

const GameIcon = forwardRef<HTMLDivElement, GameIconProps>(
  ({ 
    children, 
    size = 72, 
    tone = "primary", 
    className, 
    glow = true, 
    rounded = true,
    "aria-hidden": ariaHidden = true,
    "data-testid": testId,
    ...props 
  }, ref) => {
    const toneClasses = {
      primary: "icon-ink",
      secondary: "icon-secondary-ink", 
      warning: "icon-warning",
      success: "icon-success"
    };

    // If no frame is needed, just return the icon directly
    if (!rounded) {
      return (
        <div
          ref={ref}
          className={cn("flex items-center justify-center", toneClasses[tone], className)}
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            filter: glow ? `
              drop-shadow(0 0 8px rgba(255,255,255,.15))
              drop-shadow(0 0 16px rgba(147, 197, 253, .25))
              drop-shadow(0 0 24px rgba(100, 200, 100, .2))
              drop-shadow(0 4px 12px rgba(0, 0, 0, .3))
            ` : "none",
            textShadow: glow ? `
              0 0 10px rgba(255, 255, 255, 0.3),
              0 0 20px rgba(147, 197, 253, 0.4),
              0 0 30px rgba(100, 200, 100, 0.3)
            ` : "none"
          }}
          aria-hidden={ariaHidden}
          data-testid={testId}
          {...props}
        >
          {children}
        </div>
      );
    }

    // With frame (original behavior)
    const containerClasses = cn(
      "relative flex items-center justify-center",
      rounded ? "rounded-2xl" : "",
      className
    );

    const containerStyle = {
      width: `${size}px`,
      height: `${size}px`,
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
      filter: glow ? "drop-shadow(0 2px 8px rgba(255,255,255,.08)) drop-shadow(0 6px 18px rgba(147, 197, 253, .18))" : "none"
    };

    const iconSize = size * 0.66; // Scale icon to 66% of container

    return (
      <div
        ref={ref}
        className={containerClasses}
        style={containerStyle}
        aria-hidden={ariaHidden}
        data-testid={testId}
        {...props}
      >
        <div 
          className={cn("flex items-center justify-center", toneClasses[tone])}
          style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
        >
          {children}
        </div>
      </div>
    );
  }
);

GameIcon.displayName = "GameIcon";

export { GameIcon };