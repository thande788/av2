/**
 * File Upload Component
 * 
 * Drag-and-drop file upload with progress indicator.
 * Used for resume uploads in job applications.
 */

"use client";

import { useCallback, useState, useRef } from "react";
import { IconUpload, IconFile, IconX, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useFileUpload, type UploadedFile } from "@/hooks/use-file-upload";

interface FileUploadProps {
  /** Upload type for folder organization */
  type?: "resume" | "cover-letter";
  /** Callback when file is uploaded */
  onUpload?: (file: UploadedFile) => void;
  /** Callback when file is removed */
  onRemove?: () => void;
  /** Initial file URL (for edit forms) */
  initialUrl?: string;
  /** Input name for form submission */
  name?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message from parent form */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function FileUpload({
  type = "resume",
  onUpload,
  onRemove,
  initialUrl,
  name = "resumeUrl",
  required = false,
  error: externalError,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isUploading,
    progress,
    error: uploadError,
    file,
    upload,
    removeFile,
    reset,
  } = useFileUpload({
    uploadType: type,
    onSuccess: onUpload,
  });

  const error = externalError || uploadError;
  const hasFile = file?.url || initialUrl;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await upload(droppedFile);
    }
  }, [disabled, upload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await upload(selectedFile);
    }
    // Reset input so the same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [upload]);

  const handleRemove = useCallback(async () => {
    await removeFile();
    onRemove?.();
  }, [removeFile, onRemove]);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      {/* Hidden input for form value */}
      <input type="hidden" name={name} value={file?.url || initialUrl || ""} />
      
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload area or file preview */}
      {hasFile && !isUploading ? (
        // File uploaded state
        <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconFile className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {file?.filename || "Uploaded file"}
            </p>
            {file?.size && (
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-green-500/20 text-green-600">
              <IconCheck className="size-3.5" />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
              disabled={disabled}
            >
              <IconX className="size-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        </div>
      ) : (
        // Upload dropzone
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
            isDragging && "border-primary bg-primary/5",
            !isDragging && !error && "border-border hover:border-primary/50 hover:bg-muted/30",
            error && "border-destructive/50 bg-destructive/5",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "pointer-events-none"
          )}
        >
          {isUploading ? (
            <>
              <IconLoader2 className="size-8 text-primary animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium">Uploading...</p>
                <p className="text-xs text-muted-foreground">{progress}%</p>
              </div>
              <Progress value={progress} className="w-full max-w-xs h-1.5" />
            </>
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <IconUpload className="size-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drop your {type === "cover-letter" ? "cover letter" : "resume"} here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                PDF, DOC, or DOCX up to 5MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Required indicator */}
      {required && !hasFile && !error && (
        <p className="text-xs text-muted-foreground">
          {type === "cover-letter" ? "Cover letter is optional" : "Resume is recommended but optional"}
        </p>
      )}
    </div>
  );
}

export default FileUpload;
