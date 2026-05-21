import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const NODE_COLORS: Record<string, { bg: string; border: string; glow: string; text: string; badge: string }> = {
  worker: {
    bg: '#0f1830',
    border: '#6366f1',
    glow: 'rgba(99,102,241,0.3)',
    text: '#818cf8',
    badge: '#1e1b4b',
  },
  manager: {
    bg: '#110f25',
    border: '#8b5cf6',
    glow: 'rgba(139,92,246,0.3)',
    text: '#a78bfa',
    badge: '#2e1065',
  },
  ceo: {
    bg: '#180a12',
    border: '#f43f5e',
    glow: 'rgba(244,63,94,0.35)',
    text: '#fb7185',
    badge: '#4c0519',
  },
  tool: {
    bg: '#041820',
    border: '#06b6d4',
    glow: 'rgba(6,182,212,0.3)',
    text: '#22d3ee',
    badge: '#083344',
  },
  adapter: {
    bg: '#1a1005',
    border: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    text: '#fbbf24',
    badge: '#451a03',
  },
};

export const CATEGORY_COLORS: Record<string, string> = {
  analytics: '#06b6d4',
  ecommerce: '#f59e0b',
  dev: '#6366f1',
  marketing: '#10b981',
  finance: '#f43f5e',
  productivity: '#8b5cf6',
  testing: '#64748b',
};

export const PROVIDER_COLORS: Record<string, string> = {
  openai: '#10a37f',
  anthropic: '#d4a27f',
  google: '#4285f4',
  meta: '#1877f2',
  mistral: '#ff7000',
  local: '#64748b',
};

export const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  meta: 'Meta',
  mistral: 'Mistral',
  local: 'Local',
};

export function generateNodeId(kind: string): string {
  return `${kind}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
