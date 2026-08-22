type BrowserStorageName = "localStorage" | "sessionStorage";

function createStorageClient(storageName: BrowserStorageName) {
  function getStorage() {
    if (typeof window === "undefined") return null;
    try {
      return window[storageName];
    } catch {
      return null;
    }
  }

  return {
    isAvailable() {
      return Boolean(getStorage());
    },
    get(key: string) {
      try {
        return getStorage()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    set(key: string, value: string) {
      try {
        getStorage()?.setItem(key, value);
      } catch {
        // La aplicación debe seguir funcionando si el navegador bloquea el storage.
      }
    },
    remove(key: string) {
      try {
        getStorage()?.removeItem(key);
      } catch {
        // La aplicación debe seguir funcionando si el navegador bloquea el storage.
      }
    },
    getNumber(key: string, fallback: number) {
      const value = Number(this.get(key));
      return Number.isFinite(value) ? value : fallback;
    },
    getJson<T>(key: string, fallback: T): T {
      const rawValue = this.get(key);
      if (!rawValue) return fallback;
      try {
        return JSON.parse(rawValue) as T;
      } catch {
        return fallback;
      }
    },
    setJson(key: string, value: unknown) {
      this.set(key, JSON.stringify(value));
    },
  } as const;
}

export const storageClient = createStorageClient("localStorage");
export const sessionStorageClient = createStorageClient("sessionStorage");
