import React, { useCallback, useState } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MindMapperSidebar from './MindMapperSidebar';
import { CoreProblemNode, CoreFeatureNode, FrontendNode, BackendNode, DatabaseNode } from './MindMapperNodes';

const nodeTypes = {
    core_problem: CoreProblemNode,
    core_feature: CoreFeatureNode,
    frontend: FrontendNode,
    backend: BackendNode,
    database: DatabaseNode,
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

            const labels = {
                core_problem: 'WHAT IS THE PROBLEM?',
                core_feature: 'HOW TO SOLVE IT?',
                frontend: 'UI COMPONENT',
                backend: 'SERVER LOGIC',
                database: 'DATA SCHEMA'
            };

            const newNode = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { label: labels[type] || type.toUpperCase() },
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
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                <div style={{ background: '#f5d000', color: '#0b1220', padding: '12px 24px', borderRadius: '8px', fontWeight: 900, fontFamily: 'monospace', border: '3px solid #0b1220', boxShadow: '4px 4px 0 #0b1220' }}>
                    1. IDENTIFY PROBLEM → 2. BRANCH TO FEATURES → 3. DECONSTRUCT TECH STACK
                </div>
            </div>
        </div>
    );
};

export default function MindMapperApp() {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex' }}>
            <MindMapperSidebar />
            <ReactFlowProvider>
                <FlowCanvas />
            </ReactFlowProvider>
        </div>
    );
}
