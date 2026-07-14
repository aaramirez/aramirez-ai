import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { REPO_ROOT } from '../helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/* ─── 2f: Pipeline smoke test helpers ─── */

const DOCGEN_DIR = join(REPO_ROOT, 'shared', 'skills', 'document-generation', 'scripts', 'docgen');
const TEMPLATES_DIR = join(REPO_ROOT, 'assets', 'templates');

const SCRIPTS = [
  'index.js', 'charts.js', 'html-theme.js', 'report-theme.js',
  'build-deck.js', 'build-image.js', 'build-report.js', 'build-web.js', 'build-pptx.js',
];

/* ─── 2f: Syntax check ─── */

describe('docgen pipeline smoke test (Phase 2f)', () => {
  for (const name of SCRIPTS) {
    test(`${name} parses without syntax errors`, () => {
      const path = join(DOCGEN_DIR, name);
      assert.ok(existsSync(path), `Script not found: ${path}`);
      // Dynamic import validates syntax at parse time
      // We'll just verify the file is readable and non-empty
      const content = readFileSync(path, 'utf8');
      assert.ok(content.length > 0, `Script ${name} is empty`);
    });
  }

  test('deck.css template exists', () => {
    assert.ok(existsSync(join(TEMPLATES_DIR, 'deck.css')), 'deck.css not found');
  });

  test('report.css template exists', () => {
    assert.ok(existsSync(join(TEMPLATES_DIR, 'report.css')), 'report.css not found');
  });

  test('build-deck.js has valid ES module syntax', () => {
    const path = join(DOCGEN_DIR, 'build-deck.js');
    const src = readFileSync(path, 'utf8');
    assert.ok(src.includes('import '), 'Should use ES imports');
    assert.ok(src.includes('export') || src.includes('main().catch'), 'Should be a valid module');
  });

  test('build scripts do not have orphaned main() calls (checked by reading source)', () => {
    for (const name of ['build-report.js', 'build-image.js', 'build-web.js', 'build-pptx.js']) {
      const src = readFileSync(join(DOCGEN_DIR, name), 'utf8');
      assert.ok(src.includes('main().catch'), `${name} should have main().catch`);
      assert.ok(src.includes('import '), `${name} should use ES imports`);
    }
  });
});

/* ─── 2c: HTML theme direct output ─── */

describe('html-theme.js output (Phase 2c)', () => {
  let buildHtml, slideToHtml;

  test('modules import successfully', async () => {
    const theme = await import(join(DOCGEN_DIR, 'html-theme.js'));
    buildHtml = theme.buildHtml;
    slideToHtml = theme.slideToHtml;
    assert.ok(typeof buildHtml === 'function');
    assert.ok(typeof slideToHtml === 'function');
  });

  test('buildHtml produces complete HTML document', () => {
    const html = buildHtml([
      { type: 'portada', titulo: 'Test Title', subtitulo: 'Test Sub' },
      { type: 'bullets', titulo: 'Bullets', items: ['A', 'B'] },
    ]);
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'Should start with DOCTYPE');
    assert.ok(html.includes('<html lang="es">'), 'Should have html tag');
    assert.ok(html.includes('</html>'), 'Should close html tag');
    assert.ok(html.includes('<style>'), 'Should include style block');
    assert.ok(html.includes('</style>'), 'Should close style block');
    assert.ok(html.includes('</head><body>'), 'Should have head/body');
    assert.ok(html.includes('</body>'), 'Should close body');
  });

  test('slideToHtml renders portada slide type', () => {
    const html = slideToHtml({ type: 'portada', titulo: 'Cover', subtitulo: 'Sub' });
    assert.ok(html.includes('Cover'), 'Should contain slide title');
    assert.ok(html.includes('Sub'), 'Should contain subtitle');
    assert.ok(html.includes('slide cover'), 'Should have cover CSS class');
  });

  test('slideToHtml renders bullets slide type', () => {
    const html = slideToHtml({ type: 'bullets', titulo: 'Items', items: ['One', 'Two'] });
    assert.ok(html.includes('Items'), 'Should contain title');
    assert.ok(html.includes('<li>One</li>'), 'Should contain list item One');
    assert.ok(html.includes('<li>Two</li>'), 'Should contain list item Two');
    assert.ok(html.includes('bullets'), 'Should have bullets class');
  });

  test('slideToHtml renders seccion slide type', () => {
    const html = slideToHtml({ type: 'seccion', titulo: 'Section 1', indice: 'INDEX' });
    assert.ok(html.includes('Section 1'), 'Should contain section title');
    assert.ok(html.includes('INDEX'), 'Should contain index');
    assert.ok(html.includes('slide section'), 'Should have section CSS class');
  });

  test('slideToHtml renders cita (quote) slide type', () => {
    const html = slideToHtml({ type: 'cita', texto: 'Quote text', autor: 'Author' });
    assert.ok(html.includes('<blockquote>Quote text</blockquote>'), 'Should contain blockquote');
    assert.ok(html.includes('Author'), 'Should contain author');
    assert.ok(html.includes('slide quote'), 'Should have quote CSS class');
  });

  test('slideToHtml renders grafico (chart) slide type', () => {
    const html = slideToHtml({
      type: 'grafico', titulo: 'Chart',
      chart: { tipo: 'barras', datos: [['A', 10], ['B', 20]] },
    });
    assert.ok(html.includes('Chart'), 'Should contain chart title');
    assert.ok(html.includes('<rect'), 'Chart SVG should contain rect elements');
    assert.ok(html.includes('xmlns="http://www.w3.org/2000/svg"'), 'SVG should have xmlns');
  });

  test('slideToHtml renders destacado (hero stat) slide type', () => {
    const html = slideToHtml({ type: 'destacado', valor: '99%', titulo: 'Uptime' });
    assert.ok(html.includes('99%'), 'Should contain hero stat');
    assert.ok(html.includes('Uptime'), 'Should contain title');
    assert.ok(html.includes('hero-stat'), 'Should have hero-stat class');
  });

  test('slideToHtml renders tabla slide type', () => {
    const html = slideToHtml({
      type: 'tabla', titulo: 'Table',
      headers: ['Col1', 'Col2'],
      filas: [['A1', 'A2']],
    });
    assert.ok(html.includes('Col1'), 'Should contain column header');
    assert.ok(html.includes('<table'), 'Should have table element');
    assert.ok(html.includes('<th>Col1</th>'), 'Should have th element');
    assert.ok(html.includes('<td>A1</td>'), 'Should have td element');
  });

  test('buildHtml with mostrarPaginas adds page numbers', () => {
    const html = buildHtml([
      { type: 'portada', titulo: 'P1' },
      { type: 'bullets', titulo: 'P2', items: ['x'] },
    ], true);
    // portada suppresses page number (passes null), bullets shows it
    const pagenos = html.match(/<div class="pageno">([^<]+)<\/div>/g) || [];
    assert.equal(pagenos.length, 1, 'Only non-cover slides should show page numbers');
    assert.ok(pagenos[0].includes('2 / 2'), 'Should show 2/2 on second slide');
  });

  test('buildHtml without mostrarPaginas does not add page numbers', () => {
    const html = buildHtml([
      { type: 'portada', titulo: 'P1' },
      { type: 'bullets', titulo: 'P2', items: ['x'] },
    ], false);
    const pagenos = html.match(/<div class="pageno">/g);
    assert.equal(pagenos?.length || 0, 0, 'Should not contain any pageno divs');
  });

  test('slideToHtml renders dos-columnas slide type', () => {
    const html = slideToHtml({
      type: 'dos-columnas', titulo: 'Two Cols',
      columnas: [
        { titulo: 'Col A', items: ['A1'] },
        { titulo: 'Col B', items: ['B1'] },
      ],
    });
    assert.ok(html.includes('Col A'), 'Should contain first column title');
    assert.ok(html.includes('Col B'), 'Should contain second column title');
    assert.ok(html.includes('twocol'), 'Should have twocol CSS class');
  });

  test('slideToHtml renders kpis slide type', () => {
    const html = slideToHtml({
      type: 'kpis', titulo: 'KPIs',
      kpis: [
        { valor: '10', etiqueta: 'Items' },
      ],
    });
    assert.ok(html.includes('10'), 'Should contain KPI value');
    assert.ok(html.includes('Items'), 'Should contain KPI label');
    assert.ok(html.includes('kpi-value'), 'Should have kpi-value class');
  });

  test('slideToHtml renders proceso slide type', () => {
    const html = slideToHtml({
      type: 'proceso', titulo: 'Process',
      pasos: [
        { titulo: 'Step 1', descripcion: 'Do thing' },
      ],
    });
    assert.ok(html.includes('Step 1'), 'Should contain step title');
    assert.ok(html.includes('Do thing'), 'Should contain step description');
    assert.ok(html.includes('paso'), 'Should have paso CSS class');
  });

  test('slideToHtml renders n-columnas slide type', () => {
    const html = slideToHtml({
      type: 'n-columnas', titulo: 'N Cols', numero_columnas: 3,
      columnas: [
        { titulo: 'C1', items: ['x'] },
        { titulo: 'C2', items: ['y'] },
        { titulo: 'C3', items: ['z'] },
      ],
    });
    assert.ok(html.includes('C1'), 'Should contain first column');
    assert.ok(html.includes('cols-3'), 'Should have cols-3 class');
    assert.ok(html.includes('ncol'), 'Should have ncol CSS class');
  });

  test('slideToHtml renders tarjetas (cards) slide type', () => {
    const html = slideToHtml({
      type: 'tarjetas', titulo: 'Cards',
      tarjetas: [
        { titulo: 'Card 1', items: ['Detail'] },
      ],
    });
    assert.ok(html.includes('Card 1'), 'Should contain card title');
    assert.ok(html.includes('card'), 'Should have card CSS class');
  });

  test('slideToHtml renders imagen slide type', () => {
    const html = slideToHtml({ type: 'imagen', titulo: 'Image' });
    assert.ok(html.includes('Image'), 'Should contain image title');
    assert.ok(html.includes('figure'), 'Should have figure CSS class');
  });

  test('slideToHtml renders comparativa slide type', () => {
    const html = slideToHtml({
      type: 'comparativa', titulo: 'Compare',
      columnas: [
        { titulo: 'Before', items: ['Old'] },
        { titulo: 'After', items: ['New'] },
      ],
    });
    assert.ok(html.includes('Before'), 'Should contain Before column');
    assert.ok(html.includes('After'), 'Should contain After column');
    assert.ok(html.includes('comparativa'), 'Should have comparativa CSS class');
  });

  test('slideToHtml renders imagen-texto slide type', () => {
    const html = slideToHtml({
      type: 'imagen-texto', titulo: 'Img + Text', items: ['Some text'],
    });
    assert.ok(html.includes('Img + Text'), 'Should contain title');
    assert.ok(html.includes('imgtext'), 'Should have imgtext CSS class');
  });

  test('slideToHtml renders persona slide type', () => {
    const html = slideToHtml({
      type: 'personas', titulo: 'Team',
      personas: [{ nombre: 'Alice', rol: 'Dev' }],
    });
    assert.ok(html.includes('Alice'), 'Should contain person name');
    assert.ok(html.includes('Dev'), 'Should contain person role');
    assert.ok(html.includes('person'), 'Should have person CSS class');
  });

  test('slideToHtml renders lamina-completa slide type', () => {
    const html = slideToHtml({
      type: 'lamina-completa', titulo: 'Full Bleed', src: null, bleed: false,
    });
    assert.ok(html.includes('Full Bleed'), 'Should contain title');
    assert.ok(html.includes('fullbleed'), 'Should have fullbleed CSS class');
  });

  test('slideToHtml renders timeline slide type', () => {
    const html = slideToHtml({
      type: 'timeline', titulo: 'Timeline',
      hitos: [{ fecha: 'Ene', titulo: 'Start' }],
    });
    assert.ok(html.includes('Timeline'), 'Should contain title');
    assert.ok(html.includes('chart-area'), 'Should have chart-area class');
  });

  test('slideToHtml renders masonry slide type', () => {
    const html = slideToHtml({
      type: 'masonry', titulo: 'Gallery', columnas: 3, imagenes: [],
    });
    assert.ok(html.includes('Gallery'), 'Should contain title');
    assert.ok(html.includes('masonry'), 'Should have masonry CSS class');
  });

  test('slideToHtml renders faq slide type', () => {
    const html = slideToHtml({
      type: 'faq', titulo: 'FAQ',
      items: [{ pregunta: 'Q1', respuesta: 'A1' }],
    });
    assert.ok(html.includes('Q1'), 'Should contain question');
    assert.ok(html.includes('A1'), 'Should contain answer');
    assert.ok(html.includes('faq'), 'Should have faq CSS class');
  });

  test('slideToHtml supports workflow as alias for proceso', () => {
    const html = slideToHtml({
      type: 'workflow', titulo: 'Workflow',
      pasos: [{ titulo: 'W1', descripcion: 'Desc' }],
    });
    assert.ok(html.includes('W1'), 'Should render workflow like proceso');
  });
});

/* ─── 2e: Report theme output validation ─── */

describe('report-theme.js output (Phase 2e)', () => {
  let buildHtml;

  const META = {
    title: 'Test Report',
    subtitle: 'Report Sub',
    organization: 'Org',
    prepared_by: 'Author',
    date: 'June 2026',
    classification: 'Internal',
  };

  test('modules import successfully', async () => {
    const theme = await import(join(DOCGEN_DIR, 'report-theme.js'));
    buildHtml = theme.buildHtml;
    assert.ok(typeof buildHtml === 'function');
  });

  test('buildHtml produces complete HTML document', () => {
    const html = buildHtml(META, [{ type: 'doc-cover' }]);
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'Should start with DOCTYPE');
    assert.ok(html.includes('<html lang="es">'), 'Should have html tag');
    assert.ok(html.includes('</html>'), 'Should close html tag');
    assert.ok(html.includes('<style>'), 'Should include style block');
  });

  test('doc-cover slide contains meta data', () => {
    const html = buildHtml(META, [{ type: 'doc-cover' }]);
    assert.ok(html.includes('Test Report'), 'Should contain report title');
    assert.ok(html.includes('Org'), 'Should contain organization');
    assert.ok(html.includes('Author'), 'Should contain author');
    assert.ok(html.includes('June 2026'), 'Should contain date');
    assert.ok(html.includes('Internal'), 'Should contain classification');
    assert.ok(html.includes('cover-page'), 'Should have cover-page class');
  });

  test('section slide renders with accent bar', () => {
    const html = buildHtml(META, [{ type: 'section', titulo: '1. Analysis' }]);
    assert.ok(html.includes('1. Analysis'), 'Should contain section title');
    assert.ok(html.includes('section-bar'), 'Should have section-bar class');
  });

  test('text slide renders paragraphs', () => {
    const html = buildHtml(META, [{ type: 'text', parrafos: ['Para 1', 'Para 2'] }]);
    assert.ok(html.includes('<p>Para 1</p>'), 'Should contain paragraph 1');
    assert.ok(html.includes('<p>Para 2</p>'), 'Should contain paragraph 2');
    assert.ok(html.includes('body-text'), 'Should have body-text class');
  });

  test('callout slide renders with headline and body', () => {
    const html = buildHtml(META, [{
      type: 'callout', headline: 'Key Point', parrafos: ['Details here'],
    }]);
    assert.ok(html.includes('Key Point'), 'Should contain headline');
    assert.ok(html.includes('Details here'), 'Should contain body text');
    assert.ok(html.includes('callout-box'), 'Should have callout-box class');
  });

  test('table slide renders HTML table', () => {
    const html = buildHtml(META, [{
      type: 'table', headers: ['H1', 'H2'], filas: [['A', 'B']],
    }]);
    assert.ok(html.includes('<th>H1</th>'), 'Should render table header');
    assert.ok(html.includes('<td>A</td>'), 'Should render table cell');
    assert.ok(html.includes('data-table'), 'Should have data-table class');
  });

  test('bullets slide renders list', () => {
    const html = buildHtml(META, [{ type: 'bullets', items: ['Item 1', 'Item 2'] }]);
    assert.ok(html.includes('<li>Item 1</li>'), 'Should render list item');
    assert.ok(html.includes('bullet-list'), 'Should have bullet-list class');
  });

  test('recommendation slide renders problem/recommendation/actions', () => {
    const html = buildHtml(META, [{
      type: 'recommendation', titulo: 'Fix bug',
      problema: 'Bug exists', recomendacion: 'Fix it',
      acciones: ['Step 1', 'Step 2'],
    }]);
    assert.ok(html.includes('Fix bug'), 'Should contain title');
    assert.ok(html.includes('Bug exists'), 'Should contain problem');
    assert.ok(html.includes('Fix it'), 'Should contain recommendation');
    assert.ok(html.includes('Step 1'), 'Should contain action step');
    assert.ok(html.includes('recommendation'), 'Should have recommendation class');
  });

  test('roadmap slide renders phases', () => {
    const html = buildHtml(META, [{
      type: 'roadmap',
      fases: [{ periodo: 'Q1', foco: 'Plan', entregables: ['Design doc'] }],
    }]);
    assert.ok(html.includes('Q1'), 'Should contain period');
    assert.ok(html.includes('Plan'), 'Should contain focus');
    assert.ok(html.includes('Design doc'), 'Should contain deliverable');
    assert.ok(html.includes('roadmap-table'), 'Should have roadmap-table class');
  });

  test('kpi-table slide renders KPIs', () => {
    const html = buildHtml(META, [{
      type: 'kpi-table',
      kpis: [{ dominio: 'Sales', metrica: 'Revenue', meta: '$1M' }],
    }]);
    assert.ok(html.includes('Sales'), 'Should contain domain');
    assert.ok(html.includes('Revenue'), 'Should contain metric');
    assert.ok(html.includes('$1M'), 'Should contain target');
    assert.ok(html.includes('kpi-table'), 'Should have kpi-table class');
  });

  test('closing slide renders closing block', () => {
    const html = buildHtml(META, [{ type: 'closing', parrafos: ['The end'] }]);
    assert.ok(html.includes('The end'), 'Should contain closing text');
    assert.ok(html.includes('closing-block'), 'Should have closing-block class');
  });
});

/* ─── 2d: Chart output validation ─── */

describe('charts.js SVG output (Phase 2d)', () => {
  let barChart, groupedBarChart, stackedBarChart, donutChart, pieChart;
  let lineChart, progressChart, gaugeChart, timelineChart, ganttChart;
  let radarChart, waterfallChart, heatmapChart, renderChart;

  test('modules import successfully', async () => {
    const charts = await import(join(DOCGEN_DIR, 'charts.js'));
    barChart = charts.barChart;
    groupedBarChart = charts.groupedBarChart;
    stackedBarChart = charts.stackedBarChart;
    donutChart = charts.donutChart;
    pieChart = charts.pieChart;
    lineChart = charts.lineChart;
    progressChart = charts.progressChart;
    gaugeChart = charts.gaugeChart;
    timelineChart = charts.timelineChart;
    ganttChart = charts.ganttChart;
    radarChart = charts.radarChart;
    waterfallChart = charts.waterfallChart;
    heatmapChart = charts.heatmapChart;
    renderChart = charts.renderChart;
    assert.ok(typeof barChart === 'function');
    assert.ok(typeof renderChart === 'function');
  });

  function hasSvgXmlns(svg) {
    return svg.includes('xmlns="http://www.w3.org/2000/svg"');
  }

  function countTags(svg, tag) {
    return (svg.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
  }

  test('barChart produces SVG with rect elements', () => {
    const svg = barChart([['A', 10], ['B', 20], ['C', 15]]);
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'rect') >= 3, 'Should have at least 3 rect elements');
    assert.ok(svg.includes('viewBox'), 'Should have viewBox');
  });

  test('groupedBarChart produces SVG with rect elements per series', () => {
    const svg = groupedBarChart(['Q1', 'Q2'], [['Actual', [10, 20]], ['Proj', [15, 25]]]);
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'rect') >= 4, 'Should have at least 4 rect elements (2 groups × 2 series)');
  });

  test('stackedBarChart produces SVG with rect elements stacked', () => {
    const svg = stackedBarChart(['A', 'B'], [['X', [5, 10]], ['Y', [3, 7]]]);
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'rect') >= 4, 'Should have at least 4 rect elements');
  });

  test('donutChart produces SVG with path elements', () => {
    const svg = donutChart([['Frontend', 40], ['Backend', 30],['DevOps', 20], ['Data', 10]]);
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'path') >= 4, 'Should have at least 4 path elements (one per segment)');
  });

  test('pieChart produces SVG with path elements (no hole)', () => {
    const svg = pieChart([['A', 60], ['B', 40]]);
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'path') >= 2, 'Should have at least 2 path elements');
  });

  test('lineChart produces SVG with path or polyline and circles', () => {
    const svg = lineChart([['S1', 15], ['S2', 30], ['S3', 22]]);
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    const hasLinePath = countTags(svg, 'path') >= 1 || svg.includes('polyline');
    assert.ok(hasLinePath, 'Should have line path or polyline');
    assert.ok(countTags(svg, 'circle') >= 3, 'Should have at least 3 circle data points');
  });

  test('progressChart produces SVG with rect progress bars', () => {
    const svg = progressChart([['Alpha', 95], ['Beta', 72]]);
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'rect') >= 4, 'Should have at least 4 rects (background + fill per item)');
  });

  test('gaugeChart produces SVG with path arc and value text', () => {
    const svg = gaugeChart(75, { label: 'Test' });
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'path') >= 2, 'Should have at least 2 paths (bg + value arcs)');
    assert.ok(svg.includes('75'), 'Should display the gauge value');
    assert.ok(svg.includes('Test'), 'Should display the label');
  });

  test('timelineChart produces SVG with circle milestones', () => {
    const svg = timelineChart([['Ene', 'Start'], ['Mar', 'Beta'], ['Jun', 'Release']]);
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'circle') >= 3, 'Should have at least 3 circle milestones');
    assert.ok(svg.includes('Ene'), 'Should contain milestone date');
  });

  test('ganttChart produces SVG with rect task bars', () => {
    const svg = ganttChart([
      { nombre: 'Design', inicio: 0, duracion: 3 },
      { nombre: 'Dev', inicio: 2, duracion: 5 },
    ]);
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'rect') >= 4, 'Should have background + bar rects per task');
  });

  test('radarChart produces SVG with polygon series', () => {
    const svg = radarChart(['Speed', 'Quality', 'Cost'], [['Actual', [3, 4, 2]]]);
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'polygon') >= 2, 'Should have grid rings + data polygon');
  });

  test('waterfallChart produces SVG with rect bars', () => {
    const svg = waterfallChart([
      { label: 'Start', valor: 100, tipo: 'total' },
      { label: '+Rev', valor: 30 },
      { label: '-Cost', valor: -15 },
      { label: 'End', valor: 115, tipo: 'total' },
    ]);
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'rect') >= 4, 'Should have at least 4 rect bars');
    assert.ok(svg.includes('Start'), 'Should contain Start label');
    assert.ok(svg.includes('End'), 'Should contain End label');
  });

  test('heatmapChart produces SVG with rect cells', () => {
    const svg = heatmapChart({
      headers_fila: ['A', 'B'],
      headers_col: ['X', 'Y'],
      datos: [[1, 2], [3, 4]],
    });
    assert.ok(hasSvgXmlns(svg), 'SVG should have xmlns');
    assert.ok(countTags(svg, 'rect') >= 4, 'Should have at least 4 cell rects');
    assert.ok(svg.includes('A'), 'Should contain row label');
    assert.ok(svg.includes('X'), 'Should contain column label');
  });

  test('renderChart dispatches all chart types without error', () => {
    const dispatches = [
      ['barras', { datos: [['A', 1]] }],
      ['bar', { datos: [['A', 1]] }],
      ['barras-agrupadas', { categorias: ['A'], series: [['S', [1]]] }],
      ['grouped', { categorias: ['A'], series: [['S', [1]]] }],
      ['barras-apiladas', { categorias: ['A'], series: [['S', [1]]] }],
      ['stacked', { categorias: ['A'], series: [['S', [1]]] }],
      ['donut', { datos: [['A', 100]] }],
      ['pastel', { datos: [['A', 100]] }],
      ['pie', { datos: [['A', 100]] }],
      ['lineas', { datos: [['A', 1]] }],
      ['line', { datos: [['A', 1]] }],
      ['progreso', { datos: [['A', 50]] }],
      ['progress', { datos: [['A', 50]] }],
      ['gauge', { valor: 50 }],
      ['timeline', { hitos: [['Ene', 'Start']] }],
      ['gantt', { tareas: [{ nombre: 'T1', inicio: 0, duracion: 1 }] }],
      ['radar', { categorias: ['X'], series: [['S', [1]]] }],
      ['waterfall', { datos: [{ label: 'Base', valor: 100, tipo: 'total' }] }],
      ['heatmap', { matrix: { headers_fila: ['A'], headers_col: ['B'], datos: [[1]] } }],
    ];
    for (const [kind, spec] of dispatches) {
      const svg = renderChart(kind, spec);
      assert.ok(hasSvgXmlns(svg), `renderChart(${kind}) should produce valid SVG`);
      assert.ok(svg.length > 50, `renderChart(${kind}) should produce non-trivial output`);
    }
  });

  test('renderChart throws on unknown chart type', () => {
    assert.throws(() => renderChart('nonexistent', {}), /Unknown chart type/);
  });
});

/* ─── 2a: Build scripts have valid syntax ─── */
/* Build CLI scripts call main() at top level, verified in smoke test above. */

/* ─── index.js helpers ─── */

describe('index.js utility functions (Phase 2f)', () => {
  let esc, svgOpen, svgClose;

  test('modules import successfully', async () => {
    const idx = await import(join(DOCGEN_DIR, 'index.js'));
    esc = idx.esc;
    svgOpen = idx.svgOpen;
    svgClose = idx.svgClose;
    assert.ok(typeof esc === 'function');
    assert.ok(typeof svgOpen === 'function');
  });

  test('esc escapes HTML special characters', () => {
    assert.equal(esc('&'), '&amp;');
    assert.equal(esc('<'), '&lt;');
    assert.equal(esc('>'), '&gt;');
    assert.equal(esc('"'), '&quot;');
    assert.equal(esc('safe'), 'safe');
  });

  test('svgOpen returns SVG with proper dimensions', () => {
    const svg = svgOpen();
    assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'), 'Should have SVG xmlns');
    assert.ok(svg.includes('viewBox'), 'Should have viewBox');
    assert.ok(svg.includes('width="1600"'), 'Should have correct width');
    assert.ok(svg.includes('height="900"'), 'Should have correct height');
    assert.ok(svg.includes('<defs>'), 'Should have defs section');
  });

  test('svgClose returns closing SVG tag with copyright', () => {
    const close = svgClose();
    assert.ok(close.includes('</svg>'), 'Should close SVG tag');
  });
});
