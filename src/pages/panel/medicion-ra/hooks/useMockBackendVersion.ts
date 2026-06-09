import { useEffect, useRef, useState } from "react";
import { subscribeToMockBackendChanges } from "../../../../services/mockBackend";

export function useMockBackendVersion() {
  const [backendVersion, setBackendVersion] = useState(0);
  const ignoreNextBackendChangeRef = useRef(false);

  useEffect(() => {
    return subscribeToMockBackendChanges(() => {
      if (ignoreNextBackendChangeRef.current) {
        ignoreNextBackendChangeRef.current = false;
        return;
      }

      setBackendVersion((current) => current + 1);
    });
  }, []);

  return {
    backendVersion,
    ignoreNextBackendChangeRef,
  };
}
