import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean, numeric, date, index, uniqueIndex, serial, jsonb } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const stressLevelEnum = pgEnum("stress_level", ["low", "moderate", "high"]);
export const sleepQualityEnum = pgEnum("sleep_quality", ["poor", "fair", "good", "excellent"]);
export const activityLevelEnum = pgEnum("activity_level", ["sedentary", "light", "moderate", "active", "very_active"]);
export const mealTypeEnum = pgEnum("meal_type", ["breakfast", "lunch", "dinner", "snack"]);
export const fastingTypeEnum = pgEnum("fasting_type", ["adf", "tre", "wdf"]);
export const supplementTypeEnum = pgEnum("supplement_type", ["berberine", "probiotic", "nmn", "resveratrol", "other"]);
export const energyLevelEnum = pgEnum("energy_level", ["very_low", "low", "moderate", "high", "very_high"]);
export const moodEnum = pgEnum("mood", ["poor", "fair", "good", "excellent"]);
export const insightTypeEnum = pgEnum("insight_type", ["motivation", "education", "tip", "reminder", "celebration"]);
export const chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);
export const researchCategoryEnum = pgEnum("research_category", ["overview", "glp1", "fasting", "nutrition", "exercise", "metabolic"]);
export const supplementCategoryEnum = pgEnum("supplement_category", ["foundation", "advanced", "optional"]);
export const extendedFastingTypeEnum = pgEnum("extended_fasting_type", ["24hr", "3-5day", "7-10day"]);
export const journeyStatusEnum = pgEnum("journey_status", ["active", "completed", "skipped"]);
export const triggerEmotionEnum = pgEnum("trigger_emotion", ["stress", "anxiety", "sadness", "boredom", "anger", "loneliness", "other"]);
export const medicationTypeEnum = pgEnum("medication_type", ["glp1_agonist", "ssri", "stimulant", "combination", "other"]);
export const mindfulnessCategoryEnum = pgEnum("mindfulness_category", ["breathing", "urge_surfing", "mindful_eating", "body_scan", "meditation", "grounding"]);
export const difficultyEnum = pgEnum("difficulty", ["beginner", "intermediate", "advanced"]);
export const moodLevelEnum = pgEnum("mood_level", ["very_low", "low", "neutral", "good", "great"]);
export const sessionTriggerEnum = pgEnum("session_trigger", ["scheduled", "craving", "stress", "emotional", "before_meal", "other"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Session storage table for Replit Auth.
 * (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
 */
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

/**
 * Metabolic profile - stores user's health assessment and personalized data
 */
export const metabolicProfiles = pgTable("metabolic_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  currentWeight: integer("currentWeight"),
  targetWeight: integer("targetWeight"),
  height: integer("height"),
  age: integer("age"),
  gender: genderEnum("gender"),
  
  hasObesity: boolean("hasObesity").default(false),
  hasDiabetes: boolean("hasDiabetes").default(false),
  hasMetabolicSyndrome: boolean("hasMetabolicSyndrome").default(false),
  hasNAFLD: boolean("hasNAFLD").default(false),
  
  currentMedications: text("currentMedications"),
  takingGLP1: boolean("takingGLP1").default(false),
  
  stressLevel: stressLevelEnum("stressLevel"),
  sleepQuality: sleepQualityEnum("sleepQuality"),
  activityLevel: activityLevelEnum("activityLevel"),
  
  susceptibleToLinoleicAcid: boolean("susceptibleToLinoleicAcid").default(false),
  lowNADLevels: boolean("lowNADLevels").default(false),
  poorGutHealth: boolean("poorGutHealth").default(false),
  
  primaryGoal: text("primaryGoal"),
  targetDate: timestamp("targetDate"),
  
  dailyCalorieGoal: integer("dailyCalorieGoal"),
  dailyProteinGoal: integer("dailyProteinGoal"),
  dailyCarbsGoal: integer("dailyCarbsGoal"),
  dailyFatsGoal: integer("dailyFatsGoal"),
  dailyFiberGoal: integer("dailyFiberGoal"),
  
  notificationsEnabled: boolean("notificationsEnabled").default(true),
  dailyReminderTime: varchar("dailyReminderTime", { length: 5 }),
  streakAlertsEnabled: boolean("streakAlertsEnabled").default(true),
  milestoneAlertsEnabled: boolean("milestoneAlertsEnabled").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("metabolic_profiles_userId_idx").on(table.userId),
}));

export type MetabolicProfile = typeof metabolicProfiles.$inferSelect;
export type InsertMetabolicProfile = typeof metabolicProfiles.$inferInsert;

/**
 * Dietary tracking - logs meals with comprehensive nutrition data
 */
export const mealLogs = pgTable("meal_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  loggedAt: timestamp("loggedAt").notNull(),
  mealType: mealTypeEnum("mealType").notNull(),
  
  foodName: varchar("foodName", { length: 255 }).notNull(),
  servingSize: varchar("servingSize", { length: 100 }),
  
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fats: integer("fats"),
  fiber: integer("fiber"),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("meal_logs_userId_idx").on(table.userId),
  loggedAtIdx: index("meal_logs_loggedAt_idx").on(table.loggedAt),
  userDateIdx: index("meal_logs_user_date_idx").on(table.userId, table.loggedAt),
}));

export type MealLog = typeof mealLogs.$inferSelect;
export type InsertMealLog = typeof mealLogs.$inferInsert;

/**
 * Fasting schedules - tracks intermittent fasting protocols
 */
export const fastingSchedules = pgTable("fasting_schedules", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  fastingType: fastingTypeEnum("fastingType").notNull(),
  
  eatingWindowStart: integer("eatingWindowStart"),
  eatingWindowEnd: integer("eatingWindowEnd"),
  
  fastingDays: text("fastingDays"),
  
  isActive: boolean("isActive").default(true),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FastingSchedule = typeof fastingSchedules.$inferSelect;
export type InsertFastingSchedule = typeof fastingSchedules.$inferInsert;

/**
 * Fasting logs - daily adherence tracking
 */
export const fastingLogs = pgTable("fasting_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  scheduleId: integer("scheduleId").notNull().references(() => fastingSchedules.id, { onDelete: "cascade" }),
  
  date: timestamp("date").notNull(),
  adhered: boolean("adhered").notNull(),
  
  actualEatingStart: timestamp("actualEatingStart"),
  actualEatingEnd: timestamp("actualEatingEnd"),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FastingLog = typeof fastingLogs.$inferSelect;
export type InsertFastingLog = typeof fastingLogs.$inferInsert;

/**
 * Supplement tracking
 */
export const supplements = pgTable("supplements", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  name: varchar("name", { length: 255 }).notNull(),
  type: supplementTypeEnum("type").notNull(),
  
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }).notNull(),
  timing: varchar("timing", { length: 100 }),
  
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Supplement = typeof supplements.$inferSelect;
export type InsertSupplement = typeof supplements.$inferInsert;

/**
 * Supplement logs - daily adherence
 */
export const supplementLogs = pgTable("supplement_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  supplementId: integer("supplementId").notNull().references(() => supplements.id, { onDelete: "cascade" }),
  
  takenAt: timestamp("takenAt").notNull(),
  adhered: boolean("adhered").notNull(),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupplementLog = typeof supplementLogs.$inferSelect;
export type InsertSupplementLog = typeof supplementLogs.$inferInsert;

/**
 * Progress tracking - weight, measurements, photos
 */
export const progressLogs = pgTable("progress_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  loggedAt: timestamp("loggedAt").notNull(),
  
  weight: integer("weight"),
  waistCircumference: integer("waistCircumference"),
  hipCircumference: integer("hipCircumference"),
  chestCircumference: integer("chestCircumference"),
  
  energyLevel: energyLevelEnum("energyLevel"),
  mood: moodEnum("mood"),
  sleepQuality: sleepQualityEnum("sleepQuality"),
  
  photoFront: text("photoFront"),
  photoSide: text("photoSide"),
  photoBack: text("photoBack"),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("progress_logs_userId_idx").on(table.userId),
  loggedAtIdx: index("progress_logs_loggedAt_idx").on(table.loggedAt),
  userDateIdx: index("progress_logs_user_date_idx").on(table.userId, table.loggedAt),
}));

export type ProgressLog = typeof progressLogs.$inferSelect;
export type InsertProgressLog = typeof progressLogs.$inferInsert;

/**
 * Daily insights - AI-generated personalized messages
 */
export const dailyInsights = pgTable("daily_insights", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  date: timestamp("date").notNull(),
  
  insightType: insightTypeEnum("insightType").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  
  viewed: boolean("viewed").default(false),
  viewedAt: timestamp("viewedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyInsight = typeof dailyInsights.$inferSelect;
export type InsertDailyInsight = typeof dailyInsights.$inferInsert;

/**
 * Chat history - AI conversation logs
 */
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Research content - stores Grok-generated weight loss research
 */
export const researchContent = pgTable("research_content", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  category: researchCategoryEnum("category").notNull(),
  content: text("content").notNull(),
  
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  
  viewed: boolean("viewed").default(false),
  viewedAt: timestamp("viewedAt"),
  bookmarked: boolean("bookmarked").default(false),
});

export type ResearchContent = typeof researchContent.$inferSelect;
export type InsertResearchContent = typeof researchContent.$inferInsert;

/**
 * Daily goals - tracks daily micro-goals and completion status
 */
export const dailyGoals = pgTable("daily_goals", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  date: timestamp("date").notNull(),
  
  mealLoggingComplete: boolean("mealLoggingComplete").default(false),
  proteinGoalComplete: boolean("proteinGoalComplete").default(false),
  fastingGoalComplete: boolean("fastingGoalComplete").default(false),
  exerciseGoalComplete: boolean("exerciseGoalComplete").default(false),
  waterGoalComplete: boolean("waterGoalComplete").default(false),
  
  winScore: integer("winScore").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("daily_goals_userId_idx").on(table.userId),
  dateIdx: index("daily_goals_date_idx").on(table.date),
  userDateIdx: index("daily_goals_user_date_idx").on(table.userId, table.date),
}));

export type DailyGoal = typeof dailyGoals.$inferSelect;
export type InsertDailyGoal = typeof dailyGoals.$inferInsert;

/**
 * Weekly reflections - stores user's weekly self-assessment and AI insights
 */
export const weeklyReflections = pgTable("weekly_reflections", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  weekStartDate: timestamp("weekStartDate").notNull(),
  weekEndDate: timestamp("weekEndDate").notNull(),
  
  wentWell: text("wentWell"),
  challenges: text("challenges"),
  nextWeekPlan: text("nextWeekPlan"),
  
  aiInsights: text("aiInsights"),
  
  daysLogged: integer("daysLogged").default(0),
  avgWinScore: integer("avgWinScore").default(0),
  weightChange: integer("weightChange"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("weekly_reflections_userId_idx").on(table.userId),
  weekStartIdx: index("weekly_reflections_weekStart_idx").on(table.weekStartDate),
  userWeekIdx: index("weekly_reflections_user_week_idx").on(table.userId, table.weekStartDate),
}));

export type WeeklyReflection = typeof weeklyReflections.$inferSelect;
export type InsertWeeklyReflection = typeof weeklyReflections.$inferInsert;

/**
 * Water intake tracking - logs daily water consumption
 */
export const waterIntake = pgTable("water_intake", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  date: timestamp("date").notNull(),
  glassesConsumed: integer("glassesConsumed").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("water_intake_userId_idx").on(table.userId),
  dateIdx: index("water_intake_date_idx").on(table.date),
  userDateIdx: index("water_intake_user_date_idx").on(table.userId, table.date),
}));

export type WaterIntake = typeof waterIntake.$inferSelect;
export type InsertWaterIntake = typeof waterIntake.$inferInsert;

/**
 * Favorite foods - stores user's frequently logged foods for quick access
 */
export const favoriteFoods = pgTable("favorite_foods", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  foodName: varchar("foodName", { length: 255 }).notNull(),
  servingSize: varchar("servingSize", { length: 100 }),
  
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fats: integer("fats"),
  fiber: integer("fiber"),
  
  timesUsed: integer("timesUsed").default(0).notNull(),
  lastUsed: timestamp("lastUsed"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("favorite_foods_userId_idx").on(table.userId),
  lastUsedIdx: index("favorite_foods_lastUsed_idx").on(table.lastUsed),
}));

export type FavoriteFood = typeof favoriteFoods.$inferSelect;
export type InsertFavoriteFood = typeof favoriteFoods.$inferInsert;

/**
 * User achievements - tracks earned badges and milestones
 */
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  achievementId: varchar("achievementId", { length: 100 }).notNull(),
  
  unlockedAt: timestamp("unlockedAt").notNull(),
  viewed: boolean("viewed").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("achievements_userId_idx").on(table.userId),
  achievementIdIdx: index("achievements_achievementId_idx").on(table.achievementId),
  userAchievementIdx: index("achievements_user_achievement_idx").on(table.userId, table.achievementId),
}));

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * Journey Phases - tracks user's progress through the 90lb Journey 4-phase program
 */
export const journeyPhases = pgTable("journey_phases", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  phaseNumber: integer("phaseNumber").notNull(),
  phaseName: varchar("phaseName", { length: 255 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  goalWeightLoss: numeric("goalWeightLoss", { precision: 5, scale: 2 }).notNull(),
  actualWeightLoss: numeric("actualWeightLoss", { precision: 5, scale: 2 }).default("0"),
  
  status: journeyStatusEnum("status").notNull().default("active"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("journey_phases_userId_idx").on(table.userId),
  phaseNumberIdx: index("journey_phases_phaseNumber_idx").on(table.phaseNumber),
  userPhaseIdx: index("journey_phases_user_phase_idx").on(table.userId, table.phaseNumber),
}));

export type JourneyPhase = typeof journeyPhases.$inferSelect;
export type InsertJourneyPhase = typeof journeyPhases.$inferInsert;

/**
 * Journey Supplements - master list of supplements recommended in the 90lb Journey
 */
export const journeySupplements = pgTable("journey_supplements", {
  id: serial("id").primaryKey(),
  
  name: varchar("name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }).notNull(),
  monthlyCost: numeric("monthlyCost", { precision: 6, scale: 2 }),
  category: supplementCategoryEnum("category").notNull(),
  phaseIntroduced: integer("phaseIntroduced").notNull(),
  benefits: text("benefits"),
  brands: varchar("brands", { length: 500 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JourneySupplement = typeof journeySupplements.$inferSelect;
export type InsertJourneySupplement = typeof journeySupplements.$inferInsert;

/**
 * User Supplement Log - tracks daily supplement intake for journey supplements
 */
export const userSupplementLog = pgTable("user_supplement_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  supplementId: integer("supplementId").notNull().references(() => journeySupplements.id, { onDelete: "cascade" }),
  
  date: timestamp("date").notNull(),
  taken: boolean("taken").notNull().default(false),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_supplement_log_userId_idx").on(table.userId),
  dateIdx: index("user_supplement_log_date_idx").on(table.date),
  userDateIdx: index("user_supplement_log_user_date_idx").on(table.userId, table.date),
}));

export type UserSupplementLog = typeof userSupplementLog.$inferSelect;
export type InsertUserSupplementLog = typeof userSupplementLog.$inferInsert;

/**
 * Extended Fasting Sessions - tracks water-only fasting protocols (24hr, 3-5 day, 7-10 day)
 */
export const extendedFastingSessions = pgTable("extended_fasting_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  
  type: extendedFastingTypeEnum("type").notNull(),
  targetDuration: integer("targetDuration").notNull(),
  actualDuration: integer("actualDuration"),
  
  electrolytesLog: text("electrolytesLog"),
  
  weightBefore: numeric("weightBefore", { precision: 5, scale: 2 }),
  weightAfter: numeric("weightAfter", { precision: 5, scale: 2 }),
  
  notes: text("notes"),
  completed: boolean("completed").notNull().default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("extended_fasting_sessions_userId_idx").on(table.userId),
  startTimeIdx: index("extended_fasting_sessions_startTime_idx").on(table.startTime),
}));

export type ExtendedFastingSession = typeof extendedFastingSessions.$inferSelect;
export type InsertExtendedFastingSession = typeof extendedFastingSessions.$inferInsert;

/**
 * Blood Work Results - tracks metabolic health markers over time
 */
export const bloodWorkResults = pgTable("blood_work_results", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  testDate: timestamp("testDate").notNull(),
  
  glucose: numeric("glucose", { precision: 5, scale: 2 }),
  a1c: numeric("a1c", { precision: 4, scale: 2 }),
  
  totalCholesterol: numeric("totalCholesterol", { precision: 5, scale: 2 }),
  ldl: numeric("ldl", { precision: 5, scale: 2 }),
  hdl: numeric("hdl", { precision: 5, scale: 2 }),
  triglycerides: numeric("triglycerides", { precision: 6, scale: 2 }),
  
  tsh: numeric("tsh", { precision: 5, scale: 3 }),
  
  alt: numeric("alt", { precision: 5, scale: 2 }),
  ast: numeric("ast", { precision: 5, scale: 2 }),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("blood_work_results_userId_idx").on(table.userId),
  testDateIdx: index("blood_work_results_testDate_idx").on(table.testDate),
}));

export type BloodWorkResult = typeof bloodWorkResults.$inferSelect;
export type InsertBloodWorkResult = typeof bloodWorkResults.$inferInsert;

export const journeyInitializations = pgTable('journey_initializations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  startDate: timestamp('start_date').notNull(),
  initialWeight: varchar('initial_weight', { length: 10 }),
  goalWeight: varchar('goal_weight', { length: 10 }),
  currentPhase: integer('current_phase').default(1),
  completedPhases: integer('completed_phases').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type JourneyInitialization = typeof journeyInitializations.$inferSelect;
export type InsertJourneyInitialization = typeof journeyInitializations.$inferInsert;

export const supplementReminders = pgTable('supplement_reminders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  supplementId: integer('supplement_id').notNull().references(() => journeySupplements.id),
  reminderTime: varchar('reminder_time', { length: 5 }).notNull(),
  enabled: boolean('enabled').default(true),
  frequency: varchar('frequency', { length: 20 }).default('daily'),
  lastRemindedAt: timestamp('last_reminded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SupplementReminder = typeof supplementReminders.$inferSelect;
export type InsertSupplementReminder = typeof supplementReminders.$inferInsert;

export const fastingAnalytics = pgTable('fasting_analytics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  totalFasts: integer('total_fasts').default(0),
  completedFasts: integer('completed_fasts').default(0),
  abandonedFasts: integer('abandoned_fasts').default(0),
  longestStreak: integer('longest_streak').default(0),
  currentStreak: integer('current_streak').default(0),
  totalWeightLost: varchar('total_weight_lost', { length: 10 }),
  averageFastDuration: integer('average_fast_duration'),
  lastFastDate: timestamp('last_fast_date'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type FastingAnalytic = typeof fastingAnalytics.$inferSelect;
export type InsertFastingAnalytic = typeof fastingAnalytics.$inferInsert;

/**
 * Emotional Eating Logs - Track emotional eating episodes with triggers and patterns
 */
export const emotionalEatingLogs = pgTable("emotional_eating_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  
  triggerEmotion: triggerEmotionEnum("triggerEmotion").notNull(),
  triggerDescription: text("triggerDescription"),
  situation: text("situation"),
  
  foodConsumed: text("foodConsumed").notNull(),
  estimatedCalories: integer("estimatedCalories"),
  
  intensity: integer("intensity").notNull(),
  copingStrategyUsed: text("copingStrategyUsed"),
  effectivenessRating: integer("effectivenessRating"),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmotionalEatingLog = typeof emotionalEatingLogs.$inferSelect;
export type InsertEmotionalEatingLog = typeof emotionalEatingLogs.$inferInsert;

/**
 * Medications - Track medications including GLP-1 agonists, SSRIs, and other treatments
 */
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  name: varchar("name", { length: 255 }).notNull(),
  type: medicationTypeEnum("type").notNull(),
  
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }).notNull(),
  
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  
  prescribedFor: text("prescribedFor"),
  sideEffects: text("sideEffects"),
  effectiveness: integer("effectiveness"),
  
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;

/**
 * Medication Logs - Track daily medication adherence
 */
export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  medicationId: integer("medicationId").notNull().references(() => medications.id, { onDelete: "cascade" }),
  
  takenAt: timestamp("takenAt").notNull(),
  dosageTaken: varchar("dosageTaken", { length: 100 }).notNull(),
  
  sideEffectsNoted: text("sideEffectsNoted"),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertMedicationLog = typeof medicationLogs.$inferInsert;

/**
 * Mindfulness Exercises - Library of guided exercises based on MB-EAT protocol
 */
export const mindfulnessExercises = pgTable("mindfulness_exercises", {
  id: serial("id").primaryKey(),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  
  category: mindfulnessCategoryEnum("category").notNull(),
  
  duration: integer("duration").notNull(),
  difficulty: difficultyEnum("difficulty").default("beginner").notNull(),
  
  instructions: text("instructions").notNull(),
  audioUrl: text("audioUrl"),
  imageUrl: text("imageUrl"),
  
  benefits: text("benefits"),
  bestFor: text("bestFor"),
  
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MindfulnessExercise = typeof mindfulnessExercises.$inferSelect;
export type InsertMindfulnessExercise = typeof mindfulnessExercises.$inferInsert;

/**
 * Mindfulness Sessions - Track user's completed mindfulness practice sessions
 */
export const mindfulnessSessions = pgTable("mindfulness_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: integer("exerciseId").notNull().references(() => mindfulnessExercises.id, { onDelete: "cascade" }),
  
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  
  durationMinutes: integer("durationMinutes").notNull(),
  completed: boolean("completed").default(false).notNull(),
  
  moodBefore: moodLevelEnum("moodBefore"),
  moodAfter: moodLevelEnum("moodAfter"),
  
  cravingIntensityBefore: integer("cravingIntensityBefore"),
  cravingIntensityAfter: integer("cravingIntensityAfter"),
  
  notes: text("notes"),
  
  trigger: sessionTriggerEnum("trigger"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("mindfulness_sessions_userId_idx").on(table.userId),
  exerciseIdIdx: index("mindfulness_sessions_exerciseId_idx").on(table.exerciseId),
  startedAtIdx: index("mindfulness_sessions_startedAt_idx").on(table.startedAt),
}));

export type MindfulnessSession = typeof mindfulnessSessions.$inferSelect;
export type InsertMindfulnessSession = typeof mindfulnessSessions.$inferInsert;
