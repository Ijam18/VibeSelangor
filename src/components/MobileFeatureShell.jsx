import React, { useEffect, useState } from 'react';
import MobileAssistiveTouch from './MobileAssistiveTouch';
import LiveIslandBlip from './LiveIslandBlip';
import MobileStatusBar from './MobileStatusBar';

export default function MobileFeatureShell({ title, subtitle, children, islandContent = null, islandWide = false, statusCenterContent = null, onNavigate = null, liveBlip = null }) {
    const [now, setNow] = useState(new Date());
    const [batteryPct, setBatteryPct] = useState('--%');
    const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 390));

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => {
            clearInterval(timer);
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

    const isPhonePortrait = viewportWidth <= 430;
    const isPhoneLandscape = viewportWidth > 430 && viewportWidth <= 699;
    const shellPadding = isPhonePortrait
        ? '10px 12px 108px'
        : isPhoneLandscape
            ? '10px 14px 112px'
            : '12px 20px 118px';
    const shellMaxWidth = isPhonePortrait ? 480 : isPhoneLandscape ? 700 : 980;
    const baseIslandWidth = islandWide
        ? (isPhonePortrait ? 'min(72%, 320px)' : isPhoneLandscape ? 'min(64%, 360px)' : 'min(52%, 420px)')
        : (isPhonePortrait ? 'min(52%, 214px)' : isPhoneLandscape ? 'min(46%, 250px)' : 'min(38%, 280px)');
    const islandWidth = liveBlip?.isLive
        ? (islandWide
            ? (isPhonePortrait ? 'min(84%, 360px)' : isPhoneLandscape ? 'min(76%, 410px)' : 'min(62%, 470px)')
            : (isPhonePortrait ? 'min(66%, 270px)' : isPhoneLandscape ? 'min(58%, 320px)' : 'min(48%, 340px)'))
        : baseIslandWidth;
    const centerIslandWidth = statusCenterContent
        ? (liveBlip?.isLive
            ? (islandWide
                ? (isPhonePortrait ? 'min(88%, 380px)' : isPhoneLandscape ? 'min(80%, 430px)' : 'min(68%, 500px)')
                : islandWidth)
            : (islandWide
                ? (isPhonePortrait ? 'min(78%, 300px)' : isPhoneLandscape ? 'min(72%, 360px)' : 'min(64%, 440px)')
                : islandWidth))
        : islandWidth;

    return (
        <div
            style={{
                minHeight: 'calc(var(--app-vh, 100vh) - 84px)',
                padding: shellPadding,
                overflow: 'hidden',
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
            <div style={{ width: '100%', maxWidth: shellMaxWidth, margin: '0 auto' }}>
                <MobileStatusBar
                    timeLabel={now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    batteryPct={batteryPct}
                    centerContent={statusCenterContent ? (
                        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: centerIslandWidth }}>
                            <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 6 }}>
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>{statusCenterContent}</div>
                                {liveBlip?.isLive && (
                                    <LiveIslandBlip title={liveBlip.title} windowText={liveBlip.windowText} />
                                )}
                            </div>
                        </div>
                    ) : null}
                    marginBottom={6}
                />

                {!statusCenterContent && (
                    <div
                        style={{
                            margin: '4px auto 10px',
                            width: islandWidth,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 6,
                            overflow: 'hidden',
                            background: 'rgba(10,10,10,0.95)',
                            color: '#fff',
                            borderRadius: 14,
                            padding: '5px 10px',
                            textAlign: 'center',
                            boxShadow: '0 8px 18px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
                            {islandContent ? islandContent : (
                                <>
                                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.15, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                                    {subtitle && <div style={{ fontSize: 9, opacity: 0.78, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>}
                                </>
                            )}
                        </div>
                        {liveBlip?.isLive && (
                            <LiveIslandBlip title={liveBlip.title} windowText={liveBlip.windowText} />
                        )}
                    </div>
                )}

                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        background: 'rgba(255, 244, 244, 0.42)',
                        border: '1px solid rgba(255,255,255,0.55)',
                        borderRadius: 22,
                        backdropFilter: 'blur(16px) saturate(1.06)',
                        padding: isPhonePortrait ? '12px 10px 12px' : isPhoneLandscape ? '12px 12px 12px' : '14px 14px 14px'
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
