const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
export function getToken() {
  return localStorage.getItem("finora_token");
}
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("finora_user") || "null");
  } catch {
    return null;
  }
}
export function clearSession() {
  localStorage.removeItem("finora_token");
  localStorage.removeItem("finora_user");
}
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    clearSession();
    if (!location.pathname.includes("/login")) location.href = "/login";
  }
  if (!response.ok)
    throw new Error(data.error || data.message || "Something went wrong.");
  return data;
}
