"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileJson, Shield, Clock } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";

export function DataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleExport = async () => {
    setIsExporting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile/export");
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to export data");
      }

      // Get the blob and trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shader-house-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Data exported successfully!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <GameCard>
      <GameCardContent className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Download size={24} style={{ color: "rgba(180, 220, 180, 0.9)" }} />
          <div>
            <h2
              className="text-2xl font-bold pixelized"
              style={{
                textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              Export Your Data
            </h2>
            <p className="text-sm mt-1" style={{ color: "rgba(200, 240, 200, 0.65)" }}>
              GDPR compliant data portability
            </p>
          </div>
        </div>

        <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
          Download a complete copy of all your personal data stored on Shader House. 
          This includes your profile information, game activity, ratings, beta testing 
          history, community posts, and notification history.
        </p>

        {/* What's included */}
        <div
          className="p-4 rounded-lg space-y-3"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <p className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
            Your export includes:
          </p>
          <ul className="grid grid-cols-2 gap-2 text-xs" style={{ color: "rgba(200, 240, 200, 0.65)" }}>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(150, 240, 150, 0.8)" }} />
              Profile information
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(150, 240, 150, 0.8)" }} />
              Game ratings & reviews
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(150, 240, 150, 0.8)" }} />
              Favorites & wishlist
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(150, 240, 150, 0.8)" }} />
              Purchase history
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(150, 240, 150, 0.8)" }} />
              Beta testing activity
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(150, 240, 150, 0.8)" }} />
              Community posts
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(150, 240, 150, 0.8)" }} />
              Reward history
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(150, 240, 150, 0.8)" }} />
              Notification history
            </li>
          </ul>
        </div>

        {/* Info boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="p-4 rounded-lg flex items-start gap-3"
            style={{
              background: "rgba(100, 180, 240, 0.1)",
              border: "1px solid rgba(100, 180, 240, 0.2)",
            }}
          >
            <FileJson size={18} style={{ color: "rgba(140, 200, 255, 0.9)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "rgba(180, 220, 255, 0.95)" }}>
                JSON Format
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(180, 220, 255, 0.7)" }}>
                Portable, machine-readable format
              </p>
            </div>
          </div>

          <div
            className="p-4 rounded-lg flex items-start gap-3"
            style={{
              background: "rgba(100, 200, 100, 0.1)",
              border: "1px solid rgba(100, 200, 100, 0.2)",
            }}
          >
            <Shield size={18} style={{ color: "rgba(150, 240, 150, 0.9)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "rgba(180, 240, 180, 0.95)" }}>
                Secure Export
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(180, 240, 180, 0.7)" }}>
                Sensitive data is excluded
              </p>
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
            border: "1px solid rgba(200, 240, 200, 0.3)",
            color: "rgba(200, 240, 200, 0.95)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
          whileHover={!isExporting ? { scale: 1.02 } : {}}
          whileTap={!isExporting ? { scale: 0.98 } : {}}
        >
          {isExporting ? (
            <>
              <Clock size={18} className="animate-spin" />
              Preparing Export...
            </>
          ) : (
            <>
              <Download size={18} />
              Download My Data
            </>
          )}
        </motion.button>

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



