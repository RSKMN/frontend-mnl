"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import ActionButtonGroup, { ActionButton } from "@/components/ui/ActionButtonGroup";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionHeader from "@/components/ui/SectionHeader";
import ThreeDMoleculeViewer from "@/components/molecules/ThreeDMoleculeViewer";

// Mock data for the EGFR discovery program
const POSES = [
  { id: "Pose 01", affinity: -10.2, cnnScore: 0.942, rmsd: 1.2, status: "completed" },
  { id: "Pose 02", affinity: -9.8, cnnScore: 0.885, rmsd: 0.8, status: "completed" },
  { id: "Pose 03", affinity: -9.5, cnnScore: 0.810, rmsd: 1.5, status: "completed" },
];

const RESIDUES = [
  { name: "MET793", type: "H-Bond", distance: "2.8Å", confidence: 98 },
  { name: "LYS745", type: "Salt Bridge", distance: "3.2Å", confidence: 95 },
  { name: "ASP855", type: "Hydrophobic", distance: "3.8Å", confidence: 92 },
  { name: "THR790", type: "Gatekeeper", distance: "4.2Å", confidence: 99 },
  { name: "GLY719", type: "Hydrophobic", distance: "3.5Å", confidence: 90 },
];

const INTERACTIONS = [
  { label: "Hydrogen Bonds", count: 4, color: "bg-cyan-500" },
  { label: "Hydrophobic Contacts", count: 12, color: "bg-emerald-500" },
  { label: "Pi-Stacking", count: 2, color: "bg-indigo-500" },
  { label: "Salt Bridges", count: 1, color: "bg-amber-500" },
];

export default function VisualizationPage() {
  const [selectedPose, setSelectedPose] = useState(POSES[0]);
  const [activeTab, setActiveTab] = useState("interactions");

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Structural Discovery Workbench"
        breadcrumb="Research / 3D structural discovery"
        description="Immersive 3D molecular inspection of protein-ligand complexes. Analyze binding pocket residues, docking pose overlays, and residue-level interaction networks."
        actions={
          <ActionButtonGroup>
            <ActionButton label="Export View" variant="outline" />
            <ActionButton label="Compare Poses" variant="secondary" />
            <ActionButton label="Ask Pharma LLM" variant="primary" />
          </ActionButtonGroup>
        }
      />

      {/* 2. Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Complex Stability" value="High" helperText="RMSD < 1.5Å" status="completed" />
        <MetricCard label="Best Affinity" value="-10.2" unit="kcal/mol" helperText="Pose 01" status="completed" />
        <MetricCard label="CNN Confidence" value="0.94" helperText="GNINA Rescore" status="active" />
        <MetricCard label="H-Bonds" value="4" helperText="Active network" status="completed" />
        <MetricCard label="Pocket Fit" value="Optimal" helperText="Surface complementarity" status="completed" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Left Column: Viewer Workspace & Details */}
        <div className="lg:col-span-3 space-y-8">
          {/* 2. Viewer Workspace */}
          <div className="ui-card-surface overflow-hidden relative group h-[700px]">
            <ThreeDMoleculeViewer 
              title="EGFR AlphaFold + QDF-EGFR-001"
              subtitle="Pose 01: GNINA Rescored Structure"
              className="h-full border-0 shadow-none"
            />
            
            {/* Overlay Info */}
            <div className="absolute top-20 left-6 z-20 pointer-events-none">
              <div className="p-4 rounded-xl border space-y-3 shadow-xl backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--card) 60%, transparent)", borderColor: "var(--border)" }}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-accent/80 tracking-widest">Active Pose</span>
                  <span className="text-sm font-black text-white">{selectedPose.id}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-text/60">Affinity</span>
                  <span className="text-sm font-black text-emerald-500">{selectedPose.affinity} kcal/mol</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* 5. Residue Inspector */}
            <div className="space-y-4">
              <SectionHeader title="Residue Inspector" description="Key binding site contacts and interaction energies." />
              <div className="space-y-3">
                {RESIDUES.map(res => (
                  <div key={res.name} className="ui-card-surface p-4 flex items-center justify-between group hover:border-accent/40 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted-bg flex items-center justify-center font-black text-xs text-accent">
                        {res.name}
                      </div>
                      <div>
                        <div className="text-xs font-black text-text">{res.type}</div>
                        <div className="text-[10px] text-muted-text">Distance: {res.distance}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-accent">{res.confidence}%</div>
                      <div className="text-[9px] font-bold text-muted-text uppercase">Conf.</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Pose List */}
            <div className="space-y-4">
              <SectionHeader title="Available Poses" description="Select structural poses for detailed interaction analysis." />
              <div className="ui-card-surface overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted-bg/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60 border-b border-border/40">
                      <th className="px-4 py-4">Pose</th>
                      <th className="px-4 py-4 text-center">Affinity</th>
                      <th className="px-4 py-4 text-center">CNN</th>
                      <th className="px-4 py-4 text-center">RMSD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {POSES.map(pose => (
                      <tr 
                        key={pose.id} 
                        className={`group hover:bg-muted-bg/20 transition-colors cursor-pointer ${selectedPose.id === pose.id ? 'bg-accent/[0.03]' : ''}`}
                        onClick={() => setSelectedPose(pose)}
                      >
                        <td className="px-4 py-3 text-xs font-black text-text group-hover:text-accent">{pose.id}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-emerald-500">{pose.affinity}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-text">{pose.cnnScore}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-muted-text">{pose.rmsd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="w-full py-3 rounded-lg border border-dashed border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-text hover:text-text hover:border-accent/40 transition-all">
                Load More Poses
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Selectors & Controls */}
        <div className="space-y-6">
          {/* 3. Structure / Ligand Selector */}
          <div className="ui-card-surface p-5 space-y-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Structure Config
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-text/60">Protein Structure</label>
                <select className="w-full bg-muted-bg border border-border/40 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-accent/50 transition-all font-bold">
                  <option>EGFR AlphaFold (P00533)</option>
                  <option>EGFR Crystal (PDB: 1M17)</option>
                  <option>EGFR Cryo-EM (PDB: 6V66)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-text/60">Ligand Candidate</label>
                <select className="w-full bg-muted-bg border border-border/40 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-accent/50 transition-all font-bold">
                  <option>QDF-EGFR-001</option>
                  <option>QDF-EGFR-014</option>
                  <option>QDF-EGFR-027</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-text/60">Binding Pocket</label>
                <select className="w-full bg-muted-bg border border-border/40 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-accent/50 transition-all font-bold">
                  <option>ATP-binding pocket</option>
                  <option>Allosteric site (C-helix)</option>
                  <option>Extracellular domain IV</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Overlay Controls */}
          <div className="ui-card-surface p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              View Layers
            </h4>
            <div className="space-y-2.5">
              {[
                { label: "Protein Surface", checked: false },
                { label: "Cartoon Representation", checked: true },
                { label: "Ligand Sticks", checked: true },
                { label: "Hydrogen Bonds", checked: true },
                { label: "Hydrophobic Contacts", checked: false },
                { label: "Pi-Stacking", checked: false },
                { label: "Pocket Residues", checked: true },
                { label: "Electrostatic Surface", checked: false },
              ].map(layer => (
                <label key={layer.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted-bg/50 cursor-pointer transition-all">
                  <span className="text-[11px] font-bold text-text-secondary">{layer.label}</span>
                  <input type="checkbox" defaultChecked={layer.checked} className="w-3.5 h-3.5 rounded border-border/40 text-accent focus:ring-accent accent-accent" />
                </label>
              ))}
            </div>
          </div>

          {/* 7. Interaction Summary */}
          <div className="ui-card-surface p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-accent">Interaction Network</h4>
            <div className="space-y-4">
              {INTERACTIONS.map(int => (
                <div key={int.label} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-text/60">
                    <span>{int.label}</span>
                    <span className="text-text">{int.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                    <div className={`h-full ${int.color}`} style={{ width: `${(int.count / 15) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Viewer Actions */}
          <div className="flex flex-col gap-2">
            <button className="w-full py-3 rounded-lg bg-accent text-bg font-black uppercase tracking-[0.2em] text-[10px] hover:bg-accent/90 shadow-lg shadow-accent/10 transition-all">
              Initiate MD Refinement
            </button>
            <button className="w-full py-3 rounded-lg border border-border text-text font-black uppercase tracking-[0.2em] text-[10px] hover:bg-muted-bg transition-all">
              Compare with Benchmark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}