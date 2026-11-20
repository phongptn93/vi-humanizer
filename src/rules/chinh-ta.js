// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Quy tắc chính tả và trình bày tiếng Việt — dạng hàm, vì phần lớn là kiểm TÍNH NHẤT QUÁN trong cả văn bản
// (lẫn hai kiểu bỏ dấu, lẫn i/y, lẫn định dạng ngày), điều một biểu thức đơn lẻ không làm được.
//
// Mỗi quy tắc:
//   check(masked)  → [{ index, length, text }]   vị trí trên văn bản đã che vùng bảo vệ (cùng độ dài với bản gốc)
//   fix(masked)    → [{ index, length, replacement }]   tuỳ chọn; chỉ khi sửa máy móc KHÔNG đổi nghĩa
//
// Không quy tắc nào ở đây đụng tới chữ số: đổi "1,405,712" sang "1.405.712" là việc của người viết, vì nhìn một mình
// con số không biết người viết định dùng kiểu nào.

const NOT_LETTER_AFTER = '(?![\\p{L}\\p{M}])';
const NOT_LETTER_BEFORE = '(?<![\\p{L}\\p{M}])';

// ─── Kiểu bỏ dấu: "hoà" (dấu trên âm chính, kiểu mới) và "hòa" (kiểu cũ) ────────────────────────────────────
const A = 'àáảãạ';
const E = 'èéẻẽẹ';
const Y = 'ỳýỷỹỵ';
const O = 'òóỏõọ';
const U = 'ùúủũụ';

/** Cặp [kiểu mới, kiểu cũ] cho vần mở oa / oe / uy. */
const TONE_PAIRS = [];
for (let i = 0; i < 5; i++) {
  TONE_PAIRS.push([`o${A[i]}`, `${O[i]}a`], [`o${E[i]}`, `${O[i]}e`], [`u${Y[i]}`, `${U[i]}y`]);
}
const withUpper = (pairs) => pairs.flatMap(([n, o]) => [[n, o], [n.toUpperCase(), o.toUpperCase()]]);
const TONE = withUpper(TONE_PAIRS);
const NEW_TO_OLD = new Map(TONE.map(([n, o]) => [n, o]));
const OLD_TO_NEW = new Map(TONE.map(([n, o]) => [o, n]));

// Vần phải đứng cuối âm tiết ("hoà", không phải "hoàn"); "qu" là phụ âm nên "quý" không thuộc diện này.
const toneRegex = (forms) => new RegExp(`(?<![qQ])(${forms.join('|')})${NOT_LETTER_AFTER}`, 'gu');
const NEW_STYLE = toneRegex([...NEW_TO_OLD.keys()]);
const OLD_STYLE = toneRegex([...OLD_TO_NEW.keys()]);

function toneStyles(masked) {
  const neu = [...masked.matchAll(NEW_STYLE)];
  const old = [...masked.matchAll(OLD_STYLE)];
  return { neu, old };
}

// ─── i / y ──────────────────────────────────────────────────────────────────────────────────────────────────
const IY_PAIRS = [
  ['lý', 'lí'], ['kỹ', 'kĩ'], ['mỹ', 'mĩ'], ['sỹ', 'sĩ'], ['tỷ', 'tỉ'], ['ký', 'kí'], ['quý', 'quí'], ['hy vọng', 'hi vọng'],
];
const word = (w) => new RegExp(`${NOT_LETTER_BEFORE}(${w})${NOT_LETTER_AFTER}`, 'giu');

function iyConflicts(masked) {
  const out = [];
  for (const [y, i] of IY_PAIRS) {
    const ys = [...masked.matchAll(word(y))];
    const is = [...masked.matchAll(word(i))];
    if (ys.length && is.length) out.push({ y, i, ys, is });
  }
  return out;
}

function sameCase(source, target) {
  if (source === source.toUpperCase()) return target.toUpperCase();
  if (source[0] === source[0].toUpperCase()) return target[0].toUpperCase() + target.slice(1);
  return target;
}

// ─── Lặp hư từ ─────────────────────────────────────────────────────────────────────────────────────────────
// Chỉ hư từ: tiếng Việt có từ láy hợp lệ ("dần dần", "từ từ", "thường thường") nên không bắt lặp mọi từ.
const FUNCTION_WORDS = 'của|là|và|các|những|được|cho|với|trong|đã|sẽ|đang|có|không|thì|mà|này|đó|để|khi|nếu|bị|về|tại|theo';
const DOUBLED = new RegExp(`${NOT_LETTER_BEFORE}(${FUNCTION_WORDS})( +)\\1${NOT_LETTER_AFTER}`, 'giu');

// ─── Định dạng ngày ────────────────────────────────────────────────────────────────────────────────────────
const DMY = /(?<![\d/.-])(\d{1,2})\/(\d{1,2})\/(\d{4})(?![\d/])/g;
const ISO = /(?<![\d/.-])\d{4}-\d{2}-\d{2}(?![\d-])/g;

const hits = (matches) => matches.map((m) => ({ index: m.index, length: m[0].length, text: m[0] }));

export const CHINH_TA_RULES = [
  {
    id: 'CT01', slug: 'lan-kieu-bo-dau', label: 'Lẫn hai kiểu bỏ dấu (hoà / hòa)',
    fix: 'Chọn một kiểu cho cả văn bản. `vi-humanizer fix` đổi theo kiểu đang dùng nhiều hơn.',
    severity: 'warning',
    truoc: 'Hoà giải xong, sức khỏe ổn, hồ sơ hòa hợp.', sau: 'Hòa giải xong, sức khỏe ổn, hồ sơ hòa hợp.',
    check(masked) {
      const { neu, old } = toneStyles(masked);
      if (!neu.length || !old.length) return [];
      return hits(neu.length <= old.length ? neu : old); // báo phần thiểu số: đó là chỗ cần đổi
    },
    fixes(masked) {
      const { neu, old } = toneStyles(masked);
      if (!neu.length || !old.length) return [];
      const [minority, map] = neu.length <= old.length ? [neu, NEW_TO_OLD] : [old, OLD_TO_NEW];
      return minority.map((m) => ({ index: m.index, length: m[0].length, replacement: map.get(m[0]) }));
    },
  },
  {
    id: 'CT02', slug: 'lan-i-y', label: 'Lẫn i và y trong cùng một từ (lý / lí)',
    fix: 'Chọn một cách viết cho cả văn bản. `vi-humanizer fix` đổi theo cách đang dùng nhiều hơn.',
    severity: 'warning',
    truoc: 'Kỹ thuật viên lập hồ sơ kĩ thuật.', sau: 'Kỹ thuật viên lập hồ sơ kỹ thuật.',
    check(masked) {
      return iyConflicts(masked).flatMap(({ ys, is }) => hits(ys.length <= is.length ? ys : is));
    },
    fixes(masked) {
      return iyConflicts(masked).flatMap(({ y, i, ys, is }) => {
        const [minority, target] = ys.length <= is.length ? [ys, i] : [is, y];
        return minority.map((m) => ({ index: m.index, length: m[0].length, replacement: sameCase(m[0], target) }));
      });
    },
  },
  {
    id: 'CT03', slug: 'khoang-trang-dau-cau', label: 'Khoảng trắng sai quanh dấu câu',
    fix: 'Không cách trước dấu phẩy, chấm, chấm phẩy, hai chấm, chấm hỏi, chấm than; có một dấu cách sau dấu phẩy.',
    severity: 'warning',
    truoc: 'Đã giao hàng ,chờ xác nhận .', sau: 'Đã giao hàng, chờ xác nhận.',
    check(masked) {
      const before = [...masked.matchAll(/(?<=[\p{L}\p{N})"”])[ \t]+(?=[,;:!?](?=\s|$|\p{L})|\.(?=\s|$))/gmu)];
      const after = [...masked.matchAll(/(?<=[\p{L})"”][ \t]*),(?=\p{L})/gu)];
      return [...hits(before), ...hits(after)].sort((a, b) => a.index - b.index);
    },
    fixes(masked) {
      const before = [...masked.matchAll(/(?<=[\p{L}\p{N})"”])[ \t]+(?=[,;:!?](?=\s|$|\p{L})|\.(?=\s|$))/gmu)]
        .map((m) => ({ index: m.index, length: m[0].length, replacement: '' }));
      const after = [...masked.matchAll(/(?<=[\p{L})"”][ \t]*),(?=\p{L})/gu)]
        .map((m) => ({ index: m.index, length: 1, replacement: ', ' }));
      return [...before, ...after];
    },
  },
  {
    id: 'CT04', slug: 'hai-dau-cach', label: 'Nhiều dấu cách liền nhau giữa chữ',
    fix: 'Một dấu cách giữa hai chữ.',
    severity: 'info',
    truoc: 'Báo cáo  tháng 11.', sau: 'Báo cáo tháng 11.',
    check(masked) {
      return hits([...masked.matchAll(/(?<=[^\s|])[ ]{2,}(?=[^\s|])/g)]);
    },
    fixes(masked) {
      return [...masked.matchAll(/(?<=[^\s|])[ ]{2,}(?=[^\s|])/g)]
        .map((m) => ({ index: m.index, length: m[0].length, replacement: ' ' }));
    },
  },
  {
    id: 'CT05', slug: 'so-kieu-anh', label: 'Số viết kiểu Anh (1,405,712)',
    fix: 'Tiếng Việt dùng dấu chấm phân cách nghìn, dấu phẩy thập phân: 1.405.712; 12,5. Không tự sửa: cần người viết xác nhận.',
    severity: 'warning',
    truoc: 'Doanh thu 1,405,712.5 nghìn đồng.', sau: 'Doanh thu 1.405.712,5 nghìn đồng.',
    check(masked) {
      // Một nhóm "1,500" là mơ hồ (1,5 hay 1500?) nên không báo; từ hai nhóm, hoặc có phần thập phân kiểu Anh, mới báo.
      return hits([...masked.matchAll(/(?<![\d.,])\d{1,3}(?:,\d{3}){2,}(?:\.\d+)?(?![\d,])|(?<![\d.,])\d{1,3},\d{3}\.\d+(?![\d,])/g)]);
    },
  },
  {
    id: 'CT06', slug: 'ngay-kieu-my', label: 'Ngày viết kiểu Mỹ (tháng/ngày/năm)',
    fix: 'Viết ngày/tháng/năm: 25/11/2026. Không tự sửa: cần người viết xác nhận đúng ngày nào.',
    severity: 'error',
    truoc: 'Hạn nộp 11/25/2026.', sau: 'Hạn nộp 25/11/2026.',
    check(masked) {
      return hits([...masked.matchAll(DMY)].filter((m) => Number(m[2]) > 12 && Number(m[1]) <= 12));
    },
  },
  {
    id: 'CT07', slug: 'lap-tu', label: 'Lặp hư từ ("của của", "là là")',
    fix: 'Xoá từ lặp.',
    severity: 'warning',
    truoc: 'Báo cáo của của phòng kế hoạch.', sau: 'Báo cáo của phòng kế hoạch.',
    check(masked) {
      return hits([...masked.matchAll(DOUBLED)]);
    },
    fixes(masked) {
      return [...masked.matchAll(DOUBLED)].map((m) => ({ index: m.index, length: m[0].length, replacement: m[1] }));
    },
  },
  {
    id: 'CT08', slug: 'lan-dinh-dang-ngay', label: 'Lẫn hai định dạng ngày (25/11/2026 và 2026-11-25)',
    fix: 'Chọn một định dạng ngày cho cả văn bản. Trong văn bản tiếng Việt nên dùng ngày/tháng/năm.',
    severity: 'info',
    truoc: 'Từ 20/11/2026 đến 2026-11-25.', sau: 'Từ 20/11/2026 đến 25/11/2026.',
    check(masked) {
      const iso = [...masked.matchAll(ISO)];
      return iso.length && [...masked.matchAll(DMY)].length ? hits(iso) : [];
    },
  },
];

// ─── Xưng hô: chỉ bật qua preset văn bản trang trọng ──────────────────────────────────────────────────────
export const XUNG_HO_RULES = [
  {
    id: 'XH01', slug: 'xung-ban-trang-trong', label: '"Bạn" trong văn bản trang trọng',
    fix: 'Gọi "Quý cơ quan", "Quý công ty", "anh/chị", hoặc gọi theo vai trò. Xem references/xung-ho.md.',
    severity: 'off', // chỉ preset cong-van / email bật
    truoc: 'Bạn vui lòng xem xét đề nghị của Công ty.', sau: 'Đề nghị Quý Ban xem xét.',
    check(masked) {
      return hits([...masked.matchAll(new RegExp(`${NOT_LETTER_BEFORE}bạn${NOT_LETTER_AFTER}`, 'giu'))]);
    },
  },
];
