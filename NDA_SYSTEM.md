# NDA Agreement System - Beta Access

## Overview

The NDA (Non-Disclosure Agreement) system ensures that beta testers accept confidentiality terms before accessing pre-release game content. This protects developers' intellectual property and creates a legal framework for beta testing.

---

## How It Works

### For Gamers (Beta Testers)

1. **Navigate to Beta Games**
   - Go to `/games/beta`
   - Browse available beta games (requires Creator Support Pass)

2. **Join a Beta Test**
   - Click "Review NDA & Join" on any game
   - NDA modal appears with full agreement text
   - Scroll through the entire agreement (required)
   - Check the acceptance checkbox
   - Click "Accept NDA & Continue"
   - Automatically joins the beta test after acceptance

3. **NDA Status Indicators**
   - Games show "NDA Required" badge before acceptance
   - Badge changes to "NDA Accepted" after acceptance
   - Status persists across sessions

### For Developers

1. **View NDA Statistics**
   - Navigate to `/profile/developer/beta`
   - See NDA acceptance count for each game
   - Track how many testers have signed NDAs

2. **Access Detailed NDA Data**
   - API endpoint provides detailed acceptance records
   - Includes timestamps, IP addresses, and user info
   - Useful for legal compliance and auditing

---

## Database Schema

### NdaAcceptance Model

```prisma
model NdaAcceptance {
  id        String   @id @default(cuid())
  userId    String
  gameId    String
  
  version       String   @default("1.0")  // NDA version
  acceptedAt    DateTime @default(now())
  ipAddress     String?                   // Audit trail
  userAgent     String?  @db.Text         // Device info
  
  revokedAt     DateTime?                 // If revoked
  revokedReason String?  @db.Text
  
  user User @relation(...)
  game Game @relation(...)
  
  @@unique([userId, gameId])
  @@map("nda_acceptances")
}
```

---

## API Endpoints

### 1. Check NDA Status

```
GET /api/beta/nda/[gameId]
```

**Response:**
```json
{
  "hasAccepted": true,
  "needsUpdate": false,
  "currentVersion": "1.0",
  "acceptedVersion": "1.0",
  "acceptedAt": "2025-12-22T10:30:00Z",
  "gameTitle": "Game Title",
  "developerName": "Developer Name"
}
```

### 2. Accept NDA

```
POST /api/beta/nda/[gameId]
```

**Request:**
```json
{
  "confirmed": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "NDA accepted for \"Game Title\"",
  "ndaAcceptance": {
    "id": "...",
    "version": "1.0",
    "acceptedAt": "2025-12-22T10:30:00Z"
  }
}
```

### 3. Developer NDA Statistics

```
GET /api/beta/nda/stats
```

**Response:**
```json
{
  "summary": {
    "totalGames": 3,
    "totalNdaAcceptances": 45,
    "totalBetaTesters": 50,
    "gamesInBeta": 2
  },
  "games": [
    {
      "gameId": "...",
      "gameTitle": "My Game",
      "totalNdaAcceptances": 25,
      "totalBetaTesters": 28,
      "acceptances": [
        {
          "userId": "...",
          "userName": "Tester Name",
          "version": "1.0",
          "acceptedAt": "..."
        }
      ]
    }
  ]
}
```

---

## NDA Agreement Contents

The NDA covers:

1. **Confidential Information Definition**
   - Game content, features, mechanics
   - Story, characters, dialogue
   - Visual and audio assets
   - Technical implementations
   - Bug reports and feedback
   - Business information

2. **Tester Obligations**
   - Keep information confidential
   - No sharing, streaming, or recording
   - No public discussions
   - Report bugs through official channels only
   - Delete materials upon request

3. **Permitted Disclosures**
   - To developer through official channels
   - If legally required
   - After public release

4. **Duration**
   - 2 years from acceptance, OR
   - 1 year after game's public release

5. **Other Terms**
   - Intellectual property remains with developer
   - Feedback may be used without compensation
   - No warranty on beta software

---

## UI Components

### NdaModal Component

**Location:** `/components/beta/NdaModal.tsx`

**Features:**
- Professional modal design
- Scrollable NDA text area
- Scroll detection (must read entire agreement)
- Confirmation checkbox
- Accept/Decline buttons
- Security note (IP logging)

**Usage:**
```tsx
<NdaModal
  isOpen={isOpen}
  onClose={handleClose}
  onAccept={handleAccept}
  gameTitle="Game Name"
  developerName="Developer Name"
  isLoading={false}
/>
```

---

## Flow Diagram

```
Gamer clicks "Join Beta"
        ↓
Check NDA status (API call)
        ↓
    ┌───────────┐
    │ Already   │──Yes──→ Join Beta directly
    │ Accepted? │
    └───────────┘
        │ No
        ↓
Show NDA Modal
        ↓
User scrolls & reads NDA
        ↓
User checks acceptance box
        ↓
User clicks "Accept"
        ↓
Record NDA acceptance (with IP, timestamp)
        ↓
Automatically join beta test
        ↓
Show success notification
```

---

## Version Management

The system supports NDA versioning:

- Current version: `1.0`
- When terms change, increment version
- Users with old versions see `needsUpdate: true`
- Can require re-acceptance for updated terms

To update NDA version:
1. Change `CURRENT_NDA_VERSION` in `/app/api/beta/nda/[gameId]/route.ts`
2. Users will be prompted to re-accept

---

## Audit Trail

Each NDA acceptance records:
- User ID
- Game ID
- NDA version
- Acceptance timestamp
- IP address
- Browser/device user agent

This provides legal proof of acceptance for developers.

---

## Security Considerations

1. **Authentication Required** - Must be logged in
2. **Pro Subscription Required** - Beta access gate
3. **IP Logging** - Audit trail for legal purposes
4. **Version Tracking** - Ensure users accept current terms
5. **Revocation Support** - Can revoke NDA if needed

---

## Future Enhancements

1. **Custom NDAs per Game** - Let developers customize terms
2. **PDF Download** - Generate signed NDA document
3. **Email Confirmation** - Send copy of accepted NDA
4. **Bulk Revocation** - Revoke all NDAs for a game
5. **Expiration Reminders** - Notify when NDA expires
6. **Re-acceptance Workflow** - Streamlined process for updates

---

## Summary

✅ **Gamers must:**
- Read the full NDA (scroll detection)
- Check the acceptance checkbox
- Accept before joining any beta test

✅ **Developers can:**
- See NDA acceptance statistics
- Track which testers have signed
- Use data for legal compliance

✅ **Platform provides:**
- Legally binding acceptance records
- IP/timestamp audit trail
- Version management for updates
- Professional modal UI

**Result:** A complete NDA tracking system that protects developers' intellectual property while maintaining a smooth user experience for beta testers.



