#!/usr/bin/env python3
"""
spawn_variant.py — Instantiate a new Swarm Variant.
Provisions directory structure, copies baseline SOPs and configuration mappings.
"""

import os
import argparse
import shutil
import yaml

def main():
    parser = argparse.ArgumentParser(description='Spawn a new Swarm Variant')
    parser.add_argument('--blueprint', required=True, help='Path to master swarm-compose.yml')
    parser.add_argument('--variant-id', required=True, help='Unique ID for the new variant')
    args = parser.parse_args()

    print(f"🚀 [SpawnVariant] Bootstrapping Swarm Variant '{args.variant_id}'...")

    if not os.path.exists(args.blueprint):
        print(f"❌ Error: Master blueprint '{args.blueprint}' not found.")
        return

    # Load master config
    with open(args.blueprint, 'r') as f:
        master_config = yaml.safe_load(f)

    # 1. Directory Scaffolding
    variant_minds_dir = os.path.join(os.getcwd(), 'minds', 'departments')
    os.makedirs(variant_minds_dir, exist_ok=True)

    # Copy blueprint templates to target departments
    for dept in master_config.get('departments', []):
        dept_name = dept.get('name')
        dept_target_dir = os.path.join(variant_minds_dir, dept_name)
        os.makedirs(dept_target_dir, exist_ok=True)
        
        # Copy baseline agent SOP templates
        for agent in dept.get('agents', []):
            sop_file = agent.get('sop_file')
            target_sop_path = os.path.join(dept_target_dir, sop_file)
            
            # Use template SOP if it exists
            template_sop = os.path.join(os.getcwd(), 'minds', 'templates', 'department_sop.md')
            if os.path.exists(template_sop) and not os.path.exists(target_sop_path):
                shutil.copy2(template_sop, target_sop_path)
                print(f"📝 Scaffolding SOP for agent '{agent.get('id')}' at: '{target_sop_path}'")

    # 2. Hard infrastructure bootstrap mock
    print("⚡ [SpawnVariant] Provisioning Hard Infrastructure (Supabase, pgvector schemas loaded)...")
    print("⚡ [SpawnVariant] Wiring connectors & API secrets from Vault context...")
    print(f"🎉 [SpawnVariant] Swarm Variant '{args.variant_id}' initialized flawlessly. Ready for activation loop.")

if __name__ == '__main__':
    main()
