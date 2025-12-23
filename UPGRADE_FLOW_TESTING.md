# Creator Support Pass Upgrade Flow - Complete Testing Guide

## Overview
This document explains how the Creator Support Pass upgrade works in both **Demo Mode** and **Production Mode**.

---

## Demo Mode (Current - No Stripe Keys)

### User Journey: Free Access → Creator Support Pass

1. **Starting Point**: User is on Free Access plan

2. **Navigate to Upgrade**:
   - Visit `/membership` page
   - OR visit `/profile/gamer/subscription` and click "Upgrade to Creator Support Pass" card

3. **Select Creator Support Pass**:
   - Click "Subscribe Now" button on Creator Support Pass card

4. **Confirmation Modal Appears**:
   - **Style**: Golden themed modal matching platform design
   - **Content**:
     - "Upgrade to Creator Support Pass" heading
     - "$14.99 / month" price display
     - List of benefits:
       - ✓ Free Access subscription
       - ✓ Unlimited access to the entire game library
       - ✓ Achievements & badges
       - ✓ Support indie developers and game community
       - ✓ Game test access
       - ✓ Exclusive Discord community
   - **Buttons**:
     - "Cancel" (grey, closes modal)
     - "Upgrade Now" (golden gradient button)

5. **User Clicks "Upgrade Now"**:
   - Confirmation modal closes
   - Processing modal appears

6. **Processing Modal Shows**:
   - **Style**: Golden themed with spinning loader
   - **Content**: "Processing your subscription..."
   - **Backend Action**:
     - Calls `/api/subscriptions/create-checkout`
     - Cancels any existing active subscriptions
     - Updates user record:
       - `subscriptionTier`: `CREATOR_SUPPORT`
       - `subscriptionStatus`: `ACTIVE`
       - `subscriptionStart`: current timestamp
     - Creates new `Subscription` record:
       - `tier`: `CREATOR_SUPPORT`
       - `status`: `ACTIVE`
       - `priceInCents`: `1499`
       - `currency`: `USD`
     - Returns `{ success: true, message: 'Subscription activated successfully' }`

7. **Success Modal Appears**:
   - **Style**: Golden themed modal
   - **Content**: "Welcome Aboard! 🎉"
   - **Message**: "Your subscription has been activated successfully"
   - **Duration**: Shows for 2 seconds

8. **Auto-Redirect**:
   - After 2 seconds, redirects to `/profile/gamer`
   - Full page refresh to update session
   - User now sees Creator Support Pass badge
   - All premium features are immediately accessible

9. **What User Can Do Now**:
   - ✅ Access all games in library
   - ✅ Support developers
   - ✅ Access exclusive Discord
   - ✅ Game test access
   - ✅ Earn achievements & badges

---

## Production Mode (With Stripe Integration)

### Prerequisites
```env
# .env.local
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_CREATOR_SUPPORT_PRICE_ID=price_xxx
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### User Journey: Free Access → Creator Support Pass

1. **Starting Point**: User is on Free Access plan

2. **Navigate to Upgrade**: Same as Demo Mode

3. **Select Creator Support Pass**: Same as Demo Mode

4. **Confirmation Modal**: Same as Demo Mode

5. **User Clicks "Upgrade Now"**:
   - Confirmation modal closes
   - Processing modal appears briefly

6. **Redirect to Stripe Checkout**:
   - **Backend Action**:
     - Calls `/api/subscriptions/create-checkout`
     - Creates or retrieves Stripe Customer record
     - Saves `stripeCustomerId` to user record
     - Creates Stripe Checkout Session:
       - Product: Creator Support Pass
       - Price: $14.99/month
       - Mode: subscription
       - Success URL: `{base_url}/membership?success=true`
       - Cancel URL: `{base_url}/membership`
     - Returns `{ url: stripeCheckoutUrl }`
   - **Frontend Action**:
     - Closes processing modal
     - Redirects to Stripe hosted checkout page

7. **User on Stripe Checkout Page**:
   - Sees Creator Support Pass details
   - Price: $14.99/month
   - Secure payment form
   - Enter card details (production cards)
   - Click "Subscribe"

8. **Stripe Processes Payment**:
   - Validates card
   - Creates subscription in Stripe
   - Generates Stripe Subscription ID
   - Redirects user back to: `/membership?success=true`

9. **Stripe Webhook Triggered**:
   - Event: `checkout.session.completed`
   - Sent to: `/api/subscriptions/webhook`
   - **Webhook Handler**:
     - Verifies Stripe signature
     - Extracts `userId` from session metadata
     - Updates user record:
       - `subscriptionTier`: `CREATOR_SUPPORT`
       - `subscriptionStatus`: `ACTIVE`
       - `subscriptionStart`: current timestamp
       - `stripeSubscriptionId`: from Stripe event
     - Creates new `Subscription` record
     - Returns 200 OK to Stripe

10. **User Redirected Back**:
    - Lands on `/membership?success=true`
    - Success modal appears (golden themed)
    - Message: "Welcome Aboard! 🎉"
    - Auto-redirects to `/profile/gamer` after 2.5 seconds
    - Full page refresh updates session
    - User sees Creator Support Pass badge

11. **What User Can Do Now**:
    - ✅ All premium features unlocked
    - ✅ Subscription managed in Stripe
    - ✅ Automatic monthly billing
    - ✅ Email receipts from Stripe

12. **What Shows in Stripe Dashboard**:
    - New active subscription
    - Customer record
    - Payment history
    - Next billing date
    - Revenue tracking

---

## Key Differences: Demo vs Production

| Aspect | Demo Mode | Production Mode |
|--------|-----------|----------------|
| Payment Processing | None | Stripe Checkout |
| Activation Speed | Instant | 2-3 seconds (webhook) |
| User Redirect | None (modal only) | To Stripe, then back |
| Database Update | Immediate | Via webhook |
| Stripe Dashboard | N/A | Full tracking |
| Monthly Billing | N/A | Automatic |
| Payment Methods | N/A | Card, Apple Pay, Google Pay |
| Invoices | N/A | Auto-generated by Stripe |
| Failed Payments | N/A | Auto-retry, email notifications |

---

## Testing Checklist

### Demo Mode Testing ✅
- [ ] Visit `/membership` as Free user
- [ ] Click "Subscribe Now" on Creator Support Pass
- [ ] Verify golden confirmation modal appears
- [ ] Click "Upgrade Now"
- [ ] Verify golden processing modal shows
- [ ] Verify golden success modal appears
- [ ] Verify auto-redirect to `/profile/gamer`
- [ ] Verify Creator Support Pass badge appears
- [ ] Verify subscription shows as "Active" in settings
- [ ] Test premium feature access (e.g., support developers)
- [ ] Test downgrade back to Free Access
- [ ] Verify can upgrade again

### Production Mode Testing (After Stripe Setup)
- [ ] Add Stripe keys to `.env.local`
- [ ] Restart dev server
- [ ] Repeat demo mode flow
- [ ] Verify redirects to Stripe Checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete payment on Stripe
- [ ] Verify redirect back to `/membership?success=true`
- [ ] Check webhook received in Stripe dashboard
- [ ] Verify subscription shows as "Active" in Stripe
- [ ] Verify user has Creator Support Pass in app
- [ ] Test accessing premium features
- [ ] Check Stripe dashboard for subscription details
- [ ] Verify invoice generated
- [ ] Test cancellation flow
- [ ] Verify subscription shows "Cancels on [date]"
- [ ] Wait for period end (or use Stripe CLI to simulate)
- [ ] Verify user downgraded to FREE automatically

---

## Troubleshooting

### User Not Seeing Premium Features After Upgrade

**Demo Mode:**
1. Check browser console for errors
2. Verify `/api/subscriptions/create-checkout` returned success
3. Check database: `user.subscriptionTier` should be `CREATOR_SUPPORT`
4. Hard refresh the page (Cmd+Shift+R)
5. Clear cookies and re-login

**Production Mode:**
1. Check Stripe dashboard for payment status
2. Verify webhook was received (Stripe Dashboard → Developers → Webhooks)
3. Check webhook logs for errors
4. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
5. Check database: `user.stripeSubscriptionId` should exist
6. If webhook failed, manually trigger it in Stripe dashboard

### Redirect Loop After Upgrade
- Clear browser cookies
- Check middleware role checks
- Verify session token has correct role

### Modal Doesn't Close After Upgrade
- Check browser console for JavaScript errors
- Verify `router.push` is working
- Try hard refresh

---

## Code References

### Key Files
- **Upgrade API**: `/app/api/subscriptions/create-checkout/route.ts`
- **Webhook Handler**: `/app/api/subscriptions/webhook/route.ts`
- **Membership Page**: `/app/membership/page.tsx`
- **Subscription Page**: `/app/profile/gamer/subscription/page.tsx`
- **Pricing Card**: `/components/subscriptions/PricingCard.tsx`

### Database Schema
```prisma
model User {
  subscriptionTier   String?  @default("FREE")
  subscriptionStatus String?  @default("ACTIVE")
  subscriptionStart  DateTime?
  stripeCustomerId   String?
  stripeSubscriptionId String?
}

model Subscription {
  tier         String    // "FREE" | "CREATOR_SUPPORT"
  status       String    // "ACTIVE" | "CANCELED" | "PAST_DUE"
  priceInCents Int       // 0 | 1499
  currency     String    // "USD"
  startDate    DateTime
  endDate      DateTime?
}
```

---

## Success Criteria

✅ **Demo Mode Works**: User can upgrade without Stripe keys
✅ **Production Mode Ready**: Code handles Stripe redirect flow
✅ **Webhooks Integrated**: Subscription activates via webhook
✅ **UI Consistent**: All modals match platform design (golden theme)
✅ **Error Handling**: Graceful failures with user feedback
✅ **Session Management**: User session updates after upgrade
✅ **Database Sync**: User tier and subscription records accurate
✅ **Stripe Dashboard**: Full visibility into subscriptions and revenue

---

## Next Steps

1. **Add Stripe Keys**: Set up production Stripe account
2. **Create Product**: Create "Creator Support Pass" in Stripe
3. **Configure Webhook**: Point to `{domain}/api/subscriptions/webhook`
4. **Test with Test Mode**: Use Stripe test mode first
5. **Go Live**: Switch to live mode when ready
6. **Monitor**: Watch Stripe dashboard for activity







