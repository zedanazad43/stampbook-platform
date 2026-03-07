
# حل مشاكل Git ونشر المشروع على GitHub Pages

Write-Host "حل مشاكل Git ونشر المشروع على GitHub Pages" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

Write-Host "الخطوة 1: سحب التغييرات من المستودع البعيد" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow
Write-Host "سيتم تنفيذ الأمر التالي:"
Write-Host "git pull origin main"
Write-Host ""

Write-Host "الخطوة 2: حل أي تعارضات قد تحدث" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "إذا ظهرت رسائل تعارض (conflict):"
Write-Host "1. افتح الملفات المذكورة في رسالة التعارض"
Write-Host "2. ابحث عن علامات التعارض (<<<<<<<, =======, >>>>>>>)"
Write-Host "3. حل التعارضات يدويًا وحفظ الملفات"
Write-Host "4. أضف الملفات التي تم حل تعارضاتها:"
Write-Host "   git add <file-name>"
Write-Host "5. أكمل عملية الـ merge:"
Write-Host "   git commit"
Write-Host ""

Write-Host "الخطوة 3: دفع التغييرات المدمجة إلى GitHub" -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Yellow
Write-Host "سيتم تنفيذ الأمر التالي:"
Write-Host "git push origin main"
Write-Host ""

Write-Host "الخطوة 4: تفعيل GitHub Pages للمستودع" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "بعد دفع التغييرات، يجب تفعيل GitHub Pages يدويًا:"
Write-Host "1. اذهب إلى مستودعك على GitHub"
Write-Host "2. انقر على Settings"
Write-Host "3. في القائمة اليسرى، انقر على Pages"
Write-Host "4. في قسم Build and deployment، تحت Source، اختر GitHub Actions"
Write-Host "5. احفظ التغييرات"
Write-Host ""

Write-Host "الخطوة 5: مراقبة سير العمل" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow
Write-Host "بعد تفعيل GitHub Pages:"
Write-Host "1. انقر على تبويب Actions في مستودعك"
Write-Host "2. يجب أن ترى سير عمل Deploy to GitHub Pages قيد التنفيذ"
Write-Host "3. انتظر حتى يكتمل التنفيذ"
Write-Host "4. بعد اكتمال التنفيذ، سيتم نشر موقعك على GitHub Pages"
Write-Host "5. يمكنك الوصول إلى موقعك عبر الرابط: https://zedanazad43.github.io/stp/"
Write-Host ""

Write-Host "ملاحظات مهمة:" -ForegroundColor Yellow
Write-Host "---------------" -ForegroundColor Yellow
Write-Host "- تأكد من أنك تستخدم الفرع الصحيح (main/master)" -ForegroundColor White
Write-Host "- إذا واجهت مشاكل في المصادقة، قد تحتاج إلى إعادة تعيينها" -ForegroundColor White
Write-Host "- تأكد من أن المشروع يحتوي على ملفات HTML أو أن سير العمل سيقوم بإنشاءها" -ForegroundColor White
Write-Host "- قد يستغرق النشر بضع دقائق" -ForegroundColor White
Write-Host "- إذا استمرت المشكلة، جرب استخدام: git push --force-with-lease origin main" -ForegroundColor White
