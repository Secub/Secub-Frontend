import type { CentralMockUser } from "../../services/auth/mockUser";
import type { MockBackendEntityKey } from "../../services/mockBackend/mockBackend.service";
import type { CrudRepository } from "../../domain/repositories";
import { USE_MOCK_BACKEND } from "../../config/api.config";
import { createHttpCrudRepository } from "./createHttpCrudRepository";
import { createMockCrudRepository } from "./createMockCrudRepository";

export interface CrudResourceConfig {
  /** Store key used while `USE_MOCK_BACKEND` is true. */
  entity: MockBackendEntityKey;
  /** REST resource path (relative to `VITE_API_BASE_URL`) used against the real API. */
  resourcePath: string;
}

/**
 * Composition root for a CRUD resource: returns the mock-backed or the
 * HTTP-backed repository depending on `USE_MOCK_BACKEND`. Feature code should
 * depend on this (and the `CrudRepository` interface) rather than importing
 * `mockBackend` directly, so switching to the real API is a config change.
 * See `docs/BACKEND_INTEGRATION.md`.
 */
export function createCrudRepository<
  T extends { id: string },
  TCreate = Omit<T, "id">,
  TUpdate = Partial<TCreate>,
>(
  config: CrudResourceConfig,
  getUser: () => CentralMockUser,
): CrudRepository<T, TCreate, TUpdate> {
  if (USE_MOCK_BACKEND) {
    // The mock's create/update accept the full record; the HTTP contract uses
    // TCreate/TUpdate. Bridge the shape here — the mock is a stand-in only.
    return createMockCrudRepository<T>(config.entity, getUser) as unknown as CrudRepository<
      T,
      TCreate,
      TUpdate
    >;
  }
  return createHttpCrudRepository<T, TCreate, TUpdate>(config.resourcePath);
}
