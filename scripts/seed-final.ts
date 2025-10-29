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

  console.log("🌱 بدء إدراج البيانات التجريبية الصحيحة...\n");

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

    const [user2] = await db.insert(users).values({
      openId: "tech-001",
      name: "خالد عبدالله السعيد",
      email: "khaled.saeed@electric.sa",
      phone: "+966507654321",
      role: "user",
    });

    // 2. Service Areas
    console.log("📍 إضافة مناطق الخدمة...");
    const [area1] = await db.insert(serviceAreas).values({
      name: "الرياض - حي النخيل",
      code: "RYD-NKH-001",
      city: "الرياض",
      district: "النخيل",
      region: "الرياض",
      description: "منطقة سكنية راقية شمال الرياض",
      isActive: true,
    });

    const [area2] = await db.insert(serviceAreas).values({
      name: "جدة - حي الروضة",
      code: "JED-RWD-001",
      city: "جدة",
      district: "الروضة",
      region: "مكة المكرمة",
      description: "منطقة تجارية وسكنية",
      isActive: true,
    });

    // 3. Employees
    console.log("👥 إضافة الموظفين...");
    const [emp1] = await db.insert(employees).values({
      userId: user1.insertId,
      employeeNumber: "EMP-001",
      department: "الإدارة",
      position: "مدير النظام",
      hireDate: new Date("2020-01-15"),
      serviceAreaId: area1.insertId,
      status: "active",
    });

    const [emp2] = await db.insert(employees).values({
      userId: user2.insertId,
      employeeNumber: "EMP-002",
      department: "الصيانة الميدانية",
      position: "فني كهرباء",
      hireDate: new Date("2021-03-10"),
      serviceAreaId: area1.insertId,
      isFieldWorker: true,
      vehicleNumber: "ABC-1234",
      emergencyContact: "+966501111111",
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
      provider: "Visa/Mastercard",
      processingFee: 2.50,
      processingFeePercentage: 2.5,
      isActive: true,
    });

    const [pm3] = await db.insert(paymentMethods).values({
      name: "تحويل بنكي",
      type: "bank_transfer",
      requiresApproval: true,
      isActive: true,
    });

    // 5. Tariffs - بحقول صحيحة من Schema
    console.log("💰 إضافة التعريفات...");
    const [tariff1] = await db.insert(tariffs).values({
      name: "تعريفة سكنية 2024",
      code: "RES-2024",
      connectionType: "residential",
      description: "تعريفة الاستهلاك السكني للعام 2024",
      effectiveFrom: new Date("2024-01-01"),
      fixedCharge: 10.00,
      minimumCharge: 5.00,
      currency: "SAR",
      billingCycle: "monthly",
      isActive: true,
    });

    const [tariff2] = await db.insert(tariffs).values({
      name: "تعريفة تجارية 2024",
      code: "COM-2024",
      connectionType: "commercial",
      description: "تعريفة الاستهلاك التجاري للعام 2024",
      effectiveFrom: new Date("2024-01-01"),
      fixedCharge: 50.00,
      minimumCharge: 25.00,
      currency: "SAR",
      billingCycle: "monthly",
      isActive: true,
    });

    // 6. Customers
    console.log("👤 إضافة العملاء...");
    const [cust1] = await db.insert(customers).values({
      customerNumber: "CUST-10001",
      name: "محمد عبدالرحمن الأحمد",
      email: "mohammed.ahmed@example.com",
      phone: "+966505555555",
      nationalId: "1234567890",
      address: "حي النخيل، شارع الملك فهد، مبنى 123",
      city: "الرياض",
      district: "النخيل",
      postalCode: "12345",
      serviceAreaId: area1.insertId,
      customerType: "individual",
      status: "active",
      creditLimit: 5000.00,
      currentBalance: 0.00,
      totalDebt: 0.00,
      loyaltyPoints: 0,
    });

    const [cust2] = await db.insert(customers).values({
      customerNumber: "CUST-10002",
      name: "شركة النور التجارية",
      email: "info@alnoor.sa",
      phone: "+966506666666",
      nationalId: "7001234567",
      address: "حي الروضة، طريق المدينة، مبنى 456",
      city: "جدة",
      district: "الروضة",
      postalCode: "23456",
      serviceAreaId: area2.insertId,
      customerType: "business",
      status: "active",
      creditLimit: 20000.00,
      currentBalance: 0.00,
      totalDebt: 0.00,
      loyaltyPoints: 100,
    });

    const [cust3] = await db.insert(customers).values({
      customerNumber: "CUST-10003",
      name: "فاطمة علي السالم",
      email: "fatima.salem@example.com",
      phone: "+966507777777",
      nationalId: "2345678901",
      address: "حي النخيل، شارع الأمير سلطان، شقة 45",
      city: "الرياض",
      district: "النخيل",
      postalCode: "12346",
      serviceAreaId: area1.insertId,
      customerType: "individual",
      status: "active",
      creditLimit: 3000.00,
      currentBalance: 0.00,
      totalDebt: 0.00,
      loyaltyPoints: 50,
    });

    // 7. Customer Connections
    console.log("🔌 إضافة اتصالات العملاء...");
    const [conn1] = await db.insert(customerConnections).values({
      customerId: cust1.insertId,
      connectionNumber: "CONN-10001",
      connectionType: "residential",
      connectionDate: new Date("2023-01-15"),
      status: "active",
      loadCapacity: 15.00,
      voltage: "220V",
      phases: 1,
      propertyType: "فيلا",
      buildingArea: 350.00,
      numberOfOccupants: 5,
      hasRenewableEnergy: false,
      hasEVCharger: false,
    });

    const [conn2] = await db.insert(customerConnections).values({
      customerId: cust2.insertId,
      connectionNumber: "CONN-10002",
      connectionType: "commercial",
      connectionDate: new Date("2023-03-20"),
      status: "active",
      loadCapacity: 100.00,
      voltage: "380V",
      phases: 3,
      propertyType: "مبنى تجاري",
      buildingArea: 1200.00,
      numberOfOccupants: 50,
      hasRenewableEnergy: true,
      hasEVCharger: true,
    });

    const [conn3] = await db.insert(customerConnections).values({
      customerId: cust3.insertId,
      connectionNumber: "CONN-10003",
      connectionType: "residential",
      connectionDate: new Date("2023-06-10"),
      status: "active",
      loadCapacity: 10.00,
      voltage: "220V",
      phases: 1,
      propertyType: "شقة",
      buildingArea: 120.00,
      numberOfOccupants: 3,
      hasRenewableEnergy: false,
      hasEVCharger: false,
    });

    // 8. Meters
    console.log("⚡ إضافة العدادات...");
    const [meter1] = await db.insert(meters).values({
      meterNumber: "MTR-10001",
      connectionId: conn1.insertId,
      serialNumber: "SN-2023-001",
      installationDate: new Date("2023-01-15"),
      initialReading: 0.00,
      currentReading: 1500.00,
      status: "active",
      location: "خارج المبنى - الجدار الشمالي",
      isSmart: false,
    });

    const [meter2] = await db.insert(meters).values({
      meterNumber: "MTR-10002",
      connectionId: conn2.insertId,
      serialNumber: "SN-2023-002",
      installationDate: new Date("2023-03-20"),
      initialReading: 0.00,
      currentReading: 15000.00,
      status: "active",
      location: "غرفة الكهرباء - الطابق الأرضي",
      isSmart: true,
      lastCommunication: new Date(),
      batteryLevel: 95,
    });

    const [meter3] = await db.insert(meters).values({
      meterNumber: "MTR-10003",
      connectionId: conn3.insertId,
      serialNumber: "SN-2023-003",
      installationDate: new Date("2023-06-10"),
      initialReading: 0.00,
      currentReading: 800.00,
      status: "active",
      location: "صندوق الكهرباء - مدخل الشقة",
      isSmart: false,
    });

    // 9. Meter Readings
    console.log("📊 إضافة القراءات...");
    const [reading1] = await db.insert(meterReadings).values({
      meterId: meter1.insertId,
      readingDate: new Date("2024-10-01"),
      previousReading: 1200.00,
      currentReading: 1500.00,
      consumption: 300.00,
      readingType: "manual",
      readBy: emp2.insertId,
      isAnomalous: false,
      isVerified: true,
      verifiedBy: emp1.insertId,
      verifiedAt: new Date("2024-10-01"),
    });

    const [reading2] = await db.insert(meterReadings).values({
      meterId: meter2.insertId,
      readingDate: new Date("2024-10-01"),
      previousReading: 12000.00,
      currentReading: 15000.00,
      consumption: 3000.00,
      readingType: "automatic",
      isAnomalous: false,
      isVerified: true,
      verifiedBy: emp1.insertId,
      verifiedAt: new Date("2024-10-01"),
    });

    const [reading3] = await db.insert(meterReadings).values({
      meterId: meter3.insertId,
      readingDate: new Date("2024-10-01"),
      previousReading: 600.00,
      currentReading: 800.00,
      consumption: 200.00,
      readingType: "manual",
      readBy: emp2.insertId,
      isAnomalous: false,
      isVerified: true,
      verifiedBy: emp1.insertId,
      verifiedAt: new Date("2024-10-01"),
    });

    // 10. Bills
    console.log("📄 إضافة الفواتير...");
    const [bill1] = await db.insert(bills).values({
      billNumber: "BILL-10001",
      connectionId: conn1.insertId,
      customerId: cust1.insertId,
      meterId: meter1.insertId,
      readingId: reading1.insertId,
      tariffId: tariff1.insertId,
      billingPeriodStart: new Date("2024-09-01"),
      billingPeriodEnd: new Date("2024-09-30"),
      issueDate: new Date("2024-10-01"),
      dueDate: new Date("2024-10-15"),
      previousReading: 1200.00,
      currentReading: 1500.00,
      consumption: 300.00,
      energyCharges: 54.00,
      fixedCharges: 10.00,
      taxAmount: 9.60,
      taxPercentage: 15.00,
      otherCharges: 0.00,
      totalAmount: 73.60,
      paidAmount: 0.00,
      remainingAmount: 73.60,
      status: "pending",
    });

    const [bill2] = await db.insert(bills).values({
      billNumber: "BILL-10002",
      connectionId: conn2.insertId,
      customerId: cust2.insertId,
      meterId: meter2.insertId,
      readingId: reading2.insertId,
      tariffId: tariff2.insertId,
      billingPeriodStart: new Date("2024-09-01"),
      billingPeriodEnd: new Date("2024-09-30"),
      issueDate: new Date("2024-10-01"),
      dueDate: new Date("2024-10-15"),
      previousReading: 12000.00,
      currentReading: 15000.00,
      consumption: 3000.00,
      energyCharges: 960.00,
      fixedCharges: 50.00,
      taxAmount: 151.50,
      taxPercentage: 15.00,
      otherCharges: 0.00,
      totalAmount: 1161.50,
      paidAmount: 1161.50,
      remainingAmount: 0.00,
      status: "paid",
    });

    const [bill3] = await db.insert(bills).values({
      billNumber: "BILL-10003",
      connectionId: conn3.insertId,
      customerId: cust3.insertId,
      meterId: meter3.insertId,
      readingId: reading3.insertId,
      tariffId: tariff1.insertId,
      billingPeriodStart: new Date("2024-09-01"),
      billingPeriodEnd: new Date("2024-09-30"),
      issueDate: new Date("2024-10-01"),
      dueDate: new Date("2024-10-20"),
      previousReading: 600.00,
      currentReading: 800.00,
      consumption: 200.00,
      energyCharges: 36.00,
      fixedCharges: 10.00,
      taxAmount: 6.90,
      taxPercentage: 15.00,
      otherCharges: 0.00,
      totalAmount: 52.90,
      paidAmount: 0.00,
      remainingAmount: 52.90,
      status: "overdue",
    });

    // 11. Payments
    console.log("💵 إضافة المدفوعات...");
    const [payment1] = await db.insert(payments).values({
      paymentNumber: "PAY-10001",
      billId: bill2.insertId,
      customerId: cust2.insertId,
      amount: 1161.50,
      paymentMethodId: pm2.insertId,
      paymentDate: new Date("2024-10-05"),
      transactionId: "TXN-2024-10-05-001",
      referenceNumber: "REF-001",
      status: "completed",
      receivedBy: emp1.insertId,
    });

    const [payment2] = await db.insert(payments).values({
      paymentNumber: "PAY-10002",
      billId: bill1.insertId,
      customerId: cust1.insertId,
      amount: 50.00,
      paymentMethodId: pm1.insertId,
      paymentDate: new Date("2024-10-10"),
      transactionId: "TXN-2024-10-10-001",
      referenceNumber: "REF-002",
      status: "completed",
      receivedBy: emp1.insertId,
      notes: "دفعة جزئية",
    });

    // 12. Complaints
    console.log("📝 إضافة الشكاوى...");
    const [complaint1] = await db.insert(complaints).values({
      complaintNumber: "CMP-10001",
      customerId: cust1.insertId,
      connectionId: conn1.insertId,
      meterId: meter1.insertId,
      category: "billing",
      subject: "استفسار عن الفاتورة",
      description: "أرغب في الاستفسار عن قيمة الفاتورة الأخيرة حيث تبدو مرتفعة عن المعتاد",
      priority: "medium",
      status: "open",
      assignedTo: emp1.insertId,
    });

    const [complaint2] = await db.insert(complaints).values({
      complaintNumber: "CMP-10002",
      customerId: cust2.insertId,
      connectionId: conn2.insertId,
      category: "power_outage",
      subject: "انقطاع متكرر للتيار الكهربائي",
      description: "نعاني من انقطاع متكرر للتيار الكهربائي خلال ساعات العمل مما يؤثر على نشاطنا التجاري",
      priority: "high",
      status: "in_progress",
      assignedTo: emp2.insertId,
    });

    const [complaint3] = await db.insert(complaints).values({
      complaintNumber: "CMP-10003",
      customerId: cust3.insertId,
      connectionId: conn3.insertId,
      meterId: meter3.insertId,
      category: "meter",
      subject: "العداد لا يعمل بشكل صحيح",
      description: "العداد يظهر قراءات غير دقيقة وأحياناً يتوقف عن العمل",
      priority: "high",
      status: "open",
      assignedTo: emp2.insertId,
    });

    console.log("\n✅ تم إدراج جميع البيانات التجريبية بنجاح!\n");
    console.log("📊 ملخص البيانات:");
    console.log("   - 2 مستخدم");
    console.log("   - 2 منطقة خدمة");
    console.log("   - 2 موظف");
    console.log("   - 3 طرق دفع");
    console.log("   - 2 تعريفة");
    console.log("   - 3 عميل");
    console.log("   - 3 اتصال");
    console.log("   - 3 عداد");
    console.log("   - 3 قراءة");
    console.log("   - 3 فاتورة");
    console.log("   - 2 مدفوعة");
    console.log("   - 3 شكوى");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("\n💥 فشلت عملية إدراج البيانات:", error);
    await connection.end();
    process.exit(1);
  }
}

seed();
