import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiMenu as Menu, FiX as X } from "react-icons/fi";
import type { PanelStepKey } from "../panelNavigation";
import PanelSidebar from "../PanelSidebar";

interface PanelMobileNavigationProps {
  currentStep: PanelStepKey;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function PanelMobileNavigation({ currentStep }: PanelMobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const root = document.getElementById("root");
    const triggerElement = triggerRef.current;
    const rootWasInert = root?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (root) root.inert = true;

    const focusTimer = window.setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (root) root.inert = rootWasInert;
      triggerElement?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center border-b border-[var(--secub-border)] bg-[var(--secub-surface)] px-4 py-3 shadow-[var(--shadow-sm)] xl:hidden">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--secub-border)] px-4 text-sm font-semibold text-[var(--secub-text)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)]"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
          Menú
        </button>
      </header>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[80] flex xl:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-[#182233]/55"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
              />
              <section
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Navegación del panel"
                className="relative z-10 h-screen w-[min(88vw,360px)] shadow-[0_24px_80px_rgba(24,34,51,0.3)]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute right-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[var(--color-footer-dark)] text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                  aria-label="Cerrar menú"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </button>
                <PanelSidebar
                  currentStep={currentStep}
                  variant="mobile"
                  onNavigate={() => setOpen(false)}
                />
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
