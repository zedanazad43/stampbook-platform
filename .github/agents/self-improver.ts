/**
 * self-improver.ts
 * محرك التحسين الذاتي - يحلل الأداء ويطور نفسه تلقائياً
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { AgentOrchestrator } from './orchestrator';
import { MemorySystem } from './memory';
import { AgentEvolution, EvolutionImprovement, PerformanceMetrics } from './types';
import { v4 as uuidv4 } from 'uuid';

export class SelfImprover {
    private orchestrator: AgentOrchestrator;
    private memory: MemorySystem;
    private evolutionPath: string;
    private agentFilePath: string;

    constructor(
        orchestrator: AgentOrchestrator,
        evolutionPath: string = './memory/evolution',
        agentFilePath: string = '../.github/agents/self-evolving-agent.agent.md'
    ) {
        this.orchestrator = orchestrator;
        this.memory = orchestrator.getMemory();
        this.evolutionPath = evolutionPath;
        this.agentFilePath = agentFilePath;
        fs.ensureDirSync(evolutionPath);
    }

    // ========== تشغيل دورة التحسين الذاتي ==========
    async runEvolutionCycle(): Promise<AgentEvolution> {
        console.log('\n🔄 بدء دورة التحسين الذاتي...\n');

        const metrics = this.memory.getPerformanceMetrics();
        const improvements: EvolutionImprovement[] = [];

        // 1. تحليل الأخطاء المتكررة
        const errorImprovements = await this.analyzeErrors(metrics);
        improvements.push(...errorImprovements);

        // 2. تحسين ترتيب المزودين حسب الأداء
        const providerImprovements = this.analyzeProviderPerformance(metrics);
        improvements.push(...providerImprovements);

        // 3. اكتشاف الأنماط الناجحة
        const patternImprovements = await this.discoverSuccessPatterns(metrics);
        improvements.push(...patternImprovements);

        // 4. توليد تحسينات بالذكاء الاصطناعي
        if (metrics.totalRequests >= 10) {
            const aiImprovements = await this.generateAIImprovements(metrics, improvements);
            improvements.push(...aiImprovements);
        }

        // 5. تطبيق التحسينات
        const applied = await this.applyImprovements(improvements);

        const evolution: AgentEvolution = {
            version: this.generateVersion(),
            timestamp: new Date(),
            improvements: applied,
            performanceMetrics: metrics,
            nextEvolutionScheduled: new Date(Date.now() + 60 * 60 * 1000) // بعد ساعة
        };

        // حفظ سجل التطور
        await this.saveEvolutionRecord(evolution);

        console.log(`\n✅ اكتملت دورة التحسين الذاتي`);
        console.log(`📈 التحسينات المطبقة: ${applied.length}`);
        console.log(`📊 معدل النجاح: ${(metrics.successRate * 100).toFixed(1)}%`);

        return evolution;
    }

    // ========== تحليل الأخطاء ==========
    private async analyzeErrors(metrics: PerformanceMetrics): Promise<EvolutionImprovement[]> {
        const improvements: EvolutionImprovement[] = [];

        // البحث عن درسوس الأخطاء في الذاكرة
        const errorLessons = this.memory.search('خطأ error فشل failed', 10);

        if (errorLessons.length > 0) {
            // تجميع الأخطاء المتكررة
            const errorCounts = new Map<string, number>();
            for (const lesson of errorLessons) {
                const key = lesson.metadata['errorType'] as string ?? 'unknown';
                errorCounts.set(key, (errorCounts.get(key) ?? 0) + 1);
            }

            for (const [errorType, count] of errorCounts) {
                if (count >= 2) {
                    improvements.push({
                        area: 'error-handling',
                        before: `عدم معالجة ${errorType} بكفاءة`,
                        after: `تجنب ${errorType} تلقائياً والانتقال لمزود بديل`,
                        reason: `حدث ${count} مرات في السجل`,
                        impactScore: Math.min(count * 0.1, 0.9)
                    });
                }
            }
        }

        return improvements;
    }

    // ========== تحليل أداء المزودين ==========
    private analyzeProviderPerformance(metrics: PerformanceMetrics): EvolutionImprovement[] {
        const improvements: EvolutionImprovement[] = [];
        const { providerUsage, taskTypeSuccess } = metrics;

        // أفضل مزودين
        const topProviders = Object.entries(providerUsage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name]) => name);

        if (topProviders.length > 0) {
            improvements.push({
                area: 'provider-selection',
                before: 'ترتيب المزودين ثابت',
                after: `تفضيل: ${topProviders.join(' > ')} بناءً على بيانات الأداء الفعلي`,
                reason: `بيانات من ${metrics.totalRequests} طلب`,
                impactScore: 0.7
            });
        }

        return improvements;
    }

    // ========== اكتشاف الأنماط الناجحة ==========
    private async discoverSuccessPatterns(metrics: PerformanceMetrics): Promise<EvolutionImprovement[]> {
        const improvements: EvolutionImprovement[] = [];
        const successPatterns = this.memory.search('نمط ناجح success-pattern', 10);

        if (successPatterns.length >= 3) {
            improvements.push({
                area: 'task-routing',
                before: 'توجيه المهام بناءً على قواعد ثابتة',
                after: 'توجيه ديناميكي بناءً على أنماط النجاح الفعلية',
                reason: `اكتشاف ${successPatterns.length} نمط نجاح`,
                impactScore: 0.65
            });
        }

        return improvements;
    }

    // ========== توليد تحسينات بالذكاء الاصطناعي ==========
    private async generateAIImprovements(
        metrics: PerformanceMetrics,
        currentImprovements: EvolutionImprovement[]
    ): Promise<EvolutionImprovement[]> {
        try {
            const prompt = `
أنت محلل أداء لنظام وكيل ذكاء اصطناعي. حلل هذه المقاييس واقترح 3 تحسينات ملموسة:

**مقاييس الأداء:**
- إجمالي الطلبات: ${metrics.totalRequests}
- معدل النجاح: ${(metrics.successRate * 100).toFixed(1)}%
- متوسط وقت الاستجابة: ${Math.round(metrics.avgLatencyMs)}ms
- أكثر المزودين استخداماً: ${JSON.stringify(metrics.providerUsage)}
- نجاح حسب نوع المهمة: ${JSON.stringify(metrics.taskTypeSuccess)}

**التحسينات المقترحة حتى الآن:**
${currentImprovements.map(i => `- ${i.area}: ${i.after}`).join('\n')}

أجب بـ JSON فقط بهذا الشكل:
[
  {"area": "string", "before": "string", "after": "string", "reason": "string", "impactScore": 0.0-1.0}
]
`;

            const response = await this.orchestrator.execute(prompt, 'analysis', {
                temperature: 0.3,
                maxTokens: 1024
            });

            if (response.success) {
                const jsonMatch = response.result.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]) as EvolutionImprovement[];
                }
            }
        } catch {
            // تجاهل أخطاء توليد التحسينات
        }
        return [];
    }

    // ========== تطبيق التحسينات ==========
    private async applyImprovements(improvements: EvolutionImprovement[]): Promise<EvolutionImprovement[]> {
        const applied: EvolutionImprovement[] = [];

        // حفظ التحسينات في الذاكرة
        for (const improvement of improvements) {
            if (improvement.impactScore >= 0.5) {
                await this.memory.remember(
                    'agent-improvement',
                    `[${improvement.area}] ${improvement.after} - السبب: ${improvement.reason}`,
                    improvement as unknown as Record<string, unknown>,
                    ['improvement', improvement.area],
                    improvement.impactScore
                );
                applied.push(improvement);
            }
        }

        // تحديث ملف الوكيل إذا كان موجوداً
        await this.updateAgentFile(applied);

        return applied;
    }

    // ========== تحديث ملف الوكيل ==========
    private async updateAgentFile(improvements: EvolutionImprovement[]): Promise<void> {
        try {
            const agentFile = path.resolve(__dirname, '..', '..', '.github', 'agents', 'self-evolving-agent.agent.md');
            if (!fs.existsSync(agentFile)) return;

            let content = await fs.readFile(agentFile, 'utf-8');
            const metrics = this.memory.getPerformanceMetrics();
            const now = new Date().toISOString();

            // تحديث قسم الأداء
            const performanceSection = `
## 📊 آخر تحديث ذاتي: ${now}
- معدل النجاح: ${(metrics.successRate * 100).toFixed(1)}%
- إجمالي الطلبات: ${metrics.totalRequests}
- متوسط الاستجابة: ${Math.round(metrics.avgLatencyMs)}ms
- أحدث تحسين: ${improvements[0]?.after ?? 'لا يوجد'}
`;

            // استبدل أو أضف قسم الأداء
            if (content.includes('## 📊 آخر تحديث ذاتي')) {
                content = content.replace(/## 📊 آخر تحديث ذاتي[\s\S]*?(?=##|$)/, performanceSection + '\n');
            } else {
                content += '\n' + performanceSection;
            }

            await fs.writeFile(agentFile, content, 'utf-8');
            console.log('📝 تم تحديث ملف الوكيل بالتحسينات الجديدة');
        } catch {
            // تجاهل أخطاء تحديث الملف
        }
    }

    // ========== حفظ سجل التطور ==========
    private async saveEvolutionRecord(evolution: AgentEvolution): Promise<void> {
        const filename = `evolution-${evolution.version}.json`;
        const filePath = path.join(this.evolutionPath, filename);
        await fs.writeJson(filePath, evolution, { spaces: 2 });

        // تحديث سجل التطور الرئيسي
        const summaryPath = path.join(this.evolutionPath, 'evolution-history.jsonl');
        const summary = {
            version: evolution.version,
            timestamp: evolution.timestamp,
            improvementsCount: evolution.improvements.length,
            successRate: evolution.performanceMetrics.successRate,
            totalRequests: evolution.performanceMetrics.totalRequests
        };
        await fs.appendFile(summaryPath, JSON.stringify(summary) + '\n', 'utf-8');
    }

    // ========== توليد رقم إصدار ==========
    private generateVersion(): string {
        const now = new Date();
        return `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    }

    // ========== تشغيل دوري ==========
    async startPeriodicEvolution(intervalMinutes: number = 60): Promise<void> {
        console.log(`⏰ التحسين الذاتي الدوري كل ${intervalMinutes} دقيقة - بدأ`);

        const run = async () => {
            try {
                await this.runEvolutionCycle();
            } catch (err) {
                console.error('خطأ في دورة التحسين:', err);
            }
        };

        // تشغيل فوري
        await run();

        // تشغيل دوري
        setInterval(run, intervalMinutes * 60 * 1000);
    }

    // ========== تقرير التطور ==========
    async getEvolutionReport(): Promise<string> {
        const historyFile = path.join(this.evolutionPath, 'evolution-history.jsonl');
        let history: unknown[] = [];

        if (fs.existsSync(historyFile)) {
            const lines = (await fs.readFile(historyFile, 'utf-8')).split('\n').filter(Boolean);
            history = lines.slice(-10).map(l => JSON.parse(l));
        }

        const metrics = this.memory.getPerformanceMetrics();

        return `
# 📈 تقرير التطور الذاتي

## المقاييس الحالية
- **إجمالي الطلبات:** ${metrics.totalRequests}
- **معدل النجاح:** ${(metrics.successRate * 100).toFixed(1)}%
- **متوسط وقت الاستجابة:** ${Math.round(metrics.avgLatencyMs)}ms
- **أحداث التعلم:** ${metrics.learningEvents}

## توزيع المزودين
${Object.entries(metrics.providerUsage).map(([p, c]) => `- ${p}: ${c} طلب`).join('\n')}

## آخر 10 دورات تطور
${history.map((h: unknown) => {
            const ev = h as { version: string; timestamp: string; improvementsCount: number; successRate: number };
            return `- **v${ev.version}** (${new Date(ev.timestamp).toLocaleDateString('ar')}) - ${ev.improvementsCount} تحسين - نجاح ${(ev.successRate * 100).toFixed(1)}%`;
        }).join('\n')}
`;
    }
}
