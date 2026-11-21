import { useLazyGetProfileQuery } from "@/features/auth/api/authApi";
import { restoreCustomerSession } from "@/features/auth/utils/restoreCustomerSession";
import { setUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { storage } from "@/utils/storage";
import { ROUTES } from "@/config/constants";
import { useRouter, useSegments } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSessionBootstrap() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const segments = useSegments();
  const [getProfile] = useLazyGetProfileQuery();
  const [status, setStatus] = useState<"loading" | "success" | "routing" | "ready" | "error">("loading");
  const attempt = useRef(0);

  const retry = useCallback(async () => {
    const current = ++attempt.current;
    setStatus("loading");
    try {
      const restored = await restoreCustomerSession({
        readTokens: async () => {
          const session = await storage.getSession();
          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.info("[CustomerSession] read saved session", {
              hasAccess: !!session.access, hasRefresh: !!session.refresh,
            });
          }
          return [session.access, session.refresh];
        },
        getProfile: () => getProfile().unwrap(),
        setUser: (user) => { dispatch(setUser(user)); },
      });
      if (restored) await storage.persistSession();
      if (attempt.current === current) setStatus(restored ? "success" : "ready");
    } catch (error) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.warn("[CustomerSession] restore failed", {
          message: error instanceof Error ? error.message : undefined,
          status: (error as { status?: number } | null)?.status,
        });
      }
      if (attempt.current === current) setStatus("error");
    }
  }, [dispatch, getProfile]);

  useEffect(() => {
    void retry();
    return () => { attempt.current += 1; };
  }, [retry]);

  // Repair a reopened auth route before exposing the restored app. This runs
  // only for startup restoration, not for an in-progress new login animation.
  const finish = useCallback(() => {
    if (status === "success" && segments[0] === "(auth)") {
      setStatus("routing");
      router.replace(ROUTES.HOME);
    } else if (status === "success") setStatus("ready");
  }, [status, segments, router]);

  useEffect(() => {
    if (status === "routing" && segments[0] !== "(auth)") setStatus("ready");
  }, [status, segments]);
  return { status, retry, finish };
}
