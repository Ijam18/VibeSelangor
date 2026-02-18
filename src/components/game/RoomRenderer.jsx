import React, { useState } from 'react';
import { GAME_ITEMS } from '../../constants';

// ─── Room Template Backgrounds ────────────────────────────────────────────────

/**
 * TEMPLATE 1: Starter — Cozy Dev Den
 * Teal left wall, cream right wall, warm wood floor
 */
const StarterBackground = () => (
    <g id="room-bg-starter">
        {/* Floor — warm wood parquet */}
        <path d="M0 220 L200 320 L400 220 L200 120 Z" fill="#c8a96e" />
        <line x1="100" y1="170" x2="300" y2="270" stroke="#b8955a" strokeWidth="1" opacity="0.5" />
        <line x1="150" y1="145" x2="350" y2="245" stroke="#b8955a" strokeWidth="1" opacity="0.5" />
        <line x1="50" y1="195" x2="250" y2="295" stroke="#b8955a" strokeWidth="1" opacity="0.5" />
        <line x1="200" y1="120" x2="200" y2="320" stroke="#b8955a" strokeWidth="1" opacity="0.4" />
        <line x1="140" y1="150" x2="140" y2="310" stroke="#b8955a" strokeWidth="1" opacity="0.3" />
        <line x1="260" y1="150" x2="260" y2="310" stroke="#b8955a" strokeWidth="1" opacity="0.3" />
        {/* Left Wall — teal */}
        <path d="M0 220 L0 20 L200 120 L200 320 Z" fill="#2d6a7f" />
        <path d="M0 220 L0 20 L40 40 L40 240 Z" fill="rgba(0,0,0,0.07)" />
        {/* Right Wall — cream */}
        <path d="M400 220 L400 20 L200 120 L200 320 Z" fill="#f0e8d8" />
        <path d="M400 220 L400 20 L360 40 L360 240 Z" fill="rgba(0,0,0,0.04)" />
        {/* Edges */}
        <line x1="0" y1="20" x2="200" y2="120" stroke="#1a4a5a" strokeWidth="2" />
        <line x1="400" y1="20" x2="200" y2="120" stroke="#d4c8b0" strokeWidth="2" />
        <line x1="0" y1="220" x2="200" y2="320" stroke="#9a7a50" strokeWidth="2" />
        <line x1="400" y1="220" x2="200" y2="320" stroke="#9a7a50" strokeWidth="2" />
        <line x1="200" y1="120" x2="200" y2="320" stroke="#888" strokeWidth="1.5" opacity="0.4" />
        {/* Left wall — window */}
        <rect x="28" y="55" width="55" height="65" rx="3" fill="#87ceeb" opacity="0.75" stroke="#1a4a5a" strokeWidth="1.5" transform="skewY(26.5)" />
        <line x1="55" y1="55" x2="55" y2="120" stroke="#1a4a5a" strokeWidth="1.2" transform="skewY(26.5)" />
        <line x1="28" y1="87" x2="83" y2="87" stroke="#1a4a5a" strokeWidth="1.2" transform="skewY(26.5)" />
        {/* Left wall — small shelf */}
        <rect x="70" y="130" width="60" height="8" rx="2" fill="#1a4a5a" opacity="0.6" transform="skewY(26.5)" />
        {/* Right wall — VibeSelangor poster */}
        <rect x="285" y="50" width="65" height="45" rx="3" fill="#CE1126" stroke="#9a0d1e" strokeWidth="1.5" transform="skewY(-26.5)" />
        <text x="317" y="74" textAnchor="middle" fontSize="8" fontWeight="900" fill="white" transform="skewY(-26.5)">VIBE</text>
        <text x="317" y="85" textAnchor="middle" fontSize="6" fontWeight="700" fill="#FFD700" transform="skewY(-26.5)">SELANGOR</text>
        {/* Right wall — small framed art */}
        <rect x="330" y="110" width="35" height="28" rx="2" fill="#fff8dc" stroke="#9a0d1e" strokeWidth="1" transform="skewY(-26.5)" />
        <text x="347" y="127" textAnchor="middle" fontSize="9" fill="#CE1126" fontWeight="900" transform="skewY(-26.5)">KD</text>
    </g>
);

/**
 * TEMPLATE 2: Builder — Night Mode
 * Dark navy left wall, charcoal right wall, dark tile floor
 */
const BuilderBackground = () => (
    <g id="room-bg-builder">
        {/* Floor — dark tile */}
        <path d="M0 220 L200 320 L400 220 L200 120 Z" fill="#1e1e2e" />
        <line x1="100" y1="170" x2="300" y2="270" stroke="#2a2a3e" strokeWidth="1.5" opacity="0.8" />
        <line x1="150" y1="145" x2="350" y2="245" stroke="#2a2a3e" strokeWidth="1.5" opacity="0.8" />
        <line x1="50" y1="195" x2="250" y2="295" stroke="#2a2a3e" strokeWidth="1.5" opacity="0.8" />
        <line x1="200" y1="120" x2="200" y2="320" stroke="#2a2a3e" strokeWidth="1.5" opacity="0.7" />
        <line x1="140" y1="150" x2="140" y2="310" stroke="#2a2a3e" strokeWidth="1" opacity="0.5" />
        <line x1="260" y1="150" x2="260" y2="310" stroke="#2a2a3e" strokeWidth="1" opacity="0.5" />
        {/* Floor glow accent */}
        <ellipse cx="200" cy="250" rx="80" ry="20" fill="#6366f1" opacity="0.08" />
        {/* Left Wall — dark navy */}
        <path d="M0 220 L0 20 L200 120 L200 320 Z" fill="#1a1f3a" />
        <path d="M0 220 L0 20 L40 40 L40 240 Z" fill="rgba(0,0,0,0.15)" />
        {/* Right Wall — charcoal */}
        <path d="M400 220 L400 20 L200 120 L200 320 Z" fill="#2a2a3a" />
        <path d="M400 220 L400 20 L360 40 L360 240 Z" fill="rgba(0,0,0,0.1)" />
        {/* Edges */}
        <line x1="0" y1="20" x2="200" y2="120" stroke="#0d1224" strokeWidth="2" />
        <line x1="400" y1="20" x2="200" y2="120" stroke="#1a1a2a" strokeWidth="2" />
        <line x1="0" y1="220" x2="200" y2="320" stroke="#111" strokeWidth="2" />
        <line x1="400" y1="220" x2="200" y2="320" stroke="#111" strokeWidth="2" />
        <line x1="200" y1="120" x2="200" y2="320" stroke="#333" strokeWidth="1.5" opacity="0.5" />
        {/* Left wall — neon window glow */}
        <rect x="25" y="50" width="60" height="70" rx="4" fill="#0d1b4b" stroke="#6366f1" strokeWidth="2" transform="skewY(26.5)" />
        <rect x="27" y="52" width="56" height="66" rx="3" fill="#0a0f2e" opacity="0.9" transform="skewY(26.5)" />
        <line x1="55" y1="50" x2="55" y2="120" stroke="#6366f1" strokeWidth="1" opacity="0.6" transform="skewY(26.5)" />
        <line x1="25" y1="85" x2="85" y2="85" stroke="#6366f1" strokeWidth="1" opacity="0.6" transform="skewY(26.5)" />
        {/* Stars in window */}
        <circle cx="38" cy="72" r="1.5" fill="#FFD700" opacity="0.9" transform="skewY(26.5)" />
        <circle cx="58" cy="62" r="1" fill="white" opacity="0.7" transform="skewY(26.5)" />
        <circle cx="72" cy="80" r="1" fill="white" opacity="0.6" transform="skewY(26.5)" />
        <circle cx="45" cy="100" r="1.2" fill="#87ceeb" opacity="0.8" transform="skewY(26.5)" />
        {/* Left wall — neon strip light */}
        <rect x="5" y="30" width="120" height="4" rx="2" fill="#6366f1" opacity="0.4" transform="skewY(26.5)" />
        {/* Right wall — code display */}
        <rect x="280" y="45" width="80" height="60" rx="4" fill="#0d1b2a" stroke="#00ff88" strokeWidth="1.5" transform="skewY(-26.5)" />
        <line x1="290" y1="60" x2="340" y2="60" stroke="#00ff88" strokeWidth="1.5" opacity="0.8" transform="skewY(-26.5)" />
        <line x1="290" y1="70" x2="325" y2="70" stroke="#00aaff" strokeWidth="1.5" opacity="0.7" transform="skewY(-26.5)" />
        <line x1="290" y1="80" x2="350" y2="80" stroke="#ff6b6b" strokeWidth="1.5" opacity="0.7" transform="skewY(-26.5)" />
        <line x1="290" y1="90" x2="315" y2="90" stroke="#00ff88" strokeWidth="1.5" opacity="0.6" transform="skewY(-26.5)" />
        <text x="320" y="102" textAnchor="middle" fontSize="6" fill="#00ff88" fontWeight="700" opacity="0.7" transform="skewY(-26.5)">{'</>'}</text>
        {/* Right wall — neon strip */}
        <rect x="210" y="30" width="120" height="4" rx="2" fill="#00ff88" opacity="0.25" transform="skewY(-26.5)" />
    </g>
);

/**
 * TEMPLATE 3: Pro — Selangor Pride
 * Deep red left wall, gold/amber right wall, marble floor
 */
const ProBackground = () => (
    <g id="room-bg-pro">
        {/* Floor — marble */}
        <path d="M0 220 L200 320 L400 220 L200 120 Z" fill="#e8e0d0" />
        <line x1="100" y1="170" x2="300" y2="270" stroke="#d4c8b0" strokeWidth="1" opacity="0.7" />
        <line x1="150" y1="145" x2="350" y2="245" stroke="#d4c8b0" strokeWidth="1" opacity="0.7" />
        <line x1="50" y1="195" x2="250" y2="295" stroke="#d4c8b0" strokeWidth="1" opacity="0.7" />
        <line x1="200" y1="120" x2="200" y2="320" stroke="#d4c8b0" strokeWidth="1" opacity="0.5" />
        {/* Marble veins */}
        <path d="M80 200 Q140 180 200 220 Q260 260 320 240" fill="none" stroke="#c8b89a" strokeWidth="1" opacity="0.5" />
        <path d="M60 240 Q120 220 160 250 Q200 280 280 260" fill="none" stroke="#c8b89a" strokeWidth="0.8" opacity="0.4" />
        {/* Left Wall — deep red */}
        <path d="M0 220 L0 20 L200 120 L200 320 Z" fill="#7a0d1e" />
        <path d="M0 220 L0 20 L40 40 L40 240 Z" fill="rgba(0,0,0,0.12)" />
        {/* Left wall — gold trim at top */}
        <path d="M0 20 L200 120 L200 115 L0 15 Z" fill="#FFD700" opacity="0.5" />
        {/* Right Wall — warm gold/amber */}
        <path d="M400 220 L400 20 L200 120 L200 320 Z" fill="#f5c842" />
        <path d="M400 220 L400 20 L360 40 L360 240 Z" fill="rgba(0,0,0,0.08)" />
        {/* Right wall — gold trim at top */}
        <path d="M400 20 L200 120 L200 115 L400 15 Z" fill="#FFD700" opacity="0.4" />
        {/* Edges */}
        <line x1="0" y1="20" x2="200" y2="120" stroke="#5a0a15" strokeWidth="2.5" />
        <line x1="400" y1="20" x2="200" y2="120" stroke="#d4a800" strokeWidth="2.5" />
        <line x1="0" y1="220" x2="200" y2="320" stroke="#5a0a15" strokeWidth="2" />
        <line x1="400" y1="220" x2="200" y2="320" stroke="#d4a800" strokeWidth="2" />
        <line x1="200" y1="120" x2="200" y2="320" stroke="#888" strokeWidth="1.5" opacity="0.4" />
        {/* Left wall — ornate window with gold frame */}
        <rect x="25" y="50" width="60" height="70" rx="5" fill="#87ceeb" opacity="0.6" stroke="#FFD700" strokeWidth="2.5" transform="skewY(26.5)" />
        <line x1="55" y1="50" x2="55" y2="120" stroke="#FFD700" strokeWidth="1.5" transform="skewY(26.5)" />
        <line x1="25" y1="85" x2="85" y2="85" stroke="#FFD700" strokeWidth="1.5" transform="skewY(26.5)" />
        {/* Left wall — Selangor crescent & star emblem */}
        <circle cx="110" cy="155" r="22" fill="#FFD700" opacity="0.9" transform="skewY(26.5)" />
        <circle cx="117" cy="150" r="16" fill="#7a0d1e" opacity="1" transform="skewY(26.5)" />
        <polygon points="110,140 112,147 119,147 113,152 115,159 110,154 105,159 107,152 101,147 108,147" fill="#FFD700" transform="skewY(26.5)" />
        {/* Right wall — trophy display */}
        <rect x="270" y="40" width="90" height="70" rx="4" fill="#e8b800" opacity="0.3" stroke="#d4a800" strokeWidth="1.5" transform="skewY(-26.5)" />
        <text x="315" y="68" textAnchor="middle" fontSize="20" fill="#7a0d1e" fontWeight="900" transform="skewY(-26.5)">🏆</text>
        <text x="315" y="90" textAnchor="middle" fontSize="7" fill="#7a0d1e" fontWeight="800" transform="skewY(-26.5)">HALL OF FAME</text>
        {/* Right wall — gold wainscoting */}
        <path d="M200 270 L400 170 L400 180 L200 280 Z" fill="#FFD700" opacity="0.2" />
    </g>
);

const ROOM_BACKGROUNDS = {
    starter: StarterBackground,
    builder: BuilderBackground,
    pro: ProBackground,
};

// ─── Item SVG Components (Isometric Pixel-Art Style) ─────────────────────────

const DeskBasic = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d="M0 0 L30 15 L70 0 L40 -15 Z" fill="#8B5E3C" stroke="#5a3a1a" strokeWidth="1.5" />
        <path d="M0 0 L0 20 L30 35 L30 15 Z" fill="#6b4423" stroke="#5a3a1a" strokeWidth="1.5" />
        <path d="M30 15 L30 35 L70 20 L70 0 Z" fill="#7a4e2d" stroke="#5a3a1a" strokeWidth="1.5" />
        <line x1="2" y1="20" x2="2" y2="40" stroke="#5a3a1a" strokeWidth="3" />
        <line x1="28" y1="35" x2="28" y2="55" stroke="#5a3a1a" strokeWidth="3" />
        <line x1="68" y1="20" x2="68" y2="40" stroke="#5a3a1a" strokeWidth="3" />
        <line x1="42" y1="5" x2="42" y2="25" stroke="#5a3a1a" strokeWidth="3" />
    </g>
);

const Laptop = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d="M0 10 L20 18 L40 10 L20 2 Z" fill="#444" stroke="#222" strokeWidth="1" />
        <path d="M0 10 L0 16 L20 24 L20 18 Z" fill="#333" stroke="#222" strokeWidth="1" />
        <path d="M20 18 L20 24 L40 16 L40 10 Z" fill="#3a3a3a" stroke="#222" strokeWidth="1" />
        <path d="M2 2 L2 -18 L38 -26 L38 6 Z" fill="#1a1a2e" stroke="#222" strokeWidth="1" />
        <path d="M4 0 L4 -16 L36 -24 L36 4 Z" fill="#0d1b4b" />
        <line x1="7" y1="-5" x2="25" y2="-10" stroke="#00ff88" strokeWidth="1.5" opacity="0.9" />
        <line x1="7" y1="-10" x2="20" y2="-14" stroke="#00aaff" strokeWidth="1.5" opacity="0.8" />
        <line x1="7" y1="-15" x2="28" y2="-20" stroke="#ff6b6b" strokeWidth="1.5" opacity="0.8" />
        <line x1="7" y1="-20" x2="18" y2="-23" stroke="#00ff88" strokeWidth="1.5" opacity="0.7" />
        <circle cx="20" cy="-10" r="3" fill="rgba(255,255,255,0.08)" />
    </g>
);

const Coffee = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <ellipse cx="10" cy="18" rx="12" ry="5" fill="#e0d5c5" stroke="#c0b090" strokeWidth="1" />
        <path d="M4 5 L4 16 L16 16 L16 5 Z" fill="#ffffff" stroke="#ddd" strokeWidth="1" />
        <path d="M4 5 L10 8 L16 5 L10 2 Z" fill="#f5f5f5" stroke="#ddd" strokeWidth="1" />
        <ellipse cx="10" cy="5" rx="6" ry="2.5" fill="#6b3a2a" />
        <path d="M16 8 Q22 8 22 12 Q22 16 16 16" fill="none" stroke="#ddd" strokeWidth="2" />
        <path d="M7 0 Q8 -4 7 -8" fill="none" stroke="rgba(200,200,200,0.7)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 -1 Q11 -5 10 -9" fill="none" stroke="rgba(200,200,200,0.6)" strokeWidth="1.5" strokeLinecap="round" />
        <text x="10" y="13" textAnchor="middle" fontSize="5" fill="#CE1126" fontWeight="800">VS</text>
    </g>
);

const Plant = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d="M8 30 L22 30 L20 45 L10 45 Z" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />
        <path d="M8 30 L22 30 L24 27 L6 27 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
        <ellipse cx="15" cy="30" rx="7" ry="2.5" fill="#5c3d1e" />
        <line x1="15" y1="30" x2="15" y2="15" stroke="#22c55e" strokeWidth="2" />
        <ellipse cx="15" cy="12" rx="9" ry="7" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
        <ellipse cx="8" cy="18" rx="7" ry="5" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
        <ellipse cx="22" cy="18" rx="7" ry="5" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
        <ellipse cx="15" cy="6" rx="6" ry="5" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
        <line x1="15" y1="6" x2="15" y2="12" stroke="#15803d" strokeWidth="0.8" opacity="0.6" />
    </g>
);

const Bookshelf = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d="M0 0 L0 -80 L20 -88 L20 -8 Z" fill="#5c3d1e" stroke="#3d2810" strokeWidth="1.5" />
        <path d="M0 0 L40 -20 L40 -100 L0 -80 Z" fill="#7a5230" stroke="#3d2810" strokeWidth="1.5" />
        <path d="M20 -8 L20 -88 L40 -100 L40 -20 Z" fill="#6b4423" stroke="#3d2810" strokeWidth="1.5" />
        {[0, 1, 2, 3].map(i => (
            <line key={i} x1="0" y1={-20 * (i + 1)} x2="40" y2={-20 * (i + 1) - 20} stroke="#3d2810" strokeWidth="1" opacity="0.6" />
        ))}
        {/* Books */}
        <rect x="3" y="-75" width="6" height="18" fill="#CE1126" transform="skewY(-27)" />
        <rect x="10" y="-72" width="5" height="16" fill="#3b82f6" transform="skewY(-27)" />
        <rect x="16" y="-70" width="7" height="17" fill="#f59e0b" transform="skewY(-27)" />
        <rect x="3" y="-55" width="5" height="14" fill="#10b981" transform="skewY(-27)" />
        <rect x="9" y="-53" width="6" height="15" fill="#8b5cf6" transform="skewY(-27)" />
        <rect x="16" y="-51" width="5" height="13" fill="#CE1126" transform="skewY(-27)" />
    </g>
);

const Whiteboard = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d="M0 0 L0 -60 L50 -75 L50 -15 Z" fill="#f8f8f8" stroke="#ddd" strokeWidth="2" />
        <path d="M0 0 L0 -60 L-5 -62 L-5 2 Z" fill="#8B5E3C" stroke="#5a3a1a" strokeWidth="1" />
        <path d="M50 -15 L50 -75 L55 -77 L55 -17 Z" fill="#8B5E3C" stroke="#5a3a1a" strokeWidth="1" />
        <line x1="5" y1="-20" x2="45" y2="-33" stroke="#CE1126" strokeWidth="2" opacity="0.8" />
        <line x1="5" y1="-30" x2="35" y2="-41" stroke="#3b82f6" strokeWidth="1.5" opacity="0.7" />
        <line x1="5" y1="-40" x2="40" y2="-52" stroke="#10b981" strokeWidth="1.5" opacity="0.7" />
        <text x="25" y="-55" textAnchor="middle" fontSize="7" fill="#CE1126" fontWeight="800" transform="skewY(-15)">SPRINT</text>
        <line x1="0" y1="-2" x2="50" y2="-17" stroke="#ccc" strokeWidth="3" />
    </g>
);

const SelangorFlag = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <line x1="0" y1="0" x2="0" y2="-80" stroke="#5a3a1a" strokeWidth="3" />
        <path d="M0 -80 L40 -65 L0 -50 Z" fill="#FFD700" stroke="#d4a800" strokeWidth="1" />
        <path d="M0 -65 L40 -65 L40 -50 L0 -50 Z" fill="#CE1126" />
        <circle cx="12" cy="-60" r="6" fill="#FFD700" />
        <circle cx="15" cy="-62" r="4.5" fill="#CE1126" />
        <polygon points="22,-57 23,-60 26,-60 24,-62 25,-65 22,-63 19,-65 20,-62 18,-60 21,-60" fill="#FFD700" transform="scale(0.7) translate(10, -25)" />
    </g>
);

const MonitorDual = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        {/* Monitor 1 */}
        <path d="M0 0 L25 12 L25 -28 L0 -40 Z" fill="#1a1a2e" stroke="#333" strokeWidth="1.5" />
        <path d="M2 -2 L23 10 L23 -26 L2 -38 Z" fill="#0d1b4b" />
        <line x1="5" y1="-10" x2="20" y2="-4" stroke="#00ff88" strokeWidth="1.2" opacity="0.9" />
        <line x1="5" y1="-16" x2="16" y2="-11" stroke="#00aaff" strokeWidth="1.2" opacity="0.8" />
        <line x1="5" y1="-22" x2="19" y2="-17" stroke="#ff6b6b" strokeWidth="1.2" opacity="0.8" />
        <line x1="12" y1="12" x2="12" y2="18" stroke="#555" strokeWidth="2" />
        <path d="M6 18 L18 18 L20 20 L4 20 Z" fill="#555" />
        {/* Monitor 2 */}
        <path d="M28 -5 L53 7 L53 -33 L28 -45 Z" fill="#1a1a2e" stroke="#333" strokeWidth="1.5" />
        <path d="M30 -7 L51 5 L51 -31 L30 -43 Z" fill="#0d1b4b" />
        <line x1="33" y1="-15" x2="48" y2="-9" stroke="#00ff88" strokeWidth="1.2" opacity="0.9" />
        <line x1="33" y1="-21" x2="44" y2="-16" stroke="#00aaff" strokeWidth="1.2" opacity="0.8" />
        <line x1="33" y1="-27" x2="47" y2="-22" stroke="#ff6b6b" strokeWidth="1.2" opacity="0.8" />
        <line x1="40" y1="7" x2="40" y2="13" stroke="#555" strokeWidth="2" />
        <path d="M34 13 L46 13 L48 15 L32 15 Z" fill="#555" />
    </g>
);

const StandingDesk = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d="M0 -10 L30 5 L80 -10 L50 -25 Z" fill="#8B5E3C" stroke="#5a3a1a" strokeWidth="1.5" />
        <path d="M0 -10 L0 15 L30 30 L30 5 Z" fill="#6b4423" stroke="#5a3a1a" strokeWidth="1.5" />
        <path d="M30 5 L30 30 L80 15 L80 -10 Z" fill="#7a4e2d" stroke="#5a3a1a" strokeWidth="1.5" />
        <line x1="2" y1="15" x2="2" y2="55" stroke="#5a3a1a" strokeWidth="4" />
        <line x1="28" y1="30" x2="28" y2="70" stroke="#5a3a1a" strokeWidth="4" />
        <line x1="78" y1="15" x2="78" y2="55" stroke="#5a3a1a" strokeWidth="4" />
        <line x1="52" y1="0" x2="52" y2="40" stroke="#5a3a1a" strokeWidth="4" />
    </g>
);

const Trophy = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d="M8 30 L22 30 L20 38 L10 38 Z" fill="#8B5E3C" stroke="#5a3a1a" strokeWidth="1" />
        <path d="M6 26 L24 26 L22 30 L8 30 Z" fill="#FFD700" stroke="#d4a800" strokeWidth="1" />
        <path d="M6 5 L6 26 L24 26 L24 5 Z" fill="#FFD700" stroke="#d4a800" strokeWidth="1.5" />
        <path d="M6 5 L24 5 L24 0 L6 0 Z" fill="#f5d000" stroke="#d4a800" strokeWidth="1" />
        <path d="M6 15 Q0 15 0 20 Q0 25 6 25" fill="none" stroke="#FFD700" strokeWidth="2.5" />
        <path d="M24 15 Q30 15 30 20 Q30 25 24 25" fill="none" stroke="#FFD700" strokeWidth="2.5" />
        <polygon points="15,8 16,12 20,12 17,15 18,19 15,16 12,19 13,15 10,12 14,12" fill="#CE1126" />
        <circle cx="-2" cy="3" r="2" fill="#FFD700" opacity="0.8" />
        <circle cx="32" cy="6" r="1.5" fill="#FFD700" opacity="0.7" />
        <circle cx="-4" cy="10" r="1" fill="#FFD700" opacity="0.6" />
    </g>
);

const RocketItem = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d="M15 0 L5 30 L15 25 L25 30 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />
        <path d="M15 0 Q10 -15 15 -25 Q20 -15 15 0 Z" fill="#CE1126" stroke="#9a0d1e" strokeWidth="1" />
        <circle cx="15" cy="12" r="5" fill="#87ceeb" stroke="#9ca3af" strokeWidth="1.5" />
        <circle cx="15" cy="12" r="3" fill="#bde0f5" />
        <path d="M5 30 L0 40 L8 32 Z" fill="#CE1126" stroke="#9a0d1e" strokeWidth="1" />
        <path d="M25 30 L30 40 L22 32 Z" fill="#CE1126" stroke="#9a0d1e" strokeWidth="1" />
        <path d="M10 30 Q15 45 20 30" fill="#FF6B00" opacity="0.9" />
        <path d="M12 30 Q15 40 18 30" fill="#FFD700" opacity="0.8" />
        <circle cx="3" cy="5" r="1" fill="#FFD700" />
        <circle cx="28" cy="10" r="1" fill="#FFD700" />
        <circle cx="5" cy="18" r="0.8" fill="#FFD700" />
    </g>
);

const ServerRack = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d="M0 0 L0 -80 L15 -87 L15 -7 Z" fill="#374151" stroke="#1f2937" strokeWidth="1.5" />
        <path d="M0 0 L35 -15 L35 -95 L0 -80 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="1.5" />
        <path d="M15 -7 L15 -87 L35 -95 L35 -15 Z" fill="#3f4a5a" stroke="#1f2937" strokeWidth="1.5" />
        {[0, 1, 2, 3, 4].map(i => (
            <g key={i}>
                <rect x="2" y={-15 - i * 14} width="12" height="10" rx="1" fill="#1f2937" />
                <circle cx="32" cy={-10 - i * 14} r="2" fill="#22c55e" opacity="0.9" />
                <rect x="18" y={-14 - i * 14} width="14" height="2" rx="1" fill="#374151" />
                <rect x="18" y={-10 - i * 14} width="10" height="2" rx="1" fill="#374151" />
            </g>
        ))}
    </g>
);

// ─── Item Component Map ────────────────────────────────────────────────────────
const ITEM_COMPONENTS = {
    'desk_basic': DeskBasic,
    'laptop': Laptop,
    'coffee': Coffee,
    'plant': Plant,
    'bookshelf': Bookshelf,
    'selangor_flag': SelangorFlag,
    'whiteboard': Whiteboard,
    'monitor_dual': MonitorDual,
    'standing_desk': StandingDesk,
    'trophy': Trophy,
    'rocket': RocketItem,
    'server_rack': ServerRack,
};

const GenericItem = ({ x, y, label }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d="M0 0 L15 8 L30 0 L15 -8 Z" fill="#ddd" stroke="black" strokeWidth="1" />
        <path d="M0 0 L0 15 L15 23 L15 8 Z" fill="#ccc" stroke="black" strokeWidth="1" />
        <path d="M15 8 L15 23 L30 15 L30 0 Z" fill="#bbb" stroke="black" strokeWidth="1" />
        <text x="15" y="5" textAnchor="middle" fontSize="8" fontWeight="700">{label?.[0] || '?'}</text>
    </g>
);

// ─── Position Map ─────────────────────────────────────────────────────────────
const POSITIONS = {
    'desk_basic': { x: 140, y: 210 },
    'standing_desk': { x: 130, y: 200 },
    'laptop': { x: 165, y: 195 },
    'coffee': { x: 155, y: 205 },
    'monitor_dual': { x: 150, y: 185 },
    'plant': { x: 55, y: 240 },
    'bookshelf': { x: 290, y: 205 },
    'whiteboard': { x: 290, y: 155 },
    'selangor_flag': { x: 50, y: 180 },
    'trophy': { x: 205, y: 215 },
    'rocket': { x: 320, y: 255 },
    'server_rack': { x: 48, y: 200 },
};

// ─── Room Template Selector UI ────────────────────────────────────────────────
const TEMPLATES = [
    { id: 'starter', label: 'Starter', color: '#2d6a7f', desc: 'Cozy Dev Den' },
    { id: 'builder', label: 'Builder', color: '#1a1f3a', desc: 'Night Mode' },
    { id: 'pro', label: 'Pro', color: '#7a0d1e', desc: 'Selangor Pride' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RoomRenderer({ items = [], roomTemplate: propTemplate }) {
    const [activeItem, setActiveItem] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(propTemplate || 'starter');

    const Background = ROOM_BACKGROUNDS[selectedTemplate] || StarterBackground;

    const handleItemClick = (itemId) => {
        setActiveItem(prev => prev === itemId ? null : itemId);
    };

    const activeItemData = activeItem ? GAME_ITEMS.find(g => g.id === activeItem) : null;

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            {/* Template Selector */}
            <div style={{
                display: 'flex',
                gap: '6px',
                padding: '8px 10px',
                background: 'rgba(0,0,0,0.7)',
                borderBottom: '2px solid rgba(255,255,255,0.1)',
                justifyContent: 'center',
            }}>
                {TEMPLATES.map(t => (
                    <button
                        key={t.id}
                        onClick={() => { setSelectedTemplate(t.id); setActiveItem(null); }}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '999px',
                            border: selectedTemplate === t.id ? `2px solid ${t.color}` : '2px solid rgba(255,255,255,0.2)',
                            background: selectedTemplate === t.id ? t.color : 'rgba(255,255,255,0.05)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            letterSpacing: '0.04em',
                        }}
                    >
                        {t.label}
                        {selectedTemplate === t.id && (
                            <span style={{ display: 'block', fontSize: '9px', opacity: 0.75, fontWeight: '600' }}>{t.desc}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Room SVG */}
            <div style={{
                width: '100%',
                height: '300px',
                display: 'flex',
                justifyContent: 'center',
                overflow: 'hidden',
                background: selectedTemplate === 'builder'
                    ? 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 100%)'
                    : selectedTemplate === 'pro'
                        ? 'linear-gradient(180deg, #3a0008 0%, #5a0d1e 100%)'
                        : 'linear-gradient(180deg, #1a2a3a 0%, #2d4a5a 100%)',
                position: 'relative',
            }}>
                <svg
                    width="400"
                    height="300"
                    viewBox="0 0 400 320"
                    style={{ maxWidth: '100%' }}
                    onClick={() => setActiveItem(null)}
                >
                    <Background />

                    {items.map((itemId, idx) => {
                        const Component = ITEM_COMPONENTS[itemId] || GenericItem;
                        const pos = POSITIONS[itemId] || { x: 60 + (idx * 35) % 280, y: 260 };
                        const isActive = activeItem === itemId;

                        return (
                            <g
                                key={`${itemId}-${idx}`}
                                onClick={(e) => { e.stopPropagation(); handleItemClick(itemId); }}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Hover/active highlight ring */}
                                {isActive && (
                                    <ellipse
                                        cx={pos.x + 20}
                                        cy={pos.y + 5}
                                        rx={30}
                                        ry={11}
                                        fill="rgba(255,215,0,0.2)"
                                        stroke="#FFD700"
                                        strokeWidth="1.5"
                                        strokeDasharray="4 2"
                                    />
                                )}
                                <Component x={pos.x} y={pos.y} label={itemId} />
                            </g>
                        );
                    })}
                </svg>

                {/* Item tooltip */}
                {activeItem && activeItemData && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.92)',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: '1.5px solid rgba(255,215,0,0.5)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                    }}>
                        <span style={{ color: '#FFD700', fontWeight: '900' }}>{activeItemData.name}</span>
                        <span style={{ opacity: 0.6, fontSize: '11px' }}>+{activeItemData.buildRate} Vibes/hr</span>
                        <span style={{ background: '#CE1126', borderRadius: '4px', padding: '1px 6px', fontSize: '10px' }}>Lv.{activeItemData.level}</span>
                    </div>
                )}

                {/* Empty room hint */}
                {items.length === 0 && (
                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.6)',
                        color: 'rgba(255,255,255,0.7)',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '11px',
                        fontWeight: '700',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                    }}>
                        Visit the Shop to furnish your room!
                    </div>
                )}
            </div>
        </div>
    );
}
