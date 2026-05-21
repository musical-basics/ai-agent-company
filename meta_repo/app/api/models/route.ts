/**
 * GET /api/models
 * Fetches available models from each AI provider's public API.
 * Falls back to DEFAULT_MODELS if a provider is unavailable or key not set.
 *
 * Rule 13: Always ping the actual provider APIs to show current models.
 */

import { NextResponse } from 'next/server';
import type { ModelOption, ModelProvider } from '@/lib/types';
import { DEFAULT_MODELS } from '@/lib/registry';

interface ModelFetchResult {
  provider: ModelProvider;
  models: ModelOption[];
  error?: string;
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────

async function fetchOpenAIModels(): Promise<ModelFetchResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      provider: 'openai',
      models: DEFAULT_MODELS.filter((m) => m.provider === 'openai'),
      error: 'OPENAI_API_KEY not configured',
    };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Filter to GPT and o-series models only
    const relevant = (data.data as { id: string }[])
      .filter((m) =>
        m.id.startsWith('gpt-') || m.id.startsWith('o1') || m.id.startsWith('o3') || m.id.startsWith('o4')
      )
      .map((m): ModelOption => ({
        id: m.id,
        name: m.id
          .replace('gpt-4o', 'GPT-4o')
          .replace('gpt-4-', 'GPT-4 ')
          .replace('gpt-3.5-', 'GPT-3.5 ')
          .replace('-preview', ' (preview)'),
        provider: 'openai',
        tier: m.id.includes('mini') ? 'fast' : m.id.includes('o1') || m.id.includes('o3') ? 'flagship' : 'balanced',
      }))
      .sort((a, b) => b.id.localeCompare(a.id));

    return { provider: 'openai', models: relevant.length ? relevant : DEFAULT_MODELS.filter((m) => m.provider === 'openai') };
  } catch (err) {
    return {
      provider: 'openai',
      models: DEFAULT_MODELS.filter((m) => m.provider === 'openai'),
      error: String(err),
    };
  }
}

// ─── Anthropic ────────────────────────────────────────────────────────────────

async function fetchAnthropicModels(): Promise<ModelFetchResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      provider: 'anthropic',
      models: DEFAULT_MODELS.filter((m) => m.provider === 'anthropic'),
      error: 'ANTHROPIC_API_KEY not configured',
    };
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const models = ((data.data || data.models || []) as { id: string; display_name?: string }[]).map(
      (m): ModelOption => ({
        id: m.id,
        name: m.display_name || m.id,
        provider: 'anthropic',
        tier: m.id.includes('opus') ? 'flagship' : m.id.includes('haiku') ? 'fast' : 'balanced',
      })
    );

    return { provider: 'anthropic', models: models.length ? models : DEFAULT_MODELS.filter((m) => m.provider === 'anthropic') };
  } catch (err) {
    return {
      provider: 'anthropic',
      models: DEFAULT_MODELS.filter((m) => m.provider === 'anthropic'),
      error: String(err),
    };
  }
}

// ─── Google ───────────────────────────────────────────────────────────────────

async function fetchGoogleModels(): Promise<ModelFetchResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return {
      provider: 'google',
      models: DEFAULT_MODELS.filter((m) => m.provider === 'google'),
      error: 'GOOGLE_AI_API_KEY not configured',
    };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const models = ((data.models || []) as { name: string; displayName?: string }[])
      .filter((m) => m.name.includes('gemini'))
      .map((m): ModelOption => ({
        id: m.name.replace('models/', ''),
        name: m.displayName || m.name.replace('models/', ''),
        provider: 'google',
        tier: m.name.includes('pro') ? 'flagship' : 'fast',
      }));

    return { provider: 'google', models: models.length ? models : DEFAULT_MODELS.filter((m) => m.provider === 'google') };
  } catch (err) {
    return {
      provider: 'google',
      models: DEFAULT_MODELS.filter((m) => m.provider === 'google'),
      error: String(err),
    };
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET() {
  const [openai, anthropic, google] = await Promise.allSettled([
    fetchOpenAIModels(),
    fetchAnthropicModels(),
    fetchGoogleModels(),
  ]);

  const results: ModelFetchResult[] = [
    openai.status === 'fulfilled' ? openai.value : { provider: 'openai', models: DEFAULT_MODELS.filter((m) => m.provider === 'openai'), error: 'Fetch failed' },
    anthropic.status === 'fulfilled' ? anthropic.value : { provider: 'anthropic', models: DEFAULT_MODELS.filter((m) => m.provider === 'anthropic'), error: 'Fetch failed' },
    google.status === 'fulfilled' ? google.value : { provider: 'google', models: DEFAULT_MODELS.filter((m) => m.provider === 'google'), error: 'Fetch failed' },
  ];

  // Static providers — no API to call
  const staticProviders: ModelFetchResult[] = [
    { provider: 'meta', models: DEFAULT_MODELS.filter((m) => m.provider === 'meta') },
    { provider: 'mistral', models: DEFAULT_MODELS.filter((m) => m.provider === 'mistral') },
    { provider: 'local', models: [{ id: 'local-custom', name: 'Local Custom Model', provider: 'local', tier: 'local', description: 'Self-hosted model via Ollama or similar' }] },
  ];

  const allModels = [...results, ...staticProviders].flatMap((r) => r.models);
  const providerErrors = results.filter((r) => r.error).map((r) => ({ provider: r.provider, error: r.error }));

  return NextResponse.json({ models: allModels, providerErrors });
}
