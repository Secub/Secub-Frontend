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
    href: "/panel/dashboard",
    icon: GoHome,
  },
  {
    key: "perfil-egreso",
    label: "Perfil de Egreso",
    description: "Paso 1",
    href: "/panel/perfil-egreso",
    icon: GoGoal,
    order: 1,
  },
  {
    key: "proposito-formacion",
    label: "Propósito de Formación",
    description: "Paso 2",
    href: "/panel/proposito-formacion",
    icon: GoChecklist,
    order: 2,
  },
  {
    key: "competencias-ra",
    label: "Competencias y RA",
    description: "Paso 3",
    href: "/panel/competencias-ra",
    icon: GoBook,
    order: 3,
  },
  {
    key: "mapeo-competencias",
    label: "Mapeo de Competencias",
    description: "Paso 4",
    href: "/panel/mapeo-competencias",
    icon: GoRepo,
    order: 4,
  },
  {
    key: "ciclo",
    label: "Creación del ciclo",
    description: "Paso 5",
    href: "/panel/ciclo",
    icon: GoProject,
    order: 5,
  },
  {
    key: "asignar-ra",
    label: "Asignar RA",
    description: "Paso 6",
    href: "/panel/asignar-ra",
    icon: GoTasklist,
    order: 6,
  },
  {
    key: "medicion-ra",
    label: "Medición RA",
    description: "Registro de medición de RA",
    href: "/panel/medicion-ra",
    icon: GoGraph,
  },
];
