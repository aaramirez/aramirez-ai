---
name: agent-creator
description: Create primary or subagent definitions with custom prompts, permissions, and model overrides. Use --preset for predefined profiles (reviewer, tester, docs, etc.).
license: MIT
scripts:
  - create-agent.js
  - create-base.js
---

# Agent Creator

Crea definiciones de agentes para opencode. Soporta agentes primarios y subagentes, con perfiles predefinidos (`--preset`) para configuración rápida.

## Agentes primarios vs subagentes

| | Agente primario | Subagente |
|--|----------------|-----------|
| **Selección** | Tab-cycling en la UI | Auto-invocado o @-mencionado |
| **Modo** | `primary` | `subagent` |
| **Permisos** | Completo (configurable) | Restringido por diseño |
| **Propósito** | Flujo de trabajo principal | Tareas especializadas |

## Presets disponibles

| Preset | Mode | edit | bash | read | Descripción |
|--------|------|------|------|------|-------------|
| `build` | primary | allow | allow | allow | Implementación de features |
| `plan` | primary | deny | allow | allow | Planificación estratégica |
| `reviewer` | subagent | deny | ask | allow | Revisión de código |
| `tester` | subagent | allow | allow | allow | Testing y TDD |
| `docs` | subagent | allow | deny | allow | Documentación |
| `security` | subagent | deny | ask | allow | Auditoría de seguridad |
| `devops` | subagent | allow | allow | allow | CI/CD y deploy |
| `architect` | subagent | deny | ask | allow | Arquitectura de software |

## Campos YAML frontmatter

```yaml
---
description: Descripción del agente
mode: primary|subagent|all
model: opencode/big-pickle     # opcional, override del modelo default
temperature: 0.3               # opcional
color: "#4A90D9"                # opcional, color del tema
permission:
  edit: allow
  bash: allow
  read: allow
---
```

## Script de referencia

```bash
# Crear agente con preset (recomendado)
node .opencode/skills/agent-creator/scripts/create-agent.js --name reviewer --preset reviewer --output .opencode/agents/reviewer.md

# Crear agente primario manualmente
node .opencode/skills/agent-creator/scripts/create-agent.js --name orchestrator --description "Main orchestrator" --mode primary --output .opencode/agents/orchestrator.md

# Crear subagente manualmente
node .opencode/skills/agent-creator/scripts/create-agent.js --name auditor --description "Security auditor" --mode subagent --edit deny --bash deny --output .opencode/agents/auditor.md
```

### Opciones

| Flag | Descripción | Default |
|------|-------------|---------|
| `--name <name>` | Nombre del agente (requerido) | — |
| `--preset <name>` | Perfil predefinido (ver tabla arriba) | — |
| `--description <desc>` | Descripción (requerido sin --preset) | — |
| `--mode <mode>` | `primary`, `subagent`, o `all` | `primary` |
| `--model <name>` | Modelo específico | — |
| `--temperature <n>` | Temperatura del modelo | `0.3` |
| `--prompt <text>` | Prompt del sistema | — |
| `--color <color>` | Color del tema | — |
| `--edit <perm>` | `allow`, `ask`, `deny` | `allow` |
| `--bash <perm>` | `allow`, `ask`, `deny` | `allow` |
| `--read <perm>` | `allow`, `ask`, `deny` | `allow` |
| `--output <file>` | Archivo de salida (requerido) | — |
| `--dry-run` | Vista previa sin escribir | — |

## Ejemplo de uso

```bash
# Crear reviewer con preset (auto-configura permisos)
node .opencode/skills/agent-creator/scripts/create-agent.js \
  --name reviewer \
  --preset reviewer \
  --output .opencode/agents/reviewer.md

# Crear tester con preset
node .opencode/skills/agent-creator/scripts/create-agent.js \
  --name tester \
  --preset tester \
  --output .opencode/agents/tester.md

# Crear agente custom con permisos restrictivos
node .opencode/skills/agent-creator/scripts/create-agent.js \
  --name auditor \
  --description "Auditor de código y seguridad" \
  --mode subagent \
  --edit deny \
  --bash deny \
  --read allow \
  --color "#E74C3C" \
  --temperature 0.2 \
  --output .opencode/agents/auditor.md
```

## Registro en opencode.json

Después de crear el archivo .md, registrar el agente:

```json
{
  "agent": {
    "reviewer": {
      "description": "Code review specialist for PRs and quality checks",
      "mode": "subagent",
      "path": ".opencode/agents/reviewer.md"
    }
  }
}
```

## Mandatory TDD Workflow

Every new agent MUST follow this flow. No steps can be skipped:

```
1. Write tests    → 2. Create .md  → 3. Register  → 4. Verify  → 5. Done
   (FAIL first)      (file)           (opencode.json)  (npm test)
```

### Step 1: Write failing tests FIRST

Before creating the agent, write tests that assert it exists. These must FAIL before implementation.

**Consistency test** — add to `tests/consistency/subagents.test.js`:
```js
// Add to REQUIRED_SUBAGENTS array:
'new-agent.md',
```

**Registration test** — add to `tests/consistency/opencode-agents.test.js`:
```js
// Add to REQUIRED_AGENTS object:
'new-agent': { mode: 'subagent', path: '.opencode/agents/new-agent.md' },
```
Update total count assertion.

**opencode debug test** — add to `tests/integration/opencode-debug-agents.test.js`:
```js
// Add 'new-agent' to the agents array tested with opencode debug agent
```

### Step 2: Create the agent .md file

Use `create-agent.js` or write manually following the template (frontmatter + Inicio/Ejecución/Reglas).

### Step 3: Register in opencode.json

Add the agent entry under `"agent"` with `description`, `mode`, and `path`.

### Step 4: Verify

```bash
node --test tests/consistency/subagents.test.js
node --test tests/consistency/opencode-agents.test.js
node --test tests/integration/opencode-debug-agents.test.js
npm test  # full suite
```

ALL tests must pass before the agent is considered complete.

### Step 5: Done

Update `AGENTS.md` with the new agent row. Commit.
