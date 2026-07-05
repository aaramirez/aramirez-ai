#!/usr/bin/env node
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, basename, extname, resolve, dirname } from 'path';
import { htmlToPdf, brand, loadBrand } from './docgen/index.js';
import { brandCss, logoHref } from './docgen/theme-utils.js';

const REPO_ROOT = resolve(new URL('.', import.meta.url).pathname, '../..');
const BRAND_PATH = join(REPO_ROOT, 'shared', 'brand.json');

const EXCLUDE_DIRS = new Set(['Transcripciones', '.obsidian', 'Recursos']);
const EXCLUDE_FILES = new Set(['Index.md']);

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = i + 1 < args.length && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      flags[key] = val;
      if (val !== true) i++;
    }
  }
  return flags;
}

function timestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function vaultFiles(vaultPath) {
  const files = [];
  const entries = readdirSync(vaultPath, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_DIRS.has(e.name)) continue;
    if (e.isDirectory()) {
      files.push(...vaultFiles(join(vaultPath, e.name)));
    } else if (e.isFile() && extname(e.name) === '.md' && !EXCLUDE_FILES.has(e.name)) {
      files.push(join(vaultPath, e.name));
    }
  }
  return files;
}

function parseModuleLesson(filePath, vaultPath) {
  const rel = dirname(filePath).slice(vaultPath.length + 1);
  const name = basename(filePath, '.md');
  const modMatch = rel.match(/(\d+)|Módulo\s+(\d+)/);
  const modNum = modMatch ? parseInt(modMatch[1] || modMatch[2]) : 99;
  const lesMatch = name.match(/^(\d+)/);
  const lesNum = lesMatch ? parseInt(lesMatch[1]) : 99;
  const modName = rel || 'General';
  return { modNum, lesNum, modName, name };
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function readVaultTitle(vaultPath) {
  const indexPath = join(vaultPath, 'Index.md');
  if (!existsSync(indexPath)) return 'Curso';
  const md = readFileSync(indexPath, 'utf8');
  const match = md.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : 'Curso';
}

function mdToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let inCodeBlock = false;
  let codeBuf = [];
  let inList = null;
  let listBuf = [];
  let inBlockquote = false;
  let bqBuf = [];

  function flushList() {
    if (listBuf.length === 0) return;
    const tag = inList === 'ul' ? 'ul' : 'ol';
    out.push(`<${tag}>`);
    for (const item of listBuf) {
      if (item.startsWith('\x00CB ')) {
        out.push(`<li class="checkbox-item"><input type="checkbox" disabled> ${inlineMd(item.slice(4))}</li>`);
      } else if (item.startsWith('\x00CBX ')) {
        out.push(`<li class="checkbox-item"><input type="checkbox" disabled checked> ${inlineMd(item.slice(5))}</li>`);
      } else if (item.startsWith('<')) {
        out.push(`<li>${item}</li>`);
      } else {
        out.push(`<li>${inlineMd(item)}</li>`);
      }
    }
    out.push(`</${tag}>`);
    listBuf = [];
    inList = null;
  }

  function flushBlockquote() {
    if (bqBuf.length === 0) return;
    out.push(`<blockquote><p>${inlineMd(bqBuf.join('\n'))}</p></blockquote>`);
    bqBuf = [];
    inBlockquote = false;
  }

  function renderTable(rows) {
    const sep = rows[1] && /^[\s|:-]+$/.test(rows[1]) ? rows.splice(1, 1)[0] : null;
    let html = '<table>';
    if (rows.length > 0) {
      const headers = rows[0].split('|').filter(c => c.trim());
      html += '<thead><tr>';
      for (const h of headers) html += `<th>${inlineMd(h.trim())}</th>`;
      html += '</tr></thead>';
      rows = rows.slice(1);
    }
    if (rows.length > 0) {
      html += '<tbody>';
      for (const row of rows) {
        const cells = row.split('|').filter(c => c.trim());
        html += '<tr>';
        for (const c of cells) html += `<td>${inlineMd(c.trim())}</td>`;
        html += '</tr>';
      }
      html += '</tbody>';
    }
    html += '</table>';
    return html;
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        const code = escHtml(codeBuf.join('\n'));
        out.push(`<pre><code>${code}</code></pre>`);
        codeBuf = [];
        inCodeBlock = false;
      } else {
        flushList();
        flushBlockquote();
        inCodeBlock = true;
        codeBuf = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuf.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (trimmed === '') {
      flushList();
      if (inBlockquote) { flushBlockquote(); }
      continue;
    }

    if (trimmed.startsWith('---')) {
      flushList();
      flushBlockquote();
      out.push('<hr />');
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushList();
      bqBuf.push(trimmed.slice(2));
      inBlockquote = true;
      continue;
    }

    if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
      flushBlockquote();
      if (inList !== 'ul') { flushList(); inList = 'ul'; }
      listBuf.push(`\x00CBX ${trimmed.slice(6)}`);
      continue;
    }

    if (trimmed.startsWith('- [ ] ')) {
      flushBlockquote();
      if (inList !== 'ul') { flushList(); inList = 'ul'; }
      listBuf.push(`\x00CB ${trimmed.slice(6)}`);
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushBlockquote();
      if (inList !== 'ul') { flushList(); inList = 'ul'; }
      listBuf.push(trimmed.slice(2));
      continue;
    }

    if (/^\d+[.)]\s/.test(trimmed)) {
      flushBlockquote();
      if (inList !== 'ol') { flushList(); inList = 'ol'; }
      listBuf.push(trimmed.replace(/^\d+[.)]\s/, ''));
      continue;
    }

    if (trimmed.startsWith('|')) {
      flushList();
      flushBlockquote();
      const tableRows = [trimmed];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
        tableRows.push(lines[++i].trim());
      }
      out.push(renderTable(tableRows));
      continue;
    }

    flushList();
    flushBlockquote();

    if (trimmed.startsWith('#### ')) {
      out.push(`<h4>${inlineMd(trimmed.slice(5))}</h4>`);
    } else if (trimmed.startsWith('### ')) {
      out.push(`<h3>${inlineMd(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith('## ')) {
      out.push(`<h2>${inlineMd(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith('# ')) {
      out.push(`<h1>${inlineMd(trimmed.slice(2))}</h1>`);
    } else {
      out.push(`<p>${inlineMd(trimmed)}</p>`);
    }
  }

  flushList();
  flushBlockquote();
  if (inCodeBlock) {
    const code = escHtml(codeBuf.join('\n'));
    out.push(`<pre><code>${code}</code></pre>`);
  }

  return out.join('\n');
}

function inlineMd(text) {
  let s = escHtml(text);

  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  s = s.replace(/(^|\s)__([^_]+)__(\s|$)/g, '$1<strong>$2</strong>$3');

  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  s = s.replace(/~~([^~]+)~~/g, '<s>$1</s>');

  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');

  s = s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2');

  s = s.replace(/\[\[([^\]]+)\]\]/g, (m, t) => {
    const parts = t.split('|');
    const label = parts.length > 1 ? parts[1] : parts[0];
    const slug = label.replace(/^(\d+[-])/, '').replace(/-/g, ' ');
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  });

  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');

  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');

  s = s.replace(/✅/g, '').replace(/📋/g, '').replace(/🔧/g, '').replace(/→/g, '→');

  return s;
}

function pageHeader(meta) {
  const logo = logoHref('blue');
  const logoHtml = logo ? `<div class="header-logo"><img src="${logo}" alt="Logo" /></div>` : '';
  return `<div class="page-header">${logoHtml}<div class="header-classification">${escHtml(meta.classification || '')}</div></div>`;
}

function pageFooter(meta) {
  const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  return `<div class="page-footer"><div class="footer-org">${escHtml(meta.organization || '')}</div><div class="footer-page">1</div><div class="footer-date">${date}</div></div>`;
}

function buildCoverHtml(meta, brandData) {
  const logo = logoHref('blue');
  const logoHtml = logo ? `<div class="cover-logo"><img src="${logo}" alt="Logo" /></div>` : '';
  const org = meta.organization || brandData?.name || '';
  const classification = meta.classification || '';

  return `<section class="page cover-page">
  <div class="page-body">
    ${logo ? `<div class="cover-logo"><img src="${logo}" alt="Logo" /></div>` : ''}
    <h1>${escHtml(meta.title)}</h1>
    <div class="cover-subtitle">${escHtml(meta.subtitle || '')}</div>
    <table class="cover-meta">
      ${org ? `<tr><td>Organización</td><td>${escHtml(org)}</td></tr>` : ''}
      ${classification ? `<tr><td>Clasificación</td><td>${escHtml(classification)}</td></tr>` : ''}
      <tr><td>Fecha</td><td>${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
      <tr><td>Versión</td><td>${escHtml(meta.version || '1.0')}</td></tr>
    </table>
  </div>
</section>`;
}

function buildContentHtml(title, contentHtml) {
  return `<section class="page">
  <div class="page-body body-text">
    <div class="section-block">
      <div class="section-bar"></div>
      <h2>${escHtml(title)}</h2>
    </div>
    ${contentHtml}
  </div>
</section>`;
}

function assembleHtml(coverHtml, contentHtmls) {
  const css = brandCss('report');
  const cssPath = join(REPO_ROOT, 'assets/templates/report.css');
  const reportCss = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8">
<style>
${css}
${reportCss}
.body-text pre {
  background: var(--bg-soft, #f4f5fa);
  border: 1px solid var(--line, #d9dee8);
  border-radius: 6px;
  padding: 12px 16px;
  font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
  font-size: 8.5pt;
  line-height: 1.5;
  overflow-x: auto;
  margin: 10px 0;
}
.body-text p code {
  background: var(--bg-soft, #f4f5fa);
  padding: 1px 5px;
  border-radius: 4px;
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 8.5pt;
}
.body-text ul, .body-text ol {
  margin: 6px 0 10px 22px;
}
.body-text li {
  margin-bottom: 3px;
  font-size: 9.5pt;
  line-height: 1.5;
}
.body-text blockquote {
  border-left: 3px solid var(--accent, #3730a3);
  padding: 6px 14px;
  margin: 10px 0;
  background: var(--bg-soft, #f4f5fa);
  border-radius: 0 6px 6px 0;
}
.body-text blockquote p {
  margin-bottom: 0;
}
.body-text hr {
  border: none;
  border-top: 1px solid var(--line, #d9dee8);
  margin: 16px 0;
}
.body-text h3 {
  font-size: 13pt;
  margin-top: 14px;
  margin-bottom: 6px;
  color: var(--ink, #23264f);
}
.body-text h4 {
  font-size: 11pt;
  margin-top: 12px;
  margin-bottom: 4px;
  color: var(--ink, #23264f);
}
.body-text strong {
  font-weight: 700;
  color: var(--ink, #23264f);
}
.body-text em {
  font-style: italic;
}
.body-text table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 9pt;
}
.body-text th, .body-text td {
  border: 0.5px solid var(--line, #d9dee8);
  padding: 6px 10px;
  text-align: left;
}
.body-text th {
  background: var(--bg-soft, #f4f5fa);
  font-weight: 700;
  color: var(--ink, #23264f);
}
.body-text input[type="checkbox"] {
  margin-right: 6px;
  transform: scale(0.9);
}
.body-text li.checkbox-item {
  list-style: none;
  padding-left: 0;
}
</style>
</head>
<body>
${coverHtml}
${contentHtmls.join('\n')}
</body></html>`;
}

function collectByScope(vaultPath, scope, moduleName, lessonNum) {
  let files = vaultFiles(vaultPath);
  let entries = files.map(f => ({ path: f, ...parseModuleLesson(f, vaultPath) }));

  entries.sort((a, b) => a.modNum - b.modNum || a.lesNum - b.lesNum);

  if (scope === 'lesson') {
    entries = entries.filter(e => e.modName.includes(moduleName) && e.name.startsWith(lessonNum));
  } else if (scope === 'module') {
    entries = entries.filter(e => e.modName.includes(moduleName));
  }

  const groups = {};
  for (const e of entries) {
    if (!groups[e.modName]) groups[e.modName] = [];
    groups[e.modName].push(e);
  }
  return groups;
}

function renderLesson(md, filePath) {
  return mdToHtml(md);
}

function extractTitle(name) {
  const sep = name.search(/ [—\-] /);
  return sep !== -1 ? name.slice(sep + 3).trim() : name;
}

function extractSubtitle(name) {
  const sep = name.search(/ [—\-] /);
  return sep !== -1 ? name.slice(0, sep).trim() : name;
}

function buildMeta(title, subtitle, vaultName) {
  const brandData = brand();
  return {
    title,
    subtitle,
    organization: brandData?.name || '',
    classification: vaultName ? `Generado desde ${vaultName}` : brandData?.classification || '',
    version: '1.0',
  };
}

async function main() {
  const flags = parseArgs();

  if (flags.help || flags.h) {
    console.log(`
Usage: node shared/scripts/docgen-vault.js [options]

Options:
  --scope <lesson|module|all>   Scope of export (default: module)
  --module <name>                Module name (required for lesson/module scope)
  --lesson <num>                 Lesson number (for scope=lesson)
  --mode <merged|separate>       Output mode (default: merged)
  --vault <path>                 Path to vault (default: curso-ia/)
  --output <dir>                 Base output directory (default: generated)
  --help                         Show this help
`);
    process.exit(0);
  }

  const scope = flags.scope || 'module';
  const mode = flags.mode || 'merged';
  const vaultPath = resolve(flags.vault || 'curso-ia');
  const baseOutput = flags.output || 'generated';
  const moduleName = flags.module || '';
  const lessonNum = flags.lesson || '';

  if ((scope === 'lesson' || scope === 'module') && !moduleName) {
    console.error('Error: --module is required for lesson/module scope');
    process.exit(1);
  }

  if (!existsSync(vaultPath)) {
    console.error(`Error: Vault path not found: ${vaultPath}`);
    process.exit(1);
  }

  if (existsSync(BRAND_PATH)) {
    loadBrand(BRAND_PATH);
  }

  const vaultName = basename(vaultPath);
  const ts = timestamp();
  const outDir = join(baseOutput, `${vaultName}-${ts}`);
  mkdirSync(outDir, { recursive: true });

  const groups = collectByScope(vaultPath, scope, moduleName, lessonNum);

  if (Object.keys(groups).length === 0) {
    console.error('Error: No markdown files found matching the criteria');
    process.exit(1);
  }

  const brandData = brand();
  const totalLessons = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`Found ${totalLessons} lesson(s) in ${Object.keys(groups).length} module(s)`);
  console.log(`Output: ${outDir}\n`);

  if (mode === 'separate') {
    for (const [modName, lessons] of Object.entries(groups)) {
      for (const lesson of lessons) {
        const md = readFileSync(lesson.path, 'utf8');
        const htmlContent = renderLesson(md, lesson.path);
        const vaultTitle = readVaultTitle(vaultPath);
        const lesNum = lesson.name.match(/^(\d+)/)?.[1] || '';
        const lessonDisplay = lesson.name.replace(/^\d+[-]/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const lessonLabel = `Lección ${lesNum}${lessonDisplay ? ` — ${lessonDisplay}` : ''}`;
        const meta = buildMeta(vaultTitle, lessonLabel, vaultName);
        const coverHtml = buildCoverHtml(meta, brandData);
        const contentHtml = buildContentHtml(lessonDisplay, htmlContent);
        const fullHtml = assembleHtml(coverHtml, [contentHtml]);

        const filename = `${lesson.name}.pdf`;
        const pdfPath = join(outDir, filename);
        await htmlToPdf(fullHtml, pdfPath);
        console.log(`  ✔ ${filename}`);
      }
    }
  } else {
    const groupKeys = Object.keys(groups);
    const actualName = groupKeys.length === 1 ? groupKeys[0] : moduleName;
    const vaultTitle = readVaultTitle(vaultPath);
    let coverSubtitle;
    if (scope === 'all') {
      coverSubtitle = vaultName;
    } else if (scope === 'module') {
      coverSubtitle = actualName;
    } else {
      const firstLesson = Object.values(groups)[0]?.[0];
      const lesNum = firstLesson?.name.match(/^(\d+)/)?.[1] || lessonNum;
      const lesDisplay = firstLesson
        ? firstLesson.name.replace(/^\d+[-]/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : '';
      coverSubtitle = `Lección ${lesNum}${lesDisplay ? ` — ${lesDisplay}` : ''}`;
    }
    const coverMeta = buildMeta(vaultTitle, coverSubtitle, vaultName);
    const coverHtml = buildCoverHtml(coverMeta, brandData);
    const contentHtmls = [];

    for (const [modName, lessons] of Object.entries(groups)) {
      for (const lesson of lessons) {
        const md = readFileSync(lesson.path, 'utf8');
        const htmlContent = renderLesson(md, lesson.path);
        const title = lesson.name.replace(/^\d+[-]/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        contentHtmls.push(buildContentHtml(title, htmlContent));
      }
    }

    const fullHtml = assembleHtml(coverHtml, contentHtmls);
    const slug = moduleName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    const filename = scope === 'all' ? 'curso-completo.pdf' :
      scope === 'module' ? `${slug}.pdf` :
        `leccion-${lessonNum}.pdf`;
    const pdfPath = join(outDir, filename);
    await htmlToPdf(fullHtml, pdfPath);
    console.log(`  ✔ ${filename}`);
  }

  console.log(`\nDone! PDFs generated in: ${outDir}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
