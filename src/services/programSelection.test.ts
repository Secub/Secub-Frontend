import { afterEach, describe, expect, it } from "vitest";
import { persistAuthSession, type AuthContext, type AuthSession } from "./auth/session";
import { getCurrentUser } from "./auth/currentUser";
import { getSelectedProgram, hasSelectedProgram } from "./programSelection";

function buildSession(role: string): AuthSession {
  const context: AuthContext = {
    context_id: "ctx-1",
    role,
    campus_codigo: "USBCA",
    location_codigo: "CALI",
    faculty_codigo: "ING",
    faculty_name: "Ingeniería",
    program_codigo: "L790",
    program_name: "Ingeniería de Sistemas",
    plan_codigo: "P1",
    plan_name: "Plan 1",
  };
  return {
    user_id: "u-1",
    person_id: "p-1",
    full_name: "Usuario de prueba",
    username: "usuario",
    email: "usuario@usb.edu.co",
    role,
    roles: [role],
    status: "Activo",
    contexts: [context],
    requires_selection: false,
    selected_context_id: "ctx-1",
  };
}

describe("selected academic context", () => {
  afterEach(() => persistAuthSession(null as unknown as AuthSession));

  it("accepts a context whose role is one of the official roles", () => {
    persistAuthSession(buildSession(" Director "));

    expect(hasSelectedProgram()).toBe(true);
    expect(getSelectedProgram()?.id).toBe("L790");
    expect(getCurrentUser().role).toBe("director");
  });

  it("ignores a selected context with an unknown role so the panel asks for a valid one", () => {
    persistAuthSession(buildSession("superadmin"));

    expect(hasSelectedProgram()).toBe(false);
    expect(getSelectedProgram()).toBeUndefined();
    expect(getCurrentUser().id).toBe("");
  });
});
