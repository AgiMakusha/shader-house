# Security & Bot Protection Setup

This document explains the multi-layered bot protection system implemented in Shader House.

## 🛡️ Security Layers

### 1. **Cloudflare Turnstile** (CAPTCHA Alternative)
- **What it is**: Free, privacy-friendly bot detection from Cloudflare
- **Cost**: Free (1M verifications/month)
- **Setup**: See below

### 2. **Disposable Email Blocking**
- **What it is**: Blocks temporary/disposable email addresses
- **Cost**: Free (uses open-source list)
- **Status**: ✅ Already configured

### 3. **Rate Limiting**
- **What it is**: Limits registration attempts per IP/user
- **Default**: 3 attempts per 15 minutes
- **Cost**: Free (in-memory)
- **Status**: ✅ Already configured

### 4. **Behavioral Signals**
- **What it is**: Tracks user interactions to detect bots
- **Signals tracked**:
  - Mouse movements
  - Keystrokes
  - Time on page
  - Form fill time
  - Clipboard paste detection
  - Rapid submission detection
- **Cost**: Free (DIY implementation)
- **Status**: ✅ Already configured

### 5. **Honeypot Fields** (NEW)
- **What it is**: Invisible form fields that bots fill but humans never see
- **How it works**:
  - Hidden fields with enticing names like "website", "email_confirm"
  - If any honeypot field is filled → definite bot
  - Includes timestamp validation to detect instant form submissions
  - Includes form token validation
- **Cost**: Free (zero dependencies)
- **Status**: ✅ Already configured
- **Files**: `lib/security/honeypot.ts`

### 6. **Browser Fingerprinting** (NEW)
- **What it is**: Collects browser signals to detect headless browsers and automation
- **Signals collected**:
  - Screen properties (size, color depth, pixel ratio)
  - WebGL vendor/renderer (bots often fail this)
  - Canvas fingerprint
  - Audio context fingerprint
  - Installed fonts detection
  - Headless browser indicators (WebDriver, PhantomJS, Selenium, etc.)
  - Plugin count
  - Hardware concurrency
  - Touch support
- **Cost**: Free (client-side JavaScript)
- **Status**: ✅ Already configured
- **Files**: `hooks/useBrowserFingerprint.ts`

### 7. **Enhanced Bot Detection** (NEW)
- **What it is**: Combines all signals into a unified bot score
- **How it works**:
  - Weighted combination of behavioral, browser, honeypot, and request signals
  - Categorizes threats: clean, suspicious, likely_bot, definite_bot
  - Logs all suspicious activity for monitoring
- **Cost**: Free
- **Status**: ✅ Already configured
- **Files**: `lib/security/bot-detection.ts`

---

## 🚀 Quick Setup

### Step 1: Get Cloudflare Turnstile Keys (Free)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Sign up/login (free account)

2. **Navigate to Turnstile**
   - Click "Turnstile" in the left sidebar
   - Or visit: https://dash.cloudflare.com/?to=/:account/turnstile

3. **Create a New Site**
   - Click "Add Site"
   - **Site name**: Shader House
   - **Domain**: `localhost` (for development) or your production domain
   - **Widget Mode**: Managed (recommended)
   - Click "Create"

4. **Copy Your Keys**
   - **Site Key**: Starts with `0x4A...` (public, goes in frontend)
   - **Secret Key**: Starts with `0x4A...` (private, goes in backend)

### Step 2: Add Keys to `.env`

```bash
# Cloudflare Turnstile (Bot Protection)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your_site_key_here"
TURNSTILE_SECRET_KEY="your_secret_key_here"
```

**Important**: 
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is exposed to the browser (safe)
- `TURNSTILE_SECRET_KEY` must be kept private (server-side only)

### Step 3: Restart Your Server

```bash
npm run dev
```

---

## 🔍 How It Works

### Registration Flow with Security

```
User visits /signup
  ↓
1. Behavioral tracking starts (mouse, keyboard, time)
2. Browser fingerprinting collects signals
3. Form timestamp recorded
4. Form token generated
  ↓
5. User fills form (honeypot fields remain hidden/empty)
  ↓
6. User completes Turnstile challenge (if configured)
  ↓
7. User submits form
  ↓
8. Server checks (in order):
   ├─ Rate limit (3 attempts per 15 min)
   ├─ Turnstile token validity
   ├─ Honeypot fields (must be empty)
   ├─ Form timestamp (must be > 3 seconds)
   ├─ Browser fingerprint (headless detection)
   ├─ Behavioral signals (bot score < 50)
   ├─ Combined bot score (< 60)
   ├─ Email not disposable
   └─ Email format valid
  ↓
9. If all pass → Create account
   If any fail → Show error + log suspicious activity
```

### Bot Detection Scoring

The enhanced system calculates a combined bot score from multiple sources:

#### Behavioral Signals (Weight: 30%)
| Signal | Points | Threshold |
|--------|--------|-----------|
| No mouse movements | +30 | 0 movements |
| Few mouse movements | +15 | < 5 movements |
| No keystrokes | +25 | 0 keystrokes |
| Few keystrokes | +10 | < 10 keystrokes |
| Too fast (< 3s on page) | +20 | < 3 seconds |
| Quick page time | +10 | < 5 seconds |
| Fast form fill (< 2s) | +15 | < 2 seconds |
| Clipboard paste | +5 | Detected |
| Rapid submission (< 1s) | +25 | < 1 second |

#### Browser Fingerprint Signals (Weight: 35%)
| Signal | Points | Description |
|--------|--------|-------------|
| WebDriver detected | +50 | Selenium/Puppeteer |
| PhantomJS detected | +50 | PhantomJS browser |
| Selenium detected | +50 | Selenium markers |
| No WebGL | +20 | Missing graphics API |
| Canvas failed | +15 | Can't render canvas |
| Audio failed | +10 | No audio context |
| Invalid screen | +30 | 0x0 resolution |
| Headless resolution | +15 | 800x600 |
| Cookies disabled | +15 | No cookies |
| No plugins | +10 | Empty plugins |
| Few fonts | +15 | < 5 fonts |

#### Honeypot Signals (Weight: 20%)
| Signal | Points | Description |
|--------|--------|-------------|
| Any field filled | +100 | Definite bot |
| Form < 1 second | +100 | Instant submission |
| Form < 3 seconds | +50 | Very fast submission |
| Invalid token | +50 | Token manipulation |

#### Request Signals (Weight: 15%)
| Signal | Points | Description |
|--------|--------|-------------|
| Bot User-Agent | +40 | Contains bot/scrape/etc |
| No User-Agent | +25 | Missing or short |
| No Accept-Language | +15 | Missing header |
| No Accept-Encoding | +10 | Missing header |

**Combined Thresholds**:
- Score < 40: Clean (allowed)
- Score 40-59: Suspicious (allowed with logging)
- Score 60-79: Likely bot (blocked)
- Score ≥ 80: Definite bot (blocked)

---

## 🧪 Testing

### Test Without Turnstile (Development)

If you don't configure Turnstile keys, the system will:
- ✅ Still track behavioral signals
- ✅ Still check disposable emails
- ✅ Still rate limit
- ⚠️ Skip Turnstile verification

### Test With Turnstile

1. Add keys to `.env`
2. Restart server
3. Visit `/signup?role=gamer`
4. You'll see the Turnstile widget (dark theme)
5. Complete the challenge
6. Submit the form

### Test Rate Limiting

Try registering 4 times in a row with different emails:
- First 3 attempts: ✅ Allowed
- 4th attempt: ❌ Blocked with "Too many registration attempts"
- Wait 15 minutes or restart server to reset

### Test Disposable Email Blocking

Try registering with these emails:
- `test@mailinator.com` → ❌ Blocked
- `user@10minutemail.com` → ❌ Blocked
- `real@gmail.com` → ✅ Allowed

### Test Behavioral Detection

To trigger bot detection, try:
1. Load the page
2. Immediately submit (< 1 second)
3. Don't move mouse or type
4. Result: ❌ "Automated registration detected"

---

## 📊 Monitoring

### View Bot Detection Logs

Check your server console for warnings:

```
⚠ Potential bot detected: score=75, ip=192.168.1.1
```

### Rate Limit Status

Rate limits are stored in-memory. For production, consider:
- **Redis**: For distributed rate limiting
- **Upstash**: Serverless Redis (free tier)
- **Vercel KV**: If deploying to Vercel

---

## 🔧 Configuration

### Adjust Rate Limits

Edit `app/api/auth/register/route.ts`:

```typescript
const rateLimit = checkRateLimit(clientId, { 
  maxRequests: 5,        // Allow 5 attempts
  windowMs: 10 * 60 * 1000  // Per 10 minutes
});
```

### Adjust Bot Score Threshold

Edit `lib/security/behavioral-signals.ts`:

```typescript
export function isLikelyBot(signals: BehavioralSignals): boolean {
  const score = calculateBotScore(signals);
  return score >= 60; // Stricter threshold (was 50)
}
```

### Customize Turnstile Theme

Edit `components/security/TurnstileWidget.tsx`:

```typescript
<Turnstile
  siteKey={siteKey}
  options={{
    theme: 'light',  // or 'dark', 'auto'
    size: 'compact', // or 'normal', 'flexible'
  }}
/>
```

---

## 🚨 Troubleshooting

### Turnstile Not Showing

**Problem**: Widget doesn't appear on signup page

**Solutions**:
1. Check `.env` has `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
2. Restart dev server after adding keys
3. Check browser console for errors
4. Verify domain matches Turnstile dashboard settings

### "Security verification failed"

**Problem**: Turnstile token rejected by server

**Solutions**:
1. Check `TURNSTILE_SECRET_KEY` in `.env`
2. Verify keys match your Turnstile site
3. Check server logs for detailed error
4. Ensure domain is allowed in Turnstile settings

### Rate Limit Too Strict

**Problem**: Users blocked after few attempts

**Solutions**:
1. Increase `maxRequests` in rate limit config
2. Increase `windowMs` (time window)
3. For development, restart server to reset limits

### False Positive Bot Detection

**Problem**: Real users flagged as bots

**Solutions**:
1. Lower bot score threshold (50 → 40)
2. Reduce points for specific signals
3. Add user feedback mechanism
4. Review behavioral tracking logic

---

## 🌐 Production Deployment

### Environment Variables

Ensure these are set in production:

```bash
# Required
TURNSTILE_SECRET_KEY="your_production_secret_key"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your_production_site_key"

# Optional (for enhanced security)
RATE_LIMIT_MAX_REQUESTS=3
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
BOT_SCORE_THRESHOLD=50
```

### Cloudflare Turnstile Production Setup

1. Create a new Turnstile site for production
2. Set domain to your production URL (e.g., `shaderhouse.com`)
3. Use production keys (different from localhost keys)
4. Update `.env.production` or deployment platform env vars

### Rate Limiting in Production

For production, use Redis instead of in-memory storage:

```bash
npm install ioredis
```

Then update `lib/security/rate-limit.ts` to use Redis.

---

## 📚 Additional Resources

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Disposable Email Domains List](https://github.com/disposable-email-domains/disposable-email-domains)
- [OWASP Bot Detection Guide](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)

---

## ✅ Security Checklist

- [ ] Cloudflare Turnstile configured
- [ ] Rate limiting tested
- [ ] Disposable email blocking verified
- [ ] Behavioral signals tracking
- [ ] Honeypot fields in signup form
- [ ] Honeypot fields in login form
- [ ] Browser fingerprinting enabled
- [ ] Enhanced bot detection active
- [ ] Production keys separate from dev keys
- [ ] Server logs monitoring bot attempts
- [ ] Rate limit thresholds appropriate
- [ ] Bot score threshold tuned
- [ ] User feedback mechanism for false positives

---

## 🔧 Security Files Reference

### Honeypot System
- `lib/security/honeypot.ts` - Server-side honeypot validation
- Usage in forms: Hidden fields with CSS `position: absolute; left: -9999px`

### Browser Fingerprinting
- `hooks/useBrowserFingerprint.ts` - Client-side signal collection
- Collects: WebGL, Canvas, Audio, Fonts, Headless indicators

### Enhanced Bot Detection
- `lib/security/bot-detection.ts` - Combined detection system
- `detectBot()` - Full detection with all signals
- `quickBotCheck()` - Lightweight check for login/less critical endpoints
- `logBotDetection()` - Monitoring and logging

### Content Spam Detection
- `lib/security/spam-detection.ts` - Analyze user-generated content
- `checkSpam()` - Full spam analysis with scoring
- `checkProfanity()` - Filter inappropriate language
- `isDefiniteSpam()` - Quick check for obvious spam

### Content Rate Limiting
- `lib/security/content-rate-limit.ts` - Per-user posting limits
- `checkContentRateLimit()` - Check if user can post
- `recordContentPost()` - Track post after creation
- `checkCooldown()` - Minimum time between posts
- **Limits:**
  - Threads: 3/hour, 10/day
  - Posts/Comments: 10/15min, 50/hour
  - Reviews: 5/day
  - Reports: 10/day

### Email Verification Guard
- `lib/security/email-verification-guard.ts` - Block unverified users
- `isEmailVerified()` - Check verification status
- `canPerformAction()` - Combined check with grace period

### Audit Logging
- `lib/security/audit-log.ts` - Security event tracking
- `logSecurityEvent()` - Log any security event
- `getSecuritySummary()` - Admin dashboard stats
- `getUserSecurityEvents()` - User-specific events
- **Event Categories:**
  - Authentication (login, logout, session)
  - Registration (success, blocked)
  - Password (changed, reset)
  - 2FA (enabled, disabled, verified)
  - Content (spam flagged, rate limited)
  - Admin actions

### Security Headers
- `next.config.ts` - HTTP security headers
- **Headers Applied:**
  - `X-Frame-Options: DENY` - Prevent clickjacking
  - `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
  - `X-XSS-Protection: 1; mode=block` - XSS filter
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` - Full CSP
  - `Permissions-Policy` - Feature restrictions
  - `Strict-Transport-Security` - HTTPS enforcement (production)

### Updated Forms
- `app/signup/page.tsx` - Full protection (honeypot + fingerprint + behavioral)
- `app/login/page.tsx` - Quick protection (honeypot + behavioral)

### Updated APIs
- `app/api/discussions/threads/route.ts` - Spam + rate limit + email verification
- `app/api/auth/login/route.ts` - Bot detection + audit logging
- `app/api/auth/register/route.ts` - Full bot detection + audit logging

---

**Need Help?** Check the troubleshooting section or review server logs for detailed error messages.

