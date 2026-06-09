# GRIMOIRE — AI Capability Definition Language + Runtime
# Build Phase: Scaffold | Status: Started June 2026
# Revenue: $19-99/mo | Target: $2K-5K/mo | Build Time: 2 weeks

> "Spells are capabilities. The grimoire is the marketplace."

---

## What It Is

GRIMOIRE is an AI capability definition language (GDL — Grimoire Definition Language) + marketplace + runtime. Think "npm for AI capabilities." 

Creators define "spells" — parameterized AI capability templates with explicit inputs, outputs, and a grimoire card. Users browse the marketplace, install spells, and execute them via the CLI or runtime. Each spell is a portable, testable, versioned AI capability.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GRIMOIRE PLATFORM                      │
│                                                           │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐  │
│  │ WEB UI    │  │ CLI       │  │ API                  │  │
│  │ (Next.js) │  │ (Node)    │  │ (Express)            │  │
│  │           │  │           │  │                      │  │
│  │ Browse    │  │ install   │  │ POST /cast           │  │
│  │ Search    │  │ cast      │  │ GET  /spells         │  │
│  │ Create    │  │ list      │  │ GET  /spells/:slug   │  │
│  │ Publish   │  │ validate  │  │                      │  │
│  └─────┬─────┘  └─────┬─────┘  └──────────┬──────────┘  │
│        │              │                    │              │
│        └──────────────┼────────────────────┘              │
│                       │                                   │
│              ┌────────┴────────┐                         │
│              │   GRIMOIRE CORE  │                         │
│              │                  │                         │
│              │ • Spell Registry │                         │
│              │ • Capability DSL │                         │
│              │ • Provider Adapter│                        │
│              │ • Execution Engine│                        │
│              │ • Version Manager │                         │
│              │ • Dependency Graph │                        │
│              └────────┬────────┘                          │
│                       │                                   │
│              ┌────────┴────────┐                         │
│              │   PROVIDER LAYER │                         │
│              │                  │                         │
│              │ OpenAI / Ollama  │                         │
│              │ Anthropic / Local│                         │
│              └─────────────────┘                          │
└─────────────────────────────────────────────────────────┘
```

---

## Spell Definition Format (GDL)

```yaml
# spell.grimoire — A single spell definition
name: "synchronicity-detection"
version: "1.2.0"
title: "Synchronicity Detection"
author: "pw-grimoire/sax"
category: "frontier"
license: "MIT"
price: 0  # 0 = free, or price in cents USD
tags: [synchronicity, pattern-detection, jungian, acausal]

description: >
  Detects acausal pattern clusters across dream journals, 
  codebases, and life events using Hermetic correspondence.

inputs:
  - name: primary_vault
    type: text
    description: "The primary text corpus to analyze"
    required: true
  - name: comparison_vaults
    type: text[]
    description: "Secondary corpora for cross-reference"
    required: false
  - name: timeframe_days
    type: number
    default: 7
    description: "Number of days to analyze"
  - name: sensitivity
    type: number
    default: 0.5
    min: 0.1
    max: 1.0
    description: "Pattern detection sensitivity"

output:
  type: object
  schema:
    clusters:
      type: array
      items:
        type: object
        properties:
          pattern: { type: string }
          domains: { type: string[] }
          confidence: { type: number }
          description: { type: string }

ritual:
  steps:
    - name: "Ingest"
      description: "Load and tokenize all vault content"
      provider_hint: "local"  # prefer local model for privacy
    - name: "Embed"
      description: "Generate embeddings for all content segments"
      provider_hint: "local"
    - name: "Cluster"
      description: "Identify cross-domain pattern clusters"
      template: "spells/synchronicity/cluster.md"
    - name: "Interpret"
      description: "Generate narrative interpretation of clusters"
      template: "spells/synchronicity/interpret.md"
    - name: "Present"
      description: "Format results as synchronicity report"

example:
  input:
    primary_vault: "dream_journal_2026_q2.md"
    timeframe_days: 7
    sensitivity: 0.7
  output:
    clusters:
      - pattern: "Water → Transformation"
        domains: [dreams, code_commits, journal_entries]
        confidence: 0.87
        description: "Three water-themed dreams coincided with major refactoring commits..."
```

---

## Folder Structure

```
GRIMOIRE/
├── README.md
├── package.json
│
├── packages/
│   ├── grimoire-core/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts          # Public API
│   │   │   ├── spell-registry.ts # Registry of spell definitions
│   │   │   ├── spell-validator.ts # Validate spell definitions
│   │   │   ├── execution-engine.ts # Runtime spell execution
│   │   │   ├── provider-adapter.ts # Multi-provider abstraction (12+ backends)
│   │   │   ├── version-manager.ts  # Spell versioning and upgrades
│   │   │   ├── dependency-graph.ts # Spell dependency resolution
│   │   │   └── types.ts          # Shared type definitions
│   │   └── spells/
│   │       └── examples/         # Example spells
│   │
│   ├── grimoire-cli/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── cli.ts            # CLI entry point
│   │   │   ├── commands/
│   │   │   │   ├── install.ts    # `grimoire install <spell>`
│   │   │   │   ├── cast.ts       # `grimoire cast <spell> [args]`
│   │   │   │   ├── list.ts       # `grimoire list`
│   │   │   │   ├── search.ts     # `grimoire search <query>`
│   │   │   │   ├── publish.ts    # `grimoire publish`
│   │   │   │   └── validate.ts   # `grimoire validate <spell>`
│   │   │   └── project-scaffolder.ts # `grimoire init`
│   │   └── templates/
│   │       └── spell/
│   │           └── spell.grimoire # Template for new spells
│   │
│   └── grimoire-ui/
│       ├── package.json
│       ├── src/
│       │   ├── pages/
│       │   │   ├── index.tsx      # Browse marketplace
│       │   │   ├── spells/
│       │   │   │   └── [slug].tsx # Spell detail page
│       │   │   ├── create.tsx     # Spell creation wizard
│       │   │   └── dashboard.tsx  # Creator dashboard
│       │   ├── components/
│       │   │   ├── SpellCard.tsx  # Marketplace card
│       │   │   ├── SpellPreview.tsx # Live sandbox preview
│       │   │   ├── SpellPulse.tsx # Execution visualization
│       │   │   └── SpellEditor.tsx # GDL editor with validation
│       │   └── themes/           # CLOAKROOM theme integration
│       └── public/
│
├── spells/                       # Published spell registry
│   └── registry.json             # Index of all published spells
│
├── docs/
│   ├── gdl-spec.md               # Grimoire Definition Language spec
│   ├── spell-authoring.md        # How to create spells
│   └── provider-guide.md         # Provider adapter documentation
│
└── LICENSE
```

---

## Source Code Extraction Map

| Source File (in PW ecosystem) | Destination (GRIMOIRE) | Purpose |
|-------------------------------|------------------------|---------|
| `LOCUS_CENTRAL/LOCUS_SPELLS/*.md` (59 spells) | `packages/grimoire-core/spells/examples/` | Initial 59 spell definitions |
| `LOCUS_CENTRAL/LOCUS_TOOLS/*.md` (24 tools) | `packages/grimoire-core/src/tool-spells/` | Tool-to-spell adapter |
| `LOCUS_CENTRAL/daemons/*/BaseDaemon.ts` | `packages/grimoire-core/src/runtime/daemon-runtime.ts` | Daemon interface for spell execution |
| `LEXICON/primitive-wildflower/src/components/AthanorSandbox.tsx` | `packages/grimoire-ui/src/components/SpellPreview.tsx` | Live sandbox preview |
| `LEXICON/primitive-wildflower/src/components/DaemonPulse.tsx` | `packages/grimoire-ui/src/components/SpellPulse.tsx` | Execution visualization |
| `CLOAKROOM/themes/` (34 themes) | `packages/grimoire-ui/src/themes/` | Themeable marketplace UI |
| `COINS/Forge/src/cli.ts` | `packages/grimoire-cli/src/commands/` | CLI project scaffolder patterns |
| `LOCUS_CENTRAL/CRYSTAL_BALL.md` | `docs/gdl-spec.md` | Spell philosophy and design principles |

---

## Development Plan (2 Weeks)

### Week 1: Core + CLI

| Day | Task | Output |
|-----|------|--------|
| 1 | Set up monorepo structure, TypeScript config | Project scaffold |
| 1 | Implement GDL types + spell validator | `types.ts`, `spell-validator.ts` |
| 2 | Implement spell registry (load/parse/validate) | `spell-registry.ts` |
| 2-3 | Implement provider adapter (Ollama + OpenAI) | `provider-adapter.ts` |
| 3-4 | Implement execution engine (step-by-step ritual) | `execution-engine.ts` |
| 4 | Convert 5 existing spells to GDL format | 5 example spell files |
| 5 | CLI: install, cast, list, search, validate | `grimoire-cli/` |
| 5 | CLI: `grimoire init` project scaffolder | Project template |

### Week 2: UI + Marketplace

| Day | Task | Output |
|-----|------|--------|
| 6-7 | Next.js app scaffold + API routes | `grimoire-ui/` |
| 7-8 | Browse marketplace page (grid of spell cards) | Browse experience |
| 8-9 | Spell detail page with live preview | `SpellPreview.tsx` |
| 9-10 | Spell creation wizard (form-based editor) | Creation experience |
| 10 | Creator dashboard (manage published spells) | Dashboard |
| 11 | Search + filter + categories | Discoverability |
| 12 | Polish, test, deploy to Vercel | Ship |

---

## Revenue Model

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Browse, install free spells, 5 casts/day |
| Apprentice | $19/mo | Unlimited casts, create spells, private spells |
| Adept | $49/mo | Custom providers, team spells, analytics, priority queue |
| Archmage | $99/mo | White-label, SSO, SLA, on-prem deployment |

---

## Initial Spell Library (0→20)

Convert 5 spells from LOCUS_SPELLS on day 4, convert 15 more in week 3:

1. synchronicity-detection (Frontier) — acausal pattern detection
2. shader-telepathy (Practical) — reverse-engineer aesthetic intent from GLSL
3. anti-slop-purification (Practical) — purify AI-generated text
4. code-review (Practical) — multi-lens code review
5. creative-brief (Practical) — generate creative brief from idea fragments
6. daemon-binding (Frontier) — design persistent AI agent systems
7. color-harmony-divination (Practical) — generate color palettes with rationale
8. api-design (Practical) — REST/GraphQL API design review
9. bundle-analysis (Practical) — webpack/vite bundle optimization
10. accessibility-audit (Practical) — WCAG audit and remediation
11. conceptual-blending (Frontier) — blend concepts across domains
12. anachronism-weaving (Frontier) — generate historically-informed speculative fiction
13. alchemical-stage-diagnosis (Frontier) — diagnose creative project phase
14. connection-weaving (Practical) — find non-obvious connections between ideas
15. pattern-synthesis (Frontier) — emergent pattern detection across vaults
16. audio-reactive-enchantment (Practical) — generate audio-reactive visual specs
17. sigil-generation (Frontier) — generate charged symbolic glyphs
18. dream-interpretation (Frontier) — Jungian dream analysis
19. ritual-design (Frontier) — design structured creative rituals
20. lens-insight (Frontier) — apply specific worldview lenses to content

---

## Next Steps

1. `mkdir -p GRIMOIRE/packages/{grimoire-core,grymoire-cli,grymoire-ui}/src`
2. Initialize npm workspace monorepo
3. Implement `types.ts` + `spell-validator.ts` (core foundation)
4. Convert first spell to GDL format as proof-of-concept
5. Ship CLI v0.1.0 on npm
