import { storageClient } from "../shared/browser";

export const SECUB_SECTION_STORAGE_KEY = "secub:selected-section:v1";

export const SECUB_SECTIONS = [
  { id: "cali", label: "Cali" },
  { id: "bogota", label: "Bogotá" },
  { id: "medellin", label: "Medellín" },
  { id: "cartagena", label: "Cartagena" },
] as const;

export type SecubSectionId = (typeof SECUB_SECTIONS)[number]["id"];

const microsoftCampusBySection: Record<SecubSectionId, string> = {
  cali: "USBCA",
  bogota: "USBBO",
  cartagena: "USBCT",
  medellin: "USBME",
};

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
  const campusCodigo = microsoftCampusBySection[sectionId];
  window.location.assign(`/auth/microsoft?campus=${encodeURIComponent(campusCodigo)}`);
}
