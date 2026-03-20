import { Suspense } from 'react';
import { PayrollPreview } from './payroll-preview';

export const metadata = {
  title: 'Payroll',
  description: 'Calculate and preview payroll',
};

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
        <p className="text-muted-foreground">
          Calculate payroll for approved timesheets and export to CSV
        </p>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading...</div>}>
        <PayrollPreview />
      </Suspense>
    </div>
  );
}
