#!/usr/bin/env node
/**
 * docgen/html-theme.js — HTML slide theme for presentations
 *
 * Ported from gda-ai html_theme.py.
 *
 * Generates self-contained HTML documents from a list of slides.
 * Supports 20+ slide types: portada, seccion, bullets, dos-columnas,
 * tarjetas, kpis, personas, cita, imagen, tabla, lamina-completa,
 * grafico, imagen-texto, destacado, comparativa, timeline,
 * n-columnas, proceso/workflow, masonry, faq.
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { brand, loadBrand } from './index.js';
import { renderChart } from './charts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');

const CSS_PATH = join(REPO_ROOT, 'assets', 'templates', 'deck.css');
const FOOTER_TEXT = 'Contenido confidencial de la Gerencia de Desarrollos y Aplicaciones';

/* ─── Helpers ─── */

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _css() {
  let css = '';
  if (existsSync(CSS_PATH)) css = readFileSync(CSS_PATH, 'utf8');
  const b = brand();
  const root = `:root {
  --ink: ${b.colors.primary};
  --ink-2: ${b.colors.secondary};
  --bg-1: ${b.colors['light-bg']};
  --card: ${b.colors.background};
  --accent: ${b.colors.secondary};
  --accent-soft: ${b.colors['light-bg']};
}\n`;
  return root + css;
}

function _logoHref(variant = 'blue') {
  const b = brand();
  const rel = variant === 'white' ? b.logo_white : b.logo;
  if (!rel) return '';
  const logoPath = join(REPO_ROOT, rel);
  if (!existsSync(logoPath)) return '';
  const data = readFileSync(logoPath).toString('base64');
  return `data:image/svg+xml;base64,${data}`;
}

function _resolvePath(path) {
  const p = resolve(String(path));
  if (!existsSync(p)) return resolve(join(REPO_ROOT, path));
  return p;
}

function _imageDataUri(path) {
  if (!path) return null;
  const p = _resolvePath(path);
  if (!existsSync(p)) return null;
  const data = readFileSync(p);
  const ext = p.split('.').pop().toLowerCase();
  const mime = {
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
  }[ext] || 'application/octet-stream';
  const b64 = data.toString('base64');
  return `data:${mime};base64,${b64}`;
}

/* ─── Reusable components ─── */

function logo(pos = 'tr', variant = 'blue') {
  const href = _logoHref(variant);
  const cls = pos === 'tr' ? 'logo logo--tr' : 'logo logo--center';
  return `<div class="${cls}"><img src="${href}" alt="Logo"/></div>`;
}

function footer(center = false, page = null) {
  const cls = center ? 'footer footer--center' : 'footer';
  let parts = [`<div class="${cls}">${esc(FOOTER_TEXT)}</div>`];
  if (page !== null && !center) parts.push(`<div class="pageno">${esc(page)}</div>`);
  return parts.join('');
}

function head(titulo, subtitulo = '', eyebrow = '') {
  let parts = ['<div class="head">'];
  if (eyebrow) parts.push(`<span class="eyebrow">${esc(eyebrow)}</span>`);
  parts.push(`<h1>${esc(titulo)}</h1>`);
  if (subtitulo) parts.push(`<div class="sub">${esc(subtitulo)}</div>`);
  parts.push('</div>');
  return parts.join('');
}

function bullets(items) {
  const lis = items.map(i => `<li>${esc(i)}</li>`).join('');
  return `<ul class="bullets">${lis}</ul>`;
}

function media(src, cls = 'media', fit = 'cover') {
  if (!src) return '';
  const uri = _imageDataUri(src);
  if (!uri) return '';
  const style = fit ? ` style="object-fit:${fit}"` : '';
  return `<div class="${cls}"><img src="${uri}"${style} alt=""/></div>`;
}

function card(titulo, items = null, subtitulo = '', icon = '', image = null, iconImg = null, accentTop = true) {
  let parts = ['<div class="card">'];
  const banner = image ? media(image, 'card-banner') : '';
  if (banner) parts.push(banner);
  const iconMedia = iconImg ? media(iconImg, 'card-icon-img') : '';
  if (iconMedia) parts.push(iconMedia);
  else if (icon) parts.push(`<div class="card-icon">${esc(icon)}</div>`);
  else if (accentTop && !banner) parts.push('<div class="accent-top"></div>');
  parts.push('<div class="card-body">');
  parts.push(`<h3>${esc(titulo)}</h3>`);
  if (subtitulo) parts.push(`<div class="card-sub">${esc(subtitulo)}</div>`);
  if (items) {
    parts.push('<ul>' + items.map(i => `<li>${esc(i)}</li>`).join('') + '</ul>');
  }
  parts.push('</div></div>');
  return parts.join('');
}

function panel(titulo, items = null, tag = '', image = null) {
  let parts = ['<div class="panel">'];
  const banner = image ? media(image, 'panel-banner') : '';
  if (banner) parts.push(banner);
  parts.push('<div class="panel-body">');
  if (tag) parts.push(`<span class="panel-tag">${esc(tag)}</span>`);
  parts.push(`<h3>${esc(titulo)}</h3>`);
  if (items) {
    parts.push('<ul>' + items.map(i => `<li>${esc(i)}</li>`).join('') + '</ul>');
  }
  parts.push('</div></div>');
  return parts.join('');
}

function kpi(valor, etiqueta) {
  return `<div class="kpi"><div class="kpi-value">${esc(valor)}</div><div class="kpi-label">${esc(etiqueta)}</div></div>`;
}

function _initials(nombre) {
  const parts = String(nombre).split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function person(nombre, rol = '', avatar = null, avatarImg = null) {
  const uri = avatarImg ? _imageDataUri(avatarImg) : null;
  let av;
  if (uri) {
    av = `<div class="avatar avatar--img"><img src="${uri}" alt=""/></div>`;
  } else {
    const text = avatar ? esc(avatar) : esc(_initials(nombre));
    av = `<div class="avatar">${text}</div>`;
  }
  return `<div class="person">${av}<div class="pname">${esc(nombre)}</div><div class="prole">${esc(rol)}</div></div>`;
}

function tableV(headers, rows) {
  const th = headers.map(h => `<th>${esc(h)}</th>`).join('');
  const trs = rows.map(row => '<tr>' + row.map(c => `<td>${esc(c)}</td>`).join('') + '</tr>').join('');
  return `<table class="fibex"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}

/* ─── Slide wrapper ─── */

function _slide(inner, extraCls = '', page = null, footerCenter = false, withLogo = 'tr', logoVariant = 'blue') {
  const cls = 'slide' + (extraCls ? ` ${extraCls}` : '');
  let parts = [`<section class="${cls}">`];
  if (withLogo) parts.push(logo(withLogo, logoVariant));
  parts.push(inner);
  parts.push(footer(footerCenter, page));
  parts.push('</section>');
  return parts.join('');
}

/* ─── Layout functions ─── */

function _slide_portada(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  let inner = `<div class="cover body-area"><h1>${esc(s.titulo || '')}</h1>`;
  if (s.subtitulo) inner += `<div class="sub">${esc(s.subtitulo)}</div>`;
  inner += '<div class="accent-bar"></div></div>';
  return _slide(inner, 'cover', null, true, 'center', logoVariant);
}

function _slide_seccion(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  let inner = '<div class="section body-area">';
  if (s.indice) inner += `<div class="idx">${esc(s.indice)}</div>`;
  inner += `<h1>${esc(s.titulo || '')}</h1>`;
  if (s.subtitulo) inner += `<div class="sub">${esc(s.subtitulo)}</div>`;
  inner += '</div>';
  return _slide(inner, 'section', page, false, 'tr', logoVariant);
}

function _slide_bullets(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="body-area">${bullets(s.items || [])}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_dos_columnas(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const cols = s.columnas || [];
  const panelsHtml = cols.map(c => panel(c.titulo || '', c.items || [], c.tag || '')).join('');
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="twocol">${panelsHtml}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_tarjetas(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const items = s.tarjetas || [];
  const cols = s.columnas_grid || Math.min(Math.max(items.length, 1), 4);
  const cardsHtml = items.map(c =>
    card(c.titulo || '', c.items || [], c.subtitulo || '', c.icon || '', c.image || null, c.icon_img || null)
  ).join('');
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="grid cols-${cols}">${cardsHtml}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_kpis(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const items = s.kpis || [];
  const cols = s.columnas_grid || Math.min(Math.max(items.length, 1), 4);
  const body = items.map(k => kpi(k.valor || '', k.etiqueta || '')).join('');
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="kpis grid cols-${cols}">${body}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_personas(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const items = s.personas || [];
  const cols = s.columnas_grid || Math.min(Math.max(items.length, 1), 4);
  const body = items.map(p => person(p.nombre || '', p.rol || '', p.avatar || null, p.avatar_img || null)).join('');
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="people grid cols-${cols}">${body}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_cita(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  let inner = `<div class="quote body-area"><blockquote>${esc(s.texto || '')}</blockquote>`;
  if (s.autor) inner += `<div class="qby">${esc(s.autor)}</div>`;
  inner += '</div>';
  return _slide(inner, 'quote', page, false, 'tr', logoVariant);
}

function _slide_imagen(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const src = s.src ? _imageDataUri(s.src) : '';
  const bare = s.bare ? ' bare' : '';
  let inner = '';
  if (s.titulo) inner += head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="figure${bare}"><img src="${src || ''}" alt=""/></div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_tabla(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="body-area">${tableV(s.headers || [], s.filas || [])}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_lamina_completa(s, page) {
  const src = s.src;
  let innerImg;
  if (s.bleed && src && String(src).endsWith('.svg')) {
    const svgPath = _resolvePath(src);
    innerImg = existsSync(svgPath) ? readFileSync(svgPath, 'utf8') : '';
    innerImg = `<div class="fullbleed-svg">${innerImg}</div>`;
  } else {
    const uri = src ? _imageDataUri(src) : '';
    innerImg = `<img class="fullbleed-img" src="${uri || ''}" alt=""/>`;
  }
  let parts = [innerImg];
  if (s.overlay) parts.push('<div class="fullbleed-overlay"></div>');
  const titulo = s.titulo;
  if (titulo) {
    const pos = s.pos || 'bottom-left';
    let cap = [`<div class="fullbleed-caption pos-${esc(pos)}">`];
    if (s.eyebrow) cap.push(`<span class="eyebrow">${esc(s.eyebrow)}</span>`);
    cap.push(`<h1>${esc(titulo)}</h1>`);
    if (s.subtitulo) cap.push(`<div class="sub">${esc(s.subtitulo)}</div>`);
    cap.push('</div>');
    parts.push(cap.join(''));
  }
  const withLogo = s.logo !== false ? 'tr' : null;
  const showFooter = s.footer !== false;
  const logoVariant = s.logo_variant || (s.overlay ? 'white' : 'blue');
  const cls = 'slide fullbleed';
  let out = [`<section class="${cls}">`];
  out.push(parts.join(''));
  if (withLogo) out.push(logo(withLogo, logoVariant));
  if (showFooter) out.push(footer(false, page));
  out.push('</section>');
  return out.join('');
}

function _slide_grafico(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const chart = s.chart || {};
  const svg = renderChart(chart.tipo || '', chart);
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="body-area chart-area">${svg}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_imagen_texto(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const img = media(s.src, 'it-media', s.fit || 'cover');
  let textParts = [head(s.titulo || '', s.subtitulo || '', s.eyebrow || '')];
  if (s.items) textParts.push(bullets(s.items));
  else if (s.texto) textParts.push(`<p class="it-text">${esc(s.texto)}</p>`);
  const order = s.imagen_derecha ? 'reverse' : '';
  const inner = `<div class="imgtext ${order}"><div class="it-text-col">${textParts.join('')}</div>${img}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_destacado(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  let inner = '<div class="destacado body-area">';
  if (s.eyebrow) inner += `<span class="eyebrow">${esc(s.eyebrow)}</span>`;
  inner += `<div class="hero-stat">${esc(s.valor || '')}</div>`;
  if (s.titulo) inner += `<h1>${esc(s.titulo)}</h1>`;
  if (s.subtitulo) inner += `<div class="sub">${esc(s.subtitulo)}</div>`;
  inner += '</div>';
  return _slide(inner, 'destacado-slide', page, false, 'tr', logoVariant);
}

function _slide_comparativa(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const cols = s.columnas || [];
  const panelsHtml = cols.map(c => {
    let p = ['<div class="cmp-panel">'];
    const m = c.src ? media(c.src, 'cmp-media', 'cover') : '';
    if (m) p.push(m);
    p.push('<div class="cmp-body">');
    if (c.tag) p.push(`<span class="panel-tag">${esc(c.tag)}</span>`);
    p.push(`<h3>${esc(c.titulo || '')}</h3>`);
    if (c.items) p.push('<ul>' + c.items.map(i => `<li>${esc(i)}</li>`).join('') + '</ul>');
    p.push('</div></div>');
    return p.join('');
  }).join('');
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="comparativa">${panelsHtml}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_timeline(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const hitos = (s.hitos || []).map(h => [h.fecha || '', h.titulo || '']);
  const svg = renderChart('timeline', { hitos });
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="body-area chart-area">${svg}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_n_columnas(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const cols = s.columnas || [];
  let n = s.numero_columnas || 3;
  n = Math.max(2, Math.min(6, n));
  const panelsHtml = cols.map(c => panel(c.titulo || '', c.items || [], c.tag || '')).join('');
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="ncol cols-${n}">${panelsHtml}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_proceso(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const pasos = s.pasos || [];
  let items = pasos.map((p, i) =>
    `<div class="paso">` +
    `<div class="paso-num">${i + 1}</div>` +
    `<div class="paso-body">` +
    `<h3>${esc(p.titulo || '')}</h3>` +
    `<p>${esc(p.descripcion || '')}</p>` +
    `</div></div>`
  ).join('');
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="proceso">${items}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_masonry(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const imagenes = s.imagenes || [];
  let n = s.columnas || 3;
  n = Math.max(2, Math.min(6, n));
  const items = imagenes.filter(Boolean).map(img => {
    const caption = img.caption || '';
    const alt = esc(img.alt || '');
    const src = img.src ? _imageDataUri(img.src) : '';
    if (!src) return null;
    let item = '<div class="mas-item">';
    item += `<img src="${src}" alt="${alt}"/>`;
    if (caption) item += `<div class="mas-caption">${esc(caption)}</div>`;
    item += '</div>';
    return item;
  }).filter(Boolean).join('');
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="masonry cols-${n}">${items}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

function _slide_faq(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  const items = s.items || [];
  const details = items.map(item => {
    const pregunta = esc(item.pregunta || '');
    const respuesta = esc(item.respuesta || '');
    return `<details><summary>${pregunta}</summary><div class="faq-r">${respuesta}</div></details>`;
  }).join('');
  let inner = head(s.titulo || '', s.subtitulo || '', s.eyebrow || '');
  inner += `<div class="faq">${details}</div>`;
  return _slide(inner, '', page, false, 'tr', logoVariant);
}

/* ─── Layout registry ─── */

const _LAYOUTS = {
  portada: _slide_portada,
  seccion: _slide_seccion,
  bullets: _slide_bullets,
  'dos-columnas': _slide_dos_columnas,
  tarjetas: _slide_tarjetas,
  kpis: _slide_kpis,
  personas: _slide_personas,
  cita: _slide_cita,
  imagen: _slide_imagen,
  tabla: _slide_tabla,
  'lamina-completa': _slide_lamina_completa,
  grafico: _slide_grafico,
  'imagen-texto': _slide_imagen_texto,
  destacado: _slide_destacado,
  comparativa: _slide_comparativa,
  timeline: _slide_timeline,
  'n-columnas': _slide_n_columnas,
  proceso: _slide_proceso,
  workflow: _slide_proceso,
  masonry: _slide_masonry,
  faq: _slide_faq,
};

/* ─── Public API ─── */

export function slideToHtml(slide, page = null) {
  const kind = slide.type || 'bullets';
  const layout = _LAYOUTS[kind];
  if (!layout) throw new Error(`Unsupported slide type: ${kind}`);
  return layout(slide, page);
}

export function buildHtml(slides, mostrarPaginas = false) {
  const sections = [];
  const total = slides.length;
  for (let i = 0; i < total; i++) {
    const page = mostrarPaginas ? `${i + 1} / ${total}` : null;
    sections.push(slideToHtml(slides[i], page));
  }
  return (
    '<!DOCTYPE html>\n' +
    '<html lang="es"><head><meta charset="utf-8">\n' +
    `<style>\n${_css()}\n</style>\n</head><body>\n` +
    sections.join('\n') +
    '\n</body></html>\n'
  );
}
