"""
Base Connector — Abstract base class for all external nervous system integrations.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseConnector(ABC):
    """
    Abstract interface representing a secure actuator or sensor.
    All integration channels (Shopify, Resend, Github) implement this interface.
    The controller executes connectors within a deterministic box.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config

    @abstractmethod
    def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute an action via this connector.
        
        Args:
            action: The exact API operation (e.g., 'send_email', 'create_pull_request')
            payload: Parameters for the action. Must match the connector's schema.
            
        Returns:
            Dict containing execution results and status code.
        """
        pass

    @abstractmethod
    def validate_payload(self, action: str, payload: Dict[str, Any]) -> bool:
        """
        Validate the payload against schema constraints before execution.
        """
        pass
