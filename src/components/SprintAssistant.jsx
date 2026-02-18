import React, { useState } from 'react';
import { Sparkles, ChevronRight, RefreshCw, Copy, Check } from 'lucide-react';
import { callNvidiaLLM, SPRINT_ASSISTANT_SYSTEM_PROMPT } from '../lib/nvidia';

/**
 * SprintAssistant
 * Embedded in the Builder Dashboard.
 * Generates context-aware prompts for each sprint day based on the builder's idea.
 */

const SPRINT_DAYS = [
    { day: 1, label: 'Day 1: Concept & Problem', emoji: '💡' },
    { day: 2, label: 'Day 2: Target User', emoji: '👤' },
    { day: 3, label: 'Day 3: One-Liner Value Prop', emoji: '⚡' },
    { day: 4, label: 'Day 4: Core Features', emoji: '🏗️' },
    { day: 5, label: 'Day 5: Visual Interface', emoji: '🎨' },
    { day: 6, label: 'Day 6: Final Polish', emoji: '✨' },
    { day: 7, label: 'Day 7: Showcase', emoji: '🚀' },
];

export default function SprintAssistant({ builderProfile, currentSprintDay = 1 }) {
    const [selectedDay, setSelectedDay] = useState(currentSprintDay);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const ideaTitle = builderProfile?.idea_title || '';
    const problemStatement = builderProfile?.problem_statement || '';
    const district = builderProfile?.district || '';

    const generatePrompt = async () => {
        setIsLoading(true);
        setError('');
        setResponse('');

        const userMessage = `Builder context:
- Idea: ${ideaTitle || 'Not specified yet'}
- Problem: ${problemStatement || 'Not specified yet'}
- District: ${district || 'Selangor'}
- Sprint Day: ${selectedDay}

Generate the Day ${selectedDay} sprint guidance for this builder.`;

        try {
            const result = await callNvidiaLLM(
                SPRINT_ASSISTANT_SYSTEM_PROMPT,
                userMessage,
                'meta/llama-3.3-70b-instruct',
                []
            );
            setResponse(result);
        } catch (err) {
            setError('Could not connect to AI. Check your NVIDIA API key in .env file.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyPrompt = () => {
        // Extract just the prompt text between quotes
        const match = response.match(/"([^"]+)"/);
        const textToCopy = match ? match[1] : response;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div style={{
            background: '#0a0a0a',
            border: '2px solid #1e1e1e',
            borderRadius: '16px',
            padding: '1.25rem',
            marginTop: '1.5rem',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                    width: 32, height: 32, borderRadius: '8px',
                    background: 'linear-gradient(135deg, #CE1126, #9b0d1e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Sparkles size={16} color="#fff" />
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>Sprint AI Assistant</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Powered by NVIDIA Llama 3.3 70B</div>
                </div>
            </div>

            {/* Day selector */}
            <div style={{
                display: 'flex',
                gap: '0.4rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
            }}>
                {SPRINT_DAYS.map(({ day, label, emoji }) => (
                    <button
                        key={day}
                        onClick={() => { setSelectedDay(day); setResponse(''); setError(''); }}
                        style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            border: selectedDay === day ? '1.5px solid #CE1126' : '1.5px solid #2a2a2a',
                            background: selectedDay === day ? 'rgba(206,17,38,0.15)' : 'transparent',
                            color: selectedDay === day ? '#ff6b7a' : '#6b7280',
                            fontSize: '0.72rem',
                            fontWeight: selectedDay === day ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        {emoji} {label}
                    </button>
                ))}
            </div>

            {/* Context preview */}
            {(ideaTitle || problemStatement) && (
                <div style={{
                    background: '#111',
                    border: '1px solid #1e1e1e',
                    borderRadius: '8px',
                    padding: '0.6rem 0.875rem',
                    marginBottom: '0.875rem',
                    fontSize: '0.78rem',
                    color: '#9ca3af',
                }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Your idea: </span>
                    {ideaTitle || problemStatement}
                </div>
            )}

            {/* Generate button */}
            <button
                onClick={generatePrompt}
                disabled={isLoading}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: isLoading ? '#1e1e1e' : 'linear-gradient(135deg, #CE1126, #9b0d1e)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    marginBottom: '0.875rem',
                }}
            >
                {isLoading ? (
                    <>
                        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Generating your Day {selectedDay} guide...
                    </>
                ) : (
                    <>
                        <Sparkles size={16} />
                        Generate Day {selectedDay} Prompt & Steps
                        <ChevronRight size={16} />
                    </>
                )}
            </button>

            {/* Error */}
            {error && (
                <div style={{
                    padding: '0.75rem',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    marginBottom: '0.875rem',
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Response */}
            {response && (
                <div style={{
                    background: '#111',
                    border: '1px solid #2a2a2a',
                    borderRadius: '10px',
                    padding: '1rem',
                    position: 'relative',
                }}>
                    <button
                        onClick={copyPrompt}
                        style={{
                            position: 'absolute',
                            top: '0.75rem',
                            right: '0.75rem',
                            background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${copied ? '#22c55e' : '#2a2a2a'}`,
                            borderRadius: '6px',
                            padding: '4px 8px',
                            color: copied ? '#22c55e' : '#6b7280',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s',
                        }}
                    >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy Prompt'}
                    </button>
                    <div style={{
                        color: '#e5e7eb',
                        fontSize: '0.83rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        paddingRight: '80px',
                    }}>
                        {response}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
