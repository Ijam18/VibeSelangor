import React from 'react';
import { X } from 'lucide-react';

export default function AddClassModal({
    isOpen,
    onClose,
    newClass,
    setNewClass,
    handleAdminAddClass,
    isMobileView
}) {
    if (!isOpen) return null;

    const computeProgramWindow = (monthValue, weekValue) => {
        if (!monthValue) return null;
        const [yearRaw, monthRaw] = monthValue.split('-');
        const year = Number(yearRaw);
        const monthIndex = Number(monthRaw) - 1;
        const week = Math.min(5, Math.max(1, Number(weekValue) || 1));
        if (!year || monthIndex < 0 || monthIndex > 11) return null;

        const firstDay = new Date(year, monthIndex, 1);
        const firstSundayOffset = (7 - firstDay.getDay()) % 7;
        let startDate = new Date(year, monthIndex, 1 + firstSundayOffset + (week - 1) * 7);

        if (startDate.getMonth() !== monthIndex) {
            const lastDay = new Date(year, monthIndex + 1, 0);
            startDate = new Date(year, monthIndex, lastDay.getDate() - lastDay.getDay());
        }

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        return { startDate, endDate };
    };

    const programWindow = computeProgramWindow(newClass.month, newClass.weekOfMonth);

    const shellStyle = isMobileView
        ? {
            width: '100%',
            maxWidth: '420px',
            border: '1px solid rgba(148,163,184,0.45)',
            boxShadow: '0 20px 48px rgba(15,23,42,0.28)',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.94)',
            position: 'relative',
            backdropFilter: 'blur(18px)'
        }
        : {
            width: '100%',
            maxWidth: '450px',
            border: '3px solid black',
            boxShadow: '12px 12px 0px black',
            background: 'white',
            position: 'relative'
        };

    const inputStyle = isMobileView
        ? { padding: '12px', border: '1px solid rgba(148,163,184,0.45)', borderRadius: '12px', width: '100%', background: '#fff' }
        : { padding: '14px', border: '2px solid black', borderRadius: '8px', width: '100%' };

    const labelStyle = isMobileView
        ? { fontSize: '11px', fontWeight: 600, color: '#334155' }
        : { fontSize: '12px', fontWeight: '900' };

    return (
        <div style={{ position: 'fixed', inset: 0, background: isMobileView ? 'rgba(15,23,42,0.52)' : 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div className="neo-card" style={shellStyle}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        border: isMobileView ? '1px solid rgba(148,163,184,0.45)' : '2px solid black',
                        background: isMobileView ? 'rgba(241,245,249,0.95)' : 'white',
                        cursor: 'pointer',
                        borderRadius: isMobileView ? '999px' : 8,
                        width: 28,
                        height: 28,
                        display: 'grid',
                        placeItems: 'center'
                    }}
                >
                    <X size={14} />
                </button>
                <h3 style={{ fontSize: isMobileView ? '20px' : '24px', marginBottom: '18px', color: '#0f172a', fontWeight: isMobileView ? 700 : 900 }}>
                    Start Program
                </h3>
                <form onSubmit={handleAdminAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>PROGRAM TITLE</label>
                        <input
                            className="builder-upload-input"
                            placeholder="e.g., VibeSelangor Feb Program"
                            value={newClass.title}
                            onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>PROGRAM MONTH</label>
                        <input
                            type="month"
                            required
                            value={newClass.month || ''}
                            onChange={(e) => setNewClass({ ...newClass, month: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={labelStyle}>START WEEK (SUNDAY)</label>
                        <select
                            value={newClass.weekOfMonth || '1'}
                            onChange={(e) => setNewClass({ ...newClass, weekOfMonth: e.target.value })}
                            style={inputStyle}
                        >
                            <option value="1">Week 1</option>
                            <option value="2">Week 2</option>
                            <option value="3">Week 3</option>
                            <option value="4">Week 4</option>
                            <option value="5">Week 5 (if available)</option>
                        </select>
                    </div>

                    <div style={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.45)', background: 'rgba(248,250,252,0.88)', padding: '10px 12px', fontSize: 12, color: '#334155', lineHeight: 1.4 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Program Rule</div>
                        <div>Each program runs 1 week: starts on Sunday and ends on the next Sunday.</div>
                        {programWindow && (
                            <div style={{ marginTop: 6, fontWeight: 600, color: '#0f172a' }}>
                                Scheduled window: {programWindow.startDate.toLocaleDateString()} - {programWindow.endDate.toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    <button
                        className="btn btn-red"
                        type="submit"
                        style={isMobileView ? { marginTop: '4px', borderRadius: 14, border: '1px solid rgba(239,68,68,0.55)', background: 'rgba(239,68,68,0.92)', color: '#fff', boxShadow: '0 6px 14px rgba(239,68,68,0.25)', fontSize: 12, fontWeight: 600, padding: '10px 12px' } : { marginTop: '10px' }}
                    >
                        START PROGRAM
                    </button>
                </form>
            </div>
        </div>
    );
}
