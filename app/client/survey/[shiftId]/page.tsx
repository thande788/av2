import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { formatDateUS, serialize } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { SurveyForm } from './survey-form';

export const metadata: Metadata = {
  title: 'Care Visit Feedback',
};

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ shiftId: string }>;
}) {
  const { shiftId } = await params;

  const shift = await db.careShift.findUnique({
    where: { id: shiftId },
    include: {
      client: { include: { user: true } },
      bookings: {
        where: { status: 'COMPLETED' },
        include: { worker: { include: { user: true } } },
      },
      survey: true,
    },
  });

  if (!shift || shift.status !== 'COMPLETED') {
    notFound();
  }

  const serialized = serialize(shift);
  const alreadyCompleted = !!(serialized.survey?.completedAt && serialized.survey?.overallRating && serialized.survey.overallRating > 0);

  const workerName = serialized.bookings[0]?.worker?.user
    ? `${serialized.bookings[0].worker.user.firstName} ${serialized.bookings[0].worker.user.lastName}`
    : 'Your caregiver';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Care Visit Feedback</h1>
          <p className="mt-1 text-muted-foreground">
            {formatDateUS(serialized.date, 'weekday-long')} &middot; {serialized.startTime}–{serialized.endTime}
          </p>
          <p className="text-sm text-muted-foreground">Caregiver: {workerName}</p>
        </div>

        {alreadyCompleted ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-6 text-center">
            <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
              Thank you for your feedback!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your response helps us improve our care services.
            </p>
          </div>
        ) : (
          <SurveyForm shiftId={shiftId} />
        )}
      </div>
    </div>
  );
}
