import type { CrudRepository, PageResult } from "../../domain/repositories";
import type { CentralMockUser } from "../../services/auth/mockUser";
import type { MockBackendEntityKey } from "../../services/mockBackend/mockBackend.service";
import { mockBackend } from "../../services/mockBackend";

export function createMockCrudRepository<T extends { id: string }>(
  entity: MockBackendEntityKey,
  getUser: () => CentralMockUser,
): CrudRepository<T, T, Partial<T>> {
  return {
    async list(query): Promise<PageResult<T>> {
      const allItems = mockBackend.list<T>(entity, getUser());
      const page = query?.page ?? 1;
      const pageSize = query?.pageSize ?? Math.max(allItems.length, 1);
      const start = (page - 1) * pageSize;
      return {
        items: allItems.slice(start, start + pageSize),
        total: allItems.length,
        page,
        pageSize,
      };
    },
    async getById(id) {
      const record = mockBackend.getById<T>(entity, id, getUser());
      if (!record) throw new Error("Registro no encontrado.");
      return record;
    },
    async create(input) {
      const records = mockBackend.create<T>(entity, input, getUser());
      return records.find((record) => record.id === input.id) ?? input;
    },
    async update(id, input) {
      const current = mockBackend.getById<T>(entity, id, getUser());
      if (!current) throw new Error("Registro no encontrado.");
      const next = { ...current, ...input, id };
      const records = mockBackend.update<T>(entity, next, getUser());
      return records.find((record) => record.id === id) ?? next;
    },
    async remove(id) {
      mockBackend.remove<T>(entity, id, getUser());
    },
  };
}
