import React from 'react';
import { Lightbulb, Layers, Layout, ServerCog, Database } from 'lucide-react';

const NODE_TYPES = [
    { type: 'core_problem', label: 'Core Problem', icon: Lightbulb, color: '#fca5a5' },
    { type: 'core_feature', label: 'MVP Feature', icon: Layers, color: '#fef08a' },
    { type: 'frontend', label: 'UI / Frontend', icon: Layout, color: '#bfdbfe' },
    { type: 'backend', label: 'Logic / Backend', icon: ServerCog, color: '#bbf7d0' },
    { type: 'database', label: 'Data / Storage', icon: Database, color: '#e9d5ff' },
];

export default function MindMapperSidebar() {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside style={{
            width: '280px',
            background: '#0b1220',
            borderRight: '4px solid #f5d000',
            padding: '24px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto'
        }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#f5d000', fontFamily: 'monospace', margin: 0, textTransform: 'uppercase' }}>
                [ MVP_COMPONENTS ]
            </h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                Drag these concepts onto the canvas. Map your biggest problem into 1-3 core features. Deconstruct each feature into its tech stack.
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
