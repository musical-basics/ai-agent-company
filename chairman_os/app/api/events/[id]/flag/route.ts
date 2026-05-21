/**
 * POST /api/events/[id]/flag
 * Chairman flags a specific event with a natural language note.
 * This triggers the Relational Debugger flow.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { chairmanNote } = body;

    if (!chairmanNote?.trim()) {
      return NextResponse.json({ error: 'chairmanNote is required' }, { status: 400 });
    }

    // In production: UPDATE swarm_events SET flagged_by_chairman = TRUE, chairman_note = $1, status = 'flagged' WHERE id = $2
    console.log(`[Chairman] Flagged event ${id}: "${chairmanNote}"`);

    return NextResponse.json({
      success: true,
      eventId: id,
      flaggedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
