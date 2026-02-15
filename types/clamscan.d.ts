/**
 * Type declarations for modules without TypeScript support
 */

declare module 'clamscan' {
  interface ClamScanOptions {
    removeInfected?: boolean;
    quarantineInfected?: boolean;
    debugMode?: boolean;
    scanRecursively?: boolean;
    clamdscan?: {
      socket?: string;
      host?: string;
      port?: number;
      timeout?: number;
      localFallback?: boolean;
      multiscan?: boolean;
      reloadDb?: boolean;
      active?: boolean;
    };
    clamscan?: {
      path?: string;
      db?: string | null;
      scanArchives?: boolean;
      active?: boolean;
    };
    preference?: 'clamdscan' | 'clamscan';
  }

  interface ScanResult {
    isInfected: boolean;
    file?: string;
    viruses?: string[];
  }

  class NodeClam {
    constructor();
    init(options?: ClamScanOptions): Promise<NodeClam>;
    scanFile(filePath: string): Promise<ScanResult>;
    scanStream(stream: NodeJS.ReadableStream): Promise<ScanResult>;
    scanDir(directoryPath: string): Promise<ScanResult>;
  }

  export = NodeClam;
}
