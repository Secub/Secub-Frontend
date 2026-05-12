import type {
  CourseMeasurement,
  DashboardCatalogs,
  DashboardData,
  DashboardRole,
  DashboardUser,
  MeasurementCycle,
} from "./dashboard.types";

export const TARGET_COMPLIANCE = 70;

export const dashboardCatalogs: DashboardCatalogs = {
  seccionales: [
    { id: "cali", name: "Seccional Cali" },
    { id: "bogota", name: "Sede Bogotá" },
    { id: "medellin", name: "Seccional Medellín" },
    { id: "cartagena", name: "Seccional Cartagena" },
  ],
  facultades: [
    { id: "ing-cali", name: "Facultad de Ingeniería", seccionalId: "cali" },
    { id: "artes-cali", name: "Facultad de Artes y Diseño", seccionalId: "cali" },
    { id: "ing-bog", name: "Facultad de Ingeniería", seccionalId: "bogota" },
    { id: "salud-bog", name: "Facultad de Salud", seccionalId: "bogota" },
    { id: "ing-med", name: "Facultad de Ingeniería", seccionalId: "medellin" },
  ],
  programas: [
    { id: "sis-cali", name: "Ingeniería de Sistemas", facultadId: "ing-cali", seccionalId: "cali" },
    { id: "ind-cali", name: "Ingeniería Industrial", facultadId: "ing-cali", seccionalId: "cali" },
    { id: "sis-bog", name: "Ingeniería de Sistemas", facultadId: "ing-bog", seccionalId: "bogota" },
    { id: "multimedia-bog", name: "Ingeniería Multimedia", facultadId: "ing-bog", seccionalId: "bogota" },
    { id: "agro-med", name: "Ingeniería Agroindustrial", facultadId: "ing-med", seccionalId: "medellin" },
  ],
  planes: [
    { id: "sis-cali-2024-2", name: "Plan 2024-2", programaId: "sis-cali" },
    { id: "sis-cali-2024-1", name: "Plan 2024-1", programaId: "sis-cali" },
    { id: "ind-cali-2024-2", name: "Plan 2024-2", programaId: "ind-cali" },
    { id: "sis-bog-2024-2", name: "Plan 2024-2", programaId: "sis-bog" },
    { id: "multimedia-bog-2024-2", name: "Plan 2024-2", programaId: "multimedia-bog" },
    { id: "agro-med-2024-2", name: "Plan 2024-2", programaId: "agro-med" },
  ],
  teachers: [
    { id: "doc-santiago", name: "Santiago Torres", email: "santiago.torres@usb.edu.co" },
    { id: "doc-antonio", name: "Antonio Rodríguez", email: "antonio.rodriguez@usb.edu.co" },
    { id: "doc-camilo", name: "Camilo Castro", email: "camilo.castro@usb.edu.co" },
    { id: "doc-marcela", name: "Marcela Ruiz", email: "marcela.ruiz@usb.edu.co" },
    { id: "doc-paula", name: "Paula Ríos", email: "paula.rios@usb.edu.co" },
    { id: "doc-diana", name: "Diana Cardona", email: "diana.cardona@usb.edu.co" },
  ],
  competences: [
    {
      id: "comp-analisis",
      code: "C1",
      name: "Análisis y diseño de soluciones",
      description:
        "Analiza problemas del contexto, formula alternativas de solución y sustenta decisiones de diseño con criterios técnicos y académicos.",
      learningResults: [
        {
          id: "ra-01",
          code: "RA 01",
          name: "Comprende el problema",
          description:
            "El curso introduce la competencia al estudiante. Se presentan los conceptos fundamentales y se inicia la familiarización con los componentes del análisis.",
        },
        {
          id: "ra-02",
          code: "RA 02",
          name: "Propone alternativas de solución",
          description:
            "El estudiante propone alternativas pertinentes y argumenta la selección de una solución de acuerdo con las necesidades del contexto.",
        },
      ],
    },
    {
      id: "comp-construccion",
      code: "C2",
      name: "Construcción y validación",
      description:
        "Construye productos, valida resultados y documenta evidencias trazables para el seguimiento académico del programa.",
      learningResults: [
        {
          id: "ra-03",
          code: "RA 03",
          name: "Implementa la solución",
          description:
            "El estudiante desarrolla la solución definida aplicando criterios de calidad, integración y documentación técnica.",
        },
        {
          id: "ra-04",
          code: "RA 04",
          name: "Evalúa resultados",
          description:
            "El estudiante analiza resultados, evidencias y oportunidades de mejora para fortalecer el desempeño del curso.",
        },
      ],
    },
    {
      id: "comp-investigacion",
      code: "C3",
      name: "Investigación aplicada",
      description:
        "Integra métodos de investigación, evidencias y comunicación académica para resolver situaciones propias del campo profesional.",
      learningResults: [
        {
          id: "ra-05",
          code: "RA 05",
          name: "Formula ruta investigativa",
          description:
            "El estudiante delimita preguntas, objetivos y fuentes de información con coherencia metodológica.",
        },
        {
          id: "ra-06",
          code: "RA 06",
          name: "Comunica hallazgos",
          description:
            "El estudiante comunica hallazgos de forma clara, sustentada y coherente con los criterios del programa.",
        },
      ],
    },
  ],
};

export const measurementCycles: MeasurementCycle[] = [
  {
    id: "ciclo-2026-1",
    name: "Ciclo 2026 1",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    period: "2026-1",
    startDate: "2026-01-15",
    endDate: "2027-07-15",
    courseIds: ["curso-intro-programacion", "curso-bases-datos", "curso-optimizacion-industrial"],
  },
  {
    id: "ciclo-2024-2",
    name: "Ciclo 2024 2",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    period: "2024-2",
    startDate: "2024-07-15",
    endDate: "2026-01-15",
    courseIds: ["curso-proyecto-integrador", "curso-practica-profesional"],
  },
  {
    id: "ciclo-bog-2024-2",
    name: "Ciclo Bogotá 2024 2",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "sis-bog",
    planId: "sis-bog-2024-2",
    period: "2024-2",
    startDate: "2024-07-15",
    endDate: "2026-01-15",
    courseIds: ["curso-bog-proyecto-software", "curso-bog-trabajo-grado"],
  },
  {
    id: "ciclo-med-2024-2",
    name: "Ciclo Medellín 2024 2",
    seccionalId: "medellin",
    facultadId: "ing-med",
    programaId: "agro-med",
    planId: "agro-med-2024-2",
    period: "2024-2",
    startDate: "2024-07-15",
    endDate: "2026-01-15",
    courseIds: ["curso-agro-proyecto"],
  },
];

export const courseMeasurements: CourseMeasurement[] = [
  {
    id: "curso-intro-programacion",
    code: "SIS-701",
    name: "Introducción a la programación",
    cycleId: "ciclo-2026-1",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    teacherId: "doc-santiago",
    competenceIds: ["comp-analisis", "comp-construccion"],
    totalRa: 9,
    evaluatedRa: 1,
    results: [
      { raId: "ra-01", totalStudents: 30, approvedStudents: 4, notApprovedStudents: 26, instrumentFile: "instrumento-ra01.docx", evidenceFile: "evidencia-ra01.zip", improvementPlanFile: "plan-mejora-ra01.pdf", improvementPlanSummary: "Reforzar conceptos base y proponer ejercicios guiados antes de la siguiente medición." },
    ],
  },
  {
    id: "curso-bases-datos",
    code: "SIS-702",
    name: "Bases de Datos",
    cycleId: "ciclo-2026-1",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    teacherId: "doc-santiago",
    competenceIds: ["comp-analisis", "comp-investigacion"],
    totalRa: 4,
    evaluatedRa: 2,
    results: [
      { raId: "ra-01", totalStudents: 28, approvedStudents: 20, notApprovedStudents: 8, instrumentFile: "rubrica-bases-ra01.docx", evidenceFile: "evidencias-bases-ra01.zip" },
      { raId: "ra-05", totalStudents: 28, approvedStudents: 17, notApprovedStudents: 11, instrumentFile: "instrumento-bases-ra05.docx", evidenceFile: "evidencias-bases-ra05.zip", improvementPlanFile: "plan-mejora-bases-ra05.pdf", improvementPlanSummary: "Fortalecer la formulación de preguntas y el análisis de fuentes académicas." },
    ],
  },
  {
    id: "curso-optimizacion-industrial",
    code: "IND-701",
    name: "Resolución de Problemas Computacionales",
    cycleId: "ciclo-2026-1",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "ind-cali",
    planId: "ind-cali-2024-2",
    teacherId: "doc-marcela",
    competenceIds: ["comp-analisis", "comp-construccion"],
    totalRa: 4,
    evaluatedRa: 1,
    results: [
      { raId: "ra-02", totalStudents: 24, approvedStudents: 12, notApprovedStudents: 12, instrumentFile: "instrumento-ind-ra02.docx", evidenceFile: "evidencia-ind-ra02.zip", improvementPlanFile: "plan-mejora-ind-ra02.pdf", improvementPlanSummary: "Ajustar acompañamiento y retroalimentación en la fase de diseño de alternativas." },
    ],
  },
  {
    id: "curso-proyecto-integrador",
    code: "SIS-801",
    name: "Proyecto Integrador I",
    cycleId: "ciclo-2024-2",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    teacherId: "doc-santiago",
    competenceIds: ["comp-analisis", "comp-construccion"],
    totalRa: 4,
    evaluatedRa: 4,
    results: [
      { raId: "ra-01", totalStudents: 20, approvedStudents: 16, notApprovedStudents: 4, instrumentFile: "instrumento-proyecto-ra01.docx", evidenceFile: "evidencia-proyecto-ra01.zip" },
      { raId: "ra-02", totalStudents: 20, approvedStudents: 12, notApprovedStudents: 8, instrumentFile: "instrumento-proyecto-ra02.docx", evidenceFile: "evidencia-proyecto-ra02.zip", improvementPlanFile: "plan-mejora-proyecto-ra02.pdf", improvementPlanSummary: "Acompañar la argumentación de alternativas con sesiones de retroalimentación por equipos." },
      { raId: "ra-03", totalStudents: 20, approvedStudents: 5, notApprovedStudents: 15, instrumentFile: "instrumento-proyecto-ra03.docx", evidenceFile: "evidencia-proyecto-ra03.zip", improvementPlanFile: "plan-mejora-proyecto-ra03.pdf", improvementPlanSummary: "Reforzar criterios de implementación y validación de entregables parciales." },
      { raId: "ra-04", totalStudents: 20, approvedStudents: 10, notApprovedStudents: 10, instrumentFile: "instrumento-proyecto-ra04.docx", evidenceFile: "evidencia-proyecto-ra04.zip", improvementPlanFile: "plan-mejora-proyecto-ra04.pdf", improvementPlanSummary: "Definir talleres de análisis de resultados y cierre de evidencias." },
    ],
  },
  {
    id: "curso-practica-profesional",
    code: "SIS-802",
    name: "Práctica Profesional",
    cycleId: "ciclo-2024-2",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    teacherId: "doc-antonio",
    competenceIds: ["comp-analisis", "comp-investigacion"],
    totalRa: 4,
    evaluatedRa: 4,
    results: [
      { raId: "ra-01", totalStudents: 22, approvedStudents: 18, notApprovedStudents: 4, instrumentFile: "instrumento-practica-ra01.docx", evidenceFile: "evidencia-practica-ra01.zip" },
      { raId: "ra-02", totalStudents: 22, approvedStudents: 19, notApprovedStudents: 3, instrumentFile: "instrumento-practica-ra02.docx", evidenceFile: "evidencia-practica-ra02.zip" },
      { raId: "ra-05", totalStudents: 22, approvedStudents: 14, notApprovedStudents: 8, instrumentFile: "instrumento-practica-ra05.docx", evidenceFile: "evidencia-practica-ra05.zip", improvementPlanFile: "plan-mejora-practica-ra05.pdf", improvementPlanSummary: "Mejorar la formulación de objetivos y la trazabilidad de fuentes." },
      { raId: "ra-06", totalStudents: 22, approvedStudents: 20, notApprovedStudents: 2, instrumentFile: "instrumento-practica-ra06.docx", evidenceFile: "evidencia-practica-ra06.zip" },
    ],
  },
  {
    id: "curso-bog-proyecto-software",
    code: "SIS-701",
    name: "Proyecto Integrador de Software",
    cycleId: "ciclo-bog-2024-2",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "sis-bog",
    planId: "sis-bog-2024-2",
    teacherId: "doc-antonio",
    competenceIds: ["comp-analisis", "comp-construccion"],
    totalRa: 4,
    evaluatedRa: 4,
    results: [
      { raId: "ra-01", totalStudents: 26, approvedStudents: 21, notApprovedStudents: 5, instrumentFile: "bog-ra01.docx", evidenceFile: "bog-ra01.zip" },
      { raId: "ra-02", totalStudents: 26, approvedStudents: 20, notApprovedStudents: 6, instrumentFile: "bog-ra02.docx", evidenceFile: "bog-ra02.zip" },
      { raId: "ra-03", totalStudents: 26, approvedStudents: 19, notApprovedStudents: 7, instrumentFile: "bog-ra03.docx", evidenceFile: "bog-ra03.zip" },
      { raId: "ra-04", totalStudents: 26, approvedStudents: 22, notApprovedStudents: 4, instrumentFile: "bog-ra04.docx", evidenceFile: "bog-ra04.zip" },
    ],
  },
  {
    id: "curso-bog-trabajo-grado",
    code: "SIS-703",
    name: "Trabajo de Grado",
    cycleId: "ciclo-bog-2024-2",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "sis-bog",
    planId: "sis-bog-2024-2",
    teacherId: "doc-paula",
    competenceIds: ["comp-investigacion"],
    totalRa: 2,
    evaluatedRa: 2,
    results: [
      { raId: "ra-05", totalStudents: 18, approvedStudents: 13, notApprovedStudents: 5, instrumentFile: "trabajo-grado-ra05.docx", evidenceFile: "trabajo-grado-ra05.zip" },
      { raId: "ra-06", totalStudents: 18, approvedStudents: 16, notApprovedStudents: 2, instrumentFile: "trabajo-grado-ra06.docx", evidenceFile: "trabajo-grado-ra06.zip" },
    ],
  },
  {
    id: "curso-agro-proyecto",
    code: "AGR-701",
    name: "Proyecto Agroindustrial Aplicado",
    cycleId: "ciclo-med-2024-2",
    seccionalId: "medellin",
    facultadId: "ing-med",
    programaId: "agro-med",
    planId: "agro-med-2024-2",
    teacherId: "doc-diana",
    competenceIds: ["comp-analisis"],
    totalRa: 2,
    evaluatedRa: 2,
    results: [
      { raId: "ra-01", totalStudents: 21, approvedStudents: 18, notApprovedStudents: 3, instrumentFile: "agro-ra01.docx", evidenceFile: "agro-ra01.zip" },
      { raId: "ra-02", totalStudents: 21, approvedStudents: 17, notApprovedStudents: 4, instrumentFile: "agro-ra02.docx", evidenceFile: "agro-ra02.zip" },
    ],
  },
];

const roleLabels: Record<DashboardRole, string> = {
  admin: "Admin / Empresa",
  vice: "Vicerrectoría de seccional",
  decano: "Decano",
  director: "Director de programa",
  docente: "Docente",
};

const mockUsers: Record<DashboardRole, DashboardUser> = {
  admin: {
    id: "usr-admin",
    name: "Juliana Mejía",
    role: "admin",
    label: roleLabels.admin,
    scope: {},
  },
  vice: {
    id: "usr-vice",
    name: "Ana María Restrepo",
    role: "vice",
    label: roleLabels.vice,
    scope: { seccionalId: "bogota" },
  },
  decano: {
    id: "usr-decano",
    name: "Carlos Medina",
    role: "decano",
    label: roleLabels.decano,
    scope: { seccionalId: "bogota", facultadId: "ing-bog" },
  },
  director: {
    id: "usr-director",
    name: "Laura Gómez",
    role: "director",
    label: roleLabels.director,
    scope: { seccionalId: "cali", facultadId: "ing-cali", programaIds: ["sis-cali", "ind-cali"] },
  },
  docente: {
    id: "usr-docente",
    name: "Santiago Torres",
    role: "docente",
    label: roleLabels.docente,
    scope: { seccionalId: "cali", facultadId: "ing-cali", programaIds: ["sis-cali"], docenteId: "doc-santiago" },
  },
};

export const DEFAULT_DASHBOARD_ROLE: DashboardRole = "docente";

export function normalizeDashboardRole(rawRole: string | null | undefined): DashboardRole {
  const normalized = String(rawRole ?? "").trim().toLowerCase();

  const aliases: Record<string, DashboardRole> = {
    admin: "admin",
    administrador: "admin",
    superadmin: "admin",
    empresa: "admin",
    vice: "vice",
    vicerrector: "vice",
    vicerrectoria: "vice",
    vicerrectoría: "vice",
    decano: "decano",
    director: "director",
    directorprograma: "director",
    director_de_programa: "director",
    docente: "docente",
  };

  return aliases[normalized] ?? DEFAULT_DASHBOARD_ROLE;
}

export function getCurrentDashboardUser(): DashboardUser {
  const params = new URLSearchParams(window.location.search);
  const role = normalizeDashboardRole(params.get("role"));
  return mockUsers[role];
}

export function getDashboardData(): DashboardData {
  const params = new URLSearchParams(window.location.search);
  const scenario = params.get("scenario");

  if (scenario === "sin-ciclos") {
    return {
      catalogs: dashboardCatalogs,
      cycles: [],
      courses: [],
    };
  }

  if (scenario === "sin-cursos") {
    return {
      catalogs: dashboardCatalogs,
      cycles: measurementCycles,
      courses: courseMeasurements.filter((course) => course.teacherId !== "doc-santiago"),
    };
  }

  return {
    catalogs: dashboardCatalogs,
    cycles: measurementCycles,
    courses: courseMeasurements,
  };
}
