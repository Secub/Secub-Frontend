import { GoPlus } from "react-icons/go";
import { Button } from "../../../../components/ui";

interface CicloPageActionsProps {
  canCreate: boolean;
  disabledReason?: string;
  onCreate: () => void;
}

export default function CicloPageActions({ canCreate, disabledReason, onCreate }: CicloPageActionsProps) {
  return (
    <Button 
      variant="primary" 
      leftIcon={<GoPlus className="text-lg" />} 
      onClick={onCreate}
      disabled={!canCreate}
      title={!canCreate ? disabledReason : "Crear ciclo de medición"}
    >
      Crear ciclo de medición
    </Button>
  );
}
