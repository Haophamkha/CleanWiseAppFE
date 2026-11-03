import { translate as defaultTranslate } from "@/features/language/i18n";

export const CHATBOT_ADDRESS_PICKER_KEY = "chatbot-address";

export function addressPickedMessage(address: unknown, translateText = defaultTranslate): string {
  const { label } = (address ?? {}) as { label?: string };
  const name = label?.trim();
  return translateText("Tôi đã thêm địa chỉ mới{{value0}}.", { value0: name ? `: ${name}` : "" });
}
