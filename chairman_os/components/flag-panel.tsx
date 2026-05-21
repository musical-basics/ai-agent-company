'use client';
/**
 * CHAIRMAN OS — Flag Panel (Modal)
 * The Relational Debugger trigger.
 * Chairman describes what went wrong → triggers AI CEO intervention.
 */

import { useEffect, useRef } from 'react';
import { X, Flag, Shield, Send } from 'lucide-react';
import { useChairmanStore } from '@/lib/store';

interface FlagPanelProps {
  onIntervene: (eventId: string, note: string) => void;
}

export default function FlagPanel({ onIntervene }: FlagPanelProps) {
  const {
    flagModalOpen, flagTargetEventId, flagNote,
    setFlagNote, closeFlagModal, events, getAgent,
  } = useChairmanStore();

  const event = events.find((e) => e.id === flagTargetEventId);
  const sender   = event ? getAgent(event.senderId)   : undefined;
  const receiver = event ? getAgent(event.receiverId) : undefined;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (flagModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [flagModalOpen]);

  const handleSubmit = () => {
    if (!flagTargetEventId || !flagNote.trim()) return;
    onIntervene(flagTargetEventId, flagNote);
    closeFlagModal();
  };

  if (!flagModalOpen || !event) return null;

  const senderName   = sender?.name.replace(' Worker', '').replace(' (AI CEO)', '')   || event.senderId;
  const receiverName = receiver?.name.replace(' Worker', '').replace(' (AI CEO)', '') || event.receiverId;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(5,8,15,0.88)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) closeFlagModal(); }}
    >
      <div
        className="animate-fade-up"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid #ff7c3a30',
          borderTop: '3px solid #ff7c3a',
          borderRadius: 12,
          width: 540,
          padding: '20px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#2a1505', border: '1px solid #ff7c3a30',
            color: '#ff7c3a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Flag size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px' }}>
              Flag Handshake
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              Describe the relationship failure. The AI CEO will diagnose it, rewrite the SLA, and replay the event.
            </p>
          </div>
          <button
            onClick={closeFlagModal}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Event preview */}
        <div style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--accent)',
              background: 'var(--accent-dim)', padding: '2px 7px', borderRadius: 4,
            }}>
              {senderName}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>→</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
              background: 'var(--bg-elevated)', padding: '2px 7px', borderRadius: 4,
              border: '1px solid var(--border-subtle)',
            }}>
              {receiverName}
            </span>
            {event.slaId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                <Shield size={9} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {event.slaId}
                </span>
              </div>
            )}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            {event.nlSummary.slice(0, 180)}{event.nlSummary.length > 180 ? '…' : ''}
          </p>
        </div>

        {/* Chairman's note input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
            display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            What went wrong? (Chairman's Directive)
          </label>
          <textarea
            ref={inputRef}
            value={flagNote}
            onChange={(e) => setFlagNote(e.target.value)}
            placeholder='e.g. "Web team, you need to always parse the VIP pricing keys from Marketing. This field must be required in the SLA."'
            rows={4}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) handleSubmit();
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-medium)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 12,
              lineHeight: 1.6,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#ff7c3a'; }}
            onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--border-medium)'; }}
          />
          <p style={{ fontSize: 9.5, color: 'var(--text-muted)', margin: '5px 0 0' }}>
            Tip: Be specific about which key or field was missing. Press ⌘+Enter to submit.
          </p>
        </div>

        {/* What happens next */}
        <div style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8, padding: '10px 12px',
          marginBottom: 16,
        }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 6px', fontWeight: 600 }}>
            What happens next:
          </p>
          <ol style={{ margin: 0, padding: '0 0 0 16px', fontSize: 10.5, color: 'var(--text-secondary)', lineHeight: 2 }}>
            <li>AI CEO diagnoses the structural failure in the SLA</li>
            <li>CEO rewrites the governing SLA/RUNBOOK to add the missing constraint</li>
            <li>Git commit is pushed automatically</li>
            <li>The original sender replays the artifact through the hardened pipeline</li>
          </ol>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={closeFlagModal}
            style={{
              padding: '8px 18px',
              background: 'none', border: '1px solid var(--border-medium)',
              borderRadius: 7, color: 'var(--text-secondary)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!flagNote.trim()}
            style={{
              padding: '8px 20px',
              background: !flagNote.trim()
                ? 'var(--border-medium)'
                : 'linear-gradient(135deg, #ff7c3a, #ff4500)',
              border: 'none', borderRadius: 7,
              color: !flagNote.trim() ? 'var(--text-muted)' : '#fff',
              fontSize: 12, fontWeight: 700,
              cursor: !flagNote.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: !flagNote.trim() ? 'none' : '0 4px 14px rgba(255,124,58,0.35)',
              transition: 'opacity 0.15s',
            }}
          >
            <Send size={13} /> Intervene — Fix the Relationship
          </button>
        </div>
      </div>
    </div>
  );
}
