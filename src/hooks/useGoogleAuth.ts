import { ENV } from "@/config/env";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onSuccess: (idToken: string) => void) {
  console.log("[GOOGLE REDIRECT URI]", AuthSession.makeRedirectUri());

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: ENV.GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params.id_token;
      if (idToken) onSuccess(idToken);
    }
  }, [response]);

  return { request, promptAsync };
}
