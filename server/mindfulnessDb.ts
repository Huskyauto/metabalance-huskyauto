import { getDb } from "./db";
import { mindfulnessExercises, mindfulnessSessions } from "../drizzle/schema";
import { eq, and, desc, gte, sql, count } from "drizzle-orm";

// ============ Exercise Functions ============

/**
 * Get all active mindfulness exercises
 */
export async function getAllExercises() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(mindfulnessExercises)
    .where(eq(mindfulnessExercises.isActive, true))
    .orderBy(mindfulnessExercises.sortOrder, mindfulnessExercises.category);
}

/**
 * Get exercises by category
 */
export async function getExercisesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(mindfulnessExercises)
    .where(
      and(
        eq(mindfulnessExercises.isActive, true),
        eq(mindfulnessExercises.category, category as any)
      )
    )
    .orderBy(mindfulnessExercises.sortOrder);
}

/**
 * Get a single exercise by ID
 */
export async function getExerciseById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db
    .select()
    .from(mindfulnessExercises)
    .where(eq(mindfulnessExercises.id, id))
    .limit(1);
  return results[0] || null;
}

/**
 * Seed default exercises based on MB-EAT protocol
 */
export async function seedDefaultExercises() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const exercises = [
    // Breathing exercises
    {
      name: "Box Breathing",
      description: "A calming technique used by Navy SEALs. Breathe in a square pattern to reduce stress and cravings.",
      category: "breathing" as const,
      duration: 5,
      difficulty: "beginner" as const,
      instructions: `1. Sit comfortably with your back straight
2. Breathe in slowly through your nose for 4 seconds
3. Hold your breath for 4 seconds
4. Exhale slowly through your mouth for 4 seconds
5. Hold your breath for 4 seconds
6. Repeat the cycle 4-6 times
7. Notice how your body feels calmer`,
      benefits: JSON.stringify(["Reduces stress", "Calms nervous system", "Decreases food cravings", "Improves focus"]),
      bestFor: "During cravings, before meals, when stressed",
      sortOrder: 1,
    },
    {
      name: "4-7-8 Relaxation Breath",
      description: "Dr. Andrew Weil's breathing technique that activates the parasympathetic nervous system.",
      category: "breathing" as const,
      duration: 3,
      difficulty: "beginner" as const,
      instructions: `1. Place the tip of your tongue behind your upper front teeth
2. Exhale completely through your mouth, making a whoosh sound
3. Close your mouth and inhale quietly through your nose for 4 counts
4. Hold your breath for 7 counts
5. Exhale completely through your mouth for 8 counts
6. This is one breath cycle
7. Repeat 3-4 times`,
      benefits: JSON.stringify(["Promotes relaxation", "Reduces anxiety", "Helps with emotional eating urges", "Improves sleep"]),
      bestFor: "Before bed, during emotional moments, when anxious",
      sortOrder: 2,
    },
    // Urge Surfing
    {
      name: "Urge Surfing",
      description: "Learn to ride out food cravings like waves. Based on MB-EAT research showing this technique reduces binge eating by 70%.",
      category: "urge_surfing" as const,
      duration: 10,
      difficulty: "intermediate" as const,
      instructions: `1. When a craving hits, pause and acknowledge it
2. Notice where you feel the craving in your body
3. Describe the sensation: Is it tight? Warm? Pulsing?
4. Imagine the craving as a wave in the ocean
5. Watch the wave build - cravings peak at about 20-30 minutes
6. Stay curious, not judgmental
7. Breathe deeply and let the wave crest
8. Notice as the intensity naturally decreases
9. The wave will pass - cravings are temporary
10. Congratulate yourself for riding it out`,
      benefits: JSON.stringify(["Reduces binge eating episodes", "Builds craving tolerance", "Increases self-awareness", "Breaks automatic eating patterns"]),
      bestFor: "During intense food cravings, emotional eating urges",
      sortOrder: 3,
    },
    // Mindful Eating
    {
      name: "Mindful Eating Practice",
      description: "The core MB-EAT technique. Eat one meal or snack with full attention to transform your relationship with food.",
      category: "mindful_eating" as const,
      duration: 20,
      difficulty: "beginner" as const,
      instructions: `1. Choose a small portion of food (a piece of fruit or small snack)
2. Before eating, take 3 deep breaths
3. Look at the food - notice colors, textures, shapes
4. Smell the food - what aromas do you notice?
5. Take a small bite and place your utensil down
6. Chew slowly - aim for 20-30 chews
7. Notice the flavors, textures, temperature
8. Swallow completely before the next bite
9. Check in: How hungry are you now? (1-10 scale)
10. Continue eating slowly, stopping when satisfied (not stuffed)
11. Express gratitude for the nourishment`,
      benefits: JSON.stringify(["Reduces overeating by 25%", "Increases meal satisfaction", "Improves digestion", "Builds food awareness"]),
      bestFor: "Every meal, especially when prone to overeating",
      sortOrder: 4,
    },
    {
      name: "Hunger-Fullness Check",
      description: "A quick body scan to assess true hunger vs. emotional hunger before eating.",
      category: "mindful_eating" as const,
      duration: 2,
      difficulty: "beginner" as const,
      instructions: `1. Pause before eating anything
2. Place your hand on your stomach
3. Ask yourself: "Am I physically hungry?"
4. Rate your hunger from 1-10:
   - 1-3: Very hungry (stomach growling, low energy)
   - 4-6: Moderately hungry (could eat, but not urgent)
   - 7-10: Not hungry (eating for other reasons)
5. If 7-10, ask: "What am I really feeling?"
6. Consider: Am I bored? Stressed? Sad? Tired?
7. If not truly hungry, try a different activity first
8. If truly hungry (1-6), eat mindfully`,
      benefits: JSON.stringify(["Distinguishes physical from emotional hunger", "Prevents unnecessary eating", "Builds body awareness"]),
      bestFor: "Before every meal or snack",
      sortOrder: 5,
    },
    // Body Scan
    {
      name: "Progressive Body Scan",
      description: "A full-body relaxation technique that releases tension and reduces stress-related eating.",
      category: "body_scan" as const,
      duration: 15,
      difficulty: "beginner" as const,
      instructions: `1. Lie down or sit comfortably
2. Close your eyes and take 3 deep breaths
3. Focus on your feet - notice any tension, then relax
4. Move to your calves - tense for 5 seconds, then release
5. Continue to thighs, hips, stomach
6. Notice your stomach - is there tension? Hunger? Emotion?
7. Move to chest, shoulders, arms, hands
8. Relax your neck, jaw, face, forehead
9. Scan your whole body - notice areas still holding tension
10. Breathe into those areas and let go
11. Rest in this relaxed state for 1-2 minutes
12. Slowly open your eyes`,
      benefits: JSON.stringify(["Reduces physical tension", "Decreases cortisol", "Interrupts stress eating", "Improves sleep"]),
      bestFor: "Before bed, during high stress, after difficult emotions",
      sortOrder: 6,
    },
    // Meditation
    {
      name: "5-Minute Mindfulness Meditation",
      description: "A quick meditation to center yourself and reduce emotional reactivity to food triggers.",
      category: "meditation" as const,
      duration: 5,
      difficulty: "beginner" as const,
      instructions: `1. Sit comfortably with feet flat on floor
2. Close your eyes or soften your gaze
3. Take 3 deep breaths to settle in
4. Focus on the sensation of breathing
5. Notice the breath entering and leaving your nostrils
6. When your mind wanders (it will), gently return to breath
7. Don't judge yourself for wandering - just return
8. Continue for 5 minutes
9. Before opening eyes, set an intention for mindful eating
10. Slowly open your eyes`,
      benefits: JSON.stringify(["Reduces emotional reactivity", "Improves impulse control", "Decreases stress eating", "Builds awareness"]),
      bestFor: "Morning routine, before meals, during emotional moments",
      sortOrder: 7,
    },
    {
      name: "Loving-Kindness for Body Acceptance",
      description: "A compassion meditation to heal negative body image and reduce shame-based eating.",
      category: "meditation" as const,
      duration: 10,
      difficulty: "intermediate" as const,
      instructions: `1. Sit comfortably and close your eyes
2. Place your hand over your heart
3. Take 3 deep breaths
4. Repeat silently: "May I be healthy"
5. "May I be at peace with my body"
6. "May I treat myself with kindness"
7. "May I nourish myself with love"
8. Picture yourself at your healthiest
9. Send compassion to any body parts you struggle with
10. Repeat: "My body deserves care and respect"
11. Rest in this feeling of self-compassion
12. Slowly open your eyes`,
      benefits: JSON.stringify(["Reduces body shame", "Decreases emotional eating", "Improves self-compassion", "Supports sustainable weight loss"]),
      bestFor: "When feeling body shame, after overeating, morning routine",
      sortOrder: 8,
    },
    // Grounding
    {
      name: "5-4-3-2-1 Grounding",
      description: "A sensory grounding technique to interrupt emotional eating urges by bringing you to the present moment.",
      category: "grounding" as const,
      duration: 3,
      difficulty: "beginner" as const,
      instructions: `1. When a craving or emotional eating urge hits, pause
2. Name 5 things you can SEE (look around the room)
3. Name 4 things you can TOUCH (feel textures around you)
4. Name 3 things you can HEAR (listen carefully)
5. Name 2 things you can SMELL (or imagine smells)
6. Name 1 thing you can TASTE (notice your mouth)
7. Take a deep breath
8. Ask yourself: "What do I really need right now?"
9. The craving may have passed or reduced
10. Choose a mindful response`,
      benefits: JSON.stringify(["Interrupts automatic eating", "Reduces anxiety", "Brings awareness to present", "Creates pause before eating"]),
      bestFor: "During cravings, anxiety, emotional moments",
      sortOrder: 9,
    },
    {
      name: "STOP Technique",
      description: "A quick mindfulness tool from DBT to interrupt emotional eating before it starts.",
      category: "grounding" as const,
      duration: 2,
      difficulty: "beginner" as const,
      instructions: `S - STOP what you're doing
  Freeze. Don't reach for food yet.

T - TAKE a step back
  Remove yourself from the kitchen/food area if possible.
  Take 3 deep breaths.

O - OBSERVE
  What am I feeling? (emotion)
  What am I thinking? (thoughts)
  What triggered this urge?
  Am I physically hungry or emotionally hungry?

P - PROCEED mindfully
  If truly hungry: eat mindfully
  If emotional: try a coping skill first
  Options: call a friend, take a walk, journal, do breathing exercise`,
      benefits: JSON.stringify(["Interrupts binge eating", "Creates decision point", "Increases awareness", "Builds impulse control"]),
      bestFor: "When about to emotionally eat, during binges, when triggered",
      sortOrder: 10,
    },
  ];

  // Check if exercises already exist
  const existing = await db.select().from(mindfulnessExercises).limit(1);
  if (existing.length > 0) {
    console.log("Mindfulness exercises already seeded");
    return;
  }

  // Insert all exercises
  await db.insert(mindfulnessExercises).values(exercises);
  console.log(`Seeded ${exercises.length} mindfulness exercises`);
}

// ============ Session Functions ============

/**
 * Start a new mindfulness session
 */
export async function startSession(
  userId: number,
  exerciseId: number,
  trigger?: string,
  moodBefore?: string,
  cravingIntensityBefore?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(mindfulnessSessions).values({
    userId,
    exerciseId,
    startedAt: new Date(),
    durationMinutes: 0,
    completed: false,
    trigger: trigger as any,
    moodBefore: moodBefore as any,
    cravingIntensityBefore,
  }).returning();
  return result.id;
}

/**
 * Complete a mindfulness session
 */
export async function completeSession(
  sessionId: number,
  userId: number,
  durationMinutes: number,
  moodAfter?: string,
  cravingIntensityAfter?: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(mindfulnessSessions)
    .set({
      completedAt: new Date(),
      durationMinutes,
      completed: true,
      moodAfter: moodAfter as any,
      cravingIntensityAfter,
      notes,
    })
    .where(
      and(
        eq(mindfulnessSessions.id, sessionId),
        eq(mindfulnessSessions.userId, userId)
      )
    );
}

/**
 * Get user's recent sessions
 */
export async function getRecentSessions(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      session: mindfulnessSessions,
      exercise: mindfulnessExercises,
    })
    .from(mindfulnessSessions)
    .innerJoin(mindfulnessExercises, eq(mindfulnessSessions.exerciseId, mindfulnessExercises.id))
    .where(eq(mindfulnessSessions.userId, userId))
    .orderBy(desc(mindfulnessSessions.startedAt))
    .limit(limit);
}

/**
 * Get user's session statistics
 */
export async function getSessionStats(userId: number) {
  const db = await getDb();
  if (!db) return {
    totalSessions: 0,
    totalMinutes: 0,
    sessionsThisWeek: 0,
    currentStreak: 0,
    favoriteExercise: null,
  };
  
  // Total sessions
  const totalResult = await db
    .select({ count: count() })
    .from(mindfulnessSessions)
    .where(
      and(
        eq(mindfulnessSessions.userId, userId),
        eq(mindfulnessSessions.completed, true)
      )
    );
  const totalSessions = totalResult[0]?.count || 0;

  // Total minutes
  const minutesResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${mindfulnessSessions.durationMinutes}), 0)` })
    .from(mindfulnessSessions)
    .where(
      and(
        eq(mindfulnessSessions.userId, userId),
        eq(mindfulnessSessions.completed, true)
      )
    );
  const totalMinutes = Number(minutesResult[0]?.total) || 0;

  // Sessions this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekResult = await db
    .select({ count: count() })
    .from(mindfulnessSessions)
    .where(
      and(
        eq(mindfulnessSessions.userId, userId),
        eq(mindfulnessSessions.completed, true),
        gte(mindfulnessSessions.startedAt, weekAgo)
      )
    );
  const sessionsThisWeek = weekResult[0]?.count || 0;

  // Favorite exercise (most practiced)
  const favoriteResult = await db
    .select({
      exerciseId: mindfulnessSessions.exerciseId,
      count: count(),
    })
    .from(mindfulnessSessions)
    .where(
      and(
        eq(mindfulnessSessions.userId, userId),
        eq(mindfulnessSessions.completed, true)
      )
    )
    .groupBy(mindfulnessSessions.exerciseId)
    .orderBy(desc(count()))
    .limit(1);

  let favoriteExercise = null;
  if (favoriteResult.length > 0) {
    favoriteExercise = await getExerciseById(favoriteResult[0].exerciseId);
  }

  // Calculate streak (consecutive days with at least one session)
  const sessionsWithDates = await db
    .selectDistinct({ date: sql<string>`DATE(${mindfulnessSessions.startedAt})`.as('session_date') })
    .from(mindfulnessSessions)
    .where(
      and(
        eq(mindfulnessSessions.userId, userId),
        eq(mindfulnessSessions.completed, true)
      )
    )
    .orderBy(desc(sql`DATE(${mindfulnessSessions.startedAt})`));

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sessionsWithDates.length; i++) {
    const sessionDate = new Date(sessionsWithDates[i].date);
    sessionDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (sessionDate.getTime() === expectedDate.getTime()) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    totalSessions,
    totalMinutes,
    sessionsThisWeek,
    currentStreak,
    favoriteExercise,
  };
}

/**
 * Get sessions by category for analytics
 */
export async function getSessionsByCategory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      category: mindfulnessExercises.category,
      count: count(),
      totalMinutes: sql<number>`COALESCE(SUM(${mindfulnessSessions.durationMinutes}), 0)`,
    })
    .from(mindfulnessSessions)
    .innerJoin(mindfulnessExercises, eq(mindfulnessSessions.exerciseId, mindfulnessExercises.id))
    .where(
      and(
        eq(mindfulnessSessions.userId, userId),
        eq(mindfulnessSessions.completed, true)
      )
    )
    .groupBy(mindfulnessExercises.category);
}
