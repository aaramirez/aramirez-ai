#!/usr/bin/env node
/**
 * ci-validate.js — Portable CI/CD validation script
 *
 * Checks project integrity: required files, placeholder detection,
 * skill frontmatter validity, and structural consistency.
 *
 * Usage:
 *   node shared/scripts/ci-validate.js              # validate project
 *   node shared/scripts/ci-validate.js --strict      # fail on warnings
 *   node shared/scripts/ci-validate.js --verbose     # show all checks
 *
 * Exit codes:
 *   0 — all checks pass
 *   1 — errors found
 *   2 — warnings found (non-strict)
 *
 * Cross-platform: macOS, Linux, Windows — zero external dependencies.
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const args = process.argv.slice(2);

const dirIndex = args.indexOf('--dir');
const ROOT = resolve(dirIndex >= 0 && args[dirIndex + 1] ? args[dirIndex + 1] : resolve(__dirname, '..', '..'));

const STRICT = args.includes('--strict');
const VERBOSE = args.includes('--verbose');

let errors = 0;
let warnings = 0;

function check(condition, label, detail, level = 'error') {
  if (!condition) {
    if (level === 'error') {
      console.error(`  ✗ ${label}${detail ? ': ' + detail : ''}`);
      errors++;
    } else {
      console.warn(`  ⚠ ${label}${detail ? ': ' + detail : ''}`);
      warnings++;
    }
  } else if (VERBOSE) {
    console.log(`  ✓ ${label}`);
  }
}

function exists(p) { return existsSync(p); }
function isDir(p) { return existsSync(p) && statSync(p).isDirectory(); }
function isFile(p) { return existsSync(p) && statSync(p).isFile(); }

console.log(`\n🔍 ci-validate — ${ROOT}\n`);

// ── Project structure ──

check(exists(join(ROOT, 'AGENTS.md')), 'AGENTS.md exists', '', 'warn');

// shared/
check(isDir(join(ROOT, 'shared')), 'shared/ directory exists');
check(isDir(join(ROOT, 'shared', 'skills')), 'shared/skills/ directory exists');
check(isDir(join(ROOT, 'shared', 'scripts')), 'shared/scripts/ directory exists');

// Skills: check frontmatter
if (isDir(join(ROOT, 'shared', 'skills'))) {
  const skills = readdirSync(join(ROOT, 'shared', 'skills')).filter(f =>
    isDir(join(ROOT, 'shared', 'skills', f))
  );
  check(skills.length > 0, 'At least one skill exists');
  if (VERBOSE) console.log(`  Skills: ${skills.length} total`);

  for (const skill of skills) {
    const skillPath = join(ROOT, 'shared', 'skills', skill, 'SKILL.md');
    check(isFile(skillPath), `Skill "${skill}" has SKILL.md`);

    if (isFile(skillPath)) {
      const content = readFileSync(skillPath, 'utf8');
      const hasName = /^name:\s*\S+/m.test(content);
      const hasDesc = /^description:\s*\S+/m.test(content);
      check(hasName, `Skill "${skill}" has name in frontmatter`);
      check(hasDesc, `Skill "${skill}" has description in frontmatter`);

      // Check for TODO placeholders
      const hasTodo = /TODO/i.test(content);
      check(!hasTodo, `Skill "${skill}" has no TODO placeholders`, '', 'warn');
    }
  }
}

// Scripts: check for TODO placeholders
if (isDir(join(ROOT, 'shared', 'scripts'))) {
  const scripts = readdirSync(join(ROOT, 'shared', 'scripts')).filter(f =>
    isFile(join(ROOT, 'shared', 'scripts', f)) && f.endsWith('.js') && f !== 'ci-validate.js'
  );
  if (VERBOSE) console.log(`  Scripts: ${scripts.length} total`);

  for (const script of scripts) {
    const content = readFileSync(join(ROOT, 'shared', 'scripts', script), 'utf8');
    const hasTodo = /TODO/i.test(content);
    check(!hasTodo, `Script "${script}" has no TODO placeholders`, '', 'warn');
  }
}

// ── Platforms ──
check(isDir(join(ROOT, 'platforms')), 'platforms/ directory exists', '', 'warn');

// ── brand.json ──
if (isFile(join(ROOT, 'shared', 'brand.json'))) {
  try {
    const brand = JSON.parse(readFileSync(join(ROOT, 'shared', 'brand.json'), 'utf8'));
    check(brand.brand?.name, 'brand.json has brand name');
    check(brand.brand?.colors?.primary, 'brand.json has primary color');
  } catch {
    check(false, 'brand.json is valid JSON');
  }
}

// ── .gitignore ──
check(isFile(join(ROOT, '.gitignore')), '.gitignore exists');
if (isFile(join(ROOT, '.gitignore'))) {
  const gi = readFileSync(join(ROOT, '.gitignore'), 'utf8');
  check(gi.includes('node_modules'), '.gitignore excludes node_modules');
  check(gi.includes('.env'), '.gitignore excludes .env');
}

// ── Summary ──
console.log();
if (errors === 0 && warnings === 0) {
  console.log('✅ All checks passed');
  process.exit(0);
} else {
  if (errors > 0) console.log(`❌ ${errors} error(s)`);
  if (warnings > 0) console.log(`⚠ ${warnings} warning(s)`);
  if (errors > 0) process.exit(1);
  if (STRICT && warnings > 0) process.exit(1);
  process.exit(warnings > 0 ? 2 : 0);
}
