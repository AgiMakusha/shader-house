"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { useAudio } from "@/components/audio/AudioProvider";

export default function MyProjectsPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectGenre, setProjectGenre] = useState("");
  const [projectStatus, setProjectStatus] = useState("in_development");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleNewProject = () => {
    setShowNewProjectForm(true);
    play("click");
  };

  const handleCancelNewProject = () => {
    setShowNewProjectForm(false);
    setProjectName("");
    setProjectDescription("");
    setProjectGenre("");
    setProjectStatus("in_development");
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    play("success");
    // TODO: Implement project creation API call
    console.log("Creating project:", { projectName, projectDescription, projectGenre, projectStatus });
    handleCancelNewProject();
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-xl font-semibold pixelized" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
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
        <motion.div
          className="w-full max-w-5xl mb-8 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] pixelized" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
              Your Portfolio
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
              My Projects
            </h1>
            <p
              className="mt-2 text-sm pixelized"
              style={{ color: "rgba(200, 240, 200, 0.65)", textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)" }}
            >
              Manage your game projects and showcase your work
            </p>
          </div>

          <Link
            href="/profile/developer"
            className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all"
            style={{ color: "rgba(200, 240, 200, 0.75)" }}
          >
            ← Back to Profile
          </Link>
        </motion.div>

        {!showNewProjectForm && (
          <motion.div
            className="w-full max-w-5xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.button
              onClick={handleNewProject}
              className="w-full py-4 rounded-lg font-semibold text-lg uppercase tracking-wider transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                border: "1px solid rgba(200, 240, 200, 0.3)",
                color: "rgba(200, 240, 200, 0.95)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              + New Project
            </motion.button>
          </motion.div>
        )}

        {showNewProjectForm && (
          <motion.div
            className="w-full max-w-5xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GameCard>
              <GameCardContent className="p-8">
                <h2
                  className="text-2xl font-bold mb-6 pixelized"
                  style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                >
                  Create New Project
                </h2>

                <form onSubmit={handleSubmitProject} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter your game title"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Description *
                    </label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Describe your game, its features, and what makes it unique"
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm resize-none"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                        Genre
                      </label>
                      <input
                        type="text"
                        value={projectGenre}
                        onChange={(e) => setProjectGenre(e.target.value)}
                        placeholder="e.g., Action, RPG, Puzzle"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                        style={{ color: "rgba(200, 240, 200, 0.85)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                        Status
                      </label>
                      <select
                        value={projectStatus}
                        onChange={(e) => setProjectStatus(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                        style={{ color: "rgba(200, 240, 200, 0.85)" }}
                      >
                        <option value="planning">Planning</option>
                        <option value="in_development">In Development</option>
                        <option value="beta">Beta</option>
                        <option value="released">Released</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      type="submit"
                      className="flex-1 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all"
                      style={{
                        background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                        border: "1px solid rgba(200, 240, 200, 0.3)",
                        color: "rgba(200, 240, 200, 0.95)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Create Project
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={handleCancelNewProject}
                      className="flex-1 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all"
                      style={{
                        background: "linear-gradient(135deg, rgba(200, 100, 100, 0.3) 0%, rgba(180, 80, 80, 0.2) 100%)",
                        border: "1px solid rgba(240, 200, 200, 0.3)",
                        color: "rgba(240, 200, 200, 0.95)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </GameCardContent>
            </GameCard>
          </motion.div>
        )}

        <motion.div
          className="w-full max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GameCard>
            <GameCardContent className="p-8">
              <h2
                className="text-2xl font-bold mb-6 pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Your Projects
              </h2>
              <div className="text-center py-12">
                <p
                  className="text-lg pixelized"
                  style={{ color: "rgba(200, 240, 200, 0.6)" }}
                >
                  No projects yet. Click "+ New Project" to get started!
                </p>
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>
      </motion.main>
    </div>
  );
}



