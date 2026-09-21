import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccessibilityProvider } from "./AccessibilityProvider";
import AccessibilitySettingsPanel from "./AccessibilitySettingsPanel";

// El tour guiado de Accesibilidad apunta a estos ids (AccessibilitySettingsPage).
const TOUR_TARGET_IDS = [
  "accessibility-contrast-card",
  "accessibility-font-size-card",
  "accessibility-reset-button",
];

describe("AccessibilitySettingsPanel tour targets", () => {
  it.each(TOUR_TARGET_IDS)("renders the #%s element exactly once", (id) => {
    const { container } = render(
      <AccessibilityProvider>
        <AccessibilitySettingsPanel />
      </AccessibilityProvider>,
    );

    expect(container.querySelectorAll(`#${id}`)).toHaveLength(1);
  });
});
