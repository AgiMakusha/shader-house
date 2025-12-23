export type IconType = 'gamepad' | 'heart' | 'flask' | 'message' | 'crown';

/**
 * Badge ID to display name mapping
 * Badges are stored as IDs in the user.badges array
 * This maps those IDs to human-readable names and their corresponding icons
 */
export const BADGE_MAPPINGS: Record<string, { name: string; description?: string; rarity?: 'common' | 'rare' | 'epic' | 'legendary'; icon?: IconType }> = {
  // Achievement-based badges (from achievements system)
  // Handle different formats
  'first-steps': {
    name: 'First Steps',
    description: 'Discover your first game',
    rarity: 'common',
    icon: 'gamepad',
  },
  'first step': {
    name: 'First Steps',
    description: 'Discover your first game',
    rarity: 'common',
    icon: 'gamepad',
  },
  'FIRST STEP': {
    name: 'First Steps',
    description: 'Discover your first game',
    rarity: 'common',
    icon: 'gamepad',
  },
  'FIRST_STEP': {
    name: 'First Steps',
    description: 'Discover your first game',
    rarity: 'common',
    icon: 'gamepad',
  },
  'collector': {
    name: 'Collector',
    description: 'Add your first game to favorites',
    rarity: 'common',
    icon: 'heart',
  },
  'game-tester': {
    name: 'Game Tester',
    description: 'Test 5 beta games',
    rarity: 'rare',
    icon: 'flask',
  },
  'community-leader': {
    name: 'Community Leader',
    description: 'Write 10 helpful reviews',
    rarity: 'epic',
    icon: 'message',
  },
  'legend': {
    name: 'Legend',
    description: 'Unlock all other achievements',
    rarity: 'legendary',
    icon: 'crown',
  },
  // Beta testing badges
  'beta-veteran': {
    name: 'Beta Veteran',
    description: 'Participated in 10+ beta tests',
    rarity: 'rare',
  },
  'bug-hunter': {
    name: 'Bug Hunter',
    description: 'Reported 50+ bugs',
    rarity: 'epic',
  },
  // Community badges
  'helpful-reviewer': {
    name: 'Helpful Reviewer',
    description: 'Received 20+ helpful marks on reviews',
    rarity: 'rare',
  },
  'active-member': {
    name: 'Active Member',
    description: 'Posted 100+ discussion posts',
    rarity: 'common',
  },
  // Developer badges
  'verified-indie': {
    name: 'Verified Indie',
    description: 'Indie developer verified by Shader House',
    rarity: 'epic',
  },
  'game-creator': {
    name: 'Game Creator',
    description: 'Published your first game',
    rarity: 'rare',
  },
};

/**
 * Normalize badge ID for lookup (case-insensitive, handles spaces/hyphens/underscores)
 */
function normalizeBadgeId(badgeId: string): string {
  return badgeId.toLowerCase().trim();
}

/**
 * Get badge display name from badge ID
 * Falls back to formatted ID if no mapping exists
 */
export function getBadgeName(badgeId: string): string {
  // Try exact match first
  if (BADGE_MAPPINGS[badgeId]) {
    return BADGE_MAPPINGS[badgeId].name;
  }
  
  // Try normalized match (case-insensitive)
  const normalized = normalizeBadgeId(badgeId);
  if (BADGE_MAPPINGS[normalized]) {
    return BADGE_MAPPINGS[normalized].name;
  }
  
  // Try with different separators
  const variations = [
    badgeId,
    badgeId.toLowerCase(),
    badgeId.toUpperCase(),
    badgeId.replace(/\s+/g, '-'),
    badgeId.replace(/\s+/g, '_'),
    badgeId.replace(/[-_]/g, ' '),
    badgeId.replace(/[-_]/g, '-'),
  ];
  
  for (const variation of variations) {
    if (BADGE_MAPPINGS[variation]) {
      return BADGE_MAPPINGS[variation].name;
    }
  }
  
  // Fallback: format the ID nicely
  return badgeId
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get badge description from badge ID
 */
export function getBadgeDescription(badgeId: string): string | undefined {
  // Try exact match first
  if (BADGE_MAPPINGS[badgeId]) {
    return BADGE_MAPPINGS[badgeId].description;
  }
  
  // Try normalized match
  const normalized = normalizeBadgeId(badgeId);
  if (BADGE_MAPPINGS[normalized]) {
    return BADGE_MAPPINGS[normalized].description;
  }
  
  // Try variations
  const variations = [
    badgeId.toLowerCase(),
    badgeId.toUpperCase(),
    badgeId.replace(/\s+/g, '-'),
    badgeId.replace(/\s+/g, '_'),
    badgeId.replace(/[-_]/g, ' '),
  ];
  
  for (const variation of variations) {
    if (BADGE_MAPPINGS[variation]) {
      return BADGE_MAPPINGS[variation].description;
    }
  }
  
  return undefined;
}

/**
 * Get badge rarity from badge ID
 */
export function getBadgeRarity(badgeId: string): 'common' | 'rare' | 'epic' | 'legendary' | undefined {
  // Try exact match first
  if (BADGE_MAPPINGS[badgeId]) {
    return BADGE_MAPPINGS[badgeId].rarity;
  }
  
  // Try normalized match
  const normalized = normalizeBadgeId(badgeId);
  if (BADGE_MAPPINGS[normalized]) {
    return BADGE_MAPPINGS[normalized].rarity;
  }
  
  // Try variations
  const variations = [
    badgeId.toLowerCase(),
    badgeId.toUpperCase(),
    badgeId.replace(/\s+/g, '-'),
    badgeId.replace(/\s+/g, '_'),
    badgeId.replace(/[-_]/g, ' '),
  ];
  
  for (const variation of variations) {
    if (BADGE_MAPPINGS[variation]) {
      return BADGE_MAPPINGS[variation].rarity;
    }
  }
  
  return undefined;
}

/**
 * Get badge icon type from badge ID
 */
export function getBadgeIcon(badgeId: string): IconType | undefined {
  // Try exact match first
  if (BADGE_MAPPINGS[badgeId]?.icon) {
    return BADGE_MAPPINGS[badgeId].icon;
  }
  
  // Try normalized match
  const normalized = normalizeBadgeId(badgeId);
  if (BADGE_MAPPINGS[normalized]?.icon) {
    return BADGE_MAPPINGS[normalized].icon;
  }
  
  // Try variations
  const variations = [
    badgeId.toLowerCase(),
    badgeId.toUpperCase(),
    badgeId.replace(/\s+/g, '-'),
    badgeId.replace(/\s+/g, '_'),
    badgeId.replace(/[-_]/g, ' '),
  ];
  
  for (const variation of variations) {
    if (BADGE_MAPPINGS[variation]?.icon) {
      return BADGE_MAPPINGS[variation].icon;
    }
  }
  
  return undefined;
}

/**
 * Get color styling for badge based on rarity
 * Matches the colors used in achievements page
 */
export function getBadgeColor(rarity?: 'common' | 'rare' | 'epic' | 'legendary', badgeId?: string) {
  // Special case: Collector badge uses Bugs Found colors
  if (badgeId && normalizeBadgeId(badgeId) === 'collector') {
    return {
      bg: 'rgba(250, 150, 150, 0.1)',
      border: 'rgba(250, 150, 150, 0.3)',
      text: 'rgba(250, 150, 150, 0.95)',
    };
  }
  
  switch (rarity) {
    case 'common':
      return {
        bg: 'rgba(150, 150, 150, 0.2)',
        border: 'rgba(200, 200, 200, 0.3)',
        text: 'rgba(220, 220, 220, 0.9)',
      };
    case 'rare':
      return {
        bg: 'rgba(80, 120, 200, 0.2)',
        border: 'rgba(100, 150, 255, 0.3)',
        text: 'rgba(150, 200, 255, 0.9)',
      };
    case 'epic':
      return {
        bg: 'rgba(140, 80, 180, 0.2)',
        border: 'rgba(180, 100, 255, 0.3)',
        text: 'rgba(200, 150, 255, 0.9)',
      };
    case 'legendary':
      return {
        bg: 'rgba(220, 150, 50, 0.2)',
        border: 'rgba(255, 200, 100, 0.3)',
        text: 'rgba(255, 220, 150, 0.9)',
      };
    default:
      return {
        bg: 'rgba(150, 150, 150, 0.2)',
        border: 'rgba(200, 200, 200, 0.3)',
        text: 'rgba(220, 220, 220, 0.9)',
      };
  }
}
