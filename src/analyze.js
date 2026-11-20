// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Bộ máy quy tắc. Tất định: cùng đầu vào, cùng cấu hình, luôn ra cùng kết quả.
//
// Hai thước đo tách bạch:
//   level / score  — văn bản giống VĂN MẪU tới đâu (chỉ tính quy tắc signal=true). Không phải xác suất "do AI viết".
//   severity       — từng chỗ cần sửa gấp tới đâu (error / warning / info). Lỗi chính tả, ngày kiểu Mỹ là error
//                    nhưng không làm văn bản "giống văn mẫu" hơn, nên không cộng vào level.

import { PATTERNS, compile } from './patterns.js';
import { PRESETS, SEVERITIES } from './presets.js';
import { CHINH_TA_RULES, XUNG_HO_RULES } from './rules/chinh-ta.js';
import { termRules } from './rules/thuat-ngu.js';
import { score as computeScore } from './score.js';
import { nfc, maskProtected, maskDisabled, countWords, sentenceLengths, makeLocator, snippet } from './text.js';

export const MIN_WORDS_FOR_LEVEL = 60;
export const LEVELS = ['it', 'ro', 'nhieu'];
export const LEVEL_LABEL = { it: 'Ít dấu hiệu', ro: 'Có dấu hiệu rõ', nhieu: 'Nhiều dấu hiệu', 'chua-du': 'Quá ngắn để kết luận' };

const COMPILED = PATTERNS.map((p) => ({ ...p, regex: compile(p) }));
const BOLD = /\*\*[^*\n]+\*\*|__[^_\n]+__/g;
const BULLET = /^\s*([-*•]|\d+[.)])\s+/;
const HEADING = /^\s*#{1,6}\s+(.+?)\s*$/;
const MAX_MATCHES = 20;

/** Quy tắc cấu trúc và kỹ thuật (đo bằng số), khai ở đây để cấu hình và tài liệu thấy được. */
export const STRUCTURAL_RULES = [
  { id: 'VS01', slug: 'cau-deu-nhau', group: 'cau-truc', label: 'Câu dài đều nhau', severity: 'warning', signal: true,
    fix: 'Xen câu ngắn (3–8 chữ) với câu dài; tách hoặc gộp vài câu.' },
  { id: 'VS02', slug: 'in-dam-day', group: 'dinh-dang', label: 'In đậm dày đặc', severity: 'warning', signal: true,
    fix: 'Chỉ in đậm điều người đọc phải thấy đầu tiên; mỗi đoạn tối đa một chỗ.' },
  { id: 'VS03', slug: 'gach-dau-dong-tran-lan', group: 'dinh-dang', label: 'Gần hết văn bản là gạch đầu dòng', severity: 'warning', signal: true,
    fix: 'Ý có quan hệ nhân quả thì viết thành câu; chỉ liệt kê khi các mục ngang hàng.' },
  { id: 'VS04', slug: 'tieu-de-viet-hoa', group: 'dinh-dang', label: 'Tiêu đề viết hoa mọi chữ', severity: 'warning', signal: true,
    fix: 'Tiếng Việt chỉ viết hoa chữ đầu tiêu đề và tên riêng.' },
  { id: 'VI63', slug: 'chu-to-hop-nfd', group: 'ro-ri', label: 'Chữ có dấu ở dạng tổ hợp (NFD)', severity: 'info', signal: false,
    fix: 'Chuẩn hoá về NFC (`vi-humanizer fix` hoặc `clean`); chữ dạng tổ hợp làm tìm kiếm và sắp xếp sai.' },
];

const FUNCTION_RULES = [
  ...CHINH_TA_RULES.map((r) => ({ ...r, group: 'chinh-ta', signal: false })),
  ...XUNG_HO_RULES.map((r) => ({ ...r, group: 'xung-ho', signal: false })),
];

/** Mọi quy tắc tĩnh (không kể quy tắc thuật ngữ sinh từ cấu hình). */
export const ALL_RULES = [
  ...PATTERNS.map(({ id, slug, group, label, fix, severity, signal }) => ({ id, slug, group, label, fix, severity, signal: signal !== false })),
  ...STRUCTURAL_RULES,
  ...FUNCTION_RULES.map(({ id, slug, group, label, fix, severity, signal }) => ({ id, slug, group, label, fix, severity, signal })),
];

/**
 * Tính mức nghiêm trọng hiệu lực của mọi quy tắc: mặc định ← preset ← config.rules ← options.ignore.
 * Khoá trong `rules` nhận cả mã (VI20) lẫn tên (mot-cach), không phân biệt hoa thường.
 */
export function resolveSeverities({ preset, rules = {}, ignore = [] } = {}, extraRules = []) {
  const all = [...ALL_RULES, ...extraRules];
  const byKey = new Map();
  for (const r of all) { byKey.set(r.id.toLowerCase(), r.id); byKey.set(r.slug.toLowerCase(), r.id); }

  const effective = new Map(all.map((r) => [r.id, r.severity]));
  const apply = (map, source) => {
    for (const [key, sev] of Object.entries(map ?? {})) {
      const id = byKey.get(String(key).toLowerCase());
      if (!id) throw new Error(`${source}: không có quy tắc "${key}"`);
      if (!SEVERITIES.includes(sev)) throw new Error(`${source}: mức "${sev}" của ${key} phải là ${SEVERITIES.join(' | ')}`);
      effective.set(id, sev);
    }
  };

  if (preset) {
    if (!PRESETS[preset]) throw new Error(`Không có preset "${preset}". Có: ${Object.keys(PRESETS).join(', ')}`);
    apply(PRESETS[preset].rules, `preset ${preset}`);
  }
  apply(rules, 'cấu hình rules');
  apply(Object.fromEntries(ignore.map((k) => [k, 'off'])), '--ignore');
  return effective;
}

/**
 * @param {string} input văn bản (chữ thường hoặc Markdown)
 * @param {{preset?: string, rules?: Record<string,string>, ignore?: string[], minWords?: number,
 *          banned?: string[], terms?: Record<string,string[]>}} [options]
 */
export function analyze(input, options = {}) {
  const extra = termRules(options).map((r) => ({ ...r, group: 'thuat-ngu', signal: false }));
  const severity = resolveSeverities(options, extra);
  const minWords = options.minWords ?? PRESETS[options.preset]?.minWords ?? MIN_WORDS_FOR_LEVEL;

  const original = input ?? '';
  const text = nfc(original);
  const masked = maskProtected(text);
  const rawSource = maskDisabled(text);
  const locate = makeLocator(text);
  const findings = [];
  const push = (rule, positions, count = positions.length) => {
    const sev = severity.get(rule.id);
    if (sev === 'off' || !sev) return;
    findings.push({
      id: rule.id, slug: rule.slug, group: rule.group, label: rule.label, fix: rule.fix,
      severity: sev, signal: rule.signal !== false, count,
      matches: positions.slice(0, MAX_MATCHES).map((p) => ({ text: p.text.trim(), ...locate(p.index), snippet: snippet(text, p.index, p.length) })),
    });
  };

  if (original !== text) push(STRUCTURAL_RULES.find((r) => r.id === 'VI63'), [], 1);

  for (const p of COMPILED) {
    const matches = [...(p.raw ? rawSource : masked).matchAll(p.regex)];
    if (p.id === 'VI42' && !/"/.test(masked)) continue; // chỉ báo khi lẫn hai kiểu ngoặc
    if (matches.length < (p.minCount ?? 1)) continue;
    push(p, matches.map(toPosition));
  }

  for (const rule of [...FUNCTION_RULES, ...extra]) {
    const positions = rule.check(masked);
    if (positions.length) push(rule, positions);
  }

  const stats = measure(masked);
  for (const s of structural(masked, stats, text)) push(s.rule, s.positions, s.count);
  findings.sort((a, b) => a.id.localeCompare(b.id));

  const signalCount = findings.filter((f) => f.signal).length;
  return {
    level: levelOf(signalCount, stats.words, minWords),
    score: computeScore(masked, findings, minWords),
    signalCount,
    counts: countBySeverity(findings),
    findings,
    stats,
  };
}

/** Vị trí khớp, trỏ vào chữ đầu tiên (biểu thức có thể khớp cả ". " hay xuống dòng phía trước). */
function toPosition(m) {
  const lead = Math.max(0, m[0].search(/[\p{L}\p{N}\p{S}[{—]/u));
  return { index: m.index + lead, length: m[0].length - lead, text: m[0].slice(lead) };
}

export function levelOf(signalCount, words, minWords = MIN_WORDS_FOR_LEVEL) {
  if (words < minWords) return 'chua-du';
  if (signalCount <= 2) return 'it';
  if (signalCount <= 5) return 'ro';
  return 'nhieu';
}

function countBySeverity(findings) {
  const out = { error: 0, warning: 0, info: 0 };
  for (const f of findings) out[f.severity] += 1;
  return out;
}

function measure(text) {
  const lines = text.split('\n').filter((l) => l.trim());
  const lengths = sentenceLengths(text);
  const avg = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  let variation = 0;
  if (lengths.length > 1 && avg > 0) {
    const variance = lengths.reduce((s, n) => s + (n - avg) ** 2, 0) / lengths.length;
    variation = Math.sqrt(variance) / avg;
  }
  return {
    words: countWords(text),
    sentences: lengths.length,
    avgSentenceWords: round(avg, 1),
    sentenceLengthVariation: round(variation, 2),
    boldSpans: (text.match(BOLD) ?? []).length,
    bulletLines: lines.filter((l) => BULLET.test(l)).length,
    lines: lines.length,
  };
}

function* structural(masked, stats) {
  const rule = (id) => STRUCTURAL_RULES.find((r) => r.id === id);
  if (stats.sentences >= 6 && stats.sentenceLengthVariation < 0.25) {
    yield { rule: rule('VS01'), positions: [], count: stats.sentences };
  }
  if (stats.boldSpans >= 4 && stats.boldSpans * 40 > stats.words) {
    const positions = [...masked.matchAll(BOLD)].map(toPosition);
    yield { rule: rule('VS02'), positions, count: stats.boldSpans };
  }
  if (stats.lines >= 6 && stats.bulletLines * 10 >= stats.lines * 7) {
    yield { rule: rule('VS03'), positions: [], count: stats.bulletLines };
  }

  const titleCase = [];
  let offset = 0;
  for (const line of masked.split('\n')) {
    const m = HEADING.exec(line);
    if (m) {
      const words = (m[1].match(/[\p{L}\p{N}]+/gu) ?? []).filter((w) => /\p{L}/u.test(w[0]));
      const allCap = words.every((w) => /\p{Lu}/u.test(w[0]));
      const notAcronyms = words.some((w) => /\p{Ll}/u.test(w.slice(1)));
      if (words.length >= 3 && allCap && notAcronyms) {
        const index = offset + line.indexOf(m[1]);
        titleCase.push({ index, length: m[1].length, text: m[1] });
      }
    }
    offset += line.length + 1;
  }
  if (titleCase.length) yield { rule: rule('VS04'), positions: titleCase, count: titleCase.length };
}

function round(n, digits) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
