// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderTemplates } from '../scripts/gen-templates.js';

test('mẫu nhúng khớp với templates/system-prompt.md', () => {
  for (const [name, content] of Object.entries(renderTemplates())) {
    const file = fileURLToPath(new URL(`../templates/${name}`, import.meta.url));
    assert.equal(readFileSync(file, 'utf8'), content, `templates/${name} lệch. Chạy: npm run docs`);
  }
});

test('giong.md: năm bản theo năm giọng đều giữ đủ dữ kiện như tài liệu tuyên bố', async () => {
  const { compareFacts } = await import('../src/facts.js');
  const doc = readFileSync(fileURLToPath(new URL('../skills/vi-humanizer/references/giong.md', import.meta.url)), 'utf8');
  const goc = /Bản gốc: \*(.+?)\*/.exec(doc)[1];
  const versions = [...doc.matchAll(/^- \*\*([a-z-]+):\*\* (.+)$/gm)];
  assert.equal(versions.length, 5);
  for (const [, giong, text] of versions) {
    const r = compareFacts(goc, text);
    assert.ok(r.ok, `${giong}: thiếu ${r.missing.map((f) => f.text)} · thêm ${r.added.map((f) => f.text)}`);
  }
});

test('khối luật luôn bật đủ ngắn để nhúng vào mọi prompt', () => {
  const rules = readFileSync(fileURLToPath(new URL('../templates/system-prompt.md', import.meta.url)), 'utf8');
  assert.ok(rules.length <= 2200, `${rules.length} ký tự`);
  assert.match(rules, /giữ nguyên mọi số, ngày, mã, tên riêng/);
});
