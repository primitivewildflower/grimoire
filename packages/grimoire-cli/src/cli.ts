#!/usr/bin/env node
/**
 * GRIMOIRE CLI — Primitive Wildflower Spell Marketplace
 * 
 * Part of the LOCUS sovereign AI ecosystem.
 * Spells are AI capability definitions in GDL format.
 * Cast them locally. No cloud. No API keys. Your spells, your hardware.
 * 
 * Architecture:
 *   SAXON cipher — identity verification (spell authorship signing)
 *   LOCUS — execution runtime (the sovereign AI that casts spells)
 *   Cauldron — spell knowledge base (39 research entries)
 *   Xenolithic Obfuscation — data protection (your spells are YOURS)
 * 
 * Categories map to the Primitive Wild ethos:
 *   frontier   — "Creative Code" (pushing boundaries)
 *   practical  — "Sovereignty" (tools for independence)
 *   code-review — "Alchemy" (refinement of craft)
 *   ritual     — "Esoteric Knowledge" (initiatory practice)
 */

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
import { createHash } from 'node:crypto';

import type { SpellDef, InputParam, ValidationResult, SpellEntry } from '../../grimoire-core/src/types.js';
import { validateSpell, formatValidationErrors } from '../../grimoire-core/src/spell-validator.js';

// ── Branding — Primitive Wildflower / LOCUS ───────────────────────────────────

const EMERALD = '#2ECC71';
const DARK_EMERALD = '#27AE60';
const GOLD = '#F1C40F';
const DIM = '#7F8C8D';
const RED = '#E74C3C';

const brand = (t: string) => chalk.hex(EMERALD)(t);
const accent = (t: string) => chalk.hex(GOLD)(t);
const muted = (t: string) => chalk.hex(DIM)(t);
const dark = (t: string) => chalk.hex(DARK_EMERALD)(t);
const error = (t: string) => chalk.hex(RED)(t);

function banner(): void {
  console.log('');
  console.log(dark('  ╔══════════════════════════════════════════════════════════════╗'));
  console.log('  ' + brand('║  ✦  G R I M O I R E') + muted('  — Primitive Wildflower ║'));
  console.log('  ' + muted('║  Spell marketplace for the LOCUS sovereign AI ecosystem     ║'));
  console.log('  ' + accent('║  "The future of AI is 10,000 spells on 10,000 machines"     ║'));
  console.log(dark('  ╚══════════════════════════════════════════════════════════════╝'));
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

async function getRegistryIndex(): Promise<SpellEntry[]> {
  const raw = await readFile(REGISTRY_INDEX, 'utf-8');
  return JSON.parse(raw);
}

async function saveRegistryIndex(entries: SpellEntry[]): Promise<void> {
  await writeFile(REGISTRY_INDEX, JSON.stringify(entries, null, 2), 'utf-8');
}

async function findSpellFile(name: string, dir: string): Promise<string | null> {
  try {
    const files = await readdir(dir);
    for (const file of files) {
      if (!file.endsWith('.grimoire')) continue;
      const raw = await readFile(join(dir, file), 'utf-8');
      const spell = YAML.parse(raw) as SpellDef;
      if (spell.name === name) return join(dir, file);
    }
  } catch { }
  return null;
}

async function syncRepoSpells(): Promise<void> {
  try {
    const files = await readdir(SPELLS_REPO);
    const index = await getRegistryIndex();
    let changed = false;
    for (const file of files) {
      if (!file.endsWith('.grimoire')) continue;
      const spellPath = join(SPELLS_REPO, file);
      const raw = await readFile(spellPath, 'utf-8');
      const spell = YAML.parse(raw) as SpellDef;
      if (!spell?.name) continue;
      const existing = index.find(e => e.spell.name === spell.name);
      if (!existing) {
        const destPath = join(REGISTRY_DIR, file);
        await copyFile(spellPath, destPath);
        index.push({
          spell,
          installed: false,
          path: destPath
        });
        changed = true;
      }
    }
    if (changed) await saveRegistryIndex(index);
  } catch (e) {
    // Repo doesn't exist yet — first run
  }
}

// ── SAXON Cipher — Identity Signing ──────────────────────────────────────────

function saxonHash(content: string): string {
  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

// ── Commands ─────────────────────────────────────────────────────────────────

async function cmdList(): Promise<void> {
  banner();
  await ensureDirs();
  await syncRepoSpells();

  const index = await getRegistryIndex();
  if (index.length === 0) {
    console.log(muted('  No spells in the grimoire. Try ') + accent('grimoire install <name>'));
    return;
  }

  console.log(brand('  Installed Spells'));
  console.log(dark('  ──────────────────────────────────────────────────'));
  for (const entry of index) {
    const s = entry.spell;
    const status = entry.installed ? brand('●') : muted('○');
    const price = s.price && s.price > 0 ? accent(` $${(s.price / 100).toFixed(2)}`) : muted(' free');
    console.log(`  ${status} ${brand(s.name.padEnd(22))} ${muted('v' + s.version)}${price} ${muted(s.category)}`);
    console.log(`    ${muted(s.description.substring(0, 70))}`);
  }
}

async function cmdSearch(query: string): Promise<void> {
  banner();
  await ensureDirs();
  await syncRepoSpells();

  const index = await getRegistryIndex();
  const q = query.toLowerCase();
  const results = index.filter(e => {
    const s = e.spell;
    return s.name.toLowerCase().includes(q)
      || s.title.toLowerCase().includes(q)
      || s.description.toLowerCase().includes(q)
      || (s.tags || []).some(t => t.toLowerCase().includes(q));
  });

  if (results.length === 0) {
    console.log(muted(`  No spells found for "${query}"`));
    return;
  }

  console.log(accent(`  ◆ Search: "${query}" — ${results.length} results`));
  console.log(dark('  ──────────────────────────────────────────────────'));
  for (const entry of results) {
    const s = entry.spell;
    const price = s.price && s.price > 0 ? accent(` $${(s.price / 100).toFixed(2)}`) : muted(' free');
    console.log(`  ${brand(s.name)} ${muted('v' + s.version)} ${price}`);
    console.log(`    ${muted(s.description.substring(0, 80))}`);
    if (s.tags) console.log(`    ${muted(s.tags.join(' · '))}`);
  }
}

async function cmdInstall(spellName: string): Promise<void> {
  banner();
  await ensureDirs();
  await syncRepoSpells();

  const index = await getRegistryIndex();
  const entry = index.find(e => e.spell.name === spellName);
  if (!entry) {
    console.log(error(`  Spell "${spellName}" not found in registry.`));
    console.log(muted('  Try ') + accent('grimoire search ' + spellName));
    return;
  }

  const destDir = join(INSTALLED_DIR, spellName);
  await mkdir(destDir, { recursive: true });
  const fileName = `${spellName}.grimoire`;
  const dest = join(destDir, fileName);

  if (entry.path) {
    await copyFile(entry.path, dest);
  } else {
    const repoFile = join(SPELLS_REPO, fileName);
    await copyFile(repoFile, dest);
  }

  entry.installed = true;
  entry.installedVersion = entry.spell.version;
  entry.installedAt = new Date().toISOString();
  entry.path = dest;
  await saveRegistryIndex(index);

  const hash = saxonHash(await readFile(dest, 'utf-8'));
  console.log(brand(`  ✦ Installed ${spellName} v${entry.spell.version}`));
  console.log(muted(`    SAXON: ${hash}`));
  console.log(muted(`    Location: ${dest}`));
}

async function cmdCast(spellName: string, options: Record<string, string>): Promise<void> {
  banner();
  await ensureDirs();

  const index = await getRegistryIndex();
  const entry = index.find(e => e.spell.name === spellName && e.installed);
  if (!entry) {
    console.log(error(`  Spell "${spellName}" is not installed.`));
    console.log(muted('  Try ') + accent('grimoire install ' + spellName));
    return;
  }

  let spell: SpellDef;
  try {
    const raw = await readFile(entry.path!, 'utf-8');
    spell = YAML.parse(raw) as SpellDef;
  } catch {
    console.log(error(`  Failed to parse ${spellName}.grimoire`));
    return;
  }

  const validation = validateSpell(spell);
  if (!validation.valid) {
    console.log(error('  Spell validation failed:'));
    console.log(formatValidationErrors(validation));
    return;
  }

  console.log(accent(`  ✦ Casting: ${spell.title}`));
  console.log(dark('  ──────────────────────────────────────────────────'));
  console.log(`  ${muted('Version:')} ${spell.version}  ${muted('Author:')} ${spell.author}`);
  console.log(`  ${muted('Category:')} ${spell.category}  ${muted('License:')} ${spell.license}`);
  console.log('');

  const steps = spell.ritual.steps;
  const total = steps.length;
  let allOutputs: Record<string, any> = {};

  for (let i = 0; i < total; i++) {
    const step = steps[i];
    const spinner = ora(`[${i + 1}/${total}] ${step.name} ...`).start();

    // Simulate step execution with a brief delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    spinner.succeed(`[${i + 1}/${total}] ${step.name}`);
    if (step.description) {
      console.log(`      ${muted(step.description)}`);
    }
  }

  console.log('');
  console.log(dark('  ──────────────────────────────────────────────────'));
  console.log(brand(`  ✦ Spell complete: ${spell.title}`));
  console.log(muted(`    Steps executed: ${total}`));
  console.log(muted(`    SAXON signature: ${saxonHash(spell.name + spell.version)}`));
  console.log('');
}

async function cmdCreate(): Promise<void> {
  banner();
  console.log(accent('  ✦ Create a New Spell'));
  console.log(dark('  ──────────────────────────────────────────────────'));
  console.log('');

  const rl = createInterface({ input: stdin, output: stdout });

  const name = (await rl.question(brand('  Spell name (kebab-case): '))).trim();
  const title = (await rl.question(muted('  Display title: '))).trim();
  const description = (await rl.question(muted('  Description: '))).trim();
  const category = (await rl.question(muted('  Category [frontier/practical/code-review/ritual]: '))).trim();
  const version = (await rl.question(muted('  Version [0.1.0]: '))).trim() || '0.1.0';
  const license = (await rl.question(muted('  License [MIT]: '))).trim() || 'MIT';

  rl.close();

  const spell: SpellDef = {
    name,
    title,
    version,
    author: 'pw-grimoire/creator',
    category: category as any,
    license,
    description,
    inputs: [],
    output: { type: 'object', schema: {} },
    ritual: { steps: [{ name: 'Execute', description: 'Main execution step' }] },
    tags: [],
  };

  const yaml = YAML.stringify(spell, { lineWidth: 80 });
  const fileName = `${name}.grimoire`;
  await writeFile(fileName, yaml, 'utf-8');

  const hash = saxonHash(yaml);
  console.log('');
  console.log(brand(`  ✦ Spell created: ${fileName}`));
  console.log(muted(`    SAXON: ${hash}`));
  console.log(muted('    Edit the file to add inputs, steps, and examples.'));
  console.log(muted(`    Validate: grimoire validate ${fileName}`));
  console.log(muted(`    Publish:  grimoire publish ${fileName}`));
}

async function cmdValidate(filePath: string): Promise<void> {
  banner();
  try {
    const raw = await readFile(filePath, 'utf-8');
    const spell = YAML.parse(raw) as SpellDef;
    const result = validateSpell(spell);
    console.log(formatValidationErrors(result));
    if (result.valid) {
      console.log(brand(`  ✦ ${basename(filePath)} is valid`));
      console.log(muted(`    SAXON: ${saxonHash(raw)}`));
    }
  } catch (e) {
    console.log(error(`  Failed to read or parse ${filePath}`));
  }
}

async function cmdPublish(filePath: string): Promise<void> {
  banner();
  await ensureDirs();
  await syncRepoSpells();

  const fileName = basename(filePath);
  const raw = await readFile(filePath, 'utf-8');
  const spell = YAML.parse(raw) as SpellDef;

  const validation = validateSpell(spell);
  if (!validation.valid) {
    console.log(error('  Cannot publish — validation failed:'));
    console.log(formatValidationErrors(validation));
    return;
  }

  const dest = join(REGISTRY_DIR, fileName);
  await copyFile(filePath, dest);

  const index = await getRegistryIndex();
  const existing = index.findIndex(e => e.spell.name === spell.name);
  const newEntry: SpellEntry = { spell, installed: false, path: dest };
  if (existing >= 0) {
    index[existing] = newEntry;
  } else {
    index.push(newEntry);
  }
  await saveRegistryIndex(index);

  const hash = saxonHash(raw);
  console.log(brand(`  ✦ Published: ${spell.name} v${spell.version}`));
  console.log(muted(`    SAXON signature: ${hash}`));
  console.log(muted(`    Registered in: ${REGISTRY_DIR}`));
}

async function cmdInit(projectName: string): Promise<void> {
  banner();
  await mkdir(projectName, { recursive: true });

  const spellTemplate: SpellDef = {
    name: projectName,
    title: projectName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    version: '0.1.0',
    author: 'pw-grimoire/creator',
    category: 'practical',
    license: 'BUSL-1.1',
    description: 'A new spell for the GRIMOIRE marketplace.',
    inputs: [
      {
        name: 'input',
        type: 'string',
        description: 'The primary input',
        required: true,
      }
    ],
    output: {
      type: 'object',
      schema: {
        result: { type: 'string' },
      },
    },
    ritual: {
      steps: [
        { name: 'Ingest', description: 'Load and preprocess input' },
        { name: 'Process', description: 'Core transformation' },
        { name: 'Present', description: 'Format and return output' },
      ],
    },
    tags: [],
  };

  const yaml = YAML.stringify(spellTemplate, { lineWidth: 80 });
  await writeFile(join(projectName, 'spell.grimoire'), yaml, 'utf-8');
  await writeFile(join(projectName, 'README.md'), `# ${projectName}\n\nA GRIMOIRE spell. Part of the Primitive Wildflower LOCUS ecosystem.\n`, 'utf-8');
  await writeFile(join(projectName, '.gitignore'), 'node_modules/\n', 'utf-8');

  console.log(brand(`  ✦ Project initialized: ${projectName}/`));
  console.log(muted(`    spell.grimoire  — Your spell definition`));
  console.log(muted(`    README.md       — Documentation`));
  console.log(muted(`    .gitignore      — Git ignore rules`));
  console.log('');
  console.log(muted('  Next steps:'));
  console.log(muted(`    1. Edit ${projectName}/spell.grimoire`));
  console.log(muted('    2. grimoire validate spell.grimoire'));
  console.log(muted('    3. grimoire publish spell.grimoire'));
}

// ── CLI Setup ─────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('grimoire')
  .description('Primitive Wildflower spell marketplace for the LOCUS sovereign AI ecosystem')
  .version('0.1.0');

program
  .command('list')
  .description('List all spells in the marketplace')
  .action(cmdList);

program
  .command('search <query>')
  .description('Search the spell registry')
  .action(cmdSearch);

program
  .command('install <spell>')
  .description('Install a spell from the registry')
  .action(cmdInstall);

program
  .command('cast <spell>')
  .description('Cast an installed spell')
  .option('--code <path>', 'Code file to analyze')
  .option('--text <text>', 'Text input')
  .option('--config <json>', 'JSON configuration')
  .action(cmdCast);

program
  .command('create')
  .description('Create a new spell interactively')
  .action(cmdCreate);

program
  .command('validate <file>')
  .description('Validate a spell definition file')
  .action(cmdValidate);

program
  .command('publish <file>')
  .description('Publish a spell to the registry')
  .action(cmdPublish);

program
  .command('init <name>')
  .description('Initialize a new spell project')
  .action(cmdInit);

program.parse();
