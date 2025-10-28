CREATE TABLE `activityLogs` (
	`logId` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userType` enum('موظف','عميل'),
	`action` varchar(100) NOT NULL,
	`tableName` varchar(50),
	`recordId` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_logId` PRIMARY KEY(`logId`)
);
--> statement-breakpoint
CREATE TABLE `complaints` (
	`complaintId` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`meterId` int,
	`complaintType` enum('عطل','قراءة خاطئة','فاتورة','أخرى') NOT NULL,
	`subject` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`priority` enum('عالية','متوسطة','منخفضة') NOT NULL DEFAULT 'متوسطة',
	`status` enum('جديدة','قيد المعالجة','محلولة','مغلقة') NOT NULL DEFAULT 'جديدة',
	`assignedTo` int,
	`resolution` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` datetime,
	CONSTRAINT `complaints_complaintId` PRIMARY KEY(`complaintId`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`customerId` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(100) NOT NULL,
	`nationalId` varchar(20),
	`phone` varchar(20) NOT NULL,
	`email` varchar(100),
	`address` text,
	`city` varchar(50),
	`district` varchar(50),
	`registrationDate` date NOT NULL,
	`status` enum('نشط','متوقف','معلق') NOT NULL DEFAULT 'نشط',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_customerId` PRIMARY KEY(`customerId`),
	CONSTRAINT `customers_nationalId_unique` UNIQUE(`nationalId`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`employeeId` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`fullName` varchar(100) NOT NULL,
	`email` varchar(100),
	`phone` varchar(20),
	`role` enum('مدير','محاسب','قارئ','دعم') NOT NULL DEFAULT 'قارئ',
	`department` varchar(50),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastLogin` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_employeeId` PRIMARY KEY(`employeeId`),
	CONSTRAINT `employees_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`invoiceId` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`customerId` int NOT NULL,
	`meterId` int NOT NULL,
	`readingId` int,
	`billingPeriodStart` date NOT NULL,
	`billingPeriodEnd` date NOT NULL,
	`consumption` decimal(10,2) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`taxAmount` decimal(10,2) NOT NULL DEFAULT '0',
	`serviceFees` decimal(10,2) NOT NULL DEFAULT '0',
	`totalAmount` decimal(10,2) NOT NULL,
	`dueDate` date NOT NULL,
	`status` enum('معلقة','مدفوعة','متأخرة','ملغاة') NOT NULL DEFAULT 'معلقة',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_invoiceId` PRIMARY KEY(`invoiceId`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `meters` (
	`meterId` int AUTO_INCREMENT NOT NULL,
	`meterNumber` varchar(50) NOT NULL,
	`customerId` int NOT NULL,
	`meterType` enum('منزلي','تجاري','صناعي') NOT NULL DEFAULT 'منزلي',
	`capacity` decimal(10,2),
	`installationDate` date,
	`location` text,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`status` enum('نشط','معطل','صيانة') NOT NULL DEFAULT 'نشط',
	`lastReadingDate` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meters_meterId` PRIMARY KEY(`meterId`),
	CONSTRAINT `meters_meterNumber_unique` UNIQUE(`meterNumber`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`notificationId` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`notificationType` enum('فاتورة','تذكير','تنبيه') NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`sentDate` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_notificationId` PRIMARY KEY(`notificationId`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`paymentId` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`customerId` int NOT NULL,
	`paymentDate` datetime NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('نقدي','بطاقة','تحويل','محفظة') NOT NULL,
	`transactionReference` varchar(100),
	`paymentStatus` enum('مكتمل','معلق','فاشل','مرتجع') NOT NULL DEFAULT 'مكتمل',
	`receivedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_paymentId` PRIMARY KEY(`paymentId`)
);
--> statement-breakpoint
CREATE TABLE `readings` (
	`readingId` int AUTO_INCREMENT NOT NULL,
	`meterId` int NOT NULL,
	`readingDate` datetime NOT NULL,
	`previousReading` decimal(10,2) NOT NULL,
	`currentReading` decimal(10,2) NOT NULL,
	`consumption` decimal(10,2) NOT NULL,
	`readerId` int,
	`readingMethod` enum('يدوي','آلي') NOT NULL DEFAULT 'يدوي',
	`notes` text,
	`imagePath` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `readings_readingId` PRIMARY KEY(`readingId`)
);
--> statement-breakpoint
CREATE TABLE `tariffs` (
	`tariffId` int AUTO_INCREMENT NOT NULL,
	`tariffName` varchar(100) NOT NULL,
	`meterType` enum('منزلي','تجاري','صناعي') NOT NULL,
	`consumptionFrom` decimal(10,2) NOT NULL,
	`consumptionTo` decimal(10,2) NOT NULL,
	`pricePerUnit` decimal(10,4) NOT NULL,
	`effectiveDate` date NOT NULL,
	`expiryDate` date,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tariffs_tariffId` PRIMARY KEY(`tariffId`)
);
