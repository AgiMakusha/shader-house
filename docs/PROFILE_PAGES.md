# Profile Pages Documentation

## Overview

The application now has dedicated profile pages for both **Gamers** and **Developers**, providing a personalized dashboard experience based on user role.

---

## User Flow

### 🎮 **Gamer Flow**
```
Home (/) 
  → Login (/login) 
    → Gamer Profile (/profile/gamer)

OR

Home (/) 
  → Register (/register) 
    → Signup (/signup?role=gamer) 
      → Gamer Profile (/profile/gamer)
```

### 👨‍💻 **Developer Flow**
```
Home (/) 
  → Login (/login) 
    → Developer Profile (/profile/developer)

OR

Home (/) 
  → Register (/register) 
    → Signup (/signup?role=developer) 
      → Developer Profile (/profile/developer)
```

---

## Profile Pages

### 🎮 **Gamer Profile** (`/profile/gamer`)

**Features:**
- **Profile Overview Card**
  - Email
  - Role (GAMER)
  - Member since date
  - Account status

- **Quick Actions Grid** (4 cards)
  - **My Library** - Browse your games
  - **Achievements** - View your trophies
  - **Community** - Chat with friends
  - **Settings** - Manage account

- **Gaming Stats Dashboard**
  - Games Owned: `0`
  - Playtime: `0h`
  - Achievements: `0`
  - Friends: `0`

- **Recent Activity Feed**
  - Shows recent game activity (currently empty state)

**Design:**
- Large "Gamer Hub" title with pixel effects
- GameController icon in profile overview
- Forest/magic theme with particles background
- 4-column grid for quick actions
- Stats displayed in large pixelized numbers

---

### 👨‍💻 **Developer Profile** (`/profile/developer`)

**Features:**
- **Profile Overview Card**
  - Email
  - Role (DEVELOPER)
  - Member since date
  - Developer type (INDIE/STUDIO)

- **Quick Actions Grid** (3 cards)
  - **My Projects** - Manage your game projects
  - **Analytics** - View your game stats
  - **Settings** - Manage your account

- **Developer Details Card**
  - Team Size (number of people)
  - Publisher (Yes/No)
  - Owns IP (Yes/No)
  - Company Type (NONE, SOLE_PROP, LLC, CORP)
  - Indie Status (✓ Indie Verified / ⚠ Under Review)

**Design:**
- Large "Developer Studio" title with pixel effects
- BuildTools (wrench) icon in profile overview
- Forest/magic theme with particles background
- 3-column grid for quick actions
- Indie verification status with color-coded badges

---

## API Endpoints

### `GET /api/auth/me`

**Description:** Fetches the current authenticated user's profile data.

**Authentication:** Required (session-based)

**Response:**
```json
{
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "DEVELOPER" | "GAMER",
    "emailVerified": "2025-01-01T00:00:00Z" | null,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "developerProfile": {
      "developerType": "INDIE" | "STUDIO",
      "teamSize": 5,
      "hasPublisher": false,
      "ownsIP": true,
      "companyType": "SOLE_PROP",
      "isIndieEligible": true,
      // ... other fields
    } | null
  }
}
```

**Error Responses:**
- `401 Unauthorized` - No valid session
- `404 Not Found` - User not found in database
- `500 Internal Server Error` - Server error

---

## Middleware & Routing

### Protected Routes
The following routes require authentication:
- `/profile/developer`
- `/profile/gamer`
- `/dashboard`
- `/settings`

### Auth-Only Routes
Authenticated users are automatically redirected from:
- `/login` → `/profile/{role}`
- `/signup` → `/profile/{role}`

### Role-Based Access
- Gamers trying to access `/profile/developer` → redirected to `/profile/gamer`
- Developers trying to access `/profile/gamer` → redirected to `/profile/developer`

---

## Common Components

### GameCard
- Used for all card-based layouts
- Provides consistent styling (gradient borders, shadows)
- Supports `interactive` prop for hover effects

### GameIcon
- Wraps SVG icons with consistent styling
- Sizes: `sm`, `md`, `lg`
- Applies forest-themed colors

### Particles
- Background particle effect on all profile pages
- Matches the forest/magic theme

---

## User Actions

### Logout
Both profile pages include a **Logout** button in the top-right:
1. Calls `POST /api/auth/logout`
2. Plays door sound effect
3. Redirects to `/login` after 300ms

### Quick Action Cards
All quick action cards are interactive and play hover sound effects (when audio is enabled).

---

## Future Enhancements

### For Gamers:
- Real game library integration
- Achievement tracking system
- Friend system and social features
- Playtime tracking
- Game recommendations

### For Developers:
- Project management dashboard
- Analytics and metrics (downloads, revenue, reviews)
- Game upload/publish workflow
- Team collaboration features
- Indie verification review system

---

## Technical Details

### State Management
- User profile fetched on component mount via `/api/auth/me`
- Loading state shown while fetching
- Auto-redirect if unauthenticated or wrong role

### Security
- All profile data fetched server-side via API
- Session validation on every API request
- Role-based access control enforced by middleware

### Styling
- Consistent color palette (forest greens, soft glows)
- Pixelized headings with custom text shadows
- Responsive grid layouts (1 column on mobile, 3-4 on desktop)
- Smooth Framer Motion animations

---

## Testing

To test the profile pages:

1. **As a Gamer:**
   ```bash
   # Register as gamer
   Navigate to /signup?role=gamer
   Fill out form and submit
   # Should redirect to /profile/gamer
   ```

2. **As a Developer:**
   ```bash
   # Register as developer
   Navigate to /signup?role=developer
   Fill out form (including indie verification)
   # Should redirect to /profile/developer
   ```

3. **Login Flow:**
   ```bash
   # Login with existing account
   Navigate to /login
   Enter credentials
   # Should redirect to appropriate profile based on role
   ```

---

## Migration Notes

### Old Routes
The old routes still exist but now redirect:
- `/register/developer` → `/profile/developer`
- `/register/gamer` → `/profile/gamer`

This ensures backward compatibility if users have bookmarked old URLs.

---

## Troubleshooting

### "Unauthorized" Error
- **Cause:** No valid session
- **Solution:** User will be auto-redirected to `/login`

### Wrong Profile Page
- **Cause:** User role doesn't match the profile page
- **Solution:** Auto-redirect to correct profile based on role

### Developer Details Not Showing
- **Cause:** Developer didn't complete indie verification during signup
- **Solution:** Developer profile fields will be `null`, only basic info shown

---

## Related Files

- `/app/profile/developer/page.tsx` - Developer profile page
- `/app/profile/gamer/page.tsx` - Gamer profile page
- `/app/api/auth/me/route.ts` - Profile API endpoint
- `/middleware.ts` - Auth and routing logic
- `/app/login/page.tsx` - Login with role-based redirect
- `/app/signup/page.tsx` - Signup with role-based redirect

---

**Last Updated:** January 2025

