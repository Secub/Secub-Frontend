const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");
export const ITIS_API_BASE_URL = `${API_BASE_URL}/itis`;

/**
 * While true, data is read from and written to an in-browser mock
 * (localStorage) instead of the REST API. Defaults to true. Set
 * `VITE_USE_MOCK_BACKEND=false` (with a real `VITE_API_BASE_URL`) to hit the
 * API. See `docs/BACKEND_INTEGRATION.md`.
 */
export const USE_MOCK_BACKEND =
  String(import.meta.env.VITE_USE_MOCK_BACKEND ?? "true").toLowerCase() !== "false";
