"""
Worker Orchestrator — The deterministic Micro-Loop and Event Bus controller.
Isolates probabilistic LLM reasoning (Spirit) from structural database/API resources.
"""

import os
import json
import uuid
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

from core_engine.models.session import AgentSession, SessionStatus, BudgetExceededError
from core_engine.models.artifact import Artifact, ArtifactType, HandoffArtifact
from core_engine.connectors.llm_connector import LLMConnector
from core_engine.connectors.tool_registry import ToolRegistry

class WorkerOrchestrator:
    """
    Orchestrates the ReAct execution flow for specialized worker agents.
    Validates and runs tools via the RBAC Tool Registry.
    Intercepts API errors and feeds them back into the micro-loop for self-correction.
    Routes artifacts across departments based on SLA rules.
    """

    def __init__(self, 
                 company_id: str, 
                 tool_registry: ToolRegistry,
                 llm_connector: LLMConnector,
                 supabase_client: Any = None):
        self.company_id = company_id
        self.tool_registry = tool_registry
        self.llm_connector = llm_connector
        self.supabase = supabase_client
        self.max_react_iterations = int(os.getenv("MAX_REACT_ITERATIONS", 10))

    def awaken_agent(self, department_name: str, agent_id: str, trigger_payload: Dict[str, Any]) -> str:
        """
        Awakens a worker agent in its department silo, instantiating an execution session.
        """
        session = AgentSession(
            company_id=self.company_id,
            department_id=f"dept_{department_name}",
            agent_id=agent_id,
            status=SessionStatus.INITIALIZING,
            trigger_source="event_bus",
            trigger_payload=trigger_payload,
            budget_limit_usd=float(os.getenv("WORKER_BUDGET_LIMIT_USD", 50.00))
        )
        
        # Log session initiation in the Hard DB
        if self.supabase:
            self.supabase.execute("insert", {"table": "agent_sessions", "data": session.to_db_record()})
            
        print(f"[WorkerOrchestrator] Awakened agent '{agent_id}' in department '{department_name}'. Session ID: {session.session_id}")
        return self._run_micro_loop(session, department_name)

    def _run_micro_loop(self, session: AgentSession, department_name: str) -> str:
        """
        Runs the deterministic ReAct micro-loop (Reason -> Act -> Observe).
        Catches tool errors and forces the LLM to self-correct in real-time.
        """
        session.status = SessionStatus.PLANNING
        
        # Compile dynamic View (Prompt compilation)
        sop_content = self._load_sop(department_name, session.agent_id)
        culture_content = self._load_global_file("company_culture.md")
        
        system_instruction = f"""
You are {session.agent_id}, a specialized worker in the {department_name} department.
You must strictly follow the SOP constraints.
You are completely isolated from the database and infrastructure APIs.
You can ONLY interact with the world by emitting a JSON payload requesting tools.
Always output valid JSON in the requested format.

{culture_content}
"""
        
        iterations = 0
        while not session.status.is_terminal and iterations < self.max_react_iterations:
            iterations += 1
            session.status = SessionStatus.EXECUTING
            session.advance_step()
            
            prompt = f"""
### Current Active SOP Rules
{sop_content}

### Active Session Context
Session ID: {session.session_id}
Current Step: {session.current_step}
Variables: {json.dumps(session.context_variables)}
Trigger Action Context: {json.dumps(session.trigger_payload)}

Reason about the next action to perform. If complete, emit a final output artifact.
"""
            
            start_time = datetime.now(timezone.utc)
            
            # Step 1: LLM Reasoning (Probabilistic Brain output)
            response = self.llm_connector.generate_json_response(system_instruction, prompt)
            cost = self.llm_connector.calculate_cost_usd()
            
            try:
                session.record_spend(cost)
            except BudgetExceededError as e:
                print(f"[WorkerOrchestrator] Budget exceeded: {str(e)}")
                session.fail("Budget limit exceeded.")
                self._update_session_db(session)
                break

            # Parse action or completion
            thought = response.get("thought", "")
            tool_call = response.get("tool_call")
            task_completed = response.get("task_completed", False)
            
            # Record thought trace artifact
            trace = Artifact(
                session_id=session.session_id,
                step_number=session.current_step,
                artifact_type=ArtifactType.THOUGHT,
                action_type="agent_planning",
                context_payload={"prompt": prompt, "system": system_instruction},
                thought_payload=response,
                governing_soft_db_file=f"minds/departments/{department_name}/{session.agent_id}_sop.md"
            )
            
            # Step 2: Deterministic Actuation/Reflex loop
            if tool_call:
                tool_id = tool_call.get("tool_id")
                action = tool_call.get("action")
                payload = tool_call.get("payload", {})
                
                print(f"[WorkerOrchestrator] [{session.agent_id}] Executing tool '{tool_id}' -> action '{action}'")
                
                # Execute action via RBACToolRegistry
                result = self.tool_registry.execute_tool(department_name, tool_id, action, payload)
                
                # Capture Environment response and log trace
                trace.artifact_type = ArtifactType.EXECUTION
                trace.execution_payload = tool_call
                trace.environment_response = result
                
                if result.get("status") == "error":
                    # ReAct Micro-loop Reflex: Feed error back to LLM context variables for correction
                    print(f"[WorkerOrchestrator] [{session.agent_id}] Tool call failed. Injecting error trace for self-correction.")
                    session.context_variables["last_error"] = {
                        "tool_id": tool_id,
                        "action": action,
                        "error": result.get("error"),
                        "status_code": result.get("status_code")
                    }
                else:
                    # Clear error on success and store output data
                    session.context_variables.pop("last_error", None)
                    session.context_variables[f"result_{tool_id}_{action}"] = result.get("data", result)
                    
            elif task_completed:
                session.complete()
                # Create final handoff artifact
                output_payload = response.get("output_payload", {})
                self._route_handoff(department_name, session, output_payload)
                break
            else:
                # No action or completion trigger
                print(f"[WorkerOrchestrator] Warning: No action or task completion declared by agent.")
                
            trace.duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
            
            # Save Flight Recorder traces
            if self.supabase:
                self.supabase.execute("insert", {"table": "trace_artifacts", "data": trace.to_trace_record()})
                
        if iterations >= self.max_react_iterations and not session.status.is_terminal:
            print(f"[WorkerOrchestrator] [{session.agent_id}] Halting loop. Max iterations reached.")
            session.fail("Max ReAct iteration limit reached without completion.")
            
        self._update_session_db(session)
        return session.status.value

    def _route_handoff(self, producer_dept: str, session: AgentSession, payload: Dict[str, Any]) -> None:
        """
        Event Bus Routing based on blueprints and SLAs.
        Validates target keys, checks treaties, and passes the artifact downstream.
        """
        # Auto discover downstream based on active SLA mappings
        # In a real environment, loads SLA rules from blueprints/swarm-compose.yml
        consumer_dept = "product_engineering" if producer_dept == "growth_marketing" else "quality_assurance"
        sla_id = f"{producer_dept}_to_{consumer_dept}"
        
        handoff = HandoffArtifact(
            producer_department=producer_dept,
            consumer_department=consumer_dept,
            sla_id=sla_id,
            artifact_type="campaign_brief",
            payload=payload,
            status="pending"
        )
        
        # Enforce strict SLA validator check (The treaty gatekeeper)
        missing_keys = self._verify_sla_compliance(sla_id, payload)
        if missing_keys:
            handoff.status = "rejected"
            handoff.rejection_reason = f"Missing required SLA fields: {', '.join(missing_keys)}"
            print(f"[EventBus] Handoff '{sla_id}' REJECTED: {handoff.rejection_reason}")
            
            # Log Dispute in Hard DB
            if self.supabase:
                dispute = {
                    "company_id": self.company_id,
                    "handoff_id": handoff.handoff_id,
                    "producer_dept_id": f"dept_{producer_dept}",
                    "rejecting_dept_id": f"dept_{consumer_dept}",
                    "reason_for_rejection": handoff.rejection_reason,
                    "sla_violated": sla_id,
                    "is_resolved": False
                }
                self.supabase.execute("insert", {"table": "departmental_disputes", "data": dispute})
        else:
            handoff.status = "accepted"
            print(f"[EventBus] Handoff '{sla_id}' ACCEPTED. Dispatching downstream.")
            
        if self.supabase:
            self.supabase.execute("insert", {"table": "artifact_handoffs", "data": handoff.to_db_record()})

    def _verify_sla_compliance(self, sla_id: str, payload: Dict[str, Any]) -> List[str]:
        """Verify artifact payload contains all keys defined in SLA treaty."""
        # Standard SLA rules from blueprints
        required_keys_map = {
            "growth_marketing_to_product_engineering": ["target_audience", "core_metric", "copy_text", "style_details"],
            "product_engineering_to_quality_assurance": ["deployment_url", "feature_checklist"],
            "quality_assurance_to_product_engineering": ["bug_report", "reproduction_steps"]
        }
        required_keys = required_keys_map.get(sla_id, [])
        return [key for key in required_keys if key not in payload]

    def _load_sop(self, department_name: str, agent_id: str) -> str:
        sop_path = f"minds/departments/{department_name}/{agent_id}_sop.md"
        if os.path.exists(sop_path):
            with open(sop_path, 'r') as f:
                return f.read()
        # Fallback to template
        template_path = "minds/templates/department_sop.md"
        if os.path.exists(template_path):
            with open(template_path, 'r') as f:
                return f.read()
        return "SOP rules: Be highly detailed and follow strict constraints."

    def _load_global_file(self, filename: str) -> str:
        path = f"minds/global/{filename}"
        if os.path.exists(path):
            with open(path, 'r') as f:
                return f.read()
        return ""

    def _update_session_db(self, session: AgentSession) -> None:
        if self.supabase:
            self.supabase.execute("update", {
                "table": "agent_sessions",
                "filters": {"session_id": session.session_id},
                "data": session.to_db_record()
            })
