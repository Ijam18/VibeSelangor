import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    MessageSquare,
    Star,
    Map,
    CircleHelp,
    Zap,
    X,
    SendHorizontal,
    Settings,
    Folder
} from 'lucide-react';
import LiveIslandBlip from './LiveIslandBlip';
import { supabase } from '../lib/supabase';
import MobileStatusBar from './MobileStatusBar';

const ICON_LIBRARY = {
    forum: { id: 'forum', label: 'Forum', icon: MessageSquare, bg: 'linear-gradient(160deg, #dc2626, #991b1b)' },
    showcase: { id: 'showcase', label: 'Showcase', icon: Star, bg: 'linear-gradient(160deg, #f59e0b, #d97706)' },
    map: { id: 'map', label: 'Map', icon: Map, bg: 'linear-gradient(160deg, #ef4444, #b91c1c)' },
    'how-it-works': { id: 'how-it-works', label: 'How?', icon: CircleHelp, bg: 'linear-gradient(160deg, #f97316, #ea580c)' },
    ijamos: { id: 'ijamos', label: 'IjamOS', icon: Zap, bg: 'linear-gradient(160deg, #ef4444, #b91c1c)' },
    myapp: { id: 'myapp', label: 'BuilderVault', icon: Folder, bg: 'linear-gradient(160deg, #f59e0b, #d97706)' },
    settings: { id: 'settings', label: 'Settings', icon: Settings, bg: 'linear-gradient(160deg, #b91c1c, #7f1d1d)' },
    kd: { id: 'kd', label: 'KD', icon: null, imageSrc: 'https://www.google.com/s2/favicons?sz=64&domain=krackeddevs.com', bg: '#000000' }
};

const STORAGE_KEY = 'mobile_home_icon_layout_v5';
const DEFAULT_LAYOUT = ['ijamos', 'myapp', 'settings', 'kd'];

function loadLayout() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_LAYOUT;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return DEFAULT_LAYOUT;
        const valid = parsed.filter((id) => ICON_LIBRARY[id]);
        for (const pinned of ['ijamos', 'myapp', 'settings', 'kd']) {
            if (!valid.includes(pinned)) valid.push(pinned);
        }
        return Array.from(new Set(valid));
    } catch {
        return DEFAULT_LAYOUT;
    }
}

export default function MobileHomeScreen({
    weatherData,
    onNavigate,
    onSendChat,
    chatMessages = [],
    chatInput = '',
    onChatInputChange,
    isAiLoading = false,
    buildersCount = 0,
    terminalContext = '',
    terminalTime = '',
    typedCommand = '',
    typingPhase = 'done',
    typedTimestamp = '',
    typedGreeting = '',
    liveStatusText = '',
    liveEventMessage = '',
    programTerminalLines = [],
    isTabletView = false,
    liveBlip = null,
    session = null,
    activeClass = null,
    terminalMode = 'ijam',
    onTerminalModeChange = () => {}
}) {
    const [now, setNow] = useState(new Date());
    const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 390));
    const [viewportHeight, setViewportHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 844));
    const [islandIndex, setIslandIndex] = useState(0);
    const [iconOrder, setIconOrder] = useState(DEFAULT_LAYOUT);
    const [batteryPct, setBatteryPct] = useState('--%');
    const [editMode, setEditMode] = useState(false);
    const [showAddSheet, setShowAddSheet] = useState(false);
    const [draggingId, setDraggingId] = useState(null);
    const longPressTimer = useRef(null);
    const iconRefs = useRef({});
    const terminalScrollRef = useRef(null);
    const lastNavigateRef = useRef({ id: null, ts: 0 });
    const [terminalView, setTerminalView] = useState(terminalMode === 'live' ? 'live' : 'ijam');
    const [liveMessages, setLiveMessages] = useState([]);
    const [liveInput, setLiveInput] = useState('');
    const [liveLoading, setLiveLoading] = useState(false);

    const triggerHaptic = (ms = 10) => {
        if (window.matchMedia('(max-width: 1024px)').matches && navigator.vibrate) {
            navigator.vibrate(ms);
        }
    };

    useEffect(() => {
        setIconOrder(loadLayout());
        const clockTimer = setInterval(() => setNow(new Date()), 30000);
        const islandTimer = setInterval(() => setIslandIndex((prev) => (prev + 1) % 3), 3400);
        const handleResize = () => {
            setViewportWidth(window.innerWidth);
            setViewportHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(clockTimer);
            clearInterval(islandTimer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        let battery = null;
        const handleBatteryUpdate = () => {
            if (!battery) return;
            setBatteryPct(`${Math.round((battery.level || 0) * 100)}%`);
        };

        if (typeof navigator === 'undefined' || !navigator.getBattery) {
            setBatteryPct('--%');
            return undefined;
        }

        navigator.getBattery().then((manager) => {
            battery = manager;
            handleBatteryUpdate();
            battery.addEventListener('levelchange', handleBatteryUpdate);
            battery.addEventListener('chargingchange', handleBatteryUpdate);
        }).catch(() => setBatteryPct('--%'));

        return () => {
            if (!battery) return;
            battery.removeEventListener('levelchange', handleBatteryUpdate);
            battery.removeEventListener('chargingchange', handleBatteryUpdate);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(iconOrder));
    }, [iconOrder]);

    useEffect(() => () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }, []);

    useEffect(() => {
        if (!terminalScrollRef.current) return;
        terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }, [chatMessages, isAiLoading, liveMessages, terminalView]);

    useEffect(() => {
        setTerminalView(terminalMode === 'live' ? 'live' : 'ijam');
    }, [terminalMode]);

    useEffect(() => {
        if (terminalView !== 'live' || !activeClass?.id) return undefined;
        let isCancelled = false;
        let channel = null;

        const loadLiveMessages = async () => {
            setLiveLoading(true);
            const { data } = await supabase
                .from('class_chat')
                .select('*')
                .eq('class_id', activeClass.id)
                .order('created_at', { ascending: true })
                .limit(100);
            if (!isCancelled) {
                setLiveMessages(data || []);
                setLiveLoading(false);
            }
        };

        loadLiveMessages();

        channel = supabase
            .channel(`class_chat_mobile_${activeClass.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'class_chat', filter: `class_id=eq.${activeClass.id}` },
                (payload) => {
                    setLiveMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            isCancelled = true;
            if (channel) supabase.removeChannel(channel);
        };
    }, [terminalView, activeClass?.id]);

    const islandMessages = [
        'VibeSelangor Online',
        `${buildersCount} Builders Active`,
        `${weatherData?.temp ?? '--'}C | ${weatherData?.condition ?? 'Weather'}`
    ];

    const visibleIcons = useMemo(() => iconOrder.map((id) => ICON_LIBRARY[id]).filter(Boolean), [iconOrder]);
    const hiddenIcons = useMemo(() => Object.values(ICON_LIBRARY).filter((item) => !iconOrder.includes(item.id)), [iconOrder]);
    const isPhonePortrait = viewportWidth <= 430;
    const isPhoneLandscape = viewportWidth > 430 && viewportWidth <= 699;
    const iconBoxSize = isTabletView ? 72 : (viewportWidth <= 360 ? 50 : viewportWidth <= 430 ? 56 : viewportWidth <= 699 ? 60 : viewportWidth <= 860 ? 64 : 68);
    const iconGridCols = isTabletView ? 6 : (isPhonePortrait ? 4 : isPhoneLandscape ? 5 : 6);
    const shellPadding = isPhonePortrait
        ? '10px 12px 108px'
        : isPhoneLandscape
            ? '10px 14px 112px'
            : (isTabletView ? '14px 28px 124px' : '12px 20px 118px');
    const shellMaxWidth = isTabletView ? 1024 : (isPhonePortrait ? 480 : isPhoneLandscape ? 700 : 980);
    const featureHeight = Math.max(560, viewportHeight - 84);
    const terminalHeight = isPhonePortrait
        ? Math.max(320, Math.min(430, Math.round(featureHeight * 0.58)))
        : isPhoneLandscape
            ? Math.max(250, Math.min(340, Math.round(featureHeight * 0.46)))
            : (isTabletView ? Math.max(240, Math.min(320, Math.round(featureHeight * 0.36))) : Math.max(320, Math.min(460, Math.round(featureHeight * 0.54))));

    const cancelLongPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const beginLongPress = (id) => {
        cancelLongPress();
        longPressTimer.current = setTimeout(() => {
            setEditMode(true);
            triggerHaptic(15);
            setDraggingId(id);
        }, 420);
    };

    const reorderToTarget = (sourceId, clientX, clientY) => {
        const target = visibleIcons
            .map((item) => {
                const rect = iconRefs.current[item.id]?.getBoundingClientRect?.();
                if (!rect) return null;
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                return { id: item.id, distance: Math.hypot(clientX - cx, clientY - cy) };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)[0];

        if (!target || target.id === sourceId) return;

        setIconOrder((prev) => {
            const from = prev.indexOf(sourceId);
            const to = prev.indexOf(target.id);
            if (from < 0 || to < 0) return prev;
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    };

    const handleIconPointerDown = (event, id) => {
        triggerHaptic(8);
        if (!editMode) {
            beginLongPress(id);
            return;
        }
        setDraggingId(id);
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const handleIconPointerMove = (event) => {
        if (!editMode || !draggingId) return;
        reorderToTarget(draggingId, event.clientX, event.clientY);
    };

    const handleIconPointerUp = (event, id) => {
        cancelLongPress();

        if (editMode && draggingId) {
            reorderToTarget(draggingId, event.clientX, event.clientY);
            setDraggingId(null);
            return;
        }
    };

    const handleIconClick = (id) => {
        if (editMode || draggingId) return;
        const nowTs = Date.now();
        if (lastNavigateRef.current.id === id && nowTs - lastNavigateRef.current.ts < 420) return;
        lastNavigateRef.current = { id, ts: nowTs };
        triggerHaptic(10);
        onNavigate?.(id);
    };

    const removeIcon = (id) => {
        if (['ijamos', 'myapp', 'settings', 'kd'].includes(id)) return;
        triggerHaptic(12);
        setIconOrder((prev) => prev.filter((iconId) => iconId !== id));
    };

    const addIcon = (id) => {
        triggerHaptic(12);
        setIconOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const sendFromInput = () => {
        const value = chatInput.trim();
        if (!value || isAiLoading) return;
        triggerHaptic(12);
        onSendChat?.(value);
        onChatInputChange?.('');
    };

    const switchTerminalMode = (nextMode) => {
        setTerminalView(nextMode);
        onTerminalModeChange?.(nextMode);
        triggerHaptic(10);
    };

    const sendLiveMessage = async () => {
        const text = liveInput.trim();
        if (!text || !activeClass?.id || !session?.user) return;
        triggerHaptic(12);
        setLiveInput('');
        const optimistic = {
            id: `temp-${Date.now()}`,
            class_id: activeClass.id,
            user_id: session.user.id,
            builder_name: session.user.user_metadata?.full_name || 'Builder',
            message: text,
            created_at: new Date().toISOString()
        };
        setLiveMessages((prev) => [...prev, optimistic]);
        const { data, error } = await supabase
            .from('class_chat')
            .insert([{
                class_id: activeClass.id,
                user_id: session.user.id,
                builder_name: session.user.user_metadata?.full_name || 'Builder',
                message: text
            }])
            .select('*')
            .single();
        if (error) {
            setLiveMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
            return;
        }
        setLiveMessages((prev) => prev.map((m) => (m.id === optimistic.id ? data : m)));
    };
    const terminalPanel = (
        <div style={{ background: 'rgba(255,244,244,0.42)', backdropFilter: 'blur(16px) saturate(1.06)', borderRadius: 22, padding: 12, border: '1px solid rgba(255,255,255,0.55)', minHeight: isTabletView ? '48vh' : '62vh', display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 10, opacity: 0.72, fontWeight: 900 }}>IJAM TERMINAL</div>
                <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(15,23,42,0.9)', borderRadius: 999, padding: 3 }}>
                    <button
                        onClick={() => switchTerminalMode('ijam')}
                        style={{ height: 18, borderRadius: 999, border: terminalView === 'ijam' ? '1px solid rgba(180,83,9,0.35)' : '1px solid rgba(255,255,255,0.22)', background: terminalView === 'ijam' ? 'linear-gradient(135deg, #fde047, #f59e0b)' : 'rgba(255,255,255,0.1)', color: terminalView === 'ijam' ? '#0f172a' : '#fff', fontSize: 9, fontWeight: 600, lineHeight: 1, padding: '0 8px' }}
                    >
                        IJAM
                    </button>
                    <button
                        onClick={() => switchTerminalMode('live')}
                        style={{ height: 18, borderRadius: 999, border: terminalView === 'live' ? '1px solid rgba(190,18,60,0.35)' : '1px solid rgba(255,255,255,0.22)', background: terminalView === 'live' ? 'linear-gradient(135deg, #ef4444, #be123c)' : 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 9, fontWeight: 600, lineHeight: 1, padding: '0 8px' }}
                    >
                        LIVE CHAT
                    </button>
                </div>
            </div>

            <div
                ref={terminalScrollRef}
                style={{
                    background: '#020617',
                    borderRadius: 14,
                    padding: '12px 12px 10px',
                    marginBottom: 10,
                    border: '1px solid #111827',
                    minHeight: terminalHeight,
                    maxHeight: terminalHeight,
                    overflowY: 'auto'
                }}
            >
                {terminalView === 'ijam' ? (
                    <>
                        <div style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: 10, lineHeight: 1.45, display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ wordBreak: 'break-word' }}>{terminalContext}</span>
                            <span style={{ opacity: 0.72 }}>{terminalTime}</span>
                        </div>

                        <div style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: 12, marginTop: 8 }}>
                            {typedCommand}
                            {typingPhase === 'command' && <span style={{ opacity: 0.8 }}>|</span>}
                        </div>

                        {typingPhase !== 'command' && (
                            <div style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: 10, lineHeight: 1.5, marginTop: 8 }}>
                                <div>{liveStatusText}</div>
                                {liveEventMessage && <div>[LIVE EVENT] {liveEventMessage}</div>}
                                {programTerminalLines.map((line) => (
                                    <div key={line}>{line}</div>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ color: '#ef4444', fontSize: 9, fontWeight: 900, fontFamily: 'monospace' }}>IJAM_BOT</span>
                                <span style={{ color: '#64748b', fontSize: 9, fontFamily: 'monospace' }}>{typedTimestamp}</span>
                            </div>
                            <p style={{ color: '#22c55e', fontWeight: 700, fontFamily: 'monospace', fontSize: 11, lineHeight: 1.4, margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
                                {typedGreeting}
                                {typingPhase === 'greeting' && <span style={{ opacity: 0.9 }}>|</span>}
                            </p>
                        </div>

                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {chatMessages.slice(-5).map((msg, idx) => {
                                const isUser = msg.role === 'user';
                                return (
                                    <div key={`${idx}-${msg.text || msg.role}`} style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '92%' }}>
                                        <div style={{ fontSize: 9, opacity: 0.66, marginBottom: 2, textAlign: isUser ? 'right' : 'left', color: isUser ? '#cbd5e1' : '#94a3b8' }}>
                                            {isUser ? 'YOU' : 'IJAM_BOT'}
                                        </div>
                                        <div style={{ background: isUser ? '#0f172a' : '#111827', color: '#f8fafc', borderRadius: 10, padding: '7px 9px', border: '1px solid rgba(148,163,184,0.2)', fontSize: 11, fontWeight: 600, lineHeight: 1.35, whiteSpace: 'pre-wrap' }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: 10, lineHeight: 1.45, display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                            <span>[LIVE CHAT] {activeClass?.title || 'No active class'}</span>
                            <span style={{ opacity: 0.72 }}>{terminalTime}</span>
                        </div>
                        {!activeClass && (
                            <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                                No active class. Ask admin to set class status to Active.
                            </div>
                        )}
                        {activeClass && liveLoading && (
                            <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>Connecting live chat...</div>
                        )}
                        {activeClass && (
                            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {liveMessages.slice(-60).map((msg, idx) => {
                                    const isUser = msg.user_id === session?.user?.id;
                                    return (
                                        <div key={`${msg.id || idx}-${msg.created_at || idx}`} style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '92%' }}>
                                            <div style={{ fontSize: 9, opacity: 0.66, marginBottom: 2, textAlign: isUser ? 'right' : 'left', color: isUser ? '#cbd5e1' : '#94a3b8' }}>
                                                {isUser ? 'YOU' : (msg.builder_name || 'BUILDER')}
                                            </div>
                                            <div style={{ background: isUser ? '#0f172a' : '#111827', color: '#f8fafc', borderRadius: 10, padding: '7px 9px', border: '1px solid rgba(148,163,184,0.2)', fontSize: 11, fontWeight: 600, lineHeight: 1.35, whiteSpace: 'pre-wrap' }}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (terminalView === 'live') sendLiveMessage();
                    else sendFromInput();
                }}
                style={{ display: 'flex', gap: 8 }}
            >
                <input
                    value={terminalView === 'live' ? liveInput : chatInput}
                    onChange={(event) => {
                        if (terminalView === 'live') setLiveInput(event.target.value);
                        else onChatInputChange?.(event.target.value);
                    }}
                    onPointerDown={() => triggerHaptic(6)}
                    placeholder={
                        terminalView === 'live'
                            ? (activeClass ? (session?.user ? 'Type to Live Chat...' : 'Login to chat') : 'No active class')
                            : (isAiLoading ? 'Thinking...' : 'Type to IJAM_BOT...')
                    }
                    disabled={terminalView === 'live' ? (!activeClass || !session?.user) : isAiLoading}
                    style={{
                        flex: 1,
                        borderRadius: 12,
                        border: '1px solid #d1d5db',
                        padding: '10px 12px',
                        fontSize: 12,
                        background: '#fff'
                    }}
                />
                <button
                    type="submit"
                    disabled={terminalView === 'live' ? (!liveInput.trim() || !activeClass || !session?.user) : isAiLoading}
                    onPointerDown={() => triggerHaptic(10)}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: '1px solid rgba(148,163,184,0.42)',
                        background: 'rgba(255,255,255,0.85)',
                        color: '#0f172a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 6px 14px rgba(15,23,42,0.1)',
                        cursor: 'pointer'
                    }}
                >
                    <SendHorizontal size={14} />
                </button>
            </form>
        </div>
    );

    return (
        <section
            style={{
                padding: shellPadding,
                height: 'var(--app-vh, 100vh)',
                overflow: 'hidden',
                touchAction: editMode ? 'none' : 'pan-x',
                position: 'relative',
                background: 'transparent'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backdropFilter: 'blur(8px) saturate(1.08)',
                    background: 'linear-gradient(180deg, rgba(17,24,39,0.24) 0%, rgba(17,24,39,0.08) 40%, rgba(255,255,255,0.05) 100%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />
            <div style={{ width: '100%', maxWidth: shellMaxWidth, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <MobileStatusBar
                    timeLabel={now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    batteryPct={batteryPct}
                    marginBottom={8}
                    centerContent={(
                        <div
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: isPhonePortrait ? 'min(52%, 214px)' : isPhoneLandscape ? 'min(46%, 250px)' : 'min(38%, 280px)',
                                background: 'rgba(10,10,10,0.95)',
                                color: '#fff',
                                borderRadius: 14,
                                padding: '5px 10px',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 6,
                                fontSize: 10,
                                fontWeight: 600,
                                lineHeight: 1.15,
                                boxShadow: '0 8px 18px rgba(0,0,0,0.2)',
                                pointerEvents: 'auto',
                                overflow: 'hidden'
                            }}
                        >
                            <span style={{ pointerEvents: 'none', flex: 1, minWidth: 0, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {islandMessages[islandIndex]}
                            </span>
                            {liveBlip?.isLive && (
                                <LiveIslandBlip title={liveBlip.title} windowText={liveBlip.windowText} />
                            )}
                        </div>
                    )}
                />

                {terminalPanel}

                {showAddSheet && (
                    <div style={{ background: 'rgba(255,244,244,0.42)', backdropFilter: 'blur(14px) saturate(1.06)', borderRadius: 16, padding: 10, marginBottom: 12, border: '1px solid rgba(255,255,255,0.55)' }}>
                        <div style={{ fontSize: 10, fontWeight: 900, marginBottom: 8, opacity: 0.7 }}>Add App Icon</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {hiddenIcons.length === 0 && <span style={{ fontSize: 11, opacity: 0.75 }}>All icons already added.</span>}
                            {hiddenIcons.map((item) => (
                                <button key={item.id} className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 10 }} onClick={() => addIcon(item.id)}>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div
                    style={{ display: 'grid', gridTemplateColumns: `repeat(${iconGridCols}, minmax(0, 1fr))`, gap: viewportWidth >= 700 ? 14 : 12, marginTop: 20, marginBottom: 14, touchAction: editMode ? 'none' : 'pan-x' }}
                    onPointerMove={handleIconPointerMove}
                >
                    {visibleIcons.map((item, index) => {
                        const Icon = item.icon;
                        const isDragging = draggingId === item.id;
                        return (
                            <div
                                key={item.id}
                                ref={(el) => {
                                    iconRefs.current[item.id] = el;
                                }}
                                style={{
                                    position: 'relative',
                                    transform: isDragging ? 'scale(1.06)' : editMode ? `rotate(${index % 2 === 0 ? -1.5 : 1.5}deg)` : 'none',
                                    opacity: isDragging ? 0.92 : 1,
                                    transition: 'transform 120ms ease, opacity 120ms ease'
                                }}
                            >
                                {editMode && !['ijamos', 'myapp', 'settings', 'kd'].includes(item.id) && (
                                    <button
                                        onClick={() => removeIcon(item.id)}
                                        style={{
                                            position: 'absolute',
                                            top: -6,
                                            right: 2,
                                            width: 18,
                                            height: 18,
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: '#0f172a',
                                            color: '#fff',
                                            zIndex: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <X size={11} />
                                    </button>
                                )}

                                <button
                                    onPointerDown={(e) => handleIconPointerDown(e, item.id)}
                                    onPointerUp={(e) => handleIconPointerUp(e, item.id)}
                                    onPointerCancel={cancelLongPress}
                                    onPointerLeave={cancelLongPress}
                                    onClick={() => handleIconClick(item.id)}
                                    style={{ border: 'none', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%', cursor: 'pointer', minWidth: 0 }}
                                >
                                    <div
                                        style={{
                                            width: iconBoxSize,
                                            height: iconBoxSize,
                                            borderRadius: 16,
                                            background: item.bg,
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid rgba(253,224,71,0.55)',
                                            boxShadow: '0 8px 16px rgba(127,29,29,0.3), inset 0 1px 0 rgba(255,255,255,0.24)',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {item.imageSrc ? (
                                            <img
                                                src={item.imageSrc}
                                                alt={`${item.label} logo`}
                                                onError={(event) => {
                                                    if (item.id === 'kd' && event.currentTarget.src !== `${window.location.origin}/icons/kd-logo.svg`) {
                                                        event.currentTarget.src = '/icons/kd-logo.svg';
                                                    }
                                                }}
                                                style={{ width: '100%', height: '100%', objectFit: item.id === 'kd' ? 'contain' : 'cover', background: item.id === 'kd' ? '#000' : 'transparent' }}
                                            />
                                        ) : (
                                            <Icon size={Math.max(20, Math.round(iconBoxSize * 0.42))} />
                                        )}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 'clamp(9px, 2.3vw, 11px)',
                                            fontWeight: 600,
                                            color: '#0f172a',
                                            width: '100%',
                                            maxWidth: iconBoxSize + 8,
                                            textAlign: 'center',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            lineHeight: 1.15
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </div>

            </div>

        </section>
    );
}
