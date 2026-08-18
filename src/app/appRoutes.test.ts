import { describe, expect, it } from "vitest";
import {
  PERSISTED_DEMO_SEARCH_PARAMS,
  buildRouteWithSearch,
  pickSearchParams,
} from "./appRoutes";

describe("appRoutes", () => {
  it("conserva únicamente parámetros permitidos", () => {
    const params = pickSearchParams(
      "?role=docente&programId=prog-1&courseId=curso-2&view=results",
      PERSISTED_DEMO_SEARCH_PARAMS,
    );

    expect(params.toString()).toBe("role=docente&programId=prog-1");
  });

  it("construye rutas sin signos de interrogación vacíos", () => {
    expect(buildRouteWithSearch("/panel", {})).toBe("/panel");
    expect(buildRouteWithSearch("/panel", { role: "administrador" })).toBe("/panel?role=administrador");
  });
});
