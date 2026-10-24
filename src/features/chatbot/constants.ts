import { translate as t } from "@/features/language/i18n";
export const CHATBOT_ADDRESS_PICKER_KEY = "chatbot-address";

export function addressPickedMessage(address: unknown): string {
  const { label } = (address ?? {}) as { label?: string };
  const name = label?.trim();
  return t("Tôi đã thêm địa chỉ mới{{value0}}.", { value0: name ? `: ${name}` : "" });
}
