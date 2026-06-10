# Contributing to GRIMOIRE

## Adding a New Spell

1. Fork the repository
2. Create a new `.grimoire` YAML file in `spells/`
3. Follow the GDL schema (see `README.md` for the format)
4. Validate your spell: `grimoire validate spells/your-spell.grimoire`
5. Open a pull request

## Spell Guidelines

- **Name:** kebab-case, unique, descriptive (e.g., `code-review`, `shader-telepathy`)
- **Category:** One of `frontier`, `practical`, `code-review`, or `ritual`
- **Version:** Semantic versioning (start at `0.1.0`)
- **Description:** One concise sentence
- **Inputs:** At least 1 required input with clear description
- **Ritual:** 3-5 named steps with descriptions
- **License:** MIT for community spells
- **Style:** Symbols only (✦ ◆ ● ○ ✗ ✓ ═). No emojis.
- **Pricing:** Free spells welcome. Paid spells set `price` in cents USD.

## Spell Requests

Open an issue tagged `spell-request` with:
- Concept name
- What it should do
- Suggested inputs and outputs
- Which category it fits

## Bug Reports

Open an issue with:
- Spell name and version
- Command that failed
- Expected vs actual behavior
- OS and Node.js version

## Code Contributions

The CLI is built with TypeScript (Commander.js, Chalk, Ora, YAML). See `packages/grimoire-cli/` for the source.

```bash
npm install
npm run build --workspaces
npm run cli -- <command>
```
