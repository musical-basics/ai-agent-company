/**
 * GET  /api/events  — paginated feed with filters
 * POST /api/events  — agents publish Dual-Payload Envelopes
 *
 * In production: reads/writes to Supabase swarm_events table.
 * Currently: serves mock data with filtering for demo/dev.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MOCK_EVENTS } from '@/lib/mock-data';
import type { SwarmEvent, EventStatus } from '@/lib/types';

// In-memory event store (replaced by Supabase in production)
let eventStore: SwarmEvent[] = [...MOCK_EVENTS];

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const channelId = url.searchParams.get('channel');
  const status = url.searchParams.get('status') as EventStatus | 'all' | null;
  const agentId = url.searchParams.get('agent');
  const flagged = url.searchParams.get('flagged') === 'true';
  const search = url.searchParams.get('q') || '';
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let filtered = [...eventStore].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (channelId && channelId !== 'all') {
    filtered = filtered.filter((e) => e.channelId === channelId);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter((e) => e.status === status);
  }
  if (agentId) {
    filtered = filtered.filter((e) => e.senderId === agentId || e.receiverId === agentId);
  }
  if (flagged) {
    filtered = filtered.filter((e) => e.flaggedByChairman);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.nlSummary.toLowerCase().includes(q) ||
        e.senderId.includes(q) ||
        e.receiverId.includes(q)
    );
  }

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  // Events per minute (last 5 min)
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const recentCount = eventStore.filter(
    (e) => new Date(e.timestamp).getTime() > fiveMinAgo
  ).length;
  const eventsPerMinute = Math.round(recentCount / 5);

  return NextResponse.json({
    events: paginated,
    total,
    hasMore: offset + limit < total,
    eventsPerMinute,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required Dual-Payload fields
    if (!body.senderId || !body.receiverId || !body.nlSummary || !body.artifact) {
      return NextResponse.json(
        { error: 'Missing required fields: senderId, receiverId, nlSummary, artifact' },
        { status: 400 }
      );
    }

    const newEvent: SwarmEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      senderId: body.senderId,
      receiverId: body.receiverId,
      channelId: body.channelId || 'system',
      eventType: body.eventType || 'artifact_handoff',
      status: body.status || 'pending',
      nlSummary: body.nlSummary,
      artifact: body.artifact,
      slaId: body.slaId,
      flaggedByChairman: false,
      replayOfEventId: body.replayOfEventId,
      interventionId: body.interventionId,
      traceId: body.traceId,
    };

    // In production: INSERT INTO swarm_events
    eventStore = [newEvent, ...eventStore];

    // Update channel last_event_at (production: UPDATE channels SET last_event_at = NOW())
    console.log(`[SwarmBus] Event published: ${newEvent.id} (${newEvent.senderId} → ${newEvent.receiverId})`);

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
