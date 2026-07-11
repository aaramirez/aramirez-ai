/**
 * Shared constants and helper functions for the arai CLI.
 * Cross-platform: macOS, Linux, Windows.
 */

import { readFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../../../package.json');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const TEMPLATES_DIR = join(REPO_ROOT, 'shared', 'templates');
const USER_TEMPLATES_DIR = join(require('os').homedir(), '.config', 'arai', 'templates');
const PARTIALS_DIR = join(TEMPLATES_DIR, 'partials');
const VALID_TYPES = ['skill', 'agent', 'script', 'prompt', 'rule'];

function log(msg, type = 'info') {
  const icons = { info: 'ℹ', ok: '✓', warn: '⚠', err: '✗' };
  console.log(`${icons[type] || ' '} ${msg}`);
}

function run(cmd) {
  try {
    return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function isDir(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function stripFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function sourceDirFor(type) {
  const map = {
    skill: join(REPO_ROOT, 'shared', 'skills'),
    agent: join(REPO_ROOT, 'shared', 'agents'),
    script: join(REPO_ROOT, 'shared', 'scripts'),
    prompt: join(REPO_ROOT, 'shared', 'prompts'),
    rule: join(REPO_ROOT, 'shared', 'rules'),
  };
  return map[type];
}

function destDirFor(type, projectRoot) {
  const map = {
    skill: join(projectRoot, '.opencode', 'skills'),
    agent: join(projectRoot, '.opencode', 'agents'),
    script: join(projectRoot, 'shared', 'scripts'),
    prompt: join(projectRoot, 'shared', 'prompts'),
    rule: join(projectRoot, 'shared', 'rules'),
  };
  return map[type];
}

function nameExists(type, name) {
  const srcDir = sourceDirFor(type);
  if (!srcDir || !isDir(srcDir)) return false;
  const items = readdirSync(srcDir);
  if (type === 'skill') {
    return items.includes(name) && isDir(join(srcDir, name));
  }
  return items.includes(`${name}.js`) || items.includes(`${name}.md`);
}

function listNames(type) {
  const srcDir = sourceDirFor(type);
  if (!srcDir || !isDir(srcDir)) return [];
  const items = readdirSync(srcDir).filter(f => f !== '.gitkeep');
  if (type === 'skill') {
    return items.filter(f => isDir(join(srcDir, f)));
  }
  return items.map(f => f.replace(/\.(js|md)$/, '')).filter(Boolean);
}

function isInstalled(type, name, projectRoot) {
  const dest = destDirFor(type, projectRoot);
  if (!dest) return false;
  if (type === 'skill') {
    return isDir(join(dest, name));
  }
  const ext = type === 'script' ? '.js' : '.md';
  return existsSync(join(dest, `${name}${ext}`));
}

function opencodeInstalled(projectRoot) {
  return isDir(join(projectRoot, '.opencode')) && existsSync(join(projectRoot, 'opencode.json'));
}

export {
  REPO_ROOT, TEMPLATES_DIR, USER_TEMPLATES_DIR, PARTIALS_DIR, VALID_TYPES, pkg,
  log, run, ensureDir, isDir, stripFrontmatter,
  sourceDirFor, destDirFor, nameExists, listNames, isInstalled, opencodeInstalled,
  readFileSync, existsSync, mkdirSync, readdirSync, statSync,
  join, resolve, dirname, execSync,
};
