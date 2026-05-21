'use client';
/**
 * CHAIRMAN OS — Sidebar
 * Company status, channel list, worker roster, budget burn.
 */

import {
  Hash, Radio, Building2, Zap, Brain, Network, Crown, Wrench,
  ChevronDown, ChevronRight, Circle, AlertTriangle, Wifi, WifiOff,
} from 'lucide-react';
import { useChairmanStore } from '@/lib/store';
import type { Agent } from '@/lib/types';

const AGENT_KIND_ICON: Record<Agent['kind'], React.ReactNode> = {
  ceo:     <Crown size={10} />,
  manager: <Network size={10} />,
  worker:  <Brain size={10} />,
  tool:    <Wrench size={10} />,
  system:  <Zap size={10} />,
};

const AGENT_STATUS_COLOR: Record<Agent['status'], string> = {
  active:  'var(--green)',
  idle:    '#3d5470',
  error:   'var(--red)',
  offline: '#1e3050',
};

function StatusDot({ status }: { status: Agent['status'] }) {
  return (
    <div style={{
      width: 6, height: 6, borderRadius: '50%',
      background: AGENT_STATUS_COLOR[status],
      flexShrink: 0,
      ...(status === 'active' ? { boxShadow: `0 0 5px var(--green)` } : {}),
    }} />
  );
}

export default function Sidebar() {
  const { channels, agents, filters, setFilter, events } = useChairmanStore();

  const activeAgents   = agents.filter((a) => a.status === 'active').length;
  const errorAgents    = agents.filter((a) => a.status === 'error').length;
  const flaggedCount   = events.filter((e) => e.flaggedByChairman).length;
  const pendingCount   = events.filter((e) => e.status === 'pending').length;

  const allUnread = channels.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div style={{
      width: 'var(--sidebar-w)',
      height: '100%',
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
    }}>

      {/* ── Company header ── */}
      <div style={{
        padding: '14px 12px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, #0a1525 0%, var(--bg-panel) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg, #003d4d, #001a26)',
            border: '1px solid var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)',
            flexShrink: 0,
          }}>
            <Building2 size={14} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Musical Basics
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <div className="live-dot" />
              <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 600, letterSpacing: '0.04em' }}>SWARM ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {[
            { label: `${activeAgents} active`, color: 'var(--green)',  bg: 'var(--green-dim)' },
            ...(errorAgents > 0 ? [{ label: `${errorAgents} error`, color: 'var(--red)', bg: 'var(--red-dim)' }] : []),
            ...(flaggedCount > 0 ? [{ label: `${flaggedCount} flagged`, color: '#ff7c3a', bg: '#2a1505' }] : []),
          ].map((p) => (
            <span key={p.label} style={{
              fontSize: 9, fontWeight: 700,
              color: p.color, background: p.bg,
              padding: '2px 6px', borderRadius: 4,
            }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>

        {/* Channels */}
        <div style={{ padding: '6px 12px 4px', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Channels
        </div>

        {channels.map((ch) => {
          const isActive = filters.channelId === ch.id || (ch.id === 'all' && !filters.channelId);
          const count = ch.id === 'all' ? allUnread : (ch.unreadCount || 0);
          return (
            <button
              key={ch.id}
              onClick={() => setFilter('channelId', ch.id === 'all' ? null : ch.id)}
              className={`channel-item ${isActive ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', border: 'none', background: isActive ? 'var(--accent-dim)' : 'none', cursor: 'pointer' }}
            >
              <Hash size={11} style={{ flexShrink: 0, opacity: 0.6 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                {ch.name}
              </span>
              {count > 0 && (
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  background: isActive ? 'var(--accent)' : 'var(--accent-dim)',
                  color: isActive ? '#000' : 'var(--accent)',
                  padding: '1px 5px', borderRadius: 10,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '8px 12px' }} />

        {/* Quick filters */}
        <div style={{ padding: '0 12px 4px', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Quick Filters
        </div>

        {[
          { label: `🚩 Flagged (${flaggedCount})`, action: () => setFilter('showFlaggedOnly', !filters.showFlaggedOnly), active: filters.showFlaggedOnly },
          { label: `⏳ Pending (${pendingCount})`, action: () => setFilter('status', filters.status === 'pending' ? 'all' : 'pending'), active: filters.status === 'pending' },
          { label: '❌ Rejected', action: () => setFilter('status', filters.status === 'rejected' ? 'all' : 'rejected'), active: filters.status === 'rejected' },
        ].map((f) => (
          <button
            key={f.label}
            onClick={f.action}
            style={{
              width: '100%', textAlign: 'left', border: 'none',
              background: f.active ? 'var(--bg-hover)' : 'none',
              padding: '5px 12px', cursor: 'pointer',
              fontSize: 11, color: f.active ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderRadius: 6, margin: '1px 0',
            }}
          >
            {f.label}
          </button>
        ))}

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '8px 12px' }} />

        {/* Agent Roster */}
        <div style={{ padding: '0 12px 4px', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Worker Roster
        </div>

        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setFilter('agentId', filters.agentId === agent.id ? null : agent.id)}
            style={{
              width: '100%', textAlign: 'left', border: 'none',
              background: filters.agentId === agent.id ? 'var(--bg-hover)' : 'none',
              padding: '5px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7,
              borderRadius: 6, margin: '1px 0',
            }}
          >
            <StatusDot status={agent.status} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: filters.agentId === agent.id ? 600 : 400 }}>
                {agent.name.replace(' Worker', '').replace(' (AI CEO)', '')}
              </div>
              {agent.currentTask && (
                <div style={{ fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {agent.currentTask}
                </div>
              )}
            </div>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
              {AGENT_KIND_ICON[agent.kind]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Budget meter (footer) ── */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-base)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Budget</span>
          <span style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 700 }}>$847 / $2,000</span>
        </div>
        <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 2 }}>
          <div style={{
            height: '100%', borderRadius: 2, width: '42%',
            background: 'linear-gradient(to right, var(--accent), var(--green))',
            boxShadow: '0 0 6px rgba(0,212,255,0.4)',
          }} />
        </div>
        <div style={{ fontSize: 8.5, color: 'var(--text-muted)', marginTop: 4 }}>
          42% used · 10 days remaining
        </div>
      </div>
    </div>
  );
}
