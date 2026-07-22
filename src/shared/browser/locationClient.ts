export interface BrowserLocationSnapshot {
  pathname: string;
  search: string;
  hash: string;
  origin: string;
}

const SERVER_LOCATION: BrowserLocationSnapshot = {
  pathname: "/",
  search: "",
  hash: "",
  origin: "http://localhost",
};

export function getBrowserLocation(): BrowserLocationSnapshot {
  if (typeof window === "undefined") return SERVER_LOCATION;

  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    origin: window.location.origin,
  };
}

export function getBrowserOrigin() {
  return getBrowserLocation().origin;
}

export function getBrowserSearchParams() {
  return new URLSearchParams(getBrowserLocation().search);
}

export function getBrowserSearchParam(name: string) {
  return getBrowserSearchParams().get(name) ?? "";
}
