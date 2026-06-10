export type AcademicPlanStatus = "inProgress" | "completed" | "newAcademicPlan";

export interface AcademicPlanInstance {
  id: string;
  title: string;
  status: AcademicPlanStatus;
  createdAt: string;
  cycleStartDate?: string;
  completedAt?: string;
  archivedAt?: string;
  completedStepCount?: number;
  totalStepCount?: number;
  sourcePlanId?: string;
  inheritedBaseFromPlanId?: string;
  inheritedStepKeys?: string[];
}

export interface AcademicPlanRenewalAvailability {
  isAvailable: boolean;
  isCompleted: boolean;
  monthsRequired: number;
  renewalDate: string;
  lockedMessage?: string;
}

const ACTIVE_ACADEMIC_PLAN_KEY = "secub:active-academic-plan:v1";
const ARCHIVED_ACADEMIC_PLANS_KEY = "secub:archived-academic-plans:v1";

export const DEFAULT_ACADEMIC_PLAN_INSTANCE_ID = "demo-academic-plan-default";
export const ACADEMIC_PLAN_RENEWAL_MONTHS = 18;
export const NEW_ACADEMIC_PLAN_LOCKED_MESSAGE =
  "Solo puedes crear un nuevo plan académico cuando el ciclo actual haya cumplido 1.5 años.";

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && "localStorage" in window;
  } catch {
    return false;
  }
}

function dispatchAcademicPlanChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("secub:academic-plan-updated"));
  window.dispatchEvent(new CustomEvent("secub:mock-backend-updated"));
}

function createDefaultAcademicPlan(): AcademicPlanInstance {
  const now = new Date().toISOString();

  return {
    id: DEFAULT_ACADEMIC_PLAN_INSTANCE_ID,
    title: "Plan académico actual",
    status: "inProgress",
    createdAt: now,
    cycleStartDate: now,
  };
}

function normalizePlan(plan: AcademicPlanInstance): AcademicPlanInstance {
  return {
    ...plan,
    cycleStartDate: plan.cycleStartDate ?? plan.createdAt,
  };
}

function safeParsePlan(rawValue: string | null): AcademicPlanInstance | null {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<AcademicPlanInstance>;

    if (!parsed.id || !parsed.title || !parsed.status || !parsed.createdAt) {
      return null;
    }

    return normalizePlan(parsed as AcademicPlanInstance);
  } catch {
    return null;
  }
}

function safeParseArchivedPlans(rawValue: string | null): AcademicPlanInstance[] {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue) as AcademicPlanInstance[];
    return Array.isArray(parsed)
      ? parsed
          .filter((plan) => Boolean(plan.id && plan.title && plan.status && plan.createdAt))
          .map(normalizePlan)
      : [];
  } catch {
    return [];
  }
}

function persistActiveAcademicPlan(plan: AcademicPlanInstance) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(ACTIVE_ACADEMIC_PLAN_KEY, JSON.stringify(normalizePlan(plan)));
}

function persistArchivedAcademicPlans(plans: AcademicPlanInstance[]) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(ARCHIVED_ACADEMIC_PLANS_KEY, JSON.stringify(plans.map(normalizePlan)));
}

function getPlanStartDate(plan: AcademicPlanInstance) {
  const rawDate = plan.cycleStartDate ?? plan.createdAt;
  const parsedDate = new Date(rawDate);

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  const originalDay = nextDate.getDate();

  nextDate.setMonth(nextDate.getMonth() + months);

  if (nextDate.getDate() < originalDay) {
    nextDate.setDate(0);
  }

  return nextDate;
}

export function getAcademicPlanRenewalDate(plan: AcademicPlanInstance) {
  return addMonths(getPlanStartDate(plan), ACADEMIC_PLAN_RENEWAL_MONTHS);
}

export function hasAcademicPlanReachedRenewalWindow(plan: AcademicPlanInstance, now = new Date()) {
  return now.getTime() >= getAcademicPlanRenewalDate(plan).getTime();
}

export function getAcademicPlanRenewalAvailability(
  plan: AcademicPlanInstance = getActiveAcademicPlanInstance(),
  now = new Date(),
): AcademicPlanRenewalAvailability {
  const normalizedPlan = normalizePlan(plan);
  const renewalDate = getAcademicPlanRenewalDate(normalizedPlan);
  const isCompleted = normalizedPlan.status === "completed";
  const hasReachedRenewalWindow = now.getTime() >= renewalDate.getTime();
  const isAvailable = isCompleted && hasReachedRenewalWindow;

  return {
    isAvailable,
    isCompleted,
    monthsRequired: ACADEMIC_PLAN_RENEWAL_MONTHS,
    renewalDate: renewalDate.toISOString(),
    lockedMessage: isAvailable
      ? undefined
      : isCompleted
        ? NEW_ACADEMIC_PLAN_LOCKED_MESSAGE
        : "Completa el ciclo académico actual antes de crear un nuevo plan académico.",
  };
}

function assertCanCreateNewAcademicPlan(currentPlan: AcademicPlanInstance) {
  const availability = getAcademicPlanRenewalAvailability(currentPlan);

  if (!availability.isAvailable) {
    throw new Error(availability.lockedMessage ?? NEW_ACADEMIC_PLAN_LOCKED_MESSAGE);
  }
}

export function getActiveAcademicPlanInstance(): AcademicPlanInstance {
  if (!canUseLocalStorage()) return createDefaultAcademicPlan();

  const storedPlan = safeParsePlan(window.localStorage.getItem(ACTIVE_ACADEMIC_PLAN_KEY));

  if (storedPlan) return storedPlan;

  const defaultPlan = createDefaultAcademicPlan();
  persistActiveAcademicPlan(defaultPlan);
  return defaultPlan;
}

export function getActiveAcademicPlanInstanceId() {
  return getActiveAcademicPlanInstance().id;
}

export function listArchivedAcademicPlanInstances() {
  if (!canUseLocalStorage()) return [];
  return safeParseArchivedPlans(window.localStorage.getItem(ARCHIVED_ACADEMIC_PLANS_KEY));
}

function archivePlanIfNeeded(plan: AcademicPlanInstance, metadata?: Partial<AcademicPlanInstance>) {
  if (!canUseLocalStorage()) return;

  const archivedPlans = listArchivedAcademicPlanInstances();
  const alreadyArchived = archivedPlans.some((archivedPlan) => archivedPlan.id === plan.id);

  if (alreadyArchived) return;

  const archivedPlan: AcademicPlanInstance = normalizePlan({
    ...plan,
    ...metadata,
    status: metadata?.status ?? "completed",
    completedAt: metadata?.completedAt ?? plan.completedAt ?? new Date().toISOString(),
    archivedAt: new Date().toISOString(),
  });

  persistArchivedAcademicPlans([archivedPlan, ...archivedPlans]);
}

export function createNewAcademicPlanInstance(metadata?: Partial<AcademicPlanInstance>) {
  const currentPlan = getActiveAcademicPlanInstance();
  const completedCurrentPlan = normalizePlan({
    ...currentPlan,
    status: metadata?.status === "completed" ? "completed" : currentPlan.status,
    completedAt: metadata?.completedAt ?? currentPlan.completedAt,
    completedStepCount: metadata?.completedStepCount ?? currentPlan.completedStepCount,
    totalStepCount: metadata?.totalStepCount ?? currentPlan.totalStepCount,
  });

  assertCanCreateNewAcademicPlan(completedCurrentPlan);
  archivePlanIfNeeded(completedCurrentPlan, metadata);

  const now = new Date().toISOString();
  const newPlanNumber = Math.max(1, listArchivedAcademicPlanInstances().length);
  const newPlan: AcademicPlanInstance = {
    id: `academic-plan-${Date.now()}`,
    title: `Plan académico nuevo ${newPlanNumber}`,
    status: "newAcademicPlan",
    createdAt: now,
    cycleStartDate: now,
    sourcePlanId: completedCurrentPlan.id,
    inheritedBaseFromPlanId: completedCurrentPlan.id,
    inheritedStepKeys: ["perfil-egreso", "proposito-formacion"],
  };

  persistActiveAcademicPlan(newPlan);
  dispatchAcademicPlanChange();

  return newPlan;
}

export function markActiveAcademicPlanCompleted(metadata?: Partial<AcademicPlanInstance>) {
  const currentPlan = getActiveAcademicPlanInstance();

  if (currentPlan.status === "completed") return currentPlan;

  const completedPlan: AcademicPlanInstance = normalizePlan({
    ...currentPlan,
    ...metadata,
    status: "completed",
    completedAt: metadata?.completedAt ?? new Date().toISOString(),
  });

  persistActiveAcademicPlan(completedPlan);
  dispatchAcademicPlanChange();

  return completedPlan;
}

export function markActiveAcademicPlanInProgress() {
  const currentPlan = getActiveAcademicPlanInstance();

  if (currentPlan.status !== "newAcademicPlan") return currentPlan;

  const inProgressPlan: AcademicPlanInstance = normalizePlan({
    ...currentPlan,
    status: "inProgress",
  });

  persistActiveAcademicPlan(inProgressPlan);
  dispatchAcademicPlanChange();

  return inProgressPlan;
}

export function isRecordFromActiveAcademicPlan(record: { academicPlanInstanceId?: string }) {
  const recordPlanId = record.academicPlanInstanceId ?? DEFAULT_ACADEMIC_PLAN_INSTANCE_ID;
  return recordPlanId === getActiveAcademicPlanInstanceId();
}

export function resetAcademicPlanState() {
  if (!canUseLocalStorage()) return;

  window.localStorage.removeItem(ACTIVE_ACADEMIC_PLAN_KEY);
  window.localStorage.removeItem(ARCHIVED_ACADEMIC_PLANS_KEY);
  dispatchAcademicPlanChange();
}
