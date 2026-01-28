/**
 * File Upload Hook
 * 
 * Client-side hook for handling file uploads with progress tracking.
 */

"use client";

import { useState, useCallback } from "react";

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  file: UploadedFile | null;
}

export interface UseFileUploadOptions {
  /** Type of upload (for folder organization) */
  uploadType?: "resume" | "cover-letter";
  /** Max file size in bytes (default 5MB) */
  maxSize?: number;
  /** Allowed MIME types */
  allowedTypes?: string[];
  /** Callback on successful upload */
  onSuccess?: (file: UploadedFile) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

const DEFAULT_ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    uploadType = "resume",
    maxSize = DEFAULT_MAX_SIZE,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    file: null,
  });

  const validateFile = useCallback((file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return "Invalid file type. Please upload a PDF or Word document.";
    }
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      return `File too large. Maximum size is ${maxMB}MB.`;
    }
    return null;
  }, [allowedTypes, maxSize]);

  const upload = useCallback(async (file: File): Promise<UploadedFile | null> => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setState((prev) => ({ ...prev, error: validationError }));
      onError?.(validationError);
      return null;
    }

    setState({ isUploading: true, progress: 0, error: null, file: null });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);

      // Use fetch with progress simulation
      // Note: Fetch doesn't support upload progress, so we simulate it
      const progressInterval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 100);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const uploadedFile: UploadedFile = await response.json();

      setState({
        isUploading: false,
        progress: 100,
        error: null,
        file: uploadedFile,
      });

      onSuccess?.(uploadedFile);
      return uploadedFile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        file: null,
      });
      onError?.(errorMessage);
      return null;
    }
  }, [uploadType, validateFile, onSuccess, onError]);

  const removeFile = useCallback(async (): Promise<boolean> => {
    if (!state.file?.url) return false;

    try {
      const response = await fetch(`/api/upload?url=${encodeURIComponent(state.file.url)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setState({
          isUploading: false,
          progress: 0,
          error: null,
          file: null,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [state.file]);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      file: null,
    });
  }, []);

  return {
    ...state,
    upload,
    removeFile,
    reset,
    validateFile,
  };
}

export default useFileUpload;
