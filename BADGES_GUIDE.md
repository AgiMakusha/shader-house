# 🏆 Badges System Guide

## Overview

Badges are achievement identifiers stored in the user's `badges` array. They appear in the profile card preview and community chat cards to showcase user accomplishments.

## How Badges Look

Badges appear as small, styled pill-shaped badges with:
- **Pixel-style font** (Press Start 2P)
- **Rarity-based colors**:
  - **Common** (gray): Basic achievements
  - **Rare** (blue): Moderate accomplishments
  - **Epic** (purple): Significant achievements
  - **Legendary** (gold): Exceptional achievements
- **Compact size**: Small, readable text that fits in profile cards

### Visual Example

```
┌─────────────────────────────────┐
│ Display Name          Lv.5       │
│ Gamer                           │
│                                 │
│ Contact Email                   │
│ user@example.com                │
│                                 │
│ Bio                             │
│ Gaming enthusiast...            │
│                                 │
│ 🏆 Badges                        │
│ [FIRST STEPS] [COLLECTOR]       │
│ [GAME TESTER]                   │
└─────────────────────────────────┘
```

## When Badges Appear

Badges appear in the profile card preview when:
1. ✅ The user has at least one badge in their `badges` array
2. ✅ The badge section is displayed below Bio/Contact Email (if present)
3. ✅ Badges are shown in a flex-wrap layout, so they wrap to multiple lines if needed

### Display Logic

```typescript
// Badges section appears when:
badges && badges.length > 0

// Location in card:
- After Display Name, Level, Role
- After Contact Email (if present)
- After Bio (if present)
- Before empty state message (if no other content)
```

## Badge Storage

- **Database**: Stored as `String[]` in `User.badges` field
- **Format**: Badge IDs (e.g., `"first-steps"`, `"game-tester"`)
- **Mapping**: Badge IDs are mapped to display names via `lib/badges/mappings.ts`

## Available Badges

### Achievement Badges
- `first-steps` → "First Steps" (Common)
- `collector` → "Collector" (Common)
- `game-tester` → "Game Tester" (Rare)
- `community-leader` → "Community Leader" (Epic)
- `legend` → "Legend" (Legendary)

### Beta Testing Badges
- `beta-veteran` → "Beta Veteran" (Rare)
- `bug-hunter` → "Bug Hunter" (Epic)

### Community Badges
- `helpful-reviewer` → "Helpful Reviewer" (Rare)
- `active-member` → "Active Member" (Common)

### Developer Badges
- `verified-indie` → "Verified Indie" (Epic)
- `game-creator` → "Game Creator" (Rare)

## Adding New Badges

1. **Add to mappings** (`lib/badges/mappings.ts`):
```typescript
'new-badge-id': {
  name: 'New Badge Name',
  description: 'What this badge represents',
  rarity: 'rare', // common | rare | epic | legendary
}
```

2. **Award badge** (in your achievement/reward logic):
```typescript
// Add badge ID to user's badges array
await prisma.user.update({
  where: { id: userId },
  data: {
    badges: {
      push: 'new-badge-id'
    }
  }
});
```

## Badge Display in Profile Card

The profile card preview shows badges:
- **With rarity colors** matching their importance
- **In a flex-wrap layout** for multiple badges
- **With proper spacing** and visual hierarchy
- **Only when user has badges** (empty state shown otherwise)

## Example Badge Display

```
Badges
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ FIRST STEPS │ │  COLLECTOR   │ │ GAME TESTER │
└─────────────┘ └─────────────┘ └─────────────┘
  (gray)          (gray)          (blue)
```

Badges automatically wrap to new lines if there are many:

```
Badges
┌─────────────┐ ┌─────────────┐
│ FIRST STEPS │ │  COLLECTOR   │
└─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐
│ GAME TESTER │ │ BUG HUNTER  │
└─────────────┘ └─────────────┘
```



