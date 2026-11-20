// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Chỉ số văn mẫu 0–100: tất định, minh bạch từng thành phần.
//
// KHÔNG phải xác suất "do AI viết". Nó đo văn bản giống văn mẫu tới đâu: nhiều thói quen khuôn sáo, nhịp câu đều,
// lặp cụm, từ vựng hẹp, định dạng rườm. Mỗi thành phần có công thức và trọng số công khai dưới đây.
//
// Hiệu chỉnh trên bộ eval của repo (6 thể loại): bản gốc 21–62, bản viết lại 0–9. Từ đó chia dải:
//   0–20 sạch · 21–39 còn khuôn sáo · ≥ 40 văn mẫu rõ.
// Test canh: mọi bản gốc > 20, mọi bản viết lại ≤ 10, và mỗi bản viết lại thấp hơn bản gốc của nó ít nhất 15 điểm.
// Thêm ca eval mới mà vỡ các ràng buộc này thì phải hiệu chỉnh lại, không nới test.
//
// Vì sao tính theo ÂM TIẾT và CỤM ÂM TIẾT: tiếng Việt viết cách theo âm tiết; "sản xuất" là hai đơn vị. Chỉ số đa dạng
// từ vựng kiểu tiếng Anh (đếm "từ" theo dấu cách) sẽ đo sai, nên ở đây đo trên cặp âm tiết, gần với "từ" hơn.

import { countWords, sentenceLengths } from './text.js';

export const SCORE_WEIGHTS = {
  khuonSao: 45, // dấu hiệu văn mẫu khác nhau (trừ nhóm định dạng)
  nhipCau: 20, // độ đều của độ dài câu
  lapCum: 15, // tỷ lệ cụm 3 âm tiết lặp lại
  tuVung: 10, // độ đa dạng cặp âm tiết (MATTR)
  dinhDang: 10, // dấu hiệu định dạng
};

const SEVERITY_WEIGHT = { error: 1.5, warning: 1, info: 0.5 };
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ramp = (x, from, to) => clamp01((x - from) / (to - from)); // 0 tại from, 1 tại to

/**
 * @param {string} masked văn bản đã che vùng bảo vệ
 * @param {Array<{group:string, signal:boolean, severity:string}>} findings
 * @returns {null | {value:number, parts:Record<string,{value:number,max:number,raw:number}>}}
 */
export function score(masked, findings, minWords) {
  const syllables = (masked.toLocaleLowerCase('vi').match(/[\p{L}\p{N}]+/gu) ?? []);
  if (syllables.length < minWords) return null;

  const signals = findings.filter((f) => f.signal && f.severity !== 'off');
  const pattern = signals.filter((f) => f.group !== 'dinh-dang')
    .reduce((s, f) => s + (SEVERITY_WEIGHT[f.severity] ?? 1), 0);
  const formatting = signals.filter((f) => f.group === 'dinh-dang').length;

  const lengths = sentenceLengths(masked);
  const cv = variation(lengths);
  const rhythm = lengths.length >= 4 ? 1 - ramp(cv, 0.15, 0.55) : 0;

  const repetition = trigramRepetition(syllables);
  const mattr = bigramMattr(syllables, 40);

  const parts = {
    khuonSao: part(ramp(pattern, 0, 8), SCORE_WEIGHTS.khuonSao, pattern),
    nhipCau: part(rhythm, SCORE_WEIGHTS.nhipCau, round(cv, 2)),
    lapCum: part(ramp(repetition, 0.03, 0.2), SCORE_WEIGHTS.lapCum, round(repetition, 3)),
    tuVung: part(1 - ramp(mattr, 0.8, 0.97), SCORE_WEIGHTS.tuVung, round(mattr, 3)),
    dinhDang: part(ramp(formatting, 0, 3), SCORE_WEIGHTS.dinhDang, formatting),
  };
  const value = Math.round(Object.values(parts).reduce((s, p) => s + p.value, 0));
  return { value, parts };
}

function part(fraction, max, raw) {
  return { value: round(fraction * max, 1), max, raw };
}

function variation(xs) {
  if (xs.length < 2) return 0;
  const avg = xs.reduce((a, b) => a + b, 0) / xs.length;
  if (!avg) return 0;
  return Math.sqrt(xs.reduce((s, n) => s + (n - avg) ** 2, 0) / xs.length) / avg;
}

/** Tỷ lệ cụm 3 âm tiết xuất hiện từ lần thứ hai trở đi. */
function trigramRepetition(tokens) {
  if (tokens.length < 3) return 0;
  const seen = new Map();
  for (let i = 0; i + 2 < tokens.length; i++) {
    const key = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const total = tokens.length - 2;
  const repeated = [...seen.values()].reduce((s, n) => s + (n - 1), 0);
  return repeated / total;
}

/** Moving-average type-token ratio trên cặp âm tiết. */
function bigramMattr(tokens, window) {
  const bigrams = [];
  for (let i = 0; i + 1 < tokens.length; i++) bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  if (bigrams.length === 0) return 1;
  if (bigrams.length <= window) return new Set(bigrams).size / bigrams.length;
  let sum = 0;
  for (let i = 0; i + window <= bigrams.length; i++) sum += new Set(bigrams.slice(i, i + window)).size / window;
  return sum / (bigrams.length - window + 1);
}

function round(n, d) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

export const countSyllables = countWords;

export const SCORE_BANDS = [
  { max: 20, label: 'sạch' },
  { max: 39, label: 'còn khuôn sáo' },
  { max: 100, label: 'văn mẫu rõ' },
];
export const bandOf = (value) => SCORE_BANDS.find((b) => value <= b.max).label;
