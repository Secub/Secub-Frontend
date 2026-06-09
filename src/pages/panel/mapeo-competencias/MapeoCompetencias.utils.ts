export * from "./MapeoCompetencias.constants";
export * from "./MapeoCompetencias.filters";
export * from "./MapeoCompetencias.mappers";
export * from "./MapeoCompetencias.semestres";
export * from "./MapeoCompetencias.export";

export function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
