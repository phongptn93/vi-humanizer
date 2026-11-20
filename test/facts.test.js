// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalNumber, compareFacts, extractFacts } from '../src/facts.js';
import { fix } from '../src/fix.js';

test('đọc số theo quy ước Việt Nam', () => {
  const cases = {
    '1.405.712': '1405712',
    '1405712': '1405712',
    '1,405,712.5': '1405712.5',
    '39,8': '39.8',
    '1.500': '1500',
    '12.6': '12.6',
    '−21.523': '-21523',
    '1.2.3': '1.2.3', // số phiên bản: giữ nguyên chữ
  };
  for (const [raw, expected] of Object.entries(cases)) assert.equal(canonicalNumber(raw), expected, raw);
});

test('viết lại khác định dạng vẫn tính là giữ dữ kiện', () => {
  const r = compareFacts(
    'Ngày 05/11/2026 xưởng đạt 1.405.712 sản phẩm, tăng 12,6% so với kế hoạch của lệnh LSX-2026-118.',
    'Lệnh LSX-2026-118 đạt 1405712 sản phẩm ngày 5/11/2026, vượt kế hoạch 12,6 %.',
  );
  assert.ok(r.ok, JSON.stringify(r));
});

test('số bị làm tròn thì thiếu, số tự thêm thì bị báo thêm', () => {
  const r = compareFacts(
    'Sản lượng giảm 21.523 sản phẩm (−12,6%) ở chuyền ATN7.',
    'Sản lượng giảm khoảng 13% ở chuyền ATN7, chủ yếu trong 3 ngày cuối tháng.',
  );
  assert.ok(r.missing.some((f) => f.text === '21.523'));
  assert.ok(r.missing.some((f) => f.kind === 'percent'));
  assert.ok(r.added.some((f) => f.text === '13%'));
  assert.ok(r.added.some((f) => f.text === '3'));
  assert.ok(!r.missing.some((f) => f.text === 'ATN7'));
});

test('ngày ISO, giờ, URL, email được đối chiếu', () => {
  const r = compareFacts(
    'Họp lúc 14:30 ngày 2026-11-20, tài liệu tại https://nois.vn/a, liên hệ lan@nois.vn.',
    'Họp 14h30 ngày 20/11/2026, tài liệu tại https://nois.vn/a.',
  );
  assert.deepEqual(r.missing.map((f) => f.text), ['lan@nois.vn']);
  assert.equal(r.added.length, 0);
});

test('ngày không bị đọc thành hai con số', () => {
  const kinds = extractFacts('Giao ngày 12/10.').map((f) => f.kind);
  assert.deepEqual(kinds, ['date']);
});

test('viết tắt và mã được rút; chữ thường thì không', () => {
  const texts = extractFacts('Chỉ số OEE của máy CNC-02 trong LSX mới, sp đạt.').map((f) => f.text);
  assert.ok(texts.includes('OEE'));
  assert.ok(texts.includes('CNC-02'));
  assert.ok(texts.includes('LSX'));
  assert.ok(!texts.includes('sp'));
});

test('ký tự vô hình không làm đổi dữ kiện; fix dọn được mà không bị từ chối', () => {
  const zwsp = String.fromCharCode(0x200B);
  assert.equal(compareFacts(`Mã${zwsp}SP01 đạt 5.`, 'MãSP01 đạt 5.').ok, true);
  const r = fix(`Mã${zwsp}SP01 xong.`);
  assert.equal(r.ok, true);
  assert.ok(!r.text.includes(zwsp));
});
