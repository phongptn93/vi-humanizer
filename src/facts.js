// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Rút dữ kiện cứng (số, ngày, giờ, %, mã, URL, email) và đối chiếu bản gốc với bản viết lại.
//
// Viết lại cho "tự nhiên" là lúc dễ đánh rơi một con số, đổi 12,6% thành "khoảng 13%", hoặc thêm một mốc ngày nghe
// cho tròn câu. Mô hình tự soát chính nó thì soát theo xác suất; phép so tập hợp ở đây thì không bỏ sót.
//
// Quy ước số Việt Nam: dấu chấm phân cách nghìn, dấu phẩy thập phân. "1.500" = một nghìn năm trăm, "1,5" = một phẩy
// năm. Một dấu chấm có đúng 3 chữ số theo sau được hiểu là phân cách nghìn. Kiểu Anh "1,405,712.5" cũng đọc được.
// Số viết bằng chữ ("149 nghìn") KHÔNG quy đổi: nó được báo thiếu để người viết xác nhận việc làm tròn là cố ý.

import { nfc } from './text.js';

const EXTRACTORS = [
  ['url', /https?:\/\/[^\s<>()[\]"']+/gu],
  ['email', /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(\.[\p{L}\p{N}-]+)+/gu],
  ['date', /(?<![\d/.-])(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?)(?![\d/-])/gu],
  ['time', /(?<!\d)\d{1,2}(:|h)\d{2}(?!\d)/gu],
  ['percent', /(?<![\d.,])[-−]?\d+([.,]\d+)*\s?%/gu],
  // Mã: chữ in + số (ATN7, PO-2026-001) hoặc viết tắt in hoa 2–6 chữ (OEE, LSX). Phân biệt hoa thường.
  ['code', /(?<![\p{L}\d])([A-ZĐ][A-ZĐ0-9]*\d[A-ZĐ0-9]*([-_/][A-ZĐ0-9]+)*|[A-ZĐ]{2,6}([-_/][A-ZĐ0-9]+)*)(?![\p{L}\d])/gu],
  ['number', /(?<![\p{L}\d.,])[-−]?\d+([.,]\d+)*(?![\p{L}\d])/gu],
  // Tên riêng: chuỗi từ 2 chữ viết hoa đầu liền nhau ("An Phát", "Tân Bình", "Nguyễn Văn A"),
  // hoặc một chữ viết hoa đứng sau từ xưng hô ("anh Minh", "chị Lan"). Bắt được chuyện bịa thêm tên người nhận.
  ['name', /(?<![\p{L}\p{M}])\p{Lu}[\p{Ll}\p{M}]*(?:[ \t]+\p{Lu}[\p{Ll}\p{M}]*)+(?![\p{L}\p{M}])|(?<=(?<![\p{L}\p{M}])(?:anh|chị|ông|bà|cô|chú|bác|em)[ \t])\p{Lu}[\p{Ll}\p{M}]+(?![\p{L}\p{M}])/gu],
];

// Chuỗi viết hoa đầu câu không phải tên riêng: bỏ từ đầu tiên nếu chuỗi bắt đầu một câu và từ đó là từ thường gặp.
const SENTENCE_START_WORDS = new Set(['Kính', 'Trân', 'Thưa', 'Chào', 'Dạ', 'Theo', 'Tại', 'Trong', 'Sau', 'Trước', 'Khi', 'Nếu', 'Do', 'Vì', 'Để', 'Ngày', 'Tháng', 'Năm', 'Từ', 'Đến', 'Các', 'Những', 'Mọi', 'Toàn', 'Phần', 'Đề', 'Cảm', 'Xin', 'Hôm', 'Ca']);

function cleanName(raw, index, source) {
  const before = source.slice(Math.max(0, index - 3), index);
  const atSentenceStart = index === 0 || /(^|[.!?:\n]\s*|\n)$/.test(before) || /^\s*$/.test(source.slice(0, index).split('\n').pop());
  const words = raw.split(/[ \t]+/);
  if (atSentenceStart && words.length > 1 && SENTENCE_START_WORDS.has(words[0])) words.shift();
  return words.length >= 2 || !/[ \t]/.test(raw) ? words.join(' ') : null;
}

const VN_THOUSANDS = /^-?\d{1,3}(\.\d{3})+(,\d+)?$/;
const EN_THOUSANDS = /^-?\d{1,3}(,\d{3})+(\.\d+)?$/;

/** Đọc số theo quy ước Việt Nam, trả dạng chuẩn ("1405712", "39.8"). */
export function canonicalNumber(raw) {
  let s = raw.replace('−', '-').trim();
  const commas = (s.match(/,/g) ?? []).length;
  const dots = (s.match(/\./g) ?? []).length;
  if (VN_THOUSANDS.test(s)) s = s.replace(/\./g, '').replace(',', '.');
  else if (EN_THOUSANDS.test(s)) s = s.replace(/,/g, '');
  else if (commas === 1 && dots === 0) s = s.replace(',', '.');
  else if (dots === 1 && commas === 0 && s.length - s.indexOf('.') - 1 === 3) s = s.replace('.', '');
  else if (commas + dots > 1) return raw; // số phiên bản, số hiệu — giữ nguyên chữ

  const n = Number(s);
  return Number.isFinite(n) ? String(n) : raw;
}

function canonicalDate(raw) {
  let parts = raw.split(/[/-]/);
  if (parts.length === 3 && parts[0].length === 4) parts = [parts[2], parts[1], parts[0]];
  return parts.map((p) => String(Number(p))).join('/');
}

// Tham số utm_source của công cụ AI: clean/fix cắt nó đi, nên khi đối chiếu cũng bỏ qua — không tính là đổi dữ kiện.
// Dấu câu cuối URL (thuộc về câu) được trả lại, giống clean.js.
const AI_UTM = /([?&])utm_source=(chatgpt|openai|perplexity|copilot|gemini|claude)([^&#]*)(&)?/gi;

function canonicalUrl(raw) {
  const url = raw.replace(AI_UTM, (_m, sep, _src, rest, amp) => (amp ? sep : '') + ((rest.match(/[.,;:!?]+$/) ?? [''])[0]));
  return url.replace(/[?&]+([.,;:!]*)$/, '$1').toLowerCase();
}

export function canonical(kind, raw) {
  switch (kind) {
    case 'url': return canonicalUrl(raw);
    case 'number': return canonicalNumber(raw);
    case 'percent': return `${canonicalNumber(raw.replace('%', '').trim())}%`;
    case 'date': return canonicalDate(raw);
    case 'time': return raw.replace('h', ':').replace(/^0(\d:)/, '$1');
    case 'email': return raw.toLowerCase();
    default: return raw;
  }
}

// Ký tự vô hình (U+200B–U+200D, U+2060, U+FEFF): bỏ trước khi rút, để việc dọn chúng không bị coi là đổi dữ kiện.
// Dựng bằng mã số để mã nguồn không chứa ký tự vô hình thật.
const INVISIBLE = new RegExp(`[${String.fromCharCode(0x200B)}-${String.fromCharCode(0x200D)}${String.fromCharCode(0x2060, 0xFEFF)}]`, 'g');

/** Rút dữ kiện; mỗi giá trị chuẩn hoá xuất hiện một lần, kèm số lần gặp. */
export function extractFacts(input) {
  const chars = [...nfc(input ?? '').replace(INVISIBLE, '')];
  let buffer = chars.join('');
  const facts = new Map();

  for (const [kind, re] of EXTRACTORS) {
    for (const m of buffer.matchAll(re)) {
      let raw = m[0].replace(/[.,;:)]+$/u, '');
      if (kind === 'name') {
        // Dòng tiêu đề Markdown viết hoa mọi chữ không phải tên riêng (đã có VS04 lo); tên riêng tiếng Việt hiếm khi > 5 chữ.
        const lineStart = buffer.lastIndexOf('\n', m.index) + 1;
        if (/^[ \t]*#/.test(buffer.slice(lineStart, m.index + 1)) || raw.split(/[ \t]+/).length > 5) continue;
        raw = cleanName(raw, m.index, buffer);
        if (!raw || !/[ \t]/.test(raw) && !/(anh|chị|ông|bà|cô|chú|bác|em)[ \t]$/u.test(buffer.slice(Math.max(0, m.index - 5), m.index))) continue;
      }
      const value = canonical(kind, raw);
      const key = keyOf(kind, value);
      const hit = facts.get(key);
      if (hit) hit.count += 1;
      else facts.set(key, { kind, value, text: raw, count: 1 });
    }
    // Che phần đã lấy để bước sau không đọc lại "12/10" thành hai con số.
    buffer = buffer.replace(re, (s) => ' '.repeat(s.length));
  }
  return [...facts.values()];
}

/** Phần trăm và số dùng chung khoá giá trị: "12,6%" viết lại thành "12,6 phần trăm" vẫn tính là giữ. */
function keyOf(kind, value) {
  return kind === 'percent' ? `number:${value.replace('%', '')}` : `${kind}:${value}`;
}

/**
 * @returns {{ok:boolean, missing:object[], added:object[], kept:number}}
 */
export function compareFacts(original, rewritten) {
  const before = extractFacts(original);
  const after = extractFacts(rewritten);
  const afterKeys = new Set(after.map((f) => keyOf(f.kind, f.value)));
  const beforeKeys = new Set(before.map((f) => keyOf(f.kind, f.value)));
  const missing = before.filter((f) => !afterKeys.has(keyOf(f.kind, f.value)));
  const added = after.filter((f) => !beforeKeys.has(keyOf(f.kind, f.value)));
  return { ok: missing.length === 0 && added.length === 0, missing, added, kept: before.length - missing.length };
}
