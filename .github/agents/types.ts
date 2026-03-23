/**
 * types.ts - تعريفات الأنواع المشتركة لنظام الوكيل الذاتي التطوير
 */

export interface AIProvider {
    name: string;
    displayName: string;
    isFree: boolean;
    models: ModelInfo[];
    capabilities: ProviderCapability[];
    priority: number; // كلما كان أعلى، كلما ُفضّل
    available: boolean;
    rateLimit?: { requestsPerMinute: number; tokensPerDay?: number };
    costPer1kTokens?: { input: number; output: number };
}

export interface ModelInfo {
    id: string;
    name: string;
    contextWindow: number;
    strengths: string[];
    maxOutputTokens?: number;
}

export type ProviderCapability =
    | 'text-generation'
    | 'code-generation'
    | 'code-analysis'
    | 'reasoning'
    | 'web-search'
    | 'vision'
    | 'function-calling'
    | 'long-context'
    | 'fast-inference'
    | 'embeddings'
    | 'research'
    | 'math';

export interface AgentRequest {
    id: string;
    task: string;
    taskType: TaskType;
    context?: string[];
    preferredProviders?: string[];
    maxRetries?: number;
    temperature?: number;
    maxTokens?: number;
    useMemory?: boolean;
    timestamp: Date;
}

export type TaskType =
    | 'coding'
    | 'analysis'
    | 'research'
    | 'writing'
    | 'reasoning'
    | 'math'
    | 'translation'
    | 'summarization'
    | 'web-search'
    | 'general';

export interface AgentResponse {
    requestId: string;
    result: string;
    provider: string;
    model: string;
    tokensUsed?: { input: number; output: number };
    cost?: number;
    latencyMs: number;
    success: boolean;
    error?: string;
    timestamp: Date;
    confidence?: number;
}

export interface MemoryEntry {
    id: string;
    type: MemoryType;
    content: string;
    metadata: Record<string, unknown>;
    tags: string[];
    importance: number; // 0-1
    timestamp: Date;
    lastAccessed: Date;
    accessCount: number;
}

export type MemoryType =
    | 'task-result'
    | 'error-lesson'
    | 'success-pattern'
    | 'provider-performance'
    | 'user-preference'
    | 'learned-fact'
    | 'agent-improvement';

export interface LearningRecord {
    id: string;
    sessionId: string;
    taskType: TaskType;
    provider: string;
    model: string;
    success: boolean;
    errorType?: string;
    errorMessage?: string;
    latencyMs: number;
    userFeedback?: 'positive' | 'negative' | 'neutral';
    lesson?: string;
    timestamp: Date;
}

export interface AgentEvolution {
    version: string;
    timestamp: Date;
    improvements: EvolutionImprovement[];
    performanceMetrics: PerformanceMetrics;
    nextEvolutionScheduled: Date;
}

export interface EvolutionImprovement {
    area: string;
    before: string;
    after: string;
    reason: string;
    impactScore: number;
}

export interface PerformanceMetrics {
    totalRequests: number;
    successRate: number;
    avgLatencyMs: number;
    providerUsage: Record<string, number>;
    taskTypeSuccess: Record<string, number>;
    costTotal: number;
    learningEvents: number;
}

export interface OrchestratorConfig {
    strategy: 'best-quality' | 'fastest' | 'cheapest' | 'free-only' | 'adaptive';
    fallbackEnabled: boolean;
    parallelRequests: boolean;
    maxParallel: number;
    memoryEnabled: boolean;
    selfImprovementEnabled: boolean;
    providers: string[];
}
