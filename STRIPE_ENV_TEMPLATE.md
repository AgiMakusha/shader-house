# Stripe Environment Variables Template

Copy these variables to your `.env.local` file and fill in your values.

## Required Stripe Variables

```env
# ===========================================
# STRIPE CONFIGURATION
# ===========================================

# API Keys (from https://dashboard.stripe.com/apikeys)
# Use sk_test_... and pk_test_... for development
# Use sk_live_... and pk_live_... for production
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Product/Price IDs (from https://dashboard.stripe.com/products)
STRIPE_CREATOR_SUPPORT_PRICE_ID=price_YOUR_CREATOR_SUPPORT_PRICE_ID
STRIPE_PUBLISHING_FEE_PRICE_ID=price_YOUR_PUBLISHING_FEE_PRICE_ID

# Webhook Secrets (from https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SUBSCRIPTION_WEBHOOK_SECRET
STRIPE_PAYMENTS_WEBHOOK_SECRET=whsec_YOUR_PAYMENTS_WEBHOOK_SECRET

# Stripe Connect (for developer payouts)
# Get from https://dashboard.stripe.com/settings/connect
STRIPE_CONNECT_CLIENT_ID=ca_YOUR_CONNECT_CLIENT_ID

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Quick Setup Commands

### 1. Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### 2. Login to Stripe
```bash
stripe login
```

### 3. Forward Webhooks to Local Server
Run these in separate terminal windows:
```bash
# Terminal 1: Subscriptions webhook
stripe listen --forward-to localhost:3000/api/subscriptions/webhook

# Terminal 2: Payments webhook (in another terminal)
stripe listen --forward-to localhost:3000/api/payments/webhook
```

The CLI will display the webhook signing secret - use that in your `.env.local`.

### 4. Test Cards
| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Decline |
| `4000 0025 0000 3155` | Requires 3D Secure |

Use any future expiry date and any 3-digit CVC.

## Getting Your Keys

### API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy "Secret key" → `STRIPE_SECRET_KEY`
3. Copy "Publishable key" → `STRIPE_PUBLISHABLE_KEY`

### Product IDs
1. Go to https://dashboard.stripe.com/products
2. Create "Creator Support Pass" - $14.99/month recurring
3. Create "Publishing Fee" - $50 one-time
4. Copy Price IDs from each product

### Webhook Secrets
1. Go to https://dashboard.stripe.com/webhooks
2. Create subscription webhook for `/api/subscriptions/webhook`
3. Create payments webhook for `/api/payments/webhook`
4. Copy signing secrets from each webhook

### Connect Client ID
1. Go to https://dashboard.stripe.com/settings/connect
2. Copy the "Client ID" → `STRIPE_CONNECT_CLIENT_ID`

