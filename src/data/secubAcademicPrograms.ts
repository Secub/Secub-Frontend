export type SecubProgramId = "psicologia" | "derecho";

export interface SecubAcademicCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  component: string;
  cycle: "Fundamentación" | "Profesionalización" | "Síntesis";
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
  seccional: "Seccional Cali";
  seccionalId: "cali";
  lugarId: "cali";
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

const SECCIONAL_CALI_ID = "cali" as const;
const LUGAR_CALI_ID = "cali" as const;

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCourseId(programId: SecubProgramId, semester: number, courseName: string) {
  return `${programId}-sem${semester}-${normalizeSlug(courseName)}`;
}

function getCode(programId: SecubProgramId, semester: number, index: number) {
  return `${programId === "psicologia" ? "PSI" : "DER"}-${String(semester).padStart(2, "0")}${String(index + 1).padStart(2, "0")}`;
}

function getPsychologyCycle(semester: number): SecubAcademicCourse["cycle"] {
  if (semester <= 3) return "Fundamentación";
  if (semester <= 7) return "Profesionalización";
  return "Síntesis";
}

function getLawCycle(semester: number): SecubAcademicCourse["cycle"] {
  if (semester <= 3) return "Fundamentación";
  if (semester <= 6) return "Profesionalización";
  return "Síntesis";
}

const psychologySemesterCredits = [17, 15, 16, 15, 16, 17, 17, 17, 16];
const lawSemesterCredits = [19, 19, 18, 18, 20, 19, 19, 18];

const psychologyRawCourses: Array<Array<{ name: string; credits: number; component: string }>> = [
  [
    { name: "Pensamiento Lógico Investigativo", credits: 3, component: "Análisis y Expresión Científica: Investigación" },
    { name: "Historia de la Psicología Mundial y Latinoamericana", credits: 3, component: "Historias, Trayectorias y Perspectivas De La Psicología" },
    { name: "Paradigmas en Ciencias Sociales y Psicología", credits: 3, component: "Historias, Trayectorias y Perspectivas De La Psicología" },
    { name: "Prácticas de Lectura y Escritura", credits: 2, component: "Análisis y Expresión Científica: Investigación" },
    { name: "Subjetividades e Identidad", credits: 3, component: "Cultura, Desarrollo Humano y Subjetividades" },
    { name: "Proyecto de Vida", credits: 2, component: "Institucional" },
    { name: "Identidad Institucional y Franciscanismo", credits: 1, component: "Institucional" },
    { name: "Inglés I", credits: 0, component: "Electivas" },
  ],
  [
    { name: "Humanización, Evolución y Cultura", credits: 3, component: "Cultura, Desarrollo Humano y Subjetividades" },
    { name: "Perspectivas sobre las Infancias: Constitución Subjetiva y Desarrollo", credits: 3, component: "Cultura, Desarrollo Humano y Subjetividades" },
    { name: "Escuelas y Perspectivas de la Psicología: Humanismo", credits: 3, component: "Historias, Trayectorias y Perspectivas De La Psicología" },
    { name: "Estéticas de la Escritura", credits: 2, component: "Análisis y Expresión Científica: Investigación" },
    { name: "Electiva I", credits: 2, component: "Electivas" },
    { name: "Constitución y Democracia", credits: 2, component: "Institucional" },
    { name: "Inglés II", credits: 0, component: "Electivas" },
  ],
  [
    { name: "Poder, Movimientos Sociales y Políticas Públicas", credits: 3, component: "Construcción de Paz, Diversidad y Mediaciones" },
    { name: "Perspectivas sobre las Juventudes y la Adultez", credits: 3, component: "Cultura, Desarrollo Humano y Subjetividades" },
    { name: "Práctica Investigativa: Perspectiva Cualitativa", credits: 3, component: "Análisis y Expresión Científica: Investigación" },
    { name: "Escuelas y Perspectivas de la Psicología: Cognitivo-Conductual", credits: 3, component: "Historias, Trayectorias y Perspectivas De La Psicología" },
    { name: "Electiva II", credits: 2, component: "Electivas" },
    { name: "Franciscanismo y Ecología", credits: 2, component: "Institucional" },
    { name: "Inglés III", credits: 0, component: "Electivas" },
  ],
  [
    { name: "Escuelas y Perspectivas de la Psicología: Psicoanálisis", credits: 3, component: "Historias, Trayectorias y Perspectivas De La Psicología" },
    { name: "Práctica Investigativa: Perspectiva Cuantitativa", credits: 3, component: "Análisis y Expresión Científica: Investigación" },
    { name: "Trabajo y Contemporaneidad", credits: 3, component: "Trabajo, Salud y Organizaciones" },
    { name: "Clínica y Ciencia", credits: 2, component: "Clínica, Salud y Ética del Cuidado" },
    { name: "Electiva III", credits: 2, component: "Electivas" },
    { name: "Ética", credits: 2, component: "Institucional" },
    { name: "Inglés IV", credits: 0, component: "Electivas" },
  ],
  [
    { name: "Estadística para Ciencias Sociales", credits: 3, component: "Análisis y Expresión Científica: Investigación" },
    { name: "Perspectivas Socioculturales de la Cognición", credits: 3, component: "Construcción de Paz, Diversidad y Mediaciones" },
    { name: "Diversidad e Inclusión", credits: 3, component: "Construcción de Paz, Diversidad y Mediaciones" },
    { name: "Clínica y Sociedad", credits: 3, component: "Clínica, Salud y Ética del Cuidado" },
    { name: "Electiva IV", credits: 2, component: "Electivas" },
    { name: "Electiva V", credits: 2, component: "Electivas" },
    { name: "Inglés V", credits: 0, component: "Electivas" },
  ],
  [
    { name: "Organizaciones y Contextos", credits: 3, component: "Trabajo, Salud y Organizaciones" },
    { name: "Práctica Investigativa: Perspectiva Mixta", credits: 3, component: "Análisis y Expresión Científica: Investigación" },
    { name: "Psicopatología y Sociedad", credits: 3, component: "Clínica, Salud y Ética del Cuidado" },
    { name: "Neuropsicología y Cultura", credits: 3, component: "Construcción de Paz, Diversidad y Mediaciones" },
    { name: "Electiva Profundización en Clínica I", credits: 3, component: "Clínica, Salud y Ética del Cuidado" },
    { name: "Electiva VI", credits: 2, component: "Electivas" },
    { name: "Inglés VI", credits: 0, component: "Electivas" },
  ],
  [
    { name: "Formulación de Proyectos", credits: 3, component: "Análisis y Expresión Científica: Investigación" },
    { name: "Evaluación de Problemáticas Psicológicas", credits: 3, component: "Clínica, Salud y Ética del Cuidado" },
    { name: "Abordajes de Problemáticas Educativas", credits: 3, component: "Construcción de Paz, Diversidad y Mediaciones" },
    { name: "Abordajes e Intervención Psicosocial", credits: 3, component: "Construcción de Paz, Diversidad y Mediaciones" },
    { name: "Electiva Profundización Clínica II", credits: 3, component: "Clínica, Salud y Ética del Cuidado" },
    { name: "Electiva VII", credits: 2, component: "Electivas" },
    { name: "Inglés VII", credits: 0, component: "Electivas" },
  ],
  [
    { name: "Trabajo y Salud", credits: 3, component: "Trabajo, Salud y Organizaciones" },
    { name: "Modalidad de Grado I", credits: 3, component: "Síntesis - Sujeto Ético" },
    { name: "Clínica y Estética", credits: 2, component: "Clínica, Salud y Ética del Cuidado" },
    { name: "Práctica Profesional I", credits: 7, component: "Clínica, Salud y Ética del Cuidado" },
    { name: "Electiva VIII", credits: 2, component: "Electivas" },
    { name: "Inglés VIII", credits: 0, component: "Electivas" },
  ],
  [
    { name: "Innovación social y Emprendimiento", credits: 1, component: "Síntesis - Sujeto Ético" },
    { name: "Modalidad de Grado II", credits: 3, component: "Síntesis - Sujeto Ético" },
    { name: "Ética del Cuidado", credits: 3, component: "Clínica, Salud y Ética del Cuidado" },
    { name: "Práctica Profesional II", credits: 7, component: "Clínica, Salud y Ética del Cuidado" },
    { name: "Electiva IX", credits: 2, component: "Electivas" },
  ],
];

const lawRawCourses: Array<Array<{ name: string; credits: number; component: string }>> = [
  [
    { name: "Introducción al Derecho", credits: 3, component: "Cimentación" },
    { name: "Comunicación Escrita y Oral", credits: 2, component: "Cimentación" },
    { name: "Civil General y Personas", credits: 2, component: "Privado" },
    { name: "Razonamiento Cuantitativo", credits: 2, component: "Cimentación" },
    { name: "Historia de las Ideas Políticas", credits: 2, component: "Cimentación" },
    { name: "Historia del Derecho", credits: 2, component: "Cimentación" },
    { name: "Humanística I", credits: 2, component: "Institucional" },
    { name: "Humanística II", credits: 2, component: "Institucional" },
    { name: "Inglés I", credits: 2, component: "Formación Segunda Lengua" },
  ],
  [
    { name: "Hemanéutica y Argumentación Jurídica", credits: 3, component: "Cimentación" },
    { name: "Derecho Patrimonial", credits: 2, component: "Privado" },
    { name: "Teoría del Negocio Jurídico", credits: 2, component: "Privado" },
    { name: "Teoría Constitucional", credits: 3, component: "Público" },
    { name: "Sistemas Jurídicos y Gestión del Conflicto", credits: 2, component: "Gestión del Conflicto (énfasis)" },
    { name: "Penal General", credits: 3, component: "Penal" },
    { name: "Humanística III", credits: 2, component: "Institucional" },
    { name: "Inglés II", credits: 2, component: "Formación Segunda Lengua" },
  ],
  [
    { name: "Sociología Jurídica", credits: 2, component: "Cimentación" },
    { name: "Filosofía del Derecho", credits: 3, component: "Cimentación" },
    { name: "Obligaciones", credits: 3, component: "Privado" },
    { name: "Derecho Constitucional Colombiano", credits: 3, component: "Público" },
    { name: "Teoría General del Proceso", credits: 2, component: "Gestión del Conflicto (énfasis)" },
    { name: "Penal Especial", credits: 3, component: "Penal" },
    { name: "Inglés III", credits: 2, component: "Formación Segunda Lengua" },
  ],
  [
    { name: "Contrato Civiles", credits: 3, component: "Privado" },
    { name: "Derecho de Familia", credits: 2, component: "Privado" },
    { name: "Comercial General", credits: 2, component: "Privado" },
    { name: "Derecho Administrativo General", credits: 3, component: "Público" },
    { name: "Derecho Internacional Público", credits: 2, component: "Público" },
    { name: "Prácticas Restaurativas", credits: 2, component: "Gestión del Conflicto (énfasis)" },
    { name: "Procesal Penal I", credits: 2, component: "Penal" },
    { name: "Inglés IV", credits: 2, component: "Formación Segunda Lengua" },
  ],
  [
    { name: "Ética Profesional", credits: 2, component: "Cimentación" },
    { name: "Sucesiones", credits: 2, component: "Privado" },
    { name: "Contratos Mercantiles", credits: 2, component: "Privado" },
    { name: "Derecho Administrativo Especial", credits: 3, component: "Público" },
    { name: "Contratación Estatal", credits: 2, component: "Público" },
    { name: "Mediación", credits: 2, component: "Gestión del Conflicto (énfasis)" },
    { name: "Procesal Penal II", credits: 2, component: "Penal" },
    { name: "Derecho Laboral General e Individual", credits: 3, component: "Laboral" },
    { name: "Inglés V", credits: 2, component: "Formación Segunda Lengua" },
  ],
  [
    { name: "Procesal Civil I", credits: 2, component: "Privado" },
    { name: "Derecho Probatorio", credits: 2, component: "Privado" },
    { name: "Títulos Valores", credits: 2, component: "Privado" },
    { name: "Procesal Administrativo", credits: 2, component: "Público" },
    { name: "Derecho Humanos y Derecho Internacional Humanitario", credits: 2, component: "Público" },
    { name: "Conciliación", credits: 2, component: "Gestión del Conflicto (énfasis)" },
    { name: "Metodología de la Investigación", credits: 2, component: "Cimentación" },
    { name: "Derecho Laboral Prestacional y Colectivo", credits: 3, component: "Laboral" },
    { name: "Inglés VI", credits: 2, component: "Formación Segunda Lengua" },
  ],
  [
    { name: "Procesal Civil II", credits: 3, component: "Privado" },
    { name: "Derecho Internacional Privado", credits: 2, component: "Privado" },
    { name: "Derecho Societario", credits: 3, component: "Privado" },
    { name: "Derecho Ambiental", credits: 2, component: "Público" },
    { name: "Seguridad Social", credits: 3, component: "Laboral" },
    { name: "Arbitraje", credits: 2, component: "Gestión del Conflicto (énfasis)" },
    { name: "Procesal Laboral", credits: 2, component: "Laboral" },
    { name: "Requisito de Grado: Consultorio Jurídico I", credits: 0, component: "Requisito de Grado" },
    { name: "Inglés VII", credits: 2, component: "Formación Segunda Lengua" },
  ],
  [
    { name: "Electiva Libre", credits: 2, component: "Componente Electivo" },
    { name: "Electiva de Profundización I", credits: 2, component: "Componente Electivo" },
    { name: "Electiva de Profundización II", credits: 2, component: "Componente Electivo" },
    { name: "Programa Complementario de Formación Avanzada", credits: 10, component: "Programa Complementario de Formación Avanzada" },
    { name: "Requisito de Grado: Consultorio Jurídico II", credits: 0, component: "Requisito de Grado" },
    { name: "Inglés VIII", credits: 2, component: "Formación Segunda Lengua" },
  ],
];

function buildCourses(programId: SecubProgramId, planId: string, raw: typeof psychologyRawCourses, cycleFactory: (semester: number) => SecubAcademicCourse["cycle"]) {
  return raw.flatMap((semesterCourses, semesterIndex) => {
    const semester = semesterIndex + 1;
    return semesterCourses.map<SecubAcademicCourse>((course, courseIndex) => ({
      id: getCourseId(programId, semester, course.name),
      code: getCode(programId, semester, courseIndex),
      name: course.name,
      credits: course.credits,
      semester,
      component: course.component,
      cycle: cycleFactory(semester),
      programId,
      planId,
    }));
  });
}

function buildSemesters(programId: SecubProgramId, planId: string, courses: SecubAcademicCourse[], credits: number[]) {
  return credits.map<SecubAcademicSemester>((totalCredits, index) => {
    const number = index + 1;
    return {
      id: `${planId}-semestre-${number}`,
      number,
      label: `Semestre ${number}`,
      totalCredits,
      courses: courses.filter((course) => course.programId === programId && course.semester === number),
    };
  });
}

const psychologyCourses = buildCourses("psicologia", "psicologia-2021-1", psychologyRawCourses, getPsychologyCycle);
const lawCourses = buildCourses("derecho", "derecho-2025-1", lawRawCourses, getLawCycle);

export const secubAcademicPrograms: SecubAcademicProgram[] = [
  {
    id: "psicologia",
    name: "Psicología",
    directorRoleLabel: "Jefatura del Programa de Psicología",
    faculty: "Facultad de Ciencias Humanas y Sociales",
    facultyId: "fac-ciencias-humanas-sociales-cali",
    seccional: "Seccional Cali",
    seccionalId: SECCIONAL_CALI_ID,
    lugarId: LUGAR_CALI_ID,
    snies: "4481",
    planId: "psicologia-2021-1",
    planVersion: "2021-1",
    durationSemesters: 9,
    totalCredits: 146,
    degreeTitle: "Psicóloga / Psicólogo",
    cycles: ["Fundamentación - Sujeto Epistémico", "Profesional - Sujeto Social", "Síntesis - Sujeto Ético"],
    components: [
      "Historias, Trayectorias y Perspectivas De La Psicología",
      "Análisis y Expresión Científica: Investigación",
      "Clínica, Salud y Ética del Cuidado",
      "Construcción de Paz, Diversidad y Mediaciones",
      "Trabajo, Salud y Organizaciones",
      "Cultura, Desarrollo Humano y Subjetividades",
      "Institucional",
      "Electivas",
    ],
    semesters: buildSemesters("psicologia", "psicologia-2021-1", psychologyCourses, psychologySemesterCredits),
  },
  {
    id: "derecho",
    name: "Derecho",
    directorRoleLabel: "Jefatura del Programa de Derecho",
    faculty: "Facultad de Derecho y Ciencias Políticas",
    facultyId: "fac-derecho-ciencias-politicas-cali",
    seccional: "Seccional Cali",
    seccionalId: SECCIONAL_CALI_ID,
    lugarId: LUGAR_CALI_ID,
    snies: "53953",
    planId: "derecho-2025-1",
    planVersion: "2025-1",
    durationSemesters: 8,
    totalCredits: 150,
    degreeTitle: "Abogada / Abogado",
    cycles: ["Cimentación", "Privado", "Público", "Gestión del Conflicto (énfasis)", "Penal", "Institucional", "Formación Segunda Lengua", "Componente Electivo", "Laboral", "Programa Complementario de Formación Avanzada", "Requisito de Grado"],
    components: ["Cimentación", "Privado", "Público", "Gestión del Conflicto (énfasis)", "Penal", "Institucional", "Formación Segunda Lengua", "Componente Electivo", "Laboral", "Programa Complementario de Formación Avanzada", "Requisito de Grado"],
    semesters: buildSemesters("derecho", "derecho-2025-1", lawCourses, lawSemesterCredits),
  },
];

export const secubAcademicCourses = [...psychologyCourses, ...lawCourses];

export const secubSeccionales = [{ id: SECCIONAL_CALI_ID, nombre: "Seccional Cali" }];
export const secubLugares = [{ id: LUGAR_CALI_ID, nombre: "Cali", seccionalId: SECCIONAL_CALI_ID }];
export const secubFacultades = secubAcademicPrograms.map((program) => ({
  id: program.facultyId,
  nombre: program.faculty,
  seccionalId: program.seccionalId,
}));
export const secubProgramas = secubAcademicPrograms.map((program) => ({
  id: program.id,
  nombre: program.name,
  facultadId: program.facultyId,
  seccionalId: program.seccionalId,
  estado: "activo" as const,
}));
export const secubPlanes = secubAcademicPrograms.map((program) => ({
  id: program.planId,
  nombre: `Plan ${program.planVersion}`,
  programaId: program.id,
  estado: "activo" as const,
  totalSemestres: program.durationSemesters,
}));

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
  return secubAcademicCourses.filter((course) => course.programId === programId && course.planId === planId);
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
