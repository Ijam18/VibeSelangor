import React from 'react';
import { Check, Mail, ExternalLink, Gamepad2 } from 'lucide-react';
import ThreadsIcon from '../ThreadsIcon';
import { SPRINT_MODULE_STEPS } from '../../constants';
import { formatWhatsAppLink } from '../../utils';
import WhatsAppIcon from '../WhatsAppIcon';


export default function BuilderDetailModal({
    isOpen,
    onClose,
    builder,
    submissions,
    currentUser,
    isMobileView,
    onVisitStudio
}) {
    if (!isOpen || !builder) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
            <div className="neo-card" style={{ width: '100%', maxWidth: '720px', border: '3px solid black', boxShadow: '16px 16px 0px black', background: 'white', position: 'relative', padding: '24px 28px' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '16px', border: '2px solid black', background: 'white', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '900', fontSize: '20px', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                    ×
                </button>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '16px', border: '3px solid black', background: 'var(--selangor-red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '900', boxShadow: '4px 4px 0px black' }}>
                        {builder.full_name[0]}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '36px', letterSpacing: '-1.5px', marginBottom: '8px' }}>{builder.full_name}</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className="pill pill-teal" style={{ padding: '4px 12px', fontSize: '10px' }}>{builder.role.toUpperCase()}</span>
                            <span className="pill" style={{ border: '2px solid black', padding: '4px 12px', fontSize: '10px' }}>{builder.district.toUpperCase()}</span>
                            {builder.threads_handle && (
                                <a
                                    href={`https://threads.net/@${builder.threads_handle.replace(/^@/, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'black', fontSize: '13px', fontWeight: '900', marginLeft: '4px', borderBottom: '2px solid var(--selangor-red)' }}
                                >
                                    <ThreadsIcon size={16} /> @{builder.threads_handle.replace(/^@/, '')}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="scroll-box" style={{ maxHeight: '68vh', paddingRight: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : '1.5fr 1fr', gap: '32px' }}>
                        <div>
                            <div style={{ marginBottom: '32px' }}>
                                <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', borderBottom: '2px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>Idea & Vision</h4>
                                <div style={{ fontWeight: '900', fontSize: '24px', marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-0.5px' }}>{builder.idea_title || 'Untitled Innovation'}</div>
                                <div style={{ background: '#fcfcfc', borderLeft: '4px solid var(--selangor-red)', padding: '16px 20px', borderRadius: '4px', border: '1px solid #eee' }}>
                                    <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#333', fontWeight: '500' }}>
                                        {builder.problem_statement || 'No problem statement defined yet.'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', borderBottom: '2px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>About the Builder</h4>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#444' }}>
                                    {builder.about_yourself || 'No background info provided.'}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', borderBottom: '2px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>Connect</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {builder.threads_handle && (
                                        <a href={`https://threads.net/@${builder.threads_handle.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '14px', fontSize: '13px', textTransform: 'none', justifyContent: 'flex-start', gap: '12px', width: '100%', borderRadius: '12px' }}>
                                            <ThreadsIcon size={22} /> Threads Profile
                                        </a>
                                    )}
                                    {onVisitStudio && (
                                        <button
                                            onClick={() => { onClose(); onVisitStudio(builder); }}
                                            className="btn btn-red"
                                            style={{ padding: '14px', fontSize: '13px', textTransform: 'none', justifyContent: 'flex-start', gap: '12px', width: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center' }}
                                        >
                                            <Gamepad2 size={22} /> Visit Studio 🎮
                                        </button>
                                    )}
                                    {(currentUser?.type === 'admin' || currentUser?.type === 'owner') && builder.whatsapp_contact && (
                                        <a href={formatWhatsAppLink(builder.whatsapp_contact)} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '14px', fontSize: '13px', textTransform: 'none', justifyContent: 'flex-start', gap: '12px', width: '100%', borderRadius: '12px', borderColor: '#25D366' }}>
                                            <WhatsAppIcon size={22} /> WhatsApp (Admin)
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', borderBottom: '2px solid #eee', paddingBottom: '6px', marginBottom: '16px' }}>Project Evolution</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', position: 'relative' }}>
                                    {/* Vertical Journey Line */}
                                    {submissions.filter(s => s.user_id === builder.id).length > 0 && (
                                        <div style={{ position: 'absolute', left: '21px', top: '24px', bottom: '24px', width: '2px', background: 'black', zIndex: 0 }}></div>
                                    )}
                                    {/* Day 0 Marker */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', background: '#f0fff4', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
                                        <div style={{ color: '#22c55e', display: 'flex', alignItems: 'center' }}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <div style={{ fontSize: '11px', fontWeight: '800' }}>Day 0: Registration Completed</div>
                                    </div>

                                    {submissions.filter(s => s.user_id === builder.id).length === 0 ? (
                                        <div style={{ border: '2px dashed #eee', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
                                            Waiting for first conceptual milestone...
                                        </div>
                                    ) : (
                                        submissions.filter(s => s.user_id === builder.id).map((s, i) => (
                                            <div key={i} style={{ padding: '12px', border: '2px solid black', borderRadius: '10px', background: '#fff', boxShadow: '4px 4px 0px black', marginBottom: '16px', marginLeft: '32px', position: 'relative', zIndex: 1 }}>
                                                {/* Milestone Dot */}
                                                <div style={{ position: 'absolute', left: '-11px', top: '16px', width: '10px', height: '10px', background: 'white', border: '2px solid black', borderRadius: '50%', transform: 'translateX(-50%)' }}></div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontWeight: '900', fontSize: '10px', color: 'var(--selangor-red)', textTransform: 'uppercase' }}>
                                                        {SPRINT_MODULE_STEPS[submissions.filter(x => x.user_id === builder.id).length - 1 - i]?.split(':')[1]?.trim() || 'Ship Log'}
                                                    </span>
                                                    <span style={{ fontSize: '10px', opacity: 0.5 }}>{new Date(s.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: '800', lineHeight: '1.4', marginBottom: '6px' }}>{s.one_liner}</div>
                                                {s.submission_url && (
                                                    <a href={s.submission_url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '900' }}>
                                                        <ExternalLink size={12} /> PROOF OF SHIP
                                                    </a>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
