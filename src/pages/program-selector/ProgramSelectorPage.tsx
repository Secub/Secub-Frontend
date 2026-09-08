import { useEffect, useMemo, useState } from "react";
import { GoArrowRight, GoBook, GoChevronLeft } from "react-icons/go";
import LogoSECUB from "../../assets/logos/logotipo_ConUSB.png";
import { ROUTES, navigateToRoute } from "../../app/appRoutes";
import {
  SECUB_ROLE_LABELS,
  isSecubRole,
  type SecubRole,
} from "../../config/access/roles";
import {
  fetchAuthSession,
  selectAuthContext,
  type AuthContext,
  type AuthSession,
} from "../../services/auth/session";
import { showNotification } from "../../shared/feedback";

function normalizeRole(role: string): SecubRole | null {
  const normalized = role.trim().toLowerCase();
  return isSecubRole(normalized) ? normalized : null;
}

export default function ProgramSelectorPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [selectedRole, setSelectedRole] = useState<SecubRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingContextId, setSubmittingContextId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchAuthSession()
      .then((current) => {
        if (!active) return;
        const roles = current.roles
          .map(normalizeRole)
          .filter((role): role is SecubRole => role !== null);
        setSession(current);
        setSelectedRole(roles.includes("director") ? "director" : (roles[0] ?? null));
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "No fue posible cargar la sesión.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const roles = useMemo(
    () =>
      (session?.roles ?? [])
        .map(normalizeRole)
        .filter((role): role is SecubRole => role !== null),
    [session],
  );
  const contexts = useMemo(
    () =>
      (session?.contexts ?? []).filter(
        (context) => normalizeRole(context.role) === selectedRole,
      ),
    [selectedRole, session],
  );

  const handleSelectProgram = async (context: AuthContext) => {
    const role = normalizeRole(context.role);
    if (!role) return;
    setSubmittingContextId(context.context_id);
    try {
      const updated = await selectAuthContext(context.context_id);
      setSession(updated);
      navigateToRoute(`${ROUTES.panelDashboard}?role=${role}`);
    } catch (reason) {
      showNotification({
        title: "No fue posible ingresar",
        message: reason instanceof Error ? reason.message : "No se pudo seleccionar el programa.",
        variant: "error",
      });
    } finally {
      setSubmittingContextId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-surface-soft)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-5xl flex-col gap-5">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigateToRoute(ROUTES.access)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-2 text-sm font-semibold text-[var(--color-gray-3)] transition-colors hover:text-[var(--color-secondary-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.22)]"
          >
            <GoChevronLeft aria-hidden="true" />
            Volver al acceso
          </button>
          <img src={LogoSECUB} alt="SECUB" className="h-9 w-auto object-contain sm:h-20" />
        </header>

        <section className="flex flex-1 flex-col justify-center gap-5">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-secondary-1)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-white)]">
              SECUB · Datos académicos
            </p>
            <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-[var(--color-secondary-4)] sm:text-4xl">
              Selecciona programa y rol
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)] sm:text-base">
              {session ? `Hola, ${session.full_name}. Elige cómo vas a ingresar.` : "Cargando tus asignaciones académicas…"}
            </p>
          </div>

          {loading ? (
            <div role="status" className="rounded-[var(--radius-2xl)] border border-[var(--color-gray-6)] bg-white p-8 text-center text-[var(--color-gray-3)]">
              Consultando tu sesión de SECUB…
            </div>
          ) : error ? (
            <div role="alert" className="rounded-[var(--radius-2xl)] border border-[var(--color-error)] bg-white p-8 text-center">
              <p className="font-heading font-bold text-[var(--color-secondary-4)]">No se pudo cargar el acceso</p>
              <p className="mt-2 text-sm text-[var(--color-gray-3)]">{error}</p>
              <button type="button" onClick={() => navigateToRoute(ROUTES.access)} className="mt-5 rounded-full bg-[var(--color-primary-1)] px-5 py-2 font-semibold text-white">
                Volver a iniciar sesión
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <section className="rounded-[var(--radius-2xl)] border border-[var(--color-gray-6)] bg-white p-4 shadow-[0_18px_45px_rgba(24,34,51,0.08)] sm:p-5" aria-labelledby="role-selector-title">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-secondary-1)]">1. Rol</p>
                <h2 id="role-selector-title" className="mt-1 font-heading text-xl font-bold text-[var(--color-secondary-4)]">Selecciona tu rol</h2>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {roles.map((role) => {
                    const selected = role === selectedRole;
                    const label = SECUB_ROLE_LABELS[role];
                    return (
                      <button
                        key={role}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setSelectedRole(role)}
                        className={`rounded-[var(--radius-lg)] border px-4 py-3 text-left transition-all ${selected ? "border-[var(--color-success)] bg-[color:rgba(118,202,102,0.10)] shadow-[inset_4px_0_0_var(--color-success)]" : "border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] hover:border-[var(--color-secondary-2)]"}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${selected ? "bg-[var(--color-success)] text-white" : "bg-white text-[var(--color-secondary-4)]"}`}>{label.slice(0, 2).toUpperCase()}</span>
                          <span className="font-heading text-sm font-bold text-[var(--color-secondary-4)]">{label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[var(--radius-2xl)] border border-[var(--color-gray-6)] bg-white p-4 shadow-[0_18px_45px_rgba(24,34,51,0.08)] sm:p-5" aria-labelledby="program-selector-title">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-secondary-1)]">2. Programa</p>
                <h2 id="program-selector-title" className="mt-1 font-heading text-xl font-bold text-[var(--color-secondary-4)]">Selecciona el programa académico</h2>
                <div className="mt-4 grid max-h-[440px] gap-3 overflow-y-auto pr-1">
                  {contexts.length === 0 ? (
                    <div role="status" className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-gray-6)] p-5 text-center text-sm text-[var(--color-gray-3)]">
                      No hay programas asignados para este rol.
                    </div>
                  ) : contexts.map((context) => (
                    <button
                      key={context.context_id}
                      type="button"
                      disabled={submittingContextId !== null}
                      onClick={() => void handleSelectProgram(context)}
                      className="group rounded-[var(--radius-xl)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4 text-left transition-all hover:border-[var(--color-secondary-2)] hover:bg-white disabled:opacity-60"
                    >
                      <span className="flex items-center justify-between gap-4">
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-secondary-1)] text-xl text-white"><GoBook aria-hidden="true" /></span>
                          <span className="min-w-0">
                            <span className="block font-heading text-lg font-bold text-[var(--color-secondary-4)]">{context.program_name}</span>
                            <span className="mt-1 block text-sm text-[var(--color-gray-3)]">{context.faculty_name} · {context.plan_name}</span>
                          </span>
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-gray-6)] group-hover:bg-[var(--color-secondary-1)] group-hover:text-white"><GoArrowRight aria-hidden="true" /></span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
