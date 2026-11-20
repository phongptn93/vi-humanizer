# vi-humanizer

**A Vietnamese prose editor for AI agents and for writers.** It flags template-style writing, fixes spelling and typography inconsistencies, rewrites for the right genre and voice, and **proves** that no fact was changed.

[Tiếng Việt](README.md)

## Why

Vietnamese text drafted by an LLM, or written in a hurry from a template, has tells of its own:

<!-- vi-humanizer-disable -->
- **Translationese:** *"một cách nhanh chóng"* (in a quick manner), *"được tạo bởi hệ thống"* (passive "by"), *"Việc kiểm tra là rất cần thiết"* (nominalised subject).
- **Bureaucratic and marketing clichés:** *"đóng vai trò then chốt"* (plays a pivotal role), *"trong bối cảnh … ngày nay"* (in today's context), *"giải pháp đột phá"* (breakthrough solution).
- **Template openers and closers:** *"Dưới đây là…"* (Below is…), *"Hy vọng thông tin trên hữu ích"* (Hope this helps).
- **Wrong forms of address:** a neutral *"bạn"* (you) aimed at a director.
- **Inconsistent typography:** em dashes, Title Case Headings, mixed tone-mark styles (*hoà* / *hòa*), `1,405,712` instead of `1.405.712`, US dates.
<!-- vi-humanizer-enable -->

The costliest error when "smoothing" a text is not on that list: **changing the facts.** vi-humanizer catches it with a deterministic comparison, not with the model grading itself.

## Features

- **55 rules in 10 groups.** Every rule has a stable ID (`VI20`), a name (`mot-cach`), a severity, before/after examples and a fix. Run `vi-humanizer explain <rule>`.
- **Genre presets:** `cong-van` (official letter), `email`, `bao-cao` (report), `thong-bao` (notice), `tin-nhan` (chat), `gioi-thieu` (marketing) and `huong-dan` (manual).
- **Template-prose index, 0–100.** It is deterministic and split into 5 published components, measured on syllables and syllable bigrams to suit Vietnamese. Thresholds are calibrated on the eval set. It is not an AI-authorship probability.
- **`fix` with proof.** It applies safe mechanical fixes, prints a diff, and refuses to write if any fact changed.
- **Fact guard.** It reads numbers the Vietnamese way, and checks percentages, dates (including ISO), times, codes, **proper names**, URLs and emails.
- **Organisation glossary.** Banned phrases and required terms from `.vihumanizerrc.json` are enforced and auto-fixed. A [JSON Schema](schema/vihumanizerrc.schema.json) is included.
- **Editing skill.** It has 3 modes and covers 8 genres and 5 voices, forms of address, and the layout rules for administrative documents in Decree 30/2020/NĐ-CP.
- **Integrations:**
  - a Claude Code plugin;
  - a one-line GitHub Action with inline PR annotations and SARIF output;
  - a pre-commit hook;
  - always-on templates for CLAUDE.md, Cursor, Copilot and any system prompt;
  - a typed JavaScript API.
- **Zero dependencies.** It needs Node ≥ 18 and makes no network calls.

## Install

```text
/plugin marketplace add phongptn93/vi-humanizer
/plugin install vi-humanizer@vi-humanizer
```

To use only the CLI, run `npx github:phongptn93/vi-humanizer scan file.md`. For GitHub Actions, use `phongptn93/vi-humanizer@v1`.

## Scope

- **Not an AI detector.** It measures writing habits, which hurried human writers share. Detectors are known to misclassify non-native writers ([Liang et al., 2023](https://arxiv.org/abs/2304.02819)).
- It makes no promise about evading detectors, and the skill refuses to insert deliberate errors.

MIT © 2026 Phong Pham
