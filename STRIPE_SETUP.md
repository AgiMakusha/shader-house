# Stripe Integration Setup Guide

## Current Status
- ✅ **Demo Mode**: Fully functional without Stripe (for testing)
- ✅ **Production Ready**: Code is ready, just needs Stripe API keys and Connect

## Revenue Model

| Revenue Source | Developer Gets | Platform Gets |
|----------------|----------------|---------------|
| **Direct Game Sales** | **85%** | **15%** |
| **Tips/Donations** | **80%** | **20%** |
| **Subscriptions** | Split (after 15% fee) | **15%** |
| **Game Publishing** | — | **$50 one-time** |

## Environment Variables Required

Add these to your `.env.local` file for production:

```env
# Stripe API Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...  # or sk_test_... for testing
STRIPE_PUBLISHABLE_KEY=pk_live_...  # or pk_test_... for testing

# Stripe Product/Price IDs (create in Stripe Dashboard)
STRIPE_CREATOR_SUPPORT_PRICE_ID=price_...  # Price ID for $14.99/month Creator Support Pass
STRIPE_PUBLISHING_FEE_PRICE_ID=price_...   # Price ID for $50 game publishing fee

# Stripe Webhook Secrets (get from Stripe Dashboard > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...            # For subscription webhooks
STRIPE_GAME_WEBHOOK_SECRET=whsec_...       # For game purchase webhooks

# Stripe Connect (for developer payouts)
STRIPE_CONNECT_CLIENT_ID=ca_...            # For Connect OAuth

# App URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com  # or http://localhost:3000 for testing
```

## Setup Steps

### 1. Create Stripe Account
- Sign up at https://stripe.com
- Complete account verification

### 2. Create Product in Stripe Dashboard
1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. **Name**: Creator Support Pass
4. **Description**: Support indie developers and get unlimited access
5. **Pricing**: 
   - Recurring: Monthly
   - Price: $14.99 USD
6. Save and copy the **Price ID** (starts with `price_...`)

### 3. Get API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Secret Key** (sk_...) → Add to `.env.local`
3. Copy **Publishable Key** (pk_...) → Add to `.env.local`

### 4. Set Up Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **URL**: `https://yourdomain.com/api/subscriptions/webhook`
4. **Events to listen for**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Save and copy the **Signing Secret** (whsec_...) → Add to `.env.local`

### 5. Test with Stripe Test Mode
1. Use test API keys (sk_test_... and pk_test_...)
2. Use test card: `4242 4242 4242 4242`
3. Any future date for expiry
4. Any 3-digit CVC

## How It Works

### Subscription Flow

#### Upgrade to Creator Support Pass:

**User Experience:**
1. User clicks "Subscribe Now" on Creator Support Pass card
2. **Styled golden confirmation modal** appears showing:
   - Price: $14.99/month
   - List of benefits
   - "Cancel" and "Upgrade Now" buttons
3. User clicks "Upgrade Now"
4. **Styled golden processing modal** appears with spinning loader
5. Backend processes request:

**Demo Mode (No Stripe):**
- Immediately activates subscription in database
- Shows **golden success modal** with 🎉
- Auto-redirects to `/profile/gamer` after 2 seconds
- User has instant access to all Creator Support Pass features

**Production Mode (With Stripe):**
- Creates/retrieves Stripe Customer record
- Creates Stripe Checkout Session
- Redirects to Stripe hosted payment page
- User enters payment details on Stripe
- After payment → Stripe redirects to `/membership?success=true`
- Stripe webhook (`checkout.session.completed`) activates subscription in database
- **Golden success modal** appears
- Auto-redirects to `/profile/gamer` after 2.5 seconds
- User has access to all Creator Support Pass features

**What Shows in Stripe Dashboard (Production):**
- New subscription appears under **Subscriptions**
- Status: "Active"
- Plan: Creator Support Pass
- Amount: $14.99/month
- Next payment date shown
- Customer record created/linked
- All payment history tracked

#### Downgrade to Free Access:

**User Experience:**
1. User clicks "Downgrade to Free" on Free Access card
2. **Styled red confirmation modal** appears warning about feature loss
3. User clicks "Downgrade" to confirm
4. **Styled green processing modal** appears with spinning loader
5. Backend processes request:

**Demo Mode (No Stripe):**
- Immediately cancels subscription in database
- Updates user to FREE tier
- Shows **green success modal** with ✓
- Auto-redirects to `/profile/gamer` after 2 seconds
- User immediately loses premium features

**Production Mode (With Stripe):**
- Fetches user's `stripeSubscriptionId` from database
- Calls Stripe API: `stripe.subscriptions.update(id, { cancel_at_period_end: true })`
- Updates local database to mark as CANCELED
- Shows **green success modal**
- User **retains access** until end of current billing period
- At period end:
  - Stripe sends `customer.subscription.deleted` webhook
  - Webhook handler updates database to FREE tier
  - User automatically loses premium features

**What Shows in Stripe Dashboard (Production):**
- Subscription status changes to "Active" with "Cancels on [date]"
- **Cancel at period end**: ✅ Enabled
- Next payment: None (cancelled)
- User continues to appear in active subscribers until period ends
- After period ends → Status changes to "Canceled"
- Full audit trail of cancellation maintained

### Webhook Synchronization (Production Only)

Stripe webhooks keep your database in sync automatically:

- **`checkout.session.completed`**: Activates subscription when payment succeeds
- **`customer.subscription.updated`**: Updates status (active, past_due, etc.)
- **`customer.subscription.deleted`**: Downgrades user to FREE tier
- **`invoice.payment_failed`**: Marks subscription as PAST_DUE

## Testing Checklist

### Demo Mode (Current - No Stripe)
- ✅ Upgrade to Creator Support Pass
- ✅ Access premium features
- ✅ Downgrade to Free Access
- ✅ Lose premium features
- ✅ Styled modals for all actions

### Production Mode (With Stripe)
- [ ] Add Stripe API keys to `.env.local`
- [ ] Create Creator Support Pass product in Stripe
- [ ] Test upgrade with test card
- [ ] Verify webhook receives events
- [ ] Test cancellation
- [ ] Verify user retains access until period end
- [ ] Test failed payment scenario

---

## Game Purchase Flow

### How Game Purchases Work

1. **Gamer clicks "Buy" on a game**
2. **API creates Stripe Checkout Session** with Connect split:
   - `application_fee_amount`: 15% to platform
   - `transfer_data.destination`: Developer's Stripe account (85%)
3. **Gamer completes payment on Stripe**
4. **Webhook confirms purchase** → Game added to library

### API Endpoint
```
POST /api/games/[id]/checkout
```

### Response (Demo Mode)
```json
{
  "success": true,
  "demo": true,
  "message": "Purchase successful!",
  "breakdown": {
    "totalPaid": "$9.99",
    "developerReceives": "$8.49",
    "platformFee": "$1.50"
  }
}
```

### Response (Production Mode)
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```

---

## Stripe Connect (Developer Payouts)

### Setup for Developers

1. **Developer creates Connect account**
   ```
   POST /api/payments/connect/create
   ```

2. **Developer completes Stripe onboarding**
   ```
   GET /api/payments/connect/onboarding
   → Returns onboarding URL
   ```

3. **Check account status**
   ```
   GET /api/payments/connect/status
   → Returns { hasAccount, status, payoutEnabled }
   ```

4. **Access Stripe Dashboard**
   ```
   GET /api/payments/connect/dashboard
   → Returns login link to Express Dashboard
   ```

### Account Statuses
- `pending` - Account created, onboarding not complete
- `active` - Fully onboarded, can receive payments
- `restricted` - Missing information, limited functionality
- `rejected` - Account rejected by Stripe

---

## Publishing Fee ($50)

### How It Works

Before a game can go live on the marketplace, developers must pay a one-time $50 publishing fee.

### API Endpoint
```
POST /api/payments/publishing-fee
Body: { "gameId": "..." }
```

### Response (Demo Mode)
```json
{
  "success": true,
  "demo": true,
  "message": "Game published successfully!"
}
```

### Response (Production Mode)
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/...",
  "fee": "$50.00"
}
```

---

## Tips/Donations

### How Tips Work

Gamers can tip developers directly. Revenue split:
- Developer: 80%
- Platform: 20%

### API Endpoint
```
POST /api/payments/tip
Body: {
  "developerId": "...",
  "amount": 10.00,      // In dollars
  "message": "Great game!"
}
```

### Response (Demo Mode)
```json
{
  "success": true,
  "demo": true,
  "breakdown": {
    "totalPaid": "$10.00",
    "developerReceives": "$8.00",
    "platformFee": "$2.00"
  }
}
```

### Get Tips Received
```
GET /api/payments/tip?developerId=...&limit=10
```

---

## Webhook Endpoints

### Subscriptions Webhook
```
POST /api/subscriptions/webhook
Events: checkout.session.completed, customer.subscription.*, invoice.payment_failed
```

### Payments Webhook (Games, Tips, Publishing)
```
POST /api/payments/webhook
Events: checkout.session.completed, charge.refunded, account.updated
```

### Stripe Dashboard Webhook Setup

Create **two webhooks** in Stripe Dashboard:

1. **Subscriptions Webhook**
   - URL: `https://yourdomain.com/api/subscriptions/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Secret → `STRIPE_WEBHOOK_SECRET`

2. **Payments Webhook**
   - URL: `https://yourdomain.com/api/payments/webhook`
   - Events: `checkout.session.completed`, `charge.refunded`, `account.updated`
   - Secret → `STRIPE_PAYMENTS_WEBHOOK_SECRET`

---

## Complete Environment Variables

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_...

# Stripe Webhook Secrets
STRIPE_WEBHOOK_SECRET=whsec_...           # Subscriptions
STRIPE_PAYMENTS_WEBHOOK_SECRET=whsec_...  # Game purchases, tips, publishing

# Stripe Product IDs (optional - for subscriptions)
STRIPE_CREATOR_SUPPORT_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Security Notes

⚠️ **Never commit `.env.local` to git**
⚠️ **Use test keys for development**
⚠️ **Validate webhook signatures in production**
⚠️ **Keep webhook secret secure**

---

## Testing Locally

### Using Stripe CLI

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli

2. Login:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   # For subscriptions
   stripe listen --forward-to localhost:3000/api/subscriptions/webhook
   
   # For payments (in another terminal)
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

4. Use the webhook signing secret shown in terminal

### Test Cards

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Decline |
| `4000 0025 0000 3155` | Requires 3D Secure |

---

## Support

For Stripe issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Connect Guide: https://stripe.com/docs/connect
- Stripe Support: https://support.stripe.com

