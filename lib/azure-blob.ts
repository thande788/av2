import { DefaultAzureCredential, ManagedIdentityCredential } from '@azure/identity';
import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  type UserDelegationKey,
} from '@azure/storage-blob';

type UploadOptions = {
  container: string;
  blobName: string;
  data: Buffer;
  contentType: string;
};

let cachedClient: BlobServiceClient | null = null;
let cachedAccountName: string | null = null;
let cachedAccountKey: string | null = null;
let cachedDelegation: { key: UserDelegationKey; expiresOnMs: number } | null = null;

function parseConnectionString(): { accountName: string | null; accountKey: string | null } {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    return { accountName: null, accountKey: null };
  }

  const parts = connectionString.split(';');
  const values = new Map<string, string>();
  for (const part of parts) {
    const [k, ...rest] = part.split('=');
    if (!k || rest.length === 0) continue;
    values.set(k, rest.join('='));
  }

  return {
    accountName: values.get('AccountName') || null,
    accountKey: values.get('AccountKey') || null,
  };
}

function getAccountName(): string {
  if (cachedAccountName) {
    return cachedAccountName;
  }

  const direct = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (direct) {
    cachedAccountName = direct;
    return direct;
  }

  const parsed = parseConnectionString().accountName;
  if (parsed) {
    cachedAccountName = parsed;
    return parsed;
  }

  throw new Error('AZURE_STORAGE_ACCOUNT_NAME is not configured');
}

function getAccountKeyFromEnv(): string | null {
  if (cachedAccountKey !== null) {
    return cachedAccountKey;
  }

  const explicit = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  if (explicit) {
    cachedAccountKey = explicit;
    return explicit;
  }

  const parsed = parseConnectionString().accountKey;
  cachedAccountKey = parsed || null;
  return cachedAccountKey;
}

function getBlobServiceClient(): BlobServiceClient {
  if (cachedClient) {
    return cachedClient;
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (connectionString) {
    cachedClient = BlobServiceClient.fromConnectionString(connectionString);
    return cachedClient;
  }

  const endpoint = process.env.AZURE_STORAGE_BLOB_ENDPOINT;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountEndpoint = endpoint || (accountName ? `https://${accountName}.blob.core.windows.net` : null);

  if (!accountEndpoint) {
    throw new Error('Azure Blob storage is not configured');
  }

  const managedIdentityClientId = process.env.AZURE_CLIENT_ID;
  const credential = managedIdentityClientId
    ? new ManagedIdentityCredential({ clientId: managedIdentityClientId })
    : new DefaultAzureCredential();

  cachedClient = new BlobServiceClient(accountEndpoint, credential);
  return cachedClient;
}

function getAllowedStorageHosts(): Set<string> {
  const hosts = new Set<string>();
  const endpoint = process.env.AZURE_STORAGE_BLOB_ENDPOINT;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

  if (endpoint) {
    hosts.add(new URL(endpoint).hostname);
  }

  if (accountName) {
    hosts.add(`${accountName}.blob.core.windows.net`);
  }

  return hosts;
}

export function getStorageContainer(envVar: string, fallback: string): string {
  return process.env[envVar] || process.env.AZURE_STORAGE_CONTAINER || fallback;
}

export async function uploadBufferToAzureBlob(options: UploadOptions): Promise<{ url: string }> {
  const containerClient = getBlobServiceClient().getContainerClient(options.container);
  const blockBlobClient = containerClient.getBlockBlobClient(options.blobName);

  await blockBlobClient.uploadData(options.data, {
    blobHTTPHeaders: {
      blobContentType: options.contentType,
    },
  });

  return { url: blockBlobClient.url };
}

export async function deleteAzureBlobByUrl(url: string): Promise<void> {
  const parsed = new URL(url);
  const allowedHosts = getAllowedStorageHosts();

  if (allowedHosts.size > 0 && !allowedHosts.has(parsed.hostname)) {
    throw new Error('Invalid blob URL host');
  }

  const path = parsed.pathname.replace(/^\/+/, '');
  const [container, ...segments] = path.split('/');
  const blobName = segments.join('/');

  if (!container || !blobName) {
    throw new Error('Invalid blob URL path');
  }

  const blobClient = getBlobServiceClient().getContainerClient(container).getBlobClient(blobName);
  await blobClient.deleteIfExists();
}

function parseBlobUrl(url: string): { host: string; container: string; blobName: string } {
  const parsed = new URL(url);
  const path = parsed.pathname.replace(/^\/+/, '');
  const [container, ...segments] = path.split('/');
  const blobName = segments.join('/');

  if (!container || !blobName) {
    throw new Error('Invalid blob URL path');
  }

  const allowedHosts = getAllowedStorageHosts();
  if (allowedHosts.size > 0 && !allowedHosts.has(parsed.hostname)) {
    throw new Error('Invalid blob URL host');
  }

  return {
    host: parsed.hostname,
    container,
    blobName,
  };
}

async function getUserDelegationKeyCached(): Promise<UserDelegationKey> {
  const now = Date.now();
  if (cachedDelegation && now < cachedDelegation.expiresOnMs - 5 * 60 * 1000) {
    return cachedDelegation.key;
  }

  const startsOn = new Date(now - 5 * 60 * 1000);
  const expiresOn = new Date(now + 24 * 60 * 60 * 1000);
  const key = await getBlobServiceClient().getUserDelegationKey(startsOn, expiresOn);
  cachedDelegation = {
    key,
    expiresOnMs: expiresOn.getTime(),
  };
  return key;
}

export function isAzureBlobUrl(url: string): boolean {
  try {
    parseBlobUrl(url);
    return true;
  } catch {
    return false;
  }
}

export async function generateReadSasUrl(url: string, ttlMinutes = 30): Promise<string> {
  const { container, blobName } = parseBlobUrl(url);
  const accountName = getAccountName();
  const startsOn = new Date(Date.now() - 2 * 60 * 1000);
  const expiresOn = new Date(Date.now() + ttlMinutes * 60 * 1000);

  const sharedKey = getAccountKeyFromEnv();
  if (sharedKey) {
    const credential = new StorageSharedKeyCredential(accountName, sharedKey);
    const token = generateBlobSASQueryParameters(
      {
        containerName: container,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
      },
      credential,
    ).toString();

    return `${url.split('?')[0]}?${token}`;
  }

  const delegationKey = await getUserDelegationKeyCached();
  const token = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions: BlobSASPermissions.parse('r'),
      startsOn,
      expiresOn,
      protocol: SASProtocol.Https,
    },
    delegationKey,
    accountName,
  ).toString();

  return `${url.split('?')[0]}?${token}`;
}

export async function maybeSignBlobReadUrl(url: string | null | undefined, ttlMinutes = 30): Promise<string | null> {
  if (!url) {
    return null;
  }

  if (!isAzureBlobUrl(url)) {
    return url;
  }

  return generateReadSasUrl(url, ttlMinutes);
}

export function isAzureBlobConfigured(): boolean {
  return Boolean(
    process.env.AZURE_STORAGE_CONNECTION_STRING ||
      process.env.AZURE_STORAGE_BLOB_ENDPOINT ||
      process.env.AZURE_STORAGE_ACCOUNT_NAME,
  );
}
