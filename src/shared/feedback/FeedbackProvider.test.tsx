import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FeedbackProvider from "./FeedbackProvider";
import { showNotification } from "./feedback.service";

describe("FeedbackProvider notifications", () => {
  it("shows notifications at the top so they never cover the flow navigation buttons", () => {
    render(
      <FeedbackProvider>
        <p>content</p>
      </FeedbackProvider>,
    );

    act(() => {
      showNotification({ message: "Perfil guardado", variant: "success" });
    });

    const notification = screen.getByRole("status");
    expect(notification).toHaveTextContent("Perfil guardado");
    expect(notification.className).toMatch(/\btop-/);
    expect(notification.className).not.toMatch(/\bbottom-/);
  });
});
