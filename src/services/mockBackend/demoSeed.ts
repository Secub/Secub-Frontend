import { mockBackend, type MockBackendRecord } from "./mockBackend.service";

export const optionalAcademicDemoSeed: Partial<Record<string, MockBackendRecord[]>> = {
  // Semilla opcional para pruebas UX.
  // Mantener vacía por defecto para que el flujo empiece realmente desde Perfil de Egreso.
  perfilEgreso: [],
  propositosFormacion: [],
  competenciasRa: [],
  mapeosCompetencias: [],
  ciclosMedicion: [],
  asignacionesRa: [],
  medicionesRa: [],
  planesMejora: [],
};

export function seedAcademicDemoData() {
  // Uso controlado de desarrollo/demo. No conectar este helper a botones visibles para usuarios finales.
  mockBackend.seedDemoData(optionalAcademicDemoSeed as never);
}
