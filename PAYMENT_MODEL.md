# Shader House Payment Model

## Overview

Shader House is an indie game marketplace that connects developers with gamers. Our payment model is designed to be developer-friendly while sustaining the platform.

## Revenue Split Summary

| Revenue Source | Developer Gets | Platform Gets |
|----------------|----------------|---------------|
| **Direct Game Sales** | **85%** | **15%** |
| **Tips/Donations** | **80%** | **20%** |
| **Creator Support Subscriptions** | Split among devs (after 15% fee) | **15%** |
| **Gamer Pro Playtime** | Based on playtime (after 15% fee) | **15%** |

## Fixed Fees

| Fee Type | Amount | When |
|----------|--------|------|
| **Game Publishing Fee** | **$50 USD** | One-time per game |
| **Minimum Payout Threshold** | **$25 USD** | Before requesting payout |

---

## Detailed Breakdown

### 1. Direct Game Sales

When a gamer purchases a game:

```
Example: Game priced at $19.99

Customer pays:        $19.99
Platform fee (15%):    $3.00
Developer receives:   $16.99
```

**Key Points:**
- Platform fee is 15% (industry-low compared to Steam's 30%)
- Developer receives 85% of each sale
- Payments processed via Stripe Connect
- Funds available for payout after 7-day hold period

### 2. Game Publishing Fee

When a developer publishes a new game:

```
One-time fee: $50.00 USD

Break-even analysis:
- At $9.99 game price → ~6 sales to break even
- At $14.99 game price → ~4 sales to break even
- At $19.99 game price → ~3 sales to break even
```

**What's Included:**
- Permanent listing on the marketplace
- Game page with screenshots, description, tags
- Analytics dashboard
- Community features (reviews, discussions)
- Beta access management tools
- Devlog posting
- Promotional opportunities

### 3. Tips & Donations

When a gamer tips a developer:

```
Example: $20.00 tip

Supporter gives:      $20.00
Platform fee (20%):    $4.00
Developer receives:   $16.00
```

**Why 20% on tips:**
- Payment processing fees (~3%)
- Platform sustainability
- Feature development
- Still significantly better than Patreon (8-12% + fees)

### 4. Creator Support Pass ($14.99/month)

Gamers can subscribe to support up to 3 developers:

```
Monthly subscription: $14.99
Platform fee (15%):    $2.25
Developer pool:       $12.74

If supporting 3 developers:
Each developer gets:   $4.25/month per supporter
```

**Benefits for Supporters:**
- Beta access to supported developers' games
- Exclusive devlogs and updates
- Voting power on features
- Direct community access
- Exclusive cosmetics

### 5. Gamer Pro Pass ($12.00/month) - Future

Revenue distributed based on gameplay hours:

```
Monthly pool from all Pro subscribers: $10,000
Platform fee (15%):                     $1,500
Developer pool:                         $8,500

If your game = 10% of total playtime:
You receive:                             $850
```

---

## Payment Processing

### Technology Stack
- **Stripe Connect** - Handles all payments and payouts
- **Express Accounts** - Developers onboard via Stripe's hosted flow
- **Automatic Splits** - Platform fee deducted automatically

### Payout Schedule
- **Weekly payouts** (every Friday)
- **7-day rolling reserve** - Funds available after 7 days
- **Minimum threshold** - $25 before payout

### Supported Payout Methods
- Bank transfer (ACH in US)
- Debit card
- International wire
- Depending on country

---

## Developer Onboarding

### Step 1: Register as Developer
```
1. Create account on Shader House
2. Select "Developer" role
3. Complete indie verification
```

### Step 2: Connect Stripe
```
1. Go to Settings → Payments
2. Click "Connect Stripe Account"
3. Complete Stripe Express onboarding
4. Verify identity and bank details
```

### Step 3: Publish a Game
```
1. Pay $50 publishing fee
2. Upload game files and assets
3. Set price and details
4. Submit for review
5. Game goes live!
```

### Step 4: Receive Payouts
```
1. Sales revenue accumulates
2. View earnings in Revenue Dashboard
3. Payouts sent weekly to bank
4. Full transaction history available
```

---

## Comparison with Other Platforms

| Platform | Developer Share | Publishing Fee |
|----------|-----------------|----------------|
| **Shader House** | **85%** | **$50** |
| Steam | 70% | $100 |
| Epic Games Store | 88% | Free |
| itch.io | 90%+ (flexible) | Free |
| GOG | 70% | Selective |

**Why Shader House?**
- Lower cut than Steam
- Focused on indie games
- Direct developer-gamer relationships
- Beta testing tools built-in
- Community features included

---

## Tax Information

### For Developers
- Stripe handles W-9/W-8BEN collection
- 1099-K issued for US developers earning $600+
- Platform reports to IRS as required
- Developers responsible for their own taxes

### For Platform
- Stripe Tax can be enabled for automatic sales tax
- VAT/GST handled per jurisdiction
- Tax settings configurable per game

---

## Refund Policy

### Gamer Refunds
- **Within 14 days** of purchase
- **Less than 2 hours** of gameplay
- Automatic refund processing

### Impact on Developer Revenue
- Refunded amount deducted from developer balance
- If balance insufficient, deducted from future earnings
- Excessive refund rates may trigger review

---

## Configuration Reference

All payment configuration is stored in:
```
/lib/payments/config.ts
```

Key constants:
```typescript
GAME_SALE_PLATFORM_FEE_PERCENT = 15     // 15% on sales
DONATION_PLATFORM_FEE_PERCENT = 20       // 20% on tips
GAME_PUBLISHING_FEE_CENTS = 5000         // $50.00
MINIMUM_PAYOUT_THRESHOLD_CENTS = 2500    // $25.00
CREATOR_SUPPORT_PRICE_CENTS = 1499       // $14.99/month
```

---

## Support

For payment-related questions:
- Email: payments@shaderhouse.com
- Developer Discord: #payments-help
- Documentation: /docs/payments

For disputes or issues:
- Use Stripe Dashboard for transaction details
- Contact support with transaction ID
- Resolution within 5 business days

---

**Last Updated:** December 2024

