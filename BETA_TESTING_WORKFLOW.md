# Beta Testing Workflow

## Overview

The beta testing workflow allows developers to test their games with a select group of Pro subscribers before releasing them to the public marketplace.

## How It Works

### 1. Developer Creates Game

When creating a new game at `/dashboard/games/new`, developers choose between:

- **🧪 Beta Testing** (default)
  - Game is only visible to Pro subscribers
  - Appears in `/games/beta` for Pro members
  - Perfect for early testing and feedback
  
- **✅ Full Release**
  - Game is immediately visible in public marketplace
  - Available to all users at `/games`
  - Best for polished, ready-to-launch games

### 2. Beta Testing Phase

**Developer View** (`/profile/developer/beta`):
- See all games currently in beta
- View tester count and feedback count
- Edit game details
- Promote to full release when ready

**Pro Subscriber View** (`/games/beta`):
- Browse all games in beta testing
- Play/download beta games
- Provide ratings and feedback
- Help developers improve their games

### 3. Promotion to Full Release

When a developer is ready to release their game:

1. Go to `/profile/developer/beta`
2. Click "🚀 Promote to Release" on the game
3. Confirm the promotion (irreversible)
4. Game moves from beta to public marketplace
5. Now visible to all users at `/games`

## Database Schema

```prisma
enum ReleaseStatus {
  BETA      // Only visible to Pro subscribers
  RELEASED  // Visible in public marketplace
}

model Game {
  // ... other fields
  releaseStatus ReleaseStatus @default(BETA)
  // ... other fields
}
```

## API Endpoints

### Get Beta Games
```
GET /api/games/beta
```
- Requires Pro subscription
- Returns games with `releaseStatus = BETA`

### Promote Game to Release
```
POST /api/games/:id/promote
```
- Requires authentication
- Only game owner can promote
- Changes `releaseStatus` from `BETA` to `RELEASED`

### Get Games (with status filter)
```
GET /api/games?developer=me&status=beta
```
- `developer=me` - Show developer's own games (all statuses)
- `status=beta` - Filter to beta games only
- Default (no params) - Show only RELEASED games

## UI Components

### GameCard
- Shows "🧪 BETA" badge for beta games
- Blue gradient styling for beta games
- Green gradient styling for released games

### GameForm
- Release Status toggle with visual feedback
- Contextual tips based on selection
- Defaults to BETA for new games

### Beta Management Page
- Lists developer's beta games
- Shows tester and feedback counts
- Promote to Release button
- Edit game button

## User Flows

### Developer Flow
1. Create game → Select "Beta Testing"
2. Game appears in `/profile/developer/beta`
3. Pro subscribers test and provide feedback
4. Developer iterates based on feedback
5. When ready, promote to Full Release
6. Game appears in public `/games` marketplace

### Pro Subscriber Flow
1. Navigate to `/games/beta`
2. Browse available beta games
3. Play/download games
4. Provide ratings and feedback
5. Help developers improve their games

### Regular User Flow
1. Browse `/games` marketplace
2. See only fully released games
3. No access to beta games
4. Can upgrade to Pro for beta access

## Benefits

### For Developers
- Test games with real users before public launch
- Gather valuable feedback early
- Build anticipation for release
- Reduce risk of negative reviews
- Iterate based on user input

### For Pro Subscribers
- Early access to new games
- Influence game development
- Exclusive content
- Support indie developers
- Be part of the creative process

### For the Platform
- Higher quality games in marketplace
- Increased Pro subscription value
- Community engagement
- Developer-gamer collaboration
- Better user retention

## Technical Notes

- Beta games are filtered at the query level for performance
- `releaseStatus` is indexed for fast lookups
- Promotion is irreversible (by design)
- Only game owners can promote
- Pro subscription check is enforced server-side
- Beta badge styling is consistent across all components

## Future Enhancements

Potential additions to the beta testing system:

- [ ] Beta tester limits (max X testers per game)
- [ ] Feedback forms with structured questions
- [ ] Beta tester leaderboards
- [ ] Developer analytics for beta performance
- [ ] Email notifications for new feedback
- [ ] Beta tester badges/rewards
- [ ] Private beta codes for specific users
- [ ] Beta testing duration limits
- [ ] Automatic promotion after X positive reviews








