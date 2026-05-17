"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import ActionButtonGroup, { ActionButton } from "@/components/ui/ActionButtonGroup";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionHeader from "@/components/ui/SectionHeader";

const EmbeddingPlot = dynamic(() => import("@/components/embeddings/EmbeddingPlot"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex flex-col items-center justify-center rounded-2xl border animate-pulse bg-muted-bg/30 border-border/20">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="mt-4 text-xs font-black uppercase tracking-widest text-muted-text/50">Loading Chemical Space Manifold...</span>
    </div>
  ),
});
import type { EmbeddingPoint } from "@/types/api";

// Mock data for Chemical Space topography
const MOCK_POINTS: EmbeddingPoint[] = [
  // QDF-EGFR-001 (The Hero)
  { x: 12.5, y: -8.2, molecule_id: "QDF-EGFR-001", dataset: "Generated", qed: 0.85, mw: 421.4, logp: 3.82, source: "generated" },
  // FDA Drugs (Clusters of green)
  ...Array.from({ length: 50 }).map((_, i) => ({
    x: -15 + Math.random() * 10,
    y: 10 + Math.random() * 10,
    molecule_id: `FDA-${100 + i}`,
    dataset: "FDA",
    qed: 0.7 + Math.random() * 0.2,
    mw: 300 + Math.random() * 200,
    logp: 2 + Math.random() * 2,
    source: "fda" as const
  })),
  // Screening Hits (Clusters of amber)
  ...Array.from({ length: 150 }).map((_, i) => ({
    x: 5 + Math.random() * 20,
    y: 5 + Math.random() * 15,
    molecule_id: `HIT-${500 + i}`,
    dataset: "Screening",
    qed: 0.5 + Math.random() * 0.3,
    mw: 350 + Math.random() * 150,
    logp: 1 + Math.random() * 4,
    source: "dataset" as const
  })),
  // Generated Candidates (Clusters of indigo)
  ...Array.from({ length: 300 }).map((_, i) => ({
    x: 10 + Math.random() * 15,
    y: -15 + Math.random() * 20,
    molecule_id: `GEN-${800 + i}`,
    dataset: "Generated",
    qed: 0.6 + Math.random() * 0.3,
    mw: 400 + Math.random() * 100,
    logp: 3 + Math.random() * 2,
    source: "generated" as const
  })),
  // Out-of-domain (Scattered gray)
  ...Array.from({ length: 40 }).map((_, i) => ({
    x: -25 + Math.random() * 10,
    y: -20 + Math.random() * 15,
    molecule_id: `OOD-${i}`,
    dataset: "OOD",
    qed: 0.3 + Math.random() * 0.2,
    mw: 500 + Math.random() * 300,
    logp: 5 + Math.random() * 3,
    source: "dataset" as const
  })),
];

const CLUSTERS = [
  { name: "quinazoline-like", count: 450, avgScore: -9.2, novelty: "High", color: "bg-indigo-500" },
  { name: "pyrimidine-like", count: 320, avgScore: -8.8, novelty: "Medium", color: "bg-cyan-500" },
  { name: "indazole-like", count: 210, avgScore: -8.5, novelty: "High", color: "bg-emerald-500" },
  { name: "macrocycle-like", count: 120, avgScore: -8.2, novelty: "Extreme", color: "bg-amber-500" },
  { name: "approved-drug-like", count: 73, avgScore: -7.5, novelty: "Low", color: "bg-success" },
  { name: "out-of-domain", count: 18, avgScore: -6.4, novelty: "N/A", color: "bg-muted-text/30" },
];

const SCAFFOLDS = [
  { name: "N-phenylquinazolin-4-amine", count: 124, avgDocking: -9.4, risk: "Low", novelty: 0.45 },
  { name: "pyrido[2,3-d]pyrimidine", count: 86, avgDocking: -8.9, risk: "Low", novelty: 0.72 },
  { name: "1H-indazol-3-amine", count: 62, avgDocking: -8.6, risk: "Medium", novelty: 0.81 },
  { name: "macrocyclic peptide mimic", count: 34, avgDocking: -8.1, risk: "Low", novelty: 0.94 },
];

const PROPERTIES = [
  { label: "Molecular Weight", val: "421.4", unit: "g/mol", dist: [20, 40, 80, 100, 60, 30] },
  { label: "LogP (Lipophilicity)", val: "3.82", unit: "o/w", dist: [10, 30, 70, 90, 80, 40] },
  { label: "TPSA", val: "84.5", unit: "Å²", dist: [40, 60, 90, 70, 40, 20] },
  { label: "QED (Drug-likeness)", val: "0.85", unit: "score", dist: [5, 15, 45, 95, 75, 25] },
  { label: "SA Score", val: "2.1", unit: "score", dist: [80, 90, 60, 40, 20, 10] },
];

export default function ChemicalSpacePage() {
  const [selectedPoint, setSelectedPoint] = useState<EmbeddingPoint>(MOCK_POINTS[0]);
  const [colorMode, setColorMode] = useState<"dataset" | "qed">("dataset");

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Chemical Space Topography"
        breadcrumb="Research / Spatial intelligence"
        description="Navigate the multidimensional landscape of molecular embeddings. Identify scaffold clusters, analyze diversity gradients, and detect novel regions relative to known pharmaceutical space."
        actions={
          <ActionButtonGroup>
            <ActionButton label="Highlight Top Candidates" variant="outline" />
            <ActionButton label="Export Embedding" variant="secondary" />
            <ActionButton label="Ask Pharma LLM" variant="primary" />
          </ActionButtonGroup>
        }
      />

      {/* 2. Chemical Space Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Embedded Molecules" value="1,500" helperText="Total active manifold" status="completed" />
        <MetricCard label="Scaffold Clusters" value="42" helperText="Unique structural types" status="completed" />
        <MetricCard label="Novel Region Leads" value="186" helperText="Low similarity to FDA" status="active" />
        <MetricCard label="Approved Neighbors" value="73" helperText="Similar to known drugs" status="completed" />
        <MetricCard label="Applicability Alerts" value="18" helperText="Out-of-domain detections" status="warning" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Main Content Area (3/4) */}
        <div className="lg:col-span-3 space-y-8">
          {/* 3. Embedding Visualization Panel */}
          <div className="h-[600px] relative">
            <EmbeddingPlot 
              data={MOCK_POINTS} 
              colorMode={colorMode} 
              onPointClick={(p) => setSelectedPoint(p)} 
            />
            
            {/* View Controls Overlay */}
            <div className="absolute top-20 right-6 z-20 flex flex-col gap-2">
              <button 
                onClick={() => setColorMode("dataset")}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                  colorMode === 'dataset' ? 'bg-primary text-white border-primary shadow-lg' : 'backdrop-blur-md border-border/40 text-text-secondary'
                }`}
                style={{ background: colorMode === 'dataset' ? "" : "color-mix(in srgb, var(--card) 80%, transparent)" }}
              >
                Color by Source
              </button>
              <button 
                onClick={() => setColorMode("qed")}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                  colorMode === 'qed' ? 'bg-primary text-white border-primary shadow-lg' : 'backdrop-blur-md border-border/40 text-text-secondary'
                }`}
                style={{ background: colorMode === 'qed' ? "" : "color-mix(in srgb, var(--card) 80%, transparent)" }}
              >
                Color by QED
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* 6. Scaffold Distribution */}
            <div className="space-y-4">
              <SectionHeader title="Scaffold Distribution" description="Primary structural frameworks and their average performance metrics." />
              <div className="space-y-3">
                {SCAFFOLDS.map(scaffold => (
                  <div key={scaffold.name} className="ui-card-surface p-4 flex items-center justify-between group hover:border-accent/40 transition-all cursor-pointer">
                    <div className="min-w-0">
                      <div className="text-[11px] font-black text-text truncate uppercase tracking-tight">{scaffold.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-muted-text">Count: {scaffold.count}</span>
                        <span className="text-[10px] font-bold text-emerald-500">Avg: {scaffold.avgDocking}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-black text-accent">{(scaffold.novelty * 100).toFixed(0)}%</div>
                      <div className="text-[9px] font-bold text-muted-text uppercase">Novelty</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Property Distribution */}
            <div className="space-y-4">
              <SectionHeader title="Property Gradients" description="Distribution of physicochemical properties across the embedded space." />
              <div className="space-y-4">
                {PROPERTIES.map(prop => (
                  <div key={prop.label} className="ui-card-surface p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{prop.label}</span>
                      <span className="text-[10px] font-black text-primary">{prop.val} <span className="text-[8px] text-muted-text/50">{prop.unit}</span></span>
                    </div>
                    <div className="h-6 flex items-end gap-1">
                      {prop.dist.map((v, i) => (
                        <div key={i} className="flex-1 bg-primary/10 rounded-t-[1px]" style={{ height: `${v}%` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (1/4) */}
        <div className="space-y-6">
          {/* 5. Candidate Highlight Panel */}
          <div className="ui-card-surface p-5 space-y-5 border-accent/30 bg-accent/[0.02]">
            <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Candidate Focus
            </h4>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-xl font-black text-text tracking-tighter">{selectedPoint.molecule_id}</span>
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-[0.2em]">{selectedPoint.dataset} Manifold</span>
              </div>

              <div className="grid grid-cols-1 gap-y-3 pt-4 border-t border-border/20">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-muted-text">Cluster</span>
                  <span className="text-[11px] font-black text-text">quinazoline-like</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-muted-text">Nearest FDA</span>
                  <span className="text-[11px] font-black text-accent italic">Gefitinib (0.78 sim)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-muted-text">Novelty Score</span>
                  <span className="text-[11px] font-black text-emerald-500">0.86</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-muted-text">App. Domain</span>
                  <span className="text-[11px] font-black text-text">Inside (High Conf)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-muted-text">Quantum Rank</span>
                  <span className="text-[11px] font-black text-accent">#1</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/40 shadow-sm space-y-2" style={{ background: "var(--card)" }}>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-text/60">ADMET Risk</span>
                    <span className="text-success">Low</span>
                 </div>
                 <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: '15%' }} />
                 </div>
              </div>
            </div>
          </div>

          {/* 4. Cluster Legend */}
          <div className="ui-card-surface p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary/60">Manifold Clusters</h4>
            <div className="space-y-2">
              {CLUSTERS.map(cluster => (
                <div key={cluster.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted-bg/50 cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${cluster.color}`} />
                    <span className="text-[11px] font-bold text-text truncate">{cluster.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-muted-text/50">{cluster.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Actions */}
          <div className="flex flex-col gap-2">
            <button className="w-full py-3 rounded-lg bg-accent text-bg font-black uppercase tracking-[0.2em] text-[10px] hover:bg-accent/90 shadow-lg shadow-accent/10 transition-all">
              Filter Novel Regions
            </button>
            <button className="w-full py-3 rounded-lg border border-border text-text font-black uppercase tracking-[0.2em] text-[10px] hover:bg-muted-bg transition-all">
              Compare Scaffolds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
