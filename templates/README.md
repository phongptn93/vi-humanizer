# Mẫu nhúng luôn bật

Skill chỉ chạy khi được gọi. Muốn mọi câu trả lời tiếng Việt của agent luôn sạch văn mẫu, nhúng khối luật ngắn (khoảng 1.700 ký tự) vào chỗ agent luôn đọc.

| Công cụ | Đặt ở đâu | Tệp mẫu |
|---|---|---|
| Claude Code | `CLAUDE.md` của dự án hoặc `~/.claude/CLAUDE.md` | [`CLAUDE.md`](CLAUDE.md) |
| Cursor | `.cursor/rules/van-phong-tieng-viet.mdc` | [`cursor/van-phong-tieng-viet.mdc`](cursor/van-phong-tieng-viet.mdc) |
| GitHub Copilot | `.github/copilot-instructions.md` | [`copilot-instructions.md`](copilot-instructions.md) |
| LLM bất kỳ (API, nền tảng agent) | system prompt | [`system-prompt.md`](system-prompt.md) |

Bốn tệp cùng một nội dung luật; chỉ khác phần khai báo đầu tệp. Test `templates.test.js` chặn việc chúng lệch nhau.

Khối luật chỉ quy định **câu chữ**. Nó không đổi nội dung, số liệu hay cấu trúc câu trả lời, nên ghép được với mọi prompt nghiệp vụ.
