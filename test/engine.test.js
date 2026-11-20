// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, resolveSeverities, ALL_RULES } from '../src/analyze.js';
import { fix } from '../src/fix.js';
import { compareFacts, extractFacts } from '../src/facts.js';
import { CHINH_TA_RULES } from '../src/rules/chinh-ta.js';

const ids = (r) => new Set(r.findings.map((f) => f.id));
const find = (r, id) => r.findings.find((f) => f.id === id);

// ─── Sổ quy tắc và mức nghiêm trọng ─────────────────────────────────────────────────────────────────

test('mọi quy tắc có mã và tên duy nhất', () => {
  const idsList = ALL_RULES.map((r) => r.id);
  const slugs = ALL_RULES.map((r) => r.slug);
  assert.equal(new Set(idsList).size, idsList.length);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/, s);
});

test('cấu hình nhận cả mã lẫn tên; preset đổi mức; tên sai thì báo lỗi rõ', () => {
  const sev = resolveSeverities({ preset: 'cong-van', rules: { 'mot-cach': 'error', vi14: 'off' } });
  assert.equal(sev.get('VI20'), 'error');
  assert.equal(sev.get('VI14'), 'off');
  assert.equal(sev.get('XH01'), 'error');
  assert.throws(() => resolveSeverities({ rules: { 'khong-co': 'error' } }), /không có quy tắc/);
  assert.throws(() => resolveSeverities({ rules: { VI20: 'nang' } }), /phải là/);
  assert.throws(() => resolveSeverities({ preset: 'tho' }), /preset/);
});

test('preset công văn bắt "bạn"; mặc định thì không', () => {
  const text = 'Bạn vui lòng xem xét đề nghị của Công ty.';
  assert.ok(!ids(analyze(text)).has('XH01'));
  assert.equal(find(analyze(text, { preset: 'cong-van' }), 'XH01').severity, 'error');
});

test('chính tả không làm tăng chỉ số văn mẫu', () => {
  const r = analyze('Hoà giải xong. Sức khỏe ổn. Hồ sơ hòa hợp. Báo cáo của của phòng.');
  assert.ok(ids(r).has('CT01'));
  assert.ok(ids(r).has('CT07'));
  assert.equal(r.signalCount, 0);
});

// ─── Chính tả, trình bày ─────────────────────────────────────────────────────────────────────────

test('ví dụ "trước" của mỗi quy tắc chính tả tự bắt được chính nó', () => {
  for (const rule of CHINH_TA_RULES) {
    assert.ok(rule.check(rule.truoc.normalize('NFC')).length > 0, `${rule.id}: "${rule.truoc}"`);
  }
});

test('CT01 báo phần thiểu số; "quý" và vần có phụ âm cuối không dính', () => {
  const r = analyze('Hòa giải, hòa hợp, hòa bình, hoà nhã. Quý khách, hoàn thành.');
  const ct01 = find(r, 'CT01');
  assert.equal(ct01.count, 1);
  assert.equal(ct01.matches[0].text, 'oà');
  assert.ok(!ids(analyze('Quý khách hòa hợp, khỏe mạnh, thủy lợi.')).has('CT01'));
});

test('CT05 không báo "1,500" (mơ hồ) nhưng báo "1,405,712"', () => {
  assert.ok(!ids(analyze('Khối lượng 1,500 kg.')).has('CT05'));
  assert.ok(ids(analyze('Doanh thu 1,405,712 đồng.')).has('CT05'));
});

test('CT06 bắt ngày kiểu Mỹ, không bắt ngày Việt Nam', () => {
  assert.ok(ids(analyze('Hạn nộp 11/25/2026.')).has('CT06'));
  assert.ok(!ids(analyze('Hạn nộp 25/11/2026, họp 05/12/2026.')).has('CT06'));
});

test('CT07 không bắt từ láy hợp lệ', () => {
  assert.ok(!ids(analyze('Dần dần ổn định, từ từ làm, thường thường là vậy.')).has('CT07'));
});

test('từ cấm và thuật ngữ trong cấu hình được cưỡng chế', () => {
  const opts = { banned: ['hệ sinh thái'], terms: { 'phiếu lĩnh': ['phiếu xuất vật tư'] } };
  const r = analyze('Hệ sinh thái mới. Lập Phiếu xuất vật tư cho ca 2.', opts);
  assert.ok(ids(r).has('TN01'));
  assert.equal(find(r, 'TN02').matches[0].text, 'Phiếu xuất vật tư → phiếu lĩnh');
});

// ─── Sửa tự động ──────────────────────────────────────────────────────────────────────────────────

test('fix: sửa phần chắc chắn đúng và giữ đủ dữ kiện', () => {
  const input = 'Tiến hành công tác kiểm tra lô 1.240 sản phẩm ,xử lý một cách nhanh chóng.\nHoà giải xong, hòa hợp, hòa bình. Báo cáo của của phòng  kế hoạch.';
  const r = fix(input);
  assert.ok(r.ok);
  assert.equal(r.text, 'Kiểm tra lô 1.240 sản phẩm, xử lý nhanh.\nHòa giải xong, hòa hợp, hòa bình. Báo cáo của phòng kế hoạch.');
  assert.ok(r.facts.ok);
  assert.deepEqual([...new Set(r.edits.map((e) => e.id))].sort(), ['CT01', 'CT03', 'CT04', 'CT07', 'VI20', 'VI23']);
});

test('fix: không đụng khối mã, trích dẫn; quy tắc tắt thì không sửa', () => {
  const input = '> trích: một cách nhanh chóng\n```\nhoà  ,\n```\nLàm một cách nhanh chóng.';
  assert.equal(fix(input).text, '> trích: một cách nhanh chóng\n```\nhoà  ,\n```\nLàm nhanh.');
  assert.equal(fix(input, { rules: { 'mot-cach': 'off' } }).text, input);
});

test('fix: áp thuật ngữ đã chốt, giữ hoa đầu câu', () => {
  const r = fix('Phiếu xuất vật tư đã duyệt.', { terms: { 'phiếu lĩnh': ['phiếu xuất vật tư'] } });
  assert.equal(r.text, 'Phiếu lĩnh đã duyệt.');
});

// ─── Dữ kiện: tên riêng ───────────────────────────────────────────────────────────────────────────

test('tên riêng: bắt tên bị bịa thêm, bỏ qua chữ hoa đầu câu', () => {
  const r = compareFacts('Chào anh, ca 2 dừng 45 phút.', 'Chào anh Minh, ca 2 dừng 45 phút. Em Lan');
  assert.ok(r.added.some((f) => f.kind === 'name' && f.text === 'Minh'), JSON.stringify(r.added));
  const names = extractFacts('Kính gửi Ban Quản lý Khu công nghiệp Tân Bình. Công ty TNHH An Phát đề nghị.')
    .filter((f) => f.kind === 'name').map((f) => f.text);
  assert.ok(names.includes('Tân Bình'));
  assert.ok(names.includes('An Phát'));
  assert.ok(!names.some((n) => n.startsWith('Kính')));
});

test('tiêu đề viết hoa mọi chữ không bị coi là tên riêng', () => {
  assert.equal(extractFacts('# Thông Báo Về Việc Bảo Trì\nNội dung.').filter((f) => f.kind === 'name').length, 0);
});

// ─── Chỉ số văn mẫu ───────────────────────────────────────────────────────────────────────────────

test('chỉ số: có từng thành phần, tổng khớp, văn ngắn thì không chấm', () => {
  assert.equal(analyze('Ngắn quá.').score, null);
  const r = analyze(Array(10).fill('Trong bối cảnh chuyển đổi số ngày nay, việc quản lý là vô cùng cần thiết.').join(' '));
  const sum = Object.values(r.score.parts).reduce((s, p) => s + p.value, 0);
  assert.equal(r.score.value, Math.round(sum));
  assert.ok(r.score.value >= 40, String(r.score.value));
  for (const p of Object.values(r.score.parts)) assert.ok(p.value <= p.max);
});
