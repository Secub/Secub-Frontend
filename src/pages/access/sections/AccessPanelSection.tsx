import { GoChevronLeft } from "react-icons/go";
import LogoUSB from "../../../assets/LogoUSB.png";

export default function AccessPanelSection() {
  const microsoftLoginUrl = "#";

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-6 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-12">
      <div className="w-full max-w-[360px] sm:max-w-[390px]">
        <a
          href="/"
          className="mb-7 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-gray-3)] transition-colors hover:text-[var(--color-secondary-4)]"
        >
          <GoChevronLeft className="text-[20px]" />
          Volver al inicio
        </a>

        <div className="mb-8">
          <img
            src={LogoUSB}
            alt="Universidad de San Buenaventura"
            className="h-auto w-[190px] max-w-full object-contain sm:w-[220px]"
          />
        </div>

        <div>
          <h1 className="font-heading text-[3rem] font-semibold leading-[0.95] text-[var(--color-secondary-4)] sm:text-[3.5rem]">
            Acceder
          </h1>

          <p className="mt-4 text-[15px] leading-7 text-[var(--color-gray-3)]">
            El acceso a SECUB se realiza con la cuenta corporativa de Microsoft.
            No necesitas registrarte nuevamente.
          </p>
        </div>

        <div className="mt-6">
        
          <a
            href={microsoftLoginUrl}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-center font-heading text-base font-semibold text-white shadow-[0_12px_24px_rgba(248,129,29,0.26)] transition-all duration-200 hover:-translate-y-[1px] hover:opacity-95"
          >
            <span className="grid grid-cols-2 gap-[2px] rounded-[4px] bg-white/15 p-[3px]">
              <span className="h-2.5 w-2.5 bg-[#f25022]" />
              <span className="h-2.5 w-2.5 bg-[#7fba00]" />
              <span className="h-2.5 w-2.5 bg-[#00a4ef]" />
              <span className="h-2.5 w-2.5 bg-[#ffb900]" />
            </span>

            Iniciar sesión con Microsoft
          </a>
        </div>

        <div className="mt-6 rounded-[20px] border border-[var(--color-gray-6)] bg-white px-5 py-4 shadow-[0_10px_25px_rgba(24,34,51,0.04)]">
          <p className="text-sm leading-7 text-[var(--color-gray-3)]">
            Serás redirigido al inicio de sesión institucional de Microsoft para
            validar tu correo corporativo y acceder a la plataforma.
          </p>
        </div>



        <div className="mt-8 text-sm leading-7 text-[var(--color-gray-3)]">
          <p>
            Usa tu correo corporativo para acceder a SECUB. Los permisos y la
            visualización dentro de la plataforma dependen de la configuración
            institucional del usuario.
          </p>
        </div>
      </div>
    </section>
  );
}