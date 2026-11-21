import { createSessionStorage } from "./sessionStorage";
import { createCustomerSecureStorage, CUSTOMER_SESSION_KEY } from "./customerSecureStorage";
import { decodeJwtPayload } from "@/features/auth/utils/jwt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const nativeStorage = createCustomerSecureStorage(SecureStore);

const backend = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return AsyncStorage.getItem(key);
    }
    return nativeStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      return AsyncStorage.setItem(key, value);
    }
    return nativeStorage.setItem(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      return AsyncStorage.removeItem(key);
    }
    return nativeStorage.deleteItem(key);
  },
};

export const storage = createSessionStorage(backend, CUSTOMER_SESSION_KEY, "CUSTOMER", (token) => decodeJwtPayload(token)?.role);
