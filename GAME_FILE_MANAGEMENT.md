# Game File Management - Safety Rules & Features

## Overview
This document explains how game file uploads, replacements, and deletions work in the Shader House platform, with a focus on security and data safety.

---

## ⭐ Safety Rules Implemented

### Rule 1: Only Game Owner Can Update Files
**Implementation:** Strict ownership verification in all API routes

```typescript
// lib/queries/games.ts - updateGame()
if (game.developerId !== userId) {
  throw new Error('Unauthorized: Only the game owner can update this game');
}
```

**What this means:**
- ✅ Only the developer who created the game can update it
- ❌ Other developers cannot modify it
- ❌ Even admins cannot modify it (for safety)
- ❌ Gamers cannot modify it

**Where enforced:**
- `PATCH /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game
- `DELETE /api/games/:id/file` - Delete game file

---

### Rule 2: File Replacement Overwrites Old File
**Implementation:** Automatic cleanup when uploading new files

```typescript
// lib/queries/games.ts - updateGame()
if (gameData.gameFileUrl && game.gameFileUrl && gameData.gameFileUrl !== game.gameFileUrl) {
  await replaceFile(game.gameFileUrl, gameData.gameFileUrl);
}
```

**What happens:**
1. Developer uploads a new game file
2. System detects old file exists
3. **Old file is deleted from server**
4. New file path is saved to database
5. Users now download the new file

**Why this matters:**
- Prevents server storage from filling up with old versions
- Ensures users always get the latest version
- Automatic cleanup = no manual maintenance needed

---

### Rule 3: Clear URL When Uploading File (Optional)
**Implementation:** Smart handlers with optional prompts

```typescript
// components/games/GameForm.tsx
const handleGameFileChange = (url: string) => {
  handleChange('gameFileUrl', url);
  // Optional: Uncomment to enforce single distribution method
  // if (url && formData.externalUrl) {
  //   const shouldClear = window.confirm('Remove external URL?');
  //   if (shouldClear) handleChange('externalUrl', '');
  // }
};
```

**Current behavior:**
- ✅ Developers can have **both** a file AND an external URL
- ✅ Visual indicator shows when both are active
- ✅ Users see both download options

**Alternative (commented out):**
- Prompt to remove external URL when uploading file
- Prompt to remove file when adding external URL
- Enforces single distribution method

---

### Rule 4: Confirm Before Deleting Uploaded File
**Implementation:** Browser confirmation dialog

```typescript
// components/games/GameFileUpload.tsx
const handleRemove = () => {
  const confirmed = window.confirm(
    '⚠️ Are you sure you want to remove this game file?\n\n' +
    'This action cannot be undone. The file will be permanently deleted from the server.\n\n' +
    'Make sure you have an external URL or will upload a new file before saving.'
  );
  if (!confirmed) return;
  // ... proceed with deletion
};
```

**What the developer sees:**
```
⚠️ Are you sure you want to remove this game file?

This action cannot be undone. The file will be permanently deleted from the server.

Make sure you have an external URL or will upload a new file before saving.

[Cancel] [OK]
```

**Protection:**
- Prevents accidental deletions
- Reminds developer to have alternative distribution method
- Clear warning that action is permanent

---

## 🔄 Switching Between Distribution Methods

### Scenario 1: File → External URL
**Steps:**
1. Developer has uploaded `game.zip`
2. Developer adds external URL (e.g., `https://itch.io/my-game`)
3. Both are now active
4. Users can choose: Download ZIP OR Play on itch.io

**To remove file:**
1. Click "Remove" button on file upload
2. Confirm deletion
3. Only external URL remains

---

### Scenario 2: External URL → File
**Steps:**
1. Developer has external URL set
2. Developer uploads `game.zip`
3. Both are now active
4. Users can choose: Download ZIP OR Play on external site

**To remove URL:**
1. Clear the external URL input field
2. Save changes
3. Only uploaded file remains

---

### Scenario 3: Replace Uploaded File
**Steps:**
1. Developer has uploaded `game-v1.zip`
2. Developer uploads `game-v2.zip`
3. **Old file (`game-v1.zip`) is automatically deleted**
4. New file (`game-v2.zip`) is saved
5. Users now download v2

**No manual cleanup needed!**

---

## 🛡️ Security Features

### 1. File Type Validation
```typescript
// app/api/upload/route.ts
const ALLOWED_GAME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
];
```

**Blocked:** `.exe`, `.sh`, `.bat`, `.js`, etc.

---

### 2. File Size Limits
- **Game files:** 100MB maximum
- **Images:** 5MB maximum

---

### 3. Unique Filenames
```typescript
// app/api/upload/route.ts
const timestamp = Date.now();
const randomString = Math.random().toString(36).substring(2, 15);
const filename = `${timestamp}-${randomString}.${extension}`;
```

**Example:** `1764364937447-ksdpduw2mr.zip`

**Why:**
- Prevents filename collisions
- Prevents overwriting other developers' files
- Makes filenames unpredictable (security)

---

### 4. Ownership Verification
Every file operation checks:
```typescript
if (game.developerId !== session.user.id) {
  throw new Error('Unauthorized');
}
```

**Protects against:**
- Cross-developer file manipulation
- Unauthorized deletions
- Malicious updates

---

## 📁 File Storage Structure

```
public/
├── uploads/
│   ├── games/           # Cover images & screenshots
│   │   ├── 1764364992563-46905zk5flk.png
│   │   └── ...
│   └── game-files/      # Actual game files
│       ├── 1764364937447-ksdpduw2mr.zip
│       └── ...
```

---

## 🔌 API Endpoints

### Upload File
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File (required)
- type: 'image' | 'game' (optional, defaults to 'image')

Response:
{
  "url": "/uploads/game-files/123456.zip"
}
```

---

### Delete Game File
```
DELETE /api/games/:id/file

Response:
{
  "success": true,
  "message": "Game file deleted successfully"
}

Errors:
- 401: Not authenticated
- 403: Not the game owner
- 400: No file to delete OR no alternative distribution method
```

---

### Update Game
```
PATCH /api/games/:id
Content-Type: application/json

Body:
{
  "gameFileUrl": "/uploads/game-files/new.zip",
  "externalUrl": "https://itch.io/game",
  // ... other fields
}

Behavior:
- If gameFileUrl changed: Old file is deleted automatically
- If both provided: Both distribution methods are active
- If neither provided: Validation error
```

---

## 🎮 User Experience

### For Developers

**Creating a game:**
1. Fill in game details
2. Upload cover image
3. **Choose distribution:**
   - Upload game file (up to 100MB)
   - OR provide external URL
   - OR both
4. Submit

**Updating a game:**
1. Edit game
2. **Replace file:** Upload new one (old deleted automatically)
3. **Remove file:** Click "Remove" → Confirm
4. **Switch method:** Add/remove file or URL as needed
5. Save

---

### For Gamers

**Downloading a game:**
1. Purchase/claim game
2. See download options:
   - **"Download Now"** if file uploaded
   - **"Play Now"** if external URL
   - Both buttons if both methods available
3. Click to download or play

---

## 🚨 Error Handling

### Common Errors

**"Unauthorized: Only the game owner can update this game"**
- **Cause:** Trying to edit someone else's game
- **Solution:** Only edit your own games

**"Cannot delete file: Game must have either a file or external URL"**
- **Cause:** Trying to remove the only distribution method
- **Solution:** Add external URL first, then remove file

**"File too large. Maximum size: 100MB"**
- **Cause:** Game file exceeds limit
- **Solution:** Compress file or use external hosting

**"Invalid file type. Allowed: ZIP, RAR, 7Z, TAR, GZ"**
- **Cause:** Trying to upload unsupported file type
- **Solution:** Package game in supported archive format

---

## 🔮 Future Enhancements

### Potential Improvements

1. **Cloud Storage (S3/R2)**
   - Unlimited storage
   - CDN for faster downloads
   - Better for production

2. **Version History**
   - Keep old versions
   - Allow rollback
   - Show changelog

3. **Chunked Uploads**
   - Support files > 100MB
   - Resume interrupted uploads
   - Progress indicator

4. **Automatic Compression**
   - Compress files on upload
   - Save storage space
   - Faster downloads

5. **Virus Scanning**
   - Scan uploaded files
   - Block malware
   - Protect users

---

## 📝 Summary

✅ **Ownership:** Only game owner can update/delete  
✅ **Automatic Cleanup:** Old files deleted when replaced  
✅ **Confirmation:** Prompts before permanent deletions  
✅ **Flexibility:** Support file AND/OR external URL  
✅ **Security:** File type, size, and ownership validation  
✅ **User-Friendly:** Clear UI with visual indicators  

**Result:** Safe, flexible, and easy-to-use game distribution system! 🎮✨

