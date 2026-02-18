import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import RoomRenderer from '../components/game/RoomRenderer';
import { Heart, ArrowLeft, Zap, Trophy, MapPin, Star, Package, Gamepad2 } from 'lucide-react';
import { GAME_LEVELS, GAME_ITEMS } from '../constants';

/**
 * PublicStudioPage
 * Lets any logged-in builder visit another builder's studio room and give a like.
 */
export default function PublicStudioPage({ targetUserId, targetUserName, session, onBack }) {
    const [gameState, setGameState] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [likeCount, setLikeCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [liking, setLiking] = useState(false);

    useEffect(() => {
        if (targetUserId) {
            fetchStudioData();
        }
    }, [targetUserId]);

    const fetchStudioData = async () => {
        setLoading(true);
        try {
            // Fetch game state
            const { data: game } = await supabase
                .from('builder_game')
                .select('*')
                .eq('user_id', targetUserId)
                .maybeSingle();

            // Fetch profile
            const { data: prof } = await supabase
                .from('profiles')
                .select('full_name, district, role')
                .eq('id', targetUserId)
                .maybeSingle();

            // Fetch like count
            const { count } = await supabase
                .from('studio_likes')
                .select('*', { count: 'exact', head: true })
                .eq('target_user_id', targetUserId);

            // Check if current user already liked
            if (session?.user?.id) {
                const { data: myLike } = await supabase
                    .from('studio_likes')
                    .select('id')
                    .eq('target_user_id', targetUserId)
                    .eq('liker_user_id', session.user.id)
                    .maybeSingle();
                setHasLiked(!!myLike);
            }

            setGameState(game);
            setProfile(prof);
            setLikeCount(count || 0);
        } catch (err) {
            console.error('Error fetching public studio:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!session?.user?.id || liking) return;
        if (session.user.id === targetUserId) return; // Can't like yourself

        setLiking(true);
        try {
            if (hasLiked) {
                // Unlike
                await supabase
                    .from('studio_likes')
                    .delete()
                    .eq('target_user_id', targetUserId)
                    .eq('liker_user_id', session.user.id);
                setHasLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                // Like
                await supabase
                    .from('studio_likes')
                    .insert([{
                        target_user_id: targetUserId,
                        liker_user_id: session.user.id
                    }]);
                setHasLiked(true);
                setLikeCount(prev => prev + 1);
            }
        } catch (err) {
            console.error('Like error:', err);
        } finally {
            setLiking(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
            <div className="showcase-spinner" style={{ margin: '0 auto 16px' }} />
            <div>Loading studio...</div>
        </div>
    );

    const displayName = profile?.full_name || targetUserName || 'Builder';
    const level = gameState?.level || 1;
    const levelInfo = GAME_LEVELS.find(l => l.level === level) || GAME_LEVELS[0];
    const roomItems = gameState?.room_items || ['desk_basic'];
    const totalVibes = gameState?.total_vibes_earned || 0;
    const ownedItems = GAME_ITEMS.filter(item => roomItems.includes(item.id));
    const isSelf = session?.user?.id === targetUserId;

    return (
        <div style={{ padding: '20px', paddingBottom: '100px', maxWidth: '600px', margin: '0 auto' }}>
            {/* Back button */}
            <button
                onClick={onBack}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'none', border: '2px solid black', borderRadius: '8px',
                    padding: '8px 14px', fontWeight: '800', fontSize: '13px',
                    cursor: 'pointer', marginBottom: '20px',
                    boxShadow: '2px 2px 0px black'
                }}
            >
                <ArrowLeft size={14} /> Back
            </button>

            {/* Builder header */}
            <div className="neo-card" style={{ padding: '20px', marginBottom: '20px', border: '3px solid black', boxShadow: '6px 6px 0px black' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '16px',
                        background: 'var(--selangor-red)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px', fontWeight: '900', border: '3px solid black',
                        boxShadow: '4px 4px 0px black', flexShrink: 0
                    }}>
                        {displayName[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{displayName}'s Studio</h2>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className="pill pill-red" style={{ fontSize: '10px', padding: '2px 8px' }}>
                                Lv.{level} — {levelInfo.label}
                            </span>
                            {profile?.district && (
                                <span style={{ fontSize: '12px', fontWeight: '700', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <MapPin size={11} /> {profile.district}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, background: '#f9f9f9', border: '2px solid black', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#FFD700', textShadow: '1px 1px 0 black', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Star size={18} fill="#FFD700" color="#FFD700" />
                            {totalVibes.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.6, textTransform: 'uppercase' }}>Total Vibes</div>
                    </div>
                    <div style={{ flex: 1, background: '#f9f9f9', border: '2px solid black', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Package size={18} />
                            {ownedItems.length}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.6, textTransform: 'uppercase' }}>Items</div>
                    </div>
                    <div style={{ flex: 1, background: '#f9f9f9', border: '2px solid black', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: hasLiked ? '#CE1126' : 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Heart size={18} fill={hasLiked ? '#CE1126' : 'none'} color={hasLiked ? '#CE1126' : 'black'} />
                            {likeCount}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.6, textTransform: 'uppercase' }}>Likes</div>
                    </div>
                </div>
            </div>

            {/* Room */}
            <div className="neo-card" style={{ padding: '0', overflow: 'hidden', border: '3px solid black', marginBottom: '20px', background: '#ddd' }}>
                <div style={{ padding: '10px 16px', background: 'black', color: 'white', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={12} fill="yellow" color="yellow" /> {displayName.toUpperCase()}'S ROOM
                </div>
                <RoomRenderer items={roomItems} />
            </div>

            {/* Like button */}
            {!isSelf && session && (
                <button
                    onClick={handleLike}
                    disabled={liking}
                    style={{
                        width: '100%',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontSize: '16px',
                        fontWeight: '900',
                        border: '3px solid black',
                        borderRadius: '12px',
                        cursor: liking ? 'not-allowed' : 'pointer',
                        background: hasLiked ? '#CE1126' : 'white',
                        color: hasLiked ? 'white' : 'black',
                        boxShadow: hasLiked ? '4px 4px 0px black' : '4px 4px 0px black',
                        transition: 'all 0.2s',
                        marginBottom: '16px'
                    }}
                >
                    <Heart size={20} fill={hasLiked ? 'white' : 'none'} />
                    {hasLiked ? `LIKED! (${likeCount})` : `GIVE A LIKE (${likeCount})`}
                </button>
            )}

            {isSelf && (
                <div style={{ textAlign: 'center', padding: '12px', background: '#f0f0f0', borderRadius: '10px', border: '2px solid #ddd', fontSize: '13px', fontWeight: '700', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Gamepad2 size={14} /> This is your own studio — visit other builders to give likes!
                </div>
            )}

            {!session && (
                <div style={{ textAlign: 'center', padding: '12px', background: '#fff8dc', borderRadius: '10px', border: '2px solid black', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Heart size={14} /> Log in to give this builder a like!
                </div>
            )}

            {/* Items owned */}
            {ownedItems.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Room Items</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {ownedItems.map(item => (
                            <div key={item.id} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'white', border: '2px solid black', borderRadius: '8px',
                                padding: '6px 10px', fontSize: '12px', fontWeight: '700',
                                boxShadow: '2px 2px 0px black'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={12} fill="#FFD700" color="#FFD700" /> {item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
