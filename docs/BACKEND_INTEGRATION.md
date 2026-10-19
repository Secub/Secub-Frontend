# Integración con el backend

El frontend consume la API REST del backend de SECUB. La especificación completa está en el Swagger: https://secub.apps-mind.com/api/docs

## Capas

| Capa | Archivo | Función |
| --- | --- | --- |
| Configuración | `src/config/api.config.ts` | `API_BASE_URL` a partir de `VITE_API_BASE_URL` (por defecto `/api`) y base de ITIS. |
| Cliente HTTP | `src/infrastructure/api/httpClient.ts` | Envoltorio de `fetch`: base URL, parámetros de consulta, JSON o `FormData`, `credentials: "include"` y `ApiError`. |
| Errores | `src/infrastructure/api/ApiError.ts` | Error con `message`, `status`, `code` y `details`. |
| Sesión | `src/services/auth/session.ts` | Consulta de la sesión, selección de contexto y cierre de sesión. |
| Servicios | `src/services/*.ts` | Un servicio por recurso (perfiles, propósitos, competencias, mapeos, ciclos, asignaciones, mediciones, notificaciones, flujo y reportes). |

## Autenticación

- El acceso redirige a `/auth/microsoft?campus=<código>` (Microsoft Entra ID).
- El backend guarda la sesión en una cookie HTTP; el frontend no maneja tokens.
- Todas las solicitudes van con `credentials: "include"`. En desarrollo, Vite redirige `/api` y `/auth` a `http://localhost:3000`; en Docker, Nginx los redirige a `secub-backend:3000`.

## Respuestas y errores

- `204` devuelve `null`; una respuesta JSON se interpreta; cualquier otra se devuelve como texto.
- Una respuesta no exitosa lanza `ApiError`. El mensaje sale de `message` (o `error`) del cuerpo; si no existe, se usa "La solicitud falló con estado N.".
- Cada solicitud distinta de `GET` que termina bien dispara el evento `secub:workflow-changed`, que actualiza el avance del flujo académico.

## Reglas

- Los permisos del frontend son solo de experiencia de uso: la API debe validar identidad, rol, alcance institucional y propiedad del recurso en cada operación.
- Ningún componente llama a `fetch` directamente; todo pasa por un servicio.
- Si un endpoint cambia, se actualiza el servicio correspondiente y la sección 5 de la documentación del frontend.
