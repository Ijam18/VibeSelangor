import { randomUUID } from 'node:crypto';

const DEFAULT_MODEL = 'meta/llama-3.3-70b-instruct';
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

function toBool(value, fallback = false) {
    if (value === undefined || value === null) return fallback;
    const normalized = String(value).toLowerCase().trim();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function json(res, status, payload) {
    return res.status(status).json(payload);
}

function pickMessageText(message) {
    return (message || '').toString().trim();
}

function pickHistory(history) {
    if (!Array.isArray(history)) return [];
    return history
        .filter((item) => item && typeof item.content === 'string' && (item.role === 'user' || item.role === 'assistant'))
        .slice(-12)
        .map((item) => ({ role: item.role, content: item.content }));
}

async function callNvidia({ model, systemPrompt, userMessage, history, apiKey }) {
    const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage }
    ];

    const response = await fetch(NVIDIA_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model || DEFAULT_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 512,
            stream: false
        })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = data?.message || data?.error || `NVIDIA API error (${response.status})`;
        throw new Error(message);
    }

    return data?.choices?.[0]?.message?.content || '';
}

function deriveShouldScrape({ allowScrape, context }) {
    if (!allowScrape) return false;
    const url = context?.url;
    if (!url || typeof url !== 'string') return false;
    return /^https?:\/\//i.test(url.trim());
}

async function fetchMemory({ baseUrl, payload }) {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/memory/retrieve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`memory retrieve failed (${response.status})`);
    return response.json();
}

async function captureMemory({ baseUrl, payload }) {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/memory/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`memory capture failed (${response.status})`);
    return response.json().catch(() => ({}));
}

async function submitScrapeJob({ baseUrl, payload }) {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/scrape/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`scrape submit failed (${response.status})`);
    return response.json();
}

async function pollScrapeJob({ baseUrl, jobId, timeoutMs = 10000 }) {
    const deadline = Date.now() + timeoutMs;
    const safeBase = baseUrl.replace(/\/$/, '');

    while (Date.now() < deadline) {
        const response = await fetch(`${safeBase}/v1/scrape/jobs/${jobId}`);
        if (!response.ok) throw new Error(`scrape poll failed (${response.status})`);
        const data = await response.json();
        if (data?.status === 'done' || data?.status === 'failed' || data?.status === 'cancelled') {
            return data;
        }
        await new Promise((resolve) => setTimeout(resolve, 600));
    }

    throw new Error('scrape poll timeout');
}

function mergeSystemPrompt({ systemPrompt, memoryBlock, scrapeSummary }) {
    const parts = [systemPrompt];
    if (memoryBlock) {
        parts.push(`Relevant memory:\n${memoryBlock}`);
    }
    if (scrapeSummary) {
        parts.push(`Web context:\n${scrapeSummary}`);
    }
    return parts.join('\n\n');
}

function summarizeScrape(results) {
    if (!Array.isArray(results) || results.length === 0) return { summary: '', sources: [] };

    const sourceItems = results.slice(0, 3).map((item) => ({
        url: item.url || '',
        title: item.title || '',
        excerpt: (item.text || item.text_content || '').slice(0, 220)
    }));

    const summary = sourceItems
        .map((item, index) => `Source ${index + 1}: ${item.title || item.url}\n${item.excerpt}`)
        .join('\n\n');

    return { summary, sources: sourceItems };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return json(res, 405, { error: 'Method not allowed' });
    }

    const traceId = randomUUID();
    const startedAt = Date.now();

    const apiKey = process.env.NVIDIA_API_KEY_70B;
    if (!apiKey) {
        return json(res, 500, { error: 'NVIDIA API key not configured', trace_id: traceId });
    }

    const body = req.body || {};
    const message = pickMessageText(body.message);
    if (!message) {
        return json(res, 400, { error: 'message is required', trace_id: traceId });
    }

    const sessionId = (body.session_id || '').toString().trim() || null;
    const userId = (body.user_id || '').toString().trim() || null;
    const model = (body?.options?.model || DEFAULT_MODEL).toString();
    const history = pickHistory(body.history);
    const context = body.context || {};
    const options = body.options || {};

    const memoryEnabled = toBool(process.env.FEATURE_MEMORY_EXTRACT, false) && Boolean(options.use_memory);
    const scrapeEnabled = toBool(process.env.FEATURE_SCRAPLING, false) && deriveShouldScrape({ allowScrape: Boolean(options.allow_scrape), context });

    const memoryServiceUrl = process.env.MEMORY_SERVICE_URL || '';
    const scrapeServiceUrl = process.env.SCRAPE_SERVICE_URL || '';
    const traceServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';

    let memoryBlock = '';
    let sources = [];
    let usedMemory = false;
    let usedScrape = false;
    let memoryMs = 0;
    let scrapeMs = 0;
    let llmMs = 0;
    let assistantText = '';
    let errorMessage = null;

    try {
        if (memoryEnabled && memoryServiceUrl && userId) {
            const t0 = Date.now();
            try {
                const result = await fetchMemory({
                    baseUrl: memoryServiceUrl,
                    payload: { user_id: userId, query: message, limit: 8 }
                });
                memoryMs = Date.now() - t0;
                memoryBlock = result?.memory_block || '';
                usedMemory = Boolean(memoryBlock);
            } catch (memoryErr) {
                memoryMs = Date.now() - t0;
                console.warn('[assistant/chat] memory retrieve skipped:', memoryErr.message);
            }
        }

        let scrapeSummary = '';
        if (scrapeEnabled && scrapeServiceUrl && userId && context?.url) {
            const t0 = Date.now();
            try {
                const job = await submitScrapeJob({
                    baseUrl: scrapeServiceUrl,
                    payload: {
                        user_id: userId,
                        urls: [context.url],
                        mode: 'single',
                        max_pages: 1
                    }
                });
                const jobResult = await pollScrapeJob({ baseUrl: scrapeServiceUrl, jobId: job.id });
                scrapeMs = Date.now() - t0;
                const summarized = summarizeScrape(jobResult?.results || []);
                scrapeSummary = summarized.summary;
                sources = summarized.sources;
                usedScrape = sources.length > 0;
            } catch (scrapeErr) {
                scrapeMs = Date.now() - t0;
                console.warn('[assistant/chat] scrape skipped:', scrapeErr.message);
            }
        }

        const systemPrompt = mergeSystemPrompt({
            systemPrompt: (body.system_prompt || '').toString().trim() || 'You are a helpful assistant.',
            memoryBlock,
            scrapeSummary
        });

        const t1 = Date.now();
        assistantText = await callNvidia({
            model,
            systemPrompt,
            userMessage: message,
            history,
            apiKey
        });
        llmMs = Date.now() - t1;

        if (memoryEnabled && memoryServiceUrl && userId && assistantText) {
            try {
                await captureMemory({
                    baseUrl: memoryServiceUrl,
                    payload: {
                        user_id: userId,
                        session_id: sessionId,
                        user_message: message,
                        assistant_message: assistantText,
                        metadata: { source: 'assistant_chat' }
                    }
                });
            } catch (captureErr) {
                console.warn('[assistant/chat] memory capture skipped:', captureErr.message);
            }
        }

        const totalMs = Date.now() - startedAt;

        if (supabaseUrl && traceServiceRoleKey && userId) {
            try {
                await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/assistant_traces`, {
                    method: 'POST',
                    headers: {
                        apikey: traceServiceRoleKey,
                        Authorization: `Bearer ${traceServiceRoleKey}`,
                        'Content-Type': 'application/json',
                        Prefer: 'return=minimal'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        session_id: sessionId,
                        request_message: message,
                        response_message: assistantText,
                        used_memory: usedMemory,
                        used_scrape: usedScrape,
                        model,
                        memory_ms: memoryMs,
                        scrape_ms: scrapeMs,
                        llm_ms: llmMs,
                        total_ms: totalMs,
                        error_message: null
                    })
                });
            } catch (traceErr) {
                console.warn('[assistant/chat] trace insert skipped:', traceErr.message);
            }
        }

        return json(res, 200, {
            answer: assistantText || 'Maaf, aku tak dapat jana respons sekarang.',
            sources,
            meta: {
                trace_id: traceId,
                used_memory: usedMemory,
                used_scrape: usedScrape,
                model,
                latency_ms: totalMs,
                memory_ms: memoryMs,
                scrape_ms: scrapeMs,
                llm_ms: llmMs
            }
        });
    } catch (err) {
        errorMessage = err?.message || 'assistant pipeline failed';
        const totalMs = Date.now() - startedAt;

        if (supabaseUrl && traceServiceRoleKey && userId) {
            try {
                await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/assistant_traces`, {
                    method: 'POST',
                    headers: {
                        apikey: traceServiceRoleKey,
                        Authorization: `Bearer ${traceServiceRoleKey}`,
                        'Content-Type': 'application/json',
                        Prefer: 'return=minimal'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        session_id: sessionId,
                        request_message: message,
                        response_message: null,
                        used_memory: usedMemory,
                        used_scrape: usedScrape,
                        model,
                        memory_ms: memoryMs,
                        scrape_ms: scrapeMs,
                        llm_ms: llmMs,
                        total_ms: totalMs,
                        error_message: errorMessage
                    })
                });
            } catch (traceErr) {
                console.warn('[assistant/chat] trace insert failed:', traceErr.message);
            }
        }

        return json(res, 500, { error: 'assistant request failed', message: errorMessage, trace_id: traceId });
    }
}
