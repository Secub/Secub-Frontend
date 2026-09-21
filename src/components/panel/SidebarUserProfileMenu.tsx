import { useState } from "react";
import { buildRouteWithSearch, ROUTES, navigateToRoute } from "../../app/appRoutes";
import { getRoutePrefetchProps } from "../../app/router/routePrefetch";
import { SecubIcon } from "../ui";
import { getAvailableMockProfiles, getCurrentMockUser } from "../../services/auth/mockUser";
import {
  clearSelectedProgramId,
  getSelectedProgram,
} from "../../services/programSelection";
import { getBrowserLocation } from "../../shared/browser";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstInitial = parts[0]?.[0] ?? "U";
  const secondInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return `${firstInitial}${secondInitial}`.toUpperCase();
}

interface SidebarUserProfileMenuProps {
  tourIds?: {
    profile: string;
    settings: string;
    logout: string;
  };
  onStartTour?: () => void;
}

function logoutCurrentUser() {
  clearSelectedProgramId();
  navigateToRoute(ROUTES.access);
}

export default function SidebarUserProfileMenu({ tourIds, onStartTour }: SidebarUserProfileMenuProps) {
  const currentUser = getCurrentMockUser();
  const availableProfiles = getAvailableMockProfiles(currentUser);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const selectedProgram = getSelectedProgram();
  const roleLabel = currentUser.cargo;
  const profileSubtitle = selectedProgram
    ? `${selectedProgram.name} · ${selectedProgram.faculty}`
    : currentUser.email;
  const initials = getInitials(currentUser.nombre);

  const handleLogout = () => {
    logoutCurrentUser();
  };

  const handleProfileChange = (role: typeof availableProfiles[number]["role"]) => {
    const location = getBrowserLocation();
    const params = new URLSearchParams(location.search);
    params.set("role", role);
    navigateToRoute(buildRouteWithSearch(location.pathname, params), { replace: true });
    setIsProfileMenuOpen(false);
  };

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        id={tourIds?.profile}
        aria-expanded={availableProfiles.length > 1 ? isProfileMenuOpen : undefined}
        aria-haspopup={availableProfiles.length > 1 ? "listbox" : undefined}
        onClick={availableProfiles.length > 1 ? () => setIsProfileMenuOpen((value) => !value) : undefined}
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
        {availableProfiles.length > 1 ? (
          <SecubIcon
            name="chevron-down"
            size={16}
            weight="bold"
            className={isProfileMenuOpen ? "rotate-180 text-[var(--color-white)]" : "text-[var(--color-secondary-2)]"}
          />
        ) : null}
      </button>

      {isProfileMenuOpen ? (
        <div
          className="rounded-[14px] border border-[color:rgba(217,221,231,0.12)] bg-[color:rgba(255,255,255,0.045)] p-1.5"
          role="listbox"
          aria-label="Perfiles disponibles"
        >
          <p className="px-2.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary-2)]">
            Cambiar perfil
          </p>
          {availableProfiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              role="option"
              aria-selected={profile.role === currentUser.role}
              onClick={() => handleProfileChange(profile.role)}
              className="flex w-full items-center justify-between rounded-[10px] px-2.5 py-2 text-left text-sm font-semibold text-[var(--color-secondary-2)] transition-colors hover:bg-[color:rgba(255,255,255,0.07)] hover:text-[var(--color-white)]"
            >
              <span>{profile.label}</span>
              {profile.role === currentUser.role ? (
                <SecubIcon name="check" size={16} weight="bold" className="text-[var(--color-success)]" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className="grid grid-cols-2 gap-2"
        role="group"
        aria-label="Acciones de usuario"
      >
        <button
          type="button"
          id={tourIds?.settings}
          onClick={() => navigateToRoute(ROUTES.panelSettings, { preserveSearch: true })}
          {...getRoutePrefetchProps(ROUTES.panelSettings)}
          className="flex items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 text-[0.875rem] font-semibold text-[var(--color-secondary-2)] transition-colors hover:bg-[color:rgba(255,255,255,0.055)] hover:text-[var(--color-white)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]"
        >
          <SecubIcon name="settings" size={18} weight="regular" />
          <span>Ajustes</span>
        </button>

        <button
          type="button"
          id={tourIds?.logout}
          onClick={handleLogout}
          className="flex items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 text-[0.875rem] font-semibold text-[var(--color-error)] transition-colors hover:bg-[color:rgba(235,87,87,0.12)] hover:text-[color:rgba(255,137,137,1)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(235,87,87,0.26)]"
        >
          <SecubIcon name="sign-out" size={18} weight="regular" />
          <span>Salir</span>
        </button>
      </div>

      {onStartTour ? (
        <button
          type="button"
          onClick={onStartTour}
          className="w-full rounded-[10px] px-2 py-1 text-xs font-semibold text-[var(--color-secondary-2)] underline transition-colors hover:text-[var(--color-white)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]"
        >
          Ver guía del panel
        </button>
      ) : null}
    </div>
  );
}
