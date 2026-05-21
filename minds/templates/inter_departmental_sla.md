# 🤝 Inter-Departmental SLA: {{producer_department}} → {{consumer_department}}

> **Treaty ID**: `{{sla_id}}`  
> **Version**: {{version}} | **Last Updated**: {{last_updated}}

---

## 1. Purpose

This Service Level Agreement governs the **artifact handoff** between the **{{producer_department}}** department (Producer) and the **{{consumer_department}}** department (Consumer).

Both parties agree to the strict protocols below. Violations trigger the **Friction Protocol** (§4) and may escalate to the AI CEO.

---

## 2. Required Artifact Schema

The Producer **MUST** deliver artifacts conforming to this exact JSON schema. Missing or malformed keys trigger an automatic rejection.

```json
{
  "$schema": "artifact_handoff",
  "sla_id": "{{sla_id}}",
  "producer": "{{producer_department}}",
  "consumer": "{{consumer_department}}",
  "required_keys": {
    "{{required_key_1}}": {
      "type": "{{type}}",
      "description": "{{description}}",
      "required": true
    },
    "{{required_key_2}}": {
      "type": "{{type}}",
      "description": "{{description}}",
      "required": true
    },
    "{{required_key_3}}": {
      "type": "{{type}}",
      "description": "{{description}}",
      "required": false
    }
  }
}
```

### Acceptance Criteria

| Key | Type | Required | Validation Rule |
|-----|------|----------|-----------------|
| `{{required_key_1}}` | `{{type}}` | ✅ | {{validation_rule}} |
| `{{required_key_2}}` | `{{type}}` | ✅ | {{validation_rule}} |
| `{{required_key_3}}` | `{{type}}` | ⬜ | {{validation_rule}} |

---

## 3. Quality Standards

The Consumer will evaluate incoming artifacts against these criteria:

- [ ] All required keys are present and non-empty.
- [ ] Data types match the schema above.
- [ ] {{quality_check_1}}
- [ ] {{quality_check_2}}
- [ ] The artifact references the correct active Chairman directive (if applicable).

---

## 4. Friction Protocol (Rejection & Escalation)

### 4.1 Rejection Flow

When the Consumer's Controller detects a schema violation:

1. **Automatic Rejection**: The artifact is returned to the Producer's Event Bus queue with status `rejected`.
2. **Rejection Payload**: The Consumer emits a structured rejection:
   ```json
   {
     "status": "rejected",
     "sla_id": "{{sla_id}}",
     "missing_keys": ["{{key}}"],
     "malformed_keys": ["{{key}}"],
     "reason": "Human-readable explanation",
     "retry_number": 1
   }
   ```
3. **Producer Self-Correction**: The Producer re-enters its ReAct micro-loop, reads the rejection, and re-emits a corrected artifact.

### 4.2 Escalation Thresholds

| Retry # | Action |
|---------|--------|
| 1 | Producer self-corrects autonomously |
| {{escalate_after}} | **CEO Escalation**: A `departmental_dispute` is created in the Hard DB. The CEO diagnoses whether the failure is in the Producer's SOP, the Consumer's SOP, or this SLA itself. |
| {{max_retries}} | **Hard Block**: Pipeline halts. Chairman is notified via SwarmOS. |

---

## 5. SLA Evolution

This document is subject to surgical updates by the AI CEO when:

- A dispute reveals a gap in the required schema.
- The Chairman flags a relationship failure between the two departments.
- A new product feature requires additional handoff keys.

All changes are tracked via Git commits with the prefix: `[SLA-UPDATE]`.

<!-- SLA_EVOLUTION_ANCHOR — CEO appends amendments below -->

_No amendments yet._
