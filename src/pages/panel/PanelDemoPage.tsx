import { GoEye, GoPencil, GoPlus, GoSearch, GoTrash } from "react-icons/go";
import {
  Badge,
  Button,
  Input,
  Select,
  Table,
  type TableAction,
  type TableColumn,
} from "../../components/ui";

type UserRole = "admin" | "director" | "docente";

interface CompetenciaRow {
  id: string;
  nombre: string;
  tipo: "Genérica" | "Específica";
  facultad: string;
  estado: "Activa" | "Inactiva" | "Pendiente";
}

let currentUserRole: UserRole = "director";

function hasRole(...roles: UserRole[]) {
  return roles.includes(currentUserRole);
}

const rows: CompetenciaRow[] = [
  {
    id: "COMP-001",
    nombre: "Pensamiento Crítico",
    tipo: "Genérica",
    facultad: "Todas",
    estado: "Activa",
  },
  {
    id: "COMP-002",
    nombre: "Diseño de Software",
    tipo: "Específica",
    facultad: "Ingeniería",
    estado: "Pendiente",
  },
  {
    id: "COMP-003",
    nombre: "Comunicación Escrita",
    tipo: "Genérica",
    facultad: "Todas",
    estado: "Inactiva",
  },
];

const columns: TableColumn<CompetenciaRow>[] = [
  {
    key: "id",
    title: "ID",
    render: (row) => (
      <span className="font-semibold text-[var(--color-secondary-4)]">
        {row.id}
      </span>
    ),
  },
  {
    key: "nombre",
    title: "Nombre de la competencia",
    render: (row) => row.nombre,
  },
  {
    key: "tipo",
    title: "Tipo",
    render: (row) => (
      <Badge variant={row.tipo === "Específica" ? "info" : "neutral"}>
        {row.tipo}
      </Badge>
    ),
  },
  {
    key: "facultad",
    title: "Facultad",
    render: (row) => row.facultad,
  },
  {
    key: "estado",
    title: "Estado",
    render: (row) => {
      const variant =
        row.estado === "Activa"
          ? "success"
          : row.estado === "Pendiente"
            ? "warning"
            : "danger";

      return <Badge variant={variant}>{row.estado}</Badge>;
    },
  },
];

const actions: TableAction<CompetenciaRow>[] = [
  {
    key: "view",
    label: "Ver",
    icon: <GoEye className="text-lg" />,
    onClick: (row) => console.log("Ver", row),
    show: (_row) => hasRole("docente"),
  },
  {
    key: "edit",
    label: "Editar",
    icon: <GoPencil className="text-lg" />,
    onClick: (row) => console.log("Editar", row),
    show: (_row) => hasRole("admin", "director"),
  },
  {
    key: "delete",
    label: "Eliminar",
    icon: <GoTrash className="text-lg" />,
    onClick: (row) => console.log("Eliminar", row),
    show: (_row) => hasRole("admin"),
    variant: "danger",
  },
];

export default function PanelDemoPage() {
  return (
    <main className="min-h-screen bg-[var(--color-surface)]">
      <div className="container-secub py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-[var(--color-secondary-4)]">
              Gestión de competencias
            </h1>
            <p className="mt-2 text-sm text-[var(--color-gray-3)]">
              Vista demo para validar componentes base de la plataforma.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<GoPlus className="text-lg" />}
          >
            Nueva competencia
          </Button>
        </div>

        <div className="surface-card mb-6 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Buscar"
              placeholder="Buscar por nombre o ID"
              leftIcon={<GoSearch className="text-[18px]" />}
            />

            <Select
              label="Facultad"
              placeholder="Todas las facultades"
              options={[
                { label: "Todas", value: "todas" },
                { label: "Ingeniería", value: "ingenieria" },
                { label: "Ciencias Económicas", value: "economicas" },
              ]}
            />

            <Select
              label="Tipo"
              placeholder="Todos los tipos"
              options={[
                { label: "Genérica", value: "generica" },
                { label: "Específica", value: "especifica" },
              ]}
            />

            <Select
              label="Estado"
              placeholder="Todos los estados"
              options={[
                { label: "Activa", value: "activa" },
                { label: "Pendiente", value: "pendiente" },
                { label: "Inactiva", value: "inactiva" },
              ]}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="primary">Aplicar filtros</Button>
            <Button variant="outline">Limpiar</Button>
          </div>
        </div>

        <Table
          columns={columns}
          data={rows}
          actions={actions}
          rowKey={(row) => row.id}
          emptyMessage="No se encontraron competencias."
        />
      </div>
    </main>
  );
}
