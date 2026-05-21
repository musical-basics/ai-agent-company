'use client';
/**
 * CHAIRMAN OS — Main Page
 * Assembles: Sidebar + TopBar + EventFeed + InterventionPanel + Modals
 */

import { useState, useCallback } from 'react';
import Sidebar from '@/components/sidebar';
import TopBar from '@/components/topbar';
import EventFeed from '@/components/event-feed';
import FlagPanel from '@/components/flag-panel';
import InterventionPanel from '@/components/intervention-panel';
import { useChairmanStore } from '@/lib/store';
import { Building2, Layers } from 'lucide-react';
import type { Intervention } from '@/lib/types';

// ─── Logo/Brand bar (very top) ───────────────────────────────────────────────

function BrandBar() {
  return (
    <div style={{
      height: 44,
      background: 'var(--bg-base)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center',
      padding: '0 14px',
      gap: 10,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'calc(var(--sidebar-w) - 14px)', flexShrink: 0 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: 'linear-gradient(135deg, #003d4d, #001a26)',
          border: '1px solid var(--accent-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)',
          boxShadow: '0 0 12px rgba(0,212,255,0.25)',
        }}>
          <Layers size={13} />
        </div>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            Chairman OS
          </div>
          <div style={{ fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Glass Box · Swarm Monitor
          </div>
        </div>
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />

      {/* Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          fontSize: 9, fontWeight: 700,
          background: 'var(--accent-dim)', color: 'var(--accent)',
          padding: '2px 8px', borderRadius: 4,
          letterSpacing: '0.06em',
        }}>
          OVERSIGHT
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Dual-Payload Swarm Envelope Protocol v1.0
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Link to Swarm Forge */}
      <a
        href="http://localhost:3001"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px',
          background: 'none', border: '1px solid var(--border-medium)',
          borderRadius: 6, color: 'var(--text-muted)',
          fontSize: 9.5, fontWeight: 600,
          textDecoration: 'none',
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-medium)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
        }}
      >
        <Layers size={10} /> Swarm Forge →
      </a>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChairmanPage() {
  const {
    openFlagModal, openIntervention, closeIntervention,
    interventionPanelOpen, addIntervention, updateEvent,
    events, getAgent,
  } = useChairmanStore();

  // Flag → Intervene flow
  const handleIntervene = useCallback(async (eventId: string, chairmanNote: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const sender   = getAgent(event.senderId);
    const receiver = getAgent(event.receiverId);

    // Create a pending intervention and open the panel
    const tempId = `inv_${Date.now()}`;
    const pending: Intervention = {
      id: tempId,
      eventId,
      slaId: event.slaId,
      chairmanNote,
      status: 'diagnosing',
      createdAt: new Date().toISOString(),
    };
    addIntervention(pending);
    openIntervention(tempId);

    // Mark original event as flagged
    updateEvent(eventId, {
      status: 'flagged',
      flaggedByChairman: true,
      chairmanNote,
      interventionId: tempId,
    });

    // Animate through status steps
    const { updateIntervention } = useChairmanStore.getState();
    setTimeout(() => updateIntervention(tempId, { status: 'rewriting' }), 1200);
    setTimeout(() => updateIntervention(tempId, { status: 'committing' }), 2400);

    // Call the intervention API
    try {
      const res = await fetch('/api/intervene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          chairmanNote,
          slaId: event.slaId,
          senderArtifact: event.artifact.payload,
          senderName: sender?.name || event.senderId,
          receiverName: receiver?.name || event.receiverId,
        }),
      });

      if (res.ok) {
        const { intervention } = await res.json();
        setTimeout(() => {
          updateIntervention(tempId, {
            status: 'complete',
            diagnosis: intervention.diagnosis,
            rewrittenSla: intervention.rewrittenSla,
            diff: intervention.diff,
            gitCommitSha: intervention.gitCommitSha,
            gitCommitUrl: intervention.gitCommitUrl,
            completedAt: new Date().toISOString(),
          });
        }, 3200);
      } else {
        updateIntervention(tempId, { status: 'failed' });
      }
    } catch {
      updateIntervention(tempId, { status: 'failed' });
    }
  }, [events, getAgent, addIntervention, openIntervention, updateEvent]);

  return (
    <div
      className="scanline-overlay"
      style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden',
      }}
    >
      {/* Brand bar */}
      <BrandBar />

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: Sidebar */}
        <Sidebar />

        {/* Center: Feed */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TopBar />
          <EventFeed
            onFlagClick={openFlagModal}
            onInterventionClick={openIntervention}
          />
        </div>

        {/* Right: Intervention Panel (conditional) */}
        {interventionPanelOpen && <InterventionPanel />}
      </div>

      {/* Modals */}
      <FlagPanel onIntervene={handleIntervene} />
    </div>
  );
}
