import { API_BASE_URL } from "../../config/api.config";
import { getBrowserOrigin } from "../../shared/browser";
import { ApiError } from "./ApiError";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type QueryValue = string | number | boolean | null | undefined;

export interface HttpRequestOptions {
  method?: HttpMethod;
  query?: Record<string, QueryValue | QueryValue[]>;
  body?: unknown;
  signal?: AbortSignal;
  headers?: HeadersInit;
}

type AccessTokenProvider = () => string | null | Promise<string | null>;
let accessTokenProvider: AccessTokenProvider = () => null;

export function setAccessTokenProvider(provider: AccessTokenProvider) {
  accessTokenProvider = provider;
}

function createUrl(path: string, query?: HttpRequestOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`, getBrowserOrigin());

  Object.entries(query ?? {}).forEach(([key, rawValue]) => {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    values.forEach((value) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  });

  return `${url.pathname}${url.search}`;
}

async function parseResponse(response: Response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json() as Promise<unknown>;
  const text = await response.text();
  return text || null;
}

function getErrorMessage(payload: unknown, status: number) {
  if (payload && typeof payload === "object") {
    if ("message" in payload && typeof payload.message === "string") return payload.message;
    if ("error" in payload && typeof payload.error === "string") return payload.error;
  }
  return `La solicitud falló con estado ${status}.`;
}

export async function request<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const token = await accessTokenProvider();
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(createUrl(path, options.query), {
    method,
    credentials: "include",
    headers,
    body: options.body === undefined
      ? undefined
      : options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body),
    signal: options.signal,
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    const code = payload && typeof payload === "object" && "code" in payload && typeof payload.code === "string"
      ? payload.code
      : undefined;
    throw new ApiError({
      message: getErrorMessage(payload, response.status),
      status: response.status,
      code,
      details: payload,
    });
  }

  return payload as T;
}

export const httpClient = {
  get: <T>(path: string, options: Omit<HttpRequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options: Omit<HttpRequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options: Omit<HttpRequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options: Omit<HttpRequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T = void>(path: string, options: Omit<HttpRequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
