"""
Directive Models — CEO directive decomposition and phased planning.

When the Chairman issues a strategic directive, the AI CEO decomposes it
into a Hierarchical Task Network (HTN) of phased, scoped work packages.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional


class DirectiveStatus(str, Enum):
    PENDING = "pending"
    PLANNING = "planning"
    EXECUTING = "executing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PhaseStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"


@dataclass
class DirectivePhase:
    """A single phase in the CEO's execution plan."""
    phase_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    phase_number: int = 0
    name: str = ""                    # e.g., "Validation", "Design", "Testing"
    description: str = ""
    status: PhaseStatus = PhaseStatus.NOT_STARTED

    # Which departments are involved
    assigned_departments: list[str] = field(default_factory=list)

    # Dependencies — phase IDs that must complete before this starts
    depends_on: list[str] = field(default_factory=list)

    # Scoped payloads sent to each department's Manager Subagent
    department_payloads: dict[str, dict[str, Any]] = field(default_factory=dict)

    # Budget
    estimated_budget_usd: float = 0.0
    actual_budget_usd: float = 0.0

    # Timeline
    estimated_duration_hours: Optional[float] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


@dataclass
class Directive:
    """A Chairman directive decomposed by the CEO into phased work."""

    directive_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str = ""

    # The Chairman's words
    chairman_prompt: str = ""

    # CEO's decomposition
    status: DirectiveStatus = DirectiveStatus.PENDING
    phases: list[DirectivePhase] = field(default_factory=list)

    # Affected departments
    affected_departments: list[str] = field(default_factory=list)

    # Budget
    estimated_budget_usd: float = 0.0
    actual_budget_usd: float = 0.0

    # Timestamps
    broadcast_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    completed_at: Optional[datetime] = None

    def get_ready_phases(self) -> list[DirectivePhase]:
        """Return phases whose dependencies are all completed."""
        completed_ids = {
            p.phase_id for p in self.phases
            if p.status == PhaseStatus.COMPLETED
        }
        return [
            p for p in self.phases
            if p.status == PhaseStatus.NOT_STARTED
            and all(dep in completed_ids for dep in p.depends_on)
        ]

    def to_db_record(self) -> dict[str, Any]:
        """Serialize for the company_directives table."""
        return {
            "directive_id": self.directive_id,
            "company_id": self.company_id,
            "chairman_prompt": self.chairman_prompt,
            "status": self.status.value,
            "ceo_plan": {
                "phases": [
                    {
                        "phase_id": p.phase_id,
                        "phase_number": p.phase_number,
                        "name": p.name,
                        "assigned_departments": p.assigned_departments,
                        "depends_on": p.depends_on,
                        "estimated_budget_usd": p.estimated_budget_usd,
                    }
                    for p in self.phases
                ]
            },
            "affected_departments": self.affected_departments,
            "estimated_budget_usd": self.estimated_budget_usd,
            "actual_budget_usd": self.actual_budget_usd,
            "broadcast_at": self.broadcast_at.isoformat(),
        }
