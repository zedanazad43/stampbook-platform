const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function setupUI(options) {
  try {
    console.log('جاري إعداد واجهة المستخدم...');

    const app = express();
    const port = process.env.PORT || 3000;

    // إعداد الوسائط
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));

    // إنشاء مسارات API
    app.get('/api/balance', async (req, res) => {
      try {
        // في التطبيق الحقيقي، سيتم جلب الرصيد من قاعدة البيانات
        const balance = {
          stp: 1000,
          eur: 500,
          usd: 550
        };
        res.json(balance);
      } catch (error) {
        res.status(500).json({ error: 'فشل جلب الرصيد' });
      }
    });

    app.get('/api/transfer-methods', async (req, res) => {
      try {
        const methods = [
          { id: 'bank', name: 'تحويل بنكي', icon: 'bank' },
          { id: 'crypto', name: 'تحويل رقمي', icon: 'crypto' },
          { id: 'stp', name: 'تحويل بعملة STP', icon: 'stp' }
        ];
        res.json(methods);
      } catch (error) {
        res.status(500).json({ error: 'فشل جلب طرق التحويل' });
      }
    });

    app.get('/api/trading-pairs', async (req, res) => {
      try {
        const pairs = [
          { symbol: 'STP/EUR', price: 0.15, change: 0.02 },
          { symbol: 'STP/USD', price: 0.16, change: 0.03 },
          { symbol: 'STP/BTC', price: 0.0000035, change: -0.0005 }
        ];
        res.json(pairs);
      } catch (error) {
        res.status(500).json({ error: 'فشل جلب أزواج التداول' });
      }
    });

    app.get('/api/notifications', async (req, res) => {
      try {
        const notifications = [
          { id: 1, title: 'تم تأكيد عملية الشراء', message: 'تم شراء طابع برقم 1234 بنجاح', date: '2023-05-15', read: false },
          { id: 2, title: 'عرض جديد', message: 'تمت إضافة طابع نادر جديد للمزاد', date: '2023-05-14', read: false },
          { id: 3, title: 'تحديث السعر', message: 'قيمة طابعك قد زادت بنسبة 10%', date: '2023-05-13', read: true }
        ];
        res.json(notifications);
      } catch (error) {
        res.status(500).json({ error: 'فشل جلب الإشعارات' });
      }
    });

    app.post('/api/notifications/read', async (req, res) => {
      try {
        const { notificationId } = req.body;
        // في التطبيق الحقيقي، سيتم تحديث حالة الإشعار في قاعدة البيانات
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'فشل تحديث حالة الإشعار' });
      }
    });

    // إنشاء صفحة HTML
    const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>منصة ستامكوين</title>
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
    .balance-card {
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .notification-item {
      border-left: 4px solid #003366;
      padding: 10px 15px;
      margin-bottom: 10px;
      background-color: white;
      border-radius: 0 5px 5px 0;
    }
    .unread {
      background-color: #f0f8ff;
    }
    .trading-pair {
      background-color: white;
      border-radius: 5px;
      padding: 10px;
      margin-bottom: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .price-up {
      color: #28a745;
    }
    .price-down {
      color: #dc3545;
    }
    .transfer-method {
      display: flex;
      align-items: center;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 10px;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .transfer-method:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    .method-icon {
      font-size: 1.5rem;
      margin-right: 15px;
      color: #003366;
    }
    .method-details h5 {
      margin: 0;
      font-weight: 600;
    }
    .method-details p {
      margin: 0;
      color: #6c757d;
    }
    .featured-stamp {
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .featured-stamp img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .stamp-info {
      padding: 15px;
      background-color: white;
    }
    .stamp-price {
      font-size: 1.2rem;
      font-weight: bold;
      color: #003366;
    }
    .stamp-category {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 15px;
      font-size: 0.8rem;
      background-color: #e9ecef;
      margin-top: 5px;
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
            <a class="nav-link active" href="#"><i class="bi bi-house-door"></i> الرئيسية</a>
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
            <a class="nav-link" href="#"><i class="bi bi-person-circle"></i> الحساب</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#"><i class="bi bi-bell"></i> الإشعارات</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- المحتوى الرئيسي -->
  <div class="container mt-4">
    <!-- قسم الرصيد -->
    <div class="row mb-4">
      <div class="col-md-12">
        <div class="balance-card card p-4">
          <h3>رصيد الحساب</h3>
          <div class="row mt-3">
            <div class="col-md-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="mb-1">عملة STP</h5>
                  <p class="mb-0">الرصيد المتاح</p>
                </div>
                <div class="text-end">
                  <h4 class="mb-0">1,000</h4>
                  <small>≈ 150.00 EUR</small>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="mb-1">اليورو</h5>
                  <p class="mb-0">الرصيد المتاح</p>
                </div>
                <div class="text-end">
                  <h4 class="mb-0">500.00</h4>
                  <small>≈ 550.00 USD</small>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="mb-1">الدولار الأمريكي</h5>
                  <p class="mb-0">الرصيد المتاح</p>
                </div>
                <div class="text-end">
                  <h4 class="mb-0">550.00</h4>
                  <small>≈ 510.00 EUR</small>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-primary me-2"><i class="bi bi-plus-circle"></i> إيداع</button>
            <button class="btn btn-outline-primary"><i class="bi bi-arrow-left-right"></i> تحويل</button>
          </div>
        </div>
      </div>
    </div>

    <!-- قسم الطوابع المميزة -->
    <div class="row mb-4">
      <div class="col-md-12">
        <h3>الطوابع المميزة</h3>
        <div class="row">
          <div class="col-md-4">
            <div class="featured-stamp">
              <img src="https://via.placeholder.com/800x400?text=Stamp+1" alt="طابع مميز">
              <div class="stamp-info">
                <h5>طابع بريطاني نادر من 1840</h5>
                <p class="text-muted">أول طابع بريد في العالم</p>
                <div class="stamp-price">25,000 EUR</div>
                <span class="stamp-category">نادر جداً</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="featured-stamp">
              <img src="https://via.placeholder.com/800x400?text=Stamp+2" alt="طابع مميز">
              <div class="stamp-info">
                <h5>طابع سويسري ذهبي</h5>
                <p class="text-muted">صادر عام 1900</p>
                <div class="stamp-price">15,000 EUR</div>
                <span class="stamp-category">نادر</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="featured-stamp">
              <img src="https://via.placeholder.com/800x400?text=Stamp+3" alt="طابع مميز">
              <div class="stamp-info">
                <h5>طابع أمريكي تذكاري</h5>
                <p class="text-muted">صادر عام 1923</p>
                <div class="stamp-price">8,500 EUR</div>
                <span class="stamp-category">تذكاري</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- قسم طرق التحويل -->
    <div class="row mb-4">
      <div class="col-md-12">
        <h3>طرق التحويل</h3>
        <div class="transfer-method" onclick="showTransferMethod('bank')">
          <div class="method-icon">
            <i class="bi bi-bank2"></i>
          </div>
          <div class="method-details">
            <h5>تحويل بنكي</h5>
            <p>تحويل الأموال عبر الحسابات البنكية</p>
          </div>
        </div>
        <div class="transfer-method" onclick="showTransferMethod('crypto')">
          <div class="method-icon">
            <i class="bi bi-currency-bitcoin"></i>
          </div>
          <div class="method-details">
            <h5>تحويل رقمي</h5>
            <p>تحويل العملات الرقمية</p>
          </div>
        </div>
        <div class="transfer-method" onclick="showTransferMethod('stp')">
          <div class="method-icon">
            <i class="bi bi-coin"></i>
          </div>
          <div class="method-details">
            <h5>تحويل بعملة STP</h5>
            <p>تحويل سريع باستخدام عملة المنصة</p>
          </div>
        </div>
      </div>
    </div>

    <!-- قسم التداول -->
    <div class="row mb-4">
      <div class="col-md-12">
        <h3>سوق التداول</h3>
        <div class="trading-pair">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5>STP/EUR</h5>
              <p class="text-muted">زوج التداول الرئيسي</p>
            </div>
            <div class="text-end">
              <div class="price-up">0.15 EUR</div>
              <small class="text-success">+2.0%</small>
            </div>
          </div>
        </div>
        <div class="trading-pair">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5>STP/USD</h5>
              <p class="text-muted">زوج التداول الدولاري</p>
            </div>
            <div class="text-end">
              <div class="price-up">0.16 USD</div>
              <small class="text-success">+3.0%</small>
            </div>
          </div>
        </div>
        <div class="trading-pair">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5>STP/BTC</h5>
              <p class="text-muted">زوج التداول بالبيتكوين</p>
            </div>
            <div class="text-end">
              <div class="price-down">0.0000035 BTC</div>
              <small class="text-danger">-0.5%</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- قسم الإشعارات -->
    <div class="row mb-4">
      <div class="col-md-12">
        <h3>الإشعارات</h3>
        <div id="notifications-container">
          <!-- سيتم تحميل الإشعارات من الـ API -->
        </div>
      </div>
    </div>
  </div>

  <!-- التذييل -->
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <h5>منصة ستامكوين</h5>
          <p>منصة متخصصة في تداول الطوابع الرقمية والمادية مع ضمانات أمان عالية.</p>
        </div>
        <div class="col-md-4">
          <h5>روابط سريعة</h5>
          <ul class="list-unstyled">
            <li><a href="#">من نحن</a></li>
            <li><a href="#">كيف يعمل</a></li>
            <li><a href="#">الأسئلة الشائعة</a></li>
            <li><a href="#">اتصل بنا</a></li>
          </ul>
        </div>
        <div class="col-md-4">
          <h5>تابعنا</h5>
          <div class="d-flex">
            <a href="#" class="me-3"><i class="bi bi-facebook"></i></a>
            <a href="#" class="me-3"><i class="bi bi-twitter"></i></a>
            <a href="#" class="me-3"><i class="bi bi-instagram"></i></a>
            <a href="#"><i class="bi bi-telegram"></i></a>
          </div>
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
    // تحميل الإشعارات من الـ API
    async function loadNotifications() {
      try {
        const response = await fetch('/api/notifications');
        const notifications = await response.json();

        const container = document.getElementById('notifications-container');
        container.innerHTML = '';

        notifications.forEach(notification => {
          const notificationEl = document.createElement('div');
          notificationEl.className = 'notification-item' + (notification.read ? '' : ' unread');
          notificationEl.innerHTML = `
            <div class="d-flex justify-content-between">
              <div>
                <h5>${notification.title}</h5>
                <p>${notification.message}</p>
                <small>${notification.date}</small>
              </div>
              <div>
                ${!notification.read ? '<button class="btn btn-sm btn-outline-primary" onclick="markAsRead(${notification.id})">قراءة</button>' : ''}
              </div>
            </div>
          `;
          container.appendChild(notificationEl);
        });
      } catch (error) {
        console.error('فشل تحميل الإشعارات:', error);
      }
    }

    // تحديد الإشعار كمقروء
    async function markAsRead(notificationId) {
      try {
        const response = await fetch('/api/notifications/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notificationId }),
        });

        if (response.ok) {
          loadNotifications(); // إعادة تحميل الإشعارات بعد التحديث
        }
      } catch (error) {
        console.error('فشل تحديث حالة الإشعار:', error);
      }
    }

    // عرض نموذج التحويل
    function showTransferMethod(method) {
      alert(`سيتم فتح نموذج التحويل باستخدام: ${method}`);
    }

    // تحميل البيانات عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
      loadNotifications();
    });
  </script>
</body>
</html>
    `;

    // إنشاء مجلد public إذا لم يكن موجودًا
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // حفظ ملف HTML
    const htmlPath = path.join(publicDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlContent);

    // بدء الخادم
    app.listen(port, () => {
      console.log(`يعمل الواجهة على المنفذ ${port}`);
      console.log(`الوصول عبر: http://localhost:${port}`);
    });

    return { success: true, message: 'تم إعداد الواجهة بنجاح' };
  } catch (error) {
    console.error('خطأ في إعداد الواجهة:', error);
    return { success: false, message: error.message };
  }
}

// استدعاء الدالة مع الخيارات من سطر الأوامر
const options = {
  enableNotifications: process.argv[2] === 'true',
  showBalance: process.argv[3] === 'true',
  showTransferMethods: process.argv[4] === 'true'
};

setupUI(options)
  .then(result => {
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('حدث خطأ:', error);
    process.exit(1);
  });
