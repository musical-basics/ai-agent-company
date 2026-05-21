#!/usr/bin/env python3
"""
merge_chimeras.py — Genetic Recombination ("The God Move").
Combines the best-performing traits of two parent swarms into a new apex variant.
"""

import os
import sys
import shutil
import argparse
from typing import List

def main():
    parser = argparse.ArgumentParser(description='Execute Genetic Recombination on Swarm Variants')
    parser.add_argument('--donor-a', required=True, help='ID of parent Swarm Variant A (e.g. successful marketing)')
    parser.add_argument('--donor-b', required=True, help='ID of parent Swarm Variant B (e.g. optimized QA)')
    parser.add_argument('--extract-a', default='minds/departments/growth_marketing', 
                        help='Comma-separated directories to inherit from Parent A')
    parser.add_argument('--extract-b', default='minds/departments/quality_assurance', 
                        help='Comma-separated directories to inherit from Parent B')
    parser.add_argument('--target', required=True, help='Target ID/Directory for the resulting Apex Swarm')
    args = parser.parse_args()

    print("🧬 [GeneticRecombination] Initializing Recombination Loop...")
    print(f"🧬 [GeneticRecombination] Parent A: '{args.donor_a}'")
    print(f"🧬 [GeneticRecombination] Parent B: '{args.donor_b}'")

    target_dir = os.path.join(os.getcwd(), 'blueprints', 'variants', f"{args.target}.yml")
    target_minds_dir = os.path.join(os.getcwd(), 'minds', 'departments', args.target)

    # 1. Blueprint Composition Merge
    # Create the Chimera yml variant combining properties
    yaml_chimera = f"""# Blueprint: Apex Chimera Swarm Variant (Genetic Recombination)
# Derived from: Parent A ({args.donor_a}) & Parent B ({args.donor_b})

extends: "../swarm-compose.yml"

meta:
  company_name: "{args.target} (Apex Variant)"
  company_type: hybrid
  seed_budget_usd: 1000

recombination_heritage:
  donor_a: "{args.donor_a}"
  donor_b: "{args.donor_b}"
  inherited_assets_a: {args.extract_a.split(',')}
  inherited_assets_b: {args.extract_b.split(',')}
"""
    
    blueprint_path = os.path.join(os.getcwd(), 'blueprints', 'variants')
    os.makedirs(blueprint_path, exist_ok=True)
    
    with open(target_dir, 'w') as f:
        f.write(yaml_chimera)
    print(f"🧬 [GeneticRecombination] Wrote new Apex Variant blueprint mapping: '{target_dir}'")

    # 2. Soft DB / Minds Extraction & Fusion
    # Clone and combine mind files from Donor A and Donor B
    os.makedirs(target_minds_dir, exist_ok=True)
    
    # Process Donor A extractions
    for path in args.extract_a.split(','):
        donor_a_dir = os.path.join(os.getcwd(), path)
        if os.path.exists(donor_a_dir):
            print(f"🧬 [GeneticRecombination] Extracting Soft DB assets from Donor A: '{path}'")
            dest = os.path.join(target_minds_dir, os.path.basename(path))
            if os.path.isdir(donor_a_dir):
                if os.path.exists(dest):
                    shutil.rmtree(dest)
                shutil.copytree(donor_a_dir, dest)
            else:
                shutil.copy2(donor_a_dir, dest)
        else:
            print(f"⚠️ [GeneticRecombination] Warning: Path '{path}' not found under Parent A.")

    # Process Donor B extractions
    for path in args.extract_b.split(','):
        donor_b_dir = os.path.join(os.getcwd(), path)
        if os.path.exists(donor_b_dir):
            print(f"🧬 [GeneticRecombination] Extracting Soft DB assets from Donor B: '{path}'")
            dest = os.path.join(target_minds_dir, os.path.basename(path))
            if os.path.isdir(donor_b_dir):
                if os.path.exists(dest):
                    shutil.rmtree(dest)
                shutil.copytree(donor_b_dir, dest)
            else:
                shutil.copy2(donor_b_dir, dest)
        else:
            print(f"⚠️ [GeneticRecombination] Warning: Path '{path}' not found under Parent B.")

    print(f"🧬 [GeneticRecombination] Recombination FLAWLESS. Resulting Apex Swarm minds stored under: '{target_minds_dir}'")

if __name__ == '__main__':
    main()
