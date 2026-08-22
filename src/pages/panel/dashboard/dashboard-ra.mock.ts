import type {
  CourseMeasurement,
  DashboardCatalogs,
  MeasurementCycle,
  RaResultRecord,
} from "./dashboard-ra.types";

export const TARGET_RA_PERCENTAGE = 70;
export const dashboardCatalogs: DashboardCatalogs = {
  seccionales: [],
  facultades: [],
  programas: [],
  teachers: [],
  competences: [],
  learningResults: [],
};

export const measurementCycles: MeasurementCycle[] = [];
export const courseMeasurements: CourseMeasurement[] = [];
export const raResultRecords: RaResultRecord[] = [];
