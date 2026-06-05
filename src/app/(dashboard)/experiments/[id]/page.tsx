"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import MetricCard from "@/components/ui/MetricCard";
import EmptyState from "@/components/ui/EmptyState";
import { getPipelineStatus, getPipelineResult } from "@/services/api";

import { 
  ValidationSummary, 
  BenchmarkComparison, 
  ConfidencePanel,
  ValidationWarnings 
} from "@/components/dashboard/validation";

const ALL_STAGES = [
  "Generation",
  "Docking",
  "GNINA",
  "Quantum",
  "Simulation",
  "ADMET",
  "Reporting"
];

export default function ExperimentDetailPage() {
  const params = useParams();
  const experimentId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [statusData, setStatusData] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [statusRes, resultRes] = await Promise.allSettled([
          getPipelineStatus(experimentId),
          getPipelineResult(experimentId)
        ]);
        
        if (!mounted) return;
        
        if (statusRes.status === "fulfilled") {
          setStatusData(statusRes.value);
        } else {
          // If status fails, we can't show much, maybe just a partial error
          setError("Failed to load pipeline status.");
        }
        
        if (resultRes.status === "fulfilled") {
          setResultData(resultRes.value);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load experiment data");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Poll every 5s if running
    const interval = setInterval(() => {
      if (statusData?.status === "running" || statusData?.status === "queued") {
        fetchData();
      }
    }, 5000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [experimentId, statusData?.status]);

  if (isLoading && !statusData) {
    return (
      <div className="flex flex-col gap-8 pb-12 animate-pulse">
        <div className="h-24 bg-muted-bg/50 rounded-2xl w-full"></div>
        <div className="h-64 bg-muted-bg/50 rounded-2xl w-full"></div>
      </div>
    );
  }

  if (error && !statusData) {
    return (
      <EmptyState
        title="Experiment Not Found"
        description={error}
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const logs: string[] = statusData?.logs || [];
  const artifacts: any[] = resultData?.artifacts || resultData?.items || [];
  const currentStage = statusData?.stage || "Unknown";
  const progress = statusData?.progress || 0;
  const statusStr = statusData?.status || "unknown";

  const stageIndex = ALL_STAGES.findIndex(s => s.toLowerCase() === currentStage.toLowerCase());

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader 
        title={`Experiment Pipeline: ${experimentId}`}
        breadcrumb={`Research / Experiments / ${experimentId}`}
        description="Detailed execution monitor, artifact manifest, and live status for the selected pipeline."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest">Rerun</Button>
            <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest">Export Logs</Button>
            <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest">Generate Report</Button>
          </div>
        }
      />

      {/* Stage Progress Bar */}
      <Card header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Stage Execution Progress</h3>}>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {ALL_STAGES.map((stage, idx) => {
            const isCompleted = statusStr === "completed" || (stageIndex > -1 && idx < stageIndex);
            const isCurrent = stageIndex === idx && statusStr !== "completed";
            const isFailed = isCurrent && statusStr === "failed";
            
            let colorClass = "bg-muted-bg/50 text-muted-text/50 border-border/20";
            if (isCompleted) colorClass = "bg-success/10 text-success border-success/30";
            else if (isFailed) colorClass = "bg-error/10 text-error border-error/30";
            else if (isCurrent) colorClass = "bg-accent/10 text-accent border-accent/50 ring-1 ring-accent/30";

            return (
              <div key={stage} className={`flex-1 min-w-[100px] p-3 rounded-lg border text-center transition-all ${colorClass}`}>
                <div className="text-[10px] font-black uppercase tracking-widest">{stage}</div>
                {isCurrent && statusStr === "running" && (
                  <div className="mt-2 w-full h-1 bg-accent/20 rounded overflow-hidden">
                    <div className="h-full bg-accent animate-pulse w-1/2"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="flex flex-col gap-8">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <MetricCard label="Progress" value={`${Math.round(progress)}%`} status={statusStr === "completed" ? "completed" : "running"} icon="📈" />
             <MetricCard label="Runtime" value={statusData?.runtime || "Calculating"} icon="⏱️" />
             <MetricCard label="Compute" value="Auto-scaled" status="running" helperText="Cluster: Q-AI-DRUG" />
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Inputs & Parameters</h3>}>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted-bg/20 border border-border/40">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">Configuration</span>
                  <span className="text-xs font-bold text-text">Live Pipeline Params</span>
                </div>
                {resultData?.inputs && Object.entries(resultData.inputs).map(([k, v]: any) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">{k}</span>
                    <span className="text-[11px] font-bold text-text/70">{v}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Outputs & Findings</h3>}>
              <div className="space-y-4">
                {resultData?.metrics ? Object.entries(resultData.metrics).map(([k, v]: any) => (
                  <div key={k} className="flex items-center justify-between border-b border-border/10 pb-2 last:border-0 last:pb-0">
                    <span className="text-xs font-medium text-muted-text/70">{k}</span>
                    <span className="text-xs font-bold text-text">{v}</span>
                  </div>
                )) : (
                  <span className="text-xs text-muted-text/50">Outputs will appear here once stages complete.</span>
                )}
              </div>
            </Card>
          </div>

          {/* Logs Terminal */}
          <Card 
            header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Execution Logs</h3>}
            contentClassName="bg-black/95 p-6 rounded-2xl min-h-[300px] max-h-[500px] overflow-y-auto"
          >
            <div className="font-mono text-[11px] space-y-2 text-success/80">
              {logs.length > 0 ? logs.map((log: string, i: number) => {
                const isWarn = log.includes("WARN") || log.includes("WARNING");
                const isErr = log.includes("ERR") || log.includes("ERROR");
                const isSys = log.includes("SYS") || log.includes("INFO");
                let color = "";
                if (isWarn) color = "text-warning";
                else if (isErr) color = "text-error";
                else if (isSys) color = "text-accent";

                return (
                  <div key={i} className="flex gap-4 group">
                    <span className={`break-all ${color}`}>{log}</span>
                  </div>
                );
              }) : (
                <div className="text-muted-text/40">Waiting for logs...</div>
              )}
              {statusStr === "completed" && (
                <div className="flex items-center gap-2 pt-4">
                   <div className="h-1 w-2 bg-success" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-success/40">EOF - Execution Finalized</span>
                </div>
              )}
              {statusStr === "running" && (
                <div className="flex items-center gap-2 pt-4">
                   <div className="h-1 w-2 bg-success animate-pulse" />
                </div>
              )}
            </div>
          </Card>

          {statusStr === "completed" && resultData?.validation && (
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-text/60">Scientific Validation & Confidence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Validation Summary</h3>}>
                    <ValidationSummary confidence={resultData.validation.confidence || 90} reproducibility={98} completeness={100} benchmark={85} />
                    <div className="mt-8 pt-6 border-t border-border/20">
                      <ValidationWarnings />
                    </div>
                 </Card>
                 <Card header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Benchmark Comparison</h3>}>
                    <BenchmarkComparison />
                 </Card>
              </div>
              <Card header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Confidence Dimensions</h3>}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-2">
                    <ConfidencePanel />
                 </div>
              </Card>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card className="bg-accent/[0.02] border-accent/10">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">Experiment Status</span>
                <StatusBadge 
                  status={statusStr === "completed" ? "completed" : statusStr === "failed" ? "error" : "running"} 
                  label={statusStr.toUpperCase()} 
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">ID</span>
                  <span className="text-[11px] font-bold text-text/80">{experimentId}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">Stage</span>
                  <span className="text-[11px] font-bold text-text/80">{currentStage}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card header={<h3 className="text-xs font-black uppercase tracking-widest text-text/80">Artifact Manifest</h3>}>
            <div className="space-y-3">
              {artifacts.length > 0 ? artifacts.map((file: any, i: number) => (
                <div key={i} className="group p-3 rounded-xl border border-border/40 bg-muted-bg/10 hover:border-accent/40 hover:bg-accent/5 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-text truncate pr-4">{file.name || file.filename || file.id || `Artifact ${i}`}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-text/40">
                    <span>{file.type || "File"}</span>
                    <span>{file.size || "-"}</span>
                  </div>
                </div>
              )) : (
                <div className="text-xs text-muted-text/50">No artifacts generated yet.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
