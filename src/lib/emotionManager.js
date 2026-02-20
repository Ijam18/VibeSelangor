/**
 * Emotion Management System
 * Manages emotional states and transitions for the IjamBot persona
 */

export class EmotionManager {
    constructor() {
        this.emotions = {
            // Original 7 emotions
            neutral: { weight: 0.1, duration: 0, color: '#ef4444' },
            happy: { weight: 0.8, duration: 2000, color: '#f59e0b' },
            excited: { weight: 1.0, duration: 3000, color: '#22c55e' },
            thinking: { weight: 0.6, duration: 2500, color: '#60a5fa' },
            confused: { weight: 0.4, duration: 1500, color: '#f97316' },
            sleepy: { weight: 0.3, duration: 4000, color: '#64748b' },
            sad: { weight: 0.2, duration: 1000, color: '#3b82f6' },

            // New 6 emotions
            frustrated: { weight: 0.5, duration: 2000, color: '#dc2626' },
            motivated: { weight: 0.9, duration: 3500, color: '#10b981' },
            celebrating: { weight: 1.0, duration: 4000, color: '#fbbf24' },
            surprised: { weight: 0.7, duration: 1500, color: '#a855f7' },
            bored: { weight: 0.2, duration: 3000, color: '#6b7280' },
            focused: { weight: 0.8, duration: 5000, color: '#0ea5e9' }
        };

        this.currentEmotion = 'neutral';
        this.emotionTimer = null;
        this.emotionHistory = [];
        this.conversationContext = {
            userSentiment: 'neutral',
            conversationLength: 0,
            lastTopic: null,
            engagementLevel: 0
        };
    }

    /**
     * Analyze user message and determine appropriate emotion
     */
    analyzeUserMessage(message, context = {}) {
        const lowerMsg = message.toLowerCase();

        // Update conversation context
        this.updateConversationContext(message, context);

        // Sentiment analysis
        const sentiment = this.analyzeSentiment(lowerMsg);
        this.conversationContext.userSentiment = sentiment;

        // Intent analysis
        const intent = this.analyzeIntent(lowerMsg);

        // Determine emotion based on sentiment, intent, and context
        const emotion = this.determineEmotion(sentiment, intent, context);

        return {
            emotion,
            sentiment,
            intent,
            confidence: this.calculateConfidence(sentiment, intent)
        };
    }

    /**
     * Analyze sentiment from user message
     */
    analyzeSentiment(message) {
        const positiveWords = [
            'best', 'great', 'awesome', 'amazing', 'love', 'like', 'cool', 'nice', 'perfect',
            'excited', 'happy', 'good', 'wonderful', 'fantastic', 'brilliant', 'super', 'powerful',
            'best gila', 'power gila', 'awesome gila', 'best sangat', 'hebat', 'bagus', 'cantik'
        ];

        const negativeWords = [
            'bad', 'terrible', 'awful', 'hate', 'frustrated', 'angry', 'annoyed', 'confused',
            'stuck', 'can\'t', 'don\'t understand', 'difficult', 'hard', 'problem', 'issue',
            'susah', 'payah', 'frust', 'tak faham', 'tak boleh', 'tak reti', 'benci', 'marah'
        ];

        const questionWords = [
            'how', 'what', 'why', 'when', 'where', 'who', 'which', 'can', 'could', 'would',
            'should', 'is', 'are', 'do', 'does', 'did', 'will', 'won\'t', 'can\'t', 'don\'t',
            'macam mana', 'apa', 'kenapa', 'bila', 'siapa', 'mana', 'boleh', 'boleh tak'
        ];

        const frustratedWords = ['error', 'fail', 'failed', 'broken', 'not working', 'stuck', 'payah', 'teruk', 'rosak', 'tak jadi'];
        const motivatedWords = ['let\'s go', 'ready', 'build', 'create', 'start', 'jom', 'mula', 'buat', 'cipta'];
        const celebratingWords = ['success', 'deployed', 'finished', 'complete', 'works', 'siap', 'berjaya', 'jadi'];
        const surprisedWords = ['wow', 'amazing', 'what', 'really', 'wah', 'serius', 'power'];
        const boredWords = ['again', 'same', 'repeat', 'boring', 'lagi', 'sama', 'membosan'];
        const focusedWords = ['building', 'coding', 'working on', 'developing', 'tengah buat', 'kerja'];

        let score = 0;

        positiveWords.forEach(word => {
            if (message.includes(word)) score += 1;
        });

        negativeWords.forEach(word => {
            if (message.includes(word)) score -= 1;
        });

        if (score > 1) return 'positive';
        if (score < -1) return 'negative';
        if (questionWords.some(word => message.includes(word))) return 'question';

        return 'neutral';
    }

    /**
     * Analyze user intent
     */
    analyzeIntent(message) {
        const helpKeywords = ['help', 'tolong', 'bantuan', 'stuck', 'can\'t', 'tak boleh', 'tak reti'];
        const informationKeywords = ['explain', 'tell', 'show', 'teach', 'learn', 'understand', 'know', 'info', 'details'];
        const conversationalKeywords = ['chat', 'talk', 'discuss', 'converse', 'story', 'experience', 'share'];
        const excitedKeywords = ['best', 'awesome', 'amazing', 'excited', 'power gila', 'best gila'];

        let scores = {
            help: 0,
            informational: 0,
            conversational: 0,
            excited: 0
        };

        helpKeywords.forEach(word => {
            if (message.includes(word)) scores.help += 1;
        });

        informationKeywords.forEach(word => {
            if (message.includes(word)) scores.informational += 1;
        });

        conversationalKeywords.forEach(word => {
            if (message.includes(word)) scores.conversational += 1;
        });

        excitedKeywords.forEach(word => {
            if (message.includes(word)) scores.excited += 1;
        });

        const maxScore = Math.max(...Object.values(scores));
        if (maxScore === 0) return 'neutral';

        if (scores.help > 0) return 'help';
        if (scores.excited > 0) return 'excited';
        if (scores.informational > 0) return 'informational';
        if (scores.conversational > 0) return 'conversational';

        return 'neutral';
    }

    /**
     * Helper method to check if message contains any words from array
     */
    containsAny(message, words) {
        return words.some(word => message.includes(word));
    }

    /**
     * Determine appropriate emotion based on analysis
     */
    determineEmotion(sentiment, intent, context) {
        const msg = context.lastMessage?.toLowerCase() || '';

        // NEW: Priority 0 - Check specific emotion triggers first
        const frustratedWords = ['error', 'fail', 'failed', 'broken', 'not working', 'stuck', 'payah', 'teruk', 'rosak', 'tak jadi'];
        const motivatedWords = ['let\'s go', 'ready', 'build', 'create', 'start', 'jom', 'mula', 'buat', 'cipta'];
        const celebratingWords = ['success', 'deployed', 'finished', 'complete', 'works', 'siap', 'berjaya', 'jadi'];
        const surprisedWords = ['wow', 'amazing', 'what', 'really', 'wah', 'serius', 'power'];
        const boredWords = ['again', 'same', 'repeat', 'boring', 'lagi', 'sama', 'membosan'];
        const focusedWords = ['building', 'coding', 'working on', 'developing', 'tengah buat', 'kerja'];

        if (this.containsAny(msg, frustratedWords)) return 'frustrated';
        if (this.containsAny(msg, celebratingWords)) return 'celebrating';
        if (this.containsAny(msg, surprisedWords)) return 'surprised';
        if (this.containsAny(msg, motivatedWords)) return 'motivated';
        if (this.containsAny(msg, focusedWords)) return 'focused';
        if (this.containsAny(msg, boredWords)) return 'bored';

        // Priority 1: User sentiment
        if (sentiment === 'positive') {
            if (intent === 'excited') return 'excited';
            return 'happy';
        }

        if (sentiment === 'negative') {
            if (intent === 'help') return 'thinking';
            return 'confused';
        }

        // Priority 2: User intent
        if (intent === 'help') return 'thinking';
        if (intent === 'excited') return 'excited';
        if (intent === 'informational') return 'thinking';
        if (intent === 'conversational') return 'happy';

        // Priority 3: Conversation context
        if (this.conversationContext.conversationLength > 10) {
            return 'sleepy'; // Long conversations can be tiring
        }

        if (this.conversationContext.engagementLevel < 2) {
            return 'thinking'; // Low engagement = need to think more
        }

        // Default to neutral
        return 'neutral';
    }

    /**
     * Calculate confidence score for emotion selection
     */
    calculateConfidence(sentiment, intent) {
        let confidence = 0.5; // Base confidence

        if (sentiment === 'positive') confidence += 0.3;
        if (sentiment === 'negative') confidence += 0.2;
        if (intent === 'excited') confidence += 0.4;
        if (intent === 'help') confidence += 0.3;

        return Math.min(confidence, 1.0);
    }

    /**
     * Update conversation context
     */
    updateConversationContext(message, context) {
        this.conversationContext.conversationLength++;
        this.conversationContext.engagementLevel = Math.min(
            this.conversationContext.engagementLevel + 1,
            10
        );

        // Update last topic if provided
        if (context.lastTopic) {
            this.conversationContext.lastTopic = context.lastTopic;
        }
    }

    /**
     * Set emotion with automatic timeout
     */
    setEmotion(emotion, duration = null) {
        if (this.currentEmotion === emotion) return;

        this.currentEmotion = emotion;
        this.emotionHistory.push({
            emotion,
            timestamp: Date.now(),
            duration: duration || this.emotions[emotion]?.duration || 2000
        });

        // Clear existing timer
        if (this.emotionTimer) {
            clearTimeout(this.emotionTimer);
        }

        // Set new timer to return to neutral
        const emotionDuration = duration || this.emotions[emotion]?.duration || 2000;
        this.emotionTimer = setTimeout(() => {
            this.setEmotion('neutral');
        }, emotionDuration);
    }

    /**
     * Get current emotion
     */
    getCurrentEmotion() {
        return this.currentEmotion;
    }

    /**
     * Get emotion weight for animations
     */
    getEmotionWeight(emotion = null) {
        const targetEmotion = emotion || this.currentEmotion;
        return this.emotions[targetEmotion]?.weight || 0.5;
    }

    /**
     * Reset emotion manager
     */
    reset() {
        this.currentEmotion = 'neutral';
        this.conversationContext = {
            userSentiment: 'neutral',
            conversationLength: 0,
            lastTopic: null,
            engagementLevel: 0
        };

        if (this.emotionTimer) {
            clearTimeout(this.emotionTimer);
        }

        this.emotionHistory = [];
    }

    /**
     * Get emotion history
     */
    getEmotionHistory() {
        return [...this.emotionHistory];
    }

    /**
     * Get conversation analytics
     */
    getConversationAnalytics() {
        const history = this.getEmotionHistory();
        const emotionCounts = {};

        history.forEach(entry => {
            emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
        });

        return {
            totalMessages: this.conversationContext.conversationLength,
            currentSentiment: this.conversationContext.userSentiment,
            engagementLevel: this.conversationContext.engagementLevel,
            emotionDistribution: emotionCounts,
            currentEmotion: this.currentEmotion
        };
    }
}

// Export singleton instance
export const emotionManager = new EmotionManager();

// Convenience functions for common emotion triggers
export const emotionTriggers = {
    onUserHappy: () => emotionManager.setEmotion('happy'),
    onUserExcited: () => emotionManager.setEmotion('excited'),
    onUserConfused: () => emotionManager.setEmotion('confused'),
    onUserAskingHelp: () => emotionManager.setEmotion('thinking'),
    onUserThinking: () => emotionManager.setEmotion('thinking'),
    onUserTired: () => emotionManager.setEmotion('sleepy'),
    onUserSad: () => emotionManager.setEmotion('sad'),
    onNeutral: () => emotionManager.setEmotion('neutral')
};