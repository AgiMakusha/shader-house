"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Smartphone, Globe, Trash2, RefreshCw, Shield, LogOut } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";

interface Session {
  id: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  ip: string | null;
  location: string | null;
  lastActiveAt: string;
  createdAt: string;
  isCurrent?: boolean;
}

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSessions = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/sessions");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err: any) {
      setError(err.message || "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const revokeSession = async (sessionId: string) => {
    setIsRevoking(sessionId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error("Failed to revoke session");
      setSuccess("Session revoked successfully");
      setTimeout(() => setSuccess(""), 3000);
      fetchSessions();
    } catch (err: any) {
      setError(err.message || "Failed to revoke session");
    } finally {
      setIsRevoking(null);
    }
  };

  const revokeAllSessions = async () => {
    setIsRevokingAll(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revokeAll: true }),
      });
      if (!res.ok) throw new Error("Failed to revoke sessions");
      setSuccess("All other sessions revoked");
      setTimeout(() => setSuccess(""), 3000);
      fetchSessions();
    } catch (err: any) {
      setError(err.message || "Failed to revoke sessions");
    } finally {
      setIsRevokingAll(false);
    }
  };

  const getDeviceIcon = (device: string | null, os: string | null) => {
    if (device?.toLowerCase().includes("mobile") || os?.toLowerCase().includes("android") || os?.toLowerCase().includes("ios")) {
      return <Smartphone size={20} />;
    }
    return <Monitor size={20} />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <GameCard>
      <GameCardContent className="p-8 space-y-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield size={24} style={{ color: "rgba(180, 220, 180, 0.9)" }} />
            <h2
              className="text-2xl font-bold pixelized"
              style={{
                textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              Active Sessions
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              onClick={fetchSessions}
              disabled={isLoading}
              className="p-2 rounded-lg transition-all"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(200, 240, 200, 0.8)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </motion.button>

            {sessions.length > 1 && (
              <motion.button
                onClick={revokeAllSessions}
                disabled={isRevokingAll}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "rgba(200, 80, 80, 0.2)",
                  border: "1px solid rgba(200, 80, 80, 0.3)",
                  color: "rgba(255, 180, 180, 0.95)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={14} />
                {isRevokingAll ? "Revoking..." : "Sign out all others"}
              </motion.button>
            )}
          </div>
        </div>

        <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.65)" }}>
          These are devices that are currently signed in to your account. Revoke access for devices you don't recognize.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
              Loading sessions...
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div
            className="p-6 rounded-lg text-center"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
              No active sessions found. Session tracking will begin with your next login.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  background: index === 0 ? "rgba(100, 200, 100, 0.1)" : "rgba(255, 255, 255, 0.05)",
                  border: index === 0 ? "1px solid rgba(100, 200, 100, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(100, 180, 100, 0.15)",
                      color: "rgba(180, 240, 180, 0.9)",
                    }}
                  >
                    {getDeviceIcon(session.device, session.os)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                        {session.browser || "Unknown browser"} on {session.os || "Unknown OS"}
                      </p>
                      {index === 0 && (
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            background: "rgba(100, 200, 100, 0.3)",
                            color: "rgba(180, 255, 180, 0.95)",
                          }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {session.location && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                          <Globe size={12} />
                          {session.location}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                        Last active: {formatDate(session.lastActiveAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {index !== 0 && (
                  <motion.button
                    onClick={() => revokeSession(session.id)}
                    disabled={isRevoking === session.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: "rgba(200, 80, 80, 0.15)",
                      border: "1px solid rgba(200, 80, 80, 0.25)",
                      color: "rgba(255, 180, 180, 0.9)",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 size={14} />
                    {isRevoking === session.id ? "..." : "Revoke"}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {error && (
          <div
            className="p-3 rounded-lg"
            style={{
              background: "rgba(180, 60, 60, 0.15)",
              border: "1px solid rgba(255, 120, 120, 0.3)",
              color: "rgba(255, 180, 180, 0.95)",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="p-3 rounded-lg"
            style={{
              background: "rgba(100, 200, 100, 0.15)",
              border: "1px solid rgba(150, 240, 150, 0.3)",
              color: "rgba(180, 240, 180, 0.95)",
              fontSize: "12px",
            }}
          >
            {success}
          </div>
        )}
      </GameCardContent>
    </GameCard>
  );
}



