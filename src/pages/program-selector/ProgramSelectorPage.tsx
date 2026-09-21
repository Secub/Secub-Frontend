import { useState } from "react";
import CampusMosaic from "../../components/shared/CampusMosaic";
import { ROUTES, navigateToRoute } from "../../app/appRoutes";
import { persistSelectedProgramId } from "../../services/programSelection";
import { normalizeSecubRole, type SecubRole } from "../../config/access/roles";
import { getBrowserSearchParams } from "../../shared/browser";
import type { SecubProgramId } from "../../data/secubAcademicPrograms";
import RoleSelectionSection from "./sections/RoleSelectionSection";
import ProgramSelectionSection from "./sections/ProgramSelectionSection";

type ProgramSelectorStep = "role" | "program";

function getInitialRole(): SecubRole {
  if (typeof window === "undefined") return "director";
  const params = getBrowserSearchParams();
  return normalizeSecubRole(params.get("role") ?? "director");
}

function buildDashboardUrl(role: SecubRole) {
  const params = getBrowserSearchParams();
  params.set("role", role);
  return `${ROUTES.panelDashboard}?${params.toString()}`;
}

export default function ProgramSelectorPage() {
  const [step, setStep] = useState<ProgramSelectorStep>("role");
  const [selectedRole, setSelectedRole] = useState<SecubRole>(() => getInitialRole());

  const handleSelectRole = (role: SecubRole) => {
    setSelectedRole(role);
    setStep("program");
  };

  const handleSelectProgram = (programId: SecubProgramId) => {
    persistSelectedProgramId(programId);
    navigateToRoute(buildDashboardUrl(selectedRole));
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute -inset-5 -z-20 scale-105 blur-[5px]" aria-hidden="true">
        <CampusMosaic hideTitles layout="fill" className="h-full w-full" />
      </div>
      <div className="absolute inset-0 -z-10 bg-black/65" />

      {step === "role" ? (
        <RoleSelectionSection
          onSelectRole={handleSelectRole}
          onBack={() => navigateToRoute(ROUTES.access)}
        />
      ) : (
        <ProgramSelectionSection
          onSelectProgram={handleSelectProgram}
          onBack={() => setStep("role")}
        />
      )}
    </main>
  );
}
