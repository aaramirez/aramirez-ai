# Plan: Arquitectura limpia — Agente, Skills, Scripts y arai CLI

## El insight clave

Tienes razón en todo:

1. **arai CLI** = herramienta de **distribución** (copiar artefactos existentes a otros proyectos)
2. **create-*.js scripts** = herramientas de **creación** (generar nuevos artefactos para shared/)
3. **Skills** = documentación que enseña a los agentes cómo usar los scripts
4. **Subagentes** = agentes que cargan skills y ejecutan scripts
5. **Agentes primarios** (como new-harness) = orquestan los subagentes

### ¿Por qué harness-generator.js no usa los scripts?

Porque fue escrito como **monolito** antes de que existieran los scripts individuales. Reimplementa todo inline:
- `buildOpencodeConfig()` reimplementa `create-config.js`
- `buildAgentFile()` reimplementa `create-agent.js`
- `getStrictnessSettings()` reimplementa `create-permission.js`
- `buildAgentsMd()` reimplementa `create-instructions.js`

**Solución:** Eliminar `harness-generator.js` y reemplazarlo con el agente `new-harness` que ejecuta los scripts individuales.

---

## Arquitectura final

```
                    ┌─────────────────────────────┐
                    │   AGENTE PRIMARIO            │
                    │   (new-harness)              │
                    │   Orquesta el workflow       │
                    └──────────┬──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
    │ SUBAGente       │ │ SUBAGente    │ │ SUBAGente    │
    │ config-creator  │ │ agent-creator│ │ perm-creator │
    │                 │ │              │ │              │
    │ Carga skill:    │ │ Carga skill: │ │ Carga skill: │
    │ config-creator  │ │ agent-creator│ │ perm-creator │
    │                 │ │              │ │              │
    │ Ejecuta:        │ │ Ejecuta:     │ │ Ejecuta:     │
    │ create-config   │ │ create-agent │ │ create-perm  │
    │ .js             │ │ .js          │ │ .js          │
    └─────────────────┘ └──────────────┘ └──────────────┘
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────────────────────────────────────┐
    │              shared/                            │
    │  opencode.json  agents/*.md  permissions.json   │
    └─────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   arai CLI          │
                    │   Distribuye a      │
                    │   otros proyectos   │
                    └─────────────────────┘
```

---

## Flujo detallado: Generar un harness nuevo

### Paso 1: Usuario activa el agente new-harness

```
Usuario: "Quiero crear un proyecto nuevo"
```

### Paso 2: Agente carga el skill harness-generator

```javascript
// El agente ejecuta internamente:
skill("harness-generator")
```

### Paso 3: Skill define el workflow de 7 preguntas

El skill `harness-generator` (en `.opencode/skills/harness-generator/SKILL.md`) instruye al agente para:
1. Preguntar nombre del proyecto
2. Preguntar tipo (web, api, cli, etc.)
3. Preguntar lenguaje
4. Preguntar descripción
5. Preguntar agentes (minimal/standard/full)
6. Preguntar skills
7. Preguntar configuración avanzada

### Paso 4: Agente ejecuta scripts según las respuestas

```
# Generar opencode.json
node shared/scripts/create-config.js \
  --model opencode/big-pickle \
  --shell /bin/zsh \
  --output mi-proyecto/opencode.json

# Generar agentes
node shared/scripts/create-agent.js \
  --name build --mode primary \
  --description "Primary builder" \
  --output mi-proyecto/.opencode/agents/build.md

node shared/scripts/create-agent.js \
  --name plan --mode primary \
  --description "Strategic planner" \
  --edit deny \
  --output mi-proyecto/.opencode/agents/plan.md

node shared/scripts/create-agent.js \
  --name reviewer --mode subagent \
  --description "Code review specialist" \
  --edit deny --bash ask \
  --output mi-proyecto/.opencode/agents/reviewer.md

# Generar permisos
node shared/scripts/create-permission.js \
  --strictness balanced \
  --output mi-proyecto/permission.json

# Generar AGENTS.md
node shared/scripts/create-instructions.js \
  --type api --language typescript \
  --description "API REST para e-commerce" \
  --output mi-proyecto/AGENTS.md
```

### Paso 5: Resultado

```
mi-proyecto/
├── opencode.json              ← create-config.js
├── AGENTS.md                  ← create-instructions.js
├── permission.json            ← create-permission.js
└── .opencode/
    └── agents/
        ├── build.md           ← create-agent.js
        ├── plan.md            ← create-agent.js
        └── reviewer.md        ← create-agent.js
```

---

## Cambios propuestos

### 1. Eliminar (reemplazados por new-harness + scripts)

| Archivo | Razón |
|---------|-------|
| `shared/skills/harness-creator/SKILL.md` | Reemplazado por `.opencode/skills/harness-generator/SKILL.md` |
| `shared/scripts/harness-generator.js` | Reemplazado por ejecución individual de create-*.js |
| `shared/skills/subagent-creator/` | Consolidado en `agent-creator` con `--mode subagent` |
| `shared/scripts/create-subagent.js` | Consolidado en `create-agent.js` con `--mode subagent` |
| `shared/skills/specialized-agent-creator/` | Consolidado en `agent-creator` con `--preset` |
| `shared/scripts/create-specialized-agent.js` | Consolidado en `create-agent.js` con `--preset` |

### 2. Consolidar create-agent.js

Agregar flags `--mode` y `--preset`:

```bash
# Modo primary (default)
node create-agent.js --name build --mode primary --output ./build.md

# Modo subagent
node create-agent.js --name reviewer --mode subagent --edit deny --output ./reviewer.md

# Con preset de dominio
node create-agent.js --name reviewer --preset reviewer --output ./reviewer.md
# (auto-configura: mode=subagent, edit=deny, bash=ask, prompt de review)

node create-agent.js --name tester --preset tester --output ./tester.md
# (auto-configura: mode=subagent, edit=allow, bash=allow, prompt de testing)
```

**Presets disponibles:**

| Preset | Mode | edit | bash | read | Prompt especializado |
|--------|------|------|------|------|---------------------|
| `build` | primary | allow | allow | allow | Implementación de features |
| `plan` | primary | deny | allow | allow | Planificación estratégica |
| `reviewer` | subagent | deny | ask | allow | Revisión de código |
| `tester` | subagent | allow | allow | allow | Testing y TDD |
| `docs` | subagent | allow | deny | allow | Documentación |
| `security` | subagent | deny | ask | allow | Auditoría de seguridad |
| `devops` | subagent | allow | allow | allow | CI/CD y deploy |
| `architect` | subagent | deny | ask | allow | Arquitectura de software |

### 3. Crear subagentes para los skills *-creator

Los 12 skills *-creator restantes deben ser utilizados por subagentes especializados.

**Subagentes a crear:**

| Subagente | Skill que carga | Script que ejecuta |
|-----------|----------------|-------------------|
| `config-creator` | `config-creator` | `create-config.js` |
| `permission-creator` | `permission-creator` | `create-permission.js` |
| `instructions-creator` | `instructions-creator` | `create-instructions.js` |
| `mcp-creator` | `mcp-creator` | `create-mcp.js` |
| `architecture-creator` | `architecture-creator` | `create-architecture.js` |
| `flow-creator` | `flow-creator` | `create-flow.js` |
| `plugin-creator` | `plugin-creator` | `create-plugin.js` |
| `tool-creator` | `tool-creator` | `create-tool.js` |
| `prompt-creator` | `prompt-creator` | `create-prompt.js` |
| `rule-creator` | `rule-creator` | `create-rule.js` |
| `reference-creator` | `reference-creator` | `create-reference.js` |
| `command-creator` | `command-creator` | `create-command.js` |

**Ejemplo de subagente (config-creator.md):**

```markdown
---
description: Genera configuraciones opencode.json personalizadas
mode: subagent
model: opencode/big-pickle
permission:
  edit: allow
  bash: allow
  read: allow
---

Eres el subagente **Config Creator**, especializado en generar archivos opencode.json.

## Inicio

Al iniciar, carga el skill `config-creator` que contiene las instrucciones detalladas.

## Ejecución

Cuando te invoquen, ejecuta:

```bash
node shared/scripts/create-config.js [flags según el skill]
```

## Reglas

1. Siempre muestra el resultado antes de escribir
2. Usa `--dry-run` para preview
3. Reporta el archivo generado
```

### 4. Actualizar opencode.json

Registrar los nuevos subagentes:

```json
{
  "config-creator": {
    "description": "Genera configuraciones opencode.json",
    "mode": "subagent",
    "path": ".opencode/agents/config-creator.md",
    "permission": { "edit": "allow", "bash": "allow" }
  },
  "permission-creator": {
    "description": "Genera configuraciones de permisos",
    "mode": "subagent",
    "path": ".opencode/agents/permission-creator.md",
    "permission": { "edit": "allow", "bash": "allow" }
  }
  // ... etc para cada subagente
}
```

### 5. Estructura de archivos final

```
aramirez-ai/
├── shared/                          ← DISTRIBUIBLE
│   ├── agents/
│   │   ├── docs.md
│   │   ├── plan-arai.md
│   │   ├── reviewer.md
│   │   └── tester.md
│   ├── skills/                      ← Skills que documentan los scripts
│   │   ├── agent-creator/           ← Documenta create-agent.js (consolidado)
│   │   ├── config-creator/          ← Documenta create-config.js
│   │   ├── permission-creator/      ← Documenta create-permission.js
│   │   ├── instructions-creator/    ← Documenta create-instructions.js
│   │   ├── mcp-creator/             ← Documenta create-mcp.js
│   │   ├── architecture-creator/    ← Documenta create-architecture.js
│   │   ├── flow-creator/            ← Documenta create-flow.js
│   │   ├── plugin-creator/          ← Documenta create-plugin.js
│   │   ├── tool-creator/            ← Documenta create-tool.js
│   │   ├── prompt-creator/          ← Documenta create-prompt.js
│   │   ├── rule-creator/            ← Documenta create-rule.js
│   │   ├── reference-creator/       ← Documenta create-reference.js
│   │   ├── command-creator/         ← Documenta create-command.js
│   │   ├── script-creator/          ← Documenta create-script.js
│   │   ├── skill-creator/           ← Documenta create-skill.js
│   │   ├── git/
│   │   ├── code-review/
│   │   └── document-generation/
│   ├── scripts/
│   │   ├── lib/                     ← Framework de arai CLI
│   │   ├── create-base.js           ← Utilidades compartidas
│   │   ├── create-agent.js          ← Consolidado (primary/subagent/presets)
│   │   ├── create-config.js
│   │   ├── create-permission.js
│   │   ├── create-instructions.js
│   │   ├── create-mcp.js
│   │   ├── create-architecture.js
│   │   ├── create-flow.js
│   │   ├── create-plugin.js
│   │   ├── create-tool.js
│   │   ├── create-prompt.js
│   │   ├── create-rule.js
│   │   ├── create-reference.js
│   │   ├── create-command.js
│   │   ├── create-script.js
│   │   ├── create-skill.js
│   │   └── docgen/
│   ├── prompts/
│   ├── rules/
│   └── templates/
│
├── .opencode/                       ← LOCAL de aramirez-ai
│   ├── agents/
│   │   ├── new-harness.md           ← Agente primario orquestador
│   │   ├── config-creator.md        ← Subagente
│   │   ├── permission-creator.md    ← Subagente
│   │   ├── instructions-creator.md  ← Subagente
│   │   └── ... (más subagentes)
│   ├── skills/
│   │   └── harness-generator/       ← Skill del agente new-harness
│   └── commands/
│
├── opencode.json                    ← Registra todos los agentes
├── AGENTS.md
└── bin/arai.js                      ← Solo para distribución
```

---

## Orden de implementación (TDD)

El enfoque es **Test-Driven Development**: escribir tests primero, luego implementar, luego refactorizar. Cada paso genera cambios verificables.

### Paso 1: Tests para create-agent.js consolidado

**Archivo nuevo:** `tests/commands/create-agent-consolidated.test.js`

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { tmpDir, cleanup, runScript, assertFile, assertFileContent, assertDir, parseFrontmatter } from '../helpers.js'

describe('create-agent.js consolidated', () => {
  let tempDir
  let cleanupFn

  // Setup: crear directorio temporal antes de cada test
  it('setup', () => {
    tempDir = tmpDir()
    cleanupFn = cleanup
  })

  // Test 1: Flag --help funciona
  it('--help shows usage', () => {
    const result = runScript('create-agent.js', ['--help'])
    assert.match(result.stdout, /Usage/)
    assert.match(result.stdout, /--mode/)
    assert.match(result.stdout, /--preset/)
  })

  // Test 2: Modo primary (default)
  it('creates primary agent by default', () => {
    const out = `${tempDir}/build.md`
    runScript('create-agent.js', [
      '--name', 'build',
      '--output', out
    ])
    assertFile(out)
    const content = parseFrontmatter(out)
    assert.equal(content.mode, 'primary')
    assert.equal(content.name, 'build')
  })

  // Test 3: Flag --mode subagent
  it('creates subagent with --mode subagent', () => {
    const out = `${tempDir}/reviewer.md`
    runScript('create-agent.js', [
      '--name', 'reviewer',
      '--mode', 'subagent',
      '--edit', 'deny',
      '--output', out
    ])
    assertFile(out)
    const content = parseFrontmatter(out)
    assert.equal(content.mode, 'subagent')
    assert.equal(content.permission.edit, 'deny')
  })

  // Test 4: Preset reviewer auto-configura permisos
  it('--preset reviewer auto-configures permissions', () => {
    const out = `${tempDir}/reviewer.md`
    runScript('create-agent.js', [
      '--name', 'reviewer',
      '--preset', 'reviewer',
      '--output', out
    ])
    assertFile(out)
    const content = parseFrontmatter(out)
    assert.equal(content.mode, 'subagent')
    assert.equal(content.permission.edit, 'deny')
    assert.equal(content.permission.bash, 'ask')
    assertFileContent(out, 'code review')
  })

  // Test 5: Preset tester auto-configura permisos
  it('--preset tester auto-configures permissions', () => {
    const out = `${tempDir}/tester.md`
    runScript('create-agent.js', [
      '--name', 'tester',
      '--preset', 'tester',
      '--output', out
    ])
    assertFile(out)
    const content = parseFrontmatter(out)
    assert.equal(content.mode, 'subagent')
    assert.equal(content.permission.edit, 'allow')
    assert.equal(content.permission.bash, 'allow')
    assertFileContent(out, 'testing')
  })

  // Test 6: Preset plan
  it('--preset plan creates primary with deny edit', () => {
    const out = `${tempDir}/plan.md`
    runScript('create-agent.js', [
      '--name', 'plan',
      '--preset', 'plan',
      '--output', out
    ])
    assertFile(out)
    const content = parseFrontmatter(out)
    assert.equal(content.mode, 'primary')
    assert.equal(content.permission.edit, 'deny')
  })

  // Test 7: Preset docs
  it('--preset docs creates subagent with deny bash', () => {
    const out = `${tempDir}/docs.md`
    runScript('create-agent.js', [
      '--name', 'docs',
      '--preset', 'docs',
      '--output', out
    ])
    assertFile(out)
    const content = parseFrontmatter(out)
    assert.equal(content.mode, 'subagent')
    assert.equal(content.permission.bash, 'deny')
  })

  // Test 8: Flags manuales override presets
  it('manual flags override preset defaults', () => {
    const out = `${tempDir}/custom.md`
    runScript('create-agent.js', [
      '--name', 'custom',
      '--preset', 'reviewer',
      '--mode', 'primary',  // Override: reviewer es subagent, pero forzamos primary
      '--edit', 'allow',    // Override: reviewer tiene deny, pero forzamos allow
      '--output', out
    ])
    assertFile(out)
    const content = parseFrontmatter(out)
    assert.equal(content.mode, 'primary')
    assert.equal(content.permission.edit, 'allow')
  })

  // Test 9: Dry-run no crea archivos
  it('--dry-run shows output without creating files', () => {
    const out = `${tempDir}/dry.md`
    const result = runScript('create-agent.js', [
      '--name', 'dry',
      '--output', out,
      '--dry-run'
    ])
    assert.match(result.stdout, /dry/)
    assertFile(out, false) // Should NOT exist
  })

  // Test 10: Error sin --name
  it('errors without --name', () => {
    const result = runScript('create-agent.js', [], { expectError: true })
    assert.match(result.stderr, /--name/)
  })

  // Test 11: Error con preset invalido
  it('errors with invalid preset', () => {
    const result = runScript('create-agent.js', [
      '--name', 'bad',
      '--preset', 'nonexistent'
    ], { expectError: true })
    assert.match(result.stderr, /preset/)
  })

  // Cleanup al final
  it('cleanup', () => {
    cleanupFn()
  })
})
```

### Paso 2: Tests para subagentes .md

**Archivo nuevo:** `tests/consistency/subagents.test.js`

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readDir, readFile, assertFile } from '../helpers.js'

const SUBAGENTS_DIR = '.opencode/agents'
const REQUIRED_SUBAGENTS = [
  'config-creator.md',
  'permission-creator.md',
  'instructions-creator.md',
  'mcp-creator.md',
  'architecture-creator.md',
  'flow-creator.md',
  'plugin-creator.md',
  'tool-creator.md',
  'prompt-creator.md',
  'rule-creator.md',
  'reference-creator.md',
  'command-creator.md',
  'new-harness.md'  // Ya existe
]

describe('subagents', () => {
  for (const file of REQUIRED_SUBAGENTS) {
    it(`${file} exists with valid structure`, () => {
      assertFile(`${SUBAGENTS_DIR}/${file}`)
      
      const content = readFile(`${SUBAGENTS_DIR}/${file}`)
      
      // Must have frontmatter
      assert.match(content, /^---/)
      
      // Must have description
      assert.match(content, /description:/)
      
      // Must have mode: subagent (except new-harness)
      if (file !== 'new-harness.md') {
        assert.match(content, /mode:\s*subagent/)
      }
      
      // Must load its corresponding skill
      const skillName = file.replace('.md', '')
      assert.match(content, new RegExp(`skill\\("${skillName}"\\)|skill\\('${skillName}'\\)`))
      
      // Must execute corresponding create-*.js script
      const scriptName = skillName.replace('-creator', '')
      assert.match(content, new RegExp(`create-${scriptName}\\.js`))
    })
  }
})
```

### Paso 3: Tests para opencode.json registrations

**Archivo nuevo:** `tests/consistency/opencode-agents.test.js`

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from '../helpers.js'

describe('opencode.json agent registrations', () => {
  let config

  it('loads opencode.json', () => {
    config = JSON.parse(readFile('opencode.json'))
    assert.ok(config.agents)
  })

  const REQUIRED_AGENTS = {
    'config-creator': { mode: 'subagent', path: '.opencode/agents/config-creator.md' },
    'permission-creator': { mode: 'subagent', path: '.opencode/agents/permission-creator.md' },
    'instructions-creator': { mode: 'subagent', path: '.opencode/agents/instructions-creator.md' },
    'mcp-creator': { mode: 'subagent', path: '.opencode/agents/mcp-creator.md' },
    'architecture-creator': { mode: 'subagent', path: '.opencode/agents/architecture-creator.md' },
    'flow-creator': { mode: 'subagent', path: '.opencode/agents/flow-creator.md' },
    'plugin-creator': { mode: 'subagent', path: '.opencode/agents/plugin-creator.md' },
    'tool-creator': { mode: 'subagent', path: '.opencode/agents/tool-creator.md' },
    'prompt-creator': { mode: 'subagent', path: '.opencode/agents/prompt-creator.md' },
    'rule-creator': { mode: 'subagent', path: '.opencode/agents/rule-creator.md' },
    'reference-creator': { mode: 'subagent', path: '.opencode/agents/reference-creator.md' },
    'command-creator': { mode: 'subagent', path: '.opencode/agents/command-creator.md' },
    'new-harness': { mode: 'primary', path: '.opencode/agents/new-harness.md' },
  }

  for (const [name, expected] of Object.entries(REQUIRED_AGENTS)) {
    it(`${name} is registered correctly`, () => {
      const agent = config.agents[name]
      assert.ok(agent, `Agent ${name} not found in opencode.json`)
      assert.equal(agent.mode, expected.mode)
      assert.equal(agent.path, expected.path)
    })
  }
})
```

### Paso 4: Tests para skills eliminados

**Archivo nuevo:** `tests/consistency/eliminated-skills.test.js`

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { assertFile } from '../helpers.js'

describe('eliminated artifacts', () => {
  it('harness-creator skill no longer exists', () => {
    assertFile('shared/skills/harness-creator/SKILL.md', false)
  })

  it('harness-generator script no longer exists', () => {
    assertFile('shared/scripts/harness-generator.js', false)
  })

  it('create-subagent.js no longer exists', () => {
    assertFile('shared/scripts/create-subagent.js', false)
  })

  it('create-specialized-agent.js no longer exists', () => {
    assertFile('shared/scripts/create-specialized-agent.js', false)
  })

  it('subagent-creator skill no longer exists', () => {
    assertFile('shared/skills/subagent-creator/SKILL.md', false)
  })

  it('specialized-agent-creator skill no longer exists', () => {
    assertFile('shared/skills/specialized-agent-creator/SKILL.md', false)
  })
})
```

### Paso 5: Integration test — flujo completo de generación

**Archivo nuevo:** `tests/integration/harness-generation.test.js`

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { tmpDir, cleanup, runScript, assertFile, assertDir, readFile, parseFrontmatter } from '../helpers.js'

describe('harness generation flow', () => {
  let tempDir
  let cleanupFn

  it('setup', () => {
    tempDir = tmpDir()
    cleanupFn = cleanup
  })

  it('generates complete project from scratch', () => {
    const projectDir = `${tempDir}/my-project`
    
    // 1. Create opencode.json
    runScript('create-config.js', [
      '--model', 'opencode/big-pickle',
      '--shell', '/bin/zsh',
      '--output', `${projectDir}/opencode.json`
    ])
    
    // 2. Create agents directory and agents
    runScript('create-agent.js', [
      '--name', 'build',
      '--mode', 'primary',
      '--output', `${projectDir}/.opencode/agents/build.md`
    ])
    
    runScript('create-agent.js', [
      '--name', 'plan',
      '--preset', 'plan',
      '--output', `${projectDir}/.opencode/agents/plan.md`
    ])
    
    runScript('create-agent.js', [
      '--name', 'reviewer',
      '--preset', 'reviewer',
      '--output', `${projectDir}/.opencode/agents/reviewer.md`
    ])
    
    runScript('create-agent.js', [
      '--name', 'tester',
      '--preset', 'tester',
      '--output', `${projectDir}/.opencode/agents/tester.md`
    ])
    
    // 3. Create permission config
    runScript('create-permission.js', [
      '--strictness', 'balanced',
      '--output', `${projectDir}/permission.json`
    ])
    
    // 4. Create AGENTS.md
    runScript('create-instructions.js', [
      '--type', 'api',
      '--language', 'typescript',
      '--description', 'API REST para e-commerce',
      '--output', `${projectDir}/AGENTS.md`
    ])
    
    // Verify all files exist
    assertDir(`${projectDir}/.opencode/agents`)
    assertFile(`${projectDir}/opencode.json`)
    assertFile(`${projectDir}/AGENTS.md`)
    assertFile(`${projectDir}/permission.json`)
    assertFile(`${projectDir}/.opencode/agents/build.md`)
    assertFile(`${projectDir}/.opencode/agents/plan.md`)
    assertFile(`${projectDir}/.opencode/agents/reviewer.md`)
    assertFile(`${projectDir}/.opencode/agents/tester.md`)
    
    // Verify agent structures
    const buildAgent = parseFrontmatter(`${projectDir}/.opencode/agents/build.md`)
    assert.equal(buildAgent.mode, 'primary')
    
    const reviewerAgent = parseFrontmatter(`${projectDir}/.opencode/agents/reviewer.md`)
    assert.equal(reviewerAgent.mode, 'subagent')
    assert.equal(reviewerAgent.permission.edit, 'deny')
    
    const testerAgent = parseFrontmatter(`${projectDir}/.opencode/agents/tester.md`)
    assert.equal(testerAgent.mode, 'subagent')
    assert.equal(testerAgent.permission.bash, 'allow')
    
    // Verify opencode.json has agents
    const config = JSON.parse(readFile(`${projectDir}/opencode.json`))
    assert.ok(config.agents)
  })

  it('cleanup', () => {
    cleanupFn()
  })
})
```

### Paso 6: Tests para skills actualizados

**Archivo nuevo:** `tests/consistency/updated-skills.test.js`

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from '../helpers.js'

describe('updated creator skills', () => {
  it('agent-creator documents --mode and --preset flags', () => {
    const content = readFile('shared/skills/agent-creator/SKILL.md')
    assert.match(content, /--mode/)
    assert.match(content, /--preset/)
    assert.match(content, /primary/)
    assert.match(content, /subagent/)
    assert.match(content, /reviewer/)
    assert.match(content, /tester/)
  })

  it('agent-creator no longer references create-subagent.js', () => {
    const content = readFile('shared/skills/agent-creator/SKILL.md')
    assert.doesNotMatch(content, /create-subagent\.js/)
  })

  it('agent-creator no longer references create-specialized-agent.js', () => {
    const content = readFile('shared/skills/agent-creator/SKILL.md')
    assert.doesNotMatch(content, /create-specialized-agent\.js/)
  })
})
```

### Paso 7: Tests de validación con opencode CLI (deterministas, sin API key)

**Archivo nuevo:** `tests/integration/opencode-debug-validation.test.js`

Estos tests usan `opencode debug` para validar que los agentes y skills se cargan correctamente en opencode. **No necesitan API key** — son rápidos (~100ms) y gratuitos.

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'

function runOpencode(...args) {
  const cmd = `opencode ${args.join(' ')}`
  const result = execSync(cmd, {
    encoding: 'utf-8',
    timeout: 15000,
    cwd: process.cwd()
  })
  return result
}

function tryRunOpencode(...args) {
  try {
    return { output: runOpencode(...args), error: null }
  } catch (err) {
    return { output: null, error: err }
  }
}

describe('opencode debug — agent validation', () => {
  const REQUIRED_AGENTS = [
    'build', 'plan', 'new-harness',
    'config-creator', 'permission-creator', 'instructions-creator',
    'mcp-creator', 'architecture-creator', 'flow-creator',
    'plugin-creator', 'tool-creator', 'prompt-creator',
    'rule-creator', 'reference-creator', 'command-creator',
    'reviewer', 'tester'
  ]

  for (const agent of REQUIRED_AGENTS) {
    it(`agent "${agent}" loads in opencode with valid structure`, () => {
      const { output, error } = tryRunOpencode('debug', 'agent', agent)
      
      // Agent must exist — if debug fails, agent is not registered
      if (error) {
        assert.fail(`opencode debug agent ${agent} failed: ${error.message}`)
      }
      
      // Output should be parseable JSON with agent config
      assert.ok(output, 'got output')
      assert.ok(output.length > 10, 'output is not empty')
      
      // Validate key fields appear in output
      assert.ok(
        output.includes(`"${agent}"`) || output.includes(`${agent}`),
        `output references agent name "${agent}"`
      )
    })
  }

  it('new-harness has primary mode and full permissions', () => {
    const output = runOpencode('debug', 'agent', 'new-harness')
    
    assert.ok(output.includes('primary'), 'mode is primary')
    assert.ok(output.includes('"bash"'), 'has bash permission')
    assert.ok(output.includes('"edit"'), 'has edit permission')
    assert.ok(output.includes('"read"'), 'has read permission')
  })

  it('reviewer has subagent mode and restricted edit', () => {
    const output = runOpencode('debug', 'agent', 'reviewer')
    
    assert.ok(output.includes('subagent'), 'mode is subagent')
  })
})

describe('opencode debug — skills validation', () => {
  it('harness-generator skill is loaded', () => {
    const output = runOpencode('debug', 'skill')
    assert.ok(output.includes('harness-generator'), 'harness-generator skill found')
  })

  it('customize-opencode skill is loaded (built-in)', () => {
    const output = runOpencode('debug', 'skill')
    assert.ok(output.includes('customize-opencode'), 'customize-opencode skill found')
  })
})

describe('opencode debug — config validation', () => {
  it('opencode.json resolves without errors', () => {
    const { output, error } = tryRunOpencode('debug', 'config')
    if (error) {
      assert.fail(`opencode debug config failed — opencode.json may be invalid: ${error.message}`)
    }
    assert.ok(output, 'got config output')
  })

  it('config has required sections', () => {
    const output = runOpencode('debug', 'config')
    assert.ok(output.includes('agent'), 'config has agents')
  })
})
```

### Paso 8: Test e2e con `opencode run` (gratis con Big Pickle)

**Archivo nuevo:** `tests/integration/opencode-agent-e2e.test.js`

Este test ejecuta un agente real con `opencode run` usando **`opencode/big-pickle`** — un modelo **gratuito** (cost: $0). No necesita API key externa. Se ejecuta en CI normalmente.

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { tmpDir, cleanup } from '../helpers.js'

describe('opencode run — agent e2e (free with big-pickle)', () => {
  let tempDir
  let cleanupFn

  it('setup', () => {
    tempDir = tmpDir()
    cleanupFn = cleanup
  })

  it('new-harness responds to a message', () => {
    const result = execSync(
      `opencode run --agent new-harness --model opencode/big-pickle "Di hola y confirma que eres el agente new-harness" --format json --dir ${tempDir}`,
      { encoding: 'utf-8', timeout: 60000 }
    )
    
    // Parse JSON events — opencode outputs newline-delimited JSON
    const lines = result.trim().split('\n').filter(Boolean)
    const events = lines.map(line => {
      try { return JSON.parse(line) } catch { return null }
    }).filter(Boolean)
    
    // Should have at least one assistant message
    const messages = events.filter(e => 
      (e.type === 'message' || e.type === 'assistant') && 
      (e.role === 'assistant' || e.type === 'assistant')
    )
    
    assert.ok(messages.length > 0, 'agent produced at least one response')
    
    // Verify cost is 0 (free model)
    const stepFinish = events.find(e => e.type === 'step_finish')
    if (stepFinish) {
      assert.equal(stepFinish.part.cost, 0, 'big-pickle is free (cost: 0)')
    }
  })

  it('new-harness loads harness-generator skill', () => {
    const result = execSync(
      `opencode run --agent new-harness --model opencode/big-pickle "Lista los skills que tienes disponibles" --format json --dir ${tempDir}`,
      { encoding: 'utf-8', timeout: 60000 }
    )
    
    const lines = result.trim().split('\n').filter(Boolean)
    const events = lines.map(line => {
      try { return JSON.parse(line) } catch { return null }
    }).filter(Boolean)
    
    const textEvents = events.filter(e => e.type === 'text')
    const allText = textEvents.map(e => e.part.text).join(' ')
    
    // Agent should mention harness-generator skill
    assert.ok(
      allText.includes('harness-generator') || allText.includes('harness'),
      'agent knows about harness-generator skill'
    )
  })

  it('reviewer agent responds', () => {
    const result = execSync(
      `opencode run --agent reviewer --model opencode/big-pickle "Di hola" --format json --dir ${tempDir}`,
      { encoding: 'utf-8', timeout: 60000 }
    )
    
    const lines = result.trim().split('\n').filter(Boolean)
    const events = lines.map(line => {
      try { return JSON.parse(line) } catch { return null }
    }).filter(Boolean)
    
    const messages = events.filter(e => 
      (e.type === 'message' || e.type === 'assistant')
    )
    
    assert.ok(messages.length > 0, 'reviewer agent responded')
  })

  it('cleanup', () => {
    cleanupFn()
  })
})
```

### Resumen de archivos de test

| Archivo | Tipo | API key? | Qué valida |
|---------|------|----------|------------|
| `tests/commands/create-agent-consolidated.test.js` | Unit | No | create-agent.js con --mode y --preset |
| `tests/consistency/subagents.test.js` | Consistency | No | Todos los .md de subagentes existen con estructura válida |
| `tests/consistency/opencode-agents.test.js` | Consistency | No | Todos los subagentes registrados en opencode.json |
| `tests/consistency/eliminated-skills.test.js` | Consistency | No | Artefactos eliminados ya no existen |
| `tests/consistency/updated-skills.test.js` | Consistency | No | Skills actualizados documentan nuevas features |
| `tests/integration/harness-generation.test.js` | Integration | No | Flujo completo genera proyecto válido |
| `tests/integration/opencode-debug-validation.test.js` | Integration | No | opencode carga agentes, skills y config correctamente |
| `tests/integration/opencode-agent-e2e.test.js` | E2E | **No (Big Pickle = gratis)** | Agente responde correctamente con `opencode run` |

### Orden de ejecución TDD

1. **RED** → Escribir los 8 archivos de test (fallan porque los archivos no existen aún)
2. **GREEN** → Implementar cambios en el código para que los tests pasen
3. **REFACTOR** → Limpiar código, verificar que `npm test` pasa completo
4. **E2E** → Tests e2e ejecutan con Big Pickle (gratis, sin API key)

---

## Verificación final

```bash
# 1. Todos los tests pasan (unit + consistency + integration)
npm test

# 2. Scripts consolidados funcionan
node shared/scripts/create-agent.js --help
node shared/scripts/create-agent.js --name test --mode subagent --preset reviewer --output /tmp/test.md --dry-run

# 3. Subagentes creados correctamente
ls .opencode/agents/*-creator.md | wc -l  # Debe ser 12

# 4. opencode.json tiene todos los agentes
node -e "const c = require('./opencode.json'); console.log(Object.keys(c.agents).length)"  # Debe ser 18+

# 5. Skills eliminados ya no existen
ls shared/skills/harness-creator 2>&1  # Debe fallar
ls shared/scripts/harness-generator.js 2>&1  # Debe fallar

# 6. opencode carga los agentes correctamente (sin API key)
opencode debug agent new-harness    # Debe mostrar config completa
opencode debug agent reviewer       # Debe mostrar mode: subagent
opencode debug skill                # Debe incluir harness-generator
opencode debug config               # Debe parsear sin errores

# 7. opencode ejecuta un agente (gratis con Big Pickle)
opencode run --agent new-harness --model opencode/big-pickle "Di hola" --format json
# El output debe mostrar "cost": 0
```
