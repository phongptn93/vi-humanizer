# Đóng góp

Cảm ơn bạn muốn làm vi-humanizer tốt hơn. Đóng góp có giá trị nhất là quy tắc mới có bằng chứng và ca eval từ văn bản thật.

## Nguyên tắc

- **Ít báo nhầm quan trọng hơn bắt được nhiều.** Một công cụ la làng khiến người dùng sửa cả câu đang đúng, rồi tắt công cụ đi.
- Không thêm phụ thuộc vào CLI.
- Không thêm thứ gì trình bày như xác suất tác giả là máy.
- Văn bản trong repo viết theo chính quy tắc của repo (có test canh).

## Thêm một quy tắc

1. Mở issue bằng mẫu "Đề xuất quy tắc", kèm **ít nhất 3 ví dụ thật** cho thấy đây là thói quen lặp lại.
2. Chọn đúng chỗ:

   | Loại | Tệp | Khi nào |
   |---|---|---|
   | Mẫu chữ | `src/patterns.js` | Một biểu thức chính quy bắt được |
   | Nhất quán, có ngữ cảnh | `src/rules/chinh-ta.js` | Cần nhìn cả văn bản (lẫn hai kiểu viết) |
   | Đo bằng số | `src/analyze.js` → `STRUCTURAL_RULES` | Tính từ thống kê (độ dài câu, mật độ in đậm) |

3. Mỗi quy tắc cần:
   - mã mới (không dùng lại mã đã có) và tên dạng `chu-thuong-gach-noi`;
   - mức mặc định: `error` chỉ cho sai sự thật hoặc rò rỉ; văn mẫu là `warning`;
   - ví dụ `truoc` tự khớp quy tắc, và ví dụ `sau` không thêm dữ kiện mà `truoc` không có;
   - với từ phổ biến trong văn thường: `minCount` ≥ 2;
   - `fixes` chỉ khi sửa máy móc chắc chắn không đổi nghĩa.
4. Thêm test âm tính: một câu bình thường gần giống mà KHÔNG được báo.
5. Cân nhắc preset: quy tắc này có nên nặng hơn ở thể loại nào không (`src/presets.js`)?
6. `npm run docs`, rồi `npm run check`.

## Thêm một ca eval

`evals/cases.json`: `goc` là văn bản thật đã ẩn danh (đổi tên người, công ty, số điện thoại). `vietLai` phải:
- giữ đủ dữ kiện, kể cả tên riêng;
- không thêm tên, đề xuất, chi tiết nào ngoài bản gốc;
- đúng thể loại và giọng (`skills/vi-humanizer/references/the-loai.md`, `giong.md`).

Ca mới làm vỡ ràng buộc hiệu chỉnh của chỉ số văn mẫu (`src/score.js`) thì phải hiệu chỉnh lại công thức, không nới test.

## Giấy phép

Repo theo giấy phép [MIT](LICENSE). Gửi đóng góp nghĩa là bạn đồng ý đóng góp đó được phát hành theo cùng giấy phép. Tệp mã nguồn mới mở đầu bằng hai dòng:

```js
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
```

## Chạy

```bash
npm test          # node:test
npm run evals     # bộ eval
npm run docs      # sinh lại danh mục quy tắc và mẫu nhúng
npm run check     # test + eval + kiểm tài liệu khớp mã nguồn
```
