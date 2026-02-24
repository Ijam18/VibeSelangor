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

const handleBaseStyle = { background: '#0b1220', width: '12px', height: '12px', border: '2px solid white' };
const omniHandles = (isConnectable) => (
    <>
        <Handle type="target" position={Position.Top} id="in-top" isConnectable={isConnectable} style={{ ...handleBaseStyle, top: '-8px', left: '36%' }} />
        <Handle type="source" position={Position.Top} id="out-top" isConnectable={isConnectable} style={{ ...handleBaseStyle, top: '-8px', left: '64%' }} />
        <Handle type="target" position={Position.Right} id="in-right" isConnectable={isConnectable} style={{ ...handleBaseStyle, right: '-8px', top: '36%' }} />
        <Handle type="source" position={Position.Right} id="out-right" isConnectable={isConnectable} style={{ ...handleBaseStyle, right: '-8px', top: '64%' }} />
        <Handle type="target" position={Position.Bottom} id="in-bottom" isConnectable={isConnectable} style={{ ...handleBaseStyle, bottom: '-8px', left: '36%' }} />
        <Handle type="source" position={Position.Bottom} id="out-bottom" isConnectable={isConnectable} style={{ ...handleBaseStyle, bottom: '-8px', left: '64%' }} />
        <Handle type="target" position={Position.Left} id="in-left" isConnectable={isConnectable} style={{ ...handleBaseStyle, left: '-8px', top: '36%' }} />
        <Handle type="source" position={Position.Left} id="out-left" isConnectable={isConnectable} style={{ ...handleBaseStyle, left: '-8px', top: '64%' }} />
    </>
);

export const LaptopNode = ({ data, isConnectable }) => (
    <BaseNode id="laptop" label={data.label || 'Dev Machine'} icon={Laptop} color="#f8fafc">
        {omniHandles(isConnectable)}
    </BaseNode>
);

export const AiEngineNode = ({ data, isConnectable }) => (
    <BaseNode id="ai" label={data.label || 'AI Brain'} icon={Brain} color="#e2e8f0">
        {omniHandles(isConnectable)}
    </BaseNode>
);

export const BrowserNode = ({ data, isConnectable }) => (
    <BaseNode id="browser" label={data.label || 'Localhost UI'} icon={Globe} color="#c7d2fe">
        {omniHandles(isConnectable)}
    </BaseNode>
);

export const GithubNode = ({ data, isConnectable }) => (
    <BaseNode id="github" label={data.label || 'GitHub Repo'} icon={Github} color="#fef08a">
        {omniHandles(isConnectable)}
    </BaseNode>
);

export const VercelNode = ({ data, isConnectable }) => (
    <BaseNode id="vercel" label={data.label || 'Vercel Edge'} icon={Cloud} color="#86efac">
        {omniHandles(isConnectable)}
    </BaseNode>
);

export const DatabaseNode = ({ data, isConnectable }) => (
    <BaseNode id="supabase" label={data.label || 'Supabase Auth/DB'} icon={Database} color="#fca5a5">
        {omniHandles(isConnectable)}
    </BaseNode>
);

export const AnalyticsNode = ({ data, isConnectable }) => (
    <BaseNode id="analytics" label={data.label || 'Web Analytics'} icon={BarChart3} color="#fcd34d">
        {omniHandles(isConnectable)}
    </BaseNode>
);

export const PublicUserNode = ({ data, isConnectable }) => (
    <BaseNode id="public_user" label={data.label || 'Public Audience'} icon={Smartphone} color="#d8b4fe">
        {omniHandles(isConnectable)}
    </BaseNode>
);
