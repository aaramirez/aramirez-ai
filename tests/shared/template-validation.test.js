import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SHARED = join(REPO_ROOT, 'shared');

describe('shared templates validation', () => {
  const templatesDir = join(SHARED, 'templates');

  describe('template directories', () => {
    test('templates/minimal/ exists', () => {
      assert.ok(existsSync(join(templatesDir, 'minimal')), 'minimal template missing');
    });

    test('templates/full/ exists', () => {
      assert.ok(existsSync(join(templatesDir, 'full')), 'full template missing');
    });

    test('templates/partials/ exists', () => {
      assert.ok(existsSync(join(templatesDir, 'partials')), 'partials directory missing');
    });
  });

  describe('minimal template', () => {
    const minimalDir = join(templatesDir, 'minimal');

    test('has template.json', () => {
      const path = join(minimalDir, 'template.json');
      assert.ok(existsSync(path), 'template.json missing');
      const content = readFileSync(path, 'utf8');
      const tmpl = JSON.parse(content);
      assert.ok(tmpl, 'template.json should be valid JSON');
    });
  });

  describe('full template', () => {
    const fullDir = join(templatesDir, 'full');

    test('has template.json', () => {
      const path = join(fullDir, 'template.json');
      assert.ok(existsSync(path), 'template.json missing');
      const content = readFileSync(path, 'utf8');
      const tmpl = JSON.parse(content);
      assert.ok(tmpl, 'template.json should be valid JSON');
    });
  });

  describe('partials', () => {
    const partialsDir = join(templatesDir, 'partials');

    test('has AGENTS.md partial', () => {
      assert.ok(existsSync(join(partialsDir, 'AGENTS.md')), 'AGENTS.md partial missing');
    });

    test('has opencode.json partial', () => {
      assert.ok(existsSync(join(partialsDir, 'opencode.json')), 'opencode.json partial missing');
    });

    test('has package.json partial', () => {
      assert.ok(existsSync(join(partialsDir, 'package.json')), 'package.json partial missing');
    });

    test('has .gitignore partial', () => {
      assert.ok(existsSync(join(partialsDir, '.gitignore')), '.gitignore partial missing');
    });

    test('opencode.json partial is valid JSON', () => {
      const content = readFileSync(join(partialsDir, 'opencode.json'), 'utf8');
      const config = JSON.parse(content);
      assert.ok(config, 'opencode.json should be valid JSON');
    });

    test('package.json partial is valid JSON', () => {
      const content = readFileSync(join(partialsDir, 'package.json'), 'utf8');
      const pkg = JSON.parse(content);
      assert.ok(pkg, 'package.json should be valid JSON');
    });
  });
});
