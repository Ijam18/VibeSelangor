import React, { useState, useMemo } from 'react';
import { Calendar, LogOut, Download, Check, ExternalLink } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import ThreadsIcon from '../components/ThreadsIcon';
import { SPRINT_MODULE_STEPS } from '../constants';
import { truncateText, downloadCSV, formatWhatsAppLink } from '../utils';

export default function AdminDashboard({
    profiles,
    classes,
    attendance,
    submissions,
    handleToggleClassStatus,
    handleToggleAttendance,
    setIsAddClassModalOpen,
    fetchData,
    handleSignOut,
    setSelectedDetailProfile,
    isProfilesLoading,
    profilesError
}) {
    const [adminTab, setAdminTab] = useState('overview');
    const [adminSearch, setAdminSearch] = useState('');
    const [adminFilter, setAdminFilter] = useState('all'); // all, with_idea, no_idea

    // Filter Logic moved here
    const filteredProfiles = useMemo(() => {
        let list = profiles;
        if (adminSearch) {
            const s = adminSearch.toLowerCase();
            list = list.filter(p =>
                p.full_name?.toLowerCase().includes(s) ||
                p.district?.toLowerCase().includes(s) ||
                p.idea_title?.toLowerCase().includes(s)
            );
        }
        if (adminFilter === 'with_idea') list = list.filter(p => p.idea_title);
        if (adminFilter === 'no_idea') list = list.filter(p => !p.idea_title);

        return list;
    }, [profiles, adminSearch, adminFilter]);

    const profilesByIdea = useMemo(() => {
        const groups = {};
        filteredProfiles.forEach(p => {
            if (p.idea_title) {
                if (!groups[p.idea_title]) groups[p.idea_title] = [];
                groups[p.idea_title].push(p);
            }
        });
        return groups;
    }, [filteredProfiles]);


    const handleExportCSV = () => {
        if (!classes.length || !filteredProfiles.length) return;
        const headers = ['Builder Name', 'District', 'Role', ...classes.map(c => c.title)];
        const rows = filteredProfiles.map(p => {
            const row = [p.full_name, p.district, p.role || 'builder'];
            classes.forEach(c => {
                const isPresent = attendance.some(a => a.profile_id === p.id && a.class_id === c.id && a.status === 'Present');
                row.push(isPresent ? 'Present' : 'Absent');
            });
            return row;
        });
        downloadCSV([headers, ...rows], `vibe_selangor_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <div className="container" style={{ padding: '40px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', marginBottom: '4px' }}>Admin Portal</h2>
                    <p className="text-sub" style={{ fontSize: '13px' }}>Manage cohorts, set class schedules, and review builder progress.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-red" style={{ padding: '8px', borderRadius: '10px', width: '36px', height: '36px' }} onClick={() => setIsAddClassModalOpen(true)} title="Schedule Class">
                        <Calendar size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '12px' }} onClick={fetchData}>Refresh</button>
                    <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '12px' }} onClick={handleSignOut}><LogOut size={14} /> Logout</button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '2px solid #eee' }}>
                <button onClick={() => setAdminTab('overview')} style={{ padding: '12px 12px', border: 'none', background: 'none', borderBottom: adminTab === 'overview' ? '4px solid var(--selangor-red)' : '4px solid transparent', fontWeight: '900', fontSize: '13px', cursor: 'pointer', color: adminTab === 'overview' ? 'black' : '#888', transition: 'all 0.2s' }}>OVERVIEW</button>
                <button onClick={() => setAdminTab('attendance')} style={{ padding: '12px 12px', border: 'none', background: 'none', borderBottom: adminTab === 'attendance' ? '4px solid var(--selangor-red)' : '4px solid transparent', fontWeight: '900', fontSize: '13px', cursor: 'pointer', color: adminTab === 'attendance' ? 'black' : '#888', transition: 'all 0.2s' }}>ATTENDANCE & CSV</button>
            </div>

            {adminTab === 'overview' ? (
                <div className="grid-12">
                    <div style={{ gridColumn: 'span 12', marginBottom: '16px' }}>
                        <div className="neo-card" style={{ border: '3px solid black', boxShadow: '4px 4px 0px black', padding: '12px 16px' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Active Schedule</h3>
                            <div className="scroll-box" style={{ maxHeight: '160px' }}>
                                {classes.length === 0 ? (
                                    <p style={{ opacity: 0.5, fontSize: '13px' }}>No classes scheduled yet.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                                        {classes.map(c => (
                                            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', padding: '12px', border: '2px solid black', borderRadius: '8px', background: c.status === 'Active' ? '#fff5f5' : '#f9f9f9', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ fontSize: '13px', fontWeight: '900' }}>{c.title}</div>
                                                        <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>{new Date(c.date).toLocaleDateString()} • {c.time}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleClassStatus(c.id, c.status)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            fontSize: '9px',
                                                            borderRadius: '6px',
                                                            border: '1.5px solid black',
                                                            background: c.status === 'Active' ? '#CE1126' : '#fff',
                                                            color: c.status === 'Active' ? 'white' : 'black',
                                                            fontWeight: '900',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {c.status === 'Active' ? 'END SESSION' : 'START CLASS'}
                                                    </button>
                                                </div>
                                                {c.status === 'Active' && (
                                                    <div className="pill pill-red" style={{ fontSize: '8px', padding: '2px 6px', width: 'fit-content' }}>LIVE NOW</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div style={{ gridColumn: 'span 7' }}>
                        <div className="neo-card" style={{ border: '3px solid black', boxShadow: '6px 6px 0px black', padding: '16px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Builder Progress ({filteredProfiles.length})</h3>
                            <div className="scroll-box" style={{ maxHeight: '550px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid black', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                            <th style={{ padding: '12px', fontSize: '12px' }}>BUILDER</th>
                                            <th style={{ padding: '12px', fontSize: '12px' }}>LATEST PROJECT / IDEA</th>
                                            <th style={{ padding: '12px', fontSize: '12px' }}>SPRINT STEP</th>
                                            <th style={{ padding: '12px', fontSize: '12px' }}>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProfiles.map(p => {
                                            const builderSubmissions = submissions.filter(s => s.user_id === p.id);
                                            const latest = builderSubmissions[0];
                                            const stepIndex = builderSubmissions.length > 0 ? (builderSubmissions.length > SPRINT_MODULE_STEPS.length ? SPRINT_MODULE_STEPS.length : builderSubmissions.length) : 0;

                                            const today = new Date().toLocaleDateString();
                                            const isCheckedIn = builderSubmissions.some(s => new Date(s.created_at).toLocaleDateString() === today);

                                            return (
                                                <tr
                                                    key={p.id}
                                                    onClick={() => setSelectedDetailProfile(p)}
                                                    style={{ borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                >
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ fontWeight: '800' }}>{p.full_name}</div>
                                                        <div style={{ fontSize: '11px', opacity: 0.6 }}>{p.district || '-'}</div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ fontWeight: '700', fontSize: '13px' }}>{latest?.project_name || p.idea_title || '-'}</div>
                                                        <div style={{ fontSize: '11px', fontStyle: 'normal', maxWidth: '280px', opacity: 0.8, color: '#444' }}>
                                                            {truncateText(latest?.one_liner || p.problem_statement, 80)}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ fontSize: '12px', fontWeight: '950', color: 'var(--selangor-red)', textTransform: 'uppercase' }}>
                                                            {stepIndex === 0 ? 'Waitlist' : SPRINT_MODULE_STEPS[stepIndex - 1]?.split(':')[1]?.trim() || 'Pending'}
                                                        </div>
                                                        <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: '700' }}>DAY {stepIndex} / 7</div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        {isCheckedIn ?
                                                            <span className="pill pill-teal" style={{ fontSize: '9px', fontWeight: '950' }}>✓ CHECKED IN</span> :
                                                            <span className="pill" style={{ opacity: 0.4, fontSize: '9px' }}>PENDING</span>
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 5' }}>
                        <div className="neo-card" style={{ border: '3px solid black', boxShadow: '6px 6px 0px black', padding: '16px', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '18px' }}>Builders ({profiles.length})</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        className="builder-upload-input"
                                        placeholder="Search..."
                                        value={adminSearch}
                                        onChange={(e) => setAdminSearch(e.target.value)}
                                        style={{ padding: '6px 10px', border: '2px solid black', borderRadius: '8px', fontSize: '12px', width: '100px' }}
                                    />
                                    <select
                                        value={adminFilter}
                                        onChange={(e) => setAdminFilter(e.target.value)}
                                        style={{ padding: '6px 10px', border: '2px solid black', borderRadius: '8px', fontSize: '12px' }}
                                    >
                                        <option value="all">All</option>
                                        <option value="with_idea">With Idea</option>
                                        <option value="no_idea">No Idea</option>
                                    </select>
                                </div>
                            </div>

                            <div className="scroll-box" style={{ maxHeight: '550px' }}>
                                {isProfilesLoading ? (
                                    <p>Loading profiles...</p>
                                ) : profilesError ? (
                                    <div style={{ padding: '16px', border: '3px solid var(--selangor-red)', borderRadius: '12px', background: '#fff5f5' }}>
                                        <h4 style={{ color: 'var(--selangor-red)', marginBottom: '8px' }}>Debug: Fetch Error</h4>
                                        <p style={{ fontSize: '13px', fontWeight: 700 }}>{profilesError}</p>
                                    </div>
                                ) : Object.keys(profilesByIdea).length === 0 ? (
                                    <div style={{ padding: '16px', border: '2px dashed #ccc', borderRadius: '12px', textAlign: 'center' }}>
                                        <p style={{ fontWeight: 700 }}>No builders found.</p>
                                    </div>
                                ) : Object.entries(profilesByIdea).map(([idea, groupBuilders]) => (
                                    <div key={idea} style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '4px', borderBottom: '2px solid #eee' }}>
                                            <div style={{ padding: '2px 8px', background: 'black', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>IDEA</div>
                                            <h4 style={{ fontSize: '15px' }}>{idea}</h4>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {groupBuilders.map(p => {
                                                const builderSubmissions = submissions.filter(s => s.user_id === p.id);
                                                const latestStatus = builderSubmissions[0]?.status || 'No Submission';
                                                const stepIndex = builderSubmissions.length > 0 ? (builderSubmissions.length > SPRINT_MODULE_STEPS.length ? SPRINT_MODULE_STEPS.length : builderSubmissions.length) : 0;

                                                return (
                                                    <div key={p.id} style={{ border: '2px solid black', padding: '12px', borderRadius: '10px', background: 'white' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <h5 style={{ fontSize: '16px', margin: 0 }}>{p.full_name}</h5>
                                                                    {p.created_at && (
                                                                        <span style={{ fontSize: '10px', opacity: 0.5 }}>
                                                                            Joined: {new Date(p.created_at).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p style={{ fontSize: '12px', opacity: 0.6 }}>{p.district || 'No District'}</p>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <span className="pill" style={{ background: latestStatus === 'No Submission' ? '#eee' : 'var(--selangor-red)', color: latestStatus === 'No Submission' ? 'black' : 'white', border: 'none' }}>
                                                                    {stepIndex > 0 ? (SPRINT_MODULE_STEPS[stepIndex - 1]?.split(':')[1]?.trim() || 'Ready to Start') : 'Ready to Start'}
                                                                </span>
                                                                <span className="pill pill-teal">{p.role}</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '800', marginBottom: '2px' }}>Contact:</div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                    {p.whatsapp_contact && (
                                                                        <a href={formatWhatsAppLink(p.whatsapp_contact)} target="_blank" rel="noreferrer" style={{ color: '#25D366', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <WhatsAppIcon size={16} /> {p.whatsapp_contact}
                                                                        </a>
                                                                    )}
                                                                    {p.threads_handle && <div style={{ opacity: 0.7 }}>Threads: @{p.threads_handle.replace('@', '')}</div>}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '800', marginBottom: '2px' }}>About Builder:</div>
                                                                <div style={{ fontSize: '12px', fontStyle: 'italic' }}>{truncateText(p.about_yourself, 80) || '-'}</div>
                                                            </div>
                                                        </div>

                                                        {/* Attendance Toggles for Classes */}
                                                        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                                                            <div style={{ fontSize: '11px', fontWeight: '800', marginBottom: '8px', opacity: 0.5 }}>MARK ATTENDANCE:</div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                {classes.slice(0, 3).map(c => {
                                                                    const isPresent = attendance.some(a => a.profile_id === p.id && a.class_id === c.id && a.status === 'Present');
                                                                    return (
                                                                        <button
                                                                            key={c.id}
                                                                            onClick={() => handleToggleAttendance(p.id, c.id)}
                                                                            style={{
                                                                                padding: '4px 8px',
                                                                                fontSize: '10px',
                                                                                borderRadius: '4px',
                                                                                border: '1.5px solid black',
                                                                                background: isPresent ? 'var(--selangor-red)' : 'white',
                                                                                color: isPresent ? 'white' : 'black',
                                                                                cursor: 'pointer',
                                                                                fontWeight: '800'
                                                                            }}
                                                                        >
                                                                            {c.title.split(' ')[0]} {isPresent ? '✓' : ''}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            ) : (
                <div className="neo-card" style={{ border: '3px solid black', boxShadow: '6px 6px 0px black', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '20px' }}>Attendance Matrix</h3>
                        <button className="btn btn-outline" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                    <div className="scroll-box" style={{ maxHeight: '600px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid black' }}>
                                    <th style={{ padding: '12px', fontSize: '12px', position: 'sticky', left: 0, background: 'white', zIndex: 2 }}>BUILDER</th>
                                    {classes.map(c => (
                                        <th key={c.id} style={{ padding: '12px', fontSize: '11px', whiteSpace: 'nowrap', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '120px' }}>
                                            {c.title} <br /> <span style={{ opacity: 0.5, fontSize: '9px' }}>{new Date(c.date).toLocaleDateString()}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProfiles.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', fontWeight: '800', fontSize: '13px', position: 'sticky', left: 0, background: 'white', borderRight: '1px solid #eee' }}>
                                            {p.full_name}
                                            <div style={{ fontSize: '10px', opacity: 0.5 }}>{p.district}</div>
                                        </td>
                                        {classes.map(c => {
                                            const isPresent = attendance.some(a => a.profile_id === p.id && a.class_id === c.id && a.status === 'Present');
                                            return (
                                                <td key={c.id} style={{ textAlign: 'center', padding: '8px', background: isPresent ? '#f0fff4' : 'transparent' }}>
                                                    {isPresent ? <span style={{ color: '#22c55e', fontWeight: '900' }}>✓</span> : <span style={{ opacity: 0.1 }}>•</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div >
    );
};
