export default function LandingFooterSection() {
  return (
    <footer className="mt-0">
      <section className="border-t border-[var(--color-gray-6)] bg-[var(--color-footer-light)]">
        <div className="container-secub py-8 md:py-10">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="partner-logo-box">ALIADO 1</div>
            <div className="partner-logo-box">ALIADO 2</div>
            <div className="partner-logo-box">ALIADO 3</div>
            <div className="partner-logo-box">ALIADO 4</div>
            <div className="partner-logo-box">ALIADO 5</div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-footer-dark)] text-white">
        <div className="container-secub py-10 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr_0.7fr]">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <div className="footer-image-placeholder h-24">LOGO USB</div>
                <p className="mt-4 text-sm leading-6 text-white/75">
                  Reemplaza este bloque por el logo institucional oficial.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <div className="footer-image-placeholder h-24">SELLO</div>
                <p className="mt-4 text-sm leading-6 text-white/75">
                  Reemplaza este bloque por el sello o insignia institucional.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-heading text-2xl font-semibold text-white">
                Universidad de San Buenaventura
              </h3>

              <div className="mt-5 space-y-3 text-base leading-7 text-white/80">
                <p>
                  <span className="font-heading font-semibold text-white">
                    Dirección:
                  </span>{" "}
                  Cra 9 # 123 - 76 Of. 602 - 603
                </p>

                <p>
                  <span className="font-heading font-semibold text-white">
                    Email información:
                  </span>{" "}
                  webmaster@usb.edu.co
                </p>

                <p>
                  <span className="font-heading font-semibold text-white">
                    Contacto SECUB:
                  </span>{" "}
                  soporte.secub@usb.edu.co
                </p>

                <p>
                  <span className="font-heading font-semibold text-white">
                    Trabaje con nosotros:
                  </span>{" "}
                  ¡Conoce nuestras ofertas laborales!
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-heading text-2xl font-semibold text-white">
                Sede y seccionales
              </h3>

              <ul className="mt-5 space-y-3 text-base leading-7 text-white/80">
                <li>- Bogotá</li>
                <li>- Medellín</li>
                <li>- Cali</li>
                <li>- Cartagena</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-primary)] text-white">
        <div className="container-secub flex flex-col gap-4 py-5 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-sm leading-6 md:text-base">
            Copyright © 2026 Universidad de San Buenaventura
          </p>

          <div className="flex flex-col gap-2 text-sm font-semibold md:flex-row md:gap-6 md:text-base">
            <a href="#" className="footer-bottom-link">
              Políticas de uso y privacidad
            </a>
            <a href="#" className="footer-bottom-link">
              Términos y condiciones
            </a>
          </div>
        </div>
      </section>
    </footer>
  );
}