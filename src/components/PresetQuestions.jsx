import React, { useState } from 'react';
import '../styles/presetQuestions.css';

/**
 * Preset Questions Component
 * Provides quick access buttons for common questions and topics
 */

const PresetQuestions = ({
    onQuestionSelect,
    isVisible = true,
    context = {},
    size = 'medium'
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Question categories with context-aware suggestions
    const questionCategories = {
        // Core program questions
        program: [
            {
                id: 'join',
                text: 'Macam mana nak join?',
                keywords: ['join', 'daftar', 'register'],
                emoji: '🚀',
                color: '#3b82f6'
            },
            {
                id: 'sprint',
                text: '7-day sprint schedule?',
                keywords: ['sprint', 'schedule', 'jadual'],
                emoji: '📅',
                color: '#10b981'
            },
            {
                id: 'necb',
                text: 'Apa itu NECB?',
                keywords: ['necb', 'philosophy', 'visi'],
                emoji: '💡',
                color: '#f59e0b'
            }
        ],

        // Technical questions
        technical: [
            {
                id: 'tools',
                text: 'Tools apa yang perlu?',
                keywords: ['tools', 'antigravity', 'supabase'],
                emoji: '🛠️',
                color: '#8b5cf6'
            },
            {
                id: 'pwa',
                text: 'Install PWA macam mana?',
                keywords: ['pwa', 'install', 'app'],
                emoji: '📱',
                color: '#ef4444'
            },
            {
                id: 'deploy',
                text: 'Deploy ke Vercel?',
                keywords: ['deploy', 'vercel', 'hosting'],
                emoji: '☁️',
                color: '#06b6d4'
            }
        ],

        // Studio and progress
        studio: [
            {
                id: 'vibes',
                text: 'Earn vibes lebih?',
                keywords: ['vibes', 'earn', 'points'],
                emoji: '💎',
                color: '#ec4899'
            },
            {
                id: 'level',
                text: 'Level up studio?',
                keywords: ['level', 'studio', 'upgrade'],
                emoji: '⬆️',
                color: '#84cc16'
            },
            {
                id: 'showcase',
                text: 'Submit projek?',
                keywords: ['showcase', 'submit', 'project'],
                emoji: '🎯',
                color: '#f97316'
            }
        ]
    };

    // Context-aware suggestions based on user progress
    const getContextSuggestions = () => {
        const suggestions = [];

        // If user hasn't joined yet
        if (!context.userProfile?.lastTopic) {
            suggestions.push({
                id: 'quick-join',
                text: 'Join sekarang!',
                keywords: ['join', 'daftar'],
                emoji: '⚡',
                color: '#22c55e',
                priority: true
            });
        }

        // If user is new
        if (context.userProfile?.progress === 'beginner') {
            suggestions.push({
                id: 'quick-start',
                text: 'Panduan pemula',
                keywords: ['beginner', 'pemula', 'start'],
                emoji: '👶',
                color: '#a855f7',
                priority: true
            });
        }

        // If user is asking about specific topics
        if (context.userProfile?.lastTopic) {
            const lastTopic = context.userProfile.lastTopic;
            const relatedQuestions = getRelatedQuestions(lastTopic);
            suggestions.push(...relatedQuestions);
        }

        return suggestions.slice(0, 3); // Limit to 3 suggestions
    };

    // Get related questions based on current topic
    const getRelatedQuestions = (topic) => {
        const related = [];

        if (topic.includes('join') || topic.includes('register')) {
            related.push(questionCategories.program[1], questionCategories.program[2]);
        } else if (topic.includes('sprint')) {
            related.push(questionCategories.technical[0], questionCategories.studio[0]);
        } else if (topic.includes('pwa') || topic.includes('install')) {
            related.push(questionCategories.technical[2], questionCategories.studio[1]);
        } else if (topic.includes('tools')) {
            related.push(questionCategories.technical[1], questionCategories.studio[2]);
        }

        return related;
    };

    // Handle question selection
    const handleQuestionClick = (question) => {
        if (onQuestionSelect) {
            onQuestionSelect(question.text);
        }
    };

    // Get CSS classes based on size
    const getButtonSizeClass = () => {
        switch (size) {
            case 'small': return 'preset-btn-small';
            case 'large': return 'preset-btn-large';
            default: return 'preset-btn-medium';
        }
    };

    if (!isVisible) return null;

    const contextSuggestions = getContextSuggestions();
    const allQuestions = [
        ...contextSuggestions,
        ...questionCategories.program,
        ...questionCategories.technical,
        ...questionCategories.studio
    ];

    return (
        <div className="preset-questions-container">
            {/* Context-aware quick suggestions */}
            {contextSuggestions.length > 0 && (
                <div className="context-suggestions">
                    <div className="suggestion-header">
                        <span className="suggestion-title">💡 Untuk kau:</span>
                        <span className="suggestion-subtitle">Berdasarkan aktiviti terkini</span>
                    </div>
                    <div className="suggestion-buttons">
                        {contextSuggestions.map((question) => (
                            <button
                                key={question.id}
                                className={`preset-btn ${getButtonSizeClass()} preset-btn-context`}
                                style={{ backgroundColor: question.color }}
                                onClick={() => handleQuestionClick(question)}
                                title={question.text}
                            >
                                <span className="btn-emoji">{question.emoji}</span>
                                <span className="btn-text">{question.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main category sections */}
            <div className={`category-sections ${isExpanded ? 'expanded' : ''}`}>
                {/* Program Questions */}
                <div className="category-section">
                    <div className="category-header">
                        <span className="category-icon">🚀</span>
                        <span className="category-title">Program</span>
                        <button
                            className="expand-toggle"
                            onClick={() => setIsExpanded(!isExpanded)}
                            aria-label={isExpanded ? "Collapse categories" : "Expand categories"}
                        >
                            {isExpanded ? '−' : '+'}
                        </button>
                    </div>
                    <div className="category-buttons">
                        {questionCategories.program.map((question) => (
                            <button
                                key={question.id}
                                className={`preset-btn ${getButtonSizeClass()}`}
                                style={{ backgroundColor: question.color }}
                                onClick={() => handleQuestionClick(question)}
                                title={question.text}
                            >
                                <span className="btn-emoji">{question.emoji}</span>
                                <span className="btn-text">{question.text}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Technical Questions */}
                <div className={`category-section ${isExpanded ? 'visible' : 'hidden'}`}>
                    <div className="category-header">
                        <span className="category-icon">🛠️</span>
                        <span className="category-title">Technical</span>
                    </div>
                    <div className="category-buttons">
                        {questionCategories.technical.map((question) => (
                            <button
                                key={question.id}
                                className={`preset-btn ${getButtonSizeClass()}`}
                                style={{ backgroundColor: question.color }}
                                onClick={() => handleQuestionClick(question)}
                                title={question.text}
                            >
                                <span className="btn-emoji">{question.emoji}</span>
                                <span className="btn-text">{question.text}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Studio Questions */}
                <div className={`category-section ${isExpanded ? 'visible' : 'hidden'}`}>
                    <div className="category-header">
                        <span className="category-icon">💎</span>
                        <span className="category-title">Studio</span>
                    </div>
                    <div className="category-buttons">
                        {questionCategories.studio.map((question) => (
                            <button
                                key={question.id}
                                className={`preset-btn ${getButtonSizeClass()}`}
                                style={{ backgroundColor: question.color }}
                                onClick={() => handleQuestionClick(question)}
                                title={question.text}
                            >
                                <span className="btn-emoji">{question.emoji}</span>
                                <span className="btn-text">{question.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div className="quick-actions">
                <button
                    className="quick-action-btn"
                    onClick={() => onQuestionSelect?.('help')}
                    title="Lihat semua option"
                >
                    <span className="action-emoji">❓</span>
                    <span className="action-text">Help</span>
                </button>
                <button
                    className="quick-action-btn"
                    onClick={() => onQuestionSelect?.('menu')}
                    title="Quick menu"
                >
                    <span className="action-emoji">📋</span>
                    <span className="action-text">Menu</span>
                </button>
                <button
                    className="quick-action-btn"
                    onClick={() => onQuestionSelect?.('random')}
                    title="Soalan random"
                >
                    <span className="action-emoji">🎲</span>
                    <span className="action-text">Random</span>
                </button>
            </div>

            {/* Usage tips */}
            <div className="usage-tips">
                <div className="tip-item">
                    <span className="tip-icon">💡</span>
                    <span className="tip-text">Klik butang untuk tanya soalan</span>
                </div>
                <div className="tip-item">
                    <span className="tip-icon">🎯</span>
                    <span className="tip-text">Butang biru = soalan popular</span>
                </div>
                <div className="tip-item">
                    <span className="tip-icon">⚡</span>
                    <span className="tip-text">Butang hijau = quick action</span>
                </div>
            </div>
        </div>
    );
};

export default PresetQuestions;