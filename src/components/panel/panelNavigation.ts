import { ROUTES } from "../../app/appRoutes";
import type { SecubIconName } from "../ui/SecubIcon";

export type PanelStepKey =
  | "dashboard"
  | "ajustes"
  | "accesibilidad"
  | "perfil-egreso"
  | "proposito-formacion"
  | "competencias-ra"
  | "mapeo-competencias"
  | "ciclo"
  | "asignar-ra"
  | "medicion-ra";

export interface PanelNavigationItem {
  key: PanelStepKey;
  label: string;
  description: string;
  href: string;
  icon: SecubIconName;
  order?: number;
}

export const panelNavigation: PanelNavigationItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Resumen general",
    href: ROUTES.panelDashboard,
    icon: "chart",
  },
  {
    key: "perfil-egreso",
    label: "Perfil de Egreso",
    description: "Paso 1",
    href: ROUTES.panelPerfilEgreso,
    icon: "target",
    order: 1,
  },
  {
    key: "proposito-formacion",
    label: "Propósito de Formación",
    description: "Paso 2",
    href: ROUTES.panelPropositoFormacion,
    icon: "checklist",
    order: 2,
  },
  {
    key: "competencias-ra",
    label: "Competencias y RA",
    description: "Paso 3",
    href: ROUTES.panelCompetenciasRa,
    icon: "book",
    order: 3,
  },
  {
    key: "mapeo-competencias",
    label: "Mapeo de Competencias",
    description: "Paso 4",
    href: ROUTES.panelMapeoCompetencias,
    icon: "map",
    order: 4,
  },
  {
    key: "ciclo",
    label: "Creación del ciclo",
    description: "Paso 5",
    href: ROUTES.panelCiclo,
    icon: "cycle",
    order: 5,
  },
  {
    key: "asignar-ra",
    label: "Asignar RA",
    description: "Paso 6",
    href: ROUTES.panelAsignarRa,
    icon: "list",
    order: 6,
  },
  {
    key: "medicion-ra",
    label: "Medición RA",
    description: "Registro de medición de RA",
    href: ROUTES.panelMedicionRa,
    icon: "chart-up",
  },
];
