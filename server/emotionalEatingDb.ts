import { getDb } from "./db";
import { emotionalEatingLogs, medications, medicationLogs } from "../drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

/**
 * Emotional Eating Database Functions
 */

// Log an emotional eating episode
export async function logEmotionalEating(data: {
  userId: number;
  triggerEmotion: "stress" | "anxiety" | "sadness" | "boredom" | "anger" | "loneliness" | "other";
  triggerDescription?: string;
  situation?: string;
  foodConsumed: string;
  estimatedCalories?: number;
  intensity: number;
  copingStrategyUsed?: string;
  effectivenessRating?: number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [log] = await db.insert(emotionalEatingLogs).values(data).returning();
  return log;
}

// Get emotional eating history for a user
export async function getEmotionalEatingHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(emotionalEatingLogs)
    .where(eq(emotionalEatingLogs.userId, userId))
    .orderBy(desc(emotionalEatingLogs.timestamp))
    .limit(limit);
}

// Get emotional eating logs for a date range
export async function getEmotionalEatingByDateRange(
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(emotionalEatingLogs)
    .where(
      and(
        eq(emotionalEatingLogs.userId, userId),
        gte(emotionalEatingLogs.timestamp, startDate),
        lte(emotionalEatingLogs.timestamp, endDate)
      )
    )
    .orderBy(desc(emotionalEatingLogs.timestamp));
}

// Get emotional eating analytics (trigger patterns, most common emotions, etc.)
export async function getEmotionalEatingAnalytics(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return null;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all logs in the period
  const logs = await db
    .select()
    .from(emotionalEatingLogs)
    .where(
      and(
        eq(emotionalEatingLogs.userId, userId),
        gte(emotionalEatingLogs.timestamp, startDate)
      )
    );

  // Calculate analytics
  const totalEpisodes = logs.length;
  
  // Count by trigger emotion
  const emotionCounts: Record<string, number> = {};
  logs.forEach((log: any) => {
    emotionCounts[log.triggerEmotion] = (emotionCounts[log.triggerEmotion] || 0) + 1;
  });

  // Calculate average intensity
  const avgIntensity = logs.length > 0
    ? logs.reduce((sum: number, log: any) => sum + log.intensity, 0) / logs.length
    : 0;

  // Count episodes with coping strategies
  const episodesWithCoping = logs.filter((log: any) => log.copingStrategyUsed).length;
  
  // Calculate average effectiveness of coping strategies
  const copingLogs = logs.filter((log: any) => log.effectivenessRating !== null);
  const avgCopingEffectiveness = copingLogs.length > 0
    ? copingLogs.reduce((sum: number, log: any) => sum + (log.effectivenessRating || 0), 0) / copingLogs.length
    : 0;

  // Find most common time of day (hour)
  const hourCounts: Record<number, number> = {};
  logs.forEach((log: any) => {
    const hour = new Date(log.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const mostCommonHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    totalEpisodes,
    emotionCounts,
    avgIntensity: Math.round(avgIntensity * 10) / 10,
    episodesWithCoping,
    copingUsageRate: totalEpisodes > 0 ? Math.round((episodesWithCoping / totalEpisodes) * 100) : 0,
    avgCopingEffectiveness: Math.round(avgCopingEffectiveness * 10) / 10,
    mostCommonHour: mostCommonHour ? parseInt(mostCommonHour) : null,
    periodDays: days,
  };
}

/**
 * Medication Database Functions
 */

// Add a new medication
export async function addMedication(data: {
  userId: number;
  name: string;
  type: "glp1_agonist" | "ssri" | "stimulant" | "combination" | "other";
  dosage: string;
  frequency: string;
  startDate: string; // YYYY-MM-DD format
  endDate?: string;
  prescribedFor?: string;
  sideEffects?: string;
  effectiveness?: number;
  notes?: string;
  active?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [medication] = await db.insert(medications).values(data as any).returning();
  return medication;
}

// Get all medications for a user
export async function getMedications(userId: number, activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  if (activeOnly) {
    return await db
      .select()
      .from(medications)
      .where(and(eq(medications.userId, userId), eq(medications.active, true)))
      .orderBy(desc(medications.startDate));
  }
  
  return await db
    .select()
    .from(medications)
    .where(eq(medications.userId, userId))
    .orderBy(desc(medications.startDate));
}

// Update medication
export async function updateMedication(
  medicationId: number,
  userId: number,
  updates: Partial<{
    dosage: string;
    frequency: string;
    endDate: string;
    sideEffects: string;
    effectiveness: number;
    notes: string;
    active: boolean;
  }>
) {
  const db = await getDb();
  if (!db) return [];
  
  await db
    .update(medications)
    .set(updates as any)
    .where(and(eq(medications.id, medicationId), eq(medications.userId, userId)));
  
  return await db
    .select()
    .from(medications)
    .where(eq(medications.id, medicationId))
    .limit(1);
}

// Log medication taken
export async function logMedicationTaken(data: {
  userId: number;
  medicationId: number;
  takenAt: Date;
  dosageTaken: string;
  sideEffectsNoted?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [log] = await db.insert(medicationLogs).values(data).returning();
  return log;
}

// Get medication logs
export async function getMedicationLogs(
  userId: number,
  medicationId?: number,
  startDate?: Date,
  endDate?: Date,
  limit = 100
) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(medicationLogs.userId, userId)];

  if (medicationId) {
    conditions.push(eq(medicationLogs.medicationId, medicationId));
  }

  if (startDate) {
    conditions.push(gte(medicationLogs.takenAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(medicationLogs.takenAt, endDate));
  }

  return await db
    .select()
    .from(medicationLogs)
    .where(and(...conditions))
    .orderBy(desc(medicationLogs.takenAt))
    .limit(limit);
}

// Get medication adherence stats
export async function getMedicationAdherenceStats(userId: number, medicationId: number, days = 30) {
  const db = await getDb();
  if (!db) return null;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await db
    .select()
    .from(medicationLogs)
    .where(
      and(
        eq(medicationLogs.userId, userId),
        eq(medicationLogs.medicationId, medicationId),
        gte(medicationLogs.takenAt, startDate)
      )
    );

  // Get medication details to calculate expected doses
  const [medication] = await db
    .select()
    .from(medications)
    .where(eq(medications.id, medicationId))
    .limit(1);

  if (!medication) {
    return null;
  }

  // Simple adherence calculation (actual logs vs days in period)
  // This is a simplified version - real calculation would depend on frequency
  const totalDoses = logs.length;
  const expectedDoses = days; // Simplified: assumes once daily

  return {
    totalDoses,
    expectedDoses,
    adherenceRate: expectedDoses > 0 ? Math.round((totalDoses / expectedDoses) * 100) : 0,
    periodDays: days,
    medicationName: medication.name,
  };
}
