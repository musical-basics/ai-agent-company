'use client';
/**
 * SWARM FORGE — Deploy Modal ("Instantiate Company")
 * Compiles the canvas → swarm-compose.yml and previews/deploys it.
 */

import { useState } from 'react';
import { X, Rocket, AlertTriangle, Copy, CheckCheck, Download, Loader2, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { useSwarmStore } from '@/lib/store';
import { compileToYaml } from '@/lib/compiler';

export default function DeployModal() {
  const {
    deploy, nodes, edges, companyName, companyType, seedBudgetUsd,
    closeDeploy, setDeployStatus, setCompiledYaml, setDeployError,
  } = useSwarmStore();

  const [copied, setCopied] = useState(false);
  const [warningsOpen, setWarningsOpen] = useState(true);

  // ── Compile ──────────────────────────────────────────────────────
  const handleCompile = async () => {
    setDeployStatus('compiling');
    try {
      // Try the API route first (server-side)
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes, edges,
          meta: { companyName, companyType, seedBudgetUsd },
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setCompiledYaml(result.yaml, result.warnings);
        setDeployStatus('preview');
      } else {
        // Fallback: client-side compile
        const result = compileToYaml(nodes, edges, { companyName, companyType, seedBudgetUsd });
        setCompiledYaml(result.yaml, result.warnings);
        setDeployStatus('preview');
      }
    } catch {
      // Fallback: client-side compile
      const result = compileToYaml(nodes, edges, { companyName, companyType, seedBudgetUsd });
      setCompiledYaml(result.yaml, result.warnings);
      setDeployStatus('preview');
    }
  };

  // ── Copy to clipboard ─────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(deploy.compiledYaml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Download ──────────────────────────────────────────────────────
  const handleDownload = () => {
    const blob = new Blob([deploy.compiledYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'swarm-compose.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Simulate Deploy ───────────────────────────────────────────────
  const handleDeploy = async () => {
    setDeployStatus('deploying');
    // Simulate deploy handoff (real integration would call core engine API)
    await new Promise((r) => setTimeout(r, 2000));
    setDeployStatus('done');
  };

  if (!deploy.isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(8,11,20,0.88)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: '#0d1120',
        border: '1px solid #243249',
        borderRadius: 16,
        width: 720,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 32px 100px rgba(0,0,0,0.7)',
        animation: 'fadeSlideIn 0.2s ease forwards',
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid #1e2a40',
          background: 'linear-gradient(135deg, #064e3b20 0%, #0d1120 100%)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#064e3b', color: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Rocket size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e8eef8', margin: 0 }}>Instantiate Company</h2>
            <p style={{ fontSize: 11, color: '#4a6080', margin: '2px 0 0' }}>
              Compile your canvas into a deployable <code style={{ color: '#10b981', fontSize: 10 }}>swarm-compose.yml</code> manifest
            </p>
          </div>
          <button onClick={closeDeploy} style={{ background: 'none', border: 'none', color: '#4a6080', cursor: 'pointer', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>

          {/* ── Idle state: stats summary ── */}
          {deploy.status === 'idle' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Nodes', value: nodes.length, color: '#818cf8' },
                  { label: 'SLA Edges', value: edges.length, color: '#22d3ee' },
                  { label: 'Seed Budget', value: `$${seedBudgetUsd.toLocaleString()}`, color: '#10b981' },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    background: '#080b14', border: '1px solid #1e2a40',
                    borderRadius: 10, padding: '14px',
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 10, color: '#4a6080', marginTop: 4 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {nodes.length === 0 && (
                <div style={{ background: '#1a1005', border: '1px solid #f59e0b40', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <p style={{ fontSize: 11, color: '#92400e', margin: 0 }}>
                      Canvas is empty — add agents before compiling.
                    </p>
                  </div>
                </div>
              )}

              <div style={{ background: '#080b14', border: '1px solid #1e2a40', borderRadius: 10, padding: '14px' }}>
                <p style={{ fontSize: 11, color: '#8fa4c0', margin: '0 0 8px', fontWeight: 600 }}>What happens when you compile:</p>
                <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 11, color: '#4a6080', lineHeight: 2 }}>
                  <li>Nodes are grouped into department sections</li>
                  <li>SLA edges become <code style={{ color: '#818cf8', fontSize: 10 }}>inter_departmental_slas</code> entries</li>
                  <li>Model selections are embedded per-agent</li>
                  <li>YAML is ready to drop into <code style={{ color: '#10b981', fontSize: 10 }}>blueprints/swarm-compose.yml</code></li>
                </ul>
              </div>
            </div>
          )}

          {/* ── Compiling ── */}
          {deploy.status === 'compiling' && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Loader2 size={36} style={{ color: '#6366f1', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#e8eef8', margin: '0 0 8px' }}>Compiling Canvas…</p>
              <p style={{ fontSize: 11, color: '#4a6080', margin: 0 }}>Serializing nodes and edges into YAML</p>
            </div>
          )}

          {/* ── Preview ── */}
          {deploy.status === 'preview' && (
            <div>
              {/* Warnings */}
              {deploy.warnings.length > 0 && (
                <div style={{ background: '#1a1005', border: '1px solid #f59e0b40', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                  <button
                    onClick={() => setWarningsOpen(!warningsOpen)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: 0 }}
                  >
                    <AlertTriangle size={13} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, flex: 1, textAlign: 'left' }}>
                      {deploy.warnings.length} Compilation Warning{deploy.warnings.length > 1 ? 's' : ''}
                    </span>
                    {warningsOpen ? <ChevronDown size={12} style={{ color: '#f59e0b' }} /> : <ChevronRight size={12} style={{ color: '#f59e0b' }} />}
                  </button>
                  {warningsOpen && (
                    <ul style={{ margin: '8px 0 0', padding: '0 0 0 20px', fontSize: 10, color: '#92400e', lineHeight: 1.8 }}>
                      {deploy.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  )}
                </div>
              )}

              {/* YAML Preview */}
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: 8, position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 10px',
                      background: '#0d1120', border: '1px solid #243249',
                      borderRadius: 6, color: '#8fa4c0', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {copied ? <CheckCheck size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 10px',
                      background: '#0d1120', border: '1px solid #243249',
                      borderRadius: 6, color: '#8fa4c0', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <Download size={11} /> Download
                  </button>
                </div>

                <pre className="yaml-block" style={{ maxHeight: 380, overflowY: 'auto', marginTop: 0 }}>
                  {deploy.compiledYaml}
                </pre>
              </div>
            </div>
          )}

          {/* ── Deploying ── */}
          {deploy.status === 'deploying' && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Zap size={36} style={{ color: '#10b981', margin: '0 auto 16px', animation: 'pulse-dot 1s ease-in-out infinite' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#e8eef8', margin: '0 0 8px' }}>Deploying Swarm…</p>
              <p style={{ fontSize: 11, color: '#4a6080', margin: 0 }}>Initializing AI CEO and booting departments</p>
            </div>
          )}

          {/* ── Done ── */}
          {deploy.status === 'done' && (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#064e3b', border: '2px solid #10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 30px rgba(16,185,129,0.3)',
              }}>
                <Rocket size={28} style={{ color: '#10b981' }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#e8eef8', margin: '0 0 8px' }}>
                Company Instantiated 🎉
              </p>
              <p style={{ fontSize: 11, color: '#4a6080', margin: '0 0 20px', lineHeight: 1.6 }}>
                The swarm-compose.yml has been generated. Drop it into <code style={{ color: '#10b981', fontSize: 10 }}>blueprints/swarm-compose.yml</code> and run your core engine to boot the AI company.
              </p>
              <button
                onClick={handleDownload}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', borderRadius: 10,
                  color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                }}
              >
                <Download size={14} /> Download swarm-compose.yml
              </button>
            </div>
          )}

          {/* ── Error ── */}
          {deploy.status === 'error' && (
            <div style={{ background: '#180a12', border: '1px solid #f43f5e40', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
              <AlertTriangle size={24} style={{ color: '#f43f5e', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 12, color: '#fb7185', margin: '0 0 8px', fontWeight: 600 }}>Compilation Error</p>
              <p style={{ fontSize: 11, color: '#4a6080', margin: 0 }}>{deploy.error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid #1e2a40', display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
          {deploy.status === 'preview' && (
            <span style={{ fontSize: 10, color: '#4a6080', flex: 1 }}>
              ✓ Ready to deploy. Review the YAML above before proceeding.
            </span>
          )}
          <button
            onClick={closeDeploy}
            style={{ padding: '8px 18px', background: 'none', border: '1px solid #243249', borderRadius: 8, color: '#8fa4c0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            {deploy.status === 'done' ? 'Close' : 'Cancel'}
          </button>

          {(deploy.status === 'idle' || deploy.status === 'error') && (
            <button
              onClick={handleCompile}
              disabled={nodes.length === 0}
              style={{
                padding: '8px 20px',
                background: nodes.length === 0 ? '#1e2a40' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: 8,
                color: nodes.length === 0 ? '#4a6080' : '#fff',
                fontSize: 12, fontWeight: 700, cursor: nodes.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: nodes.length === 0 ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
              }}
            >
              Compile YAML
            </button>
          )}

          {deploy.status === 'preview' && (
            <button
              onClick={handleDeploy}
              style={{
                padding: '8px 22px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none', borderRadius: 8,
                color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              <Rocket size={13} /> Instantiate Company
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
