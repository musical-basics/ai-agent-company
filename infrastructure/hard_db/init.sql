-- ══════════════════════════════════════════════════════════════════
--  ENTERPRISE-AS-CODE — Hard Database Schema
--  The Rigid Corporate Ledger (PostgreSQL / Supabase)
--
--  This schema acts as the deterministic backbone of the system.
--  The LLM (Spirit) NEVER touches these tables directly.
--  All writes go through the deterministic Controller.
--
--  ⚠️  DO NOT RUN THIS AUTOMATICALLY.
--      Execute manually in your Supabase SQL Editor.
-- ══════════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector operations for RAG / Long-Term Memory
CREATE EXTENSION IF NOT EXISTS "vector";


-- ──────────────────────────────────────────────────────────────────
--  1. COMPANY ENTITIES
--  Top-level registry of companies and variants in the conglomerate.
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE company_entities (
    company_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name        VARCHAR(100) NOT NULL,
    company_type        VARCHAR(50) NOT NULL,       -- 'e-course', 'saas', 'd2c', 'media'
    variant_id          VARCHAR(100),                -- NULL for the main company; 'variant_a' for forks
    parent_company_id   UUID REFERENCES company_entities(company_id),  -- NULL if root entity
    blueprint_file      VARCHAR(200),                -- e.g., 'blueprints/swarm-compose.yml'
    status              VARCHAR(30) DEFAULT 'active', -- 'active', 'paused', 'liquidated', 'merged'
    seed_budget_usd     NUMERIC(12,2) DEFAULT 0,
    spent_budget_usd    NUMERIC(12,2) DEFAULT 0,
    git_branch          VARCHAR(100) DEFAULT 'main',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_status ON company_entities(status);
CREATE INDEX idx_company_variant ON company_entities(variant_id);


-- ──────────────────────────────────────────────────────────────────
--  2. DEPARTMENTS
--  Isolated silos within a company. Each department maps to a
--  Git directory (Soft DB) and a pgvector namespace.
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE departments (
    department_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id          UUID NOT NULL REFERENCES company_entities(company_id) ON DELETE CASCADE,
    name                VARCHAR(50) NOT NULL,         -- 'growth_marketing', 'product_engineering'
    description         TEXT,
    git_mind_directory  VARCHAR(200) NOT NULL,         -- '/minds/departments/growth_marketing/'
    pgvector_namespace  VARCHAR(100),                  -- 'ns_growth_marketing'
    status              VARCHAR(30) DEFAULT 'active',  -- 'active', 'paused', 'archived'
    budget_usd          NUMERIC(12,2) DEFAULT 0,
    spent_usd           NUMERIC(12,2) DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, name)
);

CREATE INDEX idx_dept_company ON departments(company_id);


-- ──────────────────────────────────────────────────────────────────
--  3. AGENT SESSIONS (Execution State Management)
--  The Skeleton's Model layer. Every time an agent is awakened
--  for a task, a session row is created to track its full lifecycle.
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE agent_sessions (
    session_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id          UUID NOT NULL REFERENCES company_entities(company_id),
    department_id       UUID NOT NULL REFERENCES departments(department_id),
    agent_id            VARCHAR(50) NOT NULL,           -- 'media_buyer', 'frontend_dev'
    
    -- Execution State
    status              VARCHAR(30) DEFAULT 'initializing',
                        -- 'initializing', 'planning', 'executing', 'blocked',
                        -- 'awaiting_review', 'completed', 'failed', 'cancelled'
    current_step        INT DEFAULT 0,
    total_steps         INT DEFAULT 0,
    
    -- Trigger Context
    trigger_source      VARCHAR(100),                   -- 'ceo_directive', 'event_bus', 'cron', 'webhook'
    trigger_payload     JSONB,                          -- The incoming event that woke the agent
    
    -- Runtime Variables
    context_variables   JSONB DEFAULT '{}',             -- Dynamic state accumulated during execution
    
    -- Budget Guardrails
    budget_limit_usd    NUMERIC(10,2) DEFAULT 50.00,
    spent_usd           NUMERIC(10,2) DEFAULT 0.00,
    
    -- Lineage
    parent_session_id   UUID REFERENCES agent_sessions(session_id),  -- For sub-tasks
    
    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    
    -- Error Handling
    error_message       TEXT,
    retry_count         INT DEFAULT 0
);

CREATE INDEX idx_session_status ON agent_sessions(status);
CREATE INDEX idx_session_dept ON agent_sessions(department_id);
CREATE INDEX idx_session_agent ON agent_sessions(agent_id);


-- ──────────────────────────────────────────────────────────────────
--  4. TRACE ARTIFACTS (The "Flight Recorder")
--  Glass Box observability. Every micro-step of every agent
--  produces immutable artifacts: what it saw (Context), what it
--  thought (Thought), what it did (Execution), and what happened
--  (Environment response).
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE trace_artifacts (
    trace_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID NOT NULL REFERENCES agent_sessions(session_id) ON DELETE CASCADE,
    step_number         INT NOT NULL,
    
    -- Action Classification
    action_type         VARCHAR(100) NOT NULL,           -- 'generate_email_payload', 'query_db', 'call_api'
    
    -- ═══ THE ARTIFACT CLUSTER ═══
    
    -- What the LLM saw (the compiled View)
    context_payload     JSONB,
    
    -- What the LLM reasoned (chain-of-thought)
    thought_payload     JSONB,
    
    -- What the Controller executed (API call, DB query, etc.)
    execution_payload   JSONB,
    
    -- What the environment returned (API response, error, etc.)
    environment_response JSONB,
    
    -- ═══ LINEAGE (for Surgical Intervention) ═══
    
    -- Which Soft DB file governed this step
    governing_soft_db_file VARCHAR(200),                 -- e.g., 'minds/departments/marketing/ad_copy.md'
    
    -- ═══ HUMAN REVIEW ═══
    
    -- Auto-generated summary for the UI timeline
    human_summary       TEXT,
    
    -- Surgical Intervention fields
    is_flagged          BOOLEAN DEFAULT FALSE,
    flagged_by          VARCHAR(100),                    -- 'chairman', 'ceo', 'manager_subagent'
    feedback_notes      TEXT,
    resolution_status   VARCHAR(30),                     -- NULL, 'pending', 'resolved', 'wont_fix'
    
    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    duration_ms         INT                              -- How long this step took
);

CREATE INDEX idx_trace_session ON trace_artifacts(session_id);
CREATE INDEX idx_trace_flagged ON trace_artifacts(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX idx_trace_step ON trace_artifacts(session_id, step_number);


-- ──────────────────────────────────────────────────────────────────
--  5. ARTIFACT HANDOFFS (The Asynchronous Event Bus)
--  Departments communicate ONLY through discrete artifact payloads.
--  No open-ended LLM chatting. Strict JSON handoffs validated
--  against the SLA schemas.
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE artifact_handoffs (
    handoff_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id          UUID NOT NULL REFERENCES company_entities(company_id),
    
    -- Producer → Consumer routing
    producer_dept_id    UUID NOT NULL REFERENCES departments(department_id),
    consumer_dept_id    UUID NOT NULL REFERENCES departments(department_id),
    producer_session_id UUID REFERENCES agent_sessions(session_id),
    
    -- The SLA governing this handoff
    sla_id              VARCHAR(100),                    -- e.g., 'marketing_to_product'
    
    -- The Artifact
    artifact_type       VARCHAR(100),                    -- 'campaign_brief', 'bug_report', 'deploy_request'
    artifact_payload    JSONB NOT NULL,                   -- The actual structured data
    
    -- Lifecycle
    status              VARCHAR(30) DEFAULT 'pending',
                        -- 'pending', 'accepted', 'rejected', 'processing', 'completed'
    rejection_reason    TEXT,
    retry_count         INT DEFAULT 0,
    max_retries         INT DEFAULT 3,
    
    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    processed_at        TIMESTAMPTZ,
    
    -- Prevent self-sends
    CONSTRAINT no_self_handoff CHECK (producer_dept_id != consumer_dept_id)
);

CREATE INDEX idx_handoff_status ON artifact_handoffs(status);
CREATE INDEX idx_handoff_consumer ON artifact_handoffs(consumer_dept_id, status);
CREATE INDEX idx_handoff_company ON artifact_handoffs(company_id);


-- ──────────────────────────────────────────────────────────────────
--  6. DEPARTMENTAL DISPUTES (Friction Events → CEO Escalation)
--  When a consumer department rejects an artifact beyond the SLA
--  retry limit, a dispute is created for the CEO to resolve.
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE departmental_disputes (
    dispute_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id          UUID NOT NULL REFERENCES company_entities(company_id),
    handoff_id          UUID NOT NULL REFERENCES artifact_handoffs(handoff_id),
    
    -- The parties involved
    producer_dept_id    UUID NOT NULL REFERENCES departments(department_id),
    rejecting_dept_id   UUID NOT NULL REFERENCES departments(department_id),
    
    -- Dispute Details
    reason_for_rejection TEXT NOT NULL,
    sla_violated        VARCHAR(100),                    -- Which SLA was breached
    severity            VARCHAR(20) DEFAULT 'medium',    -- 'low', 'medium', 'high', 'critical'
    
    -- Resolution
    is_resolved         BOOLEAN DEFAULT FALSE,
    ceo_resolution_notes TEXT,
    resolution_action   VARCHAR(100),                    -- 'update_producer_sop', 'update_consumer_sop', 'update_sla'
    resolved_by         VARCHAR(100),                    -- 'ceo', 'chairman'
    
    -- Soft DB files affected by the resolution
    affected_sop_files  JSONB,                           -- ['minds/departments/marketing/ad_copy.md']
    git_commit_sha      VARCHAR(40),                     -- The commit that fixed the SOP
    
    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    resolved_at         TIMESTAMPTZ
);

CREATE INDEX idx_dispute_unresolved ON departmental_disputes(is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX idx_dispute_company ON departmental_disputes(company_id);


-- ──────────────────────────────────────────────────────────────────
--  7. COMPANY DIRECTIVES (Chairman's Strategic Broadcasts)
--  When the Chairman issues a top-down directive, it is recorded
--  here and cascaded to all department Manager Subagents.
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE company_directives (
    directive_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id          UUID NOT NULL REFERENCES company_entities(company_id),
    
    -- The Chairman's words
    chairman_prompt     TEXT NOT NULL,                    -- "Focus on increasing conversions this week"
    
    -- CEO's decomposition of the directive
    ceo_plan            JSONB,                           -- Hierarchical Task Network (phases, deps, etc.)
    
    -- Execution tracking
    status              VARCHAR(30) DEFAULT 'pending',
                        -- 'pending', 'planning', 'executing', 'completed', 'cancelled'
    affected_departments JSONB,                          -- ['growth_marketing', 'product_engineering']
    
    -- Scope governance
    estimated_budget_usd NUMERIC(10,2),
    actual_budget_usd    NUMERIC(10,2),
    
    -- Timestamps
    broadcast_at        TIMESTAMPTZ DEFAULT NOW(),
    completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_directive_status ON company_directives(status);


-- ──────────────────────────────────────────────────────────────────
--  8. EVOLUTION FEEDBACK (Human Feedback → Soft DB Pipeline)
--  Records human feedback that triggers the Macro-Loop evolution
--  of the agent's Soft DB (Markdown SOPs).
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE evolution_feedback (
    feedback_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id          UUID NOT NULL REFERENCES company_entities(company_id),
    
    -- Source context
    trace_id            UUID REFERENCES trace_artifacts(trace_id),
    session_id          UUID REFERENCES agent_sessions(session_id),
    dispute_id          UUID REFERENCES departmental_disputes(dispute_id),
    
    -- Feedback
    submitted_by        VARCHAR(100) NOT NULL,           -- 'chairman', 'ceo'
    feedback_type       VARCHAR(50) NOT NULL,            -- 'sop_update', 'sla_update', 'relationship_fix'
    feedback_text       TEXT NOT NULL,
    
    -- Target
    target_department   VARCHAR(50),
    target_sop_file     VARCHAR(200),                    -- The specific file to evolve
    
    -- Execution
    status              VARCHAR(30) DEFAULT 'pending',   -- 'pending', 'processing', 'applied', 'rejected'
    git_commit_sha      VARCHAR(40),
    applied_diff        TEXT,                             -- The actual change made to the Soft DB
    
    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    applied_at          TIMESTAMPTZ
);

CREATE INDEX idx_feedback_status ON evolution_feedback(status);


-- ──────────────────────────────────────────────────────────────────
--  9. INTER-COMPANY EVENT BUS (Conglomerate-Level Communication)
--  For the Holding Company pattern: two separate companies
--  exchanging artifacts via strict "Treaties."
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE inter_company_handoffs (
    handoff_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    producer_company_id UUID NOT NULL REFERENCES company_entities(company_id),
    consumer_company_id UUID NOT NULL REFERENCES company_entities(company_id),
    
    treaty_file         VARCHAR(200),                    -- 'minds/treaties/pulse_to_lumina.md'
    artifact_type       VARCHAR(100),
    artifact_payload    JSONB NOT NULL,
    
    status              VARCHAR(30) DEFAULT 'pending',
    rejection_reason    TEXT,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    processed_at        TIMESTAMPTZ,
    
    CONSTRAINT no_self_company_handoff CHECK (producer_company_id != consumer_company_id)
);

CREATE INDEX idx_inter_company_status ON inter_company_handoffs(status);


-- ══════════════════════════════════════════════════════════════════
--  ROW-LEVEL SECURITY (RLS) — Optional Supabase hardening
--  Uncomment and configure if deploying with Supabase Auth.
-- ══════════════════════════════════════════════════════════════════

-- ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trace_artifacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE artifact_handoffs ENABLE ROW LEVEL SECURITY;

-- Example: Only the service role can write to the ledger
-- CREATE POLICY "service_role_only" ON agent_sessions
--     FOR ALL USING (auth.role() = 'service_role');
