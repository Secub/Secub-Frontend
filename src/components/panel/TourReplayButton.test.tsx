import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TourReplayButton from "./TourReplayButton";

describe("TourReplayButton", () => {
  it("renders a button with the default label", () => {
    render(<TourReplayButton onClick={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Ver guía de esta sección" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("renders a custom label", () => {
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

  it("applies the extra className on top of the variant styles", () => {
    render(<TourReplayButton onClick={vi.fn()} className="mb-3" />);

    expect(screen.getByRole("button")).toHaveClass("mb-3", "underline");
  });

  it("uses a different style on dark surfaces", () => {
    const { rerender } = render(<TourReplayButton onClick={vi.fn()} />);
    const defaultClass = screen.getByRole("button").className;

    rerender(<TourReplayButton onClick={vi.fn()} variant="on-dark" />);

    expect(screen.getByRole("button").className).not.toBe(defaultClass);
  });
});
