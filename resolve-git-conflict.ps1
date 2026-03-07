
# دليل لحل مشكلة الرفض عند دفع التغييرات إلى GitHub

Write-Host "دليل لحل مشكلة الرفض عند دفع التغييرات إلى GitHub" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

Write-Host "المشكلة: تم رفض التغييرات لأن فرعك محدث عن الفرع البعيد" -ForegroundColor Yellow
Write-Host "الحل: دمج التغييرات البعيدة مع التغييرات المحلية" -ForegroundColor Yellow
Write-Host ""

Write-Host "الخطوة 1: سحب التغييرات من المستودع البعيد" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow
Write-Host "استخدم الأمر التالي لسحب التغييرات من GitHub:"
Write-Host "git pull origin main"
Write-Host ""

Write-Host "الخطوة 2: حل أي تعارضات قد تحدث" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "إذا ظهرت رسائل تعارض (conflict):"
Write-Host "1. افتح الملفات المذكورة في رسالة التعارض"
Write-Host "2. ابحث عن علامات التعارض (<<<<<<<, =======, >>>>>>>)"
Write-3. حل التعارضات يدويًا وحفظ الملفات
Write-4. أضف الملفات التي تم حل تعارضاتها:"
Write-Host "   git add <file-name>"
Write-5. أكمل عملية الـ merge:"
Write-Host "   git commit"
Write-Host ""

Write-Host "الخطوة 3: دفع التغييرات المدمجة إلى GitHub" -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Yellow
Write-Host "بعد حل أي تعارضات، قم بدفع التغييرات:"
Write-Host "git push origin main"
Write-Host ""

Write-Host "بدلاً من ذلك، يمكنك استخدام force push (لكنه قد يسبب فقدان التغييرات البعيدة):" -ForegroundColor Yellow
Write-Host "git push --force-with-lease origin main" -ForegroundColor White
Write-Host ""

Write-Host "ملاحظة: force push يجب استخدامه بحذر فقط إذا كنت متأكدًا أن لا أحد آخر يعمل على نفس الفرع" -ForegroundColor Yellow
