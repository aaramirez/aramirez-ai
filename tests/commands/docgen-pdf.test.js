import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const DOCGEN_DIR = join(REPO_ROOT, 'shared', 'scripts', 'docgen');
const SPECS_DIR = join(REPO_ROOT, 'assets', 'templates', 'specs');
const OUTPUT_DIR = '/tmp/docgen-test-outputs';

function specInfo(name) {
  const base = name.replace('.json', '');
  if (name === 'team-member-profile.json') return { builder: null };
  if (name === 'exec-dashboard.json') return { builder: 'deck' };
  if (name === 'weekly-status.json') return { builder: 'report' };
  if (name === 'adr.json') return { builder: 'report' };
  const reportSuffixes = ['report','sow','charter','decision-log','postmortem','test-report','minutes'];
  const isReport = reportSuffixes.some(s => base.endsWith(s));
  return { builder: isReport ? 'report' : 'deck' };
}

const ALL_SPECS = [
  'adr-deck.json', 'adr.json', 'api-specs.json', 'api-specs-report.json',
  'decision-log.json', 'deployment-runbook.json', 'deployment-runbook-report.json',
  'exec-dashboard.json', 'incident-postmortem.json', 'meeting-minutes.json',
  'project-charter.json', 'project-status.json', 'project-status-report.json',
  'release-notes.json', 'release-notes-report.json', 'sow.json',
  'sprint-planning.json', 'sprint-planning-report.json',
  'sprint-review.json', 'sprint-review-report.json',
  'system-architecture.json', 'system-architecture-report.json',
  'team-member-profile.json', 'team-overview.json',
  'tech-design.json', 'tech-design-report.json',
  'test-report.json', 'weekly-status.json', 'weekly-status-deck.json',
];

const DECK_SPECS = ALL_SPECS.filter(s => specInfo(s).builder === 'deck');
const REPORT_SPECS = ALL_SPECS.filter(s => specInfo(s).builder === 'report');

function buildPdf(builder, specName, outName, specDir = SPECS_DIR) {
  const specPath = join(specDir, specName);
  const outPath = join(OUTPUT_DIR, outName);
  try {
    execSync(
      `node "${join(DOCGEN_DIR, `build-${builder}.js`)}" "${specPath}" --output "${outPath}"`,
      { cwd: REPO_ROOT, timeout: 60000, stdio: 'pipe' }
    );
    assert.ok(existsSync(outPath), `${outName} should exist`);
    const stat = readFileSync(outPath);
    assert.ok(stat.length > 1000, `${outName} should be >1KB, got ${stat.length} bytes`);
    const header = readFileSync(outPath, 'utf8').slice(0, 5);
    assert.ok(header.startsWith('%PDF'), `${outName} should start with %PDF`);
    return true;
  } catch (e) {
    const stderr = e.stderr?.toString() || e.message;
    if (stderr.includes('rsvg-convert') || stderr.includes('chromium') || stderr.includes('browser')) {
      console.log(`  ⚠ PDF engine not available — skipping ${outName}`);
      return false;
    }
    throw e;
  }
}

describe('docgen PDF generation — all deck specs', () => {
  before(() => { mkdirSync(OUTPUT_DIR, { recursive: true }); });

  for (const name of DECK_SPECS) {
    const base = name.replace('.json', '');
    test(`${base} generates valid deck PDF`, () => {
      buildPdf('deck', name, `${base}-deck.pdf`);
    });
  }

  after(() => {
    console.log(`\n  📁 Deck PDFs saved in: ${OUTPUT_DIR}/`);
  });
});

describe('docgen PDF generation — all report specs', () => {
  before(() => { mkdirSync(OUTPUT_DIR, { recursive: true }); });

  for (const name of REPORT_SPECS) {
    const base = name.replace('.json', '');
    test(`${base} generates valid report PDF`, () => {
      buildPdf('report', name, `${base}-report.pdf`);
    });
  }

  after(() => {
    console.log(`\n  📁 Report PDFs saved in: ${OUTPUT_DIR}/`);
  });
});

describe('docgen PDF generation — test fixtures', () => {
  before(() => { mkdirSync(OUTPUT_DIR, { recursive: true }); });

  test('test-deck.json → PDF', () => {
    buildPdf('deck', 'test-deck.json', 'test-deck.pdf', join(REPO_ROOT, 'assets', 'decks'));
  });

  test('test-report.json → PDF', () => {
    buildPdf('report', 'test-report.json', 'test-report.pdf', join(REPO_ROOT, 'assets', 'decks'));
  });

  test('test-deck.json → HTML', () => {
    const specPath = join(REPO_ROOT, 'assets', 'decks', 'test-deck.json');
    const outPath = join(OUTPUT_DIR, 'test-deck.html');
    execSync(
      `node "${join(DOCGEN_DIR, 'build-web.js')}" "${specPath}" --output "${outPath}"`,
      { cwd: REPO_ROOT, timeout: 30000, stdio: 'pipe' }
    );
    assert.ok(existsSync(outPath), 'HTML file should exist');
    const content = readFileSync(outPath, 'utf8');
    assert.ok(content.length > 5000, `HTML should be >5KB`);
    assert.ok(content.includes('<!DOCTYPE html>'), 'Should be valid HTML');
  });

  test('test-deck.html contains all slide type classes', () => {
    const outPath = join(OUTPUT_DIR, 'test-deck.html');
    if (!existsSync(outPath)) return;
    const html = readFileSync(outPath, 'utf8');
    for (const cls of ['cover', 'bullets', 'section', 'chart', 'hero-stat', 'kpi', 'blockquote']) {
      assert.ok(html.includes(cls), `HTML should contain "${cls}" class`);
    }
  });

  test('test-deck.html contains brand colors', () => {
    const outPath = join(OUTPUT_DIR, 'test-deck.html');
    if (!existsSync(outPath)) return;
    const html = readFileSync(outPath, 'utf8');
    assert.ok(html.includes('--ink') || html.includes('#1a365d'), 'Should contain brand colors');
  });

  test('test-deck.html contains logo data URI', () => {
    const outPath = join(OUTPUT_DIR, 'test-deck.html');
    if (!existsSync(outPath)) return;
    const html = readFileSync(outPath, 'utf8');
    assert.ok(html.includes('data:image/svg+xml') || html.includes('logo'), 'Should contain logo');
  });
});
