function readBooleanEnv(value: unknown) {
  return String(value ?? "").trim().toLowerCase() === "true";
}

// Herramientas visibles solo en desarrollo o cuando el ambiente demo lo habilite explícitamente.
// En producción real debe quedar desactivado y el rol debe venir desde Microsoft/Auth o backend.
export const SHOW_DEMO_TOOLS =
  import.meta.env.DEV || readBooleanEnv(import.meta.env.VITE_SHOW_DEMO_TOOLS);
