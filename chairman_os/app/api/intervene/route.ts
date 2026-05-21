/**
 * POST /api/intervene
 * The Surgical Relational Intervention endpoint.
 *
 * Flow:
 *  1. Receive: flagged event ID + chairman note + SLA ID
 *  2. Retrieve: the failing artifact, the governing SLA, the sender/receiver context
 *  3. Call AI CEO (LLM): diagnose the relationship failure, generate new SLA
 *  4. Simulate git commit (production: actually commit via GitHub API)
 *  5. Return: intervention record with diagnosis + diff + commit SHA
 *
 * Production wiring:
 *  - To connect to core_engine/ai_ceo.py via HTTP:
 *    const ceoRes = await fetch(`${process.env.CORE_ENGINE_API_URL}/ceo/intervene`, {...})
 *  - To call LLM directly (current approach):
 *    uses ANTHROPIC_API_KEY / OPENAI_API_KEY env vars
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Intervention } from '@/lib/types';

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildInterventionPrompt(
  chairmanNote: string,
  senderArtifact: Record<string, unknown>,
  receiverResponse: Record<string, unknown> | null,
  currentSla: string,
  senderName: string,
  receiverName: string
): string {
  return `You are the Apex AI CEO of a synthetic enterprise. The Chairman has flagged a relationship failure between two departments.

CHAIRMAN'S NOTE:
"${chairmanNote}"

SENDER: ${senderName}
RECEIVER: ${receiverName}

FAILING ARTIFACT (what the sender sent):
${JSON.stringify(senderArtifact, null, 2)}

RECEIVER'S RESPONSE (what the receiver produced / failed to produce):
${receiverResponse ? JSON.stringify(receiverResponse, null, 2) : 'No response / rejection'}

CURRENT GOVERNING SLA:
${currentSla}

YOUR TASK:
1. Diagnose the root cause of the relationship failure in 2-3 sentences. Be specific about which structural gap (missing SLA key, wrong schema, ambiguous rule) caused the failure. Do NOT blame the agents — blame the SLA contract.
2. Rewrite the SLA to add the constraint that would have prevented this failure.
3. Produce a git diff of the change.

Respond in JSON format:
{
  "diagnosis": "...",
  "rewritten_sla": "... full SLA content ...",
  "diff": "... unified diff format ...",
  "change_summary": "... one sentence describing what was added/changed ..."
}`;
}

// ─── Fallback (demo mode without API key) ─────────────────────────────────────

function generateFallbackIntervention(
  chairmanNote: string,
  slaId: string
): { diagnosis: string; rewrittenSla: string; diff: string } {
  return {
    diagnosis: `Root cause: The \`${slaId}\` SLA contract did not enforce all required artifact keys. The sending agent included the field in its brief but the SLA did not mandate it, so the receiving agent had no obligation to implement it. This is a structural gap in the inter-departmental treaty.`,
    rewrittenSla: `# SLA: ${slaId}\n# Updated by AI CEO — Chairman directive\n\nrequired_artifact_keys:\n  - target_audience\n  - core_metric\n  - copy_text\n  - style_details\n  - feature_list\n  - vip_pricing    # ADDED — Chairman directive: "${chairmanNote.slice(0, 60)}"\n\nrejection_policy:\n  max_retries: 3\n  escalate_to_ceo_after: 2`,
    diff: `--- a/minds/templates/sla_${slaId}.md\n+++ b/minds/templates/sla_${slaId}.md\n@@ -12,5 +12,6 @@ required_artifact_keys:\n   - copy_text\n   - style_details\n   - feature_list\n+  - vip_pricing    # ADDED — Chairman directive\n rejection_policy:`,
  };
}

// ─── Call LLM directly ────────────────────────────────────────────────────────

async function callLLM(prompt: string): Promise<{ diagnosis: string; rewrittenSla: string; diff: string } | null> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (anthropicKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    } catch { /* fall through */ }
  }

  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          max_tokens: 2048,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '{}';
        return JSON.parse(text);
      }
    } catch { /* fall through */ }
  }

  return null;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, chairmanNote, slaId, senderArtifact, receiverResponse, senderName, receiverName } = body;

    if (!eventId || !chairmanNote) {
      return NextResponse.json({ error: 'eventId and chairmanNote are required' }, { status: 400 });
    }

    const interventionId = `inv_${Date.now()}`;
    const currentSla = body.currentSla || `# SLA: ${slaId || 'unknown'}\nrequired_artifact_keys:\n  - target_audience\n  - copy_text`;

    const prompt = buildInterventionPrompt(
      chairmanNote,
      senderArtifact || {},
      receiverResponse || null,
      currentSla,
      senderName || 'Sender Agent',
      receiverName || 'Receiver Agent'
    );

    // Try live LLM, fall back to demo
    const llmResult = await callLLM(prompt);
    const result = llmResult || generateFallbackIntervention(chairmanNote, slaId || 'unknown_sla');

    // Simulate git commit SHA (production: call GitHub API)
    const mockSha = Math.random().toString(16).slice(2, 9);

    const intervention: Intervention = {
      id: interventionId,
      eventId,
      slaId,
      chairmanNote,
      status: 'complete',
      diagnosis: result.diagnosis,
      rewrittenSla: result.rewrittenSla,
      diff: result.diff,
      gitCommitSha: mockSha,
      gitCommitUrl: `https://github.com/musical-basics/ai-agent-company/commit/${mockSha}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    console.log(`[CEO] Intervention ${interventionId} complete. Commit: ${mockSha}`);

    return NextResponse.json({ intervention });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
