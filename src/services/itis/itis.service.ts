import { httpClient } from "../../infrastructure/api";

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

export function requestItis<T = unknown>(
  service: ItisServiceName,
  options: ItisRequestOptions = {},
): Promise<T> {
  const path = `/itis/${service}`;
  if (options.method === "POST") {
    return httpClient.post<T>(path, options.body ?? {}, { signal: options.signal });
  }
  return httpClient.get<T>(path, { query: options.query, signal: options.signal });
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
