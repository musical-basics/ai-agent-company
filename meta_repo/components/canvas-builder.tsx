'use client';
/**
 * SWARM FORGE — Canvas Builder
 * The main React Flow DAG workspace.
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type Connection,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useSwarmStore } from '@/lib/store';
import { NODE_TYPES } from './canvas-nodes';
import type { CanvasNode, CanvasEdge, PaletteItem, SwarmNodeData } from '@/lib/types';
import { generateNodeId } from '@/lib/utils';

// ─── Fit View After Rehydration ───────────────────────────────────────────────
// Zustand persist rehydrates AFTER React Flow mounts, so fitView runs on an
// empty canvas the first time. This component detects the first time nodes
// appear and calls fitView() to bring them into view.

function FitViewOnLoad({ nodeCount }: { nodeCount: number }) {
  const { fitView } = useReactFlow();
  const hasFit = useRef(false);

  useEffect(() => {
    if (nodeCount > 0 && !hasFit.current) {
      hasFit.current = true;
      // Slight delay to let React Flow render the nodes before fitting
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
    }
  }, [nodeCount, fitView]);

  return null;
}

// ─── Edge style factory ────────────────────────────────────────────────────────

function buildEdgeStyle(hasSLA: boolean) {
  return hasSLA
    ? {
        stroke: '#6366f1',
        strokeWidth: 2,
        strokeDasharray: undefined,
      }
    : {
        stroke: '#2d3f60',
        strokeWidth: 1.5,
        strokeDasharray: '6 4',
      };
}

// ─── Canvas Builder ────────────────────────────────────────────────────────────

export default function CanvasBuilder() {
  const {
    nodes, edges, setNodes, setEdges,
    selectNode, selectEdge, closeInspector,
    openSLAModal, addEdge: storeAddEdge, updateEdgeData,
    addNode,
  } = useSwarmStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Convert store nodes to React Flow nodes
  const rfNodes: Node[] = nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data as unknown as Record<string, unknown>,
    selected: n.selected,
  }));

  // Convert store edges to React Flow edges
  const rfEdges: Edge[] = edges.map((e) => {
    const hasSLA = !!(e.data?.requiredArtifactKeys?.length);
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      data: e.data as unknown as Record<string, unknown>,
      label: e.data?.description ? e.data.description.slice(0, 30) : undefined,
      labelStyle: { fontSize: 9, fill: '#4a6080' },
      labelBgStyle: { fill: '#080b14', fillOpacity: 0.8 },
      type: 'smoothstep',
      animated: hasSLA,
      style: buildEdgeStyle(hasSLA),
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: hasSLA ? '#6366f1' : '#2d3f60',
        width: 14,
        height: 14,
      },
    };
  });

  // ── Node changes (move, resize, select) ────────────────────────────────────
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const updated = applyNodeChanges(changes, rfNodes) as Node[];
      setNodes(
        updated.map((n) => ({
          id: n.id,
          type: n.type as CanvasNode['type'],
          position: n.position,
          data: n.data as unknown as SwarmNodeData,
          selected: n.selected,
        }))
      );
    },
    [rfNodes, setNodes]
  );

  // ── Edge changes (delete) ─────────────────────────────────────────────────
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const updated = applyEdgeChanges(changes, rfEdges) as Edge[];
      setEdges(
        updated.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          data: e.data as CanvasEdge['data'],
        }))
      );
    },
    [rfEdges, setEdges]
  );

  // ── Connect (draw edge) → open SLA modal ──────────────────────────────────
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const edgeId = `e_${connection.source}_${connection.target}_${Date.now()}`;
      const newEdge: CanvasEdge = {
        id: edgeId,
        source: connection.source,
        target: connection.target,
      };
      storeAddEdge(newEdge);
      // Open SLA modal so Chairman can define the handshake
      openSLAModal(connection.source, connection.target, edgeId);
    },
    [storeAddEdge, openSLAModal]
  );

  // ── Click node → open inspector ────────────────────────────────────────────
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // ── Click edge → open inspector ────────────────────────────────────────────
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      selectEdge(edge.id);
    },
    [selectEdge]
  );

  // ── Double-click edge → open SLA editor ────────────────────────────────────
  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      openSLAModal(edge.source, edge.target, edge.id);
    },
    [openSLAModal]
  );

  // ── Click background → close inspector ────────────────────────────────────
  const onPaneClick = useCallback(() => {
    closeInspector();
  }, [closeInspector]);

  // ── Drag-and-drop from palette ─────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData('application/swarm-node');
      if (!raw) return;

      let item: PaletteItem;
      try {
        item = JSON.parse(raw);
      } catch {
        return;
      }

      // Calculate drop position relative to the canvas
      const wrapper = reactFlowWrapper.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      // Account for React Flow viewport transform via the store's viewport
      const x = e.clientX - rect.left - 100;
      const y = e.clientY - rect.top - 50;

      const nodeId = generateNodeId(item.kind);
      const newNode: CanvasNode = {
        id: nodeId,
        type: item.kind,
        position: { x, y },
        data: { ...item.defaultData } as SwarmNodeData,
      };
      addNode(newNode);
      selectNode(nodeId);
    },
    [addNode, selectNode]
  );

  return (
    <ReactFlowProvider>
    <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={NODE_TYPES}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--bg-base)', width: '100%', height: '100%' }}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        minZoom={0.2}
        maxZoom={2}
      >
        {/* Re-fit after Zustand persist rehydration (nodes arrive after mount) */}
        <FitViewOnLoad nodeCount={nodes.length} />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e2a40"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const colorMap: Record<string, string> = {
              worker: '#6366f1',
              manager: '#8b5cf6',
              ceo: '#f43f5e',
              tool: '#06b6d4',
              adapter: '#f59e0b',
            };
            return colorMap[node.type || 'worker'] || '#4a6080';
          }}
          maskColor="rgba(8,11,20,0.7)"
          style={{ borderRadius: 8 }}
        />
      </ReactFlow>

      {/* Empty state hint */}
      {nodes.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            textAlign: 'center', maxWidth: 380,
            background: 'rgba(13,17,32,0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px dashed #1e2a40',
            borderRadius: 16, padding: '32px 40px',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12, filter: 'grayscale(0.3)' }}>🏛️</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e8eef8', margin: '0 0 10px' }}>
              Begin Architecting Your Empire
            </h3>
            <p style={{ fontSize: 11, color: '#4a6080', lineHeight: 1.7, margin: 0 }}>
              Drag agents, managers, and tools from the <strong style={{ color: '#8fa4c0' }}>Asset Palette</strong> on the left.
              Connect them with edges to define <strong style={{ color: '#8fa4c0' }}>SLA handshakes</strong>.
              Then click <strong style={{ color: '#10b981' }}>Instantiate Company</strong> to compile your swarm.
            </p>
          </div>
        </div>
      )}
    </div>
    </ReactFlowProvider>
  );
}
