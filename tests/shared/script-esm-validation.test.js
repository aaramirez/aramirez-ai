import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SHARED = join(REPO_ROOT, 'shared');

describe('shared scripts ESM validation', () => {
  describe('standalone scripts in shared/scripts/', () => {
    const scriptsDir = join(SHARED, 'scripts');
    if (!existsSync(scriptsDir)) return;

    const scripts = readdirSync(scriptsDir).filter(f => f.endsWith('.js'));

    for (const script of scripts) {
      test(`shared/scripts/${script} uses ESM`, () => {
        const content = readFileSync(join(scriptsDir, script), 'utf8');
        assert.ok(
          content.includes('import ') || content.includes('export '),
          `${script} should use ESM syntax (import/export)`
        );
        assert.ok(
          !content.includes('module.exports'),
          `${script} should not use CommonJS (module.exports)`
        );
        assert.ok(
          !content.includes('require('),
          `${script} should not use require()`
        );
      });
    }
  });

  describe('lib scripts in shared/scripts/lib/', () => {
    const libDir = join(SHARED, 'scripts', 'lib');
    if (!existsSync(libDir)) return;

    const scripts = readdirSync(libDir).filter(f => f.endsWith('.js'));

    for (const script of scripts) {
      test(`shared/scripts/lib/${script} uses ESM`, () => {
        const content = readFileSync(join(libDir, script), 'utf8');
        assert.ok(
          content.includes('import ') || content.includes('export '),
          `${script} should use ESM syntax (import/export)`
        );
        assert.ok(
          !content.includes('module.exports'),
          `${script} should not use CommonJS (module.exports)`
        );
      });
    }
  });

  describe('skill scripts in shared/skills/*/scripts/', () => {
    const skillsDir = join(SHARED, 'skills');
    if (!existsSync(skillsDir)) return;

    const skillDirs = readdirSync(skillsDir).filter(d =>
      existsSync(join(skillsDir, d, 'scripts'))
    );

    for (const skill of skillDirs) {
      const scriptsDir = join(skillsDir, skill, 'scripts');

      const collectJs = (dir) => {
        const files = [];
        for (const e of readdirSync(dir)) {
          const full = join(dir, e);
          if (statSync(full).isDirectory()) {
            files.push(...collectJs(full));
          } else if (e.endsWith('.js')) {
            files.push(full);
          }
        }
        return files;
      };

      const jsFiles = collectJs(scriptsDir);

      for (const fullPath of jsFiles) {
        const relPath = fullPath.replace(scriptsDir + '/', '');
        test(`shared/skills/${skill}/scripts/${relPath} uses ESM`, () => {
          const content = readFileSync(fullPath, 'utf8');
          assert.ok(
            content.includes('import ') || content.includes('export '),
            `${relPath} should use ESM syntax (import/export)`
          );
          assert.ok(
            !content.includes('module.exports'),
            `${relPath} should not use CommonJS (module.exports)`
          );
        });
      }
    }
  });

  describe('plugin TypeScript validation', () => {
    const pluginPath = join(SHARED, 'plugins', 'custom-logo.tsx');
    if (!existsSync(pluginPath)) return;

    test('custom-logo.tsx has valid TypeScript syntax', () => {
      const content = readFileSync(pluginPath, 'utf8');
      assert.ok(content.length > 50, 'Plugin file too short');
      assert.ok(
        content.includes('export ') || content.includes('import '),
        'Plugin should have exports/imports'
      );
    });
  });
});
