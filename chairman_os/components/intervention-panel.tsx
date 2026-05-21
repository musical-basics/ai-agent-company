'use client';
/**
 * CHAIRMAN OS — Intervention Panel
 * Right-side drawer showing the AI CEO's surgical fix in progress and result.
 * Shows: diagnosis → diff → git commit → replay status
 */

import { useState } from 'react';
import {
  X, Brain, GitBranch, Check, RefreshCw, ExternalLink,
  Loader2, ChevronDown, ChevronRight, Copy, CheckCheck, Rocket,
} from 'lucide-react';
import { useChairmanStore } from '@/lib/store';
import ArtifactWidget from './artifact-widget';
import type { Intervention } from '@/lib/types';

// ─── Status step tracker ──────────────────────────────────────────────────────

const STEPS: { key: Intervention['status']; label: string }[] = [
  { key: 'diagnosing',  label: 'AI CEO diagnosing failure'  },
  { key: 'rewriting',   label: 'Rewriting SLA/RUNBOOK'      },
  { key: 'committing',  label: 'Pushing git commit'          },
  { key: 'replaying',   label: 'Replaying event'             },
  { key: 'complete',    label: 'Intervention complete'       },
];

const STATUS_ORDER = ['pending', 'diagnosing', 'rewriting', 'committing', 'replaying', 'complete', 'failed'];

function StepTracker({ status }: { status: Intervention['status'] }) {
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
      {STEPS.map((step, i) => {
        const stepIdx = STATUS_ORDER.indexOf(step.key);
        const done    = currentIdx > stepIdx || status === 'complete';
        const active  = currentIdx === stepIdx;
        const pending = currentIdx < stepIdx && status !== 'failed';

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: done
                ? 'var(--green-dim)'
                : active
                ? 'var(--accent-dim)'
                : 'var(--bg-base)',
              border: `1.5px solid ${done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--border-subtle)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.3s',
            }}>
              {done && <Check size={10} style={{ color: 'var(--green)' }} />}
              {active && <Loader2 size={10} style={{ color: 'var(--accent)', animation: 'spinSlow 1.5s linear infinite' }} />}
            </div>
            <span style={{
              fontSize: 11,
              color: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: done || active ? 600 : 400,
              transition: 'color 0.3s',
            }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Diff Viewer (inline) ─────────────────────────────────────────────────────

function InlineDiff({ diff }: { diff: string }) {
  const [copied, setCopied] = useState(false);
  const lines = diff.split('\n');

  const copy = () => {
    navigator.clipboard.writeText(diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'var(--bg-base)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        padding: '7px 10px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <GitBranch size={11} style={{ color: 'var(--amber)' }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--amber)' }}>SLA Diff</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={copy}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 9 }}
        >
          {copied ? <CheckCheck size={9} style={{ color: 'var(--green)' }} /> : <Copy size={9} />}
        </button>
      </div>
      <div style={{ padding: '8px 0', maxHeight: 220, overflowY: 'auto' }}>
        <pre style={{ margin: 0, fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.7 }}>
          {lines.map((line, i) => {
            if (line.startsWith('+') && !line.startsWith('+++')) return <span key={i} className="diff-add">{line}</span>;
            if (line.startsWith('-') && !line.startsWith('---')) return <span key={i} className="diff-del">{line}</span>;
            if (line.startsWith('@@')) return <span key={i} style={{ color: 'var(--violet)', display: 'block', padding: '0 8px' }}>{line}</span>;
            return <span key={i} className="diff-ctx">{line}</span>;
          })}
        </pre>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function InterventionPanel() {
  const {
    selectedInterventionId, interventionPanelOpen, closeIntervention,
    interventions, events, addEvent, updateEvent,
  } = useChairmanStore();

  const [diagnosisOpen, setDiagnosisOpen] = useState(true);
  const [slaOpen, setSlaOpen] = useState(false);
  const [replayDone, setReplayDone] = useState(false);
  const [replaying, setReplaying] = useState(false);

  const intervention = interventions.find((i) => i.id === selectedInterventionId);
  const sourceEvent  = intervention ? events.find((e) => e.id === intervention.eventId) : undefined;

  const handleReplay = async () => {
    if (!intervention || !sourceEvent) return;
    setReplaying(true);
    try {
      const res = await fetch('/api/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalEventId: sourceEvent.id,
          interventionId: intervention.id,
          artifact: sourceEvent.artifact,
          senderId: sourceEvent.senderId,
          receiverId: sourceEvent.receiverId,
          channelId: sourceEvent.channelId,
          slaId: sourceEvent.slaId,
        }),
      });
      if (res.ok) {
        const { event } = await res.json();
        addEvent(event);
        setReplayDone(true);
      }
    } catch { /* ignore */ }
    setReplaying(false);
  };

  if (!interventionPanelOpen || !intervention) return null;

  return (
    <div
      className="animate-fade-right"
      style={{
        width: 380,
        height: '100%',
        background: 'var(--bg-panel)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, #0d1a10 0%, var(--bg-panel) 100%)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'var(--green-dim)', border: '1px solid #00e5a030',
          color: 'var(--green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Brain size={16} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
            AI CEO Intervention
          </div>
          <div style={{ fontSize: 9, color: 'var(--green)', fontWeight: 600, marginTop: 1 }}>
            {intervention.status === 'complete' ? '✓ COMPLETE' : intervention.status.toUpperCase()}
          </div>
        </div>
        <button onClick={closeIntervention} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

        {/* Chairman's note */}
        <div style={{
          background: '#2a1505', border: '1px solid #ff7c3a20',
          borderRadius: 8, padding: '9px 12px', marginBottom: 14,
        }}>
          <div style={{ fontSize: 9, color: '#ff7c3a', fontWeight: 700, marginBottom: 4 }}>CHAIRMAN'S DIRECTIVE</div>
          <p style={{ fontSize: 11.5, color: '#cc8844', margin: 0, lineHeight: 1.5 }}>
            "{intervention.chairmanNote}"
          </p>
        </div>

        {/* Step tracker */}
        <StepTracker status={intervention.status} />

        {/* Diagnosis */}
        {intervention.diagnosis && (
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => setDiagnosisOpen(!diagnosisOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 6,
              }}
            >
              {diagnosisOpen ? <ChevronDown size={11} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={11} style={{ color: 'var(--text-muted)' }} />}
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                AI CEO Diagnosis
              </span>
            </button>
            {diagnosisOpen && (
              <div style={{
                background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                borderRadius: 8, padding: '10px 12px',
              }}>
                <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
                  {intervention.diagnosis}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Diff */}
        {intervention.diff && (
          <div style={{ marginBottom: 12 }}>
            <InlineDiff diff={intervention.diff} />
          </div>
        )}

        {/* Git commit */}
        {intervention.gitCommitSha && (
          <div style={{
            background: 'var(--green-dim)', border: '1px solid #00e5a020',
            borderRadius: 8, padding: '9px 12px', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <GitBranch size={13} style={{ color: 'var(--green)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700, marginBottom: 2 }}>GIT COMMIT PUSHED</div>
              <code style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>
                {intervention.gitCommitSha}
              </code>
            </div>
            {intervention.gitCommitUrl && (
              <a
                href={intervention.gitCommitUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--green)', display: 'flex', alignItems: 'center' }}
              >
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {/* Rewritten SLA */}
        {intervention.rewrittenSla && (
          <div style={{ marginBottom: 14 }}>
            <button
              onClick={() => setSlaOpen(!slaOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 6,
              }}
            >
              {slaOpen ? <ChevronDown size={11} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={11} style={{ color: 'var(--text-muted)' }} />}
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Rewritten SLA
              </span>
            </button>
            {slaOpen && (
              <pre className="artifact-code" style={{ fontSize: 10, maxHeight: 240 }}>
                {intervention.rewrittenSla}
              </pre>
            )}
          </div>
        )}

        {/* Replay section */}
        {intervention.status === 'complete' && !intervention.replayedEventId && (
          <div style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)',
            borderRadius: 8, padding: '12px',
          }}>
            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>
              The SLA has been hardened. Replay the original event through the new pipeline to verify the fix.
            </p>
            <button
              onClick={handleReplay}
              disabled={replaying || replayDone}
              style={{
                width: '100%', padding: '9px 16px',
                background: replayDone
                  ? 'var(--green-dim)'
                  : replaying
                  ? 'var(--bg-base)'
                  : 'linear-gradient(135deg, var(--green), #059669)',
                border: `1px solid ${replayDone ? 'var(--green)' : 'transparent'}`,
                borderRadius: 8,
                color: replayDone ? 'var(--green)' : '#000',
                fontSize: 12, fontWeight: 700, cursor: replayDone || replaying ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                boxShadow: replayDone || replaying ? 'none' : '0 4px 14px rgba(0,229,160,0.25)',
              }}
            >
              {replaying && <Loader2 size={13} style={{ animation: 'spinSlow 1s linear infinite' }} />}
              {replayDone && <Check size={13} />}
              {!replaying && !replayDone && <Rocket size={13} />}
              {replaying ? 'Replaying…' : replayDone ? 'Replayed Successfully' : 'Replay Event Through Hardened SLA'}
            </button>
          </div>
        )}

        {(intervention.replayedEventId || replayDone) && (
          <div style={{
            background: 'var(--green-dim)', border: '1px solid #00e5a030',
            borderRadius: 8, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Check size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700 }}>REPLAY DISPATCHED</div>
              <p style={{ fontSize: 10.5, color: '#00a070', margin: '2px 0 0' }}>
                Event is re-running through the hardened SLA. Check the feed for the replay.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
