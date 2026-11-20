// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Quy tắc sinh từ cấu hình của chính người dùng: từ cấm và thuật ngữ bắt buộc.
// Đây là phần "giọng thương hiệu" mà mô hình hay quên giữa chừng; máy giữ thì không quên.
//
//   "banned": ["giải pháp toàn diện", "hệ sinh thái"]
//   "terms":  { "phiếu lĩnh": ["phiếu xuất vật tư", "phiếu cấp phát"] }   // trái: chữ PHẢI dùng; phải: chữ không dùng

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
const phrase = (s) => new RegExp(`(?<![\\p{L}\\p{M}])${escape(s.normalize('NFC'))}(?![\\p{L}\\p{M}])`, 'giu');

function keepCase(source, target) {
  if (source === source.toUpperCase() && source !== source.toLowerCase()) return target.toUpperCase();
  if (source[0] === source[0].toUpperCase() && source[0] !== source[0].toLowerCase()) return target[0].toUpperCase() + target.slice(1);
  return target;
}

/** @param {{banned?: string[], terms?: Record<string, string[]>}} config */
export function termRules(config = {}) {
  const rules = [];
  const banned = (config.banned ?? []).filter(Boolean);
  if (banned.length) {
    rules.push({
      id: 'TN01', slug: 'tu-cam', label: 'Dùng cụm từ bị cấm trong cấu hình', severity: 'warning',
      fix: 'Bỏ hoặc thay bằng cách nói cụ thể (danh sách ở `banned` trong .vihumanizerrc.json).',
      check: (masked) => banned.flatMap((b) => [...masked.matchAll(phrase(b))])
        .map((m) => ({ index: m.index, length: m[0].length, text: m[0] })),
    });
  }

  const terms = Object.entries(config.terms ?? {}).flatMap(([preferred, avoid]) =>
    (Array.isArray(avoid) ? avoid : [avoid]).filter(Boolean).map((a) => ({ preferred, avoid: a, re: phrase(a) })));
  if (terms.length) {
    const find = (masked) => terms.flatMap((t) => [...masked.matchAll(t.re)].map((m) => ({ m, t })));
    rules.push({
      id: 'TN02', slug: 'thuat-ngu', label: 'Thuật ngữ không đúng quy ước', severity: 'warning',
      fix: 'Dùng thuật ngữ đã chốt trong `terms` của .vihumanizerrc.json. `vi-humanizer fix` tự thay.',
      check: (masked) => find(masked).map(({ m, t }) => ({ index: m.index, length: m[0].length, text: `${m[0]} → ${t.preferred}` })),
      fixes: (masked) => find(masked).map(({ m, t }) => ({ index: m.index, length: m[0].length, replacement: keepCase(m[0], t.preferred) })),
    });
  }
  return rules;
}
