import { useTranslation } from "react-i18next";
import { localizeKnownMessage } from "@/features/language/i18n";
import { Text } from "react-native";

export function ErrorText({ message }: { message?: string }) {
  const { t } = useTranslation();
  if (!message) return null;
  return <Text className="text-sm text-danger mb-3">{localizeKnownMessage(message, t)}</Text>;
}
