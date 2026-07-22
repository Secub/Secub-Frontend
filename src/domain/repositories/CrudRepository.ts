export interface ListQuery {
  signal?: AbortSignal;
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: Record<string, string | number | boolean | undefined>;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CrudRepository<T, TCreate = Omit<T, "id">, TUpdate = Partial<TCreate>> {
  list(query?: ListQuery): Promise<PageResult<T>>;
  getById(id: string, signal?: AbortSignal): Promise<T>;
  create(input: TCreate, signal?: AbortSignal): Promise<T>;
  update(id: string, input: TUpdate, signal?: AbortSignal): Promise<T>;
  remove(id: string, signal?: AbortSignal): Promise<void>;
}
