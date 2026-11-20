// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Chạy bộ eval: mỗi ca có một bản gốc đầy văn mẫu và một bản viết lại mẫu.
// Đạt khi: bản gốc ở mức "ro"/"nhieu", bản viết lại ở mức "it" hoặc "chua-du", và dữ kiện được giữ đủ.
//
// Bản viết lại ở đây là CHUẨN THAM CHIẾU do người biên tập. Muốn đo một mô hình: sinh bản viết lại của nó cho từng
// `goc`, ghi vào `--candidates <tệp.json>` dạng { "<id>": "<văn bản>" }, rồi chạy lại script với tuỳ chọn đó.

import { readFileSync } from 'node:fs';
import { analyze, LEVEL_LABEL } from '../src/analyze.js';
import { compareFacts } from '../src/facts.js';

const cases = JSON.parse(readFileSync(new URL('../evals/cases.json', import.meta.url), 'utf8'));
const flag = process.argv.indexOf('--candidates');
const candidates = flag > 0 ? JSON.parse(readFileSync(process.argv[flag + 1], 'utf8')) : null;

let failed = 0;
const counted = new Set();
const failedCounted = (id) => counted.has(id);
const rows = [];
for (const c of cases) {
  const rewrite = candidates ? candidates[c.id] : c.vietLai;
  if (rewrite == null) { rows.push([c.id, '—', '—', 'thiếu bản viết lại']); failed++; continue; }

  const before = analyze(c.goc, { minWords: 20 });
  const after = analyze(rewrite, { minWords: 20 });
  const facts = compareFacts(c.goc, rewrite);

  const problems = [];
  if (!candidates && !['ro', 'nhieu'].includes(before.level)) problems.push(`bản gốc chỉ ở mức ${before.level}`);
  if (!['it', 'chua-du'].includes(after.level)) problems.push(`bản viết lại còn ${after.signalCount} dấu hiệu: ${after.findings.map((f) => f.id).join(',')}`);
  if (facts.missing.length) problems.push(`thiếu ${facts.missing.map((f) => f.text).join(', ')}`);
  if (facts.added.length) problems.push(`thêm ${facts.added.map((f) => f.text).join(', ')}`);
  if (problems.length) { failed++; counted.add(c.id); }

  const s = (r) => (r.score ? r.score.value : '—');
  if (!candidates && before.score && after.score) {
    if (before.score.value <= 20) problems.push(`chỉ số bản gốc chỉ ${before.score.value}`);
    if (after.score.value > 10) problems.push(`chỉ số bản viết lại ${after.score.value} > 10`);
    if (before.score.value - after.score.value < 15) problems.push('chỉ số giảm chưa tới 15 điểm');
  }
  if (problems.length && !failedCounted(c.id)) failed++;

  rows.push([
    c.id,
    `${s(before)} → ${s(after)}`,
    `${before.signalCount} → ${after.signalCount}`,
    `${facts.kept}/${facts.kept + facts.missing.length}`,
    problems.length ? `✘ ${problems.join('; ')}` : `✔ ${LEVEL_LABEL[after.level]}`,
  ]);
}

const header = ['Ca', 'Chỉ số', 'Dấu hiệu', 'Dữ kiện giữ', 'Kết quả'];
const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
const line = (r) => r.map((cell, i) => String(cell).padEnd(widths[i])).join('  ');
console.log(line(header));
console.log(widths.map((w) => '─'.repeat(w)).join('  '));
rows.forEach((r) => console.log(line(r)));
console.log(`\n${cases.length - failed}/${cases.length} ca đạt`);
process.exitCode = failed ? 1 : 0;
