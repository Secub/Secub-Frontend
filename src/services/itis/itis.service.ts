import { ITIS_API_BASE_URL } from "../../config/api.config";

export type ItisServiceName =
  | "catalogo-organizacional"
  | "programas-planes-academicos"
  | "programacion-clases"
  | "inscripciones-calificaciones"
  | "docentes-directores";

type QueryPrimitive = string | number | boolean;
export type ItisQuery = Record<
  string,
  QueryPrimitive | QueryPrimitive[] | null | undefined
>;

interface ItisRequestOptions {
  method?: "GET" | "POST";
  query?: ItisQuery;
  body?: unknown;
  signal?: AbortSignal;
}

function createUrl(service: ItisServiceName, query?: ItisQuery): string {
  const queryString = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(query ?? {})) {
    if (rawValue === undefined || rawValue === null || rawValue === "") {
      continue;
    }

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    for (const value of values) queryString.append(key, String(value));
  }

  const suffix = queryString.size > 0 ? `?${queryString.toString()}` : "";
  return `${ITIS_API_BASE_URL}/${service}${suffix}`;
}

export async function requestItis<T = unknown>(
  service: ItisServiceName,
  options: ItisRequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const response = await fetch(createUrl(service, options.query), {
    method,
    headers: method === "POST" ? { "Content-Type": "application/json" } : {},
    body: method === "POST" ? JSON.stringify(options.body ?? {}) : undefined,
    signal: options.signal,
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null
        ? "message" in payload && typeof payload.message === "string"
          ? payload.message
          : "error" in payload && typeof payload.error === "string"
            ? payload.error
            : `La solicitud a ITIS falló con estado ${response.status}.`
        : `La solicitud a ITIS falló con estado ${response.status}.`;
    throw new Error(message);
  }

  return payload as T;
}

function get<T>(service: ItisServiceName, query?: ItisQuery): Promise<T> {
  return requestItis<T>(service, { query });
}

function post<T>(service: ItisServiceName, body: unknown): Promise<T> {
  return requestItis<T>(service, { method: "POST", body });
}

export const itisService = {
  catalogoOrganizacional: <T = unknown>(query?: ItisQuery) =>
    get<T>("catalogo-organizacional", query),
  programasPlanesAcademicos: <T = unknown>(query?: ItisQuery) =>
    get<T>("programas-planes-academicos", query),
  programacionClases: <T = unknown>(query?: ItisQuery) =>
    get<T>("programacion-clases", query),
  inscripcionesCalificaciones: <T = unknown>(query?: ItisQuery) =>
    get<T>("inscripciones-calificaciones", query),
  docentesDirectores: <T = unknown>(query?: ItisQuery) =>
    get<T>("docentes-directores", query),
  consultar: post,
};
