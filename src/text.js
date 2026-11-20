// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Tiện ích văn bản: chuẩn hoá, che vùng không được sửa, đếm âm tiết, tách câu, đổi vị trí → dòng/cột.

/** Chuẩn hoá Unicode về NFC (chữ có dấu dựng sẵn). */
export function nfc(text) {
  return (text ?? '').normalize('NFC');
}

// [ \t]* chứ không phải \s*: \s nuốt cả dòng trống phía trước, làm hai khối mã ghép nhầm cặp và che mất đoạn văn ở giữa.
const FENCE = /^([ \t]*)(```|~~~)[^\n]*\n[\s\S]*?^\1\2[^\n]*$/gm;
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---[ \t]*$/m;
const DISABLED = /<!--\s*vi-humanizer-disable\s*-->[\s\S]*?(<!--\s*vi-humanizer-enable\s*-->|$(?![\s\S]))/g;
const INLINE_CODE = /`[^`\n]+`/g;
const QUOTE_LINE = /^[ \t]*>.*$/gm;
// Dấu câu ngay sau URL ("…/a, rồi") thuộc về câu, không thuộc URL.
const URL = /https?:\/\/[^\s<>()[\]"']*[^\s<>()[\]"'.,;:!?]/g;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/**
 * Thay các vùng KHÔNG được góp ý bằng khoảng trắng, giữ nguyên độ dài và xuống dòng để vị trí không lệch:
 * frontmatter YAML ở đầu tệp, vùng giữa `<!-- vi-humanizer-disable -->` và `<!-- vi-humanizer-enable -->`,
 * khối mã, mã trong dòng, dòng trích dẫn (> …), URL, chú thích HTML.
 * Sửa trích dẫn hay mã nguồn của người khác là làm sai lệch nội dung, không phải biên tập; tài liệu dạy về văn mẫu
 * thì cần trích chính văn mẫu làm ví dụ.
 */
// Ký tự che: KHÔNG phải khoảng trắng, KHÔNG phải chữ. Che bằng dấu cách sẽ tạo lỗi giả: "`39,8`, …" thành
// "khoảng trắng trước dấu phẩy", hai khối mã liền nhau thành "nhiều dấu cách".
export const MASK = '░';
const blank = (m) => m.replace(/[^\n]/g, MASK);

/** Chỉ che vùng người viết chủ động tắt (frontmatter, disable…enable). Quy tắc rò rỉ kỹ thuật quét trên bản này. */
export function maskDisabled(text) {
  const head = FRONTMATTER.exec(text);
  const withoutFrontmatter = head && head.index === 0 ? blank(head[0]) + text.slice(head[0].length) : text;
  return withoutFrontmatter.replace(DISABLED, blank);
}

export function maskProtected(text) {
  return maskDisabled(text)
    .replace(FENCE, blank)
    .replace(HTML_COMMENT, blank)
    .replace(INLINE_CODE, blank)
    .replace(QUOTE_LINE, blank)
    .replace(URL, blank);
}

const TOKEN = /[\p{L}\p{N}]+/gu;

/** Số âm tiết. Tiếng Việt viết cách theo âm tiết nên đây là đơn vị đếm ổn định nhất. */
export function countWords(text) {
  return (text.match(TOKEN) ?? []).length;
}

const HEADING = /^\s*#{1,6}\s+/;

/** Độ dài (âm tiết) của từng câu, bỏ tiêu đề và mảnh dưới 3 chữ (nhãn, số). */
export function sentenceLengths(text) {
  const prose = text.split('\n').filter((l) => l.trim() && !HEADING.test(l)).join('\n');
  return prose
    .split(/(?<=[.!?…])\s+|\n+/u)
    .map(countWords)
    .filter((n) => n >= 3);
}

/** Đổi chỉ số ký tự thành dòng/cột (bắt đầu từ 1), theo kiểu trình soạn thảo. */
export function makeLocator(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return (index) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= index) lo = mid; else hi = mid - 1;
    }
    return { line: lo + 1, column: index - starts[lo] + 1 };
  };
}

/** Trích đoạn quanh một vị trí, một dòng. */
export function snippet(text, index, length, radius = 40) {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + length + radius);
  const body = text.slice(start, end).replace(/\s+/g, ' ').trim();
  return (start > 0 ? '…' : '') + body + (end < text.length ? '…' : '');
}
