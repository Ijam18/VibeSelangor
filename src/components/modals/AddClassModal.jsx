import React from 'react';

export default function AddClassModal({
    isOpen,
    onClose,
    newClass,
    setNewClass,
    handleAdminAddClass
}) {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div className="neo-card" style={{ width: '100%', maxWidth: '450px', border: '3px solid black', boxShadow: '12px 12px 0px black', background: 'white', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '24px', fontWeight: '900' }}>×</button>
                <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>Schedule 2-Hour Class</h3>
                <form onSubmit={handleAdminAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '900' }}>CLASS TITLE</label>
                        <input
                            className="builder-upload-input" placeholder="e.g., Module 3: Prototyping" required value={newClass.title}
                            onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                            style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '900' }}>DATE</label>
                        <input type="date" required value={newClass.date} onChange={(e) => setNewClass({ ...newClass, date: e.target.value })} style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', width: '100%' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '900' }}>START TIME</label>
                            <input
                                type="time" required value={newClass.startTime}
                                onChange={(e) => {
                                    const start = e.target.value;
                                    const [hours, mins] = start.split(':').map(Number);
                                    let endHours = (hours + 2) % 24;
                                    const end = `${String(endHours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
                                    setNewClass({ ...newClass, startTime: start, endTime: end });
                                }}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '900' }}>END TIME</label>
                            <input
                                type="time" required value={newClass.endTime}
                                onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                                style={{ padding: '14px', border: '2px solid black', borderRadius: '8px', width: '100%' }}
                            />
                        </div>
                    </div>

                    <button className="btn btn-red" type="submit" style={{ marginTop: '10px' }}>PUBLISH SCHEDULE</button>
                </form>
            </div>
        </div>
    );
}
