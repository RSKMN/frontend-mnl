"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import ActionButtonGroup, { ActionButton } from "@/components/ui/ActionButtonGroup";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionHeader from "@/components/ui/SectionHeader";

const MATRIX_LABELS = [
  "QDF-EGFR-001",
  "QDF-EGFR-014",
  "QDF-EGFR-027",
  "Gefitinib",
  "Erlotinib",
  "Osimertinib"
];

const SIMILARITY_MATRIX = [
  [1.00, 0.82, 0.75, 0.78, 0.72, 0.65],
  [0.82, 1.00, 0.88, 0.71, 0.68, 0.58],
  [0.75, 0.88, 1.00, 0.65, 0.62, 0.52],
  [0.78, 0.71, 0.65, 1.00, 0.89, 0.61],
  [0.72, 0.68, 0.62, 0.89, 1.00, 0.59],
  [0.65, 0.58, 0.52, 0.61, 0.59, 1.00]
];

const NEIGHBORS = [
  { id: "Gefitinib", type: "Approved Drug", similarity: 0.78, scaffold: "Quinazoline", activity: "EGFR WT/L858R", risk: "Low", notes: "Shared binding mode" },
  { id: "Erlotinib", type: "Approved Drug", similarity: 0.72, scaffold: "Quinazoline", activity: "EGFR WT", risk: "Low", notes: "Secondary neighbor" },
  { id: "Osimertinib", type: "Approved Drug", similarity: 0.65, scaffold: "Pyrimidine", activity: "EGFR T790M", risk: "Low", notes: "Low structural similarity" },
  { id: "QDF-EGFR-014", type: "Generated", similarity: 0.82, scaffold: "Quinazoline", activity: "Predicted High", risk: "Low", notes: "Isostere variant" },
  { id: "QDF-EGFR-027", type: "Generated", similarity: 0.75, scaffold: "Quinazoline", activity: "Predicted Med", risk: "Medium", notes: "TPSA alert" },
];

export default function SimilarityPage() {
  const [selectedMolecule, setSelectedMolecule] = useState("QDF-EGFR-001");

  const getHeatmapColor = (value: number) => {
    if (value === 1) return "bg-accent text-bg font-black";
    if (value >= 0.8) return "bg-accent/30 text-accent font-black";
    if (value >= 0.7) return "bg-accent/20 text-accent font-bold";
    if (value >= 0.6) return "bg-accent/10 text-accent/80 font-medium";
    return "bg-muted-bg/30 text-muted-text/60";
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Structural Similarity Matrix"
        breadcrumb="Research / Structural similarity"
        description="Quantify structural relationships and scaffold novelties across the candidate library. Compare lead molecules against known drug space and detect applicability domain risks."
        actions={
          <ActionButtonGroup>
            <ActionButton label="Compare Selected" variant="outline" />
            <ActionButton label="Export Report" variant="secondary" />
            <ActionButton label="Ask Pharma LLM" variant="primary" />
          </ActionButtonGroup>
        }
      />

      {/* 2. Similarity Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Compared Candidates" value="24" helperText="Active comparison set" status="completed" />
        <MetricCard label="Nearest Neighbors" value="12" helperText="Tanimoto > 0.70" status="completed" />
        <MetricCard label="Novel Scaffolds" value="4" helperText="Low overlap with FDA" status="active" />
        <MetricCard label="Similarity Alerts" value="2" helperText="Potential IP conflict" status="warning" />
        <MetricCard label="Out-of-domain" value="1" helperText="Reliability warning" status="failed" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Main Area (3/4) */}
        <div className="lg:col-span-3 space-y-8">
          {/* 3. Query Molecule Panel */}
          <div className="ui-card-surface p-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 border-accent/20">
            <div className="space-y-4">
              <div className="aspect-square rounded-xl border border-dashed border-border/60 flex flex-col items-center justify-center text-[10px] font-black uppercase text-muted-text/40 tracking-widest text-center px-4 gap-3" style={{ background: "color-mix(in srgb, var(--muted-bg) 50%, transparent)" }}>
                <div className="w-16 h-16 rounded-full border-4 border-accent/10 border-t-accent/40 animate-[spin_4s_linear_infinite]" />
                Structure Renderer<br/>Active Manifold
              </div>
              <div className="flex flex-col items-center">
                <StatusBadge status="completed" label="In-Domain" size="sm" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-text tracking-tighter">QDF-EGFR-001</h3>
                  <p className="text-xs font-bold text-accent uppercase tracking-widest">Active Discovery Lead</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-text">SMILES</div>
                  <code className="text-[10px] bg-muted-bg px-2 py-1 rounded text-muted-text">CN(C)C/C=C/C(=O)NC1=CC2=C(C=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl</code>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-text uppercase">Scaffold Class</p>
                  <p className="text-xs font-black text-text">Quinazoline</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-text uppercase">Novelty Score</p>
                  <p className="text-xs font-black text-emerald-500">0.82 (High)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-text uppercase">Docking Score</p>
                  <p className="text-xs font-black text-text">-10.2 kcal/mol</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-text uppercase">Quantum Rank</p>
                  <p className="text-xs font-black text-accent">#1</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/20">
                <p className="text-[10px] font-bold text-muted-text/60 mb-2 uppercase tracking-widest">Target Context</p>
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1.5 rounded-lg bg-surface-subtle border border-border/40 text-[10px] font-black text-text">EGFR (P00533)</div>
                   <div className="px-3 py-1.5 rounded-lg bg-surface-subtle border border-border/40 text-[10px] font-black text-text">L858R / T790M Mutant</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Similarity Matrix */}
          <div className="space-y-4">
            <SectionHeader title="Structural Cross-Similarity Matrix" description="Heatmap of structural overlap (Tanimoto Coefficient) across discovery candidates and reference drugs." />
            <div className="ui-card-surface overflow-x-auto p-0">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-muted-bg/30 border-b border-border/40">
                    <th className="p-4 border-r border-border/40"></th>
                    {MATRIX_LABELS.map(label => (
                      <th key={label} className="p-4 font-black text-text-secondary text-center min-w-[100px]">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {SIMILARITY_MATRIX.map((row, i) => (
                    <tr key={i}>
                      <td className="p-4 font-black text-text-secondary bg-muted-bg/10 border-r border-border/40">{MATRIX_LABELS[i]}</td>
                      {row.map((val, j) => (
                        <td key={j} className={`p-4 text-center transition-all border-l border-border/10 ${getHeatmapColor(val)}`}>
                          {val.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Nearest Neighbor Table */}
          <div className="space-y-4">
            <SectionHeader title="Nearest Structural Neighbors" description="Prioritized list of structural relatives identified via fingerprint search." />
            <div className="ui-card-surface overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted-bg/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60 border-b border-border/40">
                    <th className="px-4 py-4">Molecule</th>
                    <th className="px-4 py-4">Type</th>
                    <th className="px-4 py-4 text-center">Similarity</th>
                    <th className="px-4 py-4">Scaffold</th>
                    <th className="px-4 py-4">Activity Profile</th>
                    <th className="px-4 py-4 text-center">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {NEIGHBORS.map(n => (
                    <tr key={n.id} className="group hover:bg-muted-bg/20 transition-colors">
                      <td className="px-4 py-4">
                        <div className="text-xs font-black text-text">{n.id}</div>
                        <div className="text-[9px] text-muted-text font-bold italic">{n.notes}</div>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-text-secondary">{n.type}</td>
                      <td className="px-4 py-4 text-center font-mono text-xs text-accent">{(n.similarity * 100).toFixed(0)}%</td>
                      <td className="px-4 py-4 text-xs font-bold text-text-secondary">{n.scaffold}</td>
                      <td className="px-4 py-4 text-xs font-medium text-text-secondary">{n.activity}</td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={n.risk.toLowerCase() as any} label={n.risk} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar (1/4) */}
        <div className="space-y-6">
          {/* 6. Scaffold Comparison Panel */}
          <div className="ui-card-surface p-5 space-y-5 border-accent/20">
            <h4 className="text-xs font-black uppercase tracking-widest text-accent">Scaffold Analysis</h4>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-surface-subtle border border-border/40">
                <p className="text-[9px] font-bold text-muted-text uppercase mb-1">Shared Framework</p>
                <p className="text-xs font-black text-text">Quinazoline core with 4-amino substitution</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">Unique Substituents</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent text-[9px] font-black">N-dimethylamino</span>
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent text-[9px] font-black">Fluorine-ortho</span>
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent text-[9px] font-black">Acrylamide warhead</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">Optimization Note</p>
                <p className="text-[11px] font-medium text-text-secondary leading-relaxed">
                  High pharmacophore overlap with Gefitinib at the hinge-binding region. The acrylamide moiety suggests irreversible covalent potential for mutant targets.
                </p>
              </div>
            </div>
          </div>

          {/* 7. Applicability Domain Panel */}
          <div className="ui-card-surface p-5 space-y-4 border-emerald-500/20 bg-emerald-500/[0.01]">
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Applicability Domain
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-text-secondary">Status</span>
                <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">In-Domain</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-text-secondary">Confidence</span>
                <span className="text-[11px] font-black text-text">94.2%</span>
              </div>
              <div className="pt-3 border-t border-border/20 space-y-2">
                <p className="text-[9px] font-bold text-muted-text uppercase">Recommendation</p>
                <p className="text-[11px] font-medium text-text-secondary">Reliable prediction. Structure resides within high-density training manifold.</p>
              </div>
            </div>
          </div>

          {/* 8. Actions */}
          <div className="flex flex-col gap-2">
            <button className="w-full py-3 rounded-lg bg-accent text-bg font-black uppercase tracking-[0.2em] text-[10px] hover:bg-accent/90 shadow-lg shadow-accent/10 transition-all">
              Generate Analogues
            </button>
            <button className="w-full py-3 rounded-lg border border-border text-text font-black uppercase tracking-[0.2em] text-[10px] hover:bg-muted-bg transition-all">
              Send to Docking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}