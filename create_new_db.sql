-- قاعدة بيانات نظام فوترة الكهرباء المحدثة
-- بناءً على EB-Billing-System العالمي

DROP DATABASE IF EXISTS electricity_billing_v2;
CREATE DATABASE electricity_billing_v2;
USE electricity_billing_v2;

-- جدول المستخدمين
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(8) NOT NULL UNIQUE,
  first_name VARCHAR(45),
  last_name VARCHAR(45),
  aadhar_id VARCHAR(12),
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(10) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- جدول الاتصالات المنزلية
CREATE TABLE household_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  connection_id INT NOT NULL UNIQUE,
  user_id VARCHAR(8) NOT NULL,
  connection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  address VARCHAR(255) NOT NULL,
  load_required VARCHAR(45) NOT NULL,
  phase VARCHAR(45) NOT NULL,
  applicant_photo LONGTEXT,
  property_tax_report LONGTEXT,
  applicant_reference_number VARCHAR(50) NOT NULL UNIQUE,
  payment_status ENUM('paid', 'not_paid') DEFAULT 'not_paid' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- جدول الاتصالات التجارية
CREATE TABLE commercial_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  connection_id INT NOT NULL UNIQUE,
  user_id VARCHAR(8) NOT NULL,
  connection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  business_name VARCHAR(100) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  sq_meter DECIMAL(10, 2) NOT NULL,
  load_required VARCHAR(45) NOT NULL,
  phase VARCHAR(45) NOT NULL,
  applicant_photo LONGTEXT,
  property_tax_report LONGTEXT,
  ownership_proof LONGTEXT,
  applicant_reference_number VARCHAR(50) NOT NULL UNIQUE,
  payment_status ENUM('paid', 'not_paid') DEFAULT 'not_paid' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- جدول قراءات العدادات
CREATE TABLE meter_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reading_id INT NOT NULL UNIQUE,
  user_id VARCHAR(8) NOT NULL,
  connection_type ENUM('household', 'commercial') NOT NULL,
  reading_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  units_consumed INT NOT NULL,
  payment_status ENUM('paid', 'not_paid') DEFAULT 'not_paid' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- جدول الفواتير
CREATE TABLE bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_id INT NOT NULL UNIQUE,
  reading_id INT NOT NULL,
  bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(10, 2) NOT NULL,
  due_date TIMESTAMP NOT NULL,
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (reading_id) REFERENCES meter_readings(reading_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- جدول المدفوعات
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL UNIQUE,
  bill_id INT NOT NULL,
  receipt_no VARCHAR(50) NOT NULL,
  amount_debited DECIMAL(10, 2) NOT NULL,
  transaction_no VARCHAR(50) NOT NULL,
  receipt_date TIMESTAMP NOT NULL,
  bank_name VARCHAR(50),
  card_type VARCHAR(50),
  service_no VARCHAR(50),
  payment_method ENUM('cash', 'card', 'upi', 'net_banking') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- جدول الإشعارات
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(8) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('bill', 'payment', 'connection', 'general') NOT NULL,
  is_read INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- جدول الشكاوى
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id VARCHAR(50) NOT NULL UNIQUE,
  user_id VARCHAR(8) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('billing', 'connection', 'meter', 'power_outage', 'other') NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open' NOT NULL,
  assigned_to INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- جدول سجل النشاطات
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(8),
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id INT,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trigger لحساب الفواتير تلقائيًا للاتصالات المنزلية
DELIMITER //
CREATE TRIGGER after_meter_reading_insert_household
AFTER INSERT ON meter_readings
FOR EACH ROW
BEGIN
  DECLARE unit_price DECIMAL(10, 2);
  DECLARE total_amount DECIMAL(10, 2);
  DECLARE new_bill_id INT;
  
  IF NEW.connection_type = 'household' THEN
    -- حساب السعر حسب الشرائح
    IF NEW.units_consumed <= 50 THEN
      SET total_amount = 0;
    ELSEIF NEW.units_consumed <= 100 THEN
      SET total_amount = (NEW.units_consumed - 50) * 2;
    ELSEIF NEW.units_consumed <= 300 THEN
      SET total_amount = 50 * 2 + (NEW.units_consumed - 100) * 4;
    ELSE
      SET total_amount = 50 * 2 + 200 * 4 + (NEW.units_consumed - 300) * 6;
    END IF;
    
    -- إنشاء رقم فاتورة جديد
    SELECT COALESCE(MAX(bill_id), 0) + 1 INTO new_bill_id FROM bills;
    
    -- إدراج الفاتورة
    INSERT INTO bills (bill_id, reading_id, amount, due_date, status)
    VALUES (new_bill_id, NEW.reading_id, total_amount, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'pending');
  END IF;
END//
DELIMITER ;

-- Trigger لحساب الفواتير تلقائيًا للاتصالات التجارية
DELIMITER //
CREATE TRIGGER after_meter_reading_insert_commercial
AFTER INSERT ON meter_readings
FOR EACH ROW
BEGIN
  DECLARE unit_price DECIMAL(10, 2);
  DECLARE total_amount DECIMAL(10, 2);
  DECLARE new_bill_id INT;
  
  IF NEW.connection_type = 'commercial' THEN
    -- حساب السعر حسب الشرائح
    IF NEW.units_consumed <= 20 THEN
      SET total_amount = 0;
    ELSEIF NEW.units_consumed <= 100 THEN
      SET total_amount = (NEW.units_consumed - 20) * 4;
    ELSEIF NEW.units_consumed <= 200 THEN
      SET total_amount = 80 * 4 + (NEW.units_consumed - 100) * 6;
    ELSE
      SET total_amount = 80 * 4 + 100 * 6 + (NEW.units_consumed - 200) * 8;
    END IF;
    
    -- إنشاء رقم فاتورة جديد
    SELECT COALESCE(MAX(bill_id), 0) + 1 INTO new_bill_id FROM bills;
    
    -- إدراج الفاتورة
    INSERT INTO bills (bill_id, reading_id, amount, due_date, status)
    VALUES (new_bill_id, NEW.reading_id, total_amount, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'pending');
  END IF;
END//
DELIMITER ;
