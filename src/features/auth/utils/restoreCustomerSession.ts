import type { UserResponse } from "../types/authResponse";

type Dependencies = {
  readTokens: () => Promise<readonly (string | null)[]>;
  getProfile: () => Promise<UserResponse>;
  setUser: (user: UserResponse) => void;
};

const hasToken = (tokens: readonly (string | null)[]) =>
  tokens.some((token) => !!token && token !== "null" && token !== "undefined");

export async function restoreCustomerSession({ readTokens, getProfile, setUser }: Dependencies) {
  if (!hasToken(await readTokens())) return false;
  try {
    setUser(await getProfile());
    return true;
  } catch (error) {
    // The API interceptor removes tokens when refresh is rejected. A temporary
    // network failure keeps tokens, so offer retry instead of showing guest UI.
    if (hasToken(await readTokens())) throw error;
    return false;
  }
}
