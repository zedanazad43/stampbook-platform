# Stampcoin Platform

منصة ستامكوين الرقمية - منصة قائمة على تقنية البلوك تشين للطوابع الرقمية

## نظرة عامة

Stampcoin Platform هي منصة رقمية تسمح للمستخدمين بإنشاء وإدارة محافظ رقمية وتداول الطوابع الرقمية. تعتمد المنصة على تقنية Node.js وتوفر واجهات برمجة تطبيقات (APIs) للتعامل مع المحافظ والمعاملات والسوق.

## المتطلبات

- Node.js 16.x أو أحدث
- npm أو yarn

## التثبيت والنشر

### 1. استنساخ المشروع

```bash
git clone https://github.com/your-username/stp.git
cd stp
```

### 2. تثبيت الاعتمادات

```bash
npm install
```

### 3. إعداد البيئة

أنشئ ملف `.env` في المجلد الجذر للمشروع يحتوي على:

```
# رمز المزامنة (للمصادقة على API)
SYNC_TOKEN=your_secure_sync_token_here

# منفذ الخادم (الافتراضي هو 8080)
PORT=8080

# إعدادات أخرى محتملة
NODE_ENV=production
```

### 4. بدء الخدمة

**ويندوز:**
```bash
start.bat
```

**Linux/macOS:**
```bash
./start.sh
```

أو يمكنك استخدام الأوامر مباشرة:
```bash
npm start
```

### 5. الوصول للمنصة

- الصفحة الرئيسية: http://localhost:8080
- API المحفظة: http://localhost:8080/api/wallets
- API السوق: http://localhost:8080/api/market

## واجهات البرمجة (APIs)

### المحفظة الرقمية (Digital Wallet)

- `POST /api/wallets` - إنشاء محفظة جديدة
- `GET /api/wallets/:userId` - الحصول على محفظة مستخدم
- `GET /api/wallets` - الحصول على جميع المحافظ
- `POST /api/wallets/:userId/balance` - تحديث رصيد المحفظة
- `POST /api/wallets/:userId/stamps` - إضافة طابع للمحفظة
- `POST /api/wallets/transfer` - تحويل بين المحافظ
- `GET /api/wallets/:userId/transactions` - سجل المعاملات للمستخدم
- `GET /api/transactions` - جميع المعاملات

### مؤسسة السوق (Market Institution)

- `GET /api/market/items` - الحصول على جميع عناصر السوق
- `GET /api/market/items/:itemId` - الحصول عنصر معين من السوق
- `POST /api/market/items` - إضافة عنصر جديد للسوق
- `PUT /api/market/items/:itemId` - تحديث عنصر في السوق
- `POST /api/market/items/:itemId/purchase` - شراء عنصر من السوق
- `DELETE /api/market/items/:itemId` - حذف عنصر من السوق
- `GET /api/market/transactions` - سجل معاملات السوق

## النشر على السحابة

### Heroku

1. أنشئ حساب Heroku وقم بتثبيت CLI
2. سجل الدخول وأنشئ تطبيق:
   ```bash
   heroku login
   heroku create your-app-name
   ```
3. اضبط متغيرات البيئة:
   ```bash
   heroku config:set SYNC_TOKEN=your_secure_sync_token_here
   ```
4. نشر التطبيق:
   ```bash
   git push heroku main
   ```

### AWS Elastic Beanstalk

1. أنشئ حساب AWS وقم بتثبيت EB CLI
2. قم بتهيئة تطبيق EB:
   ```bash
   eb init
   ```
3. أنشئ البيئة ونشر التطبيق:
   ```bash
   eb create production
   eb deploy
   ```

### خادم VPS/سحابة تقليدي

1. اشتري خادم سحابة (مثل AWS EC2, DigitalOcean)
2. قم بتثبيت Node.js وnpm
3. قم بتحميل ملفات المشروع إلى الخادم
4. اتبع الخطوات المذكورة أعلاه لتثبيت الاعتمادات وإعداد متغيرات البيئة
5. استخدم PM2 لإدارة العمليات:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "stampcoin-platform"
   pm2 save
   pm2 startup
   ```

## ملاحظات الأمان

1. قم بإعداد كلمات مرور قوية ورمز SYNC_TOKEN آمن
2. استخدم HTTPS (يمكن تحقيق ذلك عبر Nginx reverse proxy)
3. قم بالنسخ الاحتياطي الملفات بانتظام
4. حافظ على تحديث النظام والاعتمادات

## المراقبة والصيانة

1. قم بإعداد تسجيل السجلات والمراقبة
2. تحقق من سجلات الأخطى بانتظام
3.راقب استخدام موارد الخادم
4. قم بتوسيع موارد الخادم حسب الحاجة

## المساهمة

يرجى اتباع إرشادات المساهمة في ملف CONTRIBUTING.md.

## الترخيص

يرجى مراجعة ملف LICENSE للحصول على معلومات الترخيص.

## الدعم

إذا واجهت أي مشاكل أو لديك أسئلة، يرجى إنشاء issue في مستودع GitHub.
