# SECUB Frontend

Frontend de SECUB, plataforma para gestionar el flujo académico, mapear competencias, asignar resultados de aprendizaje y registrar su medición.

## Requisitos

- Node.js 22
- npm 10

## Instalación

```bash
npm ci
cp .env.example .env
npm run dev
```

Por defecto, Vite sirve la aplicación en `http://localhost:5173` y redirige `/api` a `http://localhost:3000`.

## Variables de entorno

| Variable | Descripción | Valor recomendado |
|---|---|---|
| `VITE_API_BASE_URL` | Ruta base del backend | `/api` |
| `VITE_SHOW_DEMO_TOOLS` | Muestra controles exclusivos de demostración | `false` |

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Desarrollo local |
| `npm run typecheck` | Verificación de TypeScript |
| `npm run lint` | Análisis estático |
| `npm run lint:strict` | Análisis estático sin advertencias |
| `npm run test` | Pruebas automáticas |
| `npm run build` | Compilación de producción |
| `npm run preview` | Previsualización del build |

## Estructura principal

```text
src/
├── accessibility/      Preferencias y herramientas de accesibilidad
├── app/                Rutas, guards y navegación
├── components/         Componentes reutilizables
├── config/             Configuración de frontend
├── data/               Catálogos temporales vacíos o de demostración
├── domain/             Contratos y tipos independientes de infraestructura
├── features/           Funcionalidades compartidas del dominio académico
├── infrastructure/     Cliente HTTP y adaptadores de repositorio
├── pages/              Módulos y pantallas
├── services/           Servicios de sesión y persistencia mock
├── shared/             Navegador, feedback, IDs y utilidades transversales
├── styles/             Tokens y estilos globales por responsabilidad
└── test/               Configuración y tipos de pruebas
```

## Roles del frontend simulado

- **Administración:** consulta global, filtros y exportación.
- **Vicerrectoría:** consulta de su seccional.
- **Decanatura:** consulta de su facultad.
- **Dirección de programa:** CRUD académico dentro de su alcance.
- **Docencia:** Dashboard y Medición RA de los cursos asignados.

Los permisos del frontend mejoran la experiencia, pero el backend debe volver a validar rol, alcance institucional y propiedad de cada recurso.

La implementación de la auditoría y sus límites están documentados en [`docs/auditoria/AUDITORIA_IMPLEMENTADA.md`](./docs/auditoria/AUDITORIA_IMPLEMENTADA.md).

## Datos y backend

La versión actual utiliza repositorios mock y persistencia temporal para facilitar el desarrollo. Las pantallas no deben importar almacenamiento del navegador directamente; la integración real debe realizarse mediante repositorios y el cliente HTTP.

La fuente definitiva de IDs, permisos y validaciones debe ser el backend.

## Docker

```bash
docker build -t secub-frontend .
docker run --rm -p 8080:80 secub-frontend
```

Nginx sirve la SPA, redirige `/api` al servicio `secub-backend:3000` y expone `/healthz`.

## Flujo de calidad

Antes de subir cambios:

```bash
npm run typecheck
npm run lint:strict
npm run test
npm run build
```

El workflow de GitHub Actions ejecuta los mismos pasos en `main`, `test`, ramas `dev/**` y pull requests.

## Convenciones

- TypeScript estricto.
- Componentes funcionales.
- Reglas de dominio en funciones puras.
- Acceso a datos mediante servicios o repositorios.
- No usar `window.alert` o `window.confirm` en nuevas funcionalidades.
- No duplicar filtros, exportadores, validadores o generadores de IDs.
- Mantener estados de carga, vacío y error.
- Las acciones no autorizadas se ocultan; no se muestran explicaciones del rol en las pantallas.

## Documentación adicional

- [Implementación de la auditoría](./docs/auditoria/AUDITORIA_IMPLEMENTADA.md)
- [Reporte original de auditoría](./docs/auditoria/REPORTE_AUDITORIA_FRONTEND.md)
- [Guía vigente de roles simulados](./docs/roles/SIMULACRO_ROLES_GUIA.md)
