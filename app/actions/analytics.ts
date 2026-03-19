'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { subMonths, startOfMonth, endOfMonth, format, getDay, getHours } from 'date-fns';

// ---------- helpers ----------

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

// ---------- types ----------

export interface MonthlyCount {
  month: string; // "Jan", "Feb", …
  applications: number;
  inquiries: number;
  contacts: number;
}

export interface FunnelStep {
  stage: string;
  count: number;
}

export interface DepartmentSlice {
  department: string;
  count: number;
}

export interface ServiceSourceSlice {
  service: string;
  count: number;
}

export interface PeakHourData {
  hour: number;
  label: string;
  count: number;
}

export interface PeakDayData {
  day: string;
  count: number;
}

export interface AnalyticsSummary {
  totalApplications: number;
  totalInquiries: number;
  totalContacts: number;
  conversionRate: number; // hired / total applications %
  monthlyTrends: MonthlyCount[];
  funnel: FunnelStep[];
  departmentBreakdown: DepartmentSlice[];
  serviceSourceBreakdown: ServiceSourceSlice[];
  peakHours: PeakHourData[];
  peakDays: PeakDayData[];
}

// ---------- main fetcher ----------

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  await requireAdmin();

  const now = new Date();

  // Fetch everything we need in one parallel batch
  const [
    totalApplications,
    totalInquiries,
    totalContacts,
    hiredCount,
    applications,
    inquiries,
    contacts,
    applicationsByDept,
    inquiriesByService,
  ] = await Promise.all([
    db.application.count(),
    db.serviceInquiry.count(),
    db.contactSubmission.count(),
    db.application.count({ where: { status: 'HIRED' } }),
    // Last 6 months of applications with submittedAt
    db.application.findMany({
      where: { submittedAt: { gte: startOfMonth(subMonths(now, 5)) } },
      select: { submittedAt: true, status: true },
    }),
    db.serviceInquiry.findMany({
      where: { submittedAt: { gte: startOfMonth(subMonths(now, 5)) } },
      select: { submittedAt: true },
    }),
    db.contactSubmission.findMany({
      where: { submittedAt: { gte: startOfMonth(subMonths(now, 5)) } },
      select: { submittedAt: true },
    }),
    // Department breakdown via groupBy on job relation
    db.application.groupBy({
      by: ['jobId'],
      _count: { id: true },
    }),
    // Service source breakdown
    db.serviceInquiry.groupBy({
      by: ['serviceType'],
      _count: { id: true },
    }),
  ]);

  // Also fetch job departments for the department breakdown
  const jobIds = applicationsByDept.map((a) => a.jobId);
  const jobs =
    jobIds.length > 0
      ? await db.job.findMany({
          where: { id: { in: jobIds } },
          select: { id: true, department: true },
        })
      : [];

  const jobDeptMap = new Map(jobs.map((j) => [j.id, j.department]));

  // ---- Monthly trends (last 6 months) ----
  const months: MonthlyCount[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const mStart = startOfMonth(d);
    const mEnd = endOfMonth(d);
    const label = format(d, 'MMM');

    months.push({
      month: label,
      applications: applications.filter(
        (a) => a.submittedAt >= mStart && a.submittedAt <= mEnd
      ).length,
      inquiries: inquiries.filter(
        (a) => a.submittedAt >= mStart && a.submittedAt <= mEnd
      ).length,
      contacts: contacts.filter(
        (a) => a.submittedAt >= mStart && a.submittedAt <= mEnd
      ).length,
    });
  }

  // ---- Conversion funnel ----
  const statusCounts = new Map<string, number>();
  const allApps = await db.application.groupBy({
    by: ['status'],
    _count: { id: true },
  });
  for (const s of allApps) {
    statusCounts.set(s.status, s._count.id);
  }

  const funnel: FunnelStep[] = [
    { stage: 'Submitted', count: totalApplications },
    { stage: 'Reviewing', count: statusCounts.get('REVIEWING') ?? 0 },
    { stage: 'Interview', count: statusCounts.get('INTERVIEW') ?? 0 },
    { stage: 'Offered', count: statusCounts.get('OFFERED') ?? 0 },
    { stage: 'Hired', count: statusCounts.get('HIRED') ?? 0 },
  ];

  // ---- Department breakdown ----
  const deptCounts = new Map<string, number>();
  for (const row of applicationsByDept) {
    const dept = jobDeptMap.get(row.jobId) ?? 'Unknown';
    deptCounts.set(dept, (deptCounts.get(dept) ?? 0) + row._count.id);
  }
  const departmentBreakdown: DepartmentSlice[] = Array.from(deptCounts, ([department, count]) => ({
    department: formatDepartment(department),
    count,
  }));

  // ---- Service source breakdown ----
  const serviceSourceBreakdown: ServiceSourceSlice[] = inquiriesByService.map(
    (s) => ({
      service: s.serviceType,
      count: s._count.id,
    })
  );

  // ---- Peak hours & days (all applications) ----
  const allSubmissions = [
    ...applications.map((a) => a.submittedAt),
    ...inquiries.map((a) => a.submittedAt),
    ...contacts.map((a) => a.submittedAt),
  ];

  const hourCounts = new Array(24).fill(0) as number[];
  const dayCountsArr = new Array(7).fill(0) as number[];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (const ts of allSubmissions) {
    hourCounts[getHours(ts)]++;
    dayCountsArr[getDay(ts)]++;
  }

  const peakHours: PeakHourData[] = hourCounts.map((count, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, '0')}:00`,
    count,
  }));

  const peakDays: PeakDayData[] = dayCountsArr.map((count, i) => ({
    day: dayLabels[i],
    count,
  }));

  const conversionRate =
    totalApplications > 0
      ? Math.round((hiredCount / totalApplications) * 1000) / 10
      : 0;

  return {
    totalApplications,
    totalInquiries,
    totalContacts,
    conversionRate,
    monthlyTrends: months,
    funnel,
    departmentBreakdown,
    serviceSourceBreakdown,
    peakHours,
    peakDays,
  };
}

function formatDepartment(dept: string): string {
  switch (dept) {
    case 'CAREGIVING':
      return 'Caregiving';
    case 'ADMINISTRATIVE':
      return 'Administrative';
    case 'NURSING':
      return 'Nursing';
    default:
      return dept;
  }
}
