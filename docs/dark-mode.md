# Dark mode · App khách

Vào **Cá nhân → Cài đặt → Giao diện** để chọn **Sáng / Tối**.
Khách chưa đăng nhập cũng dùng được. Mặc định là Sáng, không phụ thuộc giao diện điện thoại.
Lựa chọn Theo hệ thống đã lưu từ phiên bản cũ cũng trở về Sáng. Lựa chọn được lưu
riêng trên thiết bị bằng AsyncStorage với khóa `cleanwise_customer_appearance`;
không cần backend hoặc thay đổi tài khoản. Chuyển theme cập nhật ngay, không
remount màn hình hoặc xóa nội dung đang nhập.

## Cấu trúc

- `tokens.js`: bảng màu sáng/tối, màu chữ nhấn và màu nền nút riêng, biến CSS RGB
  hỗ trợ opacity; giữ palette sáng hiện có và thương hiệu teal.
- `tailwind.config.js`: NativeWind 4 dùng `darkMode: class` và màu từ CSS variables.
- `src/features/theme/ThemeProvider.tsx`: khôi phục tùy chọn, đồng bộ NativeWind,
  Expo Router navigation theme, StatusBar, nền cửa sổ và CSS variables cho portal web.
  Chờ đọc tùy chọn trước khi mount các màn hình; native splash được giữ trong lúc đọc.
- `AppearanceSettings.tsx`: hai lựa chọn có trạng thái radio accessible. Nếu lưu lỗi,
  giao diện vẫn đổi và thông báo người dùng lưu lại. Các lần ghi được xếp thứ tự để
  thao tác nhanh không làm ghi đè bằng lựa chọn cũ.
- Các component dùng `useAppTheme()` cho inline styles, icon, gradient và chat.
  Các bảng màu trạng thái được tạo theo theme hiện tại thay vì giữ màu sáng ở module.
- Các ô nhập đồng bộ keyboardAppearance; loading blur theo theme. Ảnh, logo thương
  hiệu và màu nội dung bản đồ từ nhà cung cấp không bị đảo màu. QR giữ trắng/đen
  cùng khoảng trắng quanh mã để quét được.

Khi thêm UI mới, dùng class ngữ nghĩa `bg-canvas`, `bg-surface`, `text-ink`,
`text-ink-soft`, `border-line`; nền nút đặc dùng `bg-primary-fill`/`bg-danger-fill`
đi với `text-white`. Dùng `useAppTheme().COLORS` cho icon/inline styles, không import
COLORS tĩnh cho giao diện. Không dùng màu sáng cố định cho card hoặc text.

Expo SDK 57 yêu cầu navigation theme import từ `expo-router/react-navigation`.
Không import runtime `@react-navigation/native` trong app.

## Kiểm thử đã thực hiện

```powershell
node node_modules/typescript/bin/tsc --noEmit
node --test scripts/tests/theme.test.cjs scripts/tests/chat-moderation.test.cjs scripts/tests/chatbot.test.cjs
node node_modules/expo/bin/cli export --platform android --output-dir ../output/customer-theme/android
```

TypeScript qua; 50 test qua, gồm 8 test theme (khôi phục trước mount, mặc định Sáng,
không phụ thuộc hệ thống, lưu lỗi, ghi nhanh đúng thứ tự, UI đổi màu không mất state, radio
accessible và độ tương phản màu tối). Android Hermes bundle xuất thành công.

Đã chạy bản web trên localhost và kiểm tra Cài đặt, Cá nhân, thanh tab, chuyển
Sáng/Tối và tải lại vẫn giữ lựa chọn. Ảnh xem thử:
`../output/customer-theme/settings-dark.png` (tính từ thư mục project).

Chưa build/cài APK mới hoặc kiểm tra trực tiếp trên thiết bị Android/iOS. Sau khi
thay cấu hình NativeWind, khởi động lại Metro với `npx expo start -c` để làm mới
cache màu. Các dependency cần thiết đã có sẵn; app.json đang để automatic nên
không thêm thư viện native mới trong thay đổi này.
