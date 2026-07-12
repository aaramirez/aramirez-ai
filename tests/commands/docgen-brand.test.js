import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const DOCGEN_DIR = join(REPO_ROOT, 'shared', 'scripts', 'docgen');
const BRAND_PATH = join(REPO_ROOT, 'shared', 'brand.json');

let brandCss, logoHref, brand, buildDeckHtml, buildReportHtml;

test('load docgen modules', async () => {
  const themeUtils = await import(join(DOCGEN_DIR, 'theme-utils.js'));
  brandCss = themeUtils.brandCss;
  logoHref = themeUtils.logoHref;
  const idx = await import(join(DOCGEN_DIR, 'index.js'));
  brand = idx.brand;
  const htmlTheme = await import(join(DOCGEN_DIR, 'html-theme.js'));
  buildDeckHtml = htmlTheme.buildHtml;
  const reportTheme = await import(join(DOCGEN_DIR, 'report-theme.js'));
  buildReportHtml = reportTheme.buildHtml;
});

describe('docgen brand integration', () => {
  test('brandCss deck generates :root with color variables', () => {
    const css = brandCss('deck');
    assert.ok(css.includes(':root'), 'Should have :root selector');
    assert.ok(css.includes('--ink'), 'Should have --ink variable');
    assert.ok(css.includes('--accent'), 'Should have --accent variable');
    assert.ok(css.includes('--body'), 'Should have --body variable');
    assert.ok(css.includes('--bg-1'), 'Should have --bg-1 variable');
  });

  test('brandCss report generates :root with color variables', () => {
    const css = brandCss('report');
    assert.ok(css.includes(':root'), 'Should have :root selector');
    assert.ok(css.includes('--ink'), 'Should have --ink variable');
    assert.ok(css.includes('--accent'), 'Should have --accent variable');
  });

  test('brandCss throws on unknown type', () => {
    assert.throws(() => brandCss('unknown'), /Unknown brand CSS type/);
  });

  test('logoHref blue returns data URI', () => {
    const href = logoHref('blue');
    assert.ok(typeof href === 'string', 'Should return a string');
    if (existsSync(join(REPO_ROOT, 'assets', 'images', 'logo.svg'))) {
      assert.ok(href.startsWith('data:image/svg+xml'), 'Should be a data URI');
      assert.ok(href.length > 100, 'Data URI should have meaningful length');
    }
  });

  test('logoHref white returns data URI', () => {
    const href = logoHref('white');
    assert.ok(typeof href === 'string', 'Should return a string');
    if (existsSync(join(REPO_ROOT, 'assets', 'images', 'logo-white.svg'))) {
      assert.ok(href.startsWith('data:image/svg+xml'), 'Should be a data URI');
    }
  });

  test('brand() returns brand config with required fields', () => {
    const b = brand();
    assert.ok(b, 'brand() should return an object');
    assert.ok(b.name, 'brand must have name');
    assert.ok(b.colors, 'brand must have colors');
    assert.ok(b.colors.primary, 'brand must have primary color');
  });

  test('brand colors match brand.json file', () => {
    const brandData = JSON.parse(readFileSync(BRAND_PATH, 'utf8')).brand;
    const b = brand();
    assert.equal(b.colors.primary, brandData.colors.primary, 'Primary color should match');
    assert.equal(b.colors.secondary, brandData.colors.secondary, 'Secondary color should match');
    assert.equal(b.colors.accent, brandData.colors.accent, 'Accent color should match');
  });

  test('HTML deck contains brand primary color in styles', () => {
    const html = buildDeckHtml([
      { type: 'portada', titulo: 'Brand Test', subtitulo: 'Testing colors' },
    ]);
    const brandData = JSON.parse(readFileSync(BRAND_PATH, 'utf8')).brand;
    assert.ok(html.includes(brandData.colors.primary) || html.includes('--brand-primary'),
      'HTML should contain brand primary color');
  });

  test('deck footer contains brand footer template', () => {
    const html = buildDeckHtml([
      { type: 'bullets', titulo: 'Test', items: ['A'] },
    ]);
    const brandData = JSON.parse(readFileSync(BRAND_PATH, 'utf8')).brand;
    if (brandData.footer) {
      assert.ok(html.includes(brandData.name) || html.includes('confidencial'),
        'Footer should contain brand text');
    }
  });

  test('deck cover slide contains logo data URI', () => {
    const html = buildDeckHtml([
      { type: 'portada', titulo: 'Logo Test', subtitulo: 'Sub' },
    ]);
    if (existsSync(join(REPO_ROOT, 'assets', 'images', 'logo.svg'))) {
      assert.ok(html.includes('data:image/svg+xml') || html.includes('logo'),
        'Cover should reference logo');
    }
  });

  test('report cover contains organization from brand', () => {
    const b = brand();
    const html = buildReportHtml(
      { title: 'Test', subtitle: '', organization: b.name, prepared_by: '', date: '', classification: '' },
      [{ type: 'doc-cover' }]
    );
    assert.ok(html.includes(b.name), 'Report cover should contain brand name');
  });
});
