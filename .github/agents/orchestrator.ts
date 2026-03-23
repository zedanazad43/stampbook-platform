/**
 * orchestrator.ts
 * الموزع الذكي - يختار أفضل مزود لكل مهمة ويدير الفشل والإعادة
 */

import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import {
    AgentRequest, AgentResponse, OrchestratorConfig,
    TaskType, PerformanceMetrics
} from './types';
import { AI_PROVIDERS, selectBestProvider } from './providers/registry';
import {
    callGemini, callGroq, callOpenAI, callAnthropic,
    callCohere, callMistral, callPerplexity, callDeepSeek,
    callXAI, callHuggingFace, callOllama, callTogether
} from './providers/adapters';
import { MemorySystem } from './memory';

dotenv.config();

export class AgentOrchestrator {
    private memory: MemorySystem;
    private config: OrchestratorConfig;
    private apiKeys: Record<string, string>;
    private providerMetrics: Map<string, { successes: number; failures: number; totalLatency: number }>;

    constructor(config?: Partial<OrchestratorConfig>) {
        this.config = {
            strategy: 'adaptive',
            fallbackEnabled: true,
            parallelRequests: false,
            maxParallel: 3,
            memoryEnabled: true,
            selfImprovementEnabled: true,
            providers: Object.keys(AI_PROVIDERS),
            ...config
        };

        this.memory = new MemorySystem(process.env.MEMORY_PATH ?? './memory');
        this.apiKeys = this.loadApiKeys();
        this.providerMetrics = new Map();
        this.initializeProviders();
    }

    // ========== تحميل مفاتيح API ==========
    private loadApiKeys(): Record<string, string> {
        return {
            gemini: process.env.GEMINI_API_KEY ?? '',
            groq: process.env.GROQ_API_KEY ?? '',
            openai: process.env.OPENAI_API_KEY ?? '',
            anthropic: process.env.ANTHROPIC_API_KEY ?? '',
            cohere: process.env.COHERE_API_KEY ?? '',
            mistral: process.env.MISTRAL_API_KEY ?? '',
            perplexity: process.env.PERPLEXITY_API_KEY ?? '',
            deepseek: process.env.DEEPSEEK_API_KEY ?? '',
            xai: process.env.XAI_API_KEY ?? '',
            huggingface: process.env.HUGGINGFACE_API_KEY ?? '',
            together: process.env.TOGETHER_API_KEY ?? ''
        };
    }

    private isUsableApiKey(value: string): boolean {
        const normalized = value.trim();
        if (!normalized) return false;
        const placeholders = ['your_api_key', 'YOUR_API_KEY', 'xxx', 'changeme'];
        return !placeholders.includes(normalized);
    }

    // ========== تهيئة المزودين ==========
    private initializeProviders(): void {
        // تفعيل المزودين الذين لديهم مفاتيح
        for (const [providerName, apiKey] of Object.entries(this.apiKeys)) {
            if (this.isUsableApiKey(apiKey) && AI_PROVIDERS[providerName]) {
                AI_PROVIDERS[providerName].available = true;
            }
        }

        // Ollama (لا يحتاج مفتاح)
        if (process.env.OLLAMA_ENABLED === 'true') {
            AI_PROVIDERS.ollama.available = true;
        }

        const available = Object.values(AI_PROVIDERS).filter(p => p.available).map(p => p.displayName);
        const free = Object.values(AI_PROVIDERS).filter(p => p.available && p.isFree).map(p => p.name);

        console.log(`\n🤖 الوكيل الذاتي التطوير - جاهز`);
        console.log(`✅ المزودون النشطون (${available.length}): ${available.join(', ')}`);
        console.log(`🆓 المجانيون: ${free.join(', ') || 'لا يوجد - أضف مفاتيح في .env'}`);
        console.log(`🧠 الذاكرة: نشطة`);
        console.log(`🔄 الاستراتيجية: ${this.config.strategy}\n`);
    }

    // ========== تنفيذ مهمة ==========
    async execute(
        task: string,
        taskType: TaskType = 'general',
        options: {
            preferredProviders?: string[];
            temperature?: number;
            maxTokens?: number;
            useMemory?: boolean;
        } = {}
    ): Promise<AgentResponse> {
        const request: AgentRequest = {
            id: uuidv4(),
            task,
            taskType,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            preferredProviders: options.preferredProviders,
            useMemory: options.useMemory !== false,
            timestamp: new Date()
        };

        // أضف السياق من الذاكرة
        if (request.useMemory && this.config.memoryEnabled) {
            const memContext = this.memory.buildContextForRequest(task);
            if (memContext.length > 0) {
                const contextStr = '\n\n---\n**سياق من الذاكرة:**\n' + memContext.join('\n');
                request.task = task + contextStr;
            }
        }

        // اختر أفضل مزود
        const orderedProviders = this.selectProviders(request);

        if (orderedProviders.length === 0) {
            console.error('❌ لا يوجد مزود نشط! أضف مفاتيح API في ملف .env');
            return {
                requestId: request.id,
                result: 'لا يوجد مزود ذكاء اصطناعي نشط. الرجاء إضافة مفاتيح API في ملف .env',
                provider: 'none',
                model: 'none',
                latencyMs: 0,
                success: false,
                error: 'no-providers-available',
                timestamp: new Date()
            };
        }

        // حاول مع كل مزود حسب الترتيب
        let lastResponse: AgentResponse | null = null;
        for (const providerName of orderedProviders) {
            console.log(`🔄 المحاولة مع: ${AI_PROVIDERS[providerName]?.displayName ?? providerName}`);
            lastResponse = await this.callProvider(providerName, request);

            if (lastResponse.success) {
                // تحديث المقاييس
                this.updateMetrics(providerName, true, lastResponse.latencyMs);

                // التعلم من النجاح
                await this.memory.learnFrom(request, lastResponse);
                await this.memory.saveTaskResult(request, lastResponse);

                console.log(`✅ نجح مع ${providerName} في ${lastResponse.latencyMs}ms`);
                return lastResponse;
            } else {
                this.updateMetrics(providerName, false, lastResponse.latencyMs);
                await this.memory.learnFrom(request, lastResponse);
                console.log(`❌ فشل مع ${providerName}: ${lastResponse.error}`);

                if (!this.config.fallbackEnabled) break;
            }
        }

        return lastResponse ?? {
            requestId: request.id,
            result: 'فشلت جميع المزودين المتاحين',
            provider: 'none', model: 'none',
            latencyMs: 0, success: false,
            error: 'all-providers-failed',
            timestamp: new Date()
        };
    }

    // ========== اختيار المزودين ==========
    private selectProviders(request: AgentRequest): string[] {
        // إذا كانت هناك تفضيلات محددة
        const preferred = request.preferredProviders?.filter(
            p => AI_PROVIDERS[p]?.available
        ) ?? [];

        // اختر بناءً على نوع المهمة
        const taskBestProviders = this.getTaskBestProviders(request.taskType);

        // اختر بناءً على الاستراتيجية
        const strategyProviders = selectBestProvider(
            request.taskType,
            Object.keys(AI_PROVIDERS),
            this.config.strategy === 'adaptive' ? 'best-quality' : this.config.strategy
        );

        // دمج وإزالة التكرار مع إعطاء الأولوية
        const merged = [...new Set([...preferred, ...taskBestProviders, ...strategyProviders])];
        return merged.filter(p => AI_PROVIDERS[p]?.available);
    }

    // ========== أفضل مزود لكل نوع مهمة ==========
    private getTaskBestProviders(taskType: TaskType): string[] {
        const taskMap: Record<TaskType, string[]> = {
            'coding': ['anthropic', 'openai', 'deepseek', 'groq', 'gemini', 'mistral'],
            'analysis': ['openai', 'anthropic', 'gemini', 'groq', 'cohere'],
            'research': ['perplexity', 'gemini', 'openai', 'anthropic', 'groq'],
            'writing': ['anthropic', 'openai', 'gemini', 'groq', 'cohere'],
            'reasoning': ['openai', 'anthropic', 'groq', 'gemini', 'deepseek'],
            'math': ['openai', 'deepseek', 'anthropic', 'groq', 'gemini'],
            'translation': ['gemini', 'openai', 'anthropic', 'groq', 'cohere'],
            'summarization': ['gemini', 'groq', 'cohere', 'openai', 'anthropic'],
            'web-search': ['perplexity', 'xai', 'gemini', 'openai'],
            'general': ['gemini', 'groq', 'openai', 'anthropic', 'deepseek', 'cohere']
        };
        return (taskMap[taskType] ?? taskMap['general']).filter(p => AI_PROVIDERS[p]?.available);
    }

    // ========== استدعاء مزود محدد ==========
    private async callProvider(providerName: string, request: AgentRequest): Promise<AgentResponse> {
        const provider = AI_PROVIDERS[providerName];
        if (!provider?.available) {
            return {
                requestId: request.id, result: '', provider: providerName, model: 'unknown',
                latencyMs: 0, success: false, error: 'provider-not-available', timestamp: new Date()
            };
        }

        // اختر أفضل نموذج - الأول في القائمة
        const model = provider.models[0];
        const apiKey = this.apiKeys[providerName] ?? '';

        switch (providerName) {
            case 'gemini': return callGemini(request, model.id, apiKey);
            case 'groq': return callGroq(request, model.id, apiKey);
            case 'openai': return callOpenAI(request, model.id, apiKey);
            case 'anthropic': return callAnthropic(request, model.id, apiKey);
            case 'cohere': return callCohere(request, model.id, apiKey);
            case 'mistral': return callMistral(request, model.id, apiKey);
            case 'perplexity': return callPerplexity(request, model.id, apiKey);
            case 'deepseek': return callDeepSeek(request, model.id, apiKey);
            case 'xai': return callXAI(request, model.id, apiKey);
            case 'huggingface': return callHuggingFace(request, model.id, apiKey);
            case 'together': return callTogether(request, model.id, apiKey);
            case 'ollama': return callOllama(request, model.id, process.env.OLLAMA_BASE_URL);
            default:
                return {
                    requestId: request.id, result: '', provider: providerName, model: model.id,
                    latencyMs: 0, success: false, error: 'unknown-provider', timestamp: new Date()
                };
        }
    }

    // ========== دمج نتائج موازية ==========
    async executeParallel(
        task: string,
        taskType: TaskType,
        providers: string[],
        aggregationStrategy: 'best' | 'merge' | 'vote' = 'best'
    ): Promise<AgentResponse> {
        const request: AgentRequest = {
            id: uuidv4(), task, taskType,
            timestamp: new Date(), useMemory: false
        };

        const activeProviders = providers.filter(p => AI_PROVIDERS[p]?.available);
        const limited = activeProviders.slice(0, this.config.maxParallel);

        console.log(`🔀 تنفيذ موازي مع ${limited.length} مزودين...`);

        const promises = limited.map(p => this.callProvider(p, request));
        const results = await Promise.allSettled(promises);

        const successful = results
            .filter((r): r is PromiseFulfilledResult<AgentResponse> =>
                r.status === 'fulfilled' && r.value.success)
            .map(r => r.value);

        if (successful.length === 0) {
            return {
                requestId: request.id, result: 'فشل التنفيذ الموازي',
                provider: 'parallel', model: 'none',
                latencyMs: 0, success: false,
                error: 'all-parallel-failed', timestamp: new Date()
            };
        }

        if (aggregationStrategy === 'best') {
            // أعد أسرع استجابة ناجحة
            return successful.sort((a, b) => a.latencyMs - b.latencyMs)[0];
        }

        if (aggregationStrategy === 'merge') {
            // ادمج كل النتائج
            const merged = successful.map((r, i) =>
                `**[${r.provider}]:**\n${r.result}`
            ).join('\n\n---\n\n');
            return { ...successful[0], result: merged, provider: 'parallel-merged' };
        }

        // vote - أعد الأطول (الأكثر تفصيلاً)
        return successful.sort((a, b) => b.result.length - a.result.length)[0];
    }

    // ========== تحديث المقاييس ==========
    private updateMetrics(provider: string, success: boolean, latencyMs: number): void {
        const current = this.providerMetrics.get(provider) ?? { successes: 0, failures: 0, totalLatency: 0 };
        this.providerMetrics.set(provider, {
            successes: current.successes + (success ? 1 : 0),
            failures: current.failures + (success ? 0 : 1),
            totalLatency: current.totalLatency + latencyMs
        });
    }

    // ========== إحصاءات ==========
    getStats(): { providers: Record<string, unknown>; memory: PerformanceMetrics } {
        const providerStats: Record<string, unknown> = {};
        for (const [name, metrics] of this.providerMetrics) {
            const total = metrics.successes + metrics.failures;
            providerStats[name] = {
                successRate: total > 0 ? (metrics.successes / total * 100).toFixed(1) + '%' : 'N/A',
                avgLatencyMs: metrics.successes > 0
                    ? Math.round(metrics.totalLatency / metrics.successes)
                    : 0,
                totalRequests: total
            };
        }
        return { providers: providerStats, memory: this.memory.getPerformanceMetrics() };
    }

    // ========== الوصول للذاكرة ==========
    getMemory(): MemorySystem { return this.memory; }

    // ========== قائمة المزودين النشطين ==========
    getActiveProviders(): string[] {
        return Object.values(AI_PROVIDERS)
            .filter(p => p.available)
            .sort((a, b) => b.priority - a.priority)
            .map(p => `${p.isFree ? '🆓' : '💰'} ${p.displayName} (${p.models.length} نماذج)`);
    }
}
