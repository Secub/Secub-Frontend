import CampusMosaic from "../../../components/shared/CampusMosaic";

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-[calc(100vh-80px)] overflow-hidden border-b border-[var(--color-gray-6)]"
    >
      <div className="absolute inset-0 opacity-[0.24] mix-blend-multiply">
        <CampusMosaic hideTitles layout="fill" className="h-full w-full" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(134,0,95,0.82)_0%,rgba(179,0,110,0.80)_24%,rgba(209,58,90,0.68)_48%,rgba(240,106,47,0.68)_74%,rgba(248,129,29,0.72)_100%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.07),transparent_15%)]" />

      <div className="absolute inset-0">
        <div className="absolute left-[4%] top-[15%] h-[180px] w-[130px] rotate-[-8deg] rounded-full bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.7)_0px,rgba(255,255,255,0.7)_2px,transparent_2px,transparent_11px)] opacity-35" />

        <div className="absolute right-[9%] top-[12%] h-[210px] w-[150px] rotate-[8deg] rounded-full bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.7)_0px,rgba(255,255,255,0.7)_2px,transparent_2px,transparent_11px)] opacity-35" />

        <div className="absolute left-[6%] bottom-[14%] h-[150px] w-[140px] rounded-[24px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.92)_0px,rgba(255,255,255,0.92)_2px,transparent_3px)] [background-size:24px_24px] opacity-68" />

        

        <div className="absolute right-[8%] bottom-[18%] flex gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={`hero-bottom-dot-${index}`}
              className="h-2.5 w-2.5 rounded-full bg-white/90"
            />
          ))}
        </div>

        <div className="absolute left-[23%] top-[44%] h-4 w-4 rounded-full bg-white shadow-[0_0_16px_7px_rgba(255,255,255,0.45)]" />
        <div className="absolute right-[24%] top-[50%] h-4 w-4 rounded-full bg-white shadow-[0_0_16px_7px_rgba(255,255,255,0.45)]" />
      </div>

      <div className="container-secub relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center py-16 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-heading text-4xl font-semibold leading-[1.05] text-white md:text-6xl xl:text-7xl">
            SECUB: Sistema de evalución Bonaventuriano
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/90 md:text-xl">
            La plataforma de la Vicerrectoría Académica de la USB Cali apoya la
            implementación del Decreto 1330 de 2019, facilitando la gestión,
            trazabilidad y medición de los procesos académicos asociados al
            aseguramiento de la calidad.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/acceder" className="button-primary justify-center">
              Acceder
            </a>

            <a
              href="#modulos"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 font-heading text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/18"
            >
              Ver módulos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}