# <img src="grimoire-icon.svg" width="28" height="28" alt="✦"> GRIMOIRE — Spell Marketplace

> *"Spells are capabilities. The grimoire is the marketplace."*

**npm for AI capabilities.** Define, share, and cast structured AI capabilities called "spells."

---

## What It Is

GRIMOIRE lets you package AI capabilities as portable, versioned spell definitions using the Grimoire Definition Language (GDL). Think of it as a package manager for intelligence -- spells have typed inputs, validated outputs, multi-step rituals, and a marketplace.

```
$ grimoire search "code review"
$ grimoire install code-review
$ grimoire cast code-review --code ./src/App.tsx

  Casting: Code Review v1.0.0
  [1/6] Parse ................... OK
  [2/6] Architectural Review .... OK Found 3 issues
  [3/6] Security Review ......... OK Found 1 critical
  ...
```

---

## Quick Start

```bash
npm install -g grimoire-cli
grimoire list
grimoire install anti-slop-purification
grimoire cast anti-slop-purification --text "Your AI-generated content here"
```

---

## Commands

| Command | Description |
|---------|-------------|
| `grimoire list` | Browse installed and available spells |
| `grimoire search <query>` | Search the marketplace |
| `grimoire install <spell>` | Install a spell |
| `grimoire cast <spell>` | Execute a spell with inputs |
| `grimoire create` | Interactive spell creation wizard |
| `grimoire validate <file>` | Validate a spell definition |
| `grimoire publish <file>` | Publish to the marketplace |
| `grimoire init <name>` | Scaffold a new spell project |

---

## Spell Library (15 Spells)

| Spell | Category | Description |
|-------|----------|-------------|
| `anti-slop-purification` | practical | Purifies AI-generated text, restoring human voice |
| `synchronicity-detection` | frontier | Detects meaningful coincidences in data streams |
| `code-review` | code-review | Multi-pass code review with architectural analysis |
| `shader-telepathy` | frontier | Generates GLSL shaders from natural language |
| `creative-brief` | practical | Creates comprehensive creative project briefs |
| `daemon-binding` | ritual | Binds an AI personality to a persistent identity |
| `color-harmony-divination` | frontier | Generates color palettes from esoteric principles |
| `bundle-analysis` | practical | Analyzes JavaScript bundles for optimization |
| `accessibility-audit` | code-review | Audits web content for accessibility compliance |
| `conceptual-blending` | frontier | Blends disparate concepts into novel syntheses |
| `ritual-design` | ritual | Designs custom esoteric rituals and ceremonies |
| `pattern-synthesis` | frontier | Synthesizes patterns across multiple domains |
| `audio-reactive-enchantment` | frontier | Creates audio-reactive visual experiences |
| `sigil-generation` | ritual | Generates esoteric sigils with intent encoding |
| `dream-interpretation` | ritual | Interprets dreams using archetypal frameworks |

---

## Spell Format (GDL)

Spells are YAML files with structured capability definitions:

```yaml
name: anti-slop-purification
version: 1.0.0
title: "Anti-Slop Purification"
category: practical
description: "Purifies AI-generated text, restoring human voice and depth."

inputs:
  - name: text
    type: string
    required: true
    description: "The text to purify"

output:
  type: object
  schema:
    purified_text: { type: string }

ritual:
  steps:
    - name: Analyze
      description: "Identify AI-generated patterns"
    - name: Purify
      description: "Rewrite with human voice"
    - name: Document
      description: "List specific changes made"
```

Each spell defines its own typed interface, execution steps, and validation rules. This isn't a prompt library -- it's a capability protocol.

---

## Categories

| Category | Domain | Count | Example Spells |
|----------|--------|-------|---------------|
| `frontier` | Creative Code | 6 | synchronicity-detection, shader-telepathy, audio-reactive-enchantment |
| `practical` | Sovereignty | 4 | anti-slop-purification, creative-brief, bundle-analysis |
| `code-review` | Alchemy | 2 | code-review, accessibility-audit |
| `ritual` | Esoteric Knowledge | 3 | ritual-design, daemon-binding, sigil-generation, dream-interpretation |

---

## Why GRIMOIRE

- **Structured, not just text.** Typed inputs, validated outputs, versioned rituals. Spells are testable, composable, and safe.
- **Local-first.** Spells execute on your machine. No API keys required for local execution. Your data stays yours.
- **Creator economy.** Publish spells to the marketplace. Set your own price. Earn 70% of every purchase.
- **Built for LOCUS.** Designed to work with LOCUS, the sovereign AI. Local execution, zero cloud dependency.
- **No emojis.** Symbols only (✦ ◆ ● ○ ✗ ✓ ═). Clean, cryptic, serious.

---

## License

BUSL-1.1 (Business Source License). Free for personal use, educational use, and companies with under $100K revenue and under 5 employees. Requires a commercial license for production SaaS use. Converts to AGPLv3 in 2030.

See [LICENSE.md](LICENSE.md) for full terms.

---

## Part of Primitive Wildflower

GRIMOIRE is part of the Primitive Wildflower ecosystem -- tools for sovereign creation at the intersection of code, consciousness, and craft.

| Ecosystem Component | Description |
|---------------------|-------------|
| [GRIMOIRE](https://github.com/primitivewildflower/grimoire) | Spell marketplace (public) |
| [SAXON](https://github.com/primitivewildflower/locus-mlx) | Sovereign cipher + cyber defense suite |
| LOCUS | Sovereign AI (private) |
| VAULT | Strategy + architecture (private) |

*"The future of AI is 10,000 spells on 10,000 machines."*
