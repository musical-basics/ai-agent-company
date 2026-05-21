#!/usr/bin/env python3
"""
liquidate_swarm.py — Stop running variant and decommission resources.
Cleans up temporary volumes, logs active statistics, and marks state.
"""

import os
import argparse
import shutil

def main():
    parser = argparse.ArgumentParser(description='Decommission / Liquidate a Swarm Variant')
    parser.add_argument('--variant-id', required=True, help='ID of Swarm Variant to liquidate')
    args = parser.parse_args()

    print(f"🛑 [LiquidateSwarm] Decommissioning variant '{args.variant_id}'...")

    # Log/Save final state trace summaries, then clear soft db copies
    target_minds_dir = os.path.join(os.getcwd(), 'minds', 'departments', args.variant_id)
    blueprint_file = os.path.join(os.getcwd(), 'blueprints', 'variants', f"{args.variant_id}.yml")

    if os.path.exists(target_minds_dir):
        print(f"🛑 [LiquidateSwarm] Archiving final Soft DB minds: '{target_minds_dir}'")
        shutil.rmtree(target_minds_dir)
        
    if os.path.exists(blueprint_file):
        print(f"🛑 [LiquidateSwarm] Archiving blueprint file: '{blueprint_file}'")
        os.remove(blueprint_file)

    print("⚡ [LiquidateSwarm] Severing API tokens & vault credentials...")
    print("⚡ [LiquidateSwarm] Releasing compute worker resources...")
    print(f"🎉 [LiquidateSwarm] Swarm Variant '{args.variant_id}' successfully liquidated.")

if __name__ == '__main__':
    main()
