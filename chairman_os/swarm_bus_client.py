#!/usr/bin/env python3
"""
SWARM BUS CLIENT — Commander OS Bridge
Replaces `openclaw message send --channel discord` calls with
Dual-Payload Envelope POSTs to the Chairman OS event bus.

Usage in any Commander OS script or agent:
    from swarm_bus_client import SwarmBusClient
    bus = SwarmBusClient()
    bus.publish(
        sender_id="concert_marketing",
        receiver_id="dreamplay",
        channel_id="belgium-concert-launch",
        event_type="artifact_handoff",
        nl_summary="Concert Marketing has finalized the campaign brief...",
        artifact={
            "type": "Campaign_Brief",
            "schemaVersion": "1.0",
            "payload": { ... }
        },
        sla_id="marketing_to_product",
    )

Environment variables (add to Commander OS .env):
    CHAIRMAN_OS_URL=http://localhost:3000        # local dev
    CHAIRMAN_OS_SECRET=<shared secret>          # optional auth header

DISCORD MIGRATION GUIDE:
    OLD: openclaw message send --channel #concert-marketing "Brief is ready..."
    NEW: bus.publish(sender_id=..., receiver_id=..., nl_summary=..., artifact={...})

    The natural language goes into nl_summary (human reads this in the Glass Box).
    The structured data goes into artifact.payload (machines parse this deterministically).
    Discord is relegated to PagerDuty-only: bus.alert_chairman("🚨 Critical issue...")
"""

import os
import json
import uuid
import logging
import datetime
import subprocess
from typing import Any, Optional, Literal
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

EventType = Literal[
    "artifact_handoff",
    "sla_violation",
    "ceo_directive",
    "sop_update",
    "heartbeat",
    "escalation",
    "chairman_intervention",
]

EventStatus = Literal[
    "pending",
    "delivered",
    "rejected",
    "flagged",
    "replayed",
    "processing",
]


class SwarmBusClient:
    """
    Publishes Dual-Payload Envelopes to the Chairman OS event bus.
    Falls back to local SQLite log if the API is unreachable.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        secret: Optional[str] = None,
        fallback_log: str = "/tmp/swarm_bus_fallback.jsonl",
    ):
        self.base_url = (base_url or os.getenv("CHAIRMAN_OS_URL", "http://localhost:3000")).rstrip("/")
        self.secret = secret or os.getenv("CHAIRMAN_OS_SECRET", "")
        self.fallback_log = fallback_log
        self.agent_id = os.getenv("AGENT_ID", "commander")

    # ─── Core publish ──────────────────────────────────────────────────────────

    def publish(
        self,
        sender_id: str,
        receiver_id: str,
        nl_summary: str,
        artifact: dict[str, Any],
        channel_id: str = "system",
        event_type: EventType = "artifact_handoff",
        status: EventStatus = "pending",
        sla_id: Optional[str] = None,
        replay_of_event_id: Optional[str] = None,
        intervention_id: Optional[str] = None,
        trace_id: Optional[str] = None,
    ) -> Optional[str]:
        """
        Publish a Dual-Payload Envelope to the Chairman OS event bus.
        Returns the event ID on success, None on failure.

        CRITICAL RULE: The receiving agent's orchestrator MUST use only
        artifact.payload for execution — never nl_summary.
        The nl_summary is EXCLUSIVELY for the Chairman's human eyes.
        """
        payload = {
            "senderId": sender_id,
            "receiverId": receiver_id,
            "channelId": channel_id,
            "eventType": event_type,
            "status": status,
            "nlSummary": nl_summary,
            "artifact": artifact,
            "slaId": sla_id,
            "replayOfEventId": replay_of_event_id,
            "interventionId": intervention_id,
            "traceId": trace_id or str(uuid.uuid4()),
        }

        try:
            event_id = self._http_post("/api/events", payload)
            logger.info(f"[SwarmBus] Published event {event_id}: {sender_id} → {receiver_id}")
            return event_id
        except Exception as e:
            logger.warning(f"[SwarmBus] API unreachable, falling back to log: {e}")
            self._fallback_log(payload)
            return None

    # ─── Shortcut: CEO directive ───────────────────────────────────────────────

    def ceo_directive(
        self,
        receiver_id: str,
        nl_summary: str,
        directive_payload: dict[str, Any],
        channel_id: str = "system",
    ) -> Optional[str]:
        """Issue an AI CEO directive to a worker."""
        return self.publish(
            sender_id="commander",
            receiver_id=receiver_id,
            channel_id=channel_id,
            event_type="ceo_directive",
            nl_summary=nl_summary,
            artifact={
                "type": "Custom",
                "schemaVersion": "1.0",
                "payload": directive_payload,
            },
        )

    # ─── Shortcut: heartbeat ──────────────────────────────────────────────────

    def heartbeat(
        self,
        agent_id: str,
        status: str = "active",
        current_task: Optional[str] = None,
        token_count: int = 0,
    ) -> Optional[str]:
        """Send a heartbeat check-in from an agent."""
        return self.publish(
            sender_id=agent_id,
            receiver_id="commander",
            channel_id="system",
            event_type="heartbeat",
            status="delivered",
            nl_summary=f"{agent_id} is {status}" + (f": {current_task}" if current_task else "."),
            artifact={
                "type": "Custom",
                "schemaVersion": "1.0",
                "payload": {
                    "agent_id": agent_id,
                    "status": status,
                    "current_task": current_task,
                    "token_count": token_count,
                    "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                },
            },
        )

    # ─── Shortcut: SLA violation ──────────────────────────────────────────────

    def reject_handoff(
        self,
        receiver_id: str,
        sender_id: str,
        channel_id: str,
        sla_id: str,
        missing_keys: list[str],
        provided_keys: list[str],
    ) -> Optional[str]:
        """Reject an incoming artifact handoff due to SLA schema violation."""
        missing_str = ", ".join(missing_keys)
        return self.publish(
            sender_id=receiver_id,
            receiver_id=sender_id,
            channel_id=channel_id,
            event_type="sla_violation",
            status="rejected",
            sla_id=sla_id,
            nl_summary=(
                f"{receiver_id} rejected a handoff from {sender_id}: "
                f"the artifact is missing required SLA keys: {missing_str}. "
                f"The producer must include these fields before this handoff can be accepted."
            ),
            artifact={
                "type": "Custom",
                "schemaVersion": "1.0",
                "payload": {
                    "sla_id": sla_id,
                    "missing_keys": missing_keys,
                    "provided_keys": provided_keys,
                    "rejection_reason": f"Missing required keys: {missing_str}",
                },
            },
        )

    # ─── PagerDuty-only Discord alert (the ONLY remaining Discord usage) ───────

    def alert_chairman(self, message: str, severity: str = "warning") -> None:
        """
        Send a read-only PagerDuty-style alert to Lionel on Discord.
        This is the ONLY remaining sanctioned Discord usage.
        Agents may NOT use Discord for any other inter-agent coordination.
        """
        emoji = {"critical": "🚨", "warning": "⚠️", "info": "ℹ️"}.get(severity, "📢")
        discord_msg = f"{emoji} **[SwarmOS Alert]** {message}"

        # Log to Chairman OS too
        self.publish(
            sender_id="system",
            receiver_id="chairman",
            channel_id="system",
            event_type="escalation",
            status="pending",
            nl_summary=message,
            artifact={
                "type": "Custom",
                "schemaVersion": "1.0",
                "payload": {"severity": severity, "message": message},
            },
        )

        # Discord DM (read-only PagerDuty channel)
        try:
            subprocess.run(
                ["openclaw", "message", "send", "--channel", "pagerduty-alerts", discord_msg],
                capture_output=True, timeout=10,
            )
        except Exception as e:
            logger.debug(f"Discord alert skipped: {e}")

    # ─── Validate artifact against SLA ────────────────────────────────────────

    @staticmethod
    def validate_artifact(artifact: dict[str, Any], required_keys: list[str]) -> tuple[bool, list[str]]:
        """
        Validate an incoming artifact payload against required SLA keys.
        Returns (is_valid, missing_keys).

        Call this in the RECEIVER agent before accepting any handoff.
        If invalid, call reject_handoff() instead of processing.

        Example:
            valid, missing = SwarmBusClient.validate_artifact(
                artifact=incoming_payload,
                required_keys=["target_audience", "vip_pricing", "copy_text"]
            )
            if not valid:
                bus.reject_handoff(..., missing_keys=missing, ...)
                return
        """
        payload = artifact.get("payload", {})
        missing = [key for key in required_keys if key not in payload]
        return (len(missing) == 0), missing

    # ─── HTTP helpers ─────────────────────────────────────────────────────────

    def _http_post(self, path: str, payload: dict) -> str:
        url = f"{self.base_url}{path}"
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "SwarmBusClient/1.0",
                **({"X-Swarm-Secret": self.secret} if self.secret else {}),
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            body = json.loads(resp.read())
            return body.get("event", {}).get("id", "unknown")

    def _fallback_log(self, payload: dict) -> None:
        entry = {**payload, "_fallback_at": datetime.datetime.utcnow().isoformat()}
        with open(self.fallback_log, "a") as f:
            f.write(json.dumps(entry) + "\n")


# ─── CLI usage (for shell script integration) ─────────────────────────────────

if __name__ == "__main__":
    import sys
    import argparse

    parser = argparse.ArgumentParser(description="Publish a Swarm Bus event from the CLI")
    parser.add_argument("--sender",   required=True)
    parser.add_argument("--receiver", required=True)
    parser.add_argument("--channel",  default="system")
    parser.add_argument("--summary",  required=True, help="Natural language summary")
    parser.add_argument("--type",     default="artifact_handoff")
    parser.add_argument("--payload",  default="{}", help="JSON artifact payload")
    parser.add_argument("--sla",      default=None)

    args = parser.parse_args()

    client = SwarmBusClient()
    event_id = client.publish(
        sender_id=args.sender,
        receiver_id=args.receiver,
        channel_id=args.channel,
        event_type=args.type,
        nl_summary=args.summary,
        sla_id=args.sla,
        artifact={
            "type": "Custom",
            "schemaVersion": "1.0",
            "payload": json.loads(args.payload),
        },
    )

    print(f"Event published: {event_id}" if event_id else "Event logged to fallback (API unreachable)")
    sys.exit(0 if event_id else 1)
