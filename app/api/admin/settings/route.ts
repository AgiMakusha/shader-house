// Admin API route for platform settings
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { SettingCategory, SettingType } from "@prisma/client";
import { clearSettingsCache } from "@/lib/settings";

// Default settings with their metadata
const DEFAULT_SETTINGS: {
  key: string;
  value: string;
  type: SettingType;
  category: SettingCategory;
  label: string;
  description: string;
  options?: string[];
}[] = [
  // General settings
  {
    key: "site_name",
    value: "Shader House",
    type: "STRING",
    category: "GENERAL",
    label: "Site Name",
    description: "The name of your platform",
  },
  {
    key: "tagline",
    value: "Indie Games Marketplace",
    type: "STRING",
    category: "GENERAL",
    label: "Tagline",
    description: "Short description of the platform",
  },
  {
    key: "maintenance_mode",
    value: "false",
    type: "BOOLEAN",
    category: "GENERAL",
    label: "Maintenance Mode",
    description: "Put the site in maintenance mode",
  },

  // Registration settings
  {
    key: "allow_registration",
    value: "true",
    type: "BOOLEAN",
    category: "REGISTRATION",
    label: "Allow Registration",
    description: "Allow new users to register",
  },
  {
    key: "require_email_verification",
    value: "true",
    type: "BOOLEAN",
    category: "REGISTRATION",
    label: "Require Email Verification",
    description: "Users must verify email before access",
  },
  {
    key: "allow_dev_registration",
    value: "true",
    type: "BOOLEAN",
    category: "REGISTRATION",
    label: "Developer Registration",
    description: "Allow developers to register",
  },

  // Moderation settings
  {
    key: "auto_approve_games",
    value: "false",
    type: "BOOLEAN",
    category: "MODERATION",
    label: "Auto-Approve Games",
    description: "Automatically approve new game submissions",
  },
  {
    key: "require_indie_verification",
    value: "true",
    type: "BOOLEAN",
    category: "MODERATION",
    label: "Require Indie Verification",
    description: "Developers must be verified as indie",
  },
  {
    key: "review_threshold",
    value: "5",
    type: "SELECT",
    category: "MODERATION",
    label: "Review Threshold",
    description: "Number of reports before auto-hide",
    options: ["3", "5", "10", "20"],
  },

  // Notification settings
  {
    key: "send_welcome_email",
    value: "true",
    type: "BOOLEAN",
    category: "NOTIFICATIONS",
    label: "Welcome Email",
    description: "Send welcome email to new users",
  },
  {
    key: "admin_notifications",
    value: "true",
    type: "BOOLEAN",
    category: "NOTIFICATIONS",
    label: "Admin Notifications",
    description: "Email admins about important events",
  },
  {
    key: "digest_frequency",
    value: "daily",
    type: "SELECT",
    category: "NOTIFICATIONS",
    label: "Digest Frequency",
    description: "How often to send activity digests",
    options: ["never", "daily", "weekly"],
  },

  // Payment settings
  {
    key: "game_sale_fee_percent",
    value: "15",
    type: "NUMBER",
    category: "PAYMENTS",
    label: "Game Sale Fee",
    description: "Platform fee percentage for game sales",
  },
  {
    key: "tip_fee_percent",
    value: "20",
    type: "NUMBER",
    category: "PAYMENTS",
    label: "Tip Fee",
    description: "Platform fee percentage for tips",
  },
  {
    key: "creator_support_fee_percent",
    value: "15",
    type: "NUMBER",
    category: "PAYMENTS",
    label: "Creator Support Fee",
    description: "Platform fee percentage for creator support",
  },
  {
    key: "publishing_fee_cents",
    value: "5000",
    type: "NUMBER",
    category: "PAYMENTS",
    label: "Publishing Fee",
    description: "One-time publishing fee in cents ($50.00)",
  },

  // Security settings
  {
    key: "session_timeout_hours",
    value: "24",
    type: "NUMBER",
    category: "SECURITY",
    label: "Session Timeout",
    description: "Hours until session expires",
  },
  {
    key: "max_login_attempts",
    value: "5",
    type: "NUMBER",
    category: "SECURITY",
    label: "Max Login Attempts",
    description: "Failed login attempts before lockout",
  },
  {
    key: "lockout_duration_minutes",
    value: "30",
    type: "NUMBER",
    category: "SECURITY",
    label: "Lockout Duration",
    description: "Minutes locked out after failed attempts",
  },
  {
    key: "require_2fa_admin",
    value: "false",
    type: "BOOLEAN",
    category: "SECURITY",
    label: "Require 2FA for Admins",
    description: "Require two-factor authentication for admin accounts",
  },
];

// Initialize default settings if they don't exist
async function ensureDefaultSettings() {
  const existingKeys = await prisma.platformSettings.findMany({
    select: { key: true },
  });
  const existingKeySet = new Set(existingKeys.map((s) => s.key));

  const missingSettings = DEFAULT_SETTINGS.filter(
    (s) => !existingKeySet.has(s.key)
  );

  if (missingSettings.length > 0) {
    await prisma.platformSettings.createMany({
      data: missingSettings.map((s) => ({
        key: s.key,
        value: s.value,
        type: s.type,
        category: s.category,
        label: s.label,
        description: s.description,
      })),
      skipDuplicates: true,
    });
  }
}

// GET - Fetch all settings
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Ensure default settings exist
    await ensureDefaultSettings();

    // Fetch all settings
    const settings = await prisma.platformSettings.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    // Group settings by category
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }

      // Find default setting to get options for SELECT type
      const defaultSetting = DEFAULT_SETTINGS.find(
        (d) => d.key === setting.key
      );

      acc[setting.category].push({
        ...setting,
        options: defaultSetting?.options || [],
        // Parse value based on type
        parsedValue: parseSettingValue(setting.value, setting.type),
      });
      return acc;
    }, {} as Record<string, typeof settings>);

    return NextResponse.json({
      settings: grouped,
      categories: Object.values(SettingCategory),
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body as { settings: { key: string; value: unknown }[] };

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: "Settings must be an array" },
        { status: 400 }
      );
    }

    // Update each setting
    const updatePromises = settings.map(async ({ key, value }) => {
      // Find the existing setting
      const existing = await prisma.platformSettings.findUnique({
        where: { key },
      });

      if (!existing) {
        // Check if it's a valid default setting
        const defaultSetting = DEFAULT_SETTINGS.find((d) => d.key === key);
        if (!defaultSetting) {
          throw new Error(`Unknown setting: ${key}`);
        }

        // Create new setting
        return prisma.platformSettings.create({
          data: {
            key,
            value: stringifySettingValue(value),
            type: defaultSetting.type,
            category: defaultSetting.category,
            label: defaultSetting.label,
            description: defaultSetting.description,
            updatedBy: session.user.id,
          },
        });
      }

      // Validate value based on type
      const stringValue = stringifySettingValue(value);

      return prisma.platformSettings.update({
        where: { key },
        data: {
          value: stringValue,
          updatedBy: session.user.id,
        },
      });
    });

    await Promise.all(updatePromises);

    // Clear the settings cache so new values take effect immediately
    clearSettingsCache();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper functions
function parseSettingValue(value: string, type: SettingType): unknown {
  switch (type) {
    case "BOOLEAN":
      return value === "true";
    case "NUMBER":
      return parseFloat(value);
    case "JSON":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

function stringifySettingValue(value: unknown): string {
  if (typeof value === "boolean") {
    return value.toString();
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

