# Tiếng Việt / English – App khách

Vào **Cá nhân → Cài đặt → Ngôn ngữ** để chọn **Tiếng Việt** hoặc **English**. Mặc định là Tiếng Việt, độc lập với ngôn ngữ điện thoại và lựa chọn Sáng/Tối. Khách chưa đăng nhập cũng đổi được ngôn ngữ. Lựa chọn lưu trên thiết bị với khóa AsyncStorage `cleanwise_customer_language` và không bị xóa khi đăng xuất.

## Cấu trúc

- `src/features/language/i18n.ts`: instance i18next, mặc định/fallback `vi`, locale ngày giờ `vi-VN` / `en-US`. Hai bộ bản dịch đóng gói cùng app nên đổi ngôn ngữ được khi offline.
- `locales/vi.json`, `locales/en.json`: bản dịch các nội dung thuộc app, dùng câu gốc tiếng Việt làm khóa; tắt `keySeparator` và `nsSeparator` để dấu chấm/hai chấm trong câu không thành đường dẫn. Tham số động dùng `{{value0}}`, `{{value1}}`…; nhãn đếm dùng thêm `count` cho số ít/số nhiều tiếng Anh.
- `LanguageProvider.tsx`: khôi phục lựa chọn trước khi mount theme và màn hình; mặc định Việt khi bộ nhớ lỗi hoặc giá trị lưu không hợp lệ. Đổi ngôn ngữ không remount màn hình. Các lần ghi được xếp hàng để lần chọn cuối không bị ghi đè khi bấm nhanh. Khi lưu lỗi, UI vẫn đổi và thông báo chưa lưu được.
- `LanguageSettings.tsx`: nhóm radio Việt/Anh có trạng thái chọn và nhãn hỗ trợ trình đọc màn hình.

Trong React component/hook, dùng `const { t } = useTranslation()` để UI cập nhật khi đổi ngôn ngữ. Trong hàm định dạng/kiểm tra thuần, dùng `translate` và `getLocale` từ `i18n.ts`. Các bảng nhãn và schema kiểm tra là factory `getLocalized…()` để không giữ bản dịch từ thời điểm import. Memo chứa kết quả dịch cần có `t` trong dependencies.

## Phạm vi

Đã chuyển các nội dung thuộc giao diện: điều hướng, tài khoản, đăng nhập/đăng ký, cài đặt, địa chỉ, đặt lịch và trạng thái buổi làm, thanh toán/ví, voucher, yêu thích, đánh giá/khiếu nại, chat và trợ lý. Ngày giờ và số tiền theo locale lựa chọn; đơn vị tiền vẫn là VND, không đổi tỷ giá. Khóa API, mã trạng thái, giá trị biểu mẫu và logic nghiệp vụ giữ nguyên.

Tên/mô tả dịch vụ có sẵn, schema biểu mẫu (nhãn, mô tả, placeholder, lựa chọn lồng nhau/điều kiện), danh sách công việc và nhãn giao dịch hệ thống từ backend được dịch khi render bằng bộ từ điển đóng gói. `localizeServiceField` chỉ tạo bản sao metadata hiển thị; không sửa RTK cache, draft, key/value lựa chọn, điều kiện hay bảng giá. Tên dịch vụ ở thẻ đơn, đánh giá, chat và tìm kiếm cũng theo ngôn ngữ đã chọn. Dịch vụ mới có nội dung chưa nằm trong từ điển cần bổ sung bản dịch.

Không tự dịch tin nhắn, tên người dùng, địa chỉ, ghi chú khách nhập, nội dung hướng dẫn tùy ý, lý do khiếu nại hoặc thông báo lỗi tự do trả từ backend. Các nội dung động đó cần bản dịch từ backend nếu muốn có đủ hai ngôn ngữ. Nhãn ngày trong lịch do app tạo có định dạng tiếng Anh; nội dung bản đồ của nhà cung cấp giữ nguyên.

## Kiểm tra

```powershell
npm run test:language
node --test scripts/tests/*.test.cjs
node node_modules/typescript/bin/tsc --noEmit
```

Kiểm thử provider và màn Cài đặt thật với adapter storage/UI giả lập: đổi qua lại Việt/Anh, giữ state, khôi phục trước mount, lỗi lưu, ghi nhanh, hai bộ khóa/tham số khớp nhau, ngày giờ/tiền, trạng thái và validation. Kiểm thử hồi quy chat/chatbot/theme cũng được chạy.

Đã kiểm tra bản web: Cài đặt chuyển ngay sang English, tải lại giữ lựa chọn, Cá nhân và thanh tab hiển thị tiếng Anh. Ảnh xác nhận ở `../output/customer-language/settings-english.png` tính từ thư mục project. Android Hermes export nằm ở `../output/customer-language/android`; đây là bundle, chưa phải APK cài trên điện thoại.

Cần kiểm tra thêm Android/iOS thật, cỡ chữ lớn và các luồng có dữ liệu backend thực tế.

## Rà soát bổ sung 03/11/2026

Đã mở bản web với API development và kiểm tra trực tiếp English: Trang chủ, cả 10 dịch vụ đang hiển thị (kể cả 6 dịch vụ mẫu), dịch vụ ca lẻ, chi tiết công việc, gói tháng, thứ trong tuần, chuyển nhà, nhóm sofa/nệm/rèm/thảm, Cài đặt, Lịch sử thanh toán, bộ lọc trạng thái và màn tài khoản ngân hàng. Trình duyệt kiểm tra chưa đăng nhập nên các màn cần tài khoản chỉ kiểm tra được header/bộ lọc/trạng thái lỗi; chưa xác nhận giao dịch thật hay hoàn tất đặt đơn/thanh toán.

`service-language.test.cjs` kiểm tra coverage nội dung dịch vụ seed, nhãn/lựa chọn điều kiện lồng nhau, đổi Việt–Anh trên component biểu mẫu/tóm tắt đặt dịch vụ và lịch sử thanh toán với dữ liệu mô phỏng. Các mẫu ghi chú giao dịch do hệ thống sinh được dịch qua `localizeTransactionNote`; ghi chú tự do giữ nguyên. Dữ liệu khách nhập, điều kiện và mã lựa chọn giữ nguyên.

Kết quả cuối: TypeScript đạt; 72 kiểm thử đạt; không thiếu khóa dịch tĩnh trong lời gọi `t()`. Ảnh xác nhận: `../output/customer-language-audit/service-english.png`; log kiểm thử: `../output/customer-language-audit/tests.txt`.
