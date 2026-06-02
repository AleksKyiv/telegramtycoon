# Account Deletion

## Purpose
Players must have a clear way to request account deletion.

This belongs in:
- Account / More
- Settings
- Privacy section

Working label:

```text
Delete Account
```

## UX Rule
Account deletion must never happen from one accidental tap.

Required flow:

```text
Open Settings
Tap Delete Account
Read warning screen
Confirm checkbox
Type DELETE or confirm with second button
Submit deletion request
Account enters deletion pending state
Player can cancel during grace period
Backend completes deletion/anonymization
```

## Recommended MVP Flow
MVP can start with:
- visible `Delete Account` button
- confirmation modal
- local/server request placeholder
- support contact fallback

Before public launch, backend must support the real deletion request lifecycle.

## Grace Period
Recommended:
- `7 days` deletion grace period for normal accounts
- immediate access lock optional after request
- allow cancellation during grace period

Reason:
- prevents accidental loss
- reduces support issues
- gives time to handle payment/refund disputes

## What Gets Deleted
Delete or anonymize:
- profile/display data
- linked identities where possible
- gameplay progress where deletion is requested
- settings/preferences
- non-essential analytics tied to the user
- messages/inbox data where possible

## What May Be Retained
Some records may need to be retained for legal, security, audit, fraud prevention, or payment reasons.

Examples:
- payment ledger
- grant ledger
- refund ledger
- anti-fraud/security logs
- support records needed for disputes
- anonymized aggregate analytics

Retention should be explained in Privacy Policy.

## Paid Items And BioCards
Deleting an account can remove access to:
- resources
- upgrades
- capsule slots
- BioCards
- event rewards
- meditation stats
- linked wallet display

If physical/NFT/card ownership exists later, deletion rules must be revisited.

Phase 1:
- BioCards are digital collection items inside the account
- deleting the account can remove access to them unless law/policy says otherwise

## Telegram And Web Identity
Deleting the LabOS account does not delete:
- Telegram account
- Telegram Wallet
- Tonkeeper wallet
- external wallet account
- Telegram channel membership

It only affects the LabOS account and data controlled by our backend.

## Data Model

```text
account_deletion_requests
- id
- internal_player_id
- requested_at
- scheduled_delete_at
- canceled_at
- completed_at
- status
- reason_optional
- source_client
```

Player account status:

```text
active
deletion_pending
deleted
suspended
```

## Operator Requirements
Operator should see:
- deletion pending state
- scheduled deletion date
- support/payment flags
- ability to cancel only if user requests and policy allows
- audit trail

Operator must not silently delete payment/audit ledgers.

## MVP Build Recommendation
For first build:
- add `Delete Account` in Settings
- make it visually dangerous
- require confirmation
- show support/legal note
- do not hard-delete locally without backend

Real backend implementation should come with the database/privacy work.
