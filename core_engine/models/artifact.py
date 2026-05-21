"""
Artifact Models — The discrete, immutable data units passed between agents.

Every micro-step of every agent produces a cluster of artifacts:
  - Context:     What the LLM saw (the compiled View)
  - Thought:     What the LLM reasoned (chain-of-thought)
  - Execution:   What the Controller fired (API call, DB query)
  - Environment: What the world returned (API response, error)
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional


class ArtifactType(str, Enum):
    """Classification of artifact payloads."""
    CONTEXT = "context"          # .md — what the LLM saw
    THOUGHT = "thought"          # .yaml — LLM's chain-of-thought
    EXECUTION = "execution"      # .json — the Controller's API payload
    ENVIRONMENT = "environment"  # .json — raw response from the world
    HANDOFF = "handoff"          # .json — inter-department artifact


@dataclass
class Artifact:
    """A single immutable artifact produced during agent execution."""

    artifact_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = ""
    step_number: int = 0
    artifact_type: ArtifactType = ArtifactType.EXECUTION
    action_type: str = ""                # e.g., 'generate_email_payload'

    # Payloads
    context_payload: Optional[dict[str, Any]] = None
    thought_payload: Optional[dict[str, Any]] = None
    execution_payload: Optional[dict[str, Any]] = None
    environment_response: Optional[dict[str, Any]] = None

    # Lineage — links back to the governing Soft DB file
    governing_soft_db_file: Optional[str] = None

    # Human review
    human_summary: str = ""
    is_flagged: bool = False
    feedback_notes: Optional[str] = None

    # Metadata
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    duration_ms: Optional[int] = None

    def to_trace_record(self) -> dict[str, Any]:
        """Serialize to a dict suitable for inserting into trace_artifacts table."""
        return {
            "trace_id": self.artifact_id,
            "session_id": self.session_id,
            "step_number": self.step_number,
            "action_type": self.action_type,
            "context_payload": self.context_payload,
            "thought_payload": self.thought_payload,
            "execution_payload": self.execution_payload,
            "environment_response": self.environment_response,
            "governing_soft_db_file": self.governing_soft_db_file,
            "human_summary": self.human_summary,
            "is_flagged": self.is_flagged,
            "feedback_notes": self.feedback_notes,
            "created_at": self.created_at.isoformat(),
            "duration_ms": self.duration_ms,
        }


@dataclass
class HandoffArtifact:
    """
    An artifact passed between departments via the Event Bus.
    Must conform to the governing SLA's required_artifact_keys.
    """

    handoff_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    producer_department: str = ""
    consumer_department: str = ""
    sla_id: str = ""
    artifact_type: str = ""       # e.g., 'campaign_brief', 'bug_report'
    payload: dict[str, Any] = field(default_factory=dict)
    status: str = "pending"       # 'pending', 'accepted', 'rejected'
    rejection_reason: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    def to_db_record(self) -> dict[str, Any]:
        """Serialize for the artifact_handoffs table."""
        return {
            "handoff_id": self.handoff_id,
            "sla_id": self.sla_id,
            "artifact_type": self.artifact_type,
            "artifact_payload": self.payload,
            "status": self.status,
            "rejection_reason": self.rejection_reason,
            "retry_count": self.retry_count,
            "max_retries": self.max_retries,
            "created_at": self.created_at.isoformat(),
        }
