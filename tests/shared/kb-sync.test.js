import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpDir, cleanup, REPO_ROOT } from '../helpers.js';
import { spawnSync } from 'child_process';

function runScript(args = [], cwd) {
  const result = spawnSync('node', [join(REPO_ROOT, 'shared', 'skills', 'kb-management', 'scripts', 'kb-sync.js'), ...args], {
    cwd: cwd || REPO_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  return {
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    exitCode: result.status ?? 1,
  };
}

describe('kb-sync.js', () => {
  it('--help shows usage', () => {
    const result = runScript(['--help']);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes('--validate') || result.stdout.includes('Usage'));
  });

  it('--validate without directory shows error', () => {
    const result = runScript(['--validate']);
    assert.notEqual(result.exitCode, 0);
  });

  it('--validate with valid vault returns 0', () => {
    const project = tmpDir();
    const kbDir = join(project, 'kb');
    mkdirSync(join(kbDir, 'notes'), { recursive: true });
    writeFileSync(join(kbDir, 'notes', 'test.md'), '---\ntitle: Test\n---\n\n# Test note\n');

    try {
      const result = runScript(['--validate', kbDir], project);
      assert.equal(result.exitCode, 0);
    } finally {
      cleanup(project);
    }
  });

  it('detects broken wikilinks', () => {
    const project = tmpDir();
    const kbDir = join(project, 'kb');
    mkdirSync(kbDir, { recursive: true });
    writeFileSync(join(kbDir, 'note.md'), '---\ntitle: Note\n---\n\nSee [[nonexistent]] for details.\n');

    try {
      const result = runScript(['--validate', kbDir], project);
      assert.ok(result.stdout.includes('nonexistent') || result.stdout.includes('broken') || result.stdout.includes('wikilink'),
        'should report broken wikilink');
    } finally {
      cleanup(project);
    }
  });

  it('resolves links like Obsidian: paths, path suffixes, relative and aliases', () => {
    const project = tmpDir();
    const kbDir = join(project, 'kb');
    mkdirSync(join(kbDir, '01-Fundamentos'), { recursive: true });
    mkdirSync(join(kbDir, '02-Herramientas', 'Visual'), { recursive: true });
    writeFileSync(join(kbDir, '01-Fundamentos', 'que-es-lean.md'), '---\ntitle: Lean\n---\n');
    writeFileSync(join(kbDir, '02-Herramientas', 'Visual', 'andon.md'), '---\ntitle: Andon\n---\n');
    writeFileSync(join(kbDir, '02-Herramientas', 'kanban.md'), [
      '---', 'title: Kanban', '---', '',
      '[[que-es-lean]] [[01-Fundamentos/que-es-lean]] [[Visual/andon]] [[./Visual/andon]]',
      '[[../01-Fundamentos/que-es-lean|Lean]] [[01-fundamentos/QUE-ES-LEAN#Origen]]',
      '| tabla | [[01-Fundamentos/que-es-lean\\|Lean]] |', '',
    ].join('\n'));

    try {
      const result = runScript(['--validate', kbDir], project);
      assert.equal(result.exitCode, 0, result.stdout);
    } finally {
      cleanup(project);
    }
  });

  it('reports a path link whose folder does not exist even if the name does', () => {
    const project = tmpDir();
    const kbDir = join(project, 'kb');
    mkdirSync(join(kbDir, 'a'), { recursive: true });
    writeFileSync(join(kbDir, 'a', 'Index.md'), '---\ntitle: Index\n---\n');
    writeFileSync(join(kbDir, 'note.md'), '---\ntitle: Note\n---\n\nSee [[otra-boveda/Index]] and [[../fuera]].\n');

    try {
      const result = runScript(['--validate', kbDir], project);
      assert.notEqual(result.exitCode, 0);
      assert.ok(result.stdout.includes('otra-boveda/Index'), result.stdout);
      assert.ok(result.stdout.includes('../fuera'), result.stdout);
    } finally {
      cleanup(project);
    }
  });

  it('ignores links inside code and skips dot-folders and node_modules', () => {
    const project = tmpDir();
    const kbDir = join(project, 'kb');
    mkdirSync(join(kbDir, 'node_modules', 'pkg'), { recursive: true });
    mkdirSync(join(kbDir, '.obsidian'), { recursive: true });
    writeFileSync(join(kbDir, 'node_modules', 'pkg', 'README.md'), 'See [[nowhere]].\n');
    writeFileSync(join(kbDir, '.obsidian', 'notes.md'), 'See [[nowhere]].\n');
    writeFileSync(join(kbDir, 'note.md'), '---\ntitle: Note\n---\n\nUse `[[otra-nota]]` like:\n\n```\n[[ejemplo]]\n```\n');

    try {
      const result = runScript(['--validate', kbDir], project);
      assert.equal(result.exitCode, 0, result.stdout);
    } finally {
      cleanup(project);
    }
  });

  it('--fix-links repairs case, accent and dash mismatches keeping the alias', () => {
    const project = tmpDir();
    const kbDir = join(project, 'kb');
    mkdirSync(join(kbDir, 'Equipo'), { recursive: true });
    writeFileSync(join(kbDir, 'Equipo', 'Iré Youngo.md'), '---\ntitle: Iré\n---\n');
    writeFileSync(join(kbDir, 'Equipo', 'Módulo 1 - Fundamentos.md'), '---\ntitle: M1\n---\n');
    writeFileSync(join(kbDir, 'note.md'), '---\ntitle: Note\n---\n\n[[Equipo/Ire youngo|Iré]] y [[Módulo 1 — Fundamentos#Intro]] y [[sin-match]]\n');

    try {
      const result = runScript(['--fix-links', kbDir], project);
      assert.equal(result.exitCode, 0);
      const content = readFileSync(join(kbDir, 'note.md'), 'utf8');
      assert.ok(content.includes('[[Equipo/Iré Youngo|Iré]]'), content);
      assert.ok(content.includes('[[Equipo/Módulo 1 - Fundamentos#Intro]]'), content);
      assert.ok(content.includes('[[sin-match]]'), 'unresolvable links are left alone');
    } finally {
      cleanup(project);
    }
  });

  it('--fix-links repairs broken wikilinks', () => {
    const project = tmpDir();
    const kbDir = join(project, 'kb');
    mkdirSync(kbDir, { recursive: true });
    writeFileSync(join(kbDir, 'note.md'), '---\ntitle: Note\n---\n\nSee [[missing-link]] here.\n');

    try {
      const result = runScript(['--fix-links', kbDir], project);
      assert.equal(result.exitCode, 0);
    } finally {
      cleanup(project);
    }
  });
});
