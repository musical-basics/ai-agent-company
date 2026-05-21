# 🏛️ SwarmOS Architecture Reference

This document outlines the architectural specifications of the **Enterprise-as-Code (Eac)** ecosystem.

## 🦴 1. Deterministic Skeleton (The Controller Box)
The Skeleton is hard-coded in Python. It is completely deterministic and ACID-compliant. It manages:
- **State Records (`agent_sessions`)**: Tracks the finite state machine (Initializing -> Planning -> Executing -> Completed/Failed) of each active agent.
- **Flight Recorder (`trace_artifacts`)**: Immutably records every token step including compiled views, reasoning traces, external tool payloads, and environment responses.
- **Access Control (`rbac_policies.yml`)**: Restricts tools so that workers cannot invoke unapproved actuators or trigger API resources outside their department namespace.

## 🧠 2. Dynamic Minds (The Soft Database)
Soft databases are composed of human-readable Markdown files stored inside the repository and version-controlled via Git:
- **Department SOPs (`minds/templates/department_sop.md`)**: Contains instructions, step rules, and constraints for workers.
- **Evolutionary Patches**: The `🧬 Evolutionary Revisions` section is dynamically appended by the Manager Subagent based on downstream disputes or supervisor feedback.
- **Inter-Departmental SLAs (`minds/templates/inter_departmental_sla.md`)**: Treaties defining strict JSON payload schemas for communication handoffs.

## ⚡ 3. Nervous System (The Connectors)
Standardized REST / SDK wrappers connected securely via local vault credentials.
- The LLM never reads raw API secrets or fires endpoints directly.
- The controller accepts JSON action requests from the LLM, validates target scopes, executes the connector, and returns the response back to the reasoning context.

## 🔄 4. The Micro-Loop (ReAct self-correction)
When an actuator tool returns an error status (e.g. an API 400 validation error or rate limits):
1. The orchestrator catches the error.
2. The orchestrator formats the response error and passes it directly back into the LLM's active prompt variables.
3. The model reviews the mistake, self-corrects the JSON payload, and retries safely without human intervention.

## 🧬 5. The Macro-Loop (Evolution and Recombination)
SOP rules harden over time as human feedbacks are processed:
1. A human supervisor flags a bad action step in the UI dashboard.
2. The AI CEO delegates a localized patch task to the department's Manager Subagent.
3. The Manager produces a surgical git diff to append rules, avoiding prompt regression.
4. Winning traits from parallel variants can be genetically merged using `scripts/merge_chimeras.py`.
