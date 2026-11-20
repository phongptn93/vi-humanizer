// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// API dùng như thư viện:  import { analyze, fix, compareFacts } from 'vi-humanizer';
export { analyze, levelOf, resolveSeverities, ALL_RULES, LEVELS, LEVEL_LABEL, MIN_WORDS_FOR_LEVEL } from './analyze.js';
export { fix, lineDiff } from './fix.js';
export { extractFacts, compareFacts, canonicalNumber } from './facts.js';
export { clean } from './clean.js';
export { score, SCORE_WEIGHTS } from './score.js';
export { PRESETS } from './presets.js';
export { PATTERNS, GROUPS } from './patterns.js';
