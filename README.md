# SECUB Frontend

Frontend de SECUB (Sistema de Evaluación Curricular Bonaventuriano), la plataforma de la Universidad de San Buenaventura para gestionar el flujo académico: perfil de egreso, propósito de formación, competencias y resultados de aprendizaje (RA), mapeo de competencias, ciclos de medición, asignación y medición de RA, planes de mejora y reportes.

Es una aplicación de página única (SPA) que consume la API REST del backend de SECUB.

## Enlaces

| Recurso | Enlace |
|---|---|
| Producción | https://secub.apps-mind.com/ |
| Documentación de la API (Swagger) | https://secub.apps-mind.com/api/docs |
| GitHub Pages (solo visual, sin backend) | https://secub.github.io/Secub-Frontend/ |

## Requisitos

- Node.js 22.13.0 (`.nvmrc`; rango permitido `>=22.13.0 <23`)
- npm 10.9.2 (único gestor de paquetes del proyecto)
- Backend de SECUB escuchando en `http://localhost:3000` para usar el panel en local

## Instalación

```bash
nvm use
npm ci
cp .env.example .env
npm run dev
```

Vite sirve la aplicación en `http://localhost:5173` y redirige `/api` y `/auth` a `http://localhost:3000`, de modo que la cookie de sesión funciona sin configurar CORS.

## Variables de entorno

| Variable | Descripción | Valor recomendado |
|---|---|---|
| `VITE_API_BASE_URL` | Ruta base de la API REST | `/api` |

Toda variable con prefijo `VITE_` llega al navegador: nunca se guardan secretos en ella. Solo `.env.example` se versiona.

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Desarrollo local con recarga en caliente |
| `npm run typecheck` | Verificación de TypeScript |
| `npm run lint` | Análisis estático |
| `npm run lint:strict` | Análisis estático sin advertencias (el que usa el CI) |
| `npm test` | Pruebas automáticas, una vez |
| `npm run test:watch` | Pruebas en modo observación |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Previsualización del build |

## Estructura principal

```text
src/
├── accessibility/      Preferencias y menú de accesibilidad
├── app/                Rutas, guardas de acceso y navegación
├── assets/             Logos e imágenes
├── components/         ui/ (componentes base), panel/ (estructura del panel), shared/
├── config/             API, roles, permisos, flujo académico y marca de reportes
├── domain/             Contratos y tipos independientes de la infraestructura
├── features/           Funcionalidades compartidas (filtros de alcance académico)
├── infrastructure/     Cliente HTTP y errores de la API
├── pages/              landing/, access/, program-selector/ y panel/<módulo>/
├── services/           Clientes de la API por recurso y sesión
├── shared/             Navegador, avisos, identificadores
├── styles/             Tokens y estilos globales
└── test/               Configuración de pruebas
```

## Acceso y roles

El inicio de sesión es institucional con Microsoft y está habilitado para las seccionales **Cali, Bogotá y Cartagena**; Medellín muestra "Acceso próximamente". La sesión se mantiene con una cookie HTTP del backend y se cierra tras 30 minutos de inactividad.

| Rol | Alcance |
|---|---|
| Administrador | Consulta global; único rol que filtra por seccional. |
| Rector | Consulta de su seccional. |
| Vicerrector | Consulta de su seccional. |
| Decano | Consulta de su seccional y facultad. |
| Dirección de programa | Crea, edita y elimina la información académica y los ciclos de su programa. |
| Docente | Registra la medición de RA de sus cursos. |

Los permisos del frontend solo ocultan opciones y limitan rutas; el backend vuelve a validar rol, alcance institucional y propiedad de cada recurso. Detalle en [`docs/roles/GUIA_ROLES.md`](./docs/roles/GUIA_ROLES.md).

## Datos y backend

Los servicios de `src/services/` llaman a la API real mediante `httpClient` (`src/infrastructure/api/`). El contrato está en el Swagger y resumido en [`docs/BACKEND_INTEGRATION.md`](./docs/BACKEND_INTEGRATION.md).

## Docker

```bash
docker build -t secub-frontend --build-arg VITE_API_BASE_URL=/api .
docker run --rm -p 8080:80 secub-frontend
```

Nginx sirve la SPA, redirige `/api` y `/auth` al servicio `secub-backend:3000`, añade cabeceras de seguridad y expone `/healthz`.

## Flujo de calidad

Antes de abrir un pull request:

```bash
npm run typecheck && npm run lint:strict && npm test && npm run build
```

El workflow "Frontend CI" ejecuta los mismos pasos en `main`, `test`, ramas `dev/**` y pull requests. La publicación en GitHub Pages también los ejecuta antes de desplegar.

## Convenciones

- TypeScript estricto y componentes funcionales.
- Reglas de dominio en funciones puras, con pruebas junto al archivo (`*.test.ts(x)`).
- Acceso a datos solo mediante servicios.
- Colores a través de los tokens de `src/styles/tokens.css`.
- No usar `window.alert` ni `window.confirm`: se usan los avisos de `src/shared/feedback/`.
- Mantener estados de carga, vacío y error.
- Commits con Conventional Commits.

## Documentación adicional

- [Integración con el backend](./docs/BACKEND_INTEGRATION.md)
- [Guía de roles](./docs/roles/GUIA_ROLES.md)
- [Implementación de la auditoría (histórico, 06/2026)](./docs/auditoria/AUDITORIA_IMPLEMENTADA.md)
- [Reporte original de auditoría (histórico, 06/2026)](./docs/auditoria/REPORTE_AUDITORIA_FRONTEND.md)
