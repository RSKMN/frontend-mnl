"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import ActionButtonGroup, { ActionButton } from "@/components/ui/ActionButtonGroup";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionHeader from "@/components/ui/SectionHeader";

// --- DOCKING DATA ---
const DOCKING_RESULTS = [
  { candidate: "QDF-EGFR-001", engine: "AutoDock Vina", affinity: -10.2, rmsd: 1.2, pocket: "ATP-Binding", status: "completed" },
  { candidate: "QDF-EGFR-014", engine: "AutoDock Vina", affinity: -9.8, rmsd: 0.8, pocket: "ATP-Binding", status: "completed" },
  { candidate: "QDF-EGFR-027", engine: "Smina", affinity: -9.5, rmsd: 1.5, pocket: "ATP-Binding", status: "completed" },
  { candidate: "QDF-EGFR-033", engine: "AutoDock Vina", affinity: -9.2, rmsd: 2.1, pocket: "Allosteric", status: "running" }
];

const QUEUE_JOBS = [
  { id: "JOB-7721", name: "Vina global docking", candidate: "QDF-EGFR-088", status: "running", progress: 65 },
  { id: "JOB-7722", name: "Smina minimization", candidate: "QDF-EGFR-042", status: "queued", progress: 0 },
  { id: "JOB-7723", name: "Pose extraction", candidate: "QDF-EGFR-011", status: "completed", progress: 100 },
  { id: "JOB-7724", name: "Interaction fingerprinting", candidate: "QDF-EGFR-009", status: "warning", progress: 85 }
];

// --- GNINA DATA ---
const GNINA_RESULTS = [
  { candidate: "QDF-EGFR-001", cnnAffinity: -11.2, cnnPoseScore: 0.942, vinaAffinity: -10.2, confidence: "High", artifact: "pose_1.sdf", status: "completed" },
  { candidate: "QDF-EGFR-014", cnnAffinity: -10.5, cnnPoseScore: 0.885, vinaAffinity: -9.8, confidence: "High", artifact: "pose_1.sdf", status: "completed" },
  { candidate: "QDF-EGFR-027", cnnAffinity: -9.9, cnnPoseScore: 0.810, vinaAffinity: -9.5, confidence: "Medium", artifact: "pose_2.sdf", status: "completed" },
  { candidate: "QDF-EGFR-033", cnnAffinity: -9.4, cnnPoseScore: 0.750, vinaAffinity: -9.2, confidence: "Low", artifact: "pose_3.sdf", status: "running" }
];

const GNINA_LOGS = [
  "[GNINA] Initializing CNN model: cross-docked_default2018",
  "[GNINA] Loading receptor: EGFR_P00533_prepared.pdbqt",
  "[GNINA] Loading ligand: QDF-EGFR-001.sdf",
  "[GNINA] Setting up scoring grid (box_size: 20, 20, 20)",
  "[GNINA] Starting CNN rescoring for 20 Vina poses...",
  "[GNINA] Pose #1: CNN affinity = -11.2, CNN score = 0.942",
  "[GNINA] Pose #2: CNN affinity = -10.8, CNN score = 0.895",
  "[GNINA] Writing results to QDF-EGFR-001_gnina_output.sdf",
  "[GNINA] Finalizing run. Process complete."
];

function DockingWorkspaceContent() {
  const searchParams = useSearchParams();
  const engine = searchParams.get("engine");
  const isGnina = engine === "gnina";

  const [selectedResult, setSelectedResult] = useState(isGnina ? GNINA_RESULTS[0] : DOCKING_RESULTS[0]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title={isGnina ? "GNINA CNN Rescoring" : "Docking Workspace"}
        breadcrumb={isGnina ? "Oncology Research / CNN Scoring" : "Oncology Research / Molecular Docking"}
        description={isGnina 
          ? "Apply Deep Learning CNN scoring to refine docking poses and improve binding affinity predictions."
          : "Configure binding pockets, execute docking simulations, and analyze ligand-protein interaction affinities."
        }
        actions={
          <ActionButtonGroup>
            <ActionButton label={isGnina ? "Export SDF" : "Export Poses"} variant="outline" />
            <ActionButton label={isGnina ? "CNN Config" : "Pocket Setup"} variant="secondary" />
            <ActionButton label={isGnina ? "Run Rescoring" : "New Simulation"} variant="primary" />
          </ActionButtonGroup>
        }
      />

      {/* 2. Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {isGnina ? (
          <>
            <MetricCard label="CNN Scored" value="214" helperText="Candidates processed" status="completed" />
            <MetricCard label="Best CNN Affinity" value="-11.2" unit="kcal/mol" helperText="QDF-EGFR-001" status="completed" />
            <MetricCard label="Pose Confidence" value="85" unit="%" helperText="High fidelity poses" status="active" />
            <MetricCard label="Artifacts" value="428" helperText="SDF/Log files" status="completed" />
            <MetricCard label="Failed Runs" value="2" helperText="Resource timeout" status="failed" />
          </>
        ) : (
          <>
            <MetricCard label="Selected" value="300" helperText="Awaiting docking" status="completed" />
            <MetricCard label="Completed" value="214" helperText="Successfully docked" status="completed" />
            <MetricCard label="Best Affinity" value="-10.8" unit="kcal/mol" helperText="QDF-EGFR-005" status="active" />
            <MetricCard label="Active Jobs" value="6" helperText="Parallel threads" status="running" />
            <MetricCard label="Pose Artifacts" value="642" helperText="PDB/SDF files" status="completed" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {isGnina ? (
            /* GNINA: CNN Rescoring Table */
            <div className="space-y-4">
              <SectionHeader title="CNN Rescoring Results" description="Refined affinity predictions using deep learning convolutional neural networks." />
              <div className="ui-card-surface overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted-bg/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60 border-b border-border/40">
                      <th className="px-4 py-4">Candidate</th>
                      <th className="px-4 py-4 text-center">CNN Affinity</th>
                      <th className="px-4 py-4 text-center">CNN Score</th>
                      <th className="px-4 py-4 text-center">Vina Aff.</th>
                      <th className="px-4 py-4 text-center">Confidence</th>
                      <th className="px-4 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {GNINA_RESULTS.map(res => (
                      <tr key={res.candidate} className="group hover:bg-muted-bg/20 transition-colors cursor-pointer" onClick={() => setSelectedResult(res as any)}>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-text">{res.candidate}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs font-black text-accent">{res.cnnAffinity}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-text">{res.cnnPoseScore}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-muted-text">{res.vinaAffinity}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-black uppercase ${
                            res.confidence === 'High' ? 'text-success' : res.confidence === 'Medium' ? 'text-warning' : 'text-error'
                          }`}>
                            {res.confidence}
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
          ) : (
            /* DOCKING: Active Queue & Results */
            <>
              <div className="ui-card-surface p-5 space-y-4">
                <SectionHeader title="Active Docking Queue" description="Live job tracking for ongoing molecular simulations." />
                <div className="space-y-3">
                  {QUEUE_JOBS.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted-bg/50 border border-border/20">
                      <div className="flex items-center gap-4">
                        <div className={`h-2 w-2 rounded-full ${
                          job.status === 'running' ? 'bg-accent animate-pulse' :
                          job.status === 'completed' ? 'bg-success' :
                          job.status === 'warning' ? 'bg-warning' : 'bg-muted-text/30'
                        }`} />
                        <div>
                          <div className="text-xs font-bold text-text">{job.name}</div>
                          <div className="text-[10px] text-muted-text">Candidate: {job.candidate}</div>
                        </div>
                      </div>
                      <StatusBadge status={job.status as any} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <SectionHeader title="Affinity Results" description="Comparative analysis of ligand binding affinities." />
                <div className="ui-card-surface overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted-bg/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60 border-b border-border/40">
                        <th className="px-4 py-4">Candidate</th>
                        <th className="px-4 py-4">Engine</th>
                        <th className="px-4 py-4 text-center">Affinity</th>
                        <th className="px-4 py-4 text-center">RMSD</th>
                        <th className="px-4 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {DOCKING_RESULTS.map(res => (
                        <tr key={res.candidate} className="group hover:bg-muted-bg/20 transition-colors cursor-pointer" onClick={() => setSelectedResult(res)}>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-text">{res.candidate}</td>
                          <td className="px-4 py-3 text-[11px] font-bold text-muted-text">{res.engine}</td>
                          <td className="px-4 py-3 text-center font-mono text-xs font-black text-emerald-500">{res.affinity}</td>
                          <td className="px-4 py-3 text-center font-mono text-xs text-text">{res.rmsd}</td>
                          <td className="px-4 py-3 text-right">
                            <StatusBadge status={res.status as any} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {isGnina ? (
            /* GNINA: Confidence & Logs */
            <>
              <div className="ui-card-surface p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Pose Confidence
                </h4>
                <div className="space-y-4">
                   <div className="p-4 rounded-xl border border-success/20 bg-success/[0.02] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-text">CNN High Confidence</span>
                        <span className="text-xs font-black text-success">0.942</span>
                      </div>
                      <p className="text-[10px] text-muted-text">Structural features highly consistent with training distribution.</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted-bg/50 border border-border/20">
                        <span className="text-[9px] font-bold text-muted-text uppercase block mb-1">Atom Pairs</span>
                        <span className="text-xs font-black text-text">1,420</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted-bg/50 border border-border/20">
                        <span className="text-[9px] font-bold text-muted-text uppercase block mb-1">Grid Points</span>
                        <span className="text-xs font-black text-text">8,000</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="ui-card-surface p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-accent">Artifact Browser</h4>
                <div className="space-y-2">
                  {["QDF-EGFR-001_poses.sdf", "gnina_rescoring.log", "receptor_prepared.pdbqt", "ligand_minimized.sdf"].map(file => (
                    <div key={file} className="flex items-center gap-3 p-2 rounded hover:bg-muted-bg/50 cursor-pointer group">
                      <svg className="w-4 h-4 text-muted-text group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      <span className="text-[10px] font-mono text-text truncate">{file}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ui-card-surface p-5 space-y-4 bg-slate-950">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-text/50">Live Rescoring Logs</h4>
                <div className="font-mono text-[10px] text-text-secondary/70 h-48 overflow-y-auto space-y-1 scrollbar-thin">
                   {GNINA_LOGS.map((log, i) => (
                     <div key={i} className={log.includes("affinity") ? "text-accent" : ""}>{log}</div>
                   ))}
                </div>
              </div>
            </>
          ) : (
            /* DOCKING: Poses & Fingerprints */
            <>
              <div className="ui-card-surface p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-accent">Top Poses Analysis</h4>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 rounded-lg border border-border/40 bg-muted-bg/20 flex justify-between items-center group hover:border-accent/40 cursor-pointer transition-all">
                      <span className="text-xs font-black text-text">Pose #{i}</span>
                      <span className="font-mono text-xs font-black text-emerald-500">-{10.5 - i * 0.4} kcal/mol</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ui-card-surface p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-accent">Interaction Types</h4>
                <div className="space-y-3">
                  {[{l:"H-bond",v:85,c:"bg-cyan-500"},{l:"Hydrophobic",v:92,c:"bg-emerald-500"},{l:"Pi-Stacking",v:34,c:"bg-indigo-500"}].map(t => (
                    <div key={t.l} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-muted-text/60">{t.l}</span>
                        <span className="text-text">{t.v}%</span>
                      </div>
                      <div className="h-1 w-full bg-border/20 rounded-full overflow-hidden"><div className={`h-full ${t.c}`} style={{ width: `${t.v}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ui-card-surface p-5 space-y-4 bg-accent/[0.02] border-accent/20">
                <h4 className="text-xs font-black uppercase tracking-widest text-accent">Binding Pocket</h4>
                <div className="space-y-2 text-[10px] font-bold">
                  <div className="flex justify-between text-muted-text"><span>Active Site</span><span className="text-text">ATP-Binding</span></div>
                  <div className="flex justify-between text-muted-text"><span>Box Center</span><span className="text-text font-mono">12.4, -4.2, 18.9</span></div>
                  <button className="w-full mt-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-accent border border-accent/20 rounded">Edit Pocket</button>
                </div>
              </div>
            </>
          )}

          {/* Bottom Actions */}
          <div className="flex flex-col gap-2">
            <button className="w-full py-3 rounded-lg bg-accent text-bg font-black uppercase tracking-[0.2em] text-[10px] hover:bg-accent/90 shadow-lg shadow-accent/10 transition-all">
              {isGnina ? "Export CNN Scores" : "Initiate GNINA Rescoring"}
            </button>
            <button className="w-full py-3 rounded-lg border border-border text-text font-black uppercase tracking-[0.2em] text-[10px] hover:bg-muted-bg transition-all">
              {isGnina ? "View Lead Candidates" : "Optimize Poses (Smina)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DockingWorkspace() {
  return (
    <Suspense fallback={<div>Loading docking workspace...</div>}>
      <DockingWorkspaceContent />
    </Suspense>
  );
}
