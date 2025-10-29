import { eq, and, desc, sql, gte, lte, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  InsertUser,
  customers,
  customerConnections,
  meters,
  meterTypes,
  meterReadings,
  tariffs,
  tariffSlabs,
  bills,
  billItems,
  payments,
  paymentMethods,
  complaints,
  workOrders,
  notifications,
  serviceAreas,
  assets,
  renewableEnergy,
  evChargingStations,
  evChargingSessions,
  fraudDetectionLogs,
  consumptionPredictions,
  activityLogs,
  systemSettings,
  employees,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

export async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0] || null;
}

export async function searchCustomers(query: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(customers)
    .where(
      or(
        like(customers.name, `%${query}%`),
        like(customers.customerNumber, `%${query}%`),
        like(customers.phone, `%${query}%`),
        like(customers.email, `%${query}%`)
      )
    )
    .limit(50);
}

// ============================================
// METER MANAGEMENT
// ============================================

export async function getAllMeters() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(meters).orderBy(desc(meters.createdAt));
}

export async function getMetersByCustomer(connectionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(meters).where(eq(meters.connectionId, connectionId));
}

// ============================================
// BILLING MANAGEMENT
// ============================================

export async function getAllBills() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bills).orderBy(desc(bills.createdAt)).limit(100);
}

export async function getBillsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bills).where(eq(bills.customerId, customerId)).orderBy(desc(bills.issueDate));
}

export async function getOverdueBills() {
  const db = await getDb();
  if (!db) return [];
  const today = new Date();
  return await db
    .select()
    .from(bills)
    .where(and(eq(bills.status, "overdue"), lte(bills.dueDate, today)))
    .orderBy(bills.dueDate);
}

// ============================================
// PAYMENT MANAGEMENT
// ============================================

export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(100);
}

export async function getPaymentsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).where(eq(payments.customerId, customerId)).orderBy(desc(payments.paymentDate));
}

// ============================================
// COMPLAINT MANAGEMENT
// ============================================

export async function getAllComplaints() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(complaints).orderBy(desc(complaints.createdAt)).limit(100);
}

export async function getComplaintsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(complaints).where(eq(complaints.customerId, customerId)).orderBy(desc(complaints.createdAt));
}

export async function getOpenComplaints() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(complaints).where(eq(complaints.status, "open")).orderBy(desc(complaints.createdAt));
}

// ============================================
// DASHBOARD STATISTICS
// ============================================

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const [
    totalCustomers,
    totalMeters,
    totalBills,
    pendingBills,
    overdueBills,
    totalPayments,
    openComplaints,
    totalRevenue,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(customers),
    db.select({ count: sql<number>`count(*)` }).from(meters).where(eq(meters.status, "active")),
    db.select({ count: sql<number>`count(*)` }).from(bills),
    db.select({ count: sql<number>`count(*)` }).from(bills).where(eq(bills.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(bills).where(eq(bills.status, "overdue")),
    db.select({ count: sql<number>`count(*)` }).from(payments).where(eq(payments.status, "completed")),
    db.select({ count: sql<number>`count(*)` }).from(complaints).where(eq(complaints.status, "open")),
    db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` }).from(payments).where(eq(payments.status, "completed")),
  ]);

  return {
    totalCustomers: totalCustomers[0]?.count || 0,
    totalMeters: totalMeters[0]?.count || 0,
    totalBills: totalBills[0]?.count || 0,
    pendingBills: pendingBills[0]?.count || 0,
    overdueBills: overdueBills[0]?.count || 0,
    totalPayments: totalPayments[0]?.count || 0,
    openComplaints: openComplaints[0]?.count || 0,
    totalRevenue: totalRevenue[0]?.total || 0,
  };
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function getNotificationsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.customerId, customerId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

// ============================================
// WORK ORDERS
// ============================================

export async function getAllWorkOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(workOrders).orderBy(desc(workOrders.createdAt)).limit(100);
}

export async function getPendingWorkOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(workOrders).where(eq(workOrders.status, "pending")).orderBy(workOrders.scheduledDate);
}

// ============================================
// TARIFFS
// ============================================

export async function getAllTariffs() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tariffs).where(eq(tariffs.isActive, true));
}

export async function getTariffWithSlabs(tariffId: number) {
  const db = await getDb();
  if (!db) return null;

  const [tariff] = await db.select().from(tariffs).where(eq(tariffs.id, tariffId)).limit(1);
  if (!tariff) return null;

  const slabs = await db.select().from(tariffSlabs).where(eq(tariffSlabs.tariffId, tariffId)).orderBy(tariffSlabs.slabNumber);

  return { ...tariff, slabs };
}

// ============================================
// RENEWABLE ENERGY
// ============================================

export async function getRenewableEnergyByConnection(connectionId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(renewableEnergy).where(eq(renewableEnergy.connectionId, connectionId)).limit(1);
  return result[0] || null;
}

// ============================================
// EV CHARGING
// ============================================

export async function getAllChargingStations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(evChargingStations).where(eq(evChargingStations.isOperational, true));
}

export async function getChargingSessionsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(evChargingSessions)
    .where(eq(evChargingSessions.customerId, customerId))
    .orderBy(desc(evChargingSessions.startTime));
}

// ============================================
// FRAUD DETECTION
// ============================================

export async function getFraudAlerts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(fraudDetectionLogs)
    .where(eq(fraudDetectionLogs.status, "detected"))
    .orderBy(desc(fraudDetectionLogs.createdAt))
    .limit(50);
}

// ============================================
// CONSUMPTION PREDICTIONS
// ============================================

export async function getPredictionsByCustomer(customerId: number, limit = 12) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(consumptionPredictions)
    .where(eq(consumptionPredictions.customerId, customerId))
    .orderBy(desc(consumptionPredictions.predictionDate))
    .limit(limit);
}

// ============================================
// ACTIVITY LOGS
// ============================================

export async function logActivity(data: {
  userId?: number;
  action: string;
  entity: string;
  entityId?: number;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(data);
}

// ============================================
// SYSTEM SETTINGS
// ============================================

export async function getSystemSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  return result[0] || null;
}

export async function setSystemSetting(key: string, value: string, category?: string, description?: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(systemSettings)
    .values({ key, value, category, description })
    .onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });
}
