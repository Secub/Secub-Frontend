import LogoUSB from "../../../assets/logos/logo-usb.png";
import LogoSecub from "../../../assets/logos/logo-secub.png";
import { LinkButton } from "../../../components/ui";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-gray-6)] bg-white/90 backdrop-blur">
      <div className="container-secub flex h-20 items-center justify-between gap-6">
        <a href="#inicio" className="flex items-center gap-3" aria-label="Ir al inicio de SECUB">
          <img
            src={LogoUSB}
            alt="Universidad de San Buenaventura"
            className="h-10 w-auto object-contain"
          />
           <img
            src={LogoSecub}
            alt="SECUB"
            className="h-10 w-25 object-contain"
          />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#inicio" className="nav-link">
            Inicio
          </a>
          <a href="#acerca" className="nav-link">
            Acerca
          </a>
          <a href="#modulos" className="nav-link">
            Módulos
          </a>
          <a href="#beneficios" className="nav-link">
            Beneficios
          </a>
          <a href="#contacto" className="nav-link">
            Contacto
          </a>
          <a href="#accesibilidad" className="nav-link">
            Accesibilidad
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LinkButton href="#acerca" variant="outline" size="md" className="hidden rounded-full sm:inline-flex">
            Conocer más
          </LinkButton>

          <LinkButton href="/acceder" variant="accent" size="md" className="rounded-full">
            Acceder
          </LinkButton>
        </div>
      </div>
    </header>
  );
}