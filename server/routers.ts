import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getDb } from "./db";
import {
  customers,
  customerConnections,
  meters,
  meterReadings,
  bills,
  payments,
  complaints,
  workOrders,
  notifications,
  tariffs,
  serviceAreas,
  assets,
  renewableEnergy,
  evChargingStations,
  fraudDetectionLogs,
  consumptionPredictions,
} from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,

  // ============================================
  // AUTH
  // ============================================
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================
  // DASHBOARD
  // ============================================
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
  }),

  // ============================================
  // CUSTOMERS
  // ============================================
  customers: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllCustomers();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerById(input.id);
      }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchCustomers(input.query);
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerNumber: z.string(),
          name: z.string(),
          email: z.string().email().optional(),
          phone: z.string(),
          address: z.string(),
          city: z.string(),
          customerType: z.enum(["individual", "business", "government"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [result] = await database.insert(customers).values(input);
        return { id: result.insertId, success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          status: z.enum(["active", "inactive", "suspended", "blacklisted"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const { id, ...data } = input;
        await database.update(customers).set(data).where(eq(customers.id, id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.delete(customers).where(eq(customers.id, input.id));
        return { success: true };
      }),
  }),

  // ============================================
  // METERS
  // ============================================
  meters: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllMeters();
    }),

    getByConnection: protectedProcedure
      .input(z.object({ connectionId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMetersByCustomer(input.connectionId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          meterNumber: z.string(),
          connectionId: z.number(),
          serialNumber: z.string().optional(),
          installationDate: z.string().transform(val => new Date(val)),
          initialReading: z.string().optional(),
          status: z.enum(["active", "inactive", "faulty", "maintenance", "replaced"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [result] = await database.insert(meters).values(input);
        return { id: result.insertId, success: true };
      }),
  }),

  // ============================================
  // BILLS
  // ============================================
  bills: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllBills();
    }),

    getByCustomer: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBillsByCustomer(input.customerId);
      }),

    overdue: protectedProcedure.query(async () => {
      return await db.getOverdueBills();
    }),

    create: protectedProcedure
      .input(
        z.object({
          billNumber: z.string(),
          connectionId: z.number(),
          customerId: z.number(),
          meterId: z.number(),
          billingPeriodStart: z.string().transform(val => new Date(val)),
          billingPeriodEnd: z.string().transform(val => new Date(val)),
          issueDate: z.string().transform(val => new Date(val)),
          dueDate: z.string().transform(val => new Date(val)),
          previousReading: z.string(),
          currentReading: z.string(),
          consumption: z.string(),
          totalAmount: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [result] = await database.insert(bills).values({
          ...input,
          remainingAmount: input.totalAmount,
        });
        return { id: result.insertId, success: true };
      }),
  }),

  // ============================================
  // PAYMENTS
  // ============================================
  payments: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllPayments();
    }),

    getByCustomer: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPaymentsByCustomer(input.customerId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          paymentNumber: z.string(),
          billId: z.number().optional(),
          customerId: z.number(),
          amount: z.string(),
          paymentMethodId: z.number().optional(),
          paymentDate: z.string().transform(val => new Date(val)),
          transactionId: z.string().optional(),
          status: z.enum(["pending", "completed", "failed", "refunded", "cancelled"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [result] = await database.insert(payments).values(input);
        return { id: result.insertId, success: true };
      }),
  }),

  // ============================================
  // COMPLAINTS
  // ============================================
  complaints: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllComplaints();
    }),

    getByCustomer: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getComplaintsByCustomer(input.customerId);
      }),

    open: protectedProcedure.query(async () => {
      return await db.getOpenComplaints();
    }),

    create: protectedProcedure
      .input(
        z.object({
          complaintNumber: z.string(),
          customerId: z.number(),
          category: z.enum(["billing", "meter", "power_outage", "voltage", "connection", "disconnection", "other"]),
          subject: z.string(),
          description: z.string(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [result] = await database.insert(complaints).values(input);
        return { id: result.insertId, success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["open", "in_progress", "resolved", "closed", "cancelled"]).optional(),
          assignedTo: z.number().optional(),
          resolution: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const { id, ...data } = input;
        await database.update(complaints).set(data).where(eq(complaints.id, id));
        return { success: true };
      }),
  }),

  // ============================================
  // WORK ORDERS
  // ============================================
  workOrders: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllWorkOrders();
    }),

    pending: protectedProcedure.query(async () => {
      return await db.getPendingWorkOrders();
    }),

    create: protectedProcedure
      .input(
        z.object({
          workOrderNumber: z.string(),
          type: z.enum(["installation", "maintenance", "repair", "reading", "disconnection", "reconnection", "inspection"]),
          description: z.string(),
          customerId: z.number().optional(),
          connectionId: z.number().optional(),
          meterId: z.number().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          scheduledDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [result] = await database.insert(workOrders).values(input);
        return { id: result.insertId, success: true };
      }),
  }),

  // ============================================
  // TARIFFS
  // ============================================
  tariffs: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllTariffs();
    }),

    getWithSlabs: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTariffWithSlabs(input.id);
      }),
  }),

  // ============================================
  // RENEWABLE ENERGY
  // ============================================
  renewableEnergy: router({
    getByConnection: protectedProcedure
      .input(z.object({ connectionId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRenewableEnergyByConnection(input.connectionId);
      }),
  }),

  // ============================================
  // EV CHARGING
  // ============================================
  evCharging: router({
    stations: protectedProcedure.query(async () => {
      return await db.getAllChargingStations();
    }),

    sessionsByCustomer: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChargingSessionsByCustomer(input.customerId);
      }),
  }),

  // ============================================
  // FRAUD DETECTION
  // ============================================
  fraud: router({
    alerts: protectedProcedure.query(async () => {
      return await db.getFraudAlerts();
    }),
  }),

  // ============================================
  // PREDICTIONS
  // ============================================
  predictions: router({
    getByCustomer: protectedProcedure
      .input(z.object({ customerId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getPredictionsByCustomer(input.customerId, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
