import requests
base = "https://lid-webster-impaired-cut.trycloudflare.com/api/v1"
res = requests.post(f"{base}/auth/token", data={"username": "test_user_1780843023814@gmail.com", "password": "Password123!"})
print(res.json())
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
r = requests.get(f"{base}/projects/6a2582242a36ff5013885b1c/pipeline/readiness", headers=headers)
print("Readiness:", r.json())
p = requests.get(f"{base}/projects/6a2582242a36ff5013885b1c", headers=headers)
print("Project:", p.json())
