"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  PageHeader, 
  MetricCard, 
  ActionButtonGroup, 
  ActionButton, 
  StatusBadge, 
  SectionHeader, 
  EmptyState,
  ErrorState,
  LoadingState,
  ProvenanceBadge,
  ProvenanceLegend,
  Button
} from "@/components/ui";
import { apiClient } from "@/services/api";

function ValidationPageContent({ projectId }: { projectId: string }) {
  const searchParams = useSearchParams();
  const panel = searchParams.get("panel");
  const isAdmetView = panel === "admet" || !panel;

  const [realAdmet, setRealAdmet] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<string>("REAL BACKEND DATA");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningStage, setRunningStage] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pipelineSummary, setPipelineSummary] = useState<any>(null);
  const [runStartTime, setRunStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<string>("0s");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      if (!projectId) return null;
      const [admetRes, summaryRes] = await Promise.all([
        apiClient.get<any>(`/projects/${projectId}/admet/results`, { params: { limit: 100 } }),
        apiClient.get<any>(`/projects/${projectId}/pipeline/summary`)
      ]);
      if (admetRes.success && admetRes.data?.items) {
        setRealAdmet(admetRes.data.items);
      }
      if (summaryRes.success && summaryRes.data?.latest_pipeline_run) {
        const run = summaryRes.data.latest_pipeline_run;
        setPipelineSummary(run);
        setLastUpdated(new Date());
        if (run.status === "completed" || run.status === "failed" || run.status === "cancelled") {
          setPolling(false);
          setRunningStage(false);
        }
      }
      return summaryRes;
    } catch (err: any) {
      setPolling(false);
      setRunningStage(false);
      setError(err.message || "Failed to load ADMET data.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [projectId]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (polling) { intervalId = setInterval(() => { fetchData(); }, 3000); }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [polling, projectId]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (runningStage && runStartTime) {
      intervalId = setInterval(() => {
        const diff = Math.floor((new Date().getTime() - runStartTime.getTime()) / 1000);
        setDuration(`${diff}s`);
      }, 1000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [runningStage, runStartTime]);

  useEffect(() => {
    if (realAdmet.length > 0) {
      setDataSource(realAdmet.some((r: any) => r.source === "q_ai_drug_import" || r.metadata?.import_id) ? "IMPORTED Q-AI-DRUG DATA" : "REAL BACKEND DATA");
    }
  }, [realAdmet]);

  const handleRunStage = async () => {
    if (!projectId) return;
    try {
      setRunningStage(true);
      setPolling(true);
      setRunStartTime(new Date());
      const res = await apiClient.post<any>(`/projects/${projectId}/pipeline/run`, {
        body: { pipeline: ["admet"], parameters: {} }
      });
      if (res.success) { fetchData(); }
      else { setPolling(false); setRunningStage(false); }
    } catch { setPolling(false); setRunningStage(false); }
  };

  const displayAdmet = realAdmet.map((r: any) => ({
    candidate: r.compound_id || "CAND-ADMET",
    overallRisk: r.overall_risk ? r.overall_risk.charAt(0).toUpperCase() + r.overall_risk.slice(1) : "Low",
    herg: r.critical_risks?.herg_risk?.level ? r.critical_risks.herg_risk.level.charAt(0).toUpperCase() + r.critical_risks.herg_risk.level.slice(1) : "Unknown",
    cyp3a4: r.radar?.metabolism?.label || "Unknown",
    bbb: r.radar?.permeability?.label || "Unknown",
    hepatotox: r.critical_risks?.hepatotoxicity_risk?.level ? r.critical_risks.hepatotoxicity_risk.level.charAt(0).toUpperCase() + r.critical_risks.hepatotoxicity_risk.level.slice(1) : "Unknown",
    lipinski: r.lipinski_violations !== undefined ? (r.lipinski_violations === 0 ? "Pass" : "Fail") : "N/A",
    qed: r.properties?.QED ?? r.qed ?? "-",
    tpsa: r.properties?.TPSA ?? "-",
    recommendation: r.recommendation || "-",
    overall_risk_score: r.overall_risk_score,
    status: r.status || "imported"
  }));

  useEffect(() => {
    if (displayAdmet.length > 0 && !selectedResult) setSelectedResult(displayAdmet[0]);
  }, [displayAdmet.length]);

  if (isLoading && !polling) {
    return (
      <div className="space-y-8 pb-12">
        <PageHeader
          title="ADMET &amp; Toxicity Risk"
          breadcrumb="Oncology Research / ADMET Profiling"
          description="Connecting to ADMET database..."
        />
        <LoadingState message="Loading ADMET physiological and toxicity assessments..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 pb-12">
        <PageHeader
          title="ADMET &amp; Toxicity Risk"
          breadcrumb="Oncology Research / ADMET Profiling"
          description="A network error occurred."
        />
        <ErrorState
          title="ADMET data load error"
          explanation={error}
          action={<Button variant="outline" size="sm" onClick={() => void fetchData()}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="ADMET &amp; Toxicity Risk"
        breadcrumb="Oncology Research / ADMET Profiling"
        description="Absorption, Distribution, Metabolism, Excretion, and Toxicity profiles for top candidates."
        dataSource={displayAdmet.length > 0 ? "real" : "missing"}
        actions={
          <ActionButtonGroup>
            <ActionButton label="Export Risk Report" variant="outline" />
            <ActionButton
              label={runningStage ? "Executing..." : "Execute ADMET Workflow"}
              variant="primary"
              onClick={handleRunStage}
              disabled={runningStage}
            />
          </ActionButtonGroup>
        }
      />

      <div className="flex items-center gap-4 px-6 py-3 bg-muted-bg/50 border border-border/20 rounded-xl max-w-max">
        <span className="text-[10px] font-bold text-muted-text/60 uppercase tracking-widest">Scientific Lineage:</span>
        <ProvenanceBadge provenance={dataSource === "IMPORTED Q-AI-DRUG DATA" ? "imported" : "live_compute"} />
        <div className="h-4 w-px bg-border/30" />
        {pipelineSummary?.status === "failed" && <StatusBadge status="warning" size="sm" label="partial" />}
        {pipelineSummary?.status === "running" && <StatusBadge status="running" size="sm" label="partial" />}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <SectionHeader title="ADMET Discovery Ledger" description={`${displayAdmet.length} candidates profiled from pipeline.`} />

          {displayAdmet.length === 0 ? (
            <EmptyState
              title="No ADMET Profiles Found"
              description="Start an ADMET run or import q-ai-drug results."
              action={
                <button onClick={handleRunStage} className="bg-accent px-4 py-2 text-[10px] font-black uppercase text-bg hover:bg-accent/90">
                  Execute ADMET Workflow
                </button>
              }
            />
          ) : (
            <div className="ui-card-surface overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted-bg/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60 border-b border-border/40">
                    <th className="px-4 py-4">Candidate</th>
                    <th className="px-4 py-4 text-center">Overall Risk</th>
                    <th className="px-4 py-4 text-center">Risk Score</th>
                    <th className="px-4 py-4 text-center">hERG</th>
                    <th className="px-4 py-4 text-center">CYP3A4</th>
                    <th className="px-4 py-4 text-center">BBB</th>
                    <th className="px-4 py-4 text-center">Lipinski</th>
                    <th className="px-4 py-4 text-center">Recommendation</th>
                    <th className="px-4 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {displayAdmet.map(res => (
                    <tr
                      key={res.candidate}
                      className={`group hover:bg-muted-bg/20 transition-colors cursor-pointer ${selectedResult?.candidate === res.candidate ? 'bg-accent/[0.03]' : ''}`}
                      onClick={() => setSelectedResult(res)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-text group-hover:text-accent">{res.candidate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${res.overallRisk === 'Low' ? 'text-success' : res.overallRisk === 'Medium' ? 'text-warning' : 'text-error'}`}>
                          {res.overallRisk}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-text">
                        {res.overall_risk_score !== null && res.overall_risk_score !== undefined ? res.overall_risk_score.toFixed(2) : "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-muted-text">{res.herg}</td>
                      <td className="px-4 py-3 text-center text-xs text-muted-text">{res.cyp3a4}</td>
                      <td className="px-4 py-3 text-center text-xs text-muted-text">{res.bbb}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black ${res.lipinski === 'Pass' ? 'text-success' : 'text-muted-text'}`}>{res.lipinski}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black uppercase ${res.recommendation === 'advance' ? 'text-success' : 'text-muted-text'}`}>{res.recommendation}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StatusBadge status={res.status as any} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedResult && (
          <div className="space-y-6">
            <div className="ui-card-surface p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-accent">{selectedResult.candidate} — Detail</h4>
              <div className="grid grid-cols-1 gap-y-3 text-[11px]">
                {[
                  ["hERG Inhibition", selectedResult.herg],
                  ["Hepatotoxicity", selectedResult.hepatotox],
                  ["CYP3A4 Metabolism", selectedResult.cyp3a4],
                  ["BBB Penetration", selectedResult.bbb],
                  ["TPSA", selectedResult.tpsa],
                  ["Lipinski", selectedResult.lipinski],
                  ["Recommendation", selectedResult.recommendation],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between py-1 border-b border-border/20">
                    <span className="font-bold text-muted-text">{label}</span>
                    <span className="font-mono text-text">{value ?? "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectValidationPage({ params }: { params: { projectId: string } }) {
  return (
    <Suspense fallback={<div>Loading ADMET...</div>}>
      <ValidationPageContent projectId={params.projectId} />
    </Suspense>
  );
}
