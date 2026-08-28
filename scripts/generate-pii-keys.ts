/**
 * Generate production-ready keys for PII encryption.
 *
 * Usage:
 *   pnpm tsx scripts/generate-pii-keys.ts
 */

import { randomBytes } from 'node:crypto';

function key(): string {
  return randomBytes(32).toString('base64');
}

const activeKeyId = 'k1';
const encryptionKey = key();
const hashKey = key();

console.log('Generated PII key material (store in your secret manager):');
console.log('');
console.log(`PII_ACTIVE_KEY_ID=${activeKeyId}`);
console.log(`PII_KEYRING_JSON={"${activeKeyId}":"${encryptionKey}"}`);
console.log(`PII_HASH_KEY=${hashKey}`);
console.log('');
console.log('Optional local fallback (dev only):');
console.log(`PII_ENCRYPTION_KEY=${encryptionKey}`);
