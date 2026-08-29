/**
 * File Upload API Route
 * 
 * Handles file uploads for job applications (resumes, cover letters).
 * Uses Azure Blob Storage for storage.
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { validateFile } from "@/lib/file-scanner";
import {
  deleteAzureBlobByUrl,
  getStorageContainer,
  isAzureBlobConfigured,
  uploadBufferToAzureBlob,
} from "@/lib/azure-blob";

// Allowed file types
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

// Max file size (5MB)
const MAX_SIZE = 5 * 1024 * 1024;

// Rate limiting
const uploadRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // uploads per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = uploadRateLimit.get(ip);

  if (!record || now > record.resetTime) {
    uploadRateLimit.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAzureBlobConfigured()) {
      console.error("[Upload] Azure Blob Storage is not configured");
      return NextResponse.json(
        { error: "File upload is not configured" },
        { status: 503 }
      );
    }

    // Rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    
    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many uploads. Please try again later." },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "resume" or "cover-letter"

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate filename
    if (!file.name || file.name.length > 255) {
      return NextResponse.json(
        { error: "Invalid filename." },
        { status: 400 }
      );
    }

    // Comprehensive validation: size, MIME, magic-bytes, antivirus scan
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = await validateFile(buffer, file.name, file.type, {
      maxSize: MAX_SIZE,
      allowedTypes: Object.keys(ALLOWED_TYPES),
      requireScan: process.env.REQUIRE_ANTIVIRUS_SCAN === "true",
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(". ") },
        { status: 400 }
      );
    }

    if (!validation.scanned) {
      console.warn(`[Upload] Antivirus scan skipped for ${file.name}`);
    }

    // Generate safe filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = ALLOWED_TYPES[file.type];
    const safeBaseName = file.name
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-zA-Z0-9-_]/g, "_") // Replace unsafe chars
      .substring(0, 50); // Limit length
    
    const folder = type === "cover-letter" ? "cover-letters" : "resumes";
    const filename = `${folder}/${timestamp}-${safeBaseName}-${randomSuffix}${extension}`;

    const container = getStorageContainer("AZURE_STORAGE_UPLOADS_CONTAINER", "uploads");
    const blob = await uploadBufferToAzureBlob({
      container,
      blobName: filename,
      data: buffer,
      contentType: file.type,
    });

    console.log(`[Upload] File uploaded: ${blob.url}`);

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - for removing uploaded files
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!isAzureBlobConfigured()) {
      return NextResponse.json(
        { error: "File upload is not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "No file URL provided" },
        { status: 400 }
      );
    }

    try {
      await deleteAzureBlobByUrl(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid file URL" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Upload] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file." },
      { status: 500 }
    );
  }
}
