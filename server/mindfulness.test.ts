import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as mindfulnessDb from "./mindfulnessDb";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Use a real user ID that exists in the database
const testUserId = 7; // Robert Washburn's user ID

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: testUserId,
    openId: "test-mindfulness-user",
    email: "test-mindfulness@example.com",
    name: "Test Mindfulness User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    setCookie: () => {},
    clearCookie: () => {},
  };
}

describe("Mindfulness Feature", () => {
  describe("Exercise Library", () => {
    it("should get all exercises via tRPC", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const exercises = await caller.mindfulness.getExercises();
      expect(Array.isArray(exercises)).toBe(true);
      expect(exercises.length).toBeGreaterThan(0);
    });

    it("should filter exercises by category", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const breathingExercises = await caller.mindfulness.getExercisesByCategory({ category: "breathing" });
      expect(Array.isArray(breathingExercises)).toBe(true);
      breathingExercises.forEach((exercise: { category: string }) => {
        expect(exercise.category).toBe("breathing");
      });
    });

    it("should have required exercise fields", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const exercises = await caller.mindfulness.getExercises();
      if (exercises.length > 0) {
        const exercise = exercises[0];
        expect(exercise.id).toBeDefined();
        expect(exercise.name).toBeDefined();
        expect(exercise.category).toBeDefined();
        expect(exercise.duration).toBeDefined();
        expect(exercise.difficulty).toBeDefined();
      }
    });
  });

  describe("Session Management", () => {
    it("should start a new session", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      // Get an exercise first
      const exercises = await caller.mindfulness.getExercises();
      expect(exercises.length).toBeGreaterThan(0);
      
      const exerciseId = exercises[0].id;
      
      const result = await caller.mindfulness.startSession({
        exerciseId,
        trigger: "stress",
        moodBefore: "neutral",
        cravingIntensityBefore: 5,
      });

      expect(result).toBeDefined();
      expect(result.sessionId).toBeDefined();
    });

    it("should get recent sessions", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const sessions = await caller.mindfulness.getRecentSessions({ limit: 10 });
      expect(Array.isArray(sessions)).toBe(true);
    });

    it("should get user stats", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const stats = await caller.mindfulness.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalSessions).toBe("number");
      expect(typeof stats.totalMinutes).toBe("number");
      expect(typeof stats.currentStreak).toBe("number");
      expect(typeof stats.sessionsThisWeek).toBe("number");
    });
  });

  describe("Database Functions", () => {
    it("should get all exercises from database", async () => {
      const exercises = await mindfulnessDb.getAllExercises();
      expect(Array.isArray(exercises)).toBe(true);
      expect(exercises.length).toBeGreaterThan(0);
    });

    it("should filter exercises by category from database", async () => {
      const exercises = await mindfulnessDb.getExercisesByCategory("breathing");
      expect(Array.isArray(exercises)).toBe(true);
      exercises.forEach((exercise) => {
        expect(exercise.category).toBe("breathing");
      });
    });
  });
});
