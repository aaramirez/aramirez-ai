/**
 * Template utilities — load templates, resolve partials, apply variables.
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT, TEMPLATES_DIR, USER_TEMPLATES_DIR, PARTIALS_DIR } from './helpers.js';

function loadTemplates() {
  const templates = [];

  function loadFromDir(dir, builtin) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const tmplDir = join(dir, entry);
      if (statSync(tmplDir).isDirectory()) {
        const manifestPath = join(tmplDir, 'template.json');
        if (existsSync(manifestPath)) {
          try {
            const tmpl = JSON.parse(readFileSync(manifestPath, 'utf8'));
            tmpl.sourceDir = tmplDir;
            tmpl.builtin = builtin;
            templates.push(tmpl);
          } catch { /* skip invalid */ }
        }
      }
    }
  }

  loadFromDir(TEMPLATES_DIR, true);
  loadFromDir(USER_TEMPLATES_DIR, false);
  return templates;
}

function resolvePartial(name) {
  const path = join(PARTIALS_DIR, name);
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function applyVars(content, vars) {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

function resolveItems(category, items) {
  if (items.length === 1 && items[0] === '*') {
    const dir = join(REPO_ROOT, 'shared', category);
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter(f => statSync(join(dir, f)).isDirectory());
  }
  return items;
}

function resolveScripts(items) {
  if (items.length === 1 && items[0] === '*') {
    const dir = join(REPO_ROOT, 'shared', 'scripts');
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter(f => {
      const p = join(dir, f);
      return statSync(p).isFile() && f !== '.gitkeep';
    });
  }
  return items;
}

function resolveFiles(category, items) {
  if (items.length === 1 && items[0] === '*') {
    const dir = join(REPO_ROOT, 'shared', category);
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter(f => {
      const p = join(dir, f);
      return statSync(p).isFile() && f !== '.gitkeep';
    }).map(f => f.replace(/\.md$/, ''));
  }
  return items;
}

export { loadTemplates, resolvePartial, applyVars, resolveItems, resolveScripts, resolveFiles };
