import { redirect } from "next/navigation";
import Link from "next/link";

import { getSession } from "@/lib/auth/session";
import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameForm } from "@/components/games/GameForm";

export default async function NewGamePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Normalize role to uppercase (handles legacy lowercase roles)
  const userRole = session.user.role?.toUpperCase();
  if (userRole !== "DEVELOPER") {
    redirect("/profile/gamer");
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12">
        {/* Header */}
        <div className="w-full max-w-4xl mb-8 flex items-center justify-between">
          <div>
            <p
              className="text-xs uppercase tracking-[0.3em] pixelized"
              style={{ color: "rgba(200, 240, 200, 0.6)" }}
            >
              Dashboard
            </p>
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
              Create New Game
            </h1>
            <p
              className="mt-2 text-sm pixelized"
              style={{
                color: "rgba(200, 240, 200, 0.65)",
                textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)",
              }}
            >
              Publish your game to the Shader House marketplace
            </p>
          </div>

          <Link
            href="/profile/developer"
            className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all"
            style={{ color: "rgba(200, 240, 200, 0.75)" }}
          >
            ← Back to Profile
          </Link>
        </div>

        {/* Form */}
        <div className="w-full max-w-4xl mb-12">
          <GameCard>
            <GameCardContent className="p-8">
              <GameForm mode="create" />
            </GameCardContent>
          </GameCard>
        </div>
      </main>
    </div>
  );
}



