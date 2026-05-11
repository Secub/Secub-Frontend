interface MapeoCompetenciasCardGridProps {
    title?: string;
    description1?: React.ReactNode;
    description2?: React.ReactNode;
    description3?: React.ReactNode;
    
}

export function MapeoCompetenciasCardGrid({
    title = "Indicaciones de Nucleos de Formación",
    description1 = (
    <span>
      <strong className="uppercase font-semibold">Núcleo Fundamentación: </strong> 
      aborda lo genérico del campo de formación donde se sitúa la disciplina. Trabaja lo concerniente a los conceptos
      y métodos de aproxi- 35 mación al objeto de estudio y potencia capacidades para la lectura, la indagación,
      el razonamiento y las habilidades de comunicación oral y escrita efectivas. 
    </span>
    ),
    description2 = (
    <span>
      <strong className="uppercase font-semibold">Núcleo Profesional: </strong> 
      se refiere a la estructura conceptual requerida para la formación del profesional en su disciplina o profesión.
    </span>
    ),
    description3 = (
    <span>
      <strong className="uppercase font-semibold">Núcleo Síntesis: </strong> 
      trabaja la contextualización, la síntesis y la aplicación del conocimiento como estrategias para la verificación
      del manejo teoría-práctica; relación con el medio profesional y el entorno social; investigación y aporte a la
      comunidad complementación y actualización del conocimiento y la ética profesional.
    </span>
    ),
}: MapeoCompetenciasCardGridProps) {

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

export default MapeoCompetenciasCardGrid;