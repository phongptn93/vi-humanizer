#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// vi-humanizer — CLI. Không phụ thuộc gói ngoài, không gọi mạng.

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { analyze, LEVELS } from '../src/analyze.js';
import { PRESETS } from '../src/presets.js';
import { compareFacts } from '../src/facts.js';
import { clean } from '../src/clean.js';
import { fix, lineDiff } from '../src/fix.js';
import {
  formatScanText, formatScanMarkdown, formatGithub, formatCompareText, formatFixText, formatList, formatExplain, toSarif,
} from '../src/report.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const PRESET_NAMES = Object.keys(PRESETS).join('|');

const HELP = `vi-humanizer ${pkg.version} — biên tập văn phong tiếng Việt, giữ nguyên dữ kiện

Lệnh
  scan [tệp|thư mục...]          Quét (không có tệp thì đọc stdin; thư mục thì quét *.md, *.txt bên trong)
  fix  [tệp|thư mục...]          Sửa tự động phần chắc chắn đúng, CHỨNG MINH không đổi dữ kiện; in diff
  compare <gốc> <mới>            Đối chiếu số, ngày, giờ, %, mã, tên riêng, URL, email giữa hai bản
  clean <tệp>                    Chỉ sửa kỹ thuật: NFC, ký tự ẩn, mã trích dẫn, utm_source của AI
  explain <mã|tên>               Giải thích một quy tắc, kèm ví dụ trước/sau
  list                           Liệt kê quy tắc, tên, mức mặc định
  init                           Tạo .vihumanizerrc.json mẫu

Tuỳ chọn
  --the-loai ${PRESET_NAMES}
                                 Preset theo thể loại văn bản
  --format text|md|json|sarif|github
  --fail-on ro|nhieu|loi|canh-bao  Mã thoát 1 khi đạt mức văn mẫu, hoặc khi có lỗi / cảnh báo
  --fail-above N                 Mã thoát 1 khi chỉ số văn mẫu > N
  --rule <mã|tên>=<off|info|warning|error>   Đổi mức một quy tắc (lặp được)
  --ignore VI14,mot-cach         Tắt quy tắc
  --min-words N                  Số chữ tối thiểu để kết luận (mặc định 60)
  --config <tệp>                 Mặc định: .vihumanizerrc.json nếu có
  --write                        (fix, clean) ghi đè tệp
  -h, --help · -v, --version

Mã thoát: 0 đạt · 1 không đạt · 2 lỗi cách dùng`;

const CONFIG_TEMPLATE = {
  $schema: 'https://raw.githubusercontent.com/OWNER/vi-humanizer/main/schema/vihumanizerrc.schema.json',
  preset: 'bao-cao',
  failOn: 'nhieu',
  rules: { 'tinh-tu-keu': 'info' },
  banned: ['giải pháp toàn diện', 'hệ sinh thái'],
  terms: { 'phiếu lĩnh': ['phiếu xuất vật tư', 'phiếu cấp phát'] },
};

function parseArgs(argv) {
  const args = { _: [], format: 'text', ignore: [], rules: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) fail(`Thiếu giá trị cho ${a}`);
      return argv[++i];
    };
    if (a === '-h' || a === '--help') args.help = true;
    else if (a === '-v' || a === '--version') args.version = true;
    else if (a === '--format') args.format = next();
    else if (a === '--fail-on') args.failOn = next();
    else if (a === '--fail-above') args.failAbove = Number(next());
    else if (a === '--the-loai' || a === '--preset') args.preset = next();
    else if (a === '--ignore') args.ignore.push(...next().split(',').map((s) => s.trim()).filter(Boolean));
    else if (a === '--rule') {
      const [k, v] = next().split('=');
      if (!k || !v) fail('--rule cần dạng <mã|tên>=<off|info|warning|error>');
      args.rules[k] = v;
    } else if (a === '--min-words') args.minWords = Number(next());
    else if (a === '--config') args.config = next();
    else if (a === '--write') args.write = true;
    else if (a.startsWith('-') && a !== '-') fail(`Không biết tuỳ chọn ${a}`);
    else args._.push(a);
  }
  return args;
}

function fail(message) {
  process.stderr.write(`vi-humanizer: ${message}\n\nXem: vi-humanizer --help\n`);
  process.exit(2);
}

function loadConfig(path) {
  const file = path ?? (existsSync('.vihumanizerrc.json') ? '.vihumanizerrc.json' : null);
  if (!file) return {};
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    fail(`Không đọc được cấu hình ${file}: ${e.message}`);
  }
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'vendor']);
function expand(paths) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) { if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.')) walk(join(dir, entry.name)); }
      else if (/\.(md|markdown|mdx|txt)$/i.test(entry.name)) out.push(join(dir, entry.name));
    }
  };
  for (const p of paths) {
    if (p === '-') { out.push(p); continue; }
    if (!existsSync(p)) fail(`Không thấy ${p}`);
    if (statSync(p).isDirectory()) walk(p); else out.push(p);
  }
  return out;
}

function read(file) {
  return file === '-' ? readFileSync(0, 'utf8') : readFileSync(file, 'utf8');
}

function print(s) {
  process.stdout.write(s.endsWith('\n') ? s : `${s}\n`);
}

function options(args, config) {
  return {
    preset: args.preset ?? config.preset,
    rules: { ...(config.rules ?? {}), ...args.rules },
    ignore: [...(config.ignore ?? []), ...args.ignore],
    minWords: args.minWords ?? config.minWords,
    banned: config.banned,
    terms: config.terms,
  };
}

function guard(fn) {
  try {
    return fn();
  } catch (e) {
    fail(e.message);
  }
}

function scan(args, config) {
  const files = expand(args._.length ? args._ : ['-']);
  const opts = options(args, config);
  const results = guard(() => files.map((file) => ({ file: file === '-' ? '<stdin>' : file, report: analyze(read(file), opts) })));

  switch (args.format) {
    case 'json': print(JSON.stringify(results, null, 2)); break;
    case 'md': print(formatScanMarkdown(results)); break;
    case 'sarif': print(JSON.stringify(toSarif(results, pkg.version), null, 2)); break;
    case 'github': print(formatGithub(results) || ''); break;
    case 'text': print(formatScanText(results)); break;
    default: fail(`Định dạng không hỗ trợ: ${args.format}`);
  }

  const failOn = args.failOn ?? config.failOn;
  if (failOn) {
    const failed = {
      loi: () => results.some((r) => r.report.counts.error > 0),
      'canh-bao': () => results.some((r) => r.report.counts.error + r.report.counts.warning > 0),
      ro: () => results.some((r) => LEVELS.indexOf(r.report.level) >= 1),
      nhieu: () => results.some((r) => LEVELS.indexOf(r.report.level) >= 2),
    }[failOn];
    if (!failed) fail('--fail-on phải là ro | nhieu | loi | canh-bao');
    if (failed()) process.exitCode = 1;
  }
  const failAbove = args.failAbove ?? config.failAbove;
  if (failAbove != null) {
    if (!Number.isFinite(failAbove)) fail('--fail-above cần một số');
    if (results.some((r) => r.report.score && r.report.score.value > failAbove)) process.exitCode = 1;
  }
}

function fixCmd(args, config) {
  const files = expand(args._.length ? args._ : ['-']);
  const opts = options(args, config);
  let refused = false;
  for (const file of files) {
    const before = read(file);
    const result = guard(() => fix(before, opts));
    if (file === '-' ) { process.stdout.write(result.text); continue; }
    if (args.format === 'json') print(JSON.stringify({ file, ...result, text: undefined }, null, 2));
    else print(formatFixText(file, result, lineDiff(before, result.text)));
    if (!result.ok) refused = true;
    else if (args.write && result.edits.length) writeFileSync(resolve(file), result.text, 'utf8');
  }
  if (!args.write && files.some((f) => f !== '-') && args.format !== 'json') process.stderr.write('(Chưa ghi gì. Thêm --write để áp dụng.)\n');
  if (refused) process.exitCode = 1;
}

function compare(args) {
  if (args._.length !== 2) fail('compare cần đúng 2 tệp: <gốc> <mới>');
  const result = compareFacts(read(args._[0]), read(args._[1]));
  print(args.format === 'json' ? JSON.stringify(result, null, 2) : formatCompareText(result));
  if (!result.ok) process.exitCode = 1;
}

function cleanCmd(args) {
  if (args._.length !== 1) fail('clean cần đúng 1 tệp');
  const file = args._[0];
  const result = clean(read(file));
  if (args.write && file !== '-') {
    writeFileSync(resolve(file), result.text, 'utf8');
    process.stderr.write(result.changes.length
      ? `Đã sửa ${file}: ${result.changes.map((x) => `${x.kind} ×${x.count}`).join(', ')}\n`
      : `${file}: không có gì để sửa\n`);
  } else {
    process.stdout.write(result.text);
  }
}

function init() {
  const file = '.vihumanizerrc.json';
  if (existsSync(file)) fail(`${file} đã có`);
  writeFileSync(file, `${JSON.stringify(CONFIG_TEMPLATE, null, 2)}\n`, 'utf8');
  print(`Đã tạo ${file}. Sửa "preset", "banned", "terms" cho hợp tổ chức của bạn.`);
}

const [command, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);
if (args.version || command === '-v' || command === '--version') print(pkg.version);
else if (!command || args.help || command === '-h' || command === '--help') print(HELP);
else {
  const config = loadConfig(args.config);
  switch (command) {
    case 'scan': scan(args, config); break;
    case 'fix': fixCmd(args, config); break;
    case 'compare': compare(args); break;
    case 'clean': cleanCmd(args); break;
    case 'list': print(formatList()); break;
    case 'explain': {
      const text = args._[0] && formatExplain(args._[0]);
      if (!text) fail(`Không có quy tắc "${args._[0] ?? ''}". Xem: vi-humanizer list`);
      print(text);
      break;
    }
    case 'init': init(); break;
    default: fail(`Không biết lệnh "${command}"`);
  }
}
