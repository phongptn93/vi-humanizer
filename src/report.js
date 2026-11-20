// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Trình bày kết quả: chữ (terminal), Markdown, JSON, SARIF 2.1.0, chú thích GitHub Actions.

import { GROUPS, PATTERNS } from './patterns.js';
import { ALL_RULES, LEVEL_LABEL } from './analyze.js';
import { CHINH_TA_RULES, XUNG_HO_RULES } from './rules/chinh-ta.js';
import { SCORE_WEIGHTS } from './score.js';

const useColor = () => process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (useColor() ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const c = { dim: paint('2'), bold: paint('1'), red: paint('31'), yellow: paint('33'), green: paint('32'), cyan: paint('36'), blue: paint('34') };
const levelColor = { it: c.green, ro: c.yellow, nhieu: c.red, 'chua-du': c.dim };
const sevMark = { error: c.red('✖'), warning: c.yellow('▲'), info: c.blue('●') };
export const SEVERITY_LABEL = { error: 'lỗi', warning: 'cảnh báo', info: 'gợi ý', off: 'tắt' };
export const GROUP_LABEL = {
  ...GROUPS, 'chinh-ta': 'Chính tả, trình bày', 'xung-ho': 'Xưng hô', 'thuat-ngu': 'Thuật ngữ của tổ chức',
};
const PART_LABEL = { khuonSao: 'khuôn sáo', nhipCau: 'nhịp câu', lapCum: 'lặp cụm', tuVung: 'từ vựng', dinhDang: 'định dạng' };

function scoreLine(score) {
  if (!score) return c.dim('chỉ số: — (quá ngắn)');
  const color = score.value >= 40 ? c.red : score.value > 20 ? c.yellow : c.green;
  const parts = Object.entries(score.parts).filter(([, p]) => p.value > 0)
    .map(([k, p]) => `${PART_LABEL[k]} ${p.value}/${p.max}`).join(' · ');
  return `chỉ số văn mẫu ${color(`${score.value}/100`)}${parts ? c.dim(` (${parts})`) : ''}`;
}

export function formatScanText(results) {
  const out = [];
  let totals = { error: 0, warning: 0, info: 0 };
  for (const { file, report } of results) {
    totals = { error: totals.error + report.counts.error, warning: totals.warning + report.counts.warning, info: totals.info + report.counts.info };
    out.push(`${c.bold(file)}  ${levelColor[report.level](LEVEL_LABEL[report.level])} ${c.dim('·')} ${scoreLine(report.score)}`);
    for (const f of report.findings) {
      const at = f.matches[0] ? `${f.matches[0].line}:${f.matches[0].column}` : '';
      out.push(`  ${sevMark[f.severity]} ${c.dim(at.padEnd(7))} ${f.label} ${c.dim(`×${f.count}`)}  ${c.cyan(`${f.id} ${f.slug}`)}`);
      for (const m of f.matches.slice(0, 2)) out.push(`      ${c.dim('›')} ${m.snippet}`);
      out.push(`      ${c.green('→')} ${f.fix}`);
    }
    out.push('');
  }
  const sum = `${totals.error} lỗi · ${totals.warning} cảnh báo · ${totals.info} gợi ý · ${results.length} tệp`;
  out.push(totals.error ? c.red(sum) : totals.warning ? c.yellow(sum) : c.green(sum));
  return out.join('\n');
}

export function formatScanMarkdown(results) {
  const out = [];
  for (const { file, report } of results) {
    const s = report.score ? ` · chỉ số văn mẫu ${report.score.value}/100` : '';
    out.push(`### ${file}: ${LEVEL_LABEL[report.level]}${s}`, '');
    if (!report.findings.length) { out.push('Không có góp ý.', ''); continue; }
    out.push('| Mức | Dòng | Quy tắc | Ví dụ | Cách sửa |', '|---|---|---|---|---|');
    for (const f of report.findings) {
      const m = f.matches[0];
      out.push(`| ${SEVERITY_LABEL[f.severity]} | ${m ? m.line : ''} | \`${f.id}\` ${esc(f.label)} ×${f.count} | ${m ? esc(m.snippet) : ''} | ${esc(f.fix)} |`);
    }
    out.push('');
  }
  return out.join('\n');
}

/** Chú thích GitHub Actions: hiện ngay trên dòng trong tab "Files changed" của PR. */
export function formatGithub(results) {
  const cmd = { error: 'error', warning: 'warning', info: 'notice' };
  const out = [];
  for (const { file, report } of results) {
    for (const f of report.findings) {
      const locs = f.matches.length ? f.matches : [{ line: 1, column: 1 }];
      for (const m of locs) {
        out.push(`::${cmd[f.severity]} file=${file},line=${m.line},col=${m.column},title=${f.id} ${f.slug}::${ghEsc(`${f.label}. ${f.fix}`)}`);
      }
    }
  }
  return out.join('\n');
}

export function formatCompareText(result) {
  const out = [];
  out.push(result.ok ? c.green(`✔ Giữ đủ ${result.kept} dữ kiện.`) : c.red(`✘ Dữ kiện bị đổi: thiếu ${result.missing.length}, thêm ${result.added.length} (giữ ${result.kept}).`));
  for (const f of result.missing) out.push(`  ${c.red('− thiếu')}  ${f.text} ${c.dim(`(${KIND_LABEL[f.kind] ?? f.kind})`)}`);
  for (const f of result.added) out.push(`  ${c.yellow('+ thêm ')}  ${f.text} ${c.dim(`(${KIND_LABEL[f.kind] ?? f.kind})`)}`);
  return out.join('\n') + '\n';
}

export const KIND_LABEL = { url: 'liên kết', email: 'email', date: 'ngày', time: 'giờ', percent: 'phần trăm', code: 'mã', number: 'số', name: 'tên riêng' };

export function formatFixText(file, result, diff) {
  const out = [];
  if (!result.ok) {
    out.push(c.red(`✘ ${file}: ${result.reason}`), formatCompareText(result.facts));
    return out.join('\n');
  }
  if (!result.edits.length) return c.green(`✔ ${file}: không có gì để sửa tự động.`);
  out.push(c.bold(`${file}: ${result.edits.length} sửa · ${c.green(`giữ đủ ${result.facts.kept} dữ kiện`)}`));
  for (const d of diff) {
    out.push(`  ${c.dim(String(d.line).padStart(4))} ${c.red(`- ${d.before}`)}`, `       ${c.green(`+ ${d.after}`)}`);
  }
  const byRule = {};
  for (const e of result.edits) byRule[e.id] = (byRule[e.id] ?? 0) + 1;
  out.push(c.dim(`  Theo quy tắc: ${Object.entries(byRule).map(([k, n]) => `${k} ×${n}`).join(', ')}`));
  return out.join('\n');
}

export function formatList() {
  const out = [];
  let group = '';
  for (const r of ALL_RULES) {
    if (r.group !== group) { group = r.group; out.push('', c.bold(GROUP_LABEL[group] ?? group)); }
    const sev = r.severity === 'off' ? c.dim('tắt') : SEVERITY_LABEL[r.severity];
    out.push(`  ${c.cyan(r.id)} ${r.slug.padEnd(26)} ${sev.padEnd(9)} ${r.label}${r.signal ? '' : c.dim(' (không tính chỉ số)')}`);
  }
  out.push('', c.dim('Thêm TN01 tu-cam / TN02 thuat-ngu khi khai "banned" / "terms" trong .vihumanizerrc.json.'), '');
  return out.join('\n');
}

export function formatExplain(key) {
  const k = key.toLowerCase();
  const rule = ALL_RULES.find((r) => r.id.toLowerCase() === k || r.slug === k);
  if (!rule) return null;
  const source = PATTERNS.find((p) => p.id === rule.id) ?? [...CHINH_TA_RULES, ...XUNG_HO_RULES].find((p) => p.id === rule.id);
  const lines = [
    `${c.cyan(rule.id)} ${c.bold(rule.slug)}  ${rule.label}`,
    `Nhóm: ${GROUP_LABEL[rule.group] ?? rule.group} · mức mặc định: ${SEVERITY_LABEL[rule.severity]} · ${rule.signal ? 'tính vào chỉ số văn mẫu' : 'không tính vào chỉ số văn mẫu'}`,
  ];
  if (source?.minCount > 1) lines.push(`Chỉ báo khi gặp từ ${source.minCount} lần.`);
  if (source?.truoc) lines.push('', `${c.red('✗')} ${source.truoc}`, `${c.green('✓')} ${source.sau}`);
  lines.push('', `Sửa: ${rule.fix}`);
  if (source?.note) lines.push(`Lưu ý: ${source.note}`);
  return lines.join('\n');
}

/** SARIF 2.1.0 — tải lên GitHub code scanning. */
export function toSarif(results, version) {
  const level = { error: 'error', warning: 'warning', info: 'note' };
  const rules = new Map();
  const sarifResults = [];
  for (const { file, report } of results) {
    for (const f of report.findings) {
      if (!rules.has(f.id)) {
        rules.set(f.id, {
          id: f.id, name: f.slug, shortDescription: { text: f.label }, help: { text: f.fix },
          defaultConfiguration: { level: level[f.severity] },
          properties: { group: f.group, tags: ['vietnamese', 'prose', f.group] },
        });
      }
      const locations = (f.matches.length ? f.matches : [{ line: 1, column: 1 }]).map((m) => ({
        physicalLocation: { artifactLocation: { uri: file.replace(/\\/g, '/') }, region: { startLine: m.line, startColumn: m.column } },
      }));
      sarifResults.push({ ruleId: f.id, level: level[f.severity], message: { text: `${f.label}. ${f.fix}` }, locations });
    }
  }
  return {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [{ tool: { driver: { name: 'vi-humanizer', version, rules: [...rules.values()] } }, results: sarifResults }],
  };
}

export { SCORE_WEIGHTS };

function esc(s) {
  return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function ghEsc(s) {
  return String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
