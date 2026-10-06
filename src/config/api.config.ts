const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");
export const ITIS_API_BASE_URL = `${API_BASE_URL}/itis`;
