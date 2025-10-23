# Authentication System

This directory contains the authentication system for Shader House.

## Features

- ✅ **Email/Password Authentication** - Secure credential-based auth
- ✅ **Password Validation** - Strong password requirements with real-time strength indicator
- ✅ **Email Validation** - RFC-compliant email validation using Zod
- ✅ **Session Management** - JWT-based sessions with configurable expiry
- ✅ **"Remember Me" Feature** - Extended sessions (30 days) vs short sessions (24 hours)
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **Role-Based Access** - Developer vs Gamer user roles
- ✅ **Password Hashing** - bcrypt with salt rounds = 10

## Environment Variables

Create a `.env.local` file in the project root with:

```env
# Required: Secret key for JWT signing (minimum 32 characters)
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-secret-key-change-in-production-min-32-chars-long
```

## API Routes

### `POST /api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "rememberMe": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "developer"
  }
}
```

### `POST /api/auth/register`
Create a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "role": "developer"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "developer"
  }
}
```

### `POST /api/auth/logout`
Destroy the current session.

**Response:**
```json
{
  "success": true
}
```

### `GET /api/auth/session`
Get the current session.

**Response (Authenticated):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "developer",
    "createdAt": 1234567890
  },
  "expiresAt": 1234567890
}
```

**Response (Not Authenticated):**
```json
{
  "user": null
}
```

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one lowercase letter (a-z)
- At least one uppercase letter (A-Z)
- At least one number (0-9)
- At least one special character (!@#$%^&*...)

## Test Account

For development/testing, a test account is automatically created:
- **Email:** test@shaderhouse.com
- **Password:** Password123!
- **Role:** developer

**⚠️ IMPORTANT:** Remove this test account before deploying to production!

## Connecting to a Real Database

The current implementation uses in-memory storage (data is lost on server restart). To connect a real database:

### Option 1: PostgreSQL with Prisma

1. Install Prisma:
```bash
npm install @prisma/client
npm install -D prisma
```

2. Initialize Prisma:
```bash
npx prisma init
```

3. Define your schema in `prisma/schema.prisma`:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      String   // "developer" | "gamer"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

4. Update API routes to use Prisma instead of the `users` Map.

### Option 2: MongoDB

1. Install Mongoose:
```bash
npm install mongoose
```

2. Create a User model and update API routes accordingly.

### Option 3: Supabase

1. Install Supabase client:
```bash
npm install @supabase/supabase-js
```

2. Update API routes to use Supabase Auth and Database.

## Security Considerations

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use a strong `AUTH_SECRET`** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS in production** - Sessions cookies are set to `secure: true` in production
4. **Rate limiting** - Consider adding rate limiting to auth routes
5. **CSRF protection** - Next.js provides built-in CSRF protection for API routes
6. **SQL injection** - Use parameterized queries or ORMs (Prisma/Mongoose)

## Future Enhancements

- [ ] Email verification
- [ ] Password reset flow (currently stubbed in `/reset`)
- [ ] Two-factor authentication (2FA)
- [ ] OAuth providers (Google, GitHub, Discord)
- [ ] Account deletion
- [ ] Session refresh
- [ ] Audit logs

