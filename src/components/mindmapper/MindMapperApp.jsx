import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { PanelLeft } from 'lucide-react';
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

const FlowCanvas = ({ compact = false, quickAddType = null, onQuickAddConsumed = null }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition } = useReactFlow();
    const wrapperRef = useRef(null);

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

    useEffect(() => {
        if (!quickAddType || !wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        const position = screenToFlowPosition({
            x: rect.left + rect.width * 0.5,
            y: rect.top + rect.height * 0.45,
        });
        const labels = {
            core_problem: 'WHAT IS THE PROBLEM?',
            core_feature: 'HOW TO SOLVE IT?',
            frontend: 'UI COMPONENT',
            backend: 'SERVER LOGIC',
            database: 'DATA SCHEMA'
        };
        const newNode = {
            id: `${quickAddType}-${Date.now()}`,
            type: quickAddType,
            position,
            data: { label: labels[quickAddType] || quickAddType.toUpperCase() },
        };
        setNodes((nds) => nds.concat(newNode));
        onQuickAddConsumed?.();
    }, [quickAddType, onQuickAddConsumed, screenToFlowPosition, setNodes]);

    return (
        <div ref={wrapperRef} style={{ flex: 1, position: 'relative', background: '#f8fafc' }}>
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
                <Controls style={{ border: '2px solid black', borderRadius: '4px', boxShadow: compact ? '2px 2px 0px black' : '4px 4px 0px black', background: 'white', transform: compact ? 'scale(0.86)' : 'scale(1)', transformOrigin: 'top left' }} />
                <Background color="#cbd5e1" variant="dots" gap={20} size={2} />
            </ReactFlow>
            <div style={{ position: 'absolute', top: compact ? 10 : 20, left: compact ? 10 : 20, zIndex: 10 }}>
                <div style={{ background: '#f5d000', color: '#0b1220', padding: compact ? '7px 10px' : '12px 24px', borderRadius: '8px', fontWeight: 900, fontFamily: 'monospace', border: '3px solid #0b1220', boxShadow: compact ? '2px 2px 0 #0b1220' : '4px 4px 0 #0b1220', fontSize: compact ? 9 : 12, maxWidth: compact ? '74vw' : 'none' }}>
                    1. IDENTIFY PROBLEM {'->'} 2. BRANCH TO FEATURES {'->'} 3. DECONSTRUCT TECH STACK
                </div>
            </div>
        </div>
    );
};

export default function MindMapperApp() {
    const [isCompact, setIsCompact] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 900 : false));
    const [panelOpen, setPanelOpen] = useState(() => !(typeof window !== 'undefined' ? window.innerWidth <= 900 : false));
    const [quickAddType, setQuickAddType] = useState(null);

    useEffect(() => {
        const onResize = () => {
            const compact = window.innerWidth <= 900;
            setIsCompact(compact);
            if (!compact) setPanelOpen(true);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
            {!isCompact && <MindMapperSidebar onQuickAdd={setQuickAddType} />}
            {isCompact && panelOpen && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 25 }}>
                    <MindMapperSidebar compact onClose={() => setPanelOpen(false)} onQuickAdd={setQuickAddType} />
                </div>
            )}
            {isCompact && !panelOpen && (
                <button
                    type="button"
                    onClick={() => setPanelOpen(true)}
                    style={{
                        position: 'absolute',
                        left: 10,
                        top: 10,
                        zIndex: 26,
                        border: '2px solid #0b1220',
                        borderRadius: 10,
                        background: '#f5d000',
                        color: '#0b1220',
                        width: 34,
                        height: 34,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <PanelLeft size={16} />
                </button>
            )}
            <ReactFlowProvider>
                <FlowCanvas compact={isCompact} quickAddType={quickAddType} onQuickAddConsumed={() => setQuickAddType(null)} />
            </ReactFlowProvider>
        </div>
    );
}
