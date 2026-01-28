'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Download,
  FileText,
  Save,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Application, Job, ApplicationStatus } from '@prisma/client';
import { updateApplicationStatus } from './actions';

type ApplicationWithJob = Application & { job: Job };

const statusColors: Record<ApplicationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  REVIEWING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  INTERVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  OFFERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  HIRED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  WITHDRAWN: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const statusOptions: ApplicationStatus[] = [
  'PENDING',
  'REVIEWING',
  'INTERVIEW',
  'OFFERED',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
];

export function ApplicationDetail({
  application,
}: {
  application: ApplicationWithJob;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [notes, setNotes] = useState(application.internalNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateApplicationStatus(application.id, status, notes);
      router.refresh();
    } catch (error) {
      console.error('Failed to update application:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    status !== application.status || notes !== (application.internalNotes || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/applications">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {application.firstName} {application.lastName}
          </h1>
          <p className="text-muted-foreground">
            Application for {application.job.title}
          </p>
        </div>
        <Badge className={statusColors[application.status]} variant="secondary">
          {application.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${application.email}`}
                    className="text-primary hover:underline"
                  >
                    {application.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${application.phone}`}
                    className="text-primary hover:underline"
                  >
                    {application.phone}
                  </a>
                </div>
              </div>
              {application.city && (
                <div className="flex items-center gap-3 sm:col-span-2">
                  <MapPin className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p>
                      {[
                        application.street,
                        application.city,
                        application.state,
                        application.zip,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Experience & Qualifications */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Experience & Qualifications
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Years of Experience</p>
                <p className="font-medium">{application.yearsExperience} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours Per Week</p>
                <p className="font-medium">{application.hoursPerWeek} hours</p>
              </div>
              {application.certifications.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {application.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Availability */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Availability</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Start</p>
                  <p className="font-medium">
                    {format(application.availableStart, 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Preferred Shifts</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {application.shifts.map((shift) => (
                      <Badge key={shift} variant="outline" className="text-xs">
                        {shift}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Info */}
          {application.additionalInfo && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {application.additionalInfo}
              </p>
            </Card>
          )}

          {/* Documents */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            <div className="space-y-3">
              {application.resumeUrl ? (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <FileText className="size-5 text-muted-foreground" />
                  <span className="flex-1">Resume</span>
                  <Download className="size-4 text-muted-foreground" />
                </a>
              ) : (
                <p className="text-muted-foreground text-sm">No resume uploaded</p>
              )}
              {application.coverLetterUrl && (
                <a
                  href={application.coverLetterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <FileText className="size-5 text-muted-foreground" />
                  <span className="flex-1">Cover Letter</span>
                  <Download className="size-4 text-muted-foreground" />
                </a>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="space-y-4">
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as ApplicationStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Internal Notes
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="size-2 mt-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {format(application.submittedAt, 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              {application.reviewedAt && (
                <div className="flex gap-3">
                  <div className="size-2 mt-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="font-medium">Reviewed</p>
                    <p className="text-sm text-muted-foreground">
                      {format(application.reviewedAt, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Job Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Position Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Job Title</p>
                <p className="font-medium">{application.job.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium capitalize">
                  {application.job.department.toLowerCase().replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium capitalize">
                  {application.job.type.toLowerCase().replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Salary Range</p>
                <p className="font-medium">
                  ${application.job.salaryMin.toLocaleString()} - $
                  {application.job.salaryMax.toLocaleString()}{' '}
                  {application.job.salaryPeriod === 'HOURLY' ? '/hr' : '/yr'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
