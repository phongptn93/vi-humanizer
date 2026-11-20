// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Kiểu cho người dùng vi-humanizer như thư viện.

export type Severity = 'off' | 'info' | 'warning' | 'error';
export type Level = 'it' | 'ro' | 'nhieu' | 'chua-du';
export type PresetName = 'cong-van' | 'email' | 'bao-cao' | 'thong-bao' | 'tin-nhan' | 'gioi-thieu' | 'huong-dan';
export type FactKind = 'url' | 'email' | 'date' | 'time' | 'percent' | 'code' | 'number' | 'name';

export interface Options {
  /** Preset theo thể loại văn bản. */
  preset?: PresetName;
  /** Đổi mức quy tắc; khoá là mã (`VI20`) hoặc tên (`mot-cach`). */
  rules?: Record<string, Severity>;
  /** Tắt quy tắc (mã hoặc tên). */
  ignore?: string[];
  /** Số âm tiết tối thiểu để kết luận mức và chấm chỉ số. Mặc định 60 (preset có thể đổi). */
  minWords?: number;
  /** Cụm từ cấm (quy tắc TN01). */
  banned?: string[];
  /** Thuật ngữ bắt buộc: `{ "phiếu lĩnh": ["phiếu xuất vật tư"] }` (quy tắc TN02, sửa tự động được). */
  terms?: Record<string, string[]>;
}

export interface Match { text: string; line: number; column: number; snippet: string }

export interface Finding {
  id: string;
  slug: string;
  group: string;
  label: string;
  fix: string;
  severity: Exclude<Severity, 'off'>;
  /** Có tính vào mức và chỉ số văn mẫu không (chính tả, xưng hô, thuật ngữ: không). */
  signal: boolean;
  count: number;
  matches: Match[];
}

export interface ScorePart { value: number; max: number; raw: number }
export interface Score {
  /** 0–100. Không phải xác suất "do AI viết". */
  value: number;
  parts: { khuonSao: ScorePart; nhipCau: ScorePart; lapCum: ScorePart; tuVung: ScorePart; dinhDang: ScorePart };
}

export interface Report {
  level: Level;
  /** null khi văn bản ngắn hơn minWords. */
  score: Score | null;
  signalCount: number;
  counts: { error: number; warning: number; info: number };
  findings: Finding[];
  stats: {
    words: number; sentences: number; avgSentenceWords: number; sentenceLengthVariation: number;
    boldSpans: number; bulletLines: number; lines: number;
  };
}

export interface Fact { kind: FactKind; value: string; text: string; count: number }
export interface FactComparison { ok: boolean; missing: Fact[]; added: Fact[]; kept: number }

export interface FixResult {
  /** false khi sửa tự động làm đổi dữ kiện: khi đó `text` là bản gốc, không có sửa nào được áp. */
  ok: boolean;
  text: string;
  edits: Array<{ id: string; line: number; before: string; after: string }>;
  facts: FactComparison;
  reason?: string;
}

export function analyze(text: string, options?: Options): Report;
export function fix(text: string, options?: Options): FixResult;
export function compareFacts(original: string, rewritten: string): FactComparison;
export function extractFacts(text: string): Fact[];
export function canonicalNumber(raw: string): string;
export function clean(text: string): { text: string; changes: Array<{ kind: string; count: number }> };
export function lineDiff(before: string, after: string): Array<{ line: number; before: string; after: string }>;
export function levelOf(signalCount: number, words: number, minWords?: number): Level;
export function resolveSeverities(options?: Options): Map<string, Severity>;

export const ALL_RULES: ReadonlyArray<{ id: string; slug: string; group: string; label: string; fix: string; severity: Severity; signal: boolean }>;
export const PRESETS: Readonly<Record<PresetName, { label: string; minWords?: number; rules: Record<string, Severity> }>>;
export const SCORE_WEIGHTS: Readonly<Record<keyof Score['parts'], number>>;
export const LEVELS: readonly ['it', 'ro', 'nhieu'];
export const LEVEL_LABEL: Readonly<Record<Level, string>>;
export const MIN_WORDS_FOR_LEVEL: number;
