import {
  secubAcademicCourses,
  secubAcademicPrograms,
  secubFacultades,
  secubProgramas,
  secubSeccionales,
} from "../../../data/secubAcademicPrograms";
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
  director: "Jefatura de programa",
  docente: "Docencia",
};

export const dashboardUsers: Record<DashboardRole, DashboardUser> = {
  admin: { id: "user-admin", nombre: "Admin Empresa", cargo: dashboardRoleLabels.admin, role: "admin", scope: { seccionalId: "cali" } },
  vice: { id: "user-vice-cali", nombre: "Vicerrectoría Académica Cali", cargo: dashboardRoleLabels.vice, role: "vice", scope: { seccionalId: "cali" } },
  decano: { id: "user-decano-cali", nombre: "Decanatura Cali", cargo: dashboardRoleLabels.decano, role: "decano", scope: { seccionalId: "cali" } },
  director: { id: "user-director-programa", nombre: "Jefatura de programa", cargo: dashboardRoleLabels.director, role: "director", scope: { seccionalId: "cali", programaIds: ["psicologia", "derecho"] } },
  docente: { id: "usr-docente-psicologia", nombre: "Docente Psicología", cargo: dashboardRoleLabels.docente, role: "docente", scope: { seccionalId: "cali", programaIds: ["psicologia"], teacherId: "usr-docente-psicologia" } },
};

export const dashboardCatalogs: DashboardCatalogs = {
  seccionales: secubSeccionales,
  facultades: secubFacultades,
  programas: secubProgramas.map(({ estado: _estado, ...program }) => program),
  teachers: [
    { id: "usr-docente-psicologia", nombre: "Docente Psicología", email: "docente.psicologia@usb.edu.co" },
    { id: "usr-docente-derecho", nombre: "Docente Derecho", email: "docente.derecho@usb.edu.co" },
  ],
  competences: [
    { id: "comp-investigacion-contexto", code: "C1", name: "Investigación y análisis del contexto", description: "Analiza problemas del contexto disciplinar con evidencias pertinentes." },
    { id: "comp-intervencion-argumentacion", code: "C2", name: "Intervención y argumentación profesional", description: "Propone alternativas de intervención o gestión con criterios disciplinares." },
    { id: "comp-etica-responsabilidad", code: "C3", name: "Ética y responsabilidad social", description: "Integra criterios éticos y humanísticos en el desempeño profesional." },
  ],
  learningResults: [
    { id: "ra-investigacion-01", code: "RA 01", name: "Reconoce el contexto", description: "Identifica elementos del contexto académico, social o jurídico.", competenceId: "comp-investigacion-contexto" },
    { id: "ra-investigacion-02", code: "RA 02", name: "Sustenta con evidencias", description: "Argumenta decisiones con fuentes y criterios del programa.", competenceId: "comp-investigacion-contexto" },
    { id: "ra-intervencion-01", code: "RA 03", name: "Propone alternativas", description: "Formula alternativas coherentes con las necesidades del contexto.", competenceId: "comp-intervencion-argumentacion" },
    { id: "ra-etica-01", code: "RA 04", name: "Aplica criterios éticos", description: "Reconoce implicaciones éticas en escenarios académicos y profesionales.", competenceId: "comp-etica-responsabilidad" },
  ],
};

export const measurementCycles: MeasurementCycle[] = secubAcademicPrograms.map((program) => ({
  id: `ciclo-ra-${program.id}-2026-1`,
  name: `Ciclo RA ${program.name} 2026-1`,
  period: "2026-1",
  status: "pendiente",
  seccionalId: program.seccionalId,
  facultadId: program.facultyId,
  programaId: program.id,
  planName: `Plan ${program.planVersion}`,
  startDate: "2026-01-20",
  endDate: "2027-06-20",
}));

const selectedCourseIds = [
  "psicologia-sem8-practica-profesional-i",
  "psicologia-sem9-practica-profesional-ii",
  "derecho-sem7-procesal-civil-ii",
  "derecho-sem8-programa-complementario-de-formacion-avanzada",
];

export const courseMeasurements: CourseMeasurement[] = selectedCourseIds.map((courseId, index) => {
  const course = secubAcademicCourses.find((item) => item.id === courseId)!;
  const program = secubAcademicPrograms.find((item) => item.id === course.programId)!;
  const teacherId = program.id === "psicologia" ? "usr-docente-psicologia" : "usr-docente-derecho";
  const teacherName = program.id === "psicologia" ? "Docente Psicología" : "Docente Derecho";

  return {
    id: `course-ra-${course.id}`,
    code: course.code,
    name: course.name,
    cycleId: `ciclo-ra-${program.id}-2026-1`,
    seccionalId: program.seccionalId,
    facultadId: program.facultyId,
    programaId: program.id,
    teacherId,
    teacherName,
    competenceIds: ["comp-investigacion-contexto", "comp-etica-responsabilidad"],
    raIds: ["ra-investigacion-01", "ra-investigacion-02", "ra-etica-01"],
    totalRa: 3,
    evaluatedRa: index % 2 === 0 ? 2 : 1,
  };
});

export const raResultRecords: RaResultRecord[] = courseMeasurements.map((course, index) => ({
  id: `result-${course.id}`,
  courseId: course.id,
  competenceId: "comp-investigacion-contexto",
  raId: "ra-investigacion-01",
  totalStudents: course.programaId === "psicologia" ? 28 : 32,
  approvedStudents: course.programaId === "psicologia" ? 22 : 25,
  notApprovedStudents: course.programaId === "psicologia" ? 6 : 7,
  instrumentFile: `Instrumento_${index + 1}.pdf`,
  evidenceFile: `Evidencias_${index + 1}.zip`,
}));

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
  const selectedProgramId = window.localStorage.getItem("secub:selected-program-id:v1") ?? "";

  if (role === "director" && selectedProgramId) {
    return {
      ...user,
      scope: { ...user.scope, programaIds: [selectedProgramId] },
    };
  }

  return user;
}
