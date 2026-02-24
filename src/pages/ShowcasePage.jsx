import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Heart, MapPin, MessageCircle, Ellipsis, X, Grid3X3, Link2, Flag, Flame, Clock3, SlidersHorizontal } from 'lucide-react';
import ProgressWall from '../components/ProgressWall';
import GalleryShowcase from '../components/GalleryShowcase';
import MobileFeatureShell from '../components/MobileFeatureShell';
import LiveIslandBlip from '../components/LiveIslandBlip';
import { truncateText } from '../utils';
import { SPRINT_MODULE_STEPS } from '../constants';
import { supabase } from '../lib/supabase';
import { getLiveProgramMeta } from '../utils/liveProgram';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'linked', label: 'Live Links' },
    { id: 'day0', label: 'Kickoff' },
    { id: 'hot', label: 'Hot' },
    { id: 'latest', label: 'Latest' }
];

const FILTER_ICONS = {
    all: Grid3X3,
    linked: Link2,
    day0: Flag,
    hot: Flame,
    latest: Clock3
};
const ADV_DEFAULT = { district: 'all', stage: 'all', hasLink: 'all', sort: 'latest' };

const emptySocial = { likes: 0, liked: false, comments: [] };
const toContentKey = (item) => (item?.isDay0 ? `kickoff:${item.userId}` : `submission:${item.id}`);

function MobileShowcaseFeed({ submissions, profiles, session, setSelectedDetailProfile, setPublicPage, classes = [], certificates = [] }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [advanced, setAdvanced] = useState(ADV_DEFAULT);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [viewMode, setViewMode] = useState('feed');
    const [social, setSocial] = useState({});
    const [commentDrafts, setCommentDrafts] = useState({});
    const [openCommentItem, setOpenCommentItem] = useState(null);
    const [detailItem, setDetailItem] = useState(null);
    const feedRef = useRef(null);
    const liveProgram = useMemo(() => getLiveProgramMeta(classes), [classes]);

    const districtOptions = useMemo(() => {
        const unique = Array.from(
            new Set((profiles || []).map((p) => p?.district).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));
        return ['all', ...unique];
    }, [profiles]);

    useEffect(() => {
        const targets = [document.documentElement, document.body, document.getElementById('root')].filter(Boolean);
        const previous = targets.map((el) => ({
            el,
            overflowY: el.style.overflowY,
            overscrollBehaviorY: el.style.overscrollBehaviorY
        }));

        targets.forEach((el) => {
            el.style.overflowY = 'hidden';
            el.style.overscrollBehaviorY = 'none';
        });

        return () => {
            previous.forEach(({ el, overflowY, overscrollBehaviorY }) => {
                el.style.overflowY = overflowY;
                el.style.overscrollBehaviorY = overscrollBehaviorY;
            });
        };
    }, []);

    const { feedItems, progressItems, userHistory, profileById } = useMemo(() => {
        const safeProfiles = profiles || [];
        const safeSubmissions = submissions || [];
        const pick = (...values) => values.find((v) => typeof v === 'string' && v.trim()) || '';

        const visibleProfiles = safeProfiles.filter((p) => {
            const isSelf = session?.user && p.id === session.user.id;
            const isInternal = p.role === 'owner' || p.role === 'admin';
            return !isSelf && !isInternal && (p.idea_title || safeSubmissions.some((s) => s.user_id === p.id));
        });

        const profileMap = visibleProfiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        const byUser = safeSubmissions.reduce((acc, s) => {
            if (!acc[s.user_id]) acc[s.user_id] = [];
            acc[s.user_id].push(s);
            return acc;
        }, {});

        const seen = new Set();
        const nextFeed = [];
        const nextProgress = [];
        const nextHistory = {};

        visibleProfiles.forEach((profile) => {
            const userSubsAsc = (byUser[profile.id] || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            const userSubsDesc = [...userSubsAsc].reverse();
            const latest = userSubsDesc[0];

            const timeline = userSubsAsc.map((submission, index) => {
                const stepIndex = Math.min(index + 1, SPRINT_MODULE_STEPS.length);
                return {
                    id: submission.id || `${profile.id}-${index}`,
                    userId: profile.id,
                    name: profile.full_name || 'Builder',
                    district: profile.district || 'Selangor',
                    title: pick(submission.project_name, submission.idea_title, profile.idea_title, 'Untitled Project'),
                    oneLiner: pick(
                        submission.one_liner,
                        submission.description,
                        submission.progress_update,
                        submission.summary,
                        submission.problem_statement,
                        profile.problem_statement,
                        'New build in progress.'
                    ),
                    link: pick(submission.submission_url, submission.project_url, submission.demo_url, submission.github_url) || null,
                    createdAt: submission.created_at || profile.created_at || new Date().toISOString(),
                    stepIndex,
                    dayLabel: SPRINT_MODULE_STEPS[stepIndex - 1]?.split(':')[1]?.trim() || `Day ${stepIndex}`,
                    isDay0: false
                };
            });

            nextHistory[profile.id] = timeline;

            if (timeline.length === 0) {
                nextFeed.push({
                    id: `day0-${profile.id}`,
                    userId: profile.id,
                    name: profile.full_name || 'Builder',
                    district: profile.district || 'Selangor',
                    title: pick(profile.idea_title, 'Kickoff idea'),
                    oneLiner: pick(profile.problem_statement, profile.idea_summary, 'Builder kickoff update.'),
                    link: null,
                    createdAt: profile.created_at || new Date().toISOString(),
                    stepIndex: 0,
                    dayLabel: 'Kickoff',
                    isDay0: true
                });
            } else {
                const latestTimelineEntry = timeline[timeline.length - 1];
                const key = `${latestTimelineEntry.id}:${latestTimelineEntry.createdAt}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    nextFeed.push(latestTimelineEntry);
                }
            }

            nextProgress.push({
                id: `builder-${profile.id}`,
                userId: profile.id,
                name: profile.full_name || 'Builder',
                district: profile.district || 'Selangor',
                title: pick(latest?.project_name, latest?.idea_title, profile.idea_title, 'Untitled Project'),
                oneLiner: pick(
                    latest?.one_liner,
                    latest?.description,
                    latest?.progress_update,
                    latest?.summary,
                    latest?.problem_statement,
                    profile.problem_statement,
                    'New build in progress.'
                ),
                link: pick(latest?.submission_url, latest?.project_url, latest?.demo_url, latest?.github_url) || null,
                createdAt: latest?.created_at || profile.created_at || new Date().toISOString(),
                stepIndex: timeline.length,
                dayLabel: timeline.length > 0
                    ? (SPRINT_MODULE_STEPS[Math.min(timeline.length, SPRINT_MODULE_STEPS.length) - 1]?.split(':')[1]?.trim() || `Day ${timeline.length}`)
                    : 'Kickoff',
                isDay0: timeline.length === 0,
                updatesCount: timeline.length
            });
        });

        return { feedItems: nextFeed, progressItems: nextProgress, userHistory: nextHistory, profileById: profileMap };
    }, [profiles, submissions, session]);

    const certificateByBuilderId = useMemo(() => {
        const map = new Map();
        (certificates || []).forEach((cert) => {
            if (cert?.builder_id && !map.has(cert.builder_id)) map.set(cert.builder_id, cert);
        });
        return map;
    }, [certificates]);

    const showcaseStats = useMemo(() => {
        const activeBuilders = progressItems.length;
        const ideasSubmitted = (profiles || []).filter((p) => {
            const role = (p?.role || '').toLowerCase();
            if (role === 'owner' || role === 'admin') return false;
            return Boolean((p?.idea_title || '').trim());
        }).length;
        const projectsSubmitted = (submissions || []).filter((s) => {
            const link = s?.submission_url || s?.project_url || s?.demo_url || s?.github_url;
            return Boolean((link || '').trim());
        }).length;
        const liveLinks = feedItems.filter((item) => Boolean(item.link)).length;
        const kickoffOnly = progressItems.filter((item) => item.isDay0).length;
        const avgProgressPct = activeBuilders > 0
            ? Math.round(
                (progressItems.reduce((acc, item) => acc + Math.min(item.stepIndex || 0, SPRINT_MODULE_STEPS.length), 0)
                    / (activeBuilders * SPRINT_MODULE_STEPS.length)) * 100
            )
            : 0;

        const districtCounts = progressItems.reduce((acc, item) => {
            const key = item.district || 'Selangor';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const topDistricts = Object.entries(districtCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        return {
            activeBuilders,
            ideasSubmitted,
            projectsSubmitted,
            liveLinks,
            kickoffOnly,
            avgProgressPct,
            topDistricts
        };
    }, [feedItems, profiles, progressItems, submissions]);

    const data = useMemo(() => {
        let next = [...(viewMode === 'feed' ? feedItems : progressItems)];

        if (activeFilter === 'linked') next = next.filter((i) => Boolean(i.link));
        if (activeFilter === 'day0') next = next.filter((i) => i.isDay0);
        if (activeFilter === 'hot') {
            next = next.filter((i) => {
                if (viewMode === 'feed') {
                    const s = social[toContentKey(i)] || {};
                    return (s.likes || 0) + (s.comments?.length || 0) > 0;
                }
                const history = userHistory[i.userId] || [];
                const score = history.reduce((acc, entry) => {
                    const s = social[toContentKey(entry)] || {};
                    return acc + (s.likes || 0) + (s.comments?.length || 0);
                }, 0);
                return score > 0;
            });
        }

        if (advanced.district !== 'all') next = next.filter((i) => i.district === advanced.district);
        if (advanced.hasLink === 'yes') next = next.filter((i) => Boolean(i.link));
        if (advanced.hasLink === 'no') next = next.filter((i) => !i.link);
        if (advanced.stage === 'kickoff') next = next.filter((i) => i.stepIndex === 0);
        if (advanced.stage === 'day1_2') next = next.filter((i) => i.stepIndex >= 1 && i.stepIndex <= 2);
        if (advanced.stage === 'day3_5') next = next.filter((i) => i.stepIndex >= 3 && i.stepIndex <= 5);
        if (advanced.stage === 'day6_7') next = next.filter((i) => i.stepIndex >= 6 && i.stepIndex <= 7);

        if (activeFilter === 'latest' || advanced.sort === 'latest') {
            next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (advanced.sort === 'oldest') {
            next.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (advanced.sort === 'most_liked') {
            const likedScore = (entry) => {
                if (viewMode === 'feed') return social[toContentKey(entry)]?.likes || 0;
                return (userHistory[entry.userId] || []).reduce((acc, timelineEntry) => acc + (social[toContentKey(timelineEntry)]?.likes || 0), 0);
            };
            next.sort((a, b) => (likedScore(b) - likedScore(a)) || (new Date(b.createdAt) - new Date(a.createdAt)));
        } else if (advanced.sort === 'most_commented') {
            const commentScore = (entry) => {
                if (viewMode === 'feed') return social[toContentKey(entry)]?.comments?.length || 0;
                return (userHistory[entry.userId] || []).reduce((acc, timelineEntry) => acc + (social[toContentKey(timelineEntry)]?.comments?.length || 0), 0);
            };
            next.sort((a, b) => (commentScore(b) - commentScore(a)) || (new Date(b.createdAt) - new Date(a.createdAt)));
        } else {
            next.sort((a, b) => (b.stepIndex - a.stepIndex) || (new Date(b.createdAt) - new Date(a.createdAt)));
        }

        return next;
    }, [viewMode, feedItems, progressItems, activeFilter, advanced, social, userHistory]);

    useEffect(() => {
        let ignore = false;
        const run = async () => {
            if (!feedItems.length) {
                if (!ignore) setSocial({});
                return;
            }

            const keys = Array.from(new Set(feedItems.map((item) => toContentKey(item))));

            const [likesRes, commentsRes] = await Promise.all([
                supabase
                    .from('showcase_likes')
                    .select('content_key,user_id')
                    .in('content_key', keys),
                supabase
                    .from('showcase_comments')
                    .select('id,content_key,user_id,body,created_at')
                    .in('content_key', keys)
                    .order('created_at', { ascending: true })
            ]);

            if (ignore) return;
            if (likesRes.error || commentsRes.error) return;

            const likes = likesRes.data || [];
            const comments = commentsRes.data || [];
            const currentUserId = session?.user?.id || null;
            const next = {};

            keys.forEach((key) => {
                const keyLikes = likes.filter((row) => row.content_key === key);
                const keyComments = comments
                    .filter((row) => row.content_key === key)
                    .map((row) => ({ id: row.id, text: row.body, ts: row.created_at, userId: row.user_id }));

                next[key] = {
                    likes: keyLikes.length,
                    liked: currentUserId ? keyLikes.some((row) => row.user_id === currentUserId) : false,
                    comments: keyComments
                };
            });

            setSocial(next);
        };

        run();
        return () => {
            ignore = true;
        };
    }, [feedItems, session?.user?.id]);


    const updateSocial = (key, updater) => {
        setSocial((prev) => {
            const current = prev[key] || emptySocial;
            return { ...prev, [key]: updater(current) };
        });
    };

    const toggleLike = async (item) => {
        if (!session?.user?.id) return;
        const key = toContentKey(item);
        const current = social[key] || emptySocial;

        updateSocial(key, (state) => {
            if (state.liked) return { ...state, liked: false, likes: Math.max(0, (state.likes || 0) - 1) };
            return { ...state, liked: true, likes: (state.likes || 0) + 1 };
        });

        if (current.liked) {
            const { error } = await supabase
                .from('showcase_likes')
                .delete()
                .eq('content_key', key)
                .eq('user_id', session.user.id);
            if (error) {
                updateSocial(key, () => current);
            }
            return;
        }

        const { error } = await supabase.from('showcase_likes').insert({
            content_key: key,
            submission_ref: String(item.id),
            user_id: session.user.id
        });
        if (error) {
            updateSocial(key, () => current);
        }
    };

    const submitComment = async (item) => {
        if (!session?.user?.id) return;
        const text = (commentDrafts[item.id] || '').trim();
        if (!text) return;

        const key = toContentKey(item);
        const optimistic = { id: `temp-${Date.now()}`, text, ts: new Date().toISOString(), userId: session.user.id };
        const current = social[key] || emptySocial;

        updateSocial(key, (state) => ({
            ...state,
            comments: [...(state.comments || []), optimistic]
        }));
        setCommentDrafts((prev) => ({ ...prev, [item.id]: '' }));

        const { data: inserted, error } = await supabase
            .from('showcase_comments')
            .insert({
                content_key: key,
                submission_ref: String(item.id),
                user_id: session.user.id,
                body: text
            })
            .select('id,content_key,user_id,body,created_at')
            .single();

        if (error || !inserted) {
            updateSocial(key, () => current);
            setCommentDrafts((prev) => ({ ...prev, [item.id]: text }));
            return;
        }

        updateSocial(key, (state) => ({
            ...state,
            comments: (state.comments || []).map((comment) =>
                comment.id === optimistic.id
                    ? { id: inserted.id, text: inserted.body, ts: inserted.created_at, userId: inserted.user_id }
                    : comment
            )
        }));
    };

    const islandContent = (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                width: 'fit-content',
                maxWidth: liveProgram ? 'min(88vw, 296px)' : 'min(82vw, 240px)',
                margin: '0 auto',
                background: 'rgba(10,10,10,0.95)',
                color: '#fff',
                borderRadius: 11,
                padding: '3px 6px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
                overflow: 'hidden'
            }}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, opacity: 0.9 }}>
                <SlidersHorizontal size={9} />
            </span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', overflow: 'hidden', minWidth: 0, flex: 1 }}>
                {FILTERS.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        aria-label={f.label}
                        title={f.label}
                        style={{
                            border: activeFilter === f.id ? '1px solid #fca5a5' : '1px solid rgba(255,255,255,0.22)',
                            background: activeFilter === f.id ? 'rgba(239,68,68,0.24)' : 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            borderRadius: 999,
                            width: 16,
                            height: 16,
                            minWidth: 16,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            lineHeight: 1
                        }}
                    >
                        {React.createElement(FILTER_ICONS[f.id] || Grid3X3, { size: 9 })}
                    </button>
                ))}
            </div>
            <button
                onClick={() => setShowAdvanced((v) => !v)}
                aria-label='Advanced filters'
                style={{
                    border: '1px solid rgba(255,255,255,0.22)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    width: 16,
                    height: 16,
                    minWidth: 16,
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                }}
            >
                <Ellipsis size={10} />
            </button>
            {liveProgram && (
                <LiveIslandBlip title={liveProgram.title} windowText={liveProgram.windowText} growLeft />
            )}
        </div>
    );
    return (
        <MobileFeatureShell
            title="Showcase"
            subtitle="Latest builder drops"
            statusCenterContent={islandContent}
            islandWide
            onNavigate={setPublicPage}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <section style={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.72)', padding: '8px 9px' }}>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 5 }}>Showcase Overview</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div style={{ borderRadius: 9, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 7px' }}>
                            <div style={{ fontSize: 10, color: '#64748b' }}>Builders</div>
                            <div style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: 1.1 }}>{showcaseStats.activeBuilders}</div>
                        </div>
                        <div style={{ borderRadius: 9, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 7px' }}>
                            <div style={{ fontSize: 10, color: '#64748b' }}>Ideas</div>
                            <div style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: 1.1 }}>{showcaseStats.ideasSubmitted}</div>
                        </div>
                        <div style={{ borderRadius: 9, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 7px' }}>
                            <div style={{ fontSize: 10, color: '#64748b' }}>Projects</div>
                            <div style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: 1.1 }}>{showcaseStats.projectsSubmitted}</div>
                        </div>
                        <div style={{ borderRadius: 9, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 7px' }}>
                            <div style={{ fontSize: 10, color: '#64748b' }}>Live links</div>
                            <div style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: 1.1 }}>{showcaseStats.liveLinks}</div>
                        </div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 10, color: '#475569', lineHeight: 1.35 }}>
                        {showcaseStats.kickoffOnly} kickoff-only builders
                    </div>
                </section>

                <section style={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(255,255,255,0.72)', padding: '8px 9px' }}>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 5 }}>Builder Analytics</div>
                    <div style={{ display: 'grid', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
                            <span style={{ color: '#64748b' }}>Avg progress</span>
                            <span style={{ color: '#0f172a', fontWeight: 600 }}>{showcaseStats.avgProgressPct}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                            <div style={{ width: `${showcaseStats.avgProgressPct}%`, height: '100%', background: '#ef4444' }} />
                        </div>
                        <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.35 }}>
                            Top 3 districts:
                        </div>
                        <div style={{ display: 'grid', gap: 2 }}>
                            {showcaseStats.topDistricts.length === 0 && (
                                <div style={{ fontSize: 10, color: '#64748b' }}>N/A</div>
                            )}
                            {showcaseStats.topDistricts.map(([district, count], idx) => (
                                <div key={`${district}-${idx}`} style={{ fontSize: 10, color: '#334155' }}>
                                    {idx + 1}. {district} ({count})
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            {showAdvanced && (
                <div style={{ marginBottom: 8, border: '1px solid rgba(148,163,184,0.35)', borderRadius: 14, padding: 10, background: '#ffffffcc', display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button
                            onClick={() => setViewMode('feed')}
                            style={{
                                flex: 1,
                                border: '1px solid #cbd5e1',
                                borderRadius: 999,
                                padding: '6px 8px',
                                background: viewMode === 'feed' ? '#ef4444' : '#fff',
                                color: viewMode === 'feed' ? '#fff' : '#0f172a',
                                fontWeight: 600,
                                fontSize: 11
                            }}
                        >
                            All Updates
                        </button>
                        <button
                            onClick={() => setViewMode('progress')}
                            style={{
                                flex: 1,
                                border: '1px solid #cbd5e1',
                                borderRadius: 999,
                                padding: '6px 8px',
                                background: viewMode === 'progress' ? '#ef4444' : '#fff',
                                color: viewMode === 'progress' ? '#fff' : '#0f172a',
                                fontWeight: 600,
                                fontSize: 11
                            }}
                        >
                            Builder Progress
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <select value={advanced.district} onChange={(event) => setAdvanced((prev) => ({ ...prev, district: event.target.value }))} style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '6px 8px', fontSize: 11 }}>
                            {districtOptions.map((district) => (
                                <option key={district} value={district}>{district === 'all' ? 'All districts' : district}</option>
                            ))}
                        </select>
                        <select value={advanced.sort} onChange={(event) => setAdvanced((prev) => ({ ...prev, sort: event.target.value }))} style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '6px 8px', fontSize: 11 }}>
                            <option value="latest">Latest</option>
                            <option value="oldest">Oldest</option>
                            <option value="most_liked">Most liked</option>
                            <option value="most_commented">Most commented</option>
                        </select>
                    </div>
                </div>
            )}
            <div
                ref={feedRef}
                style={{
                    height: 'calc(var(--app-vh, 100vh) - clamp(274px, 40vh, 350px))',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    borderRadius: 16,
                    border: '1px solid rgba(148,163,184,0.25)',
                    background: 'rgba(248,250,252,0.56)',
                    padding: '8px 8px 4px',
                    marginBottom: 22
                }}
            >
                {data.length === 0 ? (
                    <div style={{ minHeight: '100%', display: 'grid', placeItems: 'center', padding: 20, color: '#334155', fontWeight: 600 }}>
                        No showcase posts for this filter yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 10, paddingBottom: 4 }}>
                        {data.map((item) => {
                            const socialState = social[toContentKey(item)] || emptySocial;
                            const profileCoverUrl = profileById[item.userId]?.showcase_image || null;
                            const screenshotUrl = item.link
                                ? `https://api.microlink.io?url=${encodeURIComponent(item.link)}&screenshot=true&meta=false&embed=screenshot.url`
                                : null;
                            const progressPercent = Math.min(100, Math.round(((item.stepIndex || 0) / Math.max(1, SPRINT_MODULE_STEPS.length)) * 100));

                            return (
                                <article key={`${item.id}-${item.createdAt}`} style={{ borderRadius: 16, background: '#fff', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                    <button onClick={() => setDetailItem(item)} style={{ border: 'none', background: 'transparent', width: '100%', padding: 0, textAlign: 'left' }}>
                                        <div style={{ height: 124, background: '#e2e8f0', position: 'relative' }}>
                                            {profileCoverUrl ? (
                                                <img src={profileCoverUrl} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : screenshotUrl ? (
                                                <img src={screenshotUrl} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#475569', fontSize: 12, fontWeight: 600 }}>
                                                    Builder progress update
                                                </div>
                                            )}
                                            <div style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', color: '#fff', borderRadius: 999, padding: '4px 8px', fontSize: 10, fontWeight: 600 }}>
                                                {item.dayLabel}
                                            </div>
                                        </div>

                                        <div style={{ padding: '8px 10px 7px', display: 'grid', gap: 5 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                                                    {certificateByBuilderId.has(item.userId) && (
                                                        <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#CE1126', borderRadius: 999, padding: '2px 6px' }}>Certified</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: 10, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <MapPin size={11} />
                                                    {item.district}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: 14, lineHeight: 1.2, fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                                            <div style={{ fontSize: 11, lineHeight: 1.4, color: '#334155' }}>{truncateText(item.oneLiner, 130)}</div>
                                            <div style={{ height: 6, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                                                <div style={{ width: `${progressPercent}%`, height: '100%', background: '#ef4444' }} />
                                            </div>
                                        </div>
                                    </button>

                                    {viewMode === 'feed' && (
                                        <div style={{ marginTop: 'auto', padding: '0 11px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <button
                                                onClick={() => toggleLike(item)}
                                                style={{
                                                    border: '1px solid #cbd5e1',
                                                    background: socialState.liked ? '#fee2e2' : '#f8fafc',
                                                    color: socialState.liked ? '#b91c1c' : '#334155',
                                                    borderRadius: 999,
                                                    padding: '6px 10px',
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6
                                                }}
                                            >
                                                <Heart size={12} fill={socialState.liked ? 'currentColor' : 'none'} />
                                                {socialState.likes || 0}
                                            </button>

                                            <button
                                                onClick={() => setOpenCommentItem((prev) => (prev === item.id ? null : item.id))}
                                                style={{
                                                    border: '1px solid #cbd5e1',
                                                    background: '#f8fafc',
                                                    color: '#334155',
                                                    borderRadius: 999,
                                                    padding: '6px 10px',
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6
                                                }}
                                            >
                                                <MessageCircle size={12} />
                                                {(socialState.comments || []).length}
                                            </button>

                                            {item.link && (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(event) => event.stopPropagation()}
                                                    style={{ marginLeft: 'auto', display: 'inline-flex', width: 'fit-content', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#ef4444', textDecoration: 'none' }}
                                                >
                                                    Open <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {viewMode === 'feed' && openCommentItem === item.id && (
                                        <div style={{ margin: '0 11px 10px', borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                                            <div style={{ maxHeight: 72, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                                                {(socialState.comments || []).length === 0 && (
                                                    <div style={{ fontSize: 10, color: '#64748b' }}>No comments yet.</div>
                                                )}
                                                {(socialState.comments || []).map((c, cIdx) => (
                                                    <div key={`${item.id}-${c.ts}-${cIdx}`} style={{ fontSize: 11, color: '#0f172a', background: '#f8fafc', borderRadius: 8, padding: '6px 8px' }}>
                                                        {c.text}
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                                                <input
                                                    value={commentDrafts[item.id] || ''}
                                                    onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))}
                                                    placeholder="Add comment..."
                                                    style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 10, padding: '7px 9px', fontSize: 11 }}
                                                />
                                                <button onClick={() => submitComment(item)} style={{ border: '1px solid #ef4444', background: '#ef4444', color: '#fff', borderRadius: 10, fontWeight: 600, fontSize: 11, padding: '7px 10px' }}>
                                                    Post
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
            {detailItem && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 10 }} onClick={() => setDetailItem(null)}>
                    <div
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: 460,
                            maxHeight: '76vh',
                            borderRadius: 18,
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            display: 'grid',
                            gridTemplateRows: 'auto 1fr'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ minWidth: 0 }}>
                                <button
                                    onClick={() => {
                                        const profile = profileById[detailItem.userId];
                                        if (profile) setSelectedDetailProfile?.(profile);
                                    }}
                                    style={{ border: 'none', background: 'transparent', padding: 0, fontSize: 13, fontWeight: 600, color: '#0f172a' }}
                                >
                                    {detailItem.name}
                                </button>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{detailItem.district}</div>
                            </div>
                            <button onClick={() => setDetailItem(null)} style={{ border: '1px solid #cbd5e1', width: 30, height: 30, borderRadius: 999, background: '#fff', display: 'grid', placeItems: 'center' }}>
                                <X size={14} />
                            </button>
                        </div>
                        <div style={{ overflowY: 'auto', padding: '10px 12px 14px', display: 'grid', gap: 10 }}>
                            <div style={{ fontSize: 17, lineHeight: 1.2, fontWeight: 600, color: '#0f172a' }}>{detailItem.title}</div>
                            <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.45 }}>{detailItem.oneLiner}</div>
                            {detailItem.link && (
                                <a href={detailItem.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', width: 'fit-content', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#ef4444', textDecoration: 'none' }}>
                                    Open project <ExternalLink size={12} />
                                </a>
                            )}
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, display: 'grid', gap: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Progress timeline</div>
                                {(userHistory[detailItem.userId] || []).length === 0 && (
                                    <div style={{ fontSize: 11, color: '#64748b' }}>Kickoff only, no submissions yet.</div>
                                )}
                                {(userHistory[detailItem.userId] || []).map((entry) => (
                                    <div key={`${entry.id}-${entry.createdAt}`} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 9px', background: '#f8fafc' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{entry.dayLabel}</div>
                                            <div style={{ fontSize: 10, color: '#64748b' }}>{new Date(entry.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>{entry.title}</div>
                                        <div style={{ fontSize: 11, color: '#334155', marginTop: 3 }}>{truncateText(entry.oneLiner, 140)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MobileFeatureShell>
    );
}

const ShowcasePage = ({
    setPublicPage,
    submissions,
    profiles,
    session,
    setSelectedDetailProfile,
    isMobileView,
    classes = [],
    certificates = []
}) => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, []);

    if (isMobileView) {
        return (
            <MobileShowcaseFeed
                submissions={submissions}
                profiles={profiles}
                session={session}
                setSelectedDetailProfile={setSelectedDetailProfile}
                setPublicPage={setPublicPage}
                classes={classes}
                certificates={certificates}
            />
        );
    }

    return (
        <div style={{ paddingTop: '40px', background: '#fff' }}>
            <ProgressWall submissions={submissions} profiles={profiles} session={session} />

            <GalleryShowcase
                profiles={profiles}
                session={session}
                submissions={submissions}
                setSelectedDetailProfile={setSelectedDetailProfile}
                isMobileView={isMobileView}
                limit={null}
                setPublicPage={setPublicPage}
                certificates={certificates}
            />

        </div>
    );
};

export default ShowcasePage;

