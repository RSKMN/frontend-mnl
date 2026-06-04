"use client";

import React from "react";
import StatusBadge, { StatusType } from "./StatusBadge";

interface CandidateCardProps {
  id: string;
  target: string;
  dockingScore?: number | null;
  admetRisk?: "Low" | "Medium" | "High" | "Not Available" | "No Data" | null;
  quantumRank: number;
  noveltyScore?: number | null;
  status?: StatusType;
  className?: string;
}

export default function CandidateCard({ 
  id, 
  target, 
  dockingScore, 
  admetRisk, 
  quantumRank, 
  noveltyScore,
  status = "completed",
  className = "" 
}: CandidateCardProps) {
  return (
    <div className={`ui-card-surface group flex flex-col gap-4 p-5 transition-all hover:border-accent/30 hover:shadow-lg ${className}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest">{id}</span>
          <h3 className="truncate text-sm font-bold tracking-tight text-text mt-1">{target}</h3>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-text/50">Docking Score</span>
          <span className="font-mono text-xs font-black text-text/80 mt-0.5">
            {typeof dockingScore === "number" ? dockingScore.toFixed(2) : "Not Available"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-text/50">Quantum Rank</span>
          <span className="font-mono text-xs font-black text-accent mt-0.5">#{quantumRank}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-text/50">ADMET Risk</span>
          <span className={`text-[10px] font-black mt-1 ${
            admetRisk === 'Low' ? 'text-success' : 
            admetRisk === 'Medium' ? 'text-warning' : 
            admetRisk === 'High' ? 'text-error' :
            'text-muted-text/50'
          }`}>
            {admetRisk ? admetRisk.toUpperCase() : "NOT AVAILABLE"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-text/50">Novelty</span>
          <span className="font-mono text-xs font-black text-text/80 mt-0.5">
            {typeof noveltyScore === "number" ? `${(noveltyScore * 100).toFixed(0)}%` : "Not Available"}
          </span>
        </div>
      </div>

      <button className="mt-2 w-full rounded-lg border border-border/40 py-2 text-[10px] font-black uppercase tracking-widest text-muted-text hover:bg-muted-bg hover:text-text transition-all active:scale-[0.98]">
        View Structural Analysis
      </button>
    </div>
  );
}
