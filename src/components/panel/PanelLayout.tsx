import type { ReactNode } from "react";
import {
  GoBell,
  GoGear,
  GoSearch,
  GoSidebarCollapse,
} from "react-icons/go";
import PanelSidebar from "./PanelSidebar";
import type { PanelStepKey } from "./panelNavigation";

interface PanelLayoutProps {
  children: ReactNode;
  currentStep: PanelStepKey;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PanelLayout({
  children,
  currentStep,
  title,
  description,
  actions,
}: PanelLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-[var(--color-gray-1)]">
      <div className="flex min-h-screen">
        <PanelSidebar currentStep={currentStep} />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[var(--color-gray-6)] bg-white/85 backdrop-blur">
            <div className="flex min-h-20 items-center justify-between gap-4 px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-gray-6)] bg-white text-[var(--color-gray-4)] transition-colors hover:text-[var(--color-secondary-4)] xl:hidden">
                  <GoSidebarCollapse className="text-xl" />
                </button>

                <div className="hidden max-w-md items-center gap-3 rounded-2xl border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-gray-4)] md:flex">
                  <GoSearch className="text-lg" />
                  <span>Buscar módulo, curso o proceso...</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-gray-6)] bg-white text-[var(--color-gray-4)] transition-colors hover:text-[var(--color-secondary-4)]">
                  <GoBell className="text-lg" />
                </button>
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-gray-6)] bg-white text-[var(--color-gray-4)] transition-colors hover:text-[var(--color-secondary-4)]">
                  <GoGear className="text-lg" />
                </button>
                <div className="hidden items-center gap-3 rounded-2xl border border-[var(--color-gray-6)] bg-white px-3 py-2.5 md:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-secondary-4)] text-sm font-semibold text-white">
                    UD
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-secondary-4)]">
                      Usuario Demo
                    </p>
                    <p className="text-xs text-[var(--color-gray-4)]">
                      Director de Programa
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="px-6 py-6 lg:px-8 lg:py-8">
            <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-[var(--color-secondary-4)] md:text-[2rem]">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
                    {description}
                  </p>
                ) : null}
              </div>

              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
