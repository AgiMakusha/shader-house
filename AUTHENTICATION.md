# Authentication System Documentation

## Overview

Shader House now features a comprehensive authentication system with multiple sign-in options:

- **Email/Password Authentication** - Traditional registration with email verification
- **OAuth Providers** - Google, GitHub, and Discord single sign-on
- **Email Verification** - Secure email verification for new accounts
- **Password Reset** - Token-based password recovery (infrastructure ready)

## Features

### ✅ Implemented Features

1. **Email/Password Registration**
   - User registration with name, email, and password
   - Automatic password hashing with bcrypt
   - Email verification token generation and sending
   - Support for both Developer and Gamer roles
   - Indie developer verification system integration

2. **Email Verification**
   - Automated verification email sent on registration
   - Secure token-based verification (24-hour expiry)
   - Beautiful verification page with status feedback
   - Auto-redirect after successful verification

3. **OAuth Authentication**
   - Google OAuth 2.0
   - GitHub OAuth
   - Discord OAuth
   - Automatic account linking for existing users
   - Profile picture import from OAuth providers
   - Auto-verified email for OAuth users

4. **Session Management**
   - JWT-based sessions with HttpOnly cookies
   - "Remember Me" functionality
   - Secure session creation and destruction
   - Middleware-based route protection

5. **Database Integration**
   - PostgreSQL with Prisma ORM
   - User model with email verification status
   - Account model for OAuth providers
   - VerificationToken model for email/password reset
   - Developer profile with indie verification

## Architecture

### Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String?   // Nullable for OAuth users
  role          Role      @default(GAMER)
  emailVerified DateTime?
  image         String?
  
  accounts             Account[]
  verificationTokens   VerificationToken[]
  developerProfile     DeveloperProfile?
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String  // oauth, email, credentials
  provider          String  // google, github, discord
  providerAccountId String
  access_token      String?
  refresh_token     String?
  // ... other OAuth fields
}

model VerificationToken {
  id      String    @id @default(cuid())
  userId  String
  token   String    @unique
  type    TokenType @default(EMAIL_VERIFICATION)
  expires DateTime
}
```

### API Routes

#### Authentication
- `POST /api/auth/register` - User registration with email verification
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/logout` - Session destruction
- `GET /api/auth/oauth/[provider]` - OAuth initiation
- `GET /api/auth/callback/[provider]` - OAuth callback handler

#### Email Verification
- `POST /api/auth/send-verification` - Resend verification email
- `POST /api/auth/verify-email` - Verify email with token

### Pages

- `/login` - Login page with email/password and OAuth options
- `/register` - Role selection (Developer vs Gamer)
- `/signup?role=developer` - Developer registration with indie verification
- `/signup?role=gamer` - Gamer registration
- `/verify-email?token=xxx` - Email verification page
- `/reset` - Password reset request (UI ready, backend pending)

## Setup Instructions

### 1. Database Setup

Ensure PostgreSQL is running:
```bash
docker compose up -d
```

Run migrations:
```bash
npm run db:migrate
```

### 2. Environment Variables

Create a `.env` file with the following variables:

#### Required
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/shader_house?schema=public"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Optional: Email Verification
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
EMAIL_FROM_NAME="Shader House"
```

#### Optional: OAuth Providers
```env
# Google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Discord
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

See `ENV_SETUP.md` for detailed setup instructions for each provider.

### 3. OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`

#### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Add redirect: `http://localhost:3000/api/auth/callback/discord`

## User Flows

### Email/Password Registration
1. User visits `/register` and selects role (Developer/Gamer)
2. User fills out registration form at `/signup?role=xxx`
3. System creates account with hashed password
4. Verification email sent automatically
5. User clicks link in email
6. Email verified at `/verify-email?token=xxx`
7. User redirected to home page

### OAuth Registration
1. User visits `/login` or `/signup`
2. User clicks "Continue with [Provider]"
3. Redirected to provider's authorization page
4. User authorizes application
5. Redirected back to `/api/auth/callback/[provider]`
6. System creates or links account
7. Email automatically verified
8. User redirected to `/register` to complete profile

### Login
1. User visits `/login`
2. Options:
   - Enter email/password and click "Sign In"
   - Click "Continue with [Provider]" for OAuth
3. System creates session
4. User redirected based on role and profile completion

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **HttpOnly Cookies**: Protection against XSS
- **CSRF Protection**: State parameter for OAuth
- **Token Expiry**: 24h for email, 1h for password reset
- **Secure Cookies**: HTTPS-only in production
- **Email Verification**: Required for full account access

## Email Templates

Beautiful HTML email templates included for:
- Email verification
- Password reset (ready for implementation)

Templates feature:
- Responsive design
- Forest/green theme matching the app
- Clear call-to-action buttons
- Fallback text versions
- Security warnings

## Testing

### Without OAuth/Email (Minimal Setup)
The app works without OAuth and email configuration:
- Users can register with email/password
- Email verification is attempted but won't block usage
- OAuth buttons won't appear

### With Email Only
- Configure email settings in `.env`
- Test email verification flow
- Check spam folder if emails don't arrive

### With OAuth
- Configure at least one OAuth provider
- Test registration and login
- Verify account linking works
- Check profile picture import

## Future Enhancements

### Planned Features
- [ ] Password reset implementation (infrastructure ready)
- [ ] Two-factor authentication (2FA)
- [ ] Social profile linking page
- [ ] Account deletion
- [ ] Email change with verification
- [ ] Login history and security logs

### Infrastructure Ready
- Password reset tokens (model and API ready)
- Email service configured for password reset emails
- Token expiry and cleanup system

## Troubleshooting

### Email Not Sending
- Check EMAIL_* environment variables
- Verify Gmail App Password (not regular password)
- Check spam folder
- Review server logs for errors

### OAuth Not Working
- Verify redirect URIs match exactly
- Check client ID and secret are correct
- Ensure provider app is not in development mode
- Review browser console for errors

### Database Issues
- Ensure PostgreSQL is running: `docker compose ps`
- Run migrations: `npm run db:migrate`
- Check connection string in `.env`
- View data: `npm run db:studio`

## API Response Examples

### Successful Registration
```json
{
  "success": true,
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "GAMER",
    "emailVerified": null
  },
  "message": "Registration successful! Please check your email to verify your account."
}
```

### Successful OAuth Login
```json
{
  "success": true,
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "GAMER",
    "emailVerified": "2025-10-25T19:00:00.000Z",
    "image": "https://..."
  }
}
```

## Code Examples

### Checking if User is Verified
```typescript
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

const session = await getSession();
const user = await prisma.user.findUnique({
  where: { id: session.id }
});

if (!user.emailVerified) {
  // Show verification banner
}
```

### Sending Verification Email
```typescript
import { generateVerificationToken } from '@/lib/auth/tokens';
import { sendVerificationEmail } from '@/lib/email/service';

const token = await generateVerificationToken(userId, 'EMAIL_VERIFICATION');
await sendVerificationEmail(user.email, token.token, user.name);
```

## Support

For issues or questions:
1. Check this documentation
2. Review `ENV_SETUP.md` for configuration help
3. Check server logs for errors
4. Review Prisma Studio for database state: `npm run db:studio`

---

**Last Updated**: October 25, 2025
**Version**: 1.0.0

