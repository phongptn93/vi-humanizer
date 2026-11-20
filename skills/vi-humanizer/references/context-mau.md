# Mẫu `vi-humanizer.context.md`

Đặt tệp này ở thư mục làm việc để skill áp quy ước riêng của doanh nghiệp. Mọi mục đều tuỳ chọn. Quy định ở đây thắng quy tắc chung, trừ ba nguyên tắc không đổi (giữ dữ kiện, không sửa vùng bảo vệ, không phán "do AI viết").

```markdown
# Ngữ cảnh văn phong — Công ty An Phát

## Người đọc thường gặp
- Ban giám đốc: đọc trên điện thoại, cần kết luận ở dòng đầu.
- Khách hàng: doanh nghiệp sản xuất, gọi "Quý công ty" ở lần đầu, "anh/chị" khi đã trao đổi.

## Xưng hô
- Email nội bộ: "em" – "anh/chị".
- Văn bản gửi ngoài: "Công ty An Phát" hoặc "chúng tôi".

## Thuật ngữ bắt buộc (bên trái là chữ PHẢI dùng)
- phiếu lĩnh (không dùng: phiếu xuất vật tư, phiếu cấp phát)
- lệnh sản xuất / LSX (không dùng: lệnh làm việc, work order)
- ca 1, ca 2, ca 3 (không dùng: ca sáng, ca chiều)

## Từ cấm
- giải pháp toàn diện
- hệ sinh thái
- tối ưu hoá trải nghiệm

## Văn mẫu để bắt chước giọng
> Ca 2 hôm qua máy ép số 3 dừng 45 phút do kẹt khuôn. Tổ bảo trì đã vệ sinh khuôn và chạy lại lúc 15:20.
> Đề nghị kiểm khuôn trước mỗi ca trong tuần này.
```

CLI cũng đọc cấu hình riêng ở `.vihumanizerrc.json` (bỏ qua dấu hiệu, ngưỡng cho CI):

```json
{
  "preset": "email",
  "rules": { "tinh-tu-keu": "info" },
  "failOn": "loi",
  "banned": ["giải pháp toàn diện", "hệ sinh thái", "tối ưu hoá trải nghiệm"],
  "terms": {
    "phiếu lĩnh": ["phiếu xuất vật tư", "phiếu cấp phát"],
    "lệnh sản xuất": ["lệnh làm việc", "work order"]
  }
}
```

Từ cấm và thuật ngữ trong `.vihumanizerrc.json` được **máy cưỡng chế** (quy tắc TN01, TN02) và `vi-humanizer fix` tự thay thuật ngữ, giữ hoa đầu câu. Phần trong `vi-humanizer.context.md` (văn mẫu, người đọc, xưng hô) là để agent đọc và bắt chước. Hai tệp bổ sung cho nhau: thứ đếm được để máy giữ, thứ cần phán đoán để agent giữ.
