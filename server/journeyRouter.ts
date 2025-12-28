import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as journeyDb from "./journeyDb";

export const journeyRouter = router({
  // Journey Phases
  initializePhases: protectedProcedure
    .input(z.object({
      startWeight: z.number(),
      targetWeight: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await journeyDb.initializeJourneyPhases(ctx.user.id, input.startWeight, input.targetWeight);
    }),
  
  getCurrentPhase: protectedProcedure.query(async ({ ctx }) => {
    return await journeyDb.getCurrentPhase(ctx.user.id);
  }),
  
  getAllPhases: protectedProcedure.query(async ({ ctx }) => {
    return await journeyDb.getAllPhases(ctx.user.id);
  }),
  
  updatePhaseProgress: protectedProcedure
    .input(z.object({
      phaseNumber: z.number(),
      actualWeightLoss: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await journeyDb.updatePhaseProgress(ctx.user.id, input.phaseNumber, input.actualWeightLoss);
    }),
  
  resetJourney: protectedProcedure
    .mutation(async ({ ctx }) => {
      return await journeyDb.resetJourney(ctx.user.id);
    }),
});

export const journeySupplementsRouter = router({
  getByPhase: protectedProcedure
    .input(z.object({ phaseNumber: z.number() }))
    .query(async ({ input }) => {
      return await journeyDb.getSupplementsByPhase(input.phaseNumber);
    }),
  
  getAll: protectedProcedure.query(async () => {
    return await journeyDb.getAllSupplements();
  }),
  
  logIntake: protectedProcedure
    .input(z.object({
      supplementId: z.number(),
      date: z.date(),
      taken: z.boolean(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await journeyDb.logSupplementIntake(ctx.user.id, input.supplementId, input.date, input.taken, input.notes);
    }),
  
  getLogForDate: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      return await journeyDb.getSupplementLogForDate(ctx.user.id, input.date);
    }),
});

export const fastingRouter = router({
  startSession: protectedProcedure
    .input(z.object({
      type: z.enum(['24hr', '3-5day', '7-10day']),
      targetDuration: z.number(),
      weightBefore: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await journeyDb.startFastingSession(ctx.user.id, input.type, input.targetDuration, input.weightBefore);
    }),
  
  endSession: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      weightAfter: z.number().optional(),
      electrolytesLog: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await journeyDb.endFastingSession(ctx.user.id, input.sessionId, input.weightAfter, input.electrolytesLog, input.notes);
    }),
  
  getActive: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await journeyDb.getActiveFastingSession(ctx.user.id);
    return sessions[0] || null;
  }),
  
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      return await journeyDb.getFastingHistory(ctx.user.id, input.limit);
    }),
});

export const bloodWorkRouter = router({
  add: protectedProcedure
    .input(z.object({
      testDate: z.date(),
      glucose: z.number().optional(),
      a1c: z.number().optional(),
      totalCholesterol: z.number().optional(),
      ldl: z.number().optional(),
      hdl: z.number().optional(),
      triglycerides: z.number().optional(),
      tsh: z.number().optional(),
      alt: z.number().optional(),
      ast: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await journeyDb.addBloodWorkResult(ctx.user.id, input.testDate, input);
    }),
  
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    return await journeyDb.getBloodWorkHistory(ctx.user.id);
  }),
  
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    return await journeyDb.getLatestBloodWork(ctx.user.id);
  }),
});
