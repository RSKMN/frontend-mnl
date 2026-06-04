import os

file_path = r"e:\rskmn\Npersonal\quinfosys\drug_discovery_research\work\mnl\frontend-mnl\src\components\views\MoleculesView.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove CANDIDATES array
import re
# Find `const CANDIDATES = [ ... ];`
content = re.sub(r"const CANDIDATES = \[\s*\{.*?\}\s*\];", "", content, flags=re.DOTALL)

# 2. Remove CLUSTERS array
content = re.sub(r"const CLUSTERS = \[\s*\{.*?\}\s*\];", "", content, flags=re.DOTALL)

# 3. displayMolecules mapping
old_mapping = """  const displayMolecules = isDemoMode()
    ? CANDIDATES
    : realMolecules.map((m: any) => ({
        id: m.compound_id || m.id,
        target: m.metadata?.target || "EGFR WT",
        smiles: m.smiles,
        dockingScore: m.metadata?.docking_score || m.metadata?.binding_energy || -8.5,
        admetRisk: m.metadata?.admet_risk || "Low",
        novelty: m.metadata?.novelty || 0.85,
        qed: m.qed !== undefined && m.qed !== null ? m.qed : 0.72,
        logp: m.logp !== undefined && m.logp !== null ? m.logp : 3.2,
        saScore: m.metadata?.sa_score || 2.1,
        quantumRank: m.metadata?.quantum_rank || 1,
        status: m.status || "completed"
      }));"""

new_mapping = """  const displayMolecules = realMolecules.map((m: any) => ({
        id: m.compound_id || m.id,
        target: m.metadata?.target || "Pending",
        smiles: m.smiles,
        dockingScore: m.metadata?.docking_score || m.metadata?.binding_energy || "Not Available",
        admetRisk: m.metadata?.admet_risk || "Pending",
        novelty: m.metadata?.novelty !== undefined ? m.metadata.novelty : "Not Available",
        qed: m.qed !== undefined && m.qed !== null ? m.qed : "Not Available",
        logp: m.logp !== undefined && m.logp !== null ? m.logp : "Not Available",
        saScore: m.metadata?.sa_score !== undefined ? m.metadata.sa_score : "Not Available",
        quantumRank: m.metadata?.quantum_rank !== undefined ? m.metadata.quantum_rank : "Not Available",
        status: m.status || "Pending"
      }));"""
content = content.replace(old_mapping, new_mapping)

# 4. Data source checks
content = content.replace(
    'dataSource={isDemoMode() ? "mock" : (realMolecules.length > 0 ? "real" : "missing")}',
    'dataSource={realMolecules.length > 0 ? "real" : "missing"}'
)

content = content.replace(
"""        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
          isDemoMode() ? "bg-warning/20 text-warning" :
          dataSource === "IMPORTED Q-AI-DRUG DATA" ? "bg-emerald-500/20 text-emerald-400" :
          "bg-accent/20 text-accent"
        }`}>
          {isDemoMode() ? "MOCK DATA" : dataSource}
        </span>""",
"""        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
          dataSource === "IMPORTED Q-AI-DRUG DATA" ? "bg-emerald-500/20 text-emerald-400" :
          "bg-accent/20 text-accent"
        }`}>
          {dataSource}
        </span>"""
)

# 5. Metrics Cards
old_metrics = """        <MetricCard label="Generated" value={isDemoMode() ? "15,000" : realMolecules.length.toString()} helperText="Total molecules" status="completed" />
        <MetricCard label="Filtered" value={isDemoMode() ? "1,500" : Math.ceil(realMolecules.length * 0.8).toString()} helperText="Passed basic filters" status="active" />
        <MetricCard label="Selected" value={selectedIds.length.toString()} helperText="Selected leads" status="completed" />
        <MetricCard label="Novel Scaffolds" value={isDemoMode() ? "42" : "6"} helperText="Unique clusters" status="completed" />
        <MetricCard label="ADMET Warnings" value={isDemoMode() ? "12" : "0"} helperText="Requires review" status="warning" />"""

new_metrics = """        <MetricCard label="Generated" value={realMolecules.length.toString()} helperText="Total molecules" status="completed" />
        <MetricCard label="Filtered" value={Math.ceil(realMolecules.length * 0.8).toString()} helperText="Passed basic filters" status="active" />
        <MetricCard label="Selected" value={selectedIds.length.toString()} helperText="Selected leads" status="completed" />
        <MetricCard label="Novel Scaffolds" value="Pending" helperText="Unique clusters" status="completed" />
        <MetricCard label="ADMET Warnings" value="Pending" helperText="Requires review" status="warning" />"""

content = content.replace(old_metrics, new_metrics)

# 6. Clustering
old_clusters = """              {CLUSTERS.map(cluster => (
                <div key={cluster.name} className="p-3 rounded-lg bg-muted-bg/50 border border-border/20 group hover:border-accent/30 cursor-pointer transition-all">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-black text-text">{cluster.name}</span>
                    <span className="text-[10px] font-black text-accent">{cluster.count}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                    <span className="text-muted-text/50">Avg Dock: {cluster.avgScore}</span>
                    <span className={cluster.risk === 'Low' ? 'text-success' : cluster.risk === 'Medium' ? 'text-warning' : 'text-error'}>
                      Risk: {cluster.risk}
                    </span>
                  </div>
                </div>
              ))}"""

new_clusters = """              <div className="p-3 rounded-lg bg-muted-bg/50 border border-dashed border-border/40 flex items-center justify-center text-center">
                <span className="text-[10px] font-bold text-muted-text/60">Clustering not available</span>
              </div>"""

content = content.replace(old_clusters, new_clusters)

# 7. ADMET risk text color class
content = content.replace(
    "mol.admetRisk === 'Low' ? 'text-success' : mol.admetRisk === 'Medium' ? 'text-warning' : 'text-error'",
    "mol.admetRisk === 'Low' ? 'text-success' : mol.admetRisk === 'Medium' ? 'text-warning' : mol.admetRisk === 'High' ? 'text-error' : 'text-muted-text'"
)

# 8. Q-Rank format #N/A vs Not Available
content = content.replace(
    "#{mol.quantumRank}",
    "{mol.quantumRank !== 'Not Available' ? `#${mol.quantumRank}` : '-'}"
)

# 9. ADMET table risk badge `mol.admetRisk[0]`
content = content.replace(
    "{mol.admetRisk[0]}",
    "{mol.admetRisk === 'Pending' ? '-' : mol.admetRisk[0]}"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")
