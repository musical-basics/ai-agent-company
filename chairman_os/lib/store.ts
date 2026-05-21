/**
 * CHAIRMAN OS — Zustand Store
 * Dashboard state: selected channel, filters, active intervention, selected event.
 */
import { create } from 'zustand';
import type { DashboardFilters, SwarmEvent, Intervention, Agent, Channel } from './types';
import { MOCK_EVENTS, MOCK_AGENTS, MOCK_CHANNELS, MOCK_INTERVENTIONS } from './mock-data';

interface ChairmanStore {
  // Data (in production, loaded via SWR from API)
  events: SwarmEvent[];
  agents: Agent[];
  channels: Channel[];
  interventions: Intervention[];

  // Selection state
  selectedEventId: string | null;
  selectedInterventionId: string | null;
  interventionPanelOpen: boolean;

  // Filters
  filters: DashboardFilters;

  // Flag modal
  flagModalOpen: boolean;
  flagTargetEventId: string | null;
  flagNote: string;

  // Actions — data
  setEvents: (events: SwarmEvent[]) => void;
  addEvent: (event: SwarmEvent) => void;
  updateEvent: (id: string, patch: Partial<SwarmEvent>) => void;

  // Actions — selection
  selectEvent: (id: string | null) => void;
  openIntervention: (interventionId: string) => void;
  closeIntervention: () => void;

  // Actions — filters
  setFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void;
  resetFilters: () => void;

  // Actions — flag
  openFlagModal: (eventId: string) => void;
  closeFlagModal: () => void;
  setFlagNote: (note: string) => void;
  submitFlag: () => void;

  // Actions — intervention
  addIntervention: (intervention: Intervention) => void;
  updateIntervention: (id: string, patch: Partial<Intervention>) => void;

  // Computed
  filteredEvents: () => SwarmEvent[];
  getAgent: (id: string) => Agent | undefined;
  getChannel: (id: string) => Channel | undefined;
}

const DEFAULT_FILTERS: DashboardFilters = {
  channelId: null,
  status: 'all',
  agentId: null,
  search: '',
  showFlaggedOnly: false,
};

export const useChairmanStore = create<ChairmanStore>((set, get) => ({
  // ── Initial data (mock) ──────────────────────────────────────────
  events: MOCK_EVENTS,
  agents: MOCK_AGENTS,
  channels: MOCK_CHANNELS,
  interventions: MOCK_INTERVENTIONS,

  // ── Selection ────────────────────────────────────────────────────
  selectedEventId: null,
  selectedInterventionId: null,
  interventionPanelOpen: false,

  // ── Filters ──────────────────────────────────────────────────────
  filters: DEFAULT_FILTERS,

  // ── Flag modal ───────────────────────────────────────────────────
  flagModalOpen: false,
  flagTargetEventId: null,
  flagNote: '',

  // ── Data actions ─────────────────────────────────────────────────
  setEvents: (events) => set({ events }),

  addEvent: (event) =>
    set((s) => ({ events: [event, ...s.events] })),

  updateEvent: (id, patch) =>
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),

  // ── Selection actions ────────────────────────────────────────────
  selectEvent: (id) => set({ selectedEventId: id }),

  openIntervention: (interventionId) =>
    set({ selectedInterventionId: interventionId, interventionPanelOpen: true }),

  closeIntervention: () =>
    set({ selectedInterventionId: null, interventionPanelOpen: false }),

  // ── Filter actions ────────────────────────────────────────────────
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  // ── Flag actions ─────────────────────────────────────────────────
  openFlagModal: (eventId) =>
    set({ flagModalOpen: true, flagTargetEventId: eventId, flagNote: '' }),

  closeFlagModal: () =>
    set({ flagModalOpen: false, flagTargetEventId: null, flagNote: '' }),

  setFlagNote: (note) => set({ flagNote: note }),

  submitFlag: () => {
    const { flagTargetEventId, flagNote, updateEvent, closeFlagModal } = get();
    if (!flagTargetEventId || !flagNote.trim()) return;
    updateEvent(flagTargetEventId, {
      status: 'flagged',
      flaggedByChairman: true,
      chairmanNote: flagNote,
    });
    closeFlagModal();
  },

  // ── Intervention actions ──────────────────────────────────────────
  addIntervention: (intervention) =>
    set((s) => ({ interventions: [intervention, ...s.interventions] })),

  updateIntervention: (id, patch) =>
    set((s) => ({
      interventions: s.interventions.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    })),

  // ── Computed ──────────────────────────────────────────────────────
  filteredEvents: () => {
    const { events, filters } = get();
    return events.filter((e) => {
      if (filters.channelId && filters.channelId !== 'all' && e.channelId !== filters.channelId) return false;
      if (filters.status !== 'all' && e.status !== filters.status) return false;
      if (filters.agentId && e.senderId !== filters.agentId && e.receiverId !== filters.agentId) return false;
      if (filters.showFlaggedOnly && !e.flaggedByChairman) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!e.nlSummary.toLowerCase().includes(q) && !e.senderId.includes(q) && !e.receiverId.includes(q)) return false;
      }
      return true;
    });
  },

  getAgent: (id) => get().agents.find((a) => a.id === id),
  getChannel: (id) => get().channels.find((c) => c.id === id),
}));
