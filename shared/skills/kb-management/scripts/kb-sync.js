#!/usr/bin/env node
/**
 * kb-sync.js — Knowledge base synchronization and validation
 *
 * Validates wikilinks, fixes broken links, and reindexes KB structure.
 * Wikilinks resolve the way Obsidian resolves them: by note name, by
 * vault-relative path (or a path suffix), or relative to the note
 * (`./`, `../`), case-insensitively.
 *
 * Usage:
 *   node shared/scripts/kb-sync.js --validate <kb-dir>
 *   node shared/scripts/kb-sync.js --fix-links <kb-dir>
 *   node shared/scripts/kb-sync.js --reindex <kb-dir>
 *   node shared/scripts/kb-sync.js --help
 *
 * Cross-platform: macOS, Linux, Windows — zero external dependencies.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, sep, posix } from 'path';
import { spawnSync } from 'child_process';

const HELP = `
kb-sync.js — Knowledge base synchronization and validation

Usage:
  kb-sync.js --validate <dir>       Validate wikilinks and structure
  kb-sync.js --fix-links <dir>      Fix broken wikilinks
  kb-sync.js --reindex <dir>        Reindex KB structure
  kb-sync.js --help                 Show this help

Options:
  <dir>                 KB directory to process
  --help                Show this help
`;

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = { validate: false, fixLinks: false, reindex: false, dir: null, help: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help' || args[i] === '-h') opts.help = true;
    else if (args[i] === '--validate') opts.validate = true;
    else if (args[i] === '--fix-links') opts.fixLinks = true;
    else if (args[i] === '--reindex') opts.reindex = true;
    else if (!args[i].startsWith('-')) opts.dir = args[i];
  }
  return opts;
}

/**
 * Every file of the vault as a POSIX path relative to `dir`. Inside a git
 * repo, git decides what belongs to the vault (tracked + new, minus
 * .gitignore), so sources/, node_modules/ or build output never count.
 * Outside git, walk the tree skipping dot-folders and node_modules.
 */
function listFiles(dir) {
  const git = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: dir, encoding: 'utf8' });
  if (git.status === 0) {
    return [...new Set(git.stdout.split('\0').filter(Boolean))].filter(f => existsSync(join(dir, f)));
  }
  const files = [];
  const walk = (d) => {
    for (const entry of readdirSync(d)) {
      if (entry.startsWith('.') || entry === 'node_modules') continue;
      const fullPath = join(d, entry);
      if (statSync(fullPath).isDirectory()) walk(fullPath);
      else files.push(relative(dir, fullPath).split(sep).join('/'));
    }
  };
  walk(dir);
  return files;
}

function findMarkdownFiles(dir) {
  return listFiles(dir).filter(f => f.endsWith('.md'));
}

/** Lookup tables for resolving link targets (all keys lowercased). */
function buildIndex(dir) {
  const files = listFiles(dir);
  const index = { notes: new Map(), noteNames: new Map(), files: new Set(), fileNames: new Set() };
  for (const f of files) {
    const lower = f.toLowerCase();
    index.files.add(lower);
    index.fileNames.add(posix.basename(lower));
    if (lower.endsWith('.md')) {
      const path = lower.slice(0, -3);
      index.notes.set(path, f.slice(0, -3));
      const name = posix.basename(path);
      if (!index.noteNames.has(name)) index.noteNames.set(name, []);
      index.noteNames.get(name).push(f.slice(0, -3));
    }
  }
  return index;
}

function extractWikilinks(content) {
  const links = [];
  // Links inside code (fenced blocks or `inline`) are examples, not links.
  // Blank them out keeping offsets, so `index` still points into `content`.
  const scan = content.replace(/```[\s\S]*?```|`[^`\n]*`/g, m => ' '.repeat(m.length));
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(scan)) !== null) {
    // Obsidian alias syntax [[target|display text]] — the target is only
    // the part before the first pipe; strip it here so every caller gets
    // a resolvable note name instead of re-deriving this themselves.
    // Inside a Markdown table the pipe must be escaped ([[target\|text]]),
    // and [[target#Heading]] points into a note — drop both suffixes too.
    const target = match[1].split('|')[0].replace(/\\+$/, '').split('#')[0].trim();
    links.push({ text: match[1], target, index: match.index });
  }
  return links;
}

/**
 * True when `target`, linked from `fromFile`, points to an existing file —
 * the same rules Obsidian applies: `./` and `../` are relative to the note;
 * a target with `/` must match a vault path (or the tail of one); a bare
 * name matches any note with that name. Targets with an extension other
 * than .md (images, PDFs, canvases) are checked against all files.
 */
function resolveTarget(target, fromFile, index) {
  if (!target) return true; // [[#Heading]] points into the same note
  let t = target.toLowerCase();
  if (t.startsWith('./') || t.startsWith('../')) {
    t = posix.normalize(posix.join(posix.dirname(fromFile.toLowerCase()), t));
    if (t.startsWith('../')) return false; // escapes the vault
  }
  const ext = posix.extname(t);
  if (ext && ext !== '.md' && !/\s/.test(ext)) {
    if (index.files.has(t)) return true;
    return t.includes('/') ? [...index.files].some(f => f.endsWith('/' + t)) : index.fileNames.has(t);
  }
  t = t.replace(/\.md$/, '');
  if (index.notes.has(t)) return true;
  if (!t.includes('/')) return index.noteNames.has(t);
  return [...index.notes.keys()].some(p => p.endsWith('/' + t));
}

function extractFrontmatter(content) {
  // \r?\n tolerates CRLF-terminated files (common on Windows) — a literal
  // \n here silently fails to match and every CRLF file gets misreported
  // as having no frontmatter at all.
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split(/\r?\n/)) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) fm[key.trim()] = rest.join(':').trim();
  }
  return fm;
}

function validate(kbDir) {
  const files = findMarkdownFiles(kbDir);
  const index = buildIndex(kbDir);
  const issues = [];

  for (const file of files) {
    const content = readFileSync(join(kbDir, file), 'utf8');
    const fm = extractFrontmatter(content);

    if (!fm || !fm.title) {
      issues.push({ file, issue: 'Missing frontmatter title' });
    }

    for (const link of extractWikilinks(content)) {
      if (!resolveTarget(link.target, file, index)) {
        issues.push({ file, issue: `Broken wikilink: [[${link.target}]]` });
      }
    }
  }

  if (issues.length === 0) {
    console.log(`Valid: ${files.length} files, 0 issues`);
    return true;
  }

  console.log(`Found ${issues.length} issues in ${files.length} files:`);
  for (const { file, issue } of issues) {
    console.log(`  ${file}: ${issue}`);
  }
  return false;
}

/** Folds case, accents and dash variants so near-miss names can be matched. */
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[‐-―]/g, '-').toLowerCase();

/**
 * Only unambiguous repairs: a broken target is rewritten when exactly one
 * note has the same name once case, accents and dashes are folded. The
 * alias and #heading are kept; anything else is left for a human.
 */
function fixLinks(kbDir) {
  const files = findMarkdownFiles(kbDir);
  const index = buildIndex(kbDir);
  const byFolded = new Map();
  for (const path of index.notes.values()) {
    const key = fold(posix.basename(path));
    byFolded.set(key, byFolded.has(key) ? null : path);
  }
  let fixed = 0;

  for (const file of files) {
    const original = readFileSync(join(kbDir, file), 'utf8');
    let content = original;
    // Right to left, so earlier offsets stay valid after each splice.
    for (const link of extractWikilinks(original).reverse()) {
      if (resolveTarget(link.target, file, index)) continue;
      const match = byFolded.get(fold(posix.basename(link.target)));
      if (!match) continue;
      const rest = link.text.slice(link.text.indexOf(link.target) + link.target.length);
      const start = link.index + 2;
      content = content.slice(0, start) + match + rest + content.slice(start + link.text.length);
      fixed++;
    }
    if (content !== original) writeFileSync(join(kbDir, file), content);
  }

  console.log(`Fixed ${fixed} broken links in ${files.length} files`);
  return true;
}

function reindex(kbDir) {
  const files = findMarkdownFiles(kbDir);
  console.log(`Indexed ${files.length} files in ${kbDir}`);
  for (const file of files) {
    const content = readFileSync(join(kbDir, file), 'utf8');
    const links = extractWikilinks(content);
    console.log(`  ${file}: ${links.length} wikilinks`);
  }
  return true;
}

function main() {
  const opts = parseArgs(process.argv);

  if (opts.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!opts.validate && !opts.fixLinks && !opts.reindex) {
    console.error('Error: provide --validate, --fix-links, or --reindex');
    console.log(HELP);
    process.exit(1);
  }

  if (!opts.dir) {
    console.error('Error: KB directory is required');
    process.exit(1);
  }

  if (!existsSync(opts.dir) || !statSync(opts.dir).isDirectory()) {
    console.error(`Error: ${opts.dir} not found`);
    process.exit(1);
  }

  let success = false;
  if (opts.validate) success = validate(opts.dir);
  else if (opts.fixLinks) success = fixLinks(opts.dir);
  else if (opts.reindex) success = reindex(opts.dir);

  process.exit(success ? 0 : 1);
}

main();
