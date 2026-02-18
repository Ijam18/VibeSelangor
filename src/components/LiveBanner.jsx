import React, { useState } from 'react';
import { Radio, X, ChevronRight } from 'lucide-react';

/**
 * LiveBanner - Site-wide LIVE class indicator
 * Shows a pulsing banner when any class is Active.
 * Used in both the header (badge) and landing page (full banner).
 */

// ─── Pulsing dot for header ───────────────────────────────────────────────────
export function LiveHeaderBadge({ onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(220, 38, 38, 0.15)',
                border: '1.5px solid rgba(220, 38, 38, 0.5)',
                borderRadius: '999px',
                padding: '4px 10px 4px 8px',
                cursor: 'pointer',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                animation: 'livePulse 2s ease-in-out infinite',
            }}
            title="A class is LIVE right now!"
        >
            <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                display: 'inline-block',
                animation: 'liveDot 1.5s ease-in-out infinite',
                flexShrink: 0
            }} />
            LIVE
        </button>
    );
}

// ─── Full-width banner for landing page ───────────────────────────────────────
export function LiveBanner({ activeClass, onJoinClick, onDismiss }) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || !activeClass) return null;

    const handleDismiss = () => {
        setDismissed(true);
        onDismiss?.();
    };

    return (
        <>
            <style>{`
                @keyframes liveSweep {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
                @keyframes liveDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.7); }
                }
                @keyframes livePulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
                    50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
                }
            `}</style>
            <div style={{
                position: 'relative',
                width: '100%',
                background: 'linear-gradient(90deg, #7f1d1d, #dc2626, #b91c1c, #dc2626, #7f1d1d)',
                backgroundSize: '400% 100%',
                animation: 'liveSweep 4s linear infinite',
                padding: '10px 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                zIndex: 1000,
            }}>
                {/* Pulsing dot */}
                <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'inline-block',
                    animation: 'liveDot 1.5s ease-in-out infinite',
                    flexShrink: 0
                }} />

                <span style={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    letterSpacing: '0.02em',
                    textAlign: 'center'
                }}>
                    🔴 Class is LIVE now!
                    {activeClass?.title && <span style={{ fontWeight: 400, opacity: 0.9 }}> — {activeClass.title}</span>}
                </span>

                <button
                    onClick={onJoinClick}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#fff',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '999px',
                        padding: '4px 12px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'transform 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Join Now <ChevronRight size={14} />
                </button>

                {/* Dismiss */}
                <button
                    onClick={handleDismiss}
                    style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                        borderRadius: '4px',
                    }}
                    title="Dismiss"
                >
                    <X size={16} />
                </button>
            </div>
        </>
    );
}

export default LiveBanner;
