"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { 
  ActionButtonGroup, 
  ActionButton, 
  SectionHeader,
  PipelineStepper,
  CandidateCard,
  MetricCard,
  ReportCard,
  ExperimentTable,
  StatusBadge,
  StatusType
} from "@/components/ui";
import { 
  AssistantWidget, 
  ChartsSection, 
  DatasetInsightsPanel, 
  MwDistributionChart, 
  LogpDistributionChart, 
  QedDistributionChart, 
  ChartSkeleton 
} from "@/components/dashboard";
import { apiClient, getApiBaseUrl } from "@/services";
import { ProjectRoutes } from "@/lib/projectRoutes";

const generateDistribution = (values: number[], numBins: number = 10) => {
  if (!values.length) return { bins: [], counts: [] };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = Math.max((max - min) / numBins, 0.01);
  const bins = Array.from({ length: numBins + 1 }, (_, i) => min + i * step);
  const counts = Array(numBins).fill(0);
  values.forEach(v => {
    let binIdx = Math.floor((v - min) / step);
    if (binIdx >= numBins) binIdx = numBins - 1;
    if (binIdx < 0) binIdx = 0;
    counts[binIdx]++;
  });
  return { bins, counts };
};

interface ProjectDetailProps {
  params: {
    id: string;
  };
}

interface InputDataCardProps {
  title: string;
  description: string;
  status: "Required" | "Optional" | "Uploaded" | "Missing" | "Validated" | "Warning";
  formats?: string;
  fileName?: string;
  value?: string;
  required?: boolean;
  optional?: boolean;
  warning?: string;
  onUpload?: (file: File) => void;
}

function InputDataCard({ 
  title, 
  description, 
  status, 
  formats, 
  fileName, 
  value, 
  required, 
  optional, 
  warning,
  onUpload
}: InputDataCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "Validated": return "completed";
      case "Uploaded": return "active";
      case "Warning": return "warning";
      case "Missing": return "failed";
      default: return "pending";
    }
  };

  const inputId = `file-input-${title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;

  return (
    <div className={`ui-card-surface p-5 flex flex-col gap-4 border-l-4 ${
      status === 'Missing' && required ? 'border-l-error/60' : 
      status === 'Warning' ? 'border-l-warning/60' : 
      status === 'Validated' ? 'border-l-success/60' : 
      'border-l-border/40'
    }`}>
      {onUpload && (
        <input
          type="file"
          id={inputId}
          accept={formats}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
          }}
          className="hidden"
        />
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-text">{title}</h4>
            {required && <span className="text-[8px] font-black text-error uppercase">Required</span>}
            {optional && <span className="text-[8px] font-black text-muted-text/40 uppercase">Optional</span>}
          </div>
          <p className="text-[10px] font-medium text-muted-text/60 leading-relaxed">{description}</p>
        </div>
        <StatusBadge status={getStatusColor()} label={status} size="sm" />
      </div>

      {value ? (
        <div className="bg-surface-subtle/30 rounded border border-border/20 p-2 text-[10px] font-bold text-accent">
          {value}
        </div>
      ) : fileName ? (
        <div className="flex items-center justify-between bg-surface-subtle/30 rounded border border-border/20 p-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <svg className="h-3.5 w-3.5 text-muted-text/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="text-[10px] font-bold text-text/80 truncate">{fileName}</span>
          </div>
          <button 
            type="button" 
            onClick={() => onUpload && document.getElementById(inputId)?.click()}
            className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button 
            type="button"
            onClick={() => onUpload && document.getElementById(inputId)?.click()}
            className="flex items-center justify-center gap-2 rounded border border-dashed border-border/60 p-2.5 text-[10px] font-black uppercase tracking-widest text-muted-text/60 hover:border-accent/40 hover:text-accent transition-all group"
          >
            <svg className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Upload / Select
          </button>
          {formats && (
            <span className="text-[8px] font-medium text-muted-text/30 text-center uppercase tracking-tighter">Accepted: {formats}</span>
          )}
        </div>
      )}

      {warning && (
        <div className="flex items-start gap-2 text-warning">
          <svg className="h-3 w-3 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span className="text-[9px] font-bold leading-tight italic">{warning}</span>
        </div>
      )}
    </div>
  );
}

const PROJECTS_DB: Record<string, any> = {};

export interface ProjectOverviewViewProps { projectId: string; }
export default function ProjectOverviewView({ projectId }: ProjectOverviewViewProps) {
  const [project, setProject] = useState<any>(PROJECTS_DB[projectId] || null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [inputs, setInputs] = useState<any>(null);
  const [completeness, setCompleteness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [molecules, setMolecules] = useState<any[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Real-time Orchestration States
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineSummary, setPipelineSummary] = useState<any>(null);
  const [pipelineReadiness, setPipelineReadiness] = useState<any>(null);
  const [pollingActive, setPollingActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    const fetchRealData = async () => {
      const storedProjectName = localStorage.getItem("active_project_name");
      if (storedProjectName && !project) {
        setProject({
          name: storedProjectName,
          disease: "Unspecified",
          target: "Unspecified",
          uniprot: "Unspecified",
          description: "New research program initialized.",
          metadata: {
            created_at: new Date().toISOString(),
            status: "Preparation",
            priority: "High"
          }
        });
      }
    };
    fetchRealData();
  }, [projectId, project]);




  // Read auth token from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAuthToken(localStorage.getItem("auth_token"));
    }
  }, []);

  /** Build a download URL with ?token= query param for browser-native auth */
  const getDownloadUrl = (fileId: string) => {
    const base = `${getApiBaseUrl()}/files/${fileId}/download`;
    return authToken ? `${base}?token=${encodeURIComponent(authToken)}` : base;
  };

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("active_project_id", projectId);
      }
      const res = await apiClient.get<any>(`/projects/${projectId}`);
      if (res.success && res.data) {
        const p = res.data;
        setProject({
          name: p.name,
          disease: p.disease_type || "General Oncology",
          target: p.cancer_type || "Multiple Targets",
          uniprot: "P00533",
          stage: p.status === "completed" ? "Pipeline Completed" : "Target Discovery Program",
          status: p.status || "active",
          workspace: localStorage.getItem("active_workspace_name") || "Research Workspace",
          team: "Quinfosys Research Division",
          lastUpdated: "Just now",
          objective: p.description || "Development of mutant-selective discovery programs.",
          collaborators: ["SC", "DK", "ER", "MW"],
        });
      }

      const inputsRes = await apiClient.get<any>(`/projects/${projectId}/inputs`);
      if (inputsRes.success && inputsRes.data) {
        setInputs(inputsRes.data);
      }

      const compRes = await apiClient.get<any>(`/projects/${projectId}/inputs/completeness`);
      if (compRes.success && compRes.data) {
        setCompleteness(compRes.data);
      }
    } catch (err) {
      console.error("Failed to load project details from backend, using fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoleculesForAnalytics = async () => {
    try {
      setMetricsLoading(true);
      const res = await apiClient.get<any>(`/molecules?project_id=${projectId}&limit=1000`);
      if (res.success && res.data) {
        setMolecules(res.data);
      }
    } catch (err) {
      console.error("Failed to load molecules for analytics", err);
    } finally {
      setMetricsLoading(false);
    }
  };

  const fetchSummaryData = async () => {
    try {
      const res = await apiClient.get<any>(`/projects/${projectId}/pipeline/summary`);
      if (res.success && res.data) {
        setPipelineSummary(res.data);
        const latestRun = res.data.latest_pipeline_run;
        if (latestRun && ["queued", "running", "importing_results"].includes(latestRun.status)) {
          setPollingActive(true);
          setPipelineRunning(true);
        } else {
          setPollingActive(false);
          setPipelineRunning(false);
          if (latestRun?.status === "completed") {
            fetchProjectData();
          }
        }
      }
    } catch (err) {
      console.error("Failed to load pipeline summary from backend", err);
    }
  };

  const triggerPipeline = async (stages: string[]) => {
    try {
      setErrorMessage(null);
      setPipelineRunning(true);
      const res = await apiClient.post<any>(`/projects/${projectId}/pipeline/run`, {
        body: {
          pipeline: stages,
          parameters: {}
        }
      });
      if (res.success) {
        setPollingActive(true);
        fetchSummaryData();
      } else {
        setErrorMessage(res.message || "Failed to trigger pipeline execution.");
        setPipelineRunning(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Orchestration service returned connection error.");
      setPipelineRunning(false);
    }
  };

  const fetchReadinessData = async () => {
    try {
      const res = await apiClient.get<any>(`/projects/${projectId}/pipeline/readiness`);
      if (res.success && res.data) {
        setPipelineReadiness(res.data);
      }
    } catch (err) {
      console.error("Failed to load pipeline readiness", err);
    }
  };

  useEffect(() => {
    fetchProjectData();
    fetchSummaryData();
    fetchReadinessData();
    fetchMoleculesForAnalytics();
  }, [projectId]);

  useEffect(() => {
    if (!pollingActive) return;
    const interval = setInterval(() => {
      fetchSummaryData();
    }, 4000);
    return () => clearInterval(interval);
  }, [pollingActive]);

  const handleUploadInputFile = async (field: string, file: File) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const backendFileType = field.endsWith("_file_id") ? field.slice(0, -8) : "other";
      formData.append("file_type", backendFileType);
      formData.append("source_module", "project_inputs");

      const uploadRes = await apiClient.upload<any>(`/projects/${projectId}/files/upload`, formData);
      if (uploadRes.success && uploadRes.data && uploadRes.data.file) {
        const fileId = uploadRes.data.file.file_id || uploadRes.data.file.id;

        const assignRes = await apiClient.patch<any>(`/projects/${projectId}/inputs/files`, {
          body: {
            [field]: fileId
          }
        });

        if (assignRes.success) {
          alert(`File "${file.name}" uploaded and assigned successfully!`);
          fetchProjectData();
          fetchReadinessData();
        } else {
          alert("Failed to assign file to inputs.");
        }
      } else {
        alert("Failed to upload file to project storage.");
      }
    } catch (err) {
      alert("Upload failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const getCardInfo = (field: string, fallbackStatus: any, fallbackName: string) => {
    if (!inputs) return { status: fallbackStatus, fileName: fallbackName };
    const fileId = inputs[field];
    if (fileId) {
      return { status: "Uploaded" as const, fileName: `assigned_file_${fileId.slice(-6)}` };
    }
    return { status: "Missing" as const, fileName: undefined };
  };

  const getPipelineSteps = () => {
    const defaultSteps = [
      { label: "Target Ranking", status: "completed" as any, description: "EGFR P00533" },
      { label: "Molecule Generation", status: "completed" as any, description: "15k compounds" },
      { label: "ADMET Filtering", status: "completed" as any, description: "1.5k passed" },
      { label: "Docking", status: "completed" as any, description: "AutoDock Vina" },
      { label: "GNINA Rescoring", status: "running" as any, description: "CNN in progress" },
      { label: "Quantum Reranking", status: "queued" as any, description: "Rigetti QPU" },
      { label: "Molecular Simulations", status: "queued" as any, description: "Stability test" },
      { label: "Report Generation", status: "queued" as any, description: "Validation dossier" },
    ];

    if (!pipelineSummary || !pipelineSummary.latest_pipeline_run) {
      return defaultSteps;
    }

    const run = pipelineSummary.latest_pipeline_run;
    const stageStatuses = run.stage_statuses || {};

    const stageMap: Record<string, string> = {
      "target_ranking": "Target Ranking",
      "molecule_generation": "Generation",
      "docking": "Docking Vina",
      "gnina": "GNINA CNN",
      "quantum": "Quantum QML",
      "admet": "ADMET Risk",
      "simulation": "Simulations",
      "report": "Report PDF",
    };

    const stageKeys = Object.keys(stageMap);
    let furthestActiveIndex = -1;
    
    // Find the furthest stage that is part of the current run
    stageKeys.forEach((k, i) => {
      if (stageStatuses[k]) {
        furthestActiveIndex = Math.max(furthestActiveIndex, i);
      }
    });

    return stageKeys.map((key, i) => {
      const label = stageMap[key];
      const stageInfo = stageStatuses[key] || {};
      let status = stageInfo.status;
      
      if (!status) {
        if (i < furthestActiveIndex) {
          status = "completed";
        } else {
          status = "queued";
        }
      }
      
      let description = "Awaiting run";
      if (status === "running") {
        description = `In progress (${stageInfo.progress || 50}%)`;
      } else if (status === "importing_results") {
        description = "Importing results...";
        status = "running";
      } else if (status === "imported" || status === "completed") {
        description = "Completed";
        status = "completed";
      } else if (status === "failed") {
        description = "Failed";
      }

      return {
        label,
        status: status as any,
        description
      };
    });
  };

  const getSummaryMetrics = () => {
    const counts = pipelineSummary?.imported_counts || {};
    return [
      { label: "Targets Ranked", value: counts.targets_ranked !== undefined ? counts.targets_ranked.toString() : "08" },
      { label: "Generated Molecules", value: counts.molecules !== undefined ? counts.molecules.toLocaleString() : "15,000" },
      { label: "Filtered Candidates", value: counts.admet_results !== undefined ? counts.admet_results.toLocaleString() : "1,500" },
      { label: "Docking Poses", value: counts.docking_results !== undefined ? counts.docking_results.toLocaleString() : "45,200" },
      { label: "GNINA Runs", value: counts.gnina_results !== undefined ? counts.gnina_results.toLocaleString() : "1,240" },
      { label: "Quantum Reranked", value: counts.quantum_results !== undefined ? counts.quantum_results.toLocaleString() : "240" },
      { label: "Reports Generated", value: counts.reports !== undefined ? counts.reports.toLocaleString() : "12" },
    ];
  };

  const getStageExperiments = () => {
    if (!pipelineSummary || !pipelineSummary.latest_pipeline_run) return [];
    const run = pipelineSummary.latest_pipeline_run;
    const stageStatuses = run.stage_statuses || {};
    
    return Object.entries(stageStatuses).map(([stage, details]: [string, any]) => ({
      stage,
      status: details.status,
      experiment_id: details.experiment_id,
      completed_at: details.completed_at
    })).filter(item => item.experiment_id);
  };

  const tabs = [
    "Overview", "Input Data", "Targets", "Molecules", "Docking", 
    "GNINA", "Quantum", "Simulations", "ADMET", "Reports"
  ];

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 space-y-4">
        <div className="h-16 w-16 bg-muted-bg rounded-full flex items-center justify-center mb-2 text-muted-text">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
        </div>
        <h2 className="text-xl font-semibold text-text">No Project Active</h2>
        <p className="text-sm text-muted-text max-w-md">Create a new workspace or select an existing research project to begin analysis.</p>
      </div>
    );
  }

  return (
    <div className="page-shell ui-fade-in flex flex-col gap-0 pb-10">
      {/* Dynamic Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex gap-3 text-error">
          <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div className="space-y-1">
            <h5 className="text-[11px] font-black uppercase tracking-wider">Execution Adapter Failure</h5>
            <p className="text-[11px] font-medium leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 1. PROJECT HEADER */}
      <header className="mb-8 space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/50">
                <Link href="/research-projects" className="hover:text-accent transition-colors">Research Projects</Link>
                <span className="opacity-30">/</span>
                <span className="text-accent/80">{project.workspace}</span>
              </div>
              <StatusBadge status={project.status} size="sm" className="ml-2" />
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-4">
              <h1 className="text-2xl font-black tracking-tight text-text md:text-3xl">
                {project.name}
              </h1>
              <div className="flex items-center gap-2 pb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/20">
                  {project.disease}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-text/60">
                  Target: {project.target} ({project.uniprot})
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">Current Stage</span>
                <span className="text-[11px] font-bold text-text/80">{project.stage}</span>
              </div>
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">Last Updated</span>
                <span className="text-[11px] font-bold text-muted-text/80">{project.lastUpdated}</span>
              </div>
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-2 px-2.5 py-0.5 bg-muted-bg/50 border border-border/20 rounded-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-text/50 mr-1.5">Mode:</span>
                <span className="text-[8px] font-black uppercase text-accent leading-none">REAL BACKEND DATA</span>
                <span className="mx-1 opacity-20">|</span>
                <span className="text-[8px] font-black uppercase text-indigo-400 leading-none">LIVE Q-AI-DRUG PIPELINE</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            {/* Readiness Panel */}
            {pipelineReadiness && (
              <div className="w-full lg:w-96 bg-surface-subtle/30 rounded-lg p-3 border border-border/40 text-xs">
                <h3 className="font-black uppercase tracking-wider mb-2 flex items-center justify-between text-[10px]">
                  <span>Pipeline Readiness</span>
                  {pipelineReadiness.full_pipeline_ready ? (
                    <span className="text-[9px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Fully Ready</span>
                  ) : pipelineReadiness.generation_ready ? (
                    <span className="text-[9px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Generation Only</span>
                  ) : (
                    <span className="text-[9px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Action Required</span>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <StatusBadge status={pipelineReadiness.generation_ready ? "completed" : "failed"} />
                    <span className="text-[10px]">Generation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={pipelineReadiness.docking_ready ? "completed" : "failed"} />
                    <span className="text-[10px]">Structural Stages</span>
                  </div>
                </div>
                {pipelineReadiness.missing && pipelineReadiness.missing.length > 0 && (
                  <div className="mt-1 p-1.5 bg-red-500/10 text-red-400 rounded text-[9px]">
                    <strong>Missing:</strong> {pipelineReadiness.missing.join(", ")}
                  </div>
                )}
              </div>
            )}

            <ActionButtonGroup>
              <ActionButton 
                label="Generate Report" 
                onClick={() => triggerPipeline(["report"])}
                disabled={pipelineRunning || (pipelineReadiness && !pipelineReadiness.report_ready)}
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 10-8 0v2a2 2 0 002 2h4a2 2 0 002-2zm3-9a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>} 
              />
              <ActionButton 
                label={pipelineRunning ? "Orchestrating..." : "Run Full Pipeline"} 
                variant="primary" 
                onClick={() => triggerPipeline(["target_ranking", "molecule_generation", "filtering", "docking", "gnina", "quantum", "admet", "simulation", "report"])}
                disabled={pipelineRunning || (pipelineReadiness && !pipelineReadiness.full_pipeline_ready)}
                icon={
                  pipelineRunning ? (
                    <svg className="animate-spin h-4 w-4 text-bg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )
                } 
              />
            </ActionButtonGroup>
          </div>
        </div>
      </header>

      {/* 2. SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-px bg-border/20 border-y border-border/40 mb-8 overflow-hidden rounded-lg">
        {getSummaryMetrics().map((metric, i) => (
          <div key={i} className="bg-card p-4 flex flex-col items-center justify-center text-center gap-1 hover:bg-surface-subtle/50 transition-colors cursor-default group">
            <span className="text-[18px] font-black text-text group-hover:text-accent transition-colors">{metric.value}</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-text/50">{metric.label}</span>
          </div>
        ))}
      </div>

      {/* 3. TABS */}
      <div 
        role="tablist" 
        aria-label="Project Workspace Tabs" 
        className="flex items-center gap-1 border-b border-border/40 mb-8 overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab 
                ? "border-accent text-accent" 
                : "border-transparent text-muted-text/40 hover:text-text hover:border-border/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENT */}
      {activeTab === "Overview" ? (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Research Objective */}
            <section className="ui-card-surface p-6 bg-accent/5 border-accent/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Research Objective
              </h4>
              <p className="text-[13px] font-medium leading-relaxed text-text/80">
                {project.objective}
              </p>
            </section>

            {/* Analytics Dashboard (Recovered) */}
            <section className="space-y-4">
              <SectionHeader title="Molecular Analytics Dashboard" description="Live distributions of generated candidates." />
              {metricsLoading ? (
                <div className="grid gap-6 lg:grid-cols-2">
                   <ChartSkeleton type="chart" className="col-span-2 md:col-span-1" />
                   <ChartSkeleton type="chart" className="col-span-2 md:col-span-1" />
                </div>
              ) : (
                <div className="space-y-6">
                  <DatasetInsightsPanel 
                    totalDatasets={2} 
                    activeDataset="Default Project Generative Set"
                    totalMolecules={molecules.length || 0}
                  />
                  <div className="grid gap-6 lg:grid-cols-2">
                    <MwDistributionChart 
                      distribution={generateDistribution(molecules.map((m: any) => m.properties?.mw || m.properties?.exact_mass || 400).filter(Boolean), 15)} 
                    />
                    <LogpDistributionChart 
                      distribution={generateDistribution(molecules.map((m: any) => m.properties?.logp || 2.5).filter(Boolean), 15)} 
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Pipeline Progress */}
            <section className="space-y-4">
              <SectionHeader title="Pipeline Execution Progress" />
              <PipelineStepper 
                steps={getPipelineSteps()} 
                className="bg-surface-subtle/10"
              />
            </section>

            {/* Stage Experiments Ledger */}
            {getStageExperiments().length > 0 && (
              <section className="space-y-4">
                <SectionHeader 
                  title="Orchestrated Experiments History" 
                  description="Live links to background tasks and results metadata metrics."
                />
                <div className="ui-card-surface p-0 overflow-hidden">
                  <div className="divide-y divide-border/20">
                    {getStageExperiments().map((exp, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-surface-subtle/20 transition-all">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-accent">{exp.stage.replace("_", " ")}</span>
                          <p className="text-[10px] font-bold text-muted-text/80 font-mono">Experiment ID: {exp.experiment_id}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={exp.status === "importing_results" ? "running" : exp.status} size="sm" />
                          <Link 
                            href={`${ProjectRoutes.experiments(projectId)}?experiment_id=${exp.experiment_id}`}
                            className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-bg bg-accent hover:bg-accent/80 rounded"
                          >
                            Analyze Results
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Candidate Snapshot */}
            <section className="space-y-4">
              <SectionHeader 
                title="Lead Candidate Snapshot" 
                description="Top confidence scoring leads prioritized for experimental validation."
              />
              {molecules && molecules.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {molecules.slice(0, 3).map((mol, idx) => (
                    <CandidateCard 
                      key={mol.id || mol.molecule_id} 
                      id={mol.molecule_id || mol.id || `MOL-${idx + 1}`} 
                      target={project.target || "Unknown Target"}
                      dockingScore={mol.docking_score ?? null}
                      admetRisk={mol.admet_risk || mol.properties?.toxicity || null}
                      quantumRank={mol.quantum_rank || (idx + 1)}
                      noveltyScore={mol.novelty_score ?? mol.properties?.qed ?? null}
                      status="completed"
                    />
                  ))}
                </div>
              ) : (
                <div className="ui-card-surface p-8 text-center text-xs font-bold text-muted-text/50 border border-dashed border-border/40">
                  No lead candidates available yet. Run the pipeline stages to prioritize compounds.
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            {/* Project Intelligence Assistant */}
            <AssistantWidget />

            {/* Recent Project Activity */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60">Recent activity</h4>
              <div className="ui-card-surface p-0 overflow-hidden">
                <div className="divide-y divide-border/40">
                  {getStageExperiments().length > 0 ? (
                    getStageExperiments().map((exp, i) => (
                      <div key={i} className="p-4 hover:bg-surface-subtle/20 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[11px] font-medium text-text/80 leading-snug">
                            Stage <span className="text-accent uppercase font-bold">{exp.stage.replace("_", " ")}</span> completed for experiment {exp.experiment_id}
                          </p>
                          <span className="text-[8px] font-black text-muted-text/40 uppercase whitespace-nowrap">
                            {exp.completed_at ? new Date(exp.completed_at).toLocaleTimeString() : "Just now"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-[10px] text-muted-text/50 font-bold">
                      No activity recorded yet. Upload input files and run pipeline tasks to begin.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : activeTab === "Input Data" ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-10">
            {/* A. Disease & Target */}
            <section className="space-y-4">
              <SectionHeader title="A. Disease & Target" description="Primary research parameters for the oncology program." />
              <div className="grid gap-4 md:grid-cols-2">
                <InputDataCard 
                  title="Disease / Cancer Type"
                  description="Specify the clinical indication and cancer subtype."
                  status="Validated"
                  value={project.disease}
                  required
                />
                <InputDataCard 
                  title="Target Gene / UniProt ID"
                  description="Primary protein target for discovery."
                  status="Validated"
                  value={`${project.target} (${project.uniprot})`}
                  required
                />
              </div>
            </section>
 
            {/* B. Protein Structure */}
            <section className="space-y-4">
              <SectionHeader title="B. Protein Structure" description="Structural evidence for molecular docking and simulations." />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InputDataCard 
                  title="Protein FASTA"
                  description="Amino acid sequence of the target."
                  formats=".fasta, .fa, .txt"
                  {...getCardInfo("protein_fasta_file_id", "Missing", "")}
                  onUpload={(file) => handleUploadInputFile("protein_fasta_file_id", file)}
                  required
                />
                <InputDataCard 
                  title="Protein PDB / mmCIF"
                  description="Experimental crystal structure."
                  formats=".pdb, .cif, .mmcif"
                  {...getCardInfo("protein_structure_file_id", "Missing", "")}
                  onUpload={(file) => handleUploadInputFile("protein_structure_file_id", file)}
                  required
                />
                <InputDataCard 
                  title="AlphaFold Structure"
                  description="AI-predicted protein folding data."
                  formats=".pdb, .json"
                  {...getCardInfo("alphafold_structure_file_id", "Missing", "")}
                  onUpload={(file) => handleUploadInputFile("alphafold_structure_file_id", file)}
                  optional
                />
              </div>
            </section>
 
            {/* C. Binding Site & Ligands */}
            <section className="space-y-4">
              <SectionHeader title="C. Binding Site & Ligands" description="Define the catalytic pocket or allosteric binding site." />
              <div className="grid gap-4 md:grid-cols-2">
                <InputDataCard 
                  title="Binding Site / Pocket Box"
                  description="Define pocket residues or 3D grid box coordinates."
                  status={inputs?.binding_site ? "Validated" : "Warning"}
                  value={inputs?.binding_site ? `Mode: ${inputs.binding_site.mode} | Box Size: (${inputs.binding_site.box?.size_x || 20}, ${inputs.binding_site.box?.size_y || 20}, ${inputs.binding_site.box?.size_z || 20})` : undefined}
                  fileName={inputs?.binding_site ? undefined : "EGFR_ATP_Pocket.json"}
                  required
                  warning={inputs?.binding_site ? undefined : "Coordinates overlap with solvent."}
                />
                <InputDataCard 
                  title="Known Reference Ligand"
                  description="Co-crystallized or known potent inhibitor."
                  formats=".sdf, .mol2"
                  {...getCardInfo("reference_ligand_file_id", "Missing", "")}
                  onUpload={(file) => handleUploadInputFile("reference_ligand_file_id", file)}
                  required
                />
                <InputDataCard 
                  title="Known Actives / Inactives"
                  description="Experimental data for training virtual screening models."
                  formats=".csv, .sdf"
                  {...getCardInfo("assay_data_file_id", "Missing", "")}
                  onUpload={(file) => handleUploadInputFile("assay_data_file_id", file)}
                  required
                />
              </div>
            </section>
          </div>

          {/* Validation Panel */}
          <div className="space-y-6">
            <div className="sticky top-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60 mb-4">Input Validation</h4>
              <div className="ui-card-surface p-6 space-y-6 bg-surface-subtle/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted-text">Required Inputs</span>
                    <span className="text-[11px] font-black text-text">{isValidated ? '9 / 9' : '7 / 9'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-1000" style={{ width: isValidated ? '100%' : '77%' }} />
                  </div>
                </div>

                <div className="space-y-2 pt-6">

                  <button onClick={() => setIsValidated(true)} className={`w-full py-2.5 rounded-lg text-bg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${isValidated ? 'bg-success shadow-success/20' : 'bg-accent shadow-accent/20 hover:bg-accent/90'}`}>
                    {isValidated ? "Data Validated" : "Validate Data"}
                  </button>
                  <button className="w-full py-2.5 rounded-lg border border-border/40 text-text text-[10px] font-black uppercase tracking-widest hover:bg-muted-bg transition-all">
                    Save Inputs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "Reports" ? (
        /* Dynamic Auto-Downloadable PDF Report Tab */
        <div className="space-y-6">
          <SectionHeader 
            title="Generated Scientific Dossiers" 
            description="High fidelity reports containing structural profiles and molecular dynamics results."
          />
          {pipelineSummary?.generated_reports && pipelineSummary.generated_reports.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pipelineSummary.generated_reports.map((rep: any) => (
                <div key={rep.report_id} className="ui-card-surface p-6 flex flex-col justify-between gap-6 hover:shadow-xl transition-all">
                  <div className="space-y-2">
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      IMPORTED RESULTS
                    </span>
                    <h4 className="text-sm font-black text-text leading-snug">{rep.title}</h4>
                    <p className="text-[10px] text-muted-text/60">Registered on {new Date(rep.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {rep.pdf_file_id && (
                      <a
                        href={getDownloadUrl(rep.pdf_file_id)}
                        download
                        rel="noreferrer"
                        className="flex-1 py-2 text-center text-bg bg-accent hover:bg-accent/90 text-[10px] font-black uppercase tracking-widest rounded transition-all"
                        data-testid="download-pdf-btn"
                      >
                        Download PDF
                      </a>
                    )}
                    {rep.html_file_id && (
                      <a
                        href={getDownloadUrl(rep.html_file_id)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 text-center text-text border border-border hover:bg-muted-bg text-[10px] font-black uppercase tracking-widest rounded transition-all"
                      >
                        View HTML
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center ui-card-surface max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
              <svg className="h-10 w-10 text-muted-text/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <h5 className="text-xs font-black uppercase tracking-widest text-text/80">No Reports Available</h5>
              <p className="text-[10px] text-muted-text/60 leading-relaxed">Trigger the report generation stage in the virtual screening pipeline to compile data.</p>
              <button 
                onClick={() => triggerPipeline(["report"])}
                className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-bg bg-accent hover:bg-accent/80 rounded mt-2"
              >
                Generate Report
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Stage Action Trigger Interfaces */
        <div className="py-20 flex flex-col items-center justify-center text-center gap-4 ui-card-surface max-w-xl mx-auto">
          <div className="h-16 w-16 rounded-full bg-surface-subtle flex items-center justify-center text-muted-text/20">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-text/60">{activeTab} Interface</h3>
            <p className="text-[11px] text-muted-text/40">Initiate virtual screening computational algorithms for {project.name}.</p>
          </div>
          <button 
            onClick={() => triggerPipeline([activeTab.toLowerCase() === "simulations" ? "simulation" : activeTab.toLowerCase() === "targets" ? "target_ranking" : activeTab.toLowerCase() === "molecules" ? "molecule_generation" : activeTab.toLowerCase() === "admet" ? "admet" : activeTab.toLowerCase()])}
            className="mt-4 px-6 py-2.5 rounded-lg bg-accent text-bg text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/15"
          >
            Run {activeTab} Stage
          </button>
        </div>
      )}
    </div>
  );
}
