'use client';
/**
 * SWARM FORGE — Custom React Flow Node Components
 * Worker, Manager, CEO, Tool, and Adapter nodes.
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Brain, Wrench, Zap, Crown, Cpu,
  Network, ChevronRight,
} from 'lucide-react';
import { NODE_COLORS, PROVIDER_LABELS } from '@/lib/utils';
import type { WorkerNodeData, ManagerNodeData, CEONodeData, ToolNodeData, AdapterNodeData } from '@/lib/types';

// ─── Shared Node Shell ─────────────────────────────────────────────────────────

interface NodeShellProps {
  kind: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  selected?: boolean;
  children?: React.ReactNode;
}

function NodeShell({ kind, icon, title, subtitle, badge, selected, children }: NodeShellProps) {
  const colors = NODE_COLORS[kind] || NODE_COLORS.worker;

  return (
    <div
      style={{
        background: colors.bg,
        border: `1.5px solid ${selected ? colors.text : colors.border}`,
        boxShadow: selected
          ? `0 0 0 2px ${colors.glow}, 0 8px 32px ${colors.glow}`
          : `0 4px 24px rgba(0,0,0,0.4), 0 0 0 0px ${colors.glow}`,
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        borderRadius: 12,
        minWidth: 200,
        maxWidth: 240,
        padding: '12px 14px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 32, height: 32,
            borderRadius: 8,
            background: colors.badge,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            color: colors.text,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: '#e8eef8',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 10, color: '#4a6080', marginTop: 2 }}>
              {subtitle}
            </div>
          )}
        </div>
        {badge && (
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            color: colors.text,
            background: colors.badge,
            padding: '2px 6px', borderRadius: 4,
            textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            {badge}
          </div>
        )}
      </div>

      {/* Body */}
      {children}

      {/* Left handle (input) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: colors.border, width: 10, height: 10, border: `2px solid ${colors.bg}` }}
      />
      {/* Right handle (output) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: colors.border, width: 10, height: 10, border: `2px solid ${colors.bg}` }}
      />
    </div>
  );
}

// ─── Pill Tag ──────────────────────────────────────────────────────────────────

function Pill({ label, color = '#2d3f60' }: { label: string; color?: string }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 500,
      background: `${color}40`,
      color,
      border: `1px solid ${color}60`,
      borderRadius: 4, padding: '1px 5px',
      display: 'inline-block',
    }}>
      {label}
    </span>
  );
}

// ─── Worker Node ───────────────────────────────────────────────────────────────

export const WorkerNode = memo(({ data, selected }: NodeProps) => {
  const d = data as unknown as WorkerNodeData;

  return (
    <NodeShell
      kind="worker"
      icon={<Brain size={16} />}
      title={d.label || 'Worker Agent'}
      subtitle={d.department ? `dept: ${d.department}` : undefined}
      badge="Worker"
      selected={selected}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Model */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#0d1120', borderRadius: 6, padding: '4px 8px',
        }}>
          <Cpu size={10} style={{ color: '#4a6080', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#8fa4c0' }}>
            {PROVIDER_LABELS[d.modelProvider] || d.modelProvider}
          </span>
          <ChevronRight size={8} style={{ color: '#2d4060' }} />
          <span style={{ fontSize: 10, color: '#e8eef8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d.modelId || 'gpt-4o'}
          </span>
        </div>

        {/* Framework */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Pill label={d.framework || 'ReAct'} color="#6366f1" />
          {d.toolsGranted?.slice(0, 2).map((t) => (
            <Pill key={t} label={t.replace('_api', '')} color="#06b6d4" />
          ))}
          {(d.toolsGranted?.length || 0) > 2 && (
            <Pill label={`+${d.toolsGranted.length - 2}`} color="#4a6080" />
          )}
        </div>

        {/* Budget */}
        {d.budgetUsd !== undefined && (
          <div style={{ fontSize: 9, color: '#4a6080', textAlign: 'right' }}>
            ${d.budgetUsd.toLocaleString()} allocated
          </div>
        )}
      </div>
    </NodeShell>
  );
});
WorkerNode.displayName = 'WorkerNode';

// ─── Manager Node ──────────────────────────────────────────────────────────────

export const ManagerNode = memo(({ data, selected }: NodeProps) => {
  const d = data as unknown as ManagerNodeData;

  return (
    <NodeShell
      kind="manager"
      icon={<Network size={16} />}
      title={d.label || 'Manager'}
      subtitle={d.department ? `dept: ${d.department}` : undefined}
      badge="Manager"
      selected={selected}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#0d1120', borderRadius: 6, padding: '4px 8px',
        }}>
          <Cpu size={10} style={{ color: '#4a6080', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#8fa4c0' }}>
            {PROVIDER_LABELS[d.modelProvider] || d.modelProvider}
          </span>
          <ChevronRight size={8} style={{ color: '#2d4060' }} />
          <span style={{ fontSize: 10, color: '#e8eef8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d.modelId || 'gpt-4o'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Pill label={d.framework || 'ReAct'} color="#8b5cf6" />
          {d.gitMindDir && <Pill label="Soft DB" color="#4a6080" />}
        </div>
      </div>
    </NodeShell>
  );
});
ManagerNode.displayName = 'ManagerNode';

// ─── CEO Node ──────────────────────────────────────────────────────────────────

export const CEONode = memo(({ data, selected }: NodeProps) => {
  const d = data as unknown as CEONodeData;

  return (
    <NodeShell
      kind="ceo"
      icon={<Crown size={16} />}
      title={d.label || 'AI CEO'}
      subtitle="Apex Reasoning Agent"
      badge="CEO"
      selected={selected}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#0d1120', borderRadius: 6, padding: '4px 8px',
        }}>
          <Cpu size={10} style={{ color: '#4a6080', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#8fa4c0' }}>
            {PROVIDER_LABELS[d.modelProvider] || 'OpenAI'}
          </span>
          <ChevronRight size={8} style={{ color: '#2d4060' }} />
          <span style={{ fontSize: 10, color: '#e8eef8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d.modelId || 'gpt-4o'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Pill label="Goldilocks Protocol" color="#f43f5e" />
          <Pill label="HTN Planning" color="#f43f5e" />
        </div>
      </div>
    </NodeShell>
  );
});
CEONode.displayName = 'CEONode';

// ─── Tool Node ─────────────────────────────────────────────────────────────────

export const ToolNode = memo(({ data, selected }: NodeProps) => {
  const d = data as unknown as ToolNodeData;

  return (
    <NodeShell
      kind="tool"
      icon={<Wrench size={16} />}
      title={d.name || 'API Tool'}
      subtitle={d.category}
      badge="Tool"
      selected={selected}
    >
      <div style={{ fontSize: 10, color: '#4a6080', lineHeight: 1.4 }}>
        {d.description?.slice(0, 60)}{(d.description?.length || 0) > 60 ? '…' : ''}
      </div>
    </NodeShell>
  );
});
ToolNode.displayName = 'ToolNode';

// ─── Adapter Node ──────────────────────────────────────────────────────────────

export const AdapterNode = memo(({ data, selected }: NodeProps) => {
  const d = data as unknown as AdapterNodeData;

  return (
    <NodeShell
      kind="adapter"
      icon={<Zap size={16} />}
      title={d.name || 'Adapter'}
      subtitle={d.framework}
      badge="Adapter"
      selected={selected}
    >
      <div style={{ fontSize: 10, color: '#4a6080', lineHeight: 1.4 }}>
        {d.description?.slice(0, 60)}{(d.description?.length || 0) > 60 ? '…' : ''}
      </div>
    </NodeShell>
  );
});
AdapterNode.displayName = 'AdapterNode';

// ─── Node Type Map (for React Flow) ───────────────────────────────────────────

export const NODE_TYPES = {
  worker: WorkerNode,
  manager: ManagerNode,
  ceo: CEONode,
  tool: ToolNode,
  adapter: AdapterNode,
};
