#!/bin/bash
echo "جاري بدء تشغيل منصة ستامكوين..."
echo "يرجى التأكد من تثبيت Node.js 16.x أو إصدار أحدث"

# التحقق من تثبيت Node.js
if ! command -v node &> /dev/null; then
    echo "خطأ: لم يتم العثور على Node.js، يرجى تثبيت Node.js أولاً"
    exit 1
fi

# التحقق من تثبيت الاعتمادات
if [ ! -d "node_modules" ]; then
    echo "جاري تثبيت الاعتمادات..."
    npm install
    if [ $? -ne 0 ]; then
        echo "خطأ: فشل تثبيت الاعتمادات"
        exit 1
    fi
fi

# التحقق من ملف متغيرات البيئة
if [ ! -f ".env" ]; then
    echo "تحذير: لم يتم العثور على ملف .env، سيتم استخدام الإعدادات الافتراضية"
    echo "يرجى إنشاء ملف .env يدوياً وتعيين SYNC_TOKEN"
fi

# بدء الخادم
echo "جاري بدء تشغيل الخادم..."
npm start
