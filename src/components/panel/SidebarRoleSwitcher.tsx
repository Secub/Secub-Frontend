import { getNeutralRoleLabel, type MockUserRole } from "../../services/auth/mockUser";
import { mockBackend } from "../../services/mockBackend";

const demoRoles: MockUserRole[] = ["admin", "vice", "decano", "director", "docente"];

export default function SidebarRoleSwitcher() {
  const params = new URLSearchParams(window.location.search);
  const currentRole = (params.get("role") ?? "admin") as MockUserRole;
  const currentRoleLabel = demoRoles.includes(currentRole)
    ? getNeutralRoleLabel(currentRole)
    : getNeutralRoleLabel("admin");

  const handleChange = (role: string) => {
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set("role", role);

    window.location.assign(`${window.location.pathname}?${nextParams.toString()}`);
  };

  const handleResetDemo = () => {
    const confirmed = window.confirm(
      "¿Deseas reiniciar los datos demo locales? Esta acción solo borra la información persistida en este navegador.",
    );

    if (!confirmed) return;

    mockBackend.clearDemoData();
    window.location.reload();
  };

  return (
    <details className="group rounded-[var(--radius-lg)] border border-[color:rgba(255,255,255,0.12)] bg-[color:rgba(255,255,255,0.04)] px-4 py-3 text-left">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[var(--color-secondary-3)] transition-colors hover:text-[var(--color-white)] [&::-webkit-details-marker]:hidden">
        <span>Rol demo</span>
        <span className="rounded-[var(--radius-pill)] bg-[color:rgba(255,255,255,0.08)] px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.12em] text-[var(--color-white)]">
          {currentRoleLabel}
        </span>
      </summary>

      <div className="mt-3 space-y-3 border-t border-[color:rgba(255,255,255,0.10)] pt-3">
        <label
          htmlFor="sidebar-role-selector"
          className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-secondary-2)]"
        >
          Seleccionar rol
        </label>

        <select
          id="sidebar-role-selector"
          value={currentRole}
          onChange={(event) => handleChange(event.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[color:rgba(255,255,255,0.16)] bg-[var(--color-footer-dark)] px-3 py-2 text-sm font-semibold text-[var(--color-white)] outline-none transition-colors hover:border-[var(--color-secondary-3)] focus:border-[var(--color-secondary-1)]"
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
          className="w-full rounded-[var(--radius-md)] border border-[color:rgba(235,87,87,0.38)] px-3 py-2 text-xs font-semibold text-[var(--color-error)] transition-colors hover:bg-[color:rgba(235,87,87,0.12)]"
          title="Reiniciar datos demo persistidos solo en este navegador"
        >
          Reset demo
        </button>
      </div>
    </details>
  );
}
