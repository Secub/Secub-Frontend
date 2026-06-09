import { useContext } from "react";
import { AccessibilitySettingsContext } from "./AccessibilityProvider";

export function useAccessibilitySettings() {
  const context = useContext(AccessibilitySettingsContext);

  if (!context) {
    throw new Error(
      "useAccessibilitySettings debe usarse dentro de AccessibilityProvider.",
    );
  }

  return context;
}
