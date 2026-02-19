import React, { useState, useRef, useEffect } from 'react';
import { SPRINT_MODULE_STEPS } from '../constants';
import { truncateText, formatThreadsProfileUrl } from '../utils';
import { ExternalLink, Calendar, MapPin, ArrowRight, MessageCircle } from 'lucide-react';
import ThreadsIcon from './ThreadsIcon';

// Fallback placeholder when screenshot fails
const ProjectPlaceholder = ({ name, url }) => {
    const colors = ['#CE1126', '#1a1a2e', '#16213e', '#0f3460', '#533483'];
    const color = colors[Math.abs((name || '').charCodeAt(0) || 0) % colors.length];
    const initials = (name || 'P').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
            <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: '900', color: 'white'
            }}>{initials}</div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.8)', textAlign: 'center', padding: '0 12px' }}>
                {truncateText(name, 30)}
            </div>
            {url && (
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ExternalLink size={10} /> View Project
                </div>
            )}
        </div>
    );
};

const ProjectCard = ({ s, profile, userSubmissionCount }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const screenshotUrl = s.submission_url
        ? `https://api.microlink.io?url=${encodeURIComponent(s.submission_url)}&screenshot=true&meta=false&embed=screenshot.url`
        : null;

    const dayLabel = SPRINT_MODULE_STEPS[userSubmissionCount - 1]?.split(':')[1]?.trim() || 'Ship Log';
    const districtLabel = profile?.district || s.district;

    return (
        <div className="neo-card" style={{
            border: '2px solid black', padding: '0', overflow: 'hidden',
            background: '#fff', boxShadow: '4px 4px 0px black',
            display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s',
            height: '100%', width: '100%'
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px black'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0px black'; }}
        >
            {/* Preview Image */}
            <div style={{ height: '140px', overflow: 'hidden', borderBottom: '2px solid black', position: 'relative', background: '#f3f4f6', flexShrink: 0 }}>
                {!imgFailed && screenshotUrl ? (
                    <img
                        src={screenshotUrl}
                        alt={`${s.project_name || 'Project'} preview`}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setImgFailed(true)}
                    />
                ) : (
                    <ProjectPlaceholder name={s.project_name} url={s.submission_url} />
                )}
                {/* Overlay link */}
                {s.submission_url && (
                    <a href={s.submission_url} target="_blank" rel="noreferrer"
                        style={{ position: 'absolute', inset: 0, zIndex: 2 }}
                        aria-label={`View ${s.project_name}`}
                    />
                )}
                {/* Day badge */}
                <div style={{
                    position: 'absolute', top: '8px', left: '8px', zIndex: 3,
                    background: 'var(--selangor-red)', color: 'white',
                    fontSize: '9px', fontWeight: '900', padding: '3px 8px',
                    borderRadius: '6px', border: '1.5px solid black',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    pointerEvents: 'none'
                }}>
                    {dayLabel}
                </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {/* Builder info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '30px', height: '30px', flexShrink: 0,
                        background: 'var(--selangor-red)', color: 'white',
                        borderRadius: '8px', border: '1.5px solid black',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '900', fontSize: '13px'
                    }}>
                        {(profile?.full_name || 'A')[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontWeight: '900', fontSize: '13px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {profile?.full_name || 'Anonymous Builder'}
                            </div>
                            {profile?.threads_handle && (
                                <a href={formatThreadsProfileUrl(profile.threads_handle)} target="_blank" rel="noreferrer"
                                    style={{ color: 'black', opacity: 0.6 }} onClick={e => e.stopPropagation()}>
                                    <ThreadsIcon size={12} />
                                </a>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', opacity: 0.55, marginTop: '1px' }}>
                            {districtLabel && <><MapPin size={9} />{districtLabel} · </>}
                            <Calendar size={9} />
                            {new Date(s.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                </div>

                {/* Project title — support both column naming conventions */}
                <div style={{ fontSize: '15px', fontWeight: '800', lineHeight: 1.3, color: '#111' }}>
                    {s.project_name || s.project_title || 'Project Update'}
                </div>

                {/* One-liner / description */}
                {(s.one_liner || s.description) && (
                    <div style={{
                        fontSize: '11px', lineHeight: 1.45, color: '#444',
                        background: '#f9f9f9', borderRadius: '6px',
                        padding: '8px 10px', border: '1px solid #e5e7eb',
                        marginBottom: '4px'
                    }}>
                        <div style={{ fontWeight: '900', fontSize: '8px', color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>Update</div>
                        {truncateText(s.one_liner || s.description, 140)}
                    </div>
                )}

                {/* About Snippet - only if "Day 0" or very short update */}
                {s.status === 'day0' && profile?.program_goal && (
                    <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic', padding: '0 4px', marginBottom: '8px' }}>
                        "{truncateText(profile.program_goal, 100)}"
                    </div>
                )}

                {/* Link — support both column naming conventions */}
                {(s.submission_url || s.project_url) && (
                    <a href={s.submission_url || s.project_url} target="_blank" rel="noreferrer"
                        style={{
                            marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '11px', fontWeight: '800', color: 'var(--selangor-red)',
                            textDecoration: 'none', paddingTop: '4px'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <ExternalLink size={11} /> Lihat Projek
                    </a>
                )}
            </div>
        </div>
    );
};

const ProgressWall = ({ submissions, profiles, session }) => {
    // 1. Get builders with submissions (latest per user)
    const submissionsByUser = submissions
        .filter(s => s.status !== 'rejected')
        .reduce((acc, s) => {
            if (!acc[s.user_id] || new Date(s.created_at) > new Date(acc[s.user_id].created_at)) {
                acc[s.user_id] = s;
            }
            return acc;
        }, {});

    // 2. Get active builders who have an idea but no submission (Day 0)
    const activeProfiles = profiles.filter(p => {
        const isSelf = session?.user && p.id === session.user.id;
        const isInternal = p.role === 'owner' || p.role === 'admin';
        return (p.idea_title || p.full_name) && !isSelf && !isInternal;
    });

    // 3. Combine them to ensure variety
    const recentSubmissions = activeProfiles.map(p => {
        if (submissionsByUser[p.id]) return submissionsByUser[p.id];
        // Create a "Day 0" card for builders with ideas but no progress yet
        return {
            id: `day0-${p.id}`,
            user_id: p.id,
            project_name: p.idea_title || 'Building...',
            one_liner: p.problem_statement || 'Baru mula perjalanan builder!',
            created_at: p.created_at || new Date().toISOString(),
            status: 'day0'
        };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Triplicate for seamless loop
    const loopedSubmissions = [...recentSubmissions, ...recentSubmissions, ...recentSubmissions];
    const scrollRef = useRef(null);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    useEffect(() => {
        if (scrollRef.current && recentSubmissions.length > 0) {
            const container = scrollRef.current;
            const singleSectionWidth = container.scrollWidth / 3;
            // Start in the middle section
            container.scrollLeft = singleSectionWidth;
        }
    }, [recentSubmissions.length]);

    const handleScroll = () => {
        if (!scrollRef.current || recentSubmissions.length === 0) return;
        const container = scrollRef.current;
        const singleSectionWidth = container.scrollWidth / 3;

        if (container.scrollLeft <= 10) {
            container.scrollLeft = singleSectionWidth + container.scrollLeft;
        } else if (container.scrollLeft >= singleSectionWidth * 2 - 10) {
            container.scrollLeft = container.scrollLeft - singleSectionWidth;
        }
    };

    useEffect(() => {
        let interval;
        if (isAutoScrolling && scrollRef.current && recentSubmissions.length > 0) {
            interval = setInterval(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollLeft += 1;
                }
            }, 30);
        }
        return () => clearInterval(interval);
    }, [isAutoScrolling, recentSubmissions.length]);

    if (recentSubmissions.length === 0) return null;

    return (
        <section id="progress-wall" style={{ padding: '60px 0', borderTop: '3px solid black', background: 'linear-gradient(180deg, #f9f9f9 0%, #fff 100%)', overflow: 'hidden' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="pill pill-red" style={{ marginBottom: '12px' }}>LIVE UPDATES</div>
                    <h2 style={{ fontSize: 'clamp(32px, 5vw, 42px)' }}>Progress Wall</h2>
                    <p className="text-sub" style={{ maxWidth: '500px', margin: '8px auto 0' }}>
                        Real-time shipping dari komuniti builder Selangor.
                    </p>
                </div>
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
                {/* Manual Scroll Controls */}
                <button
                    onClick={() => scrollRef.current && (scrollRef.current.scrollLeft -= 324)}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'white', border: '2px solid black', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 2px 0px black' }}
                    className="progress-scroll-btn"
                >
                    <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <button
                    onClick={() => scrollRef.current && (scrollRef.current.scrollLeft += 324)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'white', border: '2px solid black', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 2px 0px black' }}
                    className="progress-scroll-btn"
                >
                    <ArrowRight size={20} />
                </button>

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    onMouseEnter={() => setIsAutoScrolling(false)}
                    onMouseLeave={() => setIsAutoScrolling(true)}
                    onTouchStart={() => setIsAutoScrolling(false)}
                    style={{
                        width: '100%',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        paddingBottom: '24px',
                        paddingLeft: 'max(16px, calc((100vw - 1200px) / 2))',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    <div style={{ display: 'flex', gap: '24px', width: 'max-content' }}>
                        {loopedSubmissions.map((s, idx) => {
                            const profile = profiles.find(p => p.id === s.user_id);
                            const userSubmissionCount = submissions.filter(x => x.user_id === s.user_id).length;
                            return (
                                <div key={`${s.id}-${idx}`} className="project-card-container">
                                    <ProjectCard
                                        s={s}
                                        profile={profile}
                                        userSubmissionCount={userSubmissionCount}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <style>{`
                #progress-wall div::-webkit-scrollbar {
                    height: 6px;
                }
                #progress-wall div::-webkit-scrollbar-track {
                    background: transparent;
                }
                #progress-wall div::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                #progress-wall div::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.2);
                }
                @media (max-width: 768px) {
                    .progress-scroll-btn { display: none !important; }
                }
            `}</style>
        </section>
    );
};

export default ProgressWall;
