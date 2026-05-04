import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionIntro from "./SectionIntro";

import GestionEstructuradaImg from "../../../assets/modulos/gestion-estructurada.webp";
import SeguimientoContinuoImg from "../../../assets/modulos/seguimiento-continuo.webp";
import SoporteCalidadImg from "../../../assets/modulos/soporte-calidad_1.webp";

type Slide = {
  title: string;
  description: string;
  highlights: string[];
  image: string;
};

const slides: Slide[] = [
  {
    title: "Gestión estructurada",
    description:
      "Organiza la información académica bajo una lógica clara de módulos, flujos y etapas del proceso institucional.",
    highlights: [
      "Centraliza la información académica en un solo entorno.",
      "Ordena procesos, etapas y relaciones entre módulos.",
      "Facilita una lectura más clara del avance institucional.",
    ],
    image: GestionEstructuradaImg,
  },
  {
    title: "Seguimiento continuo",
    description:
      "Ayuda a visualizar avances, estados y pendientes para mantener un control permanente sobre la implementación y evaluación.",
    highlights: [
      "Permite monitorear avances y estados del proceso.",
      "Hace visibles pendientes y trazabilidad.",
      "Apoya el control continuo de implementación y evaluación.",
    ],
    image: SeguimientoContinuoImg,
  },
  {
    title: "Soporte a la calidad",
    description:
      "Facilita la articulación entre planeación, seguimiento y medición de resultados para fortalecer los procesos de aseguramiento de la calidad.",
    highlights: [
      "Conecta planeación, seguimiento y medición.",
      "Fortalece procesos de aseguramiento de la calidad.",
      "Apoya la toma de decisiones académicas.",
    ],
    image: SoporteCalidadImg,
  },
];

const viewportConfig = {
  once: true,
  amount: 0.2,
};

export default function AboutSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const activeSlide = slides[activeIndex];

  return (
    <section id="acerca" className="section-space bg-[var(--color-gray-7)]">
      <div className="container-secub">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <SectionIntro
            eyebrow="¿Qué es SECUB?"
            title="Una plataforma para organizar, evaluar y dar seguimiento a los procesos académicos"
            description="SECUB centraliza la gestión de perfil de egreso, propósito de formación, competencias, resultados de aprendizaje, mapeo curricular y medición, permitiendo una visión clara y estructurada de los procesos formativos."
          />
        </motion.div>

        <motion.div
          className="mt-12 overflow-hidden rounded-[28px] border border-[var(--color-gray-6)] bg-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.22)]"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
        >
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div
              className="relative min-h-[260px] overflow-hidden bg-[var(--color-gray-6)] sm:min-h-[320px] lg:min-h-[430px]"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewportConfig}
              transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
            >
              {slides.map((slide, index) => (
                <img
                  key={slide.title}
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                    index === activeIndex
                      ? "scale-100 opacity-100"
                      : "scale-105 opacity-0"
                  }`}
                />
              ))}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.16)_100%)]" />

              <button
                type="button"
                onClick={prevSlide}
                aria-label="Ver slide anterior"
                className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[var(--color-secondary-4)] shadow-sm backdrop-blur transition hover:bg-white"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Ver siguiente slide"
                className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[var(--color-secondary-4)] shadow-sm backdrop-blur transition hover:bg-white"
              >
                <ChevronRight size={18} />
              </button>
            </motion.div>

            <motion.div
              className="flex flex-col justify-center p-6 sm:p-7 lg:p-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewportConfig}
              transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
            >
              <span className="inline-flex w-fit rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--color-primary)]">
                0{activeIndex + 1}
              </span>

              <h3 className="mt-4 font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
                {activeSlide.title}
              </h3>

              <p className="mt-4 text-base leading-7 text-[var(--color-gray-3)]">
                {activeSlide.description}
              </p>

              <div className="mt-6 space-y-3">
                {activeSlide.highlights.map((item, index) => (
                  <motion.div
                    key={item}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewportConfig}
                    transition={{
                      duration: 0.4,
                      delay: 0.22 + index * 0.06,
                      ease: "easeOut",
                    }}
                  >
                    <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]" />
                    <p className="text-base leading-7 text-[var(--color-gray-3)]">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}