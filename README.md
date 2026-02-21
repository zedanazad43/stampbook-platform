# 🏛️ Stampcoin Platform | منصة ستامب كوين

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](Dockerfile)

An innovative blockchain-based digital stamps platform with wallet and marketplace features.

🌐 **[Live Demo](https://zedanazad43.github.io/stp/)** | 📖 **[Documentation](docs/)** | 🛣️ **[Roadmap](docs/roadmap.html)**

---

## 🌍 Languages | اللغات

- **العربية** 🇸🇦 | **English** 🇬🇧 | **Deutsch** 🇩🇪 | **中文** 🇨🇳 | **Français** 🇫🇷 | **Español** 🇪🇸

---

## ✨ Features | المميزات

- 🏦 **Digital Wallet API** - Create, manage, and transfer digital stamps securely
- 🛍️ **Market Institution API** - Buy, sell, and trade digital stamps in a marketplace
- 🔐 **Secure P2P Transfers** - Peer-to-peer transactions with full transaction history
- 🌐 **Multi-Language Support** - 6+ languages supported
- 🐳 **Docker Ready** - Full Docker and Docker Compose support
- ⚡ **High Performance** - Built with Express.js and Node.js

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.x
- Git
- Docker (optional, recommended)

### Using Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/zedanazad43/stp.git
cd stp

# Start with Docker Compose
docker compose up --build

# Access at http://localhost:8080
```

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:8080
```

---

## 📦 Installation & Setup

See detailed guides:
- **[Installation Guide](INSTALLATION.md)**
- **[Windows Setup](WINDOWS_SETUP.md)**
- **[Quick Start](QUICKSTART.md)**

---

## 🔌 API Documentation

### Wallet API | واجهة برمجة المحفظة
Complete wallet management endpoints and examples: **[WALLET_API.md](WALLET_API.md)**

### Market API | واجهة برمجة السوق
Complete marketplace endpoints and examples: **[MARKET_API.md](MARKET_API.md)**

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm lint
```

### Docker Commands

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run

# Or use Docker Compose
docker compose up
docker compose down
```

---

## 📚 Full Documentation

- 🌐 **[Online Documentation Portal](https://zedanazad43.github.io/stp/)**
- 📁 **[docs/ Directory](docs/)**
- 🔒 **[Security Guidelines](SECURITY.md)**
- 📋 **[Deployment Guide](DEPLOYMENT.md)**
- 🤝 **[Contributing Guide](CONTRIBUTING.md)**

---

## 🔒 Security

For security information and guidelines, see **[SECURITY.md](SECURITY.md)**.

⚠️ **Important**: Always use HTTPS in production and keep your private keys secure.

---

## 📝 License

This project is licensed under the MIT License - see **[LICENSE](LICENSE)** for details.

---

## 👥 Contributing

Contributions are welcome! See **[CONTRIBUTING.md](CONTRIBUTING.md)** for guidelines.

---

## 📧 Contact & Support

- **Author**: Azad Zedan
- **Repository**: [github.com/zedanazad43/stp](https://github.com/zedanazad43/stp)
- **Issues**: [GitHub Issues](https://github.com/zedanazad43/stp/issues)

---

## 🌐 Website

**Live Website**: https://zedanazad43.github.io/stp/

---

## Changelog

See **[CHANGELOG.md](CHANGELOG.md)** for version history and updates.

---

**Last Updated**: 2025
**Status**: ✅ Active Development

---

## 🤖 إعداد GitHub Actions Runner ونشر المشروع

هذا المشروع يدعم استخدام GitHub Actions Runner المضيف الذاتي (Self-hosted Runner) لبناء ونشر المشروع تلقائيًا.

### المتطلبات الأساسية
- حساب GitHub
- وصول إلى مستودع المشروع
- نظام التشغيل Windows (مع PowerShell)

### إعداد Runner المضيف الذاتي

#### الخطوة 1: تنزيل GitHub Actions Runner

1. افتح PowerShell
2. أنشئ مجلدًا للـ Runner:
   ```
   mkdir actions-runner
   cd actions-runner
   ```
3. قم بتنزيل Runner (نسخة Windows):
   ```
   curl -o actions-runner-win-x64-2.331.0.zip -L https://github.com/actions/runner/releases/download/v2.331.0/actions-runner-win-x64-2.331.0.zip
   ```
4. قم بفك ضغط الملف:
   ```
   Expand-Archive -Path actions-runner-win-x64-2.331.0.zip -DestinationPath .
   ```

#### الخطوة 2: الحصول على عنوان URL ورمز Runner

1. سجل الدخول إلى حساب GitHub الخاص بك
2. اذهب إلى مستودعك
3. من القمة اليمنى، انقر على 'Settings'
4. في القمة اليسرى، انقر على 'Actions'
5. في القمة اليسرى، انقر على 'Runners'
6. انقر على زر 'New runner'
7. انسخ عنوان URL ورمز Runner الظاهرين لك

#### الخطوة 3: تكوين الـ Runner

1. في PowerShell، انتقل إلى مجلد الـ Runner:
   ```
   cd C:\Users\azadz\actions-runner
   ```
2. قم بتكوين الـ Runner باستخدام عنوان URL ورمزك:
   ```
   .\config.cmd --url YOUR_REPO_URL --token YOUR_RUNNER_TOKEN
   ```
   استبدل `YOUR_REPO_URL` و`YOUR_RUNNER_TOKEN` بالقيم الفعلية

#### الخطوة 4: تشغيل الـ Runner

1. بعد التكوين بنجاح، قم بتشغيل الـ Runner:
   ```
   .\run.cmd
   ```

### إعداد سير العمل (Workflow) لنشر المشروع

لقد قمنا مسبقًا بإنشاء ملف سير العمل في `.github/workflows/publish.yml`. هذا الملف يقوم بالآتي:

1. يستنسخ المستودع عند كل دفع إلى الفرع الرئيسي
2. يثبت Node.js والتبعيات
3. يقوم ببناء المشروع
4. ينشر المشروع

لتخصيص سير العمل حسب احتياجاتك، قم بتعديل قسم "Deploy project" في ملف `publish.yml`.

### نشر المشروع

بعد إعداد Runner وتكوين سير العمل، سيتم نشر المشروع تلقائيًا عند كل دفع إلى الفرع الرئيسي. يمكنك مراقبة سير العمل في قسم "Actions" في مستودعك على GitHub.

### استكشاف الأخطاء وإصلاحها

- إذا لم يبدأ الـ Runner، تحقق من وجود رسائل خطأ في نافذة PowerShell
- تأكد من أن عنوان URL ورمز Runner صحيحان وغير منتهي الصلاحية
- تأكد من أن الـ Runner لديه الأذونات الكافية للوصول إلى ملفات المشروع
