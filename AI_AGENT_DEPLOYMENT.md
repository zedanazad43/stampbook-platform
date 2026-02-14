# نشر وكيل الخبير الاصطناعي (AI Agent Expert)

## نظرة عامة

هذا الدليل يشرح كيفية نشر وتكامل نظام وكيل الخبير الاصطناعي مع منصة Stampcoin Platform.

## المتطلبات

- حساب Render (render.com)
- مستودع GitHub لمشروع Stampcoin Platform
- Node.js 16.x أو أحدث
- npm أو yarn

## الخطوات

### 1. إعداد المستودع

1. تأكد من أن جميع الملفات الخاصة بوكيل الخبير الاصطناعي موجودة في المستودع:
   ```
   src/ai-agent-expert/
   ├── index.js
   ├── config.json
   ├── utils.js
   └── README.md
   ```

2. تأكد من أن ملف `render.yaml` يحتوي على الإعدادات المناسبة:
   ```yaml
   services:
     - type: web
       name: stampcoin-platform
       env: node
       buildCommand: npm ci
       startCommand: node server.js
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 10000
       healthCheck:
         path: /health
         interval: 30s
         timeout: 3s
         method: GET
         retries: 3
   ```

3. قم بتحديث ملف `package.json` لإضافة أوامر تشغيل الوكيل:
   ```json
   "scripts": {
     "start": "node server.js",
     "agent": "node src/ai-agent-expert/index.js",
     "agent-dev": "nodemon src/ai-agent-expert/index.js"
   }
   ```

### 2. نشر على Render

1. سجل الدخول إلى حسابك على Render (render.com)
2. انقر على "New +" واختر "Web Service"
3. اختر مستودع GitHub لمشروع Stampcoin Platform
4. في إعدادات الخدمة:
   - **Name**: stampcoin-platform
   - **Root Directory**: / (مجلد الجذر)
   - **Runtime**: Node
   - **Build Command**: npm ci
   - **Start Command**: node server.js
   - **Instance Type**: Free أو حسب الحاجة
5. في قسم "Environment Variables"، أضف المتغيرات التالية:
   ```
   NODE_ENV=production
   PORT=10000
   SYNC_TOKEN=your-secure-token-here
   BASE_URL=https://your-service-name.onrender.com
   ```
6. في قسم "Health Check"، تأكد من أن المسار هو `/health`
7. انقر على "Advanced Settings" وفعّل الخيارات التالية إذا لزم الأمر:
   - **Auto-Deploy**: ممكّن
   - **Branch**: main
8. انقر على "Create Web Service" لبدء النشر

### 3. التحقق من النشر

1. بعد اكتمال النشر، يمكنك الوصول إلى الخدمة عبر الرابط الذي قدمه Render
2. تحقق من حالة الوكيل:
   ```
   https://your-service-name.onrender.com/agent/status
   ```
3. يمكنك اختبار نقاط النهاية الأخرى:
   ```
   https://your-service-name.onrender.com/health
   https://your-service-name.onrender.com/ai-agent-status
   ```

### 4. تكامل الوكيل

1. لتفعيل الوكيل، أرسل طلب POST:
   ```
   POST https://your-service-name.onrender.com/agent/activate
   ```
2. لتحليل الكود:
   ```
   POST https://your-service-name.onrender.com/agent/analyze-code
   Content-Type: application/json

   {
     "filePath": "./src/services/auth.js",
     "analysisType": "quality"
   }
   ```

### 5. أفضل الممارسات

1. **التحديثات**: قم بتحديث الوكيل بانتظام للاستفادة من التحسينات وإصلاح الأخطاء
2. **النسخ الاحتياطي**: احتفظ بنسخة احتياطية من إعدادات الوكيل
3. **الأمان**: استخدم رمز وصول آمن (SYNC_TOKEN) للوصول إلى نقاط النهاية الحساسة
4. **المراقبة**: راقب سجلات الوكيل بانتظام لتحديد أي مشاكل

### 6 استكشاف الأخطاء وإصلاحها

### الوكيل لا يعمل

- تأكد من أن جميع الملفات تم رفعها إلى المستودع
- تحقق من سجلات النشر في لوحة تحكم Render
- تأكد من أن جميع المتغيرات البيئية مُهيأة بشكل صحيح

### نقاط النهاية لا تستجيب

- تأكد من أن الوكيل نشط (`POST /agent/activate`)
- تحقق من أن المنفذ الصحيح مُهيأ (10000)
- راجع سجلات الخادم في Render

### الأداء بطيء

- فكر في ترقية خطة Render الخاصة بك
- تحقق من استخدام الموارد في لوحة تحكم Render
- راجع إعدادات الوكيل في ملف `config.json`

## الدعم

للحصول على مساعدة إضافية:

1. راجع وثائق المشروع الرئيسية
2. تحقق من مستندات AI Agent Expert (`src/ai-agent-expert/README.md`)
3. اتصل بدعم Render للمساعدة في مشاكل النشر

## المراجع

- [Render Documentation](https://render.com/docs)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Documentation](https://expressjs.com/)
