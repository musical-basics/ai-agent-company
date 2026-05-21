'use client';
/**
 * CHAIRMAN OS — Event Card
 * Renders a single Dual-Payload Swarm Envelope as a message in the feed.
 * Shows nl_summary + collapsible artifact + Flag button.
 */

import { useState, useRef } from 'react';
import {
  Flag, ArrowRight, RotateCcw, Brain, Network, Crown, Wrench, Zap,
  RefreshCw, GitBranch, Shield, AlertCircle, CheckCircle, Clock,
  ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ArtifactWidget from './artifact-widget';
import { useChairmanStore } from '@/lib/store';
import type { SwarmEvent, Agent } from '@/lib/types';

// ─── Agent Avatar ────────────────────────────────────────────────────────────

const KIND_COLORS: Record<Agent['kind'], { bg: string; text: string; border: string }> = {
  ceo:     { bg: '#2a0010', text: '#ff3d5a', border: '#ff3d5a30' },
  manager: { bg: '#1a0d33', text: '#9d6ff0', border: '#9d6ff030' },
  worker:  { bg: '#003d4d', text: '#00d4ff', border: '#00d4ff30' },
  tool:    { bg: '#002918', text: '#00e5a0', border: '#00e5a030' },
  system:  { bg: '#1a1a1a', text: '#7a96b8', border: '#7a96b820' },
};

const KIND_ICON: Record<Agent['kind'], React.ReactNode> = {
  ceo:     <Crown size={12} />,
  manager: <Network size={12} />,
  worker:  <Brain size={12} />,
  tool:    <Wrench size={12} />,
  system:  <Zap size={12} />,
};

function AgentAvatar({ agentId, size = 28 }: { agentId: string; size?: number }) {
  const { getAgent } = useChairmanStore();
  const agent = getAgent(agentId);
  const kind: Agent['kind'] = agent?.kind || 'worker';
  const colors = KIND_COLORS[kind];
  const initials = agentId.slice(0, 2).toUpperCase();

  return (
    <div
      title={agent?.name || agentId}
      style={{
        width: size, height: size, borderRadius: size * 0.3,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontSize: size * 0.35,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {KIND_ICON[kind]}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SwarmEvent['status'] }) {
  const ICONS: Record<SwarmEvent['status'], React.ReactNode> = {
    pending:    <Clock size={8} />,
    delivered:  <CheckCircle size={8} />,
    rejected:   <AlertCircle size={8} />,
    flagged:    <Flag size={8} />,
    replayed:   <RefreshCw size={8} />,
    processing: <Zap size={8} />,
  };
  return (
    <span className={`status-badge status-${status}`}>
      {ICONS[status]}
      {status}
    </span>
  );
}

// ─── Event Type Badge ─────────────────────────────────────────────────────────

function EventTypeBadge({ type }: { type: SwarmEvent['eventType'] }) {
  const MAP: Record<SwarmEvent['eventType'], { label: string; color: string }> = {
    artifact_handoff:       { label: 'Handoff',     color: 'var(--accent)' },
    sla_violation:          { label: 'SLA Violation', color: 'var(--red)' },
    ceo_directive:          { label: 'CEO Directive', color: 'var(--agent-ceo)' },
    sop_update:             { label: 'SOP Update',  color: 'var(--amber)' },
    heartbeat:              { label: 'Heartbeat',   color: 'var(--text-muted)' },
    escalation:             { label: 'Escalation',  color: '#ff7c3a' },
    chairman_intervention:  { label: 'Intervention', color: 'var(--green)' },
  };
  const { label, color } = MAP[type] || { label: type, color: 'var(--text-muted)' };
  return (
    <span style={{
      fontSize: 9, fontWeight: 600,
      color, opacity: 0.8,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {label}
    </span>
  );
}

// ─── Main Event Card ─────────────────────────────────────────────────────────

interface EventCardProps {
  event: SwarmEvent;
  onFlagClick: (eventId: string) => void;
  onInterventionClick: (interventionId: string) => void;
}

export default function EventCard({ event, onFlagClick, onInterventionClick }: EventCardProps) {
  const { getAgent } = useChairmanStore();
  const [hovered, setHovered] = useState(false);

  const sender   = getAgent(event.senderId);
  const receiver = getAgent(event.receiverId);
  const senderName   = sender?.name.replace(' Worker', '').replace(' (AI CEO)', '') || event.senderId;
  const receiverName = receiver?.name.replace(' Worker', '').replace(' (AI CEO)', '') || event.receiverId;

  const isReplay   = !!event.replayOfEventId;
  const isFlagged  = event.flaggedByChairman;
  const hasIntervention = !!event.interventionId;

  const diff = (event.artifact?.payload?.diff as string | undefined);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="animate-fade-up"
      style={{
        background: isFlagged ? '#1a0a0530' : isReplay ? '#0a1a0a30' : 'var(--bg-card)',
        border: `1px solid ${isFlagged ? '#ff7c3a20' : isReplay ? '#00e5a020' : 'var(--border-subtle)'}`,
        borderLeft: `3px solid ${isFlagged ? '#ff7c3a' : isReplay ? 'var(--green)' : event.status === 'rejected' ? 'var(--red)' : event.status === 'delivered' ? 'var(--border-strong)' : 'var(--accent)'}`,
        borderRadius: '0 8px 8px 0',
        padding: '12px 14px',
        transition: 'background 0.15s, border-color 0.15s',
        position: 'relative',
      }}
    >
      {/* ── Replay ribbon ── */}
      {isReplay && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          marginBottom: 8,
          fontSize: 9, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.06em',
        }}>
          <RefreshCw size={9} />
          REPLAY — Re-sent through hardened SLA pipeline
          {hasIntervention && (
            <button
              onClick={() => onInterventionClick(event.interventionId!)}
              style={{
                marginLeft: 4, fontSize: 9, color: 'var(--green)',
                background: 'var(--green-dim)', border: '1px solid #00e5a020',
                borderRadius: 4, padding: '1px 6px', cursor: 'pointer',
              }}
            >
              View Fix →
            </button>
          )}
        </div>
      )}

      {/* ── CEO directive ribbon ── */}
      {event.eventType === 'ceo_directive' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          marginBottom: 8,
          fontSize: 9, color: 'var(--agent-ceo)', fontWeight: 700, letterSpacing: '0.06em',
        }}>
          <Crown size={9} />
          CEO DIRECTIVE
        </div>
      )}

      {/* ── SOP update ribbon ── */}
      {event.eventType === 'sop_update' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          marginBottom: 8,
          fontSize: 9, color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.06em',
        }}>
          <GitBranch size={9} />
          SOP / SLA REWRITTEN BY AI CEO
        </div>
      )}

      {/* ── Header row: sender → receiver ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <AgentAvatar agentId={event.senderId} />

        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{senderName}</span>
        </div>

        <ArrowRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

        <AgentAvatar agentId={event.receiverId} />
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{receiverName}</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Status + type + time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <EventTypeBadge type={event.eventType} />
          <StatusBadge status={event.status} />
          {event.slaId && (
            <div title={`SLA: ${event.slaId}`} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Shield size={9} style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
          <span style={{ fontSize: 9.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
          </span>
        </div>

        {/* Flag button (appears on hover) */}
        {hovered && !isFlagged && event.status !== 'replayed' && (
          <button
            onClick={() => onFlagClick(event.id)}
            title="Flag this handshake"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px',
              background: '#2a1505', border: '1px solid #ff7c3a40',
              borderRadius: 5,
              color: '#ff7c3a', fontSize: 9.5, fontWeight: 700,
              cursor: 'pointer', flexShrink: 0,
              animation: 'fadeSlideRight 0.15s ease forwards',
            }}
          >
            <Flag size={9} /> Flag
          </button>
        )}
      </div>

      {/* ── nl_summary (the human-readable message) ── */}
      <p style={{
        fontSize: 12.5, lineHeight: 1.65,
        color: 'var(--text-secondary)',
        margin: '0 0 6px',
        letterSpacing: '-0.01em',
      }}>
        {event.nlSummary}
      </p>

      {/* ── Flagged note ── */}
      {isFlagged && event.chairmanNote && (
        <div style={{
          background: '#2a1505', border: '1px solid #ff7c3a30',
          borderRadius: 6, padding: '7px 10px', marginBottom: 6,
          display: 'flex', gap: 7, alignItems: 'flex-start',
        }}>
          <Flag size={10} style={{ color: '#ff7c3a', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 9, color: '#ff7c3a', fontWeight: 700, marginBottom: 2 }}>CHAIRMAN'S NOTE</div>
            <p style={{ fontSize: 11.5, color: '#cc8844', margin: 0, lineHeight: 1.5 }}>
              "{event.chairmanNote}"
            </p>
          </div>
          {event.interventionId && (
            <button
              onClick={() => onInterventionClick(event.interventionId!)}
              style={{
                marginLeft: 'auto', flexShrink: 0,
                padding: '4px 8px',
                background: 'var(--green-dim)', border: '1px solid #00e5a030',
                borderRadius: 5, color: 'var(--green)', fontSize: 9.5,
                fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              View Fix <ChevronRight size={9} />
            </button>
          )}
        </div>
      )}

      {/* ── Rejection reason ── */}
      {event.status === 'rejected' && event.rejectionReason && (
        <div style={{
          background: 'var(--red-dim)', border: '1px solid #ff3d5a20',
          borderRadius: 6, padding: '6px 10px', marginBottom: 6,
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <AlertCircle size={10} style={{ color: 'var(--red)', flexShrink: 0 }} />
          <span style={{ fontSize: 10.5, color: '#ff6b82' }}>{event.rejectionReason}</span>
        </div>
      )}

      {/* ── Artifact widget ── */}
      <ArtifactWidget
        artifact={event.artifact}
        diff={diff}
        defaultCollapsed={true}
        compact
      />
    </div>
  );
}
