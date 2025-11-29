# Beta Testing System - Current State & Implementation Plan

## 📊 Current Implementation Status

### ✅ What We Have (Implemented)

#### 1. **Basic Beta Access System**
- ✅ `releaseStatus` field on Game model (BETA/RELEASED)
- ✅ `/games/beta` page for Pro subscribers to browse beta games
- ✅ `/profile/developer/beta` page for developers to manage beta games
- ✅ Promote to Release functionality
- ✅ Pro subscription requirement for beta access
- ✅ Basic filtering (beta games only visible to Pro users)

#### 2. **Database Schema**
- ✅ `Game` model with `releaseStatus`
- ✅ `BetaAccess` model (exists but underutilized)
  - Has: gameId, title, description, startDate, endDate, isActive, minTier
  - Missing: testers tracking, missions, rewards
- ✅ `User` model with subscription tiers
- ✅ `Purchase` model (could track beta access)

#### 3. **Pages**
- ✅ `/games/beta` - Gamer beta games list (basic)
- ✅ `/profile/developer/beta` - Developer beta management (basic)
- ✅ `/dashboard/games/new` - Game creation with beta toggle
- ✅ `/dashboard/games/[id]/edit` - Game editing

---

## ❌ What's Missing (From Your Requirements)

### 🎮 Gamer Beta Testing Dashboard

#### Missing Features:
1. **❌ Active Beta Tests Dashboard**
   - No "My Active Tests" view
   - No progress tracking per game
   - No build version display
   - No time spent tracking
   - No task completion progress bars

2. **❌ Missions / Tasks System**
   - No task/mission database models
   - No gamification (XP, rewards, badges)
   - No task types (bug reports, suggestions, playtime goals)
   - No task completion tracking
   - No leaderboards

3. **❌ Feedback Hub**
   - No structured feedback forms
   - No bug reporting system
   - No video/screenshot upload
   - No device info collection
   - No feedback categorization (bugs, suggestions, performance, story/art)

4. **❌ Impact & Rewards System**
   - No XP system
   - No tester levels (Novice → Master)
   - No badges/achievements
   - No reward points
   - No leaderboards
   - No tester reputation/reliability scores

5. **❌ Upcoming Tests / Invitations**
   - No invitation system
   - No "Request to Join" functionality
   - No requirements filtering (PC/Mac, language, region)

### 🛠️ Developer Beta Control Dashboard

#### Missing Features:
1. **❌ Build Management**
   - No build versioning system
   - No multiple builds per game
   - No build upload history
   - No changelog generation
   - No rollback functionality
   - No "Internal Only" vs "Public Beta" distinction

2. **❌ Tester Management**
   - No tester list/table
   - No tester statistics (bugs submitted, XP, reliability)
   - No region/device filtering
   - No ability to add/remove specific testers
   - No "expert tester" designation
   - No special mission assignments

3. **❌ Feedback & Bug Reports Dashboard**
   - No Kanban board for bug tracking
   - No bug status workflow (New → Investigating → Fixing → Resolved → Rejected)
   - No bug priority system
   - No video/screenshot viewing
   - No device data display
   - No tester reliability scores on reports

4. **❌ Performance Analytics**
   - No FPS tracking
   - No crash reports
   - No hardware compatibility data
   - No time-spent-per-level analytics
   - No difficulty spike detection
   - No bug type categorization

5. **❌ Community & Messaging**
   - No announcement system
   - No direct messaging with testers
   - No surveys
   - No private tester groups
   - No reward distribution system

6. **❌ Rewards & Incentive Configuration**
   - No XP multiplier settings
   - No custom badge creation
   - No game key distribution
   - No early-access privilege management
   - No playtester credits system

---

## 🗄️ Required Database Models

### New Models Needed:

```prisma
// Beta Build Versions
model BetaBuild {
  id          String   @id @default(cuid())
  gameId      String
  version     String   // e.g., "v0.3.1 Beta"
  buildNumber Int
  fileUrl     String?  // ZIP/EXE/WebGL
  changelog   String   @db.Text
  isActive    Boolean  @default(true)
  visibility  BuildVisibility // INTERNAL, PUBLIC_BETA, RELEASED
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  game        Game     @relation(fields: [gameId], references: [id])
  testers     BetaTester[]
  tasks       BetaTask[]
  feedback    BetaFeedback[]
  
  @@index([gameId])
  @@index([isActive])
}

enum BuildVisibility {
  INTERNAL      // Only invited testers
  PUBLIC_BETA   // All Pro subscribers
  RELEASED      // Everyone
}

// Beta Testers (Join table with stats)
model BetaTester {
  id            String   @id @default(cuid())
  userId        String
  buildId       String
  gameId        String
  
  // Stats
  xp            Int      @default(0)
  level         Int      @default(1)
  bugsReported  Int      @default(0)
  tasksCompleted Int     @default(0)
  timeSpent     Int      @default(0) // minutes
  reliability   Float    @default(5.0) // 1-5 stars
  
  // Status
  status        TesterStatus @default(ACTIVE)
  invitedAt     DateTime @default(now())
  lastActiveAt  DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
  build         BetaBuild @relation(fields: [buildId], references: [id])
  game          Game     @relation(fields: [gameId], references: [id])
  completedTasks BetaTaskCompletion[]
  feedback      BetaFeedback[]
  rewards       BetaReward[]
  
  @@unique([userId, buildId])
  @@index([userId])
  @@index([buildId])
  @@index([gameId])
}

enum TesterStatus {
  ACTIVE
  INVITED
  REMOVED
  COMPLETED
}

// Beta Tasks/Missions
model BetaTask {
  id          String   @id @default(cuid())
  buildId     String
  gameId      String
  
  title       String
  description String   @db.Text
  type        TaskType
  xpReward    Int      @default(10)
  pointsReward Int     @default(5)
  
  // Requirements
  required    Boolean  @default(false)
  order       Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  build       BetaBuild @relation(fields: [buildId], references: [id])
  game        Game     @relation(fields: [gameId], references: [id])
  completions BetaTaskCompletion[]
  
  @@index([buildId])
  @@index([gameId])
}

enum TaskType {
  BUG_REPORT      // Report X bugs
  SUGGESTION      // Submit improvement ideas
  PLAYTIME        // Play for X minutes
  LEVEL_COMPLETE  // Complete specific level
  AUDIO_TEST      // Test audio
  UI_FEEDBACK     // Give UI feedback
  PERFORMANCE     // Report performance issues
  STORY_FEEDBACK  // Comment on story/art
}

// Task Completion Tracking
model BetaTaskCompletion {
  id          String   @id @default(cuid())
  taskId      String
  testerId    String
  
  completedAt DateTime @default(now())
  
  task        BetaTask @relation(fields: [taskId], references: [id])
  tester      BetaTester @relation(fields: [testerId], references: [id])
  
  @@unique([taskId, testerId])
  @@index([testerId])
}

// Feedback & Bug Reports
model BetaFeedback {
  id          String   @id @default(cuid())
  buildId     String
  testerId    String
  gameId      String
  
  type        FeedbackType
  title       String
  description String   @db.Text
  
  // Bug-specific fields
  stepsToReproduce String? @db.Text
  severity    BugSeverity?
  status      BugStatus   @default(NEW)
  
  // Media
  videoUrl    String?
  screenshots String[]
  
  // Device info
  deviceInfo  Json?
  
  // Developer response
  developerNotes String? @db.Text
  resolvedAt     DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  build       BetaBuild @relation(fields: [buildId], references: [id])
  tester      BetaTester @relation(fields: [testerId], references: [id])
  game        Game     @relation(fields: [gameId], references: [id])
  
  @@index([buildId])
  @@index([testerId])
  @@index([gameId])
  @@index([status])
  @@index([type])
}

enum FeedbackType {
  BUG
  SUGGESTION
  PERFORMANCE
  STORY
  ART
  AUDIO
  UI_UX
  GENERAL
}

enum BugSeverity {
  CRITICAL    // Game-breaking
  HIGH        // Major issue
  MEDIUM      // Noticeable problem
  LOW         // Minor issue
  TRIVIAL     // Cosmetic
}

enum BugStatus {
  NEW
  INVESTIGATING
  FIXING
  RESOLVED
  REJECTED
  DUPLICATE
}

// Rewards & Badges
model BetaReward {
  id          String   @id @default(cuid())
  testerId    String
  gameId      String
  
  type        RewardType
  title       String
  description String?
  value       Int      // XP, points, or key count
  
  claimed     Boolean  @default(false)
  claimedAt   DateTime?
  
  createdAt   DateTime @default(now())
  
  tester      BetaTester @relation(fields: [testerId], references: [id])
  game        Game     @relation(fields: [gameId], references: [id])
  
  @@index([testerId])
  @@index([gameId])
}

enum RewardType {
  XP
  POINTS
  BADGE
  GAME_KEY
  EARLY_ACCESS
  CREDITS
}

// Announcements
model BetaAnnouncement {
  id          String   @id @default(cuid())
  gameId      String
  buildId     String?
  
  title       String
  message     String   @db.Text
  type        AnnouncementType
  
  createdAt   DateTime @default(now())
  
  game        Game     @relation(fields: [gameId], references: [id])
  
  @@index([gameId])
  @@index([createdAt])
}

enum AnnouncementType {
  NEW_BUILD
  MISSION
  REWARD
  GENERAL
}
```

---

## 🎯 Difficulty Assessment

### 🟢 **EASY** (1-2 days each)
1. ✅ Basic beta access (already done)
2. Build versioning display
3. Simple task list display
4. Basic feedback form
5. XP/Level display

### 🟡 **MEDIUM** (3-5 days each)
1. Task completion tracking
2. Bug report system with screenshots
3. Tester statistics dashboard
4. Reward point system
5. Basic leaderboards
6. Announcement system

### 🔴 **HARD** (1-2 weeks each)
1. **Full Build Management System**
   - Multiple builds per game
   - Build upload/download
   - Rollback functionality
   - Changelog generation

2. **Complete Feedback Hub**
   - Video upload
   - Device info collection
   - Kanban board for bug tracking
   - Bug workflow (New → Resolved)

3. **Performance Analytics**
   - FPS tracking
   - Crash report collection
   - Hardware compatibility matrix
   - Time-spent analytics

4. **Gamification System**
   - XP calculation
   - Level progression
   - Badge system
   - Reward distribution
   - Leaderboards with filters

5. **Tester Management**
   - Invitation system
   - Reliability scoring
   - Region/device filtering
   - Expert tester designation

6. **Messaging & Community**
   - In-app messaging
   - Private groups
   - Survey system

---

## 📝 Overall Difficulty: **VERY HARD** ⚠️

### Why It's Difficult:

1. **Massive Scope** - This is essentially building:
   - A project management tool (bug tracking)
   - A gamification platform (XP, badges, levels)
   - An analytics dashboard (performance tracking)
   - A messaging system (announcements, surveys)
   - A file management system (build uploads)

2. **Database Complexity** - Requires 10+ new models with complex relationships

3. **Real-time Features** - Leaderboards, live stats, notifications

4. **File Handling** - Build uploads (potentially large files), video uploads

5. **Analytics** - FPS tracking, crash reports require client-side SDKs

6. **Time Estimate**: **2-3 months** for full implementation with one developer

---

## 🚀 Recommended Approach

### Phase 1: MVP (2-3 weeks) ⭐
**Goal**: Basic functional beta testing

1. ✅ Beta game access (done)
2. Simple task list (no gamification yet)
3. Basic feedback form (text + screenshot)
4. Developer feedback view (simple list)
5. Basic tester stats (bugs submitted, time spent)

### Phase 2: Gamification (2-3 weeks)
1. XP system
2. Levels & badges
3. Task completion tracking
4. Reward points
5. Simple leaderboard

### Phase 3: Advanced Features (3-4 weeks)
1. Build versioning
2. Bug tracking Kanban
3. Video uploads
4. Performance analytics (basic)
5. Tester management

### Phase 4: Polish (2-3 weeks)
1. Messaging system
2. Advanced analytics
3. Invitation system
4. Reward distribution
5. Community features

---

## 💡 My Recommendation

Given the massive scope, I suggest we:

1. **Start with Phase 1 MVP** - Get basic functionality working
2. **Validate with users** - See what features they actually use
3. **Iterate based on feedback** - Don't build everything at once
4. **Consider third-party tools** - Some features (analytics, messaging) might be better handled by existing services

**Should we proceed with Phase 1 MVP, or do you want to tackle the full system?**

