import React, { useState, useEffect, useRef } from 'react';

/**
 * Enhanced IjamBotMascot Component
 * Features:
 * - Eye tracking with mouse movement
 * - Animated expressions based on emotion
 * - Blinking animation
 * - Emotion-based mouth shapes
 * - Smooth transitions between states
 */

const IjamBotMascot = ({ size = 48, mousePos, emotion = 'neutral' }) => {
    const [isBlinking, setIsBlinking] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState(emotion);
    const blinkTimerRef = useRef(null);
    const emotionTimerRef = useRef(null);

    // Eye position calculation based on mouse position
    const calculateEyePosition = (mousePos, size) => {
        if (!mousePos) return { x: 0, y: 0 };

        const eyeOffset = size * 0.05; // Maximum eye movement offset
        const x = (mousePos.x / window.innerWidth - 0.5) * eyeOffset;
        const y = (mousePos.y / window.innerHeight - 0.5) * eyeOffset;

        return { x, y };
    };

    const eyePos = calculateEyePosition(mousePos, size);

    // Blinking animation logic
    useEffect(() => {
        const blink = () => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 100);
        };

        const scheduleBlink = () => {
            // Random blink interval between 2-8 seconds
            const interval = Math.random() * 6000 + 2000;
            blinkTimerRef.current = setTimeout(() => {
                blink();
                scheduleBlink();
            }, interval);
        };

        scheduleBlink();

        return () => {
            if (blinkTimerRef.current) {
                clearTimeout(blinkTimerRef.current);
            }
        };
    }, []);

    // Emotion transition logic
    useEffect(() => {
        if (emotion !== currentEmotion) {
            setCurrentEmotion(emotion);

            // Reset emotion after a certain time for dynamic conversation
            if (emotionTimerRef.current) {
                clearTimeout(emotionTimerRef.current);
            }

            emotionTimerRef.current = setTimeout(() => {
                setCurrentEmotion('neutral');
            }, 3000); // Return to neutral after 3 seconds
        }

        return () => {
            if (emotionTimerRef.current) {
                clearTimeout(emotionTimerRef.current);
            }
        };
    }, [emotion, currentEmotion]);

    // Mouth shapes based on emotion
    const getMouthShape = (emotion) => {
        switch (emotion) {
            case 'happy':
                return 'M 10 70 Q 20 80 30 70'; // Smiling
            case 'excited':
                return 'M 5 70 Q 20 85 35 70'; // Big smile
            case 'thinking':
                return 'M 10 65 Q 20 60 30 65'; // Slight frown, thinking
            case 'confused':
                return 'M 10 75 Q 20 65 30 75'; // Confused expression
            case 'sleepy':
                return 'M 15 70 L 25 70'; // Straight line, tired
            case 'sad':
                return 'M 10 75 Q 20 65 30 75'; // Frown
            default:
                return 'M 10 70 Q 20 75 30 70'; // Neutral
        }
    };

    // Eye shapes based on emotion
    const getEyeShape = (emotion, isBlinking) => {
        if (isBlinking) {
            return 'M 10 40 L 20 40'; // Blinking - horizontal line
        }

        switch (emotion) {
            case 'excited':
                return 'M 10 35 Q 15 30 20 35'; // Wide open, excited
            case 'sleepy':
                return 'M 10 40 Q 15 42 20 40'; // Half-closed, sleepy
            case 'thinking':
                return 'M 10 38 Q 15 35 20 38'; // Slightly squinted, thinking
            default:
                return 'M 10 38 Q 15 33 20 38'; // Normal eyes
        }
    };

    // Eye color based on emotion
    const getEyeColor = (emotion) => {
        switch (emotion) {
            case 'excited':
                return '#4ade80'; // Green for excitement
            case 'sleepy':
                return '#94a3b8'; // Gray for sleepy
            case 'thinking':
                return '#60a5fa'; // Blue for thinking
            default:
                return '#1f2937'; // Default dark
        }
    };

    // Body color based on emotion
    const getBodyColor = (emotion) => {
        switch (emotion) {
            case 'happy':
                return '#f59e0b'; // Orange for happy
            case 'excited':
                return '#22c55e'; // Green for excited
            case 'sleepy':
                return '#64748b'; // Gray for sleepy
            case 'thinking':
                return '#60a5fa'; // Blue for thinking
            case 'confused':
                return '#f97316'; // Orange for confused
            case 'sad':
                return '#3b82f6'; // Blue for sad
            default:
                return '#ef4444'; // Default red
        }
    };

    const getKaomojiText = (emotion) => {
        switch (emotion) {
            case 'happy':
                return '(b ᵔ▽ᵔ)b';
            case 'excited':
                return '(☆▽☆)';
            case 'sleepy':
                return '(・_・;)';
            case 'thinking':
                return '(¬‿¬)';
            case 'confused':
                return '(o^▽^o)';
            case 'sad':
                return '(ง •̀_•́)ง';
            default:
                return '(✿◠‿◠)';
        }
    };

    return (
        <div
            style={{
                width: size,
                height: size,
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {/* Bot Body */}
            <svg
                width={size}
                height={size}
                viewBox="0 0 40 80"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transition: 'fill 0.3s ease'
                }}
            >
                {/* Body */}
                <ellipse
                    cx="20"
                    cy="50"
                    rx="18"
                    ry="25"
                    fill={getBodyColor(currentEmotion)}
                    stroke="#1f2937"
                    strokeWidth="2"
                />

                {/* Head */}
                <circle
                    cx="20"
                    cy="30"
                    r="18"
                    fill={getBodyColor(currentEmotion)}
                    stroke="#1f2937"
                    strokeWidth="2"
                />

                {/* Ears */}
                <circle cx="5" cy="25" r="5" fill={getBodyColor(currentEmotion)} stroke="#1f2937" strokeWidth="2" />
                <circle cx="35" cy="25" r="5" fill={getBodyColor(currentEmotion)} stroke="#1f2937" strokeWidth="2" />

                {/* Eyes */}
                <path
                    d={getEyeShape(currentEmotion, isBlinking)}
                    stroke={getEyeColor(currentEmotion)}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    transform={`translate(${eyePos.x - 5}, ${eyePos.y})`}
                />
                <path
                    d={getEyeShape(currentEmotion, isBlinking)}
                    stroke={getEyeColor(currentEmotion)}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    transform={`translate(${eyePos.x + 5}, ${eyePos.y})`}
                />

                {/* Mouth */}
                <path
                    d={getMouthShape(currentEmotion)}
                    stroke="#1f2937"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Cheeks for happy/excited expressions */}
                {['happy', 'excited'].includes(currentEmotion) && (
                    <>
                        <circle cx="8" cy="55" r="3" fill="#fecaca" opacity="0.6" />
                        <circle cx="32" cy="55" r="3" fill="#fecaca" opacity="0.6" />
                    </>
                )}

                {/* Sparkle for excited expression */}
                {currentEmotion === 'excited' && (
                    <polygon
                        points="20,10 22,14 26,14 23,17 24,21 20,19 16,21 17,17 14,14 18,14"
                        fill="#fbbf24"
                        opacity="0.8"
                    />
                )}

                {/* Thought bubbles for thinking expression */}
                {currentEmotion === 'thinking' && (
                    <>
                        <circle cx="35" cy="5" r="3" fill="#ffffff" stroke="#1f2937" strokeWidth="1" />
                        <circle cx="42" cy="2" r="2" fill="#ffffff" stroke="#1f2937" strokeWidth="1" />
                        <circle cx="48" cy="0" r="1.5" fill="#ffffff" stroke="#1f2937" strokeWidth="1" />
                    </>
                )}
            </svg>

            {/* Floating Kaomoji Text */}
            <div
                style={{
                    position: 'absolute',
                    top: -15,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: size * 0.25,
                    fontWeight: 'bold',
                    color: '#1f2937',
                    textShadow: '1px 1px 0px white, -1px -1px 0px white',
                    opacity: currentEmotion === 'neutral' ? 0.3 : 0.8,
                    transition: 'all 0.3s ease',
                    animation: currentEmotion !== 'neutral' ? 'float 1s ease-in-out infinite' : 'none'
                }}
            >
                {getKaomojiText(currentEmotion)}
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateX(-50%) translateY(0px); }
                    50% { transform: translateX(-50%) translateY(-3px); }
                }
            `}</style>
        </div>
    );
};

export default IjamBotMascot;