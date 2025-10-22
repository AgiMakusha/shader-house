import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type GameIconProps = {
  children: React.ReactNode;
  size?: number; // px; default 72
  weight?: "light" | "regular"; // default "light"
  className?: string;
  glow?: boolean; // default true
  rounded?: boolean; // default true (rounded container)
  interactive?: boolean; // default false
  "aria-hidden"?: boolean;
  "data-testid"?: string;
};

const GameIcon = forwardRef<HTMLDivElement, GameIconProps>(
  ({ 
    children, 
    size = 72, 
    weight = "light", 
    className, 
    glow = true, 
    rounded = true,
    interactive = false,
    "aria-hidden": ariaHidden = true,
    "data-testid": testId,
    ...props 
  }, ref) => {
    // If no frame is needed, just return the icon directly
    if (!rounded) {
      return (
        <div
          ref={ref}
          className={cn("flex items-center justify-center", className)}
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            filter: glow ? `
              drop-shadow(0 2px 8px rgba(0,0,0,.35))
              drop-shadow(0 6px 24px rgba(0,0,0,.35))
            ` : "none",
            transform: interactive ? "scale(1.01)" : "scale(1)",
            transition: "transform 0.2s ease-out, filter 0.2s ease-out"
          }}
          aria-hidden={ariaHidden}
          data-testid={testId}
          {...props}
        >
          {children}
        </div>
      );
    }

    // With frame (refined styling)
    const containerClasses = cn(
      "relative flex items-center justify-center transition-all duration-200 ease-out",
      rounded ? "rounded-2xl" : "",
      interactive ? "hover:scale-102" : "",
      className
    );

    const containerStyle = {
      width: `${size}px`,
      height: `${size}px`,
            background: `
                linear-gradient(135deg, 
                  rgba(40, 60, 40, 0.38) 0%, 
                  rgba(50, 70, 50, 0.34) 50%, 
                  rgba(35, 55, 35, 0.38) 100%
                )
              `,
              border: "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow: `
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 1px 3px rgba(0, 0, 0, 0.3)
      `,
      filter: glow ? `
        drop-shadow(0 2px 8px rgba(0,0,0,.35))
        drop-shadow(0 6px 24px rgba(0,0,0,.35))
      ` : "none"
    };

    const iconSize = size * 0.75; // Scale icon to 75% of container (18px in 24px)

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
          className={cn("flex items-center justify-center p-3")}
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