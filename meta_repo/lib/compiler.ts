/**
 * SWARM FORGE — YAML Compiler
 * Serializes the visual React Flow canvas into a swarm-compose.yml manifest.
 * This is the bridge between the Meta-Repo and the Execution Repo.
 */

import * as yaml from 'js-yaml';
import type { CanvasNode, CanvasEdge, CompilerOutput, WorkerNodeData, ManagerNodeData, CEONodeData } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupWorkersByDepartment(
  nodes: CanvasNode[],
  edges: CanvasEdge[]
): Map<string, { manager?: CanvasNode; workers: CanvasNode[] }> {
  const departments = new Map<string, { manager?: CanvasNode; workers: CanvasNode[] }>();

  // Find all manager nodes — each defines a department
  const managers = nodes.filter((n) => n.type === 'manager');
  managers.forEach((m) => {
    const data = m.data as ManagerNodeData;
    const deptId = data.department || m.id;
    departments.set(deptId, { manager: m, workers: [] });
  });

  // Assign workers to departments via edges manager→worker
  const workerNodes = nodes.filter((n) => n.type === 'worker');
  workerNodes.forEach((w) => {
    const wData = w.data as WorkerNodeData;
    const deptId = wData.department;
    if (deptId && departments.has(deptId)) {
      departments.get(deptId)!.workers.push(w);
    } else {
      // Try to infer from edges
      const managerEdge = edges.find((e) => e.target === w.id);
      if (managerEdge) {
        const sourceNode = managers.find((m) => m.id === managerEdge.source);
        if (sourceNode) {
          const srcData = sourceNode.data as ManagerNodeData;
          const dId = srcData.department || sourceNode.id;
          if (!departments.has(dId)) {
            departments.set(dId, { manager: sourceNode, workers: [] });
          }
          departments.get(dId)!.workers.push(w);
          return;
        }
      }
      // Orphan workers: put in "general" department
      if (!departments.has('general')) {
        departments.set('general', { workers: [] });
      }
      departments.get('general')!.workers.push(w);
    }
  });

  return departments;
}

function buildSLAs(edges: CanvasEdge[], nodes: CanvasNode[]): object[] {
  return edges
    .filter((e) => e.data && (e.data as { requiredArtifactKeys?: string[] }).requiredArtifactKeys?.length)
    .map((e) => {
      const slaData = e.data!;
      const sourceNode = nodes.find((n) => n.id === e.source);
      const targetNode = nodes.find((n) => n.id === e.target);

      const srcDept = (sourceNode?.data as { department?: string })?.department || sourceNode?.id || 'unknown';
      const tgtDept = (targetNode?.data as { department?: string })?.department || targetNode?.id || 'unknown';

      return {
        id: slaData.slaId || `${srcDept}_to_${tgtDept}`,
        producer: srcDept,
        consumer: tgtDept,
        protocol_file: slaData.protocolFile || `minds/templates/sla_${srcDept}_to_${tgtDept}.md`,
        required_artifact_keys: slaData.requiredArtifactKeys,
        rejection_policy: {
          max_retries: slaData.rejectionPolicy?.maxRetries ?? 2,
          escalate_to_ceo_after: slaData.rejectionPolicy?.escalateToCeoAfter ?? 1,
        },
      };
    });
}

// ─── Main Compiler ────────────────────────────────────────────────────────────

export function compileToYaml(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  meta: { companyName: string; companyType: string; seedBudgetUsd: number }
): CompilerOutput {
  const warnings: string[] = [];

  // ── CEO ──
  const ceoNode = nodes.find((n) => n.type === 'ceo');
  const ceoData = ceoNode?.data as CEONodeData | undefined;

  const ceoSection = {
    model_provider: ceoData?.modelProvider ?? '{{CEO_MODEL_PROVIDER}}',
    model_name: ceoData?.modelId ?? '{{CEO_MODEL_NAME}}',
    scope_governance: {
      max_phase_count: ceoData?.maxPhaseCount ?? 5,
      budget_alert_threshold_pct: ceoData?.budgetAlertThresholdPct ?? 75,
      over_engineering_keywords: ['custom server', 'from scratch', 'proprietary protocol'],
      under_engineering_keywords: ['one-off fix', 'hardcode', 'skip testing'],
    },
    directives_file: ceoData?.directivesFile ?? 'minds/global/chairman_directives.md',
    culture_file: ceoData?.cultureFile ?? 'minds/global/company_culture.md',
  };

  if (!ceoNode) {
    warnings.push('No CEO node found. Using placeholder values for the CEO section.');
  }

  // ── Departments ──
  const departments = groupWorkersByDepartment(nodes, edges);
  const departmentSections: object[] = [];

  departments.forEach((dept, deptId) => {
    const manager = dept.manager;
    const managerData = manager?.data as ManagerNodeData | undefined;

    // Collect all tool IDs for this department
    const allToolIds = new Set<string>();
    dept.workers.forEach((w) => {
      const wData = w.data as WorkerNodeData;
      wData.toolsGranted?.forEach((t) => allToolIds.add(t));
    });
    if (managerData?.toolsGranted) {
      managerData.toolsGranted.forEach((t) => allToolIds.add(t));
    }

    const totalBudget = dept.workers.reduce((sum, w) => {
      const wData = w.data as WorkerNodeData;
      return sum + (wData.budgetUsd ?? 200);
    }, managerData?.budgetUsd ?? 0);

    const agentList = dept.workers.map((w) => {
      const wData = w.data as WorkerNodeData;
      return {
        id: wData.role || w.id,
        role: wData.label,
        framework_adapter: wData.framework,
        model_provider: wData.modelProvider,
        model_name: wData.modelId,
        sop_file: wData.sopFile ?? `${wData.role || w.id}_sop.md`,
      };
    });

    if (agentList.length === 0) {
      warnings.push(`Department '${deptId}' has no workers assigned.`);
    }

    departmentSections.push({
      name: deptId,
      description: managerData
        ? `${managerData.label} department`
        : `${deptId} department`,
      git_mind_directory: `minds/departments/${deptId}/`,
      pgvector_namespace: `ns_${deptId}`,
      agents: agentList,
      manager: {
        framework_adapter: managerData?.framework ?? 'Custom_ReAct',
        model_provider: managerData?.modelProvider ?? '{{MANAGER_MODEL_PROVIDER}}',
        model_name: managerData?.modelId ?? '{{MANAGER_MODEL_NAME}}',
      },
      tools_granted: Array.from(allToolIds),
      budget_allocation_usd: totalBudget,
    });
  });

  // ── SLAs ──
  const slaSection = buildSLAs(edges, nodes);

  // ── Total budget check ──
  const totalBudget = departmentSections.reduce((sum, d) => {
    return sum + ((d as { budget_allocation_usd: number }).budget_allocation_usd ?? 0);
  }, 0);

  if (totalBudget > meta.seedBudgetUsd) {
    warnings.push(
      `Total department budget ($${totalBudget}) exceeds seed budget ($${meta.seedBudgetUsd}). Consider reducing allocations.`
    );
  }

  // ── Assemble full manifest ──
  const manifest = {
    // YAML header comment is added as a post-processing step below
    meta: {
      version: '1.0.0',
      company_name: meta.companyName,
      company_type: meta.companyType,
      seed_budget_usd: meta.seedBudgetUsd,
      infrastructure: {
        hard_db: 'supabase',
        compute: 'railway',
        soft_db: 'github',
      },
    },
    ceo: ceoSection,
    departments: departmentSections,
    inter_departmental_slas: slaSection,
    conglomerate: {
      enabled: false,
      variant_directory: 'blueprints/variants/',
      max_parallel_variants: 10,
      harvest_interval_days: 14,
      merge_policy: {
        strategy: 'cherry_pick_best',
        fitness_metrics: [
          { metric: 'customer_acquisition_cost', weight: 0.3, direction: 'minimize' },
          { metric: 'day7_retention_rate', weight: 0.4, direction: 'maximize' },
          { metric: 'bug_report_rate', weight: 0.3, direction: 'minimize' },
        ],
      },
    },
  };

  const header = [
    '# ══════════════════════════════════════════════════════════════════',
    `#  SWARM-COMPOSE.YML — Generated by Swarm Forge`,
    `#  Company: ${meta.companyName} | Type: ${meta.companyType}`,
    `#  Generated: ${new Date().toISOString()}`,
    '#  DO NOT EDIT MANUALLY — regenerate via Swarm Forge UI',
    '# ══════════════════════════════════════════════════════════════════',
    '',
  ].join('\n');

  const yamlStr = header + yaml.dump(manifest, {
    indent: 2,
    lineWidth: 100,
    noCompatMode: true,
  });

  return {
    yaml: yamlStr,
    warnings,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    departments: Array.from(departments.keys()),
  };
}
