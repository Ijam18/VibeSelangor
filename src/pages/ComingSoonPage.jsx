import React, { useState } from 'react';
import ThreadsIcon from '../components/ThreadsIcon';
import { Rocket, CheckCircle, Clock, Zap, Users, MessageSquare, Trophy, Smartphone, Brain, Star, Bot, Gamepad2, Globe, Image, MessageCircle, ArrowRight } from 'lucide-react';

const SHIPPED = [
    { icon: <Bot size={20} />, label: 'Ijam Bot (AI Chatbot)', desc: 'Local + NVIDIA AI fallback', page: 'home', sectionId: 'how-it-works' },
    { icon: <Gamepad2 size={20} />, label: 'Builder Arcade', desc: 'Bug Squash mini-game', page: 'studio' },
    { icon: <MessageSquare size={20} />, label: 'Builders Forum', desc: 'Post, reply, earn XP', page: 'forum' },
    { icon: <Trophy size={20} />, label: 'Leaderboard', desc: 'Top builders by XP & vibes', page: 'leaderboard' },
    { icon: <Smartphone size={20} />, label: 'PWA Support', desc: 'Install on Android & iOS', page: 'how-it-works' },
    { icon: <Globe size={20} />, label: 'Selangor Map', desc: 'Live district builder tracker', page: 'home', sectionId: 'map' },
    { icon: <Image size={20} />, label: 'Showcase Gallery', desc: 'Browse all builder projects', page: 'showcase' },
    { icon: <MessageCircle size={20} />, label: 'Live Class Chat', desc: 'Real-time chat during sessions', page: 'home', sectionId: 'how-it-works' },
];

const ROADMAP = [
    {
        id: 'ai-ideas',
        status: 'planned',
        icon: <Brain size={20} />,
        title: 'AI Idea Generator',
        detail: 'Generate grounded product ideas based on local Selangor problems, district context, and real builder needs using AI.',
        eta: 'Sprint 2'
    },
    {
        id: 'collab',
        status: 'planned',
        icon: <Users size={20} />,
        title: 'Builder Collaboration',
        detail: 'Find co-builders, form teams, and collaborate on projects directly within the platform.',
        eta: 'Sprint 2'
    },
    {
        id: 'review',
        status: 'planned',
        icon: <Star size={20} />,
        title: 'Submission Review System',
        detail: 'Structured peer review and mentor feedback on builder project submissions.',
        eta: 'Sprint 3'
    },
    {
        id: 'mobile',
        status: 'in-progress',
        icon: <Smartphone size={20} />,
        title: 'Mobile Polish',
        detail: 'Deeper mobile UX improvements — swipe gestures, haptic feedback, and offline-first experience.',
        eta: 'Ongoing'
    },
    {
        id: 'discord',
        status: 'planned',
        icon: <MessageSquare size={20} />,
        title: 'Discord Integration',
        detail: 'Sync builder activity, class alerts, and leaderboard updates directly to the KrackedDevs Discord server.',
        eta: 'Sprint 3'
    },
    {
        id: 'achievements',
        status: 'in-progress',
        icon: <Trophy size={20} />,
        title: 'Achievement Badges',
        detail: 'Earn badges for shipping, attending sessions, helping others, and reaching milestones.',
        eta: 'Sprint 2'
    },
];

const STATUS_CONFIG = {
    'planned': { label: 'Planned', color: '#6b7280', bg: '#f3f4f6' },
    'in-progress': { label: 'In Progress', color: '#d97706', bg: '#fef3c7' },
    'done': { label: 'Shipped ✓', color: '#059669', bg: '#d1fae5' },
};

export default function ComingSoonPage({ setPublicPage }) {
    const [expanded, setExpanded] = useState(null);
    const [activeFeature, setActiveFeature] = useState(null);

    const openFeature = (feature) => {
        setActiveFeature(feature.label);
        window.requestAnimationFrame(() => setActiveFeature(null));

        if (feature.page) {
            setPublicPage(feature.page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (feature.sectionId) {
            setTimeout(() => {
                document.getElementById(feature.sectionId)?.scrollIntoView({ behavior: 'smooth' });
            }, 120);
        }
    };

    return (
        <section id="coming-soon-page" style={{ paddingTop: '40px', paddingBottom: '80px', minHeight: '80vh' }}>
            <div className="container">

                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div className="pill pill-red" style={{ marginBottom: '16px', display: 'inline-flex' }}>
                        <Rocket size={12} /> ROADMAP
                    </div>
                    <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', marginBottom: '12px', lineHeight: 1.1 }}>
                        What's Coming Next
                    </h1>
                    <p style={{ maxWidth: '560px', margin: '0 auto', opacity: 0.7, fontSize: '16px', lineHeight: 1.6 }}>
                        VibeSelangor is actively being built in public. Here's what's shipped and what's next.
                    </p>
                </div>

                {/* Already Shipped */}
                <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black', marginBottom: '40px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <CheckCircle size={22} color="#059669" />
                        <h2 style={{ fontSize: '22px', margin: 0, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}><Rocket size={20} color="#059669" /> Already Shipped</h2>
                    </div>
                    <p style={{ marginTop: '-10px', marginBottom: '16px', fontSize: '12px', opacity: 0.68, fontWeight: '700' }}>
                        Click any feature card to open its page.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                        {SHIPPED.map((item, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => openFeature(item)}
                                style={{
                                    background: activeFeature === item.label ? '#fff7ed' : '#fff',
                                    border: '2px solid #121417',
                                    borderRadius: '10px',
                                    padding: '12px 14px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease',
                                    boxShadow: '3px 3px 0px black'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                                    e.currentTarget.style.boxShadow = '5px 5px 0px black';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = '3px 3px 0px black';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>{item.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '800', fontSize: '13px', lineHeight: 1.2 }}>{item.label}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>{item.desc}</div>
                                    <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--selangor-red)' }}>
                                        Open Page <ArrowRight size={12} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Roadmap */}
                <h2 style={{ fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={22} /> Upcoming Features
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                    {ROADMAP.map((item) => {
                        const cfg = STATUS_CONFIG[item.status];
                        const isExpanded = expanded === item.id;
                        return (
                            <div
                                key={item.id}
                                className="neo-card"
                                style={{
                                    border: '2px solid black',
                                    boxShadow: isExpanded ? '6px 6px 0px black' : '4px 4px 0px black',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: isExpanded ? '#fffdf2' : '#fff',
                                }}
                                onClick={() => setExpanded(isExpanded ? null : item.id)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '8px',
                                            background: '#f5d000', border: '2px solid black',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '15px', lineHeight: 1.2 }}>{item.title}</div>
                                            <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>ETA: {item.eta}</div>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '10px', fontWeight: '800', padding: '3px 8px',
                                        borderRadius: '999px', border: `1.5px solid ${cfg.color}`,
                                        color: cfg.color, background: cfg.bg, whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                    }}>
                                        {cfg.label}
                                    </span>
                                </div>
                                {isExpanded && (
                                    <p style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.8, marginTop: '10px', borderTop: '1px dashed #ddd', paddingTop: '10px' }}>
                                        {item.detail}
                                    </p>
                                )}
                                {!isExpanded && (
                                    <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>Click to expand ↓</p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black', textAlign: 'center', background: 'linear-gradient(135deg, #fff8dc, #fff)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><MessageSquare size={32} style={{ opacity: 0.6 }} /></div>
                    <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Have feedback or ideas?</h3>
                    <p style={{ opacity: 0.7, marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
                        This platform is built in public. Your feedback directly shapes what gets built next.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a
                            className="btn btn-red"
                            href="https://www.threads.net/@_zarulijam"
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', gap: '8px', textDecoration: 'none' }}
                        >
                            <ThreadsIcon size={18} /> Give Feedback on Threads
                        </a>
                        <a
                            className="btn btn-outline"
                            href="https://discord.gg/3TZeZUjc"
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', gap: '8px', textDecoration: 'none' }}
                        >
                            <MessageSquare size={18} /> Join Discord
                        </a>
                        <button className="btn btn-outline" onClick={() => setPublicPage('home')}>
                            ← Back to Home
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}
