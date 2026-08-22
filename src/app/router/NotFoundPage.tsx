import Button from "../../components/ui/Button";
import CampusMosaic from "../../components/shared/CampusMosaic";
import LandingFooterSection from "../../pages/landing/sections/LandingFooterSection";
import LandingHeader from "../../pages/landing/sections/LandingHeaderSection";
import { ROUTES, navigateToRoute } from "../appRoutes";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--secub-bg)] text-[var(--secub-text)]">
      <LandingHeader />

      <main
        id="inicio"
        className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-6 py-16"
      >
        <div className="absolute inset-0 scale-105" aria-hidden="true">
          <CampusMosaic hideTitles overlay={false} layout="fill" className="h-full w-full blur-md" />
        </div>
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" aria-hidden="true" />

        <section className="relative z-10 w-full max-w-xl rounded-[var(--radius-2xl)] border border-white/30 bg-[var(--secub-surface)] p-8 text-center shadow-[var(--shadow-lg)] backdrop-blur-md sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Error 404
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-[var(--color-secondary-4)] sm:text-4xl">
            Página no encontrada
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--color-gray-3)] sm:text-base">
            La dirección solicitada no existe, fue movida o ya no se encuentra disponible.
          </p>
          <div className="mt-7 flex justify-center">
            <Button onClick={() => navigateToRoute(ROUTES.landing, { replace: true })}>
              Volver al inicio
            </Button>
          </div>
        </section>
      </main>

      <LandingFooterSection />
    </div>
  );
}
