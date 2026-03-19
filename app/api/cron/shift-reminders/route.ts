import { NextRequest, NextResponse } from 'next/server';
import { sendShiftReminders } from '@/app/actions/shift-reminders';

/**
 * Cron-triggered API route for sending shift reminders.
 *
 * Usage (Vercel Cron):
 * - Day-before: GET /api/cron/shift-reminders?type=day-before (daily at 6 PM)
 * - One-hour: GET /api/cron/shift-reminders?type=one-hour (hourly)
 *
 * Protected by CRON_SECRET environment variable.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'day-before' | 'one-hour' | null;

  if (!type || !['day-before', 'one-hour'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid type parameter. Use "day-before" or "one-hour".' },
      { status: 400 }
    );
  }

  try {
    const result = await sendShiftReminders(type);

    return NextResponse.json({
      ok: true,
      type,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[cron/shift-reminders] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
