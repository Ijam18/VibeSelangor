import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ToastNotification';
import { MessageSquare, Pin, Send, ChevronDown, ChevronUp, Plus, User, X, ExternalLink } from 'lucide-react';
import { sanitizeAuthorText } from '../utils';
import { awardGameRewards } from '../lib/gameService';
import MobileFeatureShell from '../components/MobileFeatureShell';
import { callAssistantChat } from '../lib/assistantApi';
import { getLiveProgramMeta } from '../utils/liveProgram';
import LiveIslandBlip from '../components/LiveIslandBlip';

export default function ForumPage({ session, currentUser, isMobileView, setPublicPage, classes = [] }) {
    const { addToast } = useToast();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [replies, setReplies] = useState({}); // Map post_id -> replies array
    const [replyingTo, setReplyingTo] = useState(null); // post_id being replied to
    const [newReplyContent, setNewReplyContent] = useState('');
    const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
    const [newPostForm, setNewPostForm] = useState({ title: '', body: '' });
    const [submitting, setSubmitting] = useState(false);
    const [mobileTab, setMobileTab] = useState('forum');
    const [forumSearch, setForumSearch] = useState('');
    const [forumSort, setForumSort] = useState('latest');
    const [ketamTopicsLoading, setKetamTopicsLoading] = useState(false);
    const [ketamSuggestedTopics, setKetamSuggestedTopics] = useState([]);
    const [selectedTopicDetail, setSelectedTopicDetail] = useState(null);
    const [moltbookIcon, setMoltbookIcon] = useState('https://www.moltbook.com/favicon.ico');
    const liveProgram = useMemo(() => getLiveProgramMeta(classes), [classes]);

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        if (mobileTab !== 'ketam') return;
        loadKetamSuggestedTopics();
    }, [mobileTab]);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('forum_posts')
            .select('*')
            .order('pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
            addToast('Failed to load forum posts', 'error');
        } else {
            setPosts(data || []);
        }
        setLoading(false);
    };

    const fetchReplies = async (postId) => {
        if (replies[postId]) return; // Already fetched

        const { data, error } = await supabase
            .from('forum_replies')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (data) {
            setReplies(prev => ({ ...prev, [postId]: data }));
        }
    };

    const toggleExpand = (postId) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
        } else {
            setExpandedPostId(postId);
            fetchReplies(postId);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!session) return;
        setSubmitting(true);

        const { error } = await supabase
            .from('forum_posts')
            .insert([{
                user_id: session.user.id,
                builder_name: currentUser?.name || 'Builder',
                title: newPostForm.title,
                body: newPostForm.body
            }]);

        if (error) {
            addToast('Failed to create post', 'error');
        } else {
            addToast('Post created!', 'success');
            await awardGameRewards(supabase, session.user.id, 20, 5);
            setIsNewPostModalOpen(false);
            setNewPostForm({ title: '', body: '' });
            fetchPosts();
        }
        setSubmitting(false);
    };

    const handleCreateReply = async (postId) => {
        if (!newReplyContent.trim() || !session) return;
        setSubmitting(true);

        const { error } = await supabase
            .from('forum_replies')
            .insert([{
                post_id: postId,
                user_id: session.user.id,
                builder_name: currentUser?.name || 'Builder',
                body: newReplyContent
            }]);

        if (error) {
            addToast('Failed to reply', 'error');
        } else {
            addToast('Reply sent!', 'success');
            await awardGameRewards(supabase, session.user.id, 10, 2);
            setNewReplyContent('');
            setReplyingTo(null);
            // Refresh replies
            const { data } = await supabase
                .from('forum_replies')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });
            if (data) setReplies(prev => ({ ...prev, [postId]: data }));
        }
        setSubmitting(false);
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        const { error } = await supabase.from('forum_posts').delete().eq('id', postId);
        if (error) addToast('Failed to delete', 'error');
        else fetchPosts();
    };

    const isAiMalaysiaTopic = (text) => {
        const normalized = (text || '').toLowerCase();
        const aiWords = ['ai', 'agent', 'llm', 'model', 'machine learning', 'prompt', 'automation', 'genai'];
        const malaysiaWords = ['malaysia', 'malaysian', 'kuala lumpur', 'selangor', 'johor', 'penang', 'sabah', 'sarawak', 'asean'];
        return aiWords.some((word) => normalized.includes(word)) && malaysiaWords.some((word) => normalized.includes(word));
    };

    const parseTopicList = (raw) => {
        const safe = (raw || '').toString().trim();
        if (!safe) return [];
        try {
            const parsed = JSON.parse(safe);
            if (Array.isArray(parsed)) {
                return parsed.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
            }
        } catch {
            // line fallback
        }
        return safe
            .split('\n')
            .map((line) => line.replace(/^[\-\d\.\)\s]+/, '').trim())
            .filter(Boolean);
    };

    const mergeTopics = (incomingTopics) => {
        setKetamSuggestedTopics((prev) => {
            const seen = new Set();
            const merged = [];
            for (const topic of [...incomingTopics, ...prev]) {
                const normalized = (topic || '').trim();
                const key = normalized.toLowerCase();
                if (!normalized || seen.has(key)) continue;
                seen.add(key);
                merged.push(normalized);
                if (merged.length >= 50) break;
            }
            return merged;
        });
    };

    const loadKetamSuggestedTopics = async () => {
        setKetamTopicsLoading(true);
        try {
            const prompt = [
                'Extract discussion topics from Moltbook that are only about AI and Malaysia.',
                'Return exactly a JSON array of short topic strings (max 30).',
                'Exclude non-Malaysia topics and non-AI topics.',
                'No markdown, no explanation.'
            ].join(' ');
            const response = await callAssistantChat({
                userMessage: prompt,
                history: [],
                sessionId: session?.user?.id || 'ketam-topic-guest',
                userId: session?.user?.id || null,
                context: { page: 'forum_ketam_topics', url: 'https://www.moltbook.com/' },
                options: { use_memory: false, allow_scrape: true }
            }).catch(() => ({ answer: '[]' }));
            const parsed = parseTopicList(response?.answer);
            const filtered = Array.from(new Set(parsed.filter(isAiMalaysiaTopic))).slice(0, 30);
            if (filtered.length) {
                mergeTopics(filtered);
            } else {
                mergeTopics([
                    'How Malaysian startups can use AI agents safely',
                    'AI governance for Malaysia public-sector copilots',
                    'Malaysia SME adoption of LLM workflows and ROI',
                    'Building bilingual BM-EN AI assistants for Malaysia',
                    'AI moderation strategies for Malaysian online communities',
                    'AI copilots for Malaysia education outcomes',
                    'Deploying AI chat for Malaysia e-commerce support'
                ]);
            }
        } catch (error) {
            console.error('Failed to load Ketam suggested topics:', error);
        } finally {
            setKetamTopicsLoading(false);
        }
    };

    const buildTopicDetail = (topic) => ({
        title: topic,
        details: `This topic explores practical implications, risks, and implementation paths for: ${topic}.`,
        comments: [
            { id: `${topic}-1`, author: 'Moltbook', text: 'Related thread found with useful context and examples.' },
            { id: `${topic}-2`, author: 'Moltbook', text: 'Strong candidate for deeper agent debate and actionable recommendations.' }
        ]
    });

    const filteredPosts = useMemo(() => {
        let next = [...posts];
        if (forumSort === 'latest') next.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        if (forumSort === 'oldest') next.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        if (forumSort === 'pinned') {
            next.sort((a, b) => {
                if (a.pinned === b.pinned) return new Date(b.created_at) - new Date(a.created_at);
                return a.pinned ? -1 : 1;
            });
        }
        const query = forumSearch.trim().toLowerCase();
        if (!query) return next;
        return next.filter((post) => (post.title || '').toLowerCase().includes(query) || (post.body || '').toLowerCase().includes(query));
    }, [posts, forumSearch, forumSort]);

    if (isMobileView) {
        return (
            <>
                <MobileFeatureShell
                    title="Forum"
                    subtitle="Talk with builders"
                    onNavigate={setPublicPage}
                    statusCenterContent={(
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                width: 'fit-content',
                                maxWidth: liveProgram ? 'min(88vw, 284px)' : 'min(82vw, 236px)',
                                margin: '0 auto',
                                padding: '3px 4px',
                                borderRadius: 11,
                                background: 'rgba(10,10,10,0.95)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flex: 1 }}>
                                <button style={{ height: 18, borderRadius: 999, border: mobileTab === 'forum' ? '1px solid rgba(180,83,9,0.35)' : '1px solid rgba(255,255,255,0.22)', background: mobileTab === 'forum' ? 'linear-gradient(135deg, #fde047, #f59e0b)' : 'rgba(255,255,255,0.1)', color: mobileTab === 'forum' ? '#0f172a' : '#ffffff', fontSize: 9, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', padding: '0 8px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => setMobileTab('forum')}>Forum</button>
                                <button style={{ height: 18, borderRadius: 999, border: mobileTab === 'ketam' ? '1px solid rgba(190,18,60,0.35)' : '1px solid rgba(255,255,255,0.22)', background: mobileTab === 'ketam' ? 'linear-gradient(135deg, #ef4444, #be123c)' : 'rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 9, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', padding: '0 8px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => setMobileTab('ketam')}>Ketam Board</button>
                            </div>
                            {liveProgram && (
                                <LiveIslandBlip title={liveProgram.title} windowText={liveProgram.windowText} growLeft />
                            )}
                        </div>
                    )}
                >
                    <div style={{ height: 'calc(var(--app-vh, 100vh) - clamp(162px, 20vh, 206px))', overflow: 'hidden' }}>
                        {mobileTab === 'forum' ? (
                            <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ padding: 12, border: '1px solid rgba(148,163,184,0.38)', borderRadius: 16, background: 'rgba(255,255,255,0.78)', boxShadow: '0 10px 22px rgba(15,23,42,0.08)', backdropFilter: 'blur(14px)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <div>
                                            <h2 style={{ fontSize: 28, margin: 0, lineHeight: 1.05, fontWeight: 500 }}>Builders Forum</h2>
                                            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#475569', fontWeight: 500 }}>Ask for help, share wins, and get feedback.</p>
                                        </div>
                                        {session ? (
                                            <button onClick={() => setIsNewPostModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 34, padding: '0 12px', borderRadius: 999, border: '1px solid rgba(148,163,184,0.45)', background: '#fff', color: '#0f172a', fontSize: 12, fontWeight: 500 }}>
                                                <Plus size={14} /> New Post
                                            </button>
                                        ) : <div style={{ fontSize: 12, color: '#475569' }}>Login to post</div>}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                                        <input value={forumSearch} onChange={(event) => setForumSearch(event.target.value)} placeholder="Search posts..." style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '9px 10px', fontSize: 12, background: '#fff' }} />
                                        <select value={forumSort} onChange={(event) => setForumSort(event.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '9px 9px', fontSize: 11, background: '#fff' }}>
                                            <option value="latest">Latest</option>
                                            <option value="pinned">Pinned</option>
                                            <option value="oldest">Oldest</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 2 }}>
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>Loading forum...</div>
                                    ) : filteredPosts.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: 24, borderRadius: 16, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.72)' }}>
                                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>No posts yet. Be the first.</h3>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {filteredPosts.map((post) => {
                                                const isOwner = session?.user?.id === post.user_id;
                                                const isAdmin = currentUser?.type === 'admin' || currentUser?.type === 'owner';
                                                const replyCount = replies[post.id]?.length !== undefined ? replies[post.id].length : null;
                                                return (
                                                    <div key={post.id} style={{ border: '1px solid #cbd5e1', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 20px rgba(15,23,42,0.06)' }}>
                                                        <div onClick={() => toggleExpand(post.id)} style={{ padding: '13px 12px', cursor: 'pointer', background: post.pinned ? '#fff8dc' : '#ffffff' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                                                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                                                    {post.pinned && <div className="pill pill-red" style={{ fontSize: 9, padding: '2px 6px' }}><Pin size={9} /> PINNED</div>}
                                                                    <h3 style={{ fontSize: 16, margin: 0, lineHeight: 1.2, fontWeight: 600 }}>{post.title}</h3>
                                                                </div>
                                                                <div style={{ fontSize: 10, opacity: 0.55, whiteSpace: 'nowrap' }}>{new Date(post.created_at).toLocaleDateString()}</div>
                                                            </div>
                                                            <p style={{ fontSize: 12, lineHeight: 1.42, opacity: 0.84, margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>{post.body}</p>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500, opacity: 0.82, minWidth: 0 }}>
                                                                    <User size={12} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sanitizeAuthorText(post.builder_name)}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, color: '#64748b' }}>
                                                                        <MessageSquare size={14} /> {replyCount !== null ? replyCount : '...'}
                                                                    </div>
                                                                    {(isOwner || isAdmin) && (
                                                                        <button onClick={(event) => { event.stopPropagation(); handleDeletePost(post.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 11, cursor: 'pointer', fontWeight: 500, padding: 0 }}>Delete</button>
                                                                    )}
                                                                    {expandedPostId === post.id ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {expandedPostId === post.id && (
                                                            <div style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc', padding: 10 }}>
                                                                {replies[post.id]?.map((reply) => (
                                                                    <div key={reply.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
                                                                            <span style={{ fontWeight: 500, fontSize: 11, color: '#0f172a' }}>{sanitizeAuthorText(reply.builder_name)}</span>
                                                                            <span style={{ fontSize: 10, opacity: 0.55 }}>{new Date(reply.created_at).toLocaleString()}</span>
                                                                        </div>
                                                                        <p style={{ fontSize: 12, lineHeight: 1.45, margin: 0, color: '#334155' }}>{reply.body}</p>
                                                                    </div>
                                                                ))}
                                                                {session ? (
                                                                    <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                                                                        <input className="builder-upload-input" value={newReplyContent} onChange={(event) => setNewReplyContent(event.target.value)} placeholder="Write a reply..." style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 10, padding: '8px 10px', fontSize: 12, background: '#fff' }} />
                                                                        <button onClick={() => handleCreateReply(post.id)} disabled={submitting} style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#be123c', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                                                            <Send size={14} />
                                                                        </button>
                                                                    </div>
                                                                ) : <div style={{ textAlign: 'center', fontSize: 11, opacity: 0.6, marginTop: 8 }}>Login to reply</div>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <section style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ padding: 12, border: '1px solid rgba(148,163,184,0.38)', borderRadius: 16, background: 'rgba(255,255,255,0.86)', boxShadow: '0 10px 22px rgba(15,23,42,0.08)', backdropFilter: 'blur(14px)', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>Ketam Topics</div>
                                        <button onClick={loadKetamSuggestedTopics} disabled={ketamTopicsLoading} style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', borderRadius: 999, height: 24, padding: '0 9px', fontSize: 10, fontWeight: 500 }}>
                                            {ketamTopicsLoading ? 'Sync...' : 'Refresh'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: 2 }}>
                                        {ketamSuggestedTopics.map((topic, index) => (
                                            <button key={`${topic}-${index}`} onClick={() => setSelectedTopicDetail(buildTopicDetail(topic))} style={{ border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', borderRadius: 10, minHeight: 50, padding: '10px 11px', fontSize: 11, lineHeight: 1.3, fontWeight: 500, whiteSpace: 'normal', width: '100%', boxSizing: 'border-box', textAlign: 'left', display: 'grid', alignContent: 'center' }}>
                                                <span style={{ fontSize: 11, fontWeight: 500 }}>{topic}</span>
                                            </button>
                                        ))}
                                        {!ketamTopicsLoading && ketamSuggestedTopics.length === 0 && <span style={{ fontSize: 10, opacity: 0.7 }}>No topics yet. Tap refresh.</span>}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </MobileFeatureShell>

                {isNewPostModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsNewPostModalOpen(false)}>
                        <div onClick={(event) => event.stopPropagation()} style={{ width: 'min(100%, 420px)', borderRadius: 18, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', boxShadow: '0 16px 34px rgba(15,23,42,0.2)', padding: 12 }}>
                            <h3 style={{ margin: 0, fontWeight: 500, fontSize: 18 }}>Create New Post</h3>
                            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                                <input value={newPostForm.title} onChange={(event) => setNewPostForm({ ...newPostForm, title: event.target.value })} placeholder="Post title" required style={{ width: '100%', border: '1px solid #cbd5e1', padding: '10px', borderRadius: 10, fontSize: 13, background: '#fff' }} />
                                <textarea value={newPostForm.body} onChange={(event) => setNewPostForm({ ...newPostForm, body: event.target.value })} placeholder="Share details..." required rows={5} style={{ width: '100%', border: '1px solid #cbd5e1', padding: '10px', borderRadius: 10, fontFamily: 'inherit', fontSize: 13, background: '#fff' }} />
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setIsNewPostModalOpen(false)} style={{ height: 34, borderRadius: 999, border: '1px solid #cbd5e1', background: '#fff', padding: '0 12px', fontSize: 12, fontWeight: 500 }}>Cancel</button>
                                    <button type="submit" disabled={submitting} style={{ height: 34, borderRadius: 999, border: '1px solid rgba(190,18,60,0.35)', background: 'linear-gradient(135deg, #ef4444, #be123c)', color: '#fff', padding: '0 14px', fontSize: 12, fontWeight: 500 }}>Post</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {selectedTopicDetail && (
                    <div className="modal-overlay" onClick={() => setSelectedTopicDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.52)', zIndex: 1200, display: 'grid', placeItems: 'center', padding: 14 }}>
                        <div onClick={(event) => event.stopPropagation()} style={{ width: 'min(100%, 420px)', maxHeight: '82vh', overflowY: 'auto', borderRadius: 18, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', boxShadow: '0 16px 34px rgba(15,23,42,0.2)', padding: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                <h4 style={{ margin: 0, fontSize: 16, lineHeight: 1.2, fontWeight: 500 }}>{selectedTopicDetail.title}</h4>
                                <button onClick={() => setSelectedTopicDetail(null)} style={{ border: 'none', background: 'transparent', padding: 2, color: '#334155' }}>
                                    <X size={16} />
                                </button>
                            </div>
                            <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.45, margin: '8px 0 10px' }}>{selectedTopicDetail.details}</p>
                            <div style={{ fontSize: 10, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>RELEVANT COMMENTS</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {selectedTopicDetail.comments.map((comment) => (
                                    <div key={comment.id} style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', padding: '8px 9px' }}>
                                        <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.75, marginBottom: 3 }}>{comment.author}</div>
                                        <div style={{ fontSize: 11, lineHeight: 1.42 }}>{comment.text}</div>
                                    </div>
                                ))}
                            </div>
                            <a href="https://www.moltbook.com/" target="_blank" rel="noreferrer" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid #cbd5e1', borderRadius: 999, padding: '7px 10px', color: '#0f172a', textDecoration: 'none', fontSize: 11, fontWeight: 500 }}>
                                <img
                                    src={moltbookIcon}
                                    alt="Moltbook"
                                    onError={(event) => {
                                        if (event.currentTarget.src !== 'https://www.google.com/s2/favicons?sz=64&domain=moltbook.com') {
                                            setMoltbookIcon('https://www.google.com/s2/favicons?sz=64&domain=moltbook.com');
                                        }
                                    }}
                                    style={{ width: 16, height: 16, borderRadius: 4 }}
                                />
                                Open Moltbook <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <section style={{ paddingTop: '40px', paddingBottom: '80px', minHeight: '80vh' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '32px', marginBottom: '4px' }}>Builders Forum</h2>
                        <p className="text-sub">Ask for help, share wins, and get feedback from the cohort.</p>
                    </div>
                    {session ? (
                        <button className="btn btn-red" onClick={() => setIsNewPostModalOpen(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Plus size={18} /> New Post
                        </button>
                    ) : (
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Login to post</div>
                    )}
                </div>
                <div style={{ display: 'inline-flex', gap: 8, border: '2px solid black', borderRadius: 999, padding: 4, background: '#fff', marginBottom: 16 }}>
                    <button onClick={() => setMobileTab('forum')} style={{ border: '2px solid black', borderRadius: 999, background: mobileTab === 'forum' ? '#f5d000' : '#fff', color: '#111', padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                        FORUM
                    </button>
                    <button onClick={() => setMobileTab('ketam')} style={{ border: '2px solid black', borderRadius: 999, background: mobileTab === 'ketam' ? '#CE1126' : '#fff', color: mobileTab === 'ketam' ? '#fff' : '#111', padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                        KETAM BOARD
                    </button>
                </div>

                {mobileTab === 'forum' ? (loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>Loading forum...</div>
                ) : posts.length === 0 ? (
                    <div className="neo-card" style={{ textAlign: 'center', padding: '40px' }}>
                        <h3>No posts yet. Be the first!</h3>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {posts.map(post => {
                            const isOwner = session?.user?.id === post.user_id;
                            const isAdmin = currentUser?.type === 'admin' || currentUser?.type === 'owner';
                            const replyCount = replies[post.id]?.length !== undefined ? replies[post.id].length : null;

                            return (
                                <div key={post.id} className="neo-card" style={{ border: '3px solid black', boxShadow: '4px 4px 0px black', padding: '0', overflow: 'hidden' }}>
                                    <div
                                        onClick={() => toggleExpand(post.id)}
                                        style={{ padding: '20px', cursor: 'pointer', background: post.pinned ? '#fff8dc' : 'white', transition: 'background 0.2s' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {post.pinned && <div className="pill pill-red" style={{ fontSize: '10px', padding: '2px 6px' }}><Pin size={10} /> PINNED</div>}
                                                <h3 style={{ fontSize: '18px', margin: 0 }}>{post.title}</h3>
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.5 }}>{new Date(post.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <p style={{ fontSize: '14px', lineHeight: 1.5, opacity: 0.8, marginBottom: '16px', whiteSpace: 'pre-wrap' }}>{post.body}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
                                                <User size={14} /> {sanitizeAuthorText(post.builder_name)}
                                                {isOwner && <span style={{ opacity: 0.5, fontWeight: '400' }}>(You)</span>}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', opacity: 0.6 }}>
                                                    <MessageSquare size={14} /> {replyCount !== null ? replyCount : '...'} Replies
                                                </div>
                                                {(isOwner || isAdmin) && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                                                        style={{ background: 'none', border: 'none', color: 'red', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                                {expandedPostId === post.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Replies */}
                                    {expandedPostId === post.id && (
                                        <div style={{ borderTop: '2px solid #eee', background: '#f9f9f9', padding: '20px' }}>
                                            {replies[post.id]?.map(reply => (
                                                <div key={reply.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #ddd' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontWeight: '800', fontSize: '13px' }}>{sanitizeAuthorText(reply.builder_name)}</span>
                                                        <span style={{ fontSize: '10px', opacity: 0.5 }}>{new Date(reply.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <p style={{ fontSize: '13px', lineHeight: 1.5 }}>{reply.body}</p>
                                                </div>
                                            ))}

                                            {session ? (
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                                    <input
                                                        className="builder-upload-input"
                                                        value={newReplyContent}
                                                        onChange={(e) => setNewReplyContent(e.target.value)}
                                                        placeholder="Write a reply..."
                                                        style={{ flex: 1, border: '2px solid black', borderRadius: '8px', padding: '10px' }}
                                                    />
                                                    <button
                                                        className="btn btn-red"
                                                        onClick={() => handleCreateReply(post.id)}
                                                        disabled={submitting}
                                                        style={{ padding: '0 16px' }}
                                                    >
                                                        <Send size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', fontSize: '12px', opacity: 0.5, marginTop: '20px' }}>Login to reply</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )) : (
                    <div className="neo-card" style={{ border: '3px solid black', boxShadow: '6px 6px 0px black', padding: '16px', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <h3 style={{ fontSize: 18, margin: 0 }}>Ketam Topics</h3>
                            <button onClick={loadKetamSuggestedTopics} disabled={ketamTopicsLoading} style={{ border: '2px solid black', background: '#fff', borderRadius: 999, padding: '6px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                                {ketamTopicsLoading ? 'SYNC...' : 'REFRESH'}
                            </button>
                        </div>
                        <div className="scroll-box" style={{ maxHeight: 460, display: 'grid', gap: 8 }}>
                            {ketamSuggestedTopics.map((topic, index) => (
                                <button key={`${topic}-${index}`} onClick={() => setSelectedTopicDetail(buildTopicDetail(topic))} style={{ border: '2px solid black', background: '#f8fafc', color: '#0f172a', borderRadius: 10, minHeight: 52, padding: '10px 11px', fontSize: 12, lineHeight: 1.3, fontWeight: 700, whiteSpace: 'normal', width: '100%', textAlign: 'left' }}>
                                    {topic}
                                </button>
                            ))}
                            {!ketamTopicsLoading && ketamSuggestedTopics.length === 0 && <span style={{ fontSize: 12, opacity: 0.7 }}>No topics yet. Click refresh.</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* New Post Modal */}
            {isNewPostModalOpen && (
                <div className="modal-overlay" onClick={() => setIsNewPostModalOpen(false)}>
                    <div className="modal-content neo-card forum-modal" onClick={e => e.stopPropagation()} style={{ width: '500px', maxWidth: '95vw' }}>
                        <h3>Create New Post</h3>
                        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px' }}>Title</label>
                                <input
                                    className="builder-upload-input"
                                    value={newPostForm.title}
                                    onChange={e => setNewPostForm({ ...newPostForm, title: e.target.value })}
                                    placeholder="What's on your mind?"
                                    required
                                    style={{ width: '100%', border: '2px solid black', padding: '10px', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px' }}>Content</label>
                                <textarea
                                    className="builder-upload-input"
                                    value={newPostForm.body}
                                    onChange={e => setNewPostForm({ ...newPostForm, body: e.target.value })}
                                    placeholder="Share details..."
                                    required
                                    rows={5}
                                    style={{ width: '100%', border: '2px solid black', padding: '10px', borderRadius: '8px', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsNewPostModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-red" disabled={submitting}>Post</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {selectedTopicDetail && (
                <div className="modal-overlay" onClick={() => setSelectedTopicDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.52)', zIndex: 1200, display: 'grid', placeItems: 'center', padding: 14 }}>
                    <div onClick={(event) => event.stopPropagation()} style={{ width: 'min(100%, 520px)', maxHeight: '82vh', overflowY: 'auto', borderRadius: 16, border: '3px solid black', background: '#fff', boxShadow: '8px 8px 0 black', padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                            <h4 style={{ margin: 0, fontSize: 18, lineHeight: 1.2, fontWeight: 800 }}>{selectedTopicDetail.title}</h4>
                            <button onClick={() => setSelectedTopicDetail(null)} style={{ border: '2px solid black', background: '#fff', borderRadius: 999, width: 28, height: 28, display: 'grid', placeItems: 'center' }}>
                                <X size={14} />
                            </button>
                        </div>
                        <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.45, margin: '10px 0 12px' }}>{selectedTopicDetail.details}</p>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#111', marginBottom: 8 }}>RELEVANT COMMENTS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {selectedTopicDetail.comments.map((comment) => (
                                <div key={comment.id} style={{ borderRadius: 10, border: '2px solid black', background: '#f8fafc', padding: '8px 9px' }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75, marginBottom: 3 }}>{comment.author}</div>
                                    <div style={{ fontSize: 12, lineHeight: 1.42 }}>{comment.text}</div>
                                </div>
                            ))}
                        </div>
                        <a href="https://www.moltbook.com/" target="_blank" rel="noreferrer" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 7, border: '2px solid black', borderRadius: 999, padding: '7px 10px', color: '#0f172a', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                            <img
                                src={moltbookIcon}
                                alt="Moltbook"
                                onError={(event) => {
                                    if (event.currentTarget.src !== 'https://www.google.com/s2/favicons?sz=64&domain=moltbook.com') {
                                        setMoltbookIcon('https://www.google.com/s2/favicons?sz=64&domain=moltbook.com');
                                    }
                                }}
                                style={{ width: 16, height: 16, borderRadius: 4 }}
                            />
                            Open Moltbook <ExternalLink size={12} />
                        </a>
                    </div>
                </div>
            )}
        </section>
    );
}
