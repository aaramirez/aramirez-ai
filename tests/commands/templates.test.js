/**
 * tests/commands/templates.test.js — Template spec validation
 *
 * Groups:
 *   A — Existence + valid JSON (28 tests)
 *   B — Schema by builder type (28 tests)
 *   C — All slide types exist (1 test)
 *   D — All chart types exist (1 test)
 *   E — Build smoke test (27 tests — excludes exec-dashboard)
 *   F — Required fields per slide type (1+ tests)
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const SPECS_DIR = join(REPO_ROOT, 'assets', 'templates', 'specs');

const DECK_TYPES = ['portada','seccion','bullets','dos-columnas','tarjetas','kpis','personas','cita','imagen','tabla','lamina-completa','grafico','imagen-texto','destacado','comparativa','timeline','n-columnas','proceso','workflow','masonry','faq'];
const REPORT_TYPES = ['doc-cover','section','text','callout','table','bullets','recommendation','roadmap','kpi-table','closing','change-log','conventions-table','endpoint-summary','endpoint-detail','page-break','code-block','http-codes'];
const CHART_TYPES = ['barras','bar','barras-agrupadas','grouped','barras-apiladas','stacked','donut','pastel','pie','lineas','line','progreso','progress','gauge','timeline','gantt','radar','waterfall','heatmap'];

function readSpec(name) {
  const path = join(SPECS_DIR, name);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function specInfo(name) {
  const base = name.replace('.json', '');
  if (name === 'exec-dashboard.json') return { builder: 'deck' };
  if (name === 'weekly-status.json') return { builder: 'report' };
  if (name === 'adr.json') return { builder: 'report' };
  const reportSuffixes = ['report','sow','charter','decision-log','postmortem','test-report','minutes'];
  const isReport = reportSuffixes.some(s => base.endsWith(s));
  return { builder: isReport ? 'report' : 'deck' };
}

const ALL_SPECS = [
  'weekly-status.json', 'weekly-status-deck.json',
  'sprint-review.json', 'sprint-review-report.json',
  'sprint-planning.json', 'sprint-planning-report.json',
  'project-status.json', 'project-status-report.json',
  'release-notes.json', 'release-notes-report.json',
  'tech-design.json', 'tech-design-report.json',
  'adr.json', 'adr-deck.json',
  'api-specs.json', 'api-specs-report.json',
  'system-architecture.json', 'system-architecture-report.json',
  'deployment-runbook.json', 'deployment-runbook-report.json',
  'sow.json', 'project-charter.json', 'decision-log.json',
  'incident-postmortem.json', 'test-report.json',
  'exec-dashboard.json', 'team-overview.json', 'meeting-minutes.json',
];

const DECK_SPECS = ALL_SPECS.filter(s => specInfo(s).builder === 'deck');
const REPORT_SPECS = ALL_SPECS.filter(s => specInfo(s).builder === 'report');
const IMAGE_SPECS = ALL_SPECS.filter(s => specInfo(s).builder === 'image');

/* ─── Group A: Existence + valid JSON ─── */

describe('templates — Group A: existence & valid JSON', () => {
  for (const name of ALL_SPECS) {
    test(`${name} existe y es JSON válido`, () => {
      const path = join(SPECS_DIR, name);
      assert.ok(existsSync(path), `Expected file: ${path}`);
      const raw = readFileSync(path, 'utf8');
      assert.doesNotThrow(() => JSON.parse(raw), `${name} no es JSON válido`);
    });
  }
});

/* ─── Group B: Schema by builder type ─── */

describe('templates — Group B: schema by builder type', () => {
  for (const name of DECK_SPECS) {
    test(`${name} es un deck válido`, () => {
      const spec = readSpec(name);
      assert.ok(spec, `${name} no se pudo leer`);
      assert.ok(Array.isArray(spec.slides), `deck ${name} debe tener slides[]`);
      assert.ok(spec.slides.length > 0, `deck ${name} debe tener al menos 1 slide`);
      for (const s of spec.slides) {
        assert.ok(s.type, `slide en ${name} debe tener type`);
        assert.ok(DECK_TYPES.includes(s.type), `slide type "${s.type}" en ${name} no es un tipo de deck válido`);
      }
    });
  }

  for (const name of REPORT_SPECS) {
    test(`${name} es un report válido`, () => {
      const spec = readSpec(name);
      assert.ok(spec, `${name} no se pudo leer`);
      assert.ok(spec.meta, `report ${name} debe tener meta`);
      assert.ok(spec.meta.title, `report ${name} meta debe tener title`);
      assert.ok(Array.isArray(spec.slides), `report ${name} debe tener slides[]`);
      assert.ok(spec.slides.length > 0, `report ${name} debe tener al menos 1 slide`);
      for (const s of spec.slides) {
        assert.ok(s.type, `slide en ${name} debe tener type`);
        if (s.type !== 'doc-cover') {
          assert.ok(REPORT_TYPES.includes(s.type), `slide type "${s.type}" en ${name} no es un tipo de report válido`);
        }
      }
    });
  }

  for (const name of IMAGE_SPECS) {
    test(`${name} es una image válida`, () => {
      const spec = readSpec(name);
      assert.ok(spec, `${name} no se pudo leer`);
      assert.ok(Array.isArray(spec.slides), `image ${name} debe tener slides[]`);
      assert.equal(spec.slides.length, 1, `image ${name} debe tener exactamente 1 slide`);
    });
  }
});

/* ─── Group C: All slide types exist ─── */

describe('templates — Group C: slide types exist in pipeline', () => {
  test('todos los tipos de slide existen en _LAYOUTS ∪ _RENDERERS', async () => {
    const htmlTheme = await import(join(REPO_ROOT, 'shared/skills/document-generation/scripts/docgen/html-theme.js'));
    const reportTheme = await import(join(REPO_ROOT, 'shared/skills/document-generation/scripts/docgen/report-theme.js'));

    const deckTypes = new Set();
    const reportTypes = new Set();

    for (const name of DECK_SPECS) {
      const spec = readSpec(name);
      if (!spec) continue;
      for (const s of spec.slides) {
        if (s.type) deckTypes.add(s.type);
      }
    }

    for (const name of REPORT_SPECS) {
      const spec = readSpec(name);
      if (!spec) continue;
      for (const s of spec.slides) {
        if (s.type && s.type !== 'doc-cover') reportTypes.add(s.type);
      }
    }

    for (const t of deckTypes) {
      assert.doesNotThrow(() => {
        const slide = { type: t, titulo: 'test' };
        if (t === 'grafico') slide.chart = { tipo: 'bar', datos: [['A',1]] };
        htmlTheme.slideToHtml(slide);
      }, `Deck slide type "${t}" no se encontró en _LAYOUTS`);
    }

    for (const t of reportTypes) {
      assert.doesNotThrow(() => {
        reportTheme.buildHtml({ title: 'test' }, [{ type: t, titulo: 'test' }]);
      }, `Report slide type "${t}" no se encontró en _RENDERERS`);
    }
  });
});

/* ─── Group D: All chart types exist ─── */

describe('templates — Group D: chart types exist', () => {
  test('todos los chart.tipo existen en renderChart', async () => {
    const charts = await import(join(REPO_ROOT, 'shared/skills/document-generation/scripts/docgen/charts.js'));
    const usedChartTypes = new Set();

    for (const name of ALL_SPECS) {
      if (name === 'exec-dashboard.json') continue;
      const spec = readSpec(name);
      if (!spec) continue;
      for (const s of spec.slides) {
        if (s.chart && s.chart.tipo) {
          usedChartTypes.add(s.chart.tipo);
        }
      }
    }

    for (const t of usedChartTypes) {
      assert.doesNotThrow(() => {
        const sampleData = t === 'gantt'
          ? { tareas: [{ nombre: 'Task', inicio: 0, duracion: 3 }] }
          : t === 'radar'
            ? { categorias: ['A','B'], series: [['S1',[1,2]]] }
            : t === 'gauge'
              ? { valor: 75 }
              : t === 'timeline'
                ? { hitos: [['Ene','Start'],['Feb','End']] }
                : t === 'heatmap'
                  ? { matrix: { headers_fila: ['R1'], headers_col: ['C1'], datos: [[5]] } }
                  : t === 'barras-agrupadas' || t === 'grouped' || t === 'barras-apiladas' || t === 'stacked'
                    ? { categorias: ['A','B'], series: [['S1',[1,2]]] }
                    : t === 'waterfall'
                      ? { datos: [{ label: 'Base', valor: 100 }, { label: 'Total', valor: 107, tipo: 'total' }] }
                      : { datos: [['A',1],['B',2]] };
        charts.renderChart(t, sampleData);
      }, `chart type "${t}" no se encontró en renderChart`);
    }
  });
});

/* ─── Group E: Build smoke test ─── */

describe('templates — Group E: build smoke test', () => {
  for (const name of DECK_SPECS) {
    test(`${name} se buildea a HTML sin error`, async () => {
      const spec = readSpec(name);
      if (!spec) return;
      const theme = await import(join(REPO_ROOT, 'shared/skills/document-generation/scripts/docgen/html-theme.js'));
      const html = theme.buildHtml(spec.slides, spec.mostrar_paginas || false);
      assert.ok(html.startsWith('<!DOCTYPE html>'), `${name}: HTML debe empezar con DOCTYPE`);
      assert.ok(html.includes('<html'), `${name}: HTML debe tener <html>`);
      assert.ok(html.includes('</html>'), `${name}: HTML debe tener </html>`);
    });
  }

  for (const name of REPORT_SPECS) {
    test(`${name} se buildea a HTML sin error`, async () => {
      const spec = readSpec(name);
      if (!spec) return;
      const theme = await import(join(REPO_ROOT, 'shared/skills/document-generation/scripts/docgen/report-theme.js'));
      const html = theme.buildHtml(spec.meta, spec.slides);
      assert.ok(html.startsWith('<!DOCTYPE html>'), `${name}: HTML debe empezar con DOCTYPE`);
      assert.ok(html.includes('<html'), `${name}: HTML debe tener <html>`);
      assert.ok(html.includes('</html>'), `${name}: HTML debe tener </html>`);
    });
  }
});

/* ─── Group F: Required fields per slide type ─── */

describe('templates — Group F: required fields per slide type', () => {
  function allSlides() {
    const slides = [];
    for (const name of ALL_SPECS) {
      if (name === 'exec-dashboard.json') continue;
      const spec = readSpec(name);
      if (!spec) continue;
      for (const s of spec.slides) {
        slides.push({ ...s, _spec: name });
      }
    }
    return slides;
  }

  const slides = allSlides();

  test('portada requiere titulo y subtitulo', () => {
    const matched = slides.filter(s => s.type === 'portada');
    for (const s of matched) {
      assert.ok(s.titulo, `portada en ${s._spec} requiere titulo`);
      assert.ok(s.subtitulo, `portada en ${s._spec} requiere subtitulo`);
    }
  });

  test('bullets requiere items[]', () => {
    const matched = slides.filter(s => s.type === 'bullets');
    for (const s of matched) {
      assert.ok(Array.isArray(s.items), `bullets en ${s._spec} requiere items[]`);
      assert.ok(s.items.length > 0, `bullets en ${s._spec} debe tener al menos 1 item`);
    }
  });

  test('kpis requiere kpis[]', () => {
    const matched = slides.filter(s => s.type === 'kpis');
    for (const s of matched) {
      assert.ok(Array.isArray(s.kpis), `kpis en ${s._spec} requiere kpis[]`);
    }
  });

  test('grafico requiere chart.tipo', () => {
    const matched = slides.filter(s => s.type === 'grafico');
    for (const s of matched) {
      assert.ok(s.chart, `grafico en ${s._spec} requiere chart`);
      assert.ok(s.chart.tipo, `grafico en ${s._spec} requiere chart.tipo`);
    }
  });

  test('cita requiere texto', () => {
    const matched = slides.filter(s => s.type === 'cita');
    for (const s of matched) {
      assert.ok(s.texto, `cita en ${s._spec} requiere texto`);
    }
  });

  test('tabla requiere headers[] y filas[]', () => {
    const matched = slides.filter(s => s.type === 'tabla');
    for (const s of matched) {
      assert.ok(Array.isArray(s.headers), `tabla en ${s._spec} requiere headers[]`);
      assert.ok(Array.isArray(s.filas), `tabla en ${s._spec} requiere filas[]`);
    }
  });

  test('seccion requiere titulo e indice', () => {
    const matched = slides.filter(s => s.type === 'seccion');
    for (const s of matched) {
      assert.ok(s.titulo, `seccion en ${s._spec} requiere titulo`);
      assert.ok(s.indice, `seccion en ${s._spec} requiere indice`);
    }
  });

  test('destacado requiere valor', () => {
    const matched = slides.filter(s => s.type === 'destacado');
    for (const s of matched) {
      assert.ok(s.valor, `destacado en ${s._spec} requiere valor`);
    }
  });

  test('recommendation requiere titulo, problema, recomendacion, acciones[]', () => {
    const matched = slides.filter(s => s.type === 'recommendation');
    for (const s of matched) {
      assert.ok(s.titulo, `recommendation en ${s._spec} requiere titulo`);
      assert.ok(s.problema, `recommendation en ${s._spec} requiere problema`);
      assert.ok(s.recomendacion, `recommendation en ${s._spec} requiere recomendacion`);
      assert.ok(Array.isArray(s.acciones), `recommendation en ${s._spec} requiere acciones[]`);
    }
  });

  test('roadmap requiere fases[]', () => {
    const matched = slides.filter(s => s.type === 'roadmap');
    for (const s of matched) {
      assert.ok(Array.isArray(s.fases), `roadmap en ${s._spec} requiere fases[]`);
      assert.ok(s.fases.length > 0, `roadmap en ${s._spec} debe tener al menos 1 fase`);
    }
  });

  test('kpi-table requiere kpis[]', () => {
    const matched = slides.filter(s => s.type === 'kpi-table');
    for (const s of matched) {
      assert.ok(Array.isArray(s.kpis), `kpi-table en ${s._spec} requiere kpis[]`);
    }
  });

  test('text requiere parrafos[]', () => {
    const matched = slides.filter(s => s.type === 'text');
    for (const s of matched) {
      assert.ok(Array.isArray(s.parrafos), `text en ${s._spec} requiere parrafos[]`);
    }
  });

  test('callout requiere headline y parrafos[]', () => {
    const matched = slides.filter(s => s.type === 'callout');
    for (const s of matched) {
      assert.ok(s.headline, `callout en ${s._spec} requiere headline`);
      assert.ok(Array.isArray(s.parrafos), `callout en ${s._spec} requiere parrafos[]`);
    }
  });

  test('dos-columnas requiere columnas[]', () => {
    const matched = slides.filter(s => s.type === 'dos-columnas');
    for (const s of matched) {
      assert.ok(Array.isArray(s.columnas), `dos-columnas en ${s._spec} requiere columnas[]`);
    }
  });

  test('tarjetas requiere tarjetas[]', () => {
    const matched = slides.filter(s => s.type === 'tarjetas');
    for (const s of matched) {
      assert.ok(Array.isArray(s.tarjetas), `tarjetas en ${s._spec} requiere tarjetas[]`);
    }
  });

  test('timeline (slide) requiere hitos[]', () => {
    const matched = slides.filter(s => s.type === 'timeline');
    for (const s of matched) {
      assert.ok(Array.isArray(s.hitos), `timeline en ${s._spec} requiere hitos[]`);
    }
  });

  test('proceso/workflow requiere pasos[]', () => {
    const matched = slides.filter(s => s.type === 'proceso' || s.type === 'workflow');
    for (const s of matched) {
      assert.ok(Array.isArray(s.pasos), `${s.type} en ${s._spec} requiere pasos[]`);
    }
  });

  test('n-columnas requiere columnas[]', () => {
    const matched = slides.filter(s => s.type === 'n-columnas');
    for (const s of matched) {
      assert.ok(Array.isArray(s.columnas), `n-columnas en ${s._spec} requiere columnas[]`);
    }
  });
});
