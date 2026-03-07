# مستودع STP: توثيق وملخص جميع الأكواد وطلبات السحب

## blockchain.js
كود سلسلة الكتل ومكوناته الأساسية.
[blockchain/blockchain.js](../blockchain/blockchain.js)

## market.js
اكواد السوق والتحليلات.
[market/market.js](../market/market.js)

## wallet.js
مكونات المحفظة الرقمية.
[wallet/wallet.js](../wallet/wallet.js)

## index.js و server.js
تشغيل الخادم وبداية التنفيذ.
[app/index.js](../app/index.js), [app/server.js](../app/server.js)

## باقي الملفات
- الإعدادات: config/package.json, config/mcp.json
- الوثائق والأسئلة: docs/README.md, MARKET_API.md, WALLET_API.md

---

## طلبات السحب (Pull Requests) الملخصة:

1. PR #203: إضافة خصائص جديدة للسوق (failed)
2. PR #204: إصلاحات في السحوبات والمحفظة (failed)
3. PR [main]: إضافة ملفات التشغيل الآلي (نجح)

---

## تعليمات النشر:
- عند إنجاز الهيكلة والتعديلات، نفذ:
  ```
  git add .
  git commit -m "إعادة هيكلة المشروع وتنظيم الأكواد والوثائق"
  git push origin main
  ```