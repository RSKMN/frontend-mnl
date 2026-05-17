"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import { Card, CardContent } from "@/components/ui/Card";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

const SUMMARY_METRICS = [
  { label: "Total Experiments", value: "128", icon: "📊" },
  { label: "Running Jobs", value: "6", status: "running" as StatusType },
  { label: "Queued Jobs", value: "14", status: "pending" as StatusType },
  { label: "Completed Runs", value: "102", status: "completed" as StatusType },
  { label: "Failed Runs", value: "6", status: "failed" as StatusType },
  { label: "Reproducible Runs", value: "91", status: "completed" as StatusType, helperText: "92% integrity" },
];

const ACTIVE_JOBS = [
  { id: "J-042", name: "GNINA rescoring batch", status: "running" as StatusType, progress: 64, queue: "-", runtime: "1h 12m", compute: "H100 x 8", owner: "Sarah Chen" },
  { id: "J-043", name: "Quantum reranking batch", status: "pending" as StatusType, progress: 0, queue: "1", runtime: "-", compute: "QPU-Cluster", owner: "AutoPilot" },
  { id: "J-044", name: "ADMET screening", status: "running" as StatusType, progress: 88, queue: "-", runtime: "0h 45m", compute: "CPU Optimized", owner: "Sarah Chen" },
  { id: "J-045", name: "MD stability simulation", status: "pending" as StatusType, progress: 0, queue: "3", runtime: "-", compute: "GPU Cluster", owner: "David Kim" },
];

const EXPERIMENTS = [
  { id: "EXP-992", name: "EGFR_L858R_VirtualScreen_v4", type: "Docking", status: "completed" as StatusType, progress: 100, runtime: "14h 22m", compute: "GPU Cluster", owner: "Sarah Chen", artifacts: "124 MB", repro: true, updated: "2h ago" },
  { id: "EXP-993", name: "T790M_Covalent_Rescoring", type: "GNINA Rescoring", status: "running" as StatusType, progress: 64, runtime: "1h 12m", compute: "H100 x 8", owner: "Sarah Chen", artifacts: "24 MB", repro: true, updated: "Active" },
  { id: "EXP-994", name: "Quantum_Reranking_Batch_A", type: "Quantum Reranking", status: "pending" as StatusType, progress: 0, runtime: "-", compute: "QPU-Cluster", owner: "AutoPilot", artifacts: "-", repro: false, updated: "Queued" },
  { id: "EXP-995", name: "ADMET_Global_Triage_Onc", type: "ADMET Screening", status: "completed" as StatusType, progress: 100, runtime: "2h 45m", compute: "CPU optimized", owner: "Sarah Chen", artifacts: "2.1 GB", repro: true, updated: "5h ago" },
  { id: "EXP-996", name: "EGFR_Complex_Stability_100ns", type: "Simulation", status: "failed" as StatusType, progress: 12, runtime: "0h 45m", compute: "GPU Cluster", owner: "David Kim", artifacts: "112 MB", repro: true, updated: "Yesterday" },
  { id: "EXP-997", name: "Lead_Optimization_Gen_Batch", type: "Molecule Generation", status: "completed" as StatusType, progress: 100, runtime: "8h 12m", compute: "H100 x 4", owner: "Sarah Chen", artifacts: "450 MB", repro: true, updated: "2d ago" },
];

const TIMELINE = [
  { time: "10:42 AM", event: "Dataset validated", status: "completed" },
  { time: "11:05 AM", event: "Docking started", status: "running" },
  { time: "12:14 PM", event: "GNINA completed", status: "completed" },
  { time: "01:22 PM", event: "Quantum reranking queued", status: "pending" },
  { time: "01:45 PM", event: "Validation warning raised", status: "warning" },
  { time: "02:10 PM", event: "Report generated", status: "completed" },
];

export default function ExperimentsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader 
        title="Experiments" 
        breadcrumb="Research / Experiments"
        description="Comprehensive orchestration and execution tracking for high-performance drug discovery pipelines."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest">Rerun Selected</Button>
            <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest">View Logs</Button>
            <Button size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest px-6">New Experiment</Button>
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
          {/* Active / Queued Jobs */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-text/60">Active / Queued Jobs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACTIVE_JOBS.map((job) => (
                <div key={job.id} className="ui-card-surface p-5 border-accent/10 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">{job.id}</span>
                      <h4 className="text-sm font-bold text-text group-hover:text-accent transition-colors">{job.name}</h4>
                    </div>
                    <StatusBadge status={job.status} size="sm" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-text/60 uppercase font-black tracking-widest">Progress</span>
                      <span className="font-mono font-bold text-text">{job.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted-bg/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${job.status === 'running' ? 'bg-accent animate-pulse' : 'bg-muted-text/20'}`} 
                        style={{ width: `${job.progress}%` }} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">Compute</span>
                        <span className="text-[11px] font-bold text-text/70">{job.compute}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">Runtime</span>
                        <span className="text-[11px] font-mono font-bold text-text/70">{job.runtime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experiments Table */}
          <Card 
            header={
              <div className="flex items-center justify-between w-full">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text/80">Experiment Audit Log</h3>
                <div className="flex items-center gap-3">
                   <input 
                    type="text" 
                    placeholder="Search ID/Name..." 
                    className="h-8 w-48 rounded-lg border border-border/40 bg-muted-bg/20 px-3 text-[10px] font-bold outline-none focus:border-accent transition-colors"
                   />
                   <select className="h-8 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-muted-text/60 focus:ring-0 cursor-pointer">
                    <option>All Status</option>
                    <option>Completed</option>
                    <option>Running</option>
                    <option>Failed</option>
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
                    <th className="px-6 py-4">Experiment ID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Workflow</th>
                    <th className="px-6 py-4">Runtime</th>
                    <th className="px-6 py-4">Artifacts</th>
                    <th className="px-6 py-4 text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {EXPERIMENTS.map((exp) => (
                    <tr key={exp.id} className="group hover:bg-muted-bg/20 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/experiments/${exp.id.toLowerCase()}`} className="flex flex-col">
                          <span className="text-xs font-bold text-text/80 group-hover:text-accent transition-colors">{exp.name}</span>
                          <span className="text-[9px] font-medium text-muted-text/40">{exp.id}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={exp.status} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-muted-text/70 uppercase tracking-wider">{exp.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[11px] text-muted-text">{exp.runtime}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-text/70">{exp.artifacts}</span>
                          {exp.repro && (
                            <svg className="h-3 w-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[11px] text-muted-text/60 uppercase font-bold">{exp.updated}</span>
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
          {/* Execution Timeline */}
          <Card header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Execution Timeline</h3>}>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border/40">
              {TIMELINE.map((item, i) => (
                <div key={i} className="relative pl-8">
                  <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-card ${
                    item.status === 'completed' ? 'bg-success' : 
                    item.status === 'running' ? 'bg-accent animate-pulse' : 
                    item.status === 'warning' ? 'bg-warning' : 'bg-muted-bg'
                  }`} />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">{item.time}</span>
                    <span className="text-xs font-bold text-text/80">{item.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Logs Preview */}
          <Card 
            header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Recent Logs</h3>}
            contentClassName="bg-black/90 p-4 rounded-xl"
          >
            <div className="font-mono text-[10px] space-y-1.5 text-success/80">
              <p><span className="text-muted-text/40">[02:10:04]</span> [GNINA] Loaded receptor EGFR_AF2.pdb</p>
              <p><span className="text-muted-text/40">[02:10:12]</span> [GNINA] Scored 300 ligand poses</p>
              <p><span className="text-muted-text/40">[02:11:45]</span> [QML] Quantum reranking queued for 24 candidates</p>
              <p><span className="text-muted-text/40">[02:12:01]</span> <span className="text-warning">[WARN]</span> ADMET descriptor 'LogP' exceeds range for 2 mols</p>
              <p className="animate-pulse text-accent"><span className="text-muted-text/40">[02:14:22]</span> [SYS] Synchronizing artifacts to S3 cluster...</p>
            </div>
          </Card>

          {/* Reproducibility Summary */}
          <Card header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Reproducibility</h3>}>
            <div className="space-y-3">
              {[
                { label: "Environment Captured", val: "v24.2-LTS" },
                { label: "Seed Recorded", val: "0x4A2F8" },
                { label: "Input Hash", val: "sha256:d8a1..." },
                { label: "Artifact Manifest", val: "Verified" },
                { label: "Container Image", val: "qdf-runtime:1.2" },
                { label: "Versioned Model", val: "ADMET-v3.1" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-text/60 uppercase">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-text/70">{item.val}</span>
                    <svg className="h-3 w-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
