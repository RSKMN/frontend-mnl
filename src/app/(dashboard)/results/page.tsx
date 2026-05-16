"use client";

import React, { useState } from "react";
import { 
  PageHeader, 
  ActionButtonGroup, 
  ActionButton, 
  ReportCard, 
  SectionHeader,
  EmptyState,
  SectionTabs
} from "@/components/ui";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const REPORTS = [
    { name: "Candidate Dossier: QU-7721-X", type: "Dossier", date: "May 16, 2026", status: "completed" as const, size: "4.2 MB", exportType: "PDF" },
    { name: "EGFR T790M Docking Analysis", type: "Analysis", date: "May 15, 2026", status: "completed" as const, size: "12.8 MB", exportType: "SDF" },
    { name: "ADMET Risk Assessment: Batch-04", type: "Validation", date: "May 14, 2026", status: "completed" as const, size: "1.1 MB", exportType: "PDF" },
    { name: "Quantum Refinement Log: L858R", type: "Technical", date: "May 13, 2026", status: "running" as const, size: "---", exportType: "LOG" },
    { name: "HER2 Lead Generation Summary", type: "Summary", date: "May 12, 2026", status: "completed" as const, size: "2.4 MB", exportType: "DOCX" },
    { name: "Kinase Panel Selectivity Report", type: "Experimental", date: "May 10, 2026", status: "failed" as const, size: "0 MB", exportType: "PDF" },
  ];

  const filteredReports = activeTab === "all" ? REPORTS : REPORTS.filter(r => r.type.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="page-shell ui-fade-in flex flex-col gap-8 pb-10">
      <PageHeader 
        title="Research Reports"
        breadcrumb="Research / Reports & Dossiers"
        description="Access generated scientific reports, validation dossiers, and molecular analysis exports across all discovery programs."
        actions={
          <ActionButtonGroup>
            <ActionButton label="Archives" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
            <ActionButton label="Generate New" variant="primary" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          </ActionButtonGroup>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-4">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {["All Reports", "Dossiers", "Analysis", "Validation", "Technical"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab === "All Reports" ? "all" : tab)}
                className={`whitespace-nowrap pb-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                  (activeTab === "all" && tab === "All Reports") || activeTab === tab 
                    ? "border-accent text-accent" 
                    : "border-transparent text-muted-text/50 hover:text-text"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="h-4 w-4 text-muted-text/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Filter by name..." 
              className="h-9 w-full rounded-lg border border-border/40 bg-card pl-9 pr-4 text-[11px] font-medium focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <EmptyState 
            title="No Reports Found"
            description="No reports match your current filter criteria. Try adjusting your search."
          />
        ) : (
          <div className="grid gap-4">
            <SectionHeader title="Available Documents" />
            <div className="flex flex-col gap-3">
              {filteredReports.map((report, i) => (
                <ReportCard key={i} {...report} />
              ))}
            </div>
          </div>
        )}
      </div>

      <section className="mt-4 rounded-2xl border border-dashed border-border/60 p-8 text-center bg-surface-subtle/20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
            <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-text">Automated Reporting System</h4>
            <p className="text-xs text-muted-text/60 max-w-sm mx-auto">
              Configure automated report generation in your program settings to receive scheduled analysis dossiers.
            </p>
          </div>
          <button className="mt-2 text-[10px] font-black uppercase tracking-widest text-accent hover:underline">
            Configure Reports
          </button>
        </div>
      </section>
    </div>
  );
}