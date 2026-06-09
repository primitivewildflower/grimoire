# GRIMOIRE — Spell Marketplace

> *"Spells are capabilities. The grimoire is the marketplace."*

**npm for AI capabilities.** Define, share, and cast structured AI capabilities called "spells."

---

## What It Is

GRIMOIRE lets you package AI capabilities as portable, versioned spell definitions using the Grimoire Definition Language (GDL). Think of it as a package manager for intelligence — spells have typed inputs, validated outputs, multi-step rituals, and a marketplace.

```
$ grimoire search "code review"
$ grimoire install code-review
$ grimoire cast code-review --code ./src/App.tsx

  🕯️  Casting: Code Review v1.0.0
  [1/6] Parse ................... ✔
  [2/6] Architectural Review .... ✔ Found 3 issues
  [3/6] Security Review ......... ✔ Found 1 critical
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

Each spell defines its own typed interface, execution steps, and validation rules. This isn't a prompt library — it's a capability protocol.

---

## Categories

| Category | Domain | Example Spells |
|----------|--------|---------------|
| `frontier` | Creative Code — pushing boundaries | synchronicity-detection, shader-telepathy |
| `practical` | Sovereignty — tools for independence | anti-slop-purification, creative-brief |
| `code-review` | Alchemy — refinement of craft | code-review |
| `ritual` | Esoteric Knowledge — initiatory practice | ritual-design, daemon-binding |

---

## Why GRIMOIRE

- **Structured, not just text.** Typed inputs, validated outputs, versioned rituals. Spells are testable, composable, and safe.
- **Local-first.** Spells execute on your machine. No API keys required for local execution. Your data stays yours.
- **Creator economy.** Publish spells to the marketplace. Set your own price. Earn 70% of every purchase.
- **Built for LOCUS.** Designed to work with LOCUS, the sovereign AI. Local execution, zero cloud dependency.

---

## License

BUSL-1.1 (Business Source License). Free for personal use, educational use, and companies with under $100K revenue and under 5 employees. Requires a commercial license for production SaaS use. Converts to AGPLv3 in 2030.

See [LICENSE.md](LICENSE.md) for full terms.

---

## Part of Primitive Wildflower

GRIMOIRE is part of the Primitive Wildflower ecosystem — tools for sovereign creation at the intersection of code, consciousness, and craft.

*"The future of AI is 10,000 spells on 10,000 machines."*
