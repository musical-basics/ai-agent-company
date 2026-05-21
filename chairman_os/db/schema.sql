-- ══════════════════════════════════════════════════════════════════
--  CHAIRMAN OS — Swarm Event Bus Schema
--  "Replace Discord with the Glass Box"
--
--  Run this manually in your Supabase SQL editor.
--  Use a SEPARATE Supabase project from the Blueprint Library.
--  This DB handles live production runtime — not design-time assets.
-- ══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── channels ──────────────────────────────────────────────────────────────────
-- Cross-functional project channels (replaces Discord channels)

CREATE TABLE IF NOT EXISTS channels (
  id            TEXT PRIMARY KEY,              -- e.g. 'belgium-concert-launch'
  name          TEXT NOT NULL,
  description   TEXT,
  participants  TEXT[] DEFAULT '{}',           -- agent IDs
  is_pinned     BOOLEAN DEFAULT FALSE,
  last_event_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO channels (id, name, description, is_pinned) VALUES
  ('system',                  'system',                  'CEO directives and system events', TRUE),
  ('belgium-concert-launch',  'belgium-concert-launch',  'Belgium concert marketing and web launch', FALSE),
  ('dreamplay-ops',           'dreamplay-ops',           'DreamPlay product operations', FALSE),
  ('ecourse-launch',          'ecourse-launch',          'Ultimate Pianist ecourse launch', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ─── agents ────────────────────────────────────────────────────────────────────
-- Registry of active swarm agents

CREATE TABLE IF NOT EXISTS agents (
  id                TEXT PRIMARY KEY,          -- e.g. 'concert_marketing'
  name              TEXT NOT NULL,
  kind              TEXT NOT NULL CHECK (kind IN ('ceo', 'manager', 'worker', 'tool', 'system')),
  framework         TEXT,
  model             TEXT,
  department        TEXT,
  status            TEXT DEFAULT 'offline' CHECK (status IN ('active', 'idle', 'error', 'offline')),
  current_task      TEXT,
  last_heartbeat_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── swarm_events ──────────────────────────────────────────────────────────────
-- The Dual-Payload Event Bus — core table for ALL agent interactions
-- This table REPLACES Discord as the inter-agent communication layer

CREATE TABLE IF NOT EXISTS swarm_events (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  timestamp           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sender_id           TEXT NOT NULL,                      -- agent ID
  receiver_id         TEXT NOT NULL,                      -- agent ID
  channel_id          TEXT NOT NULL REFERENCES channels(id),
  event_type          TEXT NOT NULL CHECK (event_type IN (
                        'artifact_handoff', 'sla_violation', 'ceo_directive',
                        'sop_update', 'heartbeat', 'escalation', 'chairman_intervention'
                      )),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                        'pending', 'delivered', 'rejected', 'flagged', 'replayed', 'processing'
                      )),

  -- ── The Human Layer (Chairman reads this) ──
  nl_summary          TEXT NOT NULL,

  -- ── The Machine Layer (agents parse this) ──
  artifact_type       TEXT NOT NULL,
  artifact_schema_ver TEXT NOT NULL DEFAULT '1.0',
  artifact_payload    JSONB NOT NULL,

  -- ── Governance ──
  sla_id              TEXT,
  rejection_reason    TEXT,

  -- ── Chairman Oversight ──
  flagged_by_chairman BOOLEAN DEFAULT FALSE,
  chairman_note       TEXT,

  -- ── Replay chain ──
  replay_of_event_id  UUID REFERENCES swarm_events(id) ON DELETE SET NULL,
  intervention_id     UUID,

  -- ── Flight Recorder ──
  trace_id            TEXT,
  context_payload     TEXT,        -- the exact markdown the agent read
  thought_payload     TEXT,        -- the agent's chain of thought
  environment_response TEXT,       -- the API 200/400 response

  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_swarm_events_channel   ON swarm_events(channel_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_swarm_events_sender    ON swarm_events(sender_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_swarm_events_receiver  ON swarm_events(receiver_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_swarm_events_status    ON swarm_events(status);
CREATE INDEX IF NOT EXISTS idx_swarm_events_flagged   ON swarm_events(flagged_by_chairman) WHERE flagged_by_chairman = TRUE;
CREATE INDEX IF NOT EXISTS idx_swarm_events_timestamp ON swarm_events(timestamp DESC);

-- ─── agent_sessions ────────────────────────────────────────────────────────────
-- Tracks active agent execution sessions (one per task run)

CREATE TABLE IF NOT EXISTS agent_sessions (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id        TEXT NOT NULL,
  session_start   TIMESTAMPTZ DEFAULT NOW(),
  session_end     TIMESTAMPTZ,
  status          TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'timeout')),
  directive_id    TEXT,
  task_summary    TEXT,
  token_count     INTEGER DEFAULT 0,
  cost_usd        DECIMAL(10,6) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_agent ON agent_sessions(agent_id, session_start DESC);

-- ─── trace_artifacts ───────────────────────────────────────────────────────────
-- Flight recorder: every tool call logged with full context
-- Powers the "click any message and see exactly what the agent knew" feature

CREATE TABLE IF NOT EXISTS trace_artifacts (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trace_id              TEXT NOT NULL,
  session_id            UUID REFERENCES agent_sessions(id) ON DELETE SET NULL,
  agent_id              TEXT NOT NULL,
  step_number           INTEGER NOT NULL,
  tool_name             TEXT,                -- which tool was called
  context_payload       TEXT,               -- the full markdown context window
  thought_payload       TEXT,               -- chain of thought
  action_payload        JSONB,              -- the tool call arguments
  environment_response  JSONB,              -- the tool response
  governing_sla_file    TEXT,               -- which SLA.md governed this action
  governing_sop_file    TEXT,               -- which RUNBOOK.md governed this action
  timestamp             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_traces_trace_id    ON trace_artifacts(trace_id);
CREATE INDEX IF NOT EXISTS idx_traces_session     ON trace_artifacts(session_id);
CREATE INDEX IF NOT EXISTS idx_traces_agent       ON trace_artifacts(agent_id, timestamp DESC);

-- ─── sla_violations ────────────────────────────────────────────────────────────
-- Tracks every schema mismatch and rejection event

CREATE TABLE IF NOT EXISTS sla_violations (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id      UUID REFERENCES swarm_events(id) ON DELETE CASCADE,
  sla_id        TEXT NOT NULL,
  missing_keys  TEXT[] DEFAULT '{}',
  provided_keys TEXT[] DEFAULT '{}',
  severity      TEXT CHECK (severity IN ('warning', 'rejection', 'escalation')),
  resolved      BOOLEAN DEFAULT FALSE,
  resolved_at   TIMESTAMPTZ,
  timestamp     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_violations_sla      ON sla_violations(sla_id);
CREATE INDEX IF NOT EXISTS idx_violations_resolved ON sla_violations(resolved);

-- ─── interventions ─────────────────────────────────────────────────────────────
-- History of Chairman's surgical fixes

CREATE TABLE IF NOT EXISTS interventions (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id          UUID REFERENCES swarm_events(id) ON DELETE SET NULL,
  sla_id            TEXT,
  chairman_note     TEXT NOT NULL,
  status            TEXT DEFAULT 'pending' CHECK (status IN (
                      'pending', 'diagnosing', 'rewriting', 'committing', 'replaying', 'complete', 'failed'
                    )),

  -- AI CEO output
  diagnosis         TEXT,
  rewritten_sla     TEXT,
  diff              TEXT,
  git_commit_sha    TEXT,
  git_commit_url    TEXT,

  -- Replay
  replayed_event_id UUID REFERENCES swarm_events(id) ON DELETE SET NULL,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_interventions_event  ON interventions(event_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);

-- ─── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE swarm_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE trace_artifacts ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS. Chairman has full access.
CREATE POLICY "Chairman full access swarm_events"   ON swarm_events   USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Chairman full access interventions"  ON interventions  USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Chairman full access traces"         ON trace_artifacts USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Public read channels"                ON channels       FOR SELECT USING (TRUE);
CREATE POLICY "Public read agents"                  ON agents         FOR SELECT USING (TRUE);

-- ─── Realtime (enable for live dashboard polling upgrade) ──────────────────────
-- ALTER PUBLICATION supabase_realtime ADD TABLE swarm_events;
-- ALTER PUBLICATION supabase_realtime ADD TABLE interventions;
