import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Laptop, Brain, Github, Cloud, Database, BarChart3, Globe, Smartphone } from 'lucide-react';

const BaseNode = ({ id, label, icon: Icon, color, children }) => (
    <div style={{
        background: color,
        border: '3px solid #0b1220',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '6px 6px 0px #0b1220',
        minWidth: '150px',
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

export const LaptopNode = ({ data, isConnectable }) => (
    <BaseNode id="laptop" label={data.label || 'Dev Machine'} icon={Laptop} color="#f8fafc">
        {/* Laptops can connect out to anything (AI, Browser, Github) */}
        <Handle type="source" position={Position.Right} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', right: '-8px', border: '2px solid white' }} />
        {/* And receive feedback */}
        <Handle type="target" position={Position.Left} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', left: '-8px', border: '2px solid white' }} />
    </BaseNode>
);

export const AiEngineNode = ({ data, isConnectable }) => (
    <BaseNode id="ai" label={data.label || 'AI Brain'} icon={Brain} color="#e2e8f0">
        <Handle type="target" position={Position.Left} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', left: '-8px', border: '2px solid white' }} />
        <Handle type="source" position={Position.Right} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', right: '-8px', border: '2px solid white' }} />
    </BaseNode>
);

export const BrowserNode = ({ data, isConnectable }) => (
    <BaseNode id="browser" label={data.label || 'Localhost UI'} icon={Globe} color="#c7d2fe">
        <Handle type="target" position={Position.Left} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', left: '-8px', border: '2px solid white' }} />
        <Handle type="source" position={Position.Right} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', right: '-8px', border: '2px solid white' }} />
    </BaseNode>
);

export const GithubNode = ({ data, isConnectable }) => (
    <BaseNode id="github" label={data.label || 'GitHub Repo'} icon={Github} color="#fef08a">
        <Handle type="target" position={Position.Left} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', left: '-8px', border: '2px solid white' }} />
        <Handle type="source" position={Position.Right} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', right: '-8px', border: '2px solid white' }} />
    </BaseNode>
);

export const VercelNode = ({ data, isConnectable }) => (
    <BaseNode id="vercel" label={data.label || 'Vercel Edge'} icon={Cloud} color="#86efac">
        <Handle type="target" position={Position.Left} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', left: '-8px', border: '2px solid white' }} />
        <Handle type="source" position={Position.Right} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', right: '-8px', border: '2px solid white' }} />
    </BaseNode>
);

export const DatabaseNode = ({ data, isConnectable }) => (
    <BaseNode id="supabase" label={data.label || 'Supabase Auth/DB'} icon={Database} color="#fca5a5">
        <Handle type="target" position={Position.Left} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', left: '-8px', border: '2px solid white' }} />
        <Handle type="source" position={Position.Right} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', right: '-8px', border: '2px solid white' }} />
    </BaseNode>
);

export const AnalyticsNode = ({ data, isConnectable }) => (
    <BaseNode id="analytics" label={data.label || 'Web Analytics'} icon={BarChart3} color="#fcd34d">
        <Handle type="target" position={Position.Left} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', left: '-8px', border: '2px solid white' }} />
        <Handle type="source" position={Position.Top} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', top: '-8px', border: '2px solid white' }} />
    </BaseNode>
);

export const PublicUserNode = ({ data, isConnectable }) => (
    <BaseNode id="public_user" label={data.label || 'Public Audience'} icon={Smartphone} color="#d8b4fe">
        <Handle type="target" position={Position.Left} id="in" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', left: '-8px', border: '2px solid white' }} />
        <Handle type="source" position={Position.Right} id="out" isConnectable={isConnectable} style={{ background: '#0b1220', width: '12px', height: '12px', right: '-8px', border: '2px solid white' }} />
    </BaseNode>
);
