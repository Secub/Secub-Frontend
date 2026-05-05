const devRoles = [
  { value: "admin", label: "Admin" },
  { value: "vice", label: "Vice" },
  { value: "decano", label: "Decano" },
  { value: "director", label: "Director" },
  { value: "docente", label: "Docente" },
];

export default function DevRoleSelector() {
  const params = new URLSearchParams(window.location.search);
  const currentRole = params.get("role") ?? "docente";

  const handleChange = (role: string) => {
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set("role", role);

    window.location.href = `${window.location.pathname}?${nextParams.toString()}`;
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
    </div>
  );
}
