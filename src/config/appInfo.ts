import { translate as defaultTranslate } from "@/features/language/i18n";

export function getLocalizedAppInfo(translateText = defaultTranslate) {
  return {
    name: "CleanWise",
    tagline: translateText("Dọn dẹp tận tâm – Cuộc sống nhẹ nhàng"),
    description:
      translateText("CleanWise kết nối bạn với đội ngũ nhân viên dọn dẹp uy tín, đặt lịch nhanh chóng, thanh toán an toàn, theo dõi minh bạch."),
    highlights: [
      {
        icon: "shield",
        title: translateText("Nhân viên xác minh"),
        desc: translateText("Hồ sơ được kiểm duyệt"),
      },
      {
        icon: "clock",
        title: translateText("Đặt lịch linh hoạt"),
        desc: translateText("Một lần hoặc theo gói"),
      },
      {
        icon: "credit-card",
        title: translateText("Thanh toán an toàn"),
        desc: translateText("Ví, thẻ, ngân hàng"),
      },
    ] as const,
    hotline: "0901234567",
    email: "support@cleanwise.vn",
    zalo: "https://zalo.me/0961439551",
    facebook: "https://facebook.com/cleanwise",
    terms: "https://cleanwise.vn/terms",
    privacy: "https://cleanwise.vn/privacy",
    developer: translateText("Nhóm CleanWise "),
  };
}
