import React, { useEffect, useRef, useState } from 'react';

const toShortDateNoYear = (value) => {
    const source = (value || '').toString();
    const firstChunk = source.split('->')[0].trim();
    const parsed = new Date(firstChunk);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    }
    const isoMatch = source.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}`;
    const slashMatch = source.match(/\b(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?\b/);
    if (slashMatch) return `${slashMatch[1].padStart(2, '0')}/${slashMatch[2].padStart(2, '0')}`;
    return '--/--';
};

export default function LiveIslandBlip({ title, windowText, growLeft = false }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const shortDate = toShortDateNoYear(windowText);
    const chipWidth = open ? 128 : 18;

    useEffect(() => {
        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, []);

    return (
        <div
            ref={rootRef}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: growLeft ? 'flex-end' : 'flex-start',
                width: chipWidth,
                flexShrink: 0,
                transition: 'width 220ms ease'
            }}
        >
            <style>{`
                @keyframes island-live-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.48); }
                    50% { opacity: 0.66; transform: scale(0.88); box-shadow: 0 0 0 7px rgba(239, 68, 68, 0); }
                }
                @keyframes island-blip-glow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.42), 0 6px 12px rgba(15,23,42,0.24); }
                    50% { box-shadow: 0 0 0 7px rgba(239,68,68,0), 0 6px 12px rgba(15,23,42,0.24); }
                }
            `}</style>
            <button
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Live class status"
                style={{
                    height: 18,
                    width: '100%',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.35)',
                    background: open
                        ? 'linear-gradient(135deg, rgba(185,28,28,0.96), rgba(239,68,68,0.96))'
                        : '#ef4444',
                    padding: open ? '0 7px 0 5px' : 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: open ? 'flex-start' : 'center',
                    gap: open ? 6 : 0,
                    transition: 'width 220ms ease, background 220ms ease, padding 220ms ease',
                    boxShadow: '0 6px 12px rgba(15,23,42,0.24)',
                    animation: 'island-blip-glow 1.35s ease-in-out infinite',
                    cursor: 'pointer',
                    overflow: 'hidden'
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: open ? '0 7px 0 5px' : 0,
                    pointerEvents: 'none',
                    color: '#fff',
                    width: '100%',
                    transition: 'padding 220ms ease',
                    overflow: 'hidden',
                    borderRadius: 999
                }}
            >
                <span
                    style={{
                        width: 9,
                        height: 9,
                        minWidth: 9,
                        borderRadius: '50%',
                        background: '#ef4444',
                        border: open ? '1px solid rgba(255,255,255,0.8)' : 'none',
                        animation: 'island-live-pulse 1.4s ease-in-out infinite'
                    }}
                />
                <span style={{ fontSize: 9, fontWeight: 600, whiteSpace: 'nowrap', opacity: open ? 1 : 0, transition: 'opacity 180ms ease' }}>
                    SSB
                </span>
                <span style={{ fontSize: 8, fontWeight: 500, opacity: open ? 0.9 : 0, whiteSpace: 'nowrap', transition: 'opacity 180ms ease' }}>
                    {shortDate}
                </span>
            </div>
        </div>
    );
}
