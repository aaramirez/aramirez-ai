#!/usr/bin/env node
/**
 * docgen/report-theme.js — HTML theme for executive report documents
 *
 * Ported from gda-ai report_theme.py.
 *
 * Generates self-contained HTML documents (Letter size) from a list of
 * report slides. Slide types: doc-cover, section, text, callout, table,
 * bullets, recommendation, roadmap, kpi-table, closing.
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { brand } from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');

const CSS_PATH = join(REPO_ROOT, 'assets', 'templates', 'report.css');
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
  --muted: ${b.colors.secondary};
  --bg: ${b.colors.background};
  --bg-soft: ${b.colors['light-bg']};
  --accent: ${b.colors.secondary};
  --accent-soft: ${b.colors['light-bg']};
}\n`;
  return root + css;
}

function _logoDataUri() {
  const b = brand();
  if (!b.logo) return '';
  const logoPath = join(REPO_ROOT, b.logo);
  if (!existsSync(logoPath)) return '';
  const data = readFileSync(logoPath).toString('base64');
  return `data:image/svg+xml;base64,${data}`;
}

function _pageHeader(page, meta) {
  const classification = esc(meta.classification || '');
  const logo = _logoDataUri();
  return (
    '<div class="page-header">' +
    `<span class="header-classification">${classification}</span>` +
    `<span class="header-logo"><img src="${logo}" alt="Logo"/></span>` +
    '</div>\n'
  );
}

function _pageFooter(page, meta) {
  return (
    '<div class="page-footer">' +
    `<span class="footer-org">${esc(FOOTER_TEXT)}</span>` +
    `<span class="footer-page">P\u00e1gina ${page}</span>` +
    '</div>\n'
  );
}

/* ─── Renderers ─── */

function _renderCover(s, meta, page) {
  const logo = _logoDataUri();
  const title = esc(s.titulo || meta.title || '');
  const subtitle = esc(s.subtitulo || meta.subtitle || '');
  const org = esc(meta.organization || '');
  const prepared = esc(meta.prepared_by || '');
  const date = esc(meta.date || '');
  const classification = esc(meta.classification || '');
  const rows = [
    ['Organizaci\u00f3n', org],
    ['Preparado por', prepared],
    ['Fecha', date],
    ['Clasificaci\u00f3n', classification],
  ].map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>\n`).join('');
  return (
    '<section class="page cover-page">\n' +
    '<div class="page-body">\n' +
    `<div class="cover-logo"><img src="${logo}" alt="Logo"/></div>\n` +
    `<h1>${title}</h1>\n` +
    `<div class="cover-subtitle">${subtitle}</div>\n` +
    `<table class="cover-meta">${rows}</table>\n` +
    '</div>\n' +
    '</section>\n'
  );
}

function _renderSection(s) {
  const title = esc(s.titulo || '');
  const subtitle = esc(s.subtitulo || '');
  let parts = ['<div class="section-block">'];
  parts.push('<div class="section-bar"></div>');
  parts.push(`<h2>${title}</h2>`);
  if (subtitle) parts.push(`<div class="section-sub">${subtitle}</div>`);
  parts.push('</div>');
  return parts.join('');
}

function _renderText(s) {
  let paras = s.parrafos || s.items || [];
  if (typeof paras === 'string') paras = [paras];
  let parts = ['<div class="body-text">'];
  for (const p of paras) parts.push(`<p>${esc(p)}</p>`);
  parts.push('</div>');
  return parts.join('');
}

function _renderCallout(s) {
  const headline = esc(s.headline || s.titulo || '');
  let paras = s.parrafos || s.texto || [];
  if (typeof paras === 'string') paras = [paras];
  let parts = ['<div class="callout-box">'];
  parts.push(`<div class="callout-headline">${headline}</div>`);
  if (paras.length) {
    parts.push('<div class="callout-body">');
    for (const p of paras) parts.push(`<p>${esc(p)}</p>`);
    parts.push('</div>');
  }
  parts.push('</div>');
  return parts.join('');
}

function _renderTable(s) {
  const headers = s.headers || [];
  const rows = s.filas || [];
  if (!headers.length) return '';
  const th = headers.map(h => `<th>${esc(h)}</th>`).join('');
  const trs = rows.map(row => '<tr>' + row.map(c => `<td>${esc(c)}</td>`).join('') + '</tr>').join('');
  return `<table class="data-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>\n`;
}

function _renderBullets(s) {
  const items = s.items || [];
  const lis = items.map(i => `<li>${esc(i)}</li>`).join('');
  return `<ul class="bullet-list">${lis}</ul>\n`;
}

function _renderRecommendation(s) {
  const title = esc(s.titulo || '');
  const problem = s.problema || s.problem || '';
  const rec = s.recomendacion || s.recommendation || '';
  const actions = s.acciones || s.actions || [];
  let parts = ['<div class="recommendation">'];
  parts.push(`<h3>${title}</h3>`);
  if (problem) parts.push(`<div class="rec-field"><strong>Problema:</strong> ${esc(problem)}</div>`);
  if (rec) parts.push(`<div class="rec-field"><strong>Recomendaci\u00f3n:</strong> ${esc(rec)}</div>`);
  if (actions.length) {
    parts.push('<div class="rec-field"><strong>Acciones sugeridas:</strong></div>');
    parts.push('<ul class="rec-actions">');
    for (const a of actions) parts.push(`<li>${esc(a)}</li>`);
    parts.push('</ul>');
  }
  parts.push('</div>');
  return parts.join('');
}

function _renderRoadmap(s) {
  const headers = s.headers || ['Periodo', 'Foco', 'Entregables'];
  const phases = s.fases || s.phases || [];
  const th = headers.map(h => `<th>${esc(h)}</th>`).join('');
  const trs = phases.map(phase => {
    const deliverables = phase.entregables || phase.deliverables || [];
    const delivHtml = deliverables.map(d => `\u2022 ${esc(d)}`).join('<br/>');
    return '<tr>' +
      `<td>${esc(phase.phase || phase.periodo || '')}</td>` +
      `<td>${esc(phase.focus || phase.foco || '')}</td>` +
      `<td>${delivHtml}</td>` +
      '</tr>';
  }).join('');
  return `<table class="roadmap-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>\n`;
}

function _renderKpiTable(s) {
  const headers = s.headers || ['Dominio', 'Indicador', 'Meta'];
  const kpis = s.kpis || s.items || [];
  const th = headers.map(h => `<th>${esc(h)}</th>`).join('');
  const trs = kpis.map(k =>
    '<tr>' +
    `<td>${esc(k.domain || k.dominio || '')}</td>` +
    `<td>${esc(k.metric || k.metrica || '')}</td>` +
    `<td>${esc(k.target || k.meta || '')}</td>` +
    '</tr>'
  ).join('');
  return `<table class="kpi-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>\n`;
}

function _renderClosing(s) {
  let paras = s.parrafos || s.items || [];
  if (typeof paras === 'string') paras = [paras];
  let parts = ['<div class="closing-block">'];
  parts.push('<div class="closing-icon">\u201c</div>');
  for (const p of paras) parts.push(`<p>${esc(p)}</p>`);
  parts.push('</div>');
  return parts.join('');
}

/* ─── Renderer registry ─── */

const _RENDERERS = {
  section: _renderSection,
  text: _renderText,
  callout: _renderCallout,
  table: _renderTable,
  bullets: _renderBullets,
  recommendation: _renderRecommendation,
  roadmap: _renderRoadmap,
  'kpi-table': _renderKpiTable,
  closing: _renderClosing,
};

const _NEW_PAGE = new Set(['section', 'doc-cover']);

/* ─── Public API ─── */

export function buildHtml(meta, slides) {
  const pages = [];
  let pageNum = 0;
  let pageBody = [];

  function flushPage() {
    if (pageBody.length) {
      const h = _pageHeader(pageNum, meta);
      const f = _pageFooter(pageNum, meta);
      pages.push(
        `<section class="page">\n${h}<div class="page-body">\n${pageBody.join('')}\n</div>\n${f}</section>\n`
      );
      pageBody = [];
    }
  }

  for (const s of slides) {
    const kind = s.type || 'text';

    if (kind === 'doc-cover') {
      flushPage();
      pageNum++;
      pages.push(_renderCover(s, meta, pageNum));
    } else if (_NEW_PAGE.has(kind)) {
      flushPage();
      pageNum++;
      pageBody.push(_renderSection(s));
    } else {
      const renderer = _RENDERERS[kind];
      if (renderer) pageBody.push(renderer(s));
    }
  }

  flushPage();

  return (
    '<!DOCTYPE html>\n' +
    '<html lang="es"><head><meta charset="utf-8">\n' +
    `<style>\n${_css()}\n</style>\n</head><body>\n` +
    pages.join('\n') +
    '\n</body></html>\n'
  );
}
