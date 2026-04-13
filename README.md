# Stampbook Platform 🏷️

> أول منصة متكاملة لبيع وشراء وسك الطوابع النادرة كـ NFTs على بلوكتشين BNB Smart Chain

[![Build & Test](https://github.com/zedanazad43/stampbook-platform/actions/workflows/all-agents.yml/badge.svg)](https://github.com/zedanazad43/stampbook-platform/actions/workflows/all-agents.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 📋 نظرة عامة

**Stampbook** (`ecostamp.net`) منصة ويب متكاملة تجمع بين سوق الطوابع الرقمية والمزادات الحية وعملة **STP** على شبكة BNB Smart Chain.

### المميزات الرئيسية

| الميزة | الوصف |
|--------|-------|
| 🏪 **سوق الطوابع** | بيع وشراء الطوابع النادرة بعملة STP |
| 🔨 **المزادات الحية** | مزادات مع عد تنازلي فوري |
| 🖼️ **NFTs** | سك الطوابع كـ NFTs على البلوكتشين |
| 💰 **محفظة STP** | رصيد ومعاملات مدمجة في المنصة |
| ⛓️ **Blockchain API** | تتبع عرض عملة STP ومعالجة السك |
| 🔐 **مصادقة JWT** | تسجيل/دخول آمن مع مكافأة ترحيبية (100 STP) |

---

## 🚀 التشغيل السريع

### المتطلبات
- Node.js 18+
- npm 9+

### التثبيت

```bash
git clone https://github.com/zedanazad43/stampbook-platform.git
cd stampbook-platform
npm install
cp .env.example .env   # عدّل القيم قبل التشغيل
npm start
```

يعمل الخادم على `http://localhost:3000`

### التطوير (مع إعادة تحميل تلقائية)

```bash
npm run dev
```

### تشغيل الاختبارات

```bash
npm test
```

---

## ⚙️ متغيرات البيئة

انسخ `.env.example` إلى `.env` وعدّل القيم:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=replace-with-a-long-random-secret
SYNC_TOKEN=replace-with-another-long-random-secret
# ALLOWED_ORIGINS=https://ecostamp.net,https://www.ecostamp.net
```

> **⚠️ تنبيه:** لا تُشغّل الخادم في الإنتاج بدون تعيين `JWT_SECRET` و`SYNC_TOKEN` — سيُظهر الخادم تحذيراً صريحاً.

---

## 🗂️ هيكل المشروع

```
stampbook-platform/
├── server.js              # خادم Express الرئيسي (API + static)
├── wallet.js              # منطق المحافظ والأرصدة
├── market.js              # منطق السوق والمعاملات
├── blockchain.js          # منطق عملة STP (BEP-20)
├── index.js               # نقطة الدخول
├── public/                # الواجهة الأمامية (HTML/CSS/JS)
│   └── index.html         # تطبيق SPA الرئيسي
├── functions/
│   └── api/[[route]].js   # Cloudflare Pages Function (API proxy)
├── scripts/
│   └── build.js           # سكريبت البناء
├── tests/                 # اختبارات Jest
│   ├── server.test.js     # اختبارات تكاملية للـ API
│   ├── wallet.test.js
│   ├── market.test.js
│   └── blockchain.test.js
├── .github/workflows/     # CI/CD pipelines
├── database.json          # قاعدة بيانات JSON (المستخدمون، NFTs، المزادات)
├── wallets.json           # بيانات المحافظ
├── market-data.json       # بيانات السوق
├── render.yaml            # إعداد Render.com
├── wrangler.toml          # إعداد Cloudflare Pages/Workers
└── .env.example           # مثال متغيرات البيئة
```

---

## 📡 نقاط النهاية API

### المصادقة

| الطريقة | المسار | الوصف |
|--------|--------|-------|
| `POST` | `/api/auth/register` | إنشاء حساب + مكافأة 100 STP |
| `POST` | `/api/auth/login` | تسجيل دخول → JWT |
| `GET`  | `/api/auth/me` | 🔒 بيانات المستخدم الحالي |
| `PUT`  | `/api/auth/profile` | 🔒 تحديث الملف الشخصي |

### NFTs والمزادات

| الطريقة | المسار | الوصف |
|--------|--------|-------|
| `GET`  | `/api/nfts` | قائمة NFTs |
| `POST` | `/api/nfts/mint` | 🔒 سك NFT جديد |
| `POST` | `/api/nfts/:id/buy` | 🔒 شراء NFT |
| `GET`  | `/api/auctions` | قائمة المزادات |
| `POST` | `/api/auctions` | 🔒 إنشاء مزاد |
| `POST` | `/api/auctions/bid/:id` | 🔒 تقديم مزايدة |

### السوق

| الطريقة | المسار | الوصف |
|--------|--------|-------|
| `GET`  | `/api/market/items` | قائمة المنتجات |
| `POST` | `/api/market/items` | 🔒 إضافة منتج |
| `GET`  | `/api/market/items/:id` | تفاصيل منتج |
| `PUT`  | `/api/market/items/:id` | 🔒 تعديل منتج (البائع فقط) |
| `POST` | `/api/market/items/:id/buy` | 🔒 شراء منتج |
| `DELETE` | `/api/market/items/:id` | 🔒 حذف منتج (البائع فقط) |

### البلوكتشين والمحفظة

| الطريقة | المسار | الوصف |
|--------|--------|-------|
| `GET`  | `/api/blockchain/info` | معلومات عملة STP |
| `GET`  | `/api/blockchain/supply` | إحصائيات العرض |
| `GET`  | `/api/blockchain/balance/:address` | رصيد عنوان |
| `POST` | `/api/blockchain/mint` | 🛡️ سك STP (sync token) |
| `GET`  | `/api/wallet/:userId` | بيانات المحفظة |
| `POST` | `/api/wallet/transfer` | تحويل رصيد |
| `GET`  | `/api/stats` | إحصائيات المنصة |
| `GET`  | `/health` | فحص صحة الخادم |

> 🔒 = يتطلب `Authorization: Bearer <token>`  
> 🛡️ = يتطلب `x-sync-token` (server-to-server فقط)

---

## 🚢 النشر

### Render.com (الخلفية — مجاناً)

1. اذهب إلى [render.com](https://render.com) → **New Web Service**
2. اربط هذا المستودع — الإعداد موجود في `render.yaml`
3. أضف متغيرات البيئة في لوحة Render:
   - `JWT_SECRET` (قيمة عشوائية طويلة)
   - `SYNC_TOKEN` (قيمة عشوائية طويلة)
   - `ALLOWED_ORIGINS=https://ecostamp.net,https://www.ecostamp.net`

### Cloudflare Pages (الواجهة — `ecostamp.net`)

1. أضف سرّين في **GitHub → Settings → Secrets → Actions**:
   - `CF_API_TOKEN` — من [cloudflare.com](https://cloudflare.com) → My Profile → API Tokens
   - `CF_ACCOUNT_ID` — من لوحة Cloudflare → Account ID
2. ادفع إلى `main` — يعمل workflow النشر تلقائياً
3. اربط النطاق في **Cloudflare Pages → Custom domains → `ecostamp.net`**
4. أضف في Pages → Settings → Environment variables:
   - `BACKEND_URL=https://your-render-url.onrender.com`

---

## 🔒 الأمان

- **Rate Limiting**: 20 طلب مصادقة / 15 دقيقة، 120 طلب API / دقيقة
- **JWT**: انتهاء الصلاحية بعد 7 أيام
- **bcrypt**: تشفير كلمات المرور (10 rounds)
- **CORS**: قابل للتخصيص عبر `ALLOWED_ORIGINS`
- **Sync Token**: حماية نقاط نهاية السك والإدارة

راجع [SECURITY.md](SECURITY.md) للتفاصيل.

---

## 🧪 الاختبارات

```
Tests:       85 passed, 85 total
Test Suites: 4 passed (wallet, market, blockchain, server)
```

- `tests/server.test.js` — اختبارات تكاملية لجميع مسارات API
- `tests/wallet.test.js` — وحدة المحفظة
- `tests/market.test.js` — وحدة السوق
- `tests/blockchain.test.js` — وحدة البلوكتشين

---

## 🤝 المساهمة

راجع [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 الترخيص

MIT © Stampbook Platform
