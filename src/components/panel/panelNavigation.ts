import {
  GoChecklist,
  GoGoal,
  GoBook,
  GoRepo,
  GoProject,
  GoTasklist,
  GoGraph,
  GoHome,
} from "react-icons/go";
import type { IconType } from "react-icons";
import { ROUTES } from "../../app/appRoutes";

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
  icon: IconType;
  order?: number;
}

export const panelNavigation: PanelNavigationItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Resumen general",
    href: ROUTES.panelDashboard,
    icon: GoHome,
  },
  {
    key: "perfil-egreso",
    label: "Perfil de Egreso",
    description: "Paso 1",
    href: ROUTES.panelPerfilEgreso,
    icon: GoGoal,
    order: 1,
  },
  {
    key: "proposito-formacion",
    label: "Propósito de Formación",
    description: "Paso 2",
    href: ROUTES.panelPropositoFormacion,
    icon: GoChecklist,
    order: 2,
  },
  {
    key: "competencias-ra",
    label: "Competencias y RA",
    description: "Paso 3",
    href: ROUTES.panelCompetenciasRa,
    icon: GoBook,
    order: 3,
  },
  {
    key: "mapeo-competencias",
    label: "Mapeo de Competencias",
    description: "Paso 4",
    href: ROUTES.panelMapeoCompetencias,
    icon: GoRepo,
    order: 4,
  },
  {
    key: "ciclo",
    label: "Creación del ciclo",
    description: "Paso 5",
    href: ROUTES.panelCiclo,
    icon: GoProject,
    order: 5,
  },
  {
    key: "asignar-ra",
    label: "Asignar RA",
    description: "Paso 6",
    href: ROUTES.panelAsignarRa,
    icon: GoTasklist,
    order: 6,
  },
  {
    key: "medicion-ra",
    label: "Medición RA",
    description: "Registro de medición de RA",
    href: ROUTES.panelMedicionRa,
    icon: GoGraph,
  },
];
