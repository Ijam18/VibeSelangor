import React, { useMemo, useState } from 'react';
import ThreadsIcon from '../components/ThreadsIcon';
import {
    Calendar,
    CheckCircle2,
    Database,
    ExternalLink,
    GitBranch,
    Rocket,
    Users,
    WandSparkles,
    Zap,
    Bot
} from 'lucide-react';
import MobileFeatureShell from '../components/MobileFeatureShell';
import LiveIslandBlip from '../components/LiveIslandBlip';
import { getLiveProgramMeta } from '../utils/liveProgram';

const STATS = [
    { value: '7', label: 'Days' },
    { value: '2', label: 'Live' },
    { value: 'Free', label: 'Cost' },
    { value: '0', label: 'Code' }
];

const TOOLS = [
    { icon: Zap, name: 'Antigravity', desc: 'AI IDE for rapid app building', url: 'https://antigravity.dev/' },
    { icon: Database, name: 'Supabase', desc: 'Database, auth, storage', url: 'https://supabase.com/' },
    { icon: Rocket, name: 'Vercel', desc: 'Deploy instantly', url: 'https://vercel.com/' },
    { icon: Bot, name: 'ChatGPT / Gemini', desc: 'Planning and copy support', url: 'https://chatgpt.com/' },
    { icon: GitBranch, name: 'GitHub', desc: 'Version control', url: 'https://github.com/' },
    { icon: WandSparkles, name: 'Stitch / Codex', desc: 'UI generation and coding support', url: 'https://stitch.withgoogle.com/' }
];

const REQUIREMENTS = [
    { text: 'Come with one clear app idea and target user.' },
    { text: 'Have a laptop/computer and stable internet.' },
    { text: 'Join KrackedDevs Discord and mention Selangor sprint.', link: { label: 'Join Discord', url: 'https://discord.gg/3TZeZUjc' } },
    { text: 'Create GitHub account.', link: { label: 'Sign up', url: 'https://github.com/signup' } },
    { text: 'Create Vercel account.', link: { label: 'Sign up', url: 'https://vercel.com/signup' } },
    { text: 'Install Antigravity.', link: { label: 'Get started', url: 'https://antigravity.dev/' } },
    { text: 'Currently based in Selangor.' }
];

const SPRINT_DAYS = [
    {
        day: 'Before Day 1',
        title: 'Prepare and join',
        desc: 'Confirm tools, idea, and communication channels.',
        icon: Users,
        color: '#0f172a'
    },
    {
        day: 'Day 1',
        title: 'Live build session',
        desc: 'Build MVP together and deploy first version.',
        icon: Calendar,
        color: '#be123c'
    },
    {
        day: 'Day 2 to Day 6',
        title: 'Self-paced sprint',
        desc: 'Improve features daily with async feedback.',
        icon: Zap,
        color: '#92400e'
    },
    {
        day: 'Day 7',
        title: 'Final review',
        desc: 'Finalize app and prepare for showcase.',
        icon: Rocket,
        color: '#166534'
    }
];

function MobileHowWidget({
    classes,
    handleJoinClick,
    setPublicPage,
    reqChecked,
    toggleReq,
    checkedCount,
    section,
    setSection,
    liveProgram
}) {
    const nextSessionDate = classes?.[0]?.date
        ? new Date(classes[0].date).toLocaleDateString('en-MY', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'TBA';

    const nextSessionTime = classes?.[0]?.time || 'Follow @_zarulijam on Threads for updates.';

    return (
        <MobileFeatureShell
            title="How?"
            subtitle="Sprint blueprint"
            onNavigate={setPublicPage}
            statusCenterContent={(
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6,
                        width: liveProgram ? 'min(88vw, 280px)' : 'fit-content',
                        maxWidth: liveProgram ? 'min(88vw, 280px)' : 'min(82vw, 220px)',
                        padding: '3px 6px',
                        borderRadius: 12,
                        background: 'rgba(10,10,10,0.95)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0, flex: 1 }}>
                        <span
                            style={{
                                height: 18,
                                borderRadius: 999,
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                fontSize: 9,
                                fontWeight: 500,
                                lineHeight: '16px',
                                padding: '0 8px',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                            }}
                        >
                            How?
                        </span>
                        <span
                            style={{
                                height: 18,
                                borderRadius: 999,
                                border: '1px solid rgba(245,158,11,0.4)',
                                background: 'linear-gradient(135deg, #fde047, #f59e0b)',
                                color: '#0f172a',
                                fontSize: 9,
                                fontWeight: 500,
                                lineHeight: '16px',
                                padding: '0 8px',
                                whiteSpace: 'nowrap',
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            Sprint 2026
                        </span>
                    </div>
                    {liveProgram && (
                        <LiveIslandBlip
                            title={liveProgram.title}
                            windowText={liveProgram.windowText}
                            growLeft
                        />
                    )}
                </div>
            )}
        >
            <div style={{ height: 'calc(var(--app-vh, 100vh) - clamp(162px, 20vh, 206px))', overflow: 'hidden' }}>
                <section
                    style={{
                        height: '100%',
                        borderRadius: 20,
                        border: '1px solid rgba(148,163,184,0.4)',
                        background: 'rgba(255,255,255,0.78)',
                        boxShadow: '0 12px 28px rgba(15,23,42,0.14)',
                        backdropFilter: 'blur(14px)',
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        overflow: 'hidden'
                    }}
                >
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 500, color: '#475569', letterSpacing: 0.2 }}>SELANGOR BUILDER SPRINT 2026</div>
                        <h2 style={{ margin: '4px 0 2px', fontSize: 18, lineHeight: 1.15, fontWeight: 500, color: '#0f172a' }}>
                            Build real apps in 7 days.
                        </h2>
                        <p style={{ margin: 0, fontSize: 12, color: '#334155', lineHeight: 1.35, fontWeight: 400 }}>
                            One mobile widget view with clear plan, tools, and checklist.
                        </p>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                            gap: 7
                        }}
                    >
                        {STATS.map((item) => (
                            <div
                                key={item.label}
                                style={{
                                    borderRadius: 12,
                                    border: '1px solid rgba(148,163,184,0.42)',
                                    background: 'rgba(248,250,252,0.92)',
                                    padding: '7px 4px',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: 12, fontWeight: 500, color: '#0f172a', lineHeight: 1.1 }}>{item.value}</div>
                                <div style={{ fontSize: 9, fontWeight: 500, color: '#64748b', marginTop: 2 }}>{item.label}</div>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            borderRadius: 12,
                            border: '1px solid rgba(148,163,184,0.35)',
                            background: 'rgba(15,23,42,0.95)',
                            padding: 4,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                            gap: 4
                        }}
                    >
                        {[
                            ['overview', 'Overview'],
                            ['timeline', 'Timeline'],
                            ['tools', 'Tools'],
                            ['checklist', 'Checklist']
                        ].map(([id, label]) => (
                            <button
                                key={id}
                                onClick={() => setSection(id)}
                                style={{
                                    height: 24,
                                    borderRadius: 999,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: section === id ? 'linear-gradient(135deg, #fde047, #f59e0b)' : 'rgba(255,255,255,0.08)',
                                    color: section === id ? '#0f172a' : '#e2e8f0',
                                    fontSize: 9,
                                    fontWeight: 500,
                                    lineHeight: 1,
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 2 }}>
                        {section === 'overview' && (
                            <div style={{ display: 'grid', gap: 8 }}>
                                <div
                                    style={{
                                        borderRadius: 14,
                                        border: '1px solid rgba(148,163,184,0.35)',
                                        background: 'rgba(255,255,255,0.94)',
                                        padding: 10
                                    }}
                                >
                                    <div style={{ fontSize: 10, fontWeight: 500, color: '#64748b' }}>NEXT LIVE SESSION</div>
                                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 500, color: '#0f172a', lineHeight: 1.3 }}>{nextSessionDate}</div>
                                    <div style={{ marginTop: 2, fontSize: 11, fontWeight: 400, color: '#334155' }}>{nextSessionTime}</div>
                                    <a
                                        href="https://www.threads.net/@_zarulijam"
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            marginTop: 8,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            fontSize: 10,
                                            fontWeight: 500,
                                            color: '#be123c',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        <ThreadsIcon size={13} /> Follow Updates <ExternalLink size={11} />
                                    </a>
                                </div>

                                <div
                                    style={{
                                        borderRadius: 14,
                                        border: '1px solid rgba(148,163,184,0.35)',
                                        background: 'rgba(255,255,255,0.94)',
                                        padding: 10
                                    }}
                                >
                                    <div style={{ fontSize: 10, fontWeight: 500, color: '#64748b' }}>WHAT YOU GET</div>
                                    <ul style={{ margin: '8px 0 0 16px', padding: 0, display: 'grid', gap: 5 }}>
                                        <li style={{ fontSize: 11, fontWeight: 400, color: '#0f172a' }}>Guided sprint structure for beginners.</li>
                                        <li style={{ fontSize: 11, fontWeight: 400, color: '#0f172a' }}>Live checkpoints to unblock fast.</li>
                                        <li style={{ fontSize: 11, fontWeight: 400, color: '#0f172a' }}>Production deployment workflow.</li>
                                        <li style={{ fontSize: 11, fontWeight: 400, color: '#0f172a' }}>Showcase-ready project by Day 7.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {section === 'timeline' && (
                            <div style={{ display: 'grid', gap: 8 }}>
                                {SPRINT_DAYS.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.day}
                                            style={{
                                                borderRadius: 14,
                                                border: '1px solid rgba(148,163,184,0.35)',
                                                background: 'rgba(255,255,255,0.94)',
                                                padding: 10,
                                                display: 'grid',
                                                gridTemplateColumns: '30px 1fr',
                                                gap: 8,
                                                alignItems: 'start'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: 10,
                                                    background: item.color,
                                                    color: '#fff',
                                                    display: 'grid',
                                                    placeItems: 'center'
                                                }}
                                            >
                                                <Icon size={15} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 10, fontWeight: 500, color: '#64748b' }}>{item.day}</div>
                                                <div style={{ fontSize: 12, fontWeight: 500, color: '#0f172a', marginTop: 1 }}>{item.title}</div>
                                                <div style={{ fontSize: 11, fontWeight: 400, color: '#334155', marginTop: 3, lineHeight: 1.35 }}>{item.desc}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {section === 'tools' && (
                            <div style={{ display: 'grid', gap: 8 }}>
                                {TOOLS.map((tool) => {
                                    const Icon = tool.icon;
                                    return (
                                        <a
                                            key={tool.name}
                                            href={tool.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                borderRadius: 14,
                                                border: '1px solid rgba(148,163,184,0.35)',
                                                background: 'rgba(255,255,255,0.94)',
                                                padding: 10,
                                                display: 'grid',
                                                gridTemplateColumns: '30px 1fr auto',
                                                gap: 8,
                                                alignItems: 'center',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: 9,
                                                    border: '1px solid rgba(148,163,184,0.35)',
                                                    background: '#f8fafc',
                                                    color: '#0f172a',
                                                    display: 'grid',
                                                    placeItems: 'center'
                                                }}
                                            >
                                                <Icon size={15} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 500, color: '#0f172a' }}>{tool.name}</div>
                                                <div style={{ fontSize: 10, fontWeight: 400, color: '#475569', marginTop: 1 }}>{tool.desc}</div>
                                            </div>
                                            <ExternalLink size={12} color="#64748b" />
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        {section === 'checklist' && (
                            <div style={{ display: 'grid', gap: 8 }}>
                                <div
                                    style={{
                                        borderRadius: 14,
                                        border: '1px solid rgba(148,163,184,0.35)',
                                        background: 'rgba(255,255,255,0.94)',
                                        padding: 10
                                    }}
                                >
                                    <div style={{ fontSize: 10, fontWeight: 500, color: '#64748b' }}>READY SCORE: {checkedCount}/{REQUIREMENTS.length}</div>
                                    <div style={{ marginTop: 7, height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${(checkedCount / REQUIREMENTS.length) * 100}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                            }}
                                        />
                                    </div>
                                </div>

                                {REQUIREMENTS.map((req, index) => {
                                    const done = Boolean(reqChecked[index]);
                                    return (
                                        <button
                                            key={req.text}
                                            onClick={() => toggleReq(index)}
                                            style={{
                                                textAlign: 'left',
                                                borderRadius: 14,
                                                border: done ? '1px solid rgba(22,163,74,0.45)' : '1px solid rgba(148,163,184,0.35)',
                                                background: done ? 'rgba(240,253,244,0.95)' : 'rgba(255,255,255,0.94)',
                                                padding: 10,
                                                display: 'grid',
                                                gridTemplateColumns: '18px 1fr',
                                                gap: 8,
                                                alignItems: 'start'
                                            }}
                                        >
                                            <CheckCircle2 size={16} color={done ? '#16a34a' : '#94a3b8'} style={{ marginTop: 1 }} />
                                            <div>
                                                <div style={{ fontSize: 11, fontWeight: 400, color: '#0f172a', lineHeight: 1.35 }}>{req.text}</div>
                                                {req.link && (
                                                    <a
                                                        href={req.link.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(event) => event.stopPropagation()}
                                                        style={{
                                                            marginTop: 4,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                            fontSize: 10,
                                                            fontWeight: 500,
                                                            color: '#be123c',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        {req.link.label} <ExternalLink size={11} />
                                                    </a>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 8
                        }}
                    >
                        <button
                            onClick={handleJoinClick}
                            style={{
                                height: 34,
                                borderRadius: 999,
                                border: '1px solid rgba(190,18,60,0.4)',
                                background: 'linear-gradient(135deg, #ef4444, #be123c)',
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 500
                            }}
                        >
                            Join Cohort
                        </button>
                        <button
                            onClick={() => setPublicPage('home')}
                            style={{
                                height: 34,
                                borderRadius: 999,
                                border: '1px solid rgba(148,163,184,0.5)',
                                background: 'rgba(255,255,255,0.92)',
                                color: '#0f172a',
                                fontSize: 11,
                                fontWeight: 500
                            }}
                        >
                            Back Home
                        </button>
                    </div>
                </section>
            </div>
        </MobileFeatureShell>
    );
}

export default function ProgramDetailsPage({ classes, handleJoinClick, setPublicPage, isMobileView }) {
    const [reqChecked, setReqChecked] = useState({});
    const [section, setSection] = useState('overview');

    const toggleReq = (index) => {
        setReqChecked((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    const checkedCount = useMemo(
        () => Object.values(reqChecked).filter(Boolean).length,
        [reqChecked]
    );
    const liveProgram = useMemo(() => getLiveProgramMeta(classes), [classes]);

    if (isMobileView) {
        return (
            <MobileHowWidget
                classes={classes}
                handleJoinClick={handleJoinClick}
                setPublicPage={setPublicPage}
                reqChecked={reqChecked}
                toggleReq={toggleReq}
                checkedCount={checkedCount}
                section={section}
                setSection={setSection}
                liveProgram={liveProgram}
            />
        );
    }

    return (
        <section id="how-it-works-page" style={{ padding: '40px 0 84px', minHeight: '80vh' }}>
            <div className="container">
                <div style={{ marginBottom: 24 }}>
                    <div className="pill pill-red" style={{ marginBottom: 12, display: 'inline-flex' }}>
                        <Zap size={12} /> PROGRAM DETAILS
                    </div>
                    <h1 style={{ fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.1, marginBottom: 10 }}>Selangor Builder Sprint 2026</h1>
                    <p style={{ maxWidth: 760, fontSize: 16, opacity: 0.78, lineHeight: 1.6, marginBottom: 16 }}>
                        A 7-day beginner-friendly sprint to move from idea to deployed app using modern AI tools.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>
                    {STATS.map((item) => (
                        <div key={item.label} style={{ border: '2px solid #111827', borderRadius: 12, padding: 14, background: '#fff', textAlign: 'center' }}>
                            <div style={{ fontSize: 22, fontWeight: 700 }}>{item.value}</div>
                            <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.7 }}>{item.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginBottom: 24 }}>
                    {SPRINT_DAYS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <article key={item.day} style={{ border: '2px solid #111827', borderRadius: 12, padding: 14, background: '#fff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', background: item.color, color: '#fff' }}>
                                        <Icon size={15} />
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{item.day}</div>
                                </div>
                                <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>{item.title}</h3>
                                <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>{item.desc}</p>
                            </article>
                        );
                    })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>
                    {TOOLS.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <a key={tool.name} href={tool.url} target="_blank" rel="noreferrer" style={{ border: '2px solid #111827', borderRadius: 12, padding: 12, textDecoration: 'none', color: '#111827', background: '#fff' }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #cbd5e1', display: 'grid', placeItems: 'center', marginBottom: 8 }}>
                                    <Icon size={14} />
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{tool.name}</div>
                                <div style={{ fontSize: 11, opacity: 0.7 }}>{tool.desc}</div>
                            </a>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn btn-red" onClick={handleJoinClick}>Join the Cohort</button>
                    <a href="https://www.threads.net/@_zarulijam" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                        Contact on Threads
                    </a>
                    <button className="btn btn-outline" onClick={() => setPublicPage('home')}>
                        Back to Home
                    </button>
                </div>
            </div>
        </section>
    );
}
