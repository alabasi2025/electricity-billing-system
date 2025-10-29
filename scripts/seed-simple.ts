import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  users,
  customers,
  customerConnections,
  meters,
  meterReadings,
  tariffs,
  bills,
  payments,
  paymentMethods,
  complaints,
  employees,
  serviceAreas,
} from "../drizzle/schema";

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  console.log("🌱 بدء إدراج البيانات التجريبية المبسطة...\n");

  try {
    // حذف البيانات القديمة
    console.log("🗑️  حذف البيانات القديمة...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    await connection.query("TRUNCATE TABLE complaints");
    await connection.query("TRUNCATE TABLE payments");
    await connection.query("TRUNCATE TABLE bills");
    await connection.query("TRUNCATE TABLE meter_readings");
    await connection.query("TRUNCATE TABLE meters");
    await connection.query("TRUNCATE TABLE customer_connections");
    await connection.query("TRUNCATE TABLE customers");
    await connection.query("TRUNCATE TABLE tariffs");
    await connection.query("TRUNCATE TABLE payment_methods");
    await connection.query("TRUNCATE TABLE employees");
    await connection.query("TRUNCATE TABLE service_areas");
    await connection.query("TRUNCATE TABLE users");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("✅ تم حذف البيانات القديمة\n");

    // 1. Users
    console.log("👤 إضافة المستخدمين...");  
    const [user1] = await db.insert(users).values({
      openId: "admin-001",
      name: "أحمد محمد العلي",
      email: "ahmed.ali@electric.sa",
      phone: "+966501234567",
      role: "admin",
    });

    // 2. Service Areas
    console.log("📍 إضافة مناطق الخدمة...");
    const [area1] = await db.insert(serviceAreas).values({
      name: "الرياض - حي النخيل",
      code: "AREA-001",
      city: "الرياض",
      district: "النخيل",
      description: "منطقة سكنية راقية",
    });

    // 3. Employees
    console.log("👥 إضافة الموظفين...");
    const [emp1] = await db.insert(employees).values({
      userId: user1.insertId,
      employeeNumber: "EMP-001",
      department: "الصيانة الميدانية",
      hireDate: new Date("2020-01-15"),
      status: "active",
    });

       // 4. Payment Methods
    console.log("💳 إضافة طرق الدفع...");
    const [pm1] = await db.insert(paymentMethods).values({
      name: "نقدي",
      type: "cash",
      isActive: true,
    });
    const [pm2] = await db.insert(paymentMethods).values({
      name: "بطاقة ائتمان",
      type: "card",
      isActive: true,
    });

    // 5. Tariffs
    console.log("💰 إضافة التعريفات...");
    const [tariff1] = await db.insert(tariffs).values({
      tariffCode: "RES-2024",
      tariffName: "تعريفة سكنية 2024",
      tariffType: "residential",
      description: "تعريفة الاستهلاك السكني",
      effectiveFrom: new Date("2024-01-01"),
      isActive: true,
    });

    // 6. Customers
    console.log("👤 إضافة العملاء...");
    const [cust1] = await db.insert(customers).values({
      customerNumber: "CUST-001",
      name: "محمد عبدالرحمن الأحمد",
      email: "mohammed.ahmad@email.com",
      phone: "+966551234567",
      nationalId: "1234567890",
      address: "شارع الملك فهد، حي النخيل",
      city: "الرياض",
      district: "النخيل",
      customerType: "residential",
      status: "active",
    });

    const [cust2] = await db.insert(customers).values({
      customerNumber: "CUST-002",
      name: "سارة خالد المنصور",
      email: "sarah.almansour@email.com",
      phone: "+966552345678",
      nationalId: "2345678901",
      address: "طريق الأمير محمد بن عبدالعزيز",
      city: "الرياض",
      district: "العليا",
      customerType: "residential",
      status: "active",
    });

    const [cust3] = await db.insert(customers).values({
      customerNumber: "CUST-003",
      name: "مؤسسة النور التجارية",
      email: "info@alnoor.com",
      phone: "+966553456789",
      address: "شارع التحلية",
      city: "جدة",
      district: "الروضة",
      customerType: "commercial",
      status: "active",
    });

    // 7. Customer Connections
    console.log("🔌 إضافة اتصالات العملاء...");
    const [conn1] = await db.insert(customerConnections).values({
      connectionNumber: "CONN-001",
      customerId: cust1.insertId,
      serviceAreaId: area1.insertId,
      connectionType: "residential",
      connectionDate: new Date("2023-01-15"),
      loadCapacity: "10",
      voltage: "220",
      phaseType: "single",
      status: "active",
    });

    const [conn2] = await db.insert(customerConnections).values({
      connectionNumber: "CONN-002",
      customerId: cust2.insertId,
      serviceAreaId: area1.insertId,
      connectionType: "residential",
      connectionDate: new Date("2023-03-20"),
      loadCapacity: "15",
      voltage: "220",
      phaseType: "single",
      status: "active",
    });

    const [conn3] = await db.insert(customerConnections).values({
      connectionNumber: "CONN-003",
      customerId: cust3.insertId,
      serviceAreaId: area1.insertId,
      connectionType: "commercial",
      connectionDate: new Date("2022-06-10"),
      loadCapacity: "50",
      voltage: "380",
      phaseType: "three",
      status: "active",
    });

    // 8. Meters
    console.log("⚡ إضافة العدادات...");
    const [meter1] = await db.insert(meters).values({
      meterNumber: "MTR-001",
      connectionId: conn1.insertId,
      serialNumber: "SN-2024-001",
      meterType: "smart",
      manufacturer: "Landis+Gyr",
      model: "E650",
      installationDate: new Date("2023-01-20"),
      initialReading: "0",
      currentReading: "1250",
      status: "active",
    });

    const [meter2] = await db.insert(meters).values({
      meterNumber: "MTR-002",
      connectionId: conn2.insertId,
      serialNumber: "SN-2024-002",
      meterType: "smart",
      manufacturer: "Itron",
      model: "ACE6000",
      installationDate: new Date("2023-03-25"),
      initialReading: "0",
      currentReading: "2100",
      status: "active",
    });

    const [meter3] = await db.insert(meters).values({
      meterNumber: "MTR-003",
      connectionId: conn3.insertId,
      serialNumber: "SN-2024-003",
      meterType: "smart",
      manufacturer: "Siemens",
      model: "S650",
      installationDate: new Date("2022-06-15"),
      initialReading: "0",
      currentReading: "15000",
      status: "active",
    });

    // 9. Meter Readings
    console.log("📊 إضافة قراءات العدادات...");
    await db.insert(meterReadings).values([
      {
        meterId: meter1.insertId,
        readingDate: new Date("2024-04-01"),
        previousReading: "750",
        currentReading: "1000",
        consumption: "250",
        readingType: "actual",
        readBy: emp1.insertId,
      },
      {
        meterId: meter2.insertId,
        readingDate: new Date("2024-04-01"),
        previousReading: "1680",
        currentReading: "2100",
        consumption: "420",
        readingType: "actual",
        readBy: emp1.insertId,
      },
      {
        meterId: meter3.insertId,
        readingDate: new Date("2024-04-01"),
        previousReading: "12000",
        currentReading: "15000",
        consumption: "3000",
        readingType: "actual",
        readBy: emp1.insertId,
      },
    ]);

    // 10. Bills
    console.log("🧾 إضافة الفواتير...");
    const [bill1] = await db.insert(bills).values({
      billNumber: "BILL-2024-001",
      connectionId: conn1.insertId,
      customerId: cust1.insertId,
      meterId: meter1.insertId,
      billingPeriodStart: new Date("2024-04-01"),
      billingPeriodEnd: new Date("2024-04-30"),
      issueDate: new Date("2024-05-01"),
      dueDate: new Date("2024-05-15"),
      previousReading: "750",
      currentReading: "1000",
      consumption: "250",
      totalAmount: "75.00",
      remainingAmount: "0.00",
      status: "paid",
    });

    const [bill2] = await db.insert(bills).values({
      billNumber: "BILL-2024-002",
      connectionId: conn2.insertId,
      customerId: cust2.insertId,
      meterId: meter2.insertId,
      billingPeriodStart: new Date("2024-04-01"),
      billingPeriodEnd: new Date("2024-04-30"),
      issueDate: new Date("2024-05-01"),
      dueDate: new Date("2024-05-15"),
      previousReading: "1680",
      currentReading: "2100",
      consumption: "420",
      totalAmount: "144.00",
      remainingAmount: "144.00",
      status: "pending",
    });

    const [bill3] = await db.insert(bills).values({
      billNumber: "BILL-2024-003",
      connectionId: conn3.insertId,
      customerId: cust3.insertId,
      meterId: meter3.insertId,
      billingPeriodStart: new Date("2024-04-01"),
      billingPeriodEnd: new Date("2024-04-30"),
      issueDate: new Date("2024-05-01"),
      dueDate: new Date("2024-05-15"),
      previousReading: "12000",
      currentReading: "15000",
      consumption: "3000",
      totalAmount: "1800.00",
      remainingAmount: "1800.00",
      status: "pending",
    });

    // 11. Payments
    console.log("💵 إضافة المدفوعات...");
    await db.insert(payments).values([
      {
        paymentNumber: "PAY-2024-001",
        billId: bill1.insertId,
        customerId: cust1.insertId,
        amount: "75.00",
        paymentMethodId: pm2.insertId,
        paymentDate: new Date("2024-05-05"),
        transactionId: "TXN-20240505-001",
        status: "completed",
      },
    ]);

    // 12. Complaints
    console.log("📢 إضافة الشكاوى...");
    await db.insert(complaints).values([
      {
        complaintNumber: "COMP-2024-001",
        customerId: cust2.insertId,
        connectionId: conn2.insertId,
        complaintType: "billing_issue",
        subject: "فاتورة مرتفعة بشكل غير طبيعي",
        description: "الفاتورة الشهرية أعلى من المعتاد",
        priority: "medium",
        status: "open",
        reportedDate: new Date("2024-05-10"),
      },
      {
        complaintNumber: "COMP-2024-002",
        customerId: cust3.insertId,
        connectionId: conn3.insertId,
        complaintType: "power_outage",
        subject: "انقطاع متكرر للكهرباء",
        description: "انقطاع الكهرباء 3 مرات خلال الأسبوع",
        priority: "high",
        status: "in_progress",
        reportedDate: new Date("2024-05-08"),
        assignedTo: emp1.insertId,
      },
    ]);

    console.log("\n✅ تم إدراج جميع البيانات التجريبية بنجاح!");
    console.log("\n📊 ملخص البيانات:");
    console.log("   - 1 مستخدم");
    console.log("   - 1 منطقة خدمة");
    console.log("   - 1 موظف");
    console.log("   - 2 طريقة دفع");
    console.log("   - 1 تعريفة");
    console.log("   - 3 عملاء");
    console.log("   - 3 اتصالات");
    console.log("   - 3 عدادات");
    console.log("   - 3 قراءات");
    console.log("   - 3 فواتير");
    console.log("   - 1 دفعة");
    console.log("   - 2 شكاوى");

  } catch (error) {
    console.error("❌ خطأ في إدراج البيانات:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

seed()
  .then(() => {
    console.log("\n🎉 اكتملت عملية إدراج البيانات بنجاح!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 فشلت عملية إدراج البيانات:", error);
    process.exit(1);
  });
