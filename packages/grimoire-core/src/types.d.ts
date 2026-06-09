/**
 * GRIMOIRE Core Types — Grimoire Definition Language (GDL)
 * @package grymoire-core
 */
export type SpellCategory = 'frontier' | 'practical' | 'code-review' | 'ritual';
export interface InputParam {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'object';
    description: string;
    required?: boolean;
    default?: any;
    min?: number;
    max?: number;
}
export interface OutputProperty {
    type: string;
    items?: Record<string, any>;
    properties?: Record<string, Record<string, any>>;
}
export interface OutputSpec {
    type: string;
    schema: Record<string, OutputProperty>;
}
export interface RitualStep {
    name: string;
    description: string;
    provider_hint?: 'local' | 'remote' | 'any';
    template?: string;
}
export interface RitualDef {
    steps: RitualStep[];
}
export interface SpellExample {
    input: Record<string, any>;
    output: any;
}
export interface SpellDef {
    name: string;
    version: string;
    title: string;
    author: string;
    category: SpellCategory;
    license: string;
    price?: number;
    tags?: string[];
    description: string;
    inputs: InputParam[];
    output: OutputSpec;
    ritual: RitualDef;
    dependencies?: string[];
    requires_approval?: boolean;
    rate_limit?: {
        per_minute?: number;
        per_day?: number;
    };
    deprecated?: boolean | string;
    example?: SpellExample;
}
export interface SpellEntry {
    spell: SpellDef;
    installed: boolean;
    installedVersion?: string;
    installedAt?: string;
    path?: string;
}
export interface SpellRegistry {
    spells: Map<string, SpellEntry>;
    totalCount: number;
    installedCount: number;
}
export type ExecutionStatus = 'pending' | 'running' | 'step_completed' | 'completed' | 'failed' | 'awaiting_approval' | 'approved' | 'denied';
export interface StepResult {
    stepIndex: number;
    stepName: string;
    status: ExecutionStatus;
    output?: string;
    error?: string;
    durationMs?: number;
}
export interface ExecutionResult {
    spellName: string;
    spellVersion: string;
    startedAt: string;
    completedAt?: string;
    status: ExecutionStatus;
    steps: StepResult[];
    output?: any;
    error?: string;
    totalDurationMs?: number;
}
export type ProviderId = 'ollama' | 'openai' | 'anthropic' | 'google' | 'local';
export interface ProviderConfig {
    id: ProviderId;
    baseUrl: string;
    apiKey?: string;
    defaultModel: string;
    models: string[];
}
export interface ProviderRequest {
    provider: ProviderConfig;
    model: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
}
export interface ProviderResponse {
    providerId: ProviderId;
    model: string;
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
    };
    durationMs: number;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: string[];
}
//# sourceMappingURL=types.d.ts.map