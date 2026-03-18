'use client';

import { useState, useTransition } from 'react';
import { startOfWeek, endOfWeek, subWeeks, addWeeks } from 'date-fns';
import { formatDateUS } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  IconCalculator,
  IconDownload,
  IconLoader2,
  IconCurrencyDollar,
  IconClock,
  IconUsers,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { calculatePayroll, generatePayrollCSV, type PayrollSummary } from '@/app/actions/payroll';

export function PayrollPreview() {
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payrollData, setPayrollData] = useState<PayrollSummary | null>(null);

  // Default to last complete week
  const today = new Date();
  const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });

  const [periodStart, setPeriodStart] = useState(formatDateUS(lastWeekStart, 'iso'));
  const [periodEnd, setPeriodEnd] = useState(formatDateUS(lastWeekEnd, 'iso'));

  const handleCalculate = () => {
    setError(null);
    startTransition(async () => {
      const result = await calculatePayroll(periodStart, periodEnd);
      if (result.success && result.data) {
        setPayrollData(result.data);
      } else {
        setError(result.error || 'Failed to calculate payroll');
      }
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const result = await generatePayrollCSV(periodStart, periodEnd);
      if (result.success && result.csv) {
        // Download CSV
        const blob = new Blob([result.csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payroll_${periodStart}_to_${periodEnd}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError(result.error || 'Failed to export payroll');
      }
    } catch {
      setError('Failed to export payroll');
    } finally {
      setIsExporting(false);
    }
  };

  const goToPreviousWeek = () => {
    const start = new Date(periodStart);
    const newStart = subWeeks(start, 1);
    setPeriodStart(formatDateUS(newStart, 'iso'));
    setPeriodEnd(formatDateUS(endOfWeek(newStart, { weekStartsOn: 1 }), 'iso'));
    setPayrollData(null);
  };

  const goToNextWeek = () => {
    const start = new Date(periodStart);
    const newStart = addWeeks(start, 1);
    setPeriodStart(formatDateUS(newStart, 'iso'));
    setPeriodEnd(formatDateUS(endOfWeek(newStart, { weekStartsOn: 1 }), 'iso'));
    setPayrollData(null);
  };

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalculator className="size-5" />
            Pay Period
          </CardTitle>
          <CardDescription>
            Select the date range for payroll calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <IconChevronLeft className="size-4" />
              </Button>
              <div>
                <Label htmlFor="period-start" className="text-xs">Start Date</Label>
                <Input
                  id="period-start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => {
                    setPeriodStart(e.target.value);
                    setPayrollData(null);
                  }}
                  className="w-40"
                />
              </div>
              <span className="text-muted-foreground">to</span>
              <div>
                <Label htmlFor="period-end" className="text-xs">End Date</Label>
                <Input
                  id="period-end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => {
                    setPeriodEnd(e.target.value);
                    setPayrollData(null);
                  }}
                  className="w-40"
                />
              </div>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <IconChevronRight className="size-4" />
              </Button>
            </div>
            <Button onClick={handleCalculate} disabled={isPending}>
              {isPending ? (
                <IconLoader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <IconCalculator className="size-4 mr-2" />
              )}
              Calculate Payroll
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {payrollData && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <IconUsers className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{payrollData.totalWorkers}</p>
                    <p className="text-sm text-muted-foreground">Workers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <IconClock className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{payrollData.totalHours.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <IconClock className="size-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{payrollData.totalOvertimeHours.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">OT Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <IconCurrencyDollar className="size-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${payrollData.totalPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p className="text-sm text-muted-foreground">Total Pay</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payroll Details</CardTitle>
                  <CardDescription>
                    {formatDateUS(new Date(payrollData.periodStart), 'medium-no-year')} - {formatDateUS(new Date(payrollData.periodEnd))}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                  {isExporting ? (
                    <IconLoader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <IconDownload className="size-4 mr-2" />
                  )}
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {payrollData.entries.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No approved timesheets found for this period
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">Employee</th>
                        <th className="pb-3 pr-4 font-medium text-right">Rate</th>
                        <th className="pb-3 pr-4 font-medium text-right">Regular</th>
                        <th className="pb-3 pr-4 font-medium text-right">OT</th>
                        <th className="pb-3 pr-4 font-medium text-right">Total Hrs</th>
                        <th className="pb-3 pr-4 font-medium text-right">Regular Pay</th>
                        <th className="pb-3 pr-4 font-medium text-right">OT Pay</th>
                        <th className="pb-3 font-medium text-right">Total Pay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payrollData.entries.map((entry) => (
                        <tr key={entry.workerId} className="text-sm">
                          <td className="py-3 pr-4">
                            <div>
                              <p className="font-medium">{entry.firstName} {entry.lastName}</p>
                              <p className="text-xs text-muted-foreground">{entry.employeeId || 'No ID'}</p>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-right">${entry.payRate.toFixed(2)}</td>
                          <td className="py-3 pr-4 text-right">{entry.regularHours.toFixed(1)}</td>
                          <td className="py-3 pr-4 text-right">
                            {entry.overtimeHours > 0 ? (
                              <span className="text-amber-600">{entry.overtimeHours.toFixed(1)}</span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 pr-4 text-right font-medium">{entry.totalHours.toFixed(1)}</td>
                          <td className="py-3 pr-4 text-right">${entry.regularPay.toFixed(2)}</td>
                          <td className="py-3 pr-4 text-right">
                            {entry.overtimePay > 0 ? (
                              <span className="text-amber-600">${entry.overtimePay.toFixed(2)}</span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 text-right font-semibold text-emerald-600">
                            ${entry.totalPay.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-semibold">
                        <td className="pt-3 pr-4">TOTAL</td>
                        <td className="pt-3 pr-4"></td>
                        <td className="pt-3 pr-4 text-right">{payrollData.totalRegularHours.toFixed(1)}</td>
                        <td className="pt-3 pr-4 text-right text-amber-600">{payrollData.totalOvertimeHours.toFixed(1)}</td>
                        <td className="pt-3 pr-4 text-right">{payrollData.totalHours.toFixed(1)}</td>
                        <td className="pt-3 pr-4 text-right">${payrollData.totalRegularPay.toFixed(2)}</td>
                        <td className="pt-3 pr-4 text-right text-amber-600">${payrollData.totalOvertimePay.toFixed(2)}</td>
                        <td className="pt-3 text-right text-emerald-600">${payrollData.totalPay.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
