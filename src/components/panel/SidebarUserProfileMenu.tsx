import { useMemo } from "react";
import { GoGear, GoSignOut } from "react-icons/go";
import { ROUTES } from "../../app/appRoutes";
import { getCurrentMockUser } from "../../services/auth/mockUser";
import {
  clearSelectedProgramId,
  getSelectedProgram,
} from "../../services/programSelection";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstInitial = parts[0]?.[0] ?? "U";
  const secondInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return `${firstInitial}${secondInitial}`.toUpperCase();
}

function buildPanelHref(pathname: string) {
  if (typeof window === "undefined") return pathname;
  return `${pathname}${window.location.search}`;
}

function logoutCurrentUser() {
  clearSelectedProgramId();
  window.location.assign(ROUTES.access);
}

function getVisibleRoleLabel(label: string) {
  return label
    .replace(/Jefatura del Programa/g, "Dirección del Programa")
    .replace(/Jefatura de programa/g, "Dirección de programa")
    .replace(/Jefatura SECUB/g, "Dirección SECUB");
}

export default function SidebarUserProfileMenu() {
  const currentUser = getCurrentMockUser();
  const selectedProgram = getSelectedProgram();
  const roleLabel = getVisibleRoleLabel(currentUser.cargo);
  const profileSubtitle = selectedProgram
    ? `${selectedProgram.name} · ${selectedProgram.faculty}`
    : currentUser.email;
  const initials = useMemo(
    () => getInitials(currentUser.nombre),
    [currentUser.nombre],
  );

  const handleLogout = () => {
    logoutCurrentUser();
  };

  return (
    <div className="space-y-2.5">
      <div
        className="flex w-full items-center gap-2.5 rounded-[14px] border border-[color:rgba(217,221,231,0.12)] bg-[color:rgba(255,255,255,0.055)] px-3 py-2.5 text-left"
        aria-label={`Perfil activo: ${roleLabel}. ${profileSubtitle}`}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[color:rgba(118,202,102,0.16)] font-heading text-[0.78rem] font-bold text-[var(--color-success)] ring-1 ring-[color:rgba(118,202,102,0.24)]"
          aria-hidden="true"
        >
          {initials}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-heading text-[0.86rem] font-semibold leading-5 text-[var(--color-white)]">
            {roleLabel}
          </span>
          <span className="block truncate text-[0.78rem] font-medium leading-4 text-[var(--color-secondary-2)]">
            {profileSubtitle}
          </span>
        </span>
      </div>

      <div
        className="grid grid-cols-2 gap-2"
        role="group"
        aria-label="Acciones de usuario"
      >
        <a
          href={buildPanelHref(ROUTES.panelSettings)}
          className="flex items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 text-[0.875rem] font-semibold text-[var(--color-secondary-2)] transition-colors hover:bg-[color:rgba(255,255,255,0.055)] hover:text-[var(--color-white)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]"
        >
          <GoGear className="shrink-0 text-base" aria-hidden="true" />
          <span>Ajustes</span>
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 text-[0.875rem] font-semibold text-[var(--color-error)] transition-colors hover:bg-[color:rgba(235,87,87,0.12)] hover:text-[color:rgba(255,137,137,1)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(235,87,87,0.26)]"
        >
          <GoSignOut className="shrink-0 text-base" aria-hidden="true" />
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
}
