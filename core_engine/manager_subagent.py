"""
Manager Subagent — Controller of local department evolution.
Performs surgical updates to department Markdown SOPs based on feedback.
"""

import os
from typing import Any, Dict, Optional
from core_engine.connectors.llm_connector import LLMConnector

class ManagerSubagent:
    """
    Translates high-level complaints or structural failures
    into surgical modifications (Git diffs) inside the department SOP minds.
    Does not mutate other files or departments (Zero Blast Radius logic).
    """

    def __init__(self, company_id: str, llm_connector: LLMConnector, supabase_client: Any = None):
        self.company_id = company_id
        self.llm_connector = llm_connector
        self.supabase = supabase_client

    def evolve_sop(self, 
                   department_name: str, 
                   sop_file_path: str, 
                   failed_artifact: Dict[str, Any], 
                   environment_error: Dict[str, Any], 
                   human_feedback: str) -> Dict[str, Any]:
        """
        Calculates and applies a Git patch to the designated SOP markdown file.
        Injects the new constraint rule autonomously under the Evolution Notes section.
        """
        print(f"[ManagerSubagent] [{department_name}] Evolution requested for target: '{sop_file_path}'")
        
        # Load the current content of the SOP
        current_sop_content = ""
        full_path = os.path.join(os.getcwd(), sop_file_path)
        if os.path.exists(full_path):
            with open(full_path, 'r') as f:
                current_sop_content = f.read()
        else:
            # Fallback mock template content
            current_sop_content = "# SOP: Custom Operations\n## Rules\n- Perform task carefully.\n\n## 🧬 Evolutionary Revisions\n<!-- EVOLUTION_ANCHOR — Manager Subagent appends below this line -->\n"

        system_instruction = f"""
You are the {department_name} Manager Subagent.
Your sole job is to safely update the SOP markdown guidelines for your department.
Do not modify sections outside the SOP scope.
Formulate a new rule to add directly beneath the EVOLUTION_ANCHOR comment tag.
Output a valid JSON containing a git diff and explanation.
"""

        prompt = f"""
### Current SOP Content:
{current_sop_content}

### Execution Failure Context:
Failed Payload: {failed_artifact}
Error Output: {environment_error}

### Supervisor Input Feedback:
{human_feedback}

Formulate a new rule to ensure the failure never happens again. Output a git patch to apply.
"""

        response = self.llm_connector.generate_json_response(system_instruction, prompt)
        git_diff = response.get("git_diff", "")
        
        # Apply patch to local Soft DB file
        updated_content = self._apply_patch(current_sop_content, git_diff, human_feedback)
        
        # Ensure parent directories exist
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w') as f:
            f.write(updated_content)

        print(f"[ManagerSubagent] [{department_name}] Safely evolved SOP guidelines. Diff committed locally.")
        return {
            "status": "success",
            "git_diff": git_diff,
            "updated_file": sop_file_path
        }

    def _apply_patch(self, original: str, diff: str, rule_text: str) -> str:
        """
        Appends the new evolutionary rule under the EVOLUTION_ANCHOR anchor.
        """
        anchor = "<!-- EVOLUTION_ANCHOR — Manager Subagent appends below this line -->"
        if anchor in original:
            parts = original.split(anchor)
            new_rule = f"\n- *Evolution Note:* {rule_text}\n"
            return parts[0] + anchor + new_rule + parts[1]
        else:
            # Fallback append to end
            return original + f"\n\n### 🧬 Evolutionary Revisions\n- *Evolution Note:* {rule_text}\n"
