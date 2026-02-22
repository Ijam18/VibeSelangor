import React, { useState, useCallback, useRef } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SimulatorSidebar from './SimulatorSidebar';
import { LaptopNode, AiEngineNode, BrowserNode, GithubNode, VercelNode, DatabaseNode, AnalyticsNode, PublicUserNode } from './SimulatorNodes';

const nodeTypes = {
    laptop: LaptopNode,
    ai: AiEngineNode,
    browser: BrowserNode,
    github: GithubNode,
    vercel: VercelNode,
    supabase: DatabaseNode,
    analytics: AnalyticsNode,
    public_user: PublicUserNode,
};

const initialNodes = [];
const initialEdges = [];

const FlowCanvas = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition } = useReactFlow();

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { strokeWidth: 3, stroke: '#f5d000' } }, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { label: type.toUpperCase() },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );

    return (
        <div style={{ flex: 1, position: 'relative', background: '#f8fafc' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
            >
                <Controls style={{ border: '2px solid black', borderRadius: '4px', boxShadow: '4px 4px 0px black', background: 'white' }} />
                <Background color="#cbd5e1" variant="dots" gap={20} size={2} />
            </ReactFlow>
        </div>
    );
};

export default function VibeSimulator({ currentLessonId }) {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex' }}>
            <SimulatorSidebar />
            <ReactFlowProvider>
                <FlowCanvas />
            </ReactFlowProvider>
        </div>
    );
}
