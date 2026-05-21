'use client';
/**
 * SWARM FORGE — Architecture Library
 * Modal for saving, browsing, and loading saved company blueprints.
 */

import { useState } from 'react';
import { X, BookOpen, Save, Trash2, Download, Clock, Tag, Building2 } from 'lucide-react';
import { useSwarmStore } from '@/lib/store';

const COMPANY_TYPES = ['saas', 'e-course', 'd2c', 'media', 'coaching', 'marketplace', 'agency'];

export default function ArchitectureLibrary() {
  const { library, closeLibrary, saveBlueprint, loadBlueprint, deleteBlueprint, nodes, edges, companyName, companyType, seedBudgetUsd } = useSwarmStore();

  const [view, setView] = useState<'browse' | 'save'>('browse');
  const [saveName, setSaveName] = useState(companyName);
  const [saveDesc, setSaveDesc] = useState('');
  const [saveType, setSaveType] = useState(companyType);
  const [saveBudget, setSaveBudget] = useState(seedBudgetUsd);
  const [saveTags, setSaveTags] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSave = () => {
    if (!saveName.trim()) return;
    const tags = saveTags.split(',').map((t) => t.trim()).filter(Boolean);
    saveBlueprint(saveName, saveDesc, saveType, saveBudget, tags);
    setView('browse');
  };

  if (!library.isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(8,11,20,0.85)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: '#0d1120',
        border: '1px solid #243249',
        borderRadius: 16,
        width: 640,
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        animation: 'fadeSlideIn 0.2s ease forwards',
      }}>

        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #1e2a40', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1e1b4b', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e8eef8', margin: 0 }}>Blueprint Library</h2>
            <p style={{ fontSize: 11, color: '#4a6080', margin: '2px 0 0' }}>
              Save and load company architectures — your asset library for 1-click deployments
            </p>
          </div>
          <button onClick={closeLibrary} style={{ background: 'none', border: 'none', color: '#4a6080', cursor: 'pointer', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e2a40' }}>
          {[{ id: 'browse', label: 'Browse', icon: <BookOpen size={12} /> }, { id: 'save', label: 'Save Current', icon: <Save size={12} /> }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as 'browse' | 'save')}
              style={{
                flex: 1, padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: view === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                color: view === tab.id ? '#818cf8' : '#4a6080',
                fontSize: 12, fontWeight: 600,
                transition: 'color 0.15s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* ── Browse Tab ── */}
          {view === 'browse' && (
            <>
              {library.blueprints.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#2d4060' }}>
                  <BookOpen size={32} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#4a6080', margin: '0 0 8px' }}>No blueprints saved yet</p>
                  <p style={{ fontSize: 11, lineHeight: 1.5, margin: 0 }}>
                    Build a company structure on the canvas, then click "Save Current" to add it to your library.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {library.blueprints.map((bp) => (
                    <div
                      key={bp.id}
                      style={{
                        background: '#080b14',
                        border: '1px solid #1e2a40',
                        borderRadius: 12,
                        padding: '14px',
                        position: 'relative',
                        transition: 'border-color 0.15s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#6366f1'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1e2a40'; }}
                    >
                      {/* Company type badge */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                          <Building2 size={15} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#e8eef8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bp.name}</div>
                          <div style={{ fontSize: 10, color: '#4a6080', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{bp.companyType}</div>
                        </div>
                      </div>

                      {bp.description && (
                        <p style={{ fontSize: 10, color: '#4a6080', margin: '0 0 10px', lineHeight: 1.4 }}>
                          {bp.description.slice(0, 80)}{bp.description.length > 80 ? '…' : ''}
                        </p>
                      )}

                      {/* Stats */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        {[
                          { label: `${bp.nodes.length} nodes` },
                          { label: `${bp.edges.length} edges` },
                          { label: `$${bp.seedBudgetUsd.toLocaleString()}` },
                        ].map((stat) => (
                          <span key={stat.label} style={{
                            fontSize: 9.5, color: '#4a6080',
                            background: '#0d1120', border: '1px solid #1e2a40',
                            padding: '2px 6px', borderRadius: 5,
                          }}>
                            {stat.label}
                          </span>
                        ))}
                      </div>

                      {/* Tags */}
                      {bp.tags && bp.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                          {bp.tags.map((t) => (
                            <span key={t} style={{
                              fontSize: 9, color: '#6366f1',
                              background: '#1e1b4b', padding: '1px 6px', borderRadius: 4,
                              display: 'flex', alignItems: 'center', gap: 3,
                            }}>
                              <Tag size={8} /> {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                        <Clock size={9} style={{ color: '#2d4060' }} />
                        <span style={{ fontSize: 9, color: '#2d4060' }}>
                          {new Date(bp.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => loadBlueprint(bp.id)}
                          style={{
                            flex: 1, padding: '7px 10px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none', borderRadius: 7,
                            color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          }}
                        >
                          <Download size={11} /> Load
                        </button>
                        {confirmDelete === bp.id ? (
                          <button
                            onClick={() => { deleteBlueprint(bp.id); setConfirmDelete(null); }}
                            style={{
                              padding: '7px 10px', background: '#4c0519', border: '1px solid #f43f5e',
                              borderRadius: 7, color: '#f43f5e', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                            }}
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(bp.id)}
                            style={{
                              padding: '7px 10px', background: 'none', border: '1px solid #243249',
                              borderRadius: 7, color: '#4a6080', cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Save Tab ── */}
          {view === 'save' && (
            <div>
              {nodes.length === 0 && (
                <div style={{ background: '#1a1005', border: '1px solid #f59e0b40', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                  <p style={{ fontSize: 11, color: '#92400e', margin: 0 }}>
                    ⚠️ The canvas is empty — add nodes before saving.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#8fa4c0', display: 'block', marginBottom: 6 }}>Architecture Name *</label>
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="e.g. b2b_saas_v1, ecourse_aggressive_growth"
                    style={{ width: '100%', padding: '8px 10px', background: '#080b14', border: '1px solid #1e2a40', borderRadius: 8, color: '#e8eef8', fontSize: 11, outline: 'none' }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#6366f1'; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#1e2a40'; }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#8fa4c0', display: 'block', marginBottom: 6 }}>Description</label>
                  <textarea
                    value={saveDesc}
                    onChange={(e) => setSaveDesc(e.target.value)}
                    placeholder="What is this company structure optimised for?"
                    rows={3}
                    style={{ width: '100%', padding: '8px 10px', background: '#080b14', border: '1px solid #1e2a40', borderRadius: 8, color: '#e8eef8', fontSize: 11, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#8fa4c0', display: 'block', marginBottom: 6 }}>Company Type</label>
                    <select
                      value={saveType}
                      onChange={(e) => setSaveType(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', background: '#080b14', border: '1px solid #1e2a40', borderRadius: 8, color: '#e8eef8', fontSize: 11, outline: 'none', appearance: 'none' }}
                    >
                      {COMPANY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#8fa4c0', display: 'block', marginBottom: 6 }}>Seed Budget (USD)</label>
                    <input
                      type="number" value={saveBudget} onChange={(e) => setSaveBudget(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 10px', background: '#080b14', border: '1px solid #1e2a40', borderRadius: 8, color: '#e8eef8', fontSize: 11, outline: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#8fa4c0', display: 'block', marginBottom: 6 }}>Tags (comma-separated)</label>
                  <input
                    value={saveTags}
                    onChange={(e) => setSaveTags(e.target.value)}
                    placeholder="e.g. starter, aggressive, ai-native"
                    style={{ width: '100%', padding: '8px 10px', background: '#080b14', border: '1px solid #1e2a40', borderRadius: 8, color: '#e8eef8', fontSize: 11, outline: 'none' }}
                  />
                </div>

                {/* Canvas preview stats */}
                <div style={{ background: '#080b14', border: '1px solid #1e2a40', borderRadius: 10, padding: '10px 14px' }}>
                  <p style={{ fontSize: 10, color: '#4a6080', margin: '0 0 6px', fontWeight: 600 }}>Canvas snapshot</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[{ label: 'Nodes', v: nodes.length }, { label: 'Edges', v: edges.length }].map((s) => (
                      <div key={s.label}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#818cf8' }}>{s.v}</div>
                        <div style={{ fontSize: 9, color: '#4a6080' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #1e2a40', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={closeLibrary}
            style={{ padding: '8px 18px', background: 'none', border: '1px solid #243249', borderRadius: 8, color: '#8fa4c0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Close
          </button>
          {view === 'save' && (
            <button
              onClick={handleSave}
              disabled={!saveName.trim() || nodes.length === 0}
              style={{
                padding: '8px 20px',
                background: !saveName.trim() || nodes.length === 0 ? '#1e2a40' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: 8,
                color: !saveName.trim() || nodes.length === 0 ? '#4a6080' : '#fff',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: !saveName.trim() || nodes.length === 0 ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
              }}
            >
              Save Blueprint
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
