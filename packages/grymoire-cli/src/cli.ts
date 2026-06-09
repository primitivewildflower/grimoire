#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import YAML from 'yaml';
import { readFile, writeFile, readdir, mkdir, copyFile, stat, access } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { stdin, stdout } from 'node:process';

import type { SpellDef, InputParam, ValidationResult, SpellEntry } from '../../grymoire-core/src/types.js';
import { validateSpell, formatValidationErrors } from '../../grymoire-core/src/spell-validator.js';

// ── Branding ─────────────────────────────────────────────────────────────────

const EMERALD = '#2ECC71';
const DARK_EMERALD = '#27AE60';
const GOLD = '#F1C40F';
const DIM = '#7F8C8D';

const brand = (t: string) => chalk.hex(EMERALD)(t);
const accent = (t: string) => chalk.hex(GOLD)(t);
const muted = (t: string) => chalk.hex(DIM)(t);
const dark = (t: string) => chalk.hex(DARK_EMERALD)(t);

function banner(): void {
  console.log('');
  console.log(dark('  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄'));
  console.log('  ' + brand('✦  G R I M O I R E') + muted('  — spell marketplace'));
  console.log('  ' + muted('Primitive Wildflower'));
  console.log(dark('  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀'));
  console.log('');
}

// ── Paths ────────────────────────────────────────────────────────────────────

const GRIMOIRE_HOME = join(homedir(), '.grimoire');
const REGISTRY_DIR = join(GRIMOIRE_HOME, 'registry');
const INSTALLED_DIR = join(GRIMOIRE_HOME, 'installed');
const REGISTRY_INDEX = join(REGISTRY_DIR, 'index.json');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SPELLS_REPO = join(dirname(dirname(__dirname)), 'spells');

async function ensureDirs(): Promise<void> {
  await mkdir(GRIMOIRE_HOME, { recursive: true });
  await mkdir(REGISTRY_DIR, { recursive: true });
  await mkdir(INSTALLED_DIR, { recursive: true });
  try {
    await stat(REGISTRY_INDEX);
  } catch {
    await writeFile(REGISTRY_INDEX, JSON.stringify([], null, 2), 'utf-8');
  }
}

// ── Registry Helpers ─────────────────────────────────────────────────────────

interface RegistryEntry {
  name: string;
  version: string;
  title: string;
  author: string;
  category: string;
  description: string;
  tags: string[];
  path: string;
  price?: number;
}

async function loadRegistry(): Promise<RegistryEntry[]> {
  await ensureDirs();
  const raw = await readFile(REGISTRY_INDEX, 'utf-8');
  return JSON.parse(raw);
}

async function saveRegistry(entries: RegistryEntry[]): Promise<void> {
  await writeFile(REGISTRY_INDEX, JSON.stringify(entries, null, 2), 'utf-8');
}

async function findSpellInRegistry(name: string): Promise<RegistryEntry | undefined> {
  const registry = await loadRegistry();
  return registry.find(s => s.name === name);
}

async function publishToRegistry(spellPath: string): Promise<RegistryEntry> {
  const raw = await readFile(spellPath, 'utf-8');
  const spell = YAML.parse(raw) as SpellDef;
  const validation = validateSpell(spell);
  if (!validation.valid) {
    throw new Error(`Spell validation failed:\n${formatValidationErrors(validation)}`);
  }

  const destName = `${spell.name}.grimoire`;
  const destPath = join(REGISTRY_DIR, destName);
  await copyFile(spellPath, destPath);

  const registry = await loadRegistry();
  const existing = registry.findIndex(s => s.name === spell.name);
  const entry: RegistryEntry = {
    name: spell.name,
    version: spell.version,
    title: spell.title,
    author: spell.author,
    category: spell.category,
    description: spell.description,
    tags: spell.tags ?? [],
    path: destPath,
    price: spell.price,
  };

  if (existing >= 0) {
    registry[existing] = entry;
  } else {
    registry.push(entry);
  }

  await saveRegistry(registry);
  return entry;
}

async function syncRepoSpells(): Promise<void> {
  try {
    const entries = await readdir(SPELLS_REPO);
    for (const entry of entries) {
      if (entry.endsWith('.grimoire')) {
        const spellPath = join(SPELLS_REPO, entry);
        try {
          await publishToRegistry(spellPath);
        } catch {
          // skip invalid spells
        }
      }
    }
  } catch {
    // spells repo may not exist yet
  }
}

async function loadSpellDef(filePath: string): Promise<SpellDef> {
  const raw = await readFile(filePath, 'utf-8');
  return YAML.parse(raw) as SpellDef;
}

async function findInstalledSpellPath(name: string): Promise<string | undefined> {
  const filePath = join(INSTALLED_DIR, `${name}.grimoire`);
  try {
    await stat(filePath);
    return filePath;
  } catch {
    return undefined;
  }
}

// ── Prompt helpers ───────────────────────────────────────────────────────────

async function prompt(question: string, defaultVal?: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  const def = defaultVal !== undefined ? ` (${defaultVal})` : '';
  const answer = await rl.question(muted('  ? ') + question + def + ': ');
  rl.close();
  return answer.trim() || defaultVal || '';
}

async function promptNumber(question: string): Promise<number | undefined> {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(muted('  ? ') + question + ': ');
  rl.close();
  const trimmed = answer.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isNaN(n) ? undefined : n;
}

async function promptConfirm(question: string, def = false): Promise<boolean> {
  const rl = createInterface({ input: stdin, output: stdout });
  const yn = def ? 'Y/n' : 'y/N';
  const answer = await rl.question(muted('  ? ') + question + ` (${yn}): `);
  rl.close();
  const a = answer.trim().toLowerCase();
  if (!a) return def;
  return a === 'y' || a === 'yes';
}

async function promptSelect(question: string, options: string[]): Promise<string> {
  console.log(muted('  ? ') + question + ':');
  options.forEach((opt, i) => {
    console.log(muted(`    ${i + 1}. `) + opt);
  });
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(muted('  > Enter number: '));
  rl.close();
  const idx = Number(answer.trim()) - 1;
  if (idx >= 0 && idx < options.length) return options[idx];
  return options[0];
}

// ── Table output ─────────────────────────────────────────────────────────────

function table(headers: string[], rows: string[][]): void {
  const colWidths = headers.map((h, ci) => {
    const maxRow = rows.reduce((m, r) => Math.max(m, (r[ci] || '').length), 0);
    return Math.max(h.length, maxRow);
  });

  const sep = dark('│');
  const headerLine = headers.map((h, i) => brand(h.padEnd(colWidths[i]))).join(` ${sep} `);
  console.log(`  ${headerLine}`);

  const divider = colWidths.map(w => dark('─'.repeat(w))).join(dark('─┼─'));
  console.log(`  ${dark('─')}${divider}${dark('─')}`);

  for (const row of rows) {
    const line = row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(` ${sep} `);
    console.log(`  ${sep} ${line} ${sep}`);
  }
}

function statusBadge(installed: boolean): string {
  return installed ? brand('● installed') : muted('○ available');
}

// ── Spinner ──────────────────────────────────────────────────────────────────

function spin(text: string) {
  return ora({ text: muted(text), spinner: 'dots' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

async function cmdList(): Promise<void> {
  banner();
  const sp = spin('Scanning grimoire...').start();

  await syncRepoSpells();
  const registry = await loadRegistry();

  if (registry.length === 0) {
    sp.info(muted('No spells found in registry. Run ') + accent('grimoire init') + muted(' to create one.'));
    return;
  }

  const installedNames = new Set<string>();
  try {
    const files = await readdir(INSTALLED_DIR);
    for (const f of files) {
      if (f.endsWith('.grimoire')) installedNames.add(f.replace('.grimoire', ''));
    }
  } catch { /* dir may not exist */ }

  sp.succeed(brand(`Found ${registry.length} spells in the grimoire`));

  const headers = ['SPELL', 'VERSION', 'CATEGORY', 'AUTHOR', 'STATUS'];
  const rows = registry.map(s => [
    accent(s.name),
    s.version,
    s.category,
    s.author,
    statusBadge(installedNames.has(s.name)),
  ]);

  table(headers, rows);
  console.log('');
  console.log(muted(`  ${installedNames.size} installed / ${registry.length} available`));
  console.log('');
}

async function cmdSearch(query: string): Promise<void> {
  banner();
  const sp = spin(`Searching for "${query}"...`).start();

  await syncRepoSpells();
  const registry = await loadRegistry();

  const q = query.toLowerCase();
  const results = registry.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.title.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.tags.some(t => t.toLowerCase().includes(q)),
  );

  if (results.length === 0) {
    sp.info(muted(`No spells found matching "${query}".`));
    console.log(muted('  Try ') + accent('grimoire list') + muted(' to see all available spells.'));
    return;
  }

  sp.succeed(brand(`Found ${results.length} spell${results.length > 1 ? 's' : ''}`));

  const headers = ['SPELL', 'VERSION', 'CATEGORY', 'DESCRIPTION'];
  const rows = results.map(s => [
    accent(s.name),
    s.version,
    s.category,
    s.description.length > 60 ? s.description.slice(0, 57) + '...' : s.description,
  ]);

  table(headers, rows);
  console.log('');
  console.log(muted(`  Install with: ${accent(`grimoire install <name>`)}`));
  console.log('');
}

async function cmdInstall(name: string): Promise<void> {
  banner();
  const sp = spin(`Installing spell "${name}"...`).start();

  await syncRepoSpells();
  const entry = await findSpellInRegistry(name);

  if (!entry) {
    sp.fail(muted(`Spell "${name}" not found in registry. Try `) + accent('grimoire search'));
    return;
  }

  const srcPath = entry.path;
  const destPath = join(INSTALLED_DIR, `${name}.grimoire`);

  try {
    await copyFile(srcPath, destPath);
  } catch (err) {
    sp.fail(muted(`Failed to install: ${err instanceof Error ? err.message : err}`));
    return;
  }

  sp.succeed(brand(`Installed ${accent(name)} v${entry.version}`));
  console.log('');
  console.log(muted(`  Cast with: ${accent(`grimoire cast ${name}`)}`));
  console.log('');
}

async function cmdCast(name: string, providedInputs: string[]): Promise<void> {
  banner();
  const sp = spin(`Loading spell "${name}"...`).start();

  const spellPath = await findInstalledSpellPath(name);
  if (!spellPath) {
    sp.fail(muted(`Spell "${name}" is not installed. Run `) + accent(`grimoire install ${name}`));
    return;
  }

  let spell: SpellDef;
  try {
    spell = await loadSpellDef(spellPath);
  } catch {
    sp.fail(muted(`Failed to parse spell "${name}". The file may be corrupted.`));
    return;
  }

  // Validate the spell itself
  const validation = validateSpell(spell);
  if (!validation.valid) {
    sp.warn(muted('Spell has validation issues:'));
    console.log(formatValidationErrors(validation));
  }

  sp.succeed(brand(`Loaded ${accent(spell.title)} v${spell.version}`));

  // Parse provided inputs (--input key=value format)
  const parsedInputs: Record<string, any> = {};
  for (const arg of providedInputs) {
    const eqIdx = arg.indexOf('=');
    if (eqIdx > 0) {
      const key = arg.slice(0, eqIdx);
      const val = arg.slice(eqIdx + 1);
      parsedInputs[key] = val;
    }
  }

  // Gather inputs interactively
  console.log('');
  console.log(dark('  ── Input Parameters ──'));
  console.log('');
  const inputs: Record<string, any> = {};

  for (const param of spell.inputs) {
    if (parsedInputs[param.name] !== undefined) {
      inputs[param.name] = coerceInput(parsedInputs[param.name], param.type);
      console.log(`  ${brand('✓')} ${param.name}: ${muted(String(inputs[param.name]))}`);
      continue;
    }

    const required = param.required !== false;
    const reqMark = required ? brand('*') : '';
    const defStr = param.default !== undefined ? muted(` [default: ${param.default}]`) : '';
    const descStr = muted(` (${param.description})`);

    const raw = await prompt(`${param.name}${reqMark} ${descStr}${defStr}`, param.default !== undefined ? String(param.default) : undefined);

    if (!raw && required) {
      console.log(brand(`  ⚠ ${param.name} is required, using default`));
      inputs[param.name] = param.default ?? '';
    } else if (!raw) {
      inputs[param.name] = param.default;
    } else {
      inputs[param.name] = coerceInput(raw, param.type);
    }
  }

  // Validate inputs
  for (const param of spell.inputs) {
    if (param.required !== false && (inputs[param.name] === undefined || inputs[param.name] === '')) {
      console.log(brand(`\n  ⚠ Error: "${param.name}" is required but was not provided.`));
      return;
    }
    if (param.min !== undefined && typeof inputs[param.name] === 'number' && inputs[param.name] < param.min) {
      console.log(brand(`\n  ⚠ Error: "${param.name}" must be >= ${param.min}`));
      return;
    }
    if (param.max !== undefined && typeof inputs[param.name] === 'number' && inputs[param.name] > param.max) {
      console.log(brand(`\n  ⚠ Error: "${param.name}" must be <= ${param.max}`));
      return;
    }
  }

  // Approval check
  if (spell.requires_approval) {
    console.log('');
    console.log(accent('  ⚡ This spell requires approval before execution.'));
    const approved = await promptConfirm('Proceed with execution?', false);
    if (!approved) {
      console.log(brand('\n  🛑 Execution denied.'));
      return;
    }
  }

  // Execute ritual
  console.log('');
  console.log(dark('  ── Ritual Execution ──'));
  console.log('');

  const startTime = Date.now();
  const steps = spell.ritual.steps;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const num = String(i + 1).padStart(2, '0');

    if (i > 0) {
      await sleep(400);
    }

    console.log(`  ${dark(`[${num}/${steps.length}]`)} ${brand(step.name)}`);
    console.log(muted(`        ${step.description}`));

    if (step.provider_hint) {
      console.log(muted(`        provider: ${step.provider_hint}`));
    }
    if (step.template) {
      console.log(muted(`        template: ${step.template}`));
    }
  }

  // Simulate output
  await sleep(300);
  console.log('');
  console.log(dark('  ── Output ──'));
  console.log('');

  const mockOutput = generateMockOutput(spell, inputs);
  console.log(YAML.stringify(mockOutput, null, 2).split('\n').map(l => `  ${l}`).join('\n'));

  const elapsed = Date.now() - startTime;
  console.log('');
  console.log(muted(`  ✓ Ritual complete in ${elapsed}ms`));
  console.log('');
}

function coerceInput(value: string, type: string): any {
  switch (type) {
    case 'number': return Number(value);
    case 'boolean': return value.toLowerCase() === 'true' || value === '1';
    case 'string[]': return value.split(',').map(s => s.trim());
    case 'number[]': return value.split(',').map(s => Number(s.trim()));
    case 'object': try { return JSON.parse(value); } catch { return value; }
    default: return value;
  }
}

function generateMockOutput(spell: SpellDef, inputs: Record<string, any>): any {
  const result: Record<string, any> = {};
  const schema = spell.output.schema;
  if (schema) {
    for (const [key, prop] of Object.entries(schema)) {
      result[key] = generateMockValue(prop, 0);
    }
  }
  result['_input'] = inputs;
  result['_spell'] = `${spell.name}@${spell.version}`;
  result['_executedAt'] = new Date().toISOString();
  return result;
}

function generateMockValue(prop: any, depth: number): any {
  if (depth > 3) return '...';
  switch (prop.type) {
    case 'string': return '<generated text>';
    case 'number': return 42;
    case 'boolean': return true;
    case 'array':
      if (prop.items) return [generateMockValue(prop.items, depth + 1)];
      return ['<item>'];
    case 'object':
      if (prop.properties) {
        const obj: Record<string, any> = {};
        for (const [k, v] of Object.entries(prop.properties)) {
          obj[k] = generateMockValue(v, depth + 1);
        }
        return obj;
      }
      return {};
    default:
      return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cmdCreate(): Promise<void> {
  banner();
  console.log(dark('  ── Spell Creation Wizard ──'));
  console.log(muted('  Create a new GRIMOIRE spell definition'));
  console.log('');

  const name = await prompt('Spell name (kebab-case)');
  if (!name) {
    console.log(brand('\n  ⚠ Name is required. Aborting.'));
    return;
  }

  const version = await prompt('Version', '1.0.0');
  const title = await prompt('Title (human-readable)');
  if (!title) {
    console.log(brand('\n  ⚠ Title is required. Aborting.'));
    return;
  }

  const author = await prompt('Author (e.g. github-username)', 'pw-grimoire/sax');
  const category = await promptSelect('Category', ['frontier', 'practical', 'code-review', 'ritual']);
  const license = await promptSelect('License', ['MIT', 'Apache-2.0', 'CC-BY-4.0', 'GPL-3.0']);
  const description = await prompt('Description (1-3 sentences)');
  const price = await promptNumber('Price in cents USD (0 = free)') ?? 0;

  const tagsRaw = await prompt('Tags (comma-separated)');
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  const needsApproval = await promptConfirm('Requires human approval before execution?', false);

  // Inputs
  console.log('');
  console.log(dark('  ── Input Parameters ──'));
  const inputs: InputParam[] = [];
  let moreInputs = true;
  while (moreInputs) {
    const inName = await prompt('  Param name (empty to finish)');
    if (!inName) break;

    const inType = await promptSelect('  Type', ['string', 'number', 'boolean', 'string[]', 'number[]', 'object']);
    const inDesc = await prompt('  Description');
    const inRequired = await promptConfirm('  Required?', true);

    const input: InputParam = {
      name: inName,
      type: inType as InputParam['type'],
      description: inDesc,
      required: inRequired,
    };

    if (inType === 'number' || inType === 'number[]') {
      const mn = await promptNumber('  Min value');
      const mx = await promptNumber('  Max value');
      if (mn !== undefined) input.min = mn;
      if (mx !== undefined) input.max = mx;
    }

    if (!inRequired) {
      const def = await prompt('  Default value');
      if (def) input.default = def;
    }

    inputs.push(input);
  }

  // Ritual steps
  console.log('');
  console.log(dark('  ── Ritual Steps ──'));
  const steps: { name: string; description: string; provider_hint?: 'local' | 'remote' | 'any'; template?: string }[] = [];
  let moreSteps = true;
  while (moreSteps) {
    const stepName = await prompt('  Step name (empty to finish)');
    if (!stepName) break;

    const stepDesc = await prompt('  Description');
    const stepProv = await promptSelect('  Provider hint', ['(skip)', 'local', 'remote', 'any']);
    const stepTemplate = await prompt('  Template path (optional)');

    const step: typeof steps[number] = { name: stepName, description: stepDesc };
    if (stepProv !== '(skip)') step.provider_hint = stepProv as 'local' | 'remote' | 'any';
    if (stepTemplate) step.template = stepTemplate;
    steps.push(step);
  }

  // Build spell definition
  const spell: Partial<SpellDef> & Record<string, any> = {
    name,
    version,
    title,
    author,
    category: category as SpellDef['category'],
    license,
    description,
    inputs,
    output: {
      type: 'object',
      schema: {
        result: { type: 'string' },
      },
    },
    ritual: { steps },
  };

  if (price > 0) spell.price = price;
  if (tags.length > 0) spell.tags = tags;
  if (needsApproval) spell.requires_approval = true;

  const yaml = YAML.stringify(spell, null, 2);
  const header = `# ${title}\n# GRIMOIRE Spell Definition — GDL v1.0\n# Generated ${new Date().toISOString().split('T')[0]}\n\n`;
  const outputPath = join(process.cwd(), `${name}.grimoire`);

  await writeFile(outputPath, header + yaml, 'utf-8');

  console.log('');
  console.log(brand(`  ✦ Spell created: ${accent(outputPath)}`));
  console.log(muted(`  Validate with: ${accent(`grimoire validate ${name}.grimoire`)}`));
  console.log(muted(`  Test with:    ${accent(`grimoire cast ${name}`)}`));
  console.log(muted(`  Publish with: ${accent(`grimoire publish ${name}.grimoire`)}`));
  console.log('');
}

async function cmdValidate(filePath: string): Promise<void> {
  banner();

  const sp = spin(`Validating ${basename(filePath)}...`).start();

  let spell: SpellDef;
  try {
    const raw = await readFile(filePath, 'utf-8');
    spell = YAML.parse(raw) as SpellDef;
  } catch (err) {
    sp.fail(muted(`Failed to read or parse file: ${err instanceof Error ? err.message : err}`));
    return;
  }

  const result: ValidationResult = validateSpell(spell);

  if (result.valid) {
    sp.succeed(brand(`Spell "${spell.name}" is valid`));
  } else {
    sp.fail(muted(`Spell "${spell.name || 'unnamed'}" has ${result.errors.length} error(s)`));
  }

  // Detailed output
  console.log('');
  if (result.errors.length > 0) {
    console.log(brand(`  ERRORS (${result.errors.length}):`));
    for (const e of result.errors) {
      console.log(`    ${brand('✗')} ${muted(e.field)}: ${e.message}${e.value !== undefined ? ` (got: ${JSON.stringify(e.value)})` : ''}`);
    }
  }

  if (result.warnings.length > 0) {
    console.log('');
    console.log(accent(`  WARNINGS (${result.warnings.length}):`));
    for (const w of result.warnings) {
      console.log(`    ${accent('⚠')} ${muted(w)}`);
    }
  }

  if (result.valid && result.warnings.length === 0) {
    console.log(brand('\n  ✓ All checks passed. This spell is ready to publish.'));
  }

  console.log('');
}

async function cmdPublish(filePath: string): Promise<void> {
  banner();

  const sp = spin(`Publishing spell...`).start();

  try {
    const entry = await publishToRegistry(filePath);
    sp.succeed(brand(`Published ${accent(entry.name)} v${entry.version} to the registry`));
    console.log('');
    console.log(muted(`  Registry path: ${entry.path}`));
    console.log(muted(`  Install with:  ${accent(`grimoire install ${entry.name}`)}`));
  } catch (err) {
    sp.fail(muted(`Publish failed: ${err instanceof Error ? err.message : err}`));
  }

  console.log('');
}

async function cmdInit(name: string): Promise<void> {
  banner();

  const sp = spin(`Scaffolding spell project "${name}"...`).start();

  const projectDir = join(process.cwd(), name);

  try {
    await stat(projectDir);
    sp.fail(muted(`Directory "${name}" already exists.`));
    return;
  } catch { /* expected */ }

  await mkdir(projectDir, { recursive: true });

  const spellDef: Partial<SpellDef> & Record<string, any> = {
    name: name,
    version: '0.1.0',
    title: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    author: 'your-github-username',
    category: 'practical',
    license: 'MIT',
    description: 'A brief description of what this spell does.',
    tags: [],
    inputs: [
      { name: 'input', type: 'string', description: 'The primary input', required: true },
    ],
    output: {
      type: 'object',
      schema: {
        result: { type: 'string' },
      },
    },
    ritual: {
      steps: [
        { name: 'Prepare', description: 'Load and validate inputs' },
        { name: 'Process', description: 'Core spell logic' },
        { name: 'Deliver', description: 'Format and return output' },
      ],
    },
  };

  const header = `# ${name}\n# GRIMOIRE Spell Definition — GDL v1.0\n# Scaffolded ${new Date().toISOString().split('T')[0]}\n\n`;
  const yaml = YAML.stringify(spellDef, null, 2);
  const spellPath = join(projectDir, `${name}.grimoire`);
  await writeFile(spellPath, header + yaml, 'utf-8');

  // Create README
  const readme = `# ${name}\n\nA GRIMOIRE spell.\n\n## Usage\n\n\`\`\`bash\ngrimoire cast ${name}\n\`\`\`\n\n## Author\n\nyour-github-username\n`;
  await writeFile(join(projectDir, 'README.md'), readme, 'utf-8');

  // Create .gitignore
  await writeFile(join(projectDir, '.gitignore'), '.grimoire-cache/\nnode_modules/\n', 'utf-8');

  sp.succeed(brand(`Scaffolded spell project "${accent(name)}"`));
  console.log('');
  console.log(`  ${brand('✦')} ${spellPath}`);
  console.log(`  ${muted('├')} ${join(projectDir, 'README.md')}`);
  console.log(`  ${muted('└')} ${join(projectDir, '.gitignore')}`);
  console.log('');
  console.log(muted(`  Edit the spell: ${accent(`${name}/${name}.grimoire`)}`));
  console.log(muted(`  Validate:       ${accent(`grimoire validate ${name}/${name}.grimoire`)}`));
  console.log(muted(`  Publish:        ${accent(`grimoire publish ${name}/${name}.grimoire`)}`));
  console.log('');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

const program = new Command();

program
  .name('grimoire')
  .description(dark('✦ GRIMOIRE') + muted(' — spell marketplace by Primitive Wildflower'))
  .version('0.1.0')
  .addHelpText('beforeAll', [
    '',
    dark('  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄'),
    '  ' + brand('✦  G R I M O I R E') + muted('  — spell marketplace'),
    '  ' + muted('Primitive Wildflower'),
    dark('  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀'),
    '',
  ].join('\n'));

program
  .command('list')
  .description('List installed spells')
  .action(cmdList);

program
  .command('search <query>')
  .description('Search the marketplace for spells')
  .action(async (query: string) => { await cmdSearch(query); });

program
  .command('install <spell>')
  .description('Install a spell from the registry')
  .action(async (spell: string) => { await cmdInstall(spell); });

program
  .command('cast <spell>')
  .description('Execute a spell with given inputs')
  .option('-i, --input <key=value...>', 'Input parameters')
  .action(async (spell: string, options: { input?: string[] }) => {
    await cmdCast(spell, options.input ?? []);
  });

program
  .command('create')
  .description('Interactive spell creation wizard')
  .action(cmdCreate);

program
  .command('validate <file>')
  .description('Validate a spell.grimoire file')
  .action(async (file: string) => { await cmdValidate(file); });

program
  .command('publish [file]')
  .description('Publish a spell to the registry')
  .action(async (file?: string) => {
    await cmdPublish(file || join(process.cwd(), 'spell.grimoire'));
  });

program
  .command('init [name]')
  .description('Scaffold a new spell project')
  .action(async (name?: string) => {
    if (!name) {
      console.log(brand('Usage: grimoire init <spell-name>'));
      console.log(muted('  Spell name must be kebab-case, e.g. anti-slop-purification'));
      return;
    }
    await cmdInit(name);
  });

program.parse();
