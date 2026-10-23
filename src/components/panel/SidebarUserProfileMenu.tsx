import { ROUTES, navigateToRoute } from "../../app/appRoutes";
import { getRoutePrefetchProps } from "../../app/router/routePrefetch";
import { SecubIcon } from "../ui";
import { getStoredAuthSession, logoutAuthSession } from "../../services/auth/session";
import { clearSelectedProgramId } from "../../services/programSelection";

async function logoutCurrentUser() {
  try {
    await logoutAuthSession();
  } finally {
    clearSelectedProgramId();
    navigateToRoute(ROUTES.access);
  }
}

interface SidebarUserProfileMenuProps {
  tourIds?: {
    settings: string;
    logout: string;
  };
}

export default function SidebarUserProfileMenu({ tourIds }: SidebarUserProfileMenuProps) {
  const session = getStoredAuthSession();
  const canChangeProgram = (session?.contexts.length ?? 0) > 1;

  const handleLogout = () => void logoutCurrentUser();

  return (
    <div className="space-y-2.5">
      {canChangeProgram ? (
        <button
          type="button"
          onClick={() => navigateToRoute(ROUTES.programSelector)}
          {...getRoutePrefetchProps(ROUTES.programSelector)}
          className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-[color:var(--color-sidebar-border)] px-2 py-2 text-[0.82rem] font-semibold text-[var(--color-secondary-2)] transition-colors hover:bg-[color:var(--color-sidebar-hover)] hover:text-[var(--color-white)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)]"
        >
          <SecubIcon name="book" size={17} weight="regular" />
          <span>Cambiar programa</span>
        </button>
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
          className="flex items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 text-[0.875rem] font-semibold text-[var(--color-secondary-2)] transition-colors hover:bg-[color:var(--color-sidebar-hover)] hover:text-[var(--color-white)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)]"
        >
          <SecubIcon name="settings" size={18} weight="regular" />
          <span>Ajustes</span>
        </button>

        <button
          type="button"
          id={tourIds?.logout}
          onClick={handleLogout}
          className="flex items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 text-[0.875rem] font-semibold text-[var(--color-error)] transition-colors hover:bg-[color:var(--color-tint-danger-strong)] hover:text-[color:var(--color-sidebar-danger)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--color-ring-danger)]"
        >
          <SecubIcon name="sign-out" size={18} weight="regular" />
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
}
