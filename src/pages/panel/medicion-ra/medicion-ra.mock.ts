import { secubAcademicCourses, secubAcademicPrograms } from "../../../data/secubAcademicPrograms";
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
    descriptor: "Demuestra un dominio excepcional del resultado de aprendizaje y supera lo esperado.",
    gradeRange: "Equivale a una nota entre 4.5 y 5.0",
    tone: "success",
  },
  {
    value: "satisfactorio",
    label: "Satisfactorio",
    descriptor: "Cumple adecuadamente con el resultado de aprendizaje establecido para el curso.",
    gradeRange: "Equivale a una nota entre 4.0 y 4.4",
    tone: "info",
  },
  {
    value: "en-desarrollo",
    label: "En desarrollo",
    descriptor: "Está avanzando en el resultado de aprendizaje y requiere fortalecimiento puntual.",
    gradeRange: "Equivale a una nota entre 3.0 y 3.9",
    tone: "warning",
  },
  {
    value: "deficiente",
    label: "Deficiente",
    descriptor: "No alcanza los niveles mínimos esperados para el resultado de aprendizaje.",
    gradeRange: "Equivale a una nota inferior a 3.0",
    tone: "danger",
  },
];

const baseStudents = [
  { id: "est-001", code: "3000000201000", name: "Carlos Andrés Martínez", email: "carlos.martinez@correo.edu.co" },
  { id: "est-002", code: "3000000201001", name: "María Fernanda López", email: "maria.lopez@correo.edu.co" },
  { id: "est-003", code: "3000000201002", name: "Juan David Rodríguez", email: "juan.rodriguez@correo.edu.co" },
  { id: "est-004", code: "3000000201003", name: "Laura Daniela Torres", email: "laura.torres@correo.edu.co" },
  { id: "est-005", code: "3000000201004", name: "Santiago Ramírez", email: "santiago.ramirez@correo.edu.co" },
  { id: "est-006", code: "3000000201005", name: "Valentina Pérez", email: "valentina.perez@correo.edu.co" },
  { id: "est-007", code: "3000000201006", name: "Daniela Gómez", email: "daniela.gomez@correo.edu.co" },
  { id: "est-008", code: "3000000201007", name: "Nicolás Herrera", email: "nicolas.herrera@correo.edu.co" },
];

const courseIds = [
  "psicologia-sem8-practica-profesional-i",
  "psicologia-sem9-practica-profesional-ii",
  "derecho-sem7-procesal-civil-ii",
  "derecho-sem8-programa-complementario-de-formacion-avanzada",
];

function getProgramName(programId: string) {
  return secubAcademicPrograms.find((program) => program.id === programId)?.name ?? "Programa académico";
}

function getPlanName(programId: string) {
  const program = secubAcademicPrograms.find((item) => item.id === programId);
  return program ? `Plan de estudios ${program.planVersion}` : "Plan de estudios";
}

function buildCompetences(programId: string) {
  const isPsychology = programId === "psicologia";

  return [
    {
      id: `${programId}-comp-investigacion-contexto`,
      code: "C1",
      title: isPsychology ? "Investigación y comprensión del sujeto" : "Investigación y análisis jurídico",
      description: isPsychology
        ? "Analiza fenómenos psicológicos y sociales desde evidencias y criterios metodológicos."
        : "Analiza situaciones jurídicas desde evidencias, normas y criterios argumentativos.",
      learningResults: [
        {
          id: `${programId}-ra-contexto-01`,
          code: "RA01",
          title: "Reconocer el contexto",
          description: "Identifica elementos relevantes del contexto disciplinar para orientar el análisis académico.",
        },
        {
          id: `${programId}-ra-evidencia-02`,
          code: "RA02",
          title: "Sustentar con evidencias",
          description: "Argumenta decisiones académicas con fuentes, datos y criterios propios del programa.",
        },
      ],
    },
    {
      id: `${programId}-comp-intervencion-etica`,
      code: "C2",
      title: isPsychology ? "Intervención psicológica y ética del cuidado" : "Gestión del conflicto y ética jurídica",
      description: isPsychology
        ? "Propone abordajes e intervenciones pertinentes con responsabilidad ética y social."
        : "Propone alternativas de gestión del conflicto con responsabilidad ética y jurídica.",
      learningResults: [
        {
          id: `${programId}-ra-proponer-03`,
          code: "RA03",
          title: "Proponer alternativas",
          description: "Formula alternativas coherentes con las necesidades del contexto y el alcance del curso.",
        },
        {
          id: `${programId}-ra-evaluar-04`,
          code: "RA04",
          title: "Evaluar resultados",
          description: "Valora resultados y oportunidades de mejora a partir de evidencias de aprendizaje.",
        },
      ],
    },
  ];
}

export const mockCourses: CourseRecord[] = courseIds.map((courseId) => {
  const course = secubAcademicCourses.find((item) => item.id === courseId)!;
  const program = secubAcademicPrograms.find((item) => item.id === course.programId)!;

  return {
    id: course.id,
    name: course.name,
    code: course.code,
    group: "Grupo A",
    credits: course.credits,
    period: "2026-1",
    program: getProgramName(course.programId),
    studyPlan: getPlanName(course.programId),
    measurementCycle: `Ciclo de medición ${program.name} 2026-1`,
    teacher: course.programId === "psicologia" ? "Docente Psicología" : "Docente Derecho",
    teacherId: course.programId === "psicologia" ? "usr-docente-psicologia" : "usr-docente-derecho",
    teacherEmail: course.programId === "psicologia" ? "docente.psicologia@usb.edu.co" : "docente.derecho@usb.edu.co",
    cycleId: `ciclo-${course.programId}-2026-1`,
    seccionalId: program.seccionalId,
    facultadId: program.facultyId,
    programaId: program.id,
    planId: program.planId,
    competences: buildCompetences(course.programId),
    students: baseStudents,
  };
});

function buildInitialMatrix(course: CourseRecord): EvaluationMatrix {
  const levels = ["sobresaliente", "satisfactorio", "en-desarrollo", "deficiente"] as const;
  const raIds = course.competences.flatMap((competence) => competence.learningResults.map((ra) => ra.id));

  return course.students.reduce<EvaluationMatrix>((matrix, student, studentIndex) => {
    matrix[student.id] = raIds.reduce<Record<string, EvaluationMatrix[string][string]>>((values, raId, raIndex) => {
      values[raId] = levels[(studentIndex + raIndex) % levels.length];
      return values;
    }, {});
    return matrix;
  }, {});
}

function buildInitialInstruments(course: CourseRecord): InstrumentByRa {
  return course.competences.reduce<InstrumentByRa>((state, competence) => {
    competence.learningResults.forEach((ra) => {
      state[ra.id] = {
        fileName: "",
        description: `Instrumento de valoración para ${ra.title.toLowerCase()} en ${course.name}.`,
      };
    });
    return state;
  }, {});
}

export const mockInitialEvaluations: Record<string, EvaluationMatrix> = mockCourses.reduce<Record<string, EvaluationMatrix>>(
  (records, course) => ({ ...records, [course.id]: buildInitialMatrix(course) }),
  {},
);

export const mockInitialInstruments: Record<string, InstrumentByRa> = mockCourses.reduce<Record<string, InstrumentByRa>>(
  (records, course) => ({ ...records, [course.id]: buildInitialInstruments(course) }),
  {},
);
