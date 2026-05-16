"use client";

import Link from "next/link";
import React, { useState } from "react";
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
import { AssistantWidget, ChartsSection } from "@/components/dashboard";

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
  warning 
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

  return (
    <div className={`ui-card-surface p-5 flex flex-col gap-4 border-l-4 ${
      status === 'Missing' && required ? 'border-l-error/60' : 
      status === 'Warning' ? 'border-l-warning/60' : 
      status === 'Validated' ? 'border-l-success/60' : 
      'border-l-border/40'
    }`}>
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
          <button className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline">Change</button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button className="flex items-center justify-center gap-2 rounded border border-dashed border-border/60 p-2.5 text-[10px] font-black uppercase tracking-widest text-muted-text/60 hover:border-accent/40 hover:text-accent transition-all group">
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

const PROJECTS_DB: Record<string, any> = {
  "egfr-nsclc": {
    name: "EGFR NSCLC Discovery Program",
    disease: "Non-small cell lung cancer",
    target: "EGFR",
    uniprot: "P00533",
    stage: "Docking & Quantum Reranking",
    status: "active" as StatusType,
    workspace: "Oncology Research Workspace",
    team: "Quinfosys Research Division",
    lastUpdated: "12 mins ago",
    objective: "Development of brain-penetrant, mutant-selective inhibitors of EGFR (L858R/T790M) to address resistance in non-small cell lung cancer patients.",
    collaborators: ["SC", "DK", "ER", "MW"],
  },
  "parp1-oncology": {
    name: "PARP1 Oncology Program",
    disease: "Breast/Ovarian",
    target: "PARP1 / DNA Repair",
    uniprot: "P09874",
    stage: "Fragment Screening",
    status: "completed" as StatusType,
    workspace: "Oncology Research Workspace",
    team: "Quinfosys Research Division",
    lastUpdated: "4 hours ago",
    objective: "Fragment-based lead discovery targeting PARP1 for synthetic lethality in BRCA-mutant oncology models.",
    collaborators: ["DK", "ER"],
  }
};

const SUMMARY_METRICS = [
  { label: "Targets Ranked", value: "08", unit: "" },
  { label: "Generated Molecules", value: "15,000", unit: "" },
  { label: "Filtered Candidates", value: "1,500", unit: "" },
  { label: "Docking Poses", value: "45,200", unit: "" },
  { label: "GNINA Runs", value: "1,240", unit: "" },
  { label: "Quantum Reranked", value: "240", unit: "" },
  { label: "Reports Generated", value: "12", unit: "" },
];

const PIPELINE_STEPS = [
  { label: "Input Data", status: "completed" as any, description: "Dataset ready" },
  { label: "Target Ranking", status: "completed" as any, description: "EGFR P00533" },
  { label: "Molecule Generation", status: "completed" as any, description: "15k compounds" },
  { label: "ADMET Filtering", status: "completed" as any, description: "1.5k passed" },
  { label: "Docking", status: "completed" as any, description: "AutoDock Vina" },
  { label: "GNINA Rescoring", status: "running" as any, description: "CNN in progress" },
  { label: "Quantum Reranking", status: "queued" as any, description: "Rigetti QPU" },
  { label: "Report Generation", status: "queued" as any, description: "Validation dossier" },
];

const TOP_CANDIDATES = [
  { id: "QDF-EGFR-001", target: "EGFR (L858R/T790M)", dockingScore: -12.4, admetRisk: "Low" as any, quantumRank: 1, noveltyScore: 0.92, status: "running" as StatusType },
  { id: "QDF-EGFR-014", target: "EGFR (L858R/T790M)", dockingScore: -11.8, admetRisk: "Low" as any, quantumRank: 2, noveltyScore: 0.85, status: "completed" as StatusType },
  { id: "QDF-EGFR-027", target: "EGFR (L858R/T790M)", dockingScore: -11.2, admetRisk: "Medium" as any, quantumRank: 3, noveltyScore: 0.78, status: "completed" as StatusType },
];

const RECENT_ACTIVITY = [
  { text: "AlphaFold structure attached to EGFR target", time: "2h ago" },
  { text: "15,000 molecules generated via Transformer engine", time: "4h ago" },
  { text: "1,500 candidates passed ADMET filtering", time: "6h ago" },
  { text: "GNINA rescoring completed for top 500 candidates", time: "1d ago" },
  { text: "Quantum reranking queued for Rigetti Aspen-M-3", time: "1d ago" },
];

export default function ProjectDetailPage({ params }: ProjectDetailProps) {
  const project = PROJECTS_DB[params.id] || PROJECTS_DB["egfr-nsclc"];
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = [
    "Overview", "Input Data", "Targets", "Molecules", "Docking", 
    "GNINA", "Quantum", "Simulations", "ADMET", "Reports"
  ];

  return (
    <div className="page-shell ui-fade-in flex flex-col gap-0 pb-10">
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
            <div className="flex items-center gap-6 mt-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">Current Stage</span>
                <span className="text-[11px] font-bold text-text/80">{project.stage}</span>
              </div>
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">Team</span>
                <div className="flex -space-x-2">
                  {project.collaborators.map((c: string, i: number) => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-bg bg-surface-subtle flex items-center justify-center text-[8px] font-black text-muted-text" title={c}>
                      {c}
                    </div>
                  ))}
                  <div className="h-6 w-6 rounded-full border-2 border-bg bg-accent/20 flex items-center justify-center text-[8px] font-black text-accent cursor-pointer">+</div>
                </div>
              </div>
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/40">Last Updated</span>
                <span className="text-[11px] font-bold text-muted-text/80">{project.lastUpdated}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionButtonGroup>
              <ActionButton label="Open Pharma LLM" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
              <ActionButton label="Generate Report" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 10-8 0v2a2 2 0 002 2h4a2 2 0 002-2zm3-9a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>} />
              <ActionButton label="Upload Data" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>} />
              <ActionButton label="Run Pipeline" variant="primary" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            </ActionButtonGroup>
          </div>
        </div>
      </header>

      {/* 2. SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-px bg-border/20 border-y border-border/40 mb-8 overflow-hidden rounded-lg">
        {SUMMARY_METRICS.map((metric, i) => (
          <div key={i} className="bg-card p-4 flex flex-col items-center justify-center text-center gap-1 hover:bg-surface-subtle/50 transition-colors cursor-default group">
            <span className="text-[18px] font-black text-text group-hover:text-accent transition-colors">{metric.value}</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-text/50">{metric.label}</span>
          </div>
        ))}
      </div>

      {/* 3. TABS */}
      <div className="flex items-center gap-1 border-b border-border/40 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
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

            {/* Pipeline Progress */}
            <section className="space-y-4">
              <SectionHeader title="Pipeline Execution Progress" />
              <PipelineStepper 
                steps={PIPELINE_STEPS} 
                className="bg-surface-subtle/10"
              />
            </section>

            {/* Candidate Snapshot */}
            <section className="space-y-4">
              <SectionHeader 
                title="Lead Candidate Snapshot" 
                description="Top confidence scoring leads prioritized for experimental validation."
              />
              <div className="grid gap-4 md:grid-cols-3">
                {TOP_CANDIDATES.map((candidate) => (
                  <CandidateCard key={candidate.id} {...candidate} />
                ))}
              </div>
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
                  {RECENT_ACTIVITY.map((activity, i) => (
                    <div key={i} className="p-4 hover:bg-surface-subtle/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[11px] font-medium text-text/80 leading-snug">{activity.text}</p>
                        <span className="text-[8px] font-black text-muted-text/40 uppercase whitespace-nowrap">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 text-[9px] font-black uppercase tracking-widest text-muted-text hover:text-accent hover:bg-accent/5 transition-all border-t border-border/40">
                  View full activity log
                </button>
              </div>
            </section>

            {/* Risk & Recommended Actions */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60">Risk & Recommendations</h4>
              <div className="ui-card-surface p-5 space-y-4 border-warning/20 bg-warning/5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-4 w-4 shrink-0 text-warning">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-warning uppercase tracking-widest leading-none">High ADMET Risk</p>
                    <p className="text-[10px] font-medium text-muted-text/80">32 candidates show high toxicity scores in recent filtering batch.</p>
                  </div>
                </div>
                <div className="pt-2 space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-text/60">Next recommended actions</span>
                  <div className="space-y-2">
                    <button className="w-full text-left p-2.5 rounded-md border border-border/40 hover:border-accent/40 bg-card transition-all group flex items-center justify-between">
                      <span className="text-[10px] font-bold text-text/70 group-hover:text-text">Re-run ADMET with SwissADME engine</span>
                      <svg className="h-3 w-3 text-muted-text/40 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button className="w-full text-left p-2.5 rounded-md border border-border/40 hover:border-accent/40 bg-card transition-all group flex items-center justify-between">
                      <span className="text-[10px] font-bold text-text/70 group-hover:text-text">Adjust molecule generation parameters</span>
                      <svg className="h-3 w-3 text-muted-text/40 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
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
                  status="Uploaded"
                  formats=".fasta, .fa, .txt"
                  fileName="EGFR_P00533.fasta"
                  required
                />
                <InputDataCard 
                  title="Protein PDB / mmCIF"
                  description="Experimental crystal structure."
                  status="Uploaded"
                  formats=".pdb, .cif, .mmcif"
                  fileName="6V6O_human_egfr.pdb"
                  required
                />
                <InputDataCard 
                  title="AlphaFold Structure"
                  description="AI-predicted protein folding data."
                  status="Uploaded"
                  formats=".pdb, .json"
                  fileName="AF-P00533-F1-model_v4.pdb"
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
                  status="Warning"
                  fileName="EGFR_ATP_Pocket.json"
                  required
                  warning="Coordinates overlap with solvent."
                />
                <InputDataCard 
                  title="Known Reference Ligand"
                  description="Co-crystallized or known potent inhibitor."
                  status="Uploaded"
                  formats=".sdf, .mol2"
                  fileName="Osimertinib_ref.sdf"
                  required
                />
                <InputDataCard 
                  title="Known Actives / Inactives"
                  description="Experimental data for training rescoring models."
                  status="Missing"
                  formats=".csv, .sdf"
                  required
                />
              </div>
            </section>

            {/* D. Compound Libraries */}
            <section className="space-y-4">
              <SectionHeader title="D. Compound Libraries" description="Chemical space to be explored via the discovery pipeline." />
              <div className="grid gap-4 md:grid-cols-2">
                <InputDataCard 
                  title="SMILES Compound Library"
                  description="List of molecules for virtual screening."
                  status="Uploaded"
                  formats=".csv, .smi"
                  fileName="Zinc_LeadLike_15k.csv"
                  required
                />
                <InputDataCard 
                  title="SDF 3D Library"
                  description="Pre-conformed molecular structures."
                  status="Optional"
                  formats=".sdf"
                  optional
                />
              </div>
            </section>

            {/* E. Experimental Assay Data */}
            <section className="space-y-4">
              <SectionHeader title="E. Experimental Assay Data" description="Upload IC50, Ki, Kd values for target validation." />
              <div className="grid gap-4 md:grid-cols-2">
                <InputDataCard 
                  title="Assay Data (IC50/Ki/Kd/EC50)"
                  description="Upload experimental binding affinity and potency metrics."
                  status="Uploaded"
                  formats=".csv, .xlsx"
                  fileName="EGFR_Inhibitor_Assays.xlsx"
                  required
                />
                <InputDataCard 
                  title="Mutation / RNA / IHC Data"
                  description="Target-specific genomic, expression, or IHC data."
                  status="Missing"
                  optional
                />
              </div>
            </section>

            {/* F. ADMET & Toxicity */}
            <section className="space-y-4">
              <SectionHeader title="F. ADMET & Toxicity" description="Safety parameters and physiological constraints." />
              <div className="grid gap-4 md:grid-cols-1">
                <InputDataCard 
                  title="ADMET / Toxicity Data"
                  description="Known safety profiles for relevant scaffolds."
                  status="Uploaded"
                  formats=".csv, .xlsx, .json"
                  fileName="ADMET_Scoring_Model.json"
                  required
                />
              </div>
            </section>

            {/* G. Optional Omics / Cell Data */}
            <section className="space-y-4">
              <SectionHeader title="G. Optional Omics / Cell Response" description="Advanced biological response data." />
              <div className="grid gap-4 md:grid-cols-2">
                <InputDataCard 
                  title="Cell-line Response"
                  description="Growth inhibition or viability data."
                  status="Missing"
                  optional
                />
                <InputDataCard 
                  title="Organoid Data"
                  description="3D patient-derived model data."
                  status="Missing"
                  optional
                />
              </div>
            </section>
          </div>

          {/* Validation Summary Panel */}
          <div className="space-y-6">
            <div className="sticky top-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60 mb-4">Input Validation</h4>
              <div className="ui-card-surface p-6 space-y-6 bg-surface-subtle/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted-text">Required Inputs</span>
                    <span className="text-[11px] font-black text-text">7 / 9</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: '77%' }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted-text">Optional Inputs</span>
                    <span className="text-[11px] font-black text-text">2 / 4</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/40">
                  <h5 className="text-[9px] font-black uppercase tracking-widest text-muted-text/60">Missing Required Fields</h5>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-[10px] font-bold text-error/80">
                      <div className="h-1 w-1 rounded-full bg-error" />
                      Known Active / Inactive Molecules
                    </li>
                    <li className="flex items-center gap-2 text-[10px] font-bold text-error/80">
                      <div className="h-1 w-1 rounded-full bg-error" />
                      Binding Site coordinates validation
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/40">
                  <h5 className="text-[9px] font-black uppercase tracking-widest text-muted-text/60">Pipeline Readiness</h5>
                  <div className="flex items-center gap-3">
                    <StatusBadge status="warning" label="Partial" size="sm" />
                    <span className="text-[10px] font-medium text-muted-text/80 leading-snug">Resolve missing required fields to start Target Ranking.</span>
                  </div>
                </div>

                <div className="space-y-2 pt-6">
                  <button className="w-full py-2.5 rounded-lg bg-accent text-bg text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/20">
                    Validate Data
                  </button>
                  <button className="w-full py-2.5 rounded-lg border border-border/40 text-text text-[10px] font-black uppercase tracking-widest hover:bg-muted-bg transition-all">
                    Save Inputs
                  </button>
                  <button className="w-full py-2.5 rounded-lg border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent/5 transition-all opacity-50 cursor-not-allowed">
                    Start Target Ranking
                  </button>
                  <button className="w-full py-2.5 rounded-lg border border-border/40 text-muted-text text-[10px] font-black uppercase tracking-widest hover:text-text transition-all flex items-center justify-center gap-2">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    Ask Pharma LLM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-16 w-16 rounded-full bg-surface-subtle flex items-center justify-center text-muted-text/20">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-text/60">{activeTab} Interface</h3>
            <p className="text-[11px] text-muted-text/40">This module is being initialized for the {project.name}.</p>
          </div>
          <button 
            onClick={() => setActiveTab("Overview")}
            className="mt-2 text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
          >
            Return to Overview
          </button>
        </div>
      )}
    </div>
  );
}

