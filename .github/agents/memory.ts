/**
 * memory.ts
 * نظام الذاكرة المستمرة والتعلم من الأخطاء
 * Persistent Memory & Learning System
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
    MemoryEntry, MemoryType, LearningRecord,
    AgentRequest, AgentResponse, PerformanceMetrics
} from './types';

export class MemorySystem {
    private memoryPath: string;
    private shortTermMemory: MemoryEntry[] = [];
    private learningLog: LearningRecord[] = [];
    private readonly MAX_SHORT_TERM = 50;

    constructor(memoryPath: string = './memory') {
        this.memoryPath = memoryPath;
        this.ensureDirectories();
        this.loadFromDisk();
    }

    // ========== تأسيس المجلدات ==========
    private ensureDirectories(): void {
        fs.ensureDirSync(this.memoryPath);
        fs.ensureDirSync(path.join(this.memoryPath, 'long-term'));
        fs.ensureDirSync(path.join(this.memoryPath, 'sessions'));
        fs.ensureDirSync(path.join(this.memoryPath, 'evolution'));
        fs.ensureDirSync(path.join(this.memoryPath, 'errors'));
    }

    // ========== تحميل من القرص ==========
    private loadFromDisk(): void {
        try {
            const shortTermFile = path.join(this.memoryPath, 'short-term.json');
            if (fs.existsSync(shortTermFile)) {
                const data = fs.readJsonSync(shortTermFile);
                this.shortTermMemory = data.entries ?? [];
            }

            const learningFile = path.join(this.memoryPath, 'learning-log.jsonl');
            if (fs.existsSync(learningFile)) {
                const lines = fs.readFileSync(learningFile, 'utf-8').split('\n').filter(Boolean);
                this.learningLog = lines.slice(-1000).map(l => JSON.parse(l));
            }
        } catch {
            // تجاهل الأخطاء عند التحميل الأول
        }
    }

    // ========== حفظ إلى القرص ==========
    private async saveToDisk(): Promise<void> {
        const shortTermFile = path.join(this.memoryPath, 'short-term.json');
        await fs.writeJson(shortTermFile, {
            entries: this.shortTermMemory,
            lastUpdated: new Date().toISOString(),
            count: this.shortTermMemory.length
        }, { spaces: 2 });
    }

    // ========== إضافة ذاكرة جديدة ==========
    async remember(
        type: MemoryType,
        content: string,
        metadata: Record<string, unknown> = {},
        tags: string[] = [],
        importance: number = 0.5
    ): Promise<MemoryEntry> {
        const entry: MemoryEntry = {
            id: uuidv4(),
            type,
            content,
            metadata,
            tags,
            importance,
            timestamp: new Date(),
            lastAccessed: new Date(),
            accessCount: 0
        };

        // أضف للذاكرة القصيرة
        this.shortTermMemory.unshift(entry);
        if (this.shortTermMemory.length > this.MAX_SHORT_TERM) {
            // انقل الأقدم إلى الذاكرة الطويلة
            const old = this.shortTermMemory.splice(this.MAX_SHORT_TERM);
            await this.archiveToLongTerm(old);
        }

        await this.saveToDisk();

        // إذا كانت مهمة جداً، احفظها في الطويلة أيضاً
        if (importance >= 0.8) {
            await this.archiveToLongTerm([entry]);
        }

        return entry;
    }

    // ========== أرشفة إلى الذاكرة طويلة المدى ==========
    private async archiveToLongTerm(entries: MemoryEntry[]): Promise<void> {
        const date = new Date().toISOString().split('T')[0];
        const file = path.join(this.memoryPath, 'long-term', `${date}.jsonl`);
        const lines = entries.map(e => JSON.stringify(e)).join('\n') + '\n';
        await fs.appendFile(file, lines, 'utf-8');
    }

    // ========== بحث في الذاكرة ==========
    search(query: string, limit: number = 5): MemoryEntry[] {
        const queryLower = query.toLowerCase();
        return this.shortTermMemory
            .filter(m => {
                const score = (
                    (m.content.toLowerCase().includes(queryLower) ? 2 : 0) +
                    (m.tags.some(t => t.toLowerCase().includes(queryLower)) ? 1 : 0)
                );
                return score > 0;
            })
            .sort((a, b) => {
                // ترتيب حسب الأهمية مضروبة في حداثة الوصول
                const aScore = a.importance * (1 / (Date.now() - new Date(a.lastAccessed).getTime() + 1));
                const bScore = b.importance * (1 / (Date.now() - new Date(b.lastAccessed).getTime() + 1));
                return bScore - aScore;
            })
            .slice(0, limit)
            .map(m => {
                m.lastAccessed = new Date();
                m.accessCount++;
                return m;
            });
    }

    // ========== تسجيل حدث التعلم ==========
    async learnFrom(
        request: AgentRequest,
        response: AgentResponse,
        userFeedback?: 'positive' | 'negative' | 'neutral'
    ): Promise<void> {
        const record: LearningRecord = {
            id: uuidv4(),
            sessionId: request.id,
            taskType: request.taskType,
            provider: response.provider,
            model: response.model,
            success: response.success,
            errorType: response.success ? undefined : this.classifyError(response.error ?? ''),
            errorMessage: response.error,
            latencyMs: response.latencyMs,
            userFeedback,
            timestamp: new Date()
        };

        // استخلاص الدرس
        if (!response.success) {
            record.lesson = this.extractLesson(record);
            await this.remember(
                'error-lesson',
                `[${response.provider}] ${record.errorType}: ${record.lesson}`,
                { provider: response.provider, errorType: record.errorType, model: response.model },
                ['error', response.provider, record.errorType ?? 'unknown'],
                0.85
            );
        } else if (userFeedback === 'positive') {
            await this.remember(
                'success-pattern',
                `نمط ناجح: ${request.taskType} -> ${response.provider}/${response.model} (${response.latencyMs}ms)`,
                { provider: response.provider, model: response.model, taskType: request.taskType },
                ['success', response.provider, request.taskType],
                0.75
            );
        }

        // أضف للسجل
        this.learningLog.push(record);
        const logFile = path.join(this.memoryPath, 'learning-log.jsonl');
        await fs.appendFile(logFile, JSON.stringify(record) + '\n', 'utf-8');
    }

    // ========== تصنيف الخأ ==========
    private classifyError(error: string): string {
        if (error.includes('rate limit') || error.includes('429')) return 'rate-limit';
        if (error.includes('401') || error.includes('unauthorized')) return 'auth-error';
        if (error.includes('timeout') || error.includes('ETIMEDOUT')) return 'timeout';
        if (error.includes('network') || error.includes('ECONNREFUSED')) return 'network-error';
        if (error.includes('quota') || error.includes('exceeded')) return 'quota-exceeded';
        if (error.includes('model') && error.includes('not found')) return 'model-not-found';
        return 'unknown-error';
    }

    // ========== استخلاص الدرس ==========
    private extractLesson(record: LearningRecord): string {
        const lessons: Record<string, string> = {
            'rate-limit': `استخدم ${record.provider} بتأخير أو انتقل لمزود آخر عند الحد`,
            'auth-error': `مفتاح API لـ ${record.provider} غير صحيح أو منتهي`,
            'timeout': `${record.provider} بطيء جداً (${record.latencyMs}ms) - استخدم نموذجاً أسرع`,
            'network-error': `مشكلة اتصال مع ${record.provider} - تأكد من الإنترنت`,
            'quota-exceeded': `استنفدت حصة ${record.provider} - انتقل لمزود آخر`,
            'model-not-found': `النموذج المطلوب غير موجود في ${record.provider}`
        };
        return lessons[record.errorType ?? ''] ?? `خطأ غير معروف في ${record.provider}`;
    }

    // ========== إحصاءات الأداء ==========
    getPerformanceMetrics(): PerformanceMetrics {
        const total = this.learningLog.length;
        const successful = this.learningLog.filter(r => r.success).length;
        const providerUsage: Record<string, number> = {};
        const taskTypeSuccess: Record<string, number> = {};
        let totalLatency = 0;

        for (const r of this.learningLog) {
            providerUsage[r.provider] = (providerUsage[r.provider] ?? 0) + 1;
            if (r.success) {
                const key = r.taskType;
                taskTypeSuccess[key] = (taskTypeSuccess[key] ?? 0) + 1;
                totalLatency += r.latencyMs;
            }
        }

        return {
            totalRequests: total,
            successRate: total > 0 ? successful / total : 0,
            avgLatencyMs: successful > 0 ? totalLatency / successful : 0,
            providerUsage,
            taskTypeSuccess,
            costTotal: 0,
            learningEvents: this.learningLog.filter(r => r.lesson).length
        };
    }

    // ========== بناء السياق للطلب ==========
    buildContextForRequest(task: string): string[] {
        const relevant = this.search(task, 5);
        return relevant.map(m => {
            const typeLabel = {
                'error-lesson': '⚠️ درس خطأ سابق',
                'success-pattern': '✅ نمط نجاح',
                'task-result': '📋 نتيجة مهمة سابقة',
                'learned-fact': '💡 معلومة مكتسبة',
                'user-preference': '👤 تفضيل المستخدم',
                'provider-performance': '📊 أداء المزود',
                'agent-improvement': '🔧 تحسين الوكيل'
            }[m.type] ?? '📝 ذاكرة';
            return `${typeLabel}: ${m.content}`;
        });
    }

    // ========== تصدير الذاكرة ==========
    async exportMemory(): Promise<string> {
        const metrics = this.getPerformanceMetrics();
        return JSON.stringify({
            shortTermEntries: this.shortTermMemory.length,
            learningRecords: this.learningLog.length,
            metrics,
            recentMemories: this.shortTermMemory.slice(0, 20),
            timestamp: new Date().toISOString()
        }, null, 2);
    }

    // ========== حفظ نتيجة المهمة ==========
    async saveTaskResult(request: AgentRequest, response: AgentResponse): Promise<void> {
        if (response.success && response.result.length > 50) {
            await this.remember(
                'task-result',
                `المهمة: ${request.task.slice(0, 200)}\nالنتيجة: ${response.result.slice(0, 500)}`,
                {
                    provider: response.provider,
                    model: response.model,
                    taskType: request.taskType,
                    latencyMs: response.latencyMs
                },
                [request.taskType, response.provider],
                0.6
            );
        }
    }
}
