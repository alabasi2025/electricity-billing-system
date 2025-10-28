import { eq, desc, and, gte, lte, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  customers,
  employees,
  meters,
  readings,
  tariffs,
  invoices,
  payments,
  notifications,
  complaints,
  activityLogs,
  InsertCustomer,
  InsertEmployee,
  InsertMeter,
  InsertReading,
  InsertTariff,
  InsertInvoice,
  InsertPayment,
  InsertNotification,
  InsertComplaint,
  InsertActivityLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

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

    const textFields = ["name", "email", "loginMethod"] as const;
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
      values.role = 'admin';
      updateSet.role = 'admin';
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

// ============================================================================
// Customer Functions - دوال العملاء
// ============================================================================

export async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function getCustomerById(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.customerId, customerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCustomer(customer: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(customer);
  return result;
}

export async function updateCustomer(customerId: number, customer: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(customers).set(customer).where(eq(customers.customerId, customerId));
}

export async function deleteCustomer(customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(customers).where(eq(customers.customerId, customerId));
}

export async function searchCustomers(query: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers).where(
    or(
      like(customers.fullName, `%${query}%`),
      like(customers.nationalId, `%${query}%`),
      like(customers.phone, `%${query}%`)
    )
  );
}

// ============================================================================
// Meter Functions - دوال العدادات
// ============================================================================

export async function getAllMeters() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(meters).orderBy(desc(meters.createdAt));
}

export async function getMeterById(meterId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(meters).where(eq(meters.meterId, meterId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMetersByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(meters).where(eq(meters.customerId, customerId));
}

export async function createMeter(meter: InsertMeter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(meters).values(meter);
}

export async function updateMeter(meterId: number, meter: Partial<InsertMeter>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(meters).set(meter).where(eq(meters.meterId, meterId));
}

export async function deleteMeter(meterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(meters).where(eq(meters.meterId, meterId));
}

// ============================================================================
// Reading Functions - دوال القراءات
// ============================================================================

export async function getAllReadings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(readings).orderBy(desc(readings.readingDate));
}

export async function getReadingById(readingId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(readings).where(eq(readings.readingId, readingId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getReadingsByMeterId(meterId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(readings).where(eq(readings.meterId, meterId)).orderBy(desc(readings.readingDate));
}

export async function createReading(reading: InsertReading) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(readings).values(reading);
}

export async function updateReading(readingId: number, reading: Partial<InsertReading>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(readings).set(reading).where(eq(readings.readingId, readingId));
}

// ============================================================================
// Invoice Functions - دوال الفواتير
// ============================================================================

export async function getAllInvoices() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(invoiceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.invoiceId, invoiceId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getInvoicesByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(invoices).where(eq(invoices.customerId, customerId)).orderBy(desc(invoices.createdAt));
}

export async function createInvoice(invoice: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(invoices).values(invoice);
}

export async function updateInvoice(invoiceId: number, invoice: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(invoices).set(invoice).where(eq(invoices.invoiceId, invoiceId));
}

export async function deleteInvoice(invoiceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(invoices).where(eq(invoices.invoiceId, invoiceId));
}

// ============================================================================
// Payment Functions - دوال المدفوعات
// ============================================================================

export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).orderBy(desc(payments.paymentDate));
}

export async function getPaymentById(paymentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.paymentId, paymentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaymentsByInvoiceId(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).where(eq(payments.invoiceId, invoiceId));
}

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(payments).values(payment);
}

// ============================================================================
// Notification Functions - دوال الإشعارات
// ============================================================================

export async function getNotificationsByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq(notifications.customerId, customerId)).orderBy(desc(notifications.sentDate));
}

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(notifications).values(notification);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(notifications).set({ isRead: true }).where(eq(notifications.notificationId, notificationId));
}

// ============================================================================
// Complaint Functions - دوال الشكاوى
// ============================================================================

export async function getAllComplaints() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(complaints).orderBy(desc(complaints.createdAt));
}

export async function getComplaintById(complaintId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(complaints).where(eq(complaints.complaintId, complaintId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getComplaintsByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(complaints).where(eq(complaints.customerId, customerId)).orderBy(desc(complaints.createdAt));
}

export async function createComplaint(complaint: InsertComplaint) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(complaints).values(complaint);
}

export async function updateComplaint(complaintId: number, complaint: Partial<InsertComplaint>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(complaints).set(complaint).where(eq(complaints.complaintId, complaintId));
}

// ============================================================================
// Tariff Functions - دوال التعريفات
// ============================================================================

export async function getAllTariffs() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tariffs).where(eq(tariffs.isActive, true));
}

export async function createTariff(tariff: InsertTariff) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tariffs).values(tariff);
}

// ============================================================================
// Activity Log Functions - دوال سجل النشاطات
// ============================================================================

export async function logActivity(log: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(activityLogs).values(log);
  } catch (error) {
    console.error("[Database] Failed to log activity:", error);
  }
}

export async function getActivityLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}
