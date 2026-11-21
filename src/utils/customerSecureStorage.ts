export const CUSTOMER_SESSION_KEY = "cleanwise_customer_session_v1";
export const CUSTOMER_KEYCHAIN_SERVICE = "cleanwise.customer.auth";

type SecureStore = {
  getItemAsync: (key: string, options?: { keychainService: string }) => Promise<string | null>;
  setItemAsync: (key: string, value: string, options?: { keychainService: string }) => Promise<void>;
  deleteItemAsync: (key: string, options?: { keychainService: string }) => Promise<void>;
};

// Keep the native service explicit and migrate sessions written by older builds
// with the default service. Tokens never fall back to unencrypted storage.
export function createCustomerSecureStorage(secureStore: SecureStore) {
  const options = { keychainService: CUSTOMER_KEYCHAIN_SERVICE };
  return {
    async getItem(key: string) {
      if (key !== CUSTOMER_SESSION_KEY) return secureStore.getItemAsync(key);
      const saved = await secureStore.getItemAsync(key, options);
      if (saved !== null) return saved;
      const previous = await secureStore.getItemAsync(key);
      if (previous === null) return null;
      await secureStore.setItemAsync(key, previous, options);
      if (await secureStore.getItemAsync(key, options) !== previous) {
        throw new Error("SESSION_MIGRATION_NOT_PERSISTED");
      }
      return previous;
    },
    async setItem(key: string, value: string) {
      await secureStore.setItemAsync(key, value, key === CUSTOMER_SESSION_KEY ? options : undefined);
    },
    async deleteItem(key: string) {
      if (key === CUSTOMER_SESSION_KEY) {
        await secureStore.deleteItemAsync(key, options);
      }
      await secureStore.deleteItemAsync(key);
    },
  };
}
