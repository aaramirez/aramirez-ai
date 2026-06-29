import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SPECS_DIR = join(REPO_ROOT, 'assets', 'templates', 'specs');
const DOCGEN_DIR = join(REPO_ROOT, 'shared', 'scripts', 'docgen');
const BRAND_PATH = join(REPO_ROOT, 'shared', 'brand.json');

function getSpecs() {
  if (!existsSync(SPECS_DIR)) return [];
  return readdirSync(SPECS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();
}

function loadSpec(name) {
  return JSON.parse(readFileSync(join(SPECS_DIR, name), 'utf8'));
}

function loadBrand() {
  return JSON.parse(readFileSync(BRAND_PATH, 'utf8'));
}

/* ─── Deck vs report classification ─── */

const DECK_SPECS = new Set([
  'adr-deck.json',
  'project-status.json',
  'sprint-planning.json',
  'sprint-review.json',
  'system-architecture.json',
  'tech-design.json',
  'api-specs.json',
  'deployment-runbook.json',
  'weekly-status-deck.json',
  'release-notes.json',
  'team-overview.json',
  'exec-dashboard.json',
]);

const REPORT_SPECS = new Set([
  'adr.json',
  'api-specs-report.json',
  'decision-log.json',
  'deployment-runbook-report.json',
  'incident-postmortem.json',
  'meeting-minutes.json',
  'project-charter.json',
  'project-status-report.json',
  'release-notes-report.json',
  'sow.json',
  'sprint-planning-report.json',
  'sprint-review-report.json',
  'system-architecture-report.json',
  'tech-design-report.json',
  'test-report.json',
  'weekly-status.json',
]);

/* ─── Palabras en inglés que no deben aparecer en titulos/contenido ─── */

const ENGLISH_WORDS = [
  'Overview', 'Context', 'Mission', 'Goals', 'Architecture',
  'Statement of Work', 'Project Charter', 'Decision Log',
  'Incident Postmortem', 'Release Notes', 'Sprint Planning',
  'Sprint Review', 'Weekly Status', 'System Architecture',
  'Tech Design', 'API Specs', 'Deployment Runbook',
  'Team Overview', 'Executive Dashboard',
  'Status Report', 'Planning Report', 'Review Report',
  'Notes Report', 'Design Report', 'Architecture Report',
  'Specification', 'Runbook Report', 'Test Report',
  'Meeting Minutes', 'Charter',
];

const ENGLISH_INDICES = [
  'CONTEXT', 'MISSION', 'GOALS', 'OVERVIEW', 'ARCH',
  'PREREQ', 'W26',
];

describe('template spec content quality', () => {
  const specs = getSpecs();

  test('has at least 28 template specs', () => {
    assert.ok(specs.length >= 28, `Found ${specs.length} specs, expected >= 28`);
  });

  /* ─── Team Member Profile exists ─── */

  test('team-member-profile.json exists in specs', () => {
    assert.ok(specs.includes('team-member-profile.json'),
      'team-member-profile.json is missing from specs');
  });

  test('team-member-profile.json can be built as image', () => {
    const spec = loadSpec('team-member-profile.json');
    assert.ok(spec.output, 'Missing output');
    assert.ok(spec.slides?.length >= 1, 'Should have at least 1 slide');
    const slide = spec.slides[0];
    assert.equal(slide.type, 'profile', 'First slide must be type "profile"');
    assert.ok(slide.nombre_linea1, 'Missing nombre_linea1');
    assert.ok(slide.cargo_linea1, 'Missing cargo_linea1');
    assert.ok(slide.organizacion, 'Missing organizacion');
    assert.ok(slide.email, 'Missing email');
    assert.ok(Array.isArray(slide.habilidades), 'habilidades must be an array');
    assert.ok(Array.isArray(slide.experiencia_destacada), 'experiencia_destacada must be an array');
    assert.ok(Array.isArray(slide.estudios), 'estudios must be an array');
  });

  /* ─── Deck spec validation ─── */

  for (const name of [...DECK_SPECS].sort()) {
    test(`${name}: is valid deck spec`, () => {
      const spec = loadSpec(name);
      assert.ok(spec.output, `Missing output in ${name}`);
      assert.ok(spec.slides?.length >= 4,
        `${name} should have >= 4 slides, has ${spec.slides?.length}`);
      assert.equal(spec.mostrar_paginas, true,
        `${name} should have mostrar_paginas: true`);
      // First slide must be portada
      assert.equal(spec.slides[0]?.type, 'portada',
        `${name}: first slide must be "portada", got "${spec.slides[0]?.type}"`);
    });
  }

  /* ─── Report spec validation ─── */

  for (const name of [...REPORT_SPECS].sort()) {
    test(`${name}: is valid report spec`, () => {
      const spec = loadSpec(name);
      assert.ok(spec.output, `Missing output in ${name}`);
      assert.ok(spec.meta, `Missing meta in ${name}`);
      assert.ok(spec.meta.title, `Missing meta.title in ${name}`);
      assert.ok(spec.meta.subtitle, `Missing meta.subtitle in ${name}`);
      assert.ok(spec.meta.organization, `Missing meta.organization in ${name}`);
      assert.ok(spec.meta.prepared_by, `Missing meta.prepared_by in ${name}`);
      assert.ok(spec.meta.date, `Missing meta.date in ${name}`);
      assert.ok(spec.meta.classification, `Missing meta.classification in ${name}`);
      assert.ok(spec.slides?.length >= 4,
        `${name} should have >= 4 slides, has ${spec.slides?.length}`);
      // First slide must be doc-cover
      assert.equal(spec.slides[0]?.type, 'doc-cover',
        `${name}: first slide must be "doc-cover", got "${spec.slides[0]?.type}"`);
    });
  }

  /* ─── exec-dashboard is now a deck ─── */

  test('exec-dashboard.json is a deck (not image)', () => {
    const spec = loadSpec('exec-dashboard.json');
    assert.equal(spec.mostrar_paginas, true,
      'exec-dashboard should have mostrar_paginas: true');
    assert.ok(spec.output.endsWith('.pdf'),
      `exec-dashboard output should end with .pdf, got ${spec.output}`);
    assert.ok(spec.slides.length >= 5,
      `exec-dashboard should have >= 5 slides, has ${spec.slides.length}`);
    // Should have kpi and chart slides
    const types = spec.slides.map(s => s.type);
    assert.ok(types.includes('kpis'), 'exec-dashboard should have kpis slide');
    assert.ok(types.includes('grafico'), 'exec-dashboard should have grafico slide');
  });

  /* ─── No English titles/content ─── */

  for (const name of specs) {
    test(`${name}: titles and content are in Spanish (no English words)`, () => {
      const spec = loadSpec(name);
      const content = JSON.stringify(spec);

      const foundEnglish = ENGLISH_WORDS.filter(w => {
        // Match as word boundary in JSON string values
        const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`"${escaped}"`, 'i').test(content);
      });

      // Special case: allow "Gerencia de Desarrollos" in organization field
      // (that's the example org, which is in Spanish)
      const filtered = foundEnglish.filter(w => w !== 'Gerencia de Desarrollos y Aplicaciones');

      assert.ok(filtered.length === 0,
        `${name} contains English words: ${filtered.join(', ')}`);
    });
  }

  /* ─── No English indices ─── */

  for (const name of specs) {
    test(`${name}: no English section indices`, () => {
      const spec = loadSpec(name);
      const content = JSON.stringify(spec);
      const found = ENGLISH_INDICES.filter(idx => {
        const escaped = idx.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`"indice"\\s*:\\s*"${escaped}"`).test(content);
      });
      assert.ok(found.length === 0,
        `${name} has English indices: ${found.join(', ')}`);
    });
  }

  /* ─── Enriched content: multiple slide types per spec ─── */

  test('deck specs use at least 4 different slide types', () => {
    const MIN_TYPES = 4;
    for (const name of [...DECK_SPECS].sort()) {
      const spec = loadSpec(name);
      const types = new Set(spec.slides.map(s => s.type));
      assert.ok(types.size >= MIN_TYPES,
        `${name} uses only ${types.size} slide types (need >= ${MIN_TYPES}): [${[...types].join(', ')}]`);
    }
  });

  test('report specs use at least 4 different report types', () => {
    const MIN_TYPES = 4;
    for (const name of [...REPORT_SPECS].sort()) {
      const spec = loadSpec(name);
      const types = new Set(spec.slides.map(s => s.type));
      assert.ok(types.size >= MIN_TYPES,
        `${name} uses only ${types.size} report types (need >= ${MIN_TYPES}): [${[...types].join(', ')}]`);
    }
  });

  /* ─── weekly-status and weekly-status-deck both exist ─── */

  test('weekly-status (report) and weekly-status-deck (deck) both exist and are enriched', () => {
    const report = loadSpec('weekly-status.json');
    const deck = loadSpec('weekly-status-deck.json');

    assert.ok(report.meta, 'weekly-status (report) must have meta');
    assert.equal(report.slides[0]?.type, 'doc-cover',
      'weekly-status (report) first slide must be doc-cover');
    assert.ok(report.slides.length >= 4,
      `weekly-status (report) has only ${report.slides.length} slides`);

    assert.equal(deck.mostrar_paginas, true,
      'weekly-status-deck must have mostrar_paginas: true');
    assert.equal(deck.slides[0]?.type, 'portada',
      'weekly-status-deck first slide must be portada');
    assert.ok(deck.slides.length >= 4,
      `weekly-status-deck has only ${deck.slides.length} slides`);

    // Each should have enriched content (at least 4 different types)
    const reportTypes = new Set(report.slides.map(s => s.type));
    assert.ok(reportTypes.size >= 4,
      `weekly-status (report) uses only ${reportTypes.size} types`);
    const deckTypes = new Set(deck.slides.map(s => s.type));
    assert.ok(deckTypes.size >= 4,
      `weekly-status-deck uses only ${deckTypes.size} types`);
  });
});

describe('footer configurability', () => {
  /* ─── brand.json has footer field ─── */

  test('brand.json has footer field', () => {
    const brand = loadBrand();
    assert.ok(brand.brand?.footer,
      'brand.json.brand should have a "footer" field');
    assert.ok(typeof brand.brand.footer === 'string',
      'brand.json.brand.footer should be a string');
  });

  /* ─── html-theme.js reads footer from brand/meta, not hardcoded ─── */

  test('html-theme.js does not hardcode Gerencia de Desarrollos footer', () => {
    const content = readFileSync(join(DOCGEN_DIR, 'html-theme.js'), 'utf8');
    // Should reference brand() or meta, not hardcode the text
    assert.ok(
      !content.includes("Contenido confidencial de la Gerencia de Desarrollos y Aplicaciones"),
      'html-theme.js still has hardcoded footer text'
    );
    assert.ok(
      content.includes('brand()') || content.includes('meta.'),
      'html-theme.js should read footer dynamically from brand() or meta'
    );
  });

  /* ─── report-theme.js reads footer from brand/meta, not hardcoded ─── */

  test('report-theme.js does not hardcode Gerencia de Desarrollos footer', () => {
    const content = readFileSync(join(DOCGEN_DIR, 'report-theme.js'), 'utf8');
    assert.ok(
      !content.includes("Contenido confidencial de la Gerencia de Desarrollos y Aplicaciones"),
      'report-theme.js still has hardcoded footer text'
    );
    assert.ok(
      content.includes('brand()') || content.includes('meta.'),
      'report-theme.js should read footer dynamically from brand() or meta'
    );
  });
});
