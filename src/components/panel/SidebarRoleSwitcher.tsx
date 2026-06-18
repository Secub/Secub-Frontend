import { navigateToRoute } from "../../app/appRoutes";
import { getNeutralRoleLabel, normalizeMockRole, type MockUserRole } from "../../services/auth/mockUser";
import { mockBackend } from "../../services/mockBackend";

const demoRoles: MockUserRole[] = ["admin", "vice", "decano", "direccionPrograma", "docente"];

export default function SidebarRoleSwitcher() {
  const params = new URLSearchParams(window.location.search);
  const currentRole = normalizeMockRole(params.get("role") ?? "admin");
  const currentRoleLabel = demoRoles.includes(currentRole)
    ? getNeutralRoleLabel(currentRole)
    : getNeutralRoleLabel("admin");

  const handleChange = (role: string) => {
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set("role", role);

    navigateToRoute(`${window.location.pathname}?${nextParams.toString()}`);
  };

  const handleResetDemo = () => {
    const confirmed = window.confirm(
      "¿Deseas reiniciar los datos demo locales? Esta acción solo borra la información persistida en este navegador.",
    );

    if (!confirmed) return;

    mockBackend.clearDemoData();
    navigateToRoute(`${window.location.pathname}${window.location.search}`, { replace: true });
  };

  return (
    <details className="group rounded-[14px] border border-[color:rgba(217,221,231,0.12)] bg-[color:rgba(255,255,255,0.045)] px-3 py-2.5 text-left">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[0.82rem] font-semibold text-[var(--color-secondary-3)] transition-colors hover:text-[var(--color-white)] [&::-webkit-details-marker]:hidden">
        <span>Rol demo</span>
        <span className="min-w-0 truncate rounded-[var(--radius-pill)] bg-[color:rgba(255,255,255,0.08)] px-2 py-0.5 text-[0.72rem] font-bold text-[var(--color-white)]">
          {currentRoleLabel}
        </span>
      </summary>

      <div className="mt-3 space-y-2 border-t border-[color:rgba(217,221,231,0.10)] pt-3">
        <label
          htmlFor="sidebar-role-selector"
          className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary-2)]"
        >
          Seleccionar rol
        </label>

        <select
          id="sidebar-role-selector"
          value={currentRole}
          onChange={(event) => handleChange(event.target.value)}
          className="w-full rounded-[12px] border border-[color:rgba(217,221,231,0.16)] bg-[var(--color-footer-dark)] px-3 py-2 text-[0.84rem] font-semibold text-[var(--color-white)] outline-none transition-colors hover:border-[var(--color-secondary-3)] focus:border-[var(--color-secondary-1)]"
        >
          {demoRoles.map((role) => (
            <option key={role} value={role}>
              {getNeutralRoleLabel(role)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleResetDemo}
          className="w-full rounded-[12px] border border-[color:rgba(235,87,87,0.34)] px-3 py-2 text-[0.78rem] font-bold text-[var(--color-error)] transition-colors hover:bg-[color:rgba(235,87,87,0.12)]"
          title="Reiniciar datos demo persistidos solo en este navegador"
        >
          Reset demo
        </button>
      </div>
    </details>
  );
}
