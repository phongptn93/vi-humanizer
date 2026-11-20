// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Sinh các mẫu nhúng từ templates/system-prompt.md (nguồn duy nhất).
//   node scripts/gen-templates.js           ghi tệp
//   node scripts/gen-templates.js --check   thoát mã 1 nếu lệch

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../templates/', import.meta.url);
const body = () => readFileSync(new URL('system-prompt.md', root), 'utf8')
  .split('\n').filter((l) => !l.startsWith('<!-- Khối luật')).join('\n').trim();

export function renderTemplates() {
  const rules = body();
  return {
    'CLAUDE.md': `<!-- vi-humanizer: khối luật văn phong tiếng Việt. Dán vào CLAUDE.md. Gọi /vi-humanizer khi cần rà soát hoặc viết lại cả văn bản. -->\n${rules}\n`,
    'copilot-instructions.md': `<!-- vi-humanizer: dán vào .github/copilot-instructions.md -->\n${rules}\n`,
    'cursor/van-phong-tieng-viet.mdc': `---\ndescription: Văn phong tiếng Việt tự nhiên, giữ nguyên dữ kiện (vi-humanizer)\nalwaysApply: true\n---\n${rules}\n`,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check = process.argv.includes('--check');
  let stale = false;
  for (const [name, content] of Object.entries(renderTemplates())) {
    const file = fileURLToPath(new URL(name, root));
    if (check) {
      if (!existsSync(file) || readFileSync(file, 'utf8') !== content) { stale = true; process.stderr.write(`lệch: templates/${name}\n`); }
    } else {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content, 'utf8');
    }
  }
  if (stale) { process.stderr.write('Chạy: npm run docs\n'); process.exit(1); }
}
