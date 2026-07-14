import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const DOCGEN_DIR = join(REPO_ROOT, 'shared', 'skills', 'document-generation', 'scripts', 'docgen');
const DECK_SPEC = join(REPO_ROOT, 'assets', 'decks', 'test-deck.json');
const REPORT_SPEC = join(REPO_ROOT, 'assets', 'decks', 'test-report.json');
const BRAND_PATH = join(REPO_ROOT, 'shared', 'brand.json');

let buildDeckHtml, buildReportHtml, brand;

test('load modules', async () => {
  const htmlTheme = await import(join(DOCGEN_DIR, 'html-theme.js'));
  buildDeckHtml = htmlTheme.buildHtml;
  const reportTheme = await import(join(DOCGEN_DIR, 'report-theme.js'));
  buildReportHtml = reportTheme.buildHtml;
  const idx = await import(join(DOCGEN_DIR, 'index.js'));
  brand = idx.brand;
});

describe('docgen output quality — deck', () => {
  let deckHtml;

  test('build full deck HTML', () => {
    const spec = JSON.parse(readFileSync(DECK_SPEC, 'utf8'));
    deckHtml = buildDeckHtml(spec.slides, spec.mostrar_paginas || false);
    assert.ok(deckHtml.length > 1000, 'Deck HTML should be substantial');
  });

  test('HTML has style block with CSS', () => {
    assert.ok(deckHtml.includes('<style>'), 'Should have style block');
    assert.ok(deckHtml.includes('</style>'), 'Should close style block');
    assert.ok(deckHtml.includes('.slide'), 'Style should contain .slide class');
  });

  test('HTML has brand CSS variables', () => {
    const b = brand();
    assert.ok(deckHtml.includes('--ink') || deckHtml.includes(b.colors.primary),
      'Should contain brand colors');
  });

  test('cover slide has correct CSS class', () => {
    assert.ok(deckHtml.includes('cover'), 'Cover should have cover class');
    assert.ok(deckHtml.includes('Presentación de prueba'), 'Cover should have title');
  });

  test('section slides have section class', () => {
    assert.ok(deckHtml.includes('slide section'), 'Should have section CSS class');
  });

  test('bullets slides have <li> elements', () => {
    assert.ok(deckHtml.includes('<li>'), 'Bullets should have <li> elements');
  });

  test('chart SVGs have xmlns attribute', () => {
    assert.ok(deckHtml.includes('xmlns="http://www.w3.org/2000/svg"'),
      'SVG charts should have xmlns');
  });

  test('chart SVGs have viewBox', () => {
    assert.ok(deckHtml.includes('viewBox'), 'SVG charts should have viewBox');
  });

  test('table slides render <th> and <td> when present', () => {
    const spec = JSON.parse(readFileSync(DECK_SPEC, 'utf8'));
    const hasTable = spec.slides.some(s => s.type === 'tabla');
    if (hasTable) {
      assert.ok(deckHtml.includes('<th>'), 'Tables should have <th>');
      assert.ok(deckHtml.includes('<td>'), 'Tables should have <td>');
    }
  });

  test('logo appears in deck (data URI)', () => {
    if (existsSync(join(REPO_ROOT, 'assets', 'images', 'logo.svg'))) {
      assert.ok(deckHtml.includes('data:image/svg+xml') || deckHtml.includes('logo'),
        'Deck should contain logo reference');
    }
  });

  test('page numbers present when mostrar_paginas=true', () => {
    const spec = JSON.parse(readFileSync(DECK_SPEC, 'utf8'));
    const html = buildDeckHtml(spec.slides, true);
    const pagenos = html.match(/<div class="pageno">/g) || [];
    assert.ok(pagenos.length > 0, 'Should have page numbers');
  });

  test('hero stat (destacado) renders value', () => {
    assert.ok(deckHtml.includes('20+'), 'Destacado should show value');
    assert.ok(deckHtml.includes('hero-stat'), 'Should have hero-stat class');
  });

  test('quote (cita) renders blockquote', () => {
    assert.ok(deckHtml.includes('<blockquote>'), 'Quote should have blockquote');
  });

  test('KPI slide renders values', () => {
    assert.ok(deckHtml.includes('kpi-value') || deckHtml.includes('kpi'),
      'KPI slide should render');
  });
});

describe('docgen output quality — report', () => {
  let reportHtml;

  test('build full report HTML', () => {
    const spec = JSON.parse(readFileSync(REPORT_SPEC, 'utf8'));
    reportHtml = buildReportHtml(spec.meta, spec.slides);
    assert.ok(reportHtml.length > 1000, 'Report HTML should be substantial');
  });

  test('report has DOCTYPE and html tags', () => {
    assert.ok(reportHtml.startsWith('<!DOCTYPE html>'), 'Should start with DOCTYPE');
    assert.ok(reportHtml.includes('<html'), 'Should have html tag');
    assert.ok(reportHtml.includes('</html>'), 'Should close html tag');
  });

  test('report cover has title and organization', () => {
    const spec = JSON.parse(readFileSync(REPORT_SPEC, 'utf8'));
    assert.ok(reportHtml.includes(spec.meta.title), 'Cover should have title');
    assert.ok(reportHtml.includes(spec.meta.organization), 'Cover should have organization');
  });

  test('report has section with accent bar', () => {
    assert.ok(reportHtml.includes('section-bar') || reportHtml.includes('section'),
      'Sections should have styling');
  });

  test('report tables have proper structure', () => {
    assert.ok(reportHtml.includes('<th>'), 'Tables should have headers');
    assert.ok(reportHtml.includes('<td>'), 'Tables should have cells');
  });

  test('report bullets have <li> elements', () => {
    assert.ok(reportHtml.includes('<li>'), 'Bullets should have list items');
  });

  test('report recommendation has problem/recommendation/actions', () => {
    assert.ok(reportHtml.includes('Integración continua'), 'Should have recommendation title');
    assert.ok(reportHtml.includes('recommendation') || reportHtml.includes('recomendacion'),
      'Should have recommendation section');
  });

  test('report roadmap has phases', () => {
    assert.ok(reportHtml.includes('Q2 2026'), 'Roadmap should have period');
    assert.ok(reportHtml.includes('roadmap') || reportHtml.includes('fases'),
      'Should have roadmap section');
  });

  test('report KPI table has indicators', () => {
    assert.ok(reportHtml.includes('Pipeline') || reportHtml.includes('kpi'),
      'KPI table should render');
  });

  test('report closing block exists', () => {
    assert.ok(reportHtml.includes('closing') || reportHtml.includes('Pipeline validado'),
      'Should have closing block');
  });

  test('report contains brand CSS', () => {
    assert.ok(reportHtml.includes('<style>'), 'Should have style block');
    assert.ok(reportHtml.includes('--ink') || reportHtml.includes('var('),
      'Should have CSS variables');
  });
});
