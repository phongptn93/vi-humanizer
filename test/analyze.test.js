// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze } from '../src/analyze.js';
import { PATTERNS, compile } from '../src/patterns.js';

const TEMPLATE_HEAVY = `Dưới đây là tổng quan về hệ thống. Trong bối cảnh chuyển đổi số ngày nay, việc quản lý dữ liệu là vô cùng cần thiết.
Hệ thống không chỉ giúp tiết kiệm thời gian mà còn nâng tầm hiệu quả vận hành. Báo cáo được tạo tự động bởi hệ thống một cách nhanh chóng và một cách chính xác.
Điều này đóng vai trò then chốt. Điều này giúp doanh nghiệp bứt phá. Điều này là chìa khoá thành công.
Hệ thống không chỉ hiện đại mà còn vô cùng thân thiện, hết sức dễ dùng — nhanh hơn — và tốt hơn.
Tóm lại, đây là giải pháp toàn diện. Hy vọng thông tin trên hữu ích. Đừng ngần ngại liên hệ nếu bạn cần thêm hỗ trợ.`;

const PLAIN_EMAIL = `Chào anh Minh,

Ca 2 hôm qua máy ép số 3 dừng 45 phút do kẹt khuôn. Tổ bảo trì đã tháo khuôn, vệ sinh và chạy lại lúc 15:20. Sản lượng ca đạt 1.240 sản phẩm, thiếu 160 so với kế hoạch.

Em đề nghị kiểm khuôn trước mỗi ca trong tuần này. Nếu anh đồng ý, em báo tổ trưởng triển khai từ sáng mai. Chi phí phát sinh không đáng kể vì dùng vật tư sẵn có.

Em Lan`;

const ids = (report) => new Set(report.findings.map((f) => f.id));

test('văn mẫu dày đặc bị xếp mức "nhieu" với nhiều dấu hiệu khác nhau', () => {
  const report = analyze(TEMPLATE_HEAVY);
  assert.equal(report.level, 'nhieu');
  for (const id of ['VI01', 'VI03', 'VI04', 'VI10', 'VI12', 'VI13', 'VI14', 'VI20', 'VI22', 'VI25', 'VI30', 'VI40']) {
    assert.ok(ids(report).has(id), `thiếu ${id}`);
  }
});

test('email công việc bình thường không bị gắn cờ', () => {
  const report = analyze(PLAIN_EMAIL);
  assert.equal(report.level, 'it');
  assert.ok(report.signalCount <= 1, [...ids(report)].join(','));
});

test('văn bản ngắn không kết luận mức', () => {
  assert.equal(analyze('Dưới đây là kết quả.').level, 'chua-du');
});

test('một chữ "vô cùng" chưa phải thói quen', () => {
  assert.ok(!ids(analyze('Kết quả tháng này vô cùng khả quan.')).has('VI14'));
  assert.ok(ids(analyze('Vô cùng tốt. Hết sức nhanh. Cực kỳ gọn.')).has('VI14'));
});

test('chữ dạng tổ hợp (NFD) được báo và vẫn quét đúng', () => {
  const report = analyze('Bộ phận này đóng vai trò quan trọng.'.normalize('NFD'));
  const nfd = report.findings.find((f) => f.id === 'VI63');
  assert.ok(nfd && !nfd.signal);
  assert.ok(ids(report).has('VI10'));
});

test('khối mã, trích dẫn và URL không bị góp ý', () => {
  const text = [
    '> Việc kiểm tra định kỳ là vô cùng cần thiết (trích quy chế).',
    '```',
    'được tạo bởi generator — đừng sửa — nhé',
    '```',
    'Xem `một cách nhanh chóng` tại https://vi.wikipedia.org/wiki/một-cách.',
  ].join('\n');
  const found = ids(analyze(text));
  for (const id of ['VI21', 'VI22', 'VI40', 'VI20']) assert.ok(!found.has(id), `không được báo ${id}`);
});

test('văn bản giữa hai khối mã vẫn được quét (không ghép nhầm cặp ```)', () => {
  const text = 'Mở.\n\n```\na\n```\n\nBáo cáo được tạo bởi hệ thống.\n\n```\nb\n```\n';
  assert.ok(ids(analyze(text)).has('VI22'));
});

test('vùng tắt quét và frontmatter không bị góp ý', () => {
  const text = [
    '---',
    'description: Bỏ "đóng vai trò then chốt", "được … bởi"',
    '---',
    '<!-- vi-humanizer-disable -->',
    'Ví dụ xấu: báo cáo được tạo bởi hệ thống.',
    '<!-- vi-humanizer-enable -->',
    'Hệ thống tạo báo cáo.',
  ].join('\n');
  const found = ids(analyze(text));
  assert.ok(!found.has('VI22'));
  assert.ok(!found.has('VI10'));
  assert.ok(ids(analyze('<!-- vi-humanizer-enable -->\nBáo cáo được tạo bởi hệ thống.')).has('VI22'));
});

test('che vùng bảo vệ không tạo lỗi khoảng trắng giả', () => {
  const found = ids(analyze('Đọc đúng `1.405.712`, `39,8`; xem `a` `b` và https://x.vn/a, rồi lưu.'));
  assert.ok(!found.has('CT03'));
  assert.ok(!found.has('CT04'));
  // Hai dấu cách THẬT giữa hai đoạn mã vẫn là lỗi thật.
  assert.ok(ids(analyze('Xem `a`  `b`.')).has('CT04'));
});

test('rò rỉ kỹ thuật vẫn tôn trọng vùng tắt quét', () => {
  const text = '<!-- vi-humanizer-disable -->\nVí dụ: citeturn0search1\n<!-- vi-humanizer-enable -->';
  assert.ok(!ids(analyze(text)).has('VI60'));
});

test('rò rỉ kỹ thuật bắt được cả trong URL', () => {
  const found = ids(analyze('Nguồn citeturn0search1, xem https://example.com/a?utm_source=chatgpt.com. Kính gửi [Tên công ty].'));
  for (const id of ['VI60', 'VI61', 'VI52']) assert.ok(found.has(id), id);
});

test('tiêu đề viết hoa mọi chữ bị báo; viết thường và chữ viết tắt thì không', () => {
  const vs04 = analyze('# Kế Hoạch Sản Xuất Tháng 11\n\n## Kế hoạch tháng 11\n\n## BÁO CÁO OEE QUÝ').findings.find((f) => f.id === 'VS04');
  assert.equal(vs04.count, 1);
  assert.equal(vs04.matches[0].line, 1);
});

test('câu dài đều nhau bị báo', () => {
  const uniform = Array(8).fill('Hệ thống ghi nhận dữ liệu của từng ca làm việc mỗi ngày.').join(' ');
  assert.ok(ids(analyze(uniform)).has('VS01'));
});

test('gạch nối "–" trong cặp và khoảng không bị báo, gạch dài "—" thì có', () => {
  assert.ok(!ids(analyze('Tuyến Hà Nội – Hải Phòng, giai đoạn 2020 – 2025, xưng em – gọi anh.')).has('VI40'));
  assert.ok(ids(analyze('Báo cáo — cập nhật hằng ngày — giúp lãnh đạo.')).has('VI40'));
});

test('lẫn hai kiểu ngoặc kép mới báo VI42', () => {
  assert.ok(!ids(analyze('Chọn “Lưu” rồi “Gửi”.')).has('VI42'));
  assert.ok(ids(analyze('Chọn “Lưu” rồi bấm "Gửi".')).has('VI42'));
});

test('--ignore bỏ qua đúng dấu hiệu', () => {
  assert.ok(!ids(analyze(TEMPLATE_HEAVY, { ignore: ['vi10'] })).has('VI10'));
});

test('vị trí dòng/cột trỏ đúng chỗ', () => {
  const report = analyze('Dòng một bình thường.\nBáo cáo được tạo bởi hệ thống.');
  const m = report.findings.find((f) => f.id === 'VI22').matches[0];
  assert.equal(m.line, 2);
  assert.equal(m.column, 9);
});

test('vị trí trỏ vào chữ đầu tiên, không vào dấu chấm của câu trước', () => {
  const m = analyze('Dòng một.\n\nNhìn chung, mọi thứ ổn.').findings.find((f) => f.id === 'VI04').matches[0];
  assert.deepEqual([m.line, m.column, m.text], [3, 1, 'Nhìn chung,']);
});

test('mã dấu hiệu là duy nhất và mọi biểu thức biên dịch được', () => {
  const all = PATTERNS.map((p) => p.id);
  assert.equal(new Set(all).size, all.length);
  for (const p of PATTERNS) assert.doesNotThrow(() => compile(p), p.id);
});

test('ví dụ "trước" của mỗi dấu hiệu tự bắt được chính nó', () => {
  // Ví dụ trong tài liệu phải là ví dụ thật: nếu biểu thức không bắt được câu minh hoạ thì một trong hai đang sai.
  for (const p of PATTERNS) {
    if (p.id === 'VI42') continue; // cần ngữ cảnh lẫn hai kiểu, đã có test riêng
    const hits = [...p.truoc.normalize('NFC').matchAll(compile(p))].length;
    assert.ok(hits >= (p.minCount ?? 1), `${p.id}: ví dụ "${p.truoc}" chỉ khớp ${hits} lần`);
  }
});
