# Nhật ký thay đổi

Theo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/) và [SemVer](https://semver.org/lang/vi/).
Mã và tên quy tắc (`VI20` / `mot-cach`) là một phần của API: đổi nghĩa một quy tắc là thay đổi phá vỡ; thêm quy tắc mới là bản minor; nới hay siết ngưỡng của quy tắc đã có là bản minor và phải ghi ở đây.

## [1.0.0] - 2026-11-20

### Bộ máy quy tắc
- 53 quy tắc cố định trong 9 nhóm, cộng 2 quy tắc thuật ngữ sinh từ cấu hình (TN01 từ cấm, TN02 thuật ngữ bắt buộc).
- Mỗi quy tắc có mã, tên, mức nghiêm trọng mặc định (lỗi / cảnh báo / gợi ý), ví dụ trước/sau có test canh.
- Nhóm chính tả – trình bày: lẫn kiểu bỏ dấu, lẫn i/y, khoảng trắng quanh dấu câu, nhiều dấu cách, số kiểu Anh, ngày kiểu Mỹ, lặp hư từ, lẫn định dạng ngày.
- 7 preset theo thể loại: `cong-van`, `email`, `bao-cao`, `thong-bao`, `tin-nhan`, `gioi-thieu`, `huong-dan`.
- Che vùng bảo vệ: frontmatter, `<!-- vi-humanizer-disable -->`…`enable`, khối mã, mã trong dòng, trích dẫn, URL, chú thích HTML.

### Đo lường
- Chỉ số văn mẫu 0–100 tất định, 5 thành phần công khai, đo trên âm tiết và cặp âm tiết; hiệu chỉnh trên bộ eval.
- Đối chiếu dữ kiện: số theo quy ước Việt Nam, %, ngày (cả ISO), giờ, mã, tên riêng, URL, email.

### Sửa tự động
- `fix`: sửa chính tả – trình bày, "một cách + tính từ", "tiến hành công tác", thuật ngữ của tổ chức; in diff; từ chối ghi nếu dữ kiện bị đổi.
- `clean`: NFC, ký tự ẩn, mã trích dẫn của công cụ chat, `utm_source` của công cụ AI.
- Đối chiếu dữ kiện bỏ qua ký tự ẩn và `utm_source` của công cụ AI, nên `fix` không còn từ chối một lần dọn thuần túy như vậy (vd `Mã` + U+200B + `SP01` → `MãSP01`).

### CLI và tích hợp
- Lệnh `scan`, `fix`, `compare`, `explain`, `list`, `clean`, `init`; quét cả thư mục.
- Định dạng text, Markdown, JSON, SARIF 2.1.0, chú thích GitHub Actions.
- `--fail-on ro|nhieu|loi|canh-bao`, `--fail-above`, `--rule`, `--ignore`; `.vihumanizerrc.json` có JSON Schema.
- GitHub Action (`action.yml`), pre-commit hook, plugin Claude Code.
- API JavaScript có kiểu TypeScript.

### Skill và tài liệu
- Skill `vi-humanizer`: rà soát / viết lại / sửa nhẹ; 8 thể loại × 5 giọng; xưng hô; thể thức theo Nghị định 30/2020/NĐ-CP.
- Mẫu nhúng luôn bật cho CLAUDE.md, Cursor, Copilot, system prompt, sinh từ một nguồn.
- Bộ eval 6 thể loại; chấm được bản viết lại của mô hình bất kỳ.
