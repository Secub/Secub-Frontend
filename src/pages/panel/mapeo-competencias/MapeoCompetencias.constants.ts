import type {
  BadgeVariant,
  MapeoCompetenciasFilters,
  NivelCompromiso,
  NivelCompromisoCorto,
  NucleoFormacion,
} from "./MapeoCompetencias.types";

export const INITIAL_FILTERS: MapeoCompetenciasFilters = {
  seccionalId: "",
  facultadId: "",
  lugarId: "",
  programaId: "",
  planId: "",
  estado: "",
};

export const SAFE_FALLBACK_TOTAL_SEMESTERS = 1;

export const NUCLEOS: Array<{
  value: NucleoFormacion;
  label: string;
  description: string;
  variant: BadgeVariant;
}> = [
  {
    value: "fundamentacion",
    label: "Fundamentación",
    description: "Etapa inicial donde el estudiante reconoce bases conceptuales y metodológicas.",
    variant: "info",
  },
  {
    value: "profesionalizacion",
    label: "Profesionalización",
    description: "Etapa intermedia donde el estudiante profundiza y aplica saberes disciplinares.",
    variant: "accent",
  },
  {
    value: "sintesis",
    label: "Síntesis",
    description: "Etapa final donde el estudiante integra competencias en contextos académicos o profesionales.",
    variant: "success",
  },
];

export const NIVELES_COMPROMISO: Array<{
  value: NivelCompromiso;
  short: NivelCompromisoCorto;
  label: string;
  description: string;
  variant: BadgeVariant;
}> = [
  {
    value: "introduce",
    short: "I",
    label: "Introduce (I)",
    description:
      "El curso introduce la competencia al estudiante. Se presentan los conceptos fundamentales y se inicia la familiarización con la competencia.",
    variant: "info",
  },
  {
    value: "refuerza",
    short: "R",
    label: "Refuerza (R)",
    description:
      "El curso refuerza la competencia previamente introducida. Se profundizan los conceptos y se consolidan habilidades mediante aplicaciones más complejas.",
    variant: "warning",
  },
  {
    value: "afianza",
    short: "A",
    label: "Afianza (A)",
    description:
      "El curso afianza la competencia. El estudiante demuestra mayor dominio, integración y aplicación de la competencia en contextos académicos o profesionales.",
    variant: "success",
  },
  {
    value: "no-aplica",
    short: "NA",
    label: "No Aplica (NA)",
    description: "El curso no aborda ni contribuye al desarrollo de esta competencia.",
    variant: "neutral",
  },
];
