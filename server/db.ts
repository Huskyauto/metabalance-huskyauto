import { eq, and, desc, gte, lte, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { 
  InsertUser, users,
  metabolicProfiles, InsertMetabolicProfile,
  mealLogs, InsertMealLog,
  fastingSchedules, InsertFastingSchedule,
  fastingLogs, InsertFastingLog,
  supplements, InsertSupplement,
  supplementLogs, InsertSupplementLog,
  progressLogs, InsertProgressLog,
  dailyInsights, InsertDailyInsight,
  chatMessages, InsertChatMessage,
  researchContent, InsertResearchContent,
  dailyGoals, InsertDailyGoal,
  weeklyReflections, InsertWeeklyReflection,
  waterIntake, InsertWaterIntake,
  achievements, InsertAchievement,
  journeyPhases, journeySupplements, userSupplementLog,
  extendedFastingSessions, bloodWorkResults,
  supplementReminders, fastingAnalytics, journeyInitializations
} from "../drizzle/schema";
import { ENV } from './_core/env';

const { Pool } = pg;

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: pg.Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USER FUNCTIONS =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    
    if (existing.length > 0) {
      const updateSet: Record<string, unknown> = {};
      const textFields = ["name", "email", "loginMethod"] as const;
      type TextField = (typeof textFields)[number];

      const assignNullable = (field: TextField) => {
        const value = user[field];
        if (value === undefined) return;
        const normalized = value ?? null;
        updateSet[field] = normalized;
      };

      textFields.forEach(assignNullable);

      if (user.lastSignedIn !== undefined) {
        updateSet.lastSignedIn = user.lastSignedIn;
      }
      if (user.role !== undefined) {
        updateSet.role = user.role;
      } else if (user.openId === ENV.ownerOpenId) {
        updateSet.role = 'admin';
      }

      if (Object.keys(updateSet).length === 0) {
        updateSet.lastSignedIn = new Date();
      }

      await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
    } else {
      const values: InsertUser = {
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        lastSignedIn: user.lastSignedIn ?? new Date(),
        role: user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user'),
      };
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== METABOLIC PROFILE FUNCTIONS =====

export async function getMetabolicProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(metabolicProfiles).where(eq(metabolicProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertMetabolicProfile(profile: InsertMetabolicProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getMetabolicProfile(profile.userId);
  
  if (existing) {
    await db.update(metabolicProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(metabolicProfiles.userId, profile.userId));
  } else {
    await db.insert(metabolicProfiles).values(profile);
  }
}

// ===== MEAL LOG FUNCTIONS =====

export async function createMealLog(meal: InsertMealLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(mealLogs).values(meal);
}

export async function getMealsByDate(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const result = await db.select().from(mealLogs)
    .where(and(
      eq(mealLogs.userId, userId),
      gte(mealLogs.loggedAt, startOfDay),
      lte(mealLogs.loggedAt, endOfDay)
    ))
    .orderBy(mealLogs.loggedAt);
  
  return result;
}

export async function getDailyNutritionTotals(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
  
  const meals = await getMealsByDate(userId, date);
  
  const totals = meals.reduce((acc: { calories: number; protein: number; carbs: number; fats: number; fiber: number }, meal) => {
    return {
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fats: acc.fats + (meal.fats || 0),
      fiber: acc.fiber + (meal.fiber || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
  
  return totals;
}

export async function getWeeklyNutritionData(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(mealLogs)
    .where(and(
      eq(mealLogs.userId, userId),
      gte(mealLogs.loggedAt, startDate),
      lte(mealLogs.loggedAt, endDate)
    ))
    .orderBy(mealLogs.loggedAt);
  
  const dailyData = new Map<string, { date: string; calories: number; protein: number; carbs: number; fats: number; fiber: number }>();
  
  result.forEach((meal) => {
    const dateKey = meal.loggedAt.toISOString().split('T')[0];
    const existing = dailyData.get(dateKey) || { date: dateKey, calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
    
    dailyData.set(dateKey, {
      date: dateKey,
      calories: existing.calories + (meal.calories || 0),
      protein: existing.protein + (meal.protein || 0),
      carbs: existing.carbs + (meal.carbs || 0),
      fats: existing.fats + (meal.fats || 0),
      fiber: existing.fiber + (meal.fiber || 0),
    });
  });
  
  return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function deleteMealLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(mealLogs).where(and(eq(mealLogs.id, id), eq(mealLogs.userId, userId)));
}

// ===== FASTING SCHEDULE FUNCTIONS =====

export async function createFastingSchedule(schedule: InsertFastingSchedule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(fastingSchedules)
    .set({ isActive: false })
    .where(and(eq(fastingSchedules.userId, schedule.userId), eq(fastingSchedules.isActive, true)));
  
  await db.insert(fastingSchedules).values(schedule);
}

export async function getActiveFastingSchedule(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(fastingSchedules)
    .where(and(eq(fastingSchedules.userId, userId), eq(fastingSchedules.isActive, true)))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getFastingSchedules(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(fastingSchedules)
    .where(eq(fastingSchedules.userId, userId))
    .orderBy(desc(fastingSchedules.createdAt));
  
  return result;
}

// ===== FASTING LOG FUNCTIONS =====

export async function createFastingLog(log: InsertFastingLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(fastingLogs).values(log);
}

export async function getFastingLogs(userId: number, scheduleId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(fastingLogs.userId, userId), eq(fastingLogs.scheduleId, scheduleId)];
  
  if (startDate && endDate) {
    conditions.push(gte(fastingLogs.date, startDate));
    conditions.push(lte(fastingLogs.date, endDate));
  }
  
  const result = await db.select().from(fastingLogs)
    .where(and(...conditions))
    .orderBy(desc(fastingLogs.date));
  
  return result;
}

// ===== SUPPLEMENT FUNCTIONS =====

export async function createSupplement(supplement: InsertSupplement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(supplements).values(supplement);
}

export async function getActiveSupplements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(supplements)
    .where(and(eq(supplements.userId, userId), eq(supplements.isActive, true)))
    .orderBy(desc(supplements.createdAt));
  
  return result;
}

export async function getAllSupplements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(supplements)
    .where(eq(supplements.userId, userId))
    .orderBy(desc(supplements.createdAt));
  
  return result;
}

export async function updateSupplement(id: number, userId: number, updates: Partial<InsertSupplement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(supplements)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(supplements.id, id), eq(supplements.userId, userId)));
}

export async function deleteSupplement(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(supplements).where(and(eq(supplements.id, id), eq(supplements.userId, userId)));
}

// ===== SUPPLEMENT LOG FUNCTIONS =====

export async function createSupplementLog(log: InsertSupplementLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(supplementLogs).values(log);
}

export async function getSupplementLogs(userId: number, supplementId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(supplementLogs.userId, userId), eq(supplementLogs.supplementId, supplementId)];
  
  if (startDate && endDate) {
    conditions.push(gte(supplementLogs.takenAt, startDate));
    conditions.push(lte(supplementLogs.takenAt, endDate));
  }
  
  const result = await db.select().from(supplementLogs)
    .where(and(...conditions))
    .orderBy(desc(supplementLogs.takenAt));
  
  return result;
}

// ===== PROGRESS LOG FUNCTIONS =====

export async function createProgressLog(log: InsertProgressLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(progressLogs).values(log);
}

export async function getProgressLogs(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(progressLogs.userId, userId)];
  
  if (startDate && endDate) {
    conditions.push(gte(progressLogs.loggedAt, startDate));
    conditions.push(lte(progressLogs.loggedAt, endDate));
  }
  
  const result = await db.select().from(progressLogs)
    .where(and(...conditions))
    .orderBy(desc(progressLogs.loggedAt));
  return result;
}

export async function getLatestProgressLog(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(progressLogs)
    .where(eq(progressLogs.userId, userId))
    .orderBy(desc(progressLogs.loggedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// ===== DAILY INSIGHT FUNCTIONS =====

export async function createDailyInsight(insight: InsertDailyInsight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(dailyInsights).values(insight);
}

export async function getTodayInsight(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const result = await db.select().from(dailyInsights)
    .where(and(
      eq(dailyInsights.userId, userId),
      gte(dailyInsights.date, today),
      lte(dailyInsights.date, tomorrow)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function markInsightViewed(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(dailyInsights)
    .set({ viewed: true, viewedAt: new Date() })
    .where(and(eq(dailyInsights.id, id), eq(dailyInsights.userId, userId)));
}

// ===== CHAT MESSAGE FUNCTIONS =====

export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(chatMessages).values(message);
}

export async function getChatHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
  
  return result.reverse();
}

export async function clearChatHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
}


// ===== RESEARCH CONTENT FUNCTIONS =====

export async function saveResearchContent(content: InsertResearchContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(researchContent).values(content);
}

export async function getResearchHistory(
  userId: number, 
  category?: 'overview' | 'glp1' | 'fasting' | 'nutrition' | 'exercise' | 'metabolic',
  limit: number = 10
) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(researchContent)
    .where(eq(researchContent.userId, userId))
    .orderBy(desc(researchContent.generatedAt))
    .limit(limit);
  
  if (category) {
    query = db.select().from(researchContent)
      .where(and(
        eq(researchContent.userId, userId),
        eq(researchContent.category, category)
      ))
      .orderBy(desc(researchContent.generatedAt))
      .limit(limit);
  }
  
  return await query;
}

export async function getLatestResearchByCategory(userId: number, category: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(researchContent)
    .where(and(
      eq(researchContent.userId, userId),
      eq(researchContent.category, category as any)
    ))
    .orderBy(desc(researchContent.generatedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function markResearchViewed(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(researchContent)
    .set({ viewed: true, viewedAt: new Date() })
    .where(and(eq(researchContent.id, id), eq(researchContent.userId, userId)));
}

export async function toggleResearchBookmark(id: number, userId: number, bookmarked: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(researchContent)
    .set({ bookmarked })
    .where(and(eq(researchContent.id, id), eq(researchContent.userId, userId)));
}


// ===== DAILY GOALS FUNCTIONS =====

export async function upsertDailyGoal(userId: number, date: Date, goals: Partial<InsertDailyGoal>) {
  const db = await getDb();
  if (!db) return null;

  try {
    const currentGoal = await getDailyGoal(userId, date);
    
    const mergedGoals = {
      mealLoggingComplete: goals.mealLoggingComplete ?? currentGoal?.mealLoggingComplete ?? false,
      proteinGoalComplete: goals.proteinGoalComplete ?? currentGoal?.proteinGoalComplete ?? false,
      fastingGoalComplete: goals.fastingGoalComplete ?? currentGoal?.fastingGoalComplete ?? false,
      exerciseGoalComplete: goals.exerciseGoalComplete ?? currentGoal?.exerciseGoalComplete ?? false,
      waterGoalComplete: goals.waterGoalComplete ?? currentGoal?.waterGoalComplete ?? false,
    };

    const completedGoals = [
      mergedGoals.mealLoggingComplete,
      mergedGoals.proteinGoalComplete,
      mergedGoals.fastingGoalComplete,
      mergedGoals.exerciseGoalComplete,
      mergedGoals.waterGoalComplete
    ].filter(Boolean).length;

    const winScore = completedGoals;

    if (currentGoal) {
      await db.update(dailyGoals)
        .set({
          ...mergedGoals,
          winScore,
          updatedAt: new Date()
        })
        .where(eq(dailyGoals.id, currentGoal.id));
    } else {
      await db.insert(dailyGoals).values({
        userId,
        date,
        ...mergedGoals,
        winScore
      });
    }

    return await getDailyGoal(userId, date);
  } catch (error) {
    console.error("[Database] Failed to upsert daily goal:", error);
    return null;
  }
}

export async function getDailyGoal(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return null;

  try {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const result = await db
      .select()
      .from(dailyGoals)
      .where(
        and(
          eq(dailyGoals.userId, userId),
          gte(dailyGoals.date, startOfDay),
          lte(dailyGoals.date, endOfDay)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get daily goal:", error);
    return null;
  }
}

export async function getWeeklyGoals(userId: number, weekStartDate: Date) {
  const db = await getDb();
  if (!db) return [];

  try {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const result = await db
      .select()
      .from(dailyGoals)
      .where(
        and(
          eq(dailyGoals.userId, userId),
          gte(dailyGoals.date, weekStartDate),
          lte(dailyGoals.date, weekEndDate)
        )
      )
      .orderBy(dailyGoals.date);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get weekly goals:", error);
    return [];
  }
}

// ===== WEEKLY REFLECTIONS FUNCTIONS =====

export async function createWeeklyReflection(userId: number, reflection: Partial<InsertWeeklyReflection>) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(weeklyReflections).values({
      userId,
      ...reflection
    } as InsertWeeklyReflection).returning({ id: weeklyReflections.id });

    return { success: true, id: result[0].id };
  } catch (error) {
    console.error("[Database] Failed to create weekly reflection:", error);
    return null;
  }
}

export async function getWeeklyReflection(userId: number, weekStartDate: Date) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(weeklyReflections)
      .where(
        and(
          eq(weeklyReflections.userId, userId),
          eq(weeklyReflections.weekStartDate, weekStartDate)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get weekly reflection:", error);
    return null;
  }
}

export async function getRecentReflections(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(weeklyReflections)
      .where(eq(weeklyReflections.userId, userId))
      .orderBy(desc(weeklyReflections.weekStartDate))
      .limit(limit);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get recent reflections:", error);
    return [];
  }
}


// ===== WATER INTAKE FUNCTIONS =====

export async function upsertWaterIntake(userId: number, date: Date, glassesConsumed: number) {
  const db = await getDb();
  if (!db) return;

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await db.select()
      .from(waterIntake)
      .where(and(
        eq(waterIntake.userId, userId),
        eq(waterIntake.date, startOfDay)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db.update(waterIntake)
        .set({ glassesConsumed, updatedAt: new Date() })
        .where(eq(waterIntake.id, existing[0].id));
    } else {
      await db.insert(waterIntake).values({
        userId,
        date: startOfDay,
        glassesConsumed,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert water intake:", error);
  }
}

export async function getWaterIntake(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return null;

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const result = await db.select()
      .from(waterIntake)
      .where(and(
        eq(waterIntake.userId, userId),
        eq(waterIntake.date, startOfDay)
      ))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get water intake:", error);
    return null;
  }
}

// ===== ACHIEVEMENT FUNCTIONS =====

export async function createAchievement(achievement: InsertAchievement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(achievements).values(achievement);
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.unlockedAt));
  
  return result;
}

export async function hasAchievement(userId: number, achievementId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(achievements)
    .where(and(
      eq(achievements.userId, userId),
      eq(achievements.achievementId, achievementId)
    ))
    .limit(1);
  
  return result.length > 0;
}

export async function markAchievementViewed(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(achievements)
    .set({ viewed: true })
    .where(and(eq(achievements.id, id), eq(achievements.userId, userId)));
}

export async function getUnviewedAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(achievements)
    .where(and(
      eq(achievements.userId, userId),
      eq(achievements.viewed, false)
    ))
    .orderBy(desc(achievements.unlockedAt));
  
  return result;
}

export async function markAchievementsViewed(userId: number, achievementIds: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (achievementIds.length === 0) return;
  
  await db.update(achievements)
    .set({ viewed: true })
    .where(and(
      eq(achievements.userId, userId),
      inArray(achievements.achievementId, achievementIds)
    ));
}

export async function unlockAchievement(userId: number, achievementId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const exists = await hasAchievement(userId, achievementId);
  if (exists) return;
  
  await db.insert(achievements).values({
    userId,
    achievementId,
    unlockedAt: new Date(),
    viewed: false,
  });
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [mealCount, fastingCount, userProgressLogs, reflections] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(mealLogs).where(eq(mealLogs.userId, userId)),
    db.select({ count: sql<number>`count(*)` }).from(fastingLogs).where(eq(fastingLogs.userId, userId)),
    db.select().from(progressLogs).where(eq(progressLogs.userId, userId)).orderBy(desc(progressLogs.loggedAt)),
    db.select({ count: sql<number>`count(*)` }).from(weeklyReflections).where(eq(weeklyReflections.userId, userId)),
  ]);
  
  const weightLost = userProgressLogs.length >= 2 
    ? (userProgressLogs[userProgressLogs.length - 1].weight || 0) - (userProgressLogs[0].weight || 0)
    : 0;
    
  return {
    mealsLogged: mealCount[0]?.count || 0,
    fastsCompleted: fastingCount[0]?.count || 0,
    weightLost: Math.abs(weightLost),
    reflectionsCompleted: reflections[0]?.count || 0,
    progressEntries: userProgressLogs.length,
  };
}

export async function getWeeklyWaterIntake(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(waterIntake)
    .where(and(
      eq(waterIntake.userId, userId),
      gte(waterIntake.date, startDate),
      lte(waterIntake.date, endDate)
    ))
    .orderBy(waterIntake.date);
  
  return result;
}

// ===== JOURNEY PHASE FUNCTIONS =====

export async function createJourneyPhase(phase: typeof journeyPhases.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(journeyPhases).values(phase);
}

export async function getActiveJourneyPhase(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(journeyPhases)
    .where(and(
      eq(journeyPhases.userId, userId),
      eq(journeyPhases.status, 'active')
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllJourneyPhases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(journeyPhases)
    .where(eq(journeyPhases.userId, userId))
    .orderBy(journeyPhases.phaseNumber);
  
  return result;
}

// ===== JOURNEY SUPPLEMENTS =====

export async function getAllJourneySupplements() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(journeySupplements)
    .orderBy(journeySupplements.phaseIntroduced, journeySupplements.name);
  
  return result;
}

export async function getJourneySupplementsByPhase(phase: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(journeySupplements)
    .where(lte(journeySupplements.phaseIntroduced, phase))
    .orderBy(journeySupplements.category, journeySupplements.name);
  
  return result;
}

// ===== USER SUPPLEMENT LOG =====

export async function logSupplementTaken(userId: number, supplementId: number, date: Date, taken: boolean, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const existing = await db.select().from(userSupplementLog)
    .where(and(
      eq(userSupplementLog.userId, userId),
      eq(userSupplementLog.supplementId, supplementId),
      eq(userSupplementLog.date, startOfDay)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(userSupplementLog)
      .set({ taken, notes })
      .where(eq(userSupplementLog.id, existing[0].id));
  } else {
    await db.insert(userSupplementLog).values({
      userId,
      supplementId,
      date: startOfDay,
      taken,
      notes
    });
  }
}

export async function getUserSupplementLogsByDate(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const result = await db.select().from(userSupplementLog)
    .where(and(
      eq(userSupplementLog.userId, userId),
      eq(userSupplementLog.date, startOfDay)
    ));
  
  return result;
}

// ===== EXTENDED FASTING SESSIONS =====

export async function createExtendedFastingSession(session: typeof extendedFastingSessions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(extendedFastingSessions).values(session);
}

export async function getActiveExtendedFast(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(extendedFastingSessions)
    .where(and(
      eq(extendedFastingSessions.userId, userId),
      eq(extendedFastingSessions.completed, false)
    ))
    .orderBy(desc(extendedFastingSessions.startTime))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function completeExtendedFast(id: number, userId: number, actualDuration: number, weightAfter?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(extendedFastingSessions)
    .set({
      completed: true,
      endTime: new Date(),
      actualDuration,
      weightAfter
    })
    .where(and(
      eq(extendedFastingSessions.id, id),
      eq(extendedFastingSessions.userId, userId)
    ));
}

// ===== BLOOD WORK RESULTS =====

export async function createBloodWorkResult(result: typeof bloodWorkResults.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(bloodWorkResults).values(result);
}

export async function getBloodWorkResults(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(bloodWorkResults)
    .where(eq(bloodWorkResults.userId, userId))
    .orderBy(desc(bloodWorkResults.testDate))
    .limit(limit);
  
  return results;
}

// ===== JOURNEY INITIALIZATION =====

export async function getJourneyInitialization(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(journeyInitializations)
    .where(eq(journeyInitializations.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createJourneyInitialization(init: typeof journeyInitializations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(journeyInitializations).values(init);
}

export async function updateJourneyInitialization(userId: number, updates: Partial<typeof journeyInitializations.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(journeyInitializations)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(journeyInitializations.userId, userId));
}

// ===== SUPPLEMENT REMINDERS =====

export async function getSupplementReminders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(supplementReminders)
    .where(eq(supplementReminders.userId, userId));
  
  return result;
}

export async function createSupplementReminder(reminder: typeof supplementReminders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(supplementReminders).values(reminder);
}

// ===== FASTING ANALYTICS =====

export async function getFastingAnalytics(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(fastingAnalytics)
    .where(eq(fastingAnalytics.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertFastingAnalytics(userId: number, analytics: Partial<typeof fastingAnalytics.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getFastingAnalytics(userId);
  
  if (existing) {
    await db.update(fastingAnalytics)
      .set({ ...analytics, updatedAt: new Date() })
      .where(eq(fastingAnalytics.userId, userId));
  } else {
    await db.insert(fastingAnalytics).values({
      userId,
      ...analytics
    } as typeof fastingAnalytics.$inferInsert);
  }
}
