# Backend integration

The app currently runs on an **in-browser mock** (`localStorage`). This document
describes the seam that is already in place and the steps to point the frontend
at a real REST API without touching feature code page-by-page.

## Current state

| Layer | File | Role |
| --- | --- | --- |
| Contract | `src/domain/repositories/CrudRepository.ts` | `list / getById / create / update / remove`, `PageResult<T>`, `ListQuery` |
| HTTP client | `src/infrastructure/api/httpClient.ts` | `fetch` wrapper: base URL, query builder, JSON/FormData, `Authorization: Bearer`, `ApiError` |
| HTTP repo | `src/infrastructure/repositories/createHttpCrudRepository.ts` | `CrudRepository` backed by `httpClient` |
| Mock repo | `src/infrastructure/repositories/createMockCrudRepository.ts` | `CrudRepository` backed by `mockBackend` |
| **Switch** | `src/infrastructure/repositories/createCrudRepository.ts` | Returns mock or HTTP repo per `USE_MOCK_BACKEND` |
| Auth seam | `src/services/auth/authProvider.ts` | Single place that supplies the access token to `httpClient` |
| Config | `src/config/api.config.ts` | `API_BASE_URL`, `USE_MOCK_BACKEND` |

`USE_MOCK_BACKEND` is `true` unless `VITE_USE_MOCK_BACKEND=false`.

## Switching to the real API

1. **Environment.** Set in `.env`:
   ```
   VITE_API_BASE_URL=https://api.example.org
   VITE_USE_MOCK_BACKEND=false
   ```
2. **Auth.** Implement `resolveAccessToken()` in `src/services/auth/authProvider.ts`
   to return the session token. Replace the `?role=` identity in
   `src/services/auth/mockUser.ts` with the authenticated user. Client-side role
   checks (`src/config/access/permissions.ts`, route guards) stay as UX
   affordances only — the API must enforce authorization on every mutating
   endpoint.
3. **Wire resources.** For each entity, call `createCrudRepository` instead of
   importing `mockBackend`:
   ```ts
   import { createCrudRepository } from "../../infrastructure/repositories";
   import { getCurrentMockUser } from "../../services/auth/mockUser";

   const perfilEgresoRepo = createCrudRepository<PerfilEgreso>(
     { entity: "perfilEgreso", resourcePath: "/perfiles-egreso" },
     getCurrentMockUser,
   );
   ```
   With `USE_MOCK_BACKEND=true` this is byte-for-byte the current behaviour, so
   resources can be migrated one at a time behind the flag.

## API contract expected by `createHttpCrudRepository`

| Method | Request | Response |
| --- | --- | --- |
| `list` | `GET /{resource}?page&pageSize&search&<filters>` | `{ items: T[], total, page, pageSize }` |
| `getById` | `GET /{resource}/{id}` | `T` |
| `create` | `POST /{resource}` body `TCreate` | `T` |
| `update` | `PATCH /{resource}/{id}` body `TUpdate` | `T` |
| `remove` | `DELETE /{resource}/{id}` | `204` |

Errors: non-2xx returns `{ message: string, code?: string }`; surfaced as `ApiError`.

## Entities and the files that still import `mockBackend` directly

Migrate these to `createCrudRepository` (or a feature repository built on it):

- **perfilEgreso** — `pages/panel/perfil-egreso/hooks/usePerfilEgresoPage.ts`
- **propositosFormacion** — `pages/panel/proposito-formacion/hooks/usePropositoFormacionPage.ts`
- **competenciasRa** — `pages/panel/competencias-ra/hooks/useCompetenciasRAPage.ts`, `useCompetenciasRAActions.ts`
- **mapeosCompetencias** — `pages/panel/mapeo-competencias/hooks/*`
- **ciclosMedicion** — `pages/panel/ciclo/hooks/useCicloPage.ts`, `ciclo.mock.ts`
- **asignacionesRa** — `pages/panel/asignar-ra/hooks/*`
- **medicionesRa** — `pages/panel/medicion-ra/hooks/*`, `utils/medicionRA.assignments.ts`
- **planesMejora** — `pages/panel/dashboard/hooks/useDashboardImprovementPlan.ts`
- Dashboard aggregation — `pages/panel/dashboard/hooks/useDashboardData.ts`, `dashboard.mock.ts`
- Academic-workflow layer — `components/panel/academicWorkflow.repository.ts`, `academicWorkflow.hooks.ts`
- Dev tools (mock-only, no migration needed) — `DevRoleSelector.tsx`, `SidebarRoleSwitcher.tsx`, `useMockBackendVersion.ts`, `demoSeed.ts`

A data-fetching library (React Query / SWR) should be introduced with the first
migrated resource so loading/error/retry conventions are set once.
