const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function createFamousStampsSection(databasePath) {
  try {
    console.log('جاري إنشاء قسم الطوابع المشهورة...');

    // الاتصال بقاعدة MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    await client.connect();

    // قاعدة بيانات ومجموعة الطوابع
    const db = client.db('stampcoin');
    const stampsCollection = db.collection('stamps');

    // قراءة بيانات الطوابع من قاعدة البيانات
    const stamps = await stampsCollection.find({}).toArray();

    // تحديد الطوابع المشهورة بناءً على القيمة والتاريخ
    const famousStamps = stamps
      .filter(stamp => stamp.estimatedValue > 1000 || stamp.category === 'historical' || stamp.category === 'rare')
      .sort((a, b) => b.estimatedValue - a.estimatedValue)
      .slice(0, 10);

    // إنشاء قسم الطوابع المشهورة
    const famousStampsSection = {
      title: 'أشهر الطوابع في العالم',
      description: 'قائمة بأشهر وأغلى الطوابع في التاريخ، مع معلومات عن تاريخها وقيمتها الحالية.',
      lastUpdated: new Date().toISOString(),
      stamps: famousStamps.map(stamp => ({
        id: stamp._id,
        name: stamp.name,
        description: stamp.description,
        imageUrl: stamp.imageUrl,
        category: stamp.category,
        estimatedValue: stamp.estimatedValue,
        currency: stamp.currency,
        historicalValue: stamp.historicalValue || stamp.estimatedValue * 0.8,
        historicalYear: stamp.historicalYear || new Date().getFullYear(),
        originCountry: stamp.originCountry || 'غير معروف',
        currentOwner: stamp.owner ? stamp.owner.name : 'مجهول',
        auctionHistory: stamp.auctionHistory || []
      }))
    };

    // حفظ القسم في ملف
    const sectionPath = path.join(databasePath, 'famous-stamps-section.json');
    fs.writeFileSync(sectionPath, JSON.stringify(famousStampsSection, null, 2));

    // إنشاء صفحة HTML للعرض
    const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>أشهر الطوابع في العالم - ستامكوين</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8f9fa;
    }
    .navbar {
      background-color: #003366;
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }
    .navbar-brand {
      font-weight: bold;
      font-size: 1.5rem;
    }
    .stamp-card {
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      transition: transform 0.3s ease;
    }
    .stamp-card:hover {
      transform: translateY(-5px);
    }
    .stamp-image {
      height: 250px;
      object-fit: cover;
    }
    .stamp-info {
      padding: 20px;
      background-color: white;
    }
    .stamp-price {
      font-size: 1.5rem;
      font-weight: bold;
      color: #003366;
      margin-top: 10px;
    }
    .stamp-category {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9rem;
      background-color: #e9ecef;
      margin-top: 10px;
    }
    .historical-value {
      font-size: 0.9rem;
      color: #6c757d;
      margin-top: 5px;
    }
    .origin-country {
      display: flex;
      align-items: center;
      margin-top: 10px;
    }
    .origin-country i {
      margin-left: 5px;
      color: #003366;
    }
    .footer {
      background-color: #003366;
      color: white;
      padding: 30px 0;
      margin-top: 50px;
    }
    .footer a {
      color: #a3c2e3;
      text-decoration: none;
    }
    .footer a:hover {
      color: white;
    }
    .page-header {
      background-color: #003366;
      color: white;
      padding: 40px 0;
      margin-bottom: 30px;
    }
  </style>
</head>
<body>
  <!-- شريط التنقل -->
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container">
      <a class="navbar-brand" href="#"><i class="bi bi-stamp"></i> ستامكوين</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="#"><i class="bi bi-house-door"></i> الرئيسية</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#"><i class="bi bi-collection"></i> الطوابع</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#"><i class="bi bi-graph-up"></i> السوق</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#"><i class="bi bi-wallet2"></i> المحفظة</a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="#"><i class="bi bi-star"></i> الطوابع المشهورة</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#"><i class="bi bi-person-circle"></i> الحساب</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- رأس الصفحة -->
  <div class="page-header">
    <div class="container">
      <h1 class="display-4">أشهر الطوابع في العالم</h1>
      <p class="lead">اكتشف تاريخ الطوابع البريدية وأشهرها قيمة في العالم</p>
    </div>
  </div>

  <!-- المحتوى الرئيسي -->
  <div class="container">
    <div class="row">
      ${famousStamps.stamps.map(stamp => `
      <div class="col-md-6 col-lg-4">
        <div class="stamp-card">
          <img src="${stamp.imageUrl}" alt="${stamp.name}" class="stamp-image">
          <div class="stamp-info">
            <h4>${stamp.name}</h4>
            <p class="text-muted">${stamp.description}</p>
            <div class="stamp-price">${stamp.estimatedValue} ${stamp.currency}</div>
            <span class="stamp-category">${stamp.category}</span>
            <div class="historical-value">
              <i class="bi bi-clock-history"></i> القيمة التاريخية: ${stamp.historicalValue} ${stamp.currency} (${stamp.historicalYear})
            </div>
            <div class="origin-country">
              <i class="bi bi-flag"></i> ${stamp.originCountry}
            </div>
            <div class="mt-3">
              <button class="btn btn-primary btn-sm me-2"><i class="bi bi-eye"></i> عرض التفاصيل</button>
              <button class="btn btn-outline-primary btn-sm"><i class="bi bi-share"></i> مشاركة</button>
            </div>
          </div>
        </div>
      </div>
      `).join('')}
    </div>
  </div>

  <!-- تذييل الصفحة -->
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <h5>منصة ستامكوين</h5>
          <p>منصة متخصصة في تداول الطوابع الرقمية والمادية باستخدام تقنية البلوك تشين</p>
        </div>
        <div class="col-md-4">
          <h5>روابط سريعة</h5>
          <ul class="list-unstyled">
            <li><a href="#">الرئيسية</a></li>
            <li><a href="#">الطوابع</a></li>
            <li><a href="#">السوق</a></li>
            <li><a href="#">المحفظة</a></li>
          </ul>
        </div>
        <div class="col-md-4">
          <h5>تواصل معنا</h5>
          <ul class="list-unstyled">
            <li><i class="bi bi-envelope"></i> info@stampcoin.com</li>
            <li><i class="bi bi-telephone"></i> +123 456 7890</li>
            <li><i class="bi bi-geo-alt"></i> دبي، الإمارات العربية المتحدة</li>
          </ul>
        </div>
      </div>
      <hr class="my-4 bg-white">
      <div class="text-center">
        <p>&copy; 2023 منصة ستامكوين. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // إضافة سلوك للأزرار
      const buttons = document.querySelectorAll('.stamp-card button');
      buttons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          const action = this.textContent.trim();
          const stampName = this.closest('.stamp-info').querySelector('h4').textContent;

          if (action.includes('عرض التفاصيل')) {
            console.log('عرض تفاصيل الطابع:', stampName);
            // هنا يمكن توجيه المستخدم إلى صفحة التفاصيل
          } else if (action.includes('مشاركة')) {
            console.log('مشاركة الطابع:', stampName);
            // هنا يمكن إضافة منطق المشاركة
          }
        });
      });
    });
  </script>
</body>
</html>
    `;

    // حفظ صفحة HTML
    const htmlPath = path.join(databasePath, 'famous-stamps.html');
    fs.writeFileSync(htmlPath, htmlContent);

    console.log(`تم إنشاء قسم الطوابع المشهورة في ${sectionPath} وصفحة العرض في ${htmlPath}`);
    return { success: true, sectionPath, htmlPath };
  } catch (error) {
    console.error('خطأ في إنشاء قسم الطوابع المشهورة:', error);
    return { success: false, message: error.message };
  } finally {
    // إغلاق اتصال قاعدة البيانات
    if (client) {
      await client.close();
    }
  }
}

// استدعاء الدالة مع معلمات من سطر الأوامر
const databasePath = process.argv[2] || './stamps-database';
createFamousStampsSection(databasePath)
  .then(result => {
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('حدث خطأ:', error);
    process.exit(1);
  });
