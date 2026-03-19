'use server';

import { db } from '@/lib/db';

export interface MatchScore {
  workerId: string;
  workerName: string;
  clientId: string;
  score: number; // 0-100
  factors: {
    skills: number;      // 0-100: Has required skills
    proximity: number;   // 0-100: Distance to client (ZIP-based)
    availability: number; // 0-100: Availability overlap
    history: number;     // 0-100: Past performance with this client
    preference: number;  // 0-100: Client/worker preferences
    compliance: number;  // 0-100: Compliance status
    rating: number;      // 0-100: Average review rating
  };
}

interface MatchWeights {
  skills: number;
  proximity: number;
  availability: number;
  history: number;
  preference: number;
  compliance: number;
  rating: number;
}

const DEFAULT_WEIGHTS: MatchWeights = {
  skills: 25,
  proximity: 15,
  availability: 15,
  history: 15,
  preference: 10,
  compliance: 10,
  rating: 10,
};

/**
 * Calculate match score between a worker and a client/shift combo.
 */
export async function calculateMatchScore(
  workerId: string,
  clientId: string,
  shiftId?: string,
  weights: MatchWeights = DEFAULT_WEIGHTS
): Promise<MatchScore | null> {
  const [worker, client] = await Promise.all([
    db.worker.findUnique({
      where: { id: workerId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        availabilities: true,
        reviews: { select: { rating: true } },
        shiftBookings: {
          where: {
            status: { in: ['COMPLETED', 'CONFIRMED', 'ACCEPTED'] },
            shift: { clientId },
          },
          include: {
            shift: { select: { id: true } },
          },
        },
      },
    }),
    db.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    }),
  ]);

  if (!worker || !client) return null;

  // Fetch shift if provided
  const shift = shiftId
    ? await db.careShift.findUnique({ where: { id: shiftId } })
    : null;

  // 1. Skills match
  const requiredSkills = shift?.skillsRequired || client.specialNeeds || [];
  const workerSkills = worker.skills || [];
  let skillsScore = 100;
  if (requiredSkills.length > 0) {
    const matching = requiredSkills.filter((s) =>
      workerSkills.some((ws) => ws.toLowerCase().includes(s.toLowerCase()))
    );
    skillsScore = Math.round((matching.length / requiredSkills.length) * 100);
  }

  // 2. Proximity match (ZIP-based, same ZIP = 100, same city = 60, else 0)
  let proximityScore = 0;
  if (worker.zip && client.zip) {
    if (worker.zip === client.zip) {
      proximityScore = 100;
    } else if (worker.city && client.city && worker.city.toLowerCase() === client.city.toLowerCase()) {
      proximityScore = 60;
    } else if (worker.state && client.state && worker.state === client.state) {
      proximityScore = 30;
    }
  }

  // 3. Availability match
  let availabilityScore = 0;
  if (shift) {
    const shiftDay = new Date(shift.date).getUTCDay();
    const hasSlot = worker.availabilities.some(
      (a) =>
        a.dayOfWeek === shiftDay &&
        a.isAvailable &&
        a.startTime <= shift.startTime &&
        a.endTime >= shift.endTime
    );
    availabilityScore = hasSlot ? 100 : 0;
  } else {
    // Without a specific shift, score based on general availability breadth
    const daysAvailable = new Set(worker.availabilities.filter((a) => a.isAvailable).map((a) => a.dayOfWeek));
    availabilityScore = Math.min(100, Math.round((daysAvailable.size / 5) * 100)); // 5 weekdays = 100
  }

  // 4. History score (based on past bookings with same client)
  const pastBookings = worker.shiftBookings.length;
  const historyScore = Math.min(100, pastBookings * 25); // 4 past shifts = 100

  // 5. Preference score (language overlap, special needs)
  let preferenceScore = 50; // Base
  const clientPreferredTimes = client.preferredTimes || [];
  if (worker.languages.length > 0) {
    preferenceScore += 25; // Multilingual bonus
  }
  if (shift && clientPreferredTimes.length > 0) {
    const startHour = parseInt(shift.startTime.split(':')[0], 10);
    const shiftPeriod =
      startHour < 12 ? 'MORNING' : startHour < 17 ? 'AFTERNOON' : 'EVENING';
    if (clientPreferredTimes.includes(shiftPeriod)) {
      preferenceScore += 25;
    }
  }
  preferenceScore = Math.min(100, preferenceScore);

  // 6. Compliance score
  const complianceScore =
    worker.complianceStatus === 'COMPLIANT' ? 100 :
    worker.complianceStatus === 'PENDING' ? 50 : 0;

  // 7. Rating score
  const ratings = worker.reviews.map((r) => r.rating);
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 3;
  const ratingScore = Math.round((avgRating / 5) * 100);

  const factors = {
    skills: skillsScore,
    proximity: proximityScore,
    availability: availabilityScore,
    history: historyScore,
    preference: preferenceScore,
    compliance: complianceScore,
    rating: ratingScore,
  };

  // Weighted average
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const score = Math.round(
    (factors.skills * weights.skills +
      factors.proximity * weights.proximity +
      factors.availability * weights.availability +
      factors.history * weights.history +
      factors.preference * weights.preference +
      factors.compliance * weights.compliance +
      factors.rating * weights.rating) /
      totalWeight
  );

  return {
    workerId,
    workerName: `${worker.user.firstName} ${worker.user.lastName}`,
    clientId,
    score,
    factors,
  };
}

/**
 * Get ranked match scores for all active workers against a client/shift.
 */
export async function getRankedMatches(
  clientId: string,
  shiftId?: string
): Promise<{ success: boolean; matches?: MatchScore[]; error?: string }> {
  try {
    const workers = await db.worker.findMany({
      where: { user: { status: 'ACTIVE' } },
      select: { id: true },
    });

    const scores = await Promise.all(
      workers.map((w) => calculateMatchScore(w.id, clientId, shiftId))
    );

    const matches = scores
      .filter((s): s is MatchScore => s !== null)
      .sort((a, b) => b.score - a.score);

    return { success: true, matches };
  } catch (error) {
    console.error('Failed to get ranked matches:', error);
    return { success: false, error: 'Failed to calculate matches' };
  }
}
