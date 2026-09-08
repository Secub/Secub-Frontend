import { storageClient } from "../shared/browser";
import { showNotification } from "../shared/feedback";

export const SECUB_SECTION_STORAGE_KEY = "secub:selected-section:v1";

export const SECUB_SECTIONS = [
  { id: "cali", label: "Cali" },
  { id: "bogota", label: "Bogotá" },
  { id: "medellin", label: "Medellín" },
  { id: "cartagena", label: "Cartagena" },
] as const;

export type SecubSectionId = (typeof SECUB_SECTIONS)[number]["id"];

export function isSecubSectionId(value: unknown): value is SecubSectionId {
  return SECUB_SECTIONS.some((section) => section.id === value);
}

export function persistSelectedSection(sectionId: SecubSectionId) {
  storageClient.set(SECUB_SECTION_STORAGE_KEY, sectionId);
}

export function getSelectedSection(): SecubSectionId | null {
  const value = storageClient.get(SECUB_SECTION_STORAGE_KEY);
  return isSecubSectionId(value) ? value : null;
}

export function continueAccessAfterSectionSelection(sectionId: SecubSectionId) {
  persistSelectedSection(sectionId);
  if (sectionId !== "cali") {
    showNotification({
      title: "Acceso próximamente",
      message: "Por ahora el inicio de sesión solo está habilitado para la seccional Cali.",
      variant: "info",
    });
    return;
  }

  window.location.assign("/auth/microsoft?campus=USBCA");
}
