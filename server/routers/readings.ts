import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const readingsRouter = router({
  // Get all readings - الحصول على جميع القراءات
  getAll: publicProcedure.query(async () => {
    return await db.getAllReadings();
  }),

  // Get reading by ID - الحصول على قراءة بالمعرف
  getById: publicProcedure
    .input(z.object({ readingId: z.number() }))
    .query(async ({ input }) => {
      return await db.getReadingById(input.readingId);
    }),

  // Get readings by meter ID - الحصول على قراءات عداد
  getByMeterId: publicProcedure
    .input(z.object({ meterId: z.number() }))
    .query(async ({ input }) => {
      return await db.getReadingsByMeterId(input.meterId);
    }),

  // Create reading - إنشاء قراءة جديدة
  create: publicProcedure
    .input(
      z.object({
        meterId: z.number(),
        readingDate: z.string().transform((val) => new Date(val)),
        previousReading: z.number(),
        currentReading: z.number(),
        consumption: z.number(),
        readerId: z.number().optional(),
        readingMethod: z.enum(["يدوي", "آلي"]).optional(),
        notes: z.string().optional(),
        imagePath: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.createReading(input as any);
    }),

  // Update reading - تحديث قراءة
  update: publicProcedure
    .input(
      z.object({
        readingId: z.number(),
        previousReading: z.number().optional(),
        currentReading: z.number().optional(),
        consumption: z.number().optional(),
        notes: z.string().optional(),
        imagePath: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { readingId, ...data } = input;
      return await db.updateReading(readingId, data as any);
    }),
});
