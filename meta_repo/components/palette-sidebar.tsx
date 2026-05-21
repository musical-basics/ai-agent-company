'use client';
/**
 * SWARM FORGE — Asset Palette Sidebar
 * Left panel with draggable agent, manager, tool, and adapter tiles.
 */

import { useState, useCallback } from 'react';
import { Brain, Network, Wrench, Zap, Crown, Search, ChevronDown, ChevronRight, Package } from 'lucide-react';
import { NODE_COLORS, CATEGORY_COLORS } from '@/lib/utils';
import { PALETTE_WORKERS, PALETTE_MANAGERS, PALETTE_TOOLS, FRAMEWORK_ADAPTERS } from '@/lib/registry';
import type { PaletteItem } from '@/lib/types';

// ─── Drag Helpers ──────────────────────────────────────────────────────────────

function onDragStart(event: React.DragEvent, item: PaletteItem) {
  event.dataTransfer.setData('application/swarm-node', JSON.stringify(item));
  event.dataTransfer.effectAllowed = 'move';
}

// ─── Palette Tile ──────────────────────────────────────────────────────────────

interface PaletteTileProps {
  item: PaletteItem;
  icon: React.ReactNode;
}

function PaletteTile({ item, icon }: PaletteTileProps) {
  const colors = NODE_COLORS[item.kind] || NODE_COLORS.worker;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      title={item.description}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px',
        background: '#0d1120',
        border: `1px solid #1e2a40`,
        borderRadius: 8,
        cursor: 'grab',
        userSelect: 'none',
        transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = '#131927';
        (e.currentTarget as HTMLDivElement).style.borderColor = colors.border;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = '#0d1120';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#1e2a40';
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: colors.badge, color: colors.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#e8eef8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.label}
        </div>
        <div style={{ fontSize: 9.5, color: '#4a6080', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.description.slice(0, 38)}{item.description.length > 38 ? '…' : ''}
        </div>
      </div>
    </div>
  );
}

// ─── Collapsible Section ────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, count, icon, color, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', padding: '6px 0',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#8fa4c0',
        }}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span style={{ color, flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', flex: 1, textAlign: 'left' }}>
          {title}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 700, color: '#4a6080',
          background: '#0d1120', padding: '1px 6px', borderRadius: 10,
        }}>
          {count}
        </span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── CEO Droppable ─────────────────────────────────────────────────────────────

function CEOTile() {
  const ceoPaletteItem: PaletteItem = {
    id: 'ceo',
    kind: 'ceo',
    label: 'AI CEO',
    description: 'Apex Reasoning Agent — HTN planning + Goldilocks governance',
    defaultData: {
      kind: 'ceo',
      label: 'AI CEO',
      modelProvider: 'openai',
      modelId: 'gpt-4o',
      directivesFile: 'minds/global/chairman_directives.md',
      cultureFile: 'minds/global/company_culture.md',
      maxPhaseCount: 5,
      budgetAlertThresholdPct: 75,
    },
  };

  return (
    <PaletteTile
      item={ceoPaletteItem}
      icon={<Crown size={14} />}
    />
  );
}

// ─── Main Palette Sidebar ──────────────────────────────────────────────────────

export default function PaletteSidebar() {
  const [search, setSearch] = useState('');

  const filter = useCallback((items: PaletteItem[]) => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) => i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredWorkers = filter(PALETTE_WORKERS);
  const filteredManagers = filter(PALETTE_MANAGERS);
  const filteredTools = filter(PALETTE_TOOLS);

  const adapterItems: PaletteItem[] = FRAMEWORK_ADAPTERS.filter((f) => !f.isNative).map((f) => ({
    id: f.id,
    kind: 'adapter' as const,
    label: f.name,
    description: f.description,
    defaultData: {
      kind: 'adapter' as const,
      adapterId: f.id,
      name: f.name,
      framework: f.id as PaletteItem['defaultData'] extends { framework?: infer F } ? F : never,
      description: f.description,
    },
  }));

  const filteredAdapters = filter(adapterItems);

  return (
    <div style={{
      width: 240,
      height: '100%',
      background: '#0a0e1a',
      borderRight: '1px solid #1e2a40',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid #1e2a40' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Package size={14} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#e8eef8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Asset Palette
          </span>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={11} style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            color: '#4a6080',
          }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets…"
            style={{
              width: '100%', padding: '6px 8px 6px 26px',
              background: '#0d1120', border: '1px solid #1e2a40',
              borderRadius: 6, color: '#e8eef8', fontSize: 11,
              outline: 'none',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#6366f1'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#1e2a40'; }}
          />
        </div>
        <p style={{ fontSize: 9.5, color: '#2d4060', margin: '8px 0 0', lineHeight: 1.4 }}>
          Drag tiles onto the canvas to add agents
        </p>
      </div>

      {/* Sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>

        {/* CEO */}
        <Section title="Command" count={1} icon={<Crown size={11} />} color="#f43f5e" defaultOpen>
          <CEOTile />
        </Section>

        <div style={{ height: 1, background: '#1e2a40', margin: '6px 0' }} />

        {/* Workers */}
        {filteredWorkers.length > 0 && (
          <Section title="Workers" count={filteredWorkers.length} icon={<Brain size={11} />} color="#6366f1" defaultOpen>
            {filteredWorkers.map((item) => (
              <PaletteTile key={item.id} item={item} icon={<Brain size={14} />} />
            ))}
          </Section>
        )}

        {/* Managers */}
        {filteredManagers.length > 0 && (
          <Section title="Managers" count={filteredManagers.length} icon={<Network size={11} />} color="#8b5cf6">
            {filteredManagers.map((item) => (
              <PaletteTile key={item.id} item={item} icon={<Network size={14} />} />
            ))}
          </Section>
        )}

        <div style={{ height: 1, background: '#1e2a40', margin: '6px 0' }} />

        {/* Tools */}
        {filteredTools.length > 0 && (
          <Section title="API Tools" count={filteredTools.length} icon={<Wrench size={11} />} color="#06b6d4" defaultOpen={false}>
            {filteredTools.map((item) => (
              <PaletteTile key={item.id} item={item} icon={<Wrench size={14} />} />
            ))}
          </Section>
        )}

        {/* Adapters */}
        {filteredAdapters.length > 0 && (
          <Section title="Frameworks" count={filteredAdapters.length} icon={<Zap size={11} />} color="#f59e0b" defaultOpen={false}>
            {filteredAdapters.map((item) => (
              <PaletteTile key={item.id} item={item} icon={<Zap size={14} />} />
            ))}
          </Section>
        )}

        {filteredWorkers.length === 0 && filteredManagers.length === 0 && filteredTools.length === 0 && filteredAdapters.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 8px', color: '#2d4060', fontSize: 11 }}>
            No assets match "{search}"
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid #1e2a40',
        fontSize: 9, color: '#2d4060', lineHeight: 1.5,
      }}>
        <span style={{ color: '#4a6080' }}>Tip:</span> Connect nodes to define SLA handshakes between departments
      </div>
    </div>
  );
}
