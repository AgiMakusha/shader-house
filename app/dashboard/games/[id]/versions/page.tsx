"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  History,
  Plus,
  Tag,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { useAudio } from "@/components/audio/AudioProvider";

interface GameVersion {
  id: string;
  version: string;
  title: string | null;
  changelog: string;
  releaseType: "MAJOR" | "MINOR" | "PATCH" | "HOTFIX";
  releasedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const releaseTypeColors = {
  MAJOR: { bg: "rgba(250, 100, 100, 0.2)", text: "rgba(250, 150, 150, 0.95)", label: "Major Release" },
  MINOR: { bg: "rgba(100, 200, 250, 0.2)", text: "rgba(150, 220, 250, 0.95)", label: "Minor Update" },
  PATCH: { bg: "rgba(200, 200, 200, 0.2)", text: "rgba(220, 220, 220, 0.95)", label: "Patch" },
  HOTFIX: { bg: "rgba(250, 180, 100, 0.2)", text: "rgba(250, 200, 150, 0.95)", label: "Hotfix" },
};

export default function VersionManagementPage({ params }: PageProps) {
  const { id: gameId } = use(params);
  const router = useRouter();
  const { play } = useAudio();
  const [isLoading, setIsLoading] = useState(true);
  const [versions, setVersions] = useState<GameVersion[]>([]);
  const [game, setGame] = useState<any>(null);
  const [showNewVersionForm, setShowNewVersionForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New version form
  const [newVersion, setNewVersion] = useState({
    version: "",
    title: "",
    changelog: "",
    releaseType: "PATCH" as "MAJOR" | "MINOR" | "PATCH" | "HOTFIX",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/games/${gameId}/versions`);
        if (!res.ok) {
          throw new Error("Failed to fetch versions");
        }
        const data = await res.json();
        setVersions(data.versions || []);
        setGame(data.game);

        // Auto-suggest next version
        if (data.game?.currentVersion) {
          const parts = data.game.currentVersion.split(".").map(Number);
          setNewVersion((prev) => ({
            ...prev,
            version: `${parts[0]}.${parts[1]}.${parts[2] + 1}`,
          }));
        }
      } catch (err: any) {
        console.error("Error fetching versions:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [gameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/games/${gameId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVersion),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create version");
      }

      setSuccess(`Version ${newVersion.version} created! ${data.notifiedUsers} users notified.`);
      setVersions([data.version, ...versions]);
      setShowNewVersionForm(false);
      setNewVersion({
        version: "",
        title: "",
        changelog: "",
        releaseType: "PATCH",
      });

      // Auto-suggest next version
      const parts = newVersion.version.split(".").map(Number);
      setNewVersion((prev) => ({
        ...prev,
        version: `${parts[0]}.${parts[1]}.${parts[2] + 1}`,
      }));

      play("success");
    } catch (err: any) {
      setError(err.message);
      play("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestVersion = (type: "MAJOR" | "MINOR" | "PATCH") => {
    const currentParts = (game?.currentVersion || "1.0.0").split(".").map(Number);
    let newVer = "";
    switch (type) {
      case "MAJOR":
        newVer = `${currentParts[0] + 1}.0.0`;
        break;
      case "MINOR":
        newVer = `${currentParts[0]}.${currentParts[1] + 1}.0`;
        break;
      case "PATCH":
        newVer = `${currentParts[0]}.${currentParts[1]}.${currentParts[2] + 1}`;
        break;
    }
    setNewVersion((prev) => ({ ...prev, version: newVer, releaseType: type }));
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-xl font-semibold pixelized" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
            Loading...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <motion.main
        className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="w-full max-w-4xl mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href={`/dashboard/games/${gameId}/edit`}
            className="text-sm font-semibold uppercase tracking-wider hover:underline flex items-center gap-2 mb-4"
            style={{ color: "rgba(200, 240, 200, 0.75)" }}
          >
            <ArrowLeft size={16} />
            Back to Edit Game
          </Link>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] pixelized mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                Version Management
              </p>
              <h1
                className="text-3xl font-bold tracking-wider pixelized flex items-center gap-3"
                style={{
                  textShadow: "0 0 12px rgba(120, 200, 120, 0.8), 2px 2px 0px rgba(0, 0, 0, 0.9)",
                  color: "rgba(180, 220, 180, 0.95)",
                }}
              >
                <History size={28} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                {game?.title || "Game"}
              </h1>
              {game?.currentVersion && (
                <p className="text-sm mt-2 flex items-center gap-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  <Tag size={14} />
                  Current version: <strong>v{game.currentVersion}</strong>
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setShowNewVersionForm(!showNewVersionForm);
                play("hover");
              }}
              className="px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-transform"
              style={{
                background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                border: "1px solid rgba(200, 240, 200, 0.4)",
                color: "rgba(200, 240, 200, 0.95)",
              }}
            >
              <Plus size={16} />
              New Version
            </button>
          </div>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            className="w-full max-w-4xl mb-6 p-4 rounded-lg flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(250, 100, 100, 0.15)",
              border: "1px solid rgba(250, 150, 150, 0.3)",
            }}
          >
            <AlertCircle size={20} style={{ color: "rgba(250, 150, 150, 0.9)" }} />
            <span style={{ color: "rgba(250, 150, 150, 0.9)" }}>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            className="w-full max-w-4xl mb-6 p-4 rounded-lg flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(100, 250, 100, 0.15)",
              border: "1px solid rgba(150, 250, 150, 0.3)",
            }}
          >
            <Check size={20} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
            <span style={{ color: "rgba(150, 250, 150, 0.9)" }}>{success}</span>
          </motion.div>
        )}

        {/* New Version Form */}
        {showNewVersionForm && (
          <motion.div
            className="w-full max-w-4xl mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GameCard>
              <GameCardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-xl font-bold pixelized"
                    style={{ color: "rgba(180, 220, 180, 0.95)" }}
                  >
                    Create New Version
                  </h2>
                  <button
                    onClick={() => setShowNewVersionForm(false)}
                    style={{ color: "rgba(200, 240, 200, 0.6)" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Version Number */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                      Version Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newVersion.version}
                        onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
                        placeholder="1.0.0"
                        pattern="\d+\.\d+\.\d+"
                        required
                        className="flex-1 px-4 py-2 rounded-lg"
                        style={{
                          background: "rgba(100, 200, 100, 0.1)",
                          border: "1px solid rgba(200, 240, 200, 0.2)",
                          color: "rgba(200, 240, 200, 0.95)",
                        }}
                      />
                      <div className="flex gap-1">
                        {(["PATCH", "MINOR", "MAJOR"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => suggestVersion(type)}
                            className="px-3 py-2 rounded text-xs font-semibold hover:scale-105 transition-transform"
                            style={{
                              background: releaseTypeColors[type].bg,
                              color: releaseTypeColors[type].text,
                            }}
                          >
                            +{type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Release Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                      Release Type
                    </label>
                    <div className="flex gap-2">
                      {(Object.keys(releaseTypeColors) as Array<keyof typeof releaseTypeColors>).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewVersion({ ...newVersion, releaseType: type })}
                          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                          style={{
                            background: newVersion.releaseType === type
                              ? releaseTypeColors[type].bg
                              : "rgba(100, 200, 100, 0.05)",
                            border: `1px solid ${newVersion.releaseType === type ? releaseTypeColors[type].text : "rgba(200, 240, 200, 0.2)"}`,
                            color: newVersion.releaseType === type
                              ? releaseTypeColors[type].text
                              : "rgba(200, 240, 200, 0.6)",
                          }}
                        >
                          {releaseTypeColors[type].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title (Optional) */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                      Update Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={newVersion.title}
                      onChange={(e) => setNewVersion({ ...newVersion, title: e.target.value })}
                      placeholder="e.g., Winter Update, Bug Fix Pack"
                      className="w-full px-4 py-2 rounded-lg"
                      style={{
                        background: "rgba(100, 200, 100, 0.1)",
                        border: "1px solid rgba(200, 240, 200, 0.2)",
                        color: "rgba(200, 240, 200, 0.95)",
                      }}
                    />
                  </div>

                  {/* Changelog */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                      Changelog *
                    </label>
                    <textarea
                      value={newVersion.changelog}
                      onChange={(e) => setNewVersion({ ...newVersion, changelog: e.target.value })}
                      placeholder="Describe what changed in this version..."
                      required
                      minLength={10}
                      rows={5}
                      className="w-full px-4 py-2 rounded-lg resize-none"
                      style={{
                        background: "rgba(100, 200, 100, 0.1)",
                        border: "1px solid rgba(200, 240, 200, 0.2)",
                        color: "rgba(200, 240, 200, 0.95)",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg font-bold uppercase tracking-wider transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
                      border: "1px solid rgba(200, 240, 200, 0.4)",
                      color: "rgba(200, 240, 200, 0.95)",
                    }}
                  >
                    {isSubmitting ? "Publishing..." : "Publish Version & Notify Users"}
                  </button>
                </form>
              </GameCardContent>
            </GameCard>
          </motion.div>
        )}

        {/* Version History */}
        <motion.div
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GameCard>
            <GameCardContent className="p-6">
              <h2
                className="text-xl font-bold mb-6 pixelized"
                style={{ color: "rgba(180, 220, 180, 0.95)" }}
              >
                Version History
              </h2>

              {versions.length === 0 ? (
                <div className="text-center py-8">
                  <p style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    No versions published yet. Create your first version above!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className="p-4 rounded-lg"
                      style={{
                        background: index === 0 ? "rgba(100, 200, 100, 0.15)" : "rgba(100, 200, 100, 0.08)",
                        border: `1px solid rgba(200, 240, 200, ${index === 0 ? 0.3 : 0.15})`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="text-lg font-bold"
                            style={{ color: "rgba(200, 240, 200, 0.95)" }}
                          >
                            v{version.version}
                          </span>
                          <span
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              background: releaseTypeColors[version.releaseType].bg,
                              color: releaseTypeColors[version.releaseType].text,
                            }}
                          >
                            {version.releaseType}
                          </span>
                          {index === 0 && (
                            <span
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{
                                background: "rgba(100, 250, 100, 0.2)",
                                color: "rgba(150, 250, 150, 0.95)",
                              }}
                            >
                              LATEST
                            </span>
                          )}
                        </div>
                        <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                          {new Date(version.releasedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {version.title && (
                        <h3
                          className="font-semibold mb-2"
                          style={{ color: "rgba(200, 240, 200, 0.85)" }}
                        >
                          {version.title}
                        </h3>
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
              )}
            </GameCardContent>
          </GameCard>
        </motion.div>
      </motion.main>
    </div>
  );
}



