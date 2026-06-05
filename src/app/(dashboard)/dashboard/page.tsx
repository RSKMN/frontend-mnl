"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  getDataset,
  getDatasets,
  apiClient,
} from "@/services/api";
import { useUiStore } from "@/store";
import {
  MetricCard,
  ResearchProjectCard,
  CandidateCard,
  ExperimentTable,
  ReportCard,
  PageHeader,
  ActionButton,
  ActionButtonGroup,
  SectionHeader,
  FadeIn,
  EmptyState,
} from "@/components/ui";
import { DashboardPageSkeleton } from "@/components/shared/skeletons";
import { ApiErrorState } from "@/components/shared/states";
import { toFriendlyErrorMessage } from "@/services/api";

const ChartsSection = dynamic(() => import("@/components/dashboard/Charts"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-xl animate-pulse bg-muted-bg/30 border border-border/20" />,
});

const AssistantWidget = dynamic(() => import("@/components/dashboard/AssistantWidget"), {
  ssr: false,
});

export default function DashboardPage() {
  const selectedDataset = useUiStore((s) => s.selectedDataset);
  const setSelectedDataset = useUiStore((s) => s.setSelectedDataset);
  const [reloadTick, setReloadTick] = useState(0);
  const [datasetNames, setDatasetNames] = useState<string[]>([]);
  const [totalDatasets, setTotalDatasets] = useState(0);
  const [totalMolecules, setTotalMolecules] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real Mode States
  const [realProjects, setRealProjects] = useState<any[]>([]);
  const [realMolecules, setRealMolecules] = useState<any[]>([]);
  const [realReports, setRealReports] = useState<any[]>([]);
  const [realExperiments, setRealExperiments] = useState<any[]>([]);

  const dashboardError = error;

  function handleRetry() {
    setReloadTick((prev) => prev + 1);
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getDatasets()
      .then(async (data) => {
        if (!active) return;
        setDatasetNames(data.datasets);
        setTotalDatasets(data.count);

        const resolvedDataset =
          selectedDataset && data.datasets.includes(selectedDataset)
            ? selectedDataset
            : data.datasets[0] ?? null;
        
        if (resolvedDataset && resolvedDataset !== selectedDataset) {
          setSelectedDataset(resolvedDataset);
        }

        if (resolvedDataset) {
          const datasetDetails = await getDataset(resolvedDataset);
          if (active) setTotalMolecules(datasetDetails.count);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch datasets, running dashboard in project mode:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDataset, reloadTick, setSelectedDataset]);

  useEffect(() => {
    const fetchRealDashboardData = async () => {
      try {
        const wsId = localStorage.getItem("active_workspace_id");
        if (!wsId) return;

        const res = await apiClient.get<any>("/projects", { params: { workspace_id: wsId } });
        if (res.success && res.data && Array.isArray(res.data.items)) {
          const items = res.data.items;
          const allMols: any[] = [];
          const allReps: any[] = [];
          const allExps: any[] = [];
          const projectDetailsMap: Record<string, { molecules: any[], reports: any[], experiments: any[] }> = {};

          await Promise.all(items.map(async (p: any) => {
            try {
              const [molRes, repRes, expRes] = await Promise.all([
                apiClient.get<any>(`/projects/${p.id}/molecules`),
                apiClient.get<any>(`/projects/${p.id}/reports`),
                apiClient.get<any>(`/projects/${p.id}/experiments`)
              ]);
              const mols = (molRes.success && Array.isArray(molRes.data?.items)) ? molRes.data.items : [];
              const reps = (repRes.success && Array.isArray(repRes.data?.reports)) ? repRes.data.reports : [];
              const exps = (expRes.success && Array.isArray(expRes.data?.items)) ? expRes.data.items : [];
              
              allMols.push(...mols);
              allReps.push(...reps);
              allExps.push(...exps);
              
              projectDetailsMap[p.id] = { molecules: mols, reports: reps, experiments: exps };
            } catch (e) {
              console.warn(`Failed fetching metrics for project ${p.id}`, e);
              projectDetailsMap[p.id] = { molecules: [], reports: [], experiments: [] };
            }
          }));

          const mapped = items.map((proj: any) => {
            const details = projectDetailsMap[proj.id] || { molecules: [], reports: [], experiments: [] };
            const exps = details.experiments;
            const mols = details.molecules;
            
            // Calculate real progress
            const completedCount = exps.filter((e: any) => e.status === "completed").length;
            const progress = exps.length > 0 ? Math.round((completedCount / exps.length) * 100) : 0;
            
            // Calculate lastRun
            let lastRun = "Not Available";
            if (exps.length > 0) {
              const sortedExps = [...exps].sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());
              const latestDate = sortedExps[0]?.updated_at || sortedExps[0]?.created_at;
              if (latestDate) {
                lastRun = new Date(latestDate).toLocaleDateString();
              }
            }

            // Calculate candidates
            const generated = mols.length;
            const filtered = mols.filter((m: any) => m.docking_score !== undefined && m.docking_score !== null).length;

            return {
              id: proj.id,
              name: proj.name,
              disease: proj.disease_type || "Not Available",
              target: proj.cancer_type || "Not Available",
              stage: "Not Available",
              status: (proj.status === "active" ? "active" : proj.status) as any,
              progress,
              candidates: { generated, filtered },
              lastRun,
              owner: proj.created_by || "Not Available",
              tags: [proj.status === "active" ? "Active" : proj.status].filter(Boolean)
            };
          });

          setRealProjects(mapped);

          allExps.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          allReps.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          
          setRealMolecules(allMols);
          setRealReports(allReps);
          setRealExperiments(allExps);
        }
      } catch (err) {
        console.error("Failed to load real dashboard data:", err);
      }
    };

    fetchRealDashboardData();
  }, [reloadTick]);

  if (loading) return <DashboardPageSkeleton />;

  if (dashboardError && !loading) {
    return (
      <div className="page-shell">
        <ApiErrorState
          error={dashboardError}
          onRetry={handleRetry}
          title="Dashboard System Offline"
          fallbackMessage="The research intelligence systems are currently undergoing maintenance."
        />
      </div>
    );
  }

  const activeProjectName = typeof window !== "undefined" ? localStorage.getItem("active_project_name") : null;
  const activeWorkspaceName = typeof window !== "undefined" ? localStorage.getItem("active_workspace_name") : null;

  const activePipelines = realExperiments.filter(e => e.status === "running" || e.status === "pending").length;
  const completedPipelines = realExperiments.filter(e => e.status === "completed").length;

  return (
    <FadeIn className="page-shell flex flex-col gap-8 pb-10">
      <PageHeader 
        title={activeProjectName || "Scientific Discovery Program"}
        breadcrumb={`${activeWorkspaceName || "Research Workspace"} / Program Workspace`}
        description="Coordinate molecular generation, virtual docking, quantum rescoring, and validation pipelines for target candidates."
        dataSource={realProjects.length > 0 ? "real" : "missing"}
        actions={
          <ActionButtonGroup>
            <ActionButton label="New Project" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>} />
            <ActionButton label="Upload Dataset" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>} />
            <ActionButton label="Run Pipeline" variant="primary" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          </ActionButtonGroup>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <SectionHeader 
              title="Active Research Programs" 
              action={<Link href="/research-projects" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">View All Programs</Link>}
            />
            {realProjects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {realProjects.map((project) => (
                  <ResearchProjectCard key={project.id} {...project} />
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Active Projects Found"
                description="This workspace doesn't have any research projects yet. Create one to start running discovery pipelines."
                action={
                  <button className="flex items-center gap-2 rounded bg-accent px-4 py-2 text-[10px] font-black uppercase tracking-widest text-bg hover:bg-accent/90 transition-all">
                    Initialize Project
                  </button>
                }
              />
            )}
          </section>

          <section className="space-y-4">
            <SectionHeader 
              title="Top Lead Candidates"
              description="Highest confidence molecular leads prioritized by quantum reranking scores."
              action={<button className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">Full Analytics</button>}
            />
            {realMolecules.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {realMolecules.slice(0, 4).map((mol, idx) => (
                  <CandidateCard 
                    key={mol.id || mol.compound_id}
                    id={mol.compound_id || mol.id || "CANDIDATE"}
                    target={mol.target_id || "Not Available"}
                    dockingScore={mol.docking_score}
                    admetRisk={mol.admet_risk}
                    quantumRank={idx + 1}
                    noveltyScore={mol.qed}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Lead Candidates Found"
                description="Run molecule generation and docking pipelines to prioritize potent binders."
              />
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <SectionHeader title="Workspace Overview" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <MetricCard 
                label="Projects Count"
                value={realProjects.length.toString()}
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
              />
              <MetricCard 
                label="Active Pipelines"
                value={activePipelines.toString()}
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              />
              <MetricCard 
                label="Completed Pipelines"
                value={completedPipelines.toString()}
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            </div>
          </section>

          <AssistantWidget />

          <section className="space-y-4">
            <SectionHeader 
              title="Recent Reports" 
              action={<button className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">Archive</button>}
            />
            {realReports.length > 0 ? (
              <div className="flex flex-col gap-3">
                {realReports.slice(0, 3).map((rep) => (
                  <ReportCard 
                    key={rep.id} 
                    name={rep.title || "Report"} 
                    type={rep.report_type === "candidate_dossier" ? "Dossier" : "Summary"} 
                    date={new Date(rep.created_at).toLocaleDateString()} 
                    size={rep.file_size ? `${(rep.file_size / 1024 / 1024).toFixed(1)} MB` : "N/A"} 
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Reports Generated"
                description="Ready to consolidate scientific discoveries? Go to the Reports tab to generate standard validation files."
              />
            )}
          </section>
        </div>
      </div>

      <section className="space-y-4">
        <SectionHeader 
          title="Global Experiment Log" 
          action={<button className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">View Full Log</button>}
        />
        {realExperiments.length > 0 ? (
          <ExperimentTable 
            experiments={realExperiments.map((exp: any) => ({
              name: exp.name || exp.id,
              type: exp.run_type || "Pipeline Step",
              status: exp.status || "completed",
              runtime: exp.metadata?.runtime || "N/A",
              owner: exp.metadata?.created_by || "User",
              updatedAt: new Date(exp.updated_at || exp.created_at).toLocaleDateString()
            }))}
          />
        ) : (
          <EmptyState 
            title="No Experiment Logs Found"
            description="All scheduled pipeline executions, parameters, and cluster run states will appear here once started."
          />
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader title="Molecular Property Distributions" description="Aggregated chemical space metrics for the current screening batch." />
        <ChartsSection 
          molecules={realMolecules} 
          experiments={realExperiments} 
          projects={realProjects} 
          reports={realReports} 
        />
      </section>
    </FadeIn>
  );
}
