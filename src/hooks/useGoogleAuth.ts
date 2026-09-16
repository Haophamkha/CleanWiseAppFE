import { ENV } from "@/config/env";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
});

export function useGoogleAuth(onSuccess: (idToken: string) => void) {
  const promptAsync = async () => {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const response = await GoogleSignin.signIn();

    if (isSuccessResponse(response) && response.data.idToken) {
      onSuccess(response.data.idToken);
    }
  };

  return {
    request: Boolean(ENV.GOOGLE_WEB_CLIENT_ID),
    promptAsync,
  };
}