"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import ActionButtonGroup, { ActionButton } from "@/components/ui/ActionButtonGroup";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionHeader from "@/components/ui/SectionHeader";

// Mock data for candidate molecules
const CANDIDATES = [
  {
    id: "QDF-EGFR-001",
    target: "EGFR WT",
    smiles: "Cc1cc(C)c(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc1nccc(-c2cccnc2)n1",
    dockingScore: -10.2,
    admetRisk: "Low",
    novelty: 0.85,
    qed: 0.72,
    logp: 3.2,
    saScore: 2.1,
    quantumRank: 1,
    status: "completed"
  },
  {
    id: "QDF-EGFR-014",
    target: "EGFR L858R",
    smiles: "CN(C)CC(=O)Nc1cc2c(Nc3ccc(F)c(Cl)c3)ncnc2cc1OCCCN1CCOCC1",
    dockingScore: -9.8,
    admetRisk: "Low",
    novelty: 0.78,
    qed: 0.68,
    logp: 2.8,
    saScore: 2.5,
    quantumRank: 14,
    status: "completed"
  },
  {
    id: "QDF-EGFR-027",
    target: "EGFR T790M",
    smiles: "COc1cc2ncnc(Nc3ccc(Cl)c(Cl)c3)c2cc1OCCCN1CCOCC1",
    dockingScore: -9.5,
    admetRisk: "Medium",
    novelty: 0.65,
    qed: 0.62,
    logp: 3.5,
    saScore: 2.8,
    quantumRank: 27,
    status: "completed"
  },
  {
    id: "QDF-EGFR-033",
    target: "EGFR Exon19Del",
    smiles: "CS(=O)(=O)CCNCNc1c(F)ccc2oc(Nc3ccc(OCc4cccc(F)c4)c(Cl)c3)nc12",
    dockingScore: -9.2,
    admetRisk: "Low",
    novelty: 0.92,
    qed: 0.81,
    logp: 2.5,
    saScore: 2.0,
    quantumRank: 33,
    status: "active"
  },
  {
    id: "QDF-EGFR-045",
    target: "EGFR WT",
    smiles: "CC(C)Oc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN1CCOCC1",
    dockingScore: -8.9,
    admetRisk: "High",
    novelty: 0.55,
    qed: 0.58,
    logp: 4.1,
    saScore: 3.2,
    quantumRank: 45,
    status: "completed"
  }
];

const CLUSTERS = [
  { name: "quinazoline-like", count: 450, avgScore: -9.1, risk: "Low" },
  { name: "pyrimidine-like", count: 320, avgScore: -8.8, risk: "Medium" },
  { name: "indazole-like", count: 210, avgScore: -8.5, risk: "Low" },
  { name: "macrocycle-like", count: 120, avgScore: -8.2, risk: "High" }
];

export default function MoleculesPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Molecular Library"
        breadcrumb="Oncology Research / Candidates"
        description="Explore, filter, and prioritize generated candidate molecules. Analyze ADMET profiles, docking scores, and quantum reranking results."
        actions={
          <ActionButtonGroup>
            <ActionButton label="Export CSV" variant="outline" />
            <ActionButton label="Batch Docking" variant="secondary" />
            <ActionButton label="Generate More" variant="primary" />
          </ActionButtonGroup>
        }
      />

      {/* 2. Molecule Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Generated" value="15,000" helperText="Total molecules" status="completed" />
        <MetricCard label="Filtered" value="1,500" helperText="Passed basic filters" status="active" />
        <MetricCard label="Selected" value="300" helperText="Docking candidates" status="completed" />
        <MetricCard label="Novel Scaffolds" value="42" helperText="Unique clusters" status="completed" />
        <MetricCard label="ADMET Warnings" value="12" helperText="Requires review" status="warning" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Left Sidebar: Filters & Clusters */}
        <div className="space-y-6 lg:col-span-1">
          {/* 3. Filters and Search */}
          <div className="ui-card-surface p-5 space-y-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Quick Filters
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-text/60">Search ID / SMILES</label>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. QDF-EGFR-001" 
                  className="w-full bg-muted-bg border border-border/40 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-accent/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-text/60">Docking Status</label>
                <select className="w-full bg-muted-bg border border-border/40 rounded-lg px-3 py-2 text-xs text-text outline-none appearance-none cursor-pointer">
                  <option>All Statuses</option>
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Pending</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-text/60">ADMET Risk</label>
                <div className="flex flex-wrap gap-2">
                  {['Low', 'Medium', 'High'].map(risk => (
                    <button key={risk} className="px-2 py-1 rounded border border-border/40 text-[10px] font-bold hover:bg-muted-bg transition-all">
                      {risk}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-text/60">Novelty Score (min)</label>
                <input type="range" min="0" max="100" className="w-full h-1.5 bg-border/30 rounded-full appearance-none cursor-pointer accent-accent" />
                <div className="flex justify-between text-[9px] font-bold text-muted-text/40">
                  <span>0.0</span>
                  <span>1.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Scaffold Cluster Panel */}
          <div className="ui-card-surface p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Scaffold Clusters
            </h4>
            <div className="space-y-2">
              {CLUSTERS.map(cluster => (
                <div key={cluster.name} className="p-3 rounded-lg bg-muted-bg/50 border border-border/20 group hover:border-accent/30 cursor-pointer transition-all">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-black text-text">{cluster.name}</span>
                    <span className="text-[10px] font-black text-accent">{cluster.count}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                    <span className="text-muted-text/50">Avg Dock: {cluster.avgScore}</span>
                    <span className={cluster.risk === 'Low' ? 'text-success' : cluster.risk === 'Medium' ? 'text-warning' : 'text-error'}>
                      Risk: {cluster.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* 4. Candidate Molecule Cards (Top Picks) */}
          <div className="space-y-4">
            <SectionHeader title="Top Candidates" description="Priority leads identified by hybrid quantum-classical scoring." />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {CANDIDATES.slice(0, 4).map(mol => (
                <div 
                  key={mol.id} 
                  className={`ui-card-surface group p-5 transition-all hover:shadow-xl relative ${
                    selectedIds.includes(mol.id) ? "border-accent ring-1 ring-accent/20" : "hover:border-accent/30"
                  }`}
                >
                  <div className="absolute top-4 right-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(mol.id)}
                      onChange={() => toggleSelection(mol.id)}
                      className="w-4 h-4 rounded border-border/40 text-accent focus:ring-accent accent-accent cursor-pointer"
                    />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-lg bg-white/5 border border-border/40 flex items-center justify-center p-2 shrink-0">
                      {/* Simple 2D Molecule Placeholder */}
                      <div className="w-full h-full relative opacity-40 group-hover:opacity-80 transition-opacity">
                         <svg viewBox="0 0 100 100" className="w-full h-full text-text/40">
                           <path d="M50 20 L80 40 L80 70 L50 90 L20 70 L20 40 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                           <circle cx="50" cy="20" r="4" fill="currentColor" />
                           <circle cx="80" cy="40" r="4" fill="currentColor" />
                           <path d="M50 20 L50 5" stroke="currentColor" strokeWidth="2" />
                           <text x="45" y="15" className="text-[12px] font-bold">N</text>
                         </svg>
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest">{mol.id}</span>
                        <StatusBadge status={mol.status as any} size="sm" />
                      </div>
                      <h3 className="text-sm font-black text-text mb-1">{mol.target}</h3>
                      <p className="font-mono text-[9px] text-muted-text/60 truncate mb-4">{mol.smiles}</p>
                      
                      <div className="grid grid-cols-2 gap-y-3 gap-x-6 border-t border-border/20 pt-3">
                         <div className="flex flex-col">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-muted-text/40">Docking Score</span>
                           <span className="font-mono text-xs font-black text-text">{mol.dockingScore}</span>
                         </div>
                         <div className="flex flex-col">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-muted-text/40">ADMET Risk</span>
                           <span className={`text-[10px] font-black ${
                             mol.admetRisk === 'Low' ? 'text-success' : mol.admetRisk === 'Medium' ? 'text-warning' : 'text-error'
                           }`}>
                             {mol.admetRisk.toUpperCase()}
                           </span>
                         </div>
                         <div className="flex flex-col">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-muted-text/40">Novelty</span>
                           <span className="font-mono text-xs font-black text-text">{(mol.novelty * 100).toFixed(0)}%</span>
                         </div>
                         <div className="flex flex-col">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-muted-text/40">QED</span>
                           <span className="font-mono text-xs font-black text-accent">{mol.qed}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Candidate Table */}
          <div className="space-y-4">
            <SectionHeader title="Discovery Ledger" description="Full catalog of filtered candidates with comprehensive ADMET and Quantum metrics." />
            <div className="ui-card-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted-bg/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60 border-b border-border/40">
                      <th className="px-4 py-4">Candidate</th>
                      <th className="px-4 py-4">Target</th>
                      <th className="px-4 py-4 text-center">Docking</th>
                      <th className="px-4 py-4 text-center">ADMET</th>
                      <th className="px-4 py-4 text-center">QED</th>
                      <th className="px-4 py-4 text-center">LogP</th>
                      <th className="px-4 py-4 text-center">SA</th>
                      <th className="px-4 py-4 text-center">Novelty</th>
                      <th className="px-4 py-4 text-center text-accent">Q-Rank</th>
                      <th className="px-4 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {CANDIDATES.map(mol => (
                      <tr 
                        key={mol.id} 
                        className={`group hover:bg-muted-bg/20 transition-colors cursor-pointer ${selectedIds.includes(mol.id) ? 'bg-accent/[0.03]' : ''}`}
                        onClick={() => toggleSelection(mol.id)}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-bold text-text group-hover:text-accent transition-colors">
                          {mol.id}
                        </td>
                        <td className="px-4 py-3 text-[11px] font-bold text-muted-text">{mol.target}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-text">{mol.dockingScore}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-black ${
                             mol.admetRisk === 'Low' ? 'text-success' : mol.admetRisk === 'Medium' ? 'text-warning' : 'text-error'
                           }`}>
                             {mol.admetRisk[0]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-[11px] font-bold text-text">{mol.qed}</td>
                        <td className="px-4 py-3 text-center text-[11px] font-bold text-muted-text">{mol.logp}</td>
                        <td className="px-4 py-3 text-center text-[11px] font-bold text-muted-text">{mol.saScore}</td>
                        <td className="px-4 py-3 text-center text-[11px] font-bold text-muted-text">{mol.novelty}</td>
                        <td className="px-4 py-3 text-center font-black text-xs text-accent">#{mol.quantumRank}</td>
                        <td className="px-4 py-3 text-right">
                          <StatusBadge status={mol.status as any} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Comparison Tray / Selected Candidates */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="ui-card-surface bg-card/95 backdrop-blur-xl border-accent/30 shadow-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
             <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Selected</span>
                  <span className="text-sm font-black text-text">{selectedIds.length} Candidates</span>
                </div>
                <div className="flex -space-x-2 overflow-hidden">
                  {selectedIds.map(id => (
                    <div key={id} className="h-8 w-8 rounded-full border-2 border-card bg-muted-bg flex items-center justify-center text-[8px] font-black text-accent" title={id}>
                      {id.split('-').pop()}
                    </div>
                  ))}
                </div>
             </div>

             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedIds([])}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-text hover:text-text transition-all"
                >
                  Clear
                </button>
                <div className="h-8 w-px bg-border/40 mx-2" />
                <ActionButtonGroup>
                  <ActionButton label="Compare" variant="secondary" />
                  <ActionButton label="Send to Docking" variant="secondary" />
                  <ActionButton label="ADMET Profiling" variant="secondary" />
                  <ActionButton label="Ask Pharma LLM" variant="primary" />
                </ActionButtonGroup>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
