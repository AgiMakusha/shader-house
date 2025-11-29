"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { 
  ChevronLeft, 
  CheckCircle2, 
  Circle,
  Bug,
  MessageSquare,
  Lightbulb,
  Upload,
  Send,
  Clock,
  Trophy
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  completed: boolean;
  completedAt: string | null;
}

interface BetaTest {
  id: string;
  gameId: string;
  bugsReported: number;
  tasksCompleted: number;
  timeSpent: number;
  game: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string;
    developer: {
      name: string;
    };
  };
}

export default function BetaTestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { play } = useAudio();
  const gameId = params.gameId as string;

  const [test, setTest] = useState<BetaTest | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  // Feedback form state
  const [feedbackType, setFeedbackType] = useState<'BUG' | 'SUGGESTION' | 'GENERAL'>('BUG');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [screenshot, setScreenshot] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [gameId]);

  const fetchData = async () => {
    try {
      // Fetch beta test info
      const testsResponse = await fetch("/api/beta/my-tests");
      if (testsResponse.ok) {
        const testsData = await testsResponse.json();
        const currentTest = testsData.tests.find((t: any) => t.gameId === gameId);
        if (currentTest) {
          setTest(currentTest);
        } else {
          router.push("/profile/gamer/beta");
          return;
        }
      }

      // Fetch tasks
      const tasksResponse = await fetch(`/api/beta/tasks/${gameId}`);
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Screenshot must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
        play("success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/beta/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          type: feedbackType,
          title: title.trim(),
          description: description.trim(),
          severity: feedbackType === 'BUG' ? severity : undefined,
          screenshot: screenshot || undefined,
          deviceInfo: navigator.userAgent,
        }),
      });

      if (response.ok) {
        play("success");
        alert("Feedback submitted successfully!");
        
        // Reset form
        setTitle('');
        setDescription('');
        setScreenshot('');
        setShowFeedbackForm(false);
        
        // Refresh data
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to submit feedback");
        play("error");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred");
      play("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <p style={{ color: "rgba(200, 240, 200, 0.7)" }}>Loading...</p>
      </div>
    );
  }

  if (!test) {
    return null;
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <motion.main
        className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="w-full max-w-5xl mb-8">
          <Link
            href="/profile/gamer/beta"
            className="inline-flex items-center gap-2 mb-6 text-sm transition-colors"
            style={{ color: "rgba(200, 240, 200, 0.7)" }}
            onMouseEnter={() => play("hover")}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to My Beta Tests
          </Link>

          <div className="flex items-start gap-6 mb-6">
            {/* Game Cover */}
            <div
              className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0"
              style={{
                background: "rgba(100, 150, 255, 0.1)",
                border: "1px solid rgba(150, 180, 255, 0.3)",
              }}
            >
              {test.game.coverUrl && (
                <img
                  src={test.game.coverUrl}
                  alt={test.game.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex-1">
              <h1
                className="text-3xl font-bold tracking-wider uppercase pixelized mb-2"
                style={{
                  textShadow: `
                    0 0 12px rgba(120, 200, 120, 0.8),
                    0 0 24px rgba(100, 180, 100, 0.6),
                    2px 2px 0px rgba(0, 0, 0, 0.9)
                  `,
                  color: "rgba(180, 220, 180, 0.95)",
                }}
              >
                {test.game.title}
              </h1>
              <p
                className="text-sm mb-4"
                style={{
                  color: "rgba(200, 240, 200, 0.65)",
                  textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)",
                }}
              >
                by {test.game.developer.name}
              </p>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4" style={{ color: "rgba(250, 150, 150, 0.9)" }} />
                  <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    {test.bugsReported} bugs reported
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" style={{ color: "rgba(250, 220, 100, 0.9)" }} />
                  <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    {test.tasksCompleted} tasks completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
                  <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    {Math.floor(test.timeSpent / 60)}h {test.timeSpent % 60}m played
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GameCard>
              <GameCardContent className="p-6">
                <h2
                  className="text-xl font-bold mb-4 pixelized flex items-center gap-2"
                  style={{
                    color: "rgba(180, 220, 180, 0.95)",
                    textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  <Trophy className="w-5 h-5" style={{ color: "rgba(250, 220, 100, 0.9)" }} />
                  Tasks
                </h2>

                {tasks.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    No tasks available yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg transition-all"
                        style={{
                          background: task.completed
                            ? "rgba(100, 200, 100, 0.1)"
                            : "rgba(100, 150, 255, 0.05)",
                          border: task.completed
                            ? "1px solid rgba(150, 250, 150, 0.3)"
                            : "1px solid rgba(150, 180, 255, 0.2)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {task.completed ? (
                            <CheckCircle2 
                              className="w-5 h-5 flex-shrink-0 mt-0.5" 
                              style={{ color: "rgba(150, 250, 150, 0.9)" }} 
                            />
                          ) : (
                            <Circle 
                              className="w-5 h-5 flex-shrink-0 mt-0.5" 
                              style={{ color: "rgba(150, 180, 255, 0.5)" }} 
                            />
                          )}
                          <div className="flex-1">
                            <h3
                              className="font-semibold mb-1"
                              style={{
                                color: task.completed
                                  ? "rgba(150, 250, 150, 0.9)"
                                  : "rgba(200, 240, 200, 0.9)",
                              }}
                            >
                              {task.title}
                            </h3>
                            <p
                              className="text-xs"
                              style={{ color: "rgba(200, 240, 200, 0.6)" }}
                            >
                              {task.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GameCardContent>
            </GameCard>
          </motion.div>

          {/* Feedback Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GameCard>
              <GameCardContent className="p-6">
                <h2
                  className="text-xl font-bold mb-4 pixelized flex items-center gap-2"
                  style={{
                    color: "rgba(180, 220, 180, 0.95)",
                    textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  <MessageSquare className="w-5 h-5" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
                  Submit Feedback
                </h2>

                {!showFeedbackForm ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setFeedbackType('BUG');
                        setShowFeedbackForm(true);
                        play("hover");
                      }}
                      className="w-full p-4 rounded-lg text-left transition-all flex items-center gap-3"
                      style={{
                        background: "rgba(250, 100, 100, 0.1)",
                        border: "1px solid rgba(250, 150, 150, 0.3)",
                      }}
                    >
                      <Bug className="w-5 h-5" style={{ color: "rgba(250, 150, 150, 0.9)" }} />
                      <div>
                        <div className="font-semibold" style={{ color: "rgba(250, 150, 150, 0.95)" }}>
                          Report a Bug
                        </div>
                        <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                          Found something broken?
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setFeedbackType('SUGGESTION');
                        setShowFeedbackForm(true);
                        play("hover");
                      }}
                      className="w-full p-4 rounded-lg text-left transition-all flex items-center gap-3"
                      style={{
                        background: "rgba(250, 220, 100, 0.1)",
                        border: "1px solid rgba(250, 220, 100, 0.3)",
                      }}
                    >
                      <Lightbulb className="w-5 h-5" style={{ color: "rgba(250, 220, 100, 0.9)" }} />
                      <div>
                        <div className="font-semibold" style={{ color: "rgba(250, 220, 100, 0.95)" }}>
                          Make a Suggestion
                        </div>
                        <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                          Share your ideas
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setFeedbackType('GENERAL');
                        setShowFeedbackForm(true);
                        play("hover");
                      }}
                      className="w-full p-4 rounded-lg text-left transition-all flex items-center gap-3"
                      style={{
                        background: "rgba(150, 200, 255, 0.1)",
                        border: "1px solid rgba(150, 200, 255, 0.3)",
                      }}
                    >
                      <MessageSquare className="w-5 h-5" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
                      <div>
                        <div className="font-semibold" style={{ color: "rgba(150, 200, 255, 0.95)" }}>
                          General Feedback
                        </div>
                        <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                          Other thoughts?
                        </div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "rgba(200, 240, 200, 0.7)" }}
                      >
                        Title <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Brief summary..."
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                        style={{ color: "rgba(200, 240, 200, 0.85)" }}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "rgba(200, 240, 200, 0.7)" }}
                      >
                        Description <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide details..."
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all resize-none"
                        style={{ color: "rgba(200, 240, 200, 0.85)" }}
                        required
                      />
                    </div>

                    {/* Severity (for bugs) */}
                    {feedbackType === 'BUG' && (
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "rgba(200, 240, 200, 0.7)" }}
                        >
                          Severity
                        </label>
                        <select
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value as any)}
                          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                          style={{ color: "rgba(200, 240, 200, 0.85)" }}
                        >
                          <option value="LOW">Low - Minor issue</option>
                          <option value="MEDIUM">Medium - Noticeable problem</option>
                          <option value="HIGH">High - Major issue</option>
                          <option value="CRITICAL">Critical - Game breaking</option>
                        </select>
                      </div>
                    )}

                    {/* Screenshot Upload */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "rgba(200, 240, 200, 0.7)" }}
                      >
                        Screenshot (optional)
                      </label>
                      <label
                        className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all"
                        style={{
                          borderColor: screenshot ? "rgba(150, 250, 150, 0.4)" : "rgba(150, 180, 255, 0.3)",
                          background: screenshot ? "rgba(100, 200, 100, 0.1)" : "rgba(100, 150, 255, 0.05)",
                        }}
                      >
                        <Upload className="w-5 h-5" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
                        <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                          {screenshot ? "Screenshot uploaded ✓" : "Click to upload"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowFeedbackForm(false);
                          setTitle('');
                          setDescription('');
                          setScreenshot('');
                          play("hover");
                        }}
                        className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                        style={{
                          background: "rgba(200, 100, 100, 0.2)",
                          border: "1px solid rgba(240, 150, 150, 0.3)",
                          color: "rgba(240, 200, 200, 0.95)",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        style={{
                          background: isSubmitting
                            ? "rgba(100, 150, 255, 0.2)"
                            : "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
                          border: "1px solid rgba(150, 250, 150, 0.4)",
                          color: "rgba(200, 240, 200, 0.95)",
                          opacity: isSubmitting ? 0.6 : 1,
                        }}
                      >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </form>
                )}
              </GameCardContent>
            </GameCard>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

