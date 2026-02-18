import React, { useState } from 'react';
import { SPRINT_MODULE_STEPS } from '../constants';
import { truncateText } from '../utils';
import { ExternalLink, Calendar, MapPin } from 'lucide-react';

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
            display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s'
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px black'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0px black'; }}
        >
            {/* Preview Image */}
            <div style={{ height: '160px', overflow: 'hidden', borderBottom: '2px solid black', position: 'relative', background: '#f3f4f6', flexShrink: 0 }}>
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
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: '900', fontSize: '13px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {profile?.full_name || 'Anonymous Builder'}
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
                        fontSize: '12px', lineHeight: 1.55, color: '#444',
                        background: '#f9f9f9', borderRadius: '6px',
                        padding: '8px 10px', border: '1px solid #e5e7eb'
                    }}>
                        {truncateText(s.one_liner || s.description, 80)}
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

const ProgressWall = ({ submissions, profiles }) => {
    // Deduplicate: keep only the LATEST submission per builder
    const latestByUser = Object.values(
        submissions
            .filter(s => s.status !== 'rejected')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .reduce((acc, s) => {
                if (!acc[s.user_id]) acc[s.user_id] = s;
                return acc;
            }, {})
    ).slice(0, 12);

    const recentSubmissions = latestByUser;

    if (recentSubmissions.length === 0) return null;

    return (
        <section id="progress-wall" style={{ padding: '60px 0', borderTop: '3px solid black', background: 'linear-gradient(180deg, #f9f9f9 0%, #fff 100%)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="pill pill-red" style={{ marginBottom: '12px' }}>LIVE UPDATES</div>
                    <h2 style={{ fontSize: 'clamp(32px, 5vw, 42px)' }}>Progress Wall</h2>
                    <p className="text-sub" style={{ maxWidth: '500px', margin: '8px auto 0' }}>
                        Real-time shipping dari komuniti builder Selangor.
                    </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {recentSubmissions.map((s) => {
                        const profile = profiles.find(p => p.id === s.user_id);
                        const userSubmissionCount = submissions.filter(x => x.user_id === s.user_id).length;
                        return (
                            <ProjectCard
                                key={s.id}
                                s={s}
                                profile={profile}
                                userSubmissionCount={userSubmissionCount}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ProgressWall;
