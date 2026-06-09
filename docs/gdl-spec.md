# Grimoire Definition Language — Formal Specification v1.0
# June 2026

The Grimoire Definition Language (GDL) is a YAML-based specification format for defining portable, testable, versioned AI capabilities ("spells"). This is the formal specification for the GRIMOIRE platform.

---

## GDL Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique identifier (kebab-case) |
| `version` | string | Semantic version (MAJOR.MINOR.PATCH) |
| `title` | string | Human-readable display name |
| `author` | string | Creator identifier (github-style) |
| `category` | enum | `frontier` \| `practical` \| `code-review` \| `ritual` |
| `license` | string | SPDX identifier (MIT, Apache-2.0, CC-BY-4.0) |
| `description` | string | What the spell does (1-3 sentences) |
| `inputs` | array | Parameter definitions |
| `output` | object | Return type schema |
| `ritual` | object | Step-by-step execution definition |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `price` | number | Price in cents USD (0 = free) |
| `tags` | string[] | Search/discovery tags |
| `dependencies` | string[] | Other spell names this depends on |
| `requires_approval` | boolean | Whether execution needs human approval (default: false) |
| `rate_limit` | object | `{ per_minute: number, per_day: number }` |
| `deprecated` | boolean \| string | If deprecated, optionally link to replacement |
| `example` | object | `{ input: object, output: object }` — worked example |

### Input Schema

```yaml
inputs:
  - name: "query"
    type: "string"
    description: "The search query"
    required: true
  - name: "max_results"
    type: "number"
    default: 10
    min: 1
    max: 100
    description: "Maximum number of results"
  - name: "domains"
    type: "string[]"
    description: "Domains to search within"
    required: false
```

### Output Schema

```yaml
output:
  type: "object"
  schema:
    results:
      type: "array"
      items:
        type: "object"
        properties:
          title: { type: "string" }
          score: { type: "number" }
          excerpt: { type: "string" }
```

### Ritual Schema

```yaml
ritual:
  steps:
    - name: "Ingest"
      description: "Load and preprocess input data"
      provider_hint: "local"   # prefer local model for privacy-sensitive steps
    - name: "Process"
      description: "Core transformation"
      template: "spells/example/process.md"  # prompt template file
    - name: "Format"
      description: "Structure output"
```

---

## Versioning

- **MAJOR** — breaking changes to input/output schema
- **MINOR** — new inputs (backwards compatible), new ritual steps
- **PATCH** — prompt improvements, bug fixes, description updates

---

## Spell Lifecycle

```
draft → review → published → deprecated → archived
```

- `draft`: Local only. Not in registry.
- `review`: Submitted. Awaiting moderation.
- `published`: Live in marketplace.
- `deprecated`: Still available but superseded.
- `archived`: Hidden. Only accessible via direct URL.

---

## Validation Rules

1. `name` must be unique in the registry and kebab-case
2. `version` must follow semver
3. All `required: true` inputs must be provided at execution
4. `min`/`max` constraints must be satisfied
5. All `dependencies` must exist in the registry
6. `ritual.steps` must have at least one step
7. `price` must be >= 0 and integer (cents USD)

---

## Example Spell (Minimal)

```yaml
name: "anti-slop-purification"
version: "1.0.0"
title: "Anti-Slop Purification"
author: "pw-grimoire/sax"
category: "practical"
license: "MIT"
description: "Purifies AI-generated text, restoring human voice and depth."

inputs:
  - name: "text"
    type: "string"
    description: "The text to purify"
    required: true
  - name: "voice"
    type: "string"
    description: "Target voice description"
    required: false

output:
  type: "object"
  schema:
    purified_text: { type: "string" }
    changes: { type: "array", items: { type: "object" } }

ritual:
  steps:
    - name: "Analyze"
      description: "Identify slop patterns (redundancy, cliche, corporate-speak)"
    - name: "Purify"
      description: "Rewrite with human voice, removing AI-isms"
    - name: "Document"
      description: "List specific changes made"
```
