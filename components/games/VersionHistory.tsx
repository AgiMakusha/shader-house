"use client";

import { useEffect, useState } from "react";
import { History, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";

interface GameVersion {
  id: string;
  version: string;
  title: string | null;
  changelog: string;
  releaseType: "MAJOR" | "MINOR" | "PATCH" | "HOTFIX";
  releasedAt: string;
}

interface VersionHistoryProps {
  gameId: string;
  currentVersion?: string;
}

const releaseTypeColors = {
  MAJOR: { bg: "rgba(250, 100, 100, 0.2)", text: "rgba(250, 150, 150, 0.95)" },
  MINOR: { bg: "rgba(100, 200, 250, 0.2)", text: "rgba(150, 220, 250, 0.95)" },
  PATCH: { bg: "rgba(200, 200, 200, 0.2)", text: "rgba(220, 220, 220, 0.95)" },
  HOTFIX: { bg: "rgba(250, 180, 100, 0.2)", text: "rgba(250, 200, 150, 0.95)" },
};

export function VersionHistory({ gameId, currentVersion }: VersionHistoryProps) {
  const [versions, setVersions] = useState<GameVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await fetch(`/api/games/${gameId}/versions`);
        if (!res.ok) {
          setHasError(true);
          return;
        }
        const data = await res.json();
        setVersions(data.versions || []);
      } catch (error) {
        console.error("Error fetching versions:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [gameId]);

  // Don't show anything while loading, on error, or if no versions
  if (isLoading || hasError || versions.length === 0) {
    return null;
  }

  const displayVersions = expanded ? versions : versions.slice(0, 3);

  return (
    <GameCard>
      <GameCardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-bold pixelized flex items-center gap-2"
            style={{
              textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
              color: "rgba(180, 220, 180, 0.95)",
            }}
          >
            <History size={18} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
            Version History
          </h3>
          {currentVersion && (
            <span
              className="text-sm px-2 py-1 rounded flex items-center gap-1"
              style={{
                background: "rgba(100, 200, 100, 0.2)",
                color: "rgba(150, 250, 150, 0.9)",
              }}
            >
              <Tag size={12} />
              v{currentVersion}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {displayVersions.map((version, index) => (
            <div
              key={version.id}
              className="p-3 rounded-lg"
              style={{
                background: index === 0 
                  ? "rgba(100, 200, 100, 0.15)" 
                  : "rgba(100, 200, 100, 0.08)",
                border: index === 0 
                  ? "1px solid rgba(200, 240, 200, 0.3)" 
                  : "1px solid rgba(200, 240, 200, 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="font-bold text-sm"
                    style={{ color: "rgba(200, 240, 200, 0.95)" }}
                  >
                    v{version.version}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: releaseTypeColors[version.releaseType].bg,
                      color: releaseTypeColors[version.releaseType].text,
                    }}
                  >
                    {version.releaseType}
                  </span>
                </div>
                <span
                  className="text-xs"
                  style={{ color: "rgba(200, 240, 200, 0.5)" }}
                >
                  {new Date(version.releasedAt).toLocaleDateString()}
                </span>
              </div>
              {version.title && (
                <p
                  className="font-semibold text-sm mb-1"
                  style={{ color: "rgba(200, 240, 200, 0.85)" }}
                >
                  {version.title}
                </p>
              )}
              <p
                className="text-sm whitespace-pre-wrap"
                style={{ color: "rgba(200, 240, 200, 0.7)" }}
              >
                {version.changelog}
              </p>
            </div>
          ))}
        </div>

        {versions.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-1 transition-all hover:opacity-80"
            style={{
              background: "rgba(100, 200, 100, 0.15)",
              color: "rgba(200, 240, 200, 0.8)",
              border: "1px solid rgba(200, 240, 200, 0.2)",
            }}
          >
            {expanded ? (
              <>
                <ChevronUp size={16} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show All ({versions.length} versions)
              </>
            )}
          </button>
        )}
      </GameCardContent>
    </GameCard>
  );
}

