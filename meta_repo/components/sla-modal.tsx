'use client';
/**
 * SWARM FORGE — SLA Edge Modal
 * Opens when the Chairman draws an edge between two nodes.
 * Defines the inter-departmental handshake: artifact keys, rejection policy.
 */

import { useState, useEffect } from 'react';
import { X, Shield, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useSwarmStore } from '@/lib/store';
import type { SLAEdgeData, CanvasEdge } from '@/lib/types';

interface SLAModalProps {
  onConfirm: (edgeId: string, data: SLAEdgeData) => void;
  onCancel: () => void;
}

export default function SLAModal({ onConfirm, onCancel }: SLAModalProps) {
  const { slaModal, nodes, edges, closeSLAModal } = useSwarmStore();

  // Pre-fill if editing existing edge
  const editingEdge: CanvasEdge | undefined = slaModal.editingEdgeId
    ? edges.find((e) => e.id === slaModal.editingEdgeId)
    : undefined;

  const sourceNode = nodes.find((n) => n.id === (slaModal.sourceNodeId || editingEdge?.source));
  const targetNode = nodes.find((n) => n.id === (slaModal.targetNodeId || editingEdge?.target));

  const sourceLabel = (sourceNode?.data as { label?: string })?.label || sourceNode?.id || 'Source';
  const targetLabel = (targetNode?.data as { label?: string })?.label || targetNode?.id || 'Target';

  const [keys, setKeys] = useState<string[]>(editingEdge?.data?.requiredArtifactKeys || ['']);
  const [maxRetries, setMaxRetries] = useState(editingEdge?.data?.rejectionPolicy?.maxRetries ?? 2);
  const [escalateAfter, setEscalateAfter] = useState(editingEdge?.data?.rejectionPolicy?.escalateToCeoAfter ?? 1);
  const [description, setDescription] = useState(editingEdge?.data?.description || '');
  const [protocolFile, setProtocolFile] = useState(editingEdge?.data?.protocolFile || '');

  useEffect(() => {
    if (!slaModal.isOpen) return;
    if (editingEdge?.data) {
      setKeys(editingEdge.data.requiredArtifactKeys?.length ? editingEdge.data.requiredArtifactKeys : ['']);
      setMaxRetries(editingEdge.data.rejectionPolicy?.maxRetries ?? 2);
      setEscalateAfter(editingEdge.data.rejectionPolicy?.escalateToCeoAfter ?? 1);
      setDescription(editingEdge.data.description || '');
      setProtocolFile(editingEdge.data.protocolFile || '');
    }
  }, [slaModal.isOpen, editingEdge]);

  const handleConfirm = () => {
    const validKeys = keys.filter((k) => k.trim() !== '');
    const srcDept = (sourceNode?.data as { department?: string })?.department || sourceNode?.id || 'source';
    const tgtDept = (targetNode?.data as { department?: string })?.department || targetNode?.id || 'target';
    const edgeId = slaModal.editingEdgeId || slaModal.pendingEdgeId || `sla_${Date.now()}`;

    const slaData: SLAEdgeData = {
      slaId: `${srcDept}_to_${tgtDept}`,
      protocolFile: protocolFile || `minds/templates/sla_${srcDept}_to_${tgtDept}.md`,
      requiredArtifactKeys: validKeys,
      rejectionPolicy: { maxRetries, escalateToCeoAfter: escalateAfter },
      description,
      label: `${srcDept} → ${tgtDept}`,
    };

    onConfirm(edgeId, slaData);
    closeSLAModal();
  };

  const handleCancel = () => {
    onCancel();
    closeSLAModal();
  };

  const addKey = () => setKeys([...keys, '']);
  const updateKey = (i: number, v: string) => {
    const next = [...keys];
    next[i] = v;
    setKeys(next);
  };
  const removeKey = (i: number) => setKeys(keys.filter((_, idx) => idx !== i));

  if (!slaModal.isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(8,11,20,0.85)',
      backdropFilter: 'blur(8px)',
    }}>
      <div
        style={{
          background: '#0d1120',
          border: '1px solid #243249',
          borderRadius: 16,
          width: 520,
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'fadeSlideIn 0.2s ease forwards',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid #1e2a40',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#1e1b4b', color: '#818cf8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e8eef8', margin: 0 }}>
              Inter-Departmental SLA
            </h2>
            <p style={{ fontSize: 11, color: '#4a6080', margin: '2px 0 0' }}>
              Define the handshake treaty between these agents
            </p>
          </div>
          <button
            onClick={handleCancel}
            style={{ background: 'none', border: 'none', color: '#4a6080', cursor: 'pointer', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>

          {/* Connection preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#080b14', borderRadius: 10, padding: '10px 14px',
            marginBottom: 16, border: '1px solid #1e2a40',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#818cf8',
              background: '#1e1b4b', padding: '3px 8px', borderRadius: 6,
            }}>{sourceLabel}</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, #6366f1, #06b6d4)' }} />
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#22d3ee',
              background: '#083344', padding: '3px 8px', borderRadius: 6,
            }}>{targetLabel}</span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#8fa4c0', display: 'block', marginBottom: 6 }}>
              SLA Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Marketing hands off campaign brief to Product Engineering"
              style={{
                width: '100%', padding: '8px 10px',
                background: '#080b14', border: '1px solid #1e2a40',
                borderRadius: 8, color: '#e8eef8', fontSize: 11, outline: 'none',
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#6366f1'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#1e2a40'; }}
            />
          </div>

          {/* Required Artifact Keys */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#8fa4c0' }}>
                Required Artifact Keys
              </label>
              <button
                onClick={addKey}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: '#1e1b4b', border: '1px solid #6366f1',
                  borderRadius: 6, color: '#818cf8', fontSize: 10, fontWeight: 600,
                  padding: '3px 8px', cursor: 'pointer',
                }}
              >
                <Plus size={10} /> Add Key
              </button>
            </div>
            <p style={{ fontSize: 10, color: '#2d4060', margin: '0 0 8px', lineHeight: 1.4 }}>
              These keys must be present in the handoff artifact. Missing keys trigger rejection + CEO escalation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {keys.map((k, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    value={k}
                    onChange={(e) => updateKey(i, e.target.value)}
                    placeholder={`e.g. target_audience, copy_text, budget_usd`}
                    style={{
                      flex: 1, padding: '7px 10px',
                      background: '#080b14', border: '1px solid #1e2a40',
                      borderRadius: 7, color: '#e8eef8', fontSize: 11, outline: 'none',
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#6366f1'; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#1e2a40'; }}
                  />
                  {keys.length > 1 && (
                    <button
                      onClick={() => removeKey(i)}
                      style={{ background: 'none', border: 'none', color: '#4a6080', cursor: 'pointer', padding: 4 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rejection Policy */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#8fa4c0', display: 'block', marginBottom: 6 }}>
              Rejection Policy
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 10, color: '#4a6080', display: 'block', marginBottom: 4 }}>Max Retries</label>
                <input
                  type="number" min={0} max={10}
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '7px 10px',
                    background: '#080b14', border: '1px solid #1e2a40',
                    borderRadius: 7, color: '#e8eef8', fontSize: 11, outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#4a6080', display: 'block', marginBottom: 4 }}>Escalate to CEO after</label>
                <input
                  type="number" min={0} max={10}
                  value={escalateAfter}
                  onChange={(e) => setEscalateAfter(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '7px 10px',
                    background: '#080b14', border: '1px solid #1e2a40',
                    borderRadius: 7, color: '#e8eef8', fontSize: 11, outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Protocol file (optional) */}
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#8fa4c0', display: 'block', marginBottom: 6 }}>
              Protocol File <span style={{ color: '#2d4060', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              value={protocolFile}
              onChange={(e) => setProtocolFile(e.target.value)}
              placeholder="minds/templates/sla_marketing_to_product.md"
              style={{
                width: '100%', padding: '7px 10px',
                background: '#080b14', border: '1px solid #1e2a40',
                borderRadius: 7, color: '#e8eef8', fontSize: 11, outline: 'none',
                fontFamily: '"JetBrains Mono", monospace',
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#6366f1'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#1e2a40'; }}
            />
          </div>

          {/* Warning if no keys */}
          {keys.filter((k) => k.trim()).length === 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#1a1005', border: '1px solid #f59e0b40',
              borderRadius: 8, padding: '8px 10px', marginTop: 12,
            }}>
              <AlertTriangle size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#92400e' }}>
                No artifact keys defined — this SLA will pass any handoff (no validation).
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #1e2a40',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 18px',
              background: 'none', border: '1px solid #243249',
              borderRadius: 8, color: '#8fa4c0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 20px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: 8,
              color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            {slaModal.editingEdgeId ? 'Update SLA' : 'Create SLA'}
          </button>
        </div>
      </div>
    </div>
  );
}
