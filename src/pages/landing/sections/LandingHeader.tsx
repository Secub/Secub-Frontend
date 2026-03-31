import LogoUSB from "../../../assets/logos/LogoUSB.png";
import { Button } from "../../../components/ui";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-gray-6)] bg-white/90 backdrop-blur">
      <div className="container-secub flex h-20 items-center justify-between gap-6">
        <a href="#inicio" className="flex items-center gap-3">
          <img
            src={LogoUSB}
            alt="Universidad de San Buenaventura"
            className="h-10 w-auto object-contain"
          />

          <span className="font-heading text-xl font-semibold tracking-[0.04em] text-[var(--color-secondary-4)]">
            SECUB
          </span>
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
        </nav>

        <div className="flex items-center gap-3">
          <a href="#acerca" className="hidden sm:block">
            <Button variant="outline" size="md" className="rounded-full">
              Conocer más
            </Button>
          </a>

          <a href="/acceder">
            <Button variant="accent" size="md" className="rounded-full">
              Acceder
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}