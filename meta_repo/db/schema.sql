-- ══════════════════════════════════════════════════════════════════
--  SWARM FORGE — Blueprint Library Schema
--  "The Chairman's Asset Library"
--
--  Run this manually in your Supabase SQL editor.
--  This DB stores structural blueprints ONLY — no live task data.
--  Live task data lives in the Execution Repo's Supabase project.
-- ══════════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── framework_adapters ────────────────────────────────────────────────────────
-- Canonical list of available orchestration frameworks

CREATE TABLE IF NOT EXISTS framework_adapters (
  id          TEXT PRIMARY KEY,                  -- e.g. 'Custom_ReAct', 'LangGraph'
  name        TEXT NOT NULL,
  description TEXT,
  is_native   BOOLEAN DEFAULT FALSE,             -- TRUE = built into the core engine
  docs_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO framework_adapters (id, name, description, is_native, docs_url) VALUES
  ('Custom_ReAct', 'Custom ReAct',  'Native Reason+Act loop — full control over agent logic', TRUE,  NULL),
  ('LangGraph',    'LangGraph',     'Graph-based orchestration by LangChain',                  FALSE, 'https://langchain-ai.github.io/langgraph/'),
  ('OpenClaw',     'OpenClaw',      'Lightweight web-search + tool-calling framework',          FALSE, NULL),
  ('Hermes',       'Hermes',        'High-throughput message-passing agent runtime',            FALSE, NULL),
  ('AutoGen',      'AutoGen',       'Microsoft multi-agent conversation framework',             FALSE, 'https://microsoft.github.io/autogen/'),
  ('SWE-agent',    'SWE-agent',     'Princeton SWE-bench agent — optimised for code tasks',    FALSE, 'https://swe-agent.com/'),
  ('CrewAI',       'CrewAI',        'Role-based multi-agent crews with shared context',         FALSE, 'https://crewai.com/')
ON CONFLICT (id) DO NOTHING;

-- ─── agent_registry ────────────────────────────────────────────────────────────
-- The library of available agent types (custom + third-party wrappers)

CREATE TABLE IF NOT EXISTS agent_registry (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug              TEXT UNIQUE NOT NULL,         -- e.g. 'media_buyer'
  name              TEXT NOT NULL,                -- display name
  kind              TEXT NOT NULL                 -- 'worker' | 'manager' | 'ceo'
                    CHECK (kind IN ('worker', 'manager', 'ceo')),
  framework_id      TEXT REFERENCES framework_adapters(id) ON DELETE SET NULL,
  description       TEXT,
  default_model     TEXT,                         -- e.g. 'gpt-4o'
  is_third_party    BOOLEAN DEFAULT FALSE,         -- TRUE = external framework agent
  source_url        TEXT,
  icon_url          TEXT,
  tags              TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with the default roster from the core engine
INSERT INTO agent_registry (slug, name, kind, framework_id, description, is_third_party) VALUES
  ('media_buyer',     'Digital Media Buyer',       'worker',  'Custom_ReAct', 'Manages paid ad campaigns', FALSE),
  ('copywriter',      'Performance Copywriter',    'worker',  'Custom_ReAct', 'Writes high-converting copy', FALSE),
  ('email_marketer',  'Email Campaign Operator',   'worker',  'Custom_ReAct', 'Deploys email sequences', FALSE),
  ('frontend_dev',    'Frontend Developer',        'worker',  'SWE-agent',    'Builds React/Next.js interfaces', TRUE),
  ('shopify_dev',     'E-Commerce Developer',      'worker',  'Custom_ReAct', 'Manages Shopify storefront', FALSE),
  ('ux_designer',     'UX/UI Designer',            'worker',  'Custom_ReAct', 'Creates design specs', FALSE),
  ('qa_analyst',      'QA Analyst',                'worker',  'Custom_ReAct', 'Adversarially tests outputs', FALSE),
  ('data_analyst',    'Business Data Analyst',     'worker',  'LangGraph',    'Analyzes KPIs and metrics', TRUE),
  ('strategist',      'Market Strategist',         'worker',  'Custom_ReAct', 'Market intelligence and pivots', FALSE),
  ('growth_manager',  'Growth Marketing Manager',  'manager', 'Custom_ReAct', 'Orchestrates growth marketing', FALSE),
  ('product_manager', 'Product Engineering Manager','manager','LangGraph',    'Governs product engineering', TRUE),
  ('qa_manager',      'QA Manager',                'manager', 'Custom_ReAct', 'Owns QA protocols', FALSE),
  ('strategy_manager','Strategy Manager',          'manager', 'Custom_ReAct', 'Governs business strategy', FALSE)
ON CONFLICT (slug) DO NOTHING;

-- ─── tool_registry ─────────────────────────────────────────────────────────────
-- The library of available API connectors

CREATE TABLE IF NOT EXISTS tool_registry (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,          -- e.g. 'google_ads_api'
  name             TEXT NOT NULL,
  category         TEXT NOT NULL
                   CHECK (category IN ('analytics', 'ecommerce', 'dev', 'marketing', 'finance', 'productivity', 'testing')),
  description      TEXT,
  docs_url         TEXT,
  requires_api_key BOOLEAN DEFAULT TRUE,
  icon_url         TEXT,
  tags             TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tool_registry (slug, name, category, description, requires_api_key) VALUES
  ('posthog_analytics', 'PostHog Analytics',  'analytics',   'Product analytics and feature flags',      TRUE),
  ('google_analytics',  'Google Analytics 4', 'analytics',   'Web traffic and conversion tracking',       TRUE),
  ('google_ads_api',    'Google Ads API',      'marketing',   'Programmatic ad management',                TRUE),
  ('meta_ads_api',      'Meta Ads API',        'marketing',   'Facebook/Instagram ad management',          TRUE),
  ('resend_email_api',  'Resend Email API',    'marketing',   'Email delivery',                             TRUE),
  ('klaviyo_api',       'Klaviyo API',         'marketing',   'Email & SMS automation',                     TRUE),
  ('google_trends_api', 'Google Trends API',   'marketing',   'Real-time search trend data',               FALSE),
  ('shopify_admin_api', 'Shopify Admin API',   'ecommerce',   'Full Shopify store management',              TRUE),
  ('stripe_api',        'Stripe API',          'finance',     'Payments and subscriptions',                 TRUE),
  ('github_api',        'GitHub API',          'dev',         'Repository and PR management',               TRUE),
  ('vercel_api',        'Vercel API',          'dev',         'Deployment management',                      TRUE),
  ('figma_api',         'Figma API',           'dev',         'Design asset extraction',                    TRUE),
  ('linear_api',        'Linear API',          'dev',         'Project and issue tracking',                 TRUE),
  ('playwright_browser','Playwright Browser',  'testing',     'Automated UI testing',                       FALSE),
  ('lighthouse_api',    'Lighthouse API',      'testing',     'Performance audits',                         FALSE),
  ('web_scraper',       'Web Scraper',          'productivity','Extract public data from any page',          FALSE),
  ('slack_api',         'Slack API',           'productivity', 'Send notifications to Slack',               TRUE),
  ('notion_api',        'Notion API',          'productivity', 'Read/write Notion databases',               TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ─── saved_architectures ───────────────────────────────────────────────────────
-- The Chairman's saved React Flow JSON graphs

CREATE TABLE IF NOT EXISTS saved_architectures (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name            TEXT NOT NULL,                  -- e.g. 'b2b_saas_v1'
  description     TEXT,
  company_type    TEXT,                            -- 'saas' | 'e-course' | 'd2c' | 'media'
  seed_budget_usd INTEGER DEFAULT 5000,
  canvas_json     JSONB NOT NULL,                  -- full React Flow {nodes, edges} state
  compiled_yaml   TEXT,                            -- cached compiled YAML (regenerated on load)
  thumbnail_url   TEXT,
  tags            TEXT[] DEFAULT '{}',
  node_count      INTEGER DEFAULT 0,
  edge_count      INTEGER DEFAULT 0,
  department_list TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Fast tag search
CREATE INDEX IF NOT EXISTS idx_saved_architectures_tags ON saved_architectures USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_saved_architectures_type ON saved_architectures (company_type);
CREATE INDEX IF NOT EXISTS idx_saved_architectures_updated ON saved_architectures (updated_at DESC);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_architectures
  BEFORE UPDATE ON saved_architectures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── architecture_tags ─────────────────────────────────────────────────────────
-- Pre-defined tag taxonomy for filtering the blueprint library

CREATE TABLE IF NOT EXISTS architecture_tags (
  id    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  label TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6366f1'
);

INSERT INTO architecture_tags (label, color) VALUES
  ('starter',     '#10b981'),
  ('enterprise',  '#6366f1'),
  ('e-commerce',  '#f59e0b'),
  ('saas',        '#06b6d4'),
  ('media',       '#8b5cf6'),
  ('aggressive',  '#f43f5e'),
  ('lean',        '#64748b'),
  ('ai-native',   '#a855f7')
ON CONFLICT (label) DO NOTHING;

-- ─── Row Level Security (enable but open for single-user Chairman setup) ───────

ALTER TABLE saved_architectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_adapters ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS by default — anon reads for public assets
CREATE POLICY "Public read agent_registry" ON agent_registry FOR SELECT USING (TRUE);
CREATE POLICY "Public read tool_registry" ON tool_registry FOR SELECT USING (TRUE);
CREATE POLICY "Public read framework_adapters" ON framework_adapters FOR SELECT USING (TRUE);
CREATE POLICY "Chairman full access architectures" ON saved_architectures USING (TRUE) WITH CHECK (TRUE);
