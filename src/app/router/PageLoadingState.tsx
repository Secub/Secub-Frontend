export default function PageLoadingState() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[var(--secub-bg)] px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="text-center">
        <span
          aria-hidden="true"
          className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-secondary-3)] border-t-[var(--color-secondary-1)]"
        />
        <p className="mt-4 text-sm font-semibold text-[var(--color-gray-3)]">
          Cargando SECUB…
        </p>
      </div>
    </main>
  );
}
