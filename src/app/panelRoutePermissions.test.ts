import { describe, expect, it } from "vitest";
import { ROUTES } from "./appRoutes";
import { getPanelRouteAccessRedirect } from "./panelRoutePermissions";

describe("panelRoutePermissions", () => {
  it("redirige a Docente fuera de Dashboard y Medición RA", () => {
    expect(getPanelRouteAccessRedirect(ROUTES.panelMedicionRa, "docente")).toBeNull();
    expect(getPanelRouteAccessRedirect(ROUTES.panelPerfilEgreso, "docente")).toBe(ROUTES.panelDashboard);
    expect(getPanelRouteAccessRedirect(ROUTES.panelAsignarRa, "docente")).toBe(ROUTES.panelDashboard);
  });

  it("bloquea Medición RA para los roles no docentes", () => {
    expect(getPanelRouteAccessRedirect(ROUTES.panelMedicionRa, "administrador")).toBe(ROUTES.panelDashboard);
    expect(getPanelRouteAccessRedirect(ROUTES.panelMedicionRa, "director")).toBe(ROUTES.panelDashboard);
  });

  it("reserva las rutas de creación y edición del mapeo para Dirección", () => {
    expect(getPanelRouteAccessRedirect(ROUTES.panelMapeoCompetenciasCrear, "director")).toBeNull();
    expect(getPanelRouteAccessRedirect(ROUTES.panelMapeoCompetenciasCrear, "administrador")).toBe(ROUTES.panelDashboard);
    expect(getPanelRouteAccessRedirect(ROUTES.panelMapeoCompetenciasEditar, "vicerrector")).toBe(ROUTES.panelDashboard);
  });
});
