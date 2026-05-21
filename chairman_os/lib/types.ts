/**
 * CHAIRMAN OS — Core Types
 * The Dual-Payload Swarm Envelope and all related data structures.
 */

// ─── Agent Types ──────────────────────────────────────────────────────────────

export type AgentKind = 'ceo' | 'manager' | 'worker' | 'tool' | 'system';

export interface Agent {
  id: string;             // e.g. "concert_marketing"
  name: string;           // e.g. "Concert Marketing Agent"
  kind: AgentKind;
  framework?: string;     // e.g. "Custom_ReAct", "OpenClaw"
  model?: string;         // e.g. "gpt-4o"
  department?: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  lastHeartbeatAt?: string;
  currentTask?: string;
}

// ─── Channel ──────────────────────────────────────────────────────────────────

export interface Channel {
  id: string;             // e.g. "launch-digital-ecourse"
  name: string;           // display name
  description?: string;
  participants: string[]; // agent IDs
  unreadCount?: number;
  lastEventAt?: string;
  isPinned?: boolean;
}

// ─── Artifact ─────────────────────────────────────────────────────────────────

export type ArtifactType =
  | 'Campaign_Brief'
  | 'Product_Spec'
  | 'QA_Report'
  | 'Strategy_Report'
  | 'Code_Diff'
  | 'SLA_Update'
  | 'RUNBOOK_Update'
  | 'API_Response'
  | 'Budget_Allocation'
  | 'Custom';

export interface Artifact {
  type: ArtifactType;
  schemaVersion: string;
  payload: Record<string, unknown>;
}

// ─── The Dual-Payload Swarm Envelope ─────────────────────────────────────────

export type EventStatus =
  | 'pending'
  | 'delivered'
  | 'rejected'
  | 'flagged'
  | 'replayed'
  | 'processing';

export type EventType =
  | 'artifact_handoff'       // agent → agent data transfer
  | 'sla_violation'          // schema mismatch rejection
  | 'ceo_directive'          // CEO issues directive to departments
  | 'sop_update'             // SLA/RUNBOOK was rewritten
  | 'heartbeat'              // agent health check-in
  | 'escalation'             // worker escalated to CEO
  | 'chairman_intervention'; // human issued a fix

export interface SwarmEvent {
  id: string;
  timestamp: string;
  senderId: string;
  receiverId: string;
  channelId: string;
  eventType: EventType;
  status: EventStatus;

  // ── The Human Layer ──
  nlSummary: string;         // natural language explanation for Chairman

  // ── The Machine Layer ──
  artifact: Artifact;

  // ── Governance ──
  slaId?: string;            // which SLA governs this handoff
  rejectionReason?: string;  // set if status === 'rejected'
  
  // ── Chairman Oversight ──
  flaggedByChairman: boolean;
  chairmanNote?: string;
  
  // ── Replay chain ──
  replayOfEventId?: string;  // if this is a replayed event
  interventionId?: string;   // which intervention caused this replay

  // ── Trace (flight recorder) ──
  traceId?: string;
  contextPayload?: string;   // the exact markdown context the agent saw
  thoughtPayload?: string;   // the agent's chain of thought
  environmentResponse?: string; // the API 200/400 response
}

// ─── SLA Violation ────────────────────────────────────────────────────────────

export interface SLAViolation {
  id: string;
  eventId: string;
  slaId: string;
  missingKeys: string[];
  providedKeys: string[];
  severity: 'warning' | 'rejection' | 'escalation';
  timestamp: string;
}

// ─── Intervention ─────────────────────────────────────────────────────────────

export type InterventionStatus =
  | 'pending'
  | 'diagnosing'
  | 'rewriting'
  | 'committing'
  | 'replaying'
  | 'complete'
  | 'failed';

export interface Intervention {
  id: string;
  eventId: string;
  slaId?: string;
  chairmanNote: string;
  status: InterventionStatus;
  
  // AI CEO output
  diagnosis?: string;        // natural language explanation of what went wrong
  rewrittenSla?: string;     // the new SLA/RUNBOOK content
  diff?: string;             // the git diff
  gitCommitSha?: string;
  gitCommitUrl?: string;
  
  // Replay
  replayedEventId?: string;
  
  createdAt: string;
  completedAt?: string;
}

// ─── Dashboard State ──────────────────────────────────────────────────────────

export interface DashboardFilters {
  channelId: string | null;        // null = All
  status: EventStatus | 'all';
  agentId: string | null;
  search: string;
  showFlaggedOnly: boolean;
}

// ─── API Response shapes ──────────────────────────────────────────────────────

export interface EventsResponse {
  events: SwarmEvent[];
  total: number;
  hasMore: boolean;
  eventsPerMinute: number;
}

export interface InterventionResponse {
  intervention: Intervention;
  replayedEvent?: SwarmEvent;
}
