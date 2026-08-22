# Reporte tecnico de auditoria frontend

Fecha de revision: 2026-06-17  

## 1. Resumen general

El frontend tiene una base funcional y relativamente consistente: usa TypeScript estricto, Vite, React, Tailwind, componentes UI propios, pruebas de algunos componentes y una capa mock basada en `localStorage`. Tambien se observan buenas decisiones puntuales, como utilidades de accesibilidad, pruebas de contraste, componentes de formulario reutilizables y separacion parcial por modulos de pagina.

El riesgo general del codigo es **medio-alto**. Los principales riesgos no estan en seguridad backend ni persistencia real, sino en mantenibilidad, navegacion, accesibilidad, rendimiento inicial y duplicidad de logica. El proyecto esta creciendo alrededor de paginas academicas con reglas similares, pero varias reglas de formularios, filtros, exportaciones y persistencia se repiten por modulo. Esto aumenta el costo de corregir errores y hace mas probable que una mejora se aplique en un flujo y quede pendiente en otro.

Problemas principales encontrados:

- Enrutamiento manual con `window.location`, rutas hardcodeadas y carga ansiosa de todas las paginas.
- Componentes grandes con demasiadas responsabilidades, especialmente `PanelSidebar` y `academicWorkflow`.
- Duplicidad alta entre formularios, filtros, hooks y utilidades de `perfil-egreso`, `proposito-formacion` y `competencias-ra`.
- Modal base sin focus trap completo, lo que afecta accesibilidad por teclado.
- Riesgos de navegacion responsive en el panel: el sidebar se oculta en pantallas menores a `xl` y no se confirma una alternativa equivalente.
- Estilos globales muy grandes y variables CSS usadas pero no definidas.
- Uso frecuente de `window.alert`, `window.confirm`, `window.location`, `localStorage` y `document` dentro de componentes/hooks.
- Activos visuales grandes y ausencia de lazy loading/responsive images en varias imagenes.
- Validaciones frontend repetidas y algunas debiles, especialmente en formularios academicos y carga de evidencias.

## 2. Archivos revisados

Por volumen, los archivos se agrupan por modulo. Se revisaron archivos de configuracion, codigo fuente bajo `src`, pruebas, estilos y assets referenciados.

| Archivo o patron | Contenido revisado |
|---|---|
| `package.json` | Scripts, dependencias, librerias UI, testing y tooling. |
| `package-lock.json`, `pnpm-lock.yaml` | Locks de dependencias; se detecta coexistencia de administradores. |
| `vite.config.ts` | Configuracion Vite, base path, plugins React, React Compiler, Tailwind y Vitest. |
| `eslint.config.js` | Reglas ESLint, React Hooks, TypeScript y severidades. |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | Configuracion TypeScript, strict mode, no emit y referencias. |
| `index.html` | Idioma inicial, titulo, favicon y raiz de montaje. |
| `README.md` | Documentacion del proyecto; conserva contenido base de Vite. |
| `Dockerfile`, `nginx.conf` | Build estatico y fallback SPA. |
| `.github/workflows/*.yml` | CI, Pages y comandos de instalacion/build. |
| `src/main.tsx` | Bootstrap React, imports globales de fuentes y asignacion de idioma. |
| `src/index.css` | Tokens, utilidades, estilos globales, estilos de componentes y responsive. |
| `src/vite-env.d.ts`, `src/test/setup.ts` | Tipos de Vite y setup de pruebas. |
| `src/app/AppRouter.tsx` | Router manual, redirecciones, seleccion de pagina y control de sesion. |
| `src/app/appRoutes.ts` | Constantes de rutas, base path y normalizacion. |
| `src/app/panelRoutePermissions.ts` | Permisos visuales por rol para rutas del panel. |
| `src/accessibility/*` | Menu de accesibilidad, hooks de preferencias y pruebas. |
| `src/components/ui/*` | Botones, modales, formularios, tablas, breadcrumbs, progreso, perfiles y utilidades UI. |
| `src/components/panel/*` | Sidebar, header, usuario actual, permisos, workflow academico y selectores. |
| `src/components/icons/*` | Iconografia propia del dominio. |
| `src/pages/landing/*` | Landing, hero, secciones, header, footer, mosaico de campus y accesibilidad inicial. |
| `src/pages/access/*` | Pagina de acceso y rol de desarrollo. |
| `src/pages/program-selector/*` | Selector de programa academico y pruebas asociadas. |
| `src/pages/panel/user-settings/*` | Pagina de configuracion de usuario. |
| `src/pages/panel/dashboard/*` | Dashboard, mock data, calculos, paneles de resultados y acciones. |
| `src/pages/panel/plan-estudios/*` | Listado, formularios, hooks, exportaciones y modales de plan de estudios. |
| `src/pages/panel/proposito-formacion/*` | CRUD mock, filtros, formularios, exportacion y hooks. |
| `src/pages/panel/perfil-egreso/*` | CRUD mock, filtros, formularios, exportacion y hooks. |
| `src/pages/panel/competencias-ra/*` | Competencias, resultados de aprendizaje, ciclos, filtros, formularios y utilidades. |
| `src/pages/panel/mapeo-competencias/*` | Flujo de mapeo, pasos, matriz, exportacion, hooks y estilos de progreso. |
| `src/pages/panel/medicion-ra/*` | Medicion de RA, persistencia mock, evaluacion de estudiantes, evidencias y progreso. |
| `src/services/mockBackend.service.ts` | Persistencia local mock, CRUD, filtros por usuario/rol y cascadas simuladas. |
| `src/data/secubAcademicPrograms.ts` | Catalogo academico local. |
| `src/types.ts` | Tipos compartidos del dominio frontend. |
| `src/assets/**/*` | Imagenes, logos, iconos y tamanos aproximados de recursos visuales. |

## 3. Malas practicas encontradas

### Hallazgo 1: router manual y rutas hardcodeadas

- **Archivo:** `src/app/AppRouter.tsx`, `src/app/appRoutes.ts`
- **Componente/bloque:** `AppRouter`, `ROUTES`, `APP_BASE_PATH`
- **Tipo:** arquitectura frontend, rutas, rendimiento
- **Severidad:** Alto
- **Descripcion:** la navegacion se resuelve con `window.location.pathname`, `window.history.replaceState`, `window.location.search` y un `switch` manual. Ademas, `APP_BASE_PATH` esta hardcodeado como `/Secub-Frontend`, mientras `vite.config.ts` usa base condicional.
- **Por que es mala practica:** duplica la responsabilidad de un router, dificulta lazy loading, no maneja bien `popstate`, 404, redirecciones declarativas ni pruebas de navegacion.
- **Impacto tecnico:** riesgo de rutas rotas en local/Pages, parametros arrastrados entre pantallas, mayor bundle inicial y mayor costo al agregar nuevas rutas.
- **Recomendacion:** centralizar rutas en una configuracion, derivar el base path de Vite/env y usar lazy loading por pagina. Si se incorpora React Router, migrar a rutas declarativas. Si no se incorpora, crear un router interno con escucha de `popstate`, 404 y whitelist de query params.

### Hallazgo 2: navegacion del panel oculta en pantallas menores a `xl`

- **Archivo:** `src/components/panel/PanelSidebar.tsx`
- **Componente/bloque:** `PanelSidebar`
- **Tipo:** responsive design, accesibilidad, navegacion
- **Severidad:** Alto
- **Descripcion:** el sidebar usa clases equivalentes a `hidden ... xl:flex`, por lo que la navegacion principal del panel desaparece en tablets/moviles. No se confirma una alternativa equivalente de menu movil.
- **Por que es mala practica:** una aplicacion operativa necesita navegacion disponible por teclado y pantallas pequenas.
- **Impacto tecnico:** usuarios en dispositivos medianos o pequenos pueden quedar sin forma clara de navegar entre modulos del panel.
- **Recomendacion:** agregar drawer/menu movil accesible, reutilizando la misma fuente de items del sidebar y con foco controlado.
- **Nota:** la ausencia total de alternativa requiere validacion manual visual en navegador.

### Hallazgo 3: componente sidebar con demasiadas responsabilidades

- **Archivo:** `src/components/panel/PanelSidebar.tsx`
- **Componente/bloque:** `PanelSidebar`, `getInitialSidebarWidth`, construccion de items, resizing, workflow, usuario
- **Tipo:** arquitectura, mantenibilidad
- **Severidad:** Alto
- **Descripcion:** el archivo concentra navegacion, permisos visuales, progreso academico, redimensionamiento, persistencia de ancho, datos de usuario, accion de iniciar plan y renderizado completo.
- **Por que es mala practica:** mezcla logica de dominio, layout, interaccion y persistencia local en un solo componente grande.
- **Impacto tecnico:** dificulta pruebas, incrementa renderizados y vuelve riesgoso modificar la navegacion.
- **Recomendacion:** extraer `useResizableSidebar`, `usePanelNavigationItems`, `PanelSidebarProgress`, `PanelSidebarUser` y un componente de item.

### Hallazgo 4: modal base sin focus trap completo

- **Archivo:** `src/components/ui/Modal.tsx`
- **Componente/bloque:** `Modal`
- **Tipo:** accesibilidad
- **Severidad:** Alto
- **Descripcion:** el modal tiene `role="dialog"` y cierre con Escape, pero no implementa focus trap, foco inicial robusto, retorno de foco al disparador, scroll lock ni ocultamiento/inert del fondo.
- **Por que es mala practica:** los dialogos modales deben retener el foco mientras estan abiertos y devolverlo al cerrar.
- **Impacto tecnico:** navegacion por teclado inconsistente, lectores de pantalla pueden interactuar con contenido de fondo.
- **Recomendacion:** implementar trap de foco o usar una libreria accesible de dialog. Reutilizar buenas practicas ya presentes en `WorkflowCompletionAlert`.

### Hallazgo 5: duplicidad entre modulos academicos

- **Archivo:** `src/pages/panel/perfil-egreso/*`, `src/pages/panel/proposito-formacion/*`, `src/pages/panel/competencias-ra/*`
- **Componente/bloque:** hooks de pagina, modales de formulario, utilidades de filtros/exportacion
- **Tipo:** duplicidad, mantenibilidad
- **Severidad:** Alto
- **Descripcion:** hay patrones casi identicos para filtros, opciones academicas encadenadas, validaciones, modales CRUD, exportacion CSV/PDF y generacion de IDs.
- **Por que es mala practica:** la misma regla debe cambiarse en varios lugares y se pueden crear inconsistencias funcionales.
- **Impacto tecnico:** mayor costo de mantenimiento, bugs divergentes entre pantallas y pruebas repetidas.
- **Recomendacion:** extraer hooks y utilidades compartidas: `useAcademicScopeFilters`, `useAcademicCrudModal`, `buildAcademicOptions`, `downloadCsv`, `printHtmlReport`, `createClientId`.

### Hallazgo 6: `academicWorkflow` concentra reglas y acceso a datos

- **Archivo:** `src/components/panel/academicWorkflow.ts`
- **Componente/bloque:** calculo de pasos, completitud, clones heredados, acceso a `mockBackend`
- **Tipo:** arquitectura, logica dificil de probar
- **Severidad:** Alto
- **Descripcion:** el archivo mezcla reglas de avance academico, lectura de datos mock, etiquetas UI, compatibilidad y hooks en mas de 500 lineas.
- **Por que es mala practica:** las reglas de negocio frontend quedan acopladas a la fuente de datos y al render del panel.
- **Impacto tecnico:** dificil aislar pruebas unitarias, modificar pasos o reutilizar reglas en otras vistas.
- **Recomendacion:** separar reglas puras, adaptadores de datos mock y hooks React. Mantener las funciones puras sin acceso directo a `localStorage`.

### Hallazgo 7: valor controlado invalido en selector de mapeo

- **Archivo:** `src/pages/panel/mapeo-competencias/MapeoCompetenciasSemesterStep.tsx`
- **Componente/bloque:** selector de nivel de competencia
- **Tipo:** bug UI/formulario
- **Severidad:** Alto
- **Descripcion:** cuando no hay nivel seleccionado, el valor controlado puede ser el texto `"Selecciona una opcion"` en vez de `""`, aunque ese valor no pertenece a las opciones del select.
- **Por que es mala practica:** un select controlado debe recibir un valor valido o vacio.
- **Impacto tecnico:** estados visuales inconsistentes, placeholder que puede no comportarse como placeholder real y validacion confusa.
- **Recomendacion:** usar `""` como valor no seleccionado y dejar el texto solo como placeholder.

### Hallazgo 8: variables CSS usadas pero no definidas

- **Archivo:** `src/index.css`, `src/pages/panel/mapeo-competencias/MapeoCompetenciasSemesterStep.tsx`
- **Componente/bloque:** tokens CSS globales
- **Tipo:** estilos, mantenibilidad
- **Severidad:** Medio-Alto
- **Descripcion:** se usan variables como `--radius-2xl` y `--color-secondary-5`, pero no se encontraron definidas en los tokens globales.
- **Por que es mala practica:** los estilos dependen de valores inexistentes y pueden caer a valores invalidos.
- **Impacto tecnico:** bordes/radios inconsistentes, diferencias visuales entre navegadores y dificultad para mantener el tema.
- **Recomendacion:** completar tokens faltantes o reemplazar usos por tokens existentes.

### Hallazgo 9: estilos globales monoliticos

- **Archivo:** `src/index.css`
- **Componente/bloque:** CSS global completo
- **Tipo:** estilos, organizacion
- **Severidad:** Medio
- **Descripcion:** el archivo supera las 1000 lineas y mezcla tokens, utilidades, estilos de accesibilidad, panel, alertas, menus y componentes especificos.
- **Por que es mala practica:** aumenta el riesgo de cascadas inesperadas y hace dificil saber donde modificar un estilo.
- **Impacto tecnico:** cambios visuales fragiles, duplicidad de clases y mayor costo de revision.
- **Recomendacion:** separar por capas: `tokens.css`, `base.css`, `accessibility.css`, `panel.css` y estilos locales por componente cuando aplique.

### Hallazgo 10: carga ansiosa de paginas y recursos pesados

- **Archivo:** `src/app/AppRouter.tsx`, `src/pages/landing/components/CampusMosaic.tsx`, `src/pages/landing/components/AboutSection.tsx`, `src/assets/**/*`
- **Componente/bloque:** imports de paginas, imagenes landing/campus
- **Tipo:** rendimiento
- **Severidad:** Medio-Alto
- **Descripcion:** todas las paginas principales se importan de forma estatica. Ademas, varias imagenes pesan cientos de KB o mas de 1 MB y no se observa uso consistente de `loading`, `decoding`, `srcset` o formatos responsive.
- **Por que es mala practica:** el usuario descarga codigo e imagenes antes de necesitarlos.
- **Impacto tecnico:** peor tiempo de carga inicial y mayor consumo de ancho de banda, especialmente movil.
- **Recomendacion:** aplicar `React.lazy`/`Suspense` por ruta y optimizar imagenes con variantes responsive y lazy loading para recursos no criticos.

### Hallazgo 11: estrategia de fuentes inconsistente

- **Archivo:** `src/main.tsx`, `src/index.css`
- **Componente/bloque:** imports de `@fontsource` y `@import` de Google Fonts
- **Tipo:** rendimiento, estilos
- **Severidad:** Medio
- **Descripcion:** el bootstrap importa Poppins/Lato desde paquetes locales, mientras el CSS global importa Onest desde Google Fonts.
- **Por que es mala practica:** mezcla estrategias de carga de fuentes y puede bloquear render o cargar familias no usadas.
- **Impacto tecnico:** mas requests, CSS bloqueante y mayor peso inicial.
- **Recomendacion:** definir una sola estrategia de tipografia y eliminar imports no usados.

### Hallazgo 12: uso frecuente de APIs globales dentro de UI/hooks

- **Archivo:** multiples, especialmente `AppRouter.tsx`, hooks de paginas, `dashboard.utils.ts`, `mockBackend.service.ts`, `useInactivityLogout.ts`
- **Componente/bloque:** `window.alert`, `window.confirm`, `window.location`, `localStorage`, `document`
- **Tipo:** testabilidad, UX, arquitectura
- **Severidad:** Medio
- **Descripcion:** varias acciones de UI usan APIs globales directamente.
- **Por que es mala practica:** dificulta pruebas, genera UX inconsistente y acopla logica a navegador.
- **Impacto tecnico:** mas mocks en tests, menor control de errores visuales y dificultad para migrar a patrones declarativos.
- **Recomendacion:** crear servicios/adaptadores: `storageClient`, `navigationClient`, `toast/dialog service` y wrappers de descarga.

### Hallazgo 13: generacion de IDs no deterministica y potencialmente colisionable

- **Archivo:** `src/pages/panel/perfil-egreso/*.ts`, `src/pages/panel/proposito-formacion/*.ts`, `src/pages/panel/competencias-ra/*.ts`
- **Componente/bloque:** creacion de registros mock
- **Tipo:** datos frontend, pruebas
- **Severidad:** Medio
- **Descripcion:** se usan patrones con `Math.random().toString(36)` y `Date.now()` para IDs.
- **Por que es mala practica:** puede colisionar en operaciones rapidas y dificulta pruebas deterministicas.
- **Impacto tecnico:** registros duplicados improbables pero posibles; snapshots y pruebas menos estables.
- **Recomendacion:** usar `crypto.randomUUID()` con fallback centralizado.

### Hallazgo 14: validaciones de formularios repetidas

- **Archivo:** `PerfilEgresoFormModal.tsx`, `PropositoFormModal.tsx`, `CompetenciasRaFormModal.tsx`, modales de plan y medicion
- **Componente/bloque:** validacion local y mensajes de error
- **Tipo:** formularios, mantenibilidad
- **Severidad:** Medio-Alto
- **Descripcion:** reglas de campos obligatorios, opciones dependientes, scroll al error y mensajes se implementan por formulario.
- **Por que es mala practica:** crea divergencia de mensajes y comportamiento.
- **Impacto tecnico:** errores visuales inconsistentes y mas esfuerzo para agregar una nueva regla.
- **Recomendacion:** crear utilidades de validacion compartidas o un hook por tipo de formulario academico.

### Hallazgo 15: carga de evidencias guarda solo nombre de archivo

- **Archivo:** `src/pages/panel/medicion-ra/components/EvidenceImprovementSection.tsx`, utilidades de medicion
- **Componente/bloque:** input de archivo/evidencias
- **Tipo:** formularios, UX
- **Severidad:** Medio
- **Descripcion:** la evidencia parece almacenar el nombre del archivo, no el archivo ni metadatos robustos. La validacion se apoya principalmente en extension/nombre.
- **Por que es mala practica:** el usuario puede interpretar que el archivo se conserva, cuando el frontend solo simula la seleccion.
- **Impacto tecnico:** confusion funcional y validacion incompleta del recurso.
- **Recomendacion:** aclarar visualmente que es una simulacion local o guardar metadatos controlados. Validar extension/MIME en frontend donde sea posible.

### Hallazgo 16: persistencia frecuente sin debounce en medicion

- **Archivo:** `src/pages/panel/medicion-ra/hooks/useMedicionRAPersistence.ts`
- **Componente/bloque:** efectos de guardado
- **Tipo:** rendimiento, estado
- **Severidad:** Medio
- **Descripcion:** cambios en evidencias, mejoras, bloqueo y progreso pueden disparar escrituras frecuentes a la capa mock.
- **Por que es mala practica:** serializar colecciones en `localStorage` en cada cambio puede ser costoso y generar estados intermedios dificiles de rastrear.
- **Impacto tecnico:** peor rendimiento en formularios con texto largo y datos crecientes.
- **Recomendacion:** aplicar debounce, guardado explicito o una cola de persistencia local.

### Hallazgo 17: exportaciones/acciones con `window.alert` y `document.write`

- **Archivo:** `dashboard.utils.ts`, `MapeoCompetencias.export.ts`, utilidades de exportacion de paginas academicas`
- **Componente/bloque:** descargas, print/export y notificaciones
- **Tipo:** UX, testabilidad
- **Severidad:** Medio
- **Descripcion:** algunas acciones usan alertas nativas y ventanas generadas con HTML escrito dinamicamente.
- **Por que es mala practica:** experiencia inconsistente, dificil de testear y dependiente de bloqueadores de popups.
- **Impacto tecnico:** exportaciones pueden fallar silenciosamente o no verse como descarga real.
- **Recomendacion:** centralizar exportaciones en utilidades testeables y usar componentes de feedback propios.

### Hallazgo 18: breadcrumb con ruta hardcodeada sin base path

- **Archivo:** `src/pages/panel/user-settings/UserSettingsPage.tsx`
- **Componente/bloque:** `Breadcrumb`
- **Tipo:** rutas
- **Severidad:** Medio
- **Descripcion:** el breadcrumb usa `href: "/panel/dashboard"` en vez de `ROUTES.panel.dashboard`.
- **Por que es mala practica:** rompe consistencia con el base path usado por la app.
- **Impacto tecnico:** navegacion incorrecta cuando la app vive bajo `/Secub-Frontend`.
- **Recomendacion:** usar siempre constantes de rutas.

### Hallazgo 19: preservacion global de query string entre rutas del panel

- **Archivo:** `src/components/panel/PanelSidebar.tsx`
- **Componente/bloque:** funcion de navegacion `goTo`
- **Tipo:** rutas, estado URL
- **Severidad:** Medio
- **Descripcion:** la navegacion del sidebar puede conservar todo `window.location.search` al cambiar de modulo.
- **Por que es mala practica:** parametros especificos de una pantalla pueden contaminar otra.
- **Impacto tecnico:** estados iniciales inesperados, filtros heredados y URLs confusas.
- **Recomendacion:** preservar solo parametros permitidos, por ejemplo rol/programa si aplican.

### Hallazgo 20: componentes visuales de progreso sin semantica suficiente

- **Archivo:** `src/components/ui/InformativeProgressBar.tsx`, `src/components/ui/SegmentedStepProgress.tsx`
- **Componente/bloque:** barras/stepper
- **Tipo:** accesibilidad
- **Severidad:** Bajo-Medio
- **Descripcion:** los componentes comunican progreso visualmente, pero no siempre exponen `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` o estructura semantica de pasos.
- **Por que es mala practica:** lectores de pantalla pueden no recibir informacion equivalente.
- **Impacto tecnico:** usuarios con tecnologias asistivas reciben menos contexto.
- **Recomendacion:** agregar semantica ARIA y textos ocultos cuando aplique.

### Hallazgo 21: reglas ESLint sin analisis type-aware

- **Archivo:** `eslint.config.js`
- **Componente/bloque:** configuracion TypeScript ESLint
- **Tipo:** calidad estatica
- **Severidad:** Medio
- **Descripcion:** se usa configuracion recomendada, pero no se observan reglas type-aware apoyadas en `parserOptions.project`.
- **Por que es mala practica:** errores como promesas mal usadas, casts inseguros o condiciones innecesarias pueden pasar desapercibidos.
- **Impacto tecnico:** menor cobertura de analisis estatico en una base TypeScript estricta.
- **Recomendacion:** evaluar reglas `recommendedTypeChecked` y reglas de promesas/booleanos, ajustando ruido gradualmente.

### Hallazgo 22: posible codigo/asset no utilizado

- **Archivo:** `src/assets/vite.svg`, `src/assets/react.svg`, `public/icons.svg`, algunos componentes exportados como `Reveal`, `DevRoleSelector`, `SidebarRoleSwitcher`, `UserProfileActionCard`, `InformativeProgressBar`
- **Componente/bloque:** assets y componentes potencialmente no referenciados
- **Tipo:** limpieza, bundle
- **Severidad:** Bajo
- **Descripcion:** hay archivos que parecen no tener referencias directas desde la app actual.
- **Por que es mala practica:** aumenta ruido del repositorio y puede confundir mantenimiento.
- **Impacto tecnico:** bajo, salvo que alguno termine incluido en bundle.
- **Recomendacion:** confirmar con analisis de imports y eliminar solo si no forman parte de flujos futuros. **Requiere validacion manual.**

### Hallazgo 23: coexistencia de `package-lock.json` y `pnpm-lock.yaml`

- **Archivo:** `package-lock.json`, `pnpm-lock.yaml`, workflows
- **Componente/bloque:** administracion de dependencias
- **Tipo:** tooling, mantenibilidad
- **Severidad:** Medio
- **Descripcion:** el repositorio contiene locks de npm y pnpm, mientras CI parece usar npm.
- **Por que es mala practica:** dos locks pueden divergir y producir instalaciones distintas.
- **Impacto tecnico:** errores entre entornos locales/CI y dificultad para reproducir builds.
- **Recomendacion:** elegir oficialmente npm o pnpm y conservar un solo lock.

### Hallazgo 24: idioma inicial y metadata generica

- **Archivo:** `index.html`, `src/main.tsx`
- **Componente/bloque:** `<html lang>`, titulo
- **Tipo:** accesibilidad, SEO tecnico
- **Severidad:** Bajo-Medio
- **Descripcion:** `index.html` declara `lang="en"` y titulo generico, aunque `main.tsx` cambia el idioma a `es` al ejecutar JavaScript.
- **Por que es mala practica:** antes de hidratar, lectores de pantalla y crawlers reciben idioma incorrecto.
- **Impacto tecnico:** peor accesibilidad inicial y metadata poco descriptiva.
- **Recomendacion:** declarar `lang="es"` y un titulo real directamente en HTML.

### Hallazgo 25: iconografia duplicada por librerias

- **Archivo:** `package.json`, componentes UI/panel
- **Componente/bloque:** `lucide-react`, `react-icons`, iconos propios
- **Tipo:** consistencia UI, rendimiento
- **Severidad:** Bajo-Medio
- **Descripcion:** el proyecto usa mas de una fuente de iconos.
- **Por que es mala practica:** complica consistencia visual y puede aumentar bundle si no se controla tree-shaking.
- **Impacto tecnico:** UI menos uniforme y mayor peso potencial.
- **Recomendacion:** definir una libreria principal y dejar iconos propios solo para simbolos de dominio.

## 4. Antes y despues sugerido

Los siguientes cambios son propuestas documentadas.
### Mejora A: rutas lazy y base path unico

**Antes**

```tsx
const normalizedPath = normalizePathname(window.location.pathname);

switch (normalizedPath) {
  case ROUTES.panel.dashboard:
    page = <DashboardPage />;
    break;
  case ROUTES.panel.planEstudios:
    page = <PlanEstudiosPage />;
    break;
}
```

**Despues sugerido**

```tsx
const DashboardPage = lazy(() => import("../pages/panel/dashboard/DashboardPage"));
const PlanEstudiosPage = lazy(() => import("../pages/panel/plan-estudios/PlanEstudiosPage"));

const routes = [
  { path: ROUTES.panel.dashboard, element: <DashboardPage /> },
  { path: ROUTES.panel.planEstudios, element: <PlanEstudiosPage /> },
  { path: "*", element: <NotFoundPage /> },
];

export function AppRouter() {
  const location = useBrowserLocation();
  const match = matchRoute(routes, normalizePathname(location.pathname));

  return (
    <Suspense fallback={<PageLoadingState />}>
      {match.element}
    </Suspense>
  );
}
```

### Mejora B: select controlado con valor vacio real

**Antes**

```tsx
const nivel = nivelesDraft[key] ?? "Selecciona una opcion";

<Select
  value={nivel}
  placeholder="Selecciona una opcion"
  options={nivelOptions}
  onChange={(event) => updateNivel(key, event.target.value)}
/>
```

**Despues sugerido**

```tsx
const nivel = nivelesDraft[key] ?? "";

<Select
  label={`Nivel para ${competencia.nombre}`}
  hideLabel
  value={nivel}
  placeholder="Selecciona una opcion"
  options={nivelOptions}
  onChange={(event) => updateNivel(key, event.target.value)}
/>
```

### Mejora C: modal con trap de foco

**Antes**

```tsx
<div role="dialog" aria-modal="true" tabIndex={-1}>
  {children}
</div>
```

**Despues sugerido**

```tsx
useEffect(() => {
  if (!open) return;

  const previousActiveElement = document.activeElement as HTMLElement | null;
  const dialog = dialogRef.current;
  const focusable = getFocusableElements(dialog);

  focusable[0]?.focus();

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") onClose();
    if (event.key === "Tab") trapFocus(event, focusable);
  }

  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
    previousActiveElement?.focus();
  };
}, [open, onClose]);
```

### Mejora D: formulario academico reutilizable

**Antes**

```tsx
const updateField = (field: keyof FormState, value: string) => {
  setForm((current) => ({
    ...current,
    [field]: value,
    ...(field === "facultadId" ? { programaId: "", planId: "" } : {}),
    ...(field === "programaId" ? { planId: "" } : {}),
  }));
};
```

**Despues sugerido**

```tsx
const { form, errors, updateScopeField, validate } = useAcademicScopeForm({
  initialValue,
  requiredFields: ["facultadId", "programaId", "planId", "descripcion"],
  catalogs,
});

updateScopeField("facultadId", value);
```

### Mejora E: tokens CSS completos

**Antes**

```css
.panel-card {
  border-radius: var(--radius-2xl);
}
```

**Despues sugerido**

```css
:root {
  --radius-2xl: 28px;
  --color-secondary-5: #e6f0ff;
}

.panel-card {
  border-radius: var(--radius-2xl);
}
```

### Mejora F: imagenes no criticas con lazy loading

**Antes**

```tsx
<img src={campus.image} alt={campus.name} className="campus-card__image" />
```

**Despues sugerido**

```tsx
<img
  src={campus.image}
  alt={campus.name}
  className="campus-card__image"
  loading="lazy"
  decoding="async"
  sizes="(min-width: 1024px) 25vw, 100vw"
/>
```

### Mejora G: persistencia con debounce

**Antes**

```tsx
useEffect(() => {
  mockBackend.upsertMeasurementDraft(draft);
}, [draft]);
```

**Despues sugerido**

```tsx
useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    mockBackend.upsertMeasurementDraft(draft);
  }, 400);

  return () => window.clearTimeout(timeoutId);
}, [draft]);
```

### Mejora H: query params permitidos por ruta

**Antes**

```tsx
window.location.assign(`${href}${window.location.search}`);
```

**Despues sugerido**

```tsx
const allowedParams = pickSearchParams(window.location.search, ["role", "programId"]);
window.location.assign(`${href}${allowedParams}`);
```

### Mejora I: IDs centralizados

**Antes**

```ts
const id = `perfil-${Date.now()}-${Math.random().toString(36).slice(2)}`;
```

**Despues sugerido**

```ts
export function createClientId(prefix: string) {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${id}`;
}
```

## 5. Componentes, funciones o archivos que deberian mejorarse

| Archivo | Componente/Funcion/Bloque | Problema | Recomendacion | Prioridad |
|---|---|---|---|---|
| `src/app/AppRouter.tsx` | `AppRouter` | Router manual, imports ansiosos, redirecciones imperativas | Migrar a router declarativo o router interno con lazy loading, 404 y `popstate` | Alta |
| `src/app/appRoutes.ts` | `APP_BASE_PATH` | Base path hardcodeado | Derivarlo de configuracion Vite/env | Alta |
| `src/components/panel/PanelSidebar.tsx` | `PanelSidebar` | Componente grande y navegacion no confirmada en movil | Separar hooks/subcomponentes y crear drawer movil | Alta |
| `src/components/panel/academicWorkflow.ts` | Reglas de workflow | Mezcla reglas, datos mock y hooks | Separar reglas puras, adaptador y UI hooks | Alta |
| `src/components/ui/Modal.tsx` | `Modal` | Falta focus trap completo | Implementar dialog accesible robusto | Alta |
| `src/pages/panel/mapeo-competencias/MapeoCompetenciasSemesterStep.tsx` | Select de nivel | Valor controlado invalido | Usar `""` como estado vacio y placeholder real | Alta |
| `src/index.css` | Tokens y estilos globales | CSS monolitico y tokens faltantes | Modularizar CSS y completar variables | Media-Alta |
| `src/pages/panel/perfil-egreso/*` | Hooks, forms, utils | Duplicidad con otros modulos | Crear hooks/utilidades compartidas | Alta |
| `src/pages/panel/proposito-formacion/*` | Hooks, forms, utils | Duplicidad con otros modulos | Crear hooks/utilidades compartidas | Alta |
| `src/pages/panel/competencias-ra/*` | Hooks, forms, utils | Duplicidad y logica extensa | Extraer patrones comunes y validadores | Alta |
| `src/pages/panel/medicion-ra/hooks/useMedicionRAPersistence.ts` | Persistencia local | Escrituras frecuentes | Debounce o guardado explicito | Media |
| `src/pages/panel/medicion-ra/components/EvidenceImprovementSection.tsx` | Evidencias | Solo nombre de archivo y validacion debil | Validar mejor y aclarar simulacion local | Media |
| `src/pages/panel/dashboard/components/*` | Paneles de resultados | Agrupacion/render de soportes duplicados | Extraer componente/helper compartido | Media |
| `src/pages/panel/user-settings/UserSettingsPage.tsx` | Breadcrumb | Ruta sin base path | Usar `ROUTES.panel.dashboard` | Media |
| `src/components/ui/InformativeProgressBar.tsx` | Barra de progreso | Semantica ARIA incompleta | Agregar `role`, valores y texto accesible | Media |
| `src/components/ui/SegmentedStepProgress.tsx` | Stepper | Progreso visual sin estructura semantica suficiente | Agregar lista/estado actual/ARIA | Media |
| `src/main.tsx`, `src/index.css` | Fuentes | Mezcla `@fontsource` y Google Fonts | Unificar estrategia tipografica | Media |
| `package.json`, locks | Dependencias | Dos lockfiles y dependencia local incompleta | Elegir gestor unico y reinstalar deps | Media |
| `index.html` | Metadata | `lang="en"` y titulo generico | Cambiar a `es` y titulo de producto | Baja-Media |
| `src/assets/*` | Assets potencialmente no usados | Ruido o peso innecesario | Confirmar referencias antes de eliminar | Baja |

## 6. Problemas de arquitectura frontend

### Componentes demasiado grandes

- `PanelSidebar.tsx` tiene demasiadas responsabilidades: render, permisos visuales, resizing, persistencia local, usuario, workflow y navegacion.
- `academicWorkflow.ts` supera el rol de helper y actua como capa de reglas, consultas mock y hooks.
- Paneles de dashboard y modulos academicos contienen bloques repetidos que podrian vivir en componentes compartidos.

### Componentes con demasiada responsabilidad

- `AppRouter` decide autenticacion visual, permisos, redirecciones, layout y pagina activa.
- Los modales academicos gestionan UI, validacion, cascadas de catalogos y construccion de payload.
- Hooks de pagina como los de perfil/proposito gestionan datos, filtros, modales, confirmaciones y descargas.

### Duplicidad de logica

- Formularios de `perfil-egreso`, `proposito-formacion` y `competencias-ra`.
- Filtros por facultad/programa/plan/ciclo.
- Exportaciones CSV/PDF/print.
- Agrupacion de soportes en paneles de dashboard.
- Generacion de IDs mock.

### Falta de separacion entre logica y presentacion

- Varias pantallas calculan opciones, validan y renderizan en el mismo componente.
- `mockBackend.service.ts` concentra persistencia local y reglas de visibilidad por rol/usuario.
- `dashboard.utils.ts` contiene calculos y side effects de UI como `window.alert`.

### Organizacion de carpetas

La organizacion por pagina es entendible, pero los patrones compartidos aun no se promovieron a una capa comun. Se recomienda crear areas como:

- `src/shared/forms`
- `src/shared/export`
- `src/shared/storage`
- `src/shared/navigation`
- `src/features/academic-scope`

### Imports desordenados o innecesarios

No se detecto un problema sistemico critico, pero la coexistencia de `lucide-react`, `react-icons` e iconos propios sugiere falta de criterio unico de iconografia. Tambien existen assets/componentes potencialmente no usados que requieren validacion manual.

### Codigo muerto o no utilizado

Posibles candidatos:

- `src/assets/vite.svg`
- `src/assets/react.svg`
- `public/icons.svg`
- Componentes exportados que no parecen tener uso directo: `Reveal`, `DevRoleSelector`, `SidebarRoleSwitcher`, `UserProfileActionCard`, `InformativeProgressBar`

Estos elementos **requieren validacion manual** antes de eliminarse.

### Logica dificil de probar

- Navegacion basada en `window.location`.
- Persistencia directa en `localStorage`.
- Alertas/confirmaciones nativas.
- Exportaciones con `window.open` y `document.write`.
- Reglas de workflow acopladas a `mockBackend`.

### Falta de reutilizacion

La reutilizacion visual existe en `src/components/ui`, pero falta reutilizacion de logica de dominio frontend: formularios academicos, filtros, catalogos dependientes, validacion, exportacion y generacion de IDs.

## 7. Problemas de estado y logica

### Uso de `useState`

- Hay estados derivados que podrian calcularse con `useMemo` o helpers puros, especialmente en formularios con opciones dependientes.
- Los modales academicos repiten estado de formulario, errores, filtros y registro seleccionado.
- El estado de ancho de sidebar se persiste localmente, pero su lectura inicial no parece tener el mismo manejo defensivo que otros accesos a storage.

### Uso de `useEffect`

- `AppRouter` y hooks asociados dependen de efectos/imperativos de navegador para redireccion.
- `useMedicionRAPersistence` persiste cambios con efectos que pueden dispararse con frecuencia.
- Algunas acciones de scroll/foco dependen de `requestAnimationFrame`; deben validar preferencias de movimiento reducido cuando impliquen scroll animado.

### Dependencias incompletas o innecesarias

No se confirmo un bug especifico por dependencia incompleta sin ejecutar lint, pero hay patrones que merecen revision:

- Arrays/objetos creados en render y usados como dependencias de `useMemo`.
- Funciones inline pasadas a componentes grandes.
- Logica derivada dentro de componentes que podria estabilizarse con hooks.

### Estados duplicados

- Filtros academicos se duplican en varios modulos.
- Estados de modal CRUD se duplican entre pantallas.
- Estados de validacion y scroll al error se duplican.

### Props innecesarias y prop drilling

No se detecto prop drilling critico global, pero flujos como mapeo/medicion pasan muchas piezas de estado entre pagina, hooks y pasos. Puede mejorar con hooks de feature o contextos locales por flujo.

### Hooks personalizados que podrian extraerse

- `useAcademicScopeFilters`
- `useAcademicFormOptions`
- `useCrudModalState`
- `useDownloadActions`
- `useDebouncedLocalPersistence`
- `useResponsivePanelNavigation`

### Renderizados innecesarios

- `PanelSidebar` recalcula parte de su estructura de navegacion y progreso en cada render.
- Las paginas con tablas/listas grandes pueden recalcular filtros y ordenamientos cuando cambian estados no relacionados.
- El uso de arrays construidos inline puede invalidar memos.

## 8. Problemas de rendimiento

- **Carga inicial grande:** `AppRouter` importa todas las paginas directamente.
- **Imagenes pesadas:** se detectaron assets mayores a 1 MB y varios entre 300 KB y 700 KB.
- **Sin lazy loading consistente:** imagenes de secciones no criticas no usan siempre `loading="lazy"` ni `decoding="async"`.
- **Sin responsive images:** no se observaron `srcset`/`sizes` para adaptar peso por viewport.
- **Imports visuales variados:** `motion`, `lucide-react`, `react-icons` e iconos propios deben revisarse para evitar peso innecesario.
- **Persistencia local repetitiva:** `localStorage` y mock backend serializan datos completos; puede escalar mal con textos/evidencias.
- **Tablas grandes:** medicion y cursos usan tablas amplias; conviene evaluar virtualizacion si crece el volumen.
- **Ordenamientos mutables:** algunos patrones ordenan arrays derivados con `.sort`; si el array no es copia, puede mutar datos. En los casos revisados parece venir de filtros nuevos, pero se recomienda usar `[...]` para seguridad.

## 9. Problemas de accesibilidad

- `Modal` necesita focus trap completo, retorno de foco y bloqueo/ocultamiento del fondo.
- Sidebar del panel podria no estar disponible en pantallas pequenas; requiere validacion manual visual.
- `index.html` declara idioma `en` aunque la app es espanola.
- Algunos controles usan placeholder como nombre accesible alternativo; es preferible label visible u oculto.
- Barras/steppers de progreso necesitan semantica ARIA mas explicita.
- Las acciones con `window.alert`/`confirm` no ofrecen una experiencia accesible consistente con el resto de la UI.
- Inputs de archivo/evidencia deben comunicar mejor restricciones, error y estado.
- Elementos de navegacion movil de landing desaparecen en tamanos pequenos; puede ser aceptable si hay CTA principal, pero requiere revision UX.

Aspectos positivos:

- Existe menu de accesibilidad con pruebas.
- Hay estilos globales de foco visible.
- Se consideran preferencias de movimiento reducido en CSS.
- Algunos componentes usan `aria-label`, `aria-describedby` y textos ocultos.
- `WorkflowCompletionAlert` maneja foco mejor que el modal base y puede servir como referencia.

## 10. Problemas de estilos y UI

- `src/index.css` es demasiado grande y mezcla niveles de abstraccion.
- Hay tokens CSS faltantes o usados sin definicion confirmada.
- Se mezclan fuentes locales y remotas.
- Hay patrones visuales repetidos de tarjetas, encabezados, filtros y botones de accion.
- Hay valores arbitrarios y espaciados especificos distribuidos en JSX, lo que dificulta consistencia.
- El footer sticky de algunos pasos de mapeo parece usar un offset fijo del sidebar, aunque el sidebar es redimensionable; puede desalinearse.
- La iconografia mezcla librerias y componentes propios.
- Algunos componentes usan min-width grandes y scroll horizontal; funcionalmente puede ser correcto, pero requiere prueba responsive.

## 11. Problemas de formularios y validaciones frontend

- Validaciones repetidas en formularios academicos.
- Mensajes de error y comportamiento de scroll/foco no estan centralizados.
- Algunos selectores dependientes tienen logica duplicada para resetear campos hijos.
- En carga de evidencias, el archivo real no parece persistirse; se guarda informacion limitada.
- La validacion por extension/nombre de archivo debe complementarse con validacion de tipo cuando sea posible.
- Estados de carga, vacios y error existen en varias pantallas, pero no siguen un contrato unico.
- Confirmaciones destructivas usan `window.confirm`; conviene migrar a dialogos propios accesibles.

## 12. Problemas de rutas y navegacion

- `APP_BASE_PATH` hardcodeado puede diferir del `base` real de Vite.
- `AppRouter` no ofrece un 404 claro.
- Las paginas se cargan de forma ansiosa.
- Las redirecciones son imperativas y ocurren cerca del render.
- El breadcrumb de configuracion de usuario usa ruta sin base path.
- La navegacion del sidebar conserva todos los query params.
- La proteccion por rol es visual/frontend y no debe interpretarse como seguridad real. Esto es correcto para el alcance actual sin backend, pero debe documentarse como restriccion de frontend.
- No se confirma menu alternativo de panel para pantallas pequenas.

## 13. Recomendaciones priorizadas

### Cambios criticos

No se detectaron problemas criticos.

### Cambios importantes

1. Corregir estrategia de rutas: base path unico, 404, escucha de navegacion y lazy loading.
2. Mejorar accesibilidad del `Modal` con focus trap completo y retorno de foco.
3. Asegurar navegacion del panel en pantallas menores a `xl`.
4. Corregir el valor controlado del select en mapeo de competencias.
5. Separar responsabilidades de `PanelSidebar` y `academicWorkflow`.
6. Extraer logica compartida entre formularios/filtros academicos.

### Mejoras recomendadas

1. Modularizar `src/index.css` y completar tokens faltantes.
2. Optimizar imagenes: pesos, lazy loading, decoding y responsive images.
3. Centralizar IDs mock con `crypto.randomUUID`.
4. Reemplazar `window.alert`/`confirm` por componentes accesibles.
5. Crear adaptadores para storage, navegacion y exportacion.
6. Agregar debounce o guardado explicito en persistencia de medicion.
7. Fortalecer validaciones de evidencias y comunicar que la persistencia es local/simulada.
8. Agregar reglas ESLint type-aware de forma gradual.

### Limpieza menor

1. Elegir un solo lockfile y documentar npm/pnpm.
2. Actualizar `index.html` con `lang="es"` y titulo real.
3. Revisar assets y componentes potencialmente no usados.
4. Unificar estrategia de fuentes.
5. Normalizar iconografia.
6. Actualizar `README.md` para que describa el proyecto real y no solo plantilla Vite.

## 14. Conclusion

El frontend esta en un estado funcional, pero ya muestra senales de crecimiento sin una capa compartida suficiente para reglas academicas, formularios y navegacion. Las primeras areas a atender deberian ser rutas/navegacion, accesibilidad de modales, responsive del panel y duplicidad de formularios academicos, porque esos puntos afectan directamente la experiencia del usuario y el costo de evolucionar el producto.

Despues de estabilizar esos puntos, conviene abordar rendimiento inicial, modularizacion de estilos y limpieza de dependencias/assets. Las mejoras principales estan en arquitectura frontend, composicion de componentes, accesibilidad, validaciones y consistencia visual.
