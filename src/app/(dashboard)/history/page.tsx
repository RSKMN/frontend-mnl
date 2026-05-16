"use client";

import React, { useState, useEffect } from "react";
import { 
  PageHeader, 
  ActionButtonGroup, 
  ActionButton, 
  ExperimentTable, 
  SectionHeader,
  EmptyState,
  TableSkeleton
} from "@/components/ui";
import { getRecentRuns } from "@/services/api";
import type { RecentRun } from "@/types/api";
import { toFriendlyErrorMessage } from "@/services/api";

export default function ExperimentsPage() {
  const [runs, setRuns] = useState<RecentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    getRecentRuns(50)
      .then(data => {
        if (active) {
          setRuns(data.items || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          setError(toFriendlyErrorMessage(err, "Failed to load experiment history."));
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, []);

  const MOCK_EXPERIMENTS = [
    { name: "EGFR_HTS_Run_042", type: "Virtual Screening", status: "completed" as const, runtime: "4h 12m", owner: "Sarah Chen", updatedAt: "2h ago" },
    { name: "L858R_Quantum_Refinement", type: "QM/MM", status: "running" as const, runtime: "12h 45m", owner: "David Kim", updatedAt: "Just now" },
    { name: "Covalent_Docking_T790M", type: "Docking", status: "completed" as const, runtime: "8h 20m", owner: "Sarah Chen", updatedAt: "5h ago" },
    { name: "ADMET_Batch_Oncology_01", type: "Validation", status: "failed" as const, runtime: "0h 05m", owner: "System", updatedAt: "1h ago" },
    { name: "GNINA_Rescoring_Main", type: "Rescoring", status: "running" as const, runtime: "2h 30m", owner: "AutoPilot", updatedAt: "10m ago" },
    { name: "Kinase_Selectivity_Panel_A", type: "Screening", status: "completed" as const, runtime: "1h 15m", owner: "Sarah Chen", updatedAt: "1d ago" },
    { name: "HER2_Mutation_Library", type: "Library Gen", status: "queued" as const, runtime: "-", owner: "David Kim", updatedAt: "2d ago" },
  ];

  const displayExperiments = runs.length > 0 ? runs.map(r => ({
    name: r.protein || "Unnamed Run",
    type: "Pipeline Run",
    status: (r.status.toLowerCase() === 'completed' ? 'completed' : r.status.toLowerCase() === 'failed' ? 'failed' : 'running') as any,
    runtime: "---",
    owner: "Sarah Chen",
    updatedAt: new Date(r.created_at).toLocaleDateString()
  })) : MOCK_EXPERIMENTS;

  return (
    <div className="page-shell ui-fade-in flex flex-col gap-8 pb-10">
      <PageHeader 
        title="Experiment History"
        breadcrumb="Research / Experiments"
        description="Comprehensive audit log of all computational experiments, molecular simulations, and pipeline executions."
        actions={
          <ActionButtonGroup>
            <ActionButton label="Export CSV" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>} />
            <ActionButton label="Refresh" onClick={() => window.location.reload()} icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
            <ActionButton label="New Experiment" variant="primary" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>} />
          </ActionButtonGroup>
        }
      />

      <section className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionHeader 
            title="All Research Runs" 
            description="Track execution status and inspect scientific context across all projects."
          />
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-muted-text/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search experiments..." 
                className="h-10 rounded-lg border border-border/40 bg-card pl-10 pr-4 text-xs font-medium focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
            </div>
            <select className="h-10 rounded-lg border border-border/40 bg-card px-3 text-xs font-bold text-text focus:border-accent focus:outline-none">
              <option>All Types</option>
              <option>Virtual Screening</option>
              <option>QM/MM</option>
              <option>Docking</option>
            </select>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} />
        ) : error ? (
          <EmptyState 
            title="System Synchronization Issue"
            description={error}
            action={<ActionButton label="Retry Connection" variant="primary" onClick={() => window.location.reload()} />}
          />
        ) : displayExperiments.length === 0 ? (
          <EmptyState 
            title="No Experiments Found"
            description="Start a new pipeline run in the workspace to see it appear in your history."
            action={<ActionButton label="Go to Workspace" variant="primary" onClick={() => window.location.href='/workspace'} />}
          />
        ) : (
          <ExperimentTable experiments={displayExperiments} />
        )}
      </section>
    </div>
  );
}
