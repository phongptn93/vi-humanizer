// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Sửa tự động CÓ CHỨNG MINH: chỉ áp những sửa máy móc không đổi nghĩa, rồi đối chiếu dữ kiện giữa bản trước và bản
// sau. Lệch một dữ kiện là từ chối toàn bộ, không ghi gì. Phần cần phán đoán (mở bài, sáo ngữ, nhịp câu) để cho người
// hoặc agent viết lại; máy chỉ làm phần chắc chắn đúng.

import { clean } from './clean.js';
import { resolveSeverities } from './analyze.js';
import { CHINH_TA_RULES } from './rules/chinh-ta.js';
import { termRules } from './rules/thuat-ngu.js';
import { compareFacts } from './facts.js';
import { maskProtected, makeLocator } from './text.js';

// "một cách + tính từ" → tính từ. Chỉ những tính từ đã kiểm là bỏ "một cách" vẫn đúng nghĩa.
const MOT_CACH = {
  'nhanh chóng': 'nhanh', 'chính xác': 'chính xác', 'hiệu quả': 'hiệu quả', 'dễ dàng': 'dễ dàng', 'rõ ràng': 'rõ ràng',
  'chi tiết': 'chi tiết', 'đầy đủ': 'đầy đủ', 'kịp thời': 'kịp thời', 'liên tục': 'liên tục', 'tự động': 'tự động',
  'an toàn': 'an toàn', 'chủ động': 'chủ động', 'linh hoạt': 'linh hoạt', 'thường xuyên': 'thường xuyên',
  'nghiêm túc': 'nghiêm túc', 'cẩn thận': 'cẩn thận', 'nhanh nhất': 'nhanh nhất',
};
const MOT_CACH_RE = new RegExp(`(?<![\\p{L}\\p{M}])(một cách) (${Object.keys(MOT_CACH).join('|')})(?![\\p{L}\\p{M}])`, 'giu');
const TIEN_HANH_RE = /(?<![\p{L}\p{M}])(thực hiện|tiến hành) (việc|công tác) (?=\p{L})/giu;

const upperFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const isUpper = (c) => c !== c.toLowerCase() && c === c.toUpperCase();

const PHRASE_FIXERS = [
  {
    id: 'VI20',
    fixes: (masked) => [...masked.matchAll(MOT_CACH_RE)].map((m) => {
      const out = MOT_CACH[m[2].toLowerCase()] ?? m[2];
      return { index: m.index, length: m[0].length, replacement: isUpper(m[0][0]) ? upperFirst(out) : out };
    }),
  },
  {
    id: 'VI23',
    // "Tiến hành công tác kiểm tra" → "Kiểm tra": bỏ cụm thừa, giữ hoa đầu câu ở chữ kế tiếp.
    fixes: (masked) => [...masked.matchAll(TIEN_HANH_RE)].map((m) => {
      const next = masked[m.index + m[0].length];
      return { index: m.index, length: m[0].length + 1, replacement: isUpper(m[0][0]) ? next.toUpperCase() : next };
    }),
  },
];

/**
 * @param {string} input
 * @param {object} [options] cùng dạng với analyze (preset, rules, ignore, terms)
 * @returns {{ok:boolean, text:string, edits:Array<{id:string,line:number,before:string,after:string}>,
 *            facts:object, reason?:string}}
 */
export function fix(input, options = {}) {
  const original = input ?? '';
  const cleaned = clean(original);
  let text = cleaned.text;
  const edits = cleaned.changes.map((c) => ({ id: CLEAN_IDS[c.kind], line: 0, before: c.kind, after: `×${c.count}` }));

  const extra = termRules(options);
  const severity = resolveSeverities(options, extra.map((r) => ({ ...r, group: 'thuat-ngu', signal: false })));
  const fixers = [...CHINH_TA_RULES, ...extra, ...PHRASE_FIXERS]
    .filter((r) => r.fixes && severity.get(r.id) !== 'off');

  const masked = maskProtected(text);
  const planned = fixers.flatMap((r) => r.fixes(masked).map((e) => ({ ...e, id: r.id })))
    .filter((e) => text.slice(e.index, e.index + e.length) !== e.replacement)
    .sort((a, b) => a.index - b.index || b.length - a.length);

  // Hai sửa chồng lên nhau thì giữ cái đứng trước; cái sau sẽ được áp ở lần chạy kế.
  const accepted = [];
  let end = -1;
  for (const e of planned) {
    if (e.index < end) continue;
    accepted.push(e);
    end = e.index + e.length;
  }

  const locate = makeLocator(text);
  for (const e of accepted) {
    const { line } = locate(e.index);
    edits.push({ id: e.id, line, before: text.slice(e.index, e.index + e.length), after: e.replacement });
  }
  for (const e of [...accepted].reverse()) {
    text = text.slice(0, e.index) + e.replacement + text.slice(e.index + e.length);
  }

  const facts = compareFacts(original, text);
  if (!facts.ok) {
    return { ok: false, text: original, edits: [], facts, reason: 'Sửa tự động làm đổi dữ kiện; không áp dụng thay đổi nào.' };
  }
  return { ok: true, text, edits, facts };
}

const CLEAN_IDS = { nfc: 'VI63', 'zero-width': 'VI62', 'citation-markup': 'VI60', utm: 'VI61' };

/** Diff theo dòng (sửa tự động không thêm, không bớt dòng). */
export function lineDiff(before, after) {
  const a = before.split('\n');
  const b = after.split('\n');
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) out.push({ line: i + 1, before: a[i] ?? '', after: b[i] ?? '' });
  }
  return out;
}
