import React from 'react';
import { Laptop, Brain, Github, Cloud, Database, BarChart3, Globe, Smartphone } from 'lucide-react';

const NODE_TYPES = [
    { type: 'laptop', label: 'Dev Machine', icon: Laptop, color: '#f8fafc' },
    { type: 'ai', label: 'AI Brain', icon: Brain, color: '#e2e8f0' },
    { type: 'browser', label: 'Localhost UI', icon: Globe, color: '#c7d2fe' },
    { type: 'github', label: 'GitHub Repo', icon: Github, color: '#fef08a' },
    { type: 'vercel', label: 'Vercel Edge', icon: Cloud, color: '#86efac' },
    { type: 'supabase', label: 'Supabase Auth/DB', icon: Database, color: '#fca5a5' },
    { type: 'analytics', label: 'Web Analytics', icon: BarChart3, color: '#fcd34d' },
    { type: 'public_user', label: 'Public Audience', icon: Smartphone, color: '#d8b4fe' },
];

export default function SimulatorSidebar() {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside style={{
            width: '260px',
            background: '#0b1220',
            borderRight: '4px solid #f5d000',
            padding: '24px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto'
        }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#f5d000', fontFamily: 'monospace', margin: 0 }}>
                [ DEVICES_&_SERVERS ]
            </h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                Drag these nodes onto the canvas to construct your architecture. Connect them to simulate data flow.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {NODE_TYPES.map((node) => {
                    const Icon = node.icon;
                    return (
                        <div
                            key={node.type}
                            onDragStart={(event) => onDragStart(event, node.type)}
                            draggable
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: '#1e293b',
                                border: `2px solid ${node.color}`,
                                borderRadius: '8px',
                                padding: '12px',
                                cursor: 'grab',
                                color: node.color,
                                fontWeight: 800,
                                fontSize: '13px',
                                fontFamily: 'monospace',
                                transition: 'all 0.2s',
                                boxShadow: `4px 4px 0px ${node.color}`
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = `6px 6px 0px ${node.color}` }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translate(0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${node.color}` }}
                        >
                            <Icon size={18} strokeWidth={2.5} />
                            {node.label}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
