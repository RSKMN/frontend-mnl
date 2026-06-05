"use client";

import React, { useMemo } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import ChartCard from "./ChartCard";

const axisTick = { fontSize: 10, fill: "var(--muted-text)", fontWeight: 600 };

function ChartTooltip() {
	return {
		contentStyle: {
			backgroundColor: "var(--ui-surface)",
			border: "1px solid var(--border-color)",
			borderRadius: "12px",
			color: "var(--text)",
			fontSize: "11px",
			fontWeight: 600,
			boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
		},
		cursor: { fill: "var(--primary-light)", opacity: 0.1 },
	};
}

interface ChartsSectionProps {
  molecules?: any[];
  experiments?: any[];
  projects?: any[];
  reports?: any[];
}

export default function ChartsSection({
  molecules = [],
  experiments = [],
  projects = [],
  reports = []
}: ChartsSectionProps) {
	const tooltip = ChartTooltip();

  const { mwData, logpData, qedData, pipelineHealth } = useMemo(() => {
    // Pipeline Health metrics
    let generatedCount = molecules.length;
    let dockedCount = molecules.filter(m => m.docking_score || (m.metadata && m.metadata.docking_score)).length;
    let gninaCount = molecules.filter(m => m.metadata && m.metadata.gnina_score).length; // Approximate check

    const health = [
      { metric: "Projects", count: projects.length },
      { metric: "Experiments", count: experiments.length },
      { metric: "Generated", count: generatedCount },
      { metric: "Docked", count: dockedCount },
      { metric: "GNINA Rescored", count: gninaCount },
      { metric: "Reports", count: reports.length }
    ];

    // MW Data Distribution
    const mwBins = { "<300": 0, "300-400": 0, "400-500": 0, ">500": 0 };
    // LogP Data Distribution
    const logpBins = { "<1": 0, "1-3": 0, "3-5": 0, ">5": 0 };
    // QED Data Distribution
    const qedBins = { "<0.3": 0, "0.3-0.5": 0, "0.5-0.7": 0, ">0.7": 0 };

    molecules.forEach(mol => {
      // Extract properties. Use metadata or root properties depending on structure
      const mw = mol.mw ?? mol.metadata?.mw ?? 0;
      const logp = mol.logp ?? mol.metadata?.logp ?? 0;
      const qed = mol.qed ?? mol.metadata?.qed ?? 0;

      if (mw > 0) {
        if (mw < 300) mwBins["<300"]++;
        else if (mw <= 400) mwBins["300-400"]++;
        else if (mw <= 500) mwBins["400-500"]++;
        else mwBins[">500"]++;
      }

      if (logp !== 0) {
        if (logp < 1) logpBins["<1"]++;
        else if (logp <= 3) logpBins["1-3"]++;
        else if (logp <= 5) logpBins["3-5"]++;
        else logpBins[">5"]++;
      }

      if (qed > 0) {
        if (qed < 0.3) qedBins["<0.3"]++;
        else if (qed <= 0.5) qedBins["0.3-0.5"]++;
        else if (qed <= 0.7) qedBins["0.5-0.7"]++;
        else qedBins[">0.7"]++;
      }
    });

    const mwChart = Object.keys(mwBins).map(k => ({ range: k, count: mwBins[k as keyof typeof mwBins] }));
    const logpChart = Object.keys(logpBins).map(k => ({ range: k, count: logpBins[k as keyof typeof logpBins] }));
    const qedChart = Object.keys(qedBins).map(k => ({ range: k, count: qedBins[k as keyof typeof qedBins] }));

    return { mwData: mwChart, logpData: logpChart, qedData: qedChart, pipelineHealth: health };
  }, [molecules, experiments, projects, reports]);

	return (
    <div className="space-y-6">
      {/* Pipeline Health Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pipelineHealth.map(item => (
          <div key={item.metric} className="ui-card-surface p-4 text-center border-border/40 hover:border-accent/40 transition-colors">
            <span className="block text-2xl font-black text-text">{item.count}</span>
            <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-text/60 mt-1">{item.metric}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Molecular Weight (MW) Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mwData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={axisTick} />
              <YAxis axisLine={false} tickLine={false} tick={axisTick} />
              <Tooltip {...tooltip} />
              <Bar dataKey="count" name="Count" fill="var(--primary)" maxBarSize={32} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="LogP Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={logpData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={axisTick} />
              <YAxis axisLine={false} tickLine={false} tick={axisTick} />
              <Tooltip {...tooltip} />
              <Bar dataKey="count" name="Count" fill="var(--accent)" maxBarSize={32} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="QED Score Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={qedData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={axisTick} />
              <YAxis axisLine={false} tickLine={false} tick={axisTick} />
              <Tooltip {...tooltip} />
              <Bar dataKey="count" name="Count" fill="var(--success)" maxBarSize={32} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
	);
}
