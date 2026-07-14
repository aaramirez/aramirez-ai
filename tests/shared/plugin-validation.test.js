import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SHARED = join(REPO_ROOT, 'shared');

describe('shared plugins validation', () => {
  const pluginsDir = join(SHARED, 'plugins');

  test('plugins directory exists', () => {
    assert.ok(existsSync(pluginsDir), 'plugins directory missing');
  });

  describe('custom-logo.tsx', () => {
    const pluginPath = join(pluginsDir, 'custom-logo.tsx');

    test('exists', () => {
      assert.ok(existsSync(pluginPath), 'custom-logo.tsx missing');
    });

    test('has valid content', () => {
      const content = readFileSync(pluginPath, 'utf8');
      assert.ok(content.length > 50, 'Plugin file too short');
    });

    test('uses TypeScript syntax', () => {
      const content = readFileSync(pluginPath, 'utf8');
      assert.ok(
        content.includes('export ') || content.includes('import '),
        'Plugin should have exports/imports'
      );
    });
  });
});
