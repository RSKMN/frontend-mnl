import requests
import time

base = "https://lid-webster-impaired-cut.trycloudflare.com/api/v1"
email = f"test_{int(time.time())}@gmail.com"

# Register
res = requests.post(f"{base}/auth/register", json={"email": email, "password": "Password123!", "full_name": "Test User"})
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Workspace
ws = requests.post(f"{base}/workspaces", headers=headers, json={"name": "W1"}).json()
ws_id = ws["id"]

# Project
proj = requests.post(f"{base}/projects?workspace_id={ws_id}", headers=headers, json={"name": "P1", "description": ""}).json()
p_id = proj["id"]

print("Project:", p_id)

# Readiness initial
read_init = requests.get(f"{base}/projects/{p_id}/pipeline/readiness", headers=headers).json()
print("Initial:", read_init)

# Upload FASTA
with open("e2e/fixtures/protein.fasta", "rb") as f:
    u1 = requests.post(f"{base}/projects/{p_id}/files/upload", headers=headers, files={"file": f}).json()
print("Fasta file:", u1)
requests.patch(f"{base}/projects/{p_id}/inputs/files", headers=headers, json={"fasta_file_id": u1["file_id"]})

# Upload PDB
with open("e2e/fixtures/protein.pdb", "rb") as f:
    u2 = requests.post(f"{base}/projects/{p_id}/files/upload", headers=headers, files={"file": f}).json()
print("PDB file:", u2)
requests.patch(f"{base}/projects/{p_id}/inputs/files", headers=headers, json={"protein_structure_file_id": u2["file_id"]})

# Final readiness
read_final = requests.get(f"{base}/projects/{p_id}/pipeline/readiness", headers=headers).json()
print("Final:", read_final)
