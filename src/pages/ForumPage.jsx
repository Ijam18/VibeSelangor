import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ToastNotification';
import { MessageSquare, Pin, Send, ChevronDown, ChevronUp, Plus, User } from 'lucide-react';
import { sanitizeAuthorText } from '../utils';
import { awardGameRewards } from '../lib/gameService';

export default function ForumPage({ session, currentUser }) {
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

    useEffect(() => {
        fetchPosts();
    }, []);

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

                {loading ? (
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
        </section>
    );
}
