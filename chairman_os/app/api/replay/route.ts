/**
 * POST /api/replay
 * After a surgical intervention, replay the original event through the hardened pipeline.
 * Creates a new SwarmEvent linked back to the original via replayOfEventId.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { SwarmEvent } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originalEventId, interventionId, artifact, senderId, receiverId, channelId, slaId } = body;

    if (!originalEventId) {
      return NextResponse.json({ error: 'originalEventId is required' }, { status: 400 });
    }

    const replayEvent: SwarmEvent = {
      id: `evt_replay_${Date.now()}`,
      timestamp: new Date().toISOString(),
      senderId: senderId || 'unknown',
      receiverId: receiverId || 'unknown',
      channelId: channelId || 'system',
      eventType: 'artifact_handoff',
      status: 'pending',
      nlSummary: `[REPLAY] Re-sending artifact through hardened ${slaId || 'SLA'} pipeline following Chairman intervention and SLA update. The new contract now enforces all required keys.`,
      artifact: artifact || {
        type: 'Custom',
        schemaVersion: '1.0',
        payload: {},
      },
      slaId,
      flaggedByChairman: false,
      replayOfEventId: originalEventId,
      interventionId,
    };

    // In production: INSERT INTO swarm_events + trigger the actual agent to re-run
    console.log(`[SwarmBus] Replay dispatched: ${replayEvent.id} (original: ${originalEventId})`);

    return NextResponse.json({ event: replayEvent }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
