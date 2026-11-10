# Trợ lý CleanWise — App khách hàng

Nhấn nút robot giữa thanh tab để mở `/chatbot`. Màn hình dùng `TabScreenHeader`, `BottomSheet`, `EmptyState`, `RequireLoginNotice` và token `COLORS`/NativeWind của app; không có bảng màu riêng.

## Cấu trúc

- `src/app/(tabs)/chatbot.tsx`: route mở feature.
- `src/features/chatbot/types`: contract hội thoại, message, run và action cards.
- `src/features/chatbot/api`: inject endpoints vào `baseApi` hiện có, dùng JWT/refresh token và response envelope chung.
- `src/features/chatbot/hooks/useChatbot.ts`: tải lịch sử, gửi, retry, khôi phục lượt đang chạy và chống response muộn khi đổi hội thoại.
- `src/features/chatbot/hooks/useChatbotCardNavigation.ts`: mở màn hình theo action cho phép.
- `src/features/chatbot/components`: màn hình, welcome/gợi ý, composer, bubbles, cards và history sheet.
- `src/features/chatbot/utils`: gộp message, kiểm tra pending record, thông báo lỗi.

## Hành vi

- Chưa đăng nhập: hiển thị component đăng nhập chung. Khi đổi tài khoản, remount feature để loại bỏ transcript/draft trong bộ nhớ của tài khoản trước.
- Mở tab: tải hội thoại hoạt động gần nhất; nếu có câu hỏi đang chờ được lưu cục bộ, ưu tiên phục hồi đúng hội thoại đó. Hội thoại mới chỉ tạo trên server khi gửi câu đầu tiên.
- Hỗ trợ gợi ý tìm dịch vụ, tra đơn, lịch ngày mai, thanh toán; hỏi trực tiếp tối đa 2000 ký tự.
- Lịch sử hội thoại phân trang; tin nhắn mở từ các trang mới nhất, có nút tải tin cũ. Hội thoại đóng chỉ xem, có thể tạo cuộc mới.
- Trong một lượt gửi, khóa gửi tiếp/đổi hội thoại; request gửi có timeout riêng 130 giây, các API khác giữ timeout chung.
- UUID/text được giữ nguyên khi retry. Lưu pending record vào AsyncStorage theo user ID trước POST để khôi phục sau khi app đóng; transcript đầy đủ vẫn ở PostgreSQL, không cache đầy đủ trên thiết bị.
- Nếu response gửi bị mất, đọc lại lịch sử để tìm câu trả lời đã commit. Khi server còn xử lý, kiểm tra run mỗi 4 giây lúc màn hình được focus và app ở foreground. Sau cửa sổ kiểm tra 180 giây, cho phép retry cùng UUID; backend quyết định lease và chống trùng.
- Lỗi hiển thị nút thử lại/sửa câu hỏi. Sửa câu hỏi tạo lượt mới; không tự gửi lại mọi lỗi mạng hoặc gửi câu trả lời mẫu.
- Thẻ `OPEN_SERVICE`/`OPEN_BOOKING` mở route sẵn có theo ID. `OPEN_SCHEDULE` tải lại chi tiết đơn, lấy schedule đầy đủ và truyền đúng `data`, `bookingId`, `bookingStatus` mà màn hình lịch hiện tại cần. Không điều hướng theo URL/văn bản do model sinh.
- Phản hồi hiển thị bằng văn bản thuần. Backend yêu cầu model tránh Markdown/HTML/LaTeX; FE xử lý các dấu định dạng phổ biến trong phản hồi cũ (như `**tên dịch vụ**`, heading, bullet, code và một số cú pháp LaTeX đơn giản). Nội dung khách nhập giữ nguyên; đây không phải trình dựng công thức LaTeX đầy đủ.
- Thanh tab tùy biến ẩn riêng ở tab chatbot khi bàn phím hiện để dành chỗ cho composer.
- Lịch sử có nút thùng rác cho từng hội thoại và xác nhận trước khi xóa vĩnh viễn. Xóa thành công cập nhật danh sách, tải lại phân trang; nếu là hội thoại đang mở thì chuyển về cuộc trò chuyện mới. Lỗi xóa giữ nguyên danh sách; hội thoại đang xử lý bị backend từ chối với `409`.

## Chạy và kiểm chứng

`EXPO_PUBLIC_API_URL` trỏ tới backend đã áp dụng migration và `setup_chatbot_checkpoints`. Gemini key nằm ở `.env` backend (`GOOGLE_API_KEY`), không đặt trong app hoặc biến `EXPO_PUBLIC_*`.

```powershell
npm install
npm run test:chatbot
npx tsc --noEmit
npx expo export --platform web
```

Test hook dùng React thực để chạy effects; mock các adapter API/storage/native navigation, kiểm tra gửi song song, mất response, retry cùng UUID, sửa câu lỗi, phục hồi sau khởi động lại, tách tài khoản, phân trang, response muộn, hội thoại đóng và dữ liệu điều hướng lịch. Không gọi model trả phí trong test.

Kết quả kiểm chứng: 18 test đạt (gồm định dạng phản hồi, giữ nguyên số tiền/mã dịch vụ và xóa lịch sử), TypeScript không có lỗi. Expo export web đã thành công ở bước tích hợp ban đầu. Chưa xác minh trực quan trên thiết bị thật; trình duyệt xem thử trong phiên triển khai không gắn được tab.

Kiểm tra thủ công trên app: mở icon giữa → đăng nhập nếu cần → chọn một gợi ý → xem trạng thái trả lời → thử thẻ dịch vụ/đơn/lịch → mở lịch sử → tạo cuộc mới → kiểm tra bàn phím và gửi lại sau mất mạng.

Phạm vi M1: tư vấn dịch vụ/tra đơn/lịch/thanh toán. RAG, hỗ trợ báo cáo và đặt lịch qua chatbot chưa nằm trong feature này.
## M2 hướng dẫn có nguồn

M2 bổ sung thẻ `help` / `OPEN_HELP_ARTICLE`, mở `/help/[id]` bằng ID do backend xác thực. Kho `/help` mở qua biểu tượng sách trên màn hình Trợ lý hoặc mục Hướng dẫn sử dụng trong Cá nhân. Các màn hình gọi `/api/chatbot/help-articles/` và `/api/chatbot/help-articles/{id}/`, yêu cầu đăng nhập CUSTOMER. Nội dung luôn tải từ API, không dựng từ văn bản model; nguồn cũ đã thu hồi báo không còn khả dụng.

Màn hình chào có câu hỏi gợi ý hướng dẫn đặt dịch vụ và nạp ví. Các kiểm thử navigation nguồn và không hiển thị nội dung cache khi 404 nằm trong `scripts/tests/chatbot.test.cjs`.
