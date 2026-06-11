import type {
  CourseMeasurement,
  DashboardCatalogs,
  DashboardRole,
  DashboardUser,
  MeasurementCycle,
  RaResultRecord,
} from "./dashboard-ra.types";

export const TARGET_RA_PERCENTAGE = 70;
export const DEFAULT_DASHBOARD_ROLE: DashboardRole = "admin";

export const dashboardRoleLabels: Record<DashboardRole, string> = {
  admin: "Admin / Empresa",
  vice: "Vice / Seccional",
  decano: "Decanatura",
  director: "Dirección de programa",
  docente: "Docencia",
};

export const dashboardUsers: Record<DashboardRole, DashboardUser> = {
  admin: {
    id: "user-admin",
    nombre: "Admin Empresa",
    cargo: dashboardRoleLabels.admin,
    role: "admin",
    scope: {},
  },
  vice: {
    id: "user-vice-cali",
    nombre: "Vicerrectoría Académica Cali",
    cargo: dashboardRoleLabels.vice,
    role: "vice",
    scope: { seccionalId: "cali" },
  },
  decano: {
    id: "user-decano-ing",
    nombre: "Decanatura de Ingeniería",
    cargo: dashboardRoleLabels.decano,
    role: "decano",
    scope: { seccionalId: "cali", facultadId: "ing-cali" },
  },
  director: {
    id: "user-director-sistemas",
    nombre: "Dirección de Programa",
    cargo: dashboardRoleLabels.director,
    role: "director",
    scope: {
      seccionalId: "cali",
      facultadId: "ing-cali",
      programaIds: ["sis-cali", "ind-cali", "sin-ciclo-cali"],
    },
  },
  docente: {
    id: "doc-antonio",
    nombre: "Antonio Rodríguez",
    cargo: dashboardRoleLabels.docente,
    role: "docente",
    scope: {
      seccionalId: "cali",
      facultadId: "ing-cali",
      programaIds: ["sis-cali"],
      teacherId: "doc-antonio",
    },
  },
};

export const dashboardCatalogs: DashboardCatalogs = {
  seccionales: [
    { id: "cali", nombre: "Seccional Cali" },
    { id: "bogota", nombre: "Sede Bogotá" },
    { id: "medellin", nombre: "Seccional Medellín" },
    { id: "cartagena", nombre: "Seccional Cartagena" },
  ],
  facultades: [
    { id: "ing-cali", nombre: "Facultad de Ingeniería", seccionalId: "cali" },
    { id: "artes-cali", nombre: "Facultad de Artes y Diseño", seccionalId: "cali" },
    { id: "ing-bog", nombre: "Facultad de Ingeniería", seccionalId: "bogota" },
    { id: "ing-med", nombre: "Facultad de Ingeniería", seccionalId: "medellin" },
  ],
  programas: [
    {
      id: "sis-cali",
      nombre: "Ingeniería de Sistemas",
      facultadId: "ing-cali",
      seccionalId: "cali",
    },
    {
      id: "ind-cali",
      nombre: "Ingeniería Industrial",
      facultadId: "ing-cali",
      seccionalId: "cali",
    },
    {
      id: "sin-ciclo-cali",
      nombre: "Programa sin ciclo creado",
      facultadId: "ing-cali",
      seccionalId: "cali",
    },
    {
      id: "sis-bog",
      nombre: "Ingeniería de Sistemas",
      facultadId: "ing-bog",
      seccionalId: "bogota",
    },
    {
      id: "agro-med",
      nombre: "Ingeniería Agroindustrial",
      facultadId: "ing-med",
      seccionalId: "medellin",
    },
  ],
  teachers: [
    {
      id: "doc-antonio",
      nombre: "Antonio Rodríguez",
      email: "antonio.rodriguez@usb.edu.co",
    },
    {
      id: "doc-camilo",
      nombre: "Camilo Castro",
      email: "camilo.castro@usb.edu.co",
    },
    {
      id: "doc-carolina",
      nombre: "Carolina Herrera",
      email: "carolina.herrera@usb.edu.co",
    },
    {
      id: "doc-carmen",
      nombre: "Carmen Martínez",
      email: "carmen.martinez@usb.edu.co",
    },
    {
      id: "doc-marcela",
      nombre: "Marcela Ruiz",
      email: "marcela.ruiz@usb.edu.co",
    },
  ],
  competences: [
    {
      id: "comp-analisis-diseno",
      code: "C1",
      name: "Análisis y diseño de soluciones",
      description:
        "Formula soluciones de software a partir de necesidades del contexto, modelos de análisis y criterios de calidad.",
    },
    {
      id: "comp-desarrollo-validacion",
      code: "C2",
      name: "Desarrollo y validación de software",
      description:
        "Construye, prueba y valida componentes de software con buenas prácticas técnicas y documentación suficiente.",
    },
    {
      id: "comp-investigacion-mejora",
      code: "C3",
      name: "Investigación y mejora continua",
      description:
        "Analiza resultados de medición, comunica hallazgos y plantea acciones de mejora para próximos periodos.",
    },
  ],
  learningResults: [
    {
      id: "ra-c1-01",
      code: "RA 01",
      name: "Analiza requerimientos del contexto",
      description:
        "El curso introduce la competencia al estudiante. Se presentan conceptos fundamentales y se inicia la familiarización con los componentes técnicos del problema.",
      competenceId: "comp-analisis-diseno",
    },
    {
      id: "ra-c1-02",
      code: "RA 02",
      name: "Diseña soluciones pertinentes",
      description:
        "El estudiante propone soluciones coherentes con las necesidades identificadas, criterios institucionales y restricciones del proyecto.",
      competenceId: "comp-analisis-diseno",
    },
    {
      id: "ra-c1-03",
      code: "RA 03",
      name: "Modela procesos y arquitectura",
      description:
        "Representa procesos, componentes y decisiones de diseño mediante modelos claros y trazables.",
      competenceId: "comp-analisis-diseno",
    },
    {
      id: "ra-c1-04",
      code: "RA 04",
      name: "Argumenta decisiones de diseño",
      description:
        "Sustenta las decisiones tomadas con evidencia, criterios técnicos y lectura del contexto.",
      competenceId: "comp-analisis-diseno",
    },
    {
      id: "ra-c2-01",
      code: "RA 01",
      name: "Implementa funcionalidades",
      description:
        "Construye funcionalidades estables y coherentes con el diseño aprobado.",
      competenceId: "comp-desarrollo-validacion",
    },
    {
      id: "ra-c2-02",
      code: "RA 02",
      name: "Valida resultados de software",
      description:
        "Ejecuta validaciones funcionales y registra evidencias de cumplimiento.",
      competenceId: "comp-desarrollo-validacion",
    },
    {
      id: "ra-c3-01",
      code: "RA 01",
      name: "Analiza resultados de medición",
      description:
        "Interpreta resultados académicos y define hallazgos para el mejoramiento curricular.",
      competenceId: "comp-investigacion-mejora",
    },
  ],
};

export const measurementCycles: MeasurementCycle[] = [
  {
    id: "ciclo-2026-1-sis",
    name: "Ciclo: 2026 1",
    period: "2026-1",
    status: "pendiente",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planName: "Plan 2024-2",
    startDate: "2026-01-20",
    endDate: "2027-06-20",
  },
  {
    id: "ciclo-2024-2-sis",
    name: "Ciclo: 2024 2",
    period: "2024-2",
    status: "finalizado",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planName: "Plan 2021",
    startDate: "2024-08-01",
    endDate: "2026-01-31",
  },
  {
    id: "ciclo-2026-1-ind",
    name: "Ciclo: 2026 1",
    period: "2026-1",
    status: "pendiente",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "ind-cali",
    planName: "Plan 2024-2",
    startDate: "2026-01-20",
    endDate: "2027-06-20",
  },
  {
    id: "ciclo-2024-2-bog",
    name: "Ciclo: 2024 2",
    period: "2024-2",
    status: "finalizado",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "sis-bog",
    planName: "Plan 2024-2",
    startDate: "2024-08-01",
    endDate: "2026-01-31",
  },
];

export const courseMeasurements: CourseMeasurement[] = [
  {
    id: "course-proyecto-integrador-i-2026",
    code: "SIS-701",
    name: "Proyecto Integrador I",
    cycleId: "ciclo-2026-1-sis",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    teacherId: "doc-antonio",
    teacherName: "Antonio Rodríguez",
    competenceIds: ["comp-analisis-diseno", "comp-desarrollo-validacion"],
    raIds: ["ra-c1-01", "ra-c1-02", "ra-c2-01", "ra-c2-02"],
    totalRa: 4,
    evaluatedRa: 1,
  },
  {
    id: "course-intro-programacion-2026",
    code: "SIS-101",
    name: "Introducción a la programación",
    cycleId: "ciclo-2026-1-sis",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    teacherId: "doc-antonio",
    teacherName: "Antonio Rodríguez",
    competenceIds: ["comp-analisis-diseno", "comp-investigacion-mejora"],
    raIds: ["ra-c1-01", "ra-c1-02", "ra-c1-03", "ra-c1-04", "ra-c3-01", "ra-c2-01", "ra-c2-02", "ra-c1-01", "ra-c1-02"],
    totalRa: 9,
    evaluatedRa: 1,
  },
  {
    id: "course-bases-datos-2026",
    code: "SIS-302",
    name: "Bases de Datos",
    cycleId: "ciclo-2026-1-sis",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    teacherId: "doc-antonio",
    teacherName: "Antonio Rodríguez",
    competenceIds: ["comp-analisis-diseno", "comp-desarrollo-validacion"],
    raIds: ["ra-c1-01", "ra-c1-02", "ra-c2-01", "ra-c2-02"],
    totalRa: 4,
    evaluatedRa: 2,
  },
  {
    id: "course-proyecto-integrador-ii-2024",
    code: "SIS-801",
    name: "Proyecto Integrador II",
    cycleId: "ciclo-2024-2-sis",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    teacherId: "doc-antonio",
    teacherName: "Antonio Rodríguez",
    competenceIds: ["comp-analisis-diseno", "comp-desarrollo-validacion"],
    raIds: ["ra-c1-01", "ra-c1-02", "ra-c1-03", "ra-c1-04"],
    totalRa: 4,
    evaluatedRa: 4,
  },
  {
    id: "course-arquitectura-software-2024",
    code: "SIS-802",
    name: "Arquitectura de Software",
    cycleId: "ciclo-2024-2-sis",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    teacherId: "doc-camilo",
    teacherName: "Camilo Castro",
    competenceIds: ["comp-desarrollo-validacion"],
    raIds: ["ra-c2-01", "ra-c2-02"],
    totalRa: 2,
    evaluatedRa: 2,
  },
  {
    id: "course-optimizacion-industrial-2026",
    code: "IND-701",
    name: "Proyecto de Optimización Industrial",
    cycleId: "ciclo-2026-1-ind",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "ind-cali",
    teacherId: "doc-marcela",
    teacherName: "Marcela Ruiz",
    competenceIds: ["comp-analisis-diseno"],
    raIds: ["ra-c1-01", "ra-c1-02", "ra-c1-03"],
    totalRa: 3,
    evaluatedRa: 1,
  },
  {
    id: "course-software-bogota-2024",
    code: "SIS-701",
    name: "Proyecto Integrador de Software",
    cycleId: "ciclo-2024-2-bog",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "sis-bog",
    teacherId: "doc-carolina",
    teacherName: "Carolina Herrera",
    competenceIds: ["comp-analisis-diseno", "comp-desarrollo-validacion"],
    raIds: ["ra-c1-01", "ra-c1-02", "ra-c2-01"],
    totalRa: 3,
    evaluatedRa: 3,
  },
];

export const raResultRecords: RaResultRecord[] = [
  {
    id: "result-proyecto-ii-ra-01",
    courseId: "course-proyecto-integrador-ii-2024",
    competenceId: "comp-analisis-diseno",
    raId: "ra-c1-01",
    totalStudents: 20,
    approvedStudents: 16,
    notApprovedStudents: 4,
    instrumentFile: "Instrumento_RA01_ProyectoII.pdf",
    evidenceFile: "Evidencias_RA01_ProyectoII.zip",
  },
  {
    id: "result-proyecto-ii-ra-02",
    courseId: "course-proyecto-integrador-ii-2024",
    competenceId: "comp-analisis-diseno",
    raId: "ra-c1-02",
    totalStudents: 20,
    approvedStudents: 12,
    notApprovedStudents: 8,
    instrumentFile: "Instrumento_RA02_ProyectoII.pdf",
    evidenceFile: "Evidencias_RA02_ProyectoII.zip",
    improvementPlanFile: "Plan_mejora_RA02.pdf",
  },
  {
    id: "result-proyecto-ii-ra-03",
    courseId: "course-proyecto-integrador-ii-2024",
    competenceId: "comp-analisis-diseno",
    raId: "ra-c1-03",
    totalStudents: 20,
    approvedStudents: 5,
    notApprovedStudents: 15,
    instrumentFile: "Instrumento_RA03_ProyectoII.pdf",
    evidenceFile: "Evidencias_RA03_ProyectoII.zip",
    improvementPlanFile: "Plan_mejora_RA03.pdf",
  },
  {
    id: "result-proyecto-ii-ra-04",
    courseId: "course-proyecto-integrador-ii-2024",
    competenceId: "comp-analisis-diseno",
    raId: "ra-c1-04",
    totalStudents: 20,
    approvedStudents: 10,
    notApprovedStudents: 10,
    instrumentFile: "Instrumento_RA04_ProyectoII.pdf",
    evidenceFile: "Evidencias_RA04_ProyectoII.zip",
    improvementPlanFile: "Plan_mejora_RA04.pdf",
  },
  {
    id: "result-arquitectura-ra-01",
    courseId: "course-arquitectura-software-2024",
    competenceId: "comp-desarrollo-validacion",
    raId: "ra-c2-01",
    totalStudents: 18,
    approvedStudents: 15,
    notApprovedStudents: 3,
    instrumentFile: "Instrumento_RA01_Arquitectura.pdf",
    evidenceFile: "Evidencias_RA01_Arquitectura.zip",
  },
  {
    id: "result-arquitectura-ra-02",
    courseId: "course-arquitectura-software-2024",
    competenceId: "comp-desarrollo-validacion",
    raId: "ra-c2-02",
    totalStudents: 18,
    approvedStudents: 13,
    notApprovedStudents: 5,
    instrumentFile: "Instrumento_RA02_Arquitectura.pdf",
    evidenceFile: "Evidencias_RA02_Arquitectura.zip",
  },
  {
    id: "result-bogota-ra-01",
    courseId: "course-software-bogota-2024",
    competenceId: "comp-analisis-diseno",
    raId: "ra-c1-01",
    totalStudents: 22,
    approvedStudents: 18,
    notApprovedStudents: 4,
    instrumentFile: "Instrumento_Bog_RA01.pdf",
    evidenceFile: "Evidencias_Bog_RA01.zip",
  },
];

export function normalizeDashboardRole(rawRole: string | null | undefined): DashboardRole {
  const normalized = String(rawRole ?? "").trim().toLowerCase();

  const aliases: Record<string, DashboardRole> = {
    admin: "admin",
    administrador: "admin",
    empresa: "admin",
    superadmin: "admin",
    vice: "vice",
    vicerrector: "vice",
    vicerrectoria: "vice",
    vicerrectoría: "vice",
    decano: "decano",
    director: "director",
    directorprograma: "director",
    director_de_programa: "director",
    docente: "docente",
    teacher: "docente",
  };

  return aliases[normalized] ?? DEFAULT_DASHBOARD_ROLE;
}

export function getCurrentDashboardUser(): DashboardUser {
  const params = new URLSearchParams(window.location.search);
  const role = normalizeDashboardRole(params.get("role"));
  const user = dashboardUsers[role];
  const scenario = params.get("scenario");

  if (role === "docente" && scenario === "sin-cursos") {
    return {
      ...user,
      id: "doc-sin-cursos",
      nombre: "Docente sin cursos",
      scope: { ...user.scope, teacherId: "doc-sin-cursos" },
    };
  }

  return user;
}
