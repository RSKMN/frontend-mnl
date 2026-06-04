"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import { apiClient } from "@/services/api";

export default function TpsaVsLogpChart() {
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
            .filter((m: any) => m.properties?.logp !== undefined && m.properties?.tpsa !== undefined)
            .map((m: any) => ({ logp: m.properties.logp, tpsa: m.properties.tpsa }));
          setData(valid);
        }
      } catch (e) {} finally { setLoading(false); }
    };
    fetchMols();
  }, []);

  return (
    <ChartCard title="TPSA vs LogP">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">Loading...</div>
      ) : data.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No molecular property data available.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
            <XAxis dataKey="logp" name="LogP" tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-500" />
            <YAxis dataKey="tpsa" name="TPSA" tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-500" />
            <Scatter data={data} fill="#f59e0b" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
