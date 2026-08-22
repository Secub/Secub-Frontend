# Implementación de recomendaciones de auditoría frontend

Este documento registra la reorganización aplicada al frontend de SECUB a partir de la auditoría técnica del 17 de junio de 2026. Su objetivo es evitar que el equipo vuelva a introducir patrones ya corregidos y dejar explícitos los límites de la versión mock frente al backend real.

## Cambios aplicados

### Navegación y rutas

- Base path derivado de `import.meta.env.BASE_URL`.
- Configuración central de rutas.
- Carga diferida de páginas con `React.lazy` y `Suspense`.
- Estado de carga y página 404.
- Navegación con escucha de historial.
- Redirecciones de sesión, programa y permisos separadas del render principal.
- Conservación controlada de parámetros permitidos entre rutas.
- Adaptador central para navegación del navegador.

### Panel y responsive

- Drawer móvil accesible para la navegación del panel.
- Misma fuente de navegación y permisos en escritorio y móvil.
- Redimensionamiento del sidebar extraído a un hook.
- Modelo de navegación separado del componente visual.
- Eliminación de componentes de demostración sin uso.

### Accesibilidad

- Modal base con portal, foco inicial, focus trap, Escape, retorno de foco, bloqueo de scroll y fondo inerte.
- Confirmaciones y avisos propios en lugar de `window.alert` y `window.confirm`.
- Barras y pasos de progreso con semántica ARIA.
- Foco visible y soporte de movimiento reducido conservados.
- Idioma inicial configurado en español.

### Arquitectura y preparación para backend

- Cliente HTTP compartido con GET, POST, PUT, PATCH y DELETE.
- Manejo uniforme de errores, token, cancelación y respuestas vacías.
- Contratos genéricos de repositorio CRUD.
- Adaptadores de repositorio mock y API.
- Tipos de alcance académico separados del almacenamiento.
- Acceso a `localStorage` encapsulado en un único cliente.
- Descarga e impresión encapsuladas en adaptadores del navegador.
- Reglas y hooks del flujo académico separados del archivo de exportación pública.

La persistencia mock sigue activa mientras no exista backend. Al integrar la API, las pantallas deben consumir repositorios de cada entidad y no llamar `fetch`, `localStorage` o endpoints directamente.

### Reutilización

- Filtros de seccional, facultad, programa, plan y ciclo compartidos por Perfil, Propósito y Competencias.
- Generación de IDs centralizada mediante `crypto.randomUUID()` con respaldo.
- Branding de PDF centralizado en recursos compartidos.
- Exportaciones y feedback centralizados.
- Utilidades transversales organizadas en `shared`, `domain`, `features` e `infrastructure`.

### Medición RA y evidencias

- Persistencia automática con debounce.
- Guardado inmediato de acciones críticas.
- Validación de extensión, MIME y tamaño para evidencias.
- Mensajes de error mediante feedback propio.

La carga real del archivo, almacenamiento, antivirus, autorización y URL definitiva corresponden al backend. El frontend ya está preparado para reemplazar el nombre local por metadatos devueltos por la API.

### Estilos, fuentes y recursos

- CSS global dividido por tokens, base, accesibilidad, panel y progreso.
- Token `--radius-2xl` definido.
- Tipografía local unificada con Poppins.
- Imágenes grandes convertidas y optimizadas en WebP cuando aplica.
- Imágenes no críticas con carga diferida y decodificación asíncrona.
- Logos base64 duplicados sustituidos por recursos únicos compartidos.
- Assets de plantilla Vite/React sin uso eliminados.
- Iconografía unificada sobre `react-icons`; se eliminó la dependencia adicional de Lucide.

### Proyecto y tooling

- npm definido como único gestor.
- `pnpm-lock.yaml` eliminado.
- `package.json` y `package-lock.json` sincronizados.
- ESLint configurado con análisis TypeScript basado en tipos.
- Scripts separados para tipos, lint estricto, pruebas y build.
- Workflow de CI agregado.
- README reemplazado por documentación real.
- Guía de roles actualizada.
- Variables de entorno documentadas.
- Docker y Nginx mejorados con healthcheck, proxy, límites y políticas de caché.
- Metadata y favicon institucional configurados.

## Reglas que debe validar el backend

Aunque el frontend oculte acciones y limite rutas, la API debe validar siempre:

- Identidad y sesión.
- Rol efectivo.
- Seccional, facultad, programa y plan.
- Propiedad o asignación del curso.
- Estado del flujo y del registro.
- Permisos para crear, actualizar, eliminar, finalizar o exportar.
- Integridad referencial y operaciones en cascada.
- Carga y lectura segura de evidencias.
- IDs definitivos y control de concurrencia.

## Validaciones ejecutadas sobre esta entrega

- Análisis sintáctico independiente de 300 archivos TypeScript/TSX: sin errores.
- Verificación semántica interna con TypeScript estricto y declaraciones de dependencias: sin errores.
- Verificación de imports relativos en 301 archivos: sin rutas faltantes.
- Cero usos de `window.alert` o `window.confirm`.
- Cero imágenes base64 incrustadas en TypeScript/TSX.
- Cero llamadas directas a `fetch` fuera del cliente HTTP.
- Cero generadores `Math.random` fuera del helper central de IDs.
- Dependencias raíz sincronizadas entre `package.json` y `package-lock.json`.

No fue posible ejecutar `npm ci`, el build oficial, Vitest y ESLint con las dependencias reales dentro del entorno de preparación porque el registro de paquetes respondió repetidamente con error HTTP 503. La entrega conserva los comandos y el workflow de CI para que esos pasos se ejecuten automáticamente cuando el registro esté disponible.

## Convención para nuevos desarrollos

1. No importar `localStorage`, `window.location`, `fetch`, `window.alert` o `window.confirm` desde páginas.
2. No agregar endpoints directamente en componentes.
3. No duplicar filtros académicos, exportadores, validadores o IDs.
4. Mantener reglas de dominio en funciones puras.
5. Mantener estados de carga, vacío, error y guardado.
6. Agregar pruebas para rutas, permisos y operaciones nuevas.
7. Ejecutar `npm run typecheck`, `npm run lint:strict`, `npm run test` y `npm run build` antes de integrar cambios.
