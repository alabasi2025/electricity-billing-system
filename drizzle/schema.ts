import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date, datetime } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// نظام فوترة عدادات الكهرباء - Electricity Billing System
// ============================================================================

/**
 * جدول العملاء - Customers Table
 * يحتوي على معلومات العملاء المشتركين في خدمة الكهرباء
 */
export const customers = mysqlTable("customers", {
  customerId: int("customerId").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 100 }).notNull(),
  nationalId: varchar("nationalId", { length: 20 }).unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  city: varchar("city", { length: 50 }),
  district: varchar("district", { length: 50 }),
  registrationDate: date("registrationDate").notNull(),
  status: mysqlEnum("status", ["نشط", "متوقف", "معلق"]).default("نشط").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * جدول الموظفين - Employees Table
 * يحتوي على معلومات موظفي النظام
 */
export const employees = mysqlTable("employees", {
  employeeId: int("employeeId").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  fullName: varchar("fullName", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  role: mysqlEnum("role", ["مدير", "محاسب", "قارئ", "دعم"]).default("قارئ").notNull(),
  department: varchar("department", { length: 50 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastLogin: datetime("lastLogin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * جدول العدادات - Meters Table
 * يحتوي على معلومات عدادات الكهرباء المثبتة
 */
export const meters = mysqlTable("meters", {
  meterId: int("meterId").autoincrement().primaryKey(),
  meterNumber: varchar("meterNumber", { length: 50 }).notNull().unique(),
  customerId: int("customerId").notNull(),
  meterType: mysqlEnum("meterType", ["منزلي", "تجاري", "صناعي"]).default("منزلي").notNull(),
  capacity: decimal("capacity", { precision: 10, scale: 2 }),
  installationDate: date("installationDate"),
  location: text("location"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  status: mysqlEnum("status", ["نشط", "معطل", "صيانة"]).default("نشط").notNull(),
  lastReadingDate: datetime("lastReadingDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Meter = typeof meters.$inferSelect;
export type InsertMeter = typeof meters.$inferInsert;

/**
 * جدول القراءات - Readings Table
 * يحتوي على قراءات العدادات الشهرية
 */
export const readings = mysqlTable("readings", {
  readingId: int("readingId").autoincrement().primaryKey(),
  meterId: int("meterId").notNull(),
  readingDate: datetime("readingDate").notNull(),
  previousReading: decimal("previousReading", { precision: 10, scale: 2 }).notNull(),
  currentReading: decimal("currentReading", { precision: 10, scale: 2 }).notNull(),
  consumption: decimal("consumption", { precision: 10, scale: 2 }).notNull(),
  readerId: int("readerId"),
  readingMethod: mysqlEnum("readingMethod", ["يدوي", "آلي"]).default("يدوي").notNull(),
  notes: text("notes"),
  imagePath: varchar("imagePath", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reading = typeof readings.$inferSelect;
export type InsertReading = typeof readings.$inferInsert;

/**
 * جدول التعريفات - Tariffs Table
 * يحتوي على تعريفات أسعار الكهرباء
 */
export const tariffs = mysqlTable("tariffs", {
  tariffId: int("tariffId").autoincrement().primaryKey(),
  tariffName: varchar("tariffName", { length: 100 }).notNull(),
  meterType: mysqlEnum("meterType", ["منزلي", "تجاري", "صناعي"]).notNull(),
  consumptionFrom: decimal("consumptionFrom", { precision: 10, scale: 2 }).notNull(),
  consumptionTo: decimal("consumptionTo", { precision: 10, scale: 2 }).notNull(),
  pricePerUnit: decimal("pricePerUnit", { precision: 10, scale: 4 }).notNull(),
  effectiveDate: date("effectiveDate").notNull(),
  expiryDate: date("expiryDate"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tariff = typeof tariffs.$inferSelect;
export type InsertTariff = typeof tariffs.$inferInsert;

/**
 * جدول الفواتير - Invoices Table
 * يحتوي على فواتير الكهرباء الشهرية
 */
export const invoices = mysqlTable("invoices", {
  invoiceId: int("invoiceId").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  customerId: int("customerId").notNull(),
  meterId: int("meterId").notNull(),
  readingId: int("readingId"),
  billingPeriodStart: date("billingPeriodStart").notNull(),
  billingPeriodEnd: date("billingPeriodEnd").notNull(),
  consumption: decimal("consumption", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  serviceFees: decimal("serviceFees", { precision: 10, scale: 2 }).default("0").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("dueDate").notNull(),
  status: mysqlEnum("status", ["معلقة", "مدفوعة", "متأخرة", "ملغاة"]).default("معلقة").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * جدول المدفوعات - Payments Table
 * يحتوي على سجلات الدفعات المستلمة
 */
export const payments = mysqlTable("payments", {
  paymentId: int("paymentId").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  customerId: int("customerId").notNull(),
  paymentDate: datetime("paymentDate").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["نقدي", "بطاقة", "تحويل", "محفظة"]).notNull(),
  transactionReference: varchar("transactionReference", { length: 100 }),
  paymentStatus: mysqlEnum("paymentStatus", ["مكتمل", "معلق", "فاشل", "مرتجع"]).default("مكتمل").notNull(),
  receivedBy: int("receivedBy"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * جدول الإشعارات - Notifications Table
 * يحتوي على إشعارات النظام للعملاء
 */
export const notifications = mysqlTable("notifications", {
  notificationId: int("notificationId").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  notificationType: mysqlEnum("notificationType", ["فاتورة", "تذكير", "تنبيه"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  sentDate: datetime("sentDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * جدول الشكاوى - Complaints Table
 * يحتوي على شكاوى وطلبات العملاء
 */
export const complaints = mysqlTable("complaints", {
  complaintId: int("complaintId").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  meterId: int("meterId"),
  complaintType: mysqlEnum("complaintType", ["عطل", "قراءة خاطئة", "فاتورة", "أخرى"]).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description").notNull(),
  priority: mysqlEnum("priority", ["عالية", "متوسطة", "منخفضة"]).default("متوسطة").notNull(),
  status: mysqlEnum("status", ["جديدة", "قيد المعالجة", "محلولة", "مغلقة"]).default("جديدة").notNull(),
  assignedTo: int("assignedTo"),
  resolution: text("resolution"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: datetime("resolvedAt"),
});

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = typeof complaints.$inferInsert;

/**
 * جدول سجل النشاطات - Activity Logs Table
 * يحتوي على سجل جميع العمليات في النظام
 */
export const activityLogs = mysqlTable("activityLogs", {
  logId: int("logId").autoincrement().primaryKey(),
  userId: int("userId"),
  userType: mysqlEnum("userType", ["موظف", "عميل"]),
  action: varchar("action", { length: 100 }).notNull(),
  tableName: varchar("tableName", { length: 50 }),
  recordId: int("recordId"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// ============================================================================
// Relations - العلاقات بين الجداول
// ============================================================================

export const customersRelations = relations(customers, ({ many }) => ({
  meters: many(meters),
  invoices: many(invoices),
  payments: many(payments),
  notifications: many(notifications),
  complaints: many(complaints),
}));

export const metersRelations = relations(meters, ({ one, many }) => ({
  customer: one(customers, {
    fields: [meters.customerId],
    references: [customers.customerId],
  }),
  readings: many(readings),
  invoices: many(invoices),
  complaints: many(complaints),
}));

export const readingsRelations = relations(readings, ({ one }) => ({
  meter: one(meters, {
    fields: [readings.meterId],
    references: [meters.meterId],
  }),
  reader: one(employees, {
    fields: [readings.readerId],
    references: [employees.employeeId],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.customerId],
  }),
  meter: one(meters, {
    fields: [invoices.meterId],
    references: [meters.meterId],
  }),
  reading: one(readings, {
    fields: [invoices.readingId],
    references: [readings.readingId],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.invoiceId],
  }),
  customer: one(customers, {
    fields: [payments.customerId],
    references: [customers.customerId],
  }),
  receiver: one(employees, {
    fields: [payments.receivedBy],
    references: [employees.employeeId],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  customer: one(customers, {
    fields: [notifications.customerId],
    references: [customers.customerId],
  }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  customer: one(customers, {
    fields: [complaints.customerId],
    references: [customers.customerId],
  }),
  meter: one(meters, {
    fields: [complaints.meterId],
    references: [meters.meterId],
  }),
  assignee: one(employees, {
    fields: [complaints.assignedTo],
    references: [employees.employeeId],
  }),
}));
