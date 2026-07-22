export type SecubProgramId = string;

export interface SecubAcademicCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  component: string;
  cycle?: "Fundamentación" | "Profesionalización" | "Síntesis";
  programId: SecubProgramId;
  planId: string;
}

export interface SecubAcademicSemester {
  id: string;
  number: number;
  label: string;
  totalCredits: number;
  courses: SecubAcademicCourse[];
}

export interface SecubAcademicProgram {
  id: SecubProgramId;
  name: string;
  directorRoleLabel: string;
  faculty: string;
  facultyId: string;
  seccional: string;
  seccionalId: string;
  lugarId: string;
  snies: string;
  planId: string;
  planVersion: string;
  durationSemesters: number;
  totalCredits: number;
  degreeTitle: string;
  cycles: string[];
  components: string[];
  semesters: SecubAcademicSemester[];
}

export interface SecubAcademicStudent {
  id: string;
  code: string;
  name: string;
  email: string;
  courseId: string;
}

export interface SecubSeccionalCatalog {
  id: string;
  nombre: string;
}

export interface SecubLugarCatalog {
  id: string;
  nombre: string;
  seccionalId: string;
}

export interface SecubFacultadCatalog {
  id: string;
  nombre: string;
  seccionalId: string;
}

export interface SecubProgramaCatalog {
  id: SecubProgramId;
  nombre: string;
  facultadId: string;
  seccionalId: string;
  estado: "activo" | "inactivo";
}

export interface SecubPlanCatalog {
  id: string;
  nombre: string;
  programaId: SecubProgramId;
  estado: "activo" | "inactivo";
  totalSemestres: number;
}

/**
 * Catálogo temporal único para la demostración local.
 *
 * Todos los módulos leen este mismo conjunto pequeño de datos. Cuando el backend
 * esté disponible, estas colecciones se reemplazan por sus respectivos repositorios
 * sin modificar las pantallas.
 */
export const SIMPLE_DEMO_IDS = {
  seccionalId: "sec-cali",
  lugarId: "lugar-cali",
  facultadId: "fac-ingenierias",
  programaId: "ingenieria-multimedia",
  planId: "plan-im-2026",
  semester1CourseId: "curso-fundamentos-programacion",
  semester2CourseId: "curso-programacion-orientada-objetos",
  courseId: "curso-diseno-medios-digitales",
} as const;

const semester1Course: SecubAcademicCourse = {
  id: SIMPLE_DEMO_IDS.semester1CourseId,
  code: "IM-101",
  name: "Fundamentos de Programación",
  credits: 3,
  semester: 1,
  component: "Ciencias Básicas de Ingeniería",
  cycle: "Fundamentación",
  programId: SIMPLE_DEMO_IDS.programaId,
  planId: SIMPLE_DEMO_IDS.planId,
};

const semester2Course: SecubAcademicCourse = {
  id: SIMPLE_DEMO_IDS.semester2CourseId,
  code: "IM-201",
  name: "Programación Orientada a Objetos",
  credits: 3,
  semester: 2,
  component: "Ciencias Básicas de Ingeniería",
  cycle: "Profesionalización",
  programId: SIMPLE_DEMO_IDS.programaId,
  planId: SIMPLE_DEMO_IDS.planId,
};

const semester3Course: SecubAcademicCourse = {
  id: SIMPLE_DEMO_IDS.courseId,
  code: "IM-301",
  name: "Diseño de Medios Digitales",
  credits: 3,
  semester: 3,
  component: "Ingeniería Aplicada",
  cycle: "Síntesis",
  programId: SIMPLE_DEMO_IDS.programaId,
  planId: SIMPLE_DEMO_IDS.planId,
};

export const secubAcademicPrograms: SecubAcademicProgram[] = [
  {
    id: SIMPLE_DEMO_IDS.programaId,
    name: "Ingeniería Multimedia",
    directorRoleLabel: "Dirección de Ingeniería Multimedia",
    faculty: "Facultad de Ingenierías",
    facultyId: SIMPLE_DEMO_IDS.facultadId,
    seccional: "Cali",
    seccionalId: SIMPLE_DEMO_IDS.seccionalId,
    lugarId: SIMPLE_DEMO_IDS.lugarId,
    snies: "53414",
    planId: SIMPLE_DEMO_IDS.planId,
    planVersion: "Plan de estudios 2026",
    durationSemesters: 3,
    totalCredits: 9,
    degreeTitle: "Ingeniero(a) Multimedia",
    cycles: ["Fundamentación", "Profesionalización", "Síntesis"],
    components: ["Ciencias Básicas de Ingeniería", "Ingeniería Aplicada"],
    semesters: [
      {
        id: "semestre-1",
        number: 1,
        label: "Semestre 1",
        totalCredits: 3,
        courses: [semester1Course],
      },
      {
        id: "semestre-2",
        number: 2,
        label: "Semestre 2",
        totalCredits: 3,
        courses: [semester2Course],
      },
      {
        id: "semestre-3",
        number: 3,
        label: "Semestre 3",
        totalCredits: 3,
        courses: [semester3Course],
      },
    ],
  },
];

export const secubAcademicCourses: SecubAcademicCourse[] = [
  semester1Course,
  semester2Course,
  semester3Course,
];

export const secubAcademicStudents: SecubAcademicStudent[] = [
  {
    id: "estudiante-demo-001",
    code: "A001",
    name: "Ana Martínez",
    email: "ana.martinez@demo.edu.co",
    courseId: SIMPLE_DEMO_IDS.courseId,
  },
  {
    id: "estudiante-demo-002",
    code: "A002",
    name: "Carlos Gómez",
    email: "carlos.gomez@demo.edu.co",
    courseId: SIMPLE_DEMO_IDS.courseId,
  },
  {
    id: "estudiante-demo-003",
    code: "A003",
    name: "Laura Rodríguez",
    email: "laura.rodriguez@demo.edu.co",
    courseId: SIMPLE_DEMO_IDS.courseId,
  },
];

export const secubSeccionales: SecubSeccionalCatalog[] = [
  { id: SIMPLE_DEMO_IDS.seccionalId, nombre: "Seccional Cali" },
];

export const secubLugares: SecubLugarCatalog[] = [
  {
    id: SIMPLE_DEMO_IDS.lugarId,
    nombre: "Campus La Umbría",
    seccionalId: SIMPLE_DEMO_IDS.seccionalId,
  },
];

export const secubFacultades: SecubFacultadCatalog[] = [
  {
    id: SIMPLE_DEMO_IDS.facultadId,
    nombre: "Facultad de Ingenierías",
    seccionalId: SIMPLE_DEMO_IDS.seccionalId,
  },
];

export const secubProgramas: SecubProgramaCatalog[] = [
  {
    id: SIMPLE_DEMO_IDS.programaId,
    nombre: "Ingeniería Multimedia",
    facultadId: SIMPLE_DEMO_IDS.facultadId,
    seccionalId: SIMPLE_DEMO_IDS.seccionalId,
    estado: "activo",
  },
];

export const secubPlanes: SecubPlanCatalog[] = [
  {
    id: SIMPLE_DEMO_IDS.planId,
    nombre: "Plan de estudios 2026",
    programaId: SIMPLE_DEMO_IDS.programaId,
    estado: "activo",
    totalSemestres: 3,
  },
];

export function getProgramById(programId?: string | null) {
  return secubAcademicPrograms.find((program) => program.id === programId);
}

export function getProgramByPlanId(planId?: string | null) {
  return secubAcademicPrograms.find((program) => program.planId === planId);
}

export function getCoursesByProgram(programId?: string | null) {
  if (!programId) return [];
  return secubAcademicCourses.filter((course) => course.programId === programId);
}

export function getCoursesByProgramPlan(programId?: string | null, planId?: string | null) {
  if (!programId || !planId) return [];
  return secubAcademicCourses.filter(
    (course) => course.programId === programId && course.planId === planId,
  );
}

export function getStudentsByCourse(courseId?: string | null) {
  if (!courseId) return [];
  return secubAcademicStudents.filter((student) => student.courseId === courseId);
}

export function getSemestersByProgram(programId?: string | null) {
  return getProgramById(programId)?.semesters ?? [];
}

export function getComponentsByProgram(programId?: string | null) {
  return getProgramById(programId)?.components ?? [];
}

export function getProgramScope(programId?: string | null) {
  const program = getProgramById(programId);
  if (!program) return {};

  return {
    seccionalId: program.seccionalId,
    facultadId: program.facultyId,
    programaId: program.id,
    academicProgramId: program.id,
    planId: program.planId,
  };
}
