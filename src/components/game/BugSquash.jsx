import React, { useState, useEffect, useRef } from 'react';
import { Bug, X } from 'lucide-react';

const GAME_DURATION = 30; // seconds
const SPAWN_RATE = 800; // ms

export default function BugSquash({ onSquash, onComplete, onClose }) {
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [score, setScore] = useState(0);
    const [bugs, setBugs] = useState([]);
    const [gameActive, setGameActive] = useState(true);
    const containerRef = useRef(null);
    // Use ref to track live score in timer callback (avoids stale closure)
    const scoreRef = useRef(0);

    // Timer
    useEffect(() => {
        if (!gameActive) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameActive(false);
                    clearInterval(timer);
                    // Use scoreRef.current to get the actual live score
                    onComplete(scoreRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameActive, onComplete]);

    // Spawner
    useEffect(() => {
        if (!gameActive) return;
        const spawner = setInterval(() => {
            const newBug = {
                id: Date.now(),
                x: Math.random() * 80 + 10, // 10-90% width
                y: Math.random() * 80 + 10, // 10-90% height
                rotation: Math.random() * 360,
                speed: Math.random() * 0.5 + 0.5
            };
            setBugs((prev) => [...prev, newBug]);
        }, SPAWN_RATE);

        return () => clearInterval(spawner);
    }, [gameActive]);

    const handleSquash = (id) => {
        if (!gameActive) return;
        setBugs((prev) => prev.filter((b) => b.id !== id));
        setScore((prev) => {
            const next = prev + 5;
            scoreRef.current = next; // Keep ref in sync
            return next;
        });
        if (onSquash) onSquash(5);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
            zIndex: 10000, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            touchAction: 'none', // Prevent scroll while playing on mobile
            userSelect: 'none',
        }}>
            <div style={{ position: 'absolute', top: 20, right: 20 }}>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', minWidth: '44px', minHeight: '44px' }}
                >
                    <X size={32} />
                </button>
            </div>

            <div style={{ color: 'white', fontSize: '24px', fontWeight: '900', marginBottom: '20px', display: 'flex', gap: '40px' }}>
                <div>TIME: {timeLeft}s</div>
                <div style={{ color: '#FFD700' }}>VIBES: {score}</div>
            </div>

            <div
                ref={containerRef}
                style={{
                    width: '90vw',
                    height: '70vh',
                    border: '4px solid lime',
                    borderRadius: '20px',
                    background: '#111',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 0 20px lime'
                }}
            >
                {!gameActive && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.8)', zIndex: 10
                    }}>
                        <h2 style={{ color: 'lime', fontSize: '48px', textShadow: '0 0 10px lime' }}>GAME OVER</h2>
                        <p style={{ color: 'white', fontSize: '24px', margin: '20px 0' }}>Total Vibes Earned: {score}</p>
                        <button
                            onClick={onClose}
                            className="btn"
                            style={{ background: 'lime', color: 'black', fontWeight: '900', border: 'none', padding: '16px 32px', minHeight: '44px' }}
                        >
                            COLLECT & CLOSE
                        </button>
                    </div>
                )}

                {bugs.map((bug) => (
                    <div
                        key={bug.id}
                        onClick={() => handleSquash(bug.id)}
                        onTouchStart={(e) => { e.preventDefault(); handleSquash(bug.id); }}
                        style={{
                            position: 'absolute',
                            left: `${bug.x}%`,
                            top: `${bug.y}%`,
                            transform: `rotate(${bug.rotation}deg)`,
                            cursor: 'pointer',
                            transition: 'all 0.1s linear',
                            padding: '8px', // Larger touch target
                        }}
                    >
                        <Bug size={32} color="#ff3e3e" fill="#500" />
                    </div>
                ))}
            </div>
            <div style={{ color: '#666', marginTop: '20px', fontSize: '12px' }}>TAP BUGS TO EXTRACT VIBES</div>
        </div>
    );
}
