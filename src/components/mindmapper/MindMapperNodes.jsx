import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lightbulb, Layers, Layout, ServerCog, Database } from 'lucide-react';

const BaseNode = ({ id, label, icon: Icon, color, children }) => (
    <div style={{
        background: color,
        border: '3px solid #0b1220',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '6px 6px 0px #0b1220',
        minWidth: '160px',
        fontFamily: 'monospace',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        color: '#0b1220'
    }}>
        <div style={{
            background: '#fff',
            borderRadius: '50%',
            padding: '8px',
            border: '3px solid #0b1220',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 2px 0px #0b1220'
        }}>
            <Icon size={24} strokeWidth={2.5} color="#0b1220" />
        </div>
        <div style={{ fontWeight: 900, fontSize: '13px', textAlign: 'center', marginTop: '4px' }}>
            {label}
        </div>
        {children}
    </div>
);

export const CoreProblemNode = ({ data, isConnectable }) => (
    <BaseNode id="core_problem" label={data.label || 'CORE PROBLEM'} icon={Lightbulb} color="#fca5a5">
        <Handle type="source" position={Position.Bottom} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', bottom: '-8px', border: '2px solid white' }} />
    </BaseNode>
);

export const CoreFeatureNode = ({ data, isConnectable }) => (
    <BaseNode id="core_feature" label={data.label || 'MVP FEATURE'} icon={Layers} color="#fef08a">
        <Handle type="target" position={Position.Top} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', top: '-8px', border: '2px solid white' }} />
        <Handle type="source" position={Position.Bottom} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', bottom: '-8px', border: '2px solid white' }} />
    </BaseNode>
);

export const FrontendNode = ({ data, isConnectable }) => (
    <BaseNode id="frontend" label={data.label || 'UI / FRONTEND'} icon={Layout} color="#bfdbfe">
        <Handle type="target" position={Position.Top} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', top: '-8px', border: '2px solid white' }} />
        <Handle type="source" position={Position.Bottom} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', bottom: '-8px', border: '2px solid white' }} />
    </BaseNode>
);

export const BackendNode = ({ data, isConnectable }) => (
    <BaseNode id="backend" label={data.label || 'LOGIC / BACKEND'} icon={ServerCog} color="#bbf7d0">
        <Handle type="target" position={Position.Top} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', top: '-8px', border: '2px solid white' }} />
        <Handle type="source" position={Position.Bottom} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', bottom: '-8px', border: '2px solid white' }} />
    </BaseNode>
);

export const DatabaseNode = ({ data, isConnectable }) => (
    <BaseNode id="database" label={data.label || 'DATA / STORAGE'} icon={Database} color="#e9d5ff">
        <Handle type="target" position={Position.Top} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', top: '-8px', border: '2px solid white' }} />
    </BaseNode>
);
