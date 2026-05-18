import { mockBackend } from "../../services/mockBackend";

const devRoles = [
  { value: "admin", label: "Super Admin" },
  { value: "vice", label: "Vice/Admin" },
  { value: "decano", label: "Decano" },
  { value: "director", label: "Director" },
  { value: "docente", label: "Docente" },
];

export default function DevRoleSelector() {
  const params = new URLSearchParams(window.location.search);
  const currentRole = params.get("role") ?? "admin";

  const handleChange = (role: string) => {
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set("role", role);

    window.location.href = `${window.location.pathname}?${nextParams.toString()}`;
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
    <div className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-gray-6)] bg-[var(--color-white)] px-3 py-2 shadow-[var(--shadow-sm)]">
      <label
        htmlFor="dev-role-selector"
        className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]"
      >
        Rol demo
      </label>

      <select
        id="dev-role-selector"
        value={currentRole}
        onChange={(event) => handleChange(event.target.value)}
        className="bg-transparent text-sm font-semibold text-[var(--color-secondary-4)] focus:outline-none"
      >
        {devRoles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>

      <span className="h-5 w-px bg-[var(--color-gray-6)]" />

      <button
        type="button"
        onClick={handleResetDemo}
        className="text-xs font-semibold text-[var(--color-error)] transition-colors hover:text-[var(--color-secondary-4)]"
        title="Reiniciar datos demo persistidos solo en este navegador"
      >
        Reset demo
      </button>
    </div>
  );
}
