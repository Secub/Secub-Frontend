import type {
  CourseRecord,
  EvaluationMatrix,
  InstrumentByRa,
  PerformanceLevelOption,
} from "./medicion-ra.types";

export const TARGET_PERCENTAGE = 70;

export const ACCEPTED_FILE_FORMATS = ".doc,.docx,.pdf,.png,.jpg,.jpeg";

export const performanceLevels: PerformanceLevelOption[] = [
  {
    value: "sobresaliente",
    label: "Sobresaliente",
    descriptor:
      "Demuestra un dominio excepcional del resultado de aprendizaje y supera lo esperado.",
    gradeRange: "Equivale a una nota entre 4.5 y 5.0",
    tone: "success",
  },
  {
    value: "satisfactorio",
    label: "Satisfactorio",
    descriptor:
      "Cumple adecuadamente con el resultado de aprendizaje establecido para el curso.",
    gradeRange: "Equivale a una nota entre 4.0 y 4.4",
    tone: "info",
  },
  {
    value: "en-desarrollo",
    label: "En desarrollo",
    descriptor:
      "Está avanzando en el resultado de aprendizaje y requiere fortalecimiento puntual.",
    gradeRange: "Equivale a una nota entre 3.0 y 3.9",
    tone: "warning",
  },
  {
    value: "deficiente",
    label: "Deficiente",
    descriptor:
      "No alcanza los niveles mínimos esperados para el resultado de aprendizaje.",
    gradeRange: "Equivale a una nota inferior a 3.0",
    tone: "danger",
  },
];

export const mockCourses: CourseRecord[] = [
  {
    id: "curso-proyecto-grado-2025-1",
    name: "Proyecto de Grado",
    code: "PG-0821",
    group: "Grupo A",
    credits: 4,
    period: "2025-1",
    program: "Ingeniería de Software",
    studyPlan: "Plan de estudios 2021",
    measurementCycle: "Ciclo de medición 2025-1",
    teacher: "Docente Demo",
    competences: [
      {
        id: "comp-diseno-experiencias",
        code: "C1",
        title: "Diseño de experiencias digitales",
        description:
          "Diseña soluciones digitales centradas en el usuario, alineadas con necesidades del contexto institucional y criterios de calidad.",
        learningResults: [
          {
            id: "ra-analizar-requerimientos",
            code: "RA01",
            title: "Analizar requerimientos",
            description:
              "Analiza necesidades, restricciones y actores del contexto para formular requerimientos funcionales y no funcionales claros, verificables y trazables.",
          },
          {
            id: "ra-proponer-solucion",
            code: "RA02",
            title: "Proponer solución UX/UI",
            description:
              "Propone una solución de experiencia e interfaz que responda al problema identificado, usando criterios de accesibilidad, usabilidad y coherencia visual.",
          },
          {
            id: "ra-validar-diseno",
            code: "RA03",
            title: "Validar diseño con usuarios",
            description:
              "Valida el diseño propuesto mediante evidencias de prueba, hallazgos de usuarios y ajustes argumentados sobre la solución planteada.",
          },
        ],
      },
      {
        id: "comp-desarrollo-software",
        code: "C2",
        title: "Construcción de software",
        description:
          "Implementa soluciones de software aplicando buenas prácticas de arquitectura, mantenibilidad y documentación técnica.",
        learningResults: [
          {
            id: "ra-implementar-modulos",
            code: "RA04",
            title: "Implementar módulos funcionales",
            description:
              "Implementa módulos funcionales con código limpio, reutilizable, organizado por responsabilidades y alineado con el flujo definido.",
          },
          {
            id: "ra-integrar-servicios",
            code: "RA05",
            title: "Integrar servicios y datos",
            description:
              "Integra fuentes de datos, servicios o estructuras simuladas dejando preparada la solución para una conexión posterior con backend.",
          },
        ],
      },
      {
        id: "comp-gestion-mejora",
        code: "C3",
        title: "Gestión y mejora continua",
        description:
          "Evalúa los resultados obtenidos, registra evidencias y propone acciones de mejora con posibilidad de seguimiento.",
        learningResults: [
          {
            id: "ra-analizar-resultados",
            code: "RA06",
            title: "Analizar resultados de medición",
            description:
              "Analiza el desempeño del grupo a partir de resultados estadísticos por RA y define conclusiones coherentes con la evidencia obtenida.",
          },
          {
            id: "ra-plan-mejora",
            code: "RA07",
            title: "Formular plan de mejora",
            description:
              "Formula acciones de mejora claras, viables y medibles para fortalecer el curso en próximas mediciones académicas.",
          },
        ],
      },
    ],
    students: [
      {
        id: "est-001",
        code: "3000000201000",
        name: "Carlos Andrés Martínez",
        email: "carlos.martinez@correo.edu.co",
      },
      {
        id: "est-002",
        code: "3000000201001",
        name: "María Fernanda López",
        email: "maria.lopez@correo.edu.co",
      },
      {
        id: "est-003",
        code: "3000000201002",
        name: "Juan David Rodríguez",
        email: "juan.rodriguez@correo.edu.co",
      },
      {
        id: "est-004",
        code: "3000000201003",
        name: "Laura Daniela Torres",
        email: "laura.torres@correo.edu.co",
      },
      {
        id: "est-005",
        code: "3000000201004",
        name: "Santiago Ramírez",
        email: "santiago.ramirez@correo.edu.co",
      },
      {
        id: "est-006",
        code: "3000000201005",
        name: "Valentina Pérez",
        email: "valentina.perez@correo.edu.co",
      },
      {
        id: "est-007",
        code: "3000000201006",
        name: "Daniela Gómez",
        email: "daniela.gomez@correo.edu.co",
      },
      {
        id: "est-008",
        code: "3000000201007",
        name: "Nicolás Herrera",
        email: "nicolas.herrera@correo.edu.co",
      },
    ],
  },
  {
    id: "curso-diseno-software-2025-1",
    name: "Diseño de Software",
    code: "DS-0612",
    group: "Grupo B",
    credits: 3,
    period: "2025-1",
    program: "Ingeniería de Software",
    studyPlan: "Plan de estudios 2021",
    measurementCycle: "Ciclo de medición 2025-1",
    teacher: "Docente Demo",
    competences: [
      {
        id: "comp-arquitectura",
        code: "C1",
        title: "Arquitectura de software",
        description:
          "Diseña componentes, flujos y decisiones técnicas que soportan soluciones mantenibles.",
        learningResults: [
          {
            id: "ra-modelar-arquitectura",
            code: "RA01",
            title: "Modelar arquitectura",
            description:
              "Representa la arquitectura de una solución mediante vistas, componentes y decisiones justificadas.",
          },
          {
            id: "ra-documentar-decisiones",
            code: "RA02",
            title: "Documentar decisiones técnicas",
            description:
              "Documenta decisiones técnicas con criterios claros, consecuencias y alternativas evaluadas.",
          },
        ],
      },
      {
        id: "comp-calidad",
        code: "C2",
        title: "Calidad de software",
        description:
          "Evalúa calidad funcional y técnica mediante criterios verificables y evidencias de validación.",
        learningResults: [
          {
            id: "ra-evaluar-calidad",
            code: "RA03",
            title: "Evaluar calidad funcional",
            description:
              "Evalúa la calidad funcional de una solución a partir de pruebas, criterios de aceptación y evidencias trazables.",
          },
        ],
      },
    ],
    students: [
      {
        id: "est-101",
        code: "3000000301000",
        name: "Ana Sofía Castillo",
        email: "ana.castillo@correo.edu.co",
      },
      {
        id: "est-102",
        code: "3000000301001",
        name: "Mateo Giraldo",
        email: "mateo.giraldo@correo.edu.co",
      },
      {
        id: "est-103",
        code: "3000000301002",
        name: "Camila Rojas",
        email: "camila.rojas@correo.edu.co",
      },
      {
        id: "est-104",
        code: "3000000301003",
        name: "Esteban Mejía",
        email: "esteban.mejia@correo.edu.co",
      },
      {
        id: "est-105",
        code: "3000000301004",
        name: "Isabella Ortiz",
        email: "isabella.ortiz@correo.edu.co",
      },
    ],
  },
];

export const mockInitialEvaluations: Record<string, EvaluationMatrix> = {
  "curso-proyecto-grado-2025-1": {
    "est-001": {
      "ra-analizar-requerimientos": "sobresaliente",
      "ra-proponer-solucion": "satisfactorio",
      "ra-validar-diseno": "en-desarrollo",
      "ra-implementar-modulos": "satisfactorio",
      "ra-integrar-servicios": "satisfactorio",
      "ra-analizar-resultados": "sobresaliente",
      "ra-plan-mejora": "satisfactorio",
    },
    "est-002": {
      "ra-analizar-requerimientos": "satisfactorio",
      "ra-proponer-solucion": "en-desarrollo",
      "ra-validar-diseno": "deficiente",
      "ra-implementar-modulos": "en-desarrollo",
      "ra-integrar-servicios": "satisfactorio",
      "ra-analizar-resultados": "satisfactorio",
      "ra-plan-mejora": "en-desarrollo",
    },
    "est-003": {
      "ra-analizar-requerimientos": "en-desarrollo",
      "ra-proponer-solucion": "deficiente",
      "ra-validar-diseno": "satisfactorio",
      "ra-implementar-modulos": "satisfactorio",
      "ra-integrar-servicios": "en-desarrollo",
      "ra-analizar-resultados": "satisfactorio",
      "ra-plan-mejora": "satisfactorio",
    },
    "est-004": {
      "ra-analizar-requerimientos": "sobresaliente",
      "ra-proponer-solucion": "satisfactorio",
      "ra-validar-diseno": "sobresaliente",
      "ra-implementar-modulos": "sobresaliente",
      "ra-integrar-servicios": "satisfactorio",
      "ra-analizar-resultados": "sobresaliente",
      "ra-plan-mejora": "sobresaliente",
    },
    "est-005": {
      "ra-analizar-requerimientos": "satisfactorio",
      "ra-proponer-solucion": "deficiente",
      "ra-validar-diseno": "en-desarrollo",
      "ra-implementar-modulos": "en-desarrollo",
      "ra-integrar-servicios": "deficiente",
      "ra-analizar-resultados": "en-desarrollo",
      "ra-plan-mejora": "satisfactorio",
    },
    "est-006": {
      "ra-analizar-requerimientos": "deficiente",
      "ra-proponer-solucion": "en-desarrollo",
      "ra-validar-diseno": "satisfactorio",
      "ra-implementar-modulos": "satisfactorio",
      "ra-integrar-servicios": "satisfactorio",
      "ra-analizar-resultados": "en-desarrollo",
      "ra-plan-mejora": "en-desarrollo",
    },
    "est-007": {
      "ra-analizar-requerimientos": "satisfactorio",
      "ra-proponer-solucion": "deficiente",
      "ra-validar-diseno": "deficiente",
      "ra-implementar-modulos": "satisfactorio",
      "ra-integrar-servicios": "en-desarrollo",
      "ra-analizar-resultados": "satisfactorio",
      "ra-plan-mejora": "satisfactorio",
    },
    "est-008": {
      "ra-analizar-requerimientos": "sobresaliente",
      "ra-proponer-solucion": "satisfactorio",
      "ra-validar-diseno": "satisfactorio",
      "ra-implementar-modulos": "sobresaliente",
      "ra-integrar-servicios": "satisfactorio",
      "ra-analizar-resultados": "sobresaliente",
      "ra-plan-mejora": "sobresaliente",
    },
  },
  "curso-diseno-software-2025-1": {
    "est-101": {
      "ra-modelar-arquitectura": "sobresaliente",
      "ra-documentar-decisiones": "satisfactorio",
      "ra-evaluar-calidad": "satisfactorio",
    },
    "est-102": {
      "ra-modelar-arquitectura": "satisfactorio",
      "ra-documentar-decisiones": "en-desarrollo",
      "ra-evaluar-calidad": "en-desarrollo",
    },
    "est-103": {
      "ra-modelar-arquitectura": "en-desarrollo",
      "ra-documentar-decisiones": "deficiente",
      "ra-evaluar-calidad": "satisfactorio",
    },
    "est-104": {
      "ra-modelar-arquitectura": "satisfactorio",
      "ra-documentar-decisiones": "satisfactorio",
      "ra-evaluar-calidad": "sobresaliente",
    },
    "est-105": {
      "ra-modelar-arquitectura": "deficiente",
      "ra-documentar-decisiones": "en-desarrollo",
      "ra-evaluar-calidad": "en-desarrollo",
    },
  },
};

export const mockInitialInstruments: Record<string, InstrumentByRa> = {
  "curso-proyecto-grado-2025-1": {
    "ra-analizar-requerimientos": {
      fileName: "",
      description: "Rúbrica de análisis de requerimientos del proyecto final.",
    },
    "ra-proponer-solucion": {
      fileName: "",
      description: "Prototipo navegable y matriz de criterios UX/UI.",
    },
    "ra-validar-diseno": {
      fileName: "",
      description: "Reporte de prueba con usuarios y ajustes realizados.",
    },
    "ra-implementar-modulos": {
      fileName: "",
      description: "Checklist técnico de entrega incremental del módulo.",
    },
    "ra-integrar-servicios": {
      fileName: "",
      description: "Evidencia de integración con datos simulados y flujo preparado para backend.",
    },
    "ra-analizar-resultados": {
      fileName: "",
      description: "Formato de análisis estadístico por resultado de aprendizaje.",
    },
    "ra-plan-mejora": {
      fileName: "",
      description: "Matriz de acciones de mejora para seguimiento del curso.",
    },
  },
  "curso-diseno-software-2025-1": {
    "ra-modelar-arquitectura": {
      fileName: "",
      description: "Rúbrica de evaluación de arquitectura de software.",
    },
    "ra-documentar-decisiones": {
      fileName: "",
      description: "Documento ADR y evidencia de decisiones técnicas.",
    },
    "ra-evaluar-calidad": {
      fileName: "",
      description: "Formato de pruebas y criterios de aceptación.",
    },
  },
};
