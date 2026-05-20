import MapeoCompetenciasCardInfoNucleos from "./MapeoCompetenciasCardInfoNucleos";
import NucleosManager from "./NucleosManager";
import type { CursoAsis, NucleoFormacion } from "../MapeoCompetencias.types";

interface MapeoCompetenciasNucleosStepProps {
  nucleosDraft: Record<number, NucleoFormacion | null>;
  canManage: boolean;
  totalSemestres: number;
  coursesBySemester: Record<number, CursoAsis[]>;
  programaNombre?: string;
  classificationComplete: boolean;
  onNucleoChange: (semestre: number, nucleo: NucleoFormacion) => void;
  onSave: () => void;
  onContinue: () => void;
}

export default function MapeoCompetenciasNucleosStep({
  nucleosDraft,
  canManage,
  totalSemestres,
  coursesBySemester,
  programaNombre,
  classificationComplete,
  onNucleoChange,
  onSave,
  onContinue,
}: MapeoCompetenciasNucleosStepProps) {
  return (
    <div className="space-y-6">
      <MapeoCompetenciasCardInfoNucleos />
      <NucleosManager
        value={nucleosDraft}
        disabled={!canManage}
        totalSemestres={totalSemestres}
        coursesBySemester={coursesBySemester}
        programaNombre={programaNombre}
        classificationComplete={classificationComplete}
        onChange={onNucleoChange}
        onSave={onSave}
        onContinue={onContinue}
      />
    </div>
  );
}
