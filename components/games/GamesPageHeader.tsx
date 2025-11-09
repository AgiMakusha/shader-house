"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface GamesPageHeaderProps {
  isMyGames: boolean;
}

export function GamesPageHeader({ isMyGames }: GamesPageHeaderProps) {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user.role);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const backLink = userRole === "DEVELOPER" ? "/profile/developer" : "/profile/gamer";
  const showBackLink = userRole !== null;

  return (
    <>
      <div className="w-full max-w-6xl mb-8">
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-xs uppercase tracking-[0.3em] pixelized"
            style={{ color: "rgba(200, 240, 200, 0.6)" }}
          >
            {isMyGames ? 'Developer Dashboard' : 'Games Marketplace'}
          </p>
          {showBackLink && (
            <Link
              href={backLink}
              className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all"
              style={{ color: "rgba(200, 240, 200, 0.75)" }}
            >
              ← Back to Profile
            </Link>
          )}
        </div>
        <h1
          className="text-4xl font-bold tracking-wider uppercase pixelized"
          style={{
            textShadow: `
              0 0 12px rgba(120, 200, 120, 0.8),
              0 0 24px rgba(100, 180, 100, 0.6),
              2px 2px 0px rgba(0, 0, 0, 0.9)
            `,
            color: "rgba(180, 220, 180, 0.95)",
          }}
        >
          {isMyGames ? 'My Published Games' : 'Discover Games'}
        </h1>
        <p
          className="mt-2 text-sm pixelized"
          style={{
            color: "rgba(200, 240, 200, 0.65)",
            textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)",
          }}
        >
          {isMyGames 
            ? 'Manage and view all your published games'
            : 'Browse and play amazing indie games from talented developers'
          }
        </p>
      </div>
    </>
  );
}

