import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Save, X, ImagePlus, Eye, EyeOff, Archive, RotateCcw, Link2, History, Lock, Unlock, Award, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import MobileFeatureShell from '../components/MobileFeatureShell';
import { DISTRICT_OPTIONS } from '../constants';

const EMPTY_FORM = {
    project_name: '',
    submission_url: '',
    one_liner: ''
};

const EMPTY_IDEA_FORM = {
    username: '',
    district: '',
    ideaTitle: '',
    problemStatement: '',
    aboutYourself: '',
    programGoal: '',
    whatsappContact: '',
    threadsHandle: '',
    discordTag: ''
};

const VERSIONS_STORAGE_PREFIX = 'builder_vault_versions_';

export default function BuilderVaultPage({
    session,
    currentUser,
    submissions = [],
    fetchData,
    isMobileView,
    setPublicPage
}) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState('');
    const [showcaseEntryId, setShowcaseEntryId] = useState('');
    const [showcaseForm, setShowcaseForm] = useState({
        project_name: '',
        submission_url: '',
        one_liner: '',
        status: 'Draft'
    });
    const [showcaseImageUrl, setShowcaseImageUrl] = useState('');
    const [isSavingShowcase, setIsSavingShowcase] = useState(false);
    const [isUploadingShowcaseImage, setIsUploadingShowcaseImage] = useState(false);
    const [showcaseNotice, setShowcaseNotice] = useState('');
    const [showNewIdea, setShowNewIdea] = useState(false);
    const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);
    const [newIdeaNotice, setNewIdeaNotice] = useState('');
    const [newIdeaForm, setNewIdeaForm] = useState(EMPTY_IDEA_FORM);
    const [vaultTab, setVaultTab] = useState('current');
    const [vaultUnlocked, setVaultUnlocked] = useState(false);
    const [versions, setVersions] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [certificatesError, setCertificatesError] = useState('');
    const [isCertificatesLoading, setIsCertificatesLoading] = useState(false);
    const userId = session?.user?.id || currentUser?.id || null;

    const allMyProjects = useMemo(() => {
        if (!userId) return [];
        return (submissions || [])
            .filter((item) => item?.user_id === userId)
            .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
    }, [submissions, userId]);

    const myProjects = useMemo(() => {
        return allMyProjects.filter((item) => item?.status !== 'Archived');
    }, [allMyProjects]);

    const archivedProjects = useMemo(() => allMyProjects.filter((item) => item?.status === 'Archived'), [allMyProjects]);
    const currentSubmission = useMemo(() => myProjects[0] || allMyProjects[0] || null, [myProjects, allMyProjects]);
    const publishedCount = useMemo(
        () => allMyProjects.filter((item) => item?.status === 'Published').length,
        [allMyProjects]
    );
    const draftCount = useMemo(
        () => allMyProjects.filter((item) => (item?.status || 'Draft') !== 'Published' && item?.status !== 'Archived').length,
        [allMyProjects]
    );
    const linksInventory = useMemo(
        () => allMyProjects.filter((item) => Boolean((item?.submission_url || '').trim())),
        [allMyProjects]
    );
    const timelineEntries = useMemo(() => {
        const versionEntries = (versions || []).map((v) => ({
            id: `v-${v.ts}`,
            type: 'version',
            title: v.project_name || 'Version snapshot',
            description: v.action || 'Snapshot saved',
            at: v.ts
        }));
        const projectEntries = (allMyProjects || []).map((p) => ({
            id: `p-${p.id}-${p.updated_at || p.created_at}`,
            type: 'project',
            title: p.project_name || 'Project update',
            description: `${p.status || 'Draft'}${p.submission_url ? ' • URL set' : ''}`,
            at: p.updated_at || p.created_at
        }));
        return [...versionEntries, ...projectEntries]
            .sort((a, b) => new Date(b.at) - new Date(a.at))
            .slice(0, 80);
    }, [versions, allMyProjects]);

    const isEditing = Boolean(editingId);

    useEffect(() => {
        setNewIdeaForm((prev) => ({
            ...prev,
            username: currentUser?.name || '',
            district: currentUser?.district || prev.district || ''
        }));
    }, [currentUser?.name, currentUser?.district]);

    useEffect(() => {
        if (!myProjects.length) {
            setShowcaseEntryId('');
            setShowcaseForm({ project_name: '', submission_url: '', one_liner: '', status: 'Draft' });
            return;
        }
        setShowcaseEntryId((prev) => prev || myProjects[0].id);
    }, [myProjects]);

    useEffect(() => {
        const selected = myProjects.find((item) => item.id === showcaseEntryId) || myProjects[0];
        setShowcaseForm({
            project_name: selected?.project_name || '',
            submission_url: selected?.submission_url || '',
            one_liner: selected?.one_liner || '',
            status: (selected?.status || 'Draft') === 'Published' ? 'Published' : 'Draft'
        });
    }, [myProjects, showcaseEntryId]);

    useEffect(() => {
        let ignore = false;
        const loadShowcaseImage = async () => {
            if (!userId) return;
            const { data } = await supabase
                .from('profiles')
                .select('showcase_image')
                .eq('id', userId)
                .maybeSingle();
            if (!ignore) setShowcaseImageUrl(data?.showcase_image || '');
        };
        loadShowcaseImage();
        return () => {
            ignore = true;
        };
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            setVersions([]);
            return;
        }
        try {
            const raw = localStorage.getItem(`${VERSIONS_STORAGE_PREFIX}${userId}`);
            const parsed = raw ? JSON.parse(raw) : [];
            setVersions(Array.isArray(parsed) ? parsed : []);
        } catch {
            setVersions([]);
        }
    }, [userId]);

    useEffect(() => {
        let ignore = false;
        const fetchCertificates = async () => {
            if (!userId) {
                setCertificates([]);
                setCertificatesError('');
                return;
            }
            setIsCertificatesLoading(true);
            setCertificatesError('');
            const { data, error } = await supabase
                .from('builder_certificates')
                .select('*')
                .eq('builder_id', userId)
                .order('issued_at', { ascending: false });
            if (ignore) return;
            if (error) {
                setCertificates([]);
                setCertificatesError(error.message || 'Failed to load certificates.');
            } else {
                setCertificates(data || []);
            }
            setIsCertificatesLoading(false);
        };
        fetchCertificates();
        return () => {
            ignore = true;
        };
    }, [userId, submissions.length]);

    const pushVersion = (project, action = 'Updated submission') => {
        if (!userId || !project) return;
        const entry = {
            ts: new Date().toISOString(),
            action,
            project_id: project.id || null,
            project_name: project.project_name || '',
            submission_url: project.submission_url || '',
            one_liner: project.one_liner || '',
            status: project.status || 'Draft'
        };
        setVersions((prev) => {
            const next = [entry, ...prev].slice(0, 120);
            try {
                localStorage.setItem(`${VERSIONS_STORAGE_PREFIX}${userId}`, JSON.stringify(next));
            } catch {
                // Ignore storage write failures.
            }
            return next;
        });
    };

    const startEdit = (project) => {
        if (!vaultUnlocked) {
            setNotice('Unlock vault controls to edit submissions.');
            return;
        }
        setEditingId(project.id);
        setForm({
            project_name: project.project_name || '',
            submission_url: project.submission_url || '',
            one_liner: project.one_liner || ''
        });
        setNotice('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setNotice('');
    };

    const saveProject = async (event) => {
        event.preventDefault();
        if (!vaultUnlocked) {
            setNotice('Unlock vault controls to save changes.');
            return;
        }
        if (!userId || !form.project_name.trim()) return;
        setIsSaving(true);
        setNotice('');

        const payload = {
            project_name: form.project_name.trim(),
            submission_url: form.submission_url.trim(),
            one_liner: form.one_liner.trim() || 'Builder update from VibeSelangor.',
            district: currentUser?.district || 'Unknown',
            builder_name: currentUser?.name || currentUser?.full_name || 'Builder'
        };

        let error = null;
        if (isEditing) {
            const existing = allMyProjects.find((item) => item.id === editingId);
            if (existing) pushVersion(existing, 'Before edit');
            ({ error } = await supabase
                .from('builder_progress')
                .update({ ...payload, updated_at: new Date().toISOString() })
                .eq('id', editingId)
                .eq('user_id', userId));
        } else {
            ({ error } = await supabase
                .from('builder_progress')
                .insert([{ ...payload, user_id: userId, status: 'Draft' }]));
        }

        if (error) {
            setNotice(error.message || 'Failed to save project.');
            setIsSaving(false);
            return;
        }

        pushVersion({ id: editingId, ...payload, status: isEditing ? (allMyProjects.find((p) => p.id === editingId)?.status || 'Draft') : 'Draft' }, isEditing ? 'Edited submission' : 'Created submission');

        await fetchData?.();
        setNotice(isEditing ? 'Project updated.' : 'Project submitted.');
        setForm(EMPTY_FORM);
        setEditingId(null);
        setIsSaving(false);
    };

    const archiveSubmission = async (projectId) => {
        if (!userId || !projectId) return;
        const existing = allMyProjects.find((item) => item.id === projectId);
        if (!existing) return;
        pushVersion(existing, 'Archived submission');
        const { error } = await supabase
            .from('builder_progress')
            .update({ status: 'Archived', updated_at: new Date().toISOString() })
            .eq('id', projectId)
            .eq('user_id', userId);
        if (error) {
            setNotice(error.message || 'Failed to archive submission.');
            return;
        }
        await fetchData?.();
        setNotice('Submission archived.');
    };

    const restoreSubmission = async (projectId) => {
        if (!userId || !projectId) return;
        const existing = allMyProjects.find((item) => item.id === projectId);
        if (!existing) return;
        pushVersion(existing, 'Restored submission');
        const { error } = await supabase
            .from('builder_progress')
            .update({ status: 'Draft', updated_at: new Date().toISOString() })
            .eq('id', projectId)
            .eq('user_id', userId);
        if (error) {
            setNotice(error.message || 'Failed to restore submission.');
            return;
        }
        await fetchData?.();
        setNotice('Submission restored to draft.');
    };

    const submitNewIdeaCycle = async (event) => {
        event.preventDefault();
        if (!userId) return;
        const requiredFields = [
            newIdeaForm.username,
            newIdeaForm.district,
            newIdeaForm.ideaTitle,
            newIdeaForm.problemStatement,
            newIdeaForm.aboutYourself,
            newIdeaForm.programGoal,
            newIdeaForm.whatsappContact
        ];
        if (requiredFields.some((v) => !String(v || '').trim())) {
            setNewIdeaNotice('Please complete all required fields.');
            return;
        }

        setIsSubmittingIdea(true);
        setNewIdeaNotice('');
        const nowIso = new Date().toISOString();

        const profilePayload = {
            id: userId,
            full_name: newIdeaForm.username.trim(),
            district: newIdeaForm.district.trim(),
            idea_title: newIdeaForm.ideaTitle.trim(),
            problem_statement: newIdeaForm.problemStatement.trim(),
            threads_handle: newIdeaForm.threadsHandle.trim(),
            whatsapp_contact: newIdeaForm.whatsappContact.trim(),
            discord_tag: newIdeaForm.discordTag.trim(),
            about_yourself: newIdeaForm.aboutYourself.trim(),
            program_goal: newIdeaForm.programGoal.trim(),
            onboarding_completed: true,
            updated_at: nowIso
        };

        let profileError = null;
        ({ error: profileError } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' }));
        if (profileError) {
            ({ error: profileError } = await supabase.from('profiles').upsert({
                id: userId,
                full_name: profilePayload.full_name,
                district: profilePayload.district,
                idea_title: profilePayload.idea_title,
                problem_statement: profilePayload.problem_statement,
                updated_at: nowIso
            }, { onConflict: 'id' }));
        }
        if (profileError) {
            setNewIdeaNotice(profileError.message || 'Failed to update profile.');
            setIsSubmittingIdea(false);
            return;
        }

        const { error: archiveError } = await supabase
            .from('builder_progress')
            .update({ status: 'Archived', updated_at: nowIso })
            .eq('user_id', userId)
            .neq('status', 'Archived');
        if (archiveError) {
            setNewIdeaNotice(archiveError.message || 'Failed to reset previous cycle.');
            setIsSubmittingIdea(false);
            return;
        }

        const { error: kickoffError } = await supabase.from('builder_progress').insert([{
            user_id: userId,
            builder_name: profilePayload.full_name,
            district: profilePayload.district,
            project_name: profilePayload.idea_title,
            one_liner: profilePayload.problem_statement,
            submission_url: '',
            status: 'IdeaSubmitted'
        }]);
        if (kickoffError) {
            setNewIdeaNotice(kickoffError.message || 'Failed to start new idea cycle.');
            setIsSubmittingIdea(false);
            return;
        }

        await fetchData?.();
        setNewIdeaNotice('New full idea submitted. Cycle restarted from onboarding.');
        setShowNewIdea(false);
        setIsSubmittingIdea(false);
    };

    const saveShowcase = async (event) => {
        event.preventDefault();
        if (!vaultUnlocked) {
            setShowcaseNotice('Unlock vault controls to save showcase.');
            return;
        }
        if (!userId || !showcaseEntryId) {
            setShowcaseNotice('No project selected.');
            return;
        }
        setIsSavingShowcase(true);
        setShowcaseNotice('');

        const payload = {
            project_name: showcaseForm.project_name.trim() || 'Untitled Project',
            submission_url: showcaseForm.submission_url.trim(),
            one_liner: showcaseForm.one_liner.trim() || 'Builder update from VibeSelangor.',
            status: showcaseForm.status === 'Published' ? 'Published' : 'Draft',
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('builder_progress')
            .update(payload)
            .eq('id', showcaseEntryId)
            .eq('user_id', userId);

        if (error) {
            setShowcaseNotice(error.message || 'Failed to save showcase.');
            setIsSavingShowcase(false);
            return;
        }

        await fetchData?.();
        setShowcaseNotice(`Showcase ${payload.status.toLowerCase()} saved.`);
        setIsSavingShowcase(false);
    };

    const handleShowcaseImageUpload = async (event) => {
        try {
            const file = event.target.files?.[0];
            if (!vaultUnlocked) {
                setShowcaseNotice('Unlock vault controls to upload assets.');
                return;
            }
            if (!file || !userId) return;
            setIsUploadingShowcaseImage(true);
            setShowcaseNotice('');

            const fileExt = (file.name.split('.').pop() || 'png').toLowerCase();
            const fileName = `${userId}-showcase-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('builder_showcase')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('builder_showcase')
                .getPublicUrl(fileName);

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    showcase_image: publicUrl,
                    updated_at: new Date().toISOString()
                });
            if (profileError) throw profileError;

            setShowcaseImageUrl(publicUrl);
            setShowcaseNotice('Showcase image updated.');
        } catch (error) {
            setShowcaseNotice(error.message || 'Image upload failed.');
        } finally {
            setIsUploadingShowcaseImage(false);
            if (event?.target) event.target.value = '';
        }
    };

    const content = (
        <section style={{ minHeight: isMobileView ? 'calc(var(--app-vh, 100vh) - clamp(190px, 25vh, 244px))' : 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: isMobileView ? 22 : 28, fontWeight: 600 }}>Builder Vault</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.74 }}>Submit and manage your own project entries.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setVaultUnlocked((prev) => !prev)}
                    style={{
                        borderRadius: 12,
                        border: vaultUnlocked ? '1px solid rgba(22,163,74,0.45)' : '1px solid rgba(148,163,184,0.45)',
                        background: vaultUnlocked ? 'rgba(220,252,231,0.9)' : 'rgba(255,255,255,0.86)',
                        color: '#0f172a',
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 10px'
                    }}
                >
                    {vaultUnlocked ? <Unlock size={13} /> : <Lock size={13} />}
                    {vaultUnlocked ? 'Unlocked' : 'Locked'}
                </button>
            </div>

            <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(10px)', padding: '10px 12px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 7 }}>VAULT DRAWERS</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                        ['current', 'Current'],
                        ['archive', 'Archive'],
                        ['assets', 'Assets'],
                        ['links', 'Links'],
                        ['timeline', 'Timeline'],
                        ['certificates', 'Certificates']
                    ].map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setVaultTab(id)}
                            style={{
                                borderRadius: 999,
                                border: vaultTab === id ? '1px solid rgba(239,68,68,0.45)' : '1px solid rgba(148,163,184,0.45)',
                                background: vaultTab === id ? 'rgba(239,68,68,0.92)' : 'rgba(255,255,255,0.92)',
                                color: vaultTab === id ? '#fff' : '#0f172a',
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '6px 10px'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(8px)', padding: '10px 12px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 7 }}>VAULT SNAPSHOT</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 7 }}>
                    <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Total</div>
                        <div style={{ marginTop: 2, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{allMyProjects.length}</div>
                    </div>
                    <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Published</div>
                        <div style={{ marginTop: 2, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{publishedCount}</div>
                    </div>
                    <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Drafts</div>
                        <div style={{ marginTop: 2, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{draftCount}</div>
                    </div>
                    <div style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Archived</div>
                        <div style={{ marginTop: 2, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{archivedProjects.length}</div>
                    </div>
                </div>
            </section>

            {vaultTab === 'current' && (
                <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(8px)', padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Current Submission</div>
                            {currentSubmission ? (
                                <>
                                    <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}>{currentSubmission.project_name || 'Untitled Project'}</div>
                                    <div style={{ marginTop: 2, fontSize: 11, color: '#64748b' }}>{currentSubmission.status || 'Draft'} | {new Date(currentSubmission.updated_at || currentSubmission.created_at).toLocaleString()}</div>
                                    {currentSubmission.one_liner && <div style={{ marginTop: 5, fontSize: 12, color: '#334155' }}>{currentSubmission.one_liner}</div>}
                                    {currentSubmission.submission_url && (
                                        <a href={currentSubmission.submission_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', marginTop: 6, fontSize: 11, color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}>
                                            {currentSubmission.submission_url}
                                        </a>
                                    )}
                                </>
                            ) : (
                                <div style={{ marginTop: 4, fontSize: 11, color: '#64748b' }}>No submission yet.</div>
                            )}
                        </div>
                        {currentSubmission && (
                            <button
                                type="button"
                                onClick={() => startEdit(currentSubmission)}
                                disabled={!vaultUnlocked}
                                style={{ borderRadius: 12, border: '1px solid rgba(15,23,42,0.24)', background: 'rgba(255,255,255,0.82)', color: '#0f172a', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 9px', whiteSpace: 'nowrap' }}
                            >
                                <Pencil size={12} /> Edit
                            </button>
                        )}
                    </div>
                    {currentSubmission && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                disabled={!vaultUnlocked}
                                onClick={() => archiveSubmission(currentSubmission.id)}
                                style={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.45)', background: vaultUnlocked ? '#fff' : 'rgba(148,163,184,0.15)', color: '#0f172a', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 10px' }}
                            >
                                <Archive size={12} /> Archive
                            </button>
                            {currentSubmission.status === 'Archived' && (
                                <button
                                    type="button"
                                    disabled={!vaultUnlocked}
                                    onClick={() => restoreSubmission(currentSubmission.id)}
                                    style={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.45)', background: vaultUnlocked ? '#fff' : 'rgba(148,163,184,0.15)', color: '#0f172a', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 10px' }}
                                >
                                    <RotateCcw size={12} /> Restore
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setVaultTab('timeline')}
                                style={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.45)', background: '#fff', color: '#0f172a', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 10px' }}
                            >
                                <History size={12} /> Timeline
                            </button>
                        </div>
                    )}
                </section>
            )}

            {vaultTab === 'archive' && (
                <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(8px)', padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Archive Drawer</div>
                    <div style={{ display: 'grid', gap: 7 }}>
                        {archivedProjects.length === 0 && <div style={{ fontSize: 11, color: '#64748b' }}>No archived submissions.</div>}
                        {archivedProjects.map((item) => (
                            <div key={item.id} style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '8px 9px' }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{item.project_name || 'Untitled Project'}</div>
                                <div style={{ marginTop: 2, fontSize: 10, color: '#64748b' }}>{new Date(item.updated_at || item.created_at).toLocaleString()}</div>
                                <div style={{ marginTop: 6 }}>
                                    <button
                                        type="button"
                                        disabled={!vaultUnlocked}
                                        onClick={() => restoreSubmission(item.id)}
                                        style={{ borderRadius: 10, border: '1px solid rgba(148,163,184,0.45)', background: vaultUnlocked ? '#fff' : 'rgba(148,163,184,0.15)', color: '#0f172a', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 9px' }}
                                    >
                                        <RotateCcw size={12} /> Restore
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {vaultTab === 'assets' && (
                <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(8px)', padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Assets Drawer</div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', minHeight: 84, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                        {showcaseImageUrl ? (
                            <img src={showcaseImageUrl} alt="Vault Asset" style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                        ) : (
                            <div style={{ fontSize: 11, color: '#64748b' }}>No uploaded vault asset yet.</div>
                        )}
                    </div>
                    <label style={{ marginTop: 8, border: '1px solid rgba(51,65,85,0.35)', borderRadius: 10, background: 'rgba(255,255,255,0.9)', color: '#0f172a', padding: '8px 10px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer' }}>
                        <ImagePlus size={13} />
                        {isUploadingShowcaseImage ? 'Uploading...' : 'Upload Asset'}
                        <input type="file" accept="image/*" onChange={handleShowcaseImageUpload} style={{ display: 'none' }} disabled={isUploadingShowcaseImage || !vaultUnlocked} />
                    </label>
                </section>
            )}

            {vaultTab === 'links' && (
                <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(8px)', padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Links Drawer</div>
                    <div style={{ display: 'grid', gap: 7 }}>
                        {linksInventory.length === 0 && <div style={{ fontSize: 11, color: '#64748b' }}>No links submitted yet.</div>}
                        {linksInventory.map((item) => {
                            let isValid = false;
                            try {
                                // eslint-disable-next-line no-new
                                new URL(item.submission_url);
                                isValid = true;
                            } catch {
                                isValid = false;
                            }
                            return (
                                <div key={`link-${item.id}`} style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '8px 9px' }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                        <Link2 size={12} /> {item.project_name || 'Untitled Project'}
                                    </div>
                                    <a href={item.submission_url} target="_blank" rel="noreferrer" style={{ marginTop: 4, display: 'block', fontSize: 11, color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}>
                                        {item.submission_url}
                                    </a>
                                    <div style={{ marginTop: 4, fontSize: 10, color: isValid ? '#065f46' : '#b91c1c' }}>{isValid ? 'Link format valid' : 'Invalid URL format'}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {vaultTab === 'timeline' && (
                <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(8px)', padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Timeline Drawer</div>
                    <div style={{ display: 'grid', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                        {timelineEntries.length === 0 && <div style={{ fontSize: 11, color: '#64748b' }}>No timeline entries yet.</div>}
                        {timelineEntries.map((entry) => (
                            <div key={entry.id} style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '7px 8px' }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{entry.title}</div>
                                <div style={{ marginTop: 2, fontSize: 10, color: '#64748b' }}>{entry.description}</div>
                                <div style={{ marginTop: 2, fontSize: 10, color: '#94a3b8' }}>{new Date(entry.at).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {vaultTab === 'certificates' && (
                <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(8px)', padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
                        <Award size={14} />
                        Certificate Drawer
                    </div>
                    {isCertificatesLoading && <div style={{ fontSize: 11, color: '#64748b' }}>Loading certificates...</div>}
                    {!isCertificatesLoading && certificatesError && (
                        <div style={{ fontSize: 11, color: '#b91c1c' }}>
                            {certificatesError}
                        </div>
                    )}
                    {!isCertificatesLoading && !certificatesError && certificates.length === 0 && (
                        <div style={{ fontSize: 11, color: '#64748b' }}>No certificates issued yet.</div>
                    )}
                    {!isCertificatesLoading && !certificatesError && certificates.length > 0 && (
                        <div style={{ display: 'grid', gap: 7 }}>
                            {certificates.map((cert, idx) => (
                                <div key={cert.id || `${cert.builder_id}-${idx}`} style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '8px 9px' }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{cert.program_title || 'Program Certificate'}</div>
                                    <div style={{ marginTop: 2, fontSize: 10, color: '#64748b' }}>{cert.app_name || 'Builder Project'} | {cert.district || 'Selangor'}</div>
                                    <div style={{ marginTop: 2, fontSize: 10, color: '#64748b' }}>Issued: {cert.issued_at ? new Date(cert.issued_at).toLocaleString() : '-'}</div>
                                    {(cert.project_url || cert.certificate_url) && (
                                        <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <a
                                                href={cert.certificate_url || cert.project_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}
                                            >
                                                <ExternalLink size={12} />
                                                Open Link
                                            </a>
                                            {cert.certificate_url && (
                                                <a
                                                    href={cert.certificate_url}
                                                    download
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#0f172a', textDecoration: 'none' }}
                                                >
                                                    <ExternalLink size={12} />
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            <form onSubmit={saveProject} style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
                <input
                    placeholder="Project name"
                    value={form.project_name}
                    onChange={(event) => setForm((prev) => ({ ...prev, project_name: event.target.value }))}
                    required
                    style={{ borderRadius: 12, border: '1px solid rgba(51,65,85,0.35)', padding: '10px 12px', fontSize: 13, background: 'rgba(255,255,255,0.82)' }}
                />
                <input
                    placeholder="Project URL (optional)"
                    value={form.submission_url}
                    onChange={(event) => setForm((prev) => ({ ...prev, submission_url: event.target.value }))}
                    style={{ borderRadius: 12, border: '1px solid rgba(51,65,85,0.35)', padding: '10px 12px', fontSize: 13, background: 'rgba(255,255,255,0.82)' }}
                />
                <textarea
                    placeholder="One-liner / short update"
                    value={form.one_liner}
                    onChange={(event) => setForm((prev) => ({ ...prev, one_liner: event.target.value }))}
                    rows={3}
                    style={{ borderRadius: 12, border: '1px solid rgba(51,65,85,0.35)', padding: '10px 12px', fontSize: 13, resize: 'vertical', background: 'rgba(255,255,255,0.82)' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        type="submit"
                        disabled={isSaving || !vaultUnlocked}
                        className="btn"
                        style={{ borderRadius: 14, border: '1px solid rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.92)', color: '#fff', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px' }}
                    >
                        {isEditing ? <Save size={14} /> : <Plus size={14} />}
                        {isSaving ? 'Saving...' : isEditing ? 'Update Project' : 'Submit Project'}
                    </button>
                    {isEditing && (
                        <button
                            type="button"
                            className="btn"
                            onClick={cancelEdit}
                            style={{ borderRadius: 14, border: '1px solid rgba(15,23,42,0.24)', background: 'rgba(255,255,255,0.82)', color: '#0f172a', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px' }}
                        >
                            <X size={14} />
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {notice && <div style={{ fontSize: 12, marginBottom: 10, color: notice.toLowerCase().includes('failed') ? '#b91c1c' : '#065f46' }}>{notice}</div>}

            <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(8px)', padding: '10px 12px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Start New Full Idea</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Same onboarding-style process. Current cycle will be archived.</div>
                    </div>
                    <button
                        type="button"
                        className="btn"
                        disabled={!vaultUnlocked}
                        onClick={() => setShowNewIdea((prev) => !prev)}
                        style={{ borderRadius: 12, border: '1px solid rgba(239,68,68,0.55)', background: 'rgba(239,68,68,0.92)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '7px 10px' }}
                    >
                        {showNewIdea ? 'Close' : 'Restart Onboarding'}
                    </button>
                </div>
                {showNewIdea && (
                    <form onSubmit={submitNewIdeaCycle} style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                        <input
                            placeholder="Username"
                            value={newIdeaForm.username}
                            onChange={(event) => setNewIdeaForm((prev) => ({ ...prev, username: event.target.value }))}
                            required
                            style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, background: 'rgba(255,255,255,0.82)' }}
                        />
                        <select
                            value={newIdeaForm.district}
                            onChange={(event) => setNewIdeaForm((prev) => ({ ...prev, district: event.target.value }))}
                            required
                            style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, background: 'rgba(255,255,255,0.82)' }}
                        >
                            <option value="">Select district</option>
                            {DISTRICT_OPTIONS.map((district) => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                        <input
                            placeholder="App idea title"
                            value={newIdeaForm.ideaTitle}
                            onChange={(event) => setNewIdeaForm((prev) => ({ ...prev, ideaTitle: event.target.value }))}
                            required
                            style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, background: 'rgba(255,255,255,0.82)' }}
                        />
                        <textarea
                            placeholder="What problem are you solving?"
                            value={newIdeaForm.problemStatement}
                            onChange={(event) => setNewIdeaForm((prev) => ({ ...prev, problemStatement: event.target.value }))}
                            rows={3}
                            required
                            maxLength={150}
                            style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, resize: 'vertical', background: 'rgba(255,255,255,0.82)' }}
                        />
                        <textarea
                            placeholder="Tell us about yourself"
                            value={newIdeaForm.aboutYourself}
                            onChange={(event) => setNewIdeaForm((prev) => ({ ...prev, aboutYourself: event.target.value }))}
                            rows={2}
                            required
                            style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, resize: 'vertical', background: 'rgba(255,255,255,0.82)' }}
                        />
                        <textarea
                            placeholder="What is your goal in joining this program?"
                            value={newIdeaForm.programGoal}
                            onChange={(event) => setNewIdeaForm((prev) => ({ ...prev, programGoal: event.target.value }))}
                            rows={2}
                            required
                            style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, resize: 'vertical', background: 'rgba(255,255,255,0.82)' }}
                        />
                        <input
                            placeholder="WhatsApp contact"
                            value={newIdeaForm.whatsappContact}
                            onChange={(event) => setNewIdeaForm((prev) => ({ ...prev, whatsappContact: event.target.value }))}
                            required
                            style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, background: 'rgba(255,255,255,0.82)' }}
                        />
                        <input
                            placeholder="Threads handle (optional)"
                            value={newIdeaForm.threadsHandle}
                            onChange={(event) => setNewIdeaForm((prev) => ({ ...prev, threadsHandle: event.target.value }))}
                            style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, background: 'rgba(255,255,255,0.82)' }}
                        />
                        <input
                            placeholder="Discord tag (optional)"
                            value={newIdeaForm.discordTag}
                            onChange={(event) => setNewIdeaForm((prev) => ({ ...prev, discordTag: event.target.value }))}
                            style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, background: 'rgba(255,255,255,0.82)' }}
                        />
                        <button
                            type="submit"
                            disabled={isSubmittingIdea || !vaultUnlocked}
                            className="btn"
                            style={{ borderRadius: 12, border: '1px solid rgba(239,68,68,0.55)', background: 'rgba(239,68,68,0.92)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '8px 11px', width: 'fit-content' }}
                        >
                            {isSubmittingIdea ? 'Submitting...' : 'Submit New Full Idea'}
                        </button>
                    </form>
                )}
                {newIdeaNotice && <div style={{ marginTop: 8, fontSize: 11, color: newIdeaNotice.toLowerCase().includes('failed') ? '#b91c1c' : '#065f46' }}>{newIdeaNotice}</div>}
            </section>

            <section style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(8px)', padding: '10px 12px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Showcase Manager</div>
                    <button
                        type="button"
                        className="btn"
                        onClick={() => setPublicPage?.('showcase')}
                        style={{ borderRadius: 12, border: '1px solid rgba(15,23,42,0.24)', background: 'rgba(255,255,255,0.82)', color: '#0f172a', fontSize: 11, fontWeight: 600, padding: '6px 10px' }}
                    >
                        Open Showcase
                    </button>
                </div>
                <form onSubmit={saveShowcase} style={{ display: 'grid', gap: 8 }}>
                    <select
                        value={showcaseEntryId}
                        onChange={(event) => setShowcaseEntryId(event.target.value)}
                        style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, background: 'rgba(255,255,255,0.82)' }}
                    >
                        {myProjects.length === 0 ? (
                            <option value="">No project yet</option>
                        ) : myProjects.map((item, idx) => (
                            <option key={item.id} value={item.id}>
                                {`${idx + 1}. ${item.project_name || 'Untitled Project'} - ${new Date(item.created_at).toLocaleDateString()}`}
                            </option>
                        ))}
                    </select>
                    <input
                        placeholder="Public project title"
                        value={showcaseForm.project_name}
                        onChange={(event) => setShowcaseForm((prev) => ({ ...prev, project_name: event.target.value }))}
                        style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, background: 'rgba(255,255,255,0.82)' }}
                    />
                    <textarea
                        placeholder="Public summary"
                        value={showcaseForm.one_liner}
                        onChange={(event) => setShowcaseForm((prev) => ({ ...prev, one_liner: event.target.value }))}
                        rows={3}
                        style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, resize: 'vertical', background: 'rgba(255,255,255,0.82)' }}
                    />
                    <input
                        placeholder="Public URL"
                        value={showcaseForm.submission_url}
                        onChange={(event) => setShowcaseForm((prev) => ({ ...prev, submission_url: event.target.value }))}
                        style={{ borderRadius: 10, border: '1px solid rgba(51,65,85,0.35)', padding: '9px 10px', fontSize: 12, background: 'rgba(255,255,255,0.82)' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', minHeight: 72, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                            {showcaseImageUrl ? (
                                <img src={showcaseImageUrl} alt="Showcase cover" style={{ width: '100%', height: 94, objectFit: 'cover' }} />
                            ) : (
                                <div style={{ fontSize: 11, color: '#64748b' }}>No showcase cover image</div>
                            )}
                        </div>
                        <label style={{ border: '1px solid rgba(51,65,85,0.35)', borderRadius: 10, background: 'rgba(255,255,255,0.9)', color: '#0f172a', padding: '8px 10px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer' }}>
                            <ImagePlus size={13} />
                            {isUploadingShowcaseImage ? 'Uploading...' : 'Upload Cover'}
                            <input type="file" accept="image/*" onChange={handleShowcaseImageUpload} style={{ display: 'none' }} disabled={isUploadingShowcaseImage || !vaultUnlocked} />
                        </label>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            disabled={!vaultUnlocked}
                            onClick={() => setShowcaseForm((prev) => ({ ...prev, status: 'Draft' }))}
                            style={{
                                borderRadius: 12,
                                border: showcaseForm.status === 'Draft' ? '1px solid rgba(15,23,42,0.35)' : '1px solid rgba(148,163,184,0.5)',
                                background: showcaseForm.status === 'Draft' ? 'rgba(148,163,184,0.18)' : 'rgba(255,255,255,0.82)',
                                color: '#0f172a',
                                fontSize: 11,
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '7px 10px'
                            }}
                        >
                            <EyeOff size={13} />
                            Draft
                        </button>
                        <button
                            type="button"
                            disabled={!vaultUnlocked}
                            onClick={() => setShowcaseForm((prev) => ({ ...prev, status: 'Published' }))}
                            style={{
                                borderRadius: 12,
                                border: showcaseForm.status === 'Published' ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(148,163,184,0.5)',
                                background: showcaseForm.status === 'Published' ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.82)',
                                color: '#0f172a',
                                fontSize: 11,
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '7px 10px'
                            }}
                        >
                            <Eye size={13} />
                            Publish
                        </button>
                        <button
                            type="submit"
                            disabled={isSavingShowcase || !showcaseEntryId || !vaultUnlocked}
                            className="btn"
                            style={{ marginLeft: 'auto', borderRadius: 12, border: '1px solid rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.92)', color: '#fff', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 10px' }}
                        >
                            <Save size={13} />
                            {isSavingShowcase ? 'Saving...' : `Save ${showcaseForm.status}`}
                        </button>
                    </div>
                    {showcaseNotice && <div style={{ fontSize: 11, color: showcaseNotice.toLowerCase().includes('failed') ? '#b91c1c' : '#065f46' }}>{showcaseNotice}</div>}
                </form>
            </section>

            <div style={{ display: 'grid', gap: 10, maxHeight: isMobileView ? 'calc(var(--app-vh, 100vh) - clamp(410px, 55vh, 530px))' : 420, overflowY: 'auto', paddingRight: 2 }}>
                {myProjects.length === 0 && (
                    <div style={{ fontSize: 12, opacity: 0.7, padding: '12px 10px', borderRadius: 12, border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.72)' }}>
                        No projects yet. Submit your first project above.
                    </div>
                )}
                {myProjects.map((project) => (
                    <div key={project.id} style={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(8px)', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, wordBreak: 'break-word' }}>{project.project_name || 'Untitled Project'}</div>
                                <div style={{ fontSize: 11, opacity: 0.62, marginTop: 2 }}>{new Date(project.created_at).toLocaleString()}</div>
                                <div style={{ marginTop: 3, fontSize: 10, fontWeight: 600, color: project.status === 'Published' ? '#be123c' : '#475569' }}>
                                    {project.status === 'Published' ? 'Published' : 'Draft'}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn"
                                disabled={!vaultUnlocked}
                                onClick={() => startEdit(project)}
                                style={{ borderRadius: 12, border: '1px solid rgba(15,23,42,0.24)', background: 'rgba(255,255,255,0.82)', color: '#0f172a', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', whiteSpace: 'nowrap' }}
                            >
                                <Pencil size={12} />
                                Edit
                            </button>
                        </div>
                        {project.one_liner && (
                            <p style={{ fontSize: 12, opacity: 0.84, margin: '8px 0 0', lineHeight: 1.35 }}>{project.one_liner}</p>
                        )}
                        {project.submission_url && (
                            <a href={project.submission_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}>
                                {project.submission_url}
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );

    if (isMobileView) {
        return (
            <MobileFeatureShell title="Builder Vault" subtitle="Manage your projects" onNavigate={setPublicPage}>
                {content}
            </MobileFeatureShell>
        );
    }

    return (
        <section style={{ padding: '26px 20px 34px' }}>
            <div className="container">
                <div
                    style={{
                        borderRadius: 18,
                        border: '1px solid rgba(148,163,184,0.38)',
                        background: 'rgba(255,255,255,0.78)',
                        backdropFilter: 'blur(10px)',
                        padding: 16
                    }}
                >
                    {content}
                </div>
            </div>
        </section>
    );
}
