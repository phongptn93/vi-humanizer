// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Sinh tài liệu từ mã nguồn (nguồn duy nhất):
//   skills/vi-humanizer/references/dau-hieu.md   danh mục quy tắc
//   templates/*                                   mẫu nhúng (qua gen-templates.js)
//   node scripts/gen-docs.js           ghi tệp
//   node scripts/gen-docs.js --check   thoát mã 1 nếu lệch (dùng trong CI)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { GROUPS, PATTERNS } from '../src/patterns.js';
import { STRUCTURAL_RULES } from '../src/analyze.js';
import { CHINH_TA_RULES, XUNG_HO_RULES } from '../src/rules/chinh-ta.js';
import { PRESETS } from '../src/presets.js';
import { SCORE_WEIGHTS, SCORE_BANDS } from '../src/score.js';

const target = fileURLToPath(new URL('../skills/vi-humanizer/references/dau-hieu.md', import.meta.url));
const SEV = { error: 'lỗi', warning: 'cảnh báo', info: 'gợi ý', off: 'tắt (bật qua preset)' };

function ruleBlock(r, extra = []) {
  const threshold = (r.minCount ?? 1) > 1 ? ` · ≥ ${r.minCount} lần` : '';
  const out = [`### ${r.id} \`${r.slug}\` · ${r.label}`, '', `*${SEV[r.severity]}${threshold}${r.signal === false ? ' · không tính vào chỉ số văn mẫu' : ''}*`, ''];
  if (r.truoc) out.push(`- ❌ ${visible(r.truoc)}`, `- ✅ ${visible(r.sau)}`);
  out.push(...extra, `- **Sửa:** ${r.fix}`);
  if (r.note) out.push(`- **Lưu ý:** ${r.note}`);
  out.push('');
  return out;
}

/** Một dòng; ký tự ẩn hiện thành ⟨U+200B⟩ để người đọc thấy được (và tài liệu không mang ký tự ẩn). */
function visible(s) {
  return s.replace(/\n/g, ' / ')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, (c) => `⟨U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}⟩`);
}

const STRUCTURAL_DETAIL = {
  VS01: '- Đo: từ 6 câu và hệ số biến thiên độ dài câu dưới 0,25.',
  VS02: '- Đo: từ 4 cụm in đậm và nhiều hơn một cụm mỗi 40 chữ.',
  VS03: '- Đo: từ 6 dòng và ít nhất 70% là gạch đầu dòng.',
  VS04: '- ❌ `# Kế Hoạch Sản Xuất Tháng 11` · ✅ `# Kế hoạch sản xuất tháng 11` (Nghị định 30/2020/NĐ-CP, Phụ lục II).',
  VI63: '- Thường do chép từ macOS hoặc PDF.',
};

export function render() {
  const out = [
    '# Danh mục quy tắc',
    '',
    '<!-- Tệp sinh tự động từ src/ — sửa ở đó rồi chạy `npm run docs`. -->',
    '',
    'Mỗi quy tắc có mã cố định (`VI20`) và tên (`mot-cach`). Cấu hình, `--ignore`, `--rule` nhận cả hai.',
    'Mức mặc định: lỗi (sai sự thật, lộ rò rỉ: phải sửa), cảnh báo (văn mẫu: nên sửa), gợi ý (nên biết).',
    'Preset theo thể loại chỉnh mức của từng quy tắc, xem cuối tệp.',
    '',
    '<!-- Danh mục trích văn mẫu làm ví dụ ❌, nên tắt quét toàn tệp. -->',
    '<!-- vi-humanizer-disable -->',
    '',
  ];

  for (const [group, title] of Object.entries(GROUPS)) {
    const items = PATTERNS.filter((p) => p.group === group);
    if (!items.length) continue;
    out.push(`## ${title}`, '');
    for (const p of items) out.push(...ruleBlock(p));
  }

  out.push('## Cấu trúc (đo bằng số)', '');
  for (const r of STRUCTURAL_RULES) out.push(...ruleBlock(r, [STRUCTURAL_DETAIL[r.id]]));

  out.push('## Chính tả, trình bày', '', 'Kiểm tính nhất quán trong cả văn bản. Không tính vào chỉ số văn mẫu: lỗi chính tả không làm văn bản "giống văn mẫu" hơn.', '');
  for (const r of CHINH_TA_RULES) out.push(...ruleBlock({ ...r, signal: false }, [r.fixes ? '- **`fix` tự sửa:** có' : '- **`fix` tự sửa:** không (cần người viết xác nhận)']));

  out.push('## Xưng hô', '');
  for (const r of XUNG_HO_RULES) out.push(...ruleBlock({ ...r, signal: false }));

  out.push('## Thuật ngữ của tổ chức', '',
    'Sinh từ `.vihumanizerrc.json`:', '',
    '- **TN01 `tu-cam`:** cụm trong `banned`.',
    '- **TN02 `thuat-ngu`:** chữ không dùng trong `terms` (vd `{ "phiếu lĩnh": ["phiếu xuất vật tư"] }`). `fix` tự thay, giữ hoa đầu câu.', '');

  out.push('## Chỉ số văn mẫu', '',
    'Tổng 0–100, tất định. Không phải xác suất "do AI viết".', '',
    '| Thành phần | Tối đa | Đo |', '|---|---|---|',
    `| Khuôn sáo | ${SCORE_WEIGHTS.khuonSao} | dấu hiệu khác nhau (trừ định dạng); lỗi ×1,5, cảnh báo ×1, gợi ý ×0,5; bão hoà ở 8 |`,
    `| Nhịp câu | ${SCORE_WEIGHTS.nhipCau} | hệ số biến thiên độ dài câu: 0,55 trở lên = 0, 0,15 trở xuống = tối đa (cần ≥ 4 câu) |`,
    `| Lặp cụm | ${SCORE_WEIGHTS.lapCum} | tỷ lệ cụm 3 âm tiết lặp lại: 3% = 0, 20% = tối đa |`,
    `| Từ vựng | ${SCORE_WEIGHTS.tuVung} | MATTR trên cặp âm tiết (cửa sổ 40): 0,97 = 0, 0,80 = tối đa |`,
    `| Định dạng | ${SCORE_WEIGHTS.dinhDang} | dấu hiệu định dạng; bão hoà ở 3 |`, '',
    `Dải: ${SCORE_BANDS.map((b, i) => `${i === 0 ? 0 : SCORE_BANDS[i - 1].max + 1}–${b.max} ${b.label}`).join(' · ')}. Hiệu chỉnh trên bộ eval của repo.`, '');

  out.push('## Preset theo thể loại', '', '| Preset | Thể loại | Chữ tối thiểu | Chỉnh mức |', '|---|---|---|---|');
  for (const [name, p] of Object.entries(PRESETS)) {
    const rules = Object.entries(p.rules).map(([id, sev]) => `${id} ${SEV[sev] ?? sev}`).join(', ');
    out.push(`| \`${name}\` | ${p.label} | ${p.minWords ?? 60} | ${rules} |`);
  }
  out.push('', '## Vùng không quét', '',
    'Frontmatter YAML, vùng giữa `<!-- vi-humanizer-disable -->` và `<!-- vi-humanizer-enable -->`, khối mã, mã trong dòng, dòng trích dẫn (`> …`), URL và chú thích HTML được che trước khi quét, trừ nhóm rò rỉ kỹ thuật.', '');
  return out.join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check = process.argv.includes('--check');
  const content = render();
  const templates = fileURLToPath(new URL('./gen-templates.js', import.meta.url));
  if (check) {
    const current = existsSync(target) ? readFileSync(target, 'utf8') : '';
    if (current !== content) {
      process.stderr.write('dau-hieu.md lệch với mã nguồn. Chạy: npm run docs\n');
      process.exit(1);
    }
    execFileSync(process.execPath, [templates, '--check'], { stdio: 'inherit' });
    process.stdout.write('Tài liệu khớp với mã nguồn.\n');
  } else {
    writeFileSync(target, content, 'utf8');
    execFileSync(process.execPath, [templates], { stdio: 'inherit' });
    process.stdout.write('Đã sinh dau-hieu.md và templates/.\n');
  }
}
