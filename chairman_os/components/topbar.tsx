'use client';
/**
 * CHAIRMAN OS — Top Bar
 * Global search, filter pills, event rate meter, and company selector.
 */

import { Search, SlidersHorizontal, X, Zap, Activity } from 'lucide-react';
import { useChairmanStore } from '@/lib/store';
import type { EventStatus } from '@/lib/types';

const STATUS_FILTERS: { label: string; value: EventStatus | 'all' }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Rejected',  value: 'rejected' },
  { label: 'Flagged',   value: 'flagged' },
  { label: 'Replayed',  value: 'replayed' },
];

export default function TopBar() {
  const { filters, setFilter, resetFilters, events } = useChairmanStore();

  const eventsLastMin = events.filter(
    (e) => Date.now() - new Date(e.timestamp).getTime() < 60000
  ).length;

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.showFlaggedOnly ||
    !!filters.agentId ||
    !!filters.search;

  return (
    <div style={{
      height: 50,
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      gap: 10,
      flexShrink: 0,
    }}>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: 'var(--bg-base)',
        border: '1px solid var(--border-medium)',
        borderRadius: 7,
        padding: '5px 10px',
        width: 220,
        flexShrink: 0,
      }}>
        <Search size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Search events…"
          style={{
            background: 'none', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 11, width: '100%',
          }}
        />
        {filters.search && (
          <button
            onClick={() => setFilter('search', '')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 4 }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter('status', f.value)}
            style={{
              padding: '4px 10px',
              background: filters.status === f.value ? 'var(--accent-dim)' : 'none',
              border: `1px solid ${filters.status === f.value ? 'var(--accent)' : 'var(--border-subtle)'}`,
              borderRadius: 5,
              color: filters.status === f.value ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 10.5, fontWeight: filters.status === f.value ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 8px',
            background: 'none', border: '1px solid var(--border-subtle)',
            borderRadius: 5, color: 'var(--text-muted)',
            fontSize: 10, cursor: 'pointer',
          }}
        >
          <X size={9} /> Clear
        </button>
      )}

      <div style={{ flex: 1 }} />

      {/* Event rate */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Activity size={12} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
          {eventsLastMin} event{eventsLastMin !== 1 ? 's' : ''}/min
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />

      {/* Total events */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Zap size={11} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{events.length}</strong> total events
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />

      {/* Live badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div className="live-dot" />
        <span style={{ fontSize: 9.5, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.06em' }}>
          LIVE · 3s POLL
        </span>
      </div>
    </div>
  );
}
