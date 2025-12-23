"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Users,
  Building2,
  DollarSign,
  FileText,
  RefreshCw,
  X,
  Eye,
} from "lucide-react";

interface DeveloperProfile {
  id: string;
  userId: string;
  developerType: string;
  teamSize: number;
  hasPublisher: boolean;
  ownsIP: boolean;
  fundingSources: string[];
  companyType: string;
  evidenceLinks: string[];
  attestIndie: boolean;
  attestedAt: string;
  attestedIP: string | null;
  verificationStatus: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  isIndieEligible: boolean;
  studioName: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    image: string | null;
  };
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  appealing: number;
  total: number;
}

type StatusFilter = "PENDING" | "APPROVED" | "REJECTED" | "APPEALING" | "ALL";

export default function IndieVerificationPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<DeveloperProfile[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState<DeveloperProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  const fetchVerifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: selectedStatus,
        page: page.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
      });

      const res = await fetch(`/api/admin/indie-verification?${params}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        if (res.status === 403) router.push("/");
        return;
      }

      const data = await res.json();
      setProfiles(data.profiles);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching verifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, page, searchQuery, router]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleStatusUpdate = async (profileId: string, status: string, reason?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/indie-verification/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });

      if (res.ok) {
        play("door");
        setIsModalOpen(false);
        setSelectedProfile(null);
        setRejectionReason("");
        setShowRejectionInput(false);
        fetchVerifications();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const openProfileModal = (profile: DeveloperProfile) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
    setShowRejectionInput(false);
    setRejectionReason("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-amber-400 bg-amber-500/20";
      case "APPROVED":
        return "text-green-400 bg-green-500/20";
      case "REJECTED":
        return "text-red-400 bg-red-500/20";
      case "APPEALING":
        return "text-blue-400 bg-blue-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "APPEALING":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const STATUS_TABS: { label: string; value: StatusFilter; icon: React.ReactNode }[] = [
    { label: "Pending", value: "PENDING", icon: <Clock className="w-4 h-4" /> },
    { label: "Approved", value: "APPROVED", icon: <CheckCircle className="w-4 h-4" /> },
    { label: "Rejected", value: "REJECTED", icon: <XCircle className="w-4 h-4" /> },
    { label: "Appealing", value: "APPEALING", icon: <AlertTriangle className="w-4 h-4" /> },
    { label: "All", value: "ALL", icon: <Users className="w-4 h-4" /> },
  ];

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
          className="w-full max-w-6xl mb-6 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <motion.button
                className="p-2 rounded-lg transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-amber-400" />
              </motion.button>
            </Link>
            <div>
              <h1
                className="text-2xl font-bold tracking-wider uppercase pixelized flex items-center gap-3"
                style={{
                  textShadow: `
                    0 0 12px rgba(251, 191, 36, 0.8),
                    0 0 24px rgba(245, 158, 11, 0.6),
                    2px 2px 0px rgba(0, 0, 0, 0.9)
                  `,
                  color: "rgba(253, 230, 138, 0.95)",
                }}
              >
                <Shield className="w-7 h-7" />
                Indie Verification
              </h1>
              <p
                className="text-sm tracking-wide"
                style={{ color: "rgba(254, 243, 199, 0.7)" }}
              >
                Review developer indie status applications
              </p>
            </div>
          </div>

          <motion.button
            onClick={fetchVerifications}
            className="p-2 rounded-lg transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 text-amber-400 ${isLoading ? "animate-spin" : ""}`} />
          </motion.button>
        </motion.div>

        {/* Stats Bar */}
        {stats && (
          <motion.div
            className="w-full max-w-6xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GameCard>
              <GameCardContent className="p-4">
                <div className="flex justify-around items-center gap-6">
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
                    <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Pending</p>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                    <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Approved</p>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                    <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Rejected</p>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold text-blue-400">{stats.appealing}</div>
                    <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Appealing</p>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>{stats.total}</div>
                    <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Total</p>
                  </div>
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          className="w-full max-w-6xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Status Tabs */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_TABS.map((tab) => (
                <motion.button
                  key={tab.value}
                  onClick={() => {
                    setSelectedStatus(tab.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    selectedStatus === tab.value
                      ? "bg-amber-500/30 border-amber-400/50 text-amber-300"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                  style={{ border: "1px solid" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab.icon}
                  {tab.label}
                  {stats && tab.value !== "ALL" && (
                    <span className="text-xs opacity-70">
                      ({stats[tab.value.toLowerCase() as keyof Stats]})
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-4 py-2 rounded-lg text-sm w-64"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "rgba(200, 240, 200, 0.9)",
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Profiles List */}
        <motion.div
          className="w-full max-w-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-4" />
              <p style={{ color: "rgba(200, 240, 200, 0.7)" }}>Loading verifications...</p>
            </div>
          ) : profiles.length === 0 ? (
            <GameCard>
              <GameCardContent className="py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-amber-400/50" />
                <p style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  No {selectedStatus !== "ALL" ? selectedStatus.toLowerCase() : ""} verifications found
                </p>
              </GameCardContent>
            </GameCard>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <GameCard interactive onClick={() => openProfileModal(profile)}>
                    <GameCardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Avatar */}
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                            style={{
                              background: "linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)",
                              border: "1px solid rgba(251, 191, 36, 0.3)",
                              color: "rgba(253, 230, 138, 0.95)",
                            }}
                          >
                            {profile.user.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3
                                className="font-bold"
                                style={{ color: "rgba(253, 230, 138, 0.95)" }}
                              >
                                {profile.user.name}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${getStatusColor(profile.verificationStatus)}`}>
                                {getStatusIcon(profile.verificationStatus)}
                                {profile.verificationStatus}
                              </span>
                            </div>
                            <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                              {profile.user.email}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Team: {profile.teamSize}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {profile.companyType}
                              </span>
                              <span>
                                Submitted: {formatDate(profile.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-amber-400/70" />
                        </div>
                      </div>
                    </GameCardContent>
                  </GameCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <motion.button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg disabled:opacity-30"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
                whileHover={{ scale: page === 1 ? 1 : 1.05 }}
                whileTap={{ scale: page === 1 ? 1 : 0.95 }}
              >
                <ChevronLeft className="w-5 h-5 text-amber-400" />
              </motion.button>
              <span style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                Page {page} of {totalPages}
              </span>
              <motion.button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg disabled:opacity-30"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
                whileHover={{ scale: page === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: page === totalPages ? 1 : 0.95 }}
              >
                <ChevronRight className="w-5 h-5 text-amber-400" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.main>

      {/* Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedProfile && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => {
                setIsModalOpen(false);
                setShowRejectionInput(false);
              }}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(30, 50, 30, 0.98) 0%, rgba(20, 40, 20, 0.98) 100%)",
                border: "1px solid rgba(251, 191, 36, 0.3)",
                boxShadow: "0 0 60px rgba(251, 191, 36, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 p-6 border-b border-white/10" style={{ background: "rgba(20, 40, 20, 0.95)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                      style={{
                        background: "linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)",
                        border: "1px solid rgba(251, 191, 36, 0.3)",
                        color: "rgba(253, 230, 138, 0.95)",
                      }}
                    >
                      {selectedProfile.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2
                        className="text-xl font-bold"
                        style={{ color: "rgba(253, 230, 138, 0.95)" }}
                      >
                        {selectedProfile.user.name}
                      </h2>
                      <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        {selectedProfile.user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setShowRejectionInput(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Current Status */}
                <div className="flex items-center gap-3">
                  <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>Current Status:</span>
                  <span className={`px-3 py-1 rounded-lg flex items-center gap-2 ${getStatusColor(selectedProfile.verificationStatus)}`}>
                    {getStatusIcon(selectedProfile.verificationStatus)}
                    {selectedProfile.verificationStatus}
                  </span>
                </div>

                {/* Rejection Reason (if rejected) */}
                {selectedProfile.rejectionReason && (
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
                  >
                    <p className="text-sm font-medium text-red-400 mb-1">Rejection Reason:</p>
                    <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                      {selectedProfile.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Developer Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Developer Type
                    </p>
                    <p className="font-medium" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                      {selectedProfile.developerType}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Team Size
                    </p>
                    <p className="font-medium flex items-center gap-2" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                      <Users className="w-4 h-4" />
                      {selectedProfile.teamSize} {selectedProfile.teamSize === 1 ? "person" : "people"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Has Publisher
                    </p>
                    <p className="font-medium" style={{ color: selectedProfile.hasPublisher ? "rgba(239, 68, 68, 0.9)" : "rgba(187, 247, 208, 0.95)" }}>
                      {selectedProfile.hasPublisher ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Owns IP
                    </p>
                    <p className="font-medium" style={{ color: selectedProfile.ownsIP ? "rgba(187, 247, 208, 0.95)" : "rgba(239, 68, 68, 0.9)" }}>
                      {selectedProfile.ownsIP ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Company Type
                    </p>
                    <p className="font-medium flex items-center gap-2" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                      <Building2 className="w-4 h-4" />
                      {selectedProfile.companyType}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Auto-Eligible
                    </p>
                    <p className="font-medium" style={{ color: selectedProfile.isIndieEligible ? "rgba(187, 247, 208, 0.95)" : "rgba(253, 230, 138, 0.9)" }}>
                      {selectedProfile.isIndieEligible ? "Yes" : "Under Review"}
                    </p>
                  </div>
                </div>

                {/* Funding Sources */}
                <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <p className="text-xs font-medium mb-2 flex items-center gap-2" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                    <DollarSign className="w-4 h-4" />
                    Funding Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.fundingSources.length > 0 ? (
                      selectedProfile.fundingSources.map((source) => (
                        <span
                          key={source}
                          className="px-3 py-1 rounded-lg text-sm"
                          style={{
                            background: source === "MAJOR_PUBLISHER" || source === "VC" 
                              ? "rgba(239, 68, 68, 0.2)" 
                              : "rgba(255, 255, 255, 0.1)",
                            color: source === "MAJOR_PUBLISHER" || source === "VC"
                              ? "rgba(252, 165, 165, 0.95)"
                              : "rgba(200, 240, 200, 0.95)",
                          }}
                        >
                          {source.replace("_", " ")}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "rgba(200, 240, 200, 0.5)" }}>None specified</span>
                    )}
                  </div>
                </div>

                {/* Evidence Links */}
                <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <p className="text-xs font-medium mb-2 flex items-center gap-2" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                    <FileText className="w-4 h-4" />
                    Evidence Links
                  </p>
                  <div className="space-y-2">
                    {selectedProfile.evidenceLinks.length > 0 ? (
                      selectedProfile.evidenceLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:underline"
                          style={{ color: "rgba(147, 197, 253, 0.95)" }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          {link}
                        </a>
                      ))
                    ) : (
                      <span style={{ color: "rgba(200, 240, 200, 0.5)" }}>No evidence provided</span>
                    )}
                  </div>
                </div>

                {/* Attestation Info */}
                <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <p className="text-xs font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                    Attestation
                  </p>
                  <div className="text-sm space-y-1" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                    <p>Attested: {selectedProfile.attestIndie ? "Yes" : "No"}</p>
                    <p>Date: {formatDate(selectedProfile.attestedAt)}</p>
                    {selectedProfile.attestedIP && <p>IP: {selectedProfile.attestedIP}</p>}
                  </div>
                </div>

                {/* Rejection Input */}
                {showRejectionInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-lg"
                    style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
                  >
                    <label className="text-sm font-medium text-red-400 mb-2 block">
                      Rejection Reason (required)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this application is being rejected..."
                      className="w-full p-3 rounded-lg text-sm resize-none"
                      rows={3}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "rgba(200, 240, 200, 0.9)",
                      }}
                    />
                    <div className="flex gap-2 mt-3">
                      <motion.button
                        onClick={() => handleStatusUpdate(selectedProfile.id, "REJECTED", rejectionReason)}
                        disabled={!rejectionReason.trim() || isUpdating}
                        className="flex-1 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
                        style={{
                          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)",
                          border: "1px solid rgba(252, 165, 165, 0.3)",
                          color: "rgba(252, 165, 165, 0.95)",
                        }}
                        whileHover={{ scale: rejectionReason.trim() && !isUpdating ? 1.02 : 1 }}
                        whileTap={{ scale: rejectionReason.trim() && !isUpdating ? 0.98 : 1 }}
                      >
                        {isUpdating ? "Rejecting..." : "Confirm Rejection"}
                      </motion.button>
                      <motion.button
                        onClick={() => setShowRejectionInput(false)}
                        className="px-4 py-2 rounded-lg font-medium text-sm"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "rgba(200, 240, 200, 0.95)",
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                {!showRejectionInput && (
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    {selectedProfile.verificationStatus !== "APPROVED" && (
                      <motion.button
                        onClick={() => handleStatusUpdate(selectedProfile.id, "APPROVED")}
                        disabled={isUpdating}
                        className="flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{
                          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.2) 100%)",
                          border: "1px solid rgba(187, 247, 208, 0.3)",
                          color: "rgba(187, 247, 208, 0.95)",
                        }}
                        whileHover={{ scale: isUpdating ? 1 : 1.02 }}
                        whileTap={{ scale: isUpdating ? 1 : 0.98 }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isUpdating ? "Updating..." : "Approve"}
                      </motion.button>
                    )}
                    {selectedProfile.verificationStatus !== "REJECTED" && (
                      <motion.button
                        onClick={() => setShowRejectionInput(true)}
                        disabled={isUpdating}
                        className="flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{
                          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)",
                          border: "1px solid rgba(252, 165, 165, 0.3)",
                          color: "rgba(252, 165, 165, 0.95)",
                        }}
                        whileHover={{ scale: isUpdating ? 1 : 1.02 }}
                        whileTap={{ scale: isUpdating ? 1 : 0.98 }}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </motion.button>
                    )}
                    {selectedProfile.verificationStatus === "REJECTED" && (
                      <motion.button
                        onClick={() => handleStatusUpdate(selectedProfile.id, "PENDING")}
                        disabled={isUpdating}
                        className="flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{
                          background: "linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)",
                          border: "1px solid rgba(253, 230, 138, 0.3)",
                          color: "rgba(253, 230, 138, 0.95)",
                        }}
                        whileHover={{ scale: isUpdating ? 1 : 1.02 }}
                        whileTap={{ scale: isUpdating ? 1 : 0.98 }}
                      >
                        <Clock className="w-4 h-4" />
                        {isUpdating ? "Updating..." : "Reset to Pending"}
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

