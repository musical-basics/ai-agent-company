'use client';
/**
 * CHAIRMAN OS — Artifact Widget
 * Renders JSON, YAML, diff, and structured card views of swarm artifacts.
 */

import { useState } from 'react';
import {
  ChevronDown, ChevronRight, Copy, CheckCheck,
  Table2, Code2, GitPullRequest, FileText,
} from 'lucide-react';
import type { Artifact } from '@/lib/types';

// ─── JSON Table View ──────────────────────────────────────────────────────────

function JsonTable({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);

  const renderValue = (v: unknown, depth = 0): React.ReactNode => {
    if (v === null || v === undefined) return <span style={{ color: 'var(--text-muted)' }}>null</span>;
    if (typeof v === 'boolean') return <span style={{ color: 'var(--violet)' }}>{String(v)}</span>;
    if (typeof v === 'number') return <span style={{ color: '#f59e0b' }}>{v}</span>;
    if (typeof v === 'string') return <span style={{ color: 'var(--green)' }}>"{v}"</span>;
    if (Array.isArray(v)) {
      return (
        <div style={{ paddingLeft: depth > 0 ? 12 : 0 }}>
          {v.map((item, i) => (
            <div key={i} style={{ marginTop: 2, display: 'flex', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>[{i}]</span>
              {renderValue(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    if (typeof v === 'object') {
      return (
        <div style={{ paddingLeft: depth > 0 ? 12 : 0, borderLeft: depth > 0 ? '1px solid var(--border-subtle)' : 'none', marginLeft: depth > 0 ? 4 : 0 }}>
          {Object.entries(v as Record<string, unknown>).map(([k, val]) => (
            <div key={k} style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent)', fontSize: 10, fontWeight: 500, flexShrink: 0 }}>{k}:</span>
              {renderValue(val, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    return <span style={{ color: 'var(--text-secondary)' }}>{String(v)}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {entries.map(([key, value]) => (
        <div key={key} style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 6,
          padding: '7px 10px',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {key.replace(/_/g, ' ')}
          </div>
          <div style={{ fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 }}>
            {renderValue(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Diff Viewer ──────────────────────────────────────────────────────────────

function DiffViewer({ diff }: { diff: string }) {
  const lines = diff.split('\n');
  return (
    <pre style={{ margin: 0, fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          return <span key={i} className="diff-add">{line}</span>;
        }
        if (line.startsWith('-') && !line.startsWith('---')) {
          return <span key={i} className="diff-del">{line}</span>;
        }
        if (line.startsWith('@@')) {
          return <span key={i} style={{ color: 'var(--violet)', display: 'block', padding: '0 8px' }}>{line}</span>;
        }
        return <span key={i} className="diff-ctx">{line}</span>;
      })}
    </pre>
  );
}

// ─── Artifact Widget ──────────────────────────────────────────────────────────

type ViewMode = 'table' | 'code' | 'diff';

interface ArtifactWidgetProps {
  artifact: Artifact;
  diff?: string;
  defaultCollapsed?: boolean;
  compact?: boolean;
}

export default function ArtifactWidget({
  artifact,
  diff,
  defaultCollapsed = true,
  compact = false,
}: ArtifactWidgetProps) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const [viewMode, setViewMode] = useState<ViewMode>(diff ? 'diff' : 'table');
  const [copied, setCopied] = useState(false);

  const hasDiff = !!diff;
  const json = JSON.stringify(artifact.payload, null, 2);

  const copy = () => {
    navigator.clipboard.writeText(viewMode === 'diff' && diff ? diff : json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ARTIFACT_TYPE_COLOR: Record<string, string> = {
    Campaign_Brief:  'var(--violet)',
    QA_Report:       'var(--red)',
    Code_Diff:       'var(--green)',
    SLA_Update:      'var(--amber)',
    Strategy_Report: 'var(--accent)',
    API_Response:    'var(--text-secondary)',
    Product_Spec:    'var(--violet)',
    Custom:          'var(--text-muted)',
  };

  const typeColor = ARTIFACT_TYPE_COLOR[artifact.type] || 'var(--text-muted)';

  return (
    <div style={{
      background: 'var(--bg-base)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 8,
      overflow: 'hidden',
      marginTop: compact ? 6 : 8,
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: compact ? '6px 10px' : '8px 12px',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {open
          ? <ChevronDown size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          : <ChevronRight size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}

        <div style={{
          fontSize: 9, fontWeight: 700,
          color: typeColor,
          background: `${typeColor}15`,
          border: `1px solid ${typeColor}30`,
          padding: '1px 7px', borderRadius: 4,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {artifact.type.replace(/_/g, ' ')}
        </div>

        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>v{artifact.schemaVersion}</span>

        <div style={{ flex: 1 }} />

        {open && (
          <>
            {/* View mode toggles */}
            {[
              { mode: 'table' as ViewMode, icon: <Table2 size={9} />, title: 'Table view' },
              { mode: 'code' as ViewMode, icon: <Code2 size={9} />, title: 'JSON view' },
              ...(hasDiff ? [{ mode: 'diff' as ViewMode, icon: <GitPullRequest size={9} />, title: 'Diff view' }] : []),
            ].map(({ mode, icon, title }) => (
              <button
                key={mode}
                onClick={(e) => { e.stopPropagation(); setViewMode(mode); }}
                title={title}
                style={{
                  padding: '3px 7px',
                  background: viewMode === mode ? 'var(--bg-elevated)' : 'none',
                  border: viewMode === mode ? '1px solid var(--border-medium)' : '1px solid transparent',
                  borderRadius: 4,
                  color: viewMode === mode ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                }}
              >
                {icon}
              </button>
            ))}

            <button
              onClick={(e) => { e.stopPropagation(); copy(); }}
              style={{ padding: '3px 7px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 9 }}
            >
              {copied ? <CheckCheck size={9} style={{ color: 'var(--green)' }} /> : <Copy size={9} />}
              {copied ? 'Copied' : ''}
            </button>
          </>
        )}
      </button>

      {/* Body */}
      {open && (
        <div style={{
          padding: compact ? '0 10px 10px' : '0 12px 12px',
          maxHeight: 320,
          overflowY: 'auto',
        }}>
          {viewMode === 'table' && (
            <JsonTable data={artifact.payload} />
          )}
          {viewMode === 'code' && (
            <pre className="artifact-code" style={{ maxHeight: 280 }}>
              {json}
            </pre>
          )}
          {viewMode === 'diff' && diff && (
            <div style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              overflow: 'hidden',
            }}>
              <DiffViewer diff={diff} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
