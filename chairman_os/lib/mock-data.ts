/**
 * CHAIRMAN OS — Mock Data
 * Realistic seed events for development and demo.
 * Based on the actual Commander OS worker topology.
 */

import type { SwarmEvent, Agent, Channel, Intervention } from './types';

// ─── Agents ──────────────────────────────────────────────────────────────────

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'commander',
    name: 'Commander (AI CEO)',
    kind: 'ceo',
    framework: 'Custom_ReAct',
    model: 'claude-opus-4-5',
    status: 'active',
    lastHeartbeatAt: new Date(Date.now() - 45000).toISOString(),
    currentTask: 'Reviewing weekly business updates',
  },
  {
    id: 'dreamplay',
    name: 'DreamPlay Worker',
    kind: 'worker',
    framework: 'OpenClaw',
    model: 'claude-sonnet-4-5',
    department: 'product_engineering',
    status: 'active',
    lastHeartbeatAt: new Date(Date.now() - 120000).toISOString(),
    currentTask: 'Updating landing page hero section',
  },
  {
    id: 'concert_marketing',
    name: 'Concert Marketing Worker',
    kind: 'worker',
    framework: 'OpenClaw',
    model: 'claude-sonnet-4-5',
    department: 'growth_marketing',
    status: 'active',
    lastHeartbeatAt: new Date(Date.now() - 30000).toISOString(),
    currentTask: 'Finalizing Belgium concert campaign brief',
  },
  {
    id: 'ultimate_pianist',
    name: 'Ultimate Pianist Worker',
    kind: 'worker',
    framework: 'OpenClaw',
    model: 'claude-sonnet-4-5',
    department: 'product_engineering',
    status: 'idle',
    lastHeartbeatAt: new Date(Date.now() - 600000).toISOString(),
    currentTask: undefined,
  },
  {
    id: 'personal_ops',
    name: 'Personal Ops Worker',
    kind: 'worker',
    framework: 'OpenClaw',
    model: 'claude-haiku-3-5',
    department: 'personal',
    status: 'idle',
    lastHeartbeatAt: new Date(Date.now() - 900000).toISOString(),
    currentTask: undefined,
  },
  {
    id: 'qa_agent',
    name: 'QA Analyst',
    kind: 'worker',
    framework: 'Custom_ReAct',
    model: 'gpt-4o',
    department: 'quality_assurance',
    status: 'error',
    lastHeartbeatAt: new Date(Date.now() - 1800000).toISOString(),
    currentTask: 'Playwright test run — 3 failures',
  },
];

// ─── Channels ────────────────────────────────────────────────────────────────

export const MOCK_CHANNELS: Channel[] = [
  {
    id: 'all',
    name: 'All Activity',
    description: 'Every swarm event across all channels',
    participants: MOCK_AGENTS.map((a) => a.id),
    unreadCount: 0,
    lastEventAt: new Date().toISOString(),
    isPinned: true,
  },
  {
    id: 'belgium-concert-launch',
    name: 'belgium-concert-launch',
    description: 'Belgium concert marketing and landing page launch',
    participants: ['commander', 'concert_marketing', 'dreamplay', 'qa_agent'],
    unreadCount: 3,
    lastEventAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'dreamplay-ops',
    name: 'dreamplay-ops',
    description: 'DreamPlay product engineering operations',
    participants: ['commander', 'dreamplay', 'qa_agent'],
    unreadCount: 1,
    lastEventAt: new Date(Date.now() - 800000).toISOString(),
  },
  {
    id: 'ecourse-launch',
    name: 'ecourse-launch',
    description: 'Ultimate Pianist masterclass launch campaign',
    participants: ['commander', 'ultimate_pianist', 'concert_marketing'],
    unreadCount: 0,
    lastEventAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'system',
    name: 'system',
    description: 'CEO directives, heartbeats, and system events',
    participants: MOCK_AGENTS.map((a) => a.id),
    unreadCount: 0,
    lastEventAt: new Date(Date.now() - 60000).toISOString(),
  },
];

// ─── Events ──────────────────────────────────────────────────────────────────

const now = Date.now();

export const MOCK_EVENTS: SwarmEvent[] = [
  // Event 1 — CEO directive
  {
    id: 'evt_001',
    timestamp: new Date(now - 7200000).toISOString(),
    senderId: 'commander',
    receiverId: 'concert_marketing',
    channelId: 'belgium-concert-launch',
    eventType: 'ceo_directive',
    status: 'delivered',
    nlSummary: 'Issuing Phase 2 directive to Concert Marketing: finalize the Belgium concert campaign brief targeting the Brussels classical audience. Budget cap is €800 for Google Ads. Deadline: end of today.',
    artifact: {
      type: 'Campaign_Brief',
      schemaVersion: '1.0',
      payload: {
        directive_id: 'dir_phase2_belgium',
        target_market: 'Brussels classical music audience',
        campaign_type: 'google_ads',
        budget_eur: 800,
        deadline: '2026-05-21T23:59:00Z',
        required_deliverables: ['ad_copy', 'target_keywords', 'audience_segments', 'landing_page_spec'],
        tone: 'sophisticated, classical, exclusive',
      },
    },
    slaId: 'ceo_to_marketing',
    flaggedByChairman: false,
    traceId: 'trc_001',
  },

  // Event 2 — Marketing handoff to Web (VIP pricing MISSING — this will be flagged)
  {
    id: 'evt_002',
    timestamp: new Date(now - 5400000).toISOString(),
    senderId: 'concert_marketing',
    receiverId: 'dreamplay',
    channelId: 'belgium-concert-launch',
    eventType: 'artifact_handoff',
    status: 'delivered',
    nlSummary: 'Concert Marketing has completed the campaign brief for the Belgium concert landing page. Requesting DreamPlay Web team to update the hero section with the new copy, add the ticket purchase CTA, and implement the countdown timer. The audience targeting is Brussels classical music fans aged 35–60.',
    artifact: {
      type: 'Campaign_Brief',
      schemaVersion: '1.0',
      payload: {
        target_audience: 'Brussels classical music fans, aged 35-60',
        core_metric: 'ticket_conversions',
        copy_text: 'An evening of Brahms and Ravel at the Palais des Beaux-Arts. Limited seats available.',
        hero_cta: 'Reserve Your Seat',
        countdown_to: '2026-06-15T19:00:00+02:00',
        // ⚠️ vip_pricing is MISSING — this is what the Chairman will flag
        style_details: { primary_color: '#1a1a2e', font: 'Cormorant Garamond', mood: 'elegant' },
      },
    },
    slaId: 'marketing_to_product',
    flaggedByChairman: false,
    traceId: 'trc_002',
  },

  // Event 3 — Web confirms receipt
  {
    id: 'evt_003',
    timestamp: new Date(now - 4800000).toISOString(),
    senderId: 'dreamplay',
    receiverId: 'concert_marketing',
    channelId: 'belgium-concert-launch',
    eventType: 'artifact_handoff',
    status: 'delivered',
    nlSummary: 'DreamPlay Web has received the landing page spec and implemented the hero section, CTA button, and countdown timer. Hero is live on staging. Awaiting QA sign-off before merging to production.',
    artifact: {
      type: 'API_Response',
      schemaVersion: '1.0',
      payload: {
        status: 'staging_deployed',
        staging_url: 'https://staging.dreamplay.com/belgium-concert',
        changes_made: ['hero_section', 'cta_button', 'countdown_timer'],
        missing_from_brief: ['vip_pricing_section'],
        git_commit: 'a3f8e21',
        qa_status: 'pending',
      },
    },
    slaId: 'product_to_qa',
    flaggedByChairman: false,
    traceId: 'trc_003',
  },

  // Event 4 — QA Report (failures!)
  {
    id: 'evt_004',
    timestamp: new Date(now - 3600000).toISOString(),
    senderId: 'qa_agent',
    receiverId: 'dreamplay',
    channelId: 'belgium-concert-launch',
    eventType: 'artifact_handoff',
    status: 'rejected',
    nlSummary: 'QA has tested the Belgium concert staging page. 3 issues found: (1) The VIP pricing section is completely absent from the page — it appears it was never included in the brief sent to Web. (2) The countdown timer fails on mobile Safari. (3) The hero font is rendering as Times New Roman instead of Cormorant Garamond on Firefox.',
    artifact: {
      type: 'QA_Report',
      schemaVersion: '1.0',
      payload: {
        total_tests: 24,
        passed: 21,
        failed: 3,
        severity: 'high',
        failures: [
          { id: 'qa_001', severity: 'critical', description: 'VIP pricing section missing entirely', component: 'pricing', reproduction: 'Navigate to /belgium-concert — no pricing section exists' },
          { id: 'qa_002', severity: 'medium', description: 'Countdown timer fails on mobile Safari 17.4', component: 'countdown', reproduction: 'Open on iPhone 15, timer shows NaN:NaN:NaN' },
          { id: 'qa_003', severity: 'low', description: 'Font fallback to Times New Roman on Firefox 124', component: 'typography', reproduction: 'Firefox 124, hero section, font family inspector' },
        ],
        recommendation: 'Do not merge to production. Resolve critical issues first.',
      },
    },
    slaId: 'qa_to_product',
    rejectionReason: 'Critical: VIP pricing section missing. Page cannot go to production.',
    flaggedByChairman: false,
    traceId: 'trc_004',
  },

  // Event 5 — FLAGGED by Chairman (VIP pricing key was never in the SLA)
  {
    id: 'evt_005',
    timestamp: new Date(now - 3000000).toISOString(),
    senderId: 'concert_marketing',
    receiverId: 'dreamplay',
    channelId: 'belgium-concert-launch',
    eventType: 'artifact_handoff',
    status: 'flagged',
    nlSummary: 'Concert Marketing sent the original campaign brief to DreamPlay Web team. However, reviewing the artifact, the `vip_pricing` key was not included in the payload. This caused the Web agent to implement the landing page without any VIP pricing section, leading to QA failure.',
    artifact: {
      type: 'Campaign_Brief',
      schemaVersion: '1.0',
      payload: {
        target_audience: 'Brussels classical music fans, aged 35-60',
        copy_text: 'An evening of Brahms and Ravel...',
        // missing: vip_pricing
      },
    },
    slaId: 'marketing_to_product',
    flaggedByChairman: true,
    chairmanNote: 'Web team, you need to always parse the VIP pricing keys from Marketing. This field should be required in the SLA. Marketing must always include it.',
    traceId: 'trc_005',
    interventionId: 'inv_001',
  },

  // Event 6 — CEO SOP update (result of intervention)
  {
    id: 'evt_006',
    timestamp: new Date(now - 2400000).toISOString(),
    senderId: 'commander',
    receiverId: 'concert_marketing',
    channelId: 'belgium-concert-launch',
    eventType: 'sop_update',
    status: 'delivered',
    nlSummary: 'AI CEO has diagnosed the relationship failure between Marketing and Web. Root cause: the `marketing_to_product` SLA did not require `vip_pricing` as a mandatory artifact key. The SLA has been rewritten to enforce this field. Git commit pushed. All future Marketing → Web handoffs will be rejected if VIP pricing is absent.',
    artifact: {
      type: 'SLA_Update',
      schemaVersion: '1.0',
      payload: {
        sla_id: 'marketing_to_product',
        diagnosis: 'The vip_pricing field was not listed as a required_artifact_key in the SLA. The receiving agent had no obligation to implement it, and the sending agent had no obligation to include it.',
        change_type: 'add_required_key',
        new_required_keys: ['vip_pricing'],
        git_commit_sha: 'f7a2c14',
        git_commit_url: 'https://github.com/musical-basics/ai-agent-company/commit/f7a2c14',
        diff: `--- a/minds/templates/sla_marketing_to_product.md\n+++ b/minds/templates/sla_marketing_to_product.md\n@@ -12,6 +12,7 @@ required_artifact_keys:\n   - target_audience\n   - core_metric\n   - copy_text\n   - style_details\n   - feature_list\n+  - vip_pricing\n rejection_policy:\n   max_retries: 3`,
      },
    },
    slaId: 'marketing_to_product',
    flaggedByChairman: false,
    interventionId: 'inv_001',
    traceId: 'trc_006',
  },

  // Event 7 — Replay (Concert Marketing resends with vip_pricing)
  {
    id: 'evt_007',
    timestamp: new Date(now - 1800000).toISOString(),
    senderId: 'concert_marketing',
    receiverId: 'dreamplay',
    channelId: 'belgium-concert-launch',
    eventType: 'artifact_handoff',
    status: 'delivered',
    nlSummary: 'Concert Marketing is replaying the campaign brief with the VIP pricing section now included, following the SLA update. The full brief now contains all required keys: target audience, copy, style, feature list, and VIP pricing tier (€149 Early Bird / €249 Standard / €449 VIP).',
    artifact: {
      type: 'Campaign_Brief',
      schemaVersion: '1.0',
      payload: {
        target_audience: 'Brussels classical music fans, aged 35-60',
        core_metric: 'ticket_conversions',
        copy_text: 'An evening of Brahms and Ravel at the Palais des Beaux-Arts. Limited seats available.',
        style_details: { primary_color: '#1a1a2e', font: 'Cormorant Garamond', mood: 'elegant' },
        feature_list: ['hero_section', 'countdown_timer', 'ticket_cta', 'vip_pricing_table'],
        vip_pricing: {
          currency: 'EUR',
          tiers: [
            { name: 'Early Bird', price: 149, deadline: '2026-05-31', available: 50 },
            { name: 'Standard', price: 249, available: 200 },
            { name: 'VIP (Meet & Greet)', price: 449, available: 20, perks: ['backstage_access', 'meet_artist', 'champagne'] },
          ],
        },
      },
    },
    slaId: 'marketing_to_product',
    flaggedByChairman: false,
    replayOfEventId: 'evt_005',
    interventionId: 'inv_001',
    traceId: 'trc_007',
  },

  // Event 8 — DreamPlay implements VIP pricing
  {
    id: 'evt_008',
    timestamp: new Date(now - 900000).toISOString(),
    senderId: 'dreamplay',
    receiverId: 'qa_agent',
    channelId: 'belgium-concert-launch',
    eventType: 'artifact_handoff',
    status: 'pending',
    nlSummary: 'DreamPlay Web has fully implemented the Belgium concert landing page including the VIP pricing table, countdown timer (fixed for mobile Safari), and Cormorant Garamond font via Google Fonts preload. Staging is ready for final QA pass.',
    artifact: {
      type: 'API_Response',
      schemaVersion: '1.0',
      payload: {
        status: 'staging_ready_for_qa',
        staging_url: 'https://staging.dreamplay.com/belgium-concert-v2',
        changes_made: ['vip_pricing_table', 'countdown_timer_fix', 'font_preload_fix', 'hero_section'],
        git_commit: 'b9d4a33',
        qa_status: 'awaiting',
      },
    },
    slaId: 'product_to_qa',
    flaggedByChairman: false,
    traceId: 'trc_008',
  },
];

// ─── Mock Interventions ───────────────────────────────────────────────────────

export const MOCK_INTERVENTIONS: Intervention[] = [
  {
    id: 'inv_001',
    eventId: 'evt_005',
    slaId: 'marketing_to_product',
    chairmanNote: 'Web team, you need to always parse the VIP pricing keys from Marketing. This field should be required in the SLA. Marketing must always include it.',
    status: 'complete',
    diagnosis: 'The `vip_pricing` field was not listed as a required artifact key in the `marketing_to_product` SLA. Because it was not required, the sending agent (Concert Marketing) omitted it without triggering a rejection, and the receiving agent (DreamPlay Web) had no expectation to implement it. This is a structural gap in the inter-departmental treaty, not a reasoning failure.',
    rewrittenSla: `# SLA: marketing_to_product\n\nproducer: growth_marketing\nconsumer: product_engineering\n\nrequired_artifact_keys:\n  - target_audience\n  - core_metric\n  - copy_text\n  - style_details\n  - feature_list\n  - vip_pricing    # ADDED 2026-05-21 — Chairman directive\n\nrejection_policy:\n  max_retries: 3\n  escalate_to_ceo_after: 2`,
    diff: `--- a/minds/templates/sla_marketing_to_product.md\n+++ b/minds/templates/sla_marketing_to_product.md\n@@ -12,6 +12,7 @@\n required_artifact_keys:\n   - target_audience\n   - core_metric\n   - copy_text\n   - style_details\n   - feature_list\n+  - vip_pricing    # ADDED 2026-05-21 — Chairman directive\n rejection_policy:`,
    gitCommitSha: 'f7a2c14',
    gitCommitUrl: 'https://github.com/musical-basics/ai-agent-company/commit/f7a2c14',
    replayedEventId: 'evt_007',
    createdAt: new Date(now - 2700000).toISOString(),
    completedAt: new Date(now - 2400000).toISOString(),
  },
];
