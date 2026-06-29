/**
 * tests/commands/components.test.js — Unit tests for docgen components
 *
 * TDD phases 1-18 covering theme-utils.js and components.js.
 * Pure string-output tests — no DOM, no browser needed.
 */

import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const DOCGEN_DIR = join(REPO_ROOT, 'shared', 'scripts', 'docgen');

let themeUtils, components, indexModule;

before(async () => {
  themeUtils = await import(join(DOCGEN_DIR, 'theme-utils.js'));
  components = await import(join(DOCGEN_DIR, 'components.js'));
  indexModule = await import(join(DOCGEN_DIR, 'index.js'));
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 1: theme-utils — esc()
   ═══════════════════════════════════════════════════════════════════ */

describe('theme-utils — esc()', () => {
  test('escapa & < > " \'', () => {
    const { esc } = themeUtils;
    assert.equal(esc('&'), '&amp;');
    assert.equal(esc('<'), '&lt;');
    assert.equal(esc('>'), '&gt;');
    assert.equal(esc('"'), '&quot;');
    assert.equal(esc("'"), '&#39;');
  });

  test('texto sin especiales pasa intacto', () => {
    const { esc } = themeUtils;
    assert.equal(esc('hola mundo'), 'hola mundo');
    assert.equal(esc('123'), '123');
    assert.equal(esc(''), '');
  });

  test('combina todos los reemplazos', () => {
    const { esc } = themeUtils;
    assert.equal(esc('&<>"\''), '&amp;&lt;&gt;&quot;&#39;');
  });

  test('coerce tipos no-string', () => {
    const { esc } = themeUtils;
    assert.equal(esc(0), '0');
    assert.equal(esc(null), 'null');
    assert.equal(esc(undefined), 'undefined');
    assert.equal(esc(true), 'true');
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 2: theme-utils — imageDataUri()
   ═══════════════════════════════════════════════════════════════════ */

describe('theme-utils — imageDataUri()', () => {
  test('path null retorna null', () => {
    assert.equal(themeUtils.imageDataUri(null), null);
  });

  test('path vacío retorna null', () => {
    assert.equal(themeUtils.imageDataUri(''), null);
  });

  test('archivo inexistente retorna null', () => {
    assert.equal(themeUtils.imageDataUri('/no/existe/file.svg'), null);
  });

  test('archivo existente retorna data URI', () => {
    const b = indexModule.brand();
    if (b.logo) {
      const uri = themeUtils.imageDataUri(b.logo);
      assert.ok(uri.startsWith('data:'), 'Debe empezar con data:');
      assert.ok(uri.includes('base64,'), 'Debe contener base64');
      assert.ok(uri.includes('image/'), 'Debe contener tipo MIME');
    }
  });

  test('extensión .JPG mayúscula no crashea', () => {
    assert.equal(themeUtils.imageDataUri('/tmp/test.JPG'), null);
  });

  test('extensión desconocida retorna null', () => {
    assert.equal(themeUtils.imageDataUri('/tmp/archivo.xyz'), null);
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 3: theme-utils — logoHref()
   ═══════════════════════════════════════════════════════════════════ */

describe('theme-utils — logoHref()', () => {
  test('blue retorna data URI cuando existe', () => {
    const b = indexModule.brand();
    if (b.logo) {
      const uri = themeUtils.logoHref('blue');
      assert.ok(uri.startsWith('data:'));
      assert.ok(uri.includes('base64,'));
    }
  });

  test('white retorna string', () => {
    assert.equal(typeof themeUtils.logoHref('white'), 'string');
  });

  test('default variant es blue', () => {
    assert.equal(typeof themeUtils.logoHref(), 'string');
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 4: theme-utils — brandCss()
   ═══════════════════════════════════════════════════════════════════ */

describe('theme-utils — brandCss()', () => {
  test('deck genera :root con vars específicas', () => {
    const css = themeUtils.brandCss('deck');
    assert.ok(css.startsWith(':root {'));
    assert.ok(css.includes('--ink'));
    assert.ok(css.includes('--bg-1'));
    assert.ok(css.includes('--card'));
    assert.ok(css.includes('--accent-soft'));
    assert.ok(css.includes('--muted'), 'deck debe tener --muted');
    assert.ok(!css.includes('--bg:'), 'deck no debe tener --bg');
  });

  test('report genera :root con vars específicas', () => {
    const css = themeUtils.brandCss('report');
    assert.ok(css.includes('--muted'));
    assert.ok(css.includes('--bg'));
    assert.ok(css.includes('--bg-soft'));
    assert.ok(!css.includes('--bg-1'), 'report no debe tener --bg-1');
    assert.ok(!css.includes('--card'), 'report no debe tener --card');
  });

  test('tipo inválido lanza Error', () => {
    assert.throws(() => themeUtils.brandCss('invalid'), /brand CSS type/);
  });

  test('colores corresponden a brand.json', () => {
    const b = indexModule.brand();
    const css = themeUtils.brandCss('deck');
    assert.ok(css.includes(b.colors.primary));
    assert.ok(css.includes(b.colors.background));
  });

  test('incluye variables de fuente', () => {
    const css = themeUtils.brandCss('deck');
    assert.ok(css.includes('--font-heading'));
    assert.ok(css.includes('--font-body'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 5: components — bullets()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — bullets()', () => {
  test('lista vacía retorna <ul> vacío', () => {
    assert.equal(components.bullets([]), '<ul class="bullet-list"></ul>');
  });

  test('items se renderizan como <li> escapados', () => {
    const html = components.bullets(['a & b', 'c']);
    assert.ok(html.includes('<li>a &amp; b</li>'));
    assert.ok(html.includes('<li>c</li>'));
  });

  test('className override funciona', () => {
    const html = components.bullets(['x'], 'bullets');
    assert.ok(html.startsWith('<ul class="bullets">'));
  });

  test('sin items retorna <ul> vacío', () => {
    assert.equal(components.bullets(), '<ul class="bullet-list"></ul>');
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 6: components — tableV()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — tableV()', () => {
  test('headers y rows generan <table> completa', () => {
    const html = components.tableV(['A', 'B'], [['1', '2'], ['3', '4']]);
    assert.ok(html.includes('<table'));
    assert.ok(html.includes('<th>A</th><th>B</th>'));
    assert.ok(html.includes('<td>1</td><td>2</td>'));
    assert.ok(html.includes('<td>3</td><td>4</td>'));
  });

  test('className override: fibex', () => {
    const html = components.tableV(['A'], [['1']], 'fibex');
    assert.ok(html.includes('class="fibex"'));
  });

  test('datos escapados en celdas', () => {
    const html = components.tableV(['<h1>'], [['<script>']]);
    assert.ok(html.includes('&lt;h1&gt;'));
    assert.ok(html.includes('&lt;script&gt;'));
  });

  test('default className es data-table', () => {
    const html = components.tableV(['A'], [['1']]);
    assert.ok(html.includes('class="data-table"'));
  });

  test('headers vacío genera thead vacío', () => {
    const html = components.tableV([], []);
    assert.ok(html.includes('<thead><tr></tr></thead>'));
    assert.ok(html.includes('<tbody></tbody>'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 7: components — head()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — head()', () => {
  test('título + subtítulo + eyebrow', () => {
    const html = components.head('Título', 'Subtítulo', 'Eyebrow');
    assert.ok(html.includes('<h1>Título</h1>'));
    assert.ok(html.includes('<div class="sub">Subtítulo</div>'));
    assert.ok(html.includes('<span class="eyebrow">Eyebrow</span>'));
  });

  test('solo título', () => {
    const html = components.head('Solo');
    assert.ok(html.includes('<h1>Solo</h1>'));
    assert.ok(!html.includes('class="sub"'));
    assert.ok(!html.includes('eyebrow'));
  });

  test('sin parámetros no crashea', () => {
    const html = components.head();
    assert.ok(html.includes('<div class="head">'));
  });

  test('subtítulo vacío no se renderiza', () => {
    const html = components.head('T', '');
    assert.ok(!html.includes('class="sub"'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 8: components — sectionBlock()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — sectionBlock()', () => {
  test('título + subtítulo', () => {
    const html = components.sectionBlock('Título', 'Subtítulo');
    assert.ok(html.includes('<h2>Título</h2>'));
    assert.ok(html.includes('<div class="section-sub">Subtítulo</div>'));
    assert.ok(html.includes('section-bar'));
  });

  test('solo título', () => {
    const html = components.sectionBlock('Solo');
    assert.ok(html.includes('<h2>Solo</h2>'));
    assert.ok(!html.includes('section-sub'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 9: components — kpi()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — kpi()', () => {
  test('valor y etiqueta', () => {
    const html = components.kpi('99%', 'Uptime');
    assert.ok(html.includes('kpi-value">99%</div>'));
    assert.ok(html.includes('kpi-label">Uptime</div>'));
  });

  test('valores vacíos', () => {
    const html = components.kpi();
    assert.ok(html.includes('kpi-value"></div>'));
    assert.ok(html.includes('kpi-label"></div>'));
  });

  test('escapa caracteres', () => {
    const html = components.kpi('<100>', 'a & b');
    assert.ok(html.includes('&lt;100&gt;'));
    assert.ok(html.includes('a &amp; b'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 10: components — person()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — person()', () => {
  test('nombre y rol', () => {
    const html = components.person({ nombre: 'Alice', rol: 'Dev' });
    assert.ok(html.includes('pname">Alice</div>'));
    assert.ok(html.includes('prole">Dev</div>'));
  });

  test('iniciales de dos palabras', () => {
    const html = components.person({ nombre: 'John Doe' });
    assert.ok(html.includes('JD'));
  });

  test('iniciales de una palabra', () => {
    const html = components.person({ nombre: 'Admin' });
    assert.ok(html.includes('AD'));
  });

  test('nombre vacío retorna ?', () => {
    const html = components.person({ nombre: '' });
    assert.ok(html.includes('?'));
  });

  test('avatar texto override', () => {
    const html = components.person({ nombre: 'Alice', avatar: 'A' });
    assert.ok(html.includes('>A<'));
  });

  test('sin parámetros no crashea', () => {
    const html = components.person();
    assert.ok(html.includes('person'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 11: components — card()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — card()', () => {
  test('título e items', () => {
    const html = components.card({ titulo: 'Card', items: ['A', 'B'] });
    assert.ok(html.includes('<h3>Card</h3>'));
    assert.ok(html.includes('<li>A</li>'));
    assert.ok(html.includes('<li>B</li>'));
  });

  test('subtítulo e icono', () => {
    const html = components.card({ titulo: 'T', subtitulo: 'Sub', icon: '\u2B50' });
    assert.ok(html.includes('card-sub">Sub</div>'));
    assert.ok(html.includes('card-icon">\u2B50</div>'));
  });

  test('sin items no renderiza <ul>', () => {
    const html = components.card({ titulo: 'T' });
    assert.ok(!html.includes('<ul>'));
  });

  test('accentTop=false sin banner e icono', () => {
    const html = components.card({ titulo: 'T', accentTop: false });
    assert.ok(!html.includes('accent-top'));
  });

  test('sin parámetros no crashea', () => {
    const html = components.card();
    assert.ok(html.includes('<div class="card">'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 12: components — panel()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — panel()', () => {
  test('título e items', () => {
    const html = components.panel({ titulo: 'Panel', items: ['X', 'Y'] });
    assert.ok(html.includes('<h3>Panel</h3>'));
    assert.ok(html.includes('<li>X</li>'));
  });

  test('tag opcional', () => {
    const html = components.panel({ titulo: 'T', tag: 'NEW' });
    assert.ok(html.includes('panel-tag">NEW</span>'));
  });

  test('sin parámetros no crashea', () => {
    const html = components.panel();
    assert.ok(html.includes('<div class="panel">'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 13: components — callout()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — callout()', () => {
  test('headline y párrafos', () => {
    const html = components.callout('Nota', ['Párrafo 1', 'Párrafo 2']);
    assert.ok(html.includes('callout-headline">Nota</div>'));
    assert.ok(html.includes('<p>Párrafo 1</p>'));
    assert.ok(html.includes('<p>Párrafo 2</p>'));
  });

  test('string en vez de array', () => {
    const html = components.callout('Head', 'Texto simple');
    assert.ok(html.includes('<p>Texto simple</p>'));
  });

  test('sin parámetros no crashea', () => {
    const html = components.callout();
    assert.ok(html.includes('callout-box'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 14: components — recommendation()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — recommendation()', () => {
  test('titulo, problema, recomendacion, acciones', () => {
    const html = components.recommendation({
      titulo: 'Mejora',
      problema: 'Latencia alta',
      recomendacion: 'Migrar a CDN',
      acciones: ['Acción 1', 'Acción 2'],
    });
    assert.ok(html.includes('<h3>Mejora</h3>'));
    assert.ok(html.includes('Problema:</strong> Latencia alta'));
    assert.ok(html.includes('Recomendación:</strong> Migrar a CDN'));
    assert.ok(html.includes('<li>Acción 1</li>'));
  });

  test('campos ingleses (problem/recommendation/actions)', () => {
    const html = components.recommendation({
      titulo: 'Fix',
      problem: 'Bug',
      recommendation: 'Patch',
      actions: ['Deploy'],
    });
    assert.ok(html.includes('Bug'));
    assert.ok(html.includes('Patch'));
    assert.ok(html.includes('Deploy'));
  });

  test('sin parámetros no crashea', () => {
    const html = components.recommendation();
    assert.ok(html.includes('recommendation'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 15: components — roadmap()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — roadmap()', () => {
  test('headers y fases', () => {
    const html = components.roadmap(
      ['Periodo', 'Foco'],
      [{ phase: 'Q1', focus: 'Setup', deliverables: ['Task 1'] }]
    );
    assert.ok(html.includes('<th>Periodo</th>'));
    assert.ok(html.includes('<td>Q1</td>'));
    assert.ok(html.includes('\u2022 Task 1'));
  });

  test('headers por defecto', () => {
    const html = components.roadmap([], [{ periodo: 'Q1', foco: 'A', entregables: ['B'] }]);
    assert.ok(html.includes('Periodo'));
    assert.ok(html.includes('Foco'));
    assert.ok(html.includes('Entregables'));
  });

  test('sin parámetros no crashea', () => {
    const html = components.roadmap();
    assert.ok(html.includes('roadmap-table'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 16: components — kpiTable()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — kpiTable()', () => {
  test('headers y KPIs', () => {
    const html = components.kpiTable(
      ['Dominio', 'Indicador'],
      [{ dominio: 'UX', metrica: 'NPS', meta: '>80' }]
    );
    assert.ok(html.includes('<th>Dominio</th>'));
    assert.ok(html.includes('<td>UX</td>'));
    assert.ok(html.includes('<td>NPS</td>'));
    assert.ok(html.includes('<td>&gt;80</td>'));
  });

  test('campos ingleses (domain/metric/target)', () => {
    const html = components.kpiTable([], [{ domain: 'UX', metric: 'NPS', target: '80' }]);
    assert.ok(html.includes('UX'));
    assert.ok(html.includes('NPS'));
    assert.ok(html.includes('80'));
  });

  test('sin parámetros no crashea', () => {
    const html = components.kpiTable();
    assert.ok(html.includes('kpi-table'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 17: components — closing()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — closing()', () => {
  test('párrafos', () => {
    const html = components.closing(['Párrafo 1', 'Párrafo 2']);
    assert.ok(html.includes('<p>Párrafo 1</p>'));
    assert.ok(html.includes('<p>Párrafo 2</p>'));
    assert.ok(html.includes('closing-icon'));
  });

  test('string en vez de array', () => {
    const html = components.closing('Texto único');
    assert.ok(html.includes('<p>Texto único</p>'));
  });

  test('sin parámetros no crashea', () => {
    const html = components.closing();
    assert.ok(html.includes('closing-block'));
  });
});

/* ═══════════════════════════════════════════════════════════════════
   PHASE 18: components — logo() + foot()
   ═══════════════════════════════════════════════════════════════════ */

describe('components — logo()', () => {
  test('pos=tr genera clase logo--tr', () => {
    const html = components.logo('tr', 'blue');
    assert.ok(html.includes('logo--tr'));
  });

  test('pos=center genera clase logo--center', () => {
    const html = components.logo('center', 'blue');
    assert.ok(html.includes('logo--center'));
  });
});

describe('components — foot()', () => {
  test('center=true genera footer--center', () => {
    const html = components.foot(true, null, 'Confidencial');
    assert.ok(html.includes('footer--center'));
    assert.ok(html.includes('Confidencial'));
  });

  test('center=false + page genera pageno', () => {
    const html = components.foot(false, '5 / 10', 'Text');
    assert.ok(html.includes('pageno'));
    assert.ok(html.includes('5 / 10'));
  });

  test('center=false + page=null no genera pageno', () => {
    const html = components.foot(false, null, 'Text');
    assert.ok(!html.includes('pageno'));
  });

  test('sin parámetros no crashea', () => {
    const html = components.foot();
    assert.ok(html.includes('footer'));
  });
});
