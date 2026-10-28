import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRAAssignmentContext, type RAAssignmentContext } from "../../../../services/raAssignments";
import { useAsignarRAData } from "./useAsignarRAData";

vi.mock("../../../../services/raAssignments", () => ({
  getRAAssignmentContext: vi.fn(),
}));

const context: RAAssignmentContext = {
  scope: {
    seccionalId: "s-1", seccionalNombre: "Seccional",
    facultadId: "f-1", facultadNombre: "Facultad",
    programaId: "p-1", programaNombre: "Programa",
  },
  planes: [],
  ciclos: [],
  competencias: [],
  mapeos: [],
  asignaciones: [],
};

beforeEach(() => {
  vi.mocked(getRAAssignmentContext).mockReset();
});

describe("carga de datos de Asignar RA", () => {
  it("muestra la carga solo la primera vez y recarga en segundo plano después", async () => {
    vi.mocked(getRAAssignmentContext).mockResolvedValue(context);
    const { result } = renderHook(() => useAsignarRAData());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    let resolveRefresh: (value: RAAssignmentContext) => void = () => undefined;
    vi.mocked(getRAAssignmentContext).mockReturnValueOnce(
      new Promise((resolve) => { resolveRefresh = resolve; }),
    );
    let refresh: Promise<void> = Promise.resolve();
    act(() => { refresh = result.current.refreshBackendState(); });
    expect(result.current.loading).toBe(false);

    await act(async () => {
      resolveRefresh(context);
      await refresh;
    });
    expect(result.current.loading).toBe(false);
  });

  it("vuelve a mostrar la carga al reintentar después de un fallo inicial", async () => {
    vi.mocked(getRAAssignmentContext).mockRejectedValueOnce(new Error("Sin conexión"));
    const { result } = renderHook(() => useAsignarRAData());
    await waitFor(() => expect(result.current.loadError).toBe("Sin conexión"));

    vi.mocked(getRAAssignmentContext).mockReturnValueOnce(new Promise(() => undefined));
    act(() => { void result.current.refreshBackendState(); });
    expect(result.current.loading).toBe(true);
  });
});
