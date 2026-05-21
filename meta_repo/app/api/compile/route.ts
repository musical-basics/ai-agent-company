/**
 * POST /api/compile
 * Accepts React Flow canvas JSON → returns compiled swarm-compose.yml
 */

import { NextRequest, NextResponse } from 'next/server';
import { compileToYaml } from '@/lib/compiler';
import type { CanvasNode, CanvasEdge } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nodes, edges, meta } = body as {
      nodes: CanvasNode[];
      edges: CanvasEdge[];
      meta: { companyName: string; companyType: string; seedBudgetUsd: number };
    };

    if (!nodes || !edges || !meta) {
      return NextResponse.json({ error: 'Missing nodes, edges, or meta' }, { status: 400 });
    }

    const result = compileToYaml(nodes, edges, meta);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[compile] Error:', err);
    return NextResponse.json(
      { error: 'Compilation failed', details: String(err) },
      { status: 500 }
    );
  }
}
