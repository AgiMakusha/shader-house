"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/components/audio/AudioProvider";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  Bug,
  Lightbulb,
  Gamepad2,
  FlaskConical,
  CheckCircle2,
  Users,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  type: "BUG_REPORT" | "SUGGESTION" | "PLAY_LEVEL" | "TEST_FEATURE";
  xpReward: number;
  rewardPoints: number;
  isOptional: boolean;
  order: number;
  completionCount: number;
  testerCount: number;
}

interface TaskManagementModalProps {
  gameId: string;
  gameTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const TASK_TYPES = [
  { value: "BUG_REPORT", label: "Bug Report", icon: Bug, color: "rgba(250, 150, 150, 0.9)" },
  { value: "SUGGESTION", label: "Suggestion", icon: Lightbulb, color: "rgba(250, 220, 100, 0.9)" },
  { value: "PLAY_LEVEL", label: "Play Level", icon: Gamepad2, color: "rgba(150, 200, 255, 0.9)" },
  { value: "TEST_FEATURE", label: "Test Feature", icon: FlaskConical, color: "rgba(150, 250, 150, 0.9)" },
];

export default function TaskManagementModal({
  gameId,
  gameTitle,
  isOpen,
  onClose,
}: TaskManagementModalProps) {
  const { play } = useAudio();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [testerCount, setTesterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Task["type"]>("BUG_REPORT");
  const [xpReward, setXpReward] = useState(50);
  const [rewardPoints, setRewardPoints] = useState(10);
  const [isOptional, setIsOptional] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen, gameId]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/beta/tasks/by-game/${gameId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        setTesterCount(data.testerCount || 0);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("BUG_REPORT");
    setXpReward(50);
    setRewardPoints(10);
    setIsOptional(false);
    setEditingTask(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
    play("hover");
  };

  const handleEdit = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setType(task.type);
    setXpReward(task.xpReward);
    setRewardPoints(task.rewardPoints);
    setIsOptional(task.isOptional);
    setEditingTask(task);
    setIsCreating(false);
    play("hover");
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        xpReward,
        rewardPoints,
        isOptional,
      };

      let response;
      if (editingTask) {
        // Update existing task
        response = await fetch(`/api/beta/tasks/${editingTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new task
        response = await fetch("/api/beta/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, gameId }),
        });
      }

      if (response.ok) {
        play("success");
        resetForm();
        fetchTasks();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save task");
        play("error");
      }
    } catch (error) {
      console.error("Error saving task:", error);
      alert("An error occurred");
      play("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (taskId: string, taskTitle: string) => {
    const confirmed = window.confirm(
      `Delete task "${taskTitle}"?\n\nThis will also delete all completion records for this task. This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/beta/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        play("success");
        fetchTasks();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete task");
        play("error");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("An error occurred");
      play("error");
    }
  };

  if (!isOpen) return null;

  const showingForm = isCreating || editingTask;
  const taskTypeInfo = TASK_TYPES.find((t) => t.value === type);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: "rgba(0, 0, 0, 0.85)" }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg p-6"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "linear-gradient(135deg, rgba(20, 40, 60, 0.95) 0%, rgba(10, 20, 30, 0.98) 100%)",
            border: "1px solid rgba(150, 180, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2
                className="text-2xl font-bold pixelized mb-2"
                style={{
                  color: "rgba(180, 220, 180, 0.95)",
                  textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                }}
              >
                Manage Beta Tasks
              </h2>
              <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                {gameTitle}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <Users className="w-4 h-4" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
                <span style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                  {testerCount} active tester{testerCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all"
              style={{
                background: "rgba(200, 100, 100, 0.2)",
                border: "1px solid rgba(240, 150, 150, 0.3)",
              }}
              onMouseEnter={() => play("hover")}
            >
              <X className="w-5 h-5" style={{ color: "rgba(240, 200, 200, 0.95)" }} />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p style={{ color: "rgba(200, 240, 200, 0.7)" }}>Loading tasks...</p>
            </div>
          ) : (
            <>
              {/* Task List or Form */}
              {!showingForm ? (
                <>
                  {/* Create Button */}
                  <button
                    onClick={handleCreate}
                    className="w-full mb-4 p-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                      border: "1px solid rgba(150, 250, 150, 0.4)",
                      color: "rgba(200, 240, 200, 0.95)",
                    }}
                    onMouseEnter={() => play("hover")}
                  >
                    <Plus className="w-5 h-5" />
                    Create New Task
                  </button>

                  {/* Tasks List */}
                  {tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <FlaskConical
                        className="w-12 h-12 mx-auto mb-4"
                        style={{ color: "rgba(150, 200, 255, 0.5)" }}
                      />
                      <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        No tasks yet. Create your first task to guide beta testers!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => {
                        const taskType = TASK_TYPES.find((t) => t.value === task.type);
                        const Icon = taskType?.icon || Bug;
                        const completionRate =
                          testerCount > 0 ? Math.round((task.completionCount / testerCount) * 100) : 0;

                        return (
                          <div
                            key={task.id}
                            className="p-4 rounded-lg"
                            style={{
                              background: "rgba(100, 150, 255, 0.05)",
                              border: "1px solid rgba(150, 180, 255, 0.2)",
                            }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <Icon className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: taskType?.color }} />
                                <div className="flex-1">
                                  <h3
                                    className="font-semibold mb-1"
                                    style={{ color: "rgba(200, 240, 200, 0.9)" }}
                                  >
                                    {task.title}
                                    {task.isOptional && (
                                      <span
                                        className="ml-2 text-xs px-2 py-0.5 rounded"
                                        style={{
                                          background: "rgba(250, 220, 100, 0.2)",
                                          color: "rgba(250, 220, 100, 0.9)",
                                        }}
                                      >
                                        Optional
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-xs mb-2" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                                    {task.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                      {taskType?.label}
                                    </span>
                                    <span style={{ color: "rgba(250, 220, 100, 0.8)" }}>
                                      {task.xpReward} XP
                                    </span>
                                    <span style={{ color: "rgba(150, 200, 255, 0.8)" }}>
                                      {task.rewardPoints} pts
                                    </span>
                                    <span
                                      className="flex items-center gap-1"
                                      style={{ color: "rgba(150, 250, 150, 0.8)" }}
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      {task.completionCount}/{testerCount} ({completionRate}%)
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(task)}
                                  className="p-2 rounded transition-all"
                                  style={{
                                    background: "rgba(150, 200, 255, 0.2)",
                                    border: "1px solid rgba(150, 200, 255, 0.3)",
                                  }}
                                  onMouseEnter={() => play("hover")}
                                >
                                  <Edit2 className="w-4 h-4" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
                                </button>
                                <button
                                  onClick={() => handleDelete(task.id, task.title)}
                                  className="p-2 rounded transition-all"
                                  style={{
                                    background: "rgba(250, 100, 100, 0.2)",
                                    border: "1px solid rgba(250, 150, 150, 0.3)",
                                  }}
                                  onMouseEnter={() => play("hover")}
                                >
                                  <Trash2 className="w-4 h-4" style={{ color: "rgba(250, 150, 150, 0.9)" }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* Task Form */
                <div className="space-y-4">
                  <h3
                    className="text-lg font-bold pixelized mb-4"
                    style={{ color: "rgba(180, 220, 180, 0.95)" }}
                  >
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </h3>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Title <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Report bugs in Level 1"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Description <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what testers should do..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all resize-none"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Task Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TASK_TYPES.map((taskType) => {
                        const Icon = taskType.icon;
                        const isSelected = type === taskType.value;
                        return (
                          <button
                            key={taskType.value}
                            type="button"
                            onClick={() => setType(taskType.value as Task["type"])}
                            className="p-3 rounded-lg text-left transition-all flex items-center gap-2"
                            style={{
                              background: isSelected ? "rgba(100, 200, 100, 0.2)" : "rgba(100, 150, 255, 0.05)",
                              border: isSelected
                                ? "1px solid rgba(150, 250, 150, 0.4)"
                                : "1px solid rgba(150, 180, 255, 0.2)",
                            }}
                            onMouseEnter={() => play("hover")}
                          >
                            <Icon className="w-5 h-5" style={{ color: taskType.color }} />
                            <span
                              className="text-sm font-medium"
                              style={{ color: isSelected ? "rgba(150, 250, 150, 0.95)" : "rgba(200, 240, 200, 0.7)" }}
                            >
                              {taskType.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                        XP Reward
                      </label>
                      <input
                        type="number"
                        value={xpReward}
                        onChange={(e) => setXpReward(Math.max(0, Math.min(1000, parseInt(e.target.value) || 0)))}
                        min="0"
                        max="1000"
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ color: "rgba(200, 240, 200, 0.85)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                        Reward Points
                      </label>
                      <input
                        type="number"
                        value={rewardPoints}
                        onChange={(e) => setRewardPoints(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                        min="0"
                        max="100"
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ color: "rgba(200, 240, 200, 0.85)" }}
                      />
                    </div>
                  </div>

                  {/* Optional */}
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isOptional}
                        onChange={(e) => setIsOptional(e.target.checked)}
                        className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all hover:border-[rgba(150,220,150,0.7)]"
                        style={{
                          border: '2px solid rgba(180, 220, 180, 0.45)',
                          backgroundColor: isOptional ? 'rgba(120, 200, 120, 0.75)' : 'rgba(100, 180, 100, 0.18)',
                          boxShadow: isOptional 
                            ? '0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)'
                            : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)',
                        }}
                      />
                      {isOptional && (
                        <svg
                          className="absolute w-3.5 h-3.5 pointer-events-none"
                          style={{ color: 'rgba(240, 255, 240, 0.98)', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span 
                      className="text-sm select-none transition-all leading-tight"
                      style={{ 
                        color: isOptional ? 'rgba(210, 245, 210, 0.85)' : 'rgba(190, 230, 190, 0.65)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      This task is optional
                    </span>
                  </label>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all"
                      style={{
                        background: "rgba(200, 100, 100, 0.2)",
                        border: "1px solid rgba(240, 150, 150, 0.3)",
                        color: "rgba(240, 200, 200, 0.95)",
                      }}
                      onMouseEnter={() => play("hover")}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                      style={{
                        background: isSaving
                          ? "rgba(100, 150, 255, 0.2)"
                          : "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
                        border: "1px solid rgba(150, 250, 150, 0.4)",
                        color: "rgba(200, 240, 200, 0.95)",
                        opacity: isSaving ? 0.6 : 1,
                      }}
                      onMouseEnter={() => play("hover")}
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

