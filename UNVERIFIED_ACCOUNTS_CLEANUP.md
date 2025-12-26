# Unverified Accounts Cleanup Policy

## Overview

This document outlines the policy and procedures for handling unverified accounts in the Shader House platform. Unverified accounts are accounts that were created but never verified their email address.

## Problem Statement

When users sign up with fake or invalid email addresses, accounts are created in the database but never verified. These accounts:
- Take up database space
- Clutter user statistics
- May be used for spam or abuse
- Never become active users

## Cleanup Policy

### Automatic Cleanup

**Default Policy:**
- Unverified accounts older than **7 days** are eligible for deletion
- Only accounts **without any activity** are deleted
- Accounts with games, purchases, ratings, or favorites are **protected** from deletion

### What Gets Deleted

Accounts are deleted if they meet ALL of these criteria:
1. ✅ `emailVerified` is `null` (never verified)
2. ✅ Account created more than 7 days ago (configurable)
3. ✅ No games created
4. ✅ No purchases made
5. ✅ No ratings given
6. ✅ No favorites added

### What Gets Protected

Accounts are **NOT deleted** if they have:
- Games created (even if unpublished)
- Purchases made
- Ratings submitted
- Favorites added
- Any other activity that indicates legitimate use

## Manual Cleanup

### Using the Cleanup Script

```bash
# Clean up accounts older than 7 days (default)
npx tsx scripts/cleanup-unverified-accounts.ts

# Clean up accounts older than 14 days
npx tsx scripts/cleanup-unverified-accounts.ts 14

# Clean up accounts older than 30 days
npx tsx scripts/cleanup-unverified-accounts.ts 30
```

### Using the Shell Script

```bash
# Default (7 days)
./scripts/cleanup-unverified-accounts.sh

# Custom days
./scripts/cleanup-unverified-accounts.sh 14
```

## Scheduled Cleanup (Recommended)

### Using Cron (Linux/Mac)

Add to crontab to run daily at 2 AM:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path as needed)
0 2 * * * cd /path/to/shader-house && npx tsx scripts/cleanup-unverified-accounts.ts >> logs/cleanup.log 2>&1
```

### Using Systemd Timer (Linux)

Create `/etc/systemd/system/shader-house-cleanup.service`:

```ini
[Unit]
Description=Shader House Unverified Accounts Cleanup
After=network.target

[Service]
Type=oneshot
User=your-user
WorkingDirectory=/path/to/shader-house
ExecStart=/usr/bin/npx tsx scripts/cleanup-unverified-accounts.ts
```

Create `/etc/systemd/system/shader-house-cleanup.timer`:

```ini
[Unit]
Description=Daily cleanup of unverified accounts
Requires=shader-house-cleanup.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:
```bash
sudo systemctl enable shader-house-cleanup.timer
sudo systemctl start shader-house-cleanup.timer
```

### Using GitHub Actions (CI/CD)

Add to `.github/workflows/cleanup.yml`:

```yaml
name: Cleanup Unverified Accounts

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx tsx scripts/cleanup-unverified-accounts.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Monitoring

### Admin API Endpoint

View unverified accounts statistics:

```bash
GET /api/admin/unverified-accounts?days=7
```

**Response:**
```json
{
  "summary": {
    "totalUnverified": 42,
    "accountsWithActivity": 5,
    "safeToDelete": 37,
    "cutoffDate": "2025-12-19T00:00:00.000Z",
    "days": 7
  },
  "accounts": [...]
}
```

### Database Query

Check unverified accounts manually:

```sql
-- Count unverified accounts older than 7 days
SELECT COUNT(*) 
FROM "User" 
WHERE "emailVerified" IS NULL 
  AND "createdAt" < NOW() - INTERVAL '7 days';

-- List unverified accounts with activity
SELECT u.id, u.email, u."createdAt",
       COUNT(DISTINCT g.id) as games,
       COUNT(DISTINCT p.id) as purchases
FROM "User" u
LEFT JOIN "Game" g ON g."developerId" = u.id
LEFT JOIN "Purchase" p ON p."userId" = u.id
WHERE u."emailVerified" IS NULL
  AND u."createdAt" < NOW() - INTERVAL '7 days'
GROUP BY u.id, u.email, u."createdAt"
HAVING COUNT(DISTINCT g.id) > 0 OR COUNT(DISTINCT p.id) > 0;
```

## Safety Features

### Protection Mechanisms

1. **Activity Check**: Accounts with any activity are never deleted
2. **Dry Run Option**: Script shows what will be deleted before doing it
3. **Detailed Logging**: All deletions are logged
4. **Error Handling**: Errors don't stop the entire cleanup process
5. **Cascading Deletes**: Prisma handles related data cleanup automatically

### Before Production

1. ✅ Test the script on a development database first
2. ✅ Review the accounts that will be deleted
3. ✅ Set up monitoring/alerts
4. ✅ Document the cleanup schedule
5. ✅ Have a backup/restore plan

## Best Practices

1. **Regular Cleanup**: Run cleanup daily or weekly
2. **Monitor Statistics**: Check unverified account counts regularly
3. **Adjust Threshold**: Consider changing from 7 days to 14 or 30 days
4. **Log Everything**: Keep logs of all cleanup operations
5. **Review Protected Accounts**: Periodically review accounts with activity that aren't verified

## Related Files

- `scripts/cleanup-unverified-accounts.ts` - Main cleanup script
- `scripts/cleanup-unverified-accounts.sh` - Shell wrapper
- `app/api/admin/unverified-accounts/route.ts` - Admin API endpoint
- `middleware.ts` - Blocks unverified users from platform
- `EMAIL_SECURITY_IMPROVEMENTS.md` - Email verification system docs

## Questions?

- Why 7 days? Gives users time to verify while cleaning up obvious fake accounts
- Can I recover deleted accounts? No, ensure backups are in place
- What about OAuth users? OAuth users are auto-verified, so not affected
- Can I change the threshold? Yes, adjust the `days` parameter

---

**Last Updated:** December 26, 2025
**Version:** 1.0

