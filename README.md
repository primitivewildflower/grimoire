# <img src="grimoire-icon.svg" width="28" height="28" alt="✦"> GRIMOIRE — AI Capability Marketplace

> *"Spells are capabilities. The grimoire is the marketplace."*

**npm for AI capabilities.** Define, share, and cast structured AI capabilities called "spells." An open-source CLI toolkit for AI agents, creative coding, code review, and esoteric practice. Local-first. No API keys required.

<p align="center">
  <strong>✦ CLI &bull; YAML &bull; Node.js &bull; BUSL-1.1 &bull; 15 Spells &bull; Creator Marketplace</strong>
</p>

---

## What It Is

GRIMOIRE is a package manager for AI intelligence. Package any AI capability as a portable, versioned spell using the Grimoire Definition Language (GDL). Typed inputs, validated outputs, multi-step rituals, and a creator marketplace where spell authors earn revenue.

Think: npm for AI prompts -- but structured. Not a prompt library. A capability protocol.

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

### Use Cases

| Use Case | Spells |
|----------|--------|
| **AI Agents** | daemon-binding, synchronicity-detection, pattern-synthesis |
| **Creative Coding** | shader-telepathy, audio-reactive-enchantment, color-harmony-divination |
| **Code Quality** | code-review, accessibility-audit, bundle-analysis |
| **Content Creation** | anti-slop-purification, creative-brief, conceptual-blending |
| **Esoteric Practice** | ritual-design, sigil-generation, dream-interpretation |
| **Developer Tools** | Install via npm, cast from CLI, publish your own spells |

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
| `grimoire search <query>` | Search the marketplace by name, tag, or description |
| `grimoire install <spell>` | Install a spell from the marketplace |
| `grimoire cast <spell>` | Execute a spell with typed inputs and ritual steps |
| `grimoire create` | Interactive spell creation wizard (guided YAML generation) |
| `grimoire validate <file>` | Validate a GDL spell definition against the schema |
| `grimoire publish <file>` | Publish a spell to the marketplace (set your price) |
| `grimoire init <name>` | Scaffold a new spell project with template |

---

## Spell Library (15 Spells)

| Spell | Category | Description |
|-------|----------|-------------|
| `anti-slop-purification` | practical | Purifies AI-generated text, restoring human voice and depth |
| `synchronicity-detection` | frontier | Detects meaningful coincidences in data streams |
| `code-review` | code-review | Multi-pass code review with architectural and security analysis |
| `shader-telepathy` | frontier | Generates GLSL/WebGL shaders from natural language descriptions |
| `creative-brief` | practical | Creates comprehensive creative project briefs from concepts |
| `daemon-binding` | ritual | Binds an AI personality to a persistent identity and role |
| `color-harmony-divination` | frontier | Generates color palettes from esoteric and mathematical principles |
| `bundle-analysis` | practical | Analyzes JavaScript bundles for optimization opportunities |
| `accessibility-audit` | code-review | Audits web content for WCAG accessibility compliance |
| `conceptual-blending` | frontier | Blends disparate concepts into novel creative syntheses |
| `ritual-design` | ritual | Designs custom esoteric rituals and ceremonial structures |
| `pattern-synthesis` | frontier | Synthesizes patterns across multiple domains and frameworks |
| `audio-reactive-enchantment` | frontier | Creates audio-reactive visual experiences from sound input |
| `sigil-generation` | ritual | Generates esoteric sigils with intent encoding and meaning |
| `dream-interpretation` | ritual | Interprets dreams using archetypal frameworks and symbolism |

---

## Spell Format (GDL)

Spells are YAML files with structured capability definitions:

```yaml
name: anti-slop-purification
version: 1.0.0
title: "Anti-Slop Purification"
category: practical
description: "Purifies AI-generated text, restoring human voice and depth."
author: "Your Name"
license: MIT
price: 0
tags: [ai, writing, editing, quality]

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
      description: "Identify AI-generated patterns and markers"
    - name: Purify
      description: "Rewrite with authentic human voice and depth"
    - name: Document
      description: "List specific changes made with rationale"
```

Each spell defines its own typed interface, execution steps, and validation rules.

---

## Categories

| Category | Domain | Count | Keywords |
|----------|--------|-------|----------|
| `frontier` | Creative Code | 6 | generative, shaders, audio, visualization, synthesis |
| `practical` | Sovereignty | 4 | editing, optimization, analysis, productivity |
| `code-review` | Alchemy | 2 | code quality, security, accessibility |
| `ritual` | Esoteric Knowledge | 4 | divination, symbolism, archetypes, ceremony |

---

## Why GRIMOIRE

- **Structured capabilities** -- Typed inputs, validated outputs, versioned rituals. Spells are testable, composable, and safe.
- **Local-first** -- Spells execute on your machine. No API keys. No cloud dependency. Your data stays yours.
- **Creator economy** -- Publish spells to the marketplace. Set your own price. Earn 70% of every purchase.
- **Open standard** -- GDL is a YAML-based protocol. Anyone can write spells. Anyone can build tooling.
- **Symbol-based** -- Clean, cryptic, serious. Symbols only (✦ ◆ ● ○ ✗ ✓ ═). No emojis.
- **AI-native** -- Designed as a capability layer for AI agents. Structured interfaces for model-driven execution.

---

## Community

- **Contribute spells:** Fork, write a `.grimoire` YAML file in `spells/`, and open a PR. See [CONTRIBUTING.md](CONTRIBUTING.md).
- **Request spells:** Open an issue tagged `spell-request` with your concept.
- **Discuss:** [GitHub Discussions](https://github.com/primitivewildflower/grimoire/discussions)
- **Follow:** Star the repo to track new spells and releases.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features including:
- Spell composition (chain multiple spells in sequence)
- Web-based spell browser (Vue/React UI)
- Spell discovery via tags and ratings
- Community spell contests
- VSCode extension for inline spell casting

---

## License

BUSL-1.1 (Business Source License). Free for personal use, educational use, and small companies. Requires a commercial license for production SaaS use. Converts to AGPLv3 in 2030.

See [LICENSE.md](LICENSE.md) for full terms.

---

## Part of Primitive Wildflower

GRIMOIRE is part of the Primitive Wildflower ecosystem -- tools for sovereign creation at the intersection of code, consciousness, and craft.

| Component | Description | Visibility |
|-----------|-------------|------------|
| [GRIMOIRE](https://github.com/primitivewildflower/grimoire) | Spell marketplace | Public |
| [SAXON](https://github.com/primitivewildflower/locus-mlx) | Sovereign cipher + cyber defense | Private |
| LOCUS | Sovereign AI (local, zero cloud) | Private |
| VAULT | Strategy, architecture, research | Private |

*"The future of AI is 10,000 spells on 10,000 machines."*
