import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import * as mindfulnessDb from "./mindfulnessDb";

export const mindfulnessRouter = router({
  // Get all exercises
  getExercises: publicProcedure.query(async () => {
    return mindfulnessDb.getAllExercises();
  }),

  // Get exercises by category
  getExercisesByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return mindfulnessDb.getExercisesByCategory(input.category);
    }),

  // Get single exercise
  getExercise: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return mindfulnessDb.getExerciseById(input.id);
    }),

  // Seed default exercises (admin/setup)
  seedExercises: protectedProcedure.mutation(async () => {
    await mindfulnessDb.seedDefaultExercises();
    return { success: true };
  }),

  // Start a session
  startSession: protectedProcedure
    .input(
      z.object({
        exerciseId: z.number(),
        trigger: z.enum(["scheduled", "craving", "stress", "emotional", "before_meal", "other"]).optional(),
        moodBefore: z.enum(["very_low", "low", "neutral", "good", "great"]).optional(),
        cravingIntensityBefore: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sessionId = await mindfulnessDb.startSession(
        ctx.user.id,
        input.exerciseId,
        input.trigger,
        input.moodBefore,
        input.cravingIntensityBefore
      );
      return { sessionId };
    }),

  // Complete a session
  completeSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        durationMinutes: z.number(),
        moodAfter: z.enum(["very_low", "low", "neutral", "good", "great"]).optional(),
        cravingIntensityAfter: z.number().min(1).max(10).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await mindfulnessDb.completeSession(
        input.sessionId,
        ctx.user.id,
        input.durationMinutes,
        input.moodAfter,
        input.cravingIntensityAfter,
        input.notes
      );
      return { success: true };
    }),

  // Get recent sessions
  getRecentSessions: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return mindfulnessDb.getRecentSessions(ctx.user.id, input?.limit || 10);
    }),

  // Get session stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return mindfulnessDb.getSessionStats(ctx.user.id);
  }),

  // Get sessions by category
  getSessionsByCategory: protectedProcedure.query(async ({ ctx }) => {
    return mindfulnessDb.getSessionsByCategory(ctx.user.id);
  }),
});
