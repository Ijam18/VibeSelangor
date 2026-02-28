import React from 'react';
import { Home, Map, MessageSquare, Star, CircleHelp, LogIn } from 'lucide-react';
import './MobileBottomNav.css';

/**
 * MobileBottomNav
 * Fixed bottom navigation bar for mobile screens.
 * Only visible on screens < 768px.
 */

const NAV_ITEMS = [
    { id: 'forum', icon: MessageSquare, label: 'Forum' },
    { id: 'showcase', icon: Star, label: 'Showcase' },
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'how-it-works', icon: CircleHelp, label: 'How?' },
];

export default function MobileBottomNav({ currentPage, onNavigate, isLoggedIn }) {
    const visibleItems = [
        ...NAV_ITEMS,
        !isLoggedIn ? { id: 'login', icon: LogIn, label: 'Login' } : null
    ].filter(Boolean);

    return (
        <>
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
                            <span className="mobile-bottom-nav-icon-wrap">
                                <Icon className="mobile-bottom-nav-icon" size={22} strokeWidth={2.2} />
                            </span>
                            <span className="mobile-bottom-nav-label">{label}</span>
                        </button>
                    );
                })}
            </nav>
        </>
    );
}
