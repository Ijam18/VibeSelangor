import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, FileText, MapPin, Search, Zap, Star, TrendingUp, Users, Medal, Globe, ChevronUp, ChevronDown } from 'lucide-react';

const LEVEL_LABELS = ['', 'Newbie', 'Junior', 'Builder', 'Senior', 'Expert', 'Pro', 'Legendary'];
const LEVEL_COLORS = ['', '#6b7280', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#CE1126'];

const RankBadge = ({ rank }) => {
    const colors = { 1: '#f5d000', 2: '#9ca3af', 3: '#cd7c3a' };
    if (rank <= 3) return (
        <Medal size={20} color={colors[rank]} fill={colors[rank]} style={{ filter: 'drop-shadow(1px 1px 0 rgba(0,0,0,0.3))' }} />
    );
    return <span style={{ fontWeight: '900', fontSize: '14px', color: '#6b7280', minWidth: '24px', textAlign: 'center' }}>#{rank}</span>;
};

const StatCard = ({ icon, label, value, color, isMobileView }) => (
    <div className="neo-card no-jitter" style={{
        padding: isMobileView ? '8px 4px' : '12px 14px',
        textAlign: 'center',
        border: '2px solid black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%'
    }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobileView ? '2px' : '4px', color: color || '#111' }}>
            {React.cloneElement(icon, { size: isMobileView ? 16 : 20 })}
        </div>
        <div style={{ fontSize: isMobileView ? '14px' : '20px', fontWeight: '900', color: color || '#111', lineHeight: 1 }}>{value}</div>
        <div style={{
            fontSize: isMobileView ? '7px' : '10px',
            fontWeight: '800',
            opacity: 0.55,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }}>{label}</div>
    </div>
);

// Compact card row for mobile builder list
const BuilderCard = ({ item, index, isTop3, searchTerm, districtFilter }) => {
    const lvColor = LEVEL_COLORS[item.level] || '#6b7280';
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderBottom: '1.5px solid #f0f0f0',
            background: isTop3 ? '#fffdf2' : index % 2 === 0 ? 'white' : '#fafafa',
        }}>
            {/* Rank */}
            <div style={{ width: '28px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                <RankBadge rank={index + 1} />
            </div>
            {/* Avatar */}
            <div style={{
                width: '36px', height: '36px', flexShrink: 0,
                borderRadius: '10px', border: '2px solid black',
                background: isTop3 ? 'var(--selangor-red)' : '#e5e7eb',
                color: isTop3 ? 'white' : '#111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '900', fontSize: '15px',
            }}>
                {(item.name || 'A')[0].toUpperCase()}
            </div>
            {/* Name + district */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '900', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', opacity: 0.55, marginTop: '1px' }}>
                    <MapPin size={9} /> {item.district}
                </div>
            </div>
            {/* Level badge */}
            <div style={{
                fontSize: '9px', fontWeight: '800',
                color: lvColor, background: `${lvColor}18`,
                padding: '2px 6px', borderRadius: '5px', border: `1px solid ${lvColor}44`,
                whiteSpace: 'nowrap', flexShrink: 0,
            }}>
                Lv{item.level}
            </div>
            {/* Score */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: '900', fontSize: '15px', color: isTop3 ? 'var(--selangor-red)' : '#111' }}>
                    {Math.floor(item.score).toLocaleString()}
                </div>
                <div style={{ fontSize: '9px', opacity: 0.4, fontWeight: '700' }}>pts</div>
            </div>
        </div>
    );
};

export default function BuilderLeaderboard({ isMobileView }) {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('score');
    const [districtFilter, setDistrictFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchLeaderboardData();
    }, []);

    const fetchLeaderboardData = async () => {
        setLoading(true);
        try {
            const [{ data: profiles }, { data: gameStats }, { data: submissions }] = await Promise.all([
                supabase.from('profiles').select('id, full_name, district, role'),
                supabase.from('builder_game').select('user_id, total_vibes_earned, level, xp'),
                supabase.from('builder_progress').select('user_id, created_at')
            ]);

            const aggregated = (profiles || [])
                .filter(p => p.role !== 'owner') // Exclude owner from builder rankings
                .map(profile => {
                    const stats = (gameStats || []).find(g => g.user_id === profile.id) || { total_vibes_earned: 0, level: 1, xp: 0 };
                    const projectCount = (submissions || []).filter(s => s.user_id === profile.id).length;
                    const compositeScore = (stats.total_vibes_earned || 0) + (projectCount * 500);
                    return {
                        id: profile.id,
                        name: profile.full_name || 'Anonymous',
                        district: profile.district || '—',
                        role: profile.role,
                        vibes: stats.total_vibes_earned || 0,
                        level: stats.level || 1,
                        xp: stats.xp || 0,
                        projects: projectCount,
                        score: compositeScore
                    };
                }).sort((a, b) => b.score - a.score);

            setLeaderboardData(aggregated);
        } catch (error) {
            console.error('Leaderboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const districts = [...new Set(leaderboardData.map(d => d.district).filter(d => d && d !== '—'))].sort();

    const filteredData = leaderboardData
        .filter(item => {
            const matchSearch = (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.district?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchDistrict = !districtFilter || item.district === districtFilter;
            return matchSearch && matchDistrict;
        })
        .sort((a, b) => {
            if (sortBy === 'score') return b.score - a.score;
            if (sortBy === 'vibes') return b.vibes - a.vibes;
            if (sortBy === 'projects') return b.projects - a.projects;
            if (sortBy === 'level') return b.level - a.level;
            return 0;
        });

    const topThree = filteredData.slice(0, 3);
    const totalVibes = leaderboardData.reduce((s, d) => s + d.vibes, 0);
    const totalLogs = leaderboardData.reduce((s, d) => s + d.projects, 0);
    const activeBuilders = leaderboardData.filter(d => d.projects > 0).length;
    const nonActiveBuilders = leaderboardData.filter(d => d.projects === 0 && d.vibes > 0).length;
    const waitingBuilders = leaderboardData.filter(d => d.projects === 0 && d.vibes === 0).length;

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
                <div className="showcase-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
                <div style={{ fontWeight: '900', letterSpacing: '0.1em', animation: 'pulse 1.5s infinite' }}>CALCULATING VIBES...</div>
            </div>
        );
    }

    return (
        <section style={{ padding: isMobileView ? '20px 0 100px' : '60px 0 120px' }}>
            <div className="container" style={{ padding: isMobileView ? '0 12px' : undefined }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: isMobileView ? '20px' : '40px' }}>
                    <div className="pill pill-red" style={{ marginBottom: '10px' }}>LEADERBOARD</div>
                    <h2 className="text-huge" style={{ marginBottom: '8px', fontSize: isMobileView ? '28px' : undefined }}>Top Selangor Builders</h2>
                    {!isMobileView && (
                        <p style={{ maxWidth: '560px', margin: '0 auto', opacity: 0.7, fontSize: '15px' }}>
                            Ranking based on sprint velocity, community engagement, and total Vibes earned.
                        </p>
                    )}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: isMobileView ? '6px' : '12px',
                    marginBottom: isMobileView ? '12px' : '16px'
                }}>
                    <StatCard icon={<Users />} label="Registered" value={leaderboardData.length} isMobileView={isMobileView} />
                    <StatCard icon={<Zap />} label="Total Vibes" value={totalVibes.toLocaleString()} color="#CE1126" isMobileView={isMobileView} />
                    <StatCard icon={<FileText />} label="Submitted" value={totalLogs} color="#059669" isMobileView={isMobileView} />
                    <StatCard icon={<Globe />} label="Districts" value={districts.length} color="#3b82f6" isMobileView={isMobileView} />
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: isMobileView ? '6px' : '10px',
                    marginBottom: isMobileView ? '16px' : '32px'
                }}>
                    <div className="neo-card no-jitter" style={{ padding: isMobileView ? '8px 6px' : '12px 14px', border: '2px solid #22c55e', background: '#f0fff4', textAlign: 'center' }}>
                        <div style={{ fontSize: isMobileView ? '18px' : '20px', fontWeight: '900', color: '#16a34a' }}>{activeBuilders}</div>
                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Projects</div>
                        {!isMobileView && <div style={{ fontSize: '9px', opacity: 0.55, marginTop: '2px' }}>Has submitted logs</div>}
                    </div>
                    <div className="neo-card no-jitter" style={{ padding: isMobileView ? '8px 6px' : '12px 14px', border: '2px solid #f59e0b', background: '#fffbeb', textAlign: 'center' }}>
                        <div style={{ fontSize: isMobileView ? '18px' : '20px', fontWeight: '900', color: '#d97706' }}>{nonActiveBuilders}</div>
                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Early Vibe</div>
                        {!isMobileView && <div style={{ fontSize: '9px', opacity: 0.55, marginTop: '2px' }}>Has vibes, but no logs</div>}
                    </div>
                    <div className="neo-card no-jitter" style={{ padding: isMobileView ? '8px 6px' : '12px 14px', border: '2px solid #6b7280', background: '#f9fafb', textAlign: 'center' }}>
                        <div style={{ fontSize: isMobileView ? '18px' : '20px', fontWeight: '900', color: '#6b7280' }}>{waitingBuilders}</div>
                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Idea Phase</div>
                        {!isMobileView && <div style={{ fontSize: '9px', opacity: 0.55, marginTop: '2px' }}>Registered / no logs</div>}
                    </div>
                </div>

                {/* Search & Filter Controls */}
                {isMobileView ? (
                    <div style={{ marginBottom: '16px' }}>
                        {/* Search bar always visible */}
                        <div style={{ position: 'relative', marginBottom: '8px' }}>
                            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input
                                type="text"
                                placeholder="Cari builder atau daerah..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '10px 10px 10px 36px', border: '2px solid black', borderRadius: '8px', fontSize: '13px', fontWeight: '700', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        {/* Filter toggle */}
                        <button
                            onClick={() => setShowFilters(f => !f)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '2px solid black', borderRadius: '8px', padding: '7px 14px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                        >
                            Filter & Sort {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {showFilters && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <select
                                    value={districtFilter}
                                    onChange={e => setDistrictFilter(e.target.value)}
                                    style={{ flex: 1, padding: '9px 10px', border: '2px solid black', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', background: 'white', fontSize: '12px' }}
                                >
                                    <option value="">Semua Daerah</option>
                                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    style={{ flex: 1, padding: '9px 10px', border: '2px solid black', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', background: 'white', fontSize: '12px' }}
                                >
                                    <option value="score">Score</option>
                                    <option value="vibes">Vibes</option>
                                    <option value="projects">Logs</option>
                                    <option value="level">Level</option>
                                </select>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="neo-card no-jitter" style={{ marginBottom: '40px', padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', border: '2px solid black' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input
                                type="text"
                                placeholder="Cari builder atau daerah..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '10px 10px 10px 38px', border: '2px solid black', borderRadius: '8px', fontSize: '14px', fontWeight: '700', outline: 'none' }}
                            />
                        </div>
                        <select
                            value={districtFilter}
                            onChange={e => setDistrictFilter(e.target.value)}
                            style={{ padding: '10px 14px', border: '2px solid black', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', background: 'white', fontSize: '13px' }}
                        >
                            <option value="">Semua Daerah</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            style={{ padding: '10px 14px', border: '2px solid black', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', background: 'white', fontSize: '13px' }}
                        >
                            <option value="score">Overall Score</option>
                            <option value="vibes">Total Vibes</option>
                            <option value="projects">Sprint Logs</option>
                            <option value="level">Builder Level</option>
                        </select>
                    </div>
                )}

                {/* Podium — horizontal 2-1-3 on mobile, flex row on desktop */}
                {!searchTerm && !districtFilter && topThree.length >= 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        gap: isMobileView ? '6px' : '16px',
                        marginBottom: isMobileView ? '16px' : '60px',
                        padding: isMobileView ? '0 4px' : '0'
                    }}>
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <div style={{ order: 1, textAlign: 'center', flex: 1, maxWidth: isMobileView ? '90px' : '200px' }}>
                                <Medal size={isMobileView ? 24 : 32} color="#9ca3af" style={{ marginBottom: isMobileView ? '2px' : '8px', filter: 'drop-shadow(2px 2px 0 black)' }} />
                                <div style={{ marginBottom: isMobileView ? '4px' : '12px', display: 'inline-block', position: 'relative' }}>
                                    <div style={{
                                        width: isMobileView ? '50px' : '72px',
                                        height: isMobileView ? '50px' : '72px',
                                        borderRadius: isMobileView ? '12px' : '18px',
                                        border: '2px solid black',
                                        background: '#e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: isMobileView ? '18px' : '28px',
                                        fontWeight: '900',
                                        boxShadow: '2px 2px 0 black',
                                        margin: '0 auto'
                                    }}>{topThree[1].name[0]}</div>
                                    <div style={{
                                        position: 'absolute', bottom: '-4px', right: '-4px',
                                        background: '#e5e7eb', border: '1.5px solid black', borderRadius: '50%',
                                        width: isMobileView ? '18px' : '26px', height: isMobileView ? '18px' : '26px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: '900', fontSize: isMobileView ? '9px' : '13px'
                                    }}>2</div>
                                </div>
                                <div style={{ fontWeight: '900', fontSize: isMobileView ? '10px' : '15px', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topThree[1].name}</div>
                                <div style={{ fontSize: isMobileView ? '8px' : '11px', opacity: 0.55, marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}><MapPin size={isMobileView ? 7 : 10} />{topThree[1].district}</div>
                                <div className="neo-card no-jitter" style={{ height: isMobileView ? '40px' : '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2px', border: '2px solid black' }}>
                                    <div style={{ fontSize: isMobileView ? '13px' : '20px', fontWeight: '900' }}>{Math.floor(topThree[1].score).toLocaleString()}</div>
                                    <div style={{ fontSize: '7px', fontWeight: '900', opacity: 0.5, textTransform: 'uppercase' }}>pts</div>
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <div style={{
                                order: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                flex: 1,
                                maxWidth: isMobileView ? '110px' : '220px',
                                transform: isMobileView ? 'translateY(-6px)' : 'translateY(-24px)'
                            }}>
                                <Trophy size={isMobileView ? 28 : 40} color="#f5d000" style={{ display: 'block', marginBottom: isMobileView ? '2px' : '10px', filter: 'drop-shadow(2px 2px 0 black)' }} />
                                <div style={{ marginBottom: isMobileView ? '4px' : '12px', display: 'inline-block', position: 'relative' }}>
                                    <div style={{
                                        width: isMobileView ? '64px' : '90px',
                                        height: isMobileView ? '64px' : '90px',
                                        borderRadius: isMobileView ? '14px' : '22px',
                                        border: '3.5px solid black',
                                        background: '#fef3c7',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: isMobileView ? '24px' : '36px',
                                        fontWeight: '900',
                                        boxShadow: '3px 3px 0 black',
                                        margin: '0 auto'
                                    }}>{topThree[0].name[0]}</div>
                                    <div style={{
                                        position: 'absolute', bottom: '-4px', right: '-4px',
                                        background: 'var(--selangor-red)', color: 'white', border: '2px solid black', borderRadius: '50%',
                                        width: isMobileView ? '22px' : '32px', height: isMobileView ? '22px' : '32px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: '900', fontSize: isMobileView ? '11px' : '16px'
                                    }}>1</div>
                                </div>
                                <div style={{ fontWeight: '900', fontSize: isMobileView ? '12px' : '18px', width: '100%', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topThree[0].name}</div>
                                <div style={{ fontSize: isMobileView ? '9px' : '12px', fontWeight: '800', color: 'var(--selangor-red)', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}><MapPin size={isMobileView ? 8 : 11} />{topThree[0].district}</div>
                                <div className="neo-card no-jitter" style={{ width: '100%', height: isMobileView ? '54px' : '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4px', border: '2px solid black', boxShadow: isMobileView ? '3px 3px 0 black' : '8px 8px 0 black' }}>
                                    <div style={{ fontSize: isMobileView ? '16px' : '28px', fontWeight: '900', color: 'var(--selangor-red)' }}>{Math.floor(topThree[0].score).toLocaleString()}</div>
                                    <div style={{ fontSize: '8px', fontWeight: '900', opacity: 0.5, textTransform: 'uppercase' }}>total pts</div>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <div style={{ order: 3, textAlign: 'center', flex: 1, maxWidth: isMobileView ? '90px' : '200px' }}>
                                <Medal size={isMobileView ? 24 : 32} color="#cd7c3a" style={{ marginBottom: isMobileView ? '2px' : '8px', filter: 'drop-shadow(2px 2px 0 black)' }} />
                                <div style={{ marginBottom: isMobileView ? '4px' : '12px', display: 'inline-block', position: 'relative' }}>
                                    <div style={{
                                        width: isMobileView ? '50px' : '72px',
                                        height: isMobileView ? '50px' : '72px',
                                        borderRadius: isMobileView ? '12px' : '18px',
                                        border: '2px solid black',
                                        background: '#fed7aa',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: isMobileView ? '18px' : '28px',
                                        fontWeight: '900',
                                        boxShadow: '2px 2px 0 black',
                                        margin: '0 auto'
                                    }}>{topThree[2].name[0]}</div>
                                    <div style={{
                                        position: 'absolute', bottom: '-4px', right: '-4px',
                                        background: '#fed7aa', border: '1.5px solid black', borderRadius: '50%',
                                        width: isMobileView ? '18px' : '26px', height: isMobileView ? '18px' : '26px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: '900', fontSize: isMobileView ? '10px' : '13px'
                                    }}>3</div>
                                </div>
                                <div style={{ fontWeight: '900', fontSize: isMobileView ? '10px' : '15px', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topThree[2].name}</div>
                                <div style={{ fontSize: isMobileView ? '8px' : '11px', opacity: 0.55, marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}><MapPin size={isMobileView ? 7 : 10} />{topThree[2].district}</div>
                                <div className="neo-card no-jitter" style={{ height: isMobileView ? '40px' : '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2px', border: '2px solid black' }}>
                                    <div style={{ fontSize: isMobileView ? '13px' : '18px', fontWeight: '900' }}>{Math.floor(topThree[2].score).toLocaleString()}</div>
                                    <div style={{ fontSize: '7px', fontWeight: '900', opacity: 0.5, textTransform: 'uppercase' }}>pts</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Builder List — scrollable card list on mobile, table on desktop */}
                <div className="neo-card no-jitter" style={{ overflow: 'hidden', border: '2px solid black', background: 'white' }}>
                    {isMobileView ? (
                        /* Mobile: Compact card list */
                        <div>
                            {filteredData.map((item, index) => (
                                <BuilderCard
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    isTop3={index < 3 && !searchTerm && !districtFilter}
                                    searchTerm={searchTerm}
                                    districtFilter={districtFilter}
                                />
                            ))}
                            {filteredData.length === 0 && (
                                <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.5 }}>
                                    Tiada builder dijumpai...
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Desktop: Full table */
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f8fafc', borderBottom: '2px solid black' }}>
                                    <tr>
                                        <th style={{ padding: '16px 20px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rank</th>
                                        <th style={{ padding: '16px 20px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Builder</th>
                                        <th style={{ padding: '16px 20px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daerah</th>
                                        <th style={{ padding: '16px 20px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</th>
                                        <th style={{ padding: '16px 20px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logs</th>
                                        <th style={{ padding: '16px 20px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vibes</th>
                                        <th style={{ padding: '16px 20px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => {
                                        const isTop3 = index < 3 && !searchTerm && !districtFilter;
                                        const lvColor = LEVEL_COLORS[item.level] || '#6b7280';
                                        return (
                                            <tr key={item.id} style={{ borderBottom: '1.5px solid #f0f0f0', background: isTop3 ? '#fffef0' : 'none' }}>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <RankBadge rank={index + 1} />
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', border: '2.5px solid black', background: isTop3 ? 'var(--selangor-red)' : '#eee', color: isTop3 ? 'white' : 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px' }}>
                                                            {(item.name || 'A')[0].toUpperCase()}
                                                        </div>
                                                        <div style={{ fontWeight: '900', fontSize: '15px' }}>{item.name}</div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 20px', fontSize: '14px', opacity: 0.7 }}>{item.district}</td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: '800', background: `${lvColor}15`, color: lvColor, padding: '4px 10px', borderRadius: '6px', border: `1.5px solid ${lvColor}40` }}>
                                                        Lv{item.level} {LEVEL_LABELS[item.level]}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 20px', fontWeight: '800', fontSize: '14px' }}>{item.projects}</td>
                                                <td style={{ padding: '16px 20px', fontWeight: '800', fontSize: '14px' }}>{item.vibes.toLocaleString()}</td>
                                                <td style={{ padding: '16px 20px', fontWeight: '900', fontSize: '18px', textAlign: 'right', color: isTop3 ? 'var(--selangor-red)' : 'black' }}>
                                                    {Math.floor(item.score).toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredData.length === 0 && (
                                <div style={{ padding: '80px 20px', textAlign: 'center', opacity: 0.5 }}>
                                    No builders found matching your criteria.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

