# Giọng

Giọng là **cách nói**; thể loại ([the-loai.md](the-loai.md)) là **khuôn văn bản**. Hai trục độc lập: một email có thể trang trọng hay thân thiện, một báo cáo có thể chuyên nghiệp hay kỹ thuật. Chọn thể loại trước, rồi chọn giọng hợp người đọc.

## Năm giọng

| Giọng (`--giong`) | Dùng khi | Câu | Xưng hô | Đặc trưng | Tránh |
|---|---|---|---|---|---|
| `trang-trong` | Gửi cơ quan, đối tác lần đầu, văn bản có giá trị pháp lý | Đủ chủ vị, trung bình 18–28 chữ | Không xưng, hoặc tên tổ chức, "chúng tôi" | Từ Hán Việt chuẩn ("đề nghị", "phối hợp"), không viết tắt | Thân mật hoá; sáo ngữ hành chính |
| `chuyen-nghiep` | Email, báo cáo nội bộ, khách quen | 10–20 chữ, xen câu ngắn | "tôi/em" – "anh/chị" | Kết luận trước, số có mốc so sánh, một việc cần làm | Rào đón, khen xã giao |
| `than-thien` | Thông báo nội bộ, chăm sóc khách hàng, cộng đồng | Ngắn, có câu dưới 8 chữ | "mình" – "mọi người", "anh/chị" | "nhé" tối đa một lần; một câu ghi nhận người đọc khi có lý do | Đệm "ạ/nha/nè" dày; emoji đầu dòng |
| `ngan-gon` | Lãnh đạo đọc trên điện thoại, tin Zalo, trạng thái công việc | Mỗi dòng một ý, dòng đầu là kết luận | Giữ như bản gốc | Không tiêu đề, không bảng; số ngay dòng đầu | Giải thích lý do dài; câu chuyển ý |
| `ky-thuat` | Tài liệu cho kỹ sư, hướng dẫn cấu hình, biên bản sự cố | Câu mệnh lệnh cho thao tác; câu đủ cho nguyên nhân | Không xưng; "bạn" chấp nhận được trong hướng dẫn | Tên nút, mã lỗi, đơn vị đúng nguyên văn; bước đánh số | Ẩn dụ, tính từ đánh giá ("mạnh mẽ") |

## Ghép thể loại × giọng

| Thể loại ↓ / giọng → | trang-trong | chuyen-nghiep | than-thien | ngan-gon | ky-thuat |
|---|---|---|---|---|---|
| Công văn | **mặc định** | được | không | không | không |
| Email | khách mới | **mặc định** | nội bộ quen | được | cho kỹ sư |
| Báo cáo | gửi hội đồng | **mặc định** | không | lãnh đạo bận | báo cáo sự cố |
| Thông báo | toàn công ty, chính sách | được | **mặc định** | được | không |
| Tin nhắn | không | được | được | **mặc định** | không |
| Giới thiệu | hồ sơ năng lực | **mặc định** | mạng xã hội | được | trang tính năng |
| Hướng dẫn | không | được | người mới | được | **mặc định** |
| Biên bản | **mặc định** | được | không | không | biên bản sự cố |

"không" nghĩa là ghép đó làm người đọc thấy lệch. Người dùng yêu cầu thì vẫn làm, nhưng nói rõ một câu vì sao lệch.

## Cùng một nội dung, năm giọng

Bản gốc: *Ca 2 ngày 18/11/2026, máy ép số 3 kẹt khuôn, dừng 45 phút. Sản lượng ca đạt 1.240, thiếu 160 so với kế hoạch.*

- **trang-trong:** Trong ca 2 ngày 18/11/2026, máy ép số 3 gặp sự cố kẹt khuôn và ngừng hoạt động 45 phút. Sản lượng ca đạt 1.240 sản phẩm, thấp hơn kế hoạch 160 sản phẩm.
- **chuyen-nghiep:** Ca 2 ngày 18/11/2026 thiếu 160 sản phẩm so với kế hoạch (đạt 1.240). Nguyên nhân: máy ép số 3 kẹt khuôn, dừng 45 phút.
- **than-thien:** Ca 2 hôm 18/11/2026 hơi hụt: máy ép số 3 kẹt khuôn nên dừng 45 phút, ca đạt 1.240, thiếu 160 so với kế hoạch.
- **ngan-gon:** Ca 2 – 18/11/2026: 1.240 sp, thiếu 160. Máy ép 3 kẹt khuôn, dừng 45 phút.
- **ky-thuat:** Sự cố: máy ép số 3, kẹt khuôn. Thời điểm: ca 2, 18/11/2026. Thời gian dừng: 45 phút. Ảnh hưởng: sản lượng ca 1.240, thiếu 160 so với kế hoạch.

Cả năm bản giữ đủ dữ kiện: `vi-humanizer compare` trên từng bản đều ra ✔.
