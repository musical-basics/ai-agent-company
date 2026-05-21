.PHONY: init lint check spawn merge liquidate help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

init: ## Initialize the development environment
	@echo "🏢 Enterprise-as-Code — Initializing..."
	@cp -n .env.example .env 2>/dev/null || true
	@pip install -r requirements.txt 2>/dev/null || echo "No requirements.txt yet"
	@echo "✅ Environment ready. Edit .env with your API keys."
	@echo "📋 Run init.sql manually in your Supabase SQL editor."

lint: ## Lint all Python files
	@echo "🔍 Linting Python..."
	@python3 -m py_compile core_engine/worker_orchestrator.py
	@python3 -m py_compile core_engine/ai_ceo.py
	@python3 -m py_compile core_engine/manager_subagent.py
	@python3 -m py_compile scripts/merge_chimeras.py
	@python3 -m py_compile scripts/spawn_variant.py
	@echo "✅ All Python files compile cleanly."

check: ## Validate YAML blueprints
	@echo "🔍 Validating blueprints..."
	@python3 -c "import yaml; yaml.safe_load(open('blueprints/swarm-compose.yml'))" && echo "✅ swarm-compose.yml valid"
	@echo "✅ All checks passed."

spawn: ## Spawn a new swarm variant (VARIANT_ID required)
	@python3 scripts/spawn_variant.py --blueprint blueprints/swarm-compose.yml --variant-id $(VARIANT_ID)

merge: ## Merge two variants (DONOR_A, DONOR_B, TARGET required)
	@python3 scripts/merge_chimeras.py --donor-a $(DONOR_A) --donor-b $(DONOR_B) --target $(TARGET)

liquidate: ## Tear down a swarm variant (VARIANT_ID required)
	@python3 scripts/liquidate_swarm.py --variant-id $(VARIANT_ID)
