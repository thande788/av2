import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto';

const ENCRYPTION_PREFIX = 'enc:v1';
const ALGORITHM = 'aes-256-gcm';

type ManagedKeyring = {
  activeKeyId: string;
  keys: Record<string, Buffer>;
  hashKey: Buffer;
};

type DateFieldConfig = {
  encryptedField: string;
  hashField: string;
};

const STRING_PII_FIELDS: Record<string, string> = {
  email: 'emailHash',
  billingEmail: 'billingEmailHash',
  phone: 'phoneHash',
  street: 'streetHash',
  emergencyName: 'emergencyNameHash',
  emergencyPhone: 'emergencyPhoneHash',
};

const ENCRYPT_ONLY_STRING_FIELDS = new Set<string>([
  'careNotes',
  'accessNotes',
  'notes',
  'content',
  'description',
  'resolution',
  'reason',
  'internalNotes',
  'additionalInfo',
  'workDescription',
  'message',
  'comment',
]);

const DATE_PII_FIELDS: Record<string, DateFieldConfig> = {
  careRecipientDOB: {
    encryptedField: 'careRecipientDOBEnc',
    hashField: 'careRecipientDOBHash',
  },
  dateOfBirth: {
    encryptedField: 'dateOfBirthEnc',
    hashField: 'dateOfBirthHash',
  },
};

function parseKey(raw: string): Buffer {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Empty key value');
  }

  try {
    const asBase64 = Buffer.from(trimmed, 'base64');
    if (asBase64.length === 32) {
      return asBase64;
    }
  } catch {
    // noop
  }

  if (/^[a-f0-9]{64}$/i.test(trimmed)) {
    return Buffer.from(trimmed, 'hex');
  }

  const digest = createHash('sha256').update(trimmed).digest();
  return digest;
}

function getFallbackKey(label: string): Buffer {
  return createHash('sha256').update(`${label}:${process.cwd()}`).digest();
}

function loadKeyring(): ManagedKeyring {
  const keyringRaw = process.env.PII_KEYRING_JSON;
  const activeKeyId = process.env.PII_ACTIVE_KEY_ID || 'k1';
  const hashKeyRaw = process.env.PII_HASH_KEY;

  const keys: Record<string, Buffer> = {};

  if (keyringRaw) {
    const parsed = JSON.parse(keyringRaw) as Record<string, string>;
    for (const [keyId, value] of Object.entries(parsed)) {
      keys[keyId] = parseKey(value);
    }
  } else if (process.env.PII_ENCRYPTION_KEY) {
    keys[activeKeyId] = parseKey(process.env.PII_ENCRYPTION_KEY);
  } else {
    keys[activeKeyId] = getFallbackKey('pii-encryption-dev');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PII encryption keys are not configured');
    }
  }

  if (!keys[activeKeyId]) {
    throw new Error(`Missing active PII key '${activeKeyId}' in keyring`);
  }

  const hashKey = hashKeyRaw
    ? parseKey(hashKeyRaw)
    : process.env.NODE_ENV === 'production'
      ? (() => {
          throw new Error('PII hash key is not configured');
        })()
      : getFallbackKey('pii-hash-dev');

  return {
    activeKeyId,
    keys,
    hashKey,
  };
}

const KEYRING = loadKeyring();

function normalizeForHash(fieldName: string, value: string): string {
  if (fieldName.toLowerCase().includes('email')) {
    return value.trim().toLowerCase();
  }

  if (fieldName.toLowerCase().includes('phone')) {
    return value.replace(/\D/g, '');
  }

  if (fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().includes('dob')) {
    return value.trim().slice(0, 10);
  }

  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function computeHash(fieldName: string, value: string): string {
  const normalized = normalizeForHash(fieldName, value);
  return createHmac('sha256', KEYRING.hashKey)
    .update(`${fieldName}:${normalized}`)
    .digest('hex');
}

function isEncryptedValue(value: string): boolean {
  return value.startsWith(`${ENCRYPTION_PREFIX}:`);
}

function encryptString(fieldName: string, plaintext: string): string {
  const iv = randomBytes(12);
  const keyId = KEYRING.activeKeyId;
  const key = KEYRING.keys[keyId];
  const cipher = createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from(fieldName));
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}:${keyId}:${iv.toString('base64')}:${encrypted.toString('base64')}:${tag.toString('base64')}`;
}

function decryptString(fieldName: string, value: string): string {
  if (!isEncryptedValue(value)) {
    return value;
  }

  const parts = value.split(':');
  if (parts.length !== 6) {
    throw new Error(`Invalid encrypted payload for ${fieldName}`);
  }

  const [, , keyId, ivB64, encryptedB64, tagB64] = parts;
  const key = KEYRING.keys[keyId];
  if (!key) {
    throw new Error(`Unknown key id '${keyId}' for ${fieldName}`);
  }

  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, 'base64'));
  decipher.setAAD(Buffer.from(fieldName));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(encryptedB64, 'base64')),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}

function asDateString(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

function transformWriteNode(node: unknown): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      transformWriteNode(item);
    }
    return;
  }

  if (!isPlainObject(node)) {
    return;
  }

  for (const [field, hashField] of Object.entries(STRING_PII_FIELDS)) {
    if (!(field in node)) {
      continue;
    }

    const value = node[field];
    if (typeof value === 'string') {
      const plain = isEncryptedValue(value) ? decryptString(field, value) : value;
      node[field] = isEncryptedValue(value) ? value : encryptString(field, value);
      node[hashField] = computeHash(field, plain);
    } else if (value === null) {
      node[hashField] = null;
    }
  }

  for (const field of ENCRYPT_ONLY_STRING_FIELDS) {
    if (!(field in node)) {
      continue;
    }

    const value = node[field];
    if (typeof value === 'string' && value.length > 0 && !isEncryptedValue(value)) {
      node[field] = encryptString(field, value);
    }
  }

  for (const [field, config] of Object.entries(DATE_PII_FIELDS)) {
    if (!(field in node)) {
      continue;
    }

    const dateString = asDateString(node[field]);
    if (!dateString) {
      node[field] = null;
      node[config.encryptedField] = null;
      node[config.hashField] = null;
      continue;
    }

    node[field] = null;
    node[config.encryptedField] = encryptString(field, dateString);
    node[config.hashField] = computeHash(field, dateString);
  }

  for (const value of Object.values(node)) {
    transformWriteNode(value);
  }
}

function transformReadNode(node: unknown): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      transformReadNode(item);
    }
    return;
  }

  if (!isPlainObject(node)) {
    return;
  }

  for (const field of Object.keys(STRING_PII_FIELDS)) {
    const value = node[field];
    if (typeof value === 'string' && isEncryptedValue(value)) {
      node[field] = decryptString(field, value);
    }
  }

  for (const [field, config] of Object.entries(DATE_PII_FIELDS)) {
    const encryptedValue = node[config.encryptedField];
    if (node[field] == null && typeof encryptedValue === 'string' && isEncryptedValue(encryptedValue)) {
      const decrypted = decryptString(field, encryptedValue);
      const parsed = new Date(`${decrypted}T00:00:00.000Z`);
      if (!Number.isNaN(parsed.getTime())) {
        node[field] = parsed;
      }
    }
  }

  for (const value of Object.values(node)) {
    transformReadNode(value);
  }
}

export function transformPrismaWriteArgs(args: unknown): void {
  if (!isPlainObject(args)) {
    return;
  }

  if ('data' in args) {
    transformWriteNode(args.data);
  }

  if ('create' in args) {
    transformWriteNode(args.create);
  }

  if ('update' in args) {
    transformWriteNode(args.update);
  }
}

function transformWhereHashes(node: unknown): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      transformWhereHashes(item);
    }
    return;
  }

  if (!isPlainObject(node)) {
    return;
  }

  for (const [field, hashField] of Object.entries(STRING_PII_FIELDS)) {
    if (!(field in node) || hashField in node) {
      continue;
    }

    const value = node[field];
    if (typeof value === 'string') {
      node[hashField] = computeHash(field, value);
      delete node[field];
    }
  }

  for (const value of Object.values(node)) {
    transformWhereHashes(value);
  }
}

export function transformPrismaWhereArgs(args: unknown): void {
  if (!isPlainObject(args)) {
    return;
  }

  if ('where' in args) {
    transformWhereHashes(args.where);
  }
}

export function transformPrismaResult(result: unknown): void {
  transformReadNode(result);
}

export function toSearchHash(fieldName: string, value: string): string {
  return computeHash(fieldName, value);
}
