// // Aqui va la tabla con la informacion de la indicaciores de cladsificacion para cada semestreimport type { ReactNode } from "react";

// import type { ReactNode } from "react";

// export interface CardProps {
//   /** Título principal de la tarjeta */
//   title : "Indicaciones de Núcleos de Formación";
//   /** Texto secundario o descripción debajo del título */
//   description: "Núcleo de fundamentación: aborda lo genérico del campo de formación donde se sitúa la disciplina. Trabaja lo concerniente a los conceptos y métodos de aproxi- 35 mación al objeto de estudio y potencia capacidades para la lectura, la indagación, el razonamiento y las habilidades de comunicación oral y escrita efectivas."
//                + "Núcleo profesional: se refiere a la estructura conceptual requerida para la formación del profesional en su disciplina o profesión."
//                + "Núcleo de síntesis: trabaja la contextualización, la síntesis y la aplicación del conocimiento como estrategias para la verificación del manejo teoría-práctica; relación con el medio profesional y el entorno social; investigación y aporte a la comunidad; complementación y actualización del conocimiento y la ética profesional.";

// }

// export function Card({
//   title,
//   description,
// }: CardProps) {
//   // Verificamos si necesitamos renderizar la sección de la cabecera
//   const hasHeader = title || description || headerAction;

//   return (
//     <div className={`surface-card p-6 ${className}`.trim()}>
//       {/* Cabecera dinámica */}
//       {hasHeader && (
//         <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
//           <div>
//             {title && (
//               <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
//                 {title}
//               </h3>
//             )}
//             {description && (
//               <p className="mt-1 text-sm text-[var(--color-gray-3)]">
//                 {description}
//               </p>
//             )}
//           </div>

//           {/* Acciones de la cabecera (Botones, filtros, etc.) */}
//           {headerAction && <div>{headerAction}</div>}
//         </div>
//       )}

//       {/* Contenido principal */}
//       <div className="card-content">
//         {children}
//       </div>

//       {/* Pie de página opcional */}
//       {footer && (
//         <div className="mt-5 border-t border-[var(--color-gray-2)] pt-4">
//           {footer}
//         </div>
//       )}
//     </div>
//   );
// }

// export default Card;

interface CompetenciasRaCardGridProps {
    title?: string;
    description1?: string;
    description2?: string;
    description3?: string;
}

export function CompetenciasRaCardGrid({
    title = "Indicaciones de Núcleos de Formación",
    description1 = "Núcleo de fundamentación: aborda lo genérico del campo de formación donde se sitúa la disciplina. Trabaja lo concerniente a los conceptos y métodos de aproxi- 35 mación al objeto de estudio y potencia capacidades para la lectura, la indagación, el razonamiento y las habilidades de comunicación oral y escrita efectivas. ",
    description2 = "Núcleo profesional: se refiere a la estructura conceptual requerida para la formación del profesional en su disciplina o profesión.",
    description3 = "Núcleo de síntesis: trabaja la contextualización, la síntesis y la aplicación del conocimiento como estrategias para la verificación del manejo teoría-práctica; relación con el medio profesional y el entorno social; investigación y aporte a la comunidad complementación y actualización del conocimiento y la ética profesional.",
}: CompetenciasRaCardGridProps) {

    return (
        <div>
            <h2><b>{title}</b></h2>
            <div className="mt-2">
                <p>{description1}</p>
                <p>{description2}</p>
                <p>{description3}</p>
            </div>
        </div>
    );
}

export default CompetenciasRaCardGrid;