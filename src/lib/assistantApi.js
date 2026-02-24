import { ZARULIJAM_SYSTEM_PROMPT } from './nvidia';

const DEFAULT_MODEL = 'meta/llama-3.3-70b-instruct';

export async function callAssistantChat({
    userMessage,
    history = [],
    systemPrompt = ZARULIJAM_SYSTEM_PROMPT,
    model = DEFAULT_MODEL,
    sessionId = null,
    userId = null,
    context = {},
    options = {}
}) {
    const useAssistantApi = !import.meta.env.DEV || import.meta.env.VITE_USE_ASSISTANT_API === 'true';
    if (!useAssistantApi) {
        throw new Error('Assistant API disabled in local dev. Set VITE_USE_ASSISTANT_API=true to test it.');
    }

    const payload = {
        session_id: sessionId,
        user_id: userId,
        message: userMessage,
        history,
        system_prompt: systemPrompt,
        context,
        options: {
            use_memory: options.use_memory !== false,
            allow_scrape: options.allow_scrape === true,
            model
        }
    };

    const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.message || data?.error || `Assistant API error ${response.status}`);
    }

    return {
        answer: data?.answer || '',
        sources: Array.isArray(data?.sources) ? data.sources : [],
        meta: data?.meta || {}
    };
}
