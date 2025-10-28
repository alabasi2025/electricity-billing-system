import { drizzle } from "drizzle-orm/mysql2";
import { customers, employees, meters, readings, tariffs, invoices, payments, notifications, complaints } from "../drizzle/schema";
import * as bcrypt from "bcrypt";

const db = drizzle(process.env.DATABASE_URL!);

async function seedData() {
  console.log("🌱 بدء إدراج البيانات التجريبية...\n");

  try {
    // 1. إدراج الموظفين
    console.log("📝 إدراج الموظفين...");
    const passwordHash = await bcrypt.hash("password123", 10);
    
    await db.insert(employees).values([
      {
        username: "admin",
        passwordHash,
        fullName: "أحمد محمد السعيد",
        email: "admin@electricity.com",
        phone: "0501234567",
        role: "مدير",
        department: "الإدارة",
        isActive: true,
      },
      {
        username: "reader1",
        passwordHash,
        fullName: "محمد علي الأحمد",
        email: "reader1@electricity.com",
        phone: "0501234568",
        role: "قارئ",
        department: "القراءات",
        isActive: true,
      },
      {
        username: "accountant1",
        passwordHash,
        fullName: "فاطمة أحمد العلي",
        email: "accountant@electricity.com",
        phone: "0501234569",
        role: "محاسب",
        department: "المحاسبة",
        isActive: true,
      },
    ]);
    console.log("✅ تم إدراج 3 موظفين\n");

    // 2. إدراج العملاء
    console.log("📝 إدراج العملاء...");
    await db.insert(customers).values([
      {
        fullName: "خالد عبدالله المطيري",
        nationalId: "1234567890",
        phone: "0551234567",
        email: "khaled@email.com",
        address: "شارع الملك فهد، حي النزهة، مبنى 123",
        city: "الرياض",
        district: "النزهة",
        registrationDate: new Date("2024-01-15"),
        status: "نشط",
      },
      {
        fullName: "سارة محمد القحطاني",
        nationalId: "1234567891",
        phone: "0551234568",
        email: "sara@email.com",
        address: "طريق الأمير سلطان، حي العليا، برج 45",
        city: "الرياض",
        district: "العليا",
        registrationDate: new Date("2024-01-20"),
        status: "نشط",
      },
      {
        fullName: "عبدالرحمن سعيد الغامدي",
        nationalId: "1234567892",
        phone: "0551234569",
        email: "abdulrahman@email.com",
        address: "شارع التحلية، حي الملز، فيلا 78",
        city: "الرياض",
        district: "الملز",
        registrationDate: new Date("2024-02-01"),
        status: "نشط",
      },
      {
        fullName: "نورة أحمد الشهري",
        nationalId: "1234567893",
        phone: "0551234570",
        email: "noura@email.com",
        address: "طريق الملك عبدالعزيز، حي الربوة، شقة 201",
        city: "الرياض",
        district: "الربوة",
        registrationDate: new Date("2024-02-10"),
        status: "نشط",
      },
      {
        fullName: "محمد خالد العتيبي",
        nationalId: "1234567894",
        phone: "0551234571",
        email: "mohammed@email.com",
        address: "شارع العروبة، حي المروج، منزل 156",
        city: "الرياض",
        district: "المروج",
        registrationDate: new Date("2024-02-15"),
        status: "نشط",
      },
    ]);
    console.log("✅ تم إدراج 5 عملاء\n");

    // 3. إدراج العدادات
    console.log("📝 إدراج العدادات...");
    await db.insert(meters).values([
      {
        meterNumber: "MTR-2024-0001",
        customerId: 1,
        meterType: "منزلي",
        capacity: "60.00",
        installationDate: new Date("2024-01-15"),
        location: "خارج المنزل - الجدار الأمامي",
        status: "نشط",
      },
      {
        meterNumber: "MTR-2024-0002",
        customerId: 2,
        meterType: "تجاري",
        capacity: "100.00",
        installationDate: new Date("2024-01-20"),
        location: "مدخل المحل التجاري",
        status: "نشط",
      },
      {
        meterNumber: "MTR-2024-0003",
        customerId: 3,
        meterType: "منزلي",
        capacity: "60.00",
        installationDate: new Date("2024-02-01"),
        location: "خارج المنزل - الجدار الجانبي",
        status: "نشط",
      },
      {
        meterNumber: "MTR-2024-0004",
        customerId: 4,
        meterType: "منزلي",
        capacity: "80.00",
        installationDate: new Date("2024-02-10"),
        location: "خارج الفيلا - البوابة الرئيسية",
        status: "نشط",
      },
      {
        meterNumber: "MTR-2024-0005",
        customerId: 5,
        meterType: "صناعي",
        capacity: "200.00",
        installationDate: new Date("2024-02-15"),
        location: "مدخل المصنع - غرفة الكهرباء",
        status: "نشط",
      },
    ]);
    console.log("✅ تم إدراج 5 عدادات\n");

    // 4. إدراج التعريفات
    console.log("📝 إدراج التعريفات...");
    await db.insert(tariffs).values([
      {
        tariffName: "منزلي - شريحة أولى",
        meterType: "منزلي",
        consumptionFrom: "0",
        consumptionTo: "2000",
        pricePerUnit: "0.18",
        effectiveDate: new Date("2024-01-01"),
        isActive: true,
      },
      {
        tariffName: "منزلي - شريحة ثانية",
        meterType: "منزلي",
        consumptionFrom: "2001",
        consumptionTo: "4000",
        pricePerUnit: "0.30",
        effectiveDate: new Date("2024-01-01"),
        isActive: true,
      },
      {
        tariffName: "منزلي - شريحة ثالثة",
        meterType: "منزلي",
        consumptionFrom: "4001",
        consumptionTo: "999999",
        pricePerUnit: "0.48",
        effectiveDate: new Date("2024-01-01"),
        isActive: true,
      },
      {
        tariffName: "تجاري - شريحة أولى",
        meterType: "تجاري",
        consumptionFrom: "0",
        consumptionTo: "4000",
        pricePerUnit: "0.32",
        effectiveDate: new Date("2024-01-01"),
        isActive: true,
      },
      {
        tariffName: "تجاري - شريحة ثانية",
        meterType: "تجاري",
        consumptionFrom: "4001",
        consumptionTo: "999999",
        pricePerUnit: "0.44",
        effectiveDate: new Date("2024-01-01"),
        isActive: true,
      },
      {
        tariffName: "صناعي - موحد",
        meterType: "صناعي",
        consumptionFrom: "0",
        consumptionTo: "999999",
        pricePerUnit: "0.38",
        effectiveDate: new Date("2024-01-01"),
        isActive: true,
      },
    ]);
    console.log("✅ تم إدراج 6 تعريفات\n");

    // 5. إدراج القراءات
    console.log("📝 إدراج القراءات...");
    await db.insert(readings).values([
      {
        meterId: 1,
        readingDate: new Date("2024-09-01 10:00:00"),
        previousReading: "10000",
        currentReading: "10850",
        consumption: "850",
        readerId: 2,
        readingMethod: "يدوي",
      },
      {
        meterId: 2,
        readingDate: new Date("2024-09-01 11:00:00"),
        previousReading: "25000",
        currentReading: "28500",
        consumption: "3500",
        readerId: 2,
        readingMethod: "يدوي",
      },
      {
        meterId: 3,
        readingDate: new Date("2024-09-01 12:00:00"),
        previousReading: "8000",
        currentReading: "8650",
        consumption: "650",
        readerId: 2,
        readingMethod: "يدوي",
      },
      {
        meterId: 4,
        readingDate: new Date("2024-09-01 13:00:00"),
        previousReading: "15000",
        currentReading: "16200",
        consumption: "1200",
        readerId: 2,
        readingMethod: "يدوي",
      },
      {
        meterId: 5,
        readingDate: new Date("2024-09-01 14:00:00"),
        previousReading: "50000",
        currentReading: "58000",
        consumption: "8000",
        readerId: 2,
        readingMethod: "يدوي",
      },
    ]);
    console.log("✅ تم إدراج 5 قراءات\n");

    // 6. إدراج الفواتير
    console.log("📝 إدراج الفواتير...");
    await db.insert(invoices).values([
      {
        invoiceNumber: "INV-2024-09-0001",
        customerId: 1,
        meterId: 1,
        readingId: 1,
        billingPeriodStart: new Date("2024-08-01"),
        billingPeriodEnd: new Date("2024-08-31"),
        consumption: "850",
        unitPrice: "0.18",
        subtotal: "153.00",
        taxAmount: "22.95",
        serviceFees: "10.00",
        totalAmount: "185.95",
        dueDate: new Date("2024-09-15"),
        status: "معلقة",
      },
      {
        invoiceNumber: "INV-2024-09-0002",
        customerId: 2,
        meterId: 2,
        readingId: 2,
        billingPeriodStart: new Date("2024-08-01"),
        billingPeriodEnd: new Date("2024-08-31"),
        consumption: "3500",
        unitPrice: "0.32",
        subtotal: "1120.00",
        taxAmount: "168.00",
        serviceFees: "15.00",
        totalAmount: "1303.00",
        dueDate: new Date("2024-09-15"),
        status: "معلقة",
      },
      {
        invoiceNumber: "INV-2024-09-0003",
        customerId: 3,
        meterId: 3,
        readingId: 3,
        billingPeriodStart: new Date("2024-08-01"),
        billingPeriodEnd: new Date("2024-08-31"),
        consumption: "650",
        unitPrice: "0.18",
        subtotal: "117.00",
        taxAmount: "17.55",
        serviceFees: "10.00",
        totalAmount: "144.55",
        dueDate: new Date("2024-09-15"),
        status: "مدفوعة",
      },
      {
        invoiceNumber: "INV-2024-09-0004",
        customerId: 4,
        meterId: 4,
        readingId: 4,
        billingPeriodStart: new Date("2024-08-01"),
        billingPeriodEnd: new Date("2024-08-31"),
        consumption: "1200",
        unitPrice: "0.18",
        subtotal: "216.00",
        taxAmount: "32.40",
        serviceFees: "10.00",
        totalAmount: "258.40",
        dueDate: new Date("2024-09-15"),
        status: "معلقة",
      },
      {
        invoiceNumber: "INV-2024-09-0005",
        customerId: 5,
        meterId: 5,
        readingId: 5,
        billingPeriodStart: new Date("2024-08-01"),
        billingPeriodEnd: new Date("2024-08-31"),
        consumption: "8000",
        unitPrice: "0.38",
        subtotal: "3040.00",
        taxAmount: "456.00",
        serviceFees: "20.00",
        totalAmount: "3516.00",
        dueDate: new Date("2024-09-15"),
        status: "مدفوعة",
      },
    ]);
    console.log("✅ تم إدراج 5 فواتير\n");

    // 7. إدراج المدفوعات
    console.log("📝 إدراج المدفوعات...");
    await db.insert(payments).values([
      {
        invoiceId: 3,
        customerId: 3,
        paymentDate: new Date("2024-09-10 14:30:00"),
        amount: "144.55",
        paymentMethod: "بطاقة",
        transactionReference: "TXN-20240910-001",
        paymentStatus: "مكتمل",
        receivedBy: 3,
      },
      {
        invoiceId: 5,
        customerId: 5,
        paymentDate: new Date("2024-09-12 10:15:00"),
        amount: "3516.00",
        paymentMethod: "تحويل",
        transactionReference: "TXN-20240912-002",
        paymentStatus: "مكتمل",
        receivedBy: 3,
      },
    ]);
    console.log("✅ تم إدراج 2 مدفوعات\n");

    // 8. إدراج الإشعارات
    console.log("📝 إدراج الإشعارات...");
    await db.insert(notifications).values([
      {
        customerId: 1,
        notificationType: "فاتورة",
        title: "فاتورة جديدة متاحة",
        message: "تم إصدار فاتورة شهر أغسطس بمبلغ 185.95 ريال. تاريخ الاستحقاق: 15 سبتمبر 2024",
        sentDate: new Date("2024-09-01 15:00:00"),
        isRead: false,
      },
      {
        customerId: 2,
        notificationType: "فاتورة",
        title: "فاتورة جديدة متاحة",
        message: "تم إصدار فاتورة شهر أغسطس بمبلغ 1303.00 ريال. تاريخ الاستحقاق: 15 سبتمبر 2024",
        sentDate: new Date("2024-09-01 15:05:00"),
        isRead: false,
      },
      {
        customerId: 4,
        notificationType: "تذكير",
        title: "تذكير بموعد الدفع",
        message: "يرجى تسديد فاتورة شهر أغسطس قبل تاريخ الاستحقاق 15 سبتمبر 2024",
        sentDate: new Date("2024-09-10 09:00:00"),
        isRead: false,
      },
    ]);
    console.log("✅ تم إدراج 3 إشعارات\n");

    // 9. إدراج الشكاوى
    console.log("📝 إدراج الشكاوى...");
    await db.insert(complaints).values([
      {
        customerId: 1,
        meterId: 1,
        complaintType: "قراءة خاطئة",
        subject: "قراءة العداد غير صحيحة",
        description: "أعتقد أن القراءة الأخيرة للعداد غير صحيحة، الاستهلاك أعلى من المعتاد بكثير",
        priority: "عالية",
        status: "قيد المعالجة",
        assignedTo: 2,
      },
      {
        customerId: 2,
        meterId: 2,
        complaintType: "فاتورة",
        subject: "استفسار عن الفاتورة",
        description: "أريد توضيح حول كيفية حساب الفاتورة الأخيرة والشرائح المطبقة",
        priority: "متوسطة",
        status: "جديدة",
      },
    ]);
    console.log("✅ تم إدراج 2 شكاوى\n");

    console.log("🎉 تم إدراج جميع البيانات التجريبية بنجاح!");
    console.log("\n📊 ملخص البيانات:");
    console.log("   - 3 موظفين");
    console.log("   - 5 عملاء");
    console.log("   - 5 عدادات");
    console.log("   - 6 تعريفات");
    console.log("   - 5 قراءات");
    console.log("   - 5 فواتير");
    console.log("   - 2 مدفوعات");
    console.log("   - 3 إشعارات");
    console.log("   - 2 شكاوى");
    
  } catch (error) {
    console.error("❌ خطأ في إدراج البيانات:", error);
    throw error;
  }
}

// تشغيل السكريبت
seedData()
  .then(() => {
    console.log("\n✅ تم الانتهاء بنجاح!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ فشل في إدراج البيانات:", error);
    process.exit(1);
  });
