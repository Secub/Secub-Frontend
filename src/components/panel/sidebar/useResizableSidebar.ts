import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { storageClient } from "../../../shared/browser/storageClient";

export const SIDEBAR_STORAGE_KEY = "secub-sidebar-width";
export const SIDEBAR_MIN_WIDTH = 240;
export const SIDEBAR_DEFAULT_WIDTH = 320;
export const SIDEBAR_MAX_WIDTH = 360;
const SIDEBAR_RESIZE_STEP = 12;

function clampSidebarWidth(width: number) {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
}

function getInitialSidebarWidth() {
  return clampSidebarWidth(
    storageClient.getNumber(SIDEBAR_STORAGE_KEY, SIDEBAR_DEFAULT_WIDTH),
  );
}

export function useResizableSidebar(enabled: boolean) {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const updateSidebarWidth = useCallback(
    (nextWidth: number | ((currentWidth: number) => number)) => {
      setSidebarWidth((currentWidth) => {
        const resolvedWidth = typeof nextWidth === "function"
          ? nextWidth(currentWidth)
          : nextWidth;
        const clampedWidth = clampSidebarWidth(resolvedWidth);
        storageClient.set(SIDEBAR_STORAGE_KEY, String(clampedWidth));
        return clampedWidth;
      });
    },
    [],
  );

  useEffect(() => {
    if (!enabled || !isResizingSidebar) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      updateSidebarWidth(event.clientX - sidebarLeft);
    };
    const handlePointerUp = () => setIsResizingSidebar(false);
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [enabled, isResizingSidebar, updateSidebarWidth]);

  const handleResizePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    event.preventDefault();
    setIsResizingSidebar(true);
  };

  const handleResizeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!enabled) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateSidebarWidth((currentWidth) => currentWidth - SIDEBAR_RESIZE_STEP);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      updateSidebarWidth((currentWidth) => currentWidth + SIDEBAR_RESIZE_STEP);
    } else if (event.key === "Home") {
      event.preventDefault();
      updateSidebarWidth(SIDEBAR_MIN_WIDTH);
    } else if (event.key === "End") {
      event.preventDefault();
      updateSidebarWidth(SIDEBAR_MAX_WIDTH);
    }
  };

  return {
    sidebarRef,
    sidebarWidth,
    isResizingSidebar,
    handleResizePointerDown,
    handleResizeKeyDown,
  };
}
