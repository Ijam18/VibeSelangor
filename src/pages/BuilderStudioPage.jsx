import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ToastNotification';
import RoomRenderer from '../components/game/RoomRenderer';
import ItemShop from '../components/game/ItemShop';
import BugSquash from '../components/game/BugSquash';
import { calculateIdleVibes, getLevelFromXP, canAfford, processPurchase, calculateBuildRate } from '../lib/gameEngine';
import { ShoppingBag, Zap, Clock, X, AlertCircle, RefreshCw, Star } from 'lucide-react';
import { GAME_LEVELS } from '../constants';

export default function BuilderStudioPage({ session }) {
    const { addToast } = useToast();
    const [gameState, setGameState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showShop, setShowShop] = useState(false);
    const [playingBugSquash, setPlayingBugSquash] = useState(false);
    const [idleEarnings, setIdleEarnings] = useState(0);

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
                const earnings = calculateIdleVibes(data.last_idle_claim, data.build_rate);
                setIdleEarnings(earnings);
            } else {
                // No row yet — try to insert a new one
                const newGame = {
                    user_id: session.user.id,
                    vibes: 0,
                    total_vibes_earned: 0,
                    level: 1,
                    xp: 0,
                    build_rate: 1,
                    room_items: ['desk_basic'],
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
                build_rate: 1,
                room_items: ['desk_basic'],
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

    const handleClaimIdle = async () => {
        if (idleEarnings <= 0) return;
        const newVibes = (gameState.vibes || 0) + idleEarnings;
        const newTotal = (gameState.total_vibes_earned || 0) + idleEarnings;
        const now = new Date().toISOString();
        try {
            await saveToDb({ vibes: newVibes, total_vibes_earned: newTotal, last_idle_claim: now });
            setGameState(prev => ({ ...prev, vibes: newVibes, total_vibes_earned: newTotal, last_idle_claim: now }));
            addToast(`Collected ${idleEarnings} Vibes from idle coding!`, 'success');
            setIdleEarnings(0);
        } catch (err) {
            addToast('Failed to claim vibes: ' + err.message, 'error');
        }
    };

    const handlePurchaseItem = async (item) => {
        const { success, error, newVibes } = processPurchase(item.id, gameState.vibes, gameState.room_items || []);
        if (!success) { addToast(error, 'error'); return; }

        const newItems = [...(gameState.room_items || []), item.id];
        const newBuildRate = calculateBuildRate(newItems);
        const newXP = (gameState.xp || 0) + 10;
        const newLevel = getLevelFromXP(newXP);

        try {
            await saveToDb({ vibes: newVibes, room_items: newItems, build_rate: newBuildRate, xp: newXP, level: newLevel });
            setGameState(prev => ({ ...prev, vibes: newVibes, room_items: newItems, build_rate: newBuildRate, xp: newXP, level: newLevel }));
            addToast(`Bought ${item.name}!`, 'success');
            if (newLevel > gameState.level) addToast(`LEVEL UP! You are now Level ${newLevel}!`, 'success');
        } catch (err) {
            addToast('Purchase failed: ' + err.message, 'error');
        }
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
                    &nbsp;&nbsp;build_rate int default 1,<br />
                    &nbsp;&nbsp;room_items text[] default ARRAY['desk_basic'],<br />
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

            {/* Arcade Hero Area */}
            <div className="neo-card" style={{
                padding: '40px 20px',
                textAlign: 'center',
                border: '3px solid black',
                boxShadow: '8px 8px 0 black',
                background: '#fff',
                borderRadius: '16px'
            }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🐛</div>
                <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px' }}>Bug Squash Mini-Game</h3>
                <p style={{ color: '#666', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
                    Squash as many bugs as you can in 30 seconds! <br />
                    Each bug earns you Vibes to level up your builder rank.
                </p>

                <button
                    className="btn btn-red"
                    onClick={() => setPlayingBugSquash(true)}
                    style={{
                        width: '100%',
                        maxWidth: '280px',
                        padding: '18px',
                        fontSize: '18px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                    }}
                >
                    <Zap size={20} fill="currentColor" color="gold" /> START SQUASHING
                </button>
            </div>

            {/* Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                <div className="neo-card" style={{ border: '2px solid black', padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', marginBottom: '5px' }}>📈</div>
                    <div style={{ fontSize: '11px', fontWeight: '800', opacity: 0.6 }}>BUILD RATE</div>
                    <div style={{ fontSize: '16px', fontWeight: '900' }}>{gameState.build_rate} V/hr</div>
                </div>
                <div className="neo-card" style={{ border: '2px solid black', padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', marginBottom: '5px' }}>📅</div>
                    <div style={{ fontSize: '11px', fontWeight: '800', opacity: 0.6 }}>IDLE CLAIM</div>
                    <div style={{ fontSize: '16px', fontWeight: '900' }}>Ready</div>
                </div>
            </div>

            {/* Idle Claim */}
            {idleEarnings > 0 && (
                <button
                    onClick={handleClaimIdle}
                    className="btn btn-outline"
                    style={{ width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', fontSize: '15px', border: '2px solid black' }}
                >
                    <Clock size={18} /> CLAIM {idleEarnings} IDLE VIBES
                </button>
            )}
        </div>
    );
}
