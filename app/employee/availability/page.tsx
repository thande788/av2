import type { Metadata } from 'next';
import { getMyAvailability } from '@/app/actions/availability';
import { AvailabilityCalendar } from './availability-calendar';
import { serialize } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Availability',
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default async function AvailabilityPage() {
  const result = await getMyAvailability();

  const availabilities = result.success ? serialize(result.availabilities) : [];

  // Build a map: dayOfWeek -> slots
  const slotsByDay: Record<number, Array<{ startTime: string; endTime: string; isAvailable: boolean }>> = {};
  for (let i = 0; i < 7; i++) {
    slotsByDay[i] = [];
  }
  for (const a of availabilities) {
    slotsByDay[a.dayOfWeek].push({
      startTime: a.startTime,
      endTime: a.endTime,
      isAvailable: a.isAvailable,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Availability</h1>
        <p className="mt-1 text-muted-foreground">
          Set your weekly availability. Click time blocks to toggle. This helps us match you with shifts.
        </p>
      </div>
      <AvailabilityCalendar initialSlots={slotsByDay} days={DAYS} />
    </div>
  );
}
