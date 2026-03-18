/**
 * Authentication utilities for portal pages
 * 
 * Provides functions to get the current user's worker/client data
 * based on their Clerk authentication session.
 */

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * Get the current authenticated user's clerkId
 * @throws Redirects to sign-in if not authenticated
 */
export async function getClerkUserId() {
  const { userId } = await auth();
  return userId;
}

/**
 * Get the current portal user (regardless of role)
 * Returns the PortalUser record if found, null otherwise
 */
export async function getCurrentPortalUser() {
  const clerkId = await getClerkUserId();
  
  if (!clerkId) {
    return null;
  }

  const portalUser = await db.portalUser.findUnique({
    where: { clerkId },
  });

  return portalUser;
}

/**
 * Check if current user is an admin or manager
 */
export async function isAdminOrManager() {
  const portalUser = await getCurrentPortalUser();
  return portalUser?.role === 'ADMIN' || portalUser?.role === 'MANAGER';
}

/**
 * Get the current authenticated worker with their user data
 * Returns null if user is not a worker or not found
 */
export async function getCurrentWorker() {
  const clerkId = await getClerkUserId();
  
  if (!clerkId) {
    return null;
  }

  const worker = await db.worker.findFirst({
    where: {
      user: {
        clerkId,
      },
    },
    include: {
      user: true,
    },
  });

  return worker;
}

/**
 * Get the current authenticated worker with full booking data
 */
export async function getCurrentWorkerWithBookings() {
  const clerkId = await getClerkUserId();
  
  if (!clerkId) {
    return null;
  }

  const worker = await db.worker.findFirst({
    where: {
      user: {
        clerkId,
      },
    },
    include: {
      user: true,
      shiftBookings: {
        include: {
          shift: {
            include: {
              client: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: {
          shift: {
            date: 'asc',
          },
        },
      },
    },
  });

  return worker;
}

/**
 * Get the current authenticated worker with compliance documents
 */
export async function getCurrentWorkerWithCompliance() {
  const clerkId = await getClerkUserId();
  
  if (!clerkId) {
    return null;
  }

  const worker = await db.worker.findFirst({
    where: {
      user: {
        clerkId,
      },
    },
    include: {
      user: true,
      complianceDocs: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return worker;
}

/**
 * Get the current authenticated worker with timesheets
 */
export async function getCurrentWorkerWithTimesheets() {
  const clerkId = await getClerkUserId();
  
  if (!clerkId) {
    return null;
  }

  const worker = await db.worker.findFirst({
    where: {
      user: {
        clerkId,
      },
    },
    include: {
      user: true,
      timesheets: {
        orderBy: {
          weekStarting: 'desc',
        },
        include: {
          entries: {
            orderBy: {
              date: 'asc',
            },
          },
        },
      },
    },
  });

  return worker;
}

/**
 * Get the current authenticated worker with full profile data
 */
export async function getCurrentWorkerWithProfile() {
  const clerkId = await getClerkUserId();
  
  if (!clerkId) {
    return null;
  }

  const worker = await db.worker.findFirst({
    where: {
      user: {
        clerkId,
      },
    },
    include: {
      user: true,
      complianceDocs: {
        where: {
          status: 'APPROVED',
        },
        orderBy: {
          expiresAt: 'asc',
        },
      },
      availabilities: {
        orderBy: {
          dayOfWeek: 'asc',
        },
      },
    },
  });

  return worker;
}

/**
 * Get the current authenticated client with their user data
 * Returns null if user is not a client or not found
 */
export async function getCurrentClient() {
  const clerkId = await getClerkUserId();
  
  if (!clerkId) {
    return null;
  }

  const client = await db.client.findFirst({
    where: {
      user: {
        clerkId,
      },
    },
    include: {
      user: true,
    },
  });

  return client;
}

/**
 * Check if the current user is an admin
 */
export async function isCurrentUserAdmin() {
  const clerkId = await getClerkUserId();
  
  if (!clerkId) {
    return false;
  }

  const user = await db.portalUser.findFirst({
    where: {
      clerkId,
      role: {
        in: ['ADMIN', 'MANAGER'],
      },
    },
  });

  return !!user;
}

/**
 * Get the current user's role from the database
 */
export async function getCurrentUserRole() {
  const clerkId = await getClerkUserId();
  
  if (!clerkId) {
    return null;
  }

  const user = await db.portalUser.findFirst({
    where: {
      clerkId,
    },
    select: {
      role: true,
    },
  });

  return user?.role || null;
}
