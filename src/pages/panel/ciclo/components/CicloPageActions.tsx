import { GoPlus } from "react-icons/go";
import { Button } from "../../../../components/ui";

interface CicloPageActionsProps {
  canCreate: boolean;
  onCreate: () => void;
}

export default function CicloPageActions({ canCreate, onCreate }: CicloPageActionsProps) {
  return (
    <Button 
      variant="primary" 
      leftIcon={<GoPlus className="text-lg" />} 
      onClick={onCreate}
      disabled={!canCreate}
    >
      Crear ciclo de medición
    </Button>
  );
}
