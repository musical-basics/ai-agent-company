/**
 * SWARM FORGE — Core Types
 * Every node, edge, and blueprint that flows through the visual IDE.
 */

// ─── Node Types ───────────────────────────────────────────────────────────────

export type NodeKind = 'worker' | 'manager' | 'ceo' | 'tool' | 'adapter';

export type FrameworkAdapter =
  | 'Custom_ReAct'
  | 'LangGraph'
  | 'OpenClaw'
  | 'Hermes'
  | 'AutoGen'
  | 'SWE-agent'
  | 'CrewAI';

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral' | 'local';

export interface ModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  description?: string;
  contextWindow?: number;
  tier?: 'flagship' | 'balanced' | 'fast' | 'local';
}

export interface IntegrationTool {
  id: string;
  name: string;
  category: 'analytics' | 'ecommerce' | 'dev' | 'marketing' | 'finance' | 'productivity' | 'testing';
  icon?: string;
  description?: string;
}

// ─── Node Data ────────────────────────────────────────────────────────────────

export interface WorkerNodeData {
  kind: 'worker';
  label: string;             // e.g. "Performance Copywriter"
  role: string;              // e.g. "copywriter"
  department?: string;       // e.g. "growth_marketing"
  framework: FrameworkAdapter;
  modelProvider: ModelProvider;
  modelId: string;
  modelName?: string;
  sopFile?: string;
  toolsGranted: string[];    // integration IDs
  budgetUsd: number;
  description?: string;
}

export interface ManagerNodeData {
  kind: 'manager';
  label: string;
  department: string;
  framework: FrameworkAdapter;
  modelProvider: ModelProvider;
  modelId: string;
  modelName?: string;
  toolsGranted: string[];
  budgetUsd: number;
  gitMindDir?: string;
  pgvectorNamespace?: string;
}

export interface CEONodeData {
  kind: 'ceo';
  label: string;
  modelProvider: ModelProvider;
  modelId: string;
  modelName?: string;
  directivesFile?: string;
  cultureFile?: string;
  maxPhaseCount?: number;
  budgetAlertThresholdPct?: number;
}

export interface ToolNodeData {
  kind: 'tool';
  toolId: string;
  name: string;
  category: IntegrationTool['category'];
  description?: string;
}

export interface AdapterNodeData {
  kind: 'adapter';
  adapterId: string;
  name: string;
  framework: FrameworkAdapter;
  description?: string;
}

export type SwarmNodeData =
  | WorkerNodeData
  | ManagerNodeData
  | CEONodeData
  | ToolNodeData
  | AdapterNodeData;

// ─── Edge (SLA) Types ─────────────────────────────────────────────────────────

export interface SLAEdgeData {
  slaId: string;
  protocolFile?: string;
  requiredArtifactKeys: string[];
  rejectionPolicy: {
    maxRetries: number;
    escalateToCeoAfter: number;
  };
  label?: string;
  description?: string;
}

// ─── Canvas State ─────────────────────────────────────────────────────────────

export interface CanvasNode {
  id: string;
  type: NodeKind;
  position: { x: number; y: number };
  data: SwarmNodeData;
  selected?: boolean;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  data?: SLAEdgeData;
  label?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, unknown>;
}

// ─── Architecture Blueprint (saved in DB / localStorage) ─────────────────────

export interface ArchitectureBlueprint {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  companyType: string;
  seedBudgetUsd: number;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

// ─── Compiler Output ──────────────────────────────────────────────────────────

export interface CompilerOutput {
  yaml: string;
  warnings: string[];
  nodeCount: number;
  edgeCount: number;
  departments: string[];
}

// ─── Palette Items ────────────────────────────────────────────────────────────

export interface PaletteItem {
  id: string;
  kind: NodeKind;
  label: string;
  description: string;
  icon?: string;
  defaultData: Partial<SwarmNodeData>;
}

// ─── Registry Types (from DB / static) ───────────────────────────────────────

export interface AgentRegistryEntry {
  id: string;
  name: string;
  kind: NodeKind;
  framework: FrameworkAdapter;
  description: string;
  defaultModel?: string;
  isThirdParty: boolean;
  sourceUrl?: string;
}

export interface ToolRegistryEntry {
  id: string;
  name: string;
  category: IntegrationTool['category'];
  description: string;
  docsUrl?: string;
  requiresApiKey: boolean;
}
