'use client';
/**
 * CHAIRMAN OS — Event Feed
 * The main chronological timeline, grouped by date.
 * Auto-polls for new events every 3 seconds.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Inbox, RefreshCw } from 'lucide-react';
import type { SwarmEvent } from '@/lib/types';
import EventCard from './event-card';
import { useChairmanStore } from '@/lib/store';

interface EventFeedProps {
  onFlagClick: (eventId: string) => void;
  onInterventionClick: (interventionId: string) => void;
}

function groupByDate(events: SwarmEvent[]) {
  const groups: Record<string, typeof events> = {};
  for (const e of events) {
    const date = new Date(e.timestamp).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(e);
  }
  return groups;
}

export default function EventFeed({ onFlagClick, onInterventionClick }: EventFeedProps) {
  const { filteredEvents, filters, channels, addEvent } = useChairmanStore();
  const events = filteredEvents();
  const groups = groupByDate(events);

  const channelObj = channels.find((c) => c.id === (filters.channelId || 'all'));
  const channelTitle = channelObj?.name || 'All Activity';

  const feedRef = useRef<HTMLDivElement>(null);
  const [polling, setPolling] = useState(false);

  // Auto-scroll to bottom on new events
  const scrollToBottom = useCallback(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [events.length, scrollToBottom]);

  // Poll for new events every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setPolling(true);
        const params = new URLSearchParams({ limit: '5' });
        if (filters.channelId) params.set('channel', filters.channelId);
        const res = await fetch(`/api/events?${params}`);
        if (res.ok) {
          // In production: merge new events from server into store
          // For now, mock data is pre-loaded
        }
      } catch { /* ignore */ } finally {
        setPolling(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [filters.channelId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Channel header */}
      <div style={{
        padding: '12px 18px 10px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-panel)',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            #{channelTitle}
          </h2>
          {channelObj?.description && (
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '1px 0 0' }}>
              {channelObj.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(filters.status !== 'all' || filters.showFlaggedOnly || filters.agentId || filters.search) && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              background: 'var(--accent-dim)', color: 'var(--accent)',
              padding: '2px 7px', borderRadius: 4,
            }}>
              FILTERED: {events.length} events
            </span>
          )}

          {polling && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <RefreshCw size={10} style={{ color: 'var(--text-muted)', animation: 'spinSlow 2s linear infinite' }} />
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Polling</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 600 }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {events.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
            padding: '60px 24px',
          }}>
            <Inbox size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 6px' }}>
              No events
            </p>
            <p style={{ fontSize: 11, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
              {filters.showFlaggedOnly
                ? 'No flagged events. Use 🚩 on any message to escalate to the AI CEO.'
                : filters.status !== 'all'
                ? `No ${filters.status} events in this view.`
                : 'Waiting for the swarm to become active. Events will appear here in real-time.'}
            </p>
          </div>
        ) : (
          Object.entries(groups).map(([date, dateEvents]) => (
            <div key={date}>
              {/* Date separator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '20px 0 14px',
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                <span style={{
                  fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                  background: 'var(--bg-base)',
                  padding: '3px 12px', borderRadius: 20,
                  border: '1px solid var(--border-subtle)',
                }}>
                  {date}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              </div>

              {/* Events for this date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dateEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onFlagClick={onFlagClick}
                    onInterventionClick={onInterventionClick}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
