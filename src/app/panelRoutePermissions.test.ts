import { describe, expect, it } from "vitest";
import { ROUTES } from "./appRoutes";
import { getPanelRouteAccessRedirect } from "./panelRoutePermissions";

describe("panelRoutePermissions", () => {
  it("redirige a Docencia fuera de Dashboard y Medición RA", () => {
    expect(getPanelRouteAccessRedirect(ROUTES.panelMedicionRa, "docente")).toBeNull();
    expect(getPanelRouteAccessRedirect(ROUTES.panelPerfilEgreso, "docente")).toBe(ROUTES.panelDashboard);
    expect(getPanelRouteAccessRedirect(ROUTES.panelAsignarRa, "docente")).toBe(ROUTES.panelDashboard);
  });

  it("bloquea Medición RA para los roles no docentes", () => {
    expect(getPanelRouteAccessRedirect(ROUTES.panelMedicionRa, "admin")).toBe(ROUTES.panelDashboard);
    expect(getPanelRouteAccessRedirect(ROUTES.panelMedicionRa, "direccionPrograma")).toBe(ROUTES.panelDashboard);
  });

  it("reserva las rutas de creación y edición del mapeo para Dirección", () => {
    expect(getPanelRouteAccessRedirect(ROUTES.panelMapeoCompetenciasCrear, "direccionPrograma")).toBeNull();
    expect(getPanelRouteAccessRedirect(ROUTES.panelMapeoCompetenciasCrear, "admin")).toBe(ROUTES.panelDashboard);
    expect(getPanelRouteAccessRedirect(ROUTES.panelMapeoCompetenciasEditar, "vice")).toBe(ROUTES.panelDashboard);
  });
});
