import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const customersRouter = router({
  // Get all customers - الحصول على جميع العملاء
  getAll: publicProcedure.query(async () => {
    return await db.getAllCustomers();
  }),

  // Get customer by ID - الحصول على عميل بالمعرف
  getById: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerById(input.customerId);
    }),

  // Search customers - البحث عن العملاء
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return await db.searchCustomers(input.query);
    }),

  // Create customer - إنشاء عميل جديد
  create: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        nationalId: z.string().optional(),
        phone: z.string().min(1),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        registrationDate: z.string().transform((val) => new Date(val)),
        status: z.enum(["نشط", "متوقف", "معلق"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.createCustomer(input as any);
    }),

  // Update customer - تحديث بيانات عميل
  update: publicProcedure
    .input(
      z.object({
        customerId: z.number(),
        fullName: z.string().optional(),
        nationalId: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        status: z.enum(["نشط", "متوقف", "معلق"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { customerId, ...data } = input;
      return await db.updateCustomer(customerId, data);
    }),

  // Delete customer - حذف عميل
  delete: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteCustomer(input.customerId);
    }),
});
