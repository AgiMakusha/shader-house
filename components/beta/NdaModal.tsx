"use client";

import { useState } from "react";
import { Shield, FileText, Lock, AlertTriangle, CheckCircle, X } from "lucide-react";

interface NdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => Promise<void>;
  gameTitle: string;
  developerName: string;
  isLoading?: boolean;
}

export default function NdaModal({
  isOpen,
  onClose,
  onAccept,
  gameTitle,
  developerName,
  isLoading = false,
}: NdaModalProps) {
  // Start with hasScrolled = true since the NDA is always visible
  // Users can read the full text without being forced to scroll
  const [hasScrolled, setHasScrolled] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Consider scrolled if within 50px of bottom
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setHasScrolled(true);
    }
  };

  const handleAccept = async () => {
    if (!isChecked || !hasScrolled) return;
    setIsSubmitting(true);
    try {
      await onAccept();
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAccept = hasScrolled && isChecked && !isSubmitting && !isLoading;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          background: "linear-gradient(145deg, rgba(20, 35, 40, 0.98) 0%, rgba(15, 30, 35, 0.98) 100%)",
          border: "1px solid rgba(100, 180, 200, 0.4)",
          borderRadius: "16px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(100, 180, 200, 0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px",
            borderBottom: "1px solid rgba(100, 180, 200, 0.2)",
            background: "linear-gradient(135deg, rgba(60, 100, 130, 0.2) 0%, rgba(40, 80, 100, 0.15) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(100, 180, 200, 0.3) 0%, rgba(60, 140, 170, 0.4) 100%)",
                border: "1px solid rgba(100, 180, 200, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={24} style={{ color: "rgba(150, 220, 255, 0.9)" }} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "rgba(180, 230, 255, 0.95)",
                  fontFamily: '"Press Start 2P", monospace',
                  marginBottom: "6px",
                }}
              >
                NDA Agreement
              </h2>
              <p
                style={{
                  fontSize: "9px",
                  color: "rgba(150, 200, 220, 0.7)",
                  fontFamily: '"Press Start 2P", monospace',
                }}
              >
                Required for Beta Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "rgba(255, 100, 100, 0.1)",
              border: "1px solid rgba(255, 100, 100, 0.3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 100, 100, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 100, 100, 0.1)";
            }}
          >
            <X size={18} style={{ color: "rgba(255, 150, 150, 0.8)" }} />
          </button>
        </div>

        {/* Game Info Banner */}
        <div
          style={{
            padding: "16px 28px",
            background: "rgba(30, 50, 60, 0.4)",
            borderBottom: "1px solid rgba(100, 180, 200, 0.15)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <FileText size={18} style={{ color: "rgba(150, 200, 220, 0.7)" }} />
          <div>
            <span
              style={{
                fontSize: "10px",
                color: "rgba(150, 200, 220, 0.6)",
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              Beta Access NDA for:{" "}
            </span>
            <span
              style={{
                fontSize: "10px",
                color: "rgba(180, 230, 255, 0.95)",
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              {gameTitle}
            </span>
            <span
              style={{
                fontSize: "9px",
                color: "rgba(150, 200, 220, 0.5)",
                fontFamily: '"Press Start 2P", monospace',
                marginLeft: "8px",
              }}
            >
              by {developerName}
            </span>
          </div>
        </div>

        {/* NDA Content - Scrollable */}
        <div
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflow: "auto",
            padding: "28px",
            minHeight: "300px",
            maxHeight: "400px",
          }}
        >
          <div
            style={{
              background: "rgba(10, 20, 25, 0.6)",
              border: "1px solid rgba(100, 180, 200, 0.2)",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "12px",
                color: "rgba(180, 230, 255, 0.95)",
                fontFamily: '"Press Start 2P", monospace',
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              NON-DISCLOSURE AGREEMENT
            </h3>

            <div
              style={{
                fontSize: "11px",
                color: "rgba(200, 240, 200, 0.8)",
                lineHeight: "1.8",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(180, 230, 255, 0.95)" }}>PARTIES:</strong><br />
                This Non-Disclosure Agreement ("Agreement") is entered into between{" "}
                <strong>{developerName}</strong> ("Developer") and you ("Beta Tester")
                regarding access to the pre-release beta version of{" "}
                <strong>"{gameTitle}"</strong> ("Game").
              </p>

              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(180, 230, 255, 0.95)" }}>1. CONFIDENTIAL INFORMATION</strong><br />
                "Confidential Information" includes, but is not limited to:
              </p>
              <ul style={{ marginLeft: "20px", marginBottom: "16px" }}>
                <li>All game content, features, mechanics, and gameplay elements</li>
                <li>Story, characters, dialogue, and narrative elements</li>
                <li>Visual assets, art style, graphics, and animations</li>
                <li>Audio, music, and sound effects</li>
                <li>Technical implementations and game architecture</li>
                <li>Bug reports, feedback, and testing discussions</li>
                <li>Release dates, pricing, and business information</li>
                <li>Any materials marked as confidential or proprietary</li>
              </ul>

              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(180, 230, 255, 0.95)" }}>2. OBLIGATIONS</strong><br />
                As a Beta Tester, you agree to:
              </p>
              <ul style={{ marginLeft: "20px", marginBottom: "16px" }}>
                <li>Keep all Confidential Information strictly confidential</li>
                <li>Not share, publish, stream, record, or distribute any game content</li>
                <li>Not discuss the game publicly on social media, forums, or other platforms</li>
                <li>Not take screenshots, videos, or recordings unless explicitly permitted</li>
                <li>Report bugs and provide feedback only through official channels</li>
                <li>Not reverse engineer, decompile, or extract game assets</li>
                <li>Delete all beta materials upon request or when access ends</li>
              </ul>

              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(180, 230, 255, 0.95)" }}>3. PERMITTED DISCLOSURES</strong><br />
                You may disclose Confidential Information only:
              </p>
              <ul style={{ marginLeft: "20px", marginBottom: "16px" }}>
                <li>To the Developer through official feedback channels</li>
                <li>If legally required by court order or government authority</li>
                <li>After the Developer publicly releases the information</li>
              </ul>

              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(180, 230, 255, 0.95)" }}>4. INTELLECTUAL PROPERTY</strong><br />
                All rights, title, and interest in the Game and Confidential Information remain
                exclusively with the Developer. This Agreement grants no license or rights to any
                intellectual property.
              </p>

              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(180, 230, 255, 0.95)" }}>5. TERM AND TERMINATION</strong><br />
                This Agreement remains in effect until the later of:
              </p>
              <ul style={{ marginLeft: "20px", marginBottom: "16px" }}>
                <li>Two (2) years from the date of acceptance</li>
                <li>One (1) year after the public release of the Game</li>
              </ul>

              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(180, 230, 255, 0.95)" }}>6. REMEDIES</strong><br />
                You acknowledge that breach of this Agreement may cause irreparable harm.
                The Developer may seek injunctive relief in addition to any other remedies
                available at law or equity.
              </p>

              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(180, 230, 255, 0.95)" }}>7. FEEDBACK AND SUGGESTIONS</strong><br />
                Any feedback, suggestions, or ideas you provide may be used by the Developer
                without obligation or compensation to you.
              </p>

              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(180, 230, 255, 0.95)" }}>8. NO WARRANTY</strong><br />
                The beta Game is provided "AS IS" without warranty of any kind. The Developer
                is not liable for any damages arising from your use of the beta.
              </p>

              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(180, 230, 255, 0.95)" }}>9. GOVERNING LAW</strong><br />
                This Agreement shall be governed by applicable law, with exclusive jurisdiction
                in the Developer's principal place of business.
              </p>

              <p style={{ marginBottom: "0" }}>
                <strong style={{ color: "rgba(180, 230, 255, 0.95)" }}>10. ENTIRE AGREEMENT</strong><br />
                This Agreement constitutes the entire understanding between the parties regarding
                confidentiality and supersedes all prior agreements on this subject.
              </p>
            </div>
          </div>

          {/* Scroll Indicator */}
          {!hasScrolled && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                background: "rgba(255, 200, 100, 0.1)",
                border: "1px solid rgba(255, 200, 100, 0.3)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertTriangle size={16} style={{ color: "rgba(255, 200, 100, 0.9)" }} />
              <span
                style={{
                  fontSize: "9px",
                  color: "rgba(255, 220, 150, 0.9)",
                  fontFamily: '"Press Start 2P", monospace',
                }}
              >
                Please scroll to read the entire agreement
              </span>
            </div>
          )}
        </div>

        {/* Footer with Checkbox and Accept Button */}
        <div
          style={{
            padding: "24px 28px",
            borderTop: "1px solid rgba(100, 180, 200, 0.2)",
            background: "linear-gradient(135deg, rgba(30, 50, 60, 0.4) 0%, rgba(25, 45, 55, 0.5) 100%)",
          }}
        >
          {/* Checkbox */}
          <label
            onClick={(e) => {
              if (hasScrolled) {
                e.preventDefault();
                setIsChecked(!isChecked);
              }
            }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              marginBottom: "20px",
              cursor: hasScrolled ? "pointer" : "not-allowed",
              opacity: hasScrolled ? 1 : 0.5,
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                flexShrink: 0,
                borderRadius: "6px",
                border: `2px solid ${isChecked ? "rgba(100, 200, 100, 0.6)" : "rgba(100, 180, 200, 0.4)"}`,
                background: isChecked
                  ? "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.4) 100%)"
                  : "rgba(20, 40, 50, 0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                marginTop: "2px",
              }}
            >
              {isChecked && (
                <CheckCircle size={16} style={{ color: "rgba(150, 255, 150, 0.95)" }} />
              )}
            </div>
            <span
              style={{
                fontSize: "10px",
                color: "rgba(200, 240, 200, 0.85)",
                fontFamily: '"Press Start 2P", monospace',
                lineHeight: "1.6",
              }}
            >
              I have read and agree to the terms of this Non-Disclosure Agreement.
              I understand that violation may result in legal action and removal from all beta programs.
            </span>
          </label>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "14px 20px",
                background: "rgba(100, 100, 100, 0.2)",
                border: "1px solid rgba(150, 150, 150, 0.3)",
                borderRadius: "8px",
                color: "rgba(200, 200, 200, 0.8)",
                fontSize: "10px",
                fontFamily: '"Press Start 2P", monospace',
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(100, 100, 100, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(100, 100, 100, 0.2)";
              }}
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={!canAccept}
              style={{
                flex: 2,
                padding: "14px 20px",
                background: canAccept
                  ? "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.5) 100%)"
                  : "rgba(60, 80, 70, 0.3)",
                border: canAccept
                  ? "1px solid rgba(150, 255, 150, 0.5)"
                  : "1px solid rgba(100, 120, 110, 0.3)",
                borderRadius: "8px",
                color: canAccept
                  ? "rgba(200, 255, 200, 0.95)"
                  : "rgba(150, 170, 160, 0.6)",
                fontSize: "10px",
                fontFamily: '"Press Start 2P", monospace',
                cursor: canAccept ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
              onMouseEnter={(e) => {
                if (canAccept) {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(100, 200, 100, 0.5) 0%, rgba(80, 180, 80, 0.6) 100%)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (canAccept) {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.5) 100%)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {isSubmitting || isLoading ? (
                "Processing..."
              ) : (
                <>
                  <Lock size={14} />
                  Accept NDA & Continue
                </>
              )}
            </button>
          </div>

          {/* Security Note */}
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Shield size={12} style={{ color: "rgba(100, 180, 200, 0.5)" }} />
            <span
              style={{
                fontSize: "8px",
                color: "rgba(150, 200, 220, 0.5)",
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              Your acceptance is securely logged with timestamp and IP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

