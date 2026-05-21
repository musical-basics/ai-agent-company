/**
 * SWARM FORGE — Static Registries
 * Pre-seeded libraries of agents, tools, and framework adapters.
 * These populate the Asset Palette and Inspector dropdowns.
 */

import type { AgentRegistryEntry, ToolRegistryEntry, PaletteItem, ModelOption } from './types';

// ─── Framework Adapters ───────────────────────────────────────────────────────

export const FRAMEWORK_ADAPTERS = [
  {
    id: 'Custom_ReAct',
    name: 'Custom ReAct',
    description: 'Custom Reason+Act loop — full control over agent logic',
    isNative: true,
  },
  {
    id: 'LangGraph',
    name: 'LangGraph',
    description: 'Graph-based orchestration by LangChain — ideal for complex flows',
    isNative: false,
    docsUrl: 'https://langchain-ai.github.io/langgraph/',
  },
  {
    id: 'OpenClaw',
    name: 'OpenClaw',
    description: 'Lightweight web-search + tool-calling agent framework',
    isNative: false,
  },
  {
    id: 'Hermes',
    name: 'Hermes',
    description: 'High-throughput message-passing agent runtime',
    isNative: false,
  },
  {
    id: 'AutoGen',
    name: 'AutoGen',
    description: 'Microsoft multi-agent conversation framework',
    isNative: false,
    docsUrl: 'https://microsoft.github.io/autogen/',
  },
  {
    id: 'SWE-agent',
    name: 'SWE-agent',
    description: 'Princeton SWE-bench agent — optimised for code tasks',
    isNative: false,
    docsUrl: 'https://swe-agent.com/',
  },
  {
    id: 'CrewAI',
    name: 'CrewAI',
    description: 'Role-based multi-agent crews with shared context',
    isNative: false,
    docsUrl: 'https://crewai.com/',
  },
] as const;

// ─── Agent Registry ───────────────────────────────────────────────────────────

export const AGENT_REGISTRY: AgentRegistryEntry[] = [
  // ── Workers ──
  { id: 'media_buyer',     name: 'Digital Media Buyer',      kind: 'worker',  framework: 'Custom_ReAct', description: 'Manages paid ad campaigns on Google, Meta, and TikTok', isThirdParty: false },
  { id: 'copywriter',      name: 'Performance Copywriter',   kind: 'worker',  framework: 'Custom_ReAct', description: 'Writes high-converting ad copy, emails, and landing pages', isThirdParty: false },
  { id: 'email_marketer',  name: 'Email Campaign Operator',  kind: 'worker',  framework: 'Custom_ReAct', description: 'Designs and deploys email sequences', isThirdParty: false },
  { id: 'frontend_dev',    name: 'Frontend Developer',       kind: 'worker',  framework: 'SWE-agent',    description: 'Builds and iterates React/Next.js product interfaces', isThirdParty: true },
  { id: 'shopify_dev',     name: 'E-Commerce Developer',     kind: 'worker',  framework: 'Custom_ReAct', description: 'Manages Shopify storefront, checkout flows, and themes', isThirdParty: false },
  { id: 'ux_designer',     name: 'UX/UI Designer',           kind: 'worker',  framework: 'Custom_ReAct', description: 'Creates design specs, wireframes, and design system updates', isThirdParty: false },
  { id: 'qa_analyst',      name: 'QA Analyst',               kind: 'worker',  framework: 'Custom_ReAct', description: 'Adversarially tests all outputs before production', isThirdParty: false },
  { id: 'data_analyst',    name: 'Business Data Analyst',    kind: 'worker',  framework: 'LangGraph',    description: 'Analyzes KPIs and produces performance reports', isThirdParty: true },
  { id: 'strategist',      name: 'Market Strategist',        kind: 'worker',  framework: 'Custom_ReAct', description: 'Competes market intelligence, recommends strategic pivots', isThirdParty: false },
  { id: 'content_creator', name: 'Content Creator',          kind: 'worker',  framework: 'Custom_ReAct', description: 'Produces blog posts, social content, and video scripts', isThirdParty: false },
  { id: 'seo_specialist',  name: 'SEO Specialist',           kind: 'worker',  framework: 'Custom_ReAct', description: 'Optimizes content for search engines', isThirdParty: false },
  { id: 'customer_support',name: 'Customer Support Agent',   kind: 'worker',  framework: 'Hermes',       description: 'Handles tier-1 customer inquiries and ticket routing', isThirdParty: true },

  // ── Managers ──
  { id: 'growth_manager',    name: 'Growth Marketing Manager',  kind: 'manager', framework: 'Custom_ReAct', description: 'Orchestrates the Growth Marketing department', isThirdParty: false },
  { id: 'product_manager',   name: 'Product Engineering Manager',kind: 'manager', framework: 'LangGraph',    description: 'Governs the Product Engineering department', isThirdParty: true },
  { id: 'qa_manager',        name: 'QA Manager',                 kind: 'manager', framework: 'Custom_ReAct', description: 'Owns QA protocols and acceptance gates', isThirdParty: false },
  { id: 'strategy_manager',  name: 'Strategy Manager',           kind: 'manager', framework: 'Custom_ReAct', description: 'Governs the Business Strategy department', isThirdParty: false },
  { id: 'ops_manager',       name: 'Operations Manager',         kind: 'manager', framework: 'CrewAI',       description: 'Coordinates cross-department operational pipelines', isThirdParty: true },
];

// ─── Tool Registry ────────────────────────────────────────────────────────────

export const TOOL_REGISTRY: ToolRegistryEntry[] = [
  // Analytics
  { id: 'posthog_analytics', name: 'PostHog Analytics',    category: 'analytics',   description: 'Product analytics, feature flags, session recording', requiresApiKey: true },
  { id: 'google_analytics',  name: 'Google Analytics 4',   category: 'analytics',   description: 'Web traffic and conversion tracking', requiresApiKey: true },
  { id: 'mixpanel',          name: 'Mixpanel',             category: 'analytics',   description: 'Event-based user analytics', requiresApiKey: true },

  // Marketing
  { id: 'google_ads_api',    name: 'Google Ads API',       category: 'marketing',   description: 'Programmatic ad management on Google', requiresApiKey: true },
  { id: 'meta_ads_api',      name: 'Meta Ads API',         category: 'marketing',   description: 'Facebook/Instagram ad management', requiresApiKey: true },
  { id: 'resend_email_api',  name: 'Resend Email API',     category: 'marketing',   description: 'Transactional and marketing email delivery', requiresApiKey: true },
  { id: 'klaviyo_api',       name: 'Klaviyo API',          category: 'marketing',   description: 'Email & SMS marketing automation', requiresApiKey: true },
  { id: 'google_trends_api', name: 'Google Trends API',    category: 'marketing',   description: 'Real-time search trend data', requiresApiKey: false },

  // E-Commerce
  { id: 'shopify_admin_api', name: 'Shopify Admin API',    category: 'ecommerce',   description: 'Full Shopify store management', requiresApiKey: true },
  { id: 'stripe_api',        name: 'Stripe API',           category: 'finance',     description: 'Payments, subscriptions, and billing', requiresApiKey: true },
  { id: 'paddle_api',        name: 'Paddle API',           category: 'finance',     description: 'Merchant of record billing', requiresApiKey: true },

  // Dev
  { id: 'github_api',        name: 'GitHub API',           category: 'dev',         description: 'Repository, PR, and issue management', requiresApiKey: true },
  { id: 'vercel_api',        name: 'Vercel API',           category: 'dev',         description: 'Deployment and preview environment management', requiresApiKey: true },
  { id: 'figma_api',         name: 'Figma API',            category: 'dev',         description: 'Design asset extraction and component inspection', requiresApiKey: true },
  { id: 'linear_api',        name: 'Linear API',           category: 'dev',         description: 'Project and issue tracking', requiresApiKey: true },

  // Testing
  { id: 'playwright_browser',name: 'Playwright Browser',   category: 'testing',     description: 'Automated UI testing and screenshot capture', requiresApiKey: false },
  { id: 'lighthouse_api',    name: 'Lighthouse API',       category: 'testing',     description: 'Performance and accessibility audits', requiresApiKey: false },

  // Productivity
  { id: 'web_scraper',       name: 'Web Scraper',          category: 'productivity', description: 'Extract public data from any web page', requiresApiKey: false },
  { id: 'slack_api',         name: 'Slack API',            category: 'productivity', description: 'Send notifications and updates to Slack channels', requiresApiKey: true },
  { id: 'notion_api',        name: 'Notion API',           category: 'productivity', description: 'Read/write to Notion databases and pages', requiresApiKey: true },
];

// ─── Palette Items ─────────────────────────────────────────────────────────────

export const PALETTE_WORKERS: PaletteItem[] = AGENT_REGISTRY
  .filter(a => a.kind === 'worker')
  .map(a => ({
    id: a.id,
    kind: 'worker' as const,
    label: a.name,
    description: a.description,
    defaultData: {
      kind: 'worker' as const,
      label: a.name,
      role: a.id,
      framework: a.framework,
      modelProvider: 'openai',
      modelId: 'gpt-4o',
      toolsGranted: [],
      budgetUsd: 200,
    },
  }));

export const PALETTE_MANAGERS: PaletteItem[] = AGENT_REGISTRY
  .filter(a => a.kind === 'manager')
  .map(a => ({
    id: a.id,
    kind: 'manager' as const,
    label: a.name,
    description: a.description,
    defaultData: {
      kind: 'manager' as const,
      label: a.name,
      department: a.id.replace('_manager', ''),
      framework: a.framework,
      modelProvider: 'openai',
      modelId: 'gpt-4o',
      toolsGranted: [],
      budgetUsd: 300,
    },
  }));

export const PALETTE_TOOLS: PaletteItem[] = TOOL_REGISTRY.map(t => ({
  id: t.id,
  kind: 'tool' as const,
  label: t.name,
  description: t.description,
  defaultData: {
    kind: 'tool' as const,
    toolId: t.id,
    name: t.name,
    category: t.category,
    description: t.description,
  },
}));

// ─── Default/Fallback Models (shown before live fetch) ────────────────────────

export const DEFAULT_MODELS: ModelOption[] = [
  // OpenAI
  { id: 'gpt-4o',           name: 'GPT-4o',                  provider: 'openai',    tier: 'flagship', description: 'Flagship multimodal model' },
  { id: 'gpt-4o-mini',      name: 'GPT-4o Mini',             provider: 'openai',    tier: 'fast',     description: 'Affordable, fast reasoning' },
  { id: 'o1',               name: 'o1',                      provider: 'openai',    tier: 'flagship', description: 'Advanced reasoning model' },
  { id: 'o3-mini',          name: 'o3-mini',                 provider: 'openai',    tier: 'fast',     description: 'Fast reasoning model' },

  // Anthropic
  { id: 'claude-opus-4-5',  name: 'Claude Opus 4.5',         provider: 'anthropic', tier: 'flagship', description: 'Most powerful Claude model' },
  { id: 'claude-sonnet-4-5',name: 'Claude Sonnet 4.5',       provider: 'anthropic', tier: 'balanced', description: 'Balance of speed and intelligence' },
  { id: 'claude-haiku-3-5', name: 'Claude Haiku 3.5',        provider: 'anthropic', tier: 'fast',     description: 'Fast and compact' },

  // Google
  { id: 'gemini-2.5-pro',   name: 'Gemini 2.5 Pro',          provider: 'google',    tier: 'flagship', description: 'Google\'s most capable model' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash',        provider: 'google',    tier: 'fast',     description: 'Fast multimodal model' },

  // Meta
  { id: 'llama-3.3-70b',    name: 'Llama 3.3 70B',           provider: 'meta',      tier: 'balanced', description: 'Open-source, self-hostable' },
  { id: 'llama-3.1-8b',     name: 'Llama 3.1 8B',            provider: 'meta',      tier: 'local',    description: 'Lightweight local inference' },

  // Mistral
  { id: 'mistral-large',    name: 'Mistral Large',           provider: 'mistral',   tier: 'flagship', description: 'Mistral\'s flagship reasoning model' },
  { id: 'mistral-small',    name: 'Mistral Small',           provider: 'mistral',   tier: 'fast',     description: 'Efficient and cost-effective' },
];
