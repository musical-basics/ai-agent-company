/**
 * SWARM FORGE — Global Zustand Store
 * Manages canvas state, selected node, deployment status, and blueprint library.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CanvasNode,
  CanvasEdge,
  SwarmNodeData,
  SLAEdgeData,
  ArchitectureBlueprint,
  ModelOption,
} from './types';
import { DEFAULT_MODELS } from './registry';
import { PRESET_BLUEPRINTS } from './preset-blueprints';

// ─── Inspector State ──────────────────────────────────────────────────────────

export interface InspectorState {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isOpen: boolean;
}

// ─── SLA Modal State ──────────────────────────────────────────────────────────

export interface SLAModalState {
  isOpen: boolean;
  sourceNodeId: string | null;
  targetNodeId: string | null;
  pendingEdgeId: string | null;
  editingEdgeId: string | null;
}

// ─── Deploy State ──────────────────────────────────────────────────────────────

export type DeployStatus = 'idle' | 'compiling' | 'preview' | 'deploying' | 'done' | 'error';

export interface DeployState {
  isOpen: boolean;
  status: DeployStatus;
  compiledYaml: string;
  warnings: string[];
  error: string | null;
}

// ─── Architecture Library ──────────────────────────────────────────────────────

export interface LibraryState {
  isOpen: boolean;
  blueprints: ArchitectureBlueprint[];
}

// ─── Full Store ────────────────────────────────────────────────────────────────

interface SwarmForgeStore {
  // Canvas
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  addNode: (node: CanvasNode) => void;
  updateNodeData: (nodeId: string, data: Partial<SwarmNodeData>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: CanvasEdge) => void;
  updateEdgeData: (edgeId: string, data: Partial<SLAEdgeData>) => void;
  removeEdge: (edgeId: string) => void;
  clearCanvas: () => void;

  // Inspector
  inspector: InspectorState;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  closeInspector: () => void;

  // SLA Modal
  slaModal: SLAModalState;
  openSLAModal: (sourceId: string, targetId: string, pendingEdgeId: string) => void;
  openSLAEditor: (edgeId: string) => void;
  closeSLAModal: () => void;

  // Deploy
  deploy: DeployState;
  openDeploy: () => void;
  closeDeploy: () => void;
  setDeployStatus: (status: DeployStatus) => void;
  setCompiledYaml: (yaml: string, warnings?: string[]) => void;
  setDeployError: (error: string) => void;

  // Blueprint Library
  library: LibraryState;
  openLibrary: () => void;
  closeLibrary: () => void;
  saveBlueprint: (name: string, description: string, companyType: string, seedBudget: number, tags?: string[]) => void;
  loadBlueprint: (id: string) => void;
  deleteBlueprint: (id: string) => void;

  // Models
  models: ModelOption[];
  modelsLoading: boolean;
  setModels: (models: ModelOption[]) => void;
  setModelsLoading: (loading: boolean) => void;

  // Canvas meta
  companyName: string;
  companyType: string;
  seedBudgetUsd: number;
  setCompanyMeta: (name: string, type: string, budget: number) => void;
}

export const useSwarmStore = create<SwarmForgeStore>()(
  persist(
    (set, get) => ({
      // ── Canvas ──────────────────────────────────────────────────
      nodes: [],
      edges: [],

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      addNode: (node) =>
        set((state) => ({ nodes: [...state.nodes, node] })),

      updateNodeData: (nodeId, data) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...data } as SwarmNodeData } : n
          ),
        })),

      removeNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== nodeId),
          edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        })),

      addEdge: (edge) =>
        set((state) => ({ edges: [...state.edges, edge] })),

      updateEdgeData: (edgeId, data) =>
        set((state) => ({
          edges: state.edges.map((e) =>
            e.id === edgeId ? { ...e, data: { ...e.data, ...data } as SLAEdgeData } : e
          ),
        })),

      removeEdge: (edgeId) =>
        set((state) => ({ edges: state.edges.filter((e) => e.id !== edgeId) })),

      clearCanvas: () => set({ nodes: [], edges: [] }),

      // ── Inspector ────────────────────────────────────────────────
      inspector: { selectedNodeId: null, selectedEdgeId: null, isOpen: false },

      selectNode: (nodeId) =>
        set({ inspector: { selectedNodeId: nodeId, selectedEdgeId: null, isOpen: nodeId !== null } }),

      selectEdge: (edgeId) =>
        set({ inspector: { selectedNodeId: null, selectedEdgeId: edgeId, isOpen: edgeId !== null } }),

      closeInspector: () =>
        set({ inspector: { selectedNodeId: null, selectedEdgeId: null, isOpen: false } }),

      // ── SLA Modal ────────────────────────────────────────────────
      slaModal: {
        isOpen: false,
        sourceNodeId: null,
        targetNodeId: null,
        pendingEdgeId: null,
        editingEdgeId: null,
      },

      openSLAModal: (sourceId, targetId, pendingEdgeId) =>
        set({
          slaModal: {
            isOpen: true,
            sourceNodeId: sourceId,
            targetNodeId: targetId,
            pendingEdgeId,
            editingEdgeId: null,
          },
        }),

      openSLAEditor: (edgeId) =>
        set({
          slaModal: {
            isOpen: true,
            sourceNodeId: null,
            targetNodeId: null,
            pendingEdgeId: null,
            editingEdgeId: edgeId,
          },
        }),

      closeSLAModal: () =>
        set({
          slaModal: {
            isOpen: false,
            sourceNodeId: null,
            targetNodeId: null,
            pendingEdgeId: null,
            editingEdgeId: null,
          },
        }),

      // ── Deploy ───────────────────────────────────────────────────
      deploy: {
        isOpen: false,
        status: 'idle',
        compiledYaml: '',
        warnings: [],
        error: null,
      },

      openDeploy: () => set((s) => ({ deploy: { ...s.deploy, isOpen: true } })),
      closeDeploy: () =>
        set((s) => ({ deploy: { ...s.deploy, isOpen: false, status: 'idle', error: null } })),
      setDeployStatus: (status) =>
        set((s) => ({ deploy: { ...s.deploy, status } })),
      setCompiledYaml: (yaml, warnings = []) =>
        set((s) => ({ deploy: { ...s.deploy, compiledYaml: yaml, warnings } })),
      setDeployError: (error) =>
        set((s) => ({ deploy: { ...s.deploy, status: 'error', error } })),

      // ── Blueprint Library ─────────────────────────────────────────
      // Presets are always merged in at store init; user blueprints come after.
      library: { isOpen: false, blueprints: PRESET_BLUEPRINTS },

      openLibrary: () => set((s) => ({ library: { ...s.library, isOpen: true } })),
      closeLibrary: () => set((s) => ({ library: { ...s.library, isOpen: false } })),

      saveBlueprint: (name, description, companyType, seedBudgetUsd, tags = []) => {
        const { nodes, edges, library } = get();
        const now = new Date().toISOString();
        const blueprint: ArchitectureBlueprint = {
          id: `bp_${Date.now()}`,
          name,
          description,
          tags,
          companyType,
          seedBudgetUsd,
          nodes,
          edges,
          createdAt: now,
          updatedAt: now,
        };
        set({ library: { ...library, blueprints: [blueprint, ...library.blueprints] } });
      },

      loadBlueprint: (id) => {
        const { library } = get();
        const bp = library.blueprints.find((b) => b.id === id);
        if (bp) {
          set({
            nodes: bp.nodes,
            edges: bp.edges,
            companyName: bp.name,
            companyType: bp.companyType,
            seedBudgetUsd: bp.seedBudgetUsd,
            library: { ...library, isOpen: false },
            inspector: { selectedNodeId: null, selectedEdgeId: null, isOpen: false },
          });
        }
      },

      deleteBlueprint: (id) =>
        set((s) => ({
          library: {
            ...s.library,
            blueprints: s.library.blueprints.filter((b) => b.id !== id),
          },
        })),

      // ── Models ───────────────────────────────────────────────────
      models: DEFAULT_MODELS,
      modelsLoading: false,
      setModels: (models) => set({ models }),
      setModelsLoading: (loading) => set({ modelsLoading: loading }),

      // ── Canvas Meta ──────────────────────────────────────────────
      companyName: 'My AI Company',
      companyType: 'saas',
      seedBudgetUsd: 5000,
      setCompanyMeta: (companyName, companyType, seedBudgetUsd) =>
        set({ companyName, companyType, seedBudgetUsd }),
    }),
    {
      name: 'swarm-forge-canvas',
      // Don't persist modal/deploy states
      partialize: (s) => ({
        nodes: s.nodes,
        edges: s.edges,
        library: s.library,
        companyName: s.companyName,
        companyType: s.companyType,
        seedBudgetUsd: s.seedBudgetUsd,
      }),
      // When restoring from localStorage, always ensure presets are present.
      // User-saved blueprints come AFTER presets (presets are pinned to top).
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<typeof current>;
        const userBlueprints = (p.library?.blueprints ?? []).filter(
          (b) => !b.id.startsWith('preset_')
        );
        return {
          ...current,
          ...p,
          library: {
            isOpen: false,
            blueprints: [...PRESET_BLUEPRINTS, ...userBlueprints],
          },
        };
      },
    }
  )
);

