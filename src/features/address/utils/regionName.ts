// Bỏ dấu + bỏ tiền tố hành chính: "Phường Bến Nghé" == "Bến Nghé"
export const nameKey = (s: string) =>
  (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim()
    .replace(/^(thanh pho|tinh|phuong|xa|thi tran|dac khu)\s+/, "");

export const sameName = (a: string, b: string) => nameKey(a) === nameKey(b);
