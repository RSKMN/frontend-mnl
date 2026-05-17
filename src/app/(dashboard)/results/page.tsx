"use client";

import React, { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import { Card, CardContent } from "@/components/ui/Card";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { 
  ValidationSummary, 
  ArtifactCompleteness, 
  ValidationWarnings 
} from "@/components/dashboard/validation";

const SUMMARY_METRICS = [
  { label: "Total Reports", value: "245", icon: "📄" },
  { label: "Candidate Dossiers", value: "12", status: "completed" as StatusType },
  { label: "Validation Reports", value: "48", status: "completed" as StatusType },
  { label: "Exported Artifacts", value: "1.2k", icon: "📦" },
  { label: "Pending Exports", value: "4", status: "running" as StatusType },
  { label: "Reports with Warnings", value: "3", status: "warning" as StatusType },
];

const FEATURED_DOSSIERS = [
  { id: "DOS-001", name: "QDF-EGFR-001 Candidate Dossier", type: "Candidate Dossier", project: "EGFR Discovery", date: "May 16, 2026", status: "completed" as StatusType, confidence: "0.94", formats: ["PDF", "SDF", "CSV"], warnings: 0 },
  { id: "DOS-014", name: "QDF-EGFR-014 ADMET Risk Dossier", type: "ADMET Risk Report", project: "EGFR Discovery", date: "May 15, 2026", status: "completed" as StatusType, confidence: "0.88", formats: ["PDF"], warnings: 1 },
  { id: "REP-442", name: "EGFR Docking Summary", type: "Docking Summary", project: "EGFR Discovery", date: "May 14, 2026", status: "completed" as StatusType, confidence: "0.92", formats: ["PDF", "PDB"], warnings: 0 },
  { id: "REP-QML", name: "Quantum Reranking Report", type: "Quantum Reranking", project: "EGFR Discovery", date: "May 14, 2026", status: "completed" as StatusType, confidence: "0.96", formats: ["PDF", "CSV"], warnings: 0 },
];

const REPORTS = [
  { name: "Candidate Dossier: QDF-001", type: "Candidate Dossier", project: "EGFR NSCLC", status: "completed" as StatusType, confidence: "0.94", artifacts: "12", format: "PDF/SDF", generated: "2h ago", owner: "Sarah Chen" },
  { name: "GNINA Rescoring: Batch-042", type: "GNINA Report", project: "EGFR NSCLC", status: "completed" as StatusType, confidence: "0.91", artifacts: "5", format: "SDF/CSV", generated: "5h ago", owner: "AutoPilot" },
  { name: "ADMET Global Triage", type: "ADMET Risk Report", project: "EGFR NSCLC", status: "warning" as StatusType, confidence: "0.84", artifacts: "3", format: "PDF", generated: "Yesterday", owner: "Sarah Chen" },
  { name: "Quantum Reranking Summary", type: "Quantum Reranking", project: "EGFR NSCLC", status: "completed" as StatusType, confidence: "0.96", artifacts: "8", format: "CSV", generated: "Yesterday", owner: "AutoPilot" },
  { name: "Binding Affinity Validation", type: "Validation Manifest", project: "EGFR NSCLC", status: "completed" as StatusType, confidence: "0.98", artifacts: "2", format: "JSON", generated: "2d ago", owner: "David Kim" },
  { name: "Lead Series Recommendation", type: "Wet-lab Recommendation", project: "EGFR NSCLC", status: "pending" as StatusType, confidence: "---", artifacts: "0", format: "PDF", generated: "Queued", owner: "Sarah Chen" },
];

const ARTIFACTS = [
  { name: "egfr_rescored_poses.sdf", type: "SDF", size: "24.2 MB", experiment: "EXP-992", status: "verified" },
  { name: "affinity_scores_v2.csv", type: "CSV", size: "1.2 MB", experiment: "EXP-992", status: "verified" },
  { name: "egfr_receptor_refined.pdb", type: "PDB", size: "4.1 MB", experiment: "EXP-993", status: "verified" },
  { name: "run_execution.log", type: "LOG", size: "850 KB", experiment: "EXP-994", status: "verified" },
  { name: "validation_manifest.json", type: "MANIFEST", size: "12 KB", experiment: "EXP-995", status: "verified" },
];

const EXPORT_QUEUE = [
  { name: "PDF Generation: QDF-001", status: "running" as StatusType, progress: 65 },
  { name: "SDF Library Export", status: "queued" as StatusType, progress: 0 },
  { name: "CSV Metadata Packaging", status: "completed" as StatusType, progress: 100 },
  { name: "Validation Manifest", status: "failed" as StatusType, progress: 12 },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader 
        title="Reports & Artifacts"
        breadcrumb="Research / Results"
        description="Access and manage high-fidelity scientific dossiers, docking reports, and multi-format discovery artifacts."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest">Export CSV/SDF</Button>
            <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest">Create PDF Report</Button>
            <Button size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest px-6">Generate Dossier</Button>
          </div>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {SUMMARY_METRICS.map((metric, i) => (
          <MetricCard key={i} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="flex flex-col gap-8">
          {/* Featured Dossiers */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-text/60">Featured Candidate Dossiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURED_DOSSIERS.map((dossier) => (
                <div key={dossier.id} className="ui-card-surface p-5 border-accent/10 relative overflow-hidden group hover:bg-accent/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">{dossier.type}</span>
                      <h4 className="text-sm font-bold text-text group-hover:text-accent transition-colors">{dossier.name}</h4>
                    </div>
                    <StatusBadge status={dossier.status} size="sm" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-text/60 font-medium">Confidence Score</span>
                      <span className="font-mono font-bold text-accent">{dossier.confidence}</span>
                    </div>
                    
                    {/* Embedded Validation */}
                    <div className="pt-2 border-t border-border/10">
                      <ValidationSummary 
                        confidence={parseFloat(dossier.confidence) * 100} 
                        reproducibility={94} 
                        completeness={dossier.warnings > 0 ? 85 : 100} 
                        benchmark={88} 
                      />
                    </div>

                    <div className="pt-2 border-t border-border/10">
                      <ArtifactCompleteness />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/10">
                      <span className="text-muted-text/60 font-medium">Generated</span>
                      <span className="font-bold text-text/70">{dossier.date}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                       {dossier.formats.map(fmt => (
                         <span key={fmt} className="px-1.5 py-0.5 rounded bg-muted-bg/40 border border-border/40 text-[9px] font-black uppercase text-muted-text/60">{fmt}</span>
                       ))}
                    </div>
                  </div>
                  {dossier.warnings > 0 && (
                    <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-warning/10 rounded-bl-xl">
                      <svg className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reports Table */}
          <Card 
            header={
              <div className="flex items-center justify-between w-full">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text/80">Report Registry</h3>
                <div className="flex items-center gap-3">
                   <input 
                    type="text" 
                    placeholder="Search reports..." 
                    className="h-8 w-48 rounded-lg border border-border/40 bg-muted-bg/20 px-3 text-[10px] font-bold outline-none focus:border-accent transition-colors"
                   />
                   <select className="h-8 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-muted-text/60 focus:ring-0 cursor-pointer">
                    <option>All Types</option>
                    <option>Dossiers</option>
                    <option>ADMET</option>
                    <option>Quantum</option>
                  </select>
                </div>
              </div>
            }
            contentClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/40 bg-muted-bg/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60">
                    <th className="px-6 py-4">Report Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Confidence</th>
                    <th className="px-6 py-4">Validation</th>
                    <th className="px-6 py-4">Artifacts</th>
                    <th className="px-6 py-4">Format</th>
                    <th className="px-6 py-4 text-right">Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {REPORTS.map((report, i) => (
                    <tr key={i} className="group hover:bg-muted-bg/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-text/80 group-hover:text-accent transition-colors">{report.name}</span>
                          <span className="text-[9px] font-medium text-muted-text/40">{report.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={report.status} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-accent">{report.confidence}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="w-12 h-1 bg-muted-bg/30 rounded-full overflow-hidden">
                              <div className="h-full bg-success" style={{ width: `${parseFloat(report.confidence) * 100}%` }} />
                           </div>
                           <span className="text-[10px] font-bold text-success">Pass</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold text-text/70">{report.artifacts} files</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-text/40">{report.format}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[11px] text-muted-text/60 uppercase font-bold">{report.generated}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Side Panels */}
        <div className="flex flex-col gap-6">
          {/* Artifact Library */}
          <Card header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Artifact Library</h3>}>
            <div className="space-y-3">
              {ARTIFACTS.map((artifact, i) => (
                <div key={i} className="group flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted-bg/10 hover:border-accent/40 hover:bg-accent/5 transition-all">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-text truncate pr-2">{artifact.name}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">{artifact.type} | {artifact.size}</span>
                  </div>
                  <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-card border border-border/40 group-hover:border-accent/40 text-muted-text/60 group-hover:text-accent transition-all">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Export Queue */}
          <Card header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Export Queue</h3>}>
            <div className="space-y-4">
              {EXPORT_QUEUE.map((job, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text/80 truncate pr-2">{job.name}</span>
                    <StatusBadge status={job.status} size="sm" />
                  </div>
                  <div className="h-1 w-full bg-muted-bg/30 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${job.status === 'running' ? 'bg-accent animate-pulse' : job.status === 'failed' ? 'bg-error' : 'bg-success'}`} 
                      style={{ width: `${job.progress}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Assistant Prompt */}
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
             <div className="flex items-center gap-2 mb-3">
                <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-accent">Pharma LLM Assistance</span>
             </div>
             <p className="text-[11px] text-muted-text/80 leading-relaxed mb-4">
                Need a summary of the latest candidate dossiers or an interpretation of ADMET risk profiles?
             </p>
             <Button variant="outline" size="sm" className="w-full h-8 text-[9px] font-black uppercase tracking-widest">Ask Assistant</Button>
          </div>
        </div>
      </div>
    </div>
  );
}