import { GoChevronUp } from "react-icons/go";
import { ROUTES } from "../../../app/appRoutes";
import LogoUsbFooter from "../../../assets/logos/logo-usb-footer.png";
import LogoAltaCalidad from "../../../assets/logos/logo-alta-calidad.png";

export default function LandingFooterSection() {
  return (
    <footer className="mt-0">
      <section className="bg-[#1f1f22] text-white">
        <div className="container-secub py-14 lg:py-10">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_0.75fr_0.55fr] lg:items-start">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-10">

              <div className="flex items-center">
                <img
                  src={LogoAltaCalidad}
                  alt="Acreditación Institucional de Alta Calidad Multicampus"
                  className="h-auto w-[240px] max-w-full object-contain"
                />
              </div>

              <div className="flex items-center">
                <img
                  src={LogoUsbFooter}
                  alt="Universidad de San Buenaventura"
                  className="h-auto w-[300px] max-w-full object-contain"
                />
              </div>

              
            </div>

            <div>
              <h3 className="font-heading text-[1.15rem] font-semibold leading-tight text-white">
                Universidad de San Buenaventura
              </h3>

              <div className="mt-2 space-y-0.1 text-[0.98rem] leading-5 text-white">
                <p className="font-heading font-semibold">Dirección:</p>
                <p>Cra 9 # 123 - 76 Of. 602 - 603</p>

                <p className="font-heading pt-1 font-semibold">
                  Email información:
                </p>
                <p>webmaster@usb.edu.co</p>

                <p className="font-heading pt-1 font-semibold">
                  Trabaje con nosotros:
                </p>
                <p>
                  <a
                    href="https://fa-ewdp-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/es/sites/Portal-USB"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-opacity hover:opacity-80"
                  >
                    ¡Conoce nuestras ofertas laborales!
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-heading text-[1.15rem] font-semibold leading-tight text-white">
                Seccional
              </h3>

              <ul className="mt-2 space-y-0.5 text-[0.98rem] leading-8 text-white">
                <li>
                  <a
                    href="https://usbcali.edu.co/"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-opacity hover:opacity-80"
                  >
                    - Seccional Cali
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-primary)] text-white">
        <div className="container-secub flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-left text-[0.98rem] leading-6">
            Copyright © 2023 Universidad de San Buenaventura
          </p>

          <div className="flex items-center justify-between gap-6 md:justify-end">
            <div className="text-left text-[0.92rem] font-bold leading-6">
              <a
                href={ROUTES.privacyPolicy}
                className="transition-opacity hover:opacity-80"
              >
                Políticas de uso y privacidad
              </a>
              <span className="mx-2">|</span>
              <a
                href={ROUTES.termsAndConditions}
                className="transition-opacity hover:opacity-80"
              >
                Términos y condiciones
              </a>
            </div>

            <a
              href="#inicio"
              aria-label="Volver arriba"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <GoChevronUp aria-hidden="true" className="text-[24px]" />
            </a>
          </div>
        </div>
      </section>
    </footer>
  );
}
