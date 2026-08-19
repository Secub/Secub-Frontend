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

type DemoCourseInput = Omit<SecubAcademicCourse, "programId" | "planId">;

function createDemoCourse(course: DemoCourseInput): SecubAcademicCourse {
  return {
    ...course,
    programId: SIMPLE_DEMO_IDS.programaId,
    planId: SIMPLE_DEMO_IDS.planId,
  };
}

// El pensum suministrado no publica códigos oficiales de asignatura.
// Los códigos que no existían previamente en el mock son identificadores internos
// únicamente para mantener unicidad y permitir las pruebas del frontend.
const semester1Courses: SecubAcademicCourse[] = [
  createDemoCourse({
    id: "curso-precalculo",
    code: "IM-100",
    name: "Precálculo",
    credits: 3,
    semester: 1,
    component: "Ciencias Básicas",
  }),
  createDemoCourse({
    id: "curso-matematicas-discretas",
    code: "IM-102",
    name: "Matemáticas Discretas",
    credits: 3,
    semester: 1,
    component: "Ciencias Básicas",
  }),
  createDemoCourse({
    id: SIMPLE_DEMO_IDS.semester1CourseId,
    code: "IM-101",
    name: "Fundamentos de Programación",
    credits: 3,
    semester: 1,
    component: "Ciencias Básicas de Ingeniería",
    cycle: "Fundamentación",
  }),
  createDemoCourse({
    id: "curso-introduccion-ingenieria",
    code: "IM-103",
    name: "Introducción a la Ingeniería",
    credits: 3,
    semester: 1,
    component: "Ciencias Básicas de Ingeniería",
  }),
  createDemoCourse({
    id: "curso-comunicacion-oral-escrita-1",
    code: "IM-104",
    name: "Comunicación Oral y Escrita I",
    credits: 1,
    semester: 1,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-humanistica-1",
    code: "IM-105",
    name: "Humanística I",
    credits: 2,
    semester: 1,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-humanistica-2",
    code: "IM-106",
    name: "Humanística II",
    credits: 2,
    semester: 1,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-ingles-1",
    code: "IM-107",
    name: "Inglés I",
    credits: 2,
    semester: 1,
    component: "Complementaria",
  }),
];

const semester2Courses: SecubAcademicCourse[] = [
  createDemoCourse({
    id: "curso-fisica-mecanica",
    code: "IM-200",
    name: "Física Mecánica",
    credits: 4,
    semester: 2,
    component: "Ciencias Básicas",
  }),
  createDemoCourse({
    id: "curso-calculo-1",
    code: "IM-202",
    name: "Cálculo I",
    credits: 4,
    semester: 2,
    component: "Ciencias Básicas",
  }),
  createDemoCourse({
    id: SIMPLE_DEMO_IDS.semester2CourseId,
    code: "IM-201",
    name: "Programación Orientada a Objetos",
    credits: 3,
    semester: 2,
    component: "Ciencias Básicas de Ingeniería",
    cycle: "Profesionalización",
  }),
  createDemoCourse({
    id: "curso-taller-multimedia",
    code: "IM-203",
    name: "Taller Multimedia",
    credits: 2,
    semester: 2,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-humanistica-3",
    code: "IM-204",
    name: "Humanística III",
    credits: 2,
    semester: 2,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-bienestar-institucional-1",
    code: "IM-205",
    name: "Bienestar Institucional I",
    credits: 1,
    semester: 2,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-ingles-2",
    code: "IM-206",
    name: "Inglés II",
    credits: 2,
    semester: 2,
    component: "Complementaria",
  }),
];

const semester3Courses: SecubAcademicCourse[] = [
  createDemoCourse({
    id: "curso-calculo-2",
    code: "IM-300",
    name: "Cálculo II",
    credits: 3,
    semester: 3,
    component: "Ciencias Básicas",
  }),
  createDemoCourse({
    id: "curso-algebra-lineal",
    code: "IM-302",
    name: "Álgebra Lineal",
    credits: 3,
    semester: 3,
    component: "Ciencias Básicas",
  }),
  createDemoCourse({
    id: SIMPLE_DEMO_IDS.courseId,
    code: "IM-301",
    name: "Diseño de Medios Digitales",
    credits: 3,
    semester: 3,
    component: "Ciencias Básicas de Ingeniería",
    cycle: "Síntesis",
  }),
  createDemoCourse({
    id: "curso-guion-medios-digitales",
    code: "IM-303",
    name: "Guion para Medios Digitales",
    credits: 2,
    semester: 3,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-humanistica-4",
    code: "IM-304",
    name: "Humanística IV",
    credits: 2,
    semester: 3,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-humanistica-5",
    code: "IM-305",
    name: "Humanística V",
    credits: 2,
    semester: 3,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-bienestar-institucional-2",
    code: "IM-306",
    name: "Bienestar Institucional II",
    credits: 1,
    semester: 3,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-ingles-3",
    code: "IM-307",
    name: "Inglés III",
    credits: 2,
    semester: 3,
    component: "Complementaria",
  }),
];

const semester4Courses: SecubAcademicCourse[] = [
  createDemoCourse({
    id: "curso-matematicas-especiales",
    code: "IM-401",
    name: "Matemáticas Especiales",
    credits: 3,
    semester: 4,
    component: "Ciencias Básicas",
  }),
  createDemoCourse({
    id: "curso-probabilidad-estadistica",
    code: "IM-402",
    name: "Probabilidad y Estadística",
    credits: 3,
    semester: 4,
    component: "Ciencias Básicas",
  }),
  createDemoCourse({
    id: "curso-computacion-grafica",
    code: "IM-403",
    name: "Computación Gráfica",
    credits: 3,
    semester: 4,
    component: "Ciencias Básicas de Ingeniería",
  }),
  createDemoCourse({
    id: "curso-dibujo-multimedia",
    code: "IM-404",
    name: "Dibujo para Multimedia",
    credits: 2,
    semester: 4,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-taller-video-fotografia",
    code: "IM-405",
    name: "Taller de Video y Fotografía",
    credits: 2,
    semester: 4,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-comunicacion-oral-escrita-2",
    code: "IM-406",
    name: "Comunicación Oral y Escrita II",
    credits: 1,
    semester: 4,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-humanistica-6",
    code: "IM-407",
    name: "Humanística VI",
    credits: 2,
    semester: 4,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-bienestar-institucional-3",
    code: "IM-408",
    name: "Bienestar Institucional III",
    credits: 1,
    semester: 4,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-ingles-4",
    code: "IM-409",
    name: "Inglés IV",
    credits: 2,
    semester: 4,
    component: "Complementaria",
  }),
];

const semester5Courses: SecubAcademicCourse[] = [
  createDemoCourse({
    id: "curso-base-datos",
    code: "IM-501",
    name: "Base de Datos",
    credits: 4,
    semester: 5,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-taller-animacion-2d",
    code: "IM-502",
    name: "Taller de Animación 2D",
    credits: 2,
    semester: 5,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-fundamentos-redes",
    code: "IM-503",
    name: "Fundamentos de Redes",
    credits: 3,
    semester: 5,
    component: "Ciencias Básicas de Ingeniería",
  }),
  createDemoCourse({
    id: "curso-audio-digital",
    code: "IM-504",
    name: "Audio Digital",
    credits: 3,
    semester: 5,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-electiva-ingenieria-1",
    code: "IM-505",
    name: "Electiva en Ingeniería I",
    credits: 2,
    semester: 5,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-humanistica-7",
    code: "IM-506",
    name: "Humanística VII",
    credits: 2,
    semester: 5,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-bienestar-institucional-4",
    code: "IM-507",
    name: "Bienestar Institucional IV",
    credits: 1,
    semester: 5,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-ingles-5",
    code: "IM-508",
    name: "Inglés V",
    credits: 2,
    semester: 5,
    component: "Complementaria",
  }),
];

const semester6Courses: SecubAcademicCourse[] = [
  createDemoCourse({
    id: "curso-desarrollo-web",
    code: "IM-601",
    name: "Desarrollo Web",
    credits: 2,
    semester: 6,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-modelado-3d",
    code: "IM-602",
    name: "Modelado 3D",
    credits: 3,
    semester: 6,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-circuitos-digitales",
    code: "IM-603",
    name: "Circuitos Digitales",
    credits: 3,
    semester: 6,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-procesamiento-digital-senales",
    code: "IM-604",
    name: "Procesamiento Digital de Señales",
    credits: 2,
    semester: 6,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-electiva-ingenieria-2",
    code: "IM-605",
    name: "Electiva en Ingeniería II",
    credits: 2,
    semester: 6,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-gestion-proyectos",
    code: "IM-606",
    name: "Gestión en Proyectos",
    credits: 3,
    semester: 6,
    component: "Complementaria",
  }),
  createDemoCourse({
    id: "curso-ingles-6",
    code: "IM-607",
    name: "Inglés VI",
    credits: 2,
    semester: 6,
    component: "Complementaria",
  }),
];

const semester7Courses: SecubAcademicCourse[] = [
  createDemoCourse({
    id: "curso-animacion-integracion-3d",
    code: "IM-701",
    name: "Animación e Integración 3D",
    credits: 3,
    semester: 7,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-electronica-multimedia",
    code: "IM-702",
    name: "Electrónica para Multimedia",
    credits: 3,
    semester: 7,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-procesamiento-imagenes",
    code: "IM-703",
    name: "Procesamiento de Imágenes",
    credits: 3,
    semester: 7,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-edicion-postproduccion-video",
    code: "IM-704",
    name: "Edición y Post-producción de Video",
    credits: 2,
    semester: 7,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-proyecto-ingenieria",
    code: "IM-705",
    name: "Proyecto en Ingeniería",
    credits: 4,
    semester: 7,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-ingles-7",
    code: "IM-706",
    name: "Inglés VII",
    credits: 2,
    semester: 7,
    component: "Complementaria",
  }),
];

const semester8Courses: SecubAcademicCourse[] = [
  createDemoCourse({
    id: "curso-diseno-experiencias-interactivas",
    code: "IM-801",
    name: "Diseño de Experiencias Interactivas",
    credits: 3,
    semester: 8,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-electiva-ingenieria-3",
    code: "IM-802",
    name: "Electiva en Ingeniería III",
    credits: 2,
    semester: 8,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-legislacion-contenidos-digitales",
    code: "IM-803",
    name: "Legislación para Contenidos Digitales",
    credits: 2,
    semester: 8,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-practica-profesional",
    code: "IM-804",
    name: "Práctica Profesional",
    credits: 6,
    semester: 8,
    component: "Ingeniería Aplicada",
  }),
  createDemoCourse({
    id: "curso-ingles-8",
    code: "IM-805",
    name: "Inglés VIII",
    credits: 2,
    semester: 8,
    component: "Complementaria",
  }),
];

const multimediaSemesters: SecubAcademicSemester[] = [
  {
    id: "semestre-1",
    number: 1,
    label: "Semestre 1",
    totalCredits: 19,
    courses: semester1Courses,
  },
  {
    id: "semestre-2",
    number: 2,
    label: "Semestre 2",
    totalCredits: 18,
    courses: semester2Courses,
  },
  {
    id: "semestre-3",
    number: 3,
    label: "Semestre 3",
    totalCredits: 18,
    courses: semester3Courses,
  },
  {
    id: "semestre-4",
    number: 4,
    label: "Semestre 4",
    totalCredits: 19,
    courses: semester4Courses,
  },
  {
    id: "semestre-5",
    number: 5,
    label: "Semestre 5",
    totalCredits: 19,
    courses: semester5Courses,
  },
  {
    id: "semestre-6",
    number: 6,
    label: "Semestre 6",
    // El plan de estudios suministrado reporta 19C para este semestre.
    // Las asignaturas visibles en el documento suman 17C; se conserva el total publicado.
    totalCredits: 19,
    courses: semester6Courses,
  },
  {
    id: "semestre-7",
    number: 7,
    label: "Semestre 7",
    totalCredits: 17,
    courses: semester7Courses,
  },
  {
    id: "semestre-8",
    number: 8,
    label: "Semestre 8",
    totalCredits: 15,
    courses: semester8Courses,
  },
];

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
    durationSemesters: 8,
    // Suma de los totales por semestre publicados en el pensum suministrado.
    totalCredits: 144,
    degreeTitle: "Ingeniero(a) Multimedia",
    cycles: ["Fundamentación", "Profesionalización", "Síntesis"],
    components: [
      "Ciencias Básicas",
      "Ciencias Básicas de Ingeniería",
      "Ingeniería Aplicada",
      "Complementaria",
    ],
    semesters: multimediaSemesters,
  },
];

export const secubAcademicCourses: SecubAcademicCourse[] = multimediaSemesters.flatMap(
  (semester) => semester.courses,
);

const demoStudentProfiles = [
  {
    id: "estudiante-demo-001",
    code: "A001",
    name: "Ana Martínez",
    email: "ana.martinez@demo.edu.co",
  },
  {
    id: "estudiante-demo-002",
    code: "A002",
    name: "Carlos Gómez",
    email: "carlos.gomez@demo.edu.co",
  },
  {
    id: "estudiante-demo-003",
    code: "A003",
    name: "Laura Rodríguez",
    email: "laura.rodriguez@demo.edu.co",
  },
] as const;

export const secubAcademicStudents: SecubAcademicStudent[] = secubAcademicCourses.flatMap(
  (course) =>
    demoStudentProfiles.map((student) => ({
      ...student,
      // Se conservan los IDs históricos del curso demo original porque las
      // mediciones precargadas los utilizan como llave. En el resto de cursos
      // el id incorpora el curso para evitar colisiones entre matrículas mock.
      id:
        course.id === SIMPLE_DEMO_IDS.courseId
          ? student.id
          : `${student.id}-${course.id}`,
      courseId: course.id,
    })),
);

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
    totalSemestres: 8,
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
