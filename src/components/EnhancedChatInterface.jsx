import React, { useState, useEffect, useRef } from 'react';
import { emotionManager, emotionTriggers } from '../lib/emotionManager';
import IjamBotMascot from './IjamBotMascot';
import PresetQuestions from './PresetQuestions';
import { enhancedLocalIntelligence } from '../lib/enhancedLocalIntelligence';
import { callNvidiaLLM, localIntelligence, ZARULIJAM_SYSTEM_PROMPT } from '../lib/nvidia';
import { callAssistantChat } from '../lib/assistantApi';
import '../styles/emotionAnimations.css';

/**
 * Enhanced Chat Interface
 * Integrates AI responses with emotion management and visual expressions
 */

const EnhancedChatInterface = ({
    onSendMessage,
    messages = [],
    isTyping = false,
    onTypingChange,
    size = 48,
    showMascot = true,
    enableEyeTracking = true,
    currentUserId = null
}) => {
    const [currentEmotion, setCurrentEmotion] = useState('neutral');
    const [mousePos, setMousePos] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [useMemory, setUseMemory] = useState(true);
    const [allowScrape, setAllowScrape] = useState(false);
    const [lastSources, setLastSources] = useState([]);
    const containerRef = useRef(null);

    // Update emotion manager with current conversation state
    useEffect(() => {
        // Analyze latest message to determine emotion
        if (messages.length > 0) {
            const latestMessage = messages[messages.length - 1];
            if (latestMessage.role === 'user') {
                const analysis = emotionManager.analyzeUserMessage(
                    latestMessage.content,
                    { lastTopic: getLatestTopic() }
                );

                // Set emotion based on analysis
                emotionManager.setEmotion(analysis.emotion);
                setCurrentEmotion(analysis.emotion);
            }
        }
    }, [messages]);

    // Eye tracking effect
    useEffect(() => {
        if (!enableEyeTracking || !containerRef.current) return;

        const handleMouseMove = (e) => {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        };

        const container = containerRef.current;
        container.addEventListener('mousemove', handleMouseMove);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
        };
    }, [enableEyeTracking]);

    // Sync emotion manager with local state
    useEffect(() => {
        const interval = setInterval(() => {
            const currentEmotionFromManager = emotionManager.getCurrentEmotion();
            if (currentEmotionFromManager !== currentEmotion) {
                setCurrentEmotion(currentEmotionFromManager);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [currentEmotion]);

    // Get latest topic from conversation
    const getLatestTopic = () => {
        const topics = ['join', 'necb', 'sprint', 'onboarding', 'krackeddevs', 'antigravity', 'studio', 'selangor', 'pwa', 'showcase', 'leaderboard', 'forum', 'free', 'ijam', 'offline'];

        for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            const lowerContent = message.content.toLowerCase();

            for (const topic of topics) {
                if (lowerContent.includes(topic)) {
                    return topic;
                }
            }
        }

        return null;
    };

    // Enhanced message sending with emotion integration
    const handleSendMessage = async (message) => {
        if (!message.trim() || isProcessing) return;

        setIsProcessing(true);
        onTypingChange(true);

        try {
            // Add user message to conversation
            const userMessage = { role: 'user', content: message };
            const updatedHistory = [...conversationHistory, userMessage];
            setConversationHistory(updatedHistory);

            // Analyze user emotion and intent
            const analysis = emotionManager.analyzeUserMessage(message, {
                lastTopic: getLatestTopic()
            });

            // Set appropriate emotion
            emotionManager.setEmotion(analysis.emotion);
            setCurrentEmotion(analysis.emotion);

            // Try assistant orchestration API first, then NVIDIA, then local fallback.
            let response;
            try {
                const result = await callAssistantChat({
                    userMessage: message,
                    history: updatedHistory.slice(-5),
                    systemPrompt: ZARULIJAM_SYSTEM_PROMPT,
                    model: 'meta/llama-3.3-70b-instruct',
                    userId: currentUserId,
                    sessionId: currentUserId || 'enhanced-chat-guest',
                    context: { page: 'enhanced_chat' },
                    options: { use_memory: useMemory, allow_scrape: allowScrape }
                });
                response = result.answer;
                setLastSources(result.sources || []);
            } catch (error) {
                console.warn('Assistant API failed, trying NVIDIA fallback:', error);
                try {
                    response = await callNvidiaLLM(
                        ZARULIJAM_SYSTEM_PROMPT,
                        message,
                        'meta/llama-3.3-70b-instruct',
                        updatedHistory.slice(-5)
                    );
                } catch (nvidiaErr) {
                    console.warn('NVIDIA API failed, using local intelligence:', nvidiaErr);
                    response = localIntelligence(message, updatedHistory.slice(-5));
                }
                setLastSources([]);
            }

            // Add AI response to conversation
            const aiMessage = { role: 'assistant', content: response };
            const finalHistory = [...updatedHistory, aiMessage];
            setConversationHistory(finalHistory);

            // Analyze AI response for emotion
            const aiAnalysis = emotionManager.analyzeUserMessage(response, {
                lastTopic: getLatestTopic()
            });

            // Set emotion based on AI response
            emotionManager.setEmotion(aiAnalysis.emotion);
            setCurrentEmotion(aiAnalysis.emotion);

            // Call parent callback with the response
            if (onSendMessage) {
                onSendMessage(aiMessage);
            }

        } catch (error) {
            console.error('Error sending message:', error);

            // Fallback to local intelligence
            const fallbackResponse = localIntelligence(message, conversationHistory.slice(-5));
            const fallbackMessage = { role: 'assistant', content: fallbackResponse };

            setConversationHistory([...conversationHistory, fallbackMessage]);
            if (onSendMessage) {
                onSendMessage(fallbackMessage);
            }
        } finally {
            setIsProcessing(false);
            onTypingChange(false);
        }
    };

    // Handle typing indicator
    useEffect(() => {
        if (isTyping) {
            // Trigger thinking emotion when AI is typing
            emotionManager.setEmotion('thinking');
            setCurrentEmotion('thinking');
        }
    }, [isTyping]);

    // Get emotion-based CSS classes
    const getEmotionClasses = () => {
        const baseClasses = ['ijam-bot', 'ijam-bot-transition'];
        baseClasses.push(`ijam-bot-${currentEmotion}`);
        baseClasses.push(`ijam-bot-color-${currentEmotion}`);

        if (currentEmotion === 'happy' || currentEmotion === 'excited') {
            baseClasses.push('ijam-bot-state-happy-excited');
        } else if (currentEmotion === 'thinking' || currentEmotion === 'confused') {
            baseClasses.push('ijam-bot-state-thinking-confused');
        }

        return baseClasses.join(' ');
    };

    // Get conversation analytics
    const getConversationStats = () => {
        return emotionManager.getConversationAnalytics();
    };

    return (
        <div
            ref={containerRef}
            className="enhanced-chat-interface"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                position: 'relative'
            }}
        >
            {/* Chat Header with Stats */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: '#6b7280'
            }}>
                <span>💬 Live Chat</span>
                <span>🤖 IjamBot AI</span>
                <span>📊 {getConversationStats().totalMessages} messages</span>
            </div>


            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#4b5563' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <input type="checkbox" checked={useMemory} onChange={(e) => setUseMemory(e.target.checked)} />
                    Use memory
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <input type="checkbox" checked={allowScrape} onChange={(e) => setAllowScrape(e.target.checked)} />
                    Analyze URL
                </label>
            </div>

            {/* Chat Messages */}
            <div
                style={{
                    flex: 1,
                    overflow: 'auto',
                    maxHeight: '400px',
                    padding: '0.5rem'
                }}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '0.5rem'
                        }}
                    >
                        {message.role === 'assistant' && showMascot && (
                            <div style={{ marginRight: '0.5rem' }}>
                                <IjamBotMascot
                                    size={32}
                                    emotion={currentEmotion}
                                    mousePos={mousePos}
                                />
                            </div>
                        )}

                        <div
                            style={{
                                maxWidth: '70%',
                                padding: '0.75rem 1rem',
                                borderRadius: '18px',
                                backgroundColor: message.role === 'user' ? '#3b82f6' : '#f3f4f6',
                                color: message.role === 'user' ? 'white' : '#1f2937',
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                            }}
                        >
                            {message.content}
                        </div>

                        {message.role === 'user' && showMascot && (
                            <div style={{ marginLeft: '0.5rem' }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }}>
                                    👤
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isTyping && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        marginBottom: '0.5rem'
                    }}>
                        {showMascot && (
                            <div style={{ marginRight: '0.5rem' }}>
                                <IjamBotMascot
                                    size={32}
                                    emotion="thinking"
                                    mousePos={mousePos}
                                />
                            </div>
                        )}

                        <div
                            style={{
                                maxWidth: '70%',
                                padding: '0.75rem 1rem',
                                borderRadius: '18px',
                                backgroundColor: '#f3f4f6',
                                color: '#1f2937',
                                fontSize: '0.9rem',
                                lineHeight: '1.4',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span>Typing</span>
                            <div style={{
                                display: 'flex',
                                gap: '4px'
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    backgroundColor: '#9ca3af',
                                    borderRadius: '50%',
                                    animation: 'bounce 1s infinite'
                                }}></div>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    backgroundColor: '#9ca3af',
                                    borderRadius: '50%',
                                    animation: 'bounce 1s infinite 0.2s'
                                }}></div>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    backgroundColor: '#9ca3af',
                                    borderRadius: '50%',
                                    animation: 'bounce 1s infinite 0.4s'
                                }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <div style={{
                display: 'flex',
                gap: '0.5rem'
            }}>
                {showMascot && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <IjamBotMascot
                            size={size}
                            emotion={currentEmotion}
                            mousePos={mousePos}
                        />
                    </div>
                )}

                <div style={{
                    flex: 1,
                    display: 'flex',
                    gap: '0.5rem'
                }}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                handleSendMessage(e.target.value);
                                e.target.value = '';
                            }
                        }}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '20px',
                            border: '1px solid #e5e7eb',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />

                    <button
                        onClick={() => {
                            const input = containerRef.current.querySelector('input');
                            if (input) {
                                handleSendMessage(input.value);
                                input.value = '';
                            }
                        }}
                        disabled={isProcessing}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '20px',
                            backgroundColor: isProcessing ? '#9ca3af' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.9rem',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {isProcessing ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>

            {/* Preset Questions */}
            <PresetQuestions
                onQuestionSelect={handleSendMessage}
                isVisible={true}
                context={{
                    userProfile: {
                        lastTopic: getLatestTopic(),
                        progress: 'beginner' // This would come from actual user profile
                    }
                }}
                size="medium"
            />

            {/* Conversation Analytics */}
            <div style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                textAlign: 'center',
                marginTop: '0.5rem',
                opacity: 0.7
            }}>
                Current emotion: {currentEmotion} |
                User sentiment: {getConversationStats().currentSentiment} |
                Engagement: {getConversationStats().engagementLevel}/10
            </div>

            {lastSources.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#374151' }}>
                    Sources: {lastSources.map((source, idx) => (
                        <a
                            key={`${source.url || idx}`}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ marginRight: '0.6rem' }}
                        >
                            [{idx + 1}] {source.title || source.url}
                        </a>
                    ))}
                </div>
            )}

        </div>
    );
};

export default EnhancedChatInterface;
