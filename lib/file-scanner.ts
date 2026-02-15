/**
 * File Scanner Utility
 *
 * Provides antivirus scanning for uploaded files using ClamAV.
 * Falls back gracefully when ClamAV is not available in development.
 *
 * @see https://github.com/kylefarris/clamscan
 */

import NodeClam from 'clamscan';

export interface ScanResult {
  isInfected: boolean;
  viruses: string[];
  scanned: boolean;
  error?: string;
}

// ClamAV scanner instance (lazily initialized)
let clamScanner: NodeClam | null = null;
let scannerInitialized = false;
let scannerAvailable = false;

/**
 * Initialize the ClamAV scanner.
 * This is called lazily on the first scan request.
 */
async function initializeScanner(): Promise<boolean> {
  if (scannerInitialized) {
    return scannerAvailable;
  }

  scannerInitialized = true;

  try {
    clamScanner = await new NodeClam().init({
      removeInfected: false,
      quarantineInfected: false,
      debugMode: process.env.NODE_ENV === 'development',
      scanRecursively: false,
      clamdscan: {
        socket: process.env.CLAMAV_SOCKET || '/var/run/clamav/clamd.sock',
        host: process.env.CLAMAV_HOST || '127.0.0.1',
        port: parseInt(process.env.CLAMAV_PORT || '3310', 10),
        timeout: 60000,
        localFallback: true,
        multiscan: false,
        reloadDb: false,
        active: true,
      },
      clamscan: {
        path: process.env.CLAMAV_PATH || '/usr/bin/clamscan',
        db: null,
        scanArchives: true,
        active: false, // Prefer daemon for performance
      },
      preference: 'clamdscan',
    });

    scannerAvailable = true;
    console.log('[FileScanner] ClamAV initialized successfully');
    return true;
  } catch (error) {
    console.warn('[FileScanner] ClamAV not available:', error instanceof Error ? error.message : error);
    scannerAvailable = false;
    return false;
  }
}

/**
 * Scan a file buffer for viruses.
 *
 * @param buffer - The file buffer to scan
 * @param filename - Original filename (for logging)
 * @returns Scan result with infection status
 */
export async function scanFileBuffer(buffer: Buffer, filename: string): Promise<ScanResult> {
  const isAvailable = await initializeScanner();

  // If scanner is not available, return a warning but allow the upload
  // In production, you may want to reject uploads instead
  if (!isAvailable || !clamScanner) {
    console.warn(`[FileScanner] Skipping scan for ${filename} - ClamAV not available`);
    return {
      isInfected: false,
      viruses: [],
      scanned: false,
      error: 'Antivirus scanner not available',
    };
  }

  try {
    // ClamAV can scan streams, but for simplicity we use the buffer directly
    // The clamscan library accepts readable streams
    const { Readable } = await import('stream');
    const stream = Readable.from(buffer);

    const result = await clamScanner.scanStream(stream);

    return {
      isInfected: result.isInfected,
      viruses: result.viruses || [],
      scanned: true,
    };
  } catch (error) {
    console.error(`[FileScanner] Error scanning ${filename}:`, error);
    return {
      isInfected: false,
      viruses: [],
      scanned: false,
      error: error instanceof Error ? error.message : 'Scan failed',
    };
  }
}

/**
 * Scan a file from a local path.
 *
 * @param filePath - Path to the file to scan
 * @returns Scan result with infection status
 */
export async function scanFilePath(filePath: string): Promise<ScanResult> {
  const isAvailable = await initializeScanner();

  if (!isAvailable || !clamScanner) {
    console.warn(`[FileScanner] Skipping scan for ${filePath} - ClamAV not available`);
    return {
      isInfected: false,
      viruses: [],
      scanned: false,
      error: 'Antivirus scanner not available',
    };
  }

  try {
    const result = await clamScanner.scanFile(filePath);

    return {
      isInfected: result.isInfected,
      viruses: result.viruses || [],
      scanned: true,
    };
  } catch (error) {
    console.error(`[FileScanner] Error scanning ${filePath}:`, error);
    return {
      isInfected: false,
      viruses: [],
      scanned: false,
      error: error instanceof Error ? error.message : 'Scan failed',
    };
  }
}

/**
 * Check if the antivirus scanner is available.
 */
export async function isScannerAvailable(): Promise<boolean> {
  return initializeScanner();
}

/**
 * Validate file type based on magic bytes (file signature).
 * This provides an additional layer of security beyond MIME type checking.
 */
export function validateFileSignature(buffer: Buffer, expectedType: string): boolean {
  const signatures: Record<string, number[][]> = {
    // PDF: %PDF
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
    // JPEG: FFD8FF
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    // PNG: 89504E47
    'image/png': [[0x89, 0x50, 0x4e, 0x47]],
    // DOC: D0CF11E0
    'application/msword': [[0xd0, 0xcf, 0x11, 0xe0]],
    // DOCX/XLSX/PPTX: ZIP format (PK)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      [0x50, 0x4b, 0x03, 0x04],
      [0x50, 0x4b, 0x05, 0x06],
    ],
  };

  const expectedSignatures = signatures[expectedType];
  if (!expectedSignatures) {
    // Unknown type, allow but log
    console.warn(`[FileScanner] No signature validation for type: ${expectedType}`);
    return true;
  }

  return expectedSignatures.some((sig) =>
    sig.every((byte, index) => buffer[index] === byte)
  );
}

/**
 * Comprehensive file validation including antivirus scan.
 */
export interface FileValidationResult {
  valid: boolean;
  scanned: boolean;
  errors: string[];
}

export async function validateFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  options?: {
    maxSize?: number;
    allowedTypes?: string[];
    requireScan?: boolean;
  }
): Promise<FileValidationResult> {
  const errors: string[] = [];
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'],
    requireScan = false,
  } = options || {};

  // Check file size
  if (buffer.length > maxSize) {
    errors.push(`File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`);
  }

  // Check MIME type
  if (!allowedTypes.includes(mimeType)) {
    errors.push(`Invalid file type: ${mimeType}`);
  }

  // Validate file signature (magic bytes)
  if (!validateFileSignature(buffer, mimeType)) {
    errors.push('File content does not match declared type');
  }

  // Perform antivirus scan
  const scanResult = await scanFileBuffer(buffer, filename);

  if (scanResult.isInfected) {
    errors.push(`File is infected: ${scanResult.viruses.join(', ')}`);
  }

  if (requireScan && !scanResult.scanned) {
    errors.push('Antivirus scan required but scanner not available');
  }

  return {
    valid: errors.length === 0,
    scanned: scanResult.scanned,
    errors,
  };
}
