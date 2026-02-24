import React from 'react';
import { Lightbulb, Layers, Layout, ServerCog, Database, X } from 'lucide-react';

const NODE_TYPES = [
    { type: 'core_problem', label: 'Core Problem', icon: Lightbulb, color: '#fca5a5' },
    { type: 'core_feature', label: 'MVP Feature', icon: Layers, color: '#fef08a' },
    { type: 'frontend', label: 'UI / Frontend', icon: Layout, color: '#bfdbfe' },
    { type: 'backend', label: 'Logic / Backend', icon: ServerCog, color: '#bbf7d0' },
    { type: 'database', label: 'Data / Storage', icon: Database, color: '#e9d5ff' },
];

export default function MindMapperSidebar({ compact = false, onClose = null, onQuickAdd = null }) {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside style={{
            width: compact ? 'min(76vw, 260px)' : '280px',
            background: '#0b1220',
            borderRight: '4px solid #f5d000',
            padding: compact ? '14px' : '24px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: compact ? '10px' : '16px',
            overflowY: 'auto'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <h3 style={{ fontSize: compact ? '13px' : '16px', fontWeight: 900, color: '#f5d000', fontFamily: 'monospace', margin: 0, textTransform: 'uppercase' }}>
                    [ MVP_COMPONENTS ]
                </h3>
                {compact && onClose && (
                    <button type="button" onClick={onClose} style={{ border: '1px solid rgba(245,208,0,0.4)', borderRadius: 8, background: 'rgba(245,208,0,0.12)', color: '#f8fafc', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} />
                    </button>
                )}
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                Drag these concepts onto the canvas. Map your biggest problem into 1-3 core features. Deconstruct each feature into its tech stack.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '8px' : '12px', marginTop: compact ? '6px' : '12px' }}>
                {NODE_TYPES.map((node) => {
                    const Icon = node.icon;
                    return (
                        <div
                            key={node.type}
                            onDragStart={(event) => onDragStart(event, node.type)}
                            onClick={() => onQuickAdd?.(node.type)}
                            draggable
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: compact ? '8px' : '12px',
                                background: '#1e293b',
                                border: `2px solid ${node.color}`,
                                borderRadius: '8px',
                                padding: compact ? '9px' : '12px',
                                cursor: 'grab',
                                color: node.color,
                                fontWeight: 800,
                                fontSize: compact ? '11px' : '13px',
                                fontFamily: 'monospace',
                                transition: 'all 0.2s',
                                boxShadow: compact ? `2px 2px 0px ${node.color}` : `4px 4px 0px ${node.color}`
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = `${compact ? 4 : 6}px ${compact ? 4 : 6}px 0px ${node.color}`; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translate(0)'; e.currentTarget.style.boxShadow = `${compact ? 2 : 4}px ${compact ? 2 : 4}px 0px ${node.color}`; }}
                        >
                            <Icon size={compact ? 14 : 18} strokeWidth={2.2} />
                            {node.label}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
