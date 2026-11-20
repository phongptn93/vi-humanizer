// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clean } from '../src/clean.js';
import { analyze } from '../src/analyze.js';
import { render } from '../scripts/gen-docs.js';

const BIN = fileURLToPath(new URL('../bin/vi-humanizer.js', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [BIN, ...args], { encoding: 'utf8' });

test('clean: NFC, ký tự ẩn, mã trích dẫn, utm của AI — không đụng câu chữ', () => {
  const input = 'Doanh thu tăng 12% citeturn0search3.\nMã\u200BSP01. Xem https://a.vn/b?utm_source=chatgpt.com và https://a.vn/c?x=1&utm_source=openai.'.normalize('NFD');
  const { text, changes } = clean(input);
  assert.equal(text, 'Doanh thu tăng 12%.\nMãSP01. Xem https://a.vn/b và https://a.vn/c?x=1.');
  assert.deepEqual(changes.map((c) => c.kind).sort(), ['citation-markup', 'nfc', 'utm', 'zero-width']);
});

test('CLI scan --format json và --fail-on', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vh-'));
  const file = join(dir, 'a.md');
  writeFileSync(file, 'Dưới đây là báo cáo. '.repeat(1) + 'Trong bối cảnh chuyển đổi số ngày nay, việc quản lý là vô cùng cần thiết. '.repeat(2)
    + 'Báo cáo được tạo bởi hệ thống một cách nhanh chóng và một cách chính xác. Điều này đóng vai trò then chốt — rõ ràng — luôn. '
    + 'Tóm lại, giải pháp đột phá. Hy vọng thông tin trên hữu ích.', 'utf8');

  const json = run('scan', file, '--format', 'json');
  assert.equal(json.status, 0);
  assert.equal(JSON.parse(json.stdout)[0].report.level, 'nhieu');

  assert.equal(run('scan', file, '--fail-on', 'ro').status, 1);
  assert.equal(run('scan', file, '--fail-on', 'bogus').status, 2);
});

test('CLI compare trả mã 1 khi lệch dữ kiện', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vh-'));
  writeFileSync(join(dir, 'a.md'), 'Đạt 1.240 sản phẩm lúc 15:20.', 'utf8');
  writeFileSync(join(dir, 'b.md'), 'Đạt khoảng 1.200 sản phẩm.', 'utf8');
  writeFileSync(join(dir, 'c.md'), 'Lúc 15:20, đạt 1240 sản phẩm.', 'utf8');
  assert.equal(run('compare', join(dir, 'a.md'), join(dir, 'b.md')).status, 1);
  assert.equal(run('compare', join(dir, 'a.md'), join(dir, 'c.md')).status, 0);
});

test('CLI scan --format sarif hợp lệ', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vh-'));
  const file = join(dir, 'a.md');
  writeFileSync(file, 'Báo cáo được tạo bởi hệ thống.', 'utf8');
  const sarif = JSON.parse(execFileSync(process.execPath, [BIN, 'scan', file, '--format', 'sarif'], { encoding: 'utf8' }));
  assert.equal(sarif.version, '2.1.0');
  assert.equal(sarif.runs[0].results[0].ruleId, 'VI22');
  assert.equal(sarif.runs[0].results[0].locations[0].physicalLocation.region.startLine, 1);
});

test('tài liệu tiếng Việt của chính repo theo đúng quy tắc của repo', () => {
  const docs = ['README.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'skills/vi-humanizer/SKILL.md',
    'templates/README.md', 'templates/system-prompt.md',
    ...['quy-tac-viet', 'the-loai', 'giong', 'xung-ho', 'van-ban-hanh-chinh', 'context-mau', 'dau-hieu']
      .map((n) => `skills/vi-humanizer/references/${n}.md`)];
  for (const doc of docs) {
    const report = analyze(readFileSync(fileURLToPath(new URL(`../${doc}`, import.meta.url)), 'utf8'));
    assert.ok(['it', 'chua-du'].includes(report.level), `${doc}: ${report.findings.map((f) => f.id).join(',')}`);
  }
});

test('con số trong README khớp với mã nguồn', async () => {
  const { ALL_RULES } = await import('../src/analyze.js');
  const readme = readFileSync(fileURLToPath(new URL('../README.md', import.meta.url)), 'utf8');
  const groups = new Set(ALL_RULES.map((r) => r.group)).size + 1; // + nhóm thuật ngữ sinh từ cấu hình
  assert.match(readme, new RegExp(`\\*\\*${ALL_RULES.length + 2} quy tắc, ${groups} nhóm\\*\\*`));
});

test('tài liệu dau-hieu.md khớp với src/patterns.js', () => {
  const file = fileURLToPath(new URL('../skills/vi-humanizer/references/dau-hieu.md', import.meta.url));
  assert.equal(readFileSync(file, 'utf8'), render(), 'Chạy: npm run docs');
});
