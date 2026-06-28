#!/usr/bin/env node
/**
 * docgen/index.js — Document generation core library
 *
 * Cross-platform: macOS, Linux, Windows.
 * Zero npm dependencies (subprocess tools optional).
 *
 * Ported from gda-ai (repos/GrupoConex/gda-ai/shared/scripts/deck_lib.py).
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';
import { homedir, platform as osPlatform } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');

/* ─── Brand loading ─── */

let _brand = null;

export function loadBrand(brandPath) {
  if (brandPath) {
    _brand = JSON.parse(readFileSync(brandPath, 'utf8')).brand;
  } else {
    const paths = [
      join(REPO_ROOT, 'shared', 'brand.json'),
      join(process.cwd(), 'shared', 'brand.json'),
    ];
    for (const p of paths) {
      if (existsSync(p)) {
        _brand = JSON.parse(readFileSync(p, 'utf8')).brand;
        return;
      }
    }
    _brand = {
      name: 'Project',
      colors: { primary: '#1a365d', secondary: '#2b6cb0', accent: '#e53e3e', text: '#1a202c', background: '#ffffff', 'light-bg': '#f7fafc' },
      logo: null, logo_white: null,
      fonts: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' },
    };
  }
}

export function brand() {
  if (!_brand) loadBrand();
  return _brand;
}

/* ─── Constants ─── */

export const WIDTH = 1600;
export const HEIGHT = 900;
export const PAGE_WIDTH = 1600;
export const PAGE_HEIGHT = 900;

/* ─── SVG helpers ─── */

export function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function svgOpen() {
  const b = brand();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${b.colors.background}"/>
      <stop offset="100%" stop-color="${b.colors['light-bg']}"/>
    </linearGradient>
    <linearGradient id="accent-bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${b.colors.primary}"/>
      <stop offset="100%" stop-color="${b.colors.secondary}"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.12"/>
    </filter>
    <style>
      .title { font-family: ${b.fonts.heading}; font-size: 48px; font-weight: 700; fill: ${b.colors.primary}; }
      .subtitle { font-family: ${b.fonts.body}; font-size: 24px; fill: ${b.colors.secondary}; }
      .body { font-family: ${b.fonts.body}; font-size: 20px; fill: ${b.colors.text}; }
      .small { font-family: ${b.fonts.body}; font-size: 16px; fill: ${b.colors.text}; }
      .accent { font-family: ${b.fonts.body}; font-size: 20px; fill: ${b.colors.accent}; font-weight: 600; }
    </style>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-grad)"/>`;
}

export function svgClose() {
  return `\n  <text x="${WIDTH - 40}" y="${HEIGHT - 20}" text-anchor="end" font-family="Inter, sans-serif" font-size="11" fill="#999">\u00A9 ${brand().name}</text>\n</svg>`;
}

/* ─── SVG helpers: logo positions ─── */

export function logoSvgCentered(href) {
  if (!href) return '';
  const logoPath = resolve(join(REPO_ROOT, href));
  if (!existsSync(logoPath)) return '';
  const data = readFileSync(logoPath).toString('base64');
  return `<image x="${WIDTH / 2 - 100}" y="200" width="200" height="60" href="data:image/svg+xml;base64,${data}" preserveAspectRatio="xMidYMid meet"/>`;
}

export function logoSvgTopRight(href) {
  if (!href) return '';
  const logoPath = resolve(join(REPO_ROOT, href));
  if (!existsSync(logoPath)) return '';
  const data = readFileSync(logoPath).toString('base64');
  return `<image x="${WIDTH - 180}" y="20" width="140" height="42" href="data:image/svg+xml;base64,${data}" preserveAspectRatio="xMidYMid meet"/>`;
}

/* ─── SVG slide builders ─── */

export function portada(titulo, subtitulo) {
  const b = brand();
  return `${svgOpen()}
  ${logoSvgCentered(b.logo)}
  <text x="${WIDTH / 2}" y="420" text-anchor="middle" class="title">${esc(titulo)}</text>
  ${subtitulo ? `\n  <text x="${WIDTH / 2}" y="470" text-anchor="middle" class="subtitle">${esc(subtitulo)}</text>` : ''}
  <rect x="${WIDTH / 2 - 60}" y="510" width="120" height="4" rx="2" fill="${b.colors.secondary}"/>
  <text x="${WIDTH / 2}" y="${HEIGHT - 60}" text-anchor="middle" class="small">${esc(b.name)}</text>
${svgClose()}`;
}

export function lamina(titulo, subtitulo, bloques) {
  const b = brand();
  const ls = [`${svgOpen()}`];

  // Logo top-right
  const logoHref = b.logo;
  if (logoHref) ls.push(`  ${logoSvgTopRight(logoHref)}`);

  // Header bar
  ls.push(`  <rect x="0" y="0" width="8" height="${HEIGHT}" fill="${b.colors.primary}" opacity="0.15"/>`);
  ls.push(`  <text x="50" y="80" class="title">${esc(titulo)}</text>`);
  if (subtitulo) ls.push(`  <text x="50" y="115" class="subtitle">${esc(subtitulo)}</text>`);
  ls.push(`  <rect x="50" y="130" width="80" height="4" rx="2" fill="${b.colors.secondary}"/>`);

  // Content blocks
  let y = 170;
  for (const block of (bloques || [])) {
    if (block.tipo === 'hdr') {
      ls.push(`  <text x="50" y="${y}" class="accent">${esc(block.texto)}</text>`);
      y += 40;
    } else if (block.tipo === 'txt') {
      ls.push(`  <text x="50" y="${y}" class="body">${esc(block.texto)}</text>`);
      y += 30;
    } else if (block.tipo === 'li') {
      ls.push(`  <circle cx="65" cy="${y - 5}" r="4" fill="${b.colors.secondary}"/>`);
      ls.push(`  <text x="85" y="${y}" class="body">${esc(block.texto)}</text>`);
      y += 30;
    }
  }

  ls.push(svgClose());
  return ls.join('\n');
}

export function slideToSvg(slide) {
  if (slide.type === 'portada') return portada(slide.titulo, slide.subtitulo);
  return lamina(slide.titulo || slide.title, slide.subtitulo || slide.subtitle, slide.bloques || slide.blocks || slide.bullets?.map(b => ({ tipo: 'li', texto: b })));
}

/* ─── Subprocess renderers ─── */

export function findBrowser() {
  const commonPaths = {
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ],
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
    ],
    linux: ['google-chrome', 'chromium-browser', 'chromium', 'microsoft-edge'],
  };
  const paths = commonPaths[osPlatform()] || [];
  const envBrowser = process.env.DOCGEN_BROWSER;
  if (envBrowser && existsSync(envBrowser)) return envBrowser;
  for (const p of paths) {
    if (existsSync(p)) return p;
    try {
      execSync(`${p} --version 2>/dev/null`, { stdio: 'pipe' });
      return p;
    } catch { /* not found */ }
  }
  return null;
}

export function htmlToPdf(html, pdfPath, browserPath) {
  const browser = browserPath || findBrowser();
  if (!browser) throw new Error('No Chromium browser found. Install Chrome/Edge or set DOCGEN_BROWSER env var.');
  const htmlPath = join(dirname(pdfPath), `_temp_${Date.now()}.html`);
  writeFileSync(htmlPath, html, 'utf8');
  try {
    const result = spawnSync(browser, [
      '--headless=new', '--disable-gpu', '--no-sandbox',
      `--print-to-pdf=${resolve(pdfPath)}`, `file://${resolve(htmlPath)}`,
    ], { timeout: 30000, stdio: 'pipe' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Browser exited with code ${result.status}: ${result.stderr?.toString().slice(0, 200)}`);
  } finally {
    try { execSync(`rm "${htmlPath}"`); } catch { /* ok */ }
  }
}

export function renderSvgToPng(svgText, pngPath, scale = 1.25) {
  const dir = dirname(pngPath);
  mkdirSync(dir, { recursive: true });
  const svgPath = join(dir, `_svg_${Date.now()}.svg`);
  writeFileSync(svgPath, svgText, 'utf8');
  try {
    execSync(`rsvg-convert --width=${Math.round(WIDTH * scale)} "${svgPath}" -o "${pngPath}"`, { stdio: 'pipe' });
  } catch {
    execSync(`magick -background none -size ${Math.round(WIDTH * scale)}x${Math.round(HEIGHT * scale)} "${svgPath}" "${pngPath}"`, { stdio: 'pipe' });
  } finally {
    try { execSync(`rm -f "${svgPath}"`); } catch { /* ok */ }
  }
}

export function svgToPng(svgText, pngPath, scale = 1.25) {
  renderSvgToPng(svgText, pngPath, scale);
  return pngPath;
}

export function svgToPdf(svgText, pdfPath, scale = 1.25) {
  const tmpDir = join(dirname(pdfPath), `_tmp_${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  try {
    const pngPath = join(tmpDir, 'slide.png');
    renderSvgToPng(svgText, pngPath, scale);
    execSync(`magick "${pngPath}" "${pdfPath}"`, { stdio: 'pipe' });
  } finally {
    try { execSync(`rm -rf "${tmpDir}"`); } catch { /* ok */ }
  }
}

export function svgsToPdf(svgTexts, pdfPath, scale = 1.25) {
  const tmpDir = join(dirname(pdfPath), `_tmp_${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  try {
    const pngs = [];
    for (let i = 0; i < svgTexts.length; i++) {
      const pngPath = join(tmpDir, `slide_${String(i + 1).padStart(2, '0')}.png`);
      renderSvgToPng(svgTexts[i], pngPath, scale);
      pngs.push(pngPath);
    }
    execSync(`magick ${pngs.map(p => `"${p}"`).join(' ')} "${pdfPath}"`, { stdio: 'pipe' });
  } finally {
    try { execSync(`rm -rf "${tmpDir}"`); } catch { /* ok */ }
  }
}

/* ─── Content loaders ─── */

export function loadJson(source) {
  return JSON.parse(readFileSync(source, 'utf8'));
}

export async function loadJsModule(source) {
  const mod = await import(resolve(source));
  if (typeof mod.buildSlides === 'function') return { slides: await mod.buildSlides() };
  if (typeof mod.buildSvg === 'function') return { svg: await mod.buildSvg(), slides: [] };
  return mod;
}

export function loadMarkdown(source) {
  const content = readFileSync(source, 'utf8');
  const lines = content.split('\n');
  const slides = [];
  let current = null;

  for (const line of lines) {
    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    const bullet = line.match(/^[-*] (.+)/);
    const italic = line.match(/^\*(.+)\*$/);

    if (h1) {
      current = { type: 'portada', titulo: h1[1], bloques: [] };
      slides.push(current);
    } else if (h2) {
      current = { type: 'lamina', titulo: h2[1], bloques: [] };
      slides.push(current);
    } else if (h3 && current) {
      current.bloques.push({ tipo: 'hdr', texto: h3[1] });
    } else if (bullet && current) {
      current.bloques.push({ tipo: 'li', texto: bullet[1] });
    } else if (italic && current) {
      current.subtitulo = italic[1];
    } else if (line.trim() && current) {
      current.bloques.push({ tipo: 'txt', texto: line.trim() });
    }
  }
  return { slides };
}

export async function loadSource(source) {
  if (!existsSync(source)) throw new Error(`File not found: ${source}`);
  if (source.endsWith('.json')) return loadJson(source);
  if (source.endsWith('.js') || source.endsWith('.mjs')) return loadJsModule(source);
  if (source.endsWith('.md')) return loadMarkdown(source);
  if (source.endsWith('.yaml') || source.endsWith('.yml')) return loadJson(source);
  throw new Error(`Unsupported source format: ${source}. Use .json, .md, .js, or .yaml`);
}
