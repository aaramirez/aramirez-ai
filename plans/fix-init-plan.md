# Plan: Fix `arai init` — Generación Funcional de Harnesses para OpenCode

## Problema Central

**aramirez-ai** es un generador de harnesses. Tiene dos estructuras distintas:

| Contexto | Estructura | Propósito |
|----------|-----------|-----------|
| **Repo aramirez-ai** (fuente) | `shared/skills/`, `platforms/opencode/` | Assets reutilizables, el generador |
| **Harness generado** (salida) | `.opencode/skills/`, `opencode.json` | Proyecto opencode funcional |

**Bug actual**: `arai init` copia la estructura de aramirez-ai directamente al proyecto generado, creando `shared/skills/` y `platforms/opencode/opencode.json` en vez de la estructura nativa `.opencode/`.

**Estructura correcta del harness generado** (ya documentada en `05-Harness/01-que-es-un-harness.md`):
```
mi-proyecto/
├── opencode.json              ← raíz del proyecto (nativo)
├── AGENTS.md
├── .opencode/
│   ├── skills/                ← descubrimiento nativo
│   ├── agents/                ← descubrimiento nativo
│   └── commands/              ← descubrimiento nativo
├── shared/
│   └── scripts/               ← automatización (no es config de opencode)
├── package.json
└── .gitignore
```

**Estructura actual rota** (descrita en `02-Comandos/01-init.md`):
```
mi-proyecto/
├── platforms/opencode/        ← ← estructura de aramirez-ai copiada
│   ├── opencode.json          ← opencode no lo encuentra aquí
│   ├── agents/                ← ubicación incorrecta
│   ├── commands/              ← ubicación incorrecta
│   ├── node_modules/          ← 61MB de deps de aramirez-ai
│   ├── plugins/               ← plugins específicos de aramirez-ai
│   └── tui-plugins/           ← plugins TUI de aramirez-ai
├── shared/skills/             ← ubicación no estándar
└── ...
```

---

## Causas Raíz

### RC-1: `scaffoldProject()` copia `platforms/opencode/` ciegamente
**Archivo**: `shared/scripts/lib/scaffold.js:78-94`

`cpSync(src, dst, { recursive: true })` copia todo incluyendo:
- `node_modules/` (61MB) — deps de plugins de aramirez-ai
- `package.json` — manifierto de deps de aramirez-ai
- `package-lock.json` — lockfile de aramirez-ai
- `plugins/` — plugins TypeScript específicos (engram.ts, example.ts)
- `tui-plugins/` — plugins TUI específicos (custom-logo.tsx)

### RC-2: Config va a `platforms/opencode/opencode.json` en vez de raíz
**Archivo**: `shared/scripts/lib/scaffold.js:81-83`

Opencode lee `opencode.json` desde la raíz del proyecto, no desde `platforms/opencode/`.

### RC-3: Skills van a `shared/skills/` en vez de `.opencode/skills/`
**Archivo**: `shared/scripts/lib/scaffold.js:37-47`

El descubrimiento nativo de opencode solo busca en `.opencode/skills/`.

### RC-4: Agents/commands van a `platforms/opencode/` en vez de `.opencode/`
**Archivo**: `shared/scripts/lib/scaffold.js:78-94`

### RC-5: `resolveScripts()` omite directorios
**Archivo**: `shared/scripts/lib/template-utils.js:53-63`

`statSync(p).isFile()` excluye `docgen/` (12 archivos). Los 18 `create-*.js` importan `create-base.js` que nunca se copia.

### RC-6: No hay modelo de dependencias skill→script
Los skills referencian scripts en su texto pero no declaran dependencias en frontmatter.

### RC-7: `opencode.json` tiene rutas relativas al repo
`../shared/skills` es correcto desde `platforms/opencode/` en aramirez-ai pero incorrecto desde un harness generado.

### RC-8: AGENTS.md parcial no tiene sección de scripts
No hay `{{scripts_table}}`.

### RC-9: Tutoriales inconsistentes
- `05-Harness/01-que-es-un-harness.md` describe la estructura CORRECTA
- `02-Comandos/01-init.md` describe la estructura ROTA
- `03-arquitectura.md` muestra la estructura correcta en el diagrama

---

## Enfoque TDD: Tests Primero

### Fase 1: Escribir tests que definen el comportamiento correcto

**Nuevo archivo**: `tests/commands/init-harness.test.js`

```js
import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { runArai, tmpDir, cleanup, assertFile, assertDir, assertNoFile, assertExitCode } from '../helpers.js';

describe('arai init — generación de harness funcional', () => {
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

  // ─── opencode.json en raíz ───

  test('opencode.json está en la raíz del proyecto', () => {
    const p = initFull();
    assertFile(join(p, 'opencode.json'));
  });

  test('NO existe platforms/opencode/', () => {
    const p = initFull();
    assert.ok(!existsSync(join(p, 'platforms')),
      'No debe existir directorio platforms/');
  });

  // ─── .opencode/ estructura nativa ───

  test('.opencode/skills/ contiene todas las skills', () => {
    const p = initFull();
    assertDir(join(p, '.opencode', 'skills'));
    const skills = readdirSync(join(p, '.opencode', 'skills'))
      .filter(f => statSync(join(p, '.opencode', 'skills', f)).isDirectory());
    assert.equal(skills.length, 30, `Esperaba 30 skills, obtuve ${skills.length}`);
  });

  test('.opencode/agents/ contiene archivos .md', () => {
    const p = initFull();
    assertDir(join(p, '.opencode', 'agents'));
    const agents = readdirSync(join(p, '.opencode', 'agents'))
      .filter(f => f.endsWith('.md'));
    assert.ok(agents.length >= 5, `Esperaba >=5 agents, obtuve ${agents.length}`);
  });

  test('.opencode/commands/ contiene archivos .md', () => {
    const p = initFull();
    assertDir(join(p, '.opencode', 'commands'));
    const cmds = readdirSync(join(p, '.opencode', 'commands'))
      .filter(f => f.endsWith('.md'));
    assert.ok(cmds.length >= 3, `Esperaba >=3 commands, obtuve ${cmds.length}`);
  });

  // ─── Sin internals de aramirez-ai ───

  test('NO hay node_modules en ninguna parte', () => {
    const p = initFull();
    assert.ok(!existsSync(join(p, 'node_modules')));
    assert.ok(!existsSync(join(p, '.opencode', 'node_modules')));
  });

  test('NO hay package-lock.json', () => {
    const p = initFull();
    assert.ok(!existsSync(join(p, 'package-lock.json')));
  });

  test('NO hay plugins de aramirez-ai', () => {
    const p = initFull();
    assert.ok(!existsSync(join(p, '.opencode', 'plugins', 'engram.ts')));
    assert.ok(!existsSync(join(p, '.opencode', 'plugins', 'example.ts')));
  });

  // ─── package.json en raíz ───

  test('package.json en raíz con nombre del proyecto', () => {
    const p = initFull();
    assertFile(join(p, 'package.json'));
    const pkg = JSON.parse(readFileSync(join(p, 'package.json'), 'utf8'));
    assert.equal(pkg.name, 'harness-proj');
    assert.equal(pkg.type, 'module');
  });

  // ─── opencode.json rutas correctas ───

  test('opencode.json NO tiene skills.paths (descubrimiento nativo)', () => {
    const p = initFull();
    const config = JSON.parse(readFileSync(join(p, 'opencode.json'), 'utf8'));
    assert.ok(!config.skills?.paths, 'No debe tener skills.paths');
  });

  test('opencode.json references apuntan a ./shared/', () => {
    const p = initFull();
    const config = JSON.parse(readFileSync(join(p, 'opencode.json'), 'utf8'));
    if (config.references?.['shared-scripts']) {
      assert.equal(config.references['shared-scripts'].path, './shared/scripts');
    }
  });

  // ─── scripts en shared/scripts/ ───

  test('shared/scripts/ tiene create-base.js', () => {
    const p = initFull();
    assert.ok(existsSync(join(p, 'shared', 'scripts', 'create-base.js')));
  });

  test('shared/scripts/docgen/ existe con archivos', () => {
    const p = initFull();
    assertDir(join(p, 'shared', 'scripts', 'docgen'));
    const files = readdirSync(join(p, 'shared', 'scripts', 'docgen'))
      .filter(f => f.endsWith('.js'));
    assert.ok(files.length >= 10, `Esperaba >=10, obtuve ${files.length}`);
  });

  test('shared/scripts/lib/ NO existe (infra CLI)', () => {
    const p = initFull();
    assert.ok(!existsSync(join(p, 'shared', 'scripts', 'lib')));
  });

  // ─── AGENTS.md ───

  test('AGENTS.md referencia .opencode/skills', () => {
    const p = initFull();
    const content = readFileSync(join(p, 'AGENTS.md'), 'utf8');
    assert.ok(content.includes('.opencode/skills'));
    assert.ok(!content.includes('shared/skills'));
  });

  test('AGENTS.md tiene sección de scripts', () => {
    const p = initFull();
    const content = readFileSync(join(p, 'AGENTS.md'), 'utf8');
    assert.ok(content.includes('## Available scripts') || content.includes('## Scripts'));
  });

  // ─── template minimal ───

  test('minimal: .opencode/skills/ tiene 2 skills', () => {
    dir = tmpDir();
    projectDir = join(dir, 'min-proj');
    runArai(['init', projectDir, '--template', 'minimal']);
    const skills = readdirSync(join(projectDir, '.opencode', 'skills'))
      .filter(f => statSync(join(projectDir, '.opencode', 'skills', f)).isDirectory());
    assert.equal(skills.length, 2);
  });

  test('minimal: NO tiene shared/scripts/', () => {
    dir = tmpDir();
    projectDir = join(dir, 'min-proj2');
    runArai(['init', projectDir, '--template', 'minimal']);
    assert.ok(!existsSync(join(projectDir, 'shared', 'scripts')));
  });
});
```

### Fase 2: Ejecutar tests — todos deben FALLAR (rojo)

```bash
node --test tests/commands/init-harness.test.js
```

### Fase 3: Implementar cambios para que pasen (verde)

Ver Cambios abajo.

### Fase 4: Refactorizar + suite completa

```bash
npm test
```

---

## Cambios a Implementar

### Cambio 1: Reescribir manejo de plataforma en scaffold.js

**Archivo**: `shared/scripts/lib/scaffold.js`

**Reemplazar** el bloque `include.platforms` (líneas 78-94) con generación de estructura nativa `.opencode/`:

```js
if ((include.platforms || []).includes('opencode')) {
  const opencodeSrc = join(REPO_ROOT, 'platforms', 'opencode');
  const dotOpenCode = join(absTarget, '.opencode');

  // 1. Copiar agents → .opencode/agents/
  const agentsSrc = join(opencodeSrc, 'agents');
  if (isDir(agentsSrc)) {
    cpSync(agentsSrc, join(dotOpenCode, 'agents'), { recursive: true });
  }

  // 2. Copiar commands → .opencode/commands/
  const commandsSrc = join(opencodeSrc, 'commands');
  if (isDir(commandsSrc)) {
    cpSync(commandsSrc, join(dotOpenCode, 'commands'), { recursive: true });
  }

  // 3. Crear .opencode/skills/ (vacío — skills van desde shared/skills/)
  ensureDir(join(dotOpenCode, 'skills'));

  // 4. Generar opencode.json en raíz con rutas correctas
  const configSrc = join(opencodeSrc, 'opencode.json');
  if (existsSync(configSrc)) {
    let configObj = JSON.parse(readFileSync(configSrc, 'utf8'));

    // Aplicar variables
    for (const [k, v] of Object.entries(allVars)) {
      const str = JSON.stringify(configObj);
      configObj = JSON.parse(str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v));
    }

    // Eliminar skills.paths (descubrimiento nativo .opencode/skills/)
    delete configObj.skills;

    // Corregir rutas de references
    if (configObj.references) {
      for (const ref of Object.values(configObj.references)) {
        if (ref.path) ref.path = ref.path.replace(/\.\.\/shared\//, './shared/');
      }
    }

    // Eliminar MCP servers específicos de aramirez-ai
    if (configObj.mcp) {
      delete configObj.mcp.engram;
      delete configObj.mcp.context7;
    }

    writeFileSync(join(absTarget, 'opencode.json'),
      JSON.stringify(configObj, null, 2) + '\n');
  }
}
```

### Cambio 2: Skills van a `.opencode/skills/`

**Archivo**: `shared/scripts/lib/scaffold.js`

**Reemplazar** el loop de skills (líneas 37-47):

```js
const skillsToCopy = resolveItems('skills', include.skills || []);
for (const skill of skillsToCopy) {
  const src = join(REPO_ROOT, 'shared', 'skills', skill, 'SKILL.md');
  if (existsSync(src)) {
    const dstDir = join(absTarget, '.opencode', 'skills', skill);
    ensureDir(dstDir);
    writeFileSync(join(dstDir, 'SKILL.md'), readFileSync(src, 'utf8'));
  } else {
    log(`Skill '${skill}' no encontrada en shared/skills/`, 'warn');
  }
}
```

### Cambio 3: Fix `resolveScripts()` para incluir directorios

**Archivo**: `shared/scripts/lib/template-utils.js` — líneas 53-63

```js
function resolveScripts(items) {
  if (items.length === 1 && items[0] === '*') {
    const dir = join(REPO_ROOT, 'shared', 'scripts');
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter(f => {
      if (f === '.gitkeep' || f === 'lib') return false;
      const p = join(dir, f);
      return statSync(p).isFile() || statSync(p).isDirectory();
    });
  }
  return items;
}
```

### Cambio 4: Fix scaffold script copy loop para directorios

**Archivo**: `shared/scripts/lib/scaffold.js` — líneas 49-58

```js
for (const script of resolveScripts(include.scripts || [])) {
  const src = join(REPO_ROOT, 'shared', 'scripts', script);
  if (!existsSync(src)) {
    log(`Script '${script}' no encontrado`, 'warn');
    continue;
  }
  const dstBase = join(absTarget, 'shared', 'scripts');
  if (statSync(src).isDirectory()) {
    cpSync(src, join(dstBase, script), { recursive: true });
  } else {
    ensureDir(dstBase);
    writeFileSync(join(dstBase, script), readFileSync(src, 'utf8'));
  }
}
```

### Cambio 5: Agregar `scripts:` frontmatter a 22 skills

**Formato**:
```yaml
---
name: agent-creator
description: Create primary agent definitions...
license: MIT
scripts:
  - create-agent.js
  - create-base.js
---
```

**Mapeo completo**:

| Skill | `scripts:` |
|-------|-----------|
| agent-creator | `[create-agent.js, create-base.js]` |
| architecture-creator | `[create-architecture.js, create-base.js]` |
| command-creator | `[create-command.js, create-base.js]` |
| config-creator | `[create-config.js, create-base.js]` |
| document-generation | `[docgen/]` |
| email | `[send-email.js, mcp-email.js]` |
| flow-creator | `[create-flow.js, create-base.js]` |
| harness-creator | `[harness-generator.js, create-base.js]` |
| instructions-creator | `[create-instructions.js, create-base.js]` |
| mcp-creator | `[create-mcp.js, create-base.js]` |
| permission-creator | `[create-permission.js, create-base.js]` |
| plugin-creator | `[create-plugin.js, create-base.js]` |
| prompt-creator | `[create-prompt.js, create-base.js]` |
| reference-creator | `[create-reference.js, create-base.js]` |
| rule-creator | `[create-rule.js, create-base.js]` |
| script-creator | `[create-script.js, create-base.js]` |
| skill-creator | `[create-skill.js, create-base.js]` |
| specialized-agent-creator | `[create-specialized-agent.js, create-base.js]` |
| subagent-creator | `[create-subagent.js, create-base.js]` |
| tool-creator | `[create-tool.js, create-base.js]` |
| vault-pdf-export | `[docgen-vault.js, docgen/]` |
| youtube | `[youtube-transcript.js]` |

### Cambio 6: Agregar `installSkillScripts()` a install.js

**Archivo**: `shared/scripts/lib/install.js`

Cuando se instala un skill, también copiar sus scripts declarados en frontmatter.

### Cambio 7: Agregar `scripts_table` a AGENTS.md

**Archivo**: `shared/templates/partials/AGENTS.md` — agregar `{{scripts_table}}`

**Archivo**: `shared/scripts/lib/agents-md.js` — agregar `buildScriptsTable()`

### Cambio 8: Actualizar `buildVarsFromProjectState()` para nueva estructura

**Archivo**: `shared/scripts/lib/agents-md.js`

Escanear `.opencode/skills/` en vez de `shared/skills/`.

---

## Actualización de Tutoriales

### Tutoriales que DEBEN actualizarse

| Archivo | Cambio necesario |
|---------|-----------------|
| `02-Comandos/01-init.md` | Reemplazar estructura rota por `.opencode/` nativa |
| `02-Comandos/02-install.md` | Verificar que describe `.opencode/` correctamente |
| `02-Comandos/03-sync.md` | Actualizar rutas de sync |
| `00-Introduccion/03-arquitectura.md` | Diagrama ya correcto, verificar flujo de instalación |
| `01-Instalacion/02-primer-proyecto.md` | Actualizar resultado de `arai init` |
| `01-Instalacion/03-instalar-en-existente.md` | Verificar paths |
| `05-Harness/01-que-es-un-harness.md` | Ya tiene estructura correcta, verificar |
| `05-Harness/04-ciclo-completo.md` | Actualizar ejemplo de init |
| `11-Casos-de-uso/04-crear-harness-completo.md` | Actualizar ejemplo completo |
| `11-Casos-de-uso/05-migrar-proyecto-existente.md` | Actualizar migración |

### Tutoriales que NO necesitan cambios

Los tutoriales de skills, agents, MCP, configuración, documentación y CI no referencian la estructura de archivos directamente.

---

## Actualización de README.md

### Cambios necesarios

1. **Sección "Instalación"**: Actualizar output de `arai install` para mostrar `.opencode/`
2. **Sección "CLI: arai"**: Verificar que `arai init` describe estructura correcta
3. **Agregar sección "Filosofía"**: Explicar que arai es un generador y el harness generado es independiente
4. **Actualizar diagrama** si existe

### Nueva sección: "Filosofía arai"

```markdown
## Filosofía

**aramirez-ai** es un generador de harnesses para opencode. No es un proyecto
que se copia tal cual — es un generador que produce harnesses funcionales.

| Componente | En aramirez-ai | En harness generado |
|-----------|---------------|-------------------|
| Skills | `shared/skills/` | `.opencode/skills/` |
| Agents | `platforms/opencode/agents/` | `.opencode/agents/` |
| Commands | `platforms/opencode/commands/` | `.opencode/commands/` |
| Config | `platforms/opencode/opencode.json` | `opencode.json` (raíz) |
| Scripts | `shared/scripts/` | `shared/scripts/` |

El harness generado usa estructura **nativa de opencode** — sin workarounds
como `skills.paths`. OpenCode descubre todo desde `.opencode/`.
```

---

## Resumen de Cambios por Archivo

| Archivo | Cambio |
|---------|--------|
| `shared/scripts/lib/scaffold.js` | Reescritura completa: `.opencode/` nativo, `opencode.json` en raíz |
| `shared/scripts/lib/template-utils.js` | Fix `resolveScripts()` para incluir directorios |
| `shared/scripts/lib/install.js` | Agregar `installSkillScripts()` |
| `shared/scripts/lib/agents-md.js` | Agregar `buildScriptsTable()`, escanear `.opencode/skills/` |
| `shared/templates/partials/AGENTS.md` | Agregar `{{scripts_table}}` |
| `shared/skills/*/SKILL.md` (22 archivos) | Agregar `scripts:` frontmatter |
| `shared/templates/partials/skill.md` | Actualizar template |
| `tests/commands/init-harness.test.js` | NUEVO: 15+ tests para estructura correcta |
| `tests/commands/init.test.js` | Actualizar tests existentes |
| `tests/integration/outcome-init.test.js` | Actualizar para rutas `.opencode/` |
| `tutoriales-arai/02-Comandos/01-init.md` | Actualizar estructura generada |
| `tutoriales-arai/02-Comandos/02-install.md` | Verificar paths |
| `tutoriales-arai/02-Comandos/03-sync.md` | Actualizar rutas |
| `tutoriales-arai/01-Instalacion/02-primer-proyecto.md` | Actualizar resultado init |
| `tutoriales-arai/05-Harness/04-ciclo-completo.md` | Actualizar ejemplo |
| `tutoriales-arai/11-Casos-de-uso/04-crear-harness-completo.md` | Actualizar ejemplo |
| `tutoriales-arai/11-Casos-de-uso/05-migrar-proyecto-existente.md` | Actualizar migración |
| `README.md` | Agregar filosofía, actualizar estructura |
| `AGENTS.md` | Actualizar si es necesario |

---

## Orden de Implementación (TDD)

1. **Escribir tests** (`init-harness.test.js`) — definir comportamiento correcto
2. **Ejecutar tests** — confirmar que FALLAN (rojo)
3. **Fix `resolveScripts()`** — desbloquea scripts docgen
4. **Fix scaffold script copy loop** — maneja directorios
5. **Reescribir scaffold platform handling** — estructura `.opencode/` nativa
6. **Agregar `scripts:` frontmatter** a 22 skills
7. **Agregar `installSkillScripts()`** a install.js
8. **Agregar `scripts_table`** a AGENTS.md
9. **Actualizar `agents-md.js`** para nuevas rutas
10. **Actualizar tutoriales** — 10 archivos
11. **Actualizar README.md** — filosofía + estructura
12. **Ejecutar tests** — confirmar que PASAN (verde)
13. **Suite completa** — `npm test`
14. **Smoke test manual** — `arai init /tmp/test --template full`

---

## Verificación Final

```bash
# Tests
npm test

# Smoke test
arai init /tmp/test-full --template full

# Verificar estructura nativa
ls /tmp/test-full/opencode.json                          # ✓ en raíz
ls /tmp/test-full/.opencode/skills/ | wc -l              # 30
ls /tmp/test-full/.opencode/agents/*.md | wc -l          # >=5
ls /tmp/test-full/.opencode/commands/*.md | wc -l        # >=3

# Verificar sin internals
test -d /tmp/test-full/platforms && echo "FAIL" || echo "OK"
test -d /tmp/test-full/node_modules && echo "FAIL" || echo "OK"

# Verificar scripts
ls /tmp/test-full/shared/scripts/docgen/ | wc -l        # 12
ls /tmp/test-full/shared/scripts/create-base.js         # ✓

# Verificar opencode.json
python3 -c "import json; d=json.load(open('/tmp/test-full/opencode.json')); print('skills' not in d)"

# Verificar AGENTS.md
grep ".opencode/skills" /tmp/test-full/AGENTS.md

# Cleanup
rm -rf /tmp/test-full
```
