"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAudio } from "@/components/audio/AudioProvider";
import { useToast } from "@/hooks/useToast";
import Particles from "@/components/fx/Particles";
import {
  ChevronLeft,
  MessageSquare,
  CheckCircle,
  Bug,
  Lightbulb,
  Clock,
  Play,
  Check,
  AlertCircle,
} from "lucide-react";

interface Feedback {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  screenshot: string | null;
  status: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface Game {
  id: string;
  title: string;
  coverUrl: string;
}

const getFeedbackTypeInfo = (type: string) => {
  switch (type) {
    case 'BUG':
      return { 
        icon: Bug, 
        label: 'Bug Report', 
        color: 'rgba(250, 150, 150, 0.9)',
        bgColor: 'rgba(250, 150, 150, 0.1)',
        borderColor: 'rgba(250, 150, 150, 0.3)'
      };
    case 'SUGGESTION':
      return { 
        icon: Lightbulb, 
        label: 'Suggestion', 
        color: 'rgba(250, 220, 100, 0.9)',
        bgColor: 'rgba(250, 220, 100, 0.1)',
        borderColor: 'rgba(250, 220, 100, 0.3)'
      };
    case 'GENERAL':
    default:
      return { 
        icon: MessageSquare, 
        label: 'General Feedback', 
        color: 'rgba(150, 200, 255, 0.9)',
        bgColor: 'rgba(150, 200, 255, 0.1)',
        borderColor: 'rgba(150, 200, 255, 0.3)'
      };
  }
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'NEW':
      return { icon: AlertCircle, label: 'New', color: 'rgba(250, 220, 100, 0.9)' };
    case 'IN_PROGRESS':
      return { icon: Clock, label: 'In Progress', color: 'rgba(150, 200, 255, 0.9)' };
    case 'RESOLVED':
      return { icon: CheckCircle, label: 'Resolved', color: 'rgba(150, 250, 150, 0.9)' };
    default:
      return { icon: MessageSquare, label: status, color: 'rgba(200, 240, 200, 0.7)' };
  }
};

export default function GameFeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const { play } = useAudio();
  const { success, error: showError, ToastComponent } = useToast();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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

      // Fetch feedback
      const feedbackResponse = await fetch(`/api/beta/feedback?gameId=${gameId}`);
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        setFeedback(feedbackData.feedback || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    setUpdatingStatus(feedbackId);
    try {
      const response = await fetch('/api/beta/feedback/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, status: newStatus }),
      });

      if (response.ok) {
        play('success');
        success(`Feedback marked as ${newStatus.replace('_', ' ').toLowerCase()}!`);
        // Refresh data
        await fetchData();
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to update status');
        play('error');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showError('An error occurred while updating status');
      play('error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(to bottom, #0a0f1a 0%, #1a1f2e 100%)" }}>
      <Particles />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile/developer/beta"
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
            <MessageSquare className="inline w-8 h-8 mr-2" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
            Game Feedback
          </h1>
          {game && (
            <p style={{ color: "rgba(200, 240, 200, 0.7)" }}>
              Manage feedback and bug reports for {game.title}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <p style={{ color: "rgba(200, 240, 200, 0.5)" }}>Loading feedback...</p>
            </div>
          ) : feedback.length > 0 ? (
            <div className="space-y-4">
              {feedback.map((item) => {
                const feedbackTypeInfo = getFeedbackTypeInfo(item.type);
                const statusInfo = getStatusInfo(item.status);
                const FeedbackIcon = feedbackTypeInfo.icon;
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div
                    key={item.id}
                    className="p-6 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${feedbackTypeInfo.bgColor} 0%, rgba(10, 20, 30, 0.8) 100%)`,
                      border: `1px solid ${feedbackTypeInfo.borderColor}`,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <FeedbackIcon 
                        className="w-5 h-5 flex-shrink-0 mt-0.5" 
                        style={{ color: feedbackTypeInfo.color }} 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                            {item.title}
                          </h3>
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: feedbackTypeInfo.bgColor,
                              color: feedbackTypeInfo.color,
                              border: `1px solid ${feedbackTypeInfo.borderColor}`,
                            }}
                          >
                            {feedbackTypeInfo.label}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded flex items-center gap-1"
                            style={{
                              background: statusInfo.color.replace('0.9', '0.2'),
                              color: statusInfo.color,
                              border: `1px solid ${statusInfo.color.replace('0.9', '0.4')}`,
                            }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm mb-3" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                            <span>{item.user?.name || "Unknown User"}</span>
                            <span>•</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          {/* Status Update Buttons */}
                          <div className="flex gap-2">
                            {item.status !== 'IN_PROGRESS' && item.status !== 'RESOLVED' && (
                              <button
                                onClick={() => updateFeedbackStatus(item.id, 'IN_PROGRESS')}
                                disabled={updatingStatus === item.id}
                                className="px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1"
                                style={{
                                  background: "rgba(150, 200, 255, 0.2)",
                                  border: "1px solid rgba(150, 200, 255, 0.4)",
                                  color: "rgba(200, 240, 255, 0.95)",
                                  opacity: updatingStatus === item.id ? 0.5 : 1,
                                  cursor: updatingStatus === item.id ? 'not-allowed' : 'pointer',
                                }}
                                onMouseEnter={() => play("hover")}
                              >
                                <Play className="w-3 h-3" />
                                In Progress
                              </button>
                            )}
                            {item.status !== 'RESOLVED' && (
                              <button
                                onClick={() => updateFeedbackStatus(item.id, 'RESOLVED')}
                                disabled={updatingStatus === item.id}
                                className="px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1"
                                style={{
                                  background: "rgba(150, 250, 150, 0.2)",
                                  border: "1px solid rgba(150, 250, 150, 0.4)",
                                  color: "rgba(200, 240, 200, 0.95)",
                                  opacity: updatingStatus === item.id ? 0.5 : 1,
                                  cursor: updatingStatus === item.id ? 'not-allowed' : 'pointer',
                                }}
                                onMouseEnter={() => play("hover")}
                              >
                                <Check className="w-3 h-3" />
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                No feedback yet
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastComponent />
    </div>
  );
}
