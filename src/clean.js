// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Sửa máy móc những thứ AN TOÀN, không đổi nghĩa: chuẩn hoá NFC, xoá ký tự ẩn, xoá mã trích dẫn của công cụ chat,
// cắt tham số utm_source của công cụ AI. Không đụng tới câu chữ — việc đó cần người (hoặc mô hình) phán đoán.

const ZERO_WIDTH = /[\u200B-\u200D\u2060\uFEFF]/g;
const CITATIONS = /\s?(citeturn\d+\w*|【\d+†[^】]*】|\[cite:\s*\d+(,\s*\d+)*\]|:contentReference\[[^\]]*\]\{[^}]*\})/g;
const UTM = /([?&])utm_source=(chatgpt|openai|perplexity|copilot|gemini|claude)([^&\s)]*)(&)?/gi;
// Dấu câu ngay sau URL ("…?utm_source=chatgpt.com.") thuộc về câu, không thuộc URL: trả lại nó.
const keepTail = (_m, sep, _src, rest, amp) => (amp ? sep : '') + ((rest.match(/[.,;:!?]+$/) ?? [''])[0]);

/** @returns {{text:string, changes:{kind:string,count:number}[]}} */
export function clean(input) {
  const changes = [];
  let text = input ?? '';

  const nfc = text.normalize('NFC');
  if (nfc !== text) changes.push({ kind: 'nfc', count: 1 });
  text = nfc;

  text = count(text, ZERO_WIDTH, '', 'zero-width', changes);
  text = count(text, CITATIONS, '', 'citation-markup', changes);
  text = count(text, UTM, keepTail, 'utm', changes);
  // "?" hoặc "&" còn treo ở cuối URL sau khi cắt
  text = text.replace(/(https?:\/\/[^\s?]+)[?&](?=[\s)]|$)/g, '$1');

  return { text, changes };
}

function count(text, re, replacement, kind, changes) {
  const n = (text.match(re) ?? []).length;
  if (n) changes.push({ kind, count: n });
  return text.replace(re, replacement);
}
