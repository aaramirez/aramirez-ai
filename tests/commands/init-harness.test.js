import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertDir, assertNoFile, assertExitCode } from '../helpers.js';

describe('arai init — generación de harness funcional (TDD)', () => {
  let dir;
  let projectDir;

  afterEach(() => { if (dir) cleanup(dir); });

  function initFull(desc = 'Test harness') {
    dir = tmpDir();
    projectDir = join(dir, 'harness-proj');
    const result = runArai(['init', projectDir, '--template', 'full', '--description', desc]);
    assertExitCode(result, 0);
    return projectDir;
  }

  function initMinimal() {
    dir = tmpDir();
    projectDir = join(dir, 'min-proj');
    const result = runArai(['init', projectDir, '--template', 'minimal']);
    assertExitCode(result, 0);
    return projectDir;
  }

  /* ─── opencode.json en raíz ─── */

  test('opencode.json está en la raíz del proyecto', () => {
    const p = initFull();
    assertFile(join(p, 'opencode.json'));
  });

  test('NO existe platforms/ en el harness generado', () => {
    const p = initFull();
    assert.ok(!existsSync(join(p, 'platforms')),
      'No debe existir directorio platforms/');
  });

  /* ─── .opencode/ estructura nativa ─── */

  test('.opencode/skills/ contiene todas las 30 skills', () => {
    const p = initFull();
    assertDir(join(p, '.opencode', 'skills'));
    const skills = readdirSync(join(p, '.opencode', 'skills'))
      .filter(f => statSync(join(p, '.opencode', 'skills', f)).isDirectory());
    assert.equal(skills.length, 30, `Esperaba 30 skills, obtuve ${skills.length}`);
  });

  test('.opencode/agents/ contiene archivos .md de agentes', () => {
    const p = initFull();
    assertDir(join(p, '.opencode', 'agents'));
    const agents = readdirSync(join(p, '.opencode', 'agents'))
      .filter(f => f.endsWith('.md'));
    assert.ok(agents.length >= 4, `Esperaba >=4 agents, obtuve ${agents.length}`);
  });

  test('.opencode/commands/ contiene archivos .md de comandos', () => {
    const p = initFull();
    assertDir(join(p, '.opencode', 'commands'));
    const cmds = readdirSync(join(p, '.opencode', 'commands'))
      .filter(f => f.endsWith('.md'));
    assert.ok(cmds.length >= 3, `Esperaba >=3 commands, obtuve ${cmds.length}`);
  });

  /* ─── Sin internals de aramirez-ai ─── */

  test('NO hay node_modules en ninguna parte del harness', () => {
    const p = initFull();
    assert.ok(!existsSync(join(p, 'node_modules')),
      'No debe haber node_modules en raíz');
    assert.ok(!existsSync(join(p, '.opencode', 'node_modules')),
      'No debe haber node_modules en .opencode/');
  });

  test('NO hay package-lock.json', () => {
    const p = initFull();
    assert.ok(!existsSync(join(p, 'package-lock.json')),
      'No debe haber package-lock.json');
  });

  test('.opencode/plugins/ tiene custom-logo.tsx', () => {
    const p = initFull();
    assert.ok(existsSync(join(p, '.opencode', 'plugins', 'custom-logo.tsx')),
      'Debe tener custom-logo.tsx');
  });

  test('.opencode/tui.json existe', () => {
    const p = initFull();
    assertFile(join(p, '.opencode', 'tui.json'));
    const tui = JSON.parse(readFileSync(join(p, '.opencode', 'tui.json'), 'utf8'));
    assert.ok(tui.plugin, 'tui.json debe tener plugin array');
  });

  /* ─── package.json en raíz ─── */

  test('package.json en raíz con nombre del proyecto', () => {
    const p = initFull();
    assertFile(join(p, 'package.json'));
    const pkg = JSON.parse(readFileSync(join(p, 'package.json'), 'utf8'));
    assert.equal(pkg.name, 'harness-proj');
    assert.equal(pkg.type, 'module');
  });

  /* ─── opencode.json rutas correctas ─── */

  test('opencode.json NO tiene skills.paths (descubrimiento nativo)', () => {
    const p = initFull();
    const config = JSON.parse(readFileSync(join(p, 'opencode.json'), 'utf8'));
    assert.ok(!config.skills?.paths,
      'No debe tener skills.paths — opencode descubre desde .opencode/skills/');
  });

  test('opencode.json references apuntan a ./shared/ (no ../shared/)', () => {
    const p = initFull();
    const config = JSON.parse(readFileSync(join(p, 'opencode.json'), 'utf8'));
    if (config.references?.['shared-scripts']) {
      assert.equal(config.references['shared-scripts'].path, './shared/scripts');
    }
    if (config.references?.['shared-prompts']) {
      assert.equal(config.references['shared-prompts'].path, './shared/prompts');
    }
    if (config.references?.['shared-rules']) {
      assert.equal(config.references['shared-rules'].path, './shared/rules');
    }
  });

  test('opencode.json NO tiene MCP servers de aramirez-ai', () => {
    const p = initFull();
    const config = JSON.parse(readFileSync(join(p, 'opencode.json'), 'utf8'));
    assert.ok(!config.mcp?.engram, 'No debe tener MCP engram');
    assert.ok(!config.mcp?.context7, 'No debe tener MCP context7');
  });

  /* ─── scripts en shared/scripts/ ─── */

  test('shared/scripts/ tiene create-base.js (utilidad compartida)', () => {
    const p = initFull();
    assert.ok(existsSync(join(p, 'shared', 'scripts', 'create-base.js')),
      'Debe tener create-base.js');
  });

  test('shared/scripts/ tiene create-agent.js', () => {
    const p = initFull();
    assert.ok(existsSync(join(p, 'shared', 'scripts', 'create-agent.js')),
      'Debe tener create-agent.js');
  });

  test('shared/scripts/docgen/ existe con archivos .js', () => {
    const p = initFull();
    assertDir(join(p, 'shared', 'scripts', 'docgen'));
    const files = readdirSync(join(p, 'shared', 'scripts', 'docgen'))
      .filter(f => f.endsWith('.js'));
    assert.ok(files.length >= 10, `Esperaba >=10 archivos docgen, obtuve ${files.length}`);
  });

  test('shared/scripts/lib/ NO existe (infra CLI de arai)', () => {
    const p = initFull();
    assert.ok(!existsSync(join(p, 'shared', 'scripts', 'lib')),
      'No debe copiar lib/ (infraestructura CLI de arai)');
  });

  test('shared/scripts/ tiene docgen-vault.js', () => {
    const p = initFull();
    assert.ok(existsSync(join(p, 'shared', 'scripts', 'docgen-vault.js')),
      'Debe tener docgen-vault.js');
  });

  test('assets/templates/ tiene deck.css y report.css', () => {
    const p = initFull();
    assert.ok(existsSync(join(p, 'assets', 'templates', 'deck.css')),
      'Debe tener deck.css');
    assert.ok(existsSync(join(p, 'assets', 'templates', 'report.css')),
      'Debe tener report.css');
  });

  test('assets/templates/specs/ tiene document templates', () => {
    const p = initFull();
    assertDir(join(p, 'assets', 'templates', 'specs'));
    const specs = readdirSync(join(p, 'assets', 'templates', 'specs'))
      .filter(f => f.endsWith('.json'));
    assert.ok(specs.length >= 10, `Esperaba >=10 spec templates, obtuve ${specs.length}`);
  });

  /* ─── AGENTS.md ─── */

  test('AGENTS.md referencia .opencode/skills (no shared/skills)', () => {
    const p = initFull();
    const content = readFileSync(join(p, 'AGENTS.md'), 'utf8');
    assert.ok(content.includes('.opencode/skills'),
      'AGENTS.md debe referenciar .opencode/skills');
    assert.ok(!content.includes('shared/skills'),
      'AG wś.md no debe referenciar shared/skills');
  });

  test('AGENTS.md tiene sección de scripts disponibles', () => {
    const p = initFull();
    const content = readFileSync(join(p, 'AGENTS.md'), 'utf8');
    assert.ok(content.includes('scripts') || content.includes('Scripts'),
      'AGENTS.md debe mencionar scripts');
  });

  /* ─── template minimal ─── */

  test('minimal: .opencode/skills/ tiene 2 skills', () => {
    const p = initMinimal();
    const skills = readdirSync(join(p, '.opencode', 'skills'))
      .filter(f => statSync(join(p, '.opencode', 'skills', f)).isDirectory());
    assert.equal(skills.length, 2, `Minimal debe tener 2 skills, obtuve ${skills.length}`);
  });

  test('minimal: NO tiene shared/scripts/', () => {
    const p = initMinimal();
    assert.ok(!existsSync(join(p, 'shared', 'scripts')),
      'Minimal no debe tener shared/scripts/');
  });

  test('minimal: opencode.json en raíz', () => {
    const p = initMinimal();
    assertFile(join(p, 'opencode.json'));
  });

  test('minimal: NO tiene platforms/', () => {
    const p = initMinimal();
    assert.ok(!existsSync(join(p, 'platforms')),
      'Minimal no debe tener platforms/');
  });

  test('minimal: NO tiene .opencode/plugins/', () => {
    const p = initMinimal();
    assert.ok(!existsSync(join(p, '.opencode', 'plugins')),
      'Minimal no debe tener plugins');
  });

  test('minimal: NO tiene .opencode/tui.json', () => {
    const p = initMinimal();
    assert.ok(!existsSync(join(p, '.opencode', 'tui.json')),
      'Minimal no debe tener tui.json');
  });

  test('minimal: NO tiene .opencode/agents/', () => {
    const p = initMinimal();
    assert.ok(!existsSync(join(p, '.opencode', 'agents')),
      'Minimal no debe tener agents');
  });

  test('minimal: NO tiene .opencode/commands/', () => {
    const p = initMinimal();
    assert.ok(!existsSync(join(p, '.opencode', 'commands')),
      'Minimal no debe tener commands');
  });
});
