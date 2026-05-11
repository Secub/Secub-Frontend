interface CompetenciasRaCardGridProps {
    title?: string;
    description1?: React.ReactNode;
    description2?: React.ReactNode;
    description3?: React.ReactNode;
    description4?: React.ReactNode;
    
}

export function CompetenciasRaCardGrid({
    title = "Indicaciones de Niveles de Compromiso",
    description1 = (
    <span>
      <strong className="uppercase font-semibold">Introduce (I): </strong> 
      El curso introduce la competencia al estudiante. Se presentan los conceptos 
      fundamentales y se inicia la familiarización con la competencia. El estudiante 
      tiene un primer acercamiento y comienza a comprender sus bases teóricas y prácticas.
    </span>
    ),
    description2 = (
    <span>
      <strong className="uppercase font-semibold">Refuerza (R): </strong> 
      El curso refuerza la competencia previamente introducida. Se profundiza  en los conceptos,
      se amplían las habilidades y se consolida el  conocimiento a través de aplicaciones más complejas
      y contextualizadas.
    </span>
    ),
    description3 = (
    <span>
      <strong className="uppercase font-semibold">Afianza (A): </strong> 
      El curso introduce la competencia al estudiante. Se presentan los  conceptos fundamentales y
      se inicia la familiarización con la  competencia. El estudiante tiene un primer acercamiento y
      comienza a  comprender sus bases teóricas y prácticas.
    </span>
    ),
    description4 = (
    <span>
      <strong className="uppercase font-semibold">No aplica (NA): </strong> 
      El curso no aborda ni contribuye al desarrollo de esta competencia en  particular. No se espera
      que el estudiante demuestre avance en esta  competencia como resultado del curso.
    </span>
    ),
}: CompetenciasRaCardGridProps) {

    return (
        <div>
            <h2><b>{title}</b></h2>
            <div className="mt-2">
                <p>{description1}</p>
                <p>{description2}</p>
                <p>{description3}</p>
                <p>{description4}</p>
            </div>
        </div>
    );
}

export default CompetenciasRaCardGrid;