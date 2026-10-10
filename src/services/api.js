const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5000/api";

export function getToken() {
  const token = localStorage.getItem("finora_token");

  if (
    !token ||
    token === "undefined" ||
    token === "null" ||
    token.trim() === ""
  ) {
    return null;
  }

  return token;
}

export function getStoredUser() {
  try {
    const user = localStorage.getItem("finora_user");

    if (!user || user === "undefined") {
      return null;
    }

    return JSON.parse(user);
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

  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.delete("Authorization");
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to Finora. Check your internet connection or backend server."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 || response.status === 422) {
    const authError = String(data.msg || "").toLowerCase();

    const invalidToken =
      response.status === 401 ||
      authError.includes("token") ||
      authError.includes("subject") ||
      authError.includes("signature") ||
      authError.includes("authorization");

    if (invalidToken && token) {
      clearSession();

      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.replace("/login");
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      data.msg ||
      `Request failed (${response.status}).`
    );
  }

  return data;
}