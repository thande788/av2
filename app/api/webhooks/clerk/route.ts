/**
 * Clerk Webhook Handler
 *
 * Syncs Clerk users to the PortalUser table in our database.
 * Handles user.created, user.updated, and user.deleted events.
 *
 * Setup:
 * 1. Create a webhook in Clerk Dashboard (https://dashboard.clerk.com)
 * 2. Set the endpoint URL to: https://your-domain.com/api/webhooks/clerk
 * 3. Select events: user.created, user.updated, user.deleted
 * 4. Copy the Signing Secret and add to .env.local as CLERK_WEBHOOK_SECRET
 */

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { UserRole, UserStatus } from '@prisma/client';

// Clerk webhook event types
type ClerkWebhookEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    email_addresses: Array<{
      id: string;
      email_address: string;
    }>;
    primary_email_address_id: string;
    phone_numbers?: Array<{
      id: string;
      phone_number: string;
    }>;
    primary_phone_number_id?: string;
    first_name: string | null;
    last_name: string | null;
    public_metadata: {
      role?: string;
      status?: string;
    };
    unsafe_metadata?: {
      role?: string;
      [key: string]: unknown;
    };
    private_metadata?: Record<string, unknown>;
    created_at: number;
    updated_at: number;
  };
};

/**
 * Get primary email from Clerk user data
 */
function getPrimaryEmail(data: ClerkWebhookEvent['data']): string | null {
  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  );
  return primaryEmail?.email_address ?? data.email_addresses[0]?.email_address ?? null;
}

/**
 * Get primary phone from Clerk user data
 */
function getPrimaryPhone(data: ClerkWebhookEvent['data']): string | null {
  if (!data.phone_numbers?.length) return null;
  const primaryPhone = data.phone_numbers.find(
    (p) => p.id === data.primary_phone_number_id
  );
  return primaryPhone?.phone_number ?? data.phone_numbers[0]?.phone_number ?? null;
}

/**
 * Map Clerk role metadata to UserRole enum
 */
function mapRole(roleString?: string): UserRole {
  if (!roleString) return UserRole.CLIENT; // Default role

  const roleMap: Record<string, UserRole> = {
    admin: UserRole.ADMIN,
    manager: UserRole.MANAGER,
    caregiver: UserRole.CAREGIVER,
    client: UserRole.CLIENT,
  };

  return roleMap[roleString.toLowerCase()] ?? UserRole.CLIENT;
}

/**
 * Map Clerk status metadata to UserStatus enum
 */
function mapStatus(statusString?: string): UserStatus {
  if (!statusString) return UserStatus.PENDING; // Default for new users

  const statusMap: Record<string, UserStatus> = {
    pending: UserStatus.PENDING,
    active: UserStatus.ACTIVE,
    inactive: UserStatus.INACTIVE,
    terminated: UserStatus.TERMINATED,
  };

  return statusMap[statusString.toLowerCase()] ?? UserStatus.PENDING;
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with the secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: ClerkWebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  const { type, data } = evt;
  const clerkId = data.id;
  const email = getPrimaryEmail(data);
  const phone = getPrimaryPhone(data);
  const firstName = data.first_name ?? '';
  const lastName = data.last_name ?? '';
  // Check both public_metadata and unsafe_metadata for role (signup sets unsafe_metadata)
  const roleString = data.public_metadata?.role || data.unsafe_metadata?.role;
  const role = mapRole(roleString);
  const status = mapStatus(data.public_metadata?.status);

  console.log(`[Clerk Webhook] Received ${type} for user ${clerkId}`);

  try {
    switch (type) {
      case 'user.created': {
        if (!email) {
          console.error('No email found for new user');
          return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
          );
        }

        // Check if user already exists (idempotency)
        const existing = await db.portalUser.findUnique({
          where: { clerkId },
        });

        if (existing) {
          console.log(`User ${clerkId} already exists, skipping creation`);
          return NextResponse.json({ success: true, action: 'skipped' });
        }

        // Create new portal user
        await db.portalUser.create({
          data: {
            clerkId,
            email,
            phone,
            firstName,
            lastName,
            role,
            status: UserStatus.PENDING, // New users always start as pending
          },
        });

        // Sync role to Clerk publicMetadata so middleware can access it
        // This is needed because signup sets role in unsafeMetadata which isn't in sessionClaims
        if (roleString && !data.public_metadata?.role) {
          try {
            const client = await clerkClient();
            await client.users.updateUserMetadata(clerkId, {
              publicMetadata: {
                ...data.public_metadata,
                role: roleString,
              },
            });
            console.log(`Synced role '${roleString}' to Clerk publicMetadata for ${clerkId}`);
          } catch (metaErr) {
            console.error('Failed to sync role to Clerk:', metaErr);
            // Don't fail the webhook - user is created, they can retry login
          }
        }

        console.log(`Created PortalUser for ${email} (${clerkId})`)
        break;
      }

      case 'user.updated': {
        if (!email) {
          console.error('No email found for user update');
          return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
          );
        }

        // Check if user exists
        const existingUser = await db.portalUser.findUnique({
          where: { clerkId },
        });

        if (!existingUser) {
          // User doesn't exist, create them (handles out-of-order webhooks)
          await db.portalUser.create({
            data: {
              clerkId,
              email,
              phone,
              firstName,
              lastName,
              role,
              status,
            },
          });
          console.log(`Created PortalUser on update for ${email} (${clerkId})`);
        } else {
          // Update existing user
          await db.portalUser.update({
            where: { clerkId },
            data: {
              email,
              phone,
              firstName,
              lastName,
              role,
              status,
              lastLoginAt: new Date(),
            },
          });
          console.log(`Updated PortalUser for ${email} (${clerkId})`);
        }
        break;
      }

      case 'user.deleted': {
        // Soft delete: set status to TERMINATED rather than hard delete
        // This preserves historical data and audit trails
        const userToDelete = await db.portalUser.findUnique({
          where: { clerkId },
        });

        if (userToDelete) {
          await db.portalUser.update({
            where: { clerkId },
            data: {
              status: UserStatus.TERMINATED,
            },
          });
          console.log(`Soft-deleted PortalUser ${clerkId}`);
        } else {
          console.log(`User ${clerkId} not found for deletion, skipping`);
        }
        break;
      }

      default: {
        console.log(`Unhandled webhook event type: ${type}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
