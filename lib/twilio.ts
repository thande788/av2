/**
 * Twilio SMS Integration
 *
 * Provides SMS functionality via Twilio for shift notifications,
 * reminders, and other alerts.
 *
 * Required environment variables:
 * - TWILIO_ACCOUNT_SID: Twilio account SID
 * - TWILIO_AUTH_TOKEN: Twilio auth token
 * - TWILIO_PHONE_NUMBER: Twilio phone number (E.164 format)
 *
 * @see https://www.twilio.com/docs/sms/quickstart/node
 */

// ============================================
// Types
// ============================================

export interface SMSMessage {
  to: string;
  body: string;
  statusCallback?: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  fallback?: boolean;
}

export interface TwilioMessageResponse {
  sid: string;
  status: string;
  to: string;
  body: string;
  dateCreated: string;
}

export interface ShiftNotificationData {
  workerName: string;
  workerPhone: string;
  shiftId: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  address: string;
  rate: string;
}

// ============================================
// Twilio Client
// ============================================

class TwilioClient {
  private accountSid: string | undefined;
  private authToken: string | undefined;
  private phoneNumber: string | undefined;
  private baseUrl = 'https://api.twilio.com/2010-04-01';

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  /**
   * Check if Twilio is configured
   */
  isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.phoneNumber);
  }

  /**
   * Send an SMS message
   */
  async sendSMS(message: SMSMessage): Promise<SMSResult> {
    // Development fallback - log instead of sending
    if (!this.isConfigured()) {
      console.log('[Twilio Fallback] SMS would be sent:');
      console.log(`  To: ${message.to}`);
      console.log(`  Body: ${message.body}`);
      return {
        success: true,
        messageId: `dev_${Date.now()}`,
        fallback: true,
      };
    }

    try {
      // Format phone number to E.164
      const toPhone = this.formatPhoneNumber(message.to);

      const url = `${this.baseUrl}/Accounts/${this.accountSid}/Messages.json`;

      const params = new URLSearchParams();
      params.append('To', toPhone);
      params.append('From', this.phoneNumber!);
      params.append('Body', message.body);

      if (message.statusCallback) {
        params.append('StatusCallback', message.statusCallback);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(`${this.accountSid}:${this.authToken}`).toString(
              'base64'
            ),
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Twilio] SMS send failed:', errorData);
        return {
          success: false,
          error: errorData.message || 'Failed to send SMS',
        };
      }

      const data = (await response.json()) as TwilioMessageResponse;

      return {
        success: true,
        messageId: data.sid,
      };
    } catch (error) {
      console.error('[Twilio] SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Format phone number to E.164
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // If it's a 10-digit US number, add +1
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }

    // If it already has country code
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }

    // If it's already in E.164 format
    if (phone.startsWith('+')) {
      return phone;
    }

    // Default: assume US number and add +1
    return `+1${cleaned}`;
  }

  /**
   * Send bulk SMS messages (with rate limiting)
   */
  async sendBulkSMS(
    messages: SMSMessage[],
    delayMs = 100
  ): Promise<SMSResult[]> {
    const results: SMSResult[] = [];

    for (let i = 0; i < messages.length; i++) {
      const result = await this.sendSMS(messages[i]);
      results.push(result);

      // Rate limit: don't exceed 1/second for Twilio trial accounts
      if (i < messages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}

// Singleton instance
export const twilio = new TwilioClient();

// ============================================
// Message Templates
// ============================================

/**
 * Generate shift notification SMS body
 */
export function createShiftNotificationMessage(data: ShiftNotificationData): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://angeltouch.services';
  const bookingLink = `${baseUrl}/book/${data.shiftId}`;

  return `Hi ${data.workerName}! A new shift is available:

📅 ${data.date}
⏰ ${data.startTime} - ${data.endTime}
👤 ${data.clientName}
📍 ${data.address}
💵 ${data.rate}/hr

Book now: ${bookingLink}

Reply STOP to opt out.`;
}

/**
 * Generate shift confirmation SMS
 */
export function createShiftConfirmationMessage(data: {
  workerName: string;
  clientName: string;
  date: string;
  startTime: string;
  address: string;
}): string {
  return `✅ Shift confirmed, ${data.workerName}!

📅 ${data.date} at ${data.startTime}
👤 ${data.clientName}
📍 ${data.address}

We'll send a reminder 24 hours before. Questions? Call (978) 555-1234.`;
}

/**
 * Generate shift reminder SMS (sent 24h before)
 */
export function createShiftReminderMessage(data: {
  workerName: string;
  clientName: string;
  date: string;
  startTime: string;
  address: string;
}): string {
  return `⏰ Reminder, ${data.workerName}!

Your shift is tomorrow:
📅 ${data.date} at ${data.startTime}
👤 ${data.clientName}
📍 ${data.address}

Can't make it? Call us ASAP at (978) 555-1234.`;
}

/**
 * Generate shift cancellation SMS
 */
export function createShiftCancellationMessage(data: {
  workerName: string;
  date: string;
  clientName: string;
  reason?: string;
}): string {
  const reasonText = data.reason ? ` Reason: ${data.reason}` : '';
  return `❌ Shift cancelled, ${data.workerName}.

The shift on ${data.date} with ${data.clientName} has been cancelled.${reasonText}

Questions? Call (978) 555-1234.`;
}
