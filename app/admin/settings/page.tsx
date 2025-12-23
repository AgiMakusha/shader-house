"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import {
  ArrowLeft,
  Settings,
  Bell,
  Shield,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  DollarSign,
  ExternalLink,
  Clock,
  Lock,
  Users,
  Loader2,
  RotateCcw,
} from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: string;
  type: "STRING" | "NUMBER" | "BOOLEAN" | "JSON" | "SELECT";
  category: string;
  label: string | null;
  description: string | null;
  options: string[];
  parsedValue: unknown;
}

interface SettingsData {
  GENERAL?: Setting[];
  REGISTRATION?: Setting[];
  MODERATION?: Setting[];
  NOTIFICATIONS?: Setting[];
  PAYMENTS?: Setting[];
  SECURITY?: Setting[];
}

interface StripeStatus {
  configured: boolean;
  connectConfigured: boolean;
  mode: string;
  webhookConfigured: boolean;
}

interface FeeConfig {
  gameSaleFee: number;
  tipFee: number;
  creatorSupportFee: number;
  publishingFee: number;
}

const SECTION_CONFIG = [
  {
    id: "GENERAL",
    title: "General",
    description: "Basic platform settings",
    icon: Globe,
  },
  {
    id: "REGISTRATION",
    title: "Registration",
    description: "User registration settings",
    icon: Users,
  },
  {
    id: "MODERATION",
    title: "Moderation",
    description: "Content moderation settings",
    icon: AlertTriangle,
  },
  {
    id: "NOTIFICATIONS",
    title: "Notifications",
    description: "Email & notification settings",
    icon: Bell,
  },
  {
    id: "PAYMENTS",
    title: "Payments",
    description: "Stripe & payment settings",
    icon: CreditCard,
  },
  {
    id: "SECURITY",
    title: "Security",
    description: "Security & access settings",
    icon: Lock,
  },
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState("GENERAL");
  const [settings, setSettings] = useState<SettingsData>({});
  const [originalSettings, setOriginalSettings] = useState<SettingsData>({});
  const [modifiedKeys, setModifiedKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [feeConfig, setFeeConfig] = useState<FeeConfig | null>(null);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setOriginalSettings(JSON.parse(JSON.stringify(data.settings)));
        setModifiedKeys(new Set());
      } else {
        const error = await res.json();
        console.error("Failed to fetch settings:", error);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Stripe status
  const fetchStripeStatus = useCallback(async () => {
      try {
        const res = await fetch("/api/admin/revenue");
        if (res.ok) {
          const data = await res.json();
          setStripeStatus(data.stripeStatus);
          setFeeConfig(data.feeConfig);
        }
      } catch (error) {
        console.error("Error fetching Stripe status:", error);
      }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchStripeStatus();
  }, [fetchSettings, fetchStripeStatus]);

  // Update a setting value
  const updateSetting = (key: string, value: unknown) => {
    setSettings((prev) => {
      const newSettings = { ...prev };
      for (const category of Object.keys(newSettings) as (keyof SettingsData)[]) {
        const categorySettings = newSettings[category];
        if (categorySettings) {
          const settingIndex = categorySettings.findIndex((s) => s.key === key);
          if (settingIndex !== -1) {
            const setting = categorySettings[settingIndex];
            newSettings[category] = [
              ...categorySettings.slice(0, settingIndex),
              {
                ...setting,
                parsedValue: value,
                value: stringifyValue(value),
              },
              ...categorySettings.slice(settingIndex + 1),
            ];
            break;
          }
        }
      }
      return newSettings;
    });

    // Track modified keys
    setModifiedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.add(key);
      return newSet;
    });
  };

  // Convert value to string for storage
  const stringifyValue = (value: unknown): string => {
    if (typeof value === "boolean") return value.toString();
    if (typeof value === "number") return value.toString();
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  // Save settings to database
  const handleSave = async () => {
    if (modifiedKeys.size === 0) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Collect all modified settings
      const modifiedSettings: { key: string; value: unknown }[] = [];

      for (const category of Object.keys(settings) as (keyof SettingsData)[]) {
        const categorySettings = settings[category];
        if (categorySettings) {
          for (const setting of categorySettings) {
            if (modifiedKeys.has(setting.key)) {
              modifiedSettings.push({
                key: setting.key,
                value: setting.parsedValue,
              });
            }
          }
        }
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: modifiedSettings }),
      });

      if (res.ok) {
    setSaveSuccess(true);
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
        setModifiedKeys(new Set());
    setTimeout(() => setSaveSuccess(false), 3000);

        // Refresh Stripe status if payment settings changed
        if (
          modifiedSettings.some((s) =>
            ["game_sale_fee_percent", "tip_fee_percent", "creator_support_fee_percent", "publishing_fee_cents"].includes(s.key)
          )
        ) {
          fetchStripeStatus();
        }
      } else {
        const error = await res.json();
        setSaveError(error.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveError("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original values
  const handleReset = () => {
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
    setModifiedKeys(new Set());
    setSaveError(null);
  };

  // Get current section settings
  const getCurrentSectionSettings = (): Setting[] => {
    return settings[activeSection as keyof SettingsData] || [];
  };

  // Render setting input based on type
  const renderSettingInput = (setting: Setting) => {
    const isModified = modifiedKeys.has(setting.key);

    if (setting.type === "BOOLEAN") {
      const value = setting.parsedValue as boolean;
      return (
        <button
          onClick={() => updateSetting(setting.key, !value)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            value ? "bg-green-500/50" : "bg-gray-600/50"
          } ${isModified ? "ring-2 ring-yellow-400/50" : ""}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              value ? "left-7" : "left-1"
            }`}
          />
        </button>
      );
    }

    if (setting.type === "SELECT" && setting.options.length > 0) {
      return (
        <select
          className={`px-3 py-2 rounded-lg text-sm ${isModified ? "ring-2 ring-yellow-400/50" : ""}`}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "rgba(200, 240, 200, 0.95)",
          }}
          value={String(setting.parsedValue)}
          onChange={(e) => updateSetting(setting.key, e.target.value)}
        >
          {setting.options.map((opt) => (
            <option key={opt} value={opt} style={{ background: "#1a2a20" }}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (setting.type === "NUMBER") {
      return (
        <input
          type="number"
          value={String(setting.parsedValue)}
          onChange={(e) => updateSetting(setting.key, parseFloat(e.target.value) || 0)}
          className={`px-3 py-2 rounded-lg text-sm w-32 ${isModified ? "ring-2 ring-yellow-400/50" : ""}`}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "rgba(200, 240, 200, 0.95)",
          }}
        />
      );
    }

    // Default: text input
    return (
      <input
        type="text"
        value={String(setting.parsedValue)}
        onChange={(e) => updateSetting(setting.key, e.target.value)}
        className={`px-3 py-2 rounded-lg text-sm w-48 ${isModified ? "ring-2 ring-yellow-400/50" : ""}`}
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "rgba(200, 240, 200, 0.95)",
        }}
      />
    );
  };

  const currentSectionConfig = SECTION_CONFIG.find((s) => s.id === activeSection) || SECTION_CONFIG[0];

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
              <div className="p-3 rounded-xl bg-gradient-to-br from-gray-500/20 to-slate-600/20 border border-gray-400/30">
                <Settings className="w-8 h-8 text-gray-400" style={{ filter: "drop-shadow(0 0 8px rgba(156, 163, 175, 0.5))" }} />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold tracking-wider uppercase pixelized"
                  style={{
                    textShadow: `0 0 12px rgba(156, 163, 175, 0.8), 2px 2px 0px rgba(0, 0, 0, 0.9)`,
                    color: "rgba(229, 231, 235, 0.95)",
                  }}
                >
                  Platform Settings
                </h1>
                <p className="text-sm font-semibold pixelized" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  Configure platform behavior
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {modifiedKeys.size > 0 && (
              <motion.button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "rgba(200, 240, 200, 0.7)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </motion.button>
            )}

          <motion.button
            onClick={handleSave}
              disabled={isSaving || modifiedKeys.size === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider disabled:opacity-50"
            style={{
              background: saveSuccess 
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.2) 100%)"
                  : modifiedKeys.size > 0
                  ? "linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)"
                : "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                border: saveSuccess
                  ? "1px solid rgba(34, 197, 94, 0.5)"
                  : modifiedKeys.size > 0
                  ? "1px solid rgba(251, 191, 36, 0.5)"
                  : "1px solid rgba(200, 240, 200, 0.3)",
                color: saveSuccess
                  ? "rgba(187, 247, 208, 0.95)"
                  : modifiedKeys.size > 0
                  ? "rgba(253, 230, 138, 0.95)"
                  : "rgba(200, 240, 200, 0.95)",
              }}
              whileHover={{ scale: modifiedKeys.size === 0 ? 1 : 1.02 }}
              whileTap={{ scale: modifiedKeys.size === 0 ? 1 : 0.98 }}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
                  {modifiedKeys.size > 0 && (
                    <span
                      className="ml-1 px-2 py-0.5 rounded-full text-xs"
                      style={{ background: "rgba(251, 191, 36, 0.3)" }}
                    >
                      {modifiedKeys.size}
                    </span>
                  )}
              </>
            )}
          </motion.button>
          </div>
        </motion.div>

        {/* Error message */}
        {saveError && (
          <motion.div
            className="w-full max-w-6xl mb-4 p-4 rounded-lg flex items-center gap-3"
            style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span style={{ color: "rgba(252, 165, 165, 0.95)" }}>{saveError}</span>
          </motion.div>
        )}

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GameCard>
              <GameCardContent className="p-2">
                <nav className="space-y-1">
                  {SECTION_CONFIG.map((section) => {
                    const Icon = section.icon;
                    const hasModified = settings[section.id as keyof SettingsData]?.some((s) =>
                      modifiedKeys.has(s.key)
                    );
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left relative ${
                          activeSection === section.id ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{
                            color: activeSection === section.id ? "rgba(200, 240, 200, 0.9)" : "rgba(200, 240, 200, 0.5)",
                          }}
                        />
                        <div className="flex-1">
                          <div
                            style={{
                              color: activeSection === section.id ? "rgba(200, 240, 200, 0.95)" : "rgba(200, 240, 200, 0.7)",
                            }}
                          >
                            {section.title}
                          </div>
                          <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.4)" }}>
                            {section.description}
                          </div>
                        </div>
                        {hasModified && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: "rgba(251, 191, 36, 0.9)" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </GameCardContent>
            </GameCard>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GameCard>
              <GameCardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  {(() => {
                    const Icon = currentSectionConfig.icon;
                    return <Icon className="w-6 h-6" style={{ color: "rgba(200, 240, 200, 0.9)" }} />;
                  })()}
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                      {currentSectionConfig.title}
                    </h2>
                    <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      {currentSectionConfig.description}
                    </p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgba(200, 240, 200, 0.5)" }} />
                  </div>
                ) : activeSection === "PAYMENTS" ? (
                  /* Payment Settings - Custom Rendering */
                  <div className="space-y-6">
                    {/* Stripe Connection Status */}
                    <div>
                      <h3
                        className="text-sm font-semibold uppercase tracking-wider mb-3"
                        style={{ color: "rgba(200, 240, 200, 0.7)" }}
                      >
                        Stripe Connection
                      </h3>
                      <div className="space-y-3">
                        <div
                          className="flex items-center justify-between p-4 rounded-lg"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.7)" }} />
                            <div>
                              <div className="font-medium" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                                Stripe API
                              </div>
                              <div className="text-sm" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                Payment processing connection
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {stripeStatus?.configured ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span style={{ color: "rgba(167, 243, 208, 0.9)" }}>Connected</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <span style={{ color: "rgba(253, 230, 138, 0.9)" }}>Demo Mode</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div
                          className="flex items-center justify-between p-4 rounded-lg"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.7)" }} />
                            <div>
                              <div className="font-medium" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                                Stripe Connect
                              </div>
                              <div className="text-sm" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                Developer payout system
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {stripeStatus?.connectConfigured ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span style={{ color: "rgba(167, 243, 208, 0.9)" }}>Enabled</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span style={{ color: "rgba(200, 240, 200, 0.5)" }}>Not Configured</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div
                          className="flex items-center justify-between p-4 rounded-lg"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.7)" }} />
                            <div>
                              <div className="font-medium" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                                Webhooks
                              </div>
                              <div className="text-sm" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                Real-time payment events
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {stripeStatus?.webhookConfigured ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span style={{ color: "rgba(167, 243, 208, 0.9)" }}>Active</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span style={{ color: "rgba(200, 240, 200, 0.5)" }}>Not Set</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div
                          className="flex items-center justify-between p-4 rounded-lg"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.7)" }} />
                            <div>
                              <div className="font-medium" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                                Mode
                              </div>
                              <div className="text-sm" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                Current Stripe environment
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {stripeStatus?.mode === "live" ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span style={{ color: "rgba(167, 243, 208, 0.9)" }}>Live</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <span style={{ color: "rgba(253, 230, 138, 0.9)" }}>Test</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Editable Platform Fees */}
                    <div>
                      <h3
                        className="text-sm font-semibold uppercase tracking-wider mb-3"
                        style={{ color: "rgba(200, 240, 200, 0.7)" }}
                      >
                        Platform Fees (Editable)
                      </h3>
                      <div className="space-y-4">
                        {getCurrentSectionSettings().map((setting) => {
                          const isModified = modifiedKeys.has(setting.key);
                          const displayValue = setting.key === "publishing_fee_cents" 
                            ? `$${(Number(setting.parsedValue) / 100).toFixed(2)}`
                            : `${setting.parsedValue}%`;
                          const colorMap: Record<string, string> = {
                            game_sale_fee_percent: "rgba(253, 230, 138, 0.95)",
                            tip_fee_percent: "rgba(251, 207, 232, 0.95)",
                            creator_support_fee_percent: "rgba(196, 181, 253, 0.95)",
                            publishing_fee_cents: "rgba(165, 243, 252, 0.95)",
                          };

                          return (
                            <div
                              key={setting.key}
                              className={`p-4 rounded-lg ${isModified ? "ring-2 ring-yellow-400/50" : ""}`}
                              style={{ background: "rgba(255, 255, 255, 0.05)" }}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div>
                                  <span style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                                    {setting.label}
                                  </span>
                                  <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                    {setting.description}
                                  </p>
                                </div>
                                <span
                                  className="font-bold text-lg"
                                  style={{ color: colorMap[setting.key] || "rgba(200, 240, 200, 0.95)" }}
                                >
                                  {displayValue}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-3">
                                <input
                                  type="number"
                                  value={String(setting.parsedValue)}
                                  onChange={(e) => updateSetting(setting.key, parseFloat(e.target.value) || 0)}
                                  className="px-3 py-2 rounded-lg text-sm w-32"
                                  style={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    color: "rgba(200, 240, 200, 0.95)",
                                  }}
                                  min={0}
                                  step={setting.key === "publishing_fee_cents" ? 100 : 1}
                                />
                                <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                  {setting.key === "publishing_fee_cents" ? "cents" : "percent"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Current Fee Display (from config) */}
                    {feeConfig && (
                      <div>
                        <h3
                          className="text-sm font-semibold uppercase tracking-wider mb-3"
                          style={{ color: "rgba(200, 240, 200, 0.7)" }}
                        >
                          Current Active Fees (from config)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                          <div className="flex justify-between items-center mb-1">
                            <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>Game Sales</span>
                            <span className="font-bold text-lg" style={{ color: "rgba(253, 230, 138, 0.95)" }}>
                                {feeConfig.gameSaleFee}%
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              Developer keeps {100 - feeConfig.gameSaleFee}%
                          </p>
                        </div>

                        <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                          <div className="flex justify-between items-center mb-1">
                            <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>Tips</span>
                            <span className="font-bold text-lg" style={{ color: "rgba(251, 207, 232, 0.95)" }}>
                                {feeConfig.tipFee}%
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              Developer keeps {100 - feeConfig.tipFee}%
                          </p>
                        </div>

                        <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                          <div className="flex justify-between items-center mb-1">
                            <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>Creator Support</span>
                            <span className="font-bold text-lg" style={{ color: "rgba(196, 181, 253, 0.95)" }}>
                                {feeConfig.creatorSupportFee}%
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                            Split among supported devs
                          </p>
                        </div>

                        <div className="p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                          <div className="flex justify-between items-center mb-1">
                            <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>Publishing Fee</span>
                            <span className="font-bold text-lg" style={{ color: "rgba(165, 243, 252, 0.95)" }}>
                                ${(feeConfig.publishingFee / 100).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                            One-time per game
                          </p>
                        </div>
                      </div>
                        <p className="text-xs mt-3" style={{ color: "rgba(200, 240, 200, 0.4)" }}>
                          Note: These are the fees currently used by the system from the config file. 
                          Database settings above will be used when the payment system is connected to settings.
                        </p>
                    </div>
                    )}

                    {/* Stripe Dashboard Link */}
                    {stripeStatus?.configured && (
                      <a
                        href="https://dashboard.stripe.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all hover:bg-white/10"
                        style={{
                          background: "rgba(99, 102, 241, 0.2)",
                          border: "1px solid rgba(129, 140, 248, 0.3)",
                          color: "rgba(199, 210, 254, 0.95)",
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Stripe Dashboard
                      </a>
                    )}

                    {/* Setup Instructions for Demo Mode */}
                    {!stripeStatus?.configured && (
                      <div
                        className="p-4 rounded-lg"
                        style={{ background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.2)" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                          <span className="font-semibold" style={{ color: "rgba(253, 230, 138, 0.9)" }}>
                            Setup Required
                          </span>
                        </div>
                        <p className="text-sm mb-3" style={{ color: "rgba(253, 230, 138, 0.7)" }}>
                          Configure Stripe to process real payments:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-sm" style={{ color: "rgba(253, 230, 138, 0.7)" }}>
                          <li>
                            Create account at{" "}
                            <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="underline">
                              stripe.com
                            </a>
                          </li>
                          <li>
                            Add <code className="bg-black/30 px-1 rounded">STRIPE_SECRET_KEY</code> to .env
                          </li>
                          <li>
                            Add <code className="bg-black/30 px-1 rounded">STRIPE_CONNECT_CLIENT_ID</code>
                          </li>
                          <li>
                            Configure <code className="bg-black/30 px-1 rounded">STRIPE_WEBHOOK_SECRET</code>
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Regular Settings Sections */
                  <div className="space-y-4">
                    {getCurrentSectionSettings().map((setting) => (
                      <div
                        key={setting.key}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          modifiedKeys.has(setting.key) ? "ring-2 ring-yellow-400/30" : ""
                        }`}
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <div className="flex-1">
                            <div className="font-medium" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                            {setting.label || setting.key}
                            </div>
                            <div className="text-sm" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              {setting.description}
                            </div>
                          </div>
                        <div className="ml-4">{renderSettingInput(setting)}</div>
                        </div>
                      ))}

                    {getCurrentSectionSettings().length === 0 && (
                      <div className="text-center py-8" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                        No settings available for this category.
                      </div>
                    )}
                    </div>
                )}
              </GameCardContent>
            </GameCard>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
