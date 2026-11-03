// Preset labels are stored in Vietnamese for compatibility with saved addresses.
// Translate their presentation only; custom labels are customer content.
export function localizeAddressLabel(
  label: string | null | undefined,
  t: (key: string) => string,
): string {
  if (!label) return "";
  return ["Nhà", "Công ty", "Khác"].includes(label) ? t(label) : label;
}
