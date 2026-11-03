import { describe, expect, it } from "vitest";
import {
  filterManagedUsers,
  getCycleSettingsKey,
  SECCIONAL_RECORDS,
  type ManagedUser,
} from "./seccionales.data";

const users: ManagedUser[] = [
  {
    id: "1",
    name: "Decana de prueba",
    email: "decana@example.com",
    roles: ["decano"],
    seccionalId: "bogota",
    status: "activo",
    enabled: true,
    facultadId: "facultad-1",
    programaId: "programa-1",
  },
  {
    id: "2",
    name: "Vicerrector de prueba",
    email: "vicerrector@example.com",
    roles: ["vicerrector"],
    seccionalId: "cali",
    status: "activo",
    enabled: true,
    facultadId: "",
    programaId: "",
  },
];

describe("seccionales data", () => {
  it("uses the four existing SECUB sections as organizations", () => {
    expect(SECCIONAL_RECORDS.map(({ id }) => id)).toEqual([
      "cali",
      "bogota",
      "medellin",
      "cartagena",
    ]);
  });

  it("scopes user filters by section, faculty, program, and role", () => {
    expect(filterManagedUsers(users, {
      seccionalId: "bogota",
      facultadId: "facultad-1",
      programaId: "programa-1",
      role: "decano",
    })).toEqual([users[0]]);
    expect(filterManagedUsers(users, {
      seccionalId: "bogota",
      facultadId: "",
      programaId: "",
      role: "vicerrector",
    })).toEqual([]);
  });

  it("keeps cycle settings separate by section, faculty, and program", () => {
    expect(getCycleSettingsKey("bogota", "", "")).not.toBe(
      getCycleSettingsKey("bogota", "facultad-1", "programa-1"),
    );
  });
});
