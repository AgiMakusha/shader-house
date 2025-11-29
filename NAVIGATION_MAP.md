# Navigation Map - Gamer Profile Features

## 🎮 Gamer Profile Hub (`/profile/gamer`)

The gamer profile hub serves as the central navigation point for all gamer features. Here's the complete connection map:

---

## Visual Navigation Structure

```
/profile/gamer (Gamer Hub)
├── Quick Actions (3x2 grid)
│   ├── 📦 Browse Games → /games
│   │   └── View all available games
│   │   └── Purchase or play games
│   │
│   ├── 🧪 Beta Access → /games/beta ✨ NEW!
│   │   └── [Creator Support Pass Only]
│   │   └── Test upcoming games
│   │   └── Access alpha/beta/RC builds
│   │   └── Provide feedback to developers
│   │
│   ├── 🏆 Achievements → /profile/gamer/achievements ✨ NEW!
│   │   └── [Creator Support Pass Only]
│   │   └── View unlocked achievements
│   │   └── Track progress on incomplete achievements
│   │   └── See rarity tiers and completion %
│   │
│   ├── 👑 Subscription → /profile/gamer/subscription
│   │   └── View current plan (Free or Creator Support Pass)
│   │   └── Manage subscription
│   │   └── Upgrade or downgrade
│   │   └── See benefits and features
│   │
│   ├── 💬 Community → /community
│   │   └── Chat with friends
│   │   └── Join discussions
│   │   └── Access Discord (Creator Support Pass gets exclusive channels)
│   │
│   └── ⚙️ Settings → /profile/gamer/settings
│       └── Account management
│       └── Newsletter preferences
│       └── Profile customization
│       └── View subscription details
│
└── Logout Button (top-right)
```

---

## Feature Access by Subscription Tier

### Free Access Users See:
```
✅ Browse Games         → Works normally
✅ Beta Access         → Shows upgrade prompt 🔒
✅ Achievements        → Shows upgrade prompt 🔒
✅ Subscription        → Shows Free tier benefits
✅ Community           → Basic access
✅ Settings            → Full access
```

### Creator Support Pass Users See:
```
✅ Browse Games         → All games show "Play Free" buttons
✅ Beta Access         → Full access to beta games
✅ Achievements        → Full achievement system
✅ Subscription        → Shows Creator Support Pass benefits
✅ Community           → Exclusive channels access
✅ Settings            → Full access with golden badge
```

---

## Navigation Flow Examples

### Example 1: Free User Tries to Access Achievements
```
1. User at /profile/gamer
2. Click "Achievements" card
3. → Navigate to /profile/gamer/achievements
4. → FeatureGuard component checks subscription tier
5. → User sees golden upgrade prompt:
    "Creator Support Pass Required"
    "Upgrade to access this feature and support indie developers"
    [Upgrade Now] button
6. Click "Upgrade Now"
7. → Navigate to /membership
8. Subscribe to Creator Support Pass
9. → Success modal → Redirect to /profile/gamer
10. Click "Achievements" again
11. → Now see full achievement system!
```

### Example 2: Premium User Accesses Beta Games
```
1. User at /profile/gamer
2. Click "Beta Access" card
3. → Navigate to /games/beta
4. → FeatureGuard checks subscription tier
5. → User has Creator Support Pass ✓
6. → See list of beta games:
    - Neon Rogue Beta (Beta Test)
    - Space Trader Alpha (Alpha Test)
    - Dungeon Master RC (Release Candidate)
7. Click "Join Test" on any game
8. → Opens game in new tab
```

### Example 3: Premium User Plays Any Game for Free
```
1. User at /profile/gamer
2. Click "Browse Games"
3. → Navigate to /games
4. Click on any paid game (e.g., $14.99 game)
5. → Navigate to /games/[slug]
6. → PurchaseButton component checks subscription tier
7. → User has Creator Support Pass ✓
8. → See golden badge: "Included with Pass"
9. → See golden button: "Play Free →"
10. Click "Play Free"
11. → Game launches without purchase!
```

---

## Quick Actions Grid Layout

The profile displays **6 cards in a 3x2 grid** on desktop:

```
┌─────────────────┬─────────────────┬─────────────────┐
│  Browse Games   │   Beta Access   │  Achievements   │
│                 │   [Premium]     │   [Premium]     │
└─────────────────┴─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┬─────────────────┐
│  Subscription   │   Community     │    Settings     │
│                 │                 │                  │
└─────────────────┴─────────────────┴─────────────────┘
```

**Mobile**: Stacks vertically (1 column)

---

## Page Components & Connections

### 1. `/profile/gamer/page.tsx`
**Purpose**: Main hub with quick action cards  
**Connects to**:
- `/games` - Game catalog
- `/games/beta` - Beta access (new!)
- `/profile/gamer/achievements` - Achievements (new!)
- `/profile/gamer/subscription` - Subscription management
- `/community` - Community features
- `/profile/gamer/settings` - Account settings

### 2. `/profile/gamer/achievements/page.tsx` ✨
**Purpose**: View and track achievements  
**Protected by**: `FeatureFlag.ACHIEVEMENTS`  
**Features**:
- Progress tracking with bars
- Rarity system (Common, Rare, Epic, Legendary)
- Completion percentage
- Unlock status indicators

### 3. `/games/beta/page.tsx` ✨
**Purpose**: Access beta/alpha game tests  
**Protected by**: `FeatureFlag.BETA_ACCESS`  
**Features**:
- Filter by testing phase
- View tester counts
- Join tests
- Provide feedback

### 4. `/profile/gamer/subscription/page.tsx`
**Purpose**: Manage subscription  
**Features**:
- View current tier
- See benefits list
- Upgrade/downgrade buttons
- Cancel subscription

### 5. `/profile/gamer/settings/page.tsx`
**Purpose**: Account settings  
**Features**:
- Profile information
- Newsletter preferences
- Subscription badge
- Link to subscription management

---

## Design Consistency

All cards use the same styling:
- **Background**: Green-tinted gradient
- **Border**: Subtle green glow
- **Text**: Pixelized font (Press Start 2P)
- **Hover**: Scale animation + increased shadow
- **Title**: Green glow text shadow

Premium feature badges:
- **Golden theme** for Creator Support Pass features
- **Blue theme** for beta testing
- **Purple/multi-color** for achievements by rarity

---

## Animation Sequence

Cards appear with staggered animation:
1. **Browse Games** - Delay: 0.4s
2. **Beta Access** - Delay: 0.5s
3. **Achievements** - Delay: 0.6s
4. **Subscription** - Delay: 0.7s
5. **Community** - Delay: 0.8s
6. **Settings** - Delay: 0.9s

Each card:
- Fades in (opacity 0 → 1)
- Slides up (y: 20 → 0)
- Duration: 0.6s

---

## Key Updates Made

✅ **Added Beta Access** quick action card  
✅ **Achievements** card was already connected  
✅ **Adjusted grid** from 4 columns to 3 columns for better balance  
✅ **Updated animation timing** for smoother sequence  

---

## Testing the Navigation

### Test All Quick Actions:
```bash
1. Visit http://localhost:3000/profile/gamer
2. You'll see 6 cards in a 3x2 grid:
   - Browse Games
   - Beta Access (NEW!)
   - Achievements (already there)
   - Subscription
   - Community
   - Settings
3. Click each card to verify navigation
4. Premium features (Beta, Achievements) show upgrade prompt for Free users
```

### Test Premium Access:
```bash
1. Subscribe to Creator Support Pass at /membership
2. Return to /profile/gamer
3. Click "Beta Access" → See beta games
4. Click "Achievements" → See achievement system
5. Click "Browse Games" → All paid games show "Play Free"
```

---

## Summary

**All premium features are now accessible from the gamer profile hub!**

- ✅ **Achievements** - Already connected (line 15)
- ✅ **Beta Access** - Just added (line 14)
- ✅ **Subscription Management** - Already connected (line 16)
- ✅ **Settings** - Already connected (separate card)
- ✅ **Grid layout optimized** for 6 cards (3x2)
- ✅ **Smooth staggered animations**
- ✅ **Consistent retro gaming design**

🎉 **Your gamer profile is now the complete hub for all features!**

