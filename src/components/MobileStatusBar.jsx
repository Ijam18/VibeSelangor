import React from 'react';
import { Signal, Wifi } from 'lucide-react';

export default function MobileStatusBar({
    timeLabel,
    batteryPct = '--%',
    centerContent = null,
    topOffset = 0,
    marginBottom = 6,
    style = {}
}) {
    return (
        <div style={{ position: 'relative', height: 42, marginTop: topOffset, marginBottom, ...style }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', fontWeight: 400, fontSize: 12, color: '#f8fafc', textShadow: '0 1px 2px rgba(0,0,0,0.32)', height: '100%' }}>
                <span style={{ fontWeight: 400 }}>{timeLabel}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Signal size={14} />
                    <Wifi size={14} />
                    <span style={{ fontSize: 11, fontWeight: 500 }}>{batteryPct}</span>
                </div>
            </div>
            {centerContent}
        </div>
    );
}

