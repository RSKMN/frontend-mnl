import os
import re

qm_path = r"e:\rskmn\Npersonal\quinfosys\drug_discovery_research\work\mnl\frontend-mnl\src\components\views\QMView.tsx"
sim_path = r"e:\rskmn\Npersonal\quinfosys\drug_discovery_research\work\mnl\frontend-mnl\src\app\(dashboard)\simulation\page.tsx"

# 1. Update QMView.tsx
with open(qm_path, "r", encoding="utf-8") as f:
    qm_content = f.read()

qm_content = qm_content.replace(
    'classicalRank: r.qm_descriptors?.classical_rank || 12,',
    'classicalRank: r.qm_descriptors?.classical_rank ?? "Not Available",'
)
qm_content = qm_content.replace(
    'quantumRank: r.quantum_rank || r.rank || 1,',
    'quantumRank: r.quantum_rank || r.rank ?? "Not Available",'
)
qm_content = qm_content.replace(
    'uncertainty: r.metadata?.uncertainty || 0.05,',
    'uncertainty: r.metadata?.uncertainty ?? "Not Available",'
)
qm_content = qm_content.replace(
    'applicability_domain: r.metadata?.applicability_domain_status || "within_domain",',
    'applicability_domain: r.metadata?.applicability_domain_status ?? "Not Available",'
)

qm_content = qm_content.replace(
    """<span className={`text-[10px] font-black ${res.uncertainty > 0.1 ? "text-warning" : "text-success"}`}>""",
    """<span className={`text-[10px] font-black ${res.uncertainty === "Not Available" ? "text-muted-text" : res.uncertainty > 0.1 ? "text-warning" : "text-success"}`}>"""
)

qm_content = qm_content.replace(
    """selectedCandidate.applicability_domain === 'outside_domain' ? 'bg-error/10 border-error/20' : 'bg-accent/[0.03] border-accent/20'""",
    """selectedCandidate.applicability_domain === 'outside_domain' ? 'bg-error/10 border-error/20' : 'bg-muted-bg border-border/20'"""
)

qm_content = qm_content.replace(
    """<span className={`text-xs font-black ${selectedCandidate.applicability_domain === 'outside_domain' ? 'text-error' : 'text-emerald-500'}`}>
                        {selectedCandidate.applicability_domain}
                      </span>""",
    """<span className={`text-xs font-black ${selectedCandidate.applicability_domain === 'outside_domain' ? 'text-error' : selectedCandidate.applicability_domain === 'within_domain' ? 'text-emerald-500' : 'text-muted-text'}`}>
                        {selectedCandidate.applicability_domain === 'Not Available' ? 'Pending Computation' : selectedCandidate.applicability_domain}
                      </span>"""
)

with open(qm_path, "w", encoding="utf-8") as f:
    f.write(qm_content)


# 2. Update SimulationPage
with open(sim_path, "r", encoding="utf-8") as f:
    sim_content = f.read()

# Remove Mock Arrays
sim_content = re.sub(r"const STABILITY_RESULTS = \[\s*\{.*?\}\s*\];", "", sim_content, flags=re.DOTALL)
sim_content = re.sub(r"const ACTIVE_MD_JOBS = \[\s*\{.*?\}\s*\];", "", sim_content, flags=re.DOTALL)

# displaySim map
old_displaySim = """  const displaySim = isDemoMode()
    ? STABILITY_RESULTS
    : realSim.map((r: any) => ({
        candidate: r.compound_id || "CAND-MD",
        target: r.metadata?.target || "EGFR WT",
        rmsdAvg: r.rmsd_avg !== undefined && r.rmsd_avg !== null ? r.rmsd_avg : 1.2,
        rmsdMax: r.rmsd_max !== undefined && r.rmsd_max !== null ? r.rmsd_max : 1.8,
        mmgbsa: r.mmgbsa !== undefined && r.mmgbsa !== null ? r.mmgbsa : -64.2,
        hBondOccupancy: r.hbond_occupancy !== undefined && r.hbond_occupancy !== null ? r.hbond_occupancy : 92,
        stability: r.stability || "Stable",
        artifact: r.metadata?.trajectory_file || "traj.xtc",
        status: "completed"
      }));"""

new_displaySim = """  const displaySim = realSim.map((r: any) => ({
        candidate: r.compound_id || "CAND-MD",
        target: r.metadata?.target || "Pending",
        rmsdAvg: r.rmsd_avg !== undefined && r.rmsd_avg !== null ? r.rmsd_avg : "Not Available",
        rmsdMax: r.rmsd_max !== undefined && r.rmsd_max !== null ? r.rmsd_max : "Not Available",
        mmgbsa: r.mmgbsa !== undefined && r.mmgbsa !== null ? r.mmgbsa : "Not Available",
        hBondOccupancy: r.hbond_occupancy !== undefined && r.hbond_occupancy !== null ? r.hbond_occupancy : "Not Available",
        stability: r.stability || "Not Available",
        artifact: r.metadata?.trajectory_file || "Not Available",
        status: r.status || "Pending Computation"
      }));"""
sim_content = sim_content.replace(old_displaySim, new_displaySim)

# Remove ACTIVE_MD_JOBS render block
old_active_jobs = """            {/* 3. Active Simulation Jobs */}
            {isDemoMode() && (
              <div className="ui-card-surface p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-accent">Active Simulation Jobs</h4>
                <div className="space-y-3">
                  {ACTIVE_MD_JOBS.map(job => (
                    <div key={job.name} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-text">{job.name}</span>
                          <span className="text-muted-text">{job.progress}%</span>
                       </div>
                       <div className="h-1 w-full bg-border/20 rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${job.progress}%` }} />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}"""
sim_content = sim_content.replace(old_active_jobs, "")

# Table render
old_table = """                      <td className="px-4 py-3 text-center font-mono text-xs text-text">{res.rmsdAvg ? `${res.rmsdAvg}Å` : '---'}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs font-black text-emerald-500">{res.mmgbsa ? `${res.mmgbsa}` : '---'}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-text">{res.hBondOccupancy ? `${res.hBondOccupancy}%` : '---'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          res.stability === 'Stable' ? 'text-success' : res.stability === 'Fluctuating' ? 'text-warning' : 'text-muted-text/40'
                        }`}>
                          {res.stability}
                        </span>
                      </td>"""

new_table = """                      <td className="px-4 py-3 text-center font-mono text-xs text-text">{res.rmsdAvg !== "Not Available" ? `${res.rmsdAvg}Å` : 'Not Available'}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs font-black text-emerald-500">{res.mmgbsa !== "Not Available" ? `${res.mmgbsa}` : 'Not Available'}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-text">{res.hBondOccupancy !== "Not Available" ? `${res.hBondOccupancy}%` : 'Not Available'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          res.stability === 'Stable' ? 'text-success' : res.stability === 'Fluctuating' ? 'text-warning' : 'text-muted-text/40'
                        }`}>
                          {res.stability}
                        </span>
                      </td>"""
sim_content = sim_content.replace(old_table, new_table)

# MMGBSA panel
old_mmgbsa = """                 <div className="space-y-3 text-[11px]">
                    <div className="flex justify-between py-1.5 border-b border-border/20">
                       <span className="font-bold text-muted-text">van der Waals</span>
                       <span className="font-mono text-text">-72.4 kcal/mol</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/20">
                       <span className="font-bold text-muted-text">Electrostatic</span>
                       <span className="font-mono text-text">-24.8 kcal/mol</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/20">
                       <span className="font-bold text-muted-text">Solvation Penalty</span>
                       <span className="font-mono text-error">+33.0 kcal/mol</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/20">
                       <span className="font-bold text-muted-text">Confidence</span>
                       <span className="font-mono text-accent">0.94</span>
                    </div>
                 </div>"""
new_mmgbsa = """                 <div className="space-y-3 text-[11px]">
                    <div className="flex justify-center py-4 border border-dashed border-border/40 rounded-lg">
                       <span className="font-bold text-muted-text/60 text-[10px]">Detailed Breakdown Not Available</span>
                    </div>
                 </div>"""
sim_content = sim_content.replace(old_mmgbsa, new_mmgbsa)
sim_content = sim_content.replace("{selectedResult.mmgbsa || '---'}", "{selectedResult.mmgbsa !== 'Not Available' ? selectedResult.mmgbsa : 'Pending'}")

# RMSD graph
old_rmsd = """            {/* 5. RMSD / RMSF Chart Area */}
            <div className="ui-card-surface p-5 space-y-4" data-testid="simulation-rmsd-chart">
               <h4 className="text-xs font-black uppercase tracking-widest text-accent">RMSD Over Time</h4>
               <div className="h-32 w-full relative">
                  {/* Chart SVG */}
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                     <path d="M0 35 Q 10 30, 20 25 T 40 28 T 60 22 T 80 24 T 100 20" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent" />
                     <path d="M0 40 L 100 40" stroke="currentColor" strokeWidth="0.5" className="text-border" />
                     <path d="M0 0 L 0 40" stroke="currentColor" strokeWidth="0.5" className="text-border" />
                  </svg>
                  <div className="absolute top-0 right-0 text-[9px] font-mono text-muted-text">Avg: {selectedResult.rmsdAvg || '--'}Å</div>
               </div>
               
               <h4 className="text-xs font-black uppercase tracking-widest text-accent mt-4">RMSF by Residue</h4>
               <div className="h-24 w-full flex items-end gap-0.5">
                  {[2,4,3,8,5,2,3,6,12,8,4,3,2,5,7,9,4,3,2,1,4,6,8,5,3].map((v, i) => (
                    <div key={i} className="flex-1 bg-accent/20 rounded-t-[1px]" style={{ height: `${v * 8}%` }} />
                  ))}
               </div>
            </div>"""

new_rmsd = """            {/* 5. RMSD / RMSF Chart Area */}
            <div className="ui-card-surface p-5 space-y-4" data-testid="simulation-rmsd-chart">
               <h4 className="text-xs font-black uppercase tracking-widest text-accent">RMSD Over Time</h4>
               <div className="h-32 w-full flex items-center justify-center border border-dashed border-border/40 rounded-lg">
                  <span className="font-bold text-muted-text/60 text-[10px]">Simulation graph not available</span>
               </div>
               
               <h4 className="text-xs font-black uppercase tracking-widest text-accent mt-4">RMSF by Residue</h4>
               <div className="h-24 w-full flex items-center justify-center border border-dashed border-border/40 rounded-lg">
                  <span className="font-bold text-muted-text/60 text-[10px]">RMSF data not available</span>
               </div>
            </div>"""
sim_content = sim_content.replace(old_rmsd, new_rmsd)

# Metrics Cards
old_metrics = """        <MetricCard label="Simulated Candidates" value={isDemoMode() ? "42" : displaySim.length.toString()} helperText="MD runs completed" status="completed" />
        <MetricCard label="Active MD Jobs" value="0" helperText="HPC threads active" status="completed" />
        <MetricCard label="Stable Complexes" value={isDemoMode() ? "12" : displaySim.filter(s => s.stability === "Stable").length.toString()} helperText="RMSD < 2.0Å" status="completed" />
        <MetricCard label="Best MMGBSA" value={selectedResult ? selectedResult.mmgbsa?.toString() || "---" : "---"} unit="kcal/mol" helperText={selectedResult ? selectedResult.candidate : "---"} status="active" />
        <MetricCard label="Trajectory Artifacts" value={isDemoMode() ? "128" : (displaySim.length * 3).toString()} unit="GB" helperText="Binary storage" status="completed" />"""

new_metrics = """        <MetricCard label="Simulated Candidates" value={displaySim.length.toString()} helperText="MD runs completed" status="completed" />
        <MetricCard label="Active MD Jobs" value="0" helperText="HPC threads active" status="completed" />
        <MetricCard label="Stable Complexes" value={displaySim.filter(s => s.stability === "Stable").length.toString()} helperText="RMSD < 2.0Å" status="completed" />
        <MetricCard label="Best MMGBSA" value={selectedResult && selectedResult.mmgbsa !== "Not Available" ? selectedResult.mmgbsa.toString() : "---"} unit="kcal/mol" helperText={selectedResult ? selectedResult.candidate : "---"} status="active" />
        <MetricCard label="Trajectory Artifacts" value={(displaySim.length * 3).toString()} unit="GB" helperText="Binary storage" status="completed" />"""
sim_content = sim_content.replace(old_metrics, new_metrics)

with open(sim_path, "w", encoding="utf-8") as f:
    f.write(sim_content)

print("Workflow refactor completed")
