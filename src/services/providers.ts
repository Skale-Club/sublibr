import type { AIProvider, TokenUsage } from '../types';

// --- UI Constants ---

export const PROVIDER_LABELS: Record<AIProvider, string> = {
    gemini: 'Google Gemini',
    openai: 'OpenAI',
};

export const MODEL_OPTIONS: Record<AIProvider, { value: string; label: string }[]> = {
    gemini: [
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast)' },
        { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Best for Foreign Languages)' },
    ],
    openai: [
        { value: 'whisper-1', label: 'Whisper-1 (Standard)' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
        { value: 'gpt-4o', label: 'GPT-4o (Powerful)' },
    ],
};

export const PROVIDER_KEY_URLS: Record<AIProvider, { label: string; url: string }> = {
    gemini: { label: 'Google AI Studio', url: 'https://aistudio.google.com/app/apikey' },
    openai: { label: 'OpenAI Platform', url: 'https://platform.openai.com/api-keys' },
};

// --- API Key Testing (proxied via main process) ---

export async function testApiKey(
    provider: AIProvider,
    apiKey: string,
): Promise<{ ok: boolean; error?: string }> {
    if (typeof window !== 'undefined' && window.electronAPI?.testApiKey) {
        return window.electronAPI.testApiKey(provider, apiKey);
    }
    return testApiKeyDirect(provider, apiKey);
}

async function testApiKeyDirect(
    provider: AIProvider,
    apiKey: string,
): Promise<{ ok: boolean; error?: string }> {
    try {
        if (provider === 'gemini') {
            const res = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/models',
                { headers: { 'x-goog-api-key': apiKey } },
            );
            if (!res.ok) {
                const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
                return { ok: false, error: err.error?.message || `HTTP ${res.status}` };
            }
            return { ok: true };
        }
        if (provider === 'openai') {
            const res = await fetch('https://api.openai.com/v1/models', {
                headers: { Authorization: `Bearer ${apiKey}` },
            });
            if (!res.ok) {
                const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
                return { ok: false, error: err.error?.message || `HTTP ${res.status}` };
            }
            return { ok: true };
        }
        return { ok: false, error: `Unknown provider: ${provider}` };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
}

// --- Provider Dispatch (proxied via main process) ---

export interface ProviderResponse {
    text: string;
    tokenUsage: TokenUsage;
}

export async function callProvider(
    provider: AIProvider,
    apiKey: string,
    model: string,
    prompt: string,
    audioBase64: string,
    audioFormat?: string,
    language?: string | null,
    previousTranscript?: string,
): Promise<ProviderResponse> {
    const result = await window.electronAPI.callProvider(provider, apiKey, model, prompt, audioBase64, audioFormat, language, previousTranscript);
    return {
        ...result,
        tokenUsage: { ...result.tokenUsage, provider } as TokenUsage,
    };
}

export async function callTextProvider(
    provider: AIProvider,
    apiKey: string,
    model: string,
    prompt: string,
): Promise<ProviderResponse> {
    const result = await window.electronAPI.callTextProvider(provider, apiKey, model, prompt);
    return {
        ...result,
        tokenUsage: { ...result.tokenUsage, provider } as TokenUsage,
    };
}
