'use server';

import { db } from '@/lib/db';
import { startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { formatDateUS } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface PayrollEntry {
  workerId: string;
  employeeId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  payRate: number;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  timesheetIds: string[];
}

export interface PayrollSummary {
  periodStart: string;
  periodEnd: string;
  totalWorkers: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalHours: number;
  totalRegularPay: number;
  totalOvertimePay: number;
  totalPay: number;
  entries: PayrollEntry[];
}

// =============================================================================
// PAYROLL CALCULATION
// =============================================================================

export async function calculatePayroll(
  periodStart: string,
  periodEnd: string
): Promise<{ success: boolean; data?: PayrollSummary; error?: string }> {
  try {
    const startDate = parseISO(periodStart);
    const endDate = parseISO(periodEnd);

    // Get all approved timesheets within the period
    const timesheets = await db.timesheet.findMany({
      where: {
        status: 'APPROVED',
        weekStarting: {
          gte: startOfWeek(startDate, { weekStartsOn: 1 }),
        },
        weekEnding: {
          lte: endOfWeek(endDate, { weekStartsOn: 1 }),
        },
      },
      include: {
        worker: {
          include: {
            user: true,
          },
        },
      },
    });

    // Group by worker and calculate totals
    const workerPayroll = new Map<string, PayrollEntry>();

    for (const timesheet of timesheets) {
      const workerId = timesheet.workerId;
      const worker = timesheet.worker;
      const payRate = Number(worker.payRate);

      if (!workerPayroll.has(workerId)) {
        workerPayroll.set(workerId, {
          workerId,
          employeeId: worker.employeeId,
          firstName: worker.user.firstName,
          lastName: worker.user.lastName,
          email: worker.user.email,
          payRate,
          regularHours: 0,
          overtimeHours: 0,
          totalHours: 0,
          regularPay: 0,
          overtimePay: 0,
          totalPay: 0,
          timesheetIds: [],
        });
      }

      const entry = workerPayroll.get(workerId)!;
      const regularHours = Number(timesheet.totalRegular);
      const overtimeHours = Number(timesheet.totalOvertime);

      entry.regularHours += regularHours;
      entry.overtimeHours += overtimeHours;
      entry.totalHours += Number(timesheet.totalHours);
      entry.regularPay += regularHours * payRate;
      entry.overtimePay += overtimeHours * payRate * 1.5; // OT at 1.5x
      entry.timesheetIds.push(timesheet.id);
    }

    // Calculate totals for each worker
    const entries = Array.from(workerPayroll.values()).map((entry) => {
      const totalPay = entry.regularPay + entry.overtimePay;
      return {
        ...entry,
        // Round to 2 decimal places
        regularPay: Math.round(entry.regularPay * 100) / 100,
        overtimePay: Math.round(entry.overtimePay * 100) / 100,
        totalPay: Math.round(totalPay * 100) / 100,
      };
    });

    // Sort by last name
    entries.sort((a, b) => a.lastName.localeCompare(b.lastName));

    // Calculate summary totals
    const summary: PayrollSummary = {
      periodStart: formatDateUS(startDate, 'iso'),
      periodEnd: formatDateUS(endDate, 'iso'),
      totalWorkers: entries.length,
      totalRegularHours: entries.reduce((sum, e) => sum + e.regularHours, 0),
      totalOvertimeHours: entries.reduce((sum, e) => sum + e.overtimeHours, 0),
      totalHours: entries.reduce((sum, e) => sum + e.totalHours, 0),
      totalRegularPay: entries.reduce((sum, e) => sum + e.regularPay, 0),
      totalOvertimePay: entries.reduce((sum, e) => sum + e.overtimePay, 0),
      totalPay: entries.reduce((sum, e) => sum + e.totalPay, 0),
      entries,
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error('Failed to calculate payroll:', error);
    return { success: false, error: 'Failed to calculate payroll' };
  }
}

// =============================================================================
// CSV EXPORT
// =============================================================================

export async function generatePayrollCSV(
  periodStart: string,
  periodEnd: string
): Promise<{ success: boolean; csv?: string; error?: string }> {
  const result = await calculatePayroll(periodStart, periodEnd);

  if (!result.success || !result.data) {
    return { success: false, error: result.error || 'Failed to calculate payroll' };
  }

  const { data } = result;

  // CSV Header
  const headers = [
    'Employee ID',
    'First Name',
    'Last Name',
    'Email',
    'Pay Rate',
    'Regular Hours',
    'Overtime Hours',
    'Total Hours',
    'Regular Pay',
    'Overtime Pay',
    'Total Pay',
  ];

  // CSV Rows
  const rows = data.entries.map((entry) => [
    entry.employeeId || '',
    entry.firstName,
    entry.lastName,
    entry.email,
    entry.payRate.toFixed(2),
    entry.regularHours.toFixed(2),
    entry.overtimeHours.toFixed(2),
    entry.totalHours.toFixed(2),
    entry.regularPay.toFixed(2),
    entry.overtimePay.toFixed(2),
    entry.totalPay.toFixed(2),
  ]);

  // Add summary row
  rows.push([
    '',
    'TOTAL',
    '',
    '',
    '',
    data.totalRegularHours.toFixed(2),
    data.totalOvertimeHours.toFixed(2),
    data.totalHours.toFixed(2),
    data.totalRegularPay.toFixed(2),
    data.totalOvertimePay.toFixed(2),
    data.totalPay.toFixed(2),
  ]);

  // Build CSV
  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return { success: true, csv };
}

// =============================================================================
// MARK TIMESHEETS AS PROCESSED
// =============================================================================

export async function markTimesheetsProcessed(
  timesheetIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.timesheet.updateMany({
      where: {
        id: { in: timesheetIds },
        status: 'APPROVED',
      },
      data: {
        status: 'PROCESSED',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to mark timesheets as processed:', error);
    return { success: false, error: 'Failed to update timesheets' };
  }
}
