# PII Encryption Model

This project uses application-level field encryption for high-risk PII in addition to provider-level encryption at rest.

## Encrypted fields

- Contact identifiers: `email`, `billingEmail`, `phone`, `emergencyPhone`
- Address line data: `street`
- Care and incident narrative text: `careNotes`, `accessNotes`, `notes`, `content`, `description`, `resolution`, `reason`, `internalNotes`, `additionalInfo`, `workDescription`, `message`, `comment`
- DOB fields using companion encrypted columns:
  - `careRecipientDOB` -> `careRecipientDOBEnc`
  - `dateOfBirth` -> `dateOfBirthEnc`

## Searchable hash side-columns

To support lookup without decrypting full datasets, the app writes HMAC-SHA256 hash columns:

- `emailHash`, `billingEmailHash`
- `phoneHash`, `emergencyPhoneHash`
- `streetHash`, `emergencyNameHash`
- `careRecipientDOBHash`, `dateOfBirthHash`

The runtime query layer rewrites relevant equality filters to hash-based lookup where possible.

## Managed key pattern

The runtime expects managed keys via environment variables:

- `PII_KEYRING_JSON` (JSON map of key-id to key material)
- `PII_ACTIVE_KEY_ID` (active key id used for new writes)
- `PII_HASH_KEY` (HMAC key for searchable hashes)

Fallback for local development only:

- `PII_ENCRYPTION_KEY`

## Fields intentionally kept plaintext (operational matching)

The following are intentionally plaintext because they are used heavily in scheduling/matching filters and low-latency operational queries:

- `city`, `state`, `zip`
- `latitude`, `longitude`
- `skills`, `languages`
- `serviceType`, `skillsRequired`
- `dayOfWeek`, `startTime`, `endTime` in availability/scheduling tables

Why plaintext here:

1. They are not direct identifiers by themselves.
2. They power real-time matching and conflict checks that need indexed/filterable values.
3. Encrypting them would materially degrade staffing workflows and query performance.

We continue to protect higher-risk direct identifiers and narrative care data with field-level encryption.
