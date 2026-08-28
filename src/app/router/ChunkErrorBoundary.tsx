import { Component, type ReactNode } from "react";
import { Button } from "../../components/ui";

const CHUNK_RELOAD_FLAG_KEY = "secub:chunk-reload-attempted";

const CHUNK_ERROR_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
  /load failed/i,
];

function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Se llama una vez que la aplicación terminó de montar sin errores, para que
 * un futuro despliegue nuevo también reciba su propio intento de recarga
 * automática (ver `ChunkErrorBoundary` más abajo).
 */
export function clearChunkReloadFlag() {
  try {
    window.sessionStorage.removeItem(CHUNK_RELOAD_FLAG_KEY);
  } catch {
    // Almacenamiento no disponible (modo privado estricto, etc.): no es crítico.
  }
}

interface ChunkErrorBoundaryProps {
  children: ReactNode;
}

type BoundaryStatus = "ok" | "chunkError" | "unexpectedError";

interface ChunkErrorBoundaryState {
  status: BoundaryStatus;
}

/**
 * Cuando se publica una nueva versión de SECUB, los nombres de los archivos
 * (chunks) de las páginas cargadas con `React.lazy` cambian. Si alguien tenía
 * la aplicación abierta desde antes del despliegue y navega a una página que
 * todavía no había descargado, el navegador intenta pedir un chunk que ya no
 * existe y el `import()` dinámico falla con un error de red, no de lógica.
 *
 * Sin este límite de error, ese fallo queda sin capturar y React desmonta el
 * árbol, dejando una pantalla en blanco. Este componente:
 * 1. Detecta específicamente ese tipo de error (no cualquier error de la
 *    página).
 * 2. Intenta una recarga automática, una sola vez por pestaña, que en la
 *    mayoría de los casos resuelve el problema al traer el `index.html`
 *    actualizado con las referencias correctas.
 * 3. Si el problema persiste (o no se pudo recargar solo), muestra un aviso
 *    claro en vez de una pantalla en blanco.
 * 4. Para cualquier otro error de la aplicación, muestra un aviso genérico
 *    en lugar de fingir que fue un problema de versión.
 */
export default class ChunkErrorBoundary extends Component<
  ChunkErrorBoundaryProps,
  ChunkErrorBoundaryState
> {
  state: ChunkErrorBoundaryState = { status: "ok" };

  static getDerivedStateFromError(error: unknown): ChunkErrorBoundaryState {
    return { status: isChunkLoadError(error) ? "chunkError" : "unexpectedError" };
  }

  componentDidCatch(error: unknown) {
    if (!isChunkLoadError(error)) return;

    let alreadyAttempted = false;
    try {
      alreadyAttempted = window.sessionStorage.getItem(CHUNK_RELOAD_FLAG_KEY) === "true";
    } catch {
      alreadyAttempted = false;
    }

    if (alreadyAttempted) return;

    try {
      window.sessionStorage.setItem(CHUNK_RELOAD_FLAG_KEY, "true");
    } catch {
      // Si no se puede guardar la marca, se evita el reintento automático
      // (podría entrar en bucle) y se deja el aviso manual de abajo.
      return;
    }

    window.location.reload();
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { status } = this.state;

    if (status === "ok") {
      return this.props.children;
    }

    const isChunkIssue = status === "chunkError";

    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[var(--secub-bg)] px-6"
        aria-live="assertive"
      >
        <div className="max-w-md text-center">
          <h1 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            {isChunkIssue
              ? "Hay una nueva versión de SECUB disponible"
              : "Ocurrió un error inesperado"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-gray-3)]">
            {isChunkIssue
              ? "Actualiza la página para continuar con la versión más reciente."
              : "Intenta recargar la página. Si el problema continúa, contacta a soporte."}
          </p>
          <div className="mt-6 flex justify-center">
            <Button onClick={this.handleReload}>
              {isChunkIssue ? "Actualizar ahora" : "Recargar"}
            </Button>
          </div>
        </div>
      </main>
    );
  }
}
