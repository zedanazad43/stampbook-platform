/**
 * index.ts
 * واجهة تفاعلية للوكيل الذاتي التطوير
 */

import * as readline from 'readline';
import * as dotenv from 'dotenv';
import { AgentOrchestrator } from './orchestrator';
import { SelfImprover } from './self-improver';
import { TaskType } from './types';

dotenv.config();

// ========== رسالة الترحيب ==========
function printWelcome() {
    console.log('\n' + '═'.repeat(60));
    console.log('🤖 الوكيل الذاتي التطوير - متعدد الذكاء الاصطناعي');
    console.log('   Self-Evolving Multi-AI Agent System v1.0');
    console.log('═'.repeat(60));
    console.log('\n📋 الأوامر المتاحة:');
    console.log('  /providers   - عرض المزودين النشطين');
    console.log('  /stats       - إحصاءات الأداء');
    console.log('  /evolve      - تشغيل دورة التحسين الذاتي');
    console.log('  /report      - تقرير التطور');
    console.log('  /memory      - عرض الذاكرة القصيرة');
    console.log('  /parallel    - تنفيذ موازي مع جميع المزودين');
    console.log('  /mode <نوع>  - تغيير نوع المهمة (coding/analysis/research...)');
    console.log('  /free        - استخدام المزودين المجانيين فقط');
    console.log('  /help        - هذه المساعدة');
    console.log('  /exit        - الخروج\n');
}

// ========== تحديد نوع المهمة تلقائياً ==========
function detectTaskType(task: string): TaskType {
    const lower = task.toLowerCase();

    if (lower.match(/كود|برمجة|code|function|class|bug|error|debug|typescript|javascript|python/))
        return 'coding';
    if (lower.match(/ابحث|بحث|اعثر|search|find|latest|أحدث|جديد/))
        return 'research';
    if (lower.match(/حلل|تحليل|analyze|compare|مقارنة/))
        return 'analysis';
    if (lower.match(/اكتب|write|essay|مقال|ملخص|summarize/))
        return 'writing';
    if (lower.match(/ترجم|translate|translation/))
        return 'translation';
    if (lower.match(/لخص|summarize|خلاصة/))
        return 'summarization';
    if (lower.match(/احسب|حساب|math|رياضيات|equation|معادلة/))
        return 'math';
    if (lower.match(/فكر|استدل|reason|منطق|logic/))
        return 'reasoning';

    return 'general';
}

// ========== الوظيفة الرئيسية ==========
async function main() {
    const orchestrator = new AgentOrchestrator({
        strategy: 'adaptive',
        fallbackEnabled: true,
        parallelRequests: true,
        maxParallel: 3,
        memoryEnabled: true,
        selfImprovementEnabled: true
    });

    const improver = new SelfImprover(orchestrator);

    printWelcome();

    // عرض المزودين النشطين
    const providers = orchestrator.getActiveProviders();
    if (providers.length === 0) {
        console.log('⚠️  لا يوجد مزودون نشطون!');
        console.log('   انسخ .env.example إلى .env وأضف مفاتيح API');
        console.log('   على الأقل أضف: GEMINI_API_KEY أو GROQ_API_KEY (مجانيان)\n');
    } else {
        console.log('🌐 المزودون النشطون:');
        providers.forEach(p => console.log(`   ${p}`));
        console.log();
    }

    // تشغيل التحسين الذاتي الدوري إذا كان مفعلاً
    if (process.env.AUTO_SELF_IMPROVE === 'true') {
        const interval = parseInt(process.env.SELF_IMPROVE_INTERVAL ?? '60');
        improver.startPeriodicEvolution(interval).catch(console.error);
    }

    // واجهة المستخدم التفاعلية
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    let currentTaskType: TaskType = 'general';
    let freeOnly = false;

    const prompt = () => rl.question('🤖 أدخل مهمتك: ', async (input) => {
        const trimmed = input.trim();
        if (!trimmed) { prompt(); return; }

        // معالجة الأوامر
        if (trimmed.startsWith('/')) {
            const [cmd, ...args] = trimmed.split(' ');

            switch (cmd) {
                case '/exit':
                case '/quit':
                    console.log('\n👋 وداعاً! تم حفظ جميع البيانات.\n');
                    rl.close();
                    process.exit(0);
                    return;

                case '/providers':
                    console.log('\n🌐 المزودون النشطون:');
                    orchestrator.getActiveProviders().forEach(p => console.log(`  ${p}`));
                    console.log();
                    break;

                case '/stats': {
                    const stats = orchestrator.getStats();
                    console.log('\n📊 إحصاءات الأداء:');
                    console.log(JSON.stringify(stats, null, 2));
                    console.log();
                    break;
                }

                case '/evolve':
                    await improver.runEvolutionCycle();
                    break;

                case '/report': {
                    const report = await improver.getEvolutionReport();
                    console.log(report);
                    break;
                }

                case '/memory': {
                    const mem = await orchestrator.getMemory().exportMemory();
                    const data = JSON.parse(mem);
                    console.log('\n🧠 الذاكرة القصيرة:');
                    console.log(`  إدخالات: ${data.shortTermEntries}`);
                    console.log(`  سجلات التعلم: ${data.learningRecords}`);
                    console.log('\nأحدث الذكريات:');
                    (data.recentMemories as Array<{ type: string; content: string; importance: number }>)
                        .slice(0, 5)
                        .forEach((m, i) => {
                            console.log(`  ${i + 1}. [${m.type}] ${m.content.slice(0, 100)}... (أهمية: ${m.importance})`);
                        });
                    console.log();
                    break;
                }

                case '/parallel': {
                    const task = args.join(' ');
                    if (!task) { console.log('⚠️ أدخل المهمة بعد /parallel'); break; }
                    const result = await orchestrator.executeParallel(
                        task, currentTaskType,
                        ['gemini', 'groq', 'openai', 'anthropic'].filter(Boolean),
                        'merge'
                    );
                    console.log('\n📊 نتائج موازية:');
                    console.log(result.result);
                    console.log(`\n⏱️ الوقت: ${result.latencyMs}ms | المزود: ${result.provider}\n`);
                    break;
                }

                case '/mode': {
                    const newMode = args[0] as TaskType;
                    const validModes: TaskType[] = ['coding', 'analysis', 'research', 'writing', 'reasoning', 'math', 'translation', 'summarization', 'general'];
                    if (validModes.includes(newMode)) {
                        currentTaskType = newMode;
                        console.log(`✅ تم تغيير النمط إلى: ${currentTaskType}\n`);
                    } else {
                        console.log(`⚠️ نمط غير صحيح. الأنماط المتاحة: ${validModes.join(', ')}\n`);
                    }
                    break;
                }

                case '/free':
                    freeOnly = !freeOnly;
                    console.log(`${freeOnly ? '🆓 المزودون المجانيون فقط' : '💰 جميع المزودين'}\n`);
                    break;

                case '/help':
                    printWelcome();
                    break;

                default:
                    console.log(`❓ أمر غير معروف: ${cmd}\n`);
            }

            prompt();
            return;
        }

        // تحديد نوع المهمة تلقائياً
        const autoType = detectTaskType(trimmed);
        if (autoType !== 'general') {
            currentTaskType = autoType;
        }

        console.log(`\n🔍 نوع المهمة: ${currentTaskType} | جاري المعالجة...\n`);

        const start = Date.now();
        const response = await orchestrator.execute(trimmed, currentTaskType, {
            preferredProviders: freeOnly
                ? ['gemini', 'groq', 'cohere', 'huggingface', 'ollama']
                : undefined
        });

        if (response.success) {
            console.log('─'.repeat(60));
            console.log(response.result);
            console.log('─'.repeat(60));
            console.log(`\n✅ المزود: ${response.provider} | النموذج: ${response.model}`);
            console.log(`⏱️ الوقت: ${response.latencyMs}ms | الرموز: ${JSON.stringify(response.tokensUsed)}`);
            if (response.cost !== undefined && response.cost > 0) {
                console.log(`💰 التكلفة: $${response.cost.toFixed(6)}`);
            }

            // اطلب التغذية الراجعة
            rl.question('\n💬 هل كانت النتيجة جيدة؟ (y/n/skip): ', async (feedback) => {
                const fb = feedback.trim().toLowerCase();
                if (fb === 'y' || fb === 'yes') {
                    await orchestrator.getMemory().learnFrom(
                        { id: response.requestId, task: trimmed, taskType: currentTaskType, timestamp: new Date() },
                        response,
                        'positive'
                    );
                    console.log('👍 شكراً! تم تسجيل التغذية الراجعة الإيجابية\n');
                } else if (fb === 'n' || fb === 'no') {
                    await orchestrator.getMemory().learnFrom(
                        { id: response.requestId, task: trimmed, taskType: currentTaskType, timestamp: new Date() },
                        response,
                        'negative'
                    );
                    console.log('👎 شكراً! تم تسجيل التغذية الراجعة السلبية - سيتعلم الوكيل منها\n');
                } else {
                    console.log();
                }
                prompt();
            });
            return;
        } else {
            console.log(`\n❌ فشل: ${response.error}\n`);
            console.log('💡 نصيحة: تأكد من إضافة مفاتيح API في ملف .env\n');
        }

        prompt();
    });

    prompt();
}

main().catch(console.error);
