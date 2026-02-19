import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ToastNotification';
import { Bug, Zap, RefreshCw, Star, Trophy } from 'lucide-react';
import BugSquash from '../components/game/BugSquash';
import { GAME_LEVELS } from '../constants';

export default function BuilderStudioPage({ session }) {
    const { addToast } = useToast();
    const [gameState, setGameState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [playingBugSquash, setPlayingBugSquash] = useState(false);

    useEffect(() => {
        if (session?.user?.id) {
            fetchGameData();
        }
    }, [session]);

    const fetchGameData = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('builder_game')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setGameState(data);
            } else {
                // No row yet — try to insert a new one
                const newGame = {
                    user_id: session.user.id,
                    vibes: 0,
                    total_vibes_earned: 0,
                    level: 1,
                    xp: 0,
                    last_idle_claim: new Date().toISOString()
                };
                const { data: inserted, error: insertError } = await supabase
                    .from('builder_game')
                    .insert([newGame])
                    .select()
                    .single();

                if (insertError) {
                    // RLS or table missing — fall back to local demo state
                    console.warn('builder_game insert failed (RLS/missing table), using local state:', insertError.message);
                    setGameState({ ...newGame, id: 'local', _isLocal: true });
                } else {
                    setGameState(inserted);
                }
            }
        } catch (err) {
            console.warn('builder_game fetch failed, using local state:', err.message);
            // Table missing or RLS blocks read — use local demo state
            setGameState({
                id: 'local',
                _isLocal: true,
                user_id: session.user.id,
                vibes: 0,
                total_vibes_earned: 0,
                level: 1,
                xp: 0,
                last_idle_claim: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper: save to DB only if not in local mode
    const saveToDb = async (updates) => {
        if (gameState?._isLocal) return; // skip DB in local/demo mode
        const { error } = await supabase
            .from('builder_game')
            .update(updates)
            .eq('id', gameState.id);
        if (error) throw error;
    };



    const handleBugSquashComplete = async (score) => {
        setPlayingBugSquash(false);
        if (score > 0) {
            const newVibes = (gameState.vibes || 0) + score;
            try {
                await saveToDb({ vibes: newVibes });
                setGameState(prev => ({ ...prev, vibes: newVibes }));
                addToast(`Squashed bugs! +${score} Vibes`, 'success');
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <div>Loading Studio...</div>
        </div>
    );
    if (!gameState) return (
        <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
            <AlertCircle size={48} color="#CE1126" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontWeight: 900, marginBottom: '8px', fontSize: '20px' }}>Could not load Builder Studio</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
                The <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>builder_game</code> table may be missing or you don't have access yet.
            </p>
            <div style={{ background: '#f9f9f9', border: '2px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fix: Run this in Supabase SQL Editor</div>
                <code style={{ fontSize: '11px', fontFamily: 'monospace', color: '#CE1126', display: 'block', lineHeight: 1.8 }}>
                    create table if not exists builder_game (<br />
                    &nbsp;&nbsp;id uuid default gen_random_uuid() primary key,<br />
                    &nbsp;&nbsp;user_id uuid references auth.users(id) unique,<br />
                    &nbsp;&nbsp;vibes int default 0,<br />
                    &nbsp;&nbsp;total_vibes_earned int default 0,<br />
                    &nbsp;&nbsp;level int default 1,<br />
                    &nbsp;&nbsp;xp int default 0,<br />
                    &nbsp;&nbsp;xp int default 0,<br />
                    &nbsp;&nbsp;last_idle_claim timestamptz default now()<br />
                    );
                </code>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-red" style={{ padding: '10px 24px' }} onClick={fetchGameData}>
                    <RefreshCw size={14} style={{ marginRight: '6px' }} /> Retry
                </button>
                <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ padding: '10px 24px', textDecoration: 'none', fontSize: '13px' }}
                >
                    Open Supabase →
                </a>
            </div>
        </div>
    );

    const currentLevel = gameState.level || 1;
    const levelInfo = GAME_LEVELS.find(l => l.level === currentLevel) || GAME_LEVELS[0];
    const nextLevelInfo = GAME_LEVELS.find(l => l.level === currentLevel + 1);
    const currentXP = gameState.xp || 0;
    const xpForNext = nextLevelInfo ? nextLevelInfo.xpRequired : levelInfo.xpRequired;
    const xpProgress = nextLevelInfo
        ? Math.min(100, Math.round(((currentXP - levelInfo.xpRequired) / (xpForNext - levelInfo.xpRequired)) * 100))
        : 100;

    return (
        <div className="container" style={{ padding: '20px', paddingBottom: '100px', maxWidth: '600px', margin: '0 auto' }}>
            {playingBugSquash && (
                <BugSquash
                    onClose={() => setPlayingBugSquash(false)}
                    onSquash={(amount) => { }} // Local state in component handles accumulation
                    onComplete={handleBugSquashComplete}
                />
            )}

            <header style={{ marginBottom: '32px', textAlign: 'center' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '4px' }}>Builder Arcade</h2>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#CE1126', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Lv.{currentLevel} — {levelInfo.label}
                    </div>
                </div>

                <div style={{ background: 'white', border: '3px solid black', boxShadow: '8px 8px 0 black', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', opacity: 0.5, marginBottom: '4px' }}>CURRENT VIBES</div>
                            <div style={{ fontSize: '36px', fontWeight: '900', color: '#FFD700', textShadow: '2px 2px 0px black', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Star size={28} fill="#FFD700" color="black" strokeWidth={2.5} />
                                {gameState.vibes}
                            </div>
                        </div>
                    </div>
                </div>

                {/* XP Progress Bar */}
                <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '12px', overflow: 'hidden', border: '2px solid black', position: 'relative' }}>
                    <div style={{
                        height: '100%',
                        width: `${xpProgress}%`,
                        background: 'linear-gradient(90deg, #CE1126, #ff3a5c)',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', marginTop: '6px' }}>
                    <span>{currentXP} XP</span>
                    <span>{nextLevelInfo ? `${xpForNext} XP to Lv.${currentLevel + 1}` : 'MAX LEVEL'}</span>
                </div>
            </header>

            <div style={{ padding: '20px 20px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%', background: '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '4px solid black', boxShadow: '0 0 0 4px white, 0 0 0 7px black'
                    }}>
                        <Bug size={64} className="text-black" />
                    </div>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>BUG SQUASH CHALLENGE</h3>
                <p style={{ color: '#666', fontSize: '16px', maxWidth: '400px', margin: '0 auto 20px', lineHeight: 1.4 }}>
                    Test your reflexes! Squash bugs before time runs out to earn pure Vibes.
                </p>

                <button
                    className="btn btn-red"
                    onClick={() => setPlayingBugSquash(true)}
                    style={{
                        padding: '16px 32px',
                        fontSize: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '8px 8px 0 black',
                        transform: 'translate(-4px, -4px)',
                        border: '3px solid black'
                    }}
                >
                    <Zap size={28} fill="currentColor" color="gold" strokeWidth={2.5} />
                    PLAY NOW
                </button>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '30px', opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
                        <Trophy size={18} /> LEADERBOARD COMING SOON
                    </div>
                </div>
            </div>
        </div>
    );
}
