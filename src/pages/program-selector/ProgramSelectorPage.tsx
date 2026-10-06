import { useEffect, useMemo, useState } from "react";
import CampusMosaic from "../../components/shared/CampusMosaic";
import { ROUTES, navigateToRoute } from "../../app/appRoutes";
import { isSecubRole, type SecubRole } from "../../config/access/roles";
import {
  fetchAuthSession,
  selectAuthContext,
  type AuthContext,
  type AuthSession,
} from "../../services/auth/session";
import { showNotification } from "../../shared/feedback";
import ProgramSelectionSection from "./sections/ProgramSelectionSection";
import RoleSelectionSection from "./sections/RoleSelectionSection";

type ProgramSelectorStep = "role" | "program";

function normalizeRole(role: string): SecubRole | null {
  const normalized = role.trim().toLowerCase();
  return isSecubRole(normalized) ? normalized : null;
}

function buildDashboardUrl(role: SecubRole) {
  return `${ROUTES.panelDashboard}?role=${role}`;
}

export default function ProgramSelectorPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [step, setStep] = useState<ProgramSelectorStep>("role");
  const [selectedRole, setSelectedRole] = useState<SecubRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingContextId, setSubmittingContextId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchAuthSession()
      .then((current) => {
        if (!active) return;
        const availableRoles = current.roles
          .map(normalizeRole)
          .filter((role): role is SecubRole => role !== null);
        const selectedContext = current.contexts.find(
          (context) => context.context_id === current.selected_context_id,
        );
        const currentRole = selectedContext ? normalizeRole(selectedContext.role) : null;

        setSession(current);
        setSelectedRole(
          currentRole ??
          (availableRoles.includes("director") ? "director" : (availableRoles[0] ?? null)),
        );
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

  const handleSelectRole = (role: SecubRole) => {
    setSelectedRole(role);
    setStep("program");
  };

  const handleSelectProgram = async (context: AuthContext) => {
    const role = normalizeRole(context.role);
    if (!role) return;

    setSubmittingContextId(context.context_id);
    try {
      const updated = await selectAuthContext(context.context_id);
      setSession(updated);
      navigateToRoute(buildDashboardUrl(role));
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
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute -inset-5 -z-20 scale-105 blur-[5px]" aria-hidden="true">
        <CampusMosaic hideTitles layout="fill" className="h-full w-full" />
      </div>
      <div className="absolute inset-0 -z-10 bg-black/65" />

      {loading ? (
        <div
          role="status"
          className="w-full max-w-[620px] rounded-[var(--radius-2xl)] border border-white/55 bg-white/95 p-8 text-center text-[var(--color-gray-3)] shadow-[0_30px_90px_rgba(5,18,35,0.38)]"
        >
          Consultando tu sesión de SECUB…
        </div>
      ) : error ? (
        <div
          role="alert"
          className="w-full max-w-[620px] rounded-[var(--radius-2xl)] border border-[var(--color-error)] bg-white/95 p-8 text-center shadow-[0_30px_90px_rgba(5,18,35,0.38)]"
        >
          <p className="font-heading font-bold text-[var(--color-secondary-4)]">
            No se pudo cargar el acceso
          </p>
          <p className="mt-2 text-sm text-[var(--color-gray-3)]">{error}</p>
          <button
            type="button"
            onClick={() => navigateToRoute(ROUTES.access)}
            className="mt-5 rounded-full bg-[var(--color-primary-1)] px-5 py-2 font-semibold text-white"
          >
            Volver a iniciar sesión
          </button>
        </div>
      ) : step === "role" ? (
        <RoleSelectionSection
          roles={roles}
          userName={session?.full_name ?? ""}
          onSelectRole={handleSelectRole}
          onBack={() => navigateToRoute(ROUTES.access)}
        />
      ) : (
        <ProgramSelectionSection
          contexts={contexts}
          submittingContextId={submittingContextId}
          onSelectProgram={(context) => void handleSelectProgram(context)}
          onBack={() => setStep("role")}
        />
      )}
    </main>
  );
}
