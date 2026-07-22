import type { CrudRepository, ListQuery, PageResult } from "../../domain/repositories";
import { httpClient } from "../api";

function toQuery(query?: ListQuery) {
  return {
    page: query?.page,
    pageSize: query?.pageSize,
    search: query?.search,
    ...query?.filters,
  };
}

export function createHttpCrudRepository<
  T extends { id: string },
  TCreate = Omit<T, "id">,
  TUpdate = Partial<TCreate>,
>(resourcePath: string): CrudRepository<T, TCreate, TUpdate> {
  const resource = resourcePath.replace(/^\/+|\/+$/g, "");

  return {
    list: (query) => httpClient.get<PageResult<T>>(`/${resource}`, {
      query: toQuery(query),
      signal: query?.signal,
    }),
    getById: (id, signal) => httpClient.get<T>(`/${resource}/${encodeURIComponent(id)}`, { signal }),
    create: (input, signal) => httpClient.post<T>(`/${resource}`, input, { signal }),
    update: (id, input, signal) => httpClient.patch<T>(`/${resource}/${encodeURIComponent(id)}`, input, { signal }),
    remove: (id, signal) => httpClient.delete<void>(`/${resource}/${encodeURIComponent(id)}`, { signal }),
  };
}
