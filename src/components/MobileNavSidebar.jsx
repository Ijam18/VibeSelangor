import React, { useEffect } from 'react';
import { X, MessageCircle, Zap, User, ExternalLink, Download } from 'lucide-react';
import { HEADER_LINKS } from '../constants';
import { getCurrentHolidayTheme, getHolidayThemeConfig } from '../utils/holidayUtils';

export default function MobileNavSidebar({
    isOpen,
    onClose,
    session,
    currentUser,
    publicPage,
    handleHeaderNavClick,
    handleJoinClick,
    handleSignOut,
    setPublicPage,
    showChatbot,
    onOpenChatbot,
    isMobileView = true,
    installPrompt,
    onInstallClick
}) {
    // Lock body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNavClick = (e, item) => {
        handleHeaderNavClick(e, item);
        onClose();
    };

    const holidayTheme = getCurrentHolidayTheme();
    const holidayConfig = getHolidayThemeConfig(holidayTheme);

    const isRightSide = !isMobileView;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    zIndex: 19999,
                    backdropFilter: 'blur(2px)',
                }}
            />

            {/* Sidebar panel */}
            <div style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: isRightSide ? 'auto' : 0,
                right: isRightSide ? 0 : 'auto',
                width: isRightSide ? 'min(320px, 40%)' : 'min(240px, 55%)',
                background: 'white',
                zIndex: 20000,
                display: 'flex',
                flexDirection: 'column',
                border: 'none',
                boxShadow: isRightSide ? '-6px 0 16px rgba(0,0,0,0.12)' : '6px 0 16px rgba(0,0,0,0.12)',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderBottom: '2px solid black',
                    background: 'black',
                    color: 'white',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            background: holidayConfig?.color || 'var(--selangor-red)',
                            borderRadius: '6px',
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '2px 2px 0 rgba(255,255,255,0.2)'
                        }}>
                            <Zap size={16} fill="yellow" color="black" strokeWidth={2.5} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <span style={{ fontWeight: '900', fontSize: '14px', lineHeight: 1 }}>VibeSelangor</span>
                            {holidayConfig && (
                                <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.8)', fontWeight: '900', textTransform: 'uppercase', marginTop: '1px' }}>
                                    {holidayConfig.label}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav Links */}
                <div style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
                    <div style={{ padding: '2px 12px 4px', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4 }}>
                        Navigation
                    </div>
                    {HEADER_LINKS.map((item) => {
                        const isActive = publicPage === item.page;
                        return (
                            <a
                                key={item.page || item.sectionId}
                                href={item.page ? `#${item.page}-page` : `#${item.sectionId}`}
                                onClick={(e) => handleNavClick(e, item)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px 12px',
                                    fontWeight: '800',
                                    fontSize: '12px',
                                    textDecoration: 'none',
                                    color: isActive ? 'var(--selangor-red)' : 'black',
                                    background: isActive ? '#fff5f5' : 'transparent',
                                    borderLeft: isActive ? '2px solid var(--selangor-red)' : '2px solid transparent',
                                    transition: 'all 0.1s',
                                }}
                            >
                                {item.label}
                                {isActive && <span style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--selangor-red)' }} />}
                            </a>
                        );
                    })}
                </div>


                {/* Auth section - Only shown when logged in */}
                {session && (
                    <div style={{ padding: '6px 12px', flexShrink: 0, borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4, marginBottom: '4px' }}>
                            Account
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontWeight: '800', fontSize: '11px', padding: '1px 0', opacity: 0.7 }}>
                                👋 {currentUser?.name}
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {publicPage !== 'dashboard' && (
                                    <button
                                        className="btn btn-red"
                                        style={{ flex: 1, padding: '4px', fontSize: '9px' }}
                                        onClick={() => { setPublicPage('dashboard'); onClose(); }}
                                    >
                                        Dashboard
                                    </button>
                                )}
                                <button
                                    className="btn btn-outline"
                                    style={{ flex: 1, padding: '4px', fontSize: '9px' }}
                                    onClick={() => { handleSignOut(); onClose(); }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Actions - Chatbot & Guest Auth */}
                <div style={{ marginTop: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    <button
                        onClick={() => { onOpenChatbot(); onClose(); }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            background: showChatbot ? '#f0fff4' : '#fff5f5',
                            border: `1.5px solid ${showChatbot ? '#22c55e' : 'var(--selangor-red)'}`,
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '10px',
                            color: showChatbot ? '#16a34a' : 'var(--selangor-red)',
                            transition: 'all 0.1s',
                        }}
                    >
                        <MessageCircle size={12} />
                        {showChatbot ? 'Active' : 'Open Ijam Bot'}
                    </button>

                    {/* PWA Install Button */}
                    {installPrompt && (
                        <button
                            onClick={() => { onInstallClick(); onClose(); }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                background: '#eff6ff',
                                border: '1.5px solid #3b82f6',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: '800',
                                fontSize: '12px',
                                color: '#2563eb',
                                transition: 'all 0.1s',
                            }}
                        >
                            <Download size={12} />
                            Install App
                        </button>
                    )}

                    {!session && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <a
                                className="btn btn-outline"
                                style={{
                                    flex: 1,
                                    padding: '5px 8px',
                                    fontSize: '10px',
                                    textDecoration: 'none',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    border: '1.5px solid black'
                                }}
                                href="https://www.threads.com/@_zarulijam"
                                target="_blank"
                                rel="noreferrer"
                                onClick={onClose}
                            >
                                <ExternalLink size={10} /> Contact
                            </a>
                            <button
                                className="btn btn-red"
                                style={{
                                    flex: 2,
                                    padding: '5px 8px',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}
                                onClick={() => { handleJoinClick(); onClose(); }}
                            >
                                <Zap size={10} /> Become a Builder
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '6px 12px 10px', borderTop: 'none', flexShrink: 0 }}>
                    <div style={{ fontSize: '9px', fontWeight: '700', opacity: 0.3, textAlign: 'center' }}>
                        VibeSelangor © 2025
                    </div>
                </div>
            </div>
        </>
    );
}
