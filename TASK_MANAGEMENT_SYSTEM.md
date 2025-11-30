# Beta Task Management System

## Overview

Developers can now create structured beta testing tasks for their games, and gamers automatically complete tasks when they submit relevant feedback.

---

## 🎮 For Developers

### How to Manage Tasks

1. **Navigate to Beta Dashboard**
   - Go to `/profile/developer/beta`
   - You'll see all your beta games

2. **Open Task Management**
   - Click the **"Manage Tasks"** button on any beta game
   - A modal will open showing all tasks for that game

3. **Create a New Task**
   - Click **"Create New Task"**
   - Fill in:
     - **Title**: Short task name (e.g., "Test Level 1 Combat")
     - **Description**: Detailed instructions for testers
     - **Task Type**: 
       - 🐞 **Bug Report** - Ask testers to report bugs
       - 💡 **Suggestion** - Ask for improvement ideas
       - 🎮 **Play Level** - Ask to play specific content
       - 🧪 **Test Feature** - Ask to test specific features
     - **XP Reward**: 0-1000 XP (default: 50)
     - **Reward Points**: 0-100 points (default: 10)
     - **Optional**: Check if task is optional (unchecked = required)
   - Click **"Create Task"**

4. **Edit a Task**
   - Click the **Edit** icon (pencil) on any task
   - Modify fields and click **"Update Task"**

5. **Delete a Task**
   - Click the **Delete** icon (trash) on any task
   - Confirm deletion (this also deletes all completion records)

6. **View Completion Stats**
   - Each task shows: `X/Y (Z%)` 
     - X = number of testers who completed
     - Y = total active testers
     - Z = completion percentage

---

## 🎯 For Gamers

### How Tasks Work

1. **Join a Beta Test**
   - Go to `/games/beta` and click **"Join Beta"** on any game
   - You're now enrolled as a beta tester

2. **View Your Tasks**
   - Go to `/profile/gamer/beta`
   - Click **"View Details"** on any active test
   - You'll see a list of tasks on the left side

3. **Complete Tasks Automatically**
   - Tasks are **auto-completed** when you submit relevant feedback:
     - Submit a **Bug Report** → Completes all `BUG_REPORT` tasks
     - Submit a **Suggestion** → Completes all `SUGGESTION` tasks
   - Completed tasks show a ✅ checkmark
   - Your progress bar updates automatically

4. **Track Your Progress**
   - See how many tasks you've completed
   - Earn XP and reward points
   - View your stats on the beta dashboard

---

## 🔧 Technical Details

### API Routes

#### Create Task
```http
POST /api/beta/tasks
Content-Type: application/json

{
  "gameId": "string",
  "title": "string",
  "description": "string",
  "type": "BUG_REPORT" | "SUGGESTION" | "PLAY_LEVEL" | "TEST_FEATURE",
  "xpReward": 50,
  "rewardPoints": 10,
  "isOptional": false
}
```

#### Update Task
```http
PATCH /api/beta/tasks/:taskId
Content-Type: application/json

{
  "title": "string (optional)",
  "description": "string (optional)",
  "type": "BUG_REPORT" | "SUGGESTION" | "PLAY_LEVEL" | "TEST_FEATURE" (optional),
  "xpReward": 50 (optional),
  "rewardPoints": 10 (optional),
  "isOptional": false (optional)
}
```

#### Delete Task
```http
DELETE /api/beta/tasks/:taskId
```

#### Get Tasks for Game (Developer)
```http
GET /api/beta/tasks/by-game/:gameId
```

Returns:
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "type": "BUG_REPORT",
      "xpReward": 50,
      "rewardPoints": 10,
      "isOptional": false,
      "order": 0,
      "completionCount": 5,
      "testerCount": 10
    }
  ],
  "testerCount": 10
}
```

#### Get Tasks for Game (Gamer)
```http
GET /api/beta/tasks/:gameId
```

Returns:
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "type": "BUG_REPORT",
      "completed": true,
      "completedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Database Schema

#### BetaTask
```prisma
model BetaTask {
  id           String   @id @default(cuid())
  gameId       String
  title        String
  description  String   @db.Text
  type         TaskType
  order        Int      @default(0)
  xpReward     Int      @default(50)
  rewardPoints Int      @default(10)
  isOptional   Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  game        Game                 @relation(...)
  completions BetaTaskCompletion[]
}
```

#### BetaTaskCompletion
```prisma
model BetaTaskCompletion {
  id          String   @id @default(cuid())
  taskId      String
  testerId    String
  completedAt DateTime @default(now())
  isVerified  Boolean  @default(false)
  
  task   BetaTask   @relation(...)
  tester BetaTester @relation(...)
  
  @@unique([taskId, testerId])
}
```

### Auto-Completion Logic

When a gamer submits feedback via `POST /api/beta/feedback`:

1. **Feedback is created** in the database
2. **System searches for matching tasks**:
   - If feedback type is `BUG` → finds all `BUG_REPORT` tasks for that game
   - If feedback type is `SUGGESTION` → finds all `SUGGESTION` tasks for that game
3. **For each matching task**:
   - Checks if tester already completed it
   - If not, creates a `BetaTaskCompletion` record
   - Increments the tester's `tasksCompleted` count
4. **Returns feedback + task completion count**

---

## 🎨 UI Components

### TaskManagementModal
- **Location**: `components/beta/TaskManagementModal.tsx`
- **Props**:
  - `gameId`: string
  - `gameTitle`: string
  - `isOpen`: boolean
  - `onClose`: () => void
- **Features**:
  - Full CRUD interface
  - Task type selection with icons
  - XP/points input
  - Optional checkbox
  - Completion statistics
  - Delete confirmation
  - Platform-styled UI

---

## 📊 Example Workflow

### Developer Creates Tasks

1. Developer publishes a beta game "Space Adventure"
2. Developer opens task management
3. Developer creates tasks:
   - **"Report Level 1 Bugs"** (Bug Report, 100 XP, 20 pts)
   - **"Suggest UI Improvements"** (Suggestion, 50 XP, 10 pts)
   - **"Play Through Level 1"** (Play Level, 75 XP, 15 pts, Optional)

### Gamer Completes Tasks

1. Gamer joins "Space Adventure" beta
2. Gamer sees 3 tasks (2 required, 1 optional)
3. Gamer plays the game and finds a bug
4. Gamer submits bug report: "Enemy doesn't take damage"
5. **System auto-completes** "Report Level 1 Bugs" task
6. Gamer earns 100 XP + 20 points
7. Progress bar updates: 1/2 required tasks complete

### Developer Views Progress

1. Developer opens task management
2. Sees: "Report Level 1 Bugs" → 15/20 testers completed (75%)
3. Sees: "Suggest UI Improvements" → 8/20 testers completed (40%)
4. Developer can verify completions or create new tasks

---

## 🚀 Benefits

### For Developers
✅ Structured beta testing workflow  
✅ Clear objectives for testers  
✅ Track completion rates  
✅ Gamify the testing process  
✅ Prioritize feedback collection  

### For Gamers
✅ Clear goals and objectives  
✅ Automatic progress tracking  
✅ Earn rewards (XP, points)  
✅ See impact of contributions  
✅ Gamified testing experience  

---

## 🔮 Future Enhancements

- [ ] Manual task completion (for non-feedback tasks)
- [ ] Task verification by developers
- [ ] Task templates (common testing scenarios)
- [ ] Task dependencies (complete A before B)
- [ ] Task deadlines and milestones
- [ ] Leaderboards for top task completers
- [ ] Bulk task operations
- [ ] Task import/export
- [ ] Task analytics dashboard

---

**System Status**: ✅ Fully Implemented and Committed
**Last Updated**: 2025-11-30

