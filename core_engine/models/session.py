"""
Session Models — Execution state management (The Skeleton's Model layer).

Every time an agent is awakened for a task, a session is created to track
its full lifecycle: initializing → planning → executing → completed/failed.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional


class SessionStatus(str, Enum):
    """Finite state machine for agent session lifecycle."""
    INITIALIZING = "initializing"
    PLANNING = "planning"
    EXECUTING = "executing"
    BLOCKED = "blocked"            # Waiting on external input or CEO review
    AWAITING_REVIEW = "awaiting_review"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

    @property
    def is_terminal(self) -> bool:
        return self in (
            SessionStatus.COMPLETED,
            SessionStatus.FAILED,
            SessionStatus.CANCELLED,
        )


@dataclass
class AgentSession:
    """Tracks the full lifecycle of a single agent execution."""

    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str = ""
    department_id: str = ""
    agent_id: str = ""

    # State
    status: SessionStatus = SessionStatus.INITIALIZING
    current_step: int = 0
    total_steps: int = 0

    # Trigger
    trigger_source: str = ""      # 'ceo_directive', 'event_bus', 'cron'
    trigger_payload: Optional[dict[str, Any]] = None

    # Runtime variables (the agent's working memory for this session)
    context_variables: dict[str, Any] = field(default_factory=dict)

    # Budget guardrails
    budget_limit_usd: float = 50.0
    spent_usd: float = 0.0

    # Lineage
    parent_session_id: Optional[str] = None

    # Timestamps
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    completed_at: Optional[datetime] = None

    # Error tracking
    error_message: Optional[str] = None
    retry_count: int = 0

    def advance_step(self) -> None:
        """Move to the next step in the execution plan."""
        self.current_step += 1

    def record_spend(self, amount_usd: float) -> None:
        """Track budget consumption. Raises if over budget."""
        self.spent_usd += amount_usd
        if self.spent_usd > self.budget_limit_usd:
            self.status = SessionStatus.BLOCKED
            raise BudgetExceededError(
                f"Agent {self.agent_id} exceeded budget: "
                f"${self.spent_usd:.2f} / ${self.budget_limit_usd:.2f}"
            )

    def complete(self) -> None:
        self.status = SessionStatus.COMPLETED
        self.completed_at = datetime.now(timezone.utc)

    def fail(self, error: str) -> None:
        self.status = SessionStatus.FAILED
        self.error_message = error
        self.completed_at = datetime.now(timezone.utc)

    def to_db_record(self) -> dict[str, Any]:
        """Serialize for the agent_sessions table."""
        return {
            "session_id": self.session_id,
            "company_id": self.company_id,
            "department_id": self.department_id,
            "agent_id": self.agent_id,
            "status": self.status.value,
            "current_step": self.current_step,
            "total_steps": self.total_steps,
            "trigger_source": self.trigger_source,
            "trigger_payload": self.trigger_payload,
            "context_variables": self.context_variables,
            "budget_limit_usd": self.budget_limit_usd,
            "spent_usd": self.spent_usd,
            "parent_session_id": self.parent_session_id,
            "created_at": self.created_at.isoformat(),
            "completed_at": (
                self.completed_at.isoformat() if self.completed_at else None
            ),
            "error_message": self.error_message,
            "retry_count": self.retry_count,
        }


class BudgetExceededError(Exception):
    """Raised when an agent exceeds its session budget."""
    pass
