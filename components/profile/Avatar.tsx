"use client";

import Image from "next/image";
import { BuildTools, GameController } from "@/components/icons";

interface AvatarProps {
  image?: string | null;
  role?: "DEVELOPER" | "GAMER" | "ADMIN" | string;
  size?: number;
  className?: string;
}

export function Avatar({ image, role = "GAMER", size = 32, className = "" }: AvatarProps) {
  const avatarSize = size;
  const iconSize = Math.floor(size * 0.6);

  if (image) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
        style={{
          width: `${avatarSize}px`,
          height: `${avatarSize}px`,
          border: "2px solid rgba(200, 240, 200, 0.3)",
          boxShadow: `
            0 0 8px rgba(120, 200, 120, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        <Image
          src={image}
          alt="Avatar"
          fill
          className="object-cover"
          sizes={`${avatarSize}px`}
        />
      </div>
    );
  }

  // Fallback to role-specific icon
  return (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${className}`}
      style={{
        width: `${avatarSize}px`,
        height: `${avatarSize}px`,
        background: `
          linear-gradient(135deg, 
            rgba(40, 60, 40, 0.38) 0%, 
            rgba(50, 70, 50, 0.34) 50%, 
            rgba(35, 55, 35, 0.38) 100%
          )
        `,
        border: "2px solid rgba(200, 240, 200, 0.3)",
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 1px 3px rgba(0, 0, 0, 0.3),
          0 2px 8px rgba(0,0,0,.35),
          0 6px 24px rgba(0,0,0,.35)
        `,
      }}
    >
      {role === "DEVELOPER" ? (
        <div style={{ width: `${iconSize}px`, height: `${iconSize}px` }}>
          <BuildTools className="icon-ink w-full h-full" />
        </div>
      ) : (
        <div style={{ width: `${iconSize}px`, height: `${iconSize}px` }}>
          <GameController className="icon-ink w-full h-full" />
        </div>
      )}
    </div>
  );
}

