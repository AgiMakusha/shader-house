// Platform settings utility functions
import { prisma } from "@/lib/db/prisma";
import { SettingType } from "@prisma/client";

// Type-safe setting keys
export type SettingKey =
  // General
  | "site_name"
  | "tagline"
  | "maintenance_mode"
  // Registration
  | "allow_registration"
  | "require_email_verification"
  | "allow_dev_registration"
  // Moderation
  | "auto_approve_games"
  | "require_indie_verification"
  | "review_threshold"
  // Notifications
  | "send_welcome_email"
  | "admin_notifications"
  | "digest_frequency"
  // Payments
  | "game_sale_fee_percent"
  | "tip_fee_percent"
  | "creator_support_fee_percent"
  | "publishing_fee_cents"
  // Security
  | "session_timeout_hours"
  | "max_login_attempts"
  | "lockout_duration_minutes"
  | "require_2fa_admin";

// Default values for settings
const DEFAULTS: Record<SettingKey, string> = {
  // General
  site_name: "Shader House",
  tagline: "Indie Games Marketplace",
  maintenance_mode: "false",
  // Registration
  allow_registration: "true",
  require_email_verification: "true",
  allow_dev_registration: "true",
  // Moderation
  auto_approve_games: "false",
  require_indie_verification: "true",
  review_threshold: "5",
  // Notifications
  send_welcome_email: "true",
  admin_notifications: "true",
  digest_frequency: "daily",
  // Payments
  game_sale_fee_percent: "15",
  tip_fee_percent: "15",
  creator_support_fee_percent: "15",
  publishing_fee_cents: "5000",
  // Security
  session_timeout_hours: "24",
  max_login_attempts: "5",
  lockout_duration_minutes: "30",
  require_2fa_admin: "false",
};

// Cache for settings to avoid repeated database queries
let settingsCache: Map<string, { value: string; type: SettingType; expiresAt: number }> | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute cache

// Get a single setting value
export async function getSetting(key: SettingKey): Promise<string> {
  try {
    // Check cache first
    if (settingsCache) {
      const cached = settingsCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }
    }

    const setting = await prisma.platformSettings.findUnique({
      where: { key },
      select: { value: true, type: true },
    });

    if (setting) {
      // Update cache
      if (!settingsCache) {
        settingsCache = new Map();
      }
      settingsCache.set(key, {
        value: setting.value,
        type: setting.type,
        expiresAt: Date.now() + CACHE_TTL,
      });
      return setting.value;
    }

    // Return default if not found in database
    return DEFAULTS[key] || "";
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return DEFAULTS[key] || "";
  }
}

// Get a boolean setting
export async function getBooleanSetting(key: SettingKey): Promise<boolean> {
  const value = await getSetting(key);
  return value === "true";
}

// Get a number setting
export async function getNumberSetting(key: SettingKey): Promise<number> {
  const value = await getSetting(key);
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

// Get multiple settings at once
export async function getSettings(keys: SettingKey[]): Promise<Record<SettingKey, string>> {
  try {
    const settings = await prisma.platformSettings.findMany({
      where: { key: { in: keys } },
      select: { key: true, value: true, type: true },
    });

    const result: Record<string, string> = {};
    
    // Start with defaults
    for (const key of keys) {
      result[key] = DEFAULTS[key] || "";
    }
    
    // Override with database values
    for (const setting of settings) {
      result[setting.key] = setting.value;
      
      // Update cache
      if (!settingsCache) {
        settingsCache = new Map();
      }
      settingsCache.set(setting.key, {
        value: setting.value,
        type: setting.type,
        expiresAt: Date.now() + CACHE_TTL,
      });
    }

    return result as Record<SettingKey, string>;
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return defaults on error
    const result: Record<string, string> = {};
    for (const key of keys) {
      result[key] = DEFAULTS[key] || "";
    }
    return result as Record<SettingKey, string>;
  }
}

// Clear the settings cache (call after updates)
export function clearSettingsCache(): void {
  settingsCache = null;
}

// Check if site is in maintenance mode
export async function isMaintenanceMode(): Promise<boolean> {
  return getBooleanSetting("maintenance_mode");
}

// Check if registration is allowed
export async function isRegistrationAllowed(): Promise<boolean> {
  return getBooleanSetting("allow_registration");
}

// Check if developer registration is allowed
export async function isDeveloperRegistrationAllowed(): Promise<boolean> {
  const regAllowed = await getBooleanSetting("allow_registration");
  const devRegAllowed = await getBooleanSetting("allow_dev_registration");
  return regAllowed && devRegAllowed;
}

// Check if email verification is required
export async function isEmailVerificationRequired(): Promise<boolean> {
  return getBooleanSetting("require_email_verification");
}

// Get the report threshold
export async function getReportThreshold(): Promise<number> {
  return getNumberSetting("review_threshold");
}

// Get payment fees
export async function getPaymentFees(): Promise<{
  gameSaleFee: number;
  tipFee: number;
  creatorSupportFee: number;
  publishingFee: number;
}> {
  const settings = await getSettings([
    "game_sale_fee_percent",
    "tip_fee_percent",
    "creator_support_fee_percent",
    "publishing_fee_cents",
  ]);

  return {
    gameSaleFee: parseFloat(settings.game_sale_fee_percent) || 15,
    tipFee: parseFloat(settings.tip_fee_percent) || 15,
    creatorSupportFee: parseFloat(settings.creator_support_fee_percent) || 15,
    publishingFee: parseFloat(settings.publishing_fee_cents) || 5000,
  };
}

// Get security settings
export async function getSecuritySettings(): Promise<{
  sessionTimeoutHours: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  require2faAdmin: boolean;
}> {
  const settings = await getSettings([
    "session_timeout_hours",
    "max_login_attempts",
    "lockout_duration_minutes",
    "require_2fa_admin",
  ]);

  return {
    sessionTimeoutHours: parseFloat(settings.session_timeout_hours) || 24,
    maxLoginAttempts: parseFloat(settings.max_login_attempts) || 5,
    lockoutDurationMinutes: parseFloat(settings.lockout_duration_minutes) || 30,
    require2faAdmin: settings.require_2fa_admin === "true",
  };
}



