const API_BASE = "/api";

async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
