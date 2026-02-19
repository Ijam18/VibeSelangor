import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { MessageCircle, X, Send, RefreshCw, ChevronDown, WifiOff } from 'lucide-react';
import { callNvidiaLLM, ZARULIJAM_SYSTEM_PROMPT, localIntelligence, LOCAL_KB } from '../lib/nvidia';

// ─── Preset Questions (shown in offline mode) ────────────────────────────────
const PRESET_QUESTIONS = [
    { label: "Apa itu VibeSelangor?", key: "vibeselangor" },
    { label: "Macam mana nak join?", key: "join" },
    { label: "Apa itu NECB?", key: "necb" },
    { label: "Cerita pasal 7-Day Sprint", key: "sprint" },
    { label: "Tools apa yang digunakan?", key: "tools" },
    { label: "Apa itu Builder Studio?", key: "studio" },
    { label: "Macam mana nak earn Vibes?", key: "vibes" },
    { label: "Siapa Ijam?", key: "ijam" },
    { label: "Betul ke percuma?", key: "free" },
    { label: "Apa itu KrackedDevs?", key: "krackeddevs" },
    { label: "Macam mana nak install PWA?", key: "pwa" },
    { label: "Apa itu Showcase?", key: "showcase" },
];

// Extract related topics from the last bot response
function extractRelatedTopics(content) {
    // Try to find related topics from the LOCAL_KB
    const lower = content.toLowerCase();
    const related = [];
    for (const entry of LOCAL_KB) {
        if (entry.relatedTopics) {
            for (const topic of entry.relatedTopics) {
                const match = PRESET_QUESTIONS.find(q =>
                    q.label.toLowerCase().includes(topic.toLowerCase().split('?')[0].slice(0, 15)) ||
                    topic.toLowerCase().includes(q.label.toLowerCase().split('?')[0].slice(0, 15))
                );
                if (match && !related.includes(match)) {
                    related.push(match);
                }
            }
        }
    }
    // Return up to 3 related suggestions
    return related.slice(0, 3);
}

// ─── Scraper Logic ───────────────────────────────────────────────────────────
async function scrapeUrl(url) {
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        if (!response.ok) return null;
        const data = await response.json();
        const html = data.contents;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // Remove scripts, styles, etc.
        const scripts = doc.querySelectorAll('script, style, nav, footer, header');
        scripts.forEach(s => s.remove());
        return doc.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 1500);
    } catch (e) {
        console.error("Scraper error:", e);
        return null;
    }
}

const ZarulijamChatbot = forwardRef((props, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "okay bro apa khabar. aku ijam bot. tanya je apa apa pasal vibeselangor, necb, atau 7-day sprint.",
            relatedTopics: []
        }
    ]);

    useImperativeHandle(ref, () => ({
        openChat: () => {
            setIsHidden(false);
            setIsOpen(true);
        }
    }));
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, messages]);

    const sendMessage = async (text) => {
        const userText = (text || input).trim();
        if (!userText || isLoading) return;

        const userMsg = { role: 'user', content: userText };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const urlMatch = userText.match(/https?:\/\/[^\s]+/);
            let enrichedText = userText;
            if (urlMatch) {
                const scrapedContent = await scrapeUrl(urlMatch[0]);
                if (scrapedContent) {
                    enrichedText = `User message: ${userText}\n\n[Context — page content from ${urlMatch[0]}]:\n${scrapedContent}\n\nUsing the above page content, answer the user's question naturally.`;
                }
            }

            const history = newMessages.slice(1, -1).map(m => ({ role: m.role, content: m.content }));
            const response = await callNvidiaLLM(ZARULIJAM_SYSTEM_PROMPT, enrichedText, 'meta/llama-3.3-70b-instruct', history);

            setIsOfflineMode(false);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response,
                relatedTopics: extractRelatedTopics(response)
            }]);
        } catch (err) {
            const localResponse = localIntelligence(userText, messages);
            setIsOfflineMode(true);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: localResponse,
                isLocal: true,
                relatedTopics: extractRelatedTopics(localResponse)
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const resetChat = () => {
        setIsOfflineMode(false);
        setMessages([{
            role: 'assistant',
            content: "Okay bro, apa khabar! 👋 Aku Ijam Bot — tanya aku apa-apa pasal VibeSelangor, NECB, atau 7-Day Sprint!",
            relatedTopics: []
        }]);
    };

    const handleHide = () => {
        setIsOpen(false);
    };

    const isFirstMessage = messages.length === 1;

    return (
        <>
            <style>{`
                @keyframes chatBounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.06); }
                }
                @keyframes chatSlideUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes typingDot {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                    40% { transform: scale(1); opacity: 1; }
                }
                .chat-msg-user { animation: chatSlideUp 0.2s ease; }
                .chat-msg-bot { animation: chatSlideUp 0.2s ease; }
                .preset-btn:hover { background: rgba(206,17,38,0.22) !important; border-color: #CE1126 !important; }
                .related-btn:hover { background: rgba(206,17,38,0.15) !important; border-color: rgba(206,17,38,0.6) !important; }
            `}</style>


            {/* ── Chat panel ── */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 5.5rem))',
                    right: '1.5rem',
                    width: 'min(380px, calc(100vw - 2rem))',
                    height: 'min(560px, calc(100vh - 8rem))',
                    background: '#0f0f0f',
                    border: '2px solid #CE1126',
                    borderRadius: '20px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    zIndex: 9999,
                    animation: 'chatSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.875rem 1rem',
                        background: 'linear-gradient(135deg, #CE1126, #9b0d1e)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        flexShrink: 0,
                    }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '1rem', color: '#fff', flexShrink: 0,
                        }}>I</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>Ijam Bot</div>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isOfflineMode ? '#f59e0b' : '#22c55e', display: 'inline-block' }} />
                                {isOfflineMode ? 'Mod Offline • Preset sahaja' : 'VibeSelangor AI Guide • Online'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={resetChat} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }} title="Reset">
                                <RefreshCw size={15} />
                            </button>
                            <button onClick={handleHide} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }} title="Hide chatbot">
                                <ChevronDown size={15} />
                            </button>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }} title="Close">
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '1rem',
                        display: 'flex', flexDirection: 'column', gap: '0.75rem',
                        scrollbarWidth: 'thin', scrollbarColor: '#333 transparent',
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i}>
                                <div
                                    className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        gap: '0.5rem', alignItems: 'flex-end',
                                    }}
                                >
                                    {msg.role === 'assistant' && (
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: '#CE1126', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                                        }}>I</div>
                                    )}
                                    <div style={{
                                        maxWidth: '78%',
                                        padding: '0.6rem 0.875rem',
                                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: msg.role === 'user' ? 'linear-gradient(135deg, #CE1126, #ff3a5c)' : '#1e1e1e',
                                        border: msg.role === 'user' ? 'none' : '1px solid #2a2a2a',
                                        color: '#fff', fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-wrap',
                                    }}>
                                        {msg.content}
                                        {msg.isLocal && (
                                            <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '6px', borderTop: '1px solid #333', paddingTop: '4px' }}>
                                                📴 Mod offline — jawapan dari local knowledge base
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Related topic suggestions after bot reply */}
                                {msg.role === 'assistant' && msg.relatedTopics?.length > 0 && i === messages.length - 1 && !isLoading && (
                                    <div style={{ marginTop: '8px', marginLeft: '36px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        <div style={{ width: '100%', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Soalan berkaitan:</div>
                                        {msg.relatedTopics.map((q, qi) => (
                                            <button
                                                key={qi}
                                                className="related-btn"
                                                onClick={() => sendMessage(q.label)}
                                                style={{
                                                    background: 'rgba(206,17,38,0.08)',
                                                    border: '1px solid rgba(206,17,38,0.25)',
                                                    borderRadius: '999px',
                                                    padding: '4px 10px',
                                                    color: '#ff8a96',
                                                    fontSize: '0.7rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                {q.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#CE1126', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>I</div>
                                <div style={{ padding: '0.6rem 1rem', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    {[0, 1, 2].map(i => (
                                        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#CE1126', display: 'inline-block', animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Offline mode: preset questions — scrollable ── */}
                    {(isOfflineMode || isFirstMessage) && !isLoading && (
                        <div style={{
                            borderTop: '1px solid #1e1e1e',
                            background: '#0a0a0a',
                            flexShrink: 0,
                        }}>
                            {isOfflineMode && (
                                <div style={{ padding: '8px 12px 4px', fontSize: '10px', color: '#f59e0b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <WifiOff size={10} /> Mod Offline — pilih soalan di bawah:
                                </div>
                            )}
                            <div style={{
                                display: 'flex',
                                gap: '6px',
                                padding: isOfflineMode ? '4px 12px 10px' : '10px 12px',
                                overflowX: 'auto',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch',
                            }}>
                                {(isOfflineMode ? PRESET_QUESTIONS : PRESET_QUESTIONS.slice(0, 4)).map((q, i) => (
                                    <button
                                        key={i}
                                        className="preset-btn"
                                        onClick={() => sendMessage(q.label)}
                                        style={{
                                            background: 'rgba(206,17,38,0.1)',
                                            border: '1px solid rgba(206,17,38,0.3)',
                                            borderRadius: '999px',
                                            padding: '5px 11px',
                                            color: '#ff6b7a',
                                            fontSize: '0.72rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            fontWeight: '700',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {q.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Input (hidden in offline mode — use presets instead) ── */}
                    {!isOfflineMode && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            borderTop: '1px solid #1e1e1e',
                            display: 'flex', gap: '0.5rem',
                            flexShrink: 0, background: '#0a0a0a',
                        }}>
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Tanya Ijam Bot apa-apa..."
                                disabled={isLoading}
                                style={{
                                    flex: 1, background: '#1a1a1a',
                                    border: '1.5px solid #2a2a2a', borderRadius: '12px',
                                    padding: '0.6rem 0.875rem', color: '#fff',
                                    fontSize: '0.85rem', outline: 'none',
                                    transition: 'border-color 0.15s', fontFamily: 'Inter, sans-serif',
                                }}
                                onFocus={e => e.target.style.borderColor = '#CE1126'}
                                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || isLoading}
                                style={{
                                    width: 40, height: 40, borderRadius: '12px',
                                    background: input.trim() && !isLoading ? '#CE1126' : '#2a2a2a',
                                    border: 'none', color: '#fff',
                                    cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, transition: 'background 0.15s',
                                }}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
});

export default ZarulijamChatbot;
