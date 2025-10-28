import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const metersRouter = router({
  // Get all meters - الحصول على جميع العدادات
  getAll: publicProcedure.query(async () => {
    return await db.getAllMeters();
  }),

  // Get meter by ID - الحصول على عداد بالمعرف
  getById: publicProcedure
    .input(z.object({ meterId: z.number() }))
    .query(async ({ input }) => {
      return await db.getMeterById(input.meterId);
    }),

  // Get meters by customer ID - الحصول على عدادات عميل
  getByCustomerId: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getMetersByCustomerId(input.customerId);
    }),

  // Create meter - إنشاء عداد جديد
  create: publicProcedure
    .input(
      z.object({
        meterNumber: z.string().min(1),
        customerId: z.number(),
        meterType: z.enum(["منزلي", "تجاري", "صناعي"]).optional(),
        capacity: z.string().optional(),
        installationDate: z.string().optional(),
        location: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        status: z.enum(["نشط", "معطل", "صيانة"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.createMeter(input as any);
    }),

  // Update meter - تحديث بيانات عداد
  update: publicProcedure
    .input(
      z.object({
        meterId: z.number(),
        meterNumber: z.string().optional(),
        customerId: z.number().optional(),
        meterType: z.enum(["منزلي", "تجاري", "صناعي"]).optional(),
        capacity: z.string().optional(),
        location: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        status: z.enum(["نشط", "معطل", "صيانة"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { meterId, ...data } = input;
      return await db.updateMeter(meterId, data as any);
    }),

  // Delete meter - حذف عداد
  delete: publicProcedure
    .input(z.object({ meterId: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteMeter(input.meterId);
    }),
});
