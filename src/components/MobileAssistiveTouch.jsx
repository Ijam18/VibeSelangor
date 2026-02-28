import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CircleHelp, Globe, Home, MapPin, MessageSquare, Trophy, Zap } from 'lucide-react';

const ASSISTIVE_POS_KEY = 'vs_assistive_touch_pos_v1';

const DEFAULT_ACTIONS = [
    { id: 'home', label: 'Home', nav: 'home', icon: Home },
    { id: 'forum', label: 'Forum', nav: 'forum', icon: MessageSquare },
    { id: 'showcase', label: 'Showcase', nav: 'showcase', icon: Trophy },
    { id: 'map', label: 'Map', nav: 'map', icon: MapPin },
    { id: 'ijamos', label: 'IjamOS', nav: 'ijamos', icon: Zap },
    { id: 'how', label: 'How?', nav: 'how-it-works', icon: CircleHelp },
    { id: 'chat', label: 'Chat', nav: 'chat', icon: MessageSquare },
    { id: 'leaderboard', label: 'Leaders', nav: 'leaderboard', icon: Trophy },
    { id: 'website', label: 'Website', nav: 'home', icon: Globe }
];

export default function MobileAssistiveTouch({ onNavigate }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(false);
    const [isMobileWidth, setIsMobileWidth] = useState(() => window.innerWidth <= 1024);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [viewport, setViewport] = useState({ w: 390, h: 844 });
    const idleTimer = useRef(null);
    const pointer = useRef({ dragging: false, moved: false, x: 0, y: 0, originX: 0, originY: 0 });
    const iconSize = viewport.w >= 700 ? 56 : 50;
    const logoSize = viewport.w >= 700 ? 42 : 38;
    const panelWidth = Math.min(252, Math.max(210, viewport.w - 16));
    const panelHeight = viewport.w >= 700 ? 192 : 176;
    const actions = DEFAULT_ACTIONS;

    const clampButtonPos = (nextPos, width = window.innerWidth, height = window.innerHeight) => {
        const minX = 8;
        const maxX = width - 58;
        const minY = 70;
        const maxY = height - 86;
        return {
            x: Math.min(Math.max(minX, nextPos.x), maxX),
            y: Math.min(Math.max(minY, nextPos.y), maxY)
        };
    };

    const triggerHaptic = (ms = 10) => {
        if (
            typeof window !== 'undefined' &&
            typeof navigator !== 'undefined' &&
            (navigator.userActivation?.hasBeenActive ?? true) &&
            window.matchMedia('(max-width: 1024px)').matches &&
            navigator.vibrate
        ) {
            navigator.vibrate(ms);
        }
    };

    const activate = () => {
        setActive(true);
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => setActive(false), 1600);
    };

    useEffect(() => {
        const updateViewport = () => {
            setViewport({ w: window.innerWidth, h: window.innerHeight });
            setIsMobileWidth(window.innerWidth <= 1024);
        };
        updateViewport();

        const initialX = Math.max(12, window.innerWidth - 70);
        const initialY = Math.max(84, Math.floor(window.innerHeight * 0.55));
        let restored = null;
        try {
            const raw = localStorage.getItem(ASSISTIVE_POS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
                    restored = clampButtonPos({ x: parsed.x, y: parsed.y });
                }
            }
        } catch {
            restored = null;
        }
        setPos(restored || clampButtonPos({ x: initialX, y: initialY }));

        window.addEventListener('resize', updateViewport);
        return () => {
            if (idleTimer.current) clearTimeout(idleTimer.current);
            window.removeEventListener('resize', updateViewport);
        };
    }, []);

    useEffect(() => {
        if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return;
        try {
            localStorage.setItem(ASSISTIVE_POS_KEY, JSON.stringify(pos));
        } catch {
            // Ignore storage write failures.
        }
    }, [pos.x, pos.y]);

    const onPointerDown = (event) => {
        triggerHaptic(10);
        activate();
        pointer.current = {
            dragging: true,
            moved: false,
            x: event.clientX,
            y: event.clientY,
            originX: pos.x,
            originY: pos.y
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
        if (!pointer.current.dragging) return;
        activate();
        const dx = event.clientX - pointer.current.x;
        const dy = event.clientY - pointer.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) pointer.current.moved = true;
        const minX = open ? -40 : 8;
        const maxX = open ? window.innerWidth - 10 : window.innerWidth - 58;
        const minY = open ? 30 : 70;
        const maxY = open ? window.innerHeight - 22 : window.innerHeight - 86;
        const nextX = Math.min(Math.max(minX, pointer.current.originX + dx), maxX);
        const nextY = Math.min(Math.max(minY, pointer.current.originY + dy), maxY);
        setPos({ x: nextX, y: nextY });
    };

    const onPointerUp = () => {
        triggerHaptic(10);
        activate();
        if (!pointer.current.moved) {
            setOpen((v) => !v);
        }
        pointer.current.dragging = false;
    };

    const onMouseDown = (event) => {
        if (event.button !== 0) return;
        onPointerDown({ ...event, clientX: event.clientX, clientY: event.clientY, currentTarget: event.currentTarget });
    };
    const onMouseMove = (event) => onPointerMove({ ...event, clientX: event.clientX, clientY: event.clientY });
    const onMouseUp = () => onPointerUp();

    const onTouchStart = (event) => {
        const touch = event.touches?.[0];
        if (!touch) return;
        onPointerDown({
            clientX: touch.clientX,
            clientY: touch.clientY,
            currentTarget: event.currentTarget
        });
    };
    const onTouchMove = (event) => {
        const touch = event.touches?.[0];
        if (!touch) return;
        onPointerMove({ clientX: touch.clientX, clientY: touch.clientY });
    };
    const onTouchEnd = () => onPointerUp();

    if (!isMobileWidth) return null;

    const panelLayout = useMemo(() => {
        const cols = 3;
        const iconCenterX = pos.x + (iconSize / 2);
        const iconCenterY = pos.y + (iconSize / 2);

        let left = iconCenterX - (panelWidth / 2);
        let top = iconCenterY - (panelHeight / 2);
        left = Math.min(Math.max(8, left), viewport.w - panelWidth - 8);
        top = Math.min(Math.max(72, top), viewport.h - panelHeight - 12);

        return { left, top, panelWidth, cols, panelHeight };
    }, [open, pos.x, pos.y, viewport.h, viewport.w]);

    const actionSlots = useMemo(() => {
        const nonCenterActions = DEFAULT_ACTIONS.filter((action) => action.id !== 'how').slice(0, 8);
        const slots = [];
        let ai = 0;
        for (let i = 0; i < 9; i += 1) {
            if (i === 4) slots.push(null);
            else {
                slots.push(nonCenterActions[ai] || null);
                ai += 1;
            }
        }
        return slots;
    }, []);

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    left: panelLayout.left,
                    top: panelLayout.top,
                    zIndex: 10050,
                    pointerEvents: open ? 'auto' : 'none',
                    width: panelLayout.panelWidth,
                    padding: 0,
                    borderRadius: 0,
                    border: 'none',
                    background: 'transparent',
                    backdropFilter: 'none',
                    boxShadow: 'none',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${panelLayout.cols}, minmax(0, 1fr))`,
                    gap: 7,
                    opacity: open ? 1 : 0,
                    transform: open ? 'scale(1)' : 'scale(0.12)',
                    transformOrigin: 'center center',
                    transition: 'opacity 180ms ease, transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
            >
                {actionSlots.map((action, index) => {
                    if (!action) {
                        return (
                            <div
                                key={`slot-${index}`}
                                style={{ minHeight: 48, borderRadius: 12, background: 'transparent' }}
                            />
                        );
                    }
                    return (
                        <button
                            key={action.id}
                            onClick={() => {
                                triggerHaptic(12);
                                if (action.nav) onNavigate?.(action.nav);
                                if (action.onClick) action.onClick();
                                setOpen(false);
                            }}
                            style={{
                                minHeight: 48,
                                borderRadius: 12,
                                border: '1px solid rgba(148,163,184,0.4)',
                                background: 'rgba(30,41,59,0.92)',
                                color: '#fff',
                                fontSize: 'clamp(9px, 2.2vw, 10px)',
                                lineHeight: 1,
                                fontWeight: 600,
                                padding: '5px 6px',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 3
                            }}
                        >
                            {action.icon ? <action.icon size={13} strokeWidth={2.3} /> : null}
                            <span style={{ display: 'block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.label}</span>
                        </button>
                    );
                })}
            </div>

            <button
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onPointerEnter={activate}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                    position: 'fixed',
                    left: pos.x,
                    top: pos.y,
                    width: iconSize,
                    height: iconSize,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    boxShadow: 'none',
                    color: '#fff',
                    zIndex: 10051,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    touchAction: 'none',
                    opacity: open || active ? 1 : 0.2,
                    transition: 'opacity 200ms ease, transform 200ms ease',
                    transform: open ? 'scale(1)' : 'scale(1)',
                    pointerEvents: 'auto'
                }}
                aria-label="AssistiveTouch"
            >
                <img src="/icons/vs-box.svg" alt="VibeSelangor" style={{ width: logoSize, height: logoSize, borderRadius: 10 }} />
            </button>
        </>
    );
}
