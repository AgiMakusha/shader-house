# Quick OAuth Setup Guide

## Step 1: Open Your .env File

Open the `.env` file in your project root:
```bash
cd "/Users/agimakusha/Desktop/GAME MVP/shader-house"
open .env
```

Or create it if it doesn't exist:
```bash
touch .env
```

## Step 2: Add OAuth Credentials

Add these lines to your `.env` file:

```env
# Google OAuth (Get from: https://console.cloud.google.com/)
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

# GitHub OAuth (Get from: https://github.com/settings/developers)
GITHUB_CLIENT_ID="your-github-client-id-here"
GITHUB_CLIENT_SECRET="your-github-client-secret-here"

# Discord OAuth (Get from: https://discord.com/developers/applications)
DISCORD_CLIENT_ID="your-discord-client-id-here"
DISCORD_CLIENT_SECRET="your-discord-client-secret-here"
```

## Step 3: Get Your Credentials

### 🔵 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen if prompted:
   - User Type: External
   - App name: Shader House
   - Support email: your email
   - Scopes: email, profile, openid
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: Shader House
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - (Add production URL later)
7. Copy the Client ID and Client Secret

### ⚫ GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: `Shader House`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID
6. Click "Generate a new client secret"
7. Copy the Client Secret (you won't see it again!)

### 🟣 Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "Shader House" and accept ToS
4. Go to "OAuth2" section in the left sidebar
5. Copy the Client ID
6. Click "Reset Secret" to generate a new Client Secret
7. Copy the Client Secret
8. Add Redirects:
   - Click "Add Redirect"
   - Enter: `http://localhost:3000/api/auth/callback/discord`
   - Click "Save Changes"

## Step 4: Update Your .env File

Replace the placeholder values with your actual credentials:

```env
# Example (use your real values!)
GOOGLE_CLIENT_ID="123456789-abcdefghijk.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnop"

GITHUB_CLIENT_ID="Iv1.a1b2c3d4e5f6g7h8"
GITHUB_CLIENT_SECRET="abcdef1234567890abcdef1234567890abcdef12"

DISCORD_CLIENT_ID="1234567890123456789"
DISCORD_CLIENT_SECRET="abcdefghijklmnopqrstuvwxyz123456"
```

## Step 5: Restart Your Dev Server

After adding the credentials, restart your Next.js dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 6: Test OAuth Login

1. Go to `http://localhost:3000/login`
2. You should see three OAuth buttons:
   - Continue with Google
   - Continue with GitHub
   - Continue with Discord
3. Click any button to test
4. You'll be redirected to the provider's login page
5. After authorizing, you'll be redirected back and logged in!

## Troubleshooting

### "OAuth is not configured" Alert
- Make sure you've added the credentials to `.env`
- Restart the dev server after adding credentials
- Check that there are no typos in the variable names

### Redirect URI Mismatch Error
- Ensure the redirect URI in the provider settings exactly matches:
  - Google: `http://localhost:3000/api/auth/callback/google`
  - GitHub: `http://localhost:3000/api/auth/callback/github`
  - Discord: `http://localhost:3000/api/auth/callback/discord`
- No trailing slashes!
- Use `http://` not `https://` for localhost

### "Invalid Client" Error
- Double-check your Client ID and Client Secret
- Make sure there are no extra spaces or quotes
- Regenerate the secret if needed

### Still Not Working?
- Check the browser console for errors
- Check the server terminal for error messages
- Verify the OAuth app is not in "development mode" (some providers)
- Make sure the OAuth app is enabled

## Quick Test (Without Setting Up OAuth)

The buttons will still appear even without credentials! When clicked, they'll show a helpful message explaining what's needed. This lets you see the UI immediately.

## Production Setup

When deploying to production:

1. Update redirect URIs in each provider:
   - Replace `http://localhost:3000` with your production domain
   - Example: `https://shaderhouse.com/api/auth/callback/google`

2. Update `.env` in production:
   ```env
   NEXT_PUBLIC_APP_URL="https://your-production-domain.com"
   ```

3. Keep your Client Secrets secure:
   - Never commit them to Git
   - Use environment variables in your hosting platform
   - Rotate secrets if they're ever exposed

---

**Need Help?** Check `ENV_SETUP.md` for more detailed instructions or `AUTHENTICATION.md` for the complete authentication documentation.

