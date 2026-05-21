'use client';
/**
 * SWARM FORGE — Main App Page
 * Assembles: TopBar + PaletteSidebar + Canvas + NodeInspector + all modals
 */

import dynamic from 'next/dynamic';
import { useSwarmStore } from '@/lib/store';
import PaletteSidebar from '@/components/palette-sidebar';
import NodeInspector from '@/components/node-inspector';
import SLAModal from '@/components/sla-modal';
import ArchitectureLibrary from '@/components/architecture-library';
import DeployModal from '@/components/deploy-modal';
import {
  Rocket, BookOpen, Trash2, Settings, GitBranch,
  Layers, LayoutDashboard, ChevronDown,
} from 'lucide-react';

// Dynamic import for React Flow (client-only)
const CanvasBuilder = dynamic(() => import('@/components/canvas-builder'), { ssr: false });

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar() {
  const {
    nodes, edges, clearCanvas,
    openLibrary, openDeploy,
    companyName, companyType, seedBudgetUsd, setCompanyMeta,
  } = useSwarmStore();

  const COMPANY_TYPES = ['saas', 'e-course', 'd2c', 'media', 'coaching', 'marketplace', 'agency'];

  return (
    <div style={{
      height: 52,
      background: '#0a0e1a',
      borderBottom: '1px solid #1e2a40',
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      gap: 10,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 16px rgba(99,102,241,0.4)',
        }}>
          <Layers size={15} style={{ color: '#fff' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#e8eef8', lineHeight: 1 }}>Swarm Forge</div>
          <div style={{ fontSize: 8.5, color: '#4a6080', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Visual IDE for Capitalism</div>
        </div>
      </div>

      <div style={{ width: 1, height: 28, background: '#1e2a40', marginRight: 2 }} />

      {/* Company name */}
      <input
        value={companyName}
        onChange={(e) => setCompanyMeta(e.target.value, companyType, seedBudgetUsd)}
        placeholder="Company name…"
        style={{
          background: 'none', border: 'none', borderBottom: '1px solid #1e2a40',
          color: '#e8eef8', fontSize: 12, fontWeight: 600, outline: 'none',
          padding: '2px 0', width: 160,
        }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderBottomColor = '#6366f1'; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.borderBottomColor = '#1e2a40'; }}
      />

      {/* Company type dropdown */}
      <div style={{ position: 'relative' }}>
        <select
          value={companyType}
          onChange={(e) => setCompanyMeta(companyName, e.target.value, seedBudgetUsd)}
          style={{
            background: '#0d1120', border: '1px solid #1e2a40',
            borderRadius: 6, color: '#8fa4c0', fontSize: 11, outline: 'none',
            padding: '4px 22px 4px 8px', appearance: 'none', cursor: 'pointer',
          }}
        >
          {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <ChevronDown size={10} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: '#4a6080', pointerEvents: 'none' }} />
      </div>

      {/* Budget */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#0d1120', border: '1px solid #1e2a40', borderRadius: 6, padding: '4px 8px' }}>
        <span style={{ fontSize: 10, color: '#4a6080' }}>$</span>
        <input
          type="number"
          value={seedBudgetUsd}
          onChange={(e) => setCompanyMeta(companyName, companyType, Number(e.target.value))}
          style={{ background: 'none', border: 'none', color: '#e8eef8', fontSize: 11, outline: 'none', width: 70 }}
        />
      </div>

      {/* Stats chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <LayoutDashboard size={11} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: 11, color: '#4a6080' }}>{nodes.length} nodes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <GitBranch size={11} style={{ color: '#06b6d4' }} />
          <span style={{ fontSize: 11, color: '#4a6080' }}>{edges.length} edges</span>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Clear */}
        {nodes.length > 0 && (
          <button
            onClick={() => { if (confirm('Clear the canvas? This cannot be undone.')) clearCanvas(); }}
            title="Clear canvas"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px',
              background: 'none', border: '1px solid #1e2a40',
              borderRadius: 7, color: '#4a6080', fontSize: 11, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#f43f5e';
              (e.currentTarget as HTMLButtonElement).style.color = '#f43f5e';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e2a40';
              (e.currentTarget as HTMLButtonElement).style.color = '#4a6080';
            }}
          >
            <Trash2 size={12} /> Clear
          </button>
        )}

        {/* Blueprint Library */}
        <button
          onClick={openLibrary}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px',
            background: '#0d1120', border: '1px solid #243249',
            borderRadius: 7, color: '#8fa4c0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366f1';
            (e.currentTarget as HTMLButtonElement).style.color = '#818cf8';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#243249';
            (e.currentTarget as HTMLButtonElement).style.color = '#8fa4c0';
          }}
        >
          <BookOpen size={13} /> Library
        </button>

        {/* Deploy */}
        <button
          onClick={openDeploy}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 18px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none', borderRadius: 8,
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
            transition: 'opacity 0.15s, transform 0.1s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >
          <Rocket size={14} /> Instantiate Company
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SwarmForgePage() {
  const { inspector, slaModal, addEdge: storeAddEdge, updateEdgeData, closeSLAModal, removeEdge } = useSwarmStore();

  const handleSLAConfirm = (edgeId: string, data: Parameters<typeof updateEdgeData>[1]) => {
    updateEdgeData(edgeId, data);
  };

  const handleSLACancel = () => {
    // If this was a new edge (pending), remove it since user cancelled
    const { slaModal: modal, edges, removeEdge: rm } = useSwarmStore.getState();
    if (modal.pendingEdgeId) {
      rm(modal.pendingEdgeId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Palette */}
        <PaletteSidebar />

        {/* Center: Canvas */}
        <CanvasBuilder />

        {/* Right: Inspector (conditionally shown) */}
        {inspector.isOpen && inspector.selectedNodeId && (
          <NodeInspector />
        )}
      </div>

      {/* Modals */}
      <SLAModal onConfirm={handleSLAConfirm} onCancel={handleSLACancel} />
      <ArchitectureLibrary />
      <DeployModal />
    </div>
  );
}
