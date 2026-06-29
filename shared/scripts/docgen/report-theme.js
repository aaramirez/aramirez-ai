import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { brand, esc } from './index.js';
import { brandCss, logoHref } from './theme-utils.js';
import { foot, sectionBlock, bullets, tableV, callout, recommendation, roadmap, kpiTable, closing } from './components.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');

const CSS_PATH = join(REPO_ROOT, 'assets', 'templates', 'report.css');

/* ─── Helpers ─── */

function _css() {
  let css = '';
  if (existsSync(CSS_PATH)) css = readFileSync(CSS_PATH, 'utf8');
  return brandCss('report') + '\n' + css;
}

function _pageHeader(page, meta) {
  const classification = esc(meta.classification || '');
  const logo = logoHref('blue');
  return (
    '<div class="page-header">' +
    `<span class="header-classification">${classification}</span>` +
    `<span class="header-logo"><img src="${logo}" alt="Logo"/></span>` +
    '</div>\n'
  );
}

function _pageFooter(page, meta) {
  const b = brand();
  const template = b.footer || 'Contenido confidencial de {{organization}}';
  const org = meta.organization || b.name;
  const text = template.replace('{{organization}}', org);
  return foot(false, `P\u00e1gina ${page}`, text);
}

/* ─── Renderers ─── */

function _renderCover(s, meta, page) {
  const logo = logoHref('blue');
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
  return sectionBlock(s.titulo || '', s.subtitulo || '');
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
  return callout(s.headline || s.titulo || '', s.parrafos || s.texto || []);
}

function _renderTable(s) {
  return tableV(s.headers || [], s.filas || [], 'data-table');
}

function _renderBullets(s) {
  return bullets(s.items || [], 'bullet-list');
}

function _renderRecommendation(s) {
  return recommendation({
    titulo: s.titulo,
    problema: s.problema || s.problem,
    recomendacion: s.recomendacion || s.recommendation,
    acciones: s.acciones || s.actions,
  });
}

function _renderRoadmap(s) {
  return roadmap(s.headers || ['Periodo', 'Foco', 'Entregables'], s.fases || s.phases || []);
}

function _renderKpiTable(s) {
  return kpiTable(s.headers || ['Dominio', 'Indicador', 'Meta'], s.kpis || s.items || []);
}

function _renderClosing(s) {
  return closing(s.parrafos || s.items || []);
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
