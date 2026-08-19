import { Button } from "../../../../components/ui";

import { ActionIcon } from "../../../../components/ui/ActionIcon";
interface CicloPageActionsProps {
  canCreate: boolean;
  disabledReason?: string;
  onCreate: () => void;
}

export default function CicloPageActions({ canCreate, disabledReason, onCreate }: CicloPageActionsProps) {
  return (
    <Button 
      variant="primary" 
      leftIcon={<ActionIcon name="add" />} 
      onClick={onCreate}
      disabled={!canCreate}
      title={!canCreate ? disabledReason : "Crear ciclo de medición"}
    >
      Crear ciclo de medición
    </Button>
  );
}
