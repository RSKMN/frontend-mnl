"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import ActionButtonGroup, { ActionButton } from "@/components/ui/ActionButtonGroup";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionHeader from "@/components/ui/SectionHeader";
import { apiClient } from "@/services";

const ThreeDMoleculeViewer = dynamic(() => import("@/components/molecules/ThreeDMoleculeViewer"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[600px] flex flex-col items-center justify-center rounded-2xl border animate-pulse bg-muted-bg/30 border-border/20">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="mt-4 text-xs font-black uppercase tracking-widest text-muted-text/50">Initializing 3D Workbench...</span>
    </div>
  ),
});

// Mock data fallbacks for the program if backend has no results yet
const MOCK_POSES = [
  { id: "Pose 01", affinity: -10.2, cnnScore: 0.942, rmsd: 1.2, status: "completed", result_id: "mock_1", pose_file_id: null },
  { id: "Pose 02", affinity: -9.8, cnnScore: 0.885, rmsd: 0.8, status: "completed", result_id: "mock_2", pose_file_id: null },
  { id: "Pose 03", affinity: -9.5, cnnScore: 0.810, rmsd: 1.5, status: "completed", result_id: "mock_3", pose_file_id: null },
];

const MOCK_RESIDUES = [
  { name: "MET793", type: "H-Bond", distance: "2.8Å", confidence: 98 },
  { name: "LYS745", type: "Salt Bridge", distance: "3.2Å", confidence: 95 },
  { name: "ASP855", type: "Hydrophobic", distance: "3.8Å", confidence: 92 },
  { name: "THR790", type: "Gatekeeper", distance: "4.2Å", confidence: 99 },
];

const MOCK_INTERACTIONS = [
  { label: "Hydrogen Bonds", count: 4, color: "bg-cyan-500" },
  { label: "Hydrophobic Contacts", count: 12, color: "bg-emerald-500" },
  { label: "Pi-Stacking", count: 2, color: "bg-indigo-500" },
  { label: "Salt Bridges", count: 1, color: "bg-amber-500" },
];

function VisualizationPageContent() {
  const searchParams = useSearchParams();
  const queryResultId = searchParams.get("result_id");
  const queryPoseFileId = searchParams.get("pose_file_id");

  const [dataSource, setDataSource] = useState<string>("MOCK DATA");
  const [proteins, setProteins] = useState<any[]>([]);
  const [ligands, setLigands] = useState<any[]>([]);
  const [poses, setPoses] = useState<any[]>([]);
  
  const [selectedProteinId, setSelectedProteinId] = useState<string>("");
  const [selectedLigandId, setSelectedLigandId] = useState<string>("");
  const [selectedPose, setSelectedPose] = useState<any>(MOCK_POSES[0]);

  const [viewerSource, setViewerSource] = useState<any>(null);
  const [viewerLoading, setViewerLoading] = useState<boolean>(false);

  // Interaction network & residue states
  const [residues, setResidues] = useState<any[]>(MOCK_RESIDUES);
  const [interactions, setInteractions] = useState<any[]>(MOCK_INTERACTIONS);

  // Stats cards states
  const [stats, setStats] = useState({
    affinity: "-10.2",
    cnnScore: "0.94",
    hBondsCount: "4",
    rmsd: "1.2Å"
  });

  // Fetch initial viewer assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const projectId = localStorage.getItem("active_project_id");
        if (!projectId) return;

        const res = await apiClient.get<any>(`/projects/${projectId}/viewer/assets`);
        if (res.success && res.data && res.data.assets) {
          const list: any[] = res.data.assets;
          
          const proteinList = list.filter(a => a.asset_type === "protein_structure");
          const ligandList = list.filter(a => a.asset_type === "ligand");
          const poseList = list.filter(a => a.asset_type === "docking_pose" || a.asset_type === "gnina_pose");

          setProteins(proteinList);
          setLigands(ligandList);
          
          if (poseList.length > 0) {
            const mappedPoses = poseList.map((p, idx) => ({
              id: p.metadata?.compound_id || p.filename || `Pose ${idx + 1}`,
              affinity: p.metadata?.binding_affinity_kcal_mol || -8.5,
              cnnScore: p.metadata?.cnn_pose_score || 0.85,
              rmsd: 1.0,
              status: "completed",
              result_id: p.linked_result_id || p.asset_id,
              pose_file_id: p.file_id
            }));
            setPoses(mappedPoses);
            setDataSource("REAL BACKEND DATA");

            // Handle query deep linking if specified
            if (queryResultId) {
              const matched = mappedPoses.find(p => p.result_id === queryResultId);
              if (matched) {
                setSelectedPose(matched);
              } else {
                setSelectedPose(mappedPoses[0]);
              }
            } else {
              setSelectedPose(mappedPoses[0]);
            }
          }

          if (proteinList.length > 0) {
            setSelectedProteinId(proteinList[0].asset_id);
          }
          if (ligandList.length > 0) {
            setSelectedLigandId(ligandList[0].asset_id);
          }
        }
      } catch (err) {
        console.error("Failed to retrieve viewer assets", err);
      }
    };

    fetchAssets();
  }, [queryResultId]);

  // Handle direct file query parameter fallback
  useEffect(() => {
    if (queryPoseFileId) {
      setSelectedPose({
        id: "Deep Linked Conformation",
        affinity: -9.5,
        cnnScore: 0.91,
        rmsd: 1.1,
        status: "completed",
        result_id: queryResultId || "deep_link",
        pose_file_id: queryPoseFileId
      });
    }
  }, [queryPoseFileId, queryResultId]);

  // When selected pose changes, fetch details & download pose file
  useEffect(() => {
    if (!selectedPose || !selectedPose.pose_file_id) {
      // Fallback smiles or local mock representation
      setViewerSource({
        format: "smiles",
        value: "CC(=O)OC1=CC=CC=C1C(=O)O",
        label: "Aspirin (Mock Fallback)"
      });
      return;
    }

    const fetchPoseData = async () => {
      setViewerLoading(true);
      try {
        const projectId = localStorage.getItem("active_project_id");
        if (!projectId) return;

        // Fetch pose metadata
        const metadataRes = await apiClient.get<any>(`/projects/${projectId}/viewer/pose/${selectedPose.result_id}`);
        if (metadataRes.success && metadataRes.data) {
          const data = metadataRes.data;
          
          // Update stats dynamically
          const aff = data.scores?.binding_affinity_kcal_mol !== undefined ? String(data.scores.binding_affinity_kcal_mol) : "-8.5";
          const cnn = data.scores?.cnn_pose_score !== undefined ? String(data.scores.cnn_pose_score) : "0.85";
          setStats(prev => ({
            ...prev,
            affinity: aff,
            cnnScore: cnn,
            rmsd: selectedPose.rmsd ? `${selectedPose.rmsd}Å` : "1.0Å"
          }));

          // Download visualizable structure file content
          const token = localStorage.getItem("auth_token");
          const downloadUrl = `/api/v1/files/${data.pose_file_id}/download`;
          
          const fileRes = await fetch(downloadUrl, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });

          if (fileRes.ok) {
            const structureText = await fileRes.text();
            setViewerSource({
              format: data.viewer_format === "sdf" ? "sdf" : (data.viewer_format === "pdb" ? "pdb" : "sdf"),
              value: structureText,
              label: selectedPose.id
            });
          }
        }

        // Fetch interaction fingerprint
        const fpRes = await apiClient.get<any>(`/projects/${projectId}/viewer/interaction-fingerprint/${selectedPose.result_id}`);
        if (fpRes.success && fpRes.data && fpRes.data.available) {
          const fp = fpRes.data.interaction_fingerprint;
          
          // Map to residues array
          const resList: any[] = [];
          let hBonds = 0;
          let hydrophobics = 0;
          let piStacks = 0;
          let saltBridges = 0;

          if (fp.hydrogen_bonds) {
            hBonds = fp.hydrogen_bonds.length;
            fp.hydrogen_bonds.forEach((b: any) => {
              resList.push({ name: b.residue || "Residue", type: "H-Bond", distance: b.distance || "2.9Å", confidence: 95 });
            });
          }
          if (fp.hydrophobic_contacts) {
            hydrophobics = fp.hydrophobic_contacts.length;
            fp.hydrophobic_contacts.forEach((b: any) => {
              resList.push({ name: b.residue || "Residue", type: "Hydrophobic", distance: b.distance || "3.8Å", confidence: 90 });
            });
          }
          if (fp.pi_stacking) {
            piStacks = fp.pi_stacking.length;
            fp.pi_stacking.forEach((b: any) => {
              resList.push({ name: b.residue || "Residue", type: "Pi-Stacking", distance: b.distance || "4.1Å", confidence: 85 });
            });
          }
          if (fp.salt_bridges) {
            saltBridges = fp.salt_bridges.length;
            fp.salt_bridges.forEach((b: any) => {
              resList.push({ name: b.residue || "Residue", type: "Salt Bridge", distance: b.distance || "3.4Å", confidence: 92 });
            });
          }

          setResidues(resList.slice(0, 8));
          setStats(prev => ({ ...prev, hBondsCount: String(hBonds) }));

          setInteractions([
            { label: "Hydrogen Bonds", count: hBonds, color: "bg-cyan-500" },
            { label: "Hydrophobic Contacts", count: hydrophobics, color: "bg-emerald-500" },
            { label: "Pi-Stacking", count: piStacks, color: "bg-indigo-500" },
            { label: "Salt Bridges", count: saltBridges, color: "bg-amber-500" },
          ]);
        }
      } catch (err) {
        console.error("Error loading active pose details", err);
      } finally {
        setViewerLoading(false);
      }
    };

    fetchPoseData();
  }, [selectedPose]);

  const activePoseList = poses.length > 0 ? poses : MOCK_POSES;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Structural Discovery Workbench"
        breadcrumb="Research / 3D structural discovery"
        description="Immersive 3D molecular inspection of protein-ligand complexes. Analyze binding pocket residues, docking pose overlays, and residue-level interaction networks."
        actions={
          <ActionButtonGroup>
            <ActionButton label="Export View" variant="outline" />
            <ActionButton label="Compare Poses" variant="secondary" />
            <ActionButton label="Ask Pharma LLM" variant="primary" />
          </ActionButtonGroup>
        }
      />

      {/* Real Data Provenance Badge */}
      <div className="flex items-center gap-2 px-6 py-2 bg-muted-bg border border-border/20 rounded-lg max-w-max" data-testid="data-source-badge">
        <span className="text-[10px] font-bold text-muted-text/60 uppercase tracking-widest">Data Source:</span>
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
          dataSource === "REAL BACKEND DATA" ? "bg-emerald-500/20 text-emerald-400" : "bg-warning/20 text-warning"
        }`}>
          {dataSource}
        </span>
      </div>

      {/* 2. Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Complex Stability" value="High" helperText="RMSD < 1.5Å" status="completed" />
        <MetricCard label="Best Affinity" value={stats.affinity} unit="kcal/mol" helperText={selectedPose?.id || "Pose 01"} status="completed" />
        <MetricCard label="CNN Confidence" value={stats.cnnScore} helperText="GNINA Rescore" status="active" />
        <MetricCard label="H-Bonds" value={stats.hBondsCount} helperText="Active network" status="completed" />
        <MetricCard label="Pocket Fit" value="Optimal" helperText="Surface complementarity" status="completed" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Left Column: Viewer Workspace & Details */}
        <div className="lg:col-span-3 space-y-8">
          {/* 2. Viewer Workspace */}
          <div className="ui-card-surface overflow-hidden relative group h-[700px]">
            {viewerLoading ? (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center rounded-2xl border animate-pulse bg-muted-bg/30 border-border/20">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="mt-4 text-xs font-black uppercase tracking-widest text-muted-text/50">Downloading Structure conformation...</span>
              </div>
            ) : (
              <ThreeDMoleculeViewer 
                title={selectedPose?.id ? `EGFR Protein + ${selectedPose.id}` : "EGFR Program Target"}
                subtitle="GNINA / Autodock Conformation Asset"
                className="h-full border-0 shadow-none"
                source={viewerSource}
              />
            )}
            
            {/* Overlay Info */}
            <div className="absolute top-20 left-6 z-20 pointer-events-none">
              <div className="p-4 rounded-xl border space-y-3 shadow-xl backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--card) 60%, transparent)", borderColor: "var(--border)" }}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-accent/80 tracking-widest">Active Pose</span>
                  <span className="text-sm font-black text-white">{selectedPose?.id || "Pose 01"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-text/60">Affinity</span>
                  <span className="text-sm font-black text-emerald-500">{stats.affinity} kcal/mol</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* 5. Residue Inspector */}
            <div className="space-y-4">
              <SectionHeader title="Residue Inspector" description="Key binding site contacts and interaction energies." />
              <div className="space-y-3">
                {residues.map((res, i) => (
                  <div key={i} className="ui-card-surface p-4 flex items-center justify-between group hover:border-accent/40 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted-bg flex items-center justify-center font-black text-xs text-accent">
                        {res.name}
                      </div>
                      <div>
                        <div className="text-xs font-black text-text">{res.type}</div>
                        <div className="text-[10px] text-muted-text">Distance: {res.distance}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-accent">{res.confidence}%</div>
                      <div className="text-[9px] font-bold text-muted-text uppercase">Conf.</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Pose List */}
            <div className="space-y-4">
              <SectionHeader title="Available Poses" description="Select structural poses for detailed interaction analysis." />
              <div className="ui-card-surface overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted-bg/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text/60 border-b border-border/40">
                      <th className="px-4 py-4">Pose</th>
                      <th className="px-4 py-4 text-center">Affinity</th>
                      <th className="px-4 py-4 text-center">CNN</th>
                      <th className="px-4 py-4 text-center">RMSD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {activePoseList.map(pose => (
                      <tr 
                        key={pose.id} 
                        className={`group hover:bg-muted-bg/20 transition-colors cursor-pointer ${selectedPose?.id === pose.id ? 'bg-accent/[0.03]' : ''}`}
                        onClick={() => setSelectedPose(pose)}
                      >
                        <td className="px-4 py-3 text-xs font-black text-text group-hover:text-accent">{pose.id}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-emerald-500">{pose.affinity}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-text">{pose.cnnScore}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-muted-text">{pose.rmsd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="w-full py-3 rounded-lg border border-dashed border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-text hover:text-text hover:border-accent/40 transition-all">
                Load More Poses
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Selectors & Controls */}
        <div className="space-y-6">
          {/* 3. Structure / Ligand Selector */}
          <div className="ui-card-surface p-5 space-y-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Structure Config
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-text/60">Protein Structure</label>
                <select 
                  value={selectedProteinId} 
                  onChange={(e) => setSelectedProteinId(e.target.value)}
                  className="w-full bg-muted-bg border border-border/40 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-accent/50 transition-all font-bold"
                >
                  {proteins.length > 0 ? (
                    proteins.map(p => (
                      <option key={p.asset_id} value={p.asset_id}>{p.filename}</option>
                    ))
                  ) : (
                    <>
                      <option>EGFR AlphaFold (P00533)</option>
                      <option>EGFR Crystal (PDB: 1M17)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-text/60">Ligand Candidate</label>
                <select 
                  value={selectedLigandId} 
                  onChange={(e) => setSelectedLigandId(e.target.value)}
                  className="w-full bg-muted-bg border border-border/40 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-accent/50 transition-all font-bold"
                >
                  {ligands.length > 0 ? (
                    ligands.map(l => (
                      <option key={l.asset_id} value={l.asset_id}>{l.filename}</option>
                    ))
                  ) : (
                    <>
                      <option>QDF-EGFR-001</option>
                      <option>QDF-EGFR-014</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-text/60">Binding Pocket</label>
                <select className="w-full bg-muted-bg border border-border/40 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-accent/50 transition-all font-bold">
                  <option>ATP-binding pocket</option>
                  <option>Allosteric site (C-helix)</option>
                  <option>Extracellular domain IV</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Overlay Controls */}
          <div className="ui-card-surface p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              View Layers
            </h4>
            <div className="space-y-2.5">
              {[
                { label: "Protein Surface", checked: false },
                { label: "Cartoon Representation", checked: true },
                { label: "Ligand Sticks", checked: true },
                { label: "Hydrogen Bonds", checked: true },
                { label: "Hydrophobic Contacts", checked: false },
                { label: "Pi-Stacking", checked: false },
                { label: "Pocket Residues", checked: true },
                { label: "Electrostatic Surface", checked: false },
              ].map(layer => (
                <label key={layer.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted-bg/50 cursor-pointer transition-all">
                  <span className="text-[11px] font-bold text-text-secondary">{layer.label}</span>
                  <input type="checkbox" defaultChecked={layer.checked} className="w-3.5 h-3.5 rounded border-border/40 text-accent focus:ring-accent accent-accent" />
                </label>
              ))}
            </div>
          </div>

          {/* 7. Interaction Summary */}
          <div className="ui-card-surface p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-accent">Interaction Network</h4>
            <div className="space-y-4">
              {interactions.map(int => (
                <div key={int.label} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-text/60">
                    <span>{int.label}</span>
                    <span className="text-text">{int.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                    <div className={`h-full ${int.color}`} style={{ width: `${(int.count / 15) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Viewer Actions */}
          <div className="flex flex-col gap-2">
            <button className="w-full py-3 rounded-lg bg-accent text-bg font-black uppercase tracking-[0.2em] text-[10px] hover:bg-accent/90 shadow-lg shadow-accent/10 transition-all">
              Initiate MD Refinement
            </button>
            <button className="w-full py-3 rounded-lg border border-border text-text font-black uppercase tracking-[0.2em] text-[10px] hover:bg-muted-bg transition-all">
              Compare with Benchmark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VisualizationPage() {
  return (
    <Suspense fallback={
      <div className="h-[600px] flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="mt-4 text-xs font-black uppercase tracking-widest text-muted-text/50">Loading Discovery Workspace...</span>
      </div>
    }>
      <VisualizationPageContent />
    </Suspense>
  );
}