"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import ActionButtonGroup, { ActionButton } from "@/components/ui/ActionButtonGroup";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionHeader from "@/components/ui/SectionHeader";
import { apiClient } from "@/services";

// Mock data for ADMET results
const ADMET_RESULTS = [
  {
    candidate: "QDF-EGFR-001",
    overallRisk: "Low",
    herg: "Low",
    cyp3a4: "Low",
    cyp2d6: "Low",
    bbb: "High",
    clearance: "Med",
    hepatotox: "Low",
    lipinski: "Pass",
    status: "completed"
  },
  {
    candidate: "QDF-EGFR-014",
    overallRisk: "Medium",
    herg: "High",
    cyp3a4: "Low",
    cyp2d6: "Low",
    bbb: "Med",
    clearance: "Low",
    hepatotox: "Low",
    lipinski: "Pass",
    status: "completed"
  },
  {
    candidate: "QDF-EGFR-027",
    overallRisk: "High",
    herg: "Med",
    cyp3a4: "High",
    cyp2d6: "Low",
    bbb: "Low",
    clearance: "High",
    hepatotox: "Med",
    lipinski: "Fail",
    status: "completed"
  },
  {
    candidate: "QDF-EGFR-033",
    overallRisk: "Low",
    herg: "Low",
    cyp3a4: "Low",
    cyp2d6: "Low",
    bbb: "Low",
    clearance: "Low",
    hepatotox: "Low",
    lipinski: "Pass",
    status: "active"
  }
];

function ValidationPageContent() {
  const searchParams = useSearchParams();
  const panel = searchParams.get("panel");
  const isAdmetView = panel === "admet" || !panel; // Default to admet if no panel

  const [realAdmet, setRealAdmet] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<string>("MOCK DATA");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectId = localStorage.getItem("active_project_id");
        if (!projectId) return;
        
        const res = await apiClient.get<any>(`/projects/${projectId}/admet/results`);
        if (res.success && res.data && res.data.items && res.data.items.length > 0) {
          setRealAdmet(res.data.items);
          const hasImported = res.data.items.some((item: any) => item.source === "q_ai_drug" || item.import_id);
          setDataSource(hasImported ? "IMPORTED Q-AI-DRUG DATA" : "REAL BACKEND DATA");
        }
      } catch (err) {
        console.error("Failed to fetch ADMET results", err);
      }
    };
    fetchData();
  }, []);

  const displayAdmet = realAdmet.length > 0
    ? realAdmet.map((r: any) => {
        const rawTox = r.critical_risks || {};
        const hergVal = rawTox.herg_risk?.level || "low";
        const amesVal = rawTox.ames_toxicity_risk?.level || "low";
        const hepVal = rawTox.hepatotoxicity_risk?.level || "low";
        const cypVal = r.radar?.metabolism?.label || "low";
        const bbbVal = r.radar?.permeability?.label || "low";
        
        return {
          candidate: r.compound_id || "CAND-ADMET",
          overallRisk: r.overall_risk ? r.overall_risk.charAt(0).toUpperCase() + r.overall_risk.slice(1) : "Low",
          herg: hergVal.charAt(0).toUpperCase() + hergVal.slice(1),
          cyp3a4: cypVal.charAt(0).toUpperCase() + cypVal.slice(1),
          cyp2d6: "Low",
          bbb: bbbVal === "High" || bbbVal === "high" ? "High" : bbbVal === "medium" || bbbVal === "Medium" ? "Med" : "Low",
          clearance: "Med",
          hepatotox: hepVal.charAt(0).toUpperCase() + hepVal.slice(1),
          lipinski: r.lipinski_violations === 0 ? "Pass" : "Fail",
          status: "completed"
        };
      })
    : ADMET_RESULTS;

  const [selectedResult, setSelectedResult] = useState<any>(null);

  useEffect(() => {
    setSelectedResult(displayAdmet[0]);
  }, [realAdmet]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title={isAdmetView ? "ADMET & Toxicity Risk" : "Scientific Validation"}
        breadcrumb={isAdmetView ? "Oncology Research / ADMET Profiling" : "Oncology Research / Validation Audit"}
        description={isAdmetView 
          ? "Evaluate Absorption, Distribution, Metabolism, Excretion, and Toxicity profiles for top candidates. Inspect drug-likeness and toxicity endpoints."
          : "Audit computational workflows, benchmarking results, and reproducibility metrics for prioritized research leads."
        }
        actions={
          <ActionButtonGroup>
            <ActionButton label="Export Risk Report" variant="outline" />
            <ActionButton label="Compare Profiles" variant="secondary" />
            <ActionButton label="Ask Pharma LLM" variant="primary" />
          </ActionButtonGroup>
        }
      />

      {/* Dynamic Data Provenance Badge */}
      <div className="flex items-center gap-2 px-6 py-2 bg-muted-bg border border-border/20 rounded-lg max-w-max" data-testid="data-source-badge">
        <span className="text-[10px] font-bold text-muted-text/60 uppercase tracking-widest">Data Source:</span>
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
          dataSource === "IMPORTED Q-AI-DRUG DATA" ? "bg-emerald-500/20 text-emerald-400" :
          dataSource === "REAL BACKEND DATA" ? "bg-accent/20 text-accent" :
          "bg-warning/20 text-warning"
        }`}>
          {dataSource}
        </span>
      </div>

      {/* 2. ADMET Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <MetricCard label="Screened" value="150" helperText="Total candidates" status="completed" />
        <MetricCard label="Low Risk" value="45" helperText="Passed all gates" status="completed" />
        <MetricCard label="hERG Alerts" value="12" helperText="Cardiac risk" status="failed" />
        <MetricCard label="CYP Alerts" value="8" helperText="Metabolic risk" status="warning" />
        <MetricCard label="BBB Positive" value="18" helperText="CNS penetration" status="active" />
        <MetricCard label="Lipinski Pass" value="92%" helperText="Drug-likeness" status="completed" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Risk Table & Flags */}
        <div className="lg:col-span-2 space-y-8">
          {/* 3. ADMET Risk Table */}
          <div className="space-y-4">
            <SectionHeader title="ADMET Discovery Ledger" description="Comprehensive risk assessment across multiple physiological and toxicological endpoints." />
            <div className="ui-card-surface overflow-x-auto" data-testid="admet-toxicity-grid">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted-bg/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60 border-b border-border/40">
                    <th className="px-4 py-4">Candidate</th>
                    <th className="px-4 py-4 text-center">Risk</th>
                    <th className="px-4 py-4 text-center">hERG</th>
                    <th className="px-4 py-4 text-center">CYP3A4</th>
                    <th className="px-4 py-4 text-center">BBB</th>
                    <th className="px-4 py-4 text-center">Lipinski</th>
                    <th className="px-4 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {displayAdmet.map(res => (
                    <tr 
                      key={res.candidate} 
                      className={`group hover:bg-muted-bg/20 transition-colors cursor-pointer ${selectedResult && selectedResult.candidate === res.candidate ? 'bg-accent/[0.03]' : ''}`}
                      onClick={() => setSelectedResult(res)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-text group-hover:text-accent">{res.candidate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          res.overallRisk === 'Low' ? 'text-success' : res.overallRisk === 'Medium' ? 'text-warning' : 'text-error'
                        }`}>
                          {res.overallRisk}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black ${res.herg === 'High' ? 'text-error' : res.herg === 'Med' ? 'text-warning' : 'text-success'}`}>
                          {res.herg[0]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black ${res.cyp3a4 === 'High' ? 'text-error' : 'text-success'}`}>
                          {res.cyp3a4[0]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black ${res.bbb === 'High' ? 'text-accent' : 'text-muted-text/40'}`}>
                          {res.bbb === 'High' ? 'Y' : 'N'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black ${res.lipinski === 'Pass' ? 'text-success' : 'text-error'}`}>
                          {res.lipinski}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StatusBadge status={res.status as any} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7. Risk Flags */}
          <div className="space-y-4">
             <SectionHeader title="Priority Alerts" description="Heuristic-based warnings requiring immediate pharmacologist review." />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { type: "error", title: "hERG Risk Elevated", msg: "High probability of cardiotoxicity for QDF-EGFR-014.", cand: "QDF-EGFR-014" },
                  { type: "warning", title: "CYP3A4 Inhibition", msg: "Strong metabolic interference likely for QDF-EGFR-027.", cand: "QDF-EGFR-027" },
                  { type: "active", title: "BBB Penetration", msg: "Uncertain CNS partitioning detected for QDF-EGFR-088.", cand: "QDF-EGFR-088" },
                  { type: "warning", title: "Lipophilic Warning", msg: "High LogP (> 5.0) may lead to poor solubility and aggregation.", cand: "QDF-EGFR-045" }
                ].map((flag, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex gap-4 ${
                    flag.type === 'error' ? 'bg-error/5 border-error/20' : 
                    flag.type === 'warning' ? 'bg-warning/5 border-warning/20' : 
                    'bg-accent/5 border-accent/20'
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      <svg className={`w-5 h-5 ${
                        flag.type === 'error' ? 'text-error' : flag.type === 'warning' ? 'text-warning' : 'text-accent'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-widest text-text mb-0.5">{flag.title}</div>
                      <p className="text-[10px] text-muted-text leading-relaxed">{flag.msg}</p>
                      <span className="text-[9px] font-black text-accent mt-2 block">{flag.cand}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Deep Dive Panels */}
        {selectedResult && (
          <div className="space-y-6">
            {/* 4. Toxicity Endpoint Panel */}
            <div className="ui-card-surface p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 Toxicity Profiling: {selectedResult.candidate}
              </h4>
              <div className="space-y-3">
                 {[
                   { label: "hERG Inhibition", risk: selectedResult.herg, val: 12 },
                   { label: "Hepatotoxicity", risk: selectedResult.overallRisk === 'High' ? 'Med' : 'Low', val: 4 },
                   { label: "Mutagenicity (Ames)", risk: "Low", val: 1 },
                   { label: "Cardiotoxicity", risk: selectedResult.herg === 'High' ? 'High' : 'Low', val: 8 },
                   { label: "CYP Inhibition", risk: selectedResult.cyp3a4, val: 24 },
                   { label: "Skin Sensitization", risk: "Low", val: 2 }
                 ].map(tox => (
                   <div key={tox.label} className="flex items-center justify-between p-2 rounded bg-muted-bg/50 border border-border/20">
                      <span className="text-[10px] font-bold text-muted-text">{tox.label}</span>
                      <div className="flex items-center gap-3">
                         <div className="w-16 h-1 bg-border/20 rounded-full overflow-hidden">
                            <div className={`h-full ${tox.risk === 'High' ? 'bg-error' : tox.risk === 'Med' ? 'bg-warning' : 'bg-success'}`} style={{ width: `${tox.risk === 'High' ? 85 : tox.risk === 'Med' ? 45 : 15}%` }} />
                         </div>
                         <span className={`text-[9px] font-black uppercase ${tox.risk === 'High' ? 'text-error' : tox.risk === 'Med' ? 'text-warning' : 'text-success'}`}>
                            {tox.risk}
                         </span>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* 5. Drug-likeness Panel */}
            <div className="ui-card-surface p-5 space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-accent">Physicochemical Properties</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted-bg/50 border border-border/20">
                     <span className="text-[9px] font-bold text-muted-text/50 uppercase block mb-1">Lipinski Rule</span>
                     <span className={`text-xs font-black ${selectedResult.lipinski === 'Pass' ? 'text-success' : 'text-error'}`}>
                        {selectedResult.lipinski === 'Pass' ? 'COMPLIANT' : 'FAIL'}
                     </span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted-bg/50 border border-border/20">
                     <span className="text-[9px] font-bold text-muted-text/50 uppercase block mb-1">QED Score</span>
                     <span className="text-xs font-black text-text">0.742</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted-bg/50 border border-border/20">
                     <span className="text-[9px] font-bold text-muted-text/50 uppercase block mb-1">LogP (Octanol/W)</span>
                     <span className="text-xs font-black text-text">3.42</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted-bg/50 border border-border/20">
                     <span className="text-[9px] font-bold text-muted-text/50 uppercase block mb-1">TPSA (Å²)</span>
                     <span className="text-xs font-black text-text">84.5</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted-bg/50 border border-border/20">
                     <span className="text-[9px] font-bold text-muted-text/50 uppercase block mb-1">Molecular Weight</span>
                     <span className="text-xs font-black text-text">428.4</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted-bg/50 border border-border/20">
                     <span className="text-[9px] font-bold text-muted-text/50 uppercase block mb-1">Rotatable Bonds</span>
                     <span className="text-xs font-black text-text">6</span>
                  </div>
               </div>
            </div>

            {/* 6. Radar Chart Placeholder */}
            <div className="ui-card-surface p-5 space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-accent">ADMET Radar Profile</h4>
               <div className="aspect-square relative flex items-center justify-center">
                  {/* Mock Radar Chart SVG */}
                  <svg className="w-full h-full text-border/40" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                     <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                     <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                     <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                     
                     <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
                     <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" />
                     
                     {/* Data Polygon */}
                     <path 
                       d="M50 15 L80 50 L50 85 L20 50 Z" 
                       fill="var(--accent-alpha)" 
                       stroke="var(--accent)" 
                       strokeWidth="1.5"
                       className="opacity-40"
                     />

                     {/* Labels */}
                     <text x="50" y="8" textAnchor="middle" className="text-[5px] font-black fill-muted-text/60">ABSORPTION</text>
                     <text x="92" y="52" textAnchor="start" className="text-[5px] font-black fill-muted-text/60">DISTRIBUTION</text>
                     <text x="50" y="96" textAnchor="middle" className="text-[5px] font-black fill-muted-text/60">METABOLISM</text>
                     <text x="8" y="52" textAnchor="end" className="text-[5px] font-black fill-muted-text/60">EXCRETION</text>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="text-center">
                        <div className="text-[10px] font-black text-text">ADMET-Q Score</div>
                        <div className="text-lg font-black text-accent">0.86</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Next Actions */}
            <div className="flex flex-col gap-2">
              <button className="w-full py-3 rounded-lg bg-accent text-bg font-black uppercase tracking-[0.2em] text-[10px] hover:bg-accent/90 shadow-lg shadow-accent/10 transition-all">
                Send Safe Leads to Docking
              </button>
              <button className="w-full py-3 rounded-lg border border-border text-text font-black uppercase tracking-[0.2em] text-[10px] hover:bg-muted-bg transition-all">
                Initiate Liver-on-a-Chip Sim
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ValidationPage() {
  return (
    <Suspense fallback={<div>Loading Validation...</div>}>
      <ValidationPageContent />
    </Suspense>
  );
}
