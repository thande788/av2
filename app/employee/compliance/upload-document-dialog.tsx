/**
 * Upload Document Dialog Component
 *
 * Dialog for uploading new compliance documents.
 */

'use client';

import { useState, useRef } from 'react';
import { DocType } from '@prisma/client';
import {
  IconUpload,
  IconFile,
  IconX,
  IconLoader2,
  IconCheck,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { uploadComplianceDocument } from '@/app/actions';

interface UploadDocumentDialogProps {
  workerId: string;
}

const docTypes: { value: DocType; label: string }[] = [
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
  { value: 'CPR_CERTIFICATION', label: 'CPR Certification' },
  { value: 'CNA_LICENSE', label: 'CNA License' },
  { value: 'HHA_CERTIFICATION', label: 'HHA Certification' },
  { value: 'BACKGROUND_CHECK', label: 'Background Check' },
  { value: 'TB_TEST', label: 'TB Test' },
  { value: 'PHYSICAL_EXAM', label: 'Physical Exam' },
  { value: 'I9_FORM', label: 'I-9 Form' },
  { value: 'W4_FORM', label: 'W-4 Form' },
  { value: 'DIRECT_DEPOSIT', label: 'Direct Deposit Form' },
  { value: 'OTHER', label: 'Other Document' },
];

export function UploadDocumentDialog({ workerId }: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [docType, setDocType] = useState<DocType | ''>('');
  const [name, setName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [issuedDate, setIssuedDate] = useState('');

  const resetForm = () => {
    setSelectedFile(null);
    setDocType('');
    setName('');
    setExpiresAt('');
    setIssuedDate('');
    setError(null);
    setSuccess(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, Word document, or image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Auto-fill name from filename if empty
    if (!name) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setName(baseName);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !docType || !name) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('docType', docType);
      formData.append('name', name);
      if (expiresAt) formData.append('expiresAt', expiresAt);
      if (issuedDate) formData.append('issuedDate', issuedDate);

      const result = await uploadComplianceDocument(workerId, formData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          resetForm();
        }, 1500);
      } else {
        setError(result.error || 'Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <IconUpload className="mr-2 size-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Compliance Document</DialogTitle>
          <DialogDescription>
            Upload a new compliance document for verification. Supported formats: PDF, Word, JPEG, PNG.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
              <IconCheck className="size-8 text-emerald-600 dark:text-emerald-500" />
            </div>
            <p className="mt-4 text-lg font-medium text-emerald-600 dark:text-emerald-500">
              Document Uploaded!
            </p>
            <p className="text-sm text-muted-foreground">
              Your document has been submitted for review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
                dragActive
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-border/50 hover:border-emerald-500/50 hover:bg-muted/50',
                selectedFile && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
              )}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="flex items-center gap-3">
                  <IconFile className="size-8 text-emerald-600" />
                  <div>
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    <IconX className="size-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <IconUpload className="size-10 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    Drop file here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF, Word, or image up to 10MB
                  </p>
                </>
              )}
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="docType">Document Type *</Label>
              <Select value={docType} onValueChange={(v) => setDocType(v as DocType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {docTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Document Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., CPR Certification 2026"
              />
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issuedDate">Issue Date</Label>
                <Input
                  id="issuedDate"
                  type="date"
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isUploading || !selectedFile || !docType || !name}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUploading ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <IconUpload className="mr-2 size-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
