import { useEffect, useState } from "react";
import { APP_NAVIGATION_EVENT } from "../appRoutes";
import { getBrowserLocation } from "../../shared/browser";

export interface BrowserLocation {
  pathname: string;
  search: string;
  hash: string;
}

function readBrowserLocation(): BrowserLocation {
  const { pathname, search, hash } = getBrowserLocation();
  return { pathname, search, hash };
}

export function useBrowserLocation() {
  const [location, setLocation] = useState(readBrowserLocation);

  useEffect(() => {
    const handleRouteChange = () => setLocation(readBrowserLocation());

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener(APP_NAVIGATION_EVENT, handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener(APP_NAVIGATION_EVENT, handleRouteChange);
    };
  }, []);

  return location;
}
