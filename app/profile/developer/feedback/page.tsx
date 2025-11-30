"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { 
  ChevronLeft, 
  Bug,
  Lightbulb,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Filter
} from "lucide-react";

interface FeedbackItem {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string | null;
  status: string;
  createdAt: string;
  game: {
    id: string;
    title: string;
    slug: string;
  };
  user?: {
    name: string;
  };
}

interface FeedbackStats {
  totalBugs: number;
  totalSuggestions: number;
  totalGeneral: number;
  newFeedback: number;
  inProgress: number;
  resolved: number;
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
      return { icon: CheckCircle2, label: 'Resolved', color: 'rgba(150, 250, 150, 0.9)' };
    default:
      return { icon: MessageSquare, label: status, color: 'rgba(200, 240, 200, 0.7)' };
  }
};

export default function AllFeedbackPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    totalBugs: 0,
    totalSuggestions: 0,
    totalGeneral: 0,
    newFeedback: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/beta/feedback/all');
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
        
        // Calculate stats
        const bugs = data.feedback.filter((f: FeedbackItem) => f.type === 'BUG').length;
        const suggestions = data.feedback.filter((f: FeedbackItem) => f.type === 'SUGGESTION').length;
        const general = data.feedback.filter((f: FeedbackItem) => f.type === 'GENERAL').length;
        const newItems = data.feedback.filter((f: FeedbackItem) => f.status === 'NEW').length;
        const inProgress = data.feedback.filter((f: FeedbackItem) => f.status === 'IN_PROGRESS').length;
        const resolved = data.feedback.filter((f: FeedbackItem) => f.status === 'RESOLVED').length;
        
        setStats({
          totalBugs: bugs,
          totalSuggestions: suggestions,
          totalGeneral: general,
          newFeedback: newItems,
          inProgress,
          resolved,
        });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const typeMatch = filterType === 'ALL' || item.type === filterType;
    const statusMatch = filterStatus === 'ALL' || item.status === filterStatus;
    return typeMatch && statusMatch;
  });

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
            All Beta Feedback
          </h1>
          <p style={{ color: "rgba(200, 240, 200, 0.7)" }}>
            Track feedback and bug reports across all your beta games
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div
            className="p-4 rounded-lg"
            style={{
              background: "rgba(250, 150, 150, 0.1)",
              border: "1px solid rgba(250, 150, 150, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Bug className="w-4 h-4" style={{ color: "rgba(250, 150, 150, 0.9)" }} />
              <span className="text-xs" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Bugs</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "rgba(250, 150, 150, 0.9)" }}>
              {stats.totalBugs}
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: "rgba(250, 220, 100, 0.1)",
              border: "1px solid rgba(250, 220, 100, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4" style={{ color: "rgba(250, 220, 100, 0.9)" }} />
              <span className="text-xs" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Suggestions</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "rgba(250, 220, 100, 0.9)" }}>
              {stats.totalSuggestions}
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: "rgba(150, 200, 255, 0.1)",
              border: "1px solid rgba(150, 200, 255, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
              <span className="text-xs" style={{ color: "rgba(200, 240, 200, 0.7)" }}>General</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "rgba(150, 200, 255, 0.9)" }}>
              {stats.totalGeneral}
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: "rgba(250, 220, 100, 0.1)",
              border: "1px solid rgba(250, 220, 100, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4" style={{ color: "rgba(250, 220, 100, 0.9)" }} />
              <span className="text-xs" style={{ color: "rgba(200, 240, 200, 0.7)" }}>New</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "rgba(250, 220, 100, 0.9)" }}>
              {stats.newFeedback}
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: "rgba(150, 200, 255, 0.1)",
              border: "1px solid rgba(150, 200, 255, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
              <span className="text-xs" style={{ color: "rgba(200, 240, 200, 0.7)" }}>In Progress</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "rgba(150, 200, 255, 0.9)" }}>
              {stats.inProgress}
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: "rgba(150, 250, 150, 0.1)",
              border: "1px solid rgba(150, 250, 150, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4" style={{ color: "rgba(150, 250, 150, 0.9)" }} />
              <span className="text-xs" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Resolved</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "rgba(150, 250, 150, 0.9)" }}>
              {stats.resolved}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: "rgba(200, 240, 200, 0.7)" }} />
            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Type:</span>
            <div className="flex gap-2">
              {['ALL', 'BUG', 'SUGGESTION', 'GENERAL'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className="px-3 py-1 rounded text-sm transition-all"
                  style={{
                    background: filterType === type ? "rgba(150, 200, 255, 0.2)" : "rgba(100, 150, 255, 0.05)",
                    border: filterType === type ? "1px solid rgba(150, 200, 255, 0.4)" : "1px solid rgba(150, 180, 255, 0.2)",
                    color: filterType === type ? "rgba(200, 240, 255, 0.95)" : "rgba(200, 240, 200, 0.7)",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Status:</span>
            <div className="flex gap-2">
              {['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className="px-3 py-1 rounded text-sm transition-all"
                  style={{
                    background: filterStatus === status ? "rgba(150, 200, 255, 0.2)" : "rgba(100, 150, 255, 0.05)",
                    border: filterStatus === status ? "1px solid rgba(150, 200, 255, 0.4)" : "1px solid rgba(150, 180, 255, 0.2)",
                    color: filterStatus === status ? "rgba(200, 240, 255, 0.95)" : "rgba(200, 240, 200, 0.7)",
                  }}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p style={{ color: "rgba(200, 240, 200, 0.5)" }}>Loading feedback...</p>
          </div>
        ) : filteredFeedback.length > 0 ? (
          <div className="space-y-4">
            {filteredFeedback.map((item) => {
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
                  <div className="flex items-start gap-3">
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
                            background: "rgba(100, 150, 255, 0.1)",
                            color: statusInfo.color,
                            border: `1px solid ${statusInfo.color.replace('0.9', '0.3')}`,
                          }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                          <Link
                            href={`/profile/developer/beta/${item.game.id}/feedback`}
                            className="font-semibold hover:underline"
                            style={{ color: "rgba(150, 200, 255, 0.9)" }}
                            onMouseEnter={() => play("hover")}
                          >
                            {item.game.title}
                          </Link>
                          <span>•</span>
                          <span>{item.user?.name || "Unknown User"}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Status Update Buttons */}
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
              No feedback matches the selected filters
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

