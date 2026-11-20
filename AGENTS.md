# Hướng dẫn cho agent

Repo này là một skill biên tập văn phong tiếng Việt kèm CLI tất định. Agent đọc được SKILL.md (Claude Code, Codex, Cursor…) dùng trực tiếp `skills/vi-humanizer/SKILL.md`; skill gọi CLI ở `bin/vi-humanizer.js` (Node ≥ 18, không phụ thuộc gói ngoài).

Khi sửa repo, nhớ rằng danh mục quy tắc, mẫu nhúng và tài liệu đều sinh từ mã nguồn. Sửa ở `src/` (quy tắc), `templates/system-prompt.md` (khối luật luôn bật), rồi chạy `npm run docs`; không sửa tay `references/dau-hieu.md` hay các tệp trong `templates/` khác.

Trước khi kết thúc một thay đổi, chạy `npm run check`. Lệnh này gồm test, bộ eval và kiểm tài liệu khớp mã. Văn bản tiếng Việt trong repo cũng phải tự qua `vi-humanizer scan` ở mức "ít dấu hiệu", có test canh.

Ba nguyên tắc không đổi: giữ nguyên dữ kiện; không sửa trích dẫn, mã, thể thức; không phán "do AI viết".
