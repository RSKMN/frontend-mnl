const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");

async function test() {
  const base = "https://lid-webster-impaired-cut.trycloudflare.com/api/v1";
  const email = "test_" + Date.now() + "@gmail.com";
  
  // Register
  const regRes = await fetch(base + "/auth/register", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Password123!", full_name: "Test User" })
  });
  const auth = await regRes.json();
  const token = auth.access_token;
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
  
  // Workspace
  const wsRes = await fetch(base + "/workspaces", { method: "POST", headers, body: JSON.stringify({ name: "W1" }) });
  const ws = await wsRes.json();
  
  // Project
  const pRes = await fetch(base + "/projects?workspace_id=" + ws.id, { method: "POST", headers, body: JSON.stringify({ name: "P1", description: "" }) });
  const proj = await pRes.json();
  const projectId = proj.id;
  
  console.log("Project:", projectId);
  
  // Check Readiness
  let readRes = await fetch(base + "/projects/" + projectId + "/pipeline/readiness", { headers });
  console.log("Initial:", await readRes.text());
  
  // Upload FASTA
  const fData1 = new FormData();
  fData1.append("file", fs.createReadStream(path.resolve(__dirname, "e2e/fixtures/protein.fasta")));
  const u1 = await fetch(base + "/projects/" + projectId + "/files/upload", { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: fData1 });
  const file1 = await u1.json();
  console.log("File1:", file1);
  
  await fetch(base + "/projects/" + projectId + "/inputs/files", { method: "PATCH", headers, body: JSON.stringify({ fasta_file_id: file1.file_id }) });
  
  // Upload PDB
  const fData2 = new FormData();
  fData2.append("file", fs.createReadStream(path.resolve(__dirname, "e2e/fixtures/protein.pdb")));
  const u2 = await fetch(base + "/projects/" + projectId + "/files/upload", { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: fData2 });
  const file2 = await u2.json();
  console.log("File2:", file2);
  
  await fetch(base + "/projects/" + projectId + "/inputs/files", { method: "PATCH", headers, body: JSON.stringify({ protein_structure_file_id: file2.file_id }) });
  
  // Check Readiness again
  readRes = await fetch(base + "/projects/" + projectId + "/pipeline/readiness", { headers });
  console.log("Final:", await readRes.text());
}
test().catch(console.error);
