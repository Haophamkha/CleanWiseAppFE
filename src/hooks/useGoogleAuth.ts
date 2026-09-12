import { ENV } from "@/config/env";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onSuccess: (idToken: string) => void) {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "cleanwiseappfe",
  });

  console.log("[GOOGLE CLIENT ID]", ENV.GOOGLE_WEB_CLIENT_ID);
  console.log("[GOOGLE REDIRECT URI]", redirectUri);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: ENV.GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    console.log("[GOOGLE RESPONSE]", response);

    if (response?.type === "success") {
      const idToken = response.params?.id_token;

      if (idToken) {
        onSuccess(idToken);
      } else {
        console.log("[GOOGLE ERROR] Không có id_token", response);
      }
    }
  }, [response]);

  return {
    request,
    promptAsync,
  };
}
