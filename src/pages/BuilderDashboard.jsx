import React, { useEffect, useMemo, useState } from 'react';
import { Settings, LogOut, Check, Calendar, Rocket, Camera, ChevronRight, Gamepad2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { awardGameRewards } from '../lib/gameService';
import BuilderStudioPage from './BuilderStudioPage'; // Sibling import
import { SPRINT_MODULE_STEPS, DEPLOY_COMMAND, TERMINAL_CONTEXT } from '../constants';
import MobileFeatureShell from '../components/MobileFeatureShell';
import { uploadWithFallback, handleStorageError, BUCKETS } from '../utils/storage';

export default function BuilderDashboard({
    currentUser,
    classes,
    attendance,
    submissions,
    handleToggleAttendance,
    handleSignOut,
    openEditProfileModal,
    isUpdatingProfile,
    session,
    fetchData,
    isMobileView,
    setPublicPage,
    triggerNewProject,
    onNewProjectTriggered
}) {
    const [activeTab, setActiveTab] = useState('sprint');
    const [islandIndex, setIslandIndex] = useState(0);

    // Form States reused from App.jsx, now local
    const [newUpload, setNewUpload] = useState({ project: '', link: '', details: '', type: 'log' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [showProjectModal, setShowProjectModal] = useState(false);
    const [newProjectForm, setNewProjectForm] = useState({ project_name: '', submission_url: '', one_liner: '' });
    const [isSubmittingProject, setIsSubmittingProject] = useState(false);

    // First-Time Tour State
    const [showFirstTimeTour, setShowFirstTimeTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);
    const [showTourTooltip, setShowTourTooltip] = useState(false);

    const submissionsToday = useMemo(() => {
        if (!session?.user || !submissions) return 0;
        const today = new Date().toLocaleDateString();
        return submissions.filter(s =>
            s.user_id === session.user.id &&
            s.status !== 'Archived' &&
            new Date(s.created_at).toLocaleDateString() === today
        ).length;
    }, [submissions, session]);
    const checkedInToday = submissionsToday > 0;

    const builderSubs = useMemo(() => {
        return submissions.filter(s => (s.user_id === currentUser?.id || s.user_id === session?.user?.id) && s.status !== 'Archived');
    }, [submissions, currentUser?.id, session?.user?.id]);

    const totalSubs = builderSubs.length;
    const nextStepIdx = totalSubs < SPRINT_MODULE_STEPS.length ? totalSubs : SPRINT_MODULE_STEPS.length - 1;

    const activeClass = useMemo(() => classes.find(c => c.status === 'Active'), [classes]);
    const isPresentAtActive = useMemo(() => {
        if (!activeClass || !attendance) return false;
        return attendance.some(a => a.profile_id === currentUser?.id && a.class_id === activeClass.id && a.status === 'Present');
    }, [activeClass, attendance, currentUser?.id]);

    useEffect(() => {
        if (!isMobileView) return undefined;
        const timer = setInterval(() => setIslandIndex((prev) => (prev + 1) % 3), 3400);
        return () => clearInterval(timer);
    }, [isMobileView]);

    useEffect(() => {
        if (triggerNewProject) {
            setShowProjectModal(true);
            onNewProjectTriggered?.();
        }
    }, [triggerNewProject, onNewProjectTriggered]);

    // Keyboard shortcut for form submission (Ctrl+Enter)
    useEffect(() => {
        if (isMobileView) return;
        const handleKeyPress = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const form = document.querySelector('.builder-upload-form');
                if (form && !e.target.closest('textarea')) {
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isMobileView]);



    const handleBuilderUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        let finalUrl = newUpload.link;

        if (selectedFile) {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

            const result = await uploadWithFallback({
                bucket: BUCKETS.SUBMISSIONS,
                path: fileName,
                file: selectedFile,
                onError: (error) => {
                    const userMsg = handleStorageError(error, BUCKETS.SUBMISSIONS);
                    alert(`${userMsg}\n\nFalling back to URL-only submission.`);
                }
            });

            if (!result.success) {
                setIsUploading(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from(BUCKETS.SUBMISSIONS)
                .getPublicUrl(fileName);

            finalUrl = publicUrl;
        }

        const { error } = await supabase.from('builder_progress').insert([{
            user_id: session.user.id,
            builder_name: currentUser.name,
            district: currentUser?.district || 'Unknown',
            project_name: newUpload.project,
            submission_url: finalUrl,
            one_liner: newUpload.details || 'Progress Log Entry',
            status: 'Pending Review'
        }]);

        if (!error) {
            await awardGameRewards(supabase, session.user.id, 100, 50);
            setNewUpload({ ...newUpload, link: '', details: '', type: 'log' });
            setSelectedFile(null);
            fetchData();
        }
        setIsUploading(false);
    };

    // Handle new project submission
    const handleNewProjectSubmit = async (e) => {
        e.preventDefault();
        if (!session?.user) return;
        setIsSubmittingProject(true);

        const payload = {
            project_name: newProjectForm.project_name.trim(),
            submission_url: newProjectForm.submission_url.trim(),
            one_liner: newProjectForm.one_liner.trim() || 'Builder update from VibeSelangor.',
            district: currentUser?.district || 'Unknown',
            builder_name: currentUser?.name || currentUser?.full_name || 'Builder'
        };

        const { error } = await supabase.from('builder_progress').insert([{
            ...payload,
            user_id: session.user.id,
            status: 'Draft'
        }]);

        if (error) {
            alert('Failed to create project: ' + (error.message || 'Unknown error'));
            setIsSubmittingProject(false);
            return;
        }

        setNewProjectForm({ project_name: '', submission_url: '', one_liner: '' });
        setShowProjectModal(false);
        setIsSubmittingProject(false);
        fetchData();
    };


    const progressPct = Math.min(100, Math.round((totalSubs / Math.max(1, SPRINT_MODULE_STEPS.length)) * 100));

    const encouragementText = useMemo(() => {
        const messages = [
            'Ship one small improvement today. Momentum beats perfection.',
            'Keep vibe coding: 1 clear commit now is better than 10 ideas later.',
            'Focus on user value first, polish second.',
            'Progress over pressure. Build, test, and post your log.',
            'Today goal: make one thing clearer for your users.'
        ];
        const userKey = session?.user?.id || currentUser?.id || 'builder';
        const dayKey = new Date().toISOString().slice(0, 10);
        const seed = `${userKey}-${dayKey}`.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        return messages[seed % messages.length];
    }, [session?.user?.id, currentUser?.id]);

    const projectBlueprintSteps = [
        '1. Ideate: pick one local Selangor problem.',
        '2. Low-fi Sketch: define 3 core screens.',
        '3. Build Fast: ship core logic before polish.',
        '4. Ship It: publish a working demo link.'
    ];

    const newProjectModal = showProjectModal && (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15,23,42,0.55)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                display: 'grid',
                placeItems: 'center',
                zIndex: 9999,
                padding: isMobileView ? '14px' : '20px'
            }}
            onClick={() => {
                if (!isSubmittingProject) setShowProjectModal(false);
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 'min(680px, 100%)',
                    maxHeight: 'calc(var(--app-vh, 100vh) - 28px)',
                    overflowY: 'auto',
                    background: '#fff',
                    border: '2px solid black',
                    borderRadius: 14,
                    boxShadow: '8px 8px 0 black',
                    padding: isMobileView ? '14px' : '20px'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: isMobileView ? 18 : 22, fontWeight: 950 }}>New Project</h3>
                        <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.7, fontWeight: 700 }}>Popout builder blueprint + registration</p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setShowProjectModal(false)}
                        disabled={isSubmittingProject}
                        style={{ padding: '8px 12px', fontSize: 11 }}
                    >
                        Close
                    </button>
                </div>

                <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                    {projectBlueprintSteps.map((step) => (
                        <div key={step} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', background: '#f8fafc', fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                            {step}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleNewProjectSubmit} style={{ display: 'grid', gap: 10 }}>
                    <div style={{ display: 'grid', gap: 6 }}>
                        <label style={{ fontSize: 10, fontWeight: 900, color: '#64748b' }}>PROJECT NAME *</label>
                        <input
                            type="text"
                            required
                            value={newProjectForm.project_name}
                            onChange={(e) => setNewProjectForm((prev) => ({ ...prev, project_name: e.target.value }))}
                            placeholder="e.g. Selangor Vibe App"
                            style={{ padding: '11px 12px', border: '2px solid black', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
                        />
                    </div>

                    <div style={{ display: 'grid', gap: 6 }}>
                        <label style={{ fontSize: 10, fontWeight: 900, color: '#64748b' }}>PROJECT URL (OPTIONAL)</label>
                        <input
                            type="url"
                            value={newProjectForm.submission_url}
                            onChange={(e) => setNewProjectForm((prev) => ({ ...prev, submission_url: e.target.value }))}
                            placeholder="https://..."
                            style={{ padding: '11px 12px', border: '2px solid black', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
                        />
                    </div>

                    <div style={{ display: 'grid', gap: 6 }}>
                        <label style={{ fontSize: 10, fontWeight: 900, color: '#64748b' }}>ONE-LINER *</label>
                        <textarea
                            required
                            rows={3}
                            value={newProjectForm.one_liner}
                            onChange={(e) => setNewProjectForm((prev) => ({ ...prev, one_liner: e.target.value }))}
                            placeholder="What are you building and for who?"
                            style={{ padding: '11px 12px', border: '2px solid black', borderRadius: 8, fontSize: 14, fontWeight: 700, resize: 'vertical' }}
                        />
                    </div>

                    <button
                        className="btn btn-red"
                        type="submit"
                        disabled={isSubmittingProject}
                        style={{ marginTop: 4, padding: '13px 16px', fontSize: 14, fontWeight: 950 }}
                    >
                        {isSubmittingProject ? 'CREATING...' : 'Create Project'}
                    </button>
                </form>
            </div>
        </div>
    );

    if (isMobileView) {
        const iosPrimaryBtn = {
            borderRadius: 14,
            border: '1px solid rgba(239,68,68,0.55)',
            background: 'rgba(239,68,68,0.92)',
            color: '#fff',
            boxShadow: '0 6px 14px rgba(239,68,68,0.25)',
            fontSize: 11,
            fontWeight: 600,
            padding: '9px 10px'
        };
        const iosSecondaryBtn = {
            borderRadius: 14,
            border: '1px solid rgba(15,23,42,0.24)',
            background: 'rgba(255,255,255,0.82)',
            color: '#0f172a',
            boxShadow: '0 5px 12px rgba(15,23,42,0.12)',
            fontSize: 11,
            fontWeight: 600,
            padding: '9px 10px'
        };
        const islandMessages = [
            `${totalSubs} Logs • ${progressPct}% Sprint`,
            checkedInToday ? 'Checked in today' : 'Check in and ship your log',
            activeClass ? `Live: ${activeClass.title}` : 'No live class now'
        ];
        return (
            <MobileFeatureShell title="Builder Dashboard" subtitle="Your sprint cockpit" islandContent={<span style={{ fontSize: 10, fontWeight: 600 }}>{islandMessages[islandIndex]}</span>} onNavigate={setPublicPage}>
                <div style={{ display: 'grid', gap: 10 }}>
                    <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.78)', padding: '10px 11px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 600 }}>{currentUser?.name || 'Builder'}</div>
                        </div>
                        <div style={{ marginTop: 2, fontSize: 11, color: '#64748b' }}>{currentUser?.district || 'Selangor'}</div>
                        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 7 }}>
                            <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}><div style={{ fontSize: 10, color: '#64748b' }}>Logs Submitted</div><div style={{ fontSize: 16, color: '#0f172a', fontWeight: 600 }}>{totalSubs}</div></div>
                            <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}><div style={{ fontSize: 10, color: '#64748b' }}>Sprint Progress</div><div style={{ fontSize: 16, color: '#0f172a', fontWeight: 600 }}>{progressPct}%</div></div>
                        </div>
                        <div style={{ marginTop: 8, height: 6, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}><div style={{ width: `${progressPct}%`, height: '100%', background: '#ef4444' }} /></div>
                    </section>
                    <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.78)', padding: '10px 11px' }}><div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Daily Encouragement</div><div style={{ fontSize: 12, lineHeight: 1.45, color: '#334155' }}>{encouragementText}</div></section>
                    <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.78)', padding: '10px 11px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                            <button className="btn btn-outline" style={iosSecondaryBtn} onClick={() => setPublicPage?.('showcase')}>Open Showcase</button>
                            <button className="btn btn-outline" style={iosSecondaryBtn} onClick={() => setShowProjectModal(true)}>New Project</button>
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <button className="btn btn-outline" style={{ ...iosSecondaryBtn, width: '100%' }} onClick={handleSignOut}>Logout</button>
                        </div>
                    </section>
                    <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.78)', padding: '10px 11px' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Recent Logs</div>
                        <div style={{ display: 'grid', gap: 7, maxHeight: 'calc(var(--app-vh, 100vh) - 500px)', overflowY: 'auto' }}>
                            {builderSubs.length === 0 && <div style={{ fontSize: 11, color: '#64748b' }}>No logs yet. Start from Builder Vault.</div>}
                            {builderSubs.slice(0, 6).map((item) => (
                                <div key={item.id} style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{item.project_name || 'Untitled Project'}</div>
                                    <div style={{ marginTop: 2, fontSize: 10, color: '#64748b' }}>{new Date(item.created_at).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                {newProjectModal}
            </MobileFeatureShell>
        );
    }

    return (
        <div className="container" style={{ padding: '24px 20px' }}>
            {/* Profile Header - Tightened */}
            <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black', padding: '20px 24px', background: 'white', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: isMobileView ? 'wrap' : 'nowrap' }}>
                    <div style={{ width: '90px', height: '90px', borderRadius: '18px', border: '3px solid black', background: 'var(--selangor-red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '950', boxShadow: '4px 4px 0px black', flexShrink: 0 }}>
                        {currentUser?.name?.[0] || 'B'}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <div className="pill pill-red" style={{ marginBottom: '8px', fontSize: '9px', padding: '2px 10px' }}>FEBRUARY_COHORT_2026</div>
                                <h2 style={{ fontSize: '36px', letterSpacing: '-1.5px', marginBottom: '4px', lineHeight: 1 }}>{currentUser?.name}</h2>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span className="pill" style={{ border: '2px solid black', fontWeight: '900', fontSize: '11px', padding: '2px 8px' }}>{currentUser?.district}</span>
                                    <div style={{ fontWeight: '800', fontSize: '12px', opacity: 0.6 }}>LOGS SUBMITTED: {totalSubs}</div>
                                    {submissionsToday > 0 && <div className="pill pill-teal" style={{ fontSize: '10px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Check size={10} strokeWidth={3} /> {submissionsToday} LOG{submissionsToday > 1 ? 'S' : ''} TODAY</div>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button className="btn btn-outline" onClick={openEditProfileModal} style={{ borderRadius: '8px', padding: '6px 12px', fontSize: '11px', height: 'fit-content', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={isUpdatingProfile}>
                                    {isUpdatingProfile ? '...' : <Settings size={12} />} Edit Profile
                                </button>
                                <button className="btn btn-outline" onClick={handleSignOut} style={{ borderRadius: '8px', padding: '6px 12px', fontSize: '11px', height: 'fit-content', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <LogOut size={12} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Tabs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '2px solid #eee' }}>
                <button
                    onClick={() => setActiveTab('sprint')}
                    style={{ padding: '12px 12px', border: 'none', background: 'none', borderBottom: activeTab === 'sprint' ? '4px solid var(--selangor-red)' : '4px solid transparent', fontWeight: '900', fontSize: '13px', cursor: 'pointer', color: activeTab === 'sprint' ? 'black' : '#888', transition: 'all 0.2s' }}
                >
                    SPRINT DASHBOARD
                </button>
                <button
                    onClick={() => setActiveTab('studio')}
                    style={{ padding: '12px 12px', border: 'none', background: 'none', borderBottom: activeTab === 'studio' ? '4px solid #FFD700' : '4px solid transparent', fontWeight: '900', fontSize: '13px', cursor: 'pointer', color: activeTab === 'studio' ? 'black' : '#888', transition: 'all 0.2s' }}
                >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Gamepad2 size={14} /> MY STUDIO</span>
                </button>
                <button
                    onClick={() => { setActiveTab('sprint'); setShowProjectModal(true); }}
                    style={{ padding: '12px 16px', border: 'none', background: 'none', borderBottom: '4px solid transparent', fontWeight: '900', fontSize: '13px', cursor: 'pointer', color: '#0f172a', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}><Rocket size={14} /> NEW PROJECT</span>
                </button>
            </div>

            {activeTab === 'studio' ? (
                <BuilderStudioPage session={session} />
            ) : (
                <>
                    {activeClass && (
                        <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black', padding: '20px 24px', background: 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div className="pill pill-red" style={{ fontSize: '10px', fontWeight: '900', animation: 'pulse 2s infinite' }}>LIVE SESSION</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <div>
                                    <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{activeClass.title}</h3>
                                    <p style={{ fontSize: '13px', opacity: 0.7 }}>Join the live session now! Don't forget to mark your attendance.</p>
                                </div>
                                <button
                                    onClick={() => handleToggleAttendance(currentUser.id, activeClass.id)}
                                    className={`btn ${isPresentAtActive ? 'btn-outline' : 'btn-red'}`}
                                    style={{ padding: '12px 24px', borderRadius: '12px' }}
                                >
                                    {isPresentAtActive ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={18} /> I'M HERE</span>
                                    ) : (
                                        "I'M HERE"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid-12" style={{ gap: '20px' }}>
                        {/* Sprint Track - Tightened */}
                        <div style={{ gridColumn: isMobileView ? 'span 12' : 'span 4' }}>
                            <div className="neo-card" style={{ border: '3px solid black', boxShadow: '6px 6px 0px black', height: '100%', padding: '20px' }}>
                                <div style={{ marginBottom: '16px', borderBottom: '2px solid black', paddingBottom: '12px', margin: '0 -10px 16px', paddingLeft: '10px', paddingRight: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '950' }}>SPRINT TRACK</h3>
                                            <p style={{ fontSize: '10px', fontWeight: '700', opacity: 0.5 }}>Daily build & check-in flow.</p>
                                        </div>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'black', color: 'white', fontSize: '12px', fontWeight: '950' }}>{Math.round((totalSubs / SPRINT_MODULE_STEPS.length) * 100)}%</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {/* Day 0 Marker */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 10px', background: '#f0fff4', borderRadius: '10px', border: '1px solid #c6f6d5', opacity: 0.8 }}>
                                        <div style={{ width: '24px', height: '24px', background: '#22c55e', borderRadius: '6px', border: '2px solid black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: '900' }}>Day 0: Registration</div>
                                    </div>

                                    {SPRINT_MODULE_STEPS.map((step, i) => {
                                        const isDone = i < totalSubs;
                                        const isCurrent = i === totalSubs;
                                        return (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '10px',
                                                borderRadius: '10px',
                                                border: isCurrent ? '2px solid black' : '1px solid transparent',
                                                background: isCurrent ? '#fff8f0' : (isDone ? '#f0fff4' : 'transparent'),
                                                opacity: isDone || isCurrent ? 1 : 0.4,
                                                transition: 'all 0.2s'
                                            }}>
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    background: isDone ? '#22c55e' : (isCurrent ? 'black' : '#eee'),
                                                    borderRadius: '6px',
                                                    border: '2px solid black',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '950',
                                                    fontSize: '12px'
                                                }}>
                                                    {isDone ? <Check size={16} strokeWidth={4} /> : i + 1}
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: '800' }}>{step}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Ship Station - Expansion */}
                        <div style={{ gridColumn: isMobileView ? 'span 12' : 'span 8' }}>
                            <div className="neo-card" style={{ border: '3px solid black', background: 'black', color: 'white', marginBottom: '20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '2px' }}>Next: {classes[0]?.title || 'TBD'}</h3>
                                    <p style={{ opacity: 0.6, fontSize: '12px', fontWeight: '700' }}>{classes[0]?.date ? new Date(classes[0].date).toLocaleDateString() : 'TBD'} • {classes[0]?.time || 'TBD'}</p>
                                </div>
                                <Calendar size={24} style={{ opacity: 0.5 }} />
                            </div>

                            <div className="neo-card" style={{ border: '3px solid black', boxShadow: '8px 8px 0px black', background: '#fdfdfd', padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--selangor-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Rocket size={20} color="white" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '20px', fontWeight: '950' }}>SHIP LOG STATION</h3>
                                        <p style={{ fontSize: '11px', opacity: 0.6, fontWeight: '800' }}>STEP: {SPRINT_MODULE_STEPS[nextStepIdx]}</p>
                                    </div>
                                </div>

                                <form className="builder-upload-form" onSubmit={handleBuilderUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '10px', fontWeight: '950', color: '#666' }}>PROJECT/BUILD NAME</label>
                                        <input placeholder="e.g. Selangor Vibe App" required value={newUpload.project} onChange={(e) => setNewUpload({ ...newUpload, project: e.target.value })} style={{ padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }} />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '10px', fontWeight: '950', color: '#666' }}>
                                            {nextStepIdx === 0 ? 'WHAT IS THE CORE PROBLEM YOU ARE SOLVING?' :
                                                nextStepIdx === 1 ? 'WHO IS YOUR TARGET USER?' :
                                                    nextStepIdx === 2 ? 'REFINED ONE-LINER VALUE PROP' :
                                                        nextStepIdx === 3 ? 'LIST CORE FEATURES (BLUEPRINT)' :
                                                            nextStepIdx === 4 ? 'DESCRIBE THE VISUAL INTERFACE & VIBE' :
                                                                nextStepIdx === 5 ? 'FINAL POLISHED DESCRIPTION' :
                                                                    'FINAL SHOWCASE LINK / DEMO URL'}
                                        </label>
                                        <textarea
                                            placeholder={
                                                nextStepIdx === 0 ? "Describe the specific pain point your project addresses..." :
                                                    nextStepIdx === 1 ? "Age, location, occupation, and why they need this..." :
                                                        nextStepIdx === 2 ? "How does it solve the problem in one powerful sentence?" :
                                                            nextStepIdx === 3 ? "What are the 3-5 main things your app does?" :
                                                                nextStepIdx === 4 ? "Explain the colors, fonts, and the overall 'vibe'..." :
                                                                    nextStepIdx === 5 ? "Write a short, compelling summary for the public showcase..." :
                                                                        "Paste your final Threads/GitHub link or demo URL here..."
                                            }
                                            required
                                            rows={3}
                                            value={newUpload.details}
                                            onChange={(e) => setNewUpload({ ...newUpload, details: e.target.value })}
                                            style={{ padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', fontWeight: '700', resize: 'vertical' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '10px', fontWeight: '950', color: '#666' }}>VISUAL PROOF / FINAL LINK (OPTIONAL)</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <div style={{ flexGrow: 1, position: 'relative' }}>
                                                <input
                                                    placeholder="Threads URL, GitHub, or Website"
                                                    value={newUpload.link}
                                                    onChange={(e) => setNewUpload({ ...newUpload, link: e.target.value })}
                                                    style={{ width: '100%', padding: '12px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }}
                                                />
                                            </div>
                                            <div
                                                onClick={() => document.getElementById('image-upload').click()}
                                                style={{
                                                    width: '46px',
                                                    height: '46px',
                                                    border: '2px solid black',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    background: selectedFile ? '#f0fff4' : 'white',
                                                    boxShadow: '2px 2px 0px black'
                                                }}
                                                title="Upload Image"
                                            >
                                                <Camera size={20} color={selectedFile ? '#22c55e' : 'black'} />
                                            </div>
                                            <input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                            />
                                        </div>
                                        {selectedFile && (
                                            <div style={{ fontSize: '10px', fontWeight: '800', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Check size={10} /> {selectedFile.name} SELECTED
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-red"
                                        type="submit"
                                        disabled={isUploading}
                                        style={{ padding: '16px', fontSize: '15px', fontWeight: '950', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '4px 4px 0px black', opacity: isUploading ? 0.7 : 1 }}
                                    >
                                        {isUploading ? 'SHIPPING...' : `SUBMIT PROGRESS LOG${submissionsToday > 0 ? ` (#${submissionsToday + 1} today)` : ''}`} <ChevronRight size={18} />
                                    </button>
                                    {!isMobileView && (
                                        <div style={{ fontSize: '11px', color: '#666', marginTop: '6px', textAlign: 'center', fontWeight: '600' }}>
                                            Tip: Press Ctrl+Enter to submit quickly
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>


                </>
            )}

            {newProjectModal}
        </div >
    );
};
