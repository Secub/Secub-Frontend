import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TourReplayButton from "./TourReplayButton";

describe("TourReplayButton", () => {
  it("renders an icon-only button with the default accessible label", () => {
    render(<TourReplayButton onClick={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Ver guía de esta sección" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("title", "Ver guía de esta sección");
    expect(button).not.toHaveTextContent("Ver guía de esta sección");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("renders a custom accessible label", () => {
    render(<TourReplayButton onClick={vi.fn()} label="Ver guía de ajustes" />);

    expect(screen.getByRole("button", { name: "Ver guía de ajustes" })).toBeInTheDocument();
  });

  it("calls onClick once per click without forwarding the event", async () => {
    const onClick = vi.fn();
    render(<TourReplayButton onClick={onClick} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith();
  });

  it("applies the extra className", () => {
    render(<TourReplayButton onClick={vi.fn()} className="mb-3" />);

    expect(screen.getByRole("button")).toHaveClass("mb-3");
  });
});
