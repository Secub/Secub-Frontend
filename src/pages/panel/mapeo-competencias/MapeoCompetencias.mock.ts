import { roleLabels } from "./MapeoCompetencias.permissions";
import type {
  Catalogs,
  CurrentUser,
  Facultad,
  LugarDesarrollo,
  PlanEstudio,
  ProgramaAcademico,
  MapeoCompetenciasRecord,
  MapeoCompetenciasRole,
  Seccional,
} from "./MapeoCompetencias.types";

export const DEFAULT_ROLE: MapeoCompetenciasRole = "admin";

export const mockMapeoCompetencias: MapeoCompetenciasRecord[] = [
  {
    id: "mapeo-sis-cali-2024-2",
    seccionalId: "cali",
    facultadId: "ing-cali",
    lugarId: "cali",
    programaId: "sis-cali",
    planId: "plan-2024-2",
    estado: "activo",
    descripcion:
      "Mapeo curricular del programa de Ingenieria de Sistemas para clasificar competencias por nucleos de formacion y semestres.",
    nombre: "Mapeo Sistemas 2024-2",
    numero: 1,
    semestres: [
      {
        semesterId: "sem-1",
        semesterNumber: 1,
        competencias: [
          {
            id: "comp-fund-1",
            numero: 1,
            descripcion: "Pensamiento logico y resolucion de problemas",
            resultadosAprendizaje: [
              {
                id: "ra-fund-1",
                numero: 1,
                descripcion:
                  "Aplica estructuras logicas para modelar problemas basicos de programacion.",
              },
            ],
          },
        ],
      },
      {
        semesterId: "sem-4",
        semesterNumber: 4,
        competencias: [
          {
            id: "comp-prof-1",
            numero: 1,
            descripcion: "Diseno e implementacion de soluciones de software",
            resultadosAprendizaje: [
              {
                id: "ra-prof-1",
                numero: 1,
                descripcion:
                  "Construye componentes de software aplicando buenas practicas de arquitectura.",
              },
            ],
          },
        ],
      },
    ],
    createdAt: "2026-03-20T09:20:00",
    updatedAt: "2026-03-20T09:20:00",
  },
  {
    id: "mapeo-sis-bog-2024-2",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    lugarId: "bogota",
    programaId: "sis-bog",
    planId: "plan-2024-2",
    estado: "activo",
    descripcion:
      "Relacion de competencias, resultados de aprendizaje y asignaturas del plan de estudios vigente.",
    nombre: "Mapeo Sistemas Bogota",
    numero: 2,
    semestres: [
      {
        semesterId: "sem-1",
        semesterNumber: 1,
        competencias: [
          {
            id: "comp-bog-1",
            numero: 1,
            descripcion: "Fundamentos de ingenieria y pensamiento computacional",
            resultadosAprendizaje: [
              {
                id: "ra-bog-1",
                numero: 1,
                descripcion:
                  "Reconoce conceptos fundamentales de computacion y solucion de problemas.",
              },
            ],
          },
        ],
      },
    ],
    createdAt: "2026-03-22T10:00:00",
    updatedAt: "2026-03-22T10:00:00",
  },
  {
    id: "mapeo-ind-cali-2024-2",
    seccionalId: "cali",
    facultadId: "ing-cali",
    lugarId: "cali",
    programaId: "ind-cali",
    planId: "plan-2024-2",
    estado: "inactivo",
    descripcion:
      "Version historica del mapeo de competencias del programa de Ingenieria Industrial.",
    nombre: "Mapeo Industrial 2024-2",
    numero: 3,
    semestres: [],
    createdAt: "2026-02-28T09:50:00",
    updatedAt: "2026-03-12T13:00:00",
  },
];

export const seccionales: Seccional[] = [
  { id: "cali", nombre: "Seccional Cali" },
  { id: "bogota", nombre: "Sede Bogotá" },
  { id: "medellin", nombre: "Seccional Medellín" },
  { id: "cartagena", nombre: "Seccional Cartagena" },
];

export const lugares: LugarDesarrollo[] = [
  { id: "cali", nombre: "Cali", seccionalId: "cali" },
  { id: "bogota", nombre: "Bogotá", seccionalId: "bogota" },
  { id: "medellin", nombre: "Medellín", seccionalId: "medellin" },
  { id: "bello", nombre: "Bello", seccionalId: "medellin" },
  { id: "armenia", nombre: "Armenia", seccionalId: "medellin" },
  { id: "cartagena", nombre: "Cartagena", seccionalId: "cartagena" },
];

export const facultades: Facultad[] = [
  { id: "ing-cali", nombre: "Facultad de Ingeniería", seccionalId: "cali" },
  { id: "artes-cali", nombre: "Facultad de Artes y Diseño", seccionalId: "cali" },
  { id: "ing-bog", nombre: "Facultad de Ingeniería", seccionalId: "bogota" },
  { id: "salud-bog", nombre: "Facultad de Salud", seccionalId: "bogota" },
  { id: "ing-med", nombre: "Facultad de Ingeniería", seccionalId: "medellin" },
  { id: "ing-cart", nombre: "Facultad de Ingeniería", seccionalId: "cartagena" },
];

export const programas: ProgramaAcademico[] = [
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
    id: "danza-cali",
    nombre: "Licenciatura en Danza y Performance",
    facultadId: "artes-cali",
    seccionalId: "cali",
  },
  {
    id: "sis-bog",
    nombre: "Ingeniería de Sistemas",
    facultadId: "ing-bog",
    seccionalId: "bogota",
  },
  {
    id: "multimedia-bog",
    nombre: "Ingeniería Multimedia",
    facultadId: "ing-bog",
    seccionalId: "bogota",
  },
  {
    id: "biomedica-bog",
    nombre: "Ingeniería Biomédica",
    facultadId: "salud-bog",
    seccionalId: "bogota",
  },
  {
    id: "agro-med",
    nombre: "Ingeniería Agroindustrial",
    facultadId: "ing-med",
    seccionalId: "medellin",
  },
  {
    id: "sis-cart",
    nombre: "Ingeniería de Sistemas",
    facultadId: "ing-cart",
    seccionalId: "cartagena",
  },
];

export const planes: PlanEstudio[] = [
  { id: "plan-2024-2", nombre: "Plan 2024-2" },
  { id: "plan-2024-1", nombre: "Plan 2024-1" },
  { id: "plan-2015-1", nombre: "Plan 2015-1" },
  { id: "plan-2015-2", nombre: "Plan 2015-2" },
];

// export const mockCompetenciasRa: MapeoCompetenciasRecord[] = [
//   {
//     id: "pf-001",
//     seccionalId: "cali",
//     facultadId: "ing-cali",
//     lugarId: "cali",
//     programaId: "sis-cali",
//     planId: "plan-2024-2",
//     estado: "activo",
//     nombre: "Competencia 1",
//     numero: 1,
//     descripcion:
//       "El egresado será capaz de analizar, diseñar e implementar soluciones de software con enfoque ético, analítico y orientado a resultados.",
//     resultadosAprendizaje: [
//       {
//         id: "ra-001-1",
//         numero: 1,
//         descripcion: "Analiza problemas complejos de software aplicando patrones de diseño"
//       },
//       {
//         id: "ra-001-2",
//         numero: 2,
//         descripcion: "Implementa soluciones mantenibles considerando principios SOLID"
//       }
//     ],
//     createdAt: "2026-03-20T09:20:00",
//     updatedAt: "2026-03-20T09:20:00",
//   },
//   {
//     id: "pf-002",
//     seccionalId: "cali",
//     facultadId: "ing-cali",
//     lugarId: "cali",
//     programaId: "ind-cali",
//     planId: "plan-2024-2",
//     estado: "inactivo",
//     nombre: "Competencia 2",
//     numero: 2,
//     descripcion:
//       "El egresado será capaz de optimizar procesos, gestionar recursos y liderar decisiones de mejora continua en entornos productivos.",
//     resultadosAprendizaje: [
//       {
//         id: "ra-002-1",
//         numero: 1,
//         descripcion: "Optimiza procesos industriales mediante metodologías lean"
//       },
//       {
//         id: "ra-002-2",
//         numero: 2,
//         descripcion: "Gestiona recursos productivos de forma eficiente y sostenible"
//       },
//       {
//         id: "ra-002-3",
//         numero: 3,
//         descripcion: "Lidera equipos en procesos de mejora continua"
//       }
//     ],
//     createdAt: "2026-03-18T14:10:00",
//     updatedAt: "2026-03-25T16:45:00",
//   },
//   {
//     id: "pf-003",
//     seccionalId: "cali",
//     facultadId: "artes-cali",
//     lugarId: "cali",
//     programaId: "danza-cali",
//     planId: "plan-2024-1",
//     estado: "activo",
//     nombre: "Competencia 3",
//     numero: 3,
//     descripcion:
//       "El egresado integrará creación, investigación y gestión cultural para aportar propuestas escénicas contemporáneas con sentido social.",
//     resultadosAprendizaje: [
//       {
//         id: "ra-003-1",
//         numero: 1,
//         descripcion: "Crea propuestas escénicas innovadoras con rigor técnico"
//       },
//       {
//         id: "ra-003-2",
//         numero: 2,
//         descripcion: "Integra investigación de contextos socioculturales en proyectos artísticos"
//       }
//     ],
//     createdAt: "2026-03-14T10:00:00",
//     updatedAt: "2026-03-14T10:00:00",
//   },
//   {
//     id: "pf-004",
//     seccionalId: "bogota",
//     facultadId: "ing-bog",
//     lugarId: "bogota",
//     programaId: "sis-bog",
//     planId: "plan-2024-2",
//     estado: "activo",
//     nombre: "Competencia 4",
//     numero: 4,
//     descripcion:
//       "El egresado desarrollará soluciones tecnológicas innovadoras, integrando ingeniería de software, inteligencia artificial y gestión de proyectos.",
//     resultadosAprendizaje: [
//       {
//         id: "ra-004-1",
//         numero: 1,
//         descripcion: "Desarrolla soluciones con arquitecturas escalables y seguras"
//       },
//       {
//         id: "ra-004-2",
//         numero: 2,
//         descripcion: "Integra modelos de inteligencia artificial en aplicaciones empresariales"
//       },
//       {
//         id: "ra-004-3",
//         numero: 3,
//         descripcion: "Gestiona proyectos tecnológicos aplicando metodologías ágiles"
//       },
//       {
//         id: "ra-004-4",
//         numero: 4,
//         descripcion: "Evalúa impacto y sostenibilidad de soluciones tecnológicas"
//       }
//     ],
//     createdAt: "2026-03-10T08:00:00",
//     updatedAt: "2026-03-19T11:30:00",
//   },
//   {
//     id: "pf-005",
//     seccionalId: "bogota",
//     facultadId: "ing-bog",
//     lugarId: "bogota",
//     programaId: "multimedia-bog",
//     planId: "plan-2024-2",
//     estado: "activo",
//     nombre: "Competencia 5",
//     numero: 5,
//     descripcion:
//       "El egresado será capaz de conceptualizar experiencias digitales, integrando narrativa, diseño, interacción y tecnología multimedia.",
//     resultadosAprendizaje: [
//       {
//         id: "ra-005-1",
//         numero: 1,
//         descripcion: "Conceptualiza experiencias digitales con enfoque centrado en el usuario"
//       },
//       {
//         id: "ra-005-2",
//         numero: 2,
//         descripcion: "Diseña interfaces intuitivas y accesibles para múltiples plataformas"
//       },
//       {
//         id: "ra-005-3",
//         numero: 3,
//         descripcion: "Implementa soluciones multimedia interactivas"
//       }
//     ],
//     createdAt: "2026-03-11T12:00:00",
//     updatedAt: "2026-03-21T15:15:00",
//   },
//   {
//     id: "pf-006",
//     seccionalId: "bogota",
//     facultadId: "salud-bog",
//     lugarId: "bogota",
//     programaId: "biomedica-bog",
//     planId: "plan-2015-1",
//     estado: "inactivo",
//     nombre: "Competencia 6",
//     numero: 6,
//     descripcion:
//       "El egresado integrará principios biomédicos, instrumentación y análisis clínico para desarrollar soluciones aplicadas al contexto sanitario.",
//     resultadosAprendizaje: [
//       {
//         id: "ra-006-1",
//         numero: 1,
//         descripcion: "Aplica principios biomédicos en diseño de dispositivos médicos"
//       },
//       {
//         id: "ra-006-2",
//         numero: 2,
//         descripcion: "Realiza análisis clínicos utilizando instrumentación especializada"
//       }
//     ],
//     createdAt: "2026-02-28T09:50:00",
//     updatedAt: "2026-03-12T13:00:00",
//   },
//   {
//     id: "pf-007",
//     seccionalId: "medellin",
//     facultadId: "ing-med",
//     lugarId: "medellin",
//     programaId: "agro-med",
//     planId: "plan-2015-2",
//     estado: "activo",
//     nombre: "Competencia 7",
//     numero: 7,
//     descripcion:
//       "El egresado gestionará procesos agroindustriales con visión sostenible, articulando producción, innovación y calidad.",
//     resultadosAprendizaje: [
//       {
//         id: "ra-007-1",
//         numero: 1,
//         descripcion: "Gestiona procesos agroindustriales con criterios de sostenibilidad"
//       },
//       {
//         id: "ra-007-2",
//         numero: 2,
//         descripcion: "Implementa innovaciones en cadena de producción agroindustrial"
//       }
//     ],
//     createdAt: "2026-03-09T07:45:00",
//     updatedAt: "2026-03-15T09:10:00",
//   },
//   {
//     id: "pf-008",
//     seccionalId: "medellin",
//     facultadId: "ing-med",
//     lugarId: "bello",
//     programaId: "agro-med",
//     planId: "plan-2024-1",
//     estado: "activo",
//     nombre: "Competencia 8",
//     numero: 8,
//     descripcion:
//       "El egresado aplicará herramientas de innovación, logística y sostenibilidad para fortalecer procesos agroindustriales en contextos regionales.",
//     resultadosAprendizaje: [
//       {
//         id: "ra-008-1",
//         numero: 1,
//         descripcion: "Aplica herramientas de innovación en procesos agroindustriales"
//       },
//       {
//         id: "ra-008-2",
//         numero: 2,
//         descripcion: "Optimiza logística agroindustrial en contextos regionales"
//       },
//       {
//         id: "ra-008-3",
//         numero: 3,
//         descripcion: "Implementa prácticas sostenibles en cadena de valor"
//       }
//     ],
//     createdAt: "2026-03-12T09:00:00",
//     updatedAt: "2026-03-19T09:40:00",
//   },
//   {
//     id: "pf-009",
//     seccionalId: "medellin",
//     facultadId: "ing-med",
//     lugarId: "armenia",
//     programaId: "agro-med",
//     planId: "plan-2024-2",
//     estado: "inactivo",
//     nombre: "Competencia 9",
//     numero: 9,
//     descripcion:
//       "El egresado podrá liderar proyectos de transformación productiva y de gestión de calidad con enfoque territorial y visión de cadena de valor.",
//     resultadosAprendizaje: [
//       {
//         id: "ra-009-1",
//         numero: 1,
//         descripcion: "Lidera proyectos de transformación productiva"
//       },
//       {
//         id: "ra-009-2",
//         numero: 2,
//         descripcion: "Gestiona sistemas de calidad con enfoque territorial"
//       },
//       {
//         id: "ra-009-3",
//         numero: 3,
//         descripcion: "Articula visión de cadena de valor en decisiones estratégicas"
//       },
//       {
//         id: "ra-009-4",
//         numero: 4,
//         descripcion: "Monitorea indicadores de desempeño agroindustrial"
//       }
//     ],
//     createdAt: "2026-03-16T08:20:00",
//     updatedAt: "2026-03-22T10:00:00",
//   },
//   {
//     id: "pf-010",
//     seccionalId: "cartagena",
//     facultadId: "ing-cart",
//     lugarId: "cartagena",
//     programaId: "sis-cart",
//     planId: "plan-2024-2",
//     estado: "activo",
//     nombre: "Competencia 10",
//     numero: 10,
//     descripcion:
//       "El egresado será capaz de diseñar, implementar y evaluar soluciones tecnológicas orientadas a la transformación digital y al desarrollo regional.",
//     resultadosAprendizaje: [
//       {
//         id: "ra-010-1",
//         numero: 1,
//         descripcion: "Diseña soluciones para transformación digital en contextos regionales"
//       },
//       {
//         id: "ra-010-2",
//         numero: 2,
//         descripcion: "Implementa tecnologías que impulsan desarrollo regional"
//       },
//       {
//         id: "ra-010-3",
//         numero: 3,
//         descripcion: "Evalúa impacto de soluciones tecnológicas en comunidades locales"
//       }
//     ],
//     createdAt: "2026-03-22T09:00:00",
//     updatedAt: "2026-03-22T09:00:00",
//   },
// ];

const mockUsers: Record<MapeoCompetenciasRole, CurrentUser> = {
  admin: {
    id: "usr-admin-001",
    nombre: "Juliana Mejía",
    cargo: roleLabels.admin,
    role: "admin",
    scope: {},
  },
  vice: {
    id: "usr-vice-001",
    nombre: "Ana María Restrepo",
    cargo: roleLabels.vice,
    role: "vice",
    scope: { seccionalId: "bogota" },
  },
  decano: {
    id: "usr-decano-001",
    nombre: "Carlos Medina",
    cargo: roleLabels.decano,
    role: "decano",
    scope: { facultadId: "ing-bog", seccionalId: "bogota" },
  },
  director: {
    id: "usr-director-001",
    nombre: "Laura Gómez",
    cargo: roleLabels.director,
    role: "director",
    scope: {
      seccionalId: "bogota",
      facultadId: "ing-bog",
      programaId: "sis-bog",
    },
  },
  docente: {
    id: "usr-docente-001",
    nombre: "Santiago Torres",
    cargo: roleLabels.docente,
    role: "docente",
    scope: {
      seccionalId: "bogota",
      facultadId: "ing-bog",
      programaId: "sis-bog",
    },
  },
};

export function normalizeRole(
  rawRole: string | null | undefined,
): MapeoCompetenciasRole {
  const normalized = String(rawRole ?? "").trim().toLowerCase();

  const aliases: Record<string, MapeoCompetenciasRole> = {
    admin: "admin",
    administrador: "admin",
    administrative: "admin",
    vice: "vice",
    vicerrector: "vice",
    vicerrectoría: "vice",
    vicerrectoria: "vice",
    decano: "decano",
    director: "director",
    directorprograma: "director",
    director_de_programa: "director",
    docente: "docente",
    teacher: "docente",
  };

  return aliases[normalized] ?? DEFAULT_ROLE;
}

export function getCurrentUser(): CurrentUser {
  const params = new URLSearchParams(window.location.search);
  const role = normalizeRole(params.get("role"));
  return mockUsers[role];
}

export function getCatalogs(): Catalogs {
  return {
    seccionales,
    facultades,
    lugares,
    programas,
    planes,
  };
}
