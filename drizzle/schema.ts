import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date, index } from "drizzle-orm/mysql-core";

/**
 * نظام فوترة كهرباء متكامل عالمي
 * يجمع أفضل ميزات 13 نظام عالمي
 * 
 * Schema Design based on:
 * - Tridens (Slovenia)
 * - Kraken (UK)
 * - Oracle Energy (USA)
 * - Bynry (USA)
 * - EnergyCAP (USA)
 * - AMCS (Ireland)
 * - triPica (France)
 * - SkyBill (Latvia)
 * - MaxBill (UK)
 * - MuniBilling (USA)
 * - CIS Utility Billing (USA)
 * - EB-Billing-System (India)
 * - OpenMeter (Open Source)
 */

// ============================================
// 1. USERS & AUTHENTICATION
// ============================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "user", "manager", "field_worker", "customer_service"]).default("user").notNull(),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  phoneIdx: index("phone_idx").on(table.phone),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// 2. SERVICE AREAS (مناطق الخدمة)
// ============================================

export const serviceAreas = mysqlTable("service_areas", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  description: text("description"),
  region: varchar("region", { length: 100 }),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  gpsCoordinates: text("gpsCoordinates"), // JSON: {lat, lng, polygon}
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("code_idx").on(table.code),
  cityIdx: index("city_idx").on(table.city),
}));

export type ServiceArea = typeof serviceAreas.$inferSelect;

// ============================================
// 3. CUSTOMERS (العملاء)
// ============================================

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  customerNumber: varchar("customerNumber", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  alternatePhone: varchar("alternatePhone", { length: 20 }),
  nationalId: varchar("nationalId", { length: 50 }),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }),
  postalCode: varchar("postalCode", { length: 20 }),
  gpsCoordinates: text("gpsCoordinates"), // JSON: {lat, lng}
  serviceAreaId: int("serviceAreaId").references(() => serviceAreas.id),
  customerType: mysqlEnum("customerType", ["individual", "business", "government"]).default("individual").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "suspended", "blacklisted"]).default("active").notNull(),
  creditLimit: decimal("creditLimit", { precision: 10, scale: 2 }).default("0.00"),
  currentBalance: decimal("currentBalance", { precision: 10, scale: 2 }).default("0.00"),
  totalDebt: decimal("totalDebt", { precision: 10, scale: 2 }).default("0.00"),
  loyaltyPoints: int("loyaltyPoints").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  customerNumberIdx: index("customer_number_idx").on(table.customerNumber),
  phoneIdx: index("phone_idx").on(table.phone),
  emailIdx: index("email_idx").on(table.email),
  statusIdx: index("status_idx").on(table.status),
}));

export type Customer = typeof customers.$inferSelect;

// ============================================
// 4. CUSTOMER CONNECTIONS (اتصالات العملاء)
// ============================================

export const customerConnections = mysqlTable("customer_connections", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => customers.id, { onDelete: "cascade" }),
  connectionNumber: varchar("connectionNumber", { length: 50 }).notNull().unique(),
  connectionType: mysqlEnum("connectionType", ["residential", "commercial", "industrial", "agricultural"]).notNull(),
  connectionDate: date("connectionDate").notNull(),
  disconnectionDate: date("disconnectionDate"),
  status: mysqlEnum("status", ["active", "disconnected", "suspended", "pending"]).default("active").notNull(),
  loadCapacity: decimal("loadCapacity", { precision: 10, scale: 2 }), // بالكيلوواط
  voltage: varchar("voltage", { length: 20 }), // 220V, 380V, etc.
  phases: int("phases").default(1), // 1 or 3
  propertyType: varchar("propertyType", { length: 100 }), // villa, apartment, shop, factory
  buildingArea: decimal("buildingArea", { precision: 10, scale: 2 }), // بالمتر المربع
  numberOfOccupants: int("numberOfOccupants"),
  hasRenewableEnergy: boolean("hasRenewableEnergy").default(false),
  hasEVCharger: boolean("hasEVCharger").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  connectionNumberIdx: index("connection_number_idx").on(table.connectionNumber),
  customerIdIdx: index("customer_id_idx").on(table.customerId),
  statusIdx: index("status_idx").on(table.status),
  connectionTypeIdx: index("connection_type_idx").on(table.connectionType),
}));

export type CustomerConnection = typeof customerConnections.$inferSelect;

// ============================================
// 5. METER TYPES (أنواع العدادات)
// ============================================

export const meterTypes = mysqlTable("meter_types", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  type: mysqlEnum("type", ["analog", "digital", "smart", "prepaid"]).notNull(),
  accuracy: varchar("accuracy", { length: 20 }), // Class 1, Class 2
  maxLoad: decimal("maxLoad", { precision: 10, scale: 2 }), // بالأمبير
  voltage: varchar("voltage", { length: 20 }),
  phases: int("phases").default(1),
  hasRemoteReading: boolean("hasRemoteReading").default(false),
  hasTamperDetection: boolean("hasTamperDetection").default(false),
  hasLoadControl: boolean("hasLoadControl").default(false),
  communicationProtocol: varchar("communicationProtocol", { length: 50 }), // DLMS, Modbus, etc.
  warrantyYears: int("warrantyYears"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MeterType = typeof meterTypes.$inferSelect;

// ============================================
// 6. METERS (العدادات)
// ============================================

export const meters = mysqlTable("meters", {
  id: int("id").autoincrement().primaryKey(),
  meterNumber: varchar("meterNumber", { length: 50 }).notNull().unique(),
  connectionId: int("connectionId").notNull().references(() => customerConnections.id, { onDelete: "cascade" }),
  meterTypeId: int("meterTypeId").references(() => meterTypes.id),
  serialNumber: varchar("serialNumber", { length: 100 }).unique(),
  installationDate: date("installationDate").notNull(),
  lastMaintenanceDate: date("lastMaintenanceDate"),
  nextMaintenanceDate: date("nextMaintenanceDate"),
  initialReading: decimal("initialReading", { precision: 15, scale: 2 }).default("0.00"),
  currentReading: decimal("currentReading", { precision: 15, scale: 2 }).default("0.00"),
  status: mysqlEnum("status", ["active", "inactive", "faulty", "maintenance", "replaced"]).default("active").notNull(),
  location: text("location"),
  gpsCoordinates: text("gpsCoordinates"), // JSON: {lat, lng}
  qrCode: varchar("qrCode", { length: 200 }), // للقراءة بالموبايل
  imageUrl: varchar("imageUrl", { length: 500 }),
  sealNumber: varchar("sealNumber", { length: 50 }),
  isSmart: boolean("isSmart").default(false),
  lastCommunication: timestamp("lastCommunication"),
  batteryLevel: int("batteryLevel"), // للعدادات الذكية
  signalStrength: int("signalStrength"), // للعدادات الذكية
  firmwareVersion: varchar("firmwareVersion", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  meterNumberIdx: index("meter_number_idx").on(table.meterNumber),
  connectionIdIdx: index("connection_id_idx").on(table.connectionId),
  statusIdx: index("status_idx").on(table.status),
  serialNumberIdx: index("serial_number_idx").on(table.serialNumber),
}));

export type Meter = typeof meters.$inferSelect;

// ============================================
// 7. TARIFFS (التعريفات)
// ============================================

export const tariffs = mysqlTable("tariffs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  connectionType: mysqlEnum("connectionType", ["residential", "commercial", "industrial", "agricultural"]).notNull(),
  description: text("description"),
  effectiveFrom: date("effectiveFrom").notNull(),
  effectiveTo: date("effectiveTo"),
  fixedCharge: decimal("fixedCharge", { precision: 10, scale: 2 }).default("0.00"), // رسم ثابت شهري
  minimumCharge: decimal("minimumCharge", { precision: 10, scale: 2 }).default("0.00"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "bimonthly", "quarterly"]).default("monthly"),
  hasTOU: boolean("hasTOU").default(false), // Time of Use
  hasSeasonalRates: boolean("hasSeasonalRates").default(false),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("code_idx").on(table.code),
  connectionTypeIdx: index("connection_type_idx").on(table.connectionType),
}));

export type Tariff = typeof tariffs.$inferSelect;

// ============================================
// 8. TARIFF SLABS (شرائح التعريفة)
// ============================================

export const tariffSlabs = mysqlTable("tariff_slabs", {
  id: int("id").autoincrement().primaryKey(),
  tariffId: int("tariffId").notNull().references(() => tariffs.id, { onDelete: "cascade" }),
  slabNumber: int("slabNumber").notNull(),
  fromUnits: decimal("fromUnits", { precision: 10, scale: 2 }).notNull(),
  toUnits: decimal("toUnits", { precision: 10, scale: 2 }), // NULL = unlimited
  ratePerUnit: decimal("ratePerUnit", { precision: 10, scale: 4 }).notNull(),
  timeOfUse: mysqlEnum("timeOfUse", ["peak", "off_peak", "shoulder", "all_day"]).default("all_day"),
  season: mysqlEnum("season", ["summer", "winter", "all_year"]).default("all_year"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tariffIdIdx: index("tariff_id_idx").on(table.tariffId),
}));

export type TariffSlab = typeof tariffSlabs.$inferSelect;

// ============================================
// 9. METER READINGS (قراءات العدادات)
// ============================================

export const meterReadings = mysqlTable("meter_readings", {
  id: int("id").autoincrement().primaryKey(),
  meterId: int("meterId").notNull().references(() => meters.id, { onDelete: "cascade" }),
  readingDate: timestamp("readingDate").notNull(),
  previousReading: decimal("previousReading", { precision: 15, scale: 2 }).notNull(),
  currentReading: decimal("currentReading", { precision: 15, scale: 2 }).notNull(),
  consumption: decimal("consumption", { precision: 15, scale: 2 }).notNull(),
  readingType: mysqlEnum("readingType", ["manual", "automatic", "estimated", "customer_submitted"]).notNull(),
  readBy: int("readBy").references(() => users.id), // الموظف الذي قرأ العداد
  imageUrl: varchar("imageUrl", { length: 500 }), // صورة العداد
  gpsCoordinates: text("gpsCoordinates"), // موقع القراءة
  isAnomalous: boolean("isAnomalous").default(false), // قراءة شاذة
  anomalyReason: text("anomalyReason"),
  isVerified: boolean("isVerified").default(false),
  verifiedBy: int("verifiedBy").references(() => users.id),
  verifiedAt: timestamp("verifiedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  meterIdIdx: index("meter_id_idx").on(table.meterId),
  readingDateIdx: index("reading_date_idx").on(table.readingDate),
  readingTypeIdx: index("reading_type_idx").on(table.readingType),
}));

export type MeterReading = typeof meterReadings.$inferSelect;

// ============================================
// 10. BILLS (الفواتير)
// ============================================

export const bills = mysqlTable("bills", {
  id: int("id").autoincrement().primaryKey(),
  billNumber: varchar("billNumber", { length: 50 }).notNull().unique(),
  connectionId: int("connectionId").notNull().references(() => customerConnections.id, { onDelete: "cascade" }),
  customerId: int("customerId").notNull().references(() => customers.id, { onDelete: "cascade" }),
  meterId: int("meterId").notNull().references(() => meters.id),
  readingId: int("readingId").references(() => meterReadings.id),
  tariffId: int("tariffId").references(() => tariffs.id),
  billingPeriodStart: date("billingPeriodStart").notNull(),
  billingPeriodEnd: date("billingPeriodEnd").notNull(),
  issueDate: date("issueDate").notNull(),
  dueDate: date("dueDate").notNull(),
  previousReading: decimal("previousReading", { precision: 15, scale: 2 }).notNull(),
  currentReading: decimal("currentReading", { precision: 15, scale: 2 }).notNull(),
  consumption: decimal("consumption", { precision: 15, scale: 2 }).notNull(),
  energyCharges: decimal("energyCharges", { precision: 10, scale: 2 }).default("0.00"),
  fixedCharges: decimal("fixedCharges", { precision: 10, scale: 2 }).default("0.00"),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0.00"),
  taxPercentage: decimal("taxPercentage", { precision: 5, scale: 2 }).default("0.00"),
  otherCharges: decimal("otherCharges", { precision: 10, scale: 2 }).default("0.00"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00"),
  previousBalance: decimal("previousBalance", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 10, scale: 2 }).default("0.00"),
  remainingAmount: decimal("remainingAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "partially_paid", "overdue", "cancelled"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "partially_paid", "refunded"]).default("unpaid").notNull(),
  latePaymentFee: decimal("latePaymentFee", { precision: 10, scale: 2 }).default("0.00"),
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  qrCode: varchar("qrCode", { length: 200 }),
  sentToCustomer: boolean("sentToCustomer").default(false),
  sentAt: timestamp("sentAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  billNumberIdx: index("bill_number_idx").on(table.billNumber),
  customerIdIdx: index("customer_id_idx").on(table.customerId),
  connectionIdIdx: index("connection_id_idx").on(table.connectionId),
  statusIdx: index("status_idx").on(table.status),
  dueDateIdx: index("due_date_idx").on(table.dueDate),
}));

export type Bill = typeof bills.$inferSelect;

// ============================================
// 11. BILL ITEMS (بنود الفواتير)
// ============================================

export const billItems = mysqlTable("bill_items", {
  id: int("id").autoincrement().primaryKey(),
  billId: int("billId").notNull().references(() => bills.id, { onDelete: "cascade" }),
  itemType: mysqlEnum("itemType", ["energy_charge", "fixed_charge", "tax", "late_fee", "discount", "other"]).notNull(),
  description: text("description").notNull(),
  units: decimal("units", { precision: 15, scale: 2 }),
  rate: decimal("rate", { precision: 10, scale: 4 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  slabNumber: int("slabNumber"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  billIdIdx: index("bill_id_idx").on(table.billId),
}));

export type BillItem = typeof billItems.$inferSelect;

// ============================================
// 12. PAYMENT METHODS (طرق الدفع)
// ============================================

export const paymentMethods = mysqlTable("payment_methods", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["cash", "card", "bank_transfer", "mobile_payment", "online", "check"]).notNull(),
  provider: varchar("provider", { length: 100 }), // Stripe, PayPal, etc.
  isActive: boolean("isActive").default(true),
  requiresApproval: boolean("requiresApproval").default(false),
  processingFee: decimal("processingFee", { precision: 10, scale: 2 }).default("0.00"),
  processingFeePercentage: decimal("processingFeePercentage", { precision: 5, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;

// ============================================
// 13. PAYMENTS (المدفوعات)
// ============================================

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  paymentNumber: varchar("paymentNumber", { length: 50 }).notNull().unique(),
  billId: int("billId").references(() => bills.id, { onDelete: "set null" }),
  customerId: int("customerId").notNull().references(() => customers.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethodId: int("paymentMethodId").references(() => paymentMethods.id),
  paymentDate: timestamp("paymentDate").notNull(),
  transactionId: varchar("transactionId", { length: 200 }),
  referenceNumber: varchar("referenceNumber", { length: 200 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded", "cancelled"]).default("pending").notNull(),
  receivedBy: int("receivedBy").references(() => users.id),
  notes: text("notes"),
  receiptUrl: varchar("receiptUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  paymentNumberIdx: index("payment_number_idx").on(table.paymentNumber),
  customerIdIdx: index("customer_id_idx").on(table.customerId),
  billIdIdx: index("bill_id_idx").on(table.billId),
  statusIdx: index("status_idx").on(table.status),
  paymentDateIdx: index("payment_date_idx").on(table.paymentDate),
}));

export type Payment = typeof payments.$inferSelect;

// ============================================
// 14. COMPLAINTS (الشكاوى)
// ============================================

export const complaints = mysqlTable("complaints", {
  id: int("id").autoincrement().primaryKey(),
  complaintNumber: varchar("complaintNumber", { length: 50 }).notNull().unique(),
  customerId: int("customerId").notNull().references(() => customers.id, { onDelete: "cascade" }),
  connectionId: int("connectionId").references(() => customerConnections.id),
  meterId: int("meterId").references(() => meters.id),
  category: mysqlEnum("category", ["billing", "meter", "power_outage", "voltage", "connection", "disconnection", "other"]).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed", "cancelled"]).default("open").notNull(),
  assignedTo: int("assignedTo").references(() => users.id),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: int("resolvedBy").references(() => users.id),
  customerSatisfaction: int("customerSatisfaction"), // 1-5
  attachments: text("attachments"), // JSON array of URLs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  complaintNumberIdx: index("complaint_number_idx").on(table.complaintNumber),
  customerIdIdx: index("customer_id_idx").on(table.customerId),
  statusIdx: index("status_idx").on(table.status),
  priorityIdx: index("priority_idx").on(table.priority),
}));

export type Complaint = typeof complaints.$inferSelect;

// ============================================
// 15. WORK ORDERS (أوامر العمل)
// ============================================

export const workOrders = mysqlTable("work_orders", {
  id: int("id").autoincrement().primaryKey(),
  workOrderNumber: varchar("workOrderNumber", { length: 50 }).notNull().unique(),
  type: mysqlEnum("type", ["installation", "maintenance", "repair", "reading", "disconnection", "reconnection", "inspection"]).notNull(),
  customerId: int("customerId").references(() => customers.id),
  connectionId: int("connectionId").references(() => customerConnections.id),
  meterId: int("meterId").references(() => meters.id),
  complaintId: int("complaintId").references(() => complaints.id),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "assigned", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  scheduledDate: timestamp("scheduledDate"),
  completedDate: timestamp("completedDate"),
  assignedTo: int("assignedTo").references(() => users.id),
  description: text("description").notNull(),
  workPerformed: text("workPerformed"),
  partsUsed: text("partsUsed"), // JSON array
  laborHours: decimal("laborHours", { precision: 5, scale: 2 }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  customerSignature: text("customerSignature"), // base64 image
  technicianNotes: text("technicianNotes"),
  attachments: text("attachments"), // JSON array of URLs
  gpsCoordinates: text("gpsCoordinates"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  workOrderNumberIdx: index("work_order_number_idx").on(table.workOrderNumber),
  statusIdx: index("status_idx").on(table.status),
  assignedToIdx: index("assigned_to_idx").on(table.assignedTo),
  scheduledDateIdx: index("scheduled_date_idx").on(table.scheduledDate),
}));

export type WorkOrder = typeof workOrders.$inferSelect;

// ============================================
// 16. ASSETS (الأصول)
// ============================================

export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  assetNumber: varchar("assetNumber", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  type: mysqlEnum("type", ["transformer", "cable", "pole", "switch", "panel", "generator", "other"]).notNull(),
  category: varchar("category", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  serialNumber: varchar("serialNumber", { length: 100 }),
  capacity: varchar("capacity", { length: 100 }),
  installationDate: date("installationDate"),
  warrantyExpiry: date("warrantyExpiry"),
  lastMaintenanceDate: date("lastMaintenanceDate"),
  nextMaintenanceDate: date("nextMaintenanceDate"),
  status: mysqlEnum("status", ["operational", "maintenance", "faulty", "retired"]).default("operational").notNull(),
  location: text("location"),
  serviceAreaId: int("serviceAreaId").references(() => serviceAreas.id),
  gpsCoordinates: text("gpsCoordinates"),
  purchaseDate: date("purchaseDate"),
  purchaseCost: decimal("purchaseCost", { precision: 10, scale: 2 }),
  currentValue: decimal("currentValue", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  assetNumberIdx: index("asset_number_idx").on(table.assetNumber),
  typeIdx: index("type_idx").on(table.type),
  statusIdx: index("status_idx").on(table.status),
}));

export type Asset = typeof assets.$inferSelect;

// ============================================
// 17. RENEWABLE ENERGY (الطاقة المتجددة)
// ============================================

export const renewableEnergy = mysqlTable("renewable_energy", {
  id: int("id").autoincrement().primaryKey(),
  connectionId: int("connectionId").notNull().references(() => customerConnections.id, { onDelete: "cascade" }),
  systemType: mysqlEnum("systemType", ["solar", "wind", "hybrid"]).notNull(),
  capacity: decimal("capacity", { precision: 10, scale: 2 }).notNull(), // بالكيلوواط
  installationDate: date("installationDate").notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  inverterCapacity: decimal("inverterCapacity", { precision: 10, scale: 2 }),
  batteryCapacity: decimal("batteryCapacity", { precision: 10, scale: 2 }), // بالكيلوواط ساعة
  hasBattery: boolean("hasBattery").default(false),
  isNetMetered: boolean("isNetMetered").default(false),
  netMeteringStartDate: date("netMeteringStartDate"),
  exportRate: decimal("exportRate", { precision: 10, scale: 4 }), // سعر بيع الكهرباء للشبكة
  totalEnergyProduced: decimal("totalEnergyProduced", { precision: 15, scale: 2 }).default("0.00"),
  totalEnergyExported: decimal("totalEnergyExported", { precision: 15, scale: 2 }).default("0.00"),
  totalCredits: decimal("totalCredits", { precision: 10, scale: 2 }).default("0.00"),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  connectionIdIdx: index("connection_id_idx").on(table.connectionId),
}));

export type RenewableEnergy = typeof renewableEnergy.$inferSelect;

// ============================================
// 18. EV CHARGING STATIONS (محطات شحن السيارات)
// ============================================

export const evChargingStations = mysqlTable("ev_charging_stations", {
  id: int("id").autoincrement().primaryKey(),
  stationNumber: varchar("stationNumber", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  location: text("location").notNull(),
  gpsCoordinates: text("gpsCoordinates").notNull(),
  serviceAreaId: int("serviceAreaId").references(() => serviceAreas.id),
  type: mysqlEnum("type", ["public", "private", "semi_public"]).notNull(),
  chargerType: mysqlEnum("chargerType", ["level1", "level2", "dc_fast", "ultra_fast"]).notNull(),
  numberOfPorts: int("numberOfPorts").notNull(),
  powerOutput: decimal("powerOutput", { precision: 10, scale: 2 }).notNull(), // بالكيلوواط
  pricePerKwh: decimal("pricePerKwh", { precision: 10, scale: 4 }).notNull(),
  pricePerMinute: decimal("pricePerMinute", { precision: 10, scale: 4 }),
  status: mysqlEnum("status", ["available", "occupied", "maintenance", "offline"]).default("available").notNull(),
  isOperational: boolean("isOperational").default(true),
  hasReservation: boolean("hasReservation").default(false),
  paymentMethods: text("paymentMethods"), // JSON array
  amenities: text("amenities"), // JSON array
  operatingHours: text("operatingHours"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  stationNumberIdx: index("station_number_idx").on(table.stationNumber),
  statusIdx: index("status_idx").on(table.status),
}));

export type EVChargingStation = typeof evChargingStations.$inferSelect;

// ============================================
// 19. EV CHARGING SESSIONS (جلسات الشحن)
// ============================================

export const evChargingSessions = mysqlTable("ev_charging_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionNumber: varchar("sessionNumber", { length: 50 }).notNull().unique(),
  stationId: int("stationId").notNull().references(() => evChargingStations.id),
  customerId: int("customerId").references(() => customers.id),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  energyDelivered: decimal("energyDelivered", { precision: 10, scale: 2 }), // بالكيلوواط ساعة
  duration: int("duration"), // بالدقائق
  cost: decimal("cost", { precision: 10, scale: 2 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed"]).default("pending"),
  vehicleInfo: text("vehicleInfo"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  sessionNumberIdx: index("session_number_idx").on(table.sessionNumber),
  stationIdIdx: index("station_id_idx").on(table.stationId),
  customerIdIdx: index("customer_id_idx").on(table.customerId),
}));

export type EVChargingSession = typeof evChargingSessions.$inferSelect;

// ============================================
// 20. NOTIFICATIONS (الإشعارات)
// ============================================

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").references(() => customers.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["bill", "payment", "disconnection", "maintenance", "alert", "promotion", "other"]).notNull(),
  channel: mysqlEnum("channel", ["email", "sms", "push", "in_app"]).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "read"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  readAt: timestamp("readAt"),
  metadata: text("metadata"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  customerIdIdx: index("customer_id_idx").on(table.customerId),
  userIdIdx: index("user_id_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Notification = typeof notifications.$inferSelect;

// ============================================
// 21. FRAUD DETECTION LOGS (سجل كشف الاحتيال)
// ============================================

export const fraudDetectionLogs = mysqlTable("fraud_detection_logs", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").references(() => customers.id),
  meterId: int("meterId").references(() => meters.id),
  readingId: int("readingId").references(() => meterReadings.id),
  fraudType: mysqlEnum("fraudType", ["tampering", "bypass", "abnormal_consumption", "meter_reversal", "other"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  description: text("description").notNull(),
  detectedBy: mysqlEnum("detectedBy", ["ai", "manual", "smart_meter"]).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0-100%
  status: mysqlEnum("status", ["detected", "investigating", "confirmed", "false_positive", "resolved"]).default("detected").notNull(),
  investigatedBy: int("investigatedBy").references(() => users.id),
  resolution: text("resolution"),
  estimatedLoss: decimal("estimatedLoss", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  customerIdIdx: index("customer_id_idx").on(table.customerId),
  meterIdIdx: index("meter_id_idx").on(table.meterId),
  statusIdx: index("status_idx").on(table.status),
}));

export type FraudDetectionLog = typeof fraudDetectionLogs.$inferSelect;

// ============================================
// 22. CONSUMPTION PREDICTIONS (توقعات الاستهلاك)
// ============================================

export const consumptionPredictions = mysqlTable("consumption_predictions", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => customers.id, { onDelete: "cascade" }),
  connectionId: int("connectionId").notNull().references(() => customerConnections.id, { onDelete: "cascade" }),
  predictionDate: date("predictionDate").notNull(),
  predictedConsumption: decimal("predictedConsumption", { precision: 15, scale: 2 }).notNull(),
  predictedCost: decimal("predictedCost", { precision: 10, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0-100%
  modelVersion: varchar("modelVersion", { length: 50 }),
  actualConsumption: decimal("actualConsumption", { precision: 15, scale: 2 }),
  actualCost: decimal("actualCost", { precision: 10, scale: 2 }),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  customerIdIdx: index("customer_id_idx").on(table.customerId),
  predictionDateIdx: index("prediction_date_idx").on(table.predictionDate),
}));

export type ConsumptionPrediction = typeof consumptionPredictions.$inferSelect;

// ============================================
// 23. ACTIVITY LOGS (سجل النشاطات)
// ============================================

export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: int("entityId"),
  description: text("description"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  metadata: text("metadata"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  entityIdx: index("entity_idx").on(table.entity),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type ActivityLog = typeof activityLogs.$inferSelect;

// ============================================
// 24. SYSTEM SETTINGS (إعدادات النظام)
// ============================================

export const systemSettings = mysqlTable("system_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  dataType: mysqlEnum("dataType", ["string", "number", "boolean", "json"]).default("string"),
  isPublic: boolean("isPublic").default(false),
  updatedBy: int("updatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  keyIdx: index("key_idx").on(table.key),
  categoryIdx: index("category_idx").on(table.category),
}));

export type SystemSetting = typeof systemSettings.$inferSelect;

// ============================================
// 25. EMPLOYEES (الموظفين)
// ============================================

export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  employeeNumber: varchar("employeeNumber", { length: 50 }).notNull().unique(),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  hireDate: date("hireDate"),
  serviceAreaId: int("serviceAreaId").references(() => serviceAreas.id),
  isFieldWorker: boolean("isFieldWorker").default(false),
  vehicleNumber: varchar("vehicleNumber", { length: 50 }),
  emergencyContact: text("emergencyContact"), // JSON
  status: mysqlEnum("status", ["active", "inactive", "on_leave", "terminated"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  employeeNumberIdx: index("employee_number_idx").on(table.employeeNumber),
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type Employee = typeof employees.$inferSelect;
