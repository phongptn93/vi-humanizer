<div align="center">

# vi-humanizer

**Biên tập văn phong tiếng Việt cho AI agent và cho người viết.**
Phát hiện văn mẫu, sửa chính tả – trình bày, viết lại đúng thể loại và giọng, và **chứng minh** không một con số nào bị đổi.

[![CI](https://github.com/OWNER/vi-humanizer/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/vi-humanizer/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-%E2%89%A518.17-339933)
![Phụ thuộc](https://img.shields.io/badge/ph%E1%BB%A5%20thu%E1%BB%99c-0-blue)
[![Giấy phép](https://img.shields.io/badge/gi%E1%BA%A5y%20ph%C3%A9p-MIT-green)](LICENSE)

[Bắt đầu](#bắt-đầu) · [Quy tắc](skills/vi-humanizer/references/dau-hieu.md) · [CLI](#cli) · [GitHub Action](#github-action) · [Thư viện](#dùng-như-thư-viện) · [English](README.en.md)

</div>

```text
$ vi-humanizer scan examples/bao-cao.md --the-loai bao-cao
examples/bao-cao.md  Nhiều dấu hiệu · chỉ số văn mẫu 62/100 (khuôn sáo 45/45 · nhịp câu 16.8/20 · từ vựng 0.6/10)
  ✖ 1:1     Mở bài giới thiệu "Dưới đây là…" ×1  VI01 mo-bai-gioi-thieu
      › Dưới đây là báo cáo tổng quan về tình hình sản xuất…
      → Bỏ câu giới thiệu, vào thẳng nội dung.
  ✖ 3:1     Đoạn "Tóm lại" nhắc lại thân bài ×2  VI04 doan-tom-lai
  ▲ 3:223   "Đóng vai trò quan trọng" ×1  VI10 dong-vai-tro
  …

$ vi-humanizer compare examples/bao-cao.md examples/bao-cao.viet-lai-sai.md
✘ Dữ kiện bị đổi: thiếu 4, thêm 2 (giữ 5).
  − thiếu  −12,6% (phần trăm)
  − thiếu  149.094 (số)
  − thiếu  21.523 (số)
  − thiếu  37 (số)
  + thêm   13% (phần trăm)
  + thêm   149 (số)
```

## Vì sao

Văn bản tiếng Việt do AI soạn, hoặc do người viết vội theo mẫu, có những dấu hiệu rất dễ nhận ra:

<!-- vi-humanizer-disable -->
| Dấu hiệu | Ví dụ |
|---|---|
| Khuôn câu dịch từ tiếng Anh | "xử lý **một cách** nhanh chóng", "báo cáo **được** tạo **bởi** hệ thống", "**Việc** kiểm tra **là** rất cần thiết" |
| Sáo ngữ hành chính – quảng cáo | "**đóng vai trò then chốt**", "**trong bối cảnh** chuyển đổi số **ngày nay**", "**nâng tầm**", "**giải pháp đột phá**" |
| Mở, kết theo mẫu | "**Dưới đây là**…", "**Hy vọng thông tin trên hữu ích**", "**Đừng ngần ngại** liên hệ" |
| Xưng hô lệch | "**Bạn** vui lòng duyệt đề xuất" gửi giám đốc |
| Trình bày ngoại lai, thiếu nhất quán | gạch dài "—" giữa câu, **Tiêu Đề Viết Hoa Mọi Chữ**, lẫn "hoà" với "hòa", số `1,405,712`, ngày `11/25/2026` |
<!-- vi-humanizer-enable -->

Lỗi đắt nhất khi "làm mượt" văn bản lại không nằm trong bảng trên: **đổi dữ kiện**. "Giảm 21.523 sản phẩm (−12,6%)" thành "hụt khoảng 13%"; thêm "anh Minh" vào một email vốn chỉ viết "anh". vi-humanizer chặn lỗi đó bằng phép đối chiếu tất định, không nhờ mô hình tự soát chính nó.

## Tính năng

| | |
|---|---|
| **55 quy tắc, 10 nhóm** | Mở/kết mẫu · thổi phồng · khuôn câu dịch · khuôn ý lặp · định dạng · lời chatbot · rò rỉ kỹ thuật · **chính tả – trình bày** · **xưng hô** · **thuật ngữ của tổ chức**. Mỗi quy tắc có mã (`VI20`), tên (`mot-cach`), mức nghiêm trọng, ví dụ trước/sau, cách sửa. `vi-humanizer explain mot-cach` |
| **Preset theo thể loại** | `cong-van` · `email` · `bao-cao` · `thong-bao` · `tin-nhan` · `gioi-thieu` · `huong-dan`. Cùng một câu, đúng ở tin nhắn nhưng là lỗi ở công văn |
| **Chỉ số văn mẫu 0–100** | Tất định, tách 5 thành phần (khuôn sáo, nhịp câu, lặp cụm, từ vựng, định dạng), đo trên âm tiết và cặp âm tiết cho đúng tiếng Việt, hiệu chỉnh trên bộ eval |
| **Sửa tự động có chứng minh** | `vi-humanizer fix` sửa phần chắc chắn đúng (chính tả, khoảng trắng, "một cách nhanh chóng" → "nhanh", thuật ngữ của tổ chức), in diff, rồi **từ chối ghi** nếu một dữ kiện bị đổi |
| **Đối chiếu dữ kiện** | Số (đọc đúng `1.405.712`, `39,8`), %, ngày (cả ISO), giờ, mã (`LSX-2026-118`, `OEE`), **tên riêng**, URL, email |
| **Thuật ngữ của tổ chức** | Từ cấm và thuật ngữ bắt buộc khai trong `.vihumanizerrc.json` được máy cưỡng chế và tự thay, không phụ thuộc trí nhớ của mô hình |
| **Skill biên tập** | 3 chế độ (rà soát · viết lại · sửa nhẹ) × 8 thể loại × 5 giọng, xưng hô, thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP |
| **Tích hợp** | Plugin Claude Code · GitHub Action một dòng · chú thích ngay trên PR · SARIF cho code scanning · pre-commit · mẫu nhúng cho CLAUDE.md, Cursor, Copilot, system prompt · API JavaScript có kiểu TypeScript |
| **Không phụ thuộc** | Node ≥ 18, không gói ngoài, không gọi mạng, chạy được offline và trong mạng nội bộ |

## Bắt đầu

### Claude Code

```text
/plugin marketplace add OWNER/vi-humanizer
/plugin install vi-humanizer@vi-humanizer
```

Sau đó nói tự nhiên: *"viết lại email này cho tự nhiên, giọng chuyên nghiệp"*, *"rà soát công văn này"*, hoặc gọi `/vi-humanizer`.

Agent khác đọc được `SKILL.md` (Codex, Cursor…): chép thư mục [`skills/vi-humanizer`](skills/vi-humanizer) cùng `bin/` và `src/`, hoặc clone cả repo.

### CLI

```bash
npx github:OWNER/vi-humanizer scan van-ban.md
# hoặc cài toàn cục
npm install -g github:OWNER/vi-humanizer
```

### Luôn bật cho mọi câu trả lời

Nhúng khối luật 1.700 ký tự vào CLAUDE.md, Cursor rules, Copilot instructions hay system prompt bất kỳ: [`templates/`](templates/).

## CLI

| Lệnh | |
|---|---|
| `scan [tệp\|thư mục…]` | Quét; thư mục thì quét `*.md`, `*.txt` bên trong; không có tệp thì đọc stdin |
| `fix [tệp…] [--write]` | Sửa tự động phần chắc chắn đúng, in diff, kiểm dữ kiện; `--write` mới ghi |
| `compare <gốc> <mới>` | Đối chiếu dữ kiện; mã thoát 1 nếu thiếu hoặc thêm |
| `explain <mã\|tên>` | Giải thích quy tắc kèm ví dụ |
| `list` | Liệt kê quy tắc, tên, mức mặc định |
| `clean <tệp>` | Chỉ sửa kỹ thuật: NFC, ký tự ẩn, mã trích dẫn của công cụ chat, `utm_source` của AI |
| `init` | Tạo `.vihumanizerrc.json` mẫu |

| Tuỳ chọn | |
|---|---|
| `--the-loai <preset>` | Preset thể loại |
| `--format text\|md\|json\|sarif\|github` | `github` in chú thích cho GitHub Actions |
| `--fail-on ro\|nhieu\|loi\|canh-bao` | Mã thoát 1 theo mức văn mẫu, hoặc khi có lỗi / cảnh báo |
| `--fail-above N` | Mã thoát 1 khi chỉ số văn mẫu > N |
| `--rule <mã\|tên>=<off\|info\|warning\|error>` | Đổi mức một quy tắc, lặp được |
| `--ignore VI14,mot-cach` | Tắt quy tắc |

```text
$ vi-humanizer fix bien-ban.md
bien-ban.md: 7 sửa · giữ đủ 1 dữ kiện
     1 - Tiến hành công tác kiểm tra lô 1.240 sản phẩm ,xử lý một cách nhanh chóng.
       + Kiểm tra lô 1.240 sản phẩm, xử lý nhanh.
     2 - Hoà giải xong, hòa hợp, hòa bình. Báo cáo của của phòng  kế hoạch.
       + Hòa giải xong, hòa hợp, hòa bình. Báo cáo của phòng kế hoạch.
  Theo quy tắc: VI23 ×1, CT03 ×2, VI20 ×1, CT01 ×1, CT07 ×1, CT04 ×1
```

## Cấu hình

`.vihumanizerrc.json` (có [JSON Schema](schema/vihumanizerrc.schema.json) để trình soạn thảo gợi ý):

```json
{
  "$schema": "https://raw.githubusercontent.com/OWNER/vi-humanizer/main/schema/vihumanizerrc.schema.json",
  "preset": "bao-cao",
  "failOn": "nhieu",
  "failAbove": 30,
  "rules": { "tinh-tu-keu": "info", "CT05": "error" },
  "banned": ["giải pháp toàn diện", "hệ sinh thái"],
  "terms": { "phiếu lĩnh": ["phiếu xuất vật tư", "phiếu cấp phát"] }
}
```

Mức nghiêm trọng hiệu lực = mặc định ← preset ← `rules` ← `--rule` / `--ignore`.

Tài liệu cần trích văn mẫu làm ví dụ thì bọc đoạn đó:

```markdown
<!-- vi-humanizer-disable -->
❌ Giải pháp đóng vai trò then chốt…
<!-- vi-humanizer-enable -->
```

Frontmatter, khối mã, mã trong dòng, trích dẫn `> …`, URL luôn được bỏ qua.

## Hai thước đo, tách bạch

| | Đo gì | Tính từ |
|---|---|---|
| **Mức** `it / ro / nhieu` và **chỉ số văn mẫu** 0–100 | Văn bản giống văn mẫu tới đâu | Chỉ các quy tắc khuôn sáo, cấu trúc, định dạng |
| **Mức nghiêm trọng** `lỗi / cảnh báo / gợi ý` | Từng chỗ cần sửa gấp tới đâu | Mọi quy tắc; ngày kiểu Mỹ là *lỗi* nhưng không làm văn bản "giống văn mẫu" hơn |

Chỉ số văn mẫu **không phải xác suất "do AI viết"**. Công thức và trọng số công khai trong [`src/score.js`](src/score.js) và [danh mục](skills/vi-humanizer/references/dau-hieu.md#chỉ-số-văn-mẫu). Dải: 0–20 sạch · 21–39 còn khuôn sáo · ≥ 40 văn mẫu rõ.

## GitHub Action

```yaml
name: Văn phong
on: pull_request
jobs:
  van-phong:
    runs-on: ubuntu-latest
    permissions: { contents: read, security-events: write }
    steps:
      - uses: actions/checkout@v4
      - uses: OWNER/vi-humanizer@v1
        with:
          paths: docs
          the-loai: huong-dan
          fail-on: loi
          sarif: vi-humanizer.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with: { sarif_file: vi-humanizer.sarif }
```

Góp ý hiện ngay trên dòng trong tab *Files changed* của PR.

Pre-commit:

```yaml
repos:
  - repo: https://github.com/OWNER/vi-humanizer
    rev: v1.0.0
    hooks: [{ id: vi-humanizer }]
```

## Dùng như thư viện

```js
import { analyze, fix, compareFacts } from 'vi-humanizer';

const report = analyze(text, { preset: 'email' });
// { level, score: { value, parts }, counts: { error, warning, info }, findings[], stats }

const { ok, text: sua, edits } = fix(text, { terms: { 'phiếu lĩnh': ['phiếu xuất vật tư'] } });

const facts = compareFacts(goc, banMoi); // { ok, missing[], added[], kept }
```

Có sẵn kiểu TypeScript ([`src/index.d.ts`](src/index.d.ts)).

## Chất lượng

```bash
npm run check   # test + bộ eval + tài liệu khớp mã nguồn
```

| Ca eval | Chỉ số | Dấu hiệu | Dữ kiện giữ |
|---|---|---|---|
| email-bao-cao-su-co | 51 → 0 | 9 → 0 | 6/6 |
| gioi-thieu-san-pham | 58 → 0 | 9 → 0 | 4/4 |
| thong-bao-noi-bo | 45 → 5 | 7 → 0 | 8/8 |
| bao-cao-lanh-dao | 62 → 9 | 8 → 0 | 9/9 |
| cong-van-de-nghi | 30 → 0 | 5 → 0 | 10/10 |
| tin-nhan-zalo | 21 → 0 | 5 → 0 | 4/4 |

- Chấm bản viết lại của mô hình bạn: `node scripts/run-evals.js --candidates out.json` với `{ "<id>": "<văn bản>" }`.
- Mỗi ví dụ trong danh mục đều tự khớp quy tắc của nó, và tài liệu được sinh từ mã nguồn. Hai điều này có test canh.
- Toàn bộ tài liệu tiếng Việt của repo phải tự qua `vi-humanizer` ở mức "ít dấu hiệu"; điều này cũng có test canh.

## Phạm vi

- **Không phải công cụ phát hiện AI.** Người viết vội, người chưa quen văn trang trọng, văn bản hành chính đều có thể có những thói quen này. Không dùng kết quả để kết luận ai đã viết. Các công cụ phát hiện AI đã được chứng minh là xếp nhầm bài viết của người không bản ngữ là "do AI viết" ([Liang và cộng sự, 2023](https://arxiv.org/abs/2304.02819)).
- **Không cam kết qua mặt công cụ phát hiện AI.** Skill từ chối chèn lỗi cố ý để "trông như người viết".
- Biểu thức không hiểu nghĩa. Skill yêu cầu agent bỏ dấu hiệu sai ngữ cảnh; CLI thì báo đúng những gì đo được.
- Số viết bằng chữ ("149 nghìn") không được quy đổi. Nó bị báo thiếu để người viết xác nhận việc làm tròn là cố ý.

## Cơ sở

- Thể thức và quy tắc viết hoa văn bản hành chính: Nghị định 30/2020/NĐ-CP về công tác văn thư.
- Thiên lệch của công cụ phát hiện AI với người viết không bản ngữ: Liang W. và cộng sự, *GPT detectors are biased against non-native English writers*, Patterns, 2023.

## Đóng góp

Xem [CONTRIBUTING.md](CONTRIBUTING.md). Đóng góp có giá trị nhất là quy tắc mới kèm ví dụ thật và ca eval từ văn bản thật đã ẩn danh.

## Giấy phép

[MIT](LICENSE) © 2026 Phong Pham
