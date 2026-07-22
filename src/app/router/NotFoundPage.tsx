import Button from "../../components/ui/Button";
import { ROUTES, navigateToRoute } from "../appRoutes";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--secub-bg)] px-6 py-12">
      <section className="w-full max-w-xl rounded-[var(--radius-2xl)] border border-[var(--secub-border)] bg-[var(--secub-surface)] p-8 text-center shadow-[var(--shadow-md)]">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-secondary-1)]">
          Error 404
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-[var(--color-secondary-4)]">
          Página no encontrada
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-gray-3)]">
          La dirección solicitada no existe o fue movida.
        </p>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => navigateToRoute(ROUTES.landing, { replace: true })}>
            Volver al inicio
          </Button>
        </div>
      </section>
    </main>
  );
}
