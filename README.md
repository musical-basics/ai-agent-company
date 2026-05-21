# 🏢 Enterprise-as-Code (EaC) — The Seed Repository

> **Build, simulate, and genetically evolve autonomous corporate structures using AI agent swarms.**

[![Architecture](https://img.shields.io/badge/Architecture-Enterprise--as--Code-blueviolet)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## 🧬 What Is This?

This repository is the **master blueprint** for spinning up fully autonomous, AI-driven companies. It treats an entire business — its employees, departments, processes, and institutional memory — as **deployable, forkable, version-controlled code**.

Instead of building an app, you **breed a corporation**.

```
Traditional Vibe Coding:  "AI, write this React component for me."
Enterprise Vibe Coding:   "AI, find Product-Market Fit for me."
```

## 🏛️ Architecture Overview

The system scales fractally across four levels:

```
┌─────────────────────────────────────────────────────────┐
│  👑 CHAIRMAN (Human)                                    │
│  └── Strategic vision, capital allocation, Git approvals │
├─────────────────────────────────────────────────────────┤
│  🧠 AI CEO (Apex Reasoning Model)                      │
│  └── Phased planning, scope governance, relationship    │
│      debugging, dynamic "hiring"                        │
├─────────────────────────────────────────────────────────┤
│  📋 MANAGER SUBAGENTS (per department)                  │
│  └── Translate CEO blueprints → surgical SOP updates    │
├─────────────────────────────────────────────────────────┤
│  ⚙️  WORKER AGENTS (The Swarm)                          │
│  └── Deterministic micro-loops: Act → Observe → Correct │
│      Isolated Soft DBs, segregated tools, strict SLAs   │
└─────────────────────────────────────────────────────────┘
```

### The Six Pillars

| Pillar | Description | Implementation |
|--------|-------------|----------------|
| 🦴 **Skeleton** | Deterministic MVC infrastructure | `core_engine/`, PostgreSQL |
| ⚡ **Nervous System** | Connectors & API integrations | `core_engine/connectors/` |
| 🧠 **Mind** | Dynamic SOPs, culture, knowledge | `minds/` (Markdown + Git) |
| 👻 **Spirit** | Hot-swappable LLM reasoning | `core_engine/connectors/llm_connector.py` |
| 🔄 **Reflexes** | ReAct micro-loop (real-time self-correction) | `core_engine/worker_orchestrator.py` |
| 🧬 **Evolution** | Macro-loop (human feedback → permanent SOP updates) | `core_engine/manager_subagent.py` |

### Hybrid Memory Architecture

```
┌───────────────────────────┐    ┌───────────────────────────┐
│     HARD DB (Postgres)    │    │     SOFT DB (Git/MD)      │
│                           │    │                           │
│  • State tracking         │    │  • SOPs & procedures      │
│  • Audit logs             │    │  • Role directives        │
│  • Artifact traces        │    │  • Inter-dept SLAs        │
│  • Event bus queues       │    │  • Company culture        │
│  • Disputes & feedback    │    │  • Evolution history      │
│                           │    │                           │
│  Rigid. ACID. Immutable.  │    │  Human-readable. Versiond │
└───────────────────────────┘    └───────────────────────────┘
```

## 📂 Repository Structure

```
ai-agent-company/
├── blueprints/           # Conglomerate Engine (swarm-compose configs)
├── infrastructure/       # Hard DB schemas, RBAC policies
├── core_engine/          # Python engine (workers, CEO, connectors)
├── minds/                # Soft DB templates (SOPs, SLAs, culture)
├── scripts/              # Operational scripts (spawn, merge, liquidate)
├── swarm_os/             # Chairman dashboard UI (future)
└── docs/                 # Architecture docs, bug fixes
```

## 🚀 Quickstart

```bash
# 1. Clone the seed repo
git clone https://github.com/musical-basics/ai-agent-company.git
cd ai-agent-company

# 2. Copy environment template
cp .env.example .env
# Fill in your API keys (Supabase, LLM providers, etc.)

# 3. Initialize the Hard DB (run manually in Supabase SQL editor)
# See: infrastructure/hard_db/init.sql

# 4. Customize your blueprint
# Edit: blueprints/swarm-compose.yml

# 5. Spawn a variant
python scripts/spawn_variant.py --blueprint blueprints/swarm-compose.yml --variant-id my_first_company

# 6. Run the swarm
python -m core_engine.worker_orchestrator
```

## 🧬 Key Concepts

### Enterprise-as-Code
Your entire company — its employees, departments, processes, and institutional memory — is stored as structured data (Hard DB) and version-controlled text (Soft DB). Companies are deployable, forkable, and A/B testable.

### Surgical Artifact Intervention
Every step of every agent's execution produces immutable artifacts. Humans can pinpoint the exact step where something failed and fix only that node — zero blast radius.

### Genetic Recombination ("The God Move")
Run 10 company variants in parallel. Extract the best marketing from Variant A, the best UX from Variant J, and the best QA from Variant E. Merge them into a single apex company.

```bash
python scripts/merge_chimeras.py \
  --donor-a variant_a \
  --donor-b variant_j \
  --extract-a "minds/marketing" \
  --extract-b "minds/design,minds/qa" \
  --target apex_company
```

### Inter-Swarm Treaties
Two asymmetrical companies (e.g., a media network and a D2C brand) collaborate via strict API bridges and Markdown SLAs, without merging their operational DNA.

## 📄 License

MIT — Clone it, fork it, breed it.
