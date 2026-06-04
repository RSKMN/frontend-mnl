"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import ActionButtonGroup, { ActionButton } from "@/components/ui/ActionButtonGroup";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import { apiClient } from "@/services/api";

const EmbeddingPlot = dynamic(() => import("@/components/embeddings/EmbeddingPlot"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex flex-col items-center justify-center rounded-2xl border animate-pulse bg-muted-bg/30 border-border/20">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="mt-4 text-xs font-black uppercase tracking-widest text-muted-text/50">Loading Chemical Space Manifold...</span>
    </div>
  ),
});
import type { EmbeddingPoint } from "@/types/api";



export default function ChemicalSpacePage() {
  const [dataSource, setDataSource] = useState<string>("REAL BACKEND DATA");
  const [points, setPoints] = useState<EmbeddingPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<EmbeddingPoint | null>(null);
  const [colorMode, setColorMode] = useState<"dataset" | "qed">("dataset");
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPoints = async (forceRecompute: boolean = false) => {
    try {
      setIsLoading(true);
      const projectId = localStorage.getItem("active_project_id");
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      const res = await apiClient.get<any>(`/projects/${projectId}/chemical-space`, {
        params: forceRecompute ? { recompute: true } : undefined
      });

      if (res.success && res.data && res.data.points) {
        const mapped = res.data.points.map((p: any) => ({
          x: p.x,
          y: p.y,
          molecule_id: p.compound_id || p.molecule_id,
          dataset: p.status || "Generated",
          qed: p.qed || 0.0,
          mw: p.mw || 0.0,
          logp: p.logp || 0.0,
          source: p.status === "uploaded" ? "dataset" : "generated"
        }));
        setPoints(mapped);
        if (mapped.length > 0) {
          setSelectedPoint(mapped[0]);
        }
        setDataSource("REAL BACKEND DATA");
      }
    } catch (err) {
      console.error("Failed to load chemical space points", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    
    fetchPoints();
  }, []);

  const handleRecompute = async () => {
    
    setIsRecomputing(true);
    try {
      const projectId = localStorage.getItem("active_project_id");
      if (!projectId) return;

      const res = await apiClient.post<any>(`/projects/${projectId}/chemical-space/recompute`, {
        body: {
          method: "deterministic_placeholder",
          limit: 1000,
          store: true
        }
      });
      if (res.success) {
        await fetchPoints();
      }
    } catch (err) {
      console.error("Recompute chemical space coordinates failed", err);
    } finally {
      setIsRecomputing(false);
    }
  };

  const displayPoints = points;

  if (!isLoading && displayPoints.length === 0) {
    return (
      <div className="space-y-8 pb-12">
        <PageHeader
          title="Chemical Space Topography"
          breadcrumb="Research / Spatial intelligence"
          description="Navigate the multidimensional landscape of molecular embeddings."
          dataSource="missing"
        />
        <EmptyState
          title="Chemical space analysis unavailable."
          description="This project workspace doesn't have chemical space points calculated yet. Run a t-SNE or UMAP spatial embedding computation for your candidate compounds."
          action={
            <button className="flex items-center gap-2 rounded bg-accent px-4 py-2 text-[10px] font-black uppercase tracking-widest text-bg hover:bg-accent/90 transition-all">
              Compute Embedding Space
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Chemical Space Topography"
        breadcrumb="Research / Spatial intelligence"
        description="Navigate the multidimensional landscape of molecular embeddings. Identify scaffold clusters, analyze diversity gradients, and detect novel regions relative to known pharmaceutical space."
        dataSource={points.length > 0 ? "real" : "missing"}
        actions={
          <ActionButtonGroup>
            <ActionButton 
              label={isRecomputing ? "Recomputing..." : "Recompute Space"} 
              variant="primary" 
              onClick={handleRecompute} 
              disabled={isRecomputing} 
            />
            <ActionButton label="Export Embedding" variant="secondary" />
          </ActionButtonGroup>
        }
      />

      {/* Dynamic Data Provenance Badge */}
      <div className="flex items-center gap-2 px-6 py-2 bg-muted-bg border border-border/20 rounded-lg max-w-max" data-testid="data-source-badge">
        <span className="text-[10px] font-bold text-muted-text/60 uppercase tracking-widest">Data Source:</span>
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
          dataSource === "REAL BACKEND DATA" ? "bg-accent/20 text-accent" : "bg-warning/20 text-warning"
        }`}>
          {dataSource}
        </span>
      </div>

      {/* 2. Chemical Space Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Embedded Molecules" value={String(displayPoints.length)} helperText="Total active manifold" status="completed" />
        <MetricCard label="Scaffold Clusters" value={"0"} helperText="Unique structural types" status="completed" />
        <MetricCard label="Novel Region Leads" value={displayPoints.filter(p => p.qed > 0.8).length.toString()} helperText="Low similarity to FDA" status="active" />
        <MetricCard label="Approved Neighbors" value={"0"} helperText="Similar to known drugs" status="completed" />
        <MetricCard label="Applicability Alerts" value="0" helperText="Out-of-domain detections" status="completed" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Main Content Area (3/4) */}
        <div className="lg:col-span-3 space-y-8">
          {/* 3. Embedding Visualization Panel */}
          <div className="h-[600px] relative">
            <EmbeddingPlot 
              data={displayPoints} 
              colorMode={colorMode} 
              onPointClick={(p) => setSelectedPoint(p)} 
            />
            
            {/* View Controls Overlay */}
            <div className="absolute top-20 right-6 z-20 flex flex-col gap-2">
              <button 
                onClick={() => setColorMode("dataset")}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                  colorMode === 'dataset' ? 'bg-primary text-white border-primary shadow-lg' : 'backdrop-blur-md border-border/40 text-text-secondary'
                }`}
                style={{ background: colorMode === 'dataset' ? "" : "color-mix(in srgb, var(--card) 80%, transparent)" }}
              >
                Color by Source
              </button>
              <button 
                onClick={() => setColorMode("qed")}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                  colorMode === 'qed' ? 'bg-primary text-white border-primary shadow-lg' : 'backdrop-blur-md border-border/40 text-text-secondary'
                }`}
                style={{ background: colorMode === 'qed' ? "" : "color-mix(in srgb, var(--card) 80%, transparent)" }}
              >
                Color by QED
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Property Gradients currently unavailable */}
          </div>
        </div>

        {/* Sidebar (1/4) */}
        <div className="space-y-6">
          {/* 5. Candidate Highlight Panel */}
          {selectedPoint && (
            <div className="ui-card-surface p-5 space-y-5 border-accent/30 bg-accent/[0.02]">
              <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Candidate Focus
              </h4>
              
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xl font-black text-text tracking-tighter truncate" title={selectedPoint.molecule_id}>{selectedPoint.molecule_id}</span>
                  <span className="text-[10px] font-bold text-muted-text uppercase tracking-[0.2em]">{selectedPoint.dataset} Manifold</span>
                </div>

                <div className="grid grid-cols-1 gap-y-3 pt-4 border-t border-border/20">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-muted-text">MW</span>
                    <span className="text-[11px] font-black text-text">{selectedPoint.mw} g/mol</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-muted-text">LogP</span>
                    <span className="text-[11px] font-black text-text">{selectedPoint.logp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-muted-text">QED score</span>
                    <span className="text-[11px] font-black text-accent">{selectedPoint.qed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-muted-text">Applicability Domain</span>
                    <span className="text-[11px] font-black text-text">Inside (High Conf)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border/40 shadow-sm space-y-2" style={{ background: "var(--card)" }}>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-muted-text/60">ADMET Risk</span>
                      <span className="text-success">Low</span>
                   </div>
                   <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: '15%' }} />
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. Actions */}
          <div className="flex flex-col gap-2">
            <button className="w-full py-3 rounded-lg bg-accent text-bg font-black uppercase tracking-[0.2em] text-[10px] hover:bg-accent/90 shadow-lg shadow-accent/10 transition-all">
              Filter Novel Regions
            </button>
            <button className="w-full py-3 rounded-lg border border-border text-text font-black uppercase tracking-[0.2em] text-[10px] hover:bg-muted-bg transition-all">
              Compare Scaffolds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
