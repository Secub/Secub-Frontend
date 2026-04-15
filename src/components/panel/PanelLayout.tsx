import type { ReactNode } from "react";
/*import {
  GoBell,
} from "react-icons/go";*/
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

            {/*  <div className="flex items-center gap-3">
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-gray-6)] bg-white text-[var(--color-gray-4)] transition-colors hover:text-[var(--color-secondary-4)]">
                  <GoBell className="text-lg" />
                </button>
              </div> */}

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
