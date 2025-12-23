# Environment Variables Setup

This document describes all environment variables needed for the application.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

### Database
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/shader_house?schema=public"
```

### Auth Secret
Generate a secure secret key (minimum 32 characters):
```bash
openssl rand -base64 32
```

```env
AUTH_SECRET="your-generated-secret-key"
```

### App URL
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Optional: Email Verification

To enable email verification, add these variables:

### Email Configuration
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
EMAIL_FROM_NAME="Shader House"
```

### Gmail Setup
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Use the generated password as `EMAIL_PASSWORD`

## Optional: OAuth Providers

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 section
4. Add redirect: `http://localhost:3000/api/auth/callback/discord`

```env
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

## Production Setup

For production, update:
- `NEXT_PUBLIC_APP_URL` to your production domain
- `EMAIL_SECURE` to `"true"` if using port 465
- OAuth redirect URIs to use your production domain
- Ensure all secrets are properly secured and not committed to version control

## Testing Without OAuth/Email

The application will work without OAuth and email configuration:
- Users can still register with email/password
- Email verification will be skipped (but recommended for production)
- OAuth buttons will not appear if credentials are not configured

