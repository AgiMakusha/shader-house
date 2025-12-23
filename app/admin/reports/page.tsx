"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Flag,
  MessageSquare,
  Gamepad2,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Inbox,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Star,
  FileText,
  Shield,
  Ban,
  EyeOff,
  AlertCircle,
  Bug,
  Image as ImageIcon,
} from "lucide-react";

interface Report {
  id: string;
  type: string;
  reason: string;
  description: string | null;
  status: string;
  actionTaken: string | null;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  reporter: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  game: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
  } | null;
  reportedUser: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  rating: {
    id: string;
    stars: number;
    comment: string | null;
    game: { title: string; slug: string };
    user: { name: string };
  } | null;
  thread: {
    id: string;
    title: string;
    game: { title: string; slug: string };
    author: { name: string };
  } | null;
  post: {
    id: string;
    content: string;
    thread: { title: string };
    author: { name: string };
  } | null;
  resolvedBy: {
    id: string;
    name: string;
  } | null;
  screenshots: string[];
}

interface ReportStats {
  pending: number;
  reviewing: number;
  resolved: number;
  dismissed: number;
  total: number;
}

interface TypeCounts {
  game: number;
  user: number;
  review: number;
  thread: number;
  post: number;
  platformBug: number;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [typeCounts, setTypeCounts] = useState<TypeCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolution, setResolution] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: statusFilter,
        type: typeFilter,
      });

      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch reports");
      }

      const data = await res.json();
      setReports(data.reports);
      setStats(data.stats);
      setTypeCounts(data.typeCounts);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, typeFilter, router]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = async (reportId: string, status: "RESOLVED" | "DISMISSED") => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolution: resolution || null,
          actionTaken: selectedAction || (status === "DISMISSED" ? "NO_ACTION" : null),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update report");
        return;
      }

      fetchReports();
      setShowModal(false);
      setSelectedReport(null);
      setResolution("");
      setSelectedAction(null);
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Failed to update report");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartReview = async (reportId: string) => {
    try {
      await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REVIEWING" }),
      });
      fetchReports();
    } catch (error) {
      console.error("Error starting review:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "GAME":
        return <Gamepad2 className="w-4 h-4" />;
      case "USER":
        return <User className="w-4 h-4" />;
      case "REVIEW":
        return <Star className="w-4 h-4" />;
      case "THREAD":
      case "POST":
        return <MessageSquare className="w-4 h-4" />;
      case "PLATFORM_BUG":
        return <Bug className="w-4 h-4" />;
      default:
        return <Flag className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/20 text-amber-300 border-amber-400/30";
      case "REVIEWING":
        return "bg-blue-500/20 text-blue-300 border-blue-400/30";
      case "RESOLVED":
        return "bg-green-500/20 text-green-300 border-green-400/30";
      case "DISMISSED":
        return "bg-gray-500/20 text-gray-300 border-gray-400/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30";
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      SPAM: "Spam",
      INAPPROPRIATE: "Inappropriate Content",
      HARASSMENT: "Harassment",
      MALICIOUS: "Malicious Content",
      COPYRIGHT: "Copyright Violation",
      MISINFORMATION: "Misinformation",
      IMPERSONATION: "Impersonation",
      OTHER: "Other",
    };
    return labels[reason] || reason;
  };

  const getReportedContent = (report: Report) => {
    if (report.type === "PLATFORM_BUG") return "Platform Bug Report";
    if (report.game) return report.game.title;
    if (report.reportedUser) return report.reportedUser.name;
    if (report.rating) return `Review on "${report.rating.game.title}"`;
    if (report.thread) return report.thread.title;
    if (report.post) return `Reply in "${report.post.thread.title}"`;
    return "Unknown";
  };

  const totalPending = (typeCounts?.game || 0) + (typeCounts?.user || 0) + 
    (typeCounts?.review || 0) + (typeCounts?.thread || 0) + (typeCounts?.post || 0) + 
    (typeCounts?.platformBug || 0);

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
          className="w-full max-w-6xl mb-8 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <motion.button
                className="p-2 rounded-lg transition-all"
                style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.9)" }} />
              </motion.button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-400/30">
                <AlertTriangle className="w-8 h-8 text-red-400" style={{ filter: "drop-shadow(0 0 8px rgba(248, 113, 113, 0.5))" }} />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold tracking-wider uppercase pixelized"
                  style={{
                    textShadow: `0 0 12px rgba(248, 113, 113, 0.8), 2px 2px 0px rgba(0, 0, 0, 0.9)`,
                    color: "rgba(254, 202, 202, 0.95)",
                  }}
                >
                  Content Reports
                </h1>
                <p className="text-sm font-semibold pixelized" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  Review and moderate reported content
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Stats */}
        {stats && (
          <motion.div
            className="w-full max-w-6xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GameCard>
              <GameCardContent className="p-4">
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <button
                    onClick={() => { setStatusFilter("PENDING"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${statusFilter === "PENDING" ? "bg-amber-500/20" : "hover:bg-white/5"}`}
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span style={{ color: "rgba(253, 230, 138, 0.9)" }}>Pending</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-amber-500/20" style={{ color: "rgba(253, 230, 138, 0.7)" }}>{stats.pending}</span>
                  </button>
                  <button
                    onClick={() => { setStatusFilter("REVIEWING"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${statusFilter === "REVIEWING" ? "bg-blue-500/20" : "hover:bg-white/5"}`}
                  >
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span style={{ color: "rgba(147, 197, 253, 0.9)" }}>Reviewing</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-blue-500/20" style={{ color: "rgba(147, 197, 253, 0.7)" }}>{stats.reviewing}</span>
                  </button>
                  <button
                    onClick={() => { setStatusFilter("RESOLVED"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${statusFilter === "RESOLVED" ? "bg-green-500/20" : "hover:bg-white/5"}`}
                  >
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span style={{ color: "rgba(187, 247, 208, 0.9)" }}>Resolved</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-green-500/20" style={{ color: "rgba(187, 247, 208, 0.7)" }}>{stats.resolved}</span>
                  </button>
                  <button
                    onClick={() => { setStatusFilter("DISMISSED"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${statusFilter === "DISMISSED" ? "bg-gray-500/20" : "hover:bg-white/5"}`}
                  >
                    <XCircle className="w-4 h-4 text-gray-400" />
                    <span style={{ color: "rgba(200, 200, 200, 0.9)" }}>Dismissed</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-gray-500/20" style={{ color: "rgba(200, 200, 200, 0.7)" }}>{stats.dismissed}</span>
                  </button>
                  <button
                    onClick={() => { setStatusFilter("ALL"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${statusFilter === "ALL" ? "bg-white/10" : "hover:bg-white/5"}`}
                  >
                    <Inbox className="w-4 h-4 text-gray-400" />
                    <span style={{ color: "rgba(200, 240, 200, 0.9)" }}>All</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-white/10" style={{ color: "rgba(200, 240, 200, 0.7)" }}>{stats.total}</span>
                  </button>
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>
        )}

        {/* Type Filters */}
        {typeCounts && (
          <motion.div
            className="w-full max-w-6xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GameCard>
              <GameCardContent className="p-4">
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <button
                    onClick={() => { setTypeFilter("ALL"); setPage(1); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${typeFilter === "ALL" ? "bg-white/10" : "hover:bg-white/5"}`}
                  >
                    <Flag className="w-4 h-4" style={{ color: "rgba(200, 240, 200, 0.7)" }} />
                    <span style={{ color: "rgba(200, 240, 200, 0.9)" }}>All Types</span>
                  </button>
                  <button
                    onClick={() => { setTypeFilter("GAME"); setPage(1); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${typeFilter === "GAME" ? "bg-purple-500/20" : "hover:bg-white/5"}`}
                  >
                    <Gamepad2 className="w-4 h-4 text-purple-400" />
                    <span style={{ color: "rgba(196, 181, 253, 0.9)" }}>Games</span>
                    {typeCounts.game > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">{typeCounts.game}</span>}
                  </button>
                  <button
                    onClick={() => { setTypeFilter("USER"); setPage(1); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${typeFilter === "USER" ? "bg-blue-500/20" : "hover:bg-white/5"}`}
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span style={{ color: "rgba(147, 197, 253, 0.9)" }}>Users</span>
                    {typeCounts.user > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">{typeCounts.user}</span>}
                  </button>
                  <button
                    onClick={() => { setTypeFilter("REVIEW"); setPage(1); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${typeFilter === "REVIEW" ? "bg-amber-500/20" : "hover:bg-white/5"}`}
                  >
                    <Star className="w-4 h-4 text-amber-400" />
                    <span style={{ color: "rgba(253, 230, 138, 0.9)" }}>Reviews</span>
                    {typeCounts.review > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">{typeCounts.review}</span>}
                  </button>
                  <button
                    onClick={() => { setTypeFilter("THREAD"); setPage(1); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${typeFilter === "THREAD" ? "bg-green-500/20" : "hover:bg-white/5"}`}
                  >
                    <FileText className="w-4 h-4 text-green-400" />
                    <span style={{ color: "rgba(187, 247, 208, 0.9)" }}>Threads</span>
                    {typeCounts.thread > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-300">{typeCounts.thread}</span>}
                  </button>
                  <button
                    onClick={() => { setTypeFilter("POST"); setPage(1); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${typeFilter === "POST" ? "bg-pink-500/20" : "hover:bg-white/5"}`}
                  >
                    <MessageSquare className="w-4 h-4 text-pink-400" />
                    <span style={{ color: "rgba(244, 114, 182, 0.9)" }}>Posts</span>
                    {typeCounts.post > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300">{typeCounts.post}</span>}
                  </button>
                  <button
                    onClick={() => { setTypeFilter("PLATFORM_BUG"); setPage(1); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${typeFilter === "PLATFORM_BUG" ? "bg-amber-500/20" : "hover:bg-white/5"}`}
                  >
                    <Bug className="w-4 h-4 text-amber-400" />
                    <span style={{ color: "rgba(253, 230, 138, 0.9)" }}>Bugs</span>
                    {typeCounts.platformBug > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">{typeCounts.platformBug}</span>}
                  </button>
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>
        )}

        {/* Reports List */}
        <motion.div
          className="w-full max-w-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <GameCard>
            <GameCardContent className="p-0">
              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="text-lg" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Loading reports...</div>
                </div>
              ) : reports.length === 0 ? (
                <div className="p-12 text-center">
                  <Flag className="w-16 h-16 mx-auto mb-4" style={{ color: "rgba(200, 240, 200, 0.2)" }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                    No Reports Found
                  </h3>
                  <p style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    {statusFilter === "PENDING" 
                      ? "No pending reports to review." 
                      : "No reports match the current filters."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => { setSelectedReport(report); setShowModal(true); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(248, 113, 113, 0.2)", border: "1px solid rgba(248, 113, 113, 0.3)" }}
                          >
                            {getTypeIcon(report.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                                {getReportedContent(report)}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(report.status)}`}>
                                {report.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                              <span>{getReasonLabel(report.reason)}</span>
                              <span>•</span>
                              <span>Reported by {report.reporter.name}</span>
                              <span>•</span>
                              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.status === "PENDING" && (
                            <motion.button
                              onClick={(e) => { e.stopPropagation(); handleStartReview(report.id); }}
                              className="px-3 py-1 rounded text-xs font-medium"
                              style={{ background: "rgba(59, 130, 246, 0.2)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "rgba(147, 197, 253, 0.9)" }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Start Review
                            </motion.button>
                          )}
                          <Eye className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.5)" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-white/10 flex items-center justify-center gap-4">
                  <motion.button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg disabled:opacity-50"
                    style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.9)" }} />
                  </motion.button>
                  <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>Page {page} of {totalPages}</span>
                  <motion.button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg disabled:opacity-50"
                    style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.9)" }} />
                  </motion.button>
                </div>
              )}
            </GameCardContent>
          </GameCard>
        </motion.div>
      </motion.main>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {showModal && selectedReport && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80" onClick={() => { setShowModal(false); setSelectedReport(null); setResolution(""); setSelectedAction(null); }} />
            <motion.div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(20, 40, 30, 0.98) 0%, rgba(15, 30, 25, 0.98) 100%)",
                border: "1px solid rgba(200, 240, 200, 0.2)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(248, 113, 113, 0.2)", border: "1px solid rgba(248, 113, 113, 0.3)" }}
                  >
                    {getTypeIcon(selectedReport.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                      {selectedReport.type} Report
                    </h3>
                    <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      {getReasonLabel(selectedReport.reason)}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowModal(false); setSelectedReport(null); setResolution(""); setSelectedAction(null); }} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.7)" }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Reported Content */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                    Reported Content
                  </label>
                  <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                    <div className="font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                      {getReportedContent(selectedReport)}
                    </div>
                    {selectedReport.rating?.comment && (
                      <p className="text-sm mt-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                        "{selectedReport.rating.comment}"
                      </p>
                    )}
                    {selectedReport.post?.content && (
                      <p className="text-sm mt-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                        "{selectedReport.post.content.substring(0, 200)}..."
                      </p>
                    )}
                  </div>
                </div>

                {/* Report Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Reported By
                    </label>
                    <div style={{ color: "rgba(200, 240, 200, 0.9)" }}>{selectedReport.reporter.name}</div>
                    <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>{selectedReport.reporter.email}</div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Date Reported
                    </label>
                    <div style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedReport.description && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                      {selectedReport.type === "PLATFORM_BUG" ? "Bug Details" : "Additional Details from Reporter"}
                    </label>
                    <div className="p-3 rounded-lg text-sm whitespace-pre-wrap" style={{ background: "rgba(255, 255, 255, 0.05)", color: "rgba(200, 240, 200, 0.8)" }}>
                      {selectedReport.description}
                    </div>
                  </div>
                )}

                {/* Screenshots */}
                {selectedReport.screenshots && selectedReport.screenshots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Screenshots ({selectedReport.screenshots.length})
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedReport.screenshots.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg overflow-hidden border hover:opacity-90 transition-opacity"
                          style={{ borderColor: "rgba(200, 240, 200, 0.2)" }}
                        >
                          <img
                            src={url}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.8)" }}>Status:</label>
                  <span className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>

                {/* Resolution (if already resolved) */}
                {selectedReport.resolvedAt && (
                  <div className="p-4 rounded-lg" style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="font-medium" style={{ color: "rgba(187, 247, 208, 0.9)" }}>Resolved</span>
                    </div>
                    <p className="text-sm" style={{ color: "rgba(187, 247, 208, 0.7)" }}>
                      By {selectedReport.resolvedBy?.name} on {new Date(selectedReport.resolvedAt).toLocaleString()}
                    </p>
                    {selectedReport.resolution && (
                      <p className="text-sm mt-2" style={{ color: "rgba(187, 247, 208, 0.8)" }}>
                        {selectedReport.resolution}
                      </p>
                    )}
                    {selectedReport.actionTaken && (
                      <p className="text-sm mt-2" style={{ color: "rgba(187, 247, 208, 0.9)" }}>
                        Action: {selectedReport.actionTaken.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions (if pending/reviewing) */}
                {(selectedReport.status === "PENDING" || selectedReport.status === "REVIEWING") && (
                  <>
                    {/* Select Action */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                        Select Action
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "WARNING_ISSUED", label: "Issue Warning", icon: AlertCircle },
                          { value: "CONTENT_REMOVED", label: "Remove Content", icon: XCircle },
                          { value: "CONTENT_HIDDEN", label: "Hide Content", icon: EyeOff },
                          { value: "USER_SUSPENDED", label: "Suspend User", icon: Shield },
                          { value: "USER_BANNED", label: "Ban User", icon: Ban },
                          { value: "NO_ACTION", label: "No Action", icon: CheckCircle },
                        ].map((action) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={action.value}
                              onClick={() => setSelectedAction(action.value)}
                              className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-all ${
                                selectedAction === action.value ? "ring-2 ring-green-400" : ""
                              }`}
                              style={{
                                background: selectedAction === action.value ? "rgba(100, 200, 100, 0.2)" : "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                color: "rgba(200, 240, 200, 0.9)",
                              }}
                            >
                              <Icon className="w-4 h-4" />
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Resolution Notes */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                        Resolution Notes (Optional)
                      </label>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Add notes about this resolution..."
                        rows={3}
                        className="w-full p-3 rounded-lg text-sm resize-none"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "rgba(200, 240, 200, 0.95)",
                        }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => handleResolve(selectedReport.id, "RESOLVED")}
                        disabled={actionLoading || !selectedAction}
                        className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{
                          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.2) 100%)",
                          border: "1px solid rgba(34, 197, 94, 0.5)",
                          color: "rgba(187, 247, 208, 0.95)",
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actionLoading ? "Processing..." : "Resolve Report"}
                      </motion.button>
                      <motion.button
                        onClick={() => handleResolve(selectedReport.id, "DISMISSED")}
                        disabled={actionLoading}
                        className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "rgba(200, 240, 200, 0.9)",
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <XCircle className="w-4 h-4" />
                        Dismiss
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
