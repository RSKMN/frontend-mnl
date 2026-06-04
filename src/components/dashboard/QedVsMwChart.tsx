"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import { apiClient } from "@/services/api";

export default function QedVsMwChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMols = async () => {
      try {
        const projectId = localStorage.getItem("active_project_id");
        if (!projectId) return;
        const res = await apiClient.get<any>(`/projects/${projectId}/molecules`);
        if (res.success && res.data?.items) {
          const valid = res.data.items
            .filter((m: any) => m.properties?.mw !== undefined && m.properties?.qed !== undefined)
            .map((m: any) => ({ mw: m.properties.mw, qed: m.properties.qed }));
          setData(valid);
        }
      } catch (e) {} finally { setLoading(false); }
    };
    fetchMols();
  }, []);

  return (
    <ChartCard title="QED vs molecular weight">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">Loading...</div>
      ) : data.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No molecular property data available.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
            <XAxis dataKey="mw" name="MW" tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-500" />
            <YAxis dataKey="qed" name="QED" tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-500" />
            <Scatter data={data} fill="#8b5cf6" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
