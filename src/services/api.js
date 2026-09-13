const BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("finora_token");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data.message || data.error || "Something went wrong");
  return data;
}
