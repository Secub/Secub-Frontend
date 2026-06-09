import { getCurrentMockUser } from "../../../../services/auth/mockUser";
import { getCatalogs } from "../../competencias-ra/CompetenciasRa.mock";

export const asignarRACurrentUser = getCurrentMockUser();
export const asignarRAAcademicCatalogs = getCatalogs();
