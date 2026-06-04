import { LinkButton } from "../../../components/ui";

export default function ContactSection() {
  return (
    <section
      id="contacto"
      className="section-space border-t border-[var(--color-gray-6)] bg-white"
    >
      <div className="container-secub grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <span className="mb-4 inline-flex rounded-full bg-[var(--color-secondary-2)] px-4 py-1.5 font-heading text-sm font-semibold text-[var(--color-secondary-4)]">
            Contacto
          </span>

          <h2 className="font-heading text-3xl font-semibold leading-[1.2] text-[var(--color-secondary-4)] md:text-4xl">
            ¿Necesitas más información sobre SECUB?
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--color-gray-3)] md:text-lg">
            Si deseas conocer más sobre la plataforma, su acceso o su propósito
            dentro del proceso académico, puedes comunicarte con el equipo de
            soporte institucional.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href="mailto:soporte.secub@usb.edu.co" variant="accent" size="md" className="rounded-full">
              Contactar soporte
            </LinkButton>

            <LinkButton href="/acceder" variant="outline" size="md" className="rounded-full">
              Ir al acceso
            </LinkButton>
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--color-gray-6)] bg-[var(--color-gray-7)] p-8 md:p-10">
          <div className="grid gap-6">
            <div className="rounded-[24px] bg-white p-6">
              <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                Correo de soporte
              </p>
              <a
                href="mailto:soporte.secub@usb.edu.co"
                className="mt-3 block break-all font-heading text-2xl font-semibold text-[var(--color-secondary-4)]"
              >
                soporte.secub@usb.edu.co
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white p-6">
                <p className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
                  Acceso institucional
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-3)]">
                  El ingreso a la plataforma se realizará mediante credenciales
                  institucionales.
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-6">
                <p className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
                  Flujo por roles
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-3)]">
                  La experiencia se adapta según el rol del usuario y las
                  acciones habilitadas en cada etapa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
