import React, { useState, useMemo } from 'react';
import {
    Rocket,
    Zap,
    Brain,
    Layout,
    Globe,
    ChevronRight,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import MobileFeatureShell from '../components/MobileFeatureShell';
import { supabase } from '../lib/supabase';

const BLUEPRINT_STEPS = [
    {
        id: 'ideate',
        title: '1. Ideate',
        icon: Brain,
        desc: 'Focus on one small problem in Selangor. Solve it for yourself first.',
        color: '#be123c'
    },
    {
        id: 'wireframe',
        title: '2. Low-fi Sketch',
        icon: Layout,
        desc: 'Draw your screens on paper. Keep it to 3 main screens max.',
        color: '#92400e'
    },
    {
        id: 'build',
        title: '3. Build Fast',
        icon: Zap,
        iconSize: 18,
        desc: 'Use Antigravity to generate UI. Focus on core logic over polish.',
        color: '#166534'
    },
    {
        id: 'deploy',
        title: '4. Ship It',
        icon: Globe,
        desc: 'Push to GitHub and deploy to Vercel. Share your link!',
        color: '#0369a1'
    }
];

export default function StartProjectPage({
    session,
    currentUser,
    setPublicPage,
    fetchData,
    isMobileView
}) {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        project_name: '',
        submission_url: '',
        one_liner: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!session?.user) return;
        setSubmitting(true);

        const payload = {
            project_name: form.project_name.trim(),
            submission_url: form.submission_url.trim(),
            one_liner: form.one_liner.trim() || 'Excited to start my Selangor Builder journey!',
            district: currentUser?.district || 'Unknown',
            builder_name: currentUser?.name || currentUser?.full_name || 'Builder'
        };

        const { error } = await supabase.from('builder_progress').insert([{
            ...payload,
            user_id: session.user.id,
            status: 'Draft'
        }]);

        if (error) {
            alert('Wait, something went wrong: ' + (error.message || 'Unknown error'));
            setSubmitting(false);
            return;
        }

        fetchData();
        setPublicPage('dashboard');
    };

    return (
        <MobileFeatureShell
            title="Start Project"
            subtitle="Builder Blueprint"
            onNavigate={setPublicPage}
        >
            <div style={{ padding: '4px 0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Section 1: The Blueprint */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--selangor-red)', display: 'grid', placeItems: 'center', color: '#fff' }}>
                            <Rocket size={16} />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>The 4-Step Blueprint</h2>
                    </div>

                    <div style={{ display: 'grid', gap: 10 }}>
                        {BLUEPRINT_STEPS.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.id}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.68)',
                                        border: '1px solid rgba(255, 255, 255, 0.45)',
                                        borderRadius: 16,
                                        padding: 12,
                                        display: 'flex',
                                        gap: 12,
                                        alignItems: 'center',
                                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                                        backdropFilter: 'blur(12px)',
                                        WebkitBackdropFilter: 'blur(12px)'
                                    }}
                                >
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        background: step.color,
                                        boxShadow: `0 4px 12px ${step.color}44`,
                                        color: '#fff',
                                        display: 'grid',
                                        placeItems: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Icon size={step.iconSize || 20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{step.title}</div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', lineHeight: 1.35, marginTop: 2 }}>{step.desc}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '4px 0' }} />

                {/* Section 2: Submission Form */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#000', display: 'grid', placeItems: 'center', color: '#fff' }}>
                            <CheckCircle2 size={16} />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Register Your Project</h2>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            background: 'rgba(255, 255, 255, 0.72)',
                            border: '1px solid rgba(255, 255, 255, 0.55)',
                            borderRadius: 22,
                            padding: 20,
                            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            display: 'grid',
                            gap: 16
                        }}
                    >
                        <div>
                            <label style={{ fontSize: 10, fontWeight: 900, color: '#475569', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project Name *</label>
                            <input
                                type="text"
                                value={form.project_name}
                                onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                                placeholder="e.g. Selangor Vibe App"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: '#0f172a'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: 10, fontWeight: 900, color: '#475569', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project URL (Threads / GitHub)</label>
                            <input
                                type="url"
                                value={form.submission_url}
                                onChange={(e) => setForm({ ...form, submission_url: e.target.value })}
                                placeholder="https://..."
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: '#0f172a'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: 10, fontWeight: 900, color: '#475569', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>One-liner Description *</label>
                            <textarea
                                value={form.one_liner}
                                onChange={(e) => setForm({ ...form, one_liner: e.target.value })}
                                placeholder="What problem are you solving?"
                                required
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: '#0f172a',
                                    resize: 'none'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #ef4444, #be123c)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: '15px',
                                fontWeight: '950',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                boxShadow: '0 8px 20px rgba(190, 18, 60, 0.3)',
                                marginTop: 8
                            }}
                        >
                            {submitting ? 'COMMITTING...' : (
                                <>
                                    START SPRINT <ArrowRight size={18} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>
                </section>

                <div style={{ textAlign: 'center', opacity: 0.5, fontSize: 10, fontWeight: 800 }}>
                    VIBESELANGOR BUILDER SPRINT 2026
                </div>
            </div>
        </MobileFeatureShell>
    );
}
