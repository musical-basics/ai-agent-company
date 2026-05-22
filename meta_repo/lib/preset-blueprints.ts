/**
 * SWARM FORGE — Preset Blueprints
 * Six pre-built company architectures the Chairman can browse, load, and fork.
 * Based on real Commander OS topology and business models.
 */

import type { ArchitectureBlueprint, CanvasNode, CanvasEdge } from './types';

// ─── Blueprint 1: Musical Basics (Commander OS — the actual system) ────────────

const musicalBasicsNodes: CanvasNode[] = [
  {
    id: 'mb_ceo', type: 'ceo', position: { x: 480, y: 40 },
    data: {
      kind: 'ceo', label: 'Commander (AI CEO)',
      modelProvider: 'anthropic', modelId: 'claude-opus-4-5',
      directivesFile: 'IDENTITY.md', cultureFile: 'SOUL.md',
      maxPhaseCount: 8, budgetAlertThresholdPct: 80,
    },
  },
  {
    id: 'mb_mgr_mktg', type: 'manager', position: { x: 160, y: 190 },
    data: {
      kind: 'manager', label: 'Concert Marketing Manager',
      department: 'concert_marketing', framework: 'OpenClaw',
      modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5',
      toolsGranted: ['google_analytics', 'meta_ads', 'google_ads'],
      budgetUsd: 1500, gitMindDir: 'apps/belgium-concert/',
    },
  },
  {
    id: 'mb_mgr_product', type: 'manager', position: { x: 480, y: 190 },
    data: {
      kind: 'manager', label: 'Product Engineering Manager',
      department: 'product_engineering', framework: 'OpenClaw',
      modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5',
      toolsGranted: ['github', 'vercel', 'playwright'],
      budgetUsd: 2000, gitMindDir: 'apps/dreamplay/',
    },
  },
  {
    id: 'mb_mgr_studio', type: 'manager', position: { x: 800, y: 190 },
    data: {
      kind: 'manager', label: 'Piano Studio Manager',
      department: 'piano_studio', framework: 'OpenClaw',
      modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5',
      toolsGranted: ['stripe', 'calendar_api', 'youtube_api'],
      budgetUsd: 800, gitMindDir: 'apps/piano-studio/',
    },
  },
  {
    id: 'mb_w1', type: 'worker', position: { x: 60, y: 360 },
    data: {
      kind: 'worker', label: 'Google Ads Specialist',
      role: 'ads_specialist', department: 'concert_marketing',
      framework: 'OpenClaw', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5',
      toolsGranted: ['google_ads', 'google_analytics'],
      budgetUsd: 600, sopFile: 'apps/belgium-concert/RUNBOOK.md',
    },
  },
  {
    id: 'mb_w2', type: 'worker', position: { x: 270, y: 360 },
    data: {
      kind: 'worker', label: 'Copywriter',
      role: 'copywriter', department: 'concert_marketing',
      framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-opus-4-5',
      toolsGranted: ['meta_ads'],
      budgetUsd: 400, sopFile: 'apps/belgium-concert/RUNBOOK.md',
    },
  },
  {
    id: 'mb_w3', type: 'worker', position: { x: 400, y: 360 },
    data: {
      kind: 'worker', label: 'DreamPlay Web Agent',
      role: 'web_engineer', department: 'product_engineering',
      framework: 'OpenClaw', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5',
      toolsGranted: ['github', 'vercel'],
      budgetUsd: 800, sopFile: 'apps/dreamplay/RUNBOOK.md',
    },
  },
  {
    id: 'mb_w4', type: 'worker', position: { x: 570, y: 360 },
    data: {
      kind: 'worker', label: 'QA Playwright Agent',
      role: 'qa_engineer', department: 'product_engineering',
      framework: 'SWE-agent', modelProvider: 'openai', modelId: 'gpt-4o',
      toolsGranted: ['playwright', 'github'],
      budgetUsd: 400, sopFile: 'apps/dreamplay/RUNBOOK.md',
    },
  },
  {
    id: 'mb_w5', type: 'worker', position: { x: 700, y: 360 },
    data: {
      kind: 'worker', label: 'Ultimate Pianist Agent',
      role: 'course_engineer', department: 'piano_studio',
      framework: 'OpenClaw', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5',
      toolsGranted: ['youtube_api', 'stripe'],
      budgetUsd: 500, sopFile: 'apps/ultimate-pianist/RUNBOOK.md',
    },
  },
  {
    id: 'mb_w6', type: 'worker', position: { x: 880, y: 360 },
    data: {
      kind: 'worker', label: 'Student Success Agent',
      role: 'student_ops', department: 'piano_studio',
      framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-haiku-3-5',
      toolsGranted: ['stripe', 'calendar_api'],
      budgetUsd: 200, sopFile: 'apps/piano-studio/RUNBOOK.md',
    },
  },
];

const musicalBasicsEdges: CanvasEdge[] = [
  { id: 'mb_e1', source: 'mb_ceo', target: 'mb_mgr_mktg', data: { slaId: 'ceo_to_concert_marketing', requiredArtifactKeys: ['directive_id', 'target_market', 'budget_eur', 'deadline'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 }, description: 'CEO → Concert Marketing directives' } },
  { id: 'mb_e2', source: 'mb_ceo', target: 'mb_mgr_product', data: { slaId: 'ceo_to_product', requiredArtifactKeys: ['directive_id', 'feature_spec', 'deadline'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 }, description: 'CEO → Product directives' } },
  { id: 'mb_e3', source: 'mb_ceo', target: 'mb_mgr_studio', data: { slaId: 'ceo_to_studio', requiredArtifactKeys: ['directive_id', 'student_goals'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 }, description: 'CEO → Piano Studio directives' } },
  { id: 'mb_e4', source: 'mb_mgr_mktg', target: 'mb_w1', data: { slaId: 'mktg_to_ads', requiredArtifactKeys: ['campaign_type', 'target_keywords', 'budget_eur'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 }, description: 'Ads campaign brief' } },
  { id: 'mb_e5', source: 'mb_mgr_mktg', target: 'mb_w2', data: { slaId: 'mktg_to_copy', requiredArtifactKeys: ['tone', 'target_audience', 'copy_text'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 }, description: 'Copy brief' } },
  { id: 'mb_e6', source: 'mb_mgr_mktg', target: 'mb_mgr_product', data: { slaId: 'marketing_to_product', requiredArtifactKeys: ['target_audience', 'copy_text', 'vip_pricing', 'style_details'], rejectionPolicy: { maxRetries: 3, escalateToCeoAfter: 2 }, description: 'Campaign brief → Landing page' } },
  { id: 'mb_e7', source: 'mb_mgr_product', target: 'mb_w3', data: { slaId: 'product_to_web', requiredArtifactKeys: ['feature_spec', 'staging_url'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 }, description: 'Web implementation task' } },
  { id: 'mb_e8', source: 'mb_w3', target: 'mb_w4', data: { slaId: 'web_to_qa', requiredArtifactKeys: ['staging_url', 'git_commit', 'changes_made'], rejectionPolicy: { maxRetries: 3, escalateToCeoAfter: 2 }, description: 'QA sign-off request' } },
  { id: 'mb_e9', source: 'mb_mgr_studio', target: 'mb_w5', data: { slaId: 'studio_to_course', requiredArtifactKeys: ['module_spec', 'video_url'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 }, description: 'Course module task' } },
  { id: 'mb_e10', source: 'mb_mgr_studio', target: 'mb_w6', data: { slaId: 'studio_to_student_ops', requiredArtifactKeys: ['student_id', 'session_type'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 }, description: 'Student scheduling' } },
];

// ─── Blueprint 2: Lean SaaS Startup ───────────────────────────────────────────

const leanSaasNodes: CanvasNode[] = [
  {
    id: 'saas_ceo', type: 'ceo', position: { x: 360, y: 40 },
    data: { kind: 'ceo', label: 'AI CEO', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', maxPhaseCount: 6, budgetAlertThresholdPct: 75 },
  },
  {
    id: 'saas_mgr_growth', type: 'manager', position: { x: 160, y: 180 },
    data: { kind: 'manager', label: 'Growth Manager', department: 'growth', framework: 'LangGraph', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['google_analytics', 'meta_ads'], budgetUsd: 2000 },
  },
  {
    id: 'saas_mgr_eng', type: 'manager', position: { x: 560, y: 180 },
    data: { kind: 'manager', label: 'Engineering Manager', department: 'engineering', framework: 'OpenClaw', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5', toolsGranted: ['github', 'vercel', 'playwright'], budgetUsd: 3000 },
  },
  {
    id: 'saas_w1', type: 'worker', position: { x: 60, y: 340 },
    data: { kind: 'worker', label: 'SEO Strategist', role: 'seo', department: 'growth', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['google_analytics'], budgetUsd: 500 },
  },
  {
    id: 'saas_w2', type: 'worker', position: { x: 240, y: 340 },
    data: { kind: 'worker', label: 'Paid Ads Manager', role: 'ads', department: 'growth', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o-mini', toolsGranted: ['google_ads', 'meta_ads'], budgetUsd: 1200 },
  },
  {
    id: 'saas_w3', type: 'worker', position: { x: 420, y: 340 },
    data: { kind: 'worker', label: 'Full-Stack Engineer', role: 'engineer', department: 'engineering', framework: 'SWE-agent', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5', toolsGranted: ['github', 'vercel'], budgetUsd: 1500 },
  },
  {
    id: 'saas_w4', type: 'worker', position: { x: 620, y: 340 },
    data: { kind: 'worker', label: 'QA Engineer', role: 'qa', department: 'engineering', framework: 'SWE-agent', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['playwright'], budgetUsd: 600 },
  },
  {
    id: 'saas_w5', type: 'worker', position: { x: 800, y: 340 },
    data: { kind: 'worker', label: 'Customer Success Agent', role: 'cs', department: 'engineering', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o-mini', toolsGranted: ['stripe', 'slack_api'], budgetUsd: 300 },
  },
];

const leanSaasEdges: CanvasEdge[] = [
  { id: 'saas_e1', source: 'saas_ceo', target: 'saas_mgr_growth', data: { slaId: 'ceo_to_growth', requiredArtifactKeys: ['okr', 'budget_usd', 'deadline'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'saas_e2', source: 'saas_ceo', target: 'saas_mgr_eng', data: { slaId: 'ceo_to_engineering', requiredArtifactKeys: ['feature_spec', 'deadline', 'priority'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'saas_e3', source: 'saas_mgr_growth', target: 'saas_w1', data: { slaId: 'growth_to_seo', requiredArtifactKeys: ['target_keywords', 'content_brief'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'saas_e4', source: 'saas_mgr_growth', target: 'saas_w2', data: { slaId: 'growth_to_ads', requiredArtifactKeys: ['ad_budget', 'target_audience', 'cpa_target'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'saas_e5', source: 'saas_mgr_eng', target: 'saas_w3', data: { slaId: 'eng_to_dev', requiredArtifactKeys: ['pr_description', 'acceptance_criteria'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'saas_e6', source: 'saas_w3', target: 'saas_w4', data: { slaId: 'dev_to_qa', requiredArtifactKeys: ['staging_url', 'git_commit', 'test_scenarios'], rejectionPolicy: { maxRetries: 3, escalateToCeoAfter: 2 } } },
];

// ─── Blueprint 3: D2C E-Commerce Brand ────────────────────────────────────────

const d2cNodes: CanvasNode[] = [
  {
    id: 'd2c_ceo', type: 'ceo', position: { x: 520, y: 40 },
    data: { kind: 'ceo', label: 'Brand CEO', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', maxPhaseCount: 5, budgetAlertThresholdPct: 70 },
  },
  {
    id: 'd2c_mgr_brand', type: 'manager', position: { x: 120, y: 180 },
    data: { kind: 'manager', label: 'Brand & Creative Director', department: 'creative', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', toolsGranted: ['meta_ads', 'youtube_api'], budgetUsd: 3000 },
  },
  {
    id: 'd2c_mgr_ecom', type: 'manager', position: { x: 400, y: 180 },
    data: { kind: 'manager', label: 'E-Commerce Manager', department: 'ecommerce', framework: 'LangGraph', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['shopify', 'stripe', 'google_analytics'], budgetUsd: 2500 },
  },
  {
    id: 'd2c_mgr_ops', type: 'manager', position: { x: 720, y: 180 },
    data: { kind: 'manager', label: 'Ops & Finance Manager', department: 'operations', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['stripe', 'quickbooks'], budgetUsd: 1000 },
  },
  {
    id: 'd2c_w1', type: 'worker', position: { x: 40, y: 340 },
    data: { kind: 'worker', label: 'UGC Content Creator', role: 'content', department: 'creative', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5', toolsGranted: ['youtube_api'], budgetUsd: 800 },
  },
  {
    id: 'd2c_w2', type: 'worker', position: { x: 200, y: 340 },
    data: { kind: 'worker', label: 'Meta Ads Buyer', role: 'ads', department: 'creative', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['meta_ads', 'google_analytics'], budgetUsd: 2000 },
  },
  {
    id: 'd2c_w3', type: 'worker', position: { x: 360, y: 340 },
    data: { kind: 'worker', label: 'Shopify Dev', role: 'shopify', department: 'ecommerce', framework: 'SWE-agent', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5', toolsGranted: ['shopify', 'github'], budgetUsd: 1000 },
  },
  {
    id: 'd2c_w4', type: 'worker', position: { x: 540, y: 340 },
    data: { kind: 'worker', label: 'Email Marketing Agent', role: 'email', department: 'ecommerce', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o-mini', toolsGranted: ['stripe'], budgetUsd: 400 },
  },
  {
    id: 'd2c_w5', type: 'worker', position: { x: 680, y: 340 },
    data: { kind: 'worker', label: 'Revenue Analyst', role: 'analyst', department: 'operations', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['stripe', 'google_analytics', 'quickbooks'], budgetUsd: 600 },
  },
  {
    id: 'd2c_w6', type: 'worker', position: { x: 860, y: 340 },
    data: { kind: 'worker', label: 'Inventory Agent', role: 'inventory', department: 'operations', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o-mini', toolsGranted: ['shopify'], budgetUsd: 200 },
  },
];

const d2cEdges: CanvasEdge[] = [
  { id: 'd2c_e1', source: 'd2c_ceo', target: 'd2c_mgr_brand', data: { slaId: 'ceo_to_creative', requiredArtifactKeys: ['campaign_goal', 'budget_usd', 'brand_voice'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'd2c_e2', source: 'd2c_ceo', target: 'd2c_mgr_ecom', data: { slaId: 'ceo_to_ecom', requiredArtifactKeys: ['revenue_target', 'product_focus'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'd2c_e3', source: 'd2c_ceo', target: 'd2c_mgr_ops', data: { slaId: 'ceo_to_ops', requiredArtifactKeys: ['budget_review_period'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'd2c_e4', source: 'd2c_mgr_brand', target: 'd2c_w1', data: { slaId: 'creative_to_ugc', requiredArtifactKeys: ['script', 'hook', 'cta'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'd2c_e5', source: 'd2c_mgr_brand', target: 'd2c_w2', data: { slaId: 'creative_to_ads', requiredArtifactKeys: ['ad_creative_url', 'copy', 'audience_segment', 'daily_budget_usd'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'd2c_e6', source: 'd2c_mgr_ecom', target: 'd2c_w3', data: { slaId: 'ecom_to_shopify', requiredArtifactKeys: ['feature_description', 'affected_pages'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'd2c_e7', source: 'd2c_mgr_ecom', target: 'd2c_w4', data: { slaId: 'ecom_to_email', requiredArtifactKeys: ['segment', 'subject_line', 'offer'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'd2c_e8', source: 'd2c_w2', target: 'd2c_mgr_ecom', data: { slaId: 'ads_to_ecom_feedback', requiredArtifactKeys: ['roas', 'cpm', 'winning_creative'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 2 } } },
];

// ─── Blueprint 4: Online Course Empire ────────────────────────────────────────

const courseNodes: CanvasNode[] = [
  {
    id: 'crs_ceo', type: 'ceo', position: { x: 480, y: 40 },
    data: { kind: 'ceo', label: 'Course Empire CEO', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', maxPhaseCount: 7, budgetAlertThresholdPct: 75 },
  },
  {
    id: 'crs_mgr_content', type: 'manager', position: { x: 140, y: 180 },
    data: { kind: 'manager', label: 'Content Production Manager', department: 'content', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', toolsGranted: ['youtube_api'], budgetUsd: 2500 },
  },
  {
    id: 'crs_mgr_acq', type: 'manager', position: { x: 480, y: 180 },
    data: { kind: 'manager', label: 'Student Acquisition Manager', department: 'acquisition', framework: 'LangGraph', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['meta_ads', 'google_ads', 'google_analytics'], budgetUsd: 4000 },
  },
  {
    id: 'crs_mgr_success', type: 'manager', position: { x: 820, y: 180 },
    data: { kind: 'manager', label: 'Student Success Manager', department: 'student_success', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['stripe', 'slack_api'], budgetUsd: 1200 },
  },
  {
    id: 'crs_w1', type: 'worker', position: { x: 60, y: 340 },
    data: { kind: 'worker', label: 'Script Writer', role: 'scriptwriter', department: 'content', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', toolsGranted: [], budgetUsd: 600 },
  },
  {
    id: 'crs_w2', type: 'worker', position: { x: 220, y: 340 },
    data: { kind: 'worker', label: 'Video SEO Agent', role: 'video_seo', department: 'content', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['youtube_api', 'google_analytics'], budgetUsd: 400 },
  },
  {
    id: 'crs_w3', type: 'worker', position: { x: 380, y: 340 },
    data: { kind: 'worker', label: 'Funnel Copywriter', role: 'funnel_copy', department: 'acquisition', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', toolsGranted: [], budgetUsd: 700 },
  },
  {
    id: 'crs_w4', type: 'worker', position: { x: 560, y: 340 },
    data: { kind: 'worker', label: 'Paid Traffic Manager', role: 'paid_traffic', department: 'acquisition', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['meta_ads', 'google_ads', 'google_analytics'], budgetUsd: 2500 },
  },
  {
    id: 'crs_w5', type: 'worker', position: { x: 730, y: 340 },
    data: { kind: 'worker', label: 'Onboarding Agent', role: 'onboarding', department: 'student_success', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o-mini', toolsGranted: ['stripe', 'slack_api'], budgetUsd: 300 },
  },
  {
    id: 'crs_w6', type: 'worker', position: { x: 900, y: 340 },
    data: { kind: 'worker', label: 'Retention & Upsell Agent', role: 'retention', department: 'student_success', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['stripe'], budgetUsd: 600 },
  },
];

const courseEdges: CanvasEdge[] = [
  { id: 'crs_e1', source: 'crs_ceo', target: 'crs_mgr_content', data: { slaId: 'ceo_to_content', requiredArtifactKeys: ['module_title', 'learning_objectives', 'deadline'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'crs_e2', source: 'crs_ceo', target: 'crs_mgr_acq', data: { slaId: 'ceo_to_acquisition', requiredArtifactKeys: ['monthly_student_target', 'cac_target_usd', 'budget_usd'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'crs_e3', source: 'crs_ceo', target: 'crs_mgr_success', data: { slaId: 'ceo_to_success', requiredArtifactKeys: ['ltv_target', 'churn_target_pct'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'crs_e4', source: 'crs_mgr_content', target: 'crs_w1', data: { slaId: 'content_to_script', requiredArtifactKeys: ['module_outline', 'tone', 'target_student_persona'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'crs_e5', source: 'crs_w1', target: 'crs_w2', data: { slaId: 'script_to_seo', requiredArtifactKeys: ['video_title', 'transcript', 'tags'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'crs_e6', source: 'crs_mgr_acq', target: 'crs_w3', data: { slaId: 'acq_to_copy', requiredArtifactKeys: ['product_name', 'target_persona', 'price_point', 'hero_promise'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'crs_e7', source: 'crs_w3', target: 'crs_w4', data: { slaId: 'copy_to_traffic', requiredArtifactKeys: ['landing_page_url', 'headline', 'ad_angles'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'crs_e8', source: 'crs_mgr_success', target: 'crs_w5', data: { slaId: 'success_to_onboarding', requiredArtifactKeys: ['student_id', 'course_id', 'access_tier'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'crs_e9', source: 'crs_mgr_success', target: 'crs_w6', data: { slaId: 'success_to_retention', requiredArtifactKeys: ['at_risk_student_ids', 'upsell_offer'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
];

// ─── Blueprint 5: Media & Newsletter Company ──────────────────────────────────

const mediaNodes: CanvasNode[] = [
  {
    id: 'med_ceo', type: 'ceo', position: { x: 400, y: 40 },
    data: { kind: 'ceo', label: 'Media Company CEO', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', maxPhaseCount: 6, budgetAlertThresholdPct: 80 },
  },
  {
    id: 'med_mgr_editorial', type: 'manager', position: { x: 160, y: 180 },
    data: { kind: 'manager', label: 'Editorial Manager', department: 'editorial', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', toolsGranted: ['youtube_api'], budgetUsd: 2000 },
  },
  {
    id: 'med_mgr_distribution', type: 'manager', position: { x: 640, y: 180 },
    data: { kind: 'manager', label: 'Distribution Manager', department: 'distribution', framework: 'LangGraph', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['meta_ads', 'google_analytics', 'google_ads'], budgetUsd: 3000 },
  },
  {
    id: 'med_w1', type: 'worker', position: { x: 40, y: 340 },
    data: { kind: 'worker', label: 'Research Agent', role: 'research', department: 'editorial', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5', toolsGranted: ['perplexity_api', 'google_analytics'], budgetUsd: 300 },
  },
  {
    id: 'med_w2', type: 'worker', position: { x: 190, y: 340 },
    data: { kind: 'worker', label: 'Long-Form Writer', role: 'writer', department: 'editorial', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', toolsGranted: [], budgetUsd: 800 },
  },
  {
    id: 'med_w3', type: 'worker', position: { x: 340, y: 340 },
    data: { kind: 'worker', label: 'Social Clip Editor', role: 'social', department: 'editorial', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['youtube_api'], budgetUsd: 400 },
  },
  {
    id: 'med_w4', type: 'worker', position: { x: 500, y: 340 },
    data: { kind: 'worker', label: 'Newsletter Sender', role: 'newsletter', department: 'distribution', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o-mini', toolsGranted: ['stripe'], budgetUsd: 200 },
  },
  {
    id: 'med_w5', type: 'worker', position: { x: 660, y: 340 },
    data: { kind: 'worker', label: 'SEO Publisher', role: 'seo', department: 'distribution', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['google_analytics'], budgetUsd: 400 },
  },
  {
    id: 'med_w6', type: 'worker', position: { x: 820, y: 340 },
    data: { kind: 'worker', label: 'Sponsor Outreach Agent', role: 'sponsorship', department: 'distribution', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5', toolsGranted: ['stripe'], budgetUsd: 300 },
  },
];

const mediaEdges: CanvasEdge[] = [
  { id: 'med_e1', source: 'med_ceo', target: 'med_mgr_editorial', data: { slaId: 'ceo_to_editorial', requiredArtifactKeys: ['content_theme', 'publish_cadence', 'word_count'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'med_e2', source: 'med_ceo', target: 'med_mgr_distribution', data: { slaId: 'ceo_to_distribution', requiredArtifactKeys: ['growth_target', 'distribution_channels'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'med_e3', source: 'med_mgr_editorial', target: 'med_w1', data: { slaId: 'editorial_to_research', requiredArtifactKeys: ['topic', 'angle', 'target_audience'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'med_e4', source: 'med_w1', target: 'med_w2', data: { slaId: 'research_to_writer', requiredArtifactKeys: ['research_notes', 'key_stats', 'outline'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'med_e5', source: 'med_w2', target: 'med_w3', data: { slaId: 'writer_to_social', requiredArtifactKeys: ['article_url', 'key_quotes', 'thumbnail'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'med_e6', source: 'med_mgr_distribution', target: 'med_w4', data: { slaId: 'distribution_to_newsletter', requiredArtifactKeys: ['article_url', 'subject_line', 'preview_text', 'segment'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'med_e7', source: 'med_mgr_distribution', target: 'med_w5', data: { slaId: 'distribution_to_seo', requiredArtifactKeys: ['article_url', 'meta_title', 'meta_description'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
];

// ─── Blueprint 6: Coaching & Consulting Practice ───────────────────────────────

const coachingNodes: CanvasNode[] = [
  {
    id: 'cch_ceo', type: 'ceo', position: { x: 360, y: 40 },
    data: { kind: 'ceo', label: 'Practice CEO', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', maxPhaseCount: 5, budgetAlertThresholdPct: 80 },
  },
  {
    id: 'cch_mgr_sales', type: 'manager', position: { x: 140, y: 180 },
    data: { kind: 'manager', label: 'Sales & Pipeline Manager', department: 'sales', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['stripe', 'calendar_api'], budgetUsd: 1500 },
  },
  {
    id: 'cch_mgr_delivery', type: 'manager', position: { x: 580, y: 180 },
    data: { kind: 'manager', label: 'Client Delivery Manager', department: 'delivery', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5', toolsGranted: ['slack_api', 'stripe'], budgetUsd: 1200 },
  },
  {
    id: 'cch_w1', type: 'worker', position: { x: 40, y: 340 },
    data: { kind: 'worker', label: 'Outbound Prospecting Agent', role: 'prospecting', department: 'sales', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: [], budgetUsd: 400 },
  },
  {
    id: 'cch_w2', type: 'worker', position: { x: 200, y: 340 },
    data: { kind: 'worker', label: 'Proposal Writer', role: 'proposals', department: 'sales', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-opus-4-5', toolsGranted: ['stripe'], budgetUsd: 600 },
  },
  {
    id: 'cch_w3', type: 'worker', position: { x: 360, y: 340 },
    data: { kind: 'worker', label: 'Scheduler & Follow-up Agent', role: 'scheduling', department: 'sales', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o-mini', toolsGranted: ['calendar_api'], budgetUsd: 150 },
  },
  {
    id: 'cch_w4', type: 'worker', position: { x: 500, y: 340 },
    data: { kind: 'worker', label: 'Client Onboarding Agent', role: 'onboarding', department: 'delivery', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o', toolsGranted: ['stripe', 'slack_api'], budgetUsd: 300 },
  },
  {
    id: 'cch_w5', type: 'worker', position: { x: 660, y: 340 },
    data: { kind: 'worker', label: 'Deliverable Researcher', role: 'research', department: 'delivery', framework: 'Custom_ReAct', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-5', toolsGranted: [], budgetUsd: 500 },
  },
  {
    id: 'cch_w6', type: 'worker', position: { x: 820, y: 340 },
    data: { kind: 'worker', label: 'Testimonial & Referral Agent', role: 'referrals', department: 'delivery', framework: 'Custom_ReAct', modelProvider: 'openai', modelId: 'gpt-4o-mini', toolsGranted: ['stripe'], budgetUsd: 150 },
  },
];

const coachingEdges: CanvasEdge[] = [
  { id: 'cch_e1', source: 'cch_ceo', target: 'cch_mgr_sales', data: { slaId: 'ceo_to_sales', requiredArtifactKeys: ['monthly_revenue_target', 'icp_profile'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'cch_e2', source: 'cch_ceo', target: 'cch_mgr_delivery', data: { slaId: 'ceo_to_delivery', requiredArtifactKeys: ['active_clients', 'satisfaction_target'], rejectionPolicy: { maxRetries: 1, escalateToCeoAfter: 1 } } },
  { id: 'cch_e3', source: 'cch_mgr_sales', target: 'cch_w1', data: { slaId: 'sales_to_prospecting', requiredArtifactKeys: ['icp_criteria', 'outreach_script', 'weekly_quota'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'cch_e4', source: 'cch_w1', target: 'cch_w2', data: { slaId: 'prospect_to_proposal', requiredArtifactKeys: ['prospect_name', 'pain_points', 'budget_range'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'cch_e5', source: 'cch_w2', target: 'cch_w3', data: { slaId: 'proposal_to_scheduling', requiredArtifactKeys: ['proposal_url', 'prospect_email', 'follow_up_cadence'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'cch_e6', source: 'cch_mgr_sales', target: 'cch_mgr_delivery', data: { slaId: 'sales_to_delivery_handoff', requiredArtifactKeys: ['client_name', 'contract_value', 'scope_of_work', 'start_date'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'cch_e7', source: 'cch_mgr_delivery', target: 'cch_w4', data: { slaId: 'delivery_to_onboarding', requiredArtifactKeys: ['client_id', 'access_requirements'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'cch_e8', source: 'cch_mgr_delivery', target: 'cch_w5', data: { slaId: 'delivery_to_research', requiredArtifactKeys: ['deliverable_type', 'client_context', 'deadline'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
  { id: 'cch_e9', source: 'cch_w5', target: 'cch_w6', data: { slaId: 'research_to_referral', requiredArtifactKeys: ['satisfaction_score', 'completion_date'], rejectionPolicy: { maxRetries: 2, escalateToCeoAfter: 1 } } },
];

// ─── Export all presets ───────────────────────────────────────────────────────

const now = new Date().toISOString();

export const PRESET_BLUEPRINTS: ArchitectureBlueprint[] = [
  {
    id: 'preset_musical_basics',
    name: 'Musical Basics (Commander OS)',
    description: 'The actual Commander OS topology — AI CEO orchestrating Concert Marketing, Product Engineering (DreamPlay + QA), and Piano Studio departments. OpenClaw-native with Anthropic models throughout.',
    tags: ['music', 'real-world', 'openclaw', 'multi-department'],
    companyType: 'coaching',
    seedBudgetUsd: 6000,
    nodes: musicalBasicsNodes,
    edges: musicalBasicsEdges,
    createdAt: now, updatedAt: now,
  },
  {
    id: 'preset_lean_saas',
    name: 'Lean SaaS Startup',
    description: 'Minimal 2-department structure for a bootstrapped SaaS: Growth (SEO + Paid Ads) and Engineering (Dev + QA + CS). Mix of GPT-4o and Claude Sonnet for cost efficiency.',
    tags: ['saas', 'lean', 'startup', 'gpt-4o'],
    companyType: 'saas',
    seedBudgetUsd: 8000,
    nodes: leanSaasNodes,
    edges: leanSaasEdges,
    createdAt: now, updatedAt: now,
  },
  {
    id: 'preset_d2c',
    name: 'D2C E-Commerce Brand',
    description: 'Full D2C stack: Creative direction → UGC + Meta Ads, E-Commerce (Shopify dev + email flows), Operations & Finance. Shopify + Stripe + Meta integration-heavy.',
    tags: ['ecommerce', 'shopify', 'meta-ads', 'd2c'],
    companyType: 'd2c',
    seedBudgetUsd: 12000,
    nodes: d2cNodes,
    edges: d2cEdges,
    createdAt: now, updatedAt: now,
  },
  {
    id: 'preset_course',
    name: 'Online Course Empire',
    description: 'Three-pillar course business: Content Production (scripting + YouTube SEO), Student Acquisition (funnel copy + paid traffic), Student Success (onboarding + retention/upsell).',
    tags: ['e-course', 'funnel', 'youtube', 'meta-ads', 'acquisition'],
    companyType: 'e-course',
    seedBudgetUsd: 10000,
    nodes: courseNodes,
    edges: courseEdges,
    createdAt: now, updatedAt: now,
  },
  {
    id: 'preset_media',
    name: 'Media & Newsletter Company',
    description: 'Content flywheel: Research → Long-form writing → Social clips → Newsletter distribution + SEO + Sponsorship outreach. Claude Opus for research and writing, GPT for distribution ops.',
    tags: ['media', 'newsletter', 'seo', 'content-flywheel'],
    companyType: 'media',
    seedBudgetUsd: 7000,
    nodes: mediaNodes,
    edges: mediaEdges,
    createdAt: now, updatedAt: now,
  },
  {
    id: 'preset_coaching',
    name: 'Coaching & Consulting Practice',
    description: 'High-ticket service business: Sales pipeline (prospecting + proposals + scheduling) and Client Delivery (onboarding + research + referral harvesting). Lightweight and high-margin.',
    tags: ['coaching', 'consulting', 'high-ticket', 'sales-pipeline'],
    companyType: 'coaching',
    seedBudgetUsd: 4000,
    nodes: coachingNodes,
    edges: coachingEdges,
    createdAt: now, updatedAt: now,
  },
];
