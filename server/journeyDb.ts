import { getDb } from "./db";
import { journeyPhases, journeySupplements, userSupplementLog, extendedFastingSessions, bloodWorkResults, journeyInitializations, supplementReminders, fastingAnalytics } from "../drizzle/schema";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

/**
 * Journey Phases
 */

export async function initializeJourneyPhases(userId: number, startWeight: number, targetWeight: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const totalWeightLoss = startWeight - targetWeight;
  const startDate = new Date();
  
  // Define 4 phases with expected weight loss distribution
  const phases = [
    { number: 1, name: "Foundation & Metabolic Reset", months: 3, weightLossPercent: 0.22 }, // 15-25 lbs
    { number: 2, name: "Acceleration & Advanced Protocols", months: 3, weightLossPercent: 0.28 }, // 20-30 lbs
    { number: 3, name: "Deep Optimization & Metabolic Reset", months: 3, weightLossPercent: 0.28 }, // 20-30 lbs
    { number: 4, name: "Maintenance & Consolidation", months: 3, weightLossPercent: 0.22 }, // 5-15 lbs
  ];
  
  const phaseRecords = [];
  let currentDate = new Date(startDate);
  
  for (const phase of phases) {
    const phaseStartDate = new Date(currentDate);
    currentDate.setMonth(currentDate.getMonth() + phase.months);
    const phaseEndDate = new Date(currentDate);
    
    phaseRecords.push({
      userId,
      phaseNumber: phase.number,
      phaseName: phase.name,
      startDate: phaseStartDate,
      endDate: phaseEndDate,
      goalWeightLoss: (totalWeightLoss * phase.weightLossPercent).toFixed(2),
      actualWeightLoss: "0",
      status: phase.number === 1 ? ("active" as const) : ("active" as const),
    });
  }
  
  return await db.insert(journeyPhases).values(phaseRecords).returning();
}

export async function getCurrentPhase(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  
  const phase = await db
    .select()
    .from(journeyPhases)
    .where(
      and(
        eq(journeyPhases.userId, userId),
        lte(journeyPhases.startDate, now),
        gte(journeyPhases.endDate, now)
      )
    )
    .limit(1);
  
  return phase[0] || null;
}

export async function getAllPhases(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(journeyPhases)
    .where(eq(journeyPhases.userId, userId))
    .orderBy(journeyPhases.phaseNumber);
}

export async function updatePhaseProgress(userId: number, phaseNumber: number, actualWeightLoss: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(journeyPhases)
    .set({ actualWeightLoss: actualWeightLoss.toFixed(2) })
    .where(
      and(
        eq(journeyPhases.userId, userId),
        eq(journeyPhases.phaseNumber, phaseNumber)
      )
    );
}

/**
 * Journey Supplements
 */

export async function getSupplementsByPhase(phaseNumber: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(journeySupplements)
    .where(lte(journeySupplements.phaseIntroduced, phaseNumber));
}

export async function getAllSupplements() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(journeySupplements)
    .orderBy(journeySupplements.phaseIntroduced, journeySupplements.category);
}

export async function logSupplementIntake(userId: number, supplementId: number, date: Date, taken: boolean, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(userSupplementLog).values({
    userId,
    supplementId,
    date,
    taken,
    notes,
  }).returning();
}

export async function getSupplementLogForDate(userId: number, date: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);
  
  return await db
    .select()
    .from(userSupplementLog)
    .where(
      and(
        eq(userSupplementLog.userId, userId),
        gte(userSupplementLog.date, startOfDay),
        lte(userSupplementLog.date, endOfDay)
      )
    );
}

/**
 * Extended Fasting Sessions
 */

export async function startFastingSession(
  userId: number,
  type: "24hr" | "3-5day" | "7-10day",
  targetDuration: number,
  weightBefore?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const startTime = new Date();
  
  return await db.insert(extendedFastingSessions).values({
    userId,
    startTime,
    type,
    targetDuration,
    weightBefore: weightBefore?.toFixed(2),
    completed: false,
  }).returning();
}

export async function endFastingSession(
  sessionId: number,
  userId: number,
  weightAfter?: number,
  electrolytesLog?: string,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const endTime = new Date();
  
  // Get session to calculate actual duration
  const session = await db
    .select()
    .from(extendedFastingSessions)
    .where(
      and(
        eq(extendedFastingSessions.id, sessionId),
        eq(extendedFastingSessions.userId, userId)
      )
    )
    .limit(1);
  
  if (!session[0]) return null;
  
  const actualDuration = Math.floor((endTime.getTime() - new Date(session[0].startTime).getTime()) / (1000 * 60 * 60));
  
  return await db
    .update(extendedFastingSessions)
    .set({
      endTime,
      actualDuration,
      weightAfter: weightAfter?.toFixed(2),
      electrolytesLog,
      notes,
      completed: true,
    })
    .where(
      and(
        eq(extendedFastingSessions.id, sessionId),
        eq(extendedFastingSessions.userId, userId)
      )
    );
}

export async function getActiveFastingSession(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(extendedFastingSessions)
    .where(
      and(
        eq(extendedFastingSessions.userId, userId),
        eq(extendedFastingSessions.completed, false)
      )
    )
    .orderBy(desc(extendedFastingSessions.startTime))
    .limit(1);
}

export async function getFastingHistory(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(extendedFastingSessions)
    .where(eq(extendedFastingSessions.userId, userId))
    .orderBy(desc(extendedFastingSessions.startTime))
    .limit(limit);
}

/**
 * Blood Work Results
 */

export async function addBloodWorkResult(
  userId: number,
  testDate: Date,
  results: {
    glucose?: number;
    a1c?: number;
    totalCholesterol?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    tsh?: number;
    alt?: number;
    ast?: number;
    notes?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(bloodWorkResults).values({
    userId,
    testDate,
    glucose: results.glucose?.toFixed(2),
    a1c: results.a1c?.toFixed(2),
    totalCholesterol: results.totalCholesterol?.toFixed(2),
    ldl: results.ldl?.toFixed(2),
    hdl: results.hdl?.toFixed(2),
    triglycerides: results.triglycerides?.toFixed(2),
    tsh: results.tsh?.toFixed(3),
    alt: results.alt?.toFixed(2),
    ast: results.ast?.toFixed(2),
    notes: results.notes,
  }).returning();
}

export async function getBloodWorkHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(bloodWorkResults)
    .where(eq(bloodWorkResults.userId, userId))
    .orderBy(desc(bloodWorkResults.testDate));
}

export async function getLatestBloodWork(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const results = await db
    .select()
    .from(bloodWorkResults)
    .where(eq(bloodWorkResults.userId, userId))
    .orderBy(desc(bloodWorkResults.testDate))
    .limit(1);
  
  return results[0] || null;
}


/**
 * Journey Initialization
 */

export async function initializeUserJourney(userId: number, initialWeight: number, goalWeight: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { journeyInitializations } = await import("../drizzle/schema");
  
  return await db.insert(journeyInitializations).values({
    userId,
    startDate: new Date(),
    initialWeight: initialWeight.toString(),
    goalWeight: goalWeight.toString(),
    currentPhase: 1,
    completedPhases: 0,
  }).returning();
}

export async function getJourneyInitialization(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { journeyInitializations } = await import("../drizzle/schema");
  
  const results = await db.select().from(journeyInitializations)
    .where(eq(journeyInitializations.userId, userId))
    .limit(1);
  return results[0] || null;
}

export async function updateJourneyPhase(userId: number, newPhase: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { journeyInitializations } = await import("../drizzle/schema");
  
  return await db
    .update(journeyInitializations)
    .set({ currentPhase: newPhase })
    .where(eq(journeyInitializations.userId, userId));
}

/**
 * Supplement Reminders
 */

export async function createSupplementReminder(userId: number, supplementId: number, reminderTime: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(supplementReminders).values({
    userId,
    supplementId,
    reminderTime,
    enabled: true,
    frequency: 'daily',
  }).returning();
}

export async function getSupplementReminders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(supplementReminders)
    .where(and(
      eq(supplementReminders.userId, userId),
      eq(supplementReminders.enabled, true)
    ));
}

export async function updateSupplementReminder(reminderId: number, reminderTime: string, enabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .update(supplementReminders)
    .set({ reminderTime, enabled })
    .where(eq(supplementReminders.id, reminderId));
}

/**
 * Fasting Analytics
 */

export async function getOrCreateFastingAnalytics(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let results = await db.select().from(fastingAnalytics)
    .where(eq(fastingAnalytics.userId, userId))
    .limit(1);
  let analytics = results[0] || null;

  if (!analytics) {
    await db.insert(fastingAnalytics).values({
      userId,
      totalFasts: 0,
      completedFasts: 0,
      abandonedFasts: 0,
      longestStreak: 0,
      currentStreak: 0,
    });

    results = await db.select().from(fastingAnalytics)
      .where(eq(fastingAnalytics.userId, userId))
      .limit(1);
    analytics = results[0] || null;
  }

  return analytics;
}

export async function updateFastingAnalytics(userId: number, updates: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .update(fastingAnalytics)
    .set(updates)
    .where(eq(fastingAnalytics.userId, userId));
}

export async function calculateFastingStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const sessions = await db.select().from(extendedFastingSessions)
    .where(eq(extendedFastingSessions.userId, userId));

  const completed = sessions.filter((s: any) => s.endTime !== null).length;
  const abandoned = sessions.filter((s: any) => s.endTime === null).length;

  // Calculate weight loss
  let totalWeightLost = 0;
  sessions.forEach((session: any) => {
    if (session.weightBefore && session.weightAfter) {
      totalWeightLost += parseFloat(session.weightBefore) - parseFloat(session.weightAfter);
    }
  });

  // Calculate average duration
  const completedDurations = sessions
    .filter((s: any) => s.actualDuration)
    .map((s: any) => s.actualDuration || 0);
  const avgDuration = completedDurations.length > 0
    ? completedDurations.reduce((a: number, b: number) => a + b, 0) / completedDurations.length
    : 0;

  return {
    totalFasts: sessions.length,
    completedFasts: completed,
    abandonedFasts: abandoned,
    totalWeightLost: totalWeightLost.toFixed(1),
    averageFastDuration: Math.round(avgDuration),
  };
}

export async function resetJourney(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete all journey-related data for this user
  await db.delete(journeyPhases).where(eq(journeyPhases.userId, userId));
  await db.delete(userSupplementLog).where(eq(userSupplementLog.userId, userId));
  await db.delete(extendedFastingSessions).where(eq(extendedFastingSessions.userId, userId));
  await db.delete(bloodWorkResults).where(eq(bloodWorkResults.userId, userId));
  await db.delete(journeyInitializations).where(eq(journeyInitializations.userId, userId));
  await db.delete(supplementReminders).where(eq(supplementReminders.userId, userId));
  await db.delete(fastingAnalytics).where(eq(fastingAnalytics.userId, userId));
  
  return { success: true };
}
