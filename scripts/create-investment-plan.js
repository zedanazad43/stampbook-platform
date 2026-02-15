const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createInvestmentPlan(options) {
  try {
    console.log('جاري إنشاء خطة الاستثمار...');

    // قراءة معلمات الخطة من سطر الأوامر
    const { miningReward, generationRate, investmentOptions } = options;

    // تحليل خيارات الاستثمار
    const optionsArray = investmentOptions.split(',');

    // إنشاء بيانات الخطة
    const investmentPlan = {
      name: 'خطة استثمار ستامكوين',
      description: 'خطة استثمار متعددة المراحل للتعدين والتوليد والاستثمار في عملة ستامكوين',
      createdAt: new Date().toISOString(),
      parameters: {
        miningReward: parseFloat(miningReward) || 0.5,
        generationRate: parseFloat(generationRate) || 0.2,
        investmentOptions: optionsArray
      },
      phases: [
        {
          name: 'مرحلة التعدين',
          duration: '6 أشهر',
          description: 'التركيز على تعدين عملة ستامكوين وزيادة القاعدة',
          objectives: [
            'زيادة عدد المستخدمين النشطين',
            'تعزيز أمان الشبكة',
            'زيادة الكتلة'
          ],
          metrics: [
            'عدد المعاملات اليومية',
            'حجم التعدين',
            'عدد المستخدمين الجدد'
          ],
          rewards: [
            'مكافأة تعدين أولية: 0.5 STP لكل كتلة',
            'مكافأة إحالة: 10% من عمليات الإحالة'
          ]
        },
        {
          name: 'مرحلة التوليد',
          duration: '12 شهر',
          description: 'زيادة توليد عملة ستامكوين وتطبيق آليات الاحتراز',
          objectives: [
            'تنفيذ آلية الاحتراز',
            'زيادة السيولة',
            'تقليل التقلب'
          ],
          metrics: [
            'معدل التوليد',
            'حجم السيولة',
            'مستوى التقلب'
          ],
          rewards: [
            'مكافأة توليد: 0.2 STP لكل معاملة',
            'مكافأة الاحتفاظ: 5% لكل 30 يوم من الاحتفاظ بالعملات'
          ]
        },
        {
          name: 'مرحلة الاستثمار',
          duration: '18 شهر',
          description: 'تطبيق آليات الاستثمار المتقدمة وتنمية البيئة',
          objectives: [
            'تنمية نظام القروض',
            'زيادة الشراكات',
            'تطبيق آلية التصويت'
          ],
          metrics: [
            'حجم القروض',
            'عدد الشراكات',
            'مشاركة التصويت'
          ],
          rewards: [
            'مكافأة القروض: 15% من الأرباح',
            'مكافأة الشراكات: 20% من إيرادات الشراكة',
            'مكافأة التصويت: 5 STP لكل تصويت'
          ]
        }
      ],
      investmentOptions: optionsArray.map(option => ({
        name: option.trim(),
        duration: option.includes('short-term') ? '3 أشهر' : 
                 option.includes('medium-term') ? '6 أشهر' : '12 شهر',
        minInvestment: option.includes('short-term') ? 100 : 
                      option.includes('medium-term') ? 500 : 1000,
        maxInvestment: option.includes('short-term') ? 1000 : 
                      option.includes('medium-term') ? 5000 : 10000,
        returnRate: option.includes('short-term') ? 10 : 
                   option.includes('medium-term') ? 15 : 25,
        description: option.includes('short-term') ? 'استثمار قصير الأجل بأقل مخاطرة' :
                    option.includes('medium-term') ? 'استثمار متوسط الأجل بمخاطرة متوسطة' :
                    'استثمار طويل الأجل بأعلى عائد'
      }))
    };

    // حفظ الخطة في ملف
    const planPath = path.join(__dirname, '../investment-plan.json');
    fs.writeFileSync(planPath, JSON.stringify(investmentPlan, null, 2));

    console.log(`تم إنشاء خطة الاستثمار بنجاح في ${planPath}`);
    return { success: true, planPath };
  } catch (error) {
    console.error('خطأ في إنشاء خطة الاستثمار:', error);
    return { success: false, message: error.message };
  }
}

// استدعاء الدالة مع معلمات من سطر الأوامر
const options = {
  miningReward: process.argv[2] || '0.5',
  generationRate: process.argv[3] || '0.2',
  investmentOptions: process.argv[4] || 'short-term,medium-term,long-term'
};

createInvestmentPlan(options)
  .then(result => {
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('حدث خطأ:', error);
    process.exit(1);
  });
