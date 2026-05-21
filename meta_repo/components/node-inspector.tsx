'use client';
/**
 * SWARM FORGE — Node Inspector ("The Hiring Panel")
 * Right-side properties panel for selected nodes.
 * Configures: Framework, LLM, Integrations, Budget.
 */

import { useEffect, useState } from 'react';
import {
  X, Brain, Network, Crown, Wrench, Zap, Settings2,
  Cpu, DollarSign, RefreshCw, Loader2, Check, ChevronDown,
} from 'lucide-react';
import { useSwarmStore } from '@/lib/store';
import { TOOL_REGISTRY, FRAMEWORK_ADAPTERS, DEFAULT_MODELS } from '@/lib/registry';
import { NODE_COLORS, PROVIDER_COLORS, PROVIDER_LABELS } from '@/lib/utils';
import type {
  WorkerNodeData, ManagerNodeData, CEONodeData, NodeKind, ModelOption, ModelProvider,
} from '@/lib/types';

// ─── Shared Sub-components ────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 10, fontWeight: 600, color: '#8fa4c0', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </label>
  );
}

function InputText({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '7px 10px',
        background: '#080b14', border: '1px solid #1e2a40',
        borderRadius: 7, color: '#e8eef8', fontSize: 11, outline: 'none',
      }}
      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#6366f1'; }}
      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#1e2a40'; }}
    />
  );
}

function SelectField({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; color?: string }[];
}) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '7px 28px 7px 10px',
          background: '#080b14', border: '1px solid #1e2a40',
          borderRadius: 7, color: '#e8eef8', fontSize: 11, outline: 'none',
          appearance: 'none', cursor: 'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={11} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: '#4a6080', pointerEvents: 'none' }} />
    </div>
  );
}

// ─── Integrations Dock ────────────────────────────────────────────────────────

function IntegrationsDock({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const categories = Array.from(new Set(TOOL_REGISTRY.map((t) => t.category)));

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#2d4060', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
            {cat}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {TOOL_REGISTRY.filter((t) => t.category === cat).map((tool) => {
              const checked = selected.includes(tool.id);
              return (
                <button
                  key={tool.id}
                  onClick={() => toggle(tool.id)}
                  title={tool.description}
                  style={{
                    padding: '4px 8px',
                    background: checked ? '#083344' : '#080b14',
                    border: `1px solid ${checked ? '#06b6d4' : '#1e2a40'}`,
                    borderRadius: 5,
                    color: checked ? '#22d3ee' : '#4a6080',
                    fontSize: 9.5, fontWeight: checked ? 600 : 400,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s',
                  }}
                >
                  {checked && <Check size={9} />}
                  {tool.name.replace(' API', '').replace(' Browser', '')}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Model Selector ────────────────────────────────────────────────────────────

function ModelSelector({
  provider,
  modelId,
  onProviderChange,
  onModelChange,
  models,
  loading,
}: {
  provider: ModelProvider;
  modelId: string;
  onProviderChange: (p: ModelProvider) => void;
  onModelChange: (id: string) => void;
  models: ModelOption[];
  loading: boolean;
}) {
  const providers: ModelProvider[] = ['openai', 'anthropic', 'google', 'meta', 'mistral', 'local'];
  const filteredModels = models.filter((m) => m.provider === provider);

  return (
    <div>
      {/* Provider pill selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
        {providers.map((p) => (
          <button
            key={p}
            onClick={() => {
              onProviderChange(p);
              const first = models.find((m) => m.provider === p);
              if (first) onModelChange(first.id);
            }}
            style={{
              padding: '4px 10px',
              background: provider === p ? `${PROVIDER_COLORS[p]}20` : '#080b14',
              border: `1px solid ${provider === p ? PROVIDER_COLORS[p] : '#1e2a40'}`,
              borderRadius: 20,
              color: provider === p ? PROVIDER_COLORS[p] : '#4a6080',
              fontSize: 10, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {PROVIDER_LABELS[p]}
          </button>
        ))}
        {loading && <Loader2 size={12} style={{ color: '#4a6080', alignSelf: 'center', animation: 'spin 1s linear infinite' }} />}
      </div>

      {/* Model dropdown */}
      <SelectField
        value={modelId}
        onChange={onModelChange}
        options={filteredModels.length > 0
          ? filteredModels.map((m) => ({ value: m.id, label: `${m.name}${m.tier ? ` (${m.tier})` : ''}` }))
          : [{ value: modelId, label: modelId }]
        }
      />
    </div>
  );
}

// ─── Inspector Panel ──────────────────────────────────────────────────────────

export default function NodeInspector() {
  const { inspector, nodes, updateNodeData, closeInspector, models, modelsLoading, setModels, setModelsLoading } = useSwarmStore();

  const selectedNode = nodes.find((n) => n.id === inspector.selectedNodeId);
  const kind = selectedNode?.type as NodeKind | undefined;
  const data = selectedNode?.data;
  const colors = kind ? NODE_COLORS[kind] || NODE_COLORS.worker : NODE_COLORS.worker;

  // Live model fetching
  const fetchModels = async () => {
    setModelsLoading(true);
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const json = await res.json();
        if (json.models?.length > 0) setModels(json.models);
      }
    } catch { /* silently fall back to defaults */ }
    setModelsLoading(false);
  };

  useEffect(() => {
    if (inspector.isOpen && models === DEFAULT_MODELS) {
      fetchModels();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspector.isOpen]);

  const update = (patch: Record<string, unknown>) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, patch as Parameters<typeof updateNodeData>[1]);
  };

  if (!inspector.isOpen || !selectedNode) return null;

  const kindIcon = {
    worker: <Brain size={16} />,
    manager: <Network size={16} />,
    ceo: <Crown size={16} />,
    tool: <Wrench size={16} />,
    adapter: <Zap size={16} />,
  }[kind || 'worker'];

  const kindLabel = {
    worker: 'Worker Agent',
    manager: 'Manager Subagent',
    ceo: 'AI CEO',
    tool: 'API Tool',
    adapter: 'Framework Adapter',
  }[kind || 'worker'];

  return (
    <div style={{
      width: 300,
      height: '100%',
      background: '#0a0e1a',
      borderLeft: '1px solid #1e2a40',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 14px 12px',
        borderBottom: '1px solid #1e2a40',
        background: `linear-gradient(135deg, ${colors.bg} 0%, #0a0e1a 100%)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: colors.badge, color: colors.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            border: `1px solid ${colors.border}40`,
          }}>
            {kindIcon}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#e8eef8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {(data as { label?: string })?.label || kindLabel}
            </div>
            <div style={{ fontSize: 9, color: colors.text, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>
              {kindLabel}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={fetchModels}
              title="Refresh models from providers"
              style={{
                background: 'none', border: '1px solid #1e2a40',
                borderRadius: 6, color: '#4a6080', padding: 5, cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}
            >
              <RefreshCw size={11} className={modelsLoading ? 'animate-spin-slow' : ''} />
            </button>
            <button
              onClick={closeInspector}
              style={{ background: 'none', border: 'none', color: '#4a6080', cursor: 'pointer', padding: 5, display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: colors.text,
            background: colors.badge, padding: '2px 7px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {kind}
          </span>
          <span style={{ fontSize: 9, color: '#2d4060', padding: '2px 7px', background: '#080b14', borderRadius: 5, border: '1px solid #1e2a40' }}>
            id: {selectedNode.id.slice(0, 16)}…
          </span>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>

        {/* ── Common: Label ── */}
        {kind !== 'tool' && kind !== 'adapter' && (
          <div style={{ marginBottom: 14 }}>
            <Label>Display Name</Label>
            <InputText
              value={(data as { label?: string })?.label || ''}
              onChange={(v) => update({ label: v })}
              placeholder="e.g. Performance Copywriter"
            />
          </div>
        )}

        {/* ── CEO specific ── */}
        {kind === 'ceo' && (() => {
          const d = data as CEONodeData;
          return (
            <>
              <div style={{ marginBottom: 14 }}>
                <Label><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Cpu size={10} /> Cognitive Engine (LLM)</span></Label>
                <ModelSelector
                  provider={d.modelProvider || 'openai'}
                  modelId={d.modelId || 'gpt-4o'}
                  onProviderChange={(p) => update({ modelProvider: p })}
                  onModelChange={(m) => update({ modelId: m })}
                  models={models}
                  loading={modelsLoading}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <Label>Max Phase Count</Label>
                <input
                  type="number" min={1} max={20}
                  value={d.maxPhaseCount ?? 5}
                  onChange={(e) => update({ maxPhaseCount: Number(e.target.value) })}
                  style={{ width: '100%', padding: '7px 10px', background: '#080b14', border: '1px solid #1e2a40', borderRadius: 7, color: '#e8eef8', fontSize: 11, outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <Label>Budget Alert Threshold (%)</Label>
                <input
                  type="number" min={0} max={100}
                  value={d.budgetAlertThresholdPct ?? 75}
                  onChange={(e) => update({ budgetAlertThresholdPct: Number(e.target.value) })}
                  style={{ width: '100%', padding: '7px 10px', background: '#080b14', border: '1px solid #1e2a40', borderRadius: 7, color: '#e8eef8', fontSize: 11, outline: 'none' }}
                />
              </div>
            </>
          );
        })()}

        {/* ── Worker / Manager: Framework + LLM + Budget + Tools ── */}
        {(kind === 'worker' || kind === 'manager') && (() => {
          const d = data as WorkerNodeData | ManagerNodeData;
          return (
            <>
              {/* Framework Adapter */}
              <div style={{ marginBottom: 14 }}>
                <Label><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Settings2 size={10} /> Framework Adapter</span></Label>
                <SelectField
                  value={d.framework || 'Custom_ReAct'}
                  onChange={(v) => update({ framework: v })}
                  options={FRAMEWORK_ADAPTERS.map((f) => ({ value: f.id, label: f.name }))}
                />
                <p style={{ fontSize: 9, color: '#2d4060', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {FRAMEWORK_ADAPTERS.find((f) => f.id === d.framework)?.description || ''}
                </p>
              </div>

              {/* Cognitive Engine */}
              <div style={{ marginBottom: 14 }}>
                <Label><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Cpu size={10} /> Cognitive Engine (LLM)</span></Label>
                <ModelSelector
                  provider={d.modelProvider || 'openai'}
                  modelId={d.modelId || 'gpt-4o'}
                  onProviderChange={(p) => update({ modelProvider: p })}
                  onModelChange={(m) => update({ modelId: m })}
                  models={models}
                  loading={modelsLoading}
                />
              </div>

              {/* Department (manager only) */}
              {kind === 'manager' && (
                <div style={{ marginBottom: 14 }}>
                  <Label>Department ID</Label>
                  <InputText
                    value={(d as ManagerNodeData).department || ''}
                    onChange={(v) => update({ department: v })}
                    placeholder="e.g. growth_marketing"
                  />
                </div>
              )}

              {/* Department (worker) */}
              {kind === 'worker' && (
                <div style={{ marginBottom: 14 }}>
                  <Label>Department</Label>
                  <InputText
                    value={(d as WorkerNodeData).department || ''}
                    onChange={(v) => update({ department: v })}
                    placeholder="e.g. growth_marketing"
                  />
                </div>
              )}

              {/* Budget */}
              <div style={{ marginBottom: 14 }}>
                <Label><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={10} /> Budget Allocation (USD)</span></Label>
                <input
                  type="number" min={0}
                  value={d.budgetUsd || 200}
                  onChange={(e) => update({ budgetUsd: Number(e.target.value) })}
                  style={{ width: '100%', padding: '7px 10px', background: '#080b14', border: '1px solid #1e2a40', borderRadius: 7, color: '#e8eef8', fontSize: 11, outline: 'none' }}
                />
              </div>

              {/* SOP File */}
              {kind === 'worker' && (
                <div style={{ marginBottom: 14 }}>
                  <Label>SOP File</Label>
                  <InputText
                    value={(d as WorkerNodeData).sopFile || ''}
                    onChange={(v) => update({ sopFile: v })}
                    placeholder="e.g. campaign_operations.md"
                  />
                </div>
              )}

              <div style={{ height: 1, background: '#1e2a40', margin: '16px 0' }} />

              {/* Integrations Dock */}
              <div style={{ marginBottom: 14 }}>
                <Label><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Wrench size={10} /> Integrations Dock</span></Label>
                <p style={{ fontSize: 9.5, color: '#2d4060', margin: '0 0 10px', lineHeight: 1.4 }}>
                  Click to toggle API access for this agent (RBAC-controlled)
                </p>
                <IntegrationsDock
                  selected={d.toolsGranted || []}
                  onChange={(ids) => update({ toolsGranted: ids })}
                />
              </div>
            </>
          );
        })()}

        {/* ── Tool node ── */}
        {kind === 'tool' && (() => {
          const d = data as { toolId?: string; name?: string; category?: string; description?: string };
          return (
            <>
              <div style={{ marginBottom: 14 }}>
                <Label>Tool Name</Label>
                <InputText value={d.name || ''} onChange={(v) => update({ name: v })} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <Label>Category</Label>
                <SelectField
                  value={d.category || 'dev'}
                  onChange={(v) => update({ category: v })}
                  options={['analytics', 'ecommerce', 'dev', 'marketing', 'finance', 'productivity', 'testing'].map((c) => ({ value: c, label: c }))}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <Label>Description</Label>
                <InputText value={d.description || ''} onChange={(v) => update({ description: v })} placeholder="What does this tool do?" />
              </div>
            </>
          );
        })()}

        {/* ── Adapter node ── */}
        {kind === 'adapter' && (() => {
          const d = data as { adapterId?: string; name?: string; framework?: string; description?: string };
          return (
            <>
              <div style={{ marginBottom: 14 }}>
                <Label>Framework</Label>
                <SelectField
                  value={d.framework || 'LangGraph'}
                  onChange={(v) => update({ framework: v })}
                  options={FRAMEWORK_ADAPTERS.map((f) => ({ value: f.id, label: f.name }))}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <Label>Name</Label>
                <InputText value={d.name || ''} onChange={(v) => update({ name: v })} />
              </div>
            </>
          );
        })()}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #1e2a40' }}>
        <div style={{ fontSize: 9, color: '#2d4060', lineHeight: 1.4 }}>
          Changes auto-saved to canvas. <span style={{ color: '#4a6080' }}>Compile → swarm-compose.yml when ready.</span>
        </div>
      </div>
    </div>
  );
}
