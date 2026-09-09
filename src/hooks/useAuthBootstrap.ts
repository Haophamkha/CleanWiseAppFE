import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "@/utils/storage";
import { useEffect, useState } from "react";

const normalizeToken = (value: string | null) => {
  const token = value?.trim();
  return token && token !== "null" && token !== "undefined" ? token : "";
};

export function useAuthBootstrap() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const normalized = normalizeToken(token);
      setIsAuthenticated(Boolean(normalized));
      setIsReady(true);
    })();
  }, []);

  return { isReady, isAuthenticated };
}
