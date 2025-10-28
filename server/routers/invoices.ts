import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const invoicesRouter = router({
  // Get all invoices - الحصول على جميع الفواتير
  getAll: publicProcedure.query(async () => {
    return await db.getAllInvoices();
  }),

  // Get invoice by ID - الحصول على فاتورة بالمعرف
  getById: publicProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input }) => {
      return await db.getInvoiceById(input.invoiceId);
    }),

  // Get invoices by customer ID - الحصول على فواتير عميل
  getByCustomerId: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getInvoicesByCustomerId(input.customerId);
    }),

  // Create invoice - إنشاء فاتورة جديدة
  create: publicProcedure
    .input(
      z.object({
        invoiceNumber: z.string().min(1),
        customerId: z.number(),
        meterId: z.number(),
        readingId: z.number().optional(),
        billingPeriodStart: z.string().transform((val) => new Date(val)),
        billingPeriodEnd: z.string().transform((val) => new Date(val)),
        consumption: z.number(),
        unitPrice: z.number(),
        subtotal: z.number(),
        taxAmount: z.number().optional(),
        serviceFees: z.number().optional(),
        totalAmount: z.number(),
        dueDate: z.string().transform((val) => new Date(val)),
        status: z.enum(["معلقة", "مدفوعة", "متأخرة", "ملغاة"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.createInvoice(input as any);
    }),

  // Update invoice - تحديث فاتورة
  update: publicProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        status: z.enum(["معلقة", "مدفوعة", "متأخرة", "ملغاة"]).optional(),
        taxAmount: z.number().optional(),
        serviceFees: z.number().optional(),
        totalAmount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { invoiceId, ...data } = input;
      return await db.updateInvoice(invoiceId, data as any);
    }),

  // Delete invoice - حذف فاتورة
  delete: publicProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteInvoice(input.invoiceId);
    }),
});

export const paymentsRouter = router({
  // Get all payments - الحصول على جميع المدفوعات
  getAll: publicProcedure.query(async () => {
    return await db.getAllPayments();
  }),

  // Get payment by ID - الحصول على دفعة بالمعرف
  getById: publicProcedure
    .input(z.object({ paymentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getPaymentById(input.paymentId);
    }),

  // Get payments by invoice ID - الحصول على دفعات فاتورة
  getByInvoiceId: publicProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input }) => {
      return await db.getPaymentsByInvoiceId(input.invoiceId);
    }),

  // Create payment - إنشاء دفعة جديدة
  create: publicProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        customerId: z.number(),
        paymentDate: z.string().transform((val) => new Date(val)),
        amount: z.number(),
        paymentMethod: z.enum(["نقدي", "بطاقة", "تحويل", "محفظة"]),
        transactionReference: z.string().optional(),
        paymentStatus: z.enum(["مكتمل", "معلق", "فاشل", "مرتجع"]).optional(),
        receivedBy: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.createPayment(input as any);
      
      // Update invoice status to paid if payment is complete
      if (input.paymentStatus === "مكتمل" || !input.paymentStatus) {
        await db.updateInvoice(input.invoiceId, { status: "مدفوعة" });
      }
      
      return result;
    }),
});
