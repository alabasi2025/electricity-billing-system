import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  customers,
  customerConnections,
  meters,
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
  employees,
  serviceAreas,
  assets,
  renewableEnergy,
  evChargingStations,
  evChargingSessions,
  fraudDetectionLogs,
  consumptionPredictions,
  systemSettings,
} from "../drizzle/schema";

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  console.log("🌱 بدء إدراج البيانات التجريبية...\n");

  try {
    // 1. Service Areas (مناطق الخدمة)
    console.log("📍 إضافة مناطق الخدمة...");
    const [serviceArea1] = await db.insert(serviceAreas).values({
      areaCode: "AREA-001",
      areaName: "الرياض - حي النخيل",
      city: "الرياض",
      district: "النخيل",
      description: "منطقة سكنية راقية",
    });
    
    const [serviceArea2] = await db.insert(serviceAreas).values({
      areaCode: "AREA-002",
      areaName: "جدة - حي الروضة",
      city: "جدة",
      district: "الروضة",
      description: "منطقة تجارية وسكنية",
    });

    // 2. Employees (الموظفين)
    console.log("👥 إضافة الموظفين...");
    const [emp1] = await db.insert(employees).values({
      employeeNumber: "EMP-001",
      name: "أحمد محمد العلي",
      email: "ahmed.ali@electric.sa",
      phone: "+966501234567",
      role: "field_technician",
      department: "الصيانة الميدانية",
      hireDate: new Date("2020-01-15"),
      status: "active",
    });

    const [emp2] = await db.insert(employees).values({
      employeeNumber: "EMP-002",
      name: "فاطمة أحمد السالم",
      email: "fatima.salem@electric.sa",
      phone: "+966502345678",
      role: "customer_service",
      department: "خدمة العملاء",
      hireDate: new Date("2021-03-20"),
      status: "active",
    });

    const [emp3] = await db.insert(employees).values({
      employeeNumber: "EMP-003",
      name: "خالد عبدالله المطيري",
      email: "khaled.almutairi@electric.sa",
      phone: "+966503456789",
      role: "billing_specialist",
      department: "الفوترة والمحاسبة",
      hireDate: new Date("2019-06-10"),
      status: "active",
    });

    // 3. Payment Methods (طرق الدفع)
    console.log("💳 إضافة طرق الدفع...");
    const [pm1] = await db.insert(paymentMethods).values({
      methodName: "نقدي",
      methodType: "cash",
      isActive: true,
    });

    const [pm2] = await db.insert(paymentMethods).values({
      methodName: "بطاقة ائتمانية",
      methodType: "credit_card",
      isActive: true,
    });

    const [pm3] = await db.insert(paymentMethods).values({
      methodName: "تحويل بنكي",
      methodType: "bank_transfer",
      isActive: true,
    });

    const [pm4] = await db.insert(paymentMethods).values({
      methodName: "STC Pay",
      methodType: "mobile_wallet",
      isActive: true,
    });

    // 4. Tariffs (التعريفات)
    console.log("💰 إضافة التعريفات...");
    const [tariff1] = await db.insert(tariffs).values({
      tariffCode: "RES-2024",
      tariffName: "تعريفة سكنية 2024",
      tariffType: "residential",
      description: "تعريفة الاستهلاك السكني حسب الشرائح",
      effectiveFrom: new Date("2024-01-01"),
      isActive: true,
    });

    const [tariff2] = await db.insert(tariffs).values({
      tariffCode: "COM-2024",
      tariffName: "تعريفة تجارية 2024",
      tariffType: "commercial",
      description: "تعريفة الاستهلاك التجاري",
      effectiveFrom: new Date("2024-01-01"),
      isActive: true,
    });

    // 5. Tariff Slabs (شرائح التعريفة)
    console.log("📊 إضافة شرائح التعريفة...");
    await db.insert(tariffSlabs).values([
      {
        tariffId: tariff1.insertId,
        slabNumber: 1,
        minUnits: "0",
        maxUnits: "100",
        ratePerUnit: "0.18",
        description: "الشريحة الأولى (0-100 كيلووات)",
      },
      {
        tariffId: tariff1.insertId,
        slabNumber: 2,
        minUnits: "101",
        maxUnits: "300",
        ratePerUnit: "0.30",
        description: "الشريحة الثانية (101-300 كيلووات)",
      },
      {
        tariffId: tariff1.insertId,
        slabNumber: 3,
        minUnits: "301",
        maxUnits: "500",
        ratePerUnit: "0.45",
        description: "الشريحة الثالثة (301-500 كيلووات)",
      },
      {
        tariffId: tariff1.insertId,
        slabNumber: 4,
        minUnits: "501",
        maxUnits: null,
        ratePerUnit: "0.60",
        description: "الشريحة الرابعة (أكثر من 500 كيلووات)",
      },
    ]);

    // 6. Customers (العملاء)
    console.log("👤 إضافة العملاء...");
    const [cust1] = await db.insert(customers).values({
      customerNumber: "CUST-001",
      name: "محمد عبدالرحمن الأحمد",
      email: "mohammed.ahmad@email.com",
      phone: "+966551234567",
      alternatePhone: "+966551234568",
      nationalId: "1234567890",
      address: "شارع الملك فهد، حي النخيل",
      city: "الرياض",
      district: "النخيل",
      postalCode: "12345",
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
      postalCode: "12346",
      customerType: "residential",
      status: "active",
    });

    const [cust3] = await db.insert(customers).values({
      customerNumber: "CUST-003",
      name: "مؤسسة النور التجارية",
      email: "info@alnoor.com",
      phone: "+966553456789",
      address: "شارع التحلية، حي الروضة",
      city: "جدة",
      district: "الروضة",
      postalCode: "23456",
      customerType: "commercial",
      status: "active",
    });

    const [cust4] = await db.insert(customers).values({
      customerNumber: "CUST-004",
      name: "عبدالله سعد الدوسري",
      email: "abdullah.dosari@email.com",
      phone: "+966554567890",
      nationalId: "3456789012",
      address: "حي الملقا",
      city: "الرياض",
      district: "الملقا",
      postalCode: "12347",
      customerType: "residential",
      status: "active",
    });

    const [cust5] = await db.insert(customers).values({
      customerNumber: "CUST-005",
      name: "نورة فهد القحطاني",
      email: "noura.alqahtani@email.com",
      phone: "+966555678901",
      nationalId: "4567890123",
      address: "حي الياسمين",
      city: "الرياض",
      district: "الياسمين",
      postalCode: "12348",
      customerType: "residential",
      status: "suspended",
    });

    // 7. Customer Connections (اتصالات العملاء)
    console.log("🔌 إضافة اتصالات العملاء...");
    const [conn1] = await db.insert(customerConnections).values({
      connectionNumber: "CONN-001",
      customerId: cust1.insertId,
      serviceAreaId: serviceArea1.insertId,
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
      serviceAreaId: serviceArea1.insertId,
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
      serviceAreaId: serviceArea2.insertId,
      connectionType: "commercial",
      connectionDate: new Date("2022-06-10"),
      loadCapacity: "50",
      voltage: "380",
      phaseType: "three",
      status: "active",
    });

    const [conn4] = await db.insert(customerConnections).values({
      connectionNumber: "CONN-004",
      customerId: cust4.insertId,
      serviceAreaId: serviceArea1.insertId,
      connectionType: "residential",
      connectionDate: new Date("2023-08-05"),
      loadCapacity: "12",
      voltage: "220",
      phaseType: "single",
      status: "active",
    });

    const [conn5] = await db.insert(customerConnections).values({
      connectionNumber: "CONN-005",
      customerId: cust5.insertId,
      serviceAreaId: serviceArea1.insertId,
      connectionType: "residential",
      connectionDate: new Date("2023-02-28"),
      loadCapacity: "10",
      voltage: "220",
      phaseType: "single",
      status: "suspended",
    });

    // 8. Meters (العدادات)
    console.log("⚡ إضافة العدادات...");
    const [meter1] = await db.insert(meters).values({
      meterNumber: "MTR-001",
      connectionId: conn1.insertId,
      serialNumber: "SN-2024-001",
      meterType: "smart",
      manufacturer: "Landis+Gyr",
      model: "E650",
      installationDate: new Date("2023-01-20"),
      lastCalibrationDate: new Date("2024-01-20"),
      nextCalibrationDate: new Date("2025-01-20"),
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
      lastCalibrationDate: new Date("2024-03-25"),
      nextCalibrationDate: new Date("2025-03-25"),
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
      lastCalibrationDate: new Date("2024-06-15"),
      nextCalibrationDate: new Date("2025-06-15"),
      initialReading: "0",
      currentReading: "15000",
      status: "active",
    });

    const [meter4] = await db.insert(meters).values({
      meterNumber: "MTR-004",
      connectionId: conn4.insertId,
      serialNumber: "SN-2024-004",
      meterType: "analog",
      manufacturer: "ABB",
      model: "A1140",
      installationDate: new Date("2023-08-10"),
      initialReading: "0",
      currentReading: "850",
      status: "active",
    });

    const [meter5] = await db.insert(meters).values({
      meterNumber: "MTR-005",
      connectionId: conn5.insertId,
      serialNumber: "SN-2024-005",
      meterType: "smart",
      manufacturer: "Landis+Gyr",
      model: "E650",
      installationDate: new Date("2023-03-05"),
      lastCalibrationDate: new Date("2024-03-05"),
      nextCalibrationDate: new Date("2025-03-05"),
      initialReading: "0",
      currentReading: "1800",
      status: "inactive",
    });

    // 9. Meter Readings (قراءات العدادات)
    console.log("📊 إضافة قراءات العدادات...");
    // Meter 1 readings
    await db.insert(meterReadings).values([
      {
        meterId: meter1.insertId,
        readingDate: new Date("2024-01-01"),
        previousReading: "0",
        currentReading: "250",
        consumption: "250",
        readingType: "actual",
        readBy: emp1.insertId,
      },
      {
        meterId: meter1.insertId,
        readingDate: new Date("2024-02-01"),
        previousReading: "250",
        currentReading: "500",
        consumption: "250",
        readingType: "actual",
        readBy: emp1.insertId,
      },
      {
        meterId: meter1.insertId,
        readingDate: new Date("2024-03-01"),
        previousReading: "500",
        currentReading: "750",
        consumption: "250",
        readingType: "actual",
        readBy: emp1.insertId,
      },
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
        meterId: meter1.insertId,
        readingDate: new Date("2024-05-01"),
        previousReading: "1000",
        currentReading: "1250",
        consumption: "250",
        readingType: "actual",
        readBy: emp1.insertId,
      },
    ]);

    // Meter 2 readings
    await db.insert(meterReadings).values([
      {
        meterId: meter2.insertId,
        readingDate: new Date("2024-01-01"),
        previousReading: "0",
        currentReading: "420",
        consumption: "420",
        readingType: "actual",
        readBy: emp1.insertId,
      },
      {
        meterId: meter2.insertId,
        readingDate: new Date("2024-02-01"),
        previousReading: "420",
        currentReading: "840",
        consumption: "420",
        readingType: "actual",
        readBy: emp1.insertId,
      },
      {
        meterId: meter2.insertId,
        readingDate: new Date("2024-03-01"),
        previousReading: "840",
        currentReading: "1260",
        consumption: "420",
        readingType: "actual",
        readBy: emp1.insertId,
      },
      {
        meterId: meter2.insertId,
        readingDate: new Date("2024-04-01"),
        previousReading: "1260",
        currentReading: "1680",
        consumption: "420",
        readingType: "actual",
        readBy: emp1.insertId,
      },
      {
        meterId: meter2.insertId,
        readingDate: new Date("2024-05-01"),
        previousReading: "1680",
        currentReading: "2100",
        consumption: "420",
        readingType: "actual",
        readBy: emp1.insertId,
      },
    ]);

    // 10. Bills (الفواتير)
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
      previousReading: "1260",
      currentReading: "1680",
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

    const [bill4] = await db.insert(bills).values({
      billNumber: "BILL-2024-004",
      connectionId: conn1.insertId,
      customerId: cust1.insertId,
      meterId: meter1.insertId,
      billingPeriodStart: new Date("2024-03-01"),
      billingPeriodEnd: new Date("2024-03-31"),
      issueDate: new Date("2024-04-01"),
      dueDate: new Date("2024-03-25"),
      previousReading: "500",
      currentReading: "750",
      consumption: "250",
      totalAmount: "75.00",
      remainingAmount: "75.00",
      status: "overdue",
    });

    // 11. Bill Items (بنود الفواتير)
    console.log("📝 إضافة بنود الفواتير...");
    await db.insert(billItems).values([
      {
        billId: bill1.insertId,
        itemType: "energy_charge",
        description: "رسوم الطاقة (250 كيلووات)",
        quantity: "250",
        unitPrice: "0.30",
        amount: "75.00",
      },
      {
        billId: bill2.insertId,
        itemType: "energy_charge",
        description: "رسوم الطاقة (420 كيلووات)",
        quantity: "420",
        unitPrice: "0.34",
        amount: "142.80",
      },
      {
        billId: bill2.insertId,
        itemType: "service_charge",
        description: "رسوم الخدمة الشهرية",
        quantity: "1",
        unitPrice: "1.20",
        amount: "1.20",
      },
    ]);

    // 12. Payments (المدفوعات)
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

    // 13. Complaints (الشكاوى)
    console.log("📢 إضافة الشكاوى...");
    await db.insert(complaints).values([
      {
        complaintNumber: "COMP-2024-001",
        customerId: cust2.insertId,
        connectionId: conn2.insertId,
        complaintType: "billing_issue",
        subject: "فاتورة مرتفعة بشكل غير طبيعي",
        description: "الفاتورة الشهرية أعلى من المعتاد بكثير رغم عدم تغيير نمط الاستهلاك",
        priority: "medium",
        status: "open",
        reportedDate: new Date("2024-05-10"),
      },
      {
        complaintNumber: "COMP-2024-002",
        customerId: cust4.insertId,
        connectionId: conn4.insertId,
        complaintType: "power_outage",
        subject: "انقطاع متكرر للكهرباء",
        description: "انقطاع الكهرباء 3 مرات خلال الأسبوع الماضي",
        priority: "high",
        status: "in_progress",
        reportedDate: new Date("2024-05-08"),
        assignedTo: emp1.insertId,
      },
      {
        complaintNumber: "COMP-2024-003",
        customerId: cust3.insertId,
        connectionId: conn3.insertId,
        complaintType: "meter_malfunction",
        subject: "العداد لا يعمل بشكل صحيح",
        description: "العداد يظهر قراءات غير دقيقة",
        priority: "high",
        status: "resolved",
        reportedDate: new Date("2024-04-25"),
        assignedTo: emp1.insertId,
        resolvedDate: new Date("2024-05-02"),
        resolution: "تم استبدال العداد بعداد جديد",
      },
    ]);

    // 14. Work Orders (أوامر العمل)
    console.log("🔧 إضافة أوامر العمل...");
    await db.insert(workOrders).values([
      {
        workOrderNumber: "WO-2024-001",
        type: "installation",
        description: "تركيب عداد جديد",
        customerId: cust1.insertId,
        connectionId: conn1.insertId,
        meterId: meter1.insertId,
        priority: "medium",
        status: "completed",
        scheduledDate: new Date("2023-01-18"),
        assignedTo: emp1.insertId,
        completedDate: new Date("2023-01-20"),
      },
      {
        workOrderNumber: "WO-2024-002",
        type: "repair",
        description: "إصلاح عطل في خط الكهرباء",
        customerId: cust4.insertId,
        connectionId: conn4.insertId,
        priority: "high",
        status: "in_progress",
        scheduledDate: new Date("2024-05-11"),
        assignedTo: emp1.insertId,
      },
      {
        workOrderNumber: "WO-2024-003",
        type: "reading",
        description: "قراءة دورية للعدادات",
        priority: "low",
        status: "pending",
        scheduledDate: new Date("2024-06-01"),
      },
    ]);

    // 15. Notifications (الإشعارات)
    console.log("🔔 إضافة الإشعارات...");
    await db.insert(notifications).values([
      {
        customerId: cust1.insertId,
        notificationType: "bill_generated",
        title: "فاتورة جديدة",
        message: "تم إصدار فاتورة جديدة بمبلغ 75.00 ريال",
        channel: "email",
        status: "sent",
        sentAt: new Date("2024-05-01"),
      },
      {
        customerId: cust2.insertId,
        notificationType: "bill_reminder",
        title: "تذكير بموعد الدفع",
        message: "موعد دفع الفاتورة خلال 3 أيام",
        channel: "sms",
        status: "sent",
        sentAt: new Date("2024-05-12"),
      },
      {
        customerId: cust4.insertId,
        notificationType: "complaint_update",
        title: "تحديث الشكوى",
        message: "تم تعيين فني لمعالجة شكواك",
        channel: "push",
        status: "sent",
        sentAt: new Date("2024-05-09"),
      },
    ]);

    // 16. Assets (الأصول)
    console.log("🏗️ إضافة الأصول...");
    await db.insert(assets).values([
      {
        assetNumber: "ASSET-001",
        assetType: "transformer",
        assetName: "محول كهربائي 100 كيلو فولت",
        location: "محطة النخيل الفرعية",
        serviceAreaId: serviceArea1.insertId,
        manufacturer: "ABB",
        model: "DTR-100",
        serialNumber: "ABB-2023-001",
        installationDate: new Date("2020-05-15"),
        capacity: "100",
        status: "operational",
      },
      {
        assetNumber: "ASSET-002",
        assetType: "cable",
        assetName: "كابل أرضي 11 كيلو فولت",
        location: "حي النخيل - الشارع الرئيسي",
        serviceAreaId: serviceArea1.insertId,
        manufacturer: "Nexans",
        installationDate: new Date("2021-03-10"),
        length: "500",
        status: "operational",
      },
    ]);

    // 17. Renewable Energy (الطاقة المتجددة)
    console.log("☀️ إضافة أنظمة الطاقة المتجددة...");
    await db.insert(renewableEnergy).values([
      {
        systemNumber: "SOLAR-001",
        customerId: cust3.insertId,
        connectionId: conn3.insertId,
        systemType: "solar",
        capacity: "50",
        installationDate: new Date("2023-08-15"),
        manufacturer: "SunPower",
        model: "X-Series",
        status: "active",
        netMeteringEnabled: true,
      },
    ]);

    // 18. EV Charging Stations (محطات شحن السيارات)
    console.log("🚗 إضافة محطات شحن السيارات الكهربائية...");
    const [evStation1] = await db.insert(evChargingStations).values({
      stationNumber: "EV-STATION-001",
      stationName: "محطة شحن النخيل",
      location: "حي النخيل - بجوار المسجد الكبير",
      serviceAreaId: serviceArea1.insertId,
      numberOfChargers: 4,
      chargerType: "fast",
      powerOutput: "150",
      status: "operational",
      operatingHours: "24/7",
    });

    // 19. EV Charging Sessions (جلسات الشحن)
    console.log("🔌 إضافة جلسات شحن السيارات...");
    await db.insert(evChargingSessions).values([
      {
        sessionNumber: "EV-SESSION-001",
        stationId: evStation1.insertId,
        customerId: cust1.insertId,
        startTime: new Date("2024-05-10 08:00:00"),
        endTime: new Date("2024-05-10 09:30:00"),
        energyConsumed: "45.5",
        cost: "68.25",
        paymentStatus: "paid",
      },
    ]);

    // 20. Fraud Detection Logs (سجلات كشف الاحتيال)
    console.log("🚨 إضافة سجلات كشف الاحتيال...");
    await db.insert(fraudDetectionLogs).values([
      {
        detectionDate: new Date("2024-05-05"),
        customerId: cust5.insertId,
        connectionId: conn5.insertId,
        meterId: meter5.insertId,
        fraudType: "meter_tampering",
        description: "اكتشاف محاولة العبث بالعداد",
        severity: "high",
        status: "under_investigation",
        detectedBy: "AI_SYSTEM",
      },
    ]);

    // 21. Consumption Predictions (توقعات الاستهلاك)
    console.log("📈 إضافة توقعات الاستهلاك...");
    await db.insert(consumptionPredictions).values([
      {
        customerId: cust1.insertId,
        connectionId: conn1.insertId,
        predictionDate: new Date("2024-06-01"),
        predictedConsumption: "280",
        confidenceLevel: "85.5",
        predictionModel: "LSTM_v2",
      },
      {
        customerId: cust2.insertId,
        connectionId: conn2.insertId,
        predictionDate: new Date("2024-06-01"),
        predictedConsumption: "450",
        confidenceLevel: "82.3",
        predictionModel: "LSTM_v2",
      },
    ]);

    // 22. System Settings (إعدادات النظام)
    console.log("⚙️ إضافة إعدادات النظام...");
    await db.insert(systemSettings).values([
      {
        settingKey: "company_name",
        settingValue: "الشركة السعودية للكهرباء",
        description: "اسم الشركة",
      },
      {
        settingKey: "currency",
        settingValue: "SAR",
        description: "العملة المستخدمة",
      },
      {
        settingKey: "vat_rate",
        settingValue: "15",
        description: "نسبة ضريبة القيمة المضافة",
      },
      {
        settingKey: "late_payment_fee",
        settingValue: "50",
        description: "غرامة التأخير في الدفع",
      },
      {
        settingKey: "billing_cycle",
        settingValue: "monthly",
        description: "دورة الفوترة",
      },
    ]);

    console.log("\n✅ تم إدراج جميع البيانات التجريبية بنجاح!");
    console.log("\n📊 ملخص البيانات المضافة:");
    console.log("   - 2 منطقة خدمة");
    console.log("   - 3 موظفين");
    console.log("   - 4 طرق دفع");
    console.log("   - 2 تعريفة مع 4 شرائح");
    console.log("   - 5 عملاء");
    console.log("   - 5 اتصالات");
    console.log("   - 5 عدادات");
    console.log("   - 10 قراءات");
    console.log("   - 4 فواتير مع بنودها");
    console.log("   - 1 دفعة");
    console.log("   - 3 شكاوى");
    console.log("   - 3 أوامر عمل");
    console.log("   - 3 إشعارات");
    console.log("   - 2 أصول");
    console.log("   - 1 نظام طاقة متجددة");
    console.log("   - 1 محطة شحن سيارات");
    console.log("   - 1 جلسة شحن");
    console.log("   - 1 سجل احتيال");
    console.log("   - 2 توقع استهلاك");
    console.log("   - 5 إعدادات نظام");

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
