export const CHATBOT_ADDRESS_PICKER_KEY = "chatbot-address";

export function addressPickedMessage(address: unknown): string {
  const { label } = (address ?? {}) as { label?: string };
  const name = label?.trim();
  return `Tôi đã thêm địa chỉ mới${name ? `: ${name}` : ""}.`;
}
