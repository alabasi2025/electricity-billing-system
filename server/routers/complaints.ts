import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const complaintsRouter = router({
  // Get all complaints - الحصول على جميع الشكاوى
  getAll: publicProcedure.query(async () => {
    return await db.getAllComplaints();
  }),

  // Get complaint by ID - الحصول على شكوى بالمعرف
  getById: publicProcedure
    .input(z.object({ complaintId: z.number() }))
    .query(async ({ input }) => {
      return await db.getComplaintById(input.complaintId);
    }),

  // Get complaints by customer ID - الحصول على شكاوى عميل
  getByCustomerId: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getComplaintsByCustomerId(input.customerId);
    }),

  // Create complaint - إنشاء شكوى جديدة
  create: publicProcedure
    .input(
      z.object({
        customerId: z.number(),
        meterId: z.number().optional(),
        complaintType: z.enum(["عطل", "قراءة خاطئة", "فاتورة", "أخرى"]),
        subject: z.string().min(1),
        description: z.string().min(1),
        priority: z.enum(["عالية", "متوسطة", "منخفضة"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.createComplaint(input as any);
    }),

  // Update complaint - تحديث شكوى
  update: publicProcedure
    .input(
      z.object({
        complaintId: z.number(),
        status: z.enum(["جديدة", "قيد المعالجة", "محلولة", "مغلقة"]).optional(),
        assignedTo: z.number().optional(),
        resolution: z.string().optional(),
        resolvedAt: z.string().transform((val) => new Date(val)).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { complaintId, ...data } = input;
      return await db.updateComplaint(complaintId, data as any);
    }),
});

export const notificationsRouter = router({
  // Get notifications by customer ID - الحصول على إشعارات عميل
  getByCustomerId: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getNotificationsByCustomerId(input.customerId);
    }),

  // Create notification - إنشاء إشعار جديد
  create: publicProcedure
    .input(
      z.object({
        customerId: z.number(),
        notificationType: z.enum(["فاتورة", "تذكير", "تنبيه"]),
        title: z.string().min(1),
        message: z.string().min(1),
        sentDate: z.string().transform((val) => new Date(val)),
      })
    )
    .mutation(async ({ input }) => {
      return await db.createNotification(input as any);
    }),

  // Mark notification as read - تعليم إشعار كمقروء
  markAsRead: publicProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      return await db.markNotificationAsRead(input.notificationId);
    }),
});
