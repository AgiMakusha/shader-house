"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAudio } from "@/components/audio/AudioProvider";
import { useToast } from "@/hooks/useToast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import Particles from "@/components/fx/Particles";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  Sparkles,
  Bug,
  Lightbulb,
  Gamepad2,
  FlaskConical,
  MessageSquare,
  User,
  Calendar,
  Image as ImageIcon,
  ListTodo,
} from "lucide-react";

interface TaskCompletion {
  id: string;
  report: string;
  screenshot: string | null;
  deviceInfo: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  submittedAt: string;
  verifiedAt: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  task: {
    id: string;
    title: string;
    description: string;
    type: string;
    xpReward: number;
    rewardPoints: number;
    isOptional: boolean;
  };
}

interface Game {
  id: string;
  title: string;
  slug: string;
}

const getTaskTypeInfo = (type: string) => {
  switch (type) {
    case 'BUG_REPORT':
      return { icon: Bug, label: 'Bug Report', color: 'rgba(250, 150, 150, 0.9)' };
    case 'SUGGESTION':
      return { icon: Lightbulb, label: 'Suggestion', color: 'rgba(250, 220, 100, 0.9)' };
    case 'PLAY_LEVEL':
      return { icon: Gamepad2, label: 'Play Level', color: 'rgba(150, 200, 255, 0.9)' };
    case 'TEST_FEATURE':
      return { icon: FlaskConical, label: 'Test Feature', color: 'rgba(150, 250, 150, 0.9)' };
    default:
      return { icon: MessageSquare, label: 'Task', color: 'rgba(200, 240, 200, 0.7)' };
  }
};

export default function GameTasksPage() {
  const router = useRouter();
  const params = useParams();
  const { play } = useAudio();
  const { success, error, warning, ToastComponent } = useToast();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    completionId: string;
    approved: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    completionId: "",
    approved: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchData();
  }, [gameId]);

  const fetchData = async () => {
    try {
      // Fetch game info
      const gameResponse = await fetch(`/api/games/${gameId}`);
      if (gameResponse.ok) {
        const gameData = await gameResponse.json();
        setGame(gameData);
      }

      // Fetch task completions
      const completionsResponse = await fetch(`/api/beta/tasks/completions?gameId=${gameId}`);
      if (completionsResponse.ok) {
        const completionsData = await completionsResponse.json();
        // Filter out any completions without user or task data
        const validCompletions = (completionsData.completions || []).filter((c: any) => c && c.user && c.task);
        setCompletions(validCompletions);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openConfirmModal = (completionId: string, approved: boolean) => {
    setConfirmModal({
      isOpen: true,
      completionId,
      approved,
      title: approved ? "Approve Task Completion?" : "Reject Task Completion?",
      message: approved
        ? "The gamer will receive their XP and points as a reward for completing this task."
        : "The gamer will be able to resubmit their report after rejection.",
    });
  };

  const handleVerifyCompletion = async () => {
    const { completionId, approved } = confirmModal;

    try {
      const response = await fetch('/api/beta/tasks/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionId, approved }),
      });

      if (response.ok) {
        play('success');
        if (approved) {
          success("Task completion approved! Gamer has been awarded XP and points.");
        } else {
          warning("Task completion rejected. Gamer can resubmit.");
        }
        fetchData();
      } else {
        const data = await response.json();
        error(data.error || 'Failed to verify completion');
        play('error');
      }
    } catch (err) {
      console.error('Error verifying completion:', err);
      error('An error occurred while verifying the completion');
      play('error');
    }
  };

  const pendingCompletions = completions.filter(c => c && c.user && c.task && c.status === 'PENDING');
  const verifiedCompletions = completions.filter(c => c && c.user && c.task && c.status === 'VERIFIED');
  const rejectedCompletions = completions.filter(c => c && c.user && c.task && c.status === 'REJECTED');

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(to bottom, #0a0f1a 0%, #1a1f2e 100%)" }}>
      <Particles />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/profile/developer/beta`}
            className="inline-flex items-center gap-2 mb-4 transition-all hover:gap-3"
            style={{ color: "rgba(150, 200, 255, 0.9)" }}
            onMouseEnter={() => play("hover")}
          >
            <ChevronLeft size={20} />
            <span>Back to Beta Management</span>
          </Link>

          <h1
            className="text-4xl font-bold mb-2"
            style={{
              color: "rgba(220, 240, 255, 0.95)",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
            }}
          >
            <ListTodo className="inline w-8 h-8 mr-2" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
            Manage Beta Tasks
          </h1>
          {game && (
            <p style={{ color: "rgba(200, 240, 200, 0.7)" }}>
              Review and verify task completions for {game.title}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p style={{ color: "rgba(200, 240, 200, 0.5)" }}>Loading task completions...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Completions */}
            {pendingCompletions.length > 0 && (
              <div>
                <h2
                  className="text-xl font-bold mb-4 flex items-center gap-2"
                  style={{ color: "rgba(250, 220, 100, 0.95)" }}
                >
                  <Clock className="w-5 h-5" />
                  Pending Verification ({pendingCompletions.length})
                </h2>
                <div className="space-y-4">
                  {pendingCompletions.map((completion) => {
                    const taskTypeInfo = getTaskTypeInfo(completion.task.type);
                    const TaskTypeIcon = taskTypeInfo.icon;
                    
                    return (
                      <motion.div
                        key={completion.id}
                        className="p-6 rounded-lg"
                        style={{
                          background: "linear-gradient(135deg, rgba(20, 40, 60, 0.6) 0%, rgba(10, 20, 30, 0.8) 100%)",
                          border: "1px solid rgba(250, 220, 100, 0.3)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {/* Task Info */}
                        <div className="flex items-start gap-3 mb-4">
                          <TaskTypeIcon className="w-6 h-6 flex-shrink-0" style={{ color: taskTypeInfo.color }} />
                          <div className="flex-1">
                            <h3
                              className="font-bold mb-1"
                              style={{ color: "rgba(200, 240, 200, 0.95)" }}
                            >
                              {completion.task.title}
                            </h3>
                            <p className="text-sm mb-2" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                              {completion.task.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs">
                              <span
                                className="px-2 py-1 rounded"
                                style={{
                                  background: `${taskTypeInfo.color.replace('0.9', '0.2')}`,
                                  border: `1px solid ${taskTypeInfo.color.replace('0.9', '0.4')}`,
                                  color: taskTypeInfo.color,
                                }}
                              >
                                {taskTypeInfo.label}
                              </span>
                              <span className="flex items-center gap-1" style={{ color: "rgba(250, 220, 100, 0.8)" }}>
                                <Trophy className="w-3 h-3" />
                                {completion.task.xpReward} XP
                              </span>
                              <span className="flex items-center gap-1" style={{ color: "rgba(150, 200, 255, 0.8)" }}>
                                <Sparkles className="w-3 h-3" />
                                {completion.task.rewardPoints} pts
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Gamer Info */}
                        <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                          <User className="w-4 h-4" />
                          <span>{completion.user?.name || "Unknown User"}</span>
                          <span className="mx-2">•</span>
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(completion.submittedAt).toLocaleDateString()}</span>
                        </div>

                        {/* Report */}
                        <div
                          className="p-4 rounded-lg mb-4"
                          style={{
                            background: "rgba(100, 150, 255, 0.05)",
                            border: "1px solid rgba(150, 180, 255, 0.2)",
                          }}
                        >
                          <h4 className="font-semibold mb-2 text-sm" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                            Gamer Report:
                          </h4>
                          <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                            {completion.report}
                          </p>
                          {completion.deviceInfo && (
                            <p className="text-xs mt-2" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              Device: {completion.deviceInfo}
                            </p>
                          )}
                        </div>

                        {/* Screenshot */}
                        {completion.screenshot && (
                          <div className="mb-4">
                            <button
                              onClick={() => setSelectedImage(completion.screenshot)}
                              className="relative group"
                            >
                              <img
                                src={completion.screenshot}
                                alt="Task completion screenshot"
                                className="rounded-lg max-w-xs max-h-48 object-cover"
                                style={{ border: "1px solid rgba(150, 180, 255, 0.3)" }}
                              />
                              <div
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: "rgba(0, 0, 0, 0.5)" }}
                              >
                                <ImageIcon className="w-8 h-8" style={{ color: "rgba(200, 240, 200, 0.9)" }} />
                              </div>
                            </button>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => openConfirmModal(completion.id, true)}
                            className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                            style={{
                              background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                              border: "1px solid rgba(150, 250, 150, 0.4)",
                              color: "rgba(200, 240, 200, 0.95)",
                            }}
                            onMouseEnter={() => play("hover")}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve & Award Rewards
                          </button>
                          <button
                            onClick={() => openConfirmModal(completion.id, false)}
                            className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                            style={{
                              background: "rgba(250, 150, 150, 0.1)",
                              border: "1px solid rgba(250, 150, 150, 0.3)",
                              color: "rgba(250, 180, 180, 0.95)",
                            }}
                            onMouseEnter={() => play("hover")}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Verified Completions */}
            {verifiedCompletions.length > 0 && (
              <div>
                <h2
                  className="text-xl font-bold mb-4 flex items-center gap-2"
                  style={{ color: "rgba(150, 250, 150, 0.95)" }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Verified ({verifiedCompletions.length})
                </h2>
                <div className="grid gap-4">
                  {verifiedCompletions.map((completion) => (
                    <div
                      key={completion.id}
                      className="p-4 rounded-lg"
                      style={{
                        background: "rgba(100, 200, 100, 0.1)",
                        border: "1px solid rgba(150, 250, 150, 0.2)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                            {completion.task.title}
                          </h3>
                          <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                            {completion.user?.name || "Unknown User"} • {new Date(completion.verifiedAt!).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5" style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completions.length === 0 && (
              <div className="text-center py-12">
                <p style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                  No task completions yet
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.9)" }}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Screenshot"
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleVerifyCompletion}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.approved ? "Approve & Award" : "Reject"}
        cancelText="Cancel"
        type={confirmModal.approved ? "success" : "warning"}
      />

      {/* Toast Notifications */}
      <ToastComponent />
    </div>
  );
}








