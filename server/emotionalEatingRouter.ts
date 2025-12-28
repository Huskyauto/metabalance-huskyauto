import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as emotionalEatingDb from "./emotionalEatingDb";

export const emotionalEatingRouter = router({
  // Log an emotional eating episode
  logEpisode: protectedProcedure
    .input(
      z.object({
        triggerEmotion: z.enum(["stress", "anxiety", "sadness", "boredom", "anger", "loneliness", "other"]),
        triggerDescription: z.string().optional(),
        situation: z.string().optional(),
        foodConsumed: z.string().min(1, "Food consumed is required"),
        estimatedCalories: z.number().int().positive().optional(),
        intensity: z.number().int().min(1).max(10),
        copingStrategyUsed: z.string().optional(),
        effectivenessRating: z.number().int().min(1).max(10).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await emotionalEatingDb.logEmotionalEating({
        userId: ctx.user.id,
        ...input,
      });
    }),

  // Get emotional eating history
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return await emotionalEatingDb.getEmotionalEatingHistory(
        ctx.user.id,
        input?.limit
      );
    }),

  // Get emotional eating by date range
  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string(), // ISO date string
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await emotionalEatingDb.getEmotionalEatingByDateRange(
        ctx.user.id,
        new Date(input.startDate),
        new Date(input.endDate)
      );
    }),

  // Get emotional eating analytics
  getAnalytics: protectedProcedure
    .input(
      z.object({
        days: z.number().int().positive().default(30),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return await emotionalEatingDb.getEmotionalEatingAnalytics(
        ctx.user.id,
        input?.days
      );
    }),

  // Medications
  addMedication: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Medication name is required"),
        type: z.enum(["glp1_agonist", "ssri", "stimulant", "combination", "other"]),
        dosage: z.string().min(1, "Dosage is required"),
        frequency: z.string().min(1, "Frequency is required"),
        startDate: z.string(), // YYYY-MM-DD
        endDate: z.string().optional(),
        prescribedFor: z.string().optional(),
        sideEffects: z.string().optional(),
        effectiveness: z.number().int().min(1).max(10).optional(),
        notes: z.string().optional(),
        active: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await emotionalEatingDb.addMedication({
        userId: ctx.user.id,
        ...input,
      });
    }),

  getMedications: protectedProcedure
    .input(
      z.object({
        activeOnly: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return await emotionalEatingDb.getMedications(
        ctx.user.id,
        input?.activeOnly
      );
    }),

  updateMedication: protectedProcedure
    .input(
      z.object({
        medicationId: z.number().int().positive(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
        endDate: z.string().optional(),
        sideEffects: z.string().optional(),
        effectiveness: z.number().int().min(1).max(10).optional(),
        notes: z.string().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { medicationId, ...updates } = input;
      return await emotionalEatingDb.updateMedication(
        medicationId,
        ctx.user.id,
        updates
      );
    }),

  logMedicationTaken: protectedProcedure
    .input(
      z.object({
        medicationId: z.number().int().positive(),
        takenAt: z.string(), // ISO datetime string
        dosageTaken: z.string().min(1),
        sideEffectsNoted: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await emotionalEatingDb.logMedicationTaken({
        userId: ctx.user.id,
        medicationId: input.medicationId,
        takenAt: new Date(input.takenAt),
        dosageTaken: input.dosageTaken,
        sideEffectsNoted: input.sideEffectsNoted,
        notes: input.notes,
      });
    }),

  getMedicationLogs: protectedProcedure
    .input(
      z.object({
        medicationId: z.number().int().positive().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().int().positive().default(100),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return await emotionalEatingDb.getMedicationLogs(
        ctx.user.id,
        input?.medicationId,
        input?.startDate ? new Date(input.startDate) : undefined,
        input?.endDate ? new Date(input.endDate) : undefined,
        input?.limit
      );
    }),

  getMedicationAdherence: protectedProcedure
    .input(
      z.object({
        medicationId: z.number().int().positive(),
        days: z.number().int().positive().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      return await emotionalEatingDb.getMedicationAdherenceStats(
        ctx.user.id,
        input.medicationId,
        input.days
      );
    }),
});
