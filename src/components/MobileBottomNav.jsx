import React from 'react';
import { Home, Zap, MessageSquare, LayoutDashboard, Gamepad2, Star } from 'lucide-react';
import './MobileBottomNav.css';

/**
 * MobileBottomNav
 * Fixed bottom navigation bar for mobile screens.
 * Only visible on screens < 768px.
 */

const NAV_ITEMS = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'showcase', icon: Star, label: 'Showcase' },
    { id: 'forum', icon: MessageSquare, label: 'Forum' },
    { id: 'studio', icon: Gamepad2, label: 'Arcade', authRequired: true },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', authRequired: true },
];

export default function MobileBottomNav({ currentPage, onNavigate, isLoggedIn }) {
    const visibleItems = NAV_ITEMS.filter(item => !item.authRequired || isLoggedIn);

    return (
        <>
            {/* Spacer so content doesn't hide behind the nav */}
            <div className="mobile-bottom-nav-spacer" />

            <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
                {visibleItems.map(({ id, icon: Icon, label }) => {
                    const isActive = currentPage === id;

                    return (
                        <button
                            key={id}
                            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => onNavigate(id)}
                            aria-label={label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 1.8}
                                style={{
                                    color: isActive ? 'var(--selangor-red)' : '#6b7280',
                                    transition: 'color 0.15s',
                                }}
                            />
                            <span style={{
                                fontSize: '9px',
                                fontWeight: isActive ? 800 : 600,
                                color: isActive ? 'var(--selangor-red)' : '#6b7280',
                                marginTop: '2px',
                                transition: 'color 0.15s',
                                width: '100%',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </>
    );
}
