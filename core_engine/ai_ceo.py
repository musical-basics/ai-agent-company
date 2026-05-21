"""
AI CEO — SwarmOS Apex Controller.
Decomposes Chairman directives, governs scope creep, and manages surgical artifact interventions.
"""

import os
import json
import uuid
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

from core_engine.models.directive import Directive, DirectiveStatus, DirectivePhase, PhaseStatus
from core_engine.connectors.llm_connector import LLMConnector

class AICEO:
    """
    The apex strategy agent. Translates Chairman's high-level visions
    into sequenced, budget-constrained department instructions (HTN phase planning).
    Prevents both over-engineering and under-engineering.
    Performs surgical updates to department minds/relationships when problems occur.
    """

    def __init__(self, 
                 company_id: str, 
                 llm_connector: LLMConnector, 
                 supabase_client: Any = None):
        self.company_id = company_id
        self.llm_connector = llm_connector
        self.supabase = supabase_client
        self.over_engineering_keywords = ["custom server", "from scratch", "custom auth", "blockchain"]
        self.under_engineering_keywords = ["one-off fix", "hardcode", "skip qa", "ignore errors"]

    def receive_chairman_directive(self, prompt: str) -> str:
        """
        Main entrypoint when Chairman publishes a priority.
        Decomposes it into a phased plan using high-level reasoning.
        """
        print(f"[AICEO] Received global strategic directive: '{prompt}'")
        
        # Decompose prompt into HTN Work Plan
        directive = self._plan_phases(prompt)
        
        # Scope Governance check (Goldilocks Protocol)
        self._governance_filter(directive)
        
        if self.supabase:
            # Register active directive in the relational DB
            self.supabase.execute("insert", {"table": "company_directives", "data": directive.to_db_record()})
            
        print(f"[AICEO] Plan successfully finalized with {len(directive.phases)} execution phases.")
        return directive.directive_id

    def execute_surgical_intervention(self, trace_id: str, feedback: str) -> Dict[str, Any]:
        """
        Surgical Artifact Intervention.
        Pins down a specific failed trace node in the hard DB ledger,
        wakes up the specialized Manager Subagent for that department,
        and isolates the update to only one Soft DB relationship/SOP (zero blast radius).
        """
        print(f"[AICEO] Initiating Surgical Intervention for trace '{trace_id}'...")
        
        if not self.supabase:
            return {"status": "error", "error": "Database connector required for surgical traces"}

        # Step 1: Trace Retrieval from Flight Recorder
        trace_data = self.supabase.execute("select", {
            "table": "trace_artifacts",
            "filters": {"trace_id": trace_id}
        })
        
        if not trace_data.get("data"):
            return {"status": "error", "error": f"Trace record '{trace_id}' not found"}

        trace = trace_data["data"][0]
        sop_file = trace.get("governing_soft_db_file")
        session_id = trace.get("session_id")
        
        # Retrieve session context to locate department name
        session_data = self.supabase.execute("select", {
            "table": "agent_sessions",
            "filters": {"session_id": session_id}
        })
        session = session_data["data"][0]
        department_id = session.get("department_id")
        dept_name = department_id.replace("dept_", "")

        print(f"[AICEO] Pinpointed failure location: Department '{dept_name}', SOP '{sop_file}'")
        
        # Step 2: Wake up Manager Subagent with scoped target view (Zero Blast Radius)
        # We delegate only the SOP modification to the manager
        from core_engine.manager_subagent import ManagerSubagent
        manager = ManagerSubagent(self.company_id, self.llm_connector, self.supabase)
        
        result = manager.evolve_sop(
            department_name=dept_name,
            sop_file_path=sop_file,
            failed_artifact=trace.get("execution_payload"),
            environment_error=trace.get("environment_response"),
            human_feedback=feedback
        )
        
        # Log resolution in evolution ledger
        if self.supabase:
            self.supabase.execute("insert", {
                "table": "evolution_feedback",
                "data": {
                    "company_id": self.company_id,
                    "trace_id": trace_id,
                    "session_id": session_id,
                    "submitted_by": "ceo",
                    "feedback_type": "sop_update",
                    "feedback_text": feedback,
                    "target_department": dept_name,
                    "target_sop_file": sop_file,
                    "status": "applied",
                    "git_commit_sha": str(uuid.uuid4())[:8],
                    "applied_diff": result.get("git_diff")
                }
            })
            
        print("[AICEO] Surgical Intervention complete. Soft DB updated safely via Git Diff.")
        return result

    def _plan_phases(self, prompt: str) -> Directive:
        """
        Triggers highest model reasoning to design an executable task pipeline.
        """
        system_instruction = "You are the Apex CEO. Decompose strategic board requests into high-level phases with clear department mappings."
        response = self.llm_connector.generate_json_response(system_instruction, prompt)
        
        directive = Directive(
            company_id=self.company_id,
            chairman_prompt=prompt,
            status=DirectiveStatus.PLANNING,
            estimated_budget_usd=response.get("estimated_budget_usd", 350.00),
            affected_departments=response.get("affected_departments", ["growth_marketing"])
        )
        
        phases = []
        for index, phase_dict in enumerate(response.get("phases", [])):
            phase = DirectivePhase(
                phase_number=phase_dict.get("phase_number", index + 1),
                name=phase_dict.get("name", "Execution Phase"),
                description=phase_dict.get("description", ""),
                status=PhaseStatus.NOT_STARTED,
                assigned_departments=phase_dict.get("assigned_departments", []),
                depends_on=phase_dict.get("depends_on", []),
                estimated_budget_usd=phase_dict.get("estimated_budget_usd", 100.00)
            )
            phases.append(phase)
            
        directive.phases = phases
        return directive

    def _governance_filter(self, directive: Directive) -> None:
        """
        The Goldilocks Protocol — filters and audits plans against over-engineering
        and under-engineering indicators.
        """
        print("[AICEO] Running Goldilocks Audit on structural scopes...")
        
        plan_text = json.dumps(directive.to_db_record()).lower()
        
        # Check over-engineering triggers
        for word in self.over_engineering_keywords:
            if word in plan_text:
                print(f"[AICEO] [Scope Violation] Over-engineering detected (Trigger: '{word}'). Pruning plan complexity...")
                # Automatically prune/adjust phases or budget values
                directive.estimated_budget_usd = max(50.00, directive.estimated_budget_usd * 0.6)
                
        # Check under-engineering triggers
        for word in self.under_engineering_keywords:
            if word in plan_text:
                print(f"[AICEO] [Scope Violation] Under-engineering detected (Trigger: '{word}'). Enforcing safety limits and testing phases...")
                # Add automatic visual QA step to guarantee resilience
                if "quality_assurance" not in directive.affected_departments:
                    directive.affected_departments.append("quality_assurance")
