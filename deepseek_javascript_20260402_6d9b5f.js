// حفظ هذا في ملف deploy.js
await fetch("https://raw.githubusercontent.com/zedanazad43/stp/main/scripts/deploy.js")
    .then(r => r.text())
    .then(eval);