import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "@/utils/storage";
import { useEffect, useState } from "react";

export function useAuthBootstrap() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      setIsAuthenticated(!!token);
      setIsReady(true);
    })();
  }, []);

  return { isReady, isAuthenticated };
}
