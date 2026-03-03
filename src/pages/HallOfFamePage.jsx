import React, { useEffect, useMemo, useState } from 'react';
import { Award, Brain, ExternalLink, GraduationCap, HeartPulse, Shield, Sparkles, Trophy, Wallet } from 'lucide-react';
import MobileFeatureShell from '../components/MobileFeatureShell';
import { fetchPublicHallOfFame } from '../lib/hallOfFameService';

export default function HallOfFamePage({ isMobileView, setPublicPage }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cohortPageIndex, setCohortPageIndex] = useState(0);

    useEffect(() => {
        let ignore = false;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const rows = await fetchPublicHallOfFame();
                if (!ignore) setEntries(rows);
            } catch (err) {
                if (!ignore) {
                    setEntries([]);
                    setError(String(err?.message || err || 'Failed to load hall of fame.'));
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };
        load();
        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        if (!isMobileView || typeof document === 'undefined') return undefined;
        const htmlEl = document.documentElement;
        const bodyEl = document.body;
        const rootEl = document.getElementById('root');
        const prevHtmlOverflow = htmlEl.style.overflowY;
        const prevBodyOverflow = bodyEl.style.overflowY;
        const prevRootOverflow = rootEl?.style.overflowY ?? '';
        const prevHtmlOverscroll = htmlEl.style.overscrollBehaviorY;
        const prevBodyOverscroll = bodyEl.style.overscrollBehaviorY;

        htmlEl.style.overflowY = 'hidden';
        bodyEl.style.overflowY = 'hidden';
        htmlEl.style.overscrollBehaviorY = 'none';
        bodyEl.style.overscrollBehaviorY = 'none';
        if (rootEl) rootEl.style.overflowY = 'hidden';

        return () => {
            htmlEl.style.overflowY = prevHtmlOverflow;
            bodyEl.style.overflowY = prevBodyOverflow;
            htmlEl.style.overscrollBehaviorY = prevHtmlOverscroll;
            bodyEl.style.overscrollBehaviorY = prevBodyOverscroll;
            if (rootEl) rootEl.style.overflowY = prevRootOverflow;
        };
    }, [isMobileView]);

    const latestFeaturedLabel = useMemo(() => {
        if (!entries.length) return '-';
        const latest = [...entries].sort((a, b) => new Date(b.featured_at || 0) - new Date(a.featured_at || 0))[0];
        return latest?.featured_at ? new Date(latest.featured_at).toLocaleDateString() : '-';
    }, [entries]);

    const cohortPages = useMemo(() => {
        const map = new Map();
        (entries || []).forEach((entry) => {
            const cohort = entry?.certificate?.program_title || 'General Cohort';
            const list = map.get(cohort) || [];
            list.push(entry);
            map.set(cohort, list);
        });
        return Array.from(map.entries())
            .map(([cohort, rows]) => ({
                cohort,
                rows: rows.sort((a, b) => {
                    const ao = Number(a.featured_order ?? 1000);
                    const bo = Number(b.featured_order ?? 1000);
                    if (ao !== bo) return ao - bo;
                    return new Date(b.featured_at || 0) - new Date(a.featured_at || 0);
                }),
                latest: rows.reduce((max, row) => {
                    const d = new Date(row.featured_at || 0).getTime();
                    return d > max ? d : max;
                }, 0)
            }))
            .sort((a, b) => b.latest - a.latest);
    }, [entries]);

    useEffect(() => {
        if (!cohortPages.length) {
            setCohortPageIndex(0);
            return;
        }
        setCohortPageIndex((prev) => Math.max(0, Math.min(prev, cohortPages.length - 1)));
    }, [cohortPages.length]);

    const currentCohortPage = cohortPages[cohortPageIndex] || null;
    const currentEntries = currentCohortPage?.rows || [];

    const getProjectAwardTitle = (entry, rank) => {
        const cert = entry?.certificate || {};
        const text = `${cert.app_name || ''} ${entry?.featured_quote || ''}`.toLowerCase();
        if (rank === 1) return 'Flagship Builder Award';
        if (text.includes('ai') || text.includes('prompt') || text.includes('ml')) return 'AI Innovation Award';
        if (text.includes('productivity') || text.includes('tool') || text.includes('assistant')) return 'Productivity Excellence Award';
        if (text.includes('education') || text.includes('learning') || text.includes('student')) return 'Education Impact Award';
        if (text.includes('health') || text.includes('medical')) return 'Health Impact Award';
        if (text.includes('finance') || text.includes('payment') || text.includes('fintech')) return 'Fintech Impact Award';
        if (text.includes('security') || text.includes('privacy')) return 'Security Shield Award';
        return rank <= 3 ? 'Distinguished Builder Award' : 'Builder Excellence Award';
    };

    const getIndustryMeta = (entry) => {
        const cert = entry?.certificate || {};
        const text = `${cert.app_name || ''} ${entry?.featured_quote || ''}`.toLowerCase();
        if (text.includes('ai') || text.includes('prompt') || text.includes('ml')) return { label: 'AI', Icon: Brain };
        if (text.includes('education') || text.includes('learning') || text.includes('student')) return { label: 'Education', Icon: GraduationCap };
        if (text.includes('health') || text.includes('medical')) return { label: 'Health', Icon: HeartPulse };
        if (text.includes('finance') || text.includes('payment') || text.includes('fintech')) return { label: 'Fintech', Icon: Wallet };
        if (text.includes('security') || text.includes('privacy')) return { label: 'Security', Icon: Shield };
        return { label: 'General', Icon: Award };
    };

    const mobileGlassBtnBase = isMobileView ? {
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.58)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.48), rgba(255,255,255,0.22))',
        color: '#0f172a',
        backdropFilter: 'blur(14px) saturate(1.08)',
        boxShadow: '0 6px 16px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.46)',
        textDecoration: 'none'
    } : null;
    const mobileGlassBtnTint = isMobileView ? {
        border: '1px solid rgba(239,68,68,0.26)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.54), rgba(254,226,226,0.28))'
    } : null;

    const content = (
        <div style={{ display: 'grid', gap: 14 }}>
            <section
                style={{
                    border: '1px solid rgba(15,23,42,0.14)',
                    borderRadius: 18,
                    background: 'linear-gradient(135deg, rgba(254,243,199,0.86), rgba(255,255,255,0.9))',
                    padding: isMobileView ? 14 : 18
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 900, color: '#7c2d12', letterSpacing: 0.6 }}>PROGRAM GRADUATES</div>
                        <h2 style={{ margin: '4px 0 0', fontSize: isMobileView ? 24 : 28, lineHeight: 1.05, color: '#111827' }}>Hall of Fame</h2>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ borderRadius: 12, background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(15,23,42,0.14)', padding: '8px 10px', minWidth: 88 }}>
                            <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 700 }}>Graduates</div>
                            <div style={{ fontSize: 20, fontWeight: 900 }}>{entries.length}</div>
                        </div>
                        <div style={{ borderRadius: 12, background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(15,23,42,0.14)', padding: '8px 10px', minWidth: 106 }}>
                            <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 700 }}>Latest Featured</div>
                            <div style={{ fontSize: 12, fontWeight: 800 }}>{latestFeaturedLabel}</div>
                        </div>
                    </div>
                </div>
            </section>

            {loading && (
                <div style={{ border: '1px solid rgba(15,23,42,0.1)', borderRadius: 16, background: 'rgba(255,255,255,0.88)', padding: 16, fontSize: 13 }}>
                    Loading hall of fame...
                </div>
            )}
            {!loading && error && (
                <div style={{ border: '1px solid rgba(185,28,28,0.35)', borderRadius: 16, background: 'rgba(254,242,242,0.94)', padding: 16, color: '#991b1b', fontSize: 13 }}>
                    {error}
                </div>
            )}
            {!loading && !error && entries.length === 0 && (
                <div style={{ border: '1px dashed rgba(15,23,42,0.25)', borderRadius: 16, background: 'rgba(255,255,255,0.88)', padding: 16, fontSize: 13, color: '#334155' }}>
                    No graduates featured yet.
                </div>
            )}

            {!loading && !error && entries.length > 0 && (
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isMobileView ? '1fr' : 'repeat(2, minmax(0, 1fr))' }}>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', border: '1px solid rgba(15,23,42,0.14)', borderRadius: 12, background: '#fff', padding: '8px 10px' }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a' }}>
                            Cohort: {currentCohortPage?.cohort || '-'} ({cohortPageIndex + 1}/{Math.max(1, cohortPages.length)})
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={isMobileView
                                    ? { ...mobileGlassBtnBase, padding: '6px 10px', fontSize: 10, fontWeight: 700 }
                                    : { padding: '6px 10px', fontSize: 10 }}
                                disabled={cohortPageIndex <= 0}
                                onClick={() => setCohortPageIndex((prev) => Math.max(0, prev - 1))}
                            >
                                Previous Cohort
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={isMobileView
                                    ? { ...mobileGlassBtnBase, padding: '6px 10px', fontSize: 10, fontWeight: 700 }
                                    : { padding: '6px 10px', fontSize: 10 }}
                                disabled={cohortPageIndex >= cohortPages.length - 1}
                                onClick={() => setCohortPageIndex((prev) => Math.min(cohortPages.length - 1, prev + 1))}
                            >
                                Next Cohort
                            </button>
                        </div>
                    </div>
                    {currentEntries.map((entry, idx) => {
                        const profile = entry.profile || {};
                        const cert = entry.certificate || {};
                        const projectUrl = entry.featured_project_url || cert.project_url || '';
                        const rank = idx + 1;
                        const awardTitle = getProjectAwardTitle(entry, rank);
                        const industry = getIndustryMeta(entry);
                        return (
                            <article
                                key={entry.id}
                                style={{
                                    border: '2px solid #111827',
                                    borderRadius: 18,
                                    background: 'linear-gradient(160deg, rgba(255,251,235,0.96), rgba(255,237,213,0.88) 48%, rgba(254,215,170,0.56))',
                                    boxShadow: '0 10px 0 rgba(15,23,42,0.18)',
                                    padding: isMobileView ? 12 : 14,
                                    display: 'grid',
                                    gap: 8,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ position: 'absolute', right: -32, top: -32, width: 110, height: 110, borderRadius: 999, background: 'radial-gradient(circle, rgba(251,191,36,0.55), rgba(251,191,36,0))' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 900, color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <Trophy size={12} /> Hall of Fame
                                    </div>
                                    <div style={{ fontSize: 10, border: '1px solid rgba(15,23,42,0.2)', borderRadius: 999, background: 'rgba(255,255,255,0.72)', color: '#0f172a', padding: '3px 8px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                        <industry.Icon size={11} /> {industry.label}
                                    </div>
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 900, color: '#7c2d12', letterSpacing: 0.3, textTransform: 'uppercase' }}>
                                    {awardTitle}
                                </div>
                                <div style={{ display: 'grid', gap: 2 }}>
                                    <h3 style={{ margin: 0, fontSize: 21, lineHeight: 1.08, color: '#111827', letterSpacing: '-0.01em' }}>
                                        {profile.full_name || cert.builder_name || 'Builder'}
                                    </h3>
                                    <div style={{ fontSize: 12, color: '#475569' }}>
                                        {profile.district || cert.district || 'Selangor'} - {cert.program_title || 'Program'}
                                    </div>
                                </div>
                                <div style={{ borderRadius: 10, border: '1px solid rgba(15,23,42,0.14)', background: 'rgba(255,255,255,0.7)', padding: '8px 10px' }}>
                                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, color: '#64748b', fontWeight: 800 }}>Featured Build</div>
                                    <div style={{ marginTop: 3, fontSize: 13, color: '#0f172a', fontWeight: 800 }}>{cert.app_name || 'Builder Project'}</div>
                                </div>
                                {(profile.threads_handle || '').trim() && (
                                    <a
                                        href={`https://www.threads.net/@${String(profile.threads_handle).replace(/^@/, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', textDecoration: 'none' }}
                                    >
                                        Threads: @{String(profile.threads_handle).replace(/^@/, '')}
                                    </a>
                                )}
                                {entry.featured_quote && (
                                    <blockquote style={{ margin: 0, fontSize: 12, color: '#334155', borderLeft: '3px solid rgba(239,68,68,0.45)', paddingLeft: 10, lineHeight: 1.45 }}>
                                        "{entry.featured_quote}"
                                    </blockquote>
                                )}
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {projectUrl && (
                                        <a
                                            href={projectUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-red"
                                            style={isMobileView
                                                ? { ...mobileGlassBtnBase, ...mobileGlassBtnTint, padding: '6px 10px', fontSize: 11, fontWeight: 800 }
                                                : { padding: '6px 10px', fontSize: 11, textDecoration: 'none' }}
                                        >
                                            <ExternalLink size={12} /> Live Link
                                        </a>
                                    )}
                                    {projectUrl && (
                                        <a
                                            href={projectUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-outline"
                                            style={isMobileView
                                                ? { ...mobileGlassBtnBase, padding: '6px 10px', fontSize: 11, fontWeight: 700 }
                                                : { padding: '6px 10px', fontSize: 11, textDecoration: 'none' }}
                                        >
                                            <ExternalLink size={12} /> Project
                                        </a>
                                    )}
                                    {cert.certificate_url && (
                                        <a
                                            href={cert.certificate_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-outline"
                                            style={isMobileView
                                                ? { ...mobileGlassBtnBase, padding: '6px 10px', fontSize: 11, fontWeight: 700 }
                                                : { padding: '6px 10px', fontSize: 11, textDecoration: 'none' }}
                                        >
                                            <Sparkles size={12} /> Certificate
                                        </a>
                                    )}
                                    <span style={{ fontSize: 10, border: '1px solid rgba(15,23,42,0.18)', borderRadius: 999, background: 'rgba(255,255,255,0.65)', color: '#334155', padding: '4px 8px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                        <Award size={11} /> Graduate
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    className="btn btn-outline"
                    style={isMobileView
                        ? { ...mobileGlassBtnBase, padding: '8px 12px', fontSize: 11, fontWeight: 700 }
                        : { padding: '8px 12px', fontSize: 11 }}
                    onClick={() => { setPublicPage?.('showcase'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                    Back to Showcase
                </button>
            </div>
        </div>
    );

    if (isMobileView) {
        return (
            <MobileFeatureShell
                icon={Trophy}
                title="Hall of Fame"
                subtitle="Featured graduates"
                contentPadding={12}
                bodyStyle={{ paddingTop: 0 }}
                contentStyle={{ gap: 0 }}
            >
                <div
                    style={{
                        height: 'calc(var(--app-vh, 100vh) - 220px)',
                        minHeight: 340,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        paddingRight: 2,
                        overscrollBehaviorY: 'contain',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {content}
                </div>
            </MobileFeatureShell>
        );
    }

    return (
        <div style={{ paddingTop: 82, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: 1020, paddingBottom: 80 }}>
                {content}
            </div>
        </div>
    );
}
