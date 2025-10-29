# دليل المطور - نظام فوترة عدادات الكهرباء ⚡

## 📚 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [البنية التقنية](#البنية-التقنية)
3. [البدء السريع](#البدء-السريع)
4. [حل مشاكل الـ Cache](#حل-مشاكل-الـ-cache)
5. [أفضل الممارسات](#أفضل-الممارسات)
6. [هيكل المشروع](#هيكل-المشروع)
7. [قاعدة البيانات](#قاعدة-البيانات)
8. [الـ API](#الـ-api)
9. [الاختبار والنشر](#الاختبار-والنشر)

---

## 🎯 نظرة عامة

نظام فوترة عدادات الكهرباء هو تطبيق Full-Stack مبني بتقنيات حديثة لإدارة العملاء، العدادات، القراءات، الفواتير، والمدفوعات.

### الميزات الرئيسية
- ✅ إدارة شاملة للعملاء والعدادات
- ✅ نظام فوترة تلقائي
- ✅ نظام إشعارات مجاني (WhatsApp + SMS + Email)
- ✅ تقارير وتحليلات متقدمة
- ✅ دعم الطاقة المتجددة (Net Metering)
- ✅ مساعد AI ذكي
- ✅ تطبيقات موبايل (Android/iOS)

---

## 🏗️ البنية التقنية

### Frontend
- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite 7
- **Styling:** TailwindCSS 4
- **UI Components:** shadcn/ui + Radix UI
- **Routing:** Wouter
- **State Management:** TanStack Query (React Query)
- **API Client:** tRPC

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **API:** tRPC 11
- **Database:** MySQL
- **ORM:** Drizzle ORM
- **Authentication:** JWT + OAuth 2.0
- **Validation:** Zod

### DevOps
- **Package Manager:** pnpm
- **Version Control:** Git
- **Deployment:** Manus Platform
- **CI/CD:** Automated via Manus

---

## 🚀 البدء السريع

### المتطلبات الأساسية
- Node.js 22+
- pnpm 10+
- MySQL 8+

### التثبيت

```bash
# 1. استنساخ المشروع
git clone <repository-url>
cd electricity-billing-api

# 2. تثبيت الحزم
pnpm install

# 3. إعداد قاعدة البيانات
# أنشئ ملف .env وأضف:
DATABASE_URL="mysql://user:password@localhost:3306/electricity_billing"
JWT_SECRET="your-secret-key"

# 4. تشغيل Migrations
pnpm db:push

# 5. إدراج بيانات تجريبية (اختياري)
npx tsx scripts/seed-final.ts

# 6. تشغيل الخادم
pnpm dev
```

### الوصول للتطبيق
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3000/api

---

## 🔧 حل مشاكل الـ Cache

### 📌 المشكلة

عند تحديث الكود، قد يستمر المتصفح في عرض النسخة القديمة بسبب التخزين المؤقت (cache).

**مثال:**
```
الكود الفعلي على السيرفر ✅ (محدّث)
     ↓
الكود في ذاكرة المتصفح ❌ (قديم)
     ↓
ما يراه المستخدم ❌ (خطأ)
```

### 🛠️ الحلول

#### 1️⃣ Hard Refresh (الحل الأسرع)

| المتصفح | Windows/Linux | macOS |
|---------|---------------|-------|
| Chrome/Edge | `Ctrl + Shift + R` | `Cmd + Shift + R` |
| Firefox | `Ctrl + F5` | `Cmd + Shift + R` |
| Safari | - | `Cmd + Option + R` |

**متى تستخدمه:** بعد كل تعديل مهم في الكود

---

#### 2️⃣ تعطيل Cache في DevTools (الحل الموصى به)

```
1. افتح Developer Tools (F12)
2. اذهب إلى تبويب Network
3. فعّل خيار "Disable cache"
4. أبقِ DevTools مفتوحاً أثناء التطوير
```

**الفائدة:** يمنع المتصفح من استخدام cache تلقائياً

---

#### 3️⃣ Incognito/Private Mode

```
Ctrl + Shift + N (Chrome)
Ctrl + Shift + P (Firefox)
```

**الفائدة:** لا يحفظ أي cache، كل جلسة نظيفة

---

#### 4️⃣ مسح Cache يدوياً

**Chrome/Edge:**
```
Settings → Privacy → Clear browsing data
→ ✅ Cached images and files
→ Time range: Last hour
→ Clear data
```

**Firefox:**
```
Settings → Privacy → Clear Data
→ ✅ Cached Web Content
→ Clear
```

---

#### 5️⃣ إعادة تشغيل Dev Server (الحل الأخير)

```bash
# إيقاف الخادم
Ctrl + C

# إعادة التشغيل
pnpm dev

# أو استخدم webdev_restart_server في Manus
```

**متى تستخدمه:** عند فشل جميع الحلول السابقة

---

### 📊 مقارنة الحلول

| الحل | السرعة | الفعالية | متى تستخدمه |
|------|--------|----------|-------------|
| Hard Refresh | ⚡ سريع جداً | ⭐⭐⭐ | أول خطوة دائماً |
| Disable Cache في DevTools | ⚡ تلقائي | ⭐⭐⭐⭐⭐ | أثناء التطوير |
| Incognito Mode | ⚡ سريع | ⭐⭐⭐⭐ | للاختبار النظيف |
| مسح Cache يدوياً | 🐌 بطيء | ⭐⭐⭐⭐ | عند الضرورة |
| إعادة تشغيل Server | 🐌 بطيء | ⭐⭐⭐⭐⭐ | عند فشل كل شيء |

---

### 🎯 الإعداد المثالي للتطوير

```bash
# 1. افتح المشروع
code /home/ubuntu/electricity-billing-api

# 2. شغّل الخادم
pnpm dev

# 3. افتح المتصفح
# - افتح DevTools (F12)
# - فعّل "Disable cache" في تبويب Network
# - أبقِ DevTools مفتوحاً

# 4. عند كل تعديل:
# - احفظ الملف (Ctrl+S)
# - انتظر HMR (تلقائي عادة)
# - إذا لم يعمل: Hard Refresh (Ctrl+Shift+R)
```

---

## ✅ أفضل الممارسات

### افعل ✅

1. **دائماً** افتح DevTools وفعّل "Disable cache" أثناء التطوير
2. استخدم Hard Refresh (`Ctrl+Shift+R`) بعد كل تعديل مهم
3. اختبر في Incognito Mode قبل النشر
4. راقب Console للأخطاء باستمرار
5. استخدم TypeScript بشكل صحيح (لا `any`)
6. أضف `key` props لجميع العناصر في `map()`
7. استخدم tRPC hooks بدلاً من fetch مباشرة
8. اتبع معايير shadcn/ui للمكونات

### لا تفعل ❌

1. لا تعتمد على إعادة التحميل العادية (`F5`) فقط
2. لا تغلق DevTools أثناء التطوير
3. لا تتجاهل تحذيرات HMR في Console
4. لا تنشر بدون اختبار في متصفحات مختلفة
5. لا تستخدم `index` كـ `key` في `map()`
6. لا تكتب CSS inline إلا للضرورة
7. لا تتجاهل أخطاء TypeScript
8. لا تعدّل ملفات `node_modules`

---

## 📁 هيكل المشروع

```
electricity-billing-api/
├── client/                  # Frontend (React)
│   ├── src/
│   │   ├── components/      # مكونات UI قابلة لإعادة الاستخدام
│   │   ├── pages/           # صفحات التطبيق
│   │   │   ├── Home.tsx     # لوحة التحكم الرئيسية
│   │   │   └── Customers.tsx # إدارة العملاء
│   │   ├── lib/             # مكتبات مساعدة
│   │   │   ├── trpc.ts      # إعداد tRPC client
│   │   │   └── utils.ts     # دوال مساعدة
│   │   └── index.css        # Tailwind CSS
│   └── index.html
│
├── server/                  # Backend (Node.js)
│   ├── routers/             # tRPC routers
│   │   ├── customers.ts     # API العملاء
│   │   ├── meters.ts        # API العدادات
│   │   ├── bills.ts         # API الفواتير
│   │   ├── payments.ts      # API المدفوعات
│   │   └── complaints.ts    # API الشكاوى
│   ├── routers.ts           # تجميع جميع الـ routers
│   └── db.ts                # اتصال قاعدة البيانات
│
├── drizzle/                 # Database Schema & Migrations
│   ├── schema.ts            # تعريف الجداول (25 جدول)
│   └── migrations/          # ملفات الهجرة
│
├── scripts/                 # سكريبتات مساعدة
│   └── seed-final.ts        # إدراج بيانات تجريبية
│
├── package.json             # الحزم والاعتمادات
├── tsconfig.json            # إعدادات TypeScript
├── vite.config.ts           # إعدادات Vite
├── tailwind.config.ts       # إعدادات Tailwind
├── drizzle.config.ts        # إعدادات Drizzle ORM
├── todo.md                  # قائمة المهام
└── DEVELOPER_GUIDE.md       # هذا الملف
```

---

## 🗄️ قاعدة البيانات

### الجداول الرئيسية (25 جدول)

#### 1. إدارة العملاء
- `customers` - بيانات العملاء
- `connections` - اتصالات العملاء بالعدادات

#### 2. إدارة العدادات
- `meters` - بيانات العدادات
- `meter_readings` - قراءات العدادات
- `meter_maintenance` - سجل الصيانة

#### 3. الفوترة والمدفوعات
- `tariffs` - التعريفات والأسعار
- `tariff_slabs` - الشرائح السعرية
- `bills` - الفواتير
- `bill_items` - بنود الفواتير
- `payments` - المدفوعات
- `payment_methods` - طرق الدفع

#### 4. الشكاوى والدعم
- `complaints` - الشكاوى
- `complaint_updates` - تحديثات الشكاوى

#### 5. الموظفين والصلاحيات
- `employees` - الموظفين
- `roles` - الأدوار
- `permissions` - الصلاحيات

#### 6. الطاقة المتجددة
- `renewable_energy_systems` - أنظمة الطاقة المتجددة
- `renewable_energy_production` - إنتاج الطاقة

#### 7. أخرى
- `service_areas` - مناطق الخدمة
- `notifications` - الإشعارات
- `audit_logs` - سجل التدقيق
- `system_settings` - إعدادات النظام

### العلاقات الرئيسية

```
Customer (1) ←→ (N) Connection (N) ←→ (1) Meter
                                           ↓
                                    Meter Reading
                                           ↓
                                         Bill
                                           ↓
                                       Payment
```

### تشغيل Migrations

```bash
# إنشاء migration جديد
pnpm drizzle-kit generate

# تطبيق migrations
pnpm db:push

# عرض حالة قاعدة البيانات
pnpm drizzle-kit studio
```

---

## 🔌 الـ API

### بنية tRPC

جميع الـ APIs منظمة في routers:

```typescript
// server/routers/customers.ts
export const customersRouter = router({
  list: publicProcedure.query(async () => {
    return await db.select().from(customers);
  }),
  
  create: publicProcedure
    .input(insertCustomerSchema)
    .mutation(async ({ input }) => {
      return await db.insert(customers).values(input);
    }),
});
```

### استخدام الـ API في Frontend

```typescript
// client/src/pages/Customers.tsx
import { trpc } from "@/lib/trpc";

function Customers() {
  // قراءة البيانات
  const { data: customers } = trpc.customers.list.useQuery();
  
  // إضافة عميل
  const createMutation = trpc.customers.create.useMutation();
  
  const handleCreate = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        // تحديث تلقائي للبيانات
      }
    });
  };
}
```

### الـ Routers المتاحة

- `customers` - إدارة العملاء
- `meters` - إدارة العدادات
- `bills` - إدارة الفواتير
- `payments` - إدارة المدفوعات
- `complaints` - إدارة الشكاوى
- `readings` - إدارة القراءات (قريباً)
- `reports` - التقارير (قريباً)

---

## 🧪 الاختبار والنشر

### الاختبار المحلي

```bash
# تشغيل في وضع التطوير
pnpm dev

# بناء للإنتاج
pnpm build

# معاينة البناء
pnpm preview
```

### الاختبار في متصفحات مختلفة

✅ Chrome/Edge (مدعوم بالكامل)
✅ Firefox (مدعوم بالكامل)
✅ Safari (مدعوم بالكامل)
✅ Mobile browsers (مدعوم)

### النشر على Manus

```bash
# 1. حفظ نقطة تفتيش
webdev_save_checkpoint --description "وصف التحديث"

# 2. النشر عبر واجهة Manus
# اضغط على زر "Publish" في Management UI
```

### متغيرات البيئة للإنتاج

```env
DATABASE_URL=mysql://user:pass@host:3306/db
JWT_SECRET=your-production-secret
NODE_ENV=production
VITE_APP_TITLE=نظام فوترة عدادات الكهرباء
```

---

## 🐛 حل المشاكل الشائعة

### 1. خطأ "Cannot find module"

```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules
pnpm install
```

### 2. خطأ في قاعدة البيانات

```bash
# إعادة تطبيق schema
pnpm db:push
```

### 3. خطأ TypeScript

```bash
# التحقق من الأخطاء
pnpm tsc --noEmit

# إصلاح تلقائي (إن أمكن)
pnpm prettier --write .
```

### 4. خطأ في HMR

```bash
# إعادة تشغيل الخادم
Ctrl + C
pnpm dev
```

---

## 📞 الدعم والمساعدة

- **التوثيق:** هذا الملف + `todo.md`
- **الأخطاء:** افتح issue في GitHub
- **الأسئلة:** اسأل في قناة المطورين

---

## 📝 ملاحظات مهمة

1. **لا تنس** إضافة `key` props لجميع العناصر في `map()`
2. **دائماً** استخدم TypeScript بشكل صحيح
3. **اختبر** في Incognito Mode قبل النشر
4. **راقب** Console للأخطاء والتحذيرات
5. **استخدم** Hard Refresh عند الشك في cache
6. **حافظ** على DevTools مفتوحاً أثناء التطوير

---

## 🎉 مساهمة

نرحب بجميع المساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch جديد
3. عمل commit للتغييرات
4. فتح Pull Request

---

**آخر تحديث:** 2025-01-30
**الإصدار:** 1.0.0
**المطور:** Manus AI
