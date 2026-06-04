"use client";

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

const mwData: any[] = [];
const logpData: any[] = [];
const velocityData: any[] = [];
const correlationData: any[] = [];

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

export default function ChartsSection() {
	const tooltip = ChartTooltip();

	return (
		<div className="grid gap-6 lg:grid-cols-2">
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

			<ChartCard title="Research Pipeline Velocity">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={velocityData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
						<XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisTick} />
						<YAxis axisLine={false} tickLine={false} tick={axisTick} />
						<Tooltip {...tooltip} />
						<Bar dataKey="experiments" name="Experiments" fill="var(--accent)" maxBarSize={32} radius={[4, 4, 0, 0]} />
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
						<Bar dataKey="count" name="Count" fill="var(--primary)" maxBarSize={32} radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</ChartCard>

			<ChartCard title="Docking vs Quantum Correlation">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={correlationData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
						<XAxis dataKey="id" axisLine={false} tickLine={false} tick={axisTick} />
						<YAxis axisLine={false} tickLine={false} tick={axisTick} />
						<Tooltip {...tooltip} />
						<Bar dataKey="docking" name="Docking (kcal/mol)" fill="var(--primary)" maxBarSize={16} radius={[4, 4, 0, 0]} />
						<Bar dataKey="quantum" name="Quantum Score" fill="var(--accent)" maxBarSize={16} radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</ChartCard>
		</div>
	);
}

