// Bóc thông báo lỗi từ response của backend (Django custom_exception_handler hoặc DRF thuần)
export function getApiErrorMessage(e: any, fallback: string): string {
  if (e?.status === 429) {
    return "Bạn thử quá nhiều lần, vui lòng đợi một phút rồi thử lại";
  }

  const data = e?.data;
  if (!data) return fallback;

  // Dạng { errors: { field: ["msg"] } }
  const errors = data.errors;
  if (errors && typeof errors === "object") {
    const first = errors[Object.keys(errors)[0]];
    const msg = Array.isArray(first) ? first[0] : first;
    if (typeof msg === "string" && msg) return msg;
  }

  if (typeof data.message === "string" && data.message) return data.message;

  // Dạng { detail: [{ msg }] } hoặc { detail: "..." }
  if (Array.isArray(data.detail)) {
    return data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
  }
  if (typeof data.detail === "string" && data.detail) return data.detail;

  // Dạng DRF thuần { field: ["msg"] }
  if (typeof data === "object" && !Array.isArray(data)) {
    const messages: string[] = [];
    for (const key of Object.keys(data)) {
      const v = data[key];
      if (Array.isArray(v)) messages.push(v.join(", "));
      else if (typeof v === "string") messages.push(v);
    }
    if (messages.length > 0) return messages.join(" | ");
  }

  // Dạng mảng thuần ["msg"] (ValidationError raise bằng chuỗi)
  if (Array.isArray(data)) {
    const first = data.find((m) => typeof m === "string" && m);
    if (first) return first;
  }

  return fallback;
}
