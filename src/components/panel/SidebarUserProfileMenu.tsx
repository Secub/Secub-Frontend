import { useEffect, useId, useMemo, useRef, useState } from "react";
import { GoBook, GoChevronDown, GoLock, GoShieldCheck } from "react-icons/go";
import { FaUniversalAccess } from "react-icons/fa";
import { ROUTES } from "../../app/appRoutes";
import { getCurrentMockUser } from "../../services/auth/mockUser";
import { clearSelectedProgramId } from "../../services/programSelection";
import UserProfileActionCard from "./UserProfileActionCard";

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

function changeCurrentProgram(role: string) {
  clearSelectedProgramId();
  window.location.assign(`${ROUTES.programSelector}?role=${role}`);
}

export default function SidebarUserProfileMenu() {
  const currentUser = getCurrentMockUser();
  const roleLabel = currentUser.cargo;
  const initials = useMemo(() => getInitials(currentUser.nombre), [currentUser.nombre]);
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  const handleChangeProgram = () => {
    setIsOpen(false);
    changeCurrentProgram(currentUser.role);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logoutCurrentUser();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="group flex w-full items-center gap-3 rounded-[var(--radius-lg)] border border-[color:rgba(255,255,255,0.12)] bg-[color:rgba(255,255,255,0.04)] px-3 py-3 text-left transition-all hover:border-[color:rgba(255,255,255,0.24)] hover:bg-[var(--color-secondary-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-secondary-1)] font-heading text-sm font-bold text-[var(--color-white)]"
          aria-hidden="true"
        >
          {initials}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-heading text-[0.9rem] font-semibold leading-5 text-[var(--color-white)]">
            {currentUser.nombre}
          </span>
          <span className="block truncate text-[0.72rem] font-medium leading-5 text-[var(--color-secondary-3)] transition-colors group-hover:text-[var(--color-secondary-2)]">
            {roleLabel}
          </span>
        </span>

        <GoChevronDown
          className={[
            "shrink-0 text-[1rem] text-[var(--color-secondary-3)] transition-transform",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <section
          id={menuId}
          role="menu"
          aria-label="Menú de perfil del usuario"
          className="profile-user-menu"
        >
          <div className="profile-user-menu__header" role="none">
            <p className="profile-user-menu__eyebrow">Perfil SECUB</p>
            <p className="profile-user-menu__title">Opciones de usuario</p>
          </div>

          <div className="profile-user-menu__actions" role="none">
            <UserProfileActionCard
              href={buildPanelHref(ROUTES.panelSettings)}
              role="menuitem"
              icon={<GoShieldCheck />}
              title="Ajustes de usuario"
              description="Administra tu información y preferencias"
              onClick={() => setIsOpen(false)}
            />

            <UserProfileActionCard
              href={buildPanelHref(ROUTES.panelAccessibility)}
              role="menuitem"
              icon={<FaUniversalAccess />}
              title="Accesibilidad"
              description="Ajusta contraste o tamaño de texto"
              onClick={() => setIsOpen(false)}
            />

            <UserProfileActionCard
              role="menuitem"
              icon={<GoBook />}
              title="Cambiar programa"
              description="Selecciona Psicología o Derecho"
              onClick={handleChangeProgram}
            />

            <UserProfileActionCard
              role="menuitem"
              icon={<GoLock />}
              title="Cerrar sesión"
              description="Finaliza tu sesión de forma segura"
              intent="danger"
              onClick={handleLogout}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
