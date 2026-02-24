export function getLiveProgramMeta(classes = []) {
    const now = new Date();
    const rows = (classes || [])
        .map((row) => {
            const start = row?.date ? new Date(`${row.date}T00:00:00`) : null;
            if (!start || Number.isNaN(start.getTime())) return null;
            const end = new Date(start);
            const type = String(row?.type || '').toLowerCase();
            const status = String(row?.status || '').toLowerCase();
            if (type === 'program') {
                end.setDate(end.getDate() + 7);
            } else {
                end.setHours(23, 59, 59, 999);
            }
            return {
                row,
                start,
                end,
                status,
                type
            };
        })
        .filter(Boolean);

    if (!rows.length) return null;

    const active = rows.find((item) => item.status === 'active' || item.status === 'live')
        || rows.find((item) => (
            now >= item.start
            && now <= item.end
            && item.status !== 'ended'
            && item.status !== 'completed'
            && item.status !== 'cancelled'
        ));

    if (!active) return null;

    const windowText = active.type === 'program'
        ? `${active.start.toLocaleDateString()} -> ${active.end.toLocaleDateString()}`
        : (active.row?.time || active.start.toLocaleString());

    return {
        title: active.row?.title || 'VibeSelangor Program',
        windowText,
        row: active.row
    };
}
