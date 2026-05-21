"""
Tool Registry — RBAC-controlled access to connectors and external actions.
"""

import os
import yaml
from typing import Any, Dict, List, Optional
from core_engine.connectors.base_connector import BaseConnector

class ToolRegistry:
    """
    Tracks all registered actuators and controls access based on RBAC policies.
    """

    def __init__(self, rbac_policy_path: str = "infrastructure/config/rbac_policies.yml"):
        self.rbac_policy_path = rbac_policy_path
        self.policy: Dict[str, Any] = {}
        self.connectors: Dict[str, BaseConnector] = {}
        self.load_policies()

    def load_policies(self) -> None:
        """Load RBAC configuration from file."""
        if os.path.exists(self.rbac_policy_path):
            with open(self.rbac_policy_path, 'r') as f:
                self.policy = yaml.safe_load(f) or {}
        else:
            # Fallback mock/empty policy
            self.policy = {
                "tool_definitions": [],
                "department_access": {},
                "ceo_access": {"read_all_tools": True, "direct_write_tools": [], "can_override_rbac": True}
            }

    def register_connector(self, tool_id: str, connector: BaseConnector) -> None:
        """Register an active connection instance."""
        self.connectors[tool_id] = connector

    def verify_access(self, department_name: str, tool_id: str) -> bool:
        """
        Verify if a department has permissions to fire a tool.
        """
        # CEO has ultimate overrides
        if department_name == "ceo":
            return self.policy.get("ceo_access", {}).get("can_override_rbac", True)

        dept_rules = self.policy.get("department_access", {}).get(department_name, {})
        allowed_tools = dept_rules.get("allowed_tools", [])
        return tool_id in allowed_tools

    def execute_tool(self, department_name: str, tool_id: str, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute an action using a registered connector, after verifying RBAC limits.
        """
        if not self.verify_access(department_name, tool_id):
            blocked_reason = self.policy.get("department_access", {}).get(department_name, {}).get(
                "blocked_tools_reason", "Access Denied by RBAC Policy"
            )
            return {
                "status": "error",
                "status_code": 403,
                "error": f"RBAC Violation. Department '{department_name}' is blocked from tool '{tool_id}'. Details: {blocked_reason}"
            }

        connector = self.connectors.get(tool_id)
        if not connector:
            return {
                "status": "error",
                "status_code": 404,
                "error": f"Connector for tool '{tool_id}' is not loaded or registered."
            }

        # Check payload before firing
        if not connector.validate_payload(action, payload):
            return {
                "status": "error",
                "status_code": 400,
                "error": f"Payload validation failed for action '{action}' on tool '{tool_id}'."
            }

        try:
            return connector.execute(action, payload)
        except Exception as e:
            return {
                "status": "error",
                "status_code": 500,
                "error": f"Connector execution failed: {str(e)}"
            }
