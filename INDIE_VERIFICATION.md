# 🎮 Indie Developer Verification System

## Overview

This system helps distinguish true indie developers from studios on the Shader House platform, providing indie-specific perks while allowing studios to participate.

---

## 📋 Fields Captured

### Core Verification Fields

| Field | Type | Description |
|-------|------|-------------|
| **developerType** | Enum: `INDIE` \| `STUDIO` | Self-selected developer type |
| **teamSize** | Integer (0-500) | Total team members including part-time |
| **hasPublisher** | Boolean | Major publisher with funding/control (not distribution-only) |
| **ownsIP** | Boolean | Owns IP or shares only with team |
| **fundingSources** | Multi-select | `SELF`, `CROWDFUND`, `ANGEL`, `VC`, `MAJOR_PUBLISHER` |
| **companyType** | Enum | `NONE`, `SOLE_PROP`, `LLC`, `CORP` |
| **evidenceLinks** | Array (1-5 URLs) | Steam/itch.io, website, GitHub, LinkedIn, etc. |
| **attestIndie** | Boolean + IP | Certification checkbox with IP capture |

### Moderation Fields

| Field | Type | Description |
|-------|------|-------------|
| **verificationStatus** | Enum | `PENDING`, `APPROVED`, `REJECTED`, `APPEALING` |
| **isIndieEligible** | Boolean | Auto-calculated based on criteria |
| **attestedIP** | String | IP address at time of attestation |
| **attestedAt** | DateTime | Timestamp of attestation |
| **reviewedAt** | DateTime | When moderator reviewed |
| **reviewedBy** | String | Admin user ID |
| **rejectionReason** | String | Reason if rejected |

---

## ✅ Indie Eligibility Criteria

A developer is considered "indie" if they meet **ALL** of the following:

1. **Team size ≤ 10** people
2. **No major publisher** with funding/control (distribution partnerships are OK)
3. **Own their IP** or share it only among team members
4. **No corporate parent company**

### Important Notes

- Having a studio name, sole proprietorship, or small LLC is **allowed**
- Many indie developers operate as legal entities for tax/liability reasons
- VC funding alone doesn't disqualify if other criteria are met
- Small corps without parent companies can still be indie

---

## ⚠️ Real-Time Warnings

The system provides non-blocking warnings when:

- **Team size > 10**: "This may make you ineligible for Indie perks; you can still continue as a Studio."
- **Has publisher = true**: "Having a major publisher may make you ineligible for Indie perks."
- **Company type = CORP**: "Ensure you don't have a parent company to maintain indie status."
- **VC + large team**: "VC funding combined with large team size may indicate non-indie status."

These warnings appear in real-time as the user fills out the form.

---

## 🔍 Moderation Workflow

### 1. Registration
- Developer fills out form
- System auto-calculates `isIndieEligible`
- Status set to `PENDING`
- IP address captured for attestation

### 2. Manual Review Queue
Moderators review:
- Team size
- Evidence links (Steam/itch.io pages, GitHub, etc.)
- Publisher mentions on store pages
- Funding sources
- Company structure

### 3. Decision
- **APPROVED**: Developer gains indie perks
- **REJECTED**: Can appeal with more evidence
- **APPEALING**: Under review after rejection

### 4. Appeals
- Developers can provide additional evidence
- Status changes to `APPEALING`
- Re-reviewed by moderator

---

## 🎨 User Experience

### Registration Flow

1. **Basic Info**: Name, email, password
2. **Developer Profile**: All verification fields
3. **Indie Policy Banner**: Expandable criteria explanation
4. **Field Tooltips**: Hover info for each field
5. **Real-Time Warnings**: Instant feedback on eligibility
6. **Attestation**: Required checkbox with policy agreement

### Field Tooltips

Each field has a helpful tooltip explaining:
- What the field means
- Why we ask for it
- Examples of valid inputs

### Visual Design

- **Warnings**: Yellow/amber color scheme
- **Errors**: Red color scheme
- **Policy**: Green color scheme
- **Tooltips**: Dark overlay with smooth animations

---

## 🔗 Routes

| Route | Description |
|-------|-------------|
| `/signup/developer` | Full developer registration with verification |
| `/signup` | Basic signup (developer or gamer, no verification) |
| `/register` | Role selection page |

---

## 🛠️ Technical Implementation

### Database Schema

```prisma
model DeveloperProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Core verification fields
  developerType   DeveloperType
  teamSize        Int
  hasPublisher    Boolean
  ownsIP          Boolean
  fundingSources  FundingSource[]
  companyType     CompanyType
  evidenceLinks   String[]
  
  // Attestation
  attestIndie     Boolean
  attestedAt      DateTime        @default(now())
  attestedIP      String?
  
  // Moderation
  verificationStatus VerificationStatus @default(PENDING)
  reviewedAt         DateTime?
  reviewedBy         String?
  rejectionReason    String?
  
  // Auto-calculated
  isIndieEligible    Boolean          @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Validation

- **Client-side**: Real-time validation with custom error messages
- **Server-side**: Zod schema validation
- **URL validation**: All evidence links must be valid URLs
- **Range validation**: Team size 0-500, 1-5 evidence links

### Eligibility Checker

```typescript
checkIndieEligibility({
  teamSize: number,
  hasPublisher: boolean,
  ownsIP: boolean,
  companyType: CompanyType,
  fundingSources: string[],
}) => {
  isEligible: boolean,
  reasons: string[],
  warnings: string[],
}
```

---

## 📊 Future Enhancements

### Potential Additions

1. **Automated Verification**
   - Steam API integration to verify game ownership
   - GitHub API to verify repository ownership
   - LinkedIn API for team size verification

2. **Reputation System**
   - Community vouching
   - Verified indie badge
   - Trust score based on evidence

3. **Analytics Dashboard**
   - Verification approval rates
   - Common rejection reasons
   - Time to verification

4. **Batch Review Tools**
   - Moderator dashboard
   - Bulk approval/rejection
   - Evidence preview

---

## 🚀 Usage

### For Developers

1. Visit `/signup/developer`
2. Fill out basic information
3. Complete developer profile
4. Review indie policy
5. Provide evidence links
6. Attest to indie criteria
7. Submit for review

### For Moderators

1. Access pending verification queue
2. Review developer profile
3. Check evidence links
4. Verify indie criteria
5. Approve, reject, or request more info
6. Provide rejection reason if needed

---

## 🔐 Security & Privacy

- **IP Capture**: Only for attestation, not shared publicly
- **Evidence Links**: Publicly visible to moderators only
- **Attestation**: Legally binding certification
- **Data Retention**: Follows GDPR/CCPA guidelines

---

## 📝 Notes

- System is designed to be **inclusive** of legitimate indie developers
- Warnings are **non-blocking** - developers can still register as studios
- Indie status can be **appealed** with additional evidence
- Manual review ensures **quality** and prevents abuse

---

## 🤝 Support

If you have questions about indie verification:
- Check the indie policy on the registration form
- Review field tooltips for clarification
- Contact support if you believe you were incorrectly classified
- Provide additional evidence in appeals

