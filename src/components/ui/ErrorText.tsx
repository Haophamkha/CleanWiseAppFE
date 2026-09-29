import { Text } from "react-native";

export function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <Text className="text-sm text-danger mb-3">{message}</Text>;
}
