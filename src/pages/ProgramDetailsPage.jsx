import React, { useState } from 'react';
import ThreadsIcon from '../components/ThreadsIcon';
import { Users, Calendar, Rocket, Award, CheckCircle, ExternalLink, ChevronDown, ChevronUp, Zap, Globe, Database, Code2, MessageSquare } from 'lucide-react';

const STATS = [
    { value: '7', label: 'Days Sprint' },
    { value: '2', label: 'Live Sessions' },
    { value: '100%', label: 'Free' },
    { value: '0', label: 'Code Required' },
];

const TOOLS = [
    { emoji: '⚡', name: 'Antigravity', desc: 'AI-powered IDE for vibe coding', url: 'https://antigravity.dev/' },
    { emoji: '🗄️', name: 'Supabase', desc: 'Backend database & auth', url: 'https://supabase.com/' },
    { emoji: '🚀', name: 'Vercel', desc: 'Deploy your app in seconds', url: 'https://vercel.com/' },
    { emoji: '🤖', name: 'ChatGPT / Gemini', desc: 'AI writing & ideation', url: 'https://chatgpt.com/' },
    { emoji: '🐙', name: 'GitHub', desc: 'Version control & hosting', url: 'https://github.com/' },
    { emoji: '🎨', name: 'Stitch / Codex', desc: 'UI generation tools', url: 'https://stitch.withgoogle.com/' },
];

const REQUIREMENTS = [
    { text: 'Start with a real problem — your app must solve a clear, tangible user problem', done: false },
    { text: 'Prepare one app idea before Day 1 (problem, user, and simple feature list)', done: false },
    { text: 'Have a laptop or computer with stable internet', done: false },
    { text: 'Join KrackedDevs Discord and state you are applying for Selangor Vibe Builder', done: false, link: { label: 'Join Discord', url: 'https://discord.gg/3TZeZUjc' } },
    { text: 'Have a GitHub account', done: false, link: { label: 'Sign up', url: 'https://github.com/signup' } },
    { text: 'Have a Vercel account', done: false, link: { label: 'Sign up', url: 'https://vercel.com/signup' } },
    { text: 'Have Antigravity installed', done: false, link: { label: 'Get started', url: 'https://antigravity.dev/' } },
    { text: 'Currently live in Selangor (future sessions may include physical meetups)', done: false },
];

const SPRINT_DAYS = [
    {
        icon: <Users size={18} />,
        day: 'Before Day 1',
        color: '#6366f1',
        title: 'Prepare & Join',
        desc: 'Kickoff instructions shared on Threads. Prepare your app idea, join Discord, and set up your tools.',
    },
    {
        icon: <Calendar size={18} />,
        day: 'Day 1',
        color: '#CE1126',
        title: 'Live Build Session (2h)',
        desc: 'Build together on Discord. Deploy a working prototype by end of session.',
        badge: 'LIVE',
    },
    {
        icon: <Rocket size={18} />,
        day: 'Day 2–6',
        color: '#f59e0b',
        title: 'Self-Paced Sprint',
        desc: 'Improve your app daily. Async check-ins with the cohort. Ship features, fix bugs, get feedback.',
    },
    {
        icon: <Award size={18} />,
        day: 'Day 7',
        color: '#059669',
        title: 'Final Review (2h)',
        desc: 'Live session to review, troubleshoot, and finalize your project for the showcase.',
        badge: 'LIVE',
    },
];

export default function ProgramDetailsPage({ classes, handleJoinClick, setPublicPage, isMobileView }) {
    const [reqChecked, setReqChecked] = useState({});

    const toggleReq = (i) => setReqChecked(prev => ({ ...prev, [i]: !prev[i] }));
    const checkedCount = Object.values(reqChecked).filter(Boolean).length;

    return (
        <section id="how-it-works-page" style={{ paddingTop: '40px', paddingBottom: '80px', minHeight: '80vh' }}>
            <div className="container">

                {/* Hero */}
                <div style={{ marginBottom: '40px' }}>
                    <div className="pill pill-red" style={{ marginBottom: '16px', display: 'inline-flex' }}>
                        <Zap size={12} /> PROGRAM DETAILS
                    </div>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', marginBottom: '12px', lineHeight: 1.1 }}>
                        Selangor Builder Sprint 2026
                    </h1>
                    <p style={{ maxWidth: '640px', opacity: 0.75, fontSize: '16px', lineHeight: 1.6, marginBottom: '24px' }}>
                        A beginner-friendly 7-day sprint where you go from idea to deployed app — guided, supported, and shipped.
                        No coding experience required.
                    </p>

                    {/* Stats bar — 1-1-1-1 row on mobile and desktop */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: isMobileView ? '6px' : '12px'
                    }}>
                        {STATS.map((s, i) => (
                            <div key={i} style={{
                                border: '2px solid black',
                                borderRadius: '10px',
                                padding: isMobileView ? '8px 4px' : '12px 18px',
                                background: i === 0 ? '#CE1126' : '#fff',
                                color: i === 0 ? '#fff' : 'black',
                                textAlign: 'center',
                                boxShadow: isMobileView ? '2px 2px 0 black' : '4px 4px 0 black',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                minHeight: isMobileView ? '50px' : 'auto'
                            }}>
                                <div style={{ fontWeight: '900', fontSize: isMobileView ? '16px' : '22px', lineHeight: 1 }}>{s.value}</div>
                                <div style={{
                                    fontSize: isMobileView ? '7px' : '11px',
                                    fontWeight: '700',
                                    opacity: 0.75,
                                    marginTop: '2px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Session info banner */}
                {classes[0] && (
                    <div className="neo-card" style={{
                        border: '2px solid black', boxShadow: '6px 6px 0 black',
                        background: 'linear-gradient(135deg, #fff8dc, #fff)',
                        marginBottom: '32px', display: 'flex', alignItems: 'center',
                        gap: '16px', flexWrap: 'wrap',
                    }}>
                        <div style={{ fontSize: '32px' }}>📅</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '900', fontSize: '16px' }}>
                                Session #1: {classes[0]?.date ? new Date(classes[0].date).toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'}
                            </div>
                            <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '2px' }}>
                                {classes[0]?.time ? `🕐 ${classes[0].time}` : 'Follow @_zarulijam on Threads for the latest update.'}
                            </div>
                        </div>
                        <a
                            href="https://www.threads.net/@_zarulijam"
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline"
                            style={{ display: 'inline-flex', gap: '8px', textDecoration: 'none', padding: '10px 16px', fontSize: '13px' }}
                        >
                            <ThreadsIcon size={16} /> Follow for Updates
                        </a>
                    </div>
                )}

                {/* Sprint Timeline */}
                <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>📅 7-Day Sprint Timeline</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                    {SPRINT_DAYS.map((day, i) => (
                        <div key={i} style={{
                            border: `2px solid ${day.color}`,
                            borderRadius: '12px',
                            padding: '16px',
                            background: '#fff',
                            boxShadow: `4px 4px 0 ${day.color}`,
                            position: 'relative',
                        }}>
                            {day.badge && (
                                <span style={{
                                    position: 'absolute', top: -10, right: 12,
                                    background: '#CE1126', color: '#fff',
                                    fontSize: '9px', fontWeight: '900', padding: '2px 8px',
                                    borderRadius: '999px', border: '2px solid black',
                                    letterSpacing: '0.1em',
                                }}>● {day.badge}</span>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '8px',
                                    background: day.color, color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {day.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{day.day}</div>
                                    <div style={{ fontWeight: '900', fontSize: '14px', lineHeight: 1.2 }}>{day.title}</div>
                                </div>
                            </div>
                            <p style={{ fontSize: '12px', lineHeight: 1.5, opacity: 0.75, margin: 0 }}>{day.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Tools */}
                <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>🛠️ Tools You'll Use</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '40px' }}>
                    {TOOLS.map((tool, i) => (
                        <a
                            key={i}
                            href={tool.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                border: '2px solid black', borderRadius: '10px',
                                padding: '14px', background: '#fff',
                                boxShadow: '3px 3px 0 black', textDecoration: 'none',
                                color: 'black', display: 'flex', alignItems: 'center', gap: '12px',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 black'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 black'; }}
                        >
                            <span style={{ fontSize: '24px', flexShrink: 0 }}>{tool.emoji}</span>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '13px', lineHeight: 1.2 }}>{tool.name}</div>
                                <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>{tool.desc}</div>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Requirements Checklist */}
                <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>✅ Requirements Checklist</h2>
                <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '16px' }}>
                    Check off each item to track your readiness. ({checkedCount}/{REQUIREMENTS.length} done)
                </p>
                {checkedCount > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ height: '8px', background: '#eee', borderRadius: '999px', border: '1.5px solid black', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', background: '#CE1126',
                                width: `${(checkedCount / REQUIREMENTS.length) * 100}%`,
                                borderRadius: '999px', transition: 'width 0.3s ease',
                            }} />
                        </div>
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
                    {REQUIREMENTS.map((req, i) => (
                        <div
                            key={i}
                            onClick={() => toggleReq(i)}
                            style={{
                                border: `2px solid ${reqChecked[i] ? '#059669' : 'black'}`,
                                borderRadius: '10px', padding: '12px 16px',
                                background: reqChecked[i] ? '#f0fdf4' : '#fff',
                                boxShadow: reqChecked[i] ? '3px 3px 0 #059669' : '3px 3px 0 black',
                                cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{
                                width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                                border: `2px solid ${reqChecked[i] ? '#059669' : '#aaa'}`,
                                background: reqChecked[i] ? '#059669' : '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginTop: '1px',
                            }}>
                                {reqChecked[i] && <CheckCircle size={14} color="#fff" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{
                                    fontSize: '13px', lineHeight: 1.5,
                                    textDecoration: reqChecked[i] ? 'line-through' : 'none',
                                    opacity: reqChecked[i] ? 0.5 : 1,
                                }}>
                                    {req.text}
                                </span>
                                {req.link && (
                                    <a
                                        href={req.link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px', color: '#CE1126', fontWeight: '700', fontSize: '12px', textDecoration: 'none' }}
                                    >
                                        {req.link.label} <ExternalLink size={11} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Disclaimer */}
                <div style={{
                    border: '2px dashed #aaa', borderRadius: '10px', padding: '14px 18px',
                    background: '#fafafa', marginBottom: '32px', fontSize: '13px', opacity: 0.75,
                }}>
                    ⚠️ <strong>Disclaimer:</strong> This sprint does not teach programming in depth. It teaches you how to build and launch a web/app using modern AI tools. No prior coding experience needed.
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-red" onClick={handleJoinClick} style={{ display: 'inline-flex', gap: '8px' }}>
                        <Rocket size={16} /> Join the Cohort
                    </button>
                    <a
                        href="https://www.threads.net/@_zarulijam"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline"
                        style={{ display: 'inline-flex', gap: '8px', textDecoration: 'none' }}
                    >
                        <ThreadsIcon size={16} /> Contact on Threads
                    </a>
                    <button className="btn btn-outline" onClick={() => setPublicPage('home')}>
                        ← Back to Home
                    </button>
                </div>

            </div>
        </section>
    );
}
