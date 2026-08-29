const baseUrl = process.env.APP_BASE_URL;
const cronSecret = process.env.CRON_SECRET;
const dayBeforeHour = Number(process.env.DAY_BEFORE_UTC_HOUR || '18');

if (!baseUrl) {
  throw new Error('APP_BASE_URL is required');
}

if (!cronSecret) {
  throw new Error('CRON_SECRET is required');
}

async function call(type) {
  const url = `${baseUrl.replace(/\/$/, '')}/api/cron/shift-reminders?type=${type}`;
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${cronSecret}`,
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${type} reminder failed: ${response.status} ${text}`);
  }

  console.log(`[shift-reminders] ${type}: ${text}`);
}

const hour = new Date().getUTCHours();
await call('one-hour');

if (hour === dayBeforeHour) {
  await call('day-before');
}
