import { translate as t } from "@/features/language/i18n";
export function getLocalizedAppInfo() {
  return {
    name: "CleanWise",
    tagline: t("Dọn dẹp tận tâm – Cuộc sống nhẹ nhàng"),
    description:
      t("CleanWise kết nối bạn với đội ngũ nhân viên dọn dẹp uy tín, đặt lịch nhanh chóng, thanh toán an toàn, theo dõi minh bạch."),
    highlights: [
      {
        icon: "shield",
        title: t("Nhân viên xác minh"),
        desc: t("Hồ sơ được kiểm duyệt"),
      },
      {
        icon: "clock",
        title: t("Đặt lịch linh hoạt"),
        desc: t("Một lần hoặc theo gói"),
      },
      {
        icon: "credit-card",
        title: t("Thanh toán an toàn"),
        desc: t("Ví, thẻ, ngân hàng"),
      },
    ] as const,
    hotline: "0901234567",
    email: "support@cleanwise.vn",
    zalo: "https://zalo.me/0961439551",
    facebook: "https://facebook.com/cleanwise",
    terms: "https://cleanwise.vn/terms",
    privacy: "https://cleanwise.vn/privacy",
    developer: t("Nhóm CleanWise "),
  };
}
