#!/bin/bash
# deploy.sh - انسخ هذا الملف وشغّله على خادمك الخاص

set -e

echo "🚀 بدء نشر StampCoin على ecostamp.net..."

# 1. تحديث النظام
sudo apt update && sudo apt upgrade -y

# 2. تثبيت Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 تثبيت Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

# 3. تثبيت Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 تثبيت Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 4. إعداد متغيرات البيئة (عدّل القيم!)
if [ ! -f .env.production ]; then
    echo "⚙️ إنشاء ملف .env.production..."
    cat > .env.production << EOF
# Database
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
DATABASE_URL=mysql://stampcoin_user:stampcoin_pass@mysql:3306/stampcoin

# Security
JWT_SECRET=$(openssl rand -hex 64)

# Stripe (أضف مفاتيحك الحية هنا لاحقاً)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth
OAUTH_SERVER_URL=https://auth.ecostamp.net
VITE_APP_ID=ecostamp_prod_2026

# Forge API (اختياري)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
EOF
    echo "✅ تم إنشاء .env.production - راجع القيم وعدّلها قبل المتابعة!"
    exit 1
fi

# 5. تحميل الشهادات (SSL) عبر Certbot
echo "🔐 إعداد SSL مع Let's Encrypt..."
mkdir -p certbot/conf certbot/www
docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email azadzedan13@gmail.com \
    --agree-tos --no-eff-email \
    -d ecostamp.net -d www.ecostamp.net -d api.ecostamp.net

# 6. تشغيل الخدمات
echo "🔧 تشغيل الخدمات..."
docker-compose -f docker-compose.prod.yml up -d

# 7. تطبيق ترحيلات قاعدة البيانات
echo "🗄️ تطبيق ترحيلات قاعدة البيانات..."
docker-compose -f docker-compose.prod.yml exec -T app pnpm run db:push

echo "✅ اكتمل النشر! 🎉"
echo "🌐 الواجهة: https://ecostamp.net"
echo "🔌 API: https://api.ecostamp.net"
echo "📊 السجلات: docker-compose -f docker-compose.prod.yml logs -f"
