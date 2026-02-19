import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, Sparkles, MapPin, MessageCircle } from 'lucide-react';
import ThreadsIcon from './ThreadsIcon';
import { SPRINT_MODULE_STEPS } from '../constants';
import { truncateText, formatThreadsProfileUrl } from '../utils';

const GalleryShowcase = ({
    profiles,
    session,
    submissions,
    setSelectedDetailProfile,
    isMobileView,
    limit,
    setPublicPage
}) => {


    let buildersToShow = profiles
        .filter(p => {
            const isSelf = session?.user && p.id === session.user.id;
            const isInternal = p.role === 'owner' || p.role === 'admin';
            // Show if they have an idea title or a submission, even if day 0
            return (p.idea_title || submissions.some(s => s.user_id === p.id)) && !isSelf && !isInternal;
        })
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    if (limit) buildersToShow = buildersToShow.slice(0, limit);

    // Triplicate for seamless loop
    const loopedBuilders = [...buildersToShow, ...buildersToShow, ...buildersToShow];

    const scrollRef = useRef(null);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    useEffect(() => {
        if (scrollRef.current && buildersToShow.length > 0) {
            const container = scrollRef.current;
            const singleSectionWidth = container.scrollWidth / 3;
            // Start in the middle section
            container.scrollLeft = singleSectionWidth;
        }
    }, [buildersToShow.length]);

    const handleScroll = () => {
        if (!scrollRef.current || buildersToShow.length === 0) return;
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
        if (isAutoScrolling && scrollRef.current && buildersToShow.length > 0) {
            interval = setInterval(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollLeft += 1;
                }
            }, 30);
        }
        return () => clearInterval(interval);
    }, [isAutoScrolling, buildersToShow.length]);



    return (
        <section id="gallery" style={{ borderTop: '3px solid black', padding: '24px 0 12px', background: '#fff', overflow: 'hidden' }}>
            <div className="container">
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <div className="pill pill-red" style={{ marginBottom: '10px' }}>THE SHOWCASE</div>
                    <h2 style={{ fontSize: 'clamp(32px, 7vw, 52px)', letterSpacing: '-2px' }}>Meet the Builders</h2>
                    <p className="text-sub" style={{ maxWidth: '600px', margin: '4px auto 0' }}>Discover the innovative apps and startups being built right here in Selangor.</p>
                </div>
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
                {/* Manual Scroll Controls */}
                <button
                    onClick={() => scrollRef.current && (scrollRef.current.scrollLeft -= 300)}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'white', border: '2px solid black', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 2px 0px black' }}
                    className="scroll-btn"
                >
                    <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <button
                    onClick={() => scrollRef.current && (scrollRef.current.scrollLeft += 300)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'white', border: '2px solid black', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 2px 0px black' }}
                    className="scroll-btn"
                >
                    <ArrowRight size={20} />
                </button>

                <div
                    className="builders-scroll-container"
                    ref={scrollRef}
                    onScroll={handleScroll}
                    onMouseEnter={() => setIsAutoScrolling(false)}
                    onMouseLeave={() => setIsAutoScrolling(true)}
                    onTouchStart={() => setIsAutoScrolling(false)}
                    style={{
                        width: '100%',
                        paddingLeft: 'max(16px, calc((100vw - 1200px) / 2))', // Dynamic padding to align first item with container
                    }}
                >
                    <div className="builders-grid">
                        {buildersToShow.length === 0 ? (
                            <div style={{ gridColumn: 'span 12', textAlign: 'center', padding: '60px', border: '3px dashed #ccc', borderRadius: '20px', width: '100%' }}>
                                <Sparkles size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                                <h3 style={{ opacity: 0.5 }}>The gallery is preparing for takeoff...</h3>
                            </div>
                        ) : (
                            loopedBuilders.map((p, idx) => {
                                const builderSubmissions = submissions.filter(s => s.user_id === p.id);
                                const latest = builderSubmissions[0];
                                const stepIndex = builderSubmissions.length > 0 ? (builderSubmissions.length > SPRINT_MODULE_STEPS.length ? SPRINT_MODULE_STEPS.length : builderSubmissions.length) : 0;

                                return (
                                    <div
                                        key={`${p.id}-${idx}`}
                                        className="neo-card builder-card"
                                        onClick={() => setSelectedDetailProfile(p)}
                                        style={{
                                            border: '3px solid black',
                                            boxShadow: '8px 8px 0px black',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            padding: '24px',
                                            background: 'white',
                                            height: '100%',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isMobileView) {
                                                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                                                e.currentTarget.style.boxShadow = '10px 10px 0px black';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isMobileView) {
                                                e.currentTarget.style.transform = 'none';
                                                e.currentTarget.style.boxShadow = '8px 8px 0px black';
                                            }
                                        }}
                                    >
                                        <div style={{ flexGrow: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <div style={{ width: '32px', height: '32px', background: 'var(--selangor-red)', color: 'white', borderRadius: '8px', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '14px' }}>
                                                    {p.full_name?.[0]}
                                                </div>
                                                <div className="pill pill-red" style={{ fontSize: '9px', padding: '2px 8px' }}>
                                                    {stepIndex === 0 ? 'KICKOFF' : SPRINT_MODULE_STEPS[stepIndex - 1]?.split(':')[1]?.trim()?.toUpperCase()}
                                                </div>
                                            </div>

                                            {latest?.submission_url && (
                                                <div style={{ height: '120px', background: '#eee', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', border: '2px solid black', position: 'relative' }}>
                                                    <img
                                                        src={`https://api.microlink.io?url=${encodeURIComponent(latest.submission_url)}&screenshot=true&meta=false&embed=screenshot.url`}
                                                        alt="Preview"
                                                        loading="lazy"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                    <a href={latest.submission_url} target="_blank" rel="noreferrer" style={{ position: 'absolute', inset: 0 }} aria-label="View Project" />
                                                </div>
                                            )}

                                            <h4 style={{ fontSize: '18px', marginBottom: '8px', lineHeight: 1.1, fontWeight: '900' }}>{latest?.project_name || p.idea_title || 'Untitled Project'}</h4>

                                            <div style={{ fontSize: '11px', lineHeight: '1.45', color: '#444', marginBottom: '14px', minHeight: '60px' }}>
                                                <div style={{ fontWeight: '900', fontSize: '9px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vision & Mission</div>
                                                {truncateText(latest?.one_liner || p.problem_statement, 160)}
                                            </div>

                                            {(p.about_yourself || p.program_goal) && (
                                                <div style={{ fontSize: '10px', lineHeight: '1.45', color: '#666', background: '#f9f9f9', padding: '10px', borderRadius: '8px', border: '1px dashed #ccc', marginBottom: '16px', minHeight: '50px' }}>
                                                    <div style={{ fontWeight: '900', fontSize: '8px', color: '#999', marginBottom: '4px', textTransform: 'uppercase' }}>Builder Note</div>
                                                    {truncateText(p.about_yourself || p.program_goal, 120)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Sprint Progress Bar */}
                                        <div style={{ marginTop: '4px' }}>
                                            <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
                                                {Array.from({ length: 7 }).map((_, i) => {
                                                    const done = i < stepIndex;
                                                    const isLast = i === 6 && stepIndex === 7;
                                                    return (
                                                        <div
                                                            key={i}
                                                            title={`Day ${i + 1}${done ? ' ✓' : ''}`}
                                                            style={{
                                                                flex: 1,
                                                                height: '5px',
                                                                borderRadius: '99px',
                                                                background: done ? (isLast ? '#FFD700' : 'var(--selangor-red)') : '#e5e7eb',
                                                                transition: 'background 0.3s',
                                                                border: done ? '1px solid rgba(0,0,0,0.15)' : '1px solid #e5e7eb',
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em', marginTop: '2px' }}>
                                                <div style={{ color: stepIndex === 7 ? '#FFD700' : '#888' }}>
                                                    {stepIndex === 0 ? 'NOT STARTED' : stepIndex === 7 ? '⭐ SPRINT COMPLETE' : `DAY ${stepIndex} / 7`}
                                                </div>
                                                {p.threads_handle && (
                                                    <a href={formatThreadsProfileUrl(p.threads_handle)} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'black', textDecoration: 'none', opacity: 0.7 }}>
                                                        <ThreadsIcon size={10} />
                                                        <span>@{p.threads_handle.replace('@', '')}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '2px solid #eee', paddingTop: '10px', marginTop: '4px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ fontSize: '12px', fontWeight: '900' }}>{p.full_name}</div>
                                                <div style={{ fontSize: '10px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <MapPin size={10} />
                                                    {p.district || 'Selangor'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .builders-scroll-container::-webkit-scrollbar {
                    height: 6px;
                }
                .builders-scroll-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .builders-scroll-container::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .builders-scroll-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.2);
                }
                @media (max-width: 768px) {
                    .scroll-btn { display: none !important; }
                }
            `}</style>

            <div className="container">
                {limit && profiles.filter(p => !session?.user || p.id !== session.user.id).length > limit && (
                    <div style={{ marginTop: '28px', textAlign: 'center' }}>
                        <button
                            className="btn btn-red"
                            style={{ padding: '16px 40px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}
                            onClick={() => {
                                setPublicPage('showcase');
                                window.scrollTo({ top: 0, behavior: 'auto' });
                            }}
                        >
                            VIEW ALL BUILDERS <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GalleryShowcase;
