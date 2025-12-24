# Notification System Debugging Guide

## Issue: Notifications Not Appearing

If notifications aren't showing up after triggering events, follow these debugging steps:

### 1. Check Server Logs

When you trigger a notification (e.g., join beta test), check the server console for:
- `🔔 Attempting to send...` - Confirms the trigger was called
- `✅ Notification created: ...` - Confirms notification was saved to database
- `⏭️  Notification skipped: ...` - Shows notification was skipped due to preferences
- `❌ Error creating notification: ...` - Shows an error occurred

### 2. Check User Notification Preferences

The notification system respects user preferences. Check if the user has:
- `inAppNotifications` enabled (default: true)
- `notifyBetaAccess` enabled (default: true)
- `notifyFeedbackResponse` enabled (default: true)

**To check preferences:**
```sql
SELECT id, email, inAppNotifications, notifyBetaAccess, notifyFeedbackResponse 
FROM users 
WHERE id = 'your-user-id';
```

**To enable all notifications for a user:**
```sql
UPDATE users 
SET 
  inAppNotifications = true,
  notifyBetaAccess = true,
  notifyFeedbackResponse = true,
  notifyGameUpdates = true,
  notifyAchievements = true,
  notifySubscription = true
WHERE id = 'your-user-id';
```

### 3. Test Notification Creation Directly

Use the test endpoint to create a notification:

```bash
# First, get your session token or use browser dev tools
# Then POST to:
POST /api/notifications/test
{
  "type": "BETA_ACCESS_GRANTED",
  "title": "Test Notification",
  "message": "Testing notification system"
}
```

### 4. Check Database

Verify notifications are being created:

```sql
SELECT * FROM notifications 
WHERE "userId" = 'your-user-id' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### 5. Check API Response

When joining a beta test, check the browser Network tab:
- Look for the `/api/beta/join` request
- Check the response - should be successful
- Check server console for notification logs

### 6. Common Issues

#### Issue: Preferences are NULL
**Solution:** The code now defaults to `true` if preferences are null, but you can also update existing users:
```sql
UPDATE users 
SET 
  emailNotifications = COALESCE(emailNotifications, true),
  inAppNotifications = COALESCE(inAppNotifications, true),
  notifyBetaAccess = COALESCE(notifyBetaAccess, true),
  notifyFeedbackResponse = COALESCE(notifyFeedbackResponse, true),
  notifyGameUpdates = COALESCE(notifyGameUpdates, true),
  notifyAchievements = COALESCE(notifyAchievements, true),
  notifySubscription = COALESCE(notifySubscription, true)
WHERE emailNotifications IS NULL 
   OR inAppNotifications IS NULL;
```

#### Issue: Notification Created But Not Showing
**Possible causes:**
1. NotificationCenter not refreshing - try closing and reopening the dropdown
2. Browser cache - hard refresh (Cmd+Shift+R)
3. API returning empty array - check `/api/notifications` response

#### Issue: Error in Notification Service
**Check:**
- Database connection is working
- Notification table exists
- User exists in database
- All required fields are present

### 7. Manual Database Check

```sql
-- Check if notification was created
SELECT id, type, title, "isRead", "createdAt" 
FROM notifications 
WHERE "userId" = 'your-user-id' 
ORDER BY "createdAt" DESC;

-- Check user preferences
SELECT 
  email,
  "inAppNotifications",
  "notifyBetaAccess",
  "notifyFeedbackResponse"
FROM users 
WHERE id = 'your-user-id';
```

### 8. Enable Debug Logging

The notification service now includes detailed logging:
- `🔔` = Notification trigger attempted
- `✅` = Notification created successfully
- `⏭️` = Notification skipped (preferences disabled)
- `❌` = Error occurred

Check your server console (where `npm run dev` is running) for these logs.

### 9. Test Flow

1. **Beta Access Test:**
   - Join a beta test as a Pro subscriber
   - Check server logs for: `🔔 Attempting to send beta access notification`
   - Check for: `✅ Notification created: BETA_ACCESS_GRANTED`
   - Open notification center - should see notification

2. **Feedback Response Test:**
   - Submit feedback as a beta tester
   - As developer, update feedback status to RESOLVED
   - Check server logs for: `🔔 Attempting to send feedback response notification`
   - Check for: `✅ Notification created: FEEDBACK_RESPONSE`
   - Open notification center - should see notification

### 10. Quick Fix: Force Enable All Notifications

If you want to test without checking preferences, temporarily modify `lib/notifications/service.ts`:

```typescript
// Temporarily force all notifications
let shouldNotify = true; // Instead of checking preferences
let shouldEmail = false; // Disable email for testing
```

**Remember to revert this after testing!**

---

## Fixed Issues

✅ **Null Preference Handling:** Now defaults to `true` if preferences are null/undefined
✅ **Added Logging:** Detailed console logs for debugging
✅ **Both Feedback Endpoints:** Added notification trigger to both feedback update endpoints
✅ **Error Handling:** Better error messages and logging

---

## Next Steps

1. Check server console logs when triggering notifications
2. Verify user preferences in database
3. Test with the `/api/notifications/test` endpoint
4. Check if notifications exist in database even if not showing in UI



