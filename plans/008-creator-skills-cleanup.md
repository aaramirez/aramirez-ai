> **DEPRECATED**: This plan references `arai generate`, which has been removed from the CLI.
> Creators (`.opencode/scripts/create-*.js`) are the canonical way to generate artifacts.
> See `plans/remove-arai-generate.md` for details.
>
# Plan: Limpieza y reorganización de skills *-creator

## Diagnóstico actual

### El problema

Existen **18 skills *-creator** en `shared/skills/`, cada uno con un script `create-*.js` acompañante. Pero:

1. **Ninguno es llamado programáticamente** por el CLI, por `harness-generator.js`, ni por otro script
2. **harness-creator** dice delegar a 5 sub-skills pero **reimplementa todo inline**
3. **harness-generator.js** es un monolito que duplica la lógica de 4 scripts independientes
4. **Existen dos sistemas paralelos** que no se conectan entre sí

###Mapa de duplicación

```
GENERACIÓN DE AGENTES (5 implementaciones del mismo output):
├── create-agent.js              ← standalone, nunca llamado
├── create-subagent.js           ← variante thin de create-agent.js
├── create-specialized-agent.js  ← superset con presets de dominio
├── harness-generator.js         ← reimplementa inline (KNOWN_AGENTS)
└── lib/generate.js              ← generateAgent() usado por arai generate

GENERACIÓN DE CONFIG (3 implementaciones):
├── create-config.js             ← standalone, nunca llamado
├── harness-generator.js         ← reimplementa inline (buildOpencodeConfig)
└── lib/scaffold.js              ← usado por arai init

GENERACIÓN DE INSTRUCCIONES (3 implementaciones):
├── create-instructions.js       ← standalone, nunca llamado
├── harness-generator.js         ← reimplementa inline (buildAgentsMd)
└── lib/agents-md.js             ← usado por arai install/sync

GENERACIÓN DE PERMISOS (3 implementaciones):
├── create-permission.js         ← standalone, nunca llamado
├── create-config.js             ← hardcodea "balanced" default
└── harness-generator.js         ← reimplementa inline (getStrictnessSettings)
```

### Clasificación de los 18 scripts

| Categoría | Scripts | Acción propuesta |
|-----------|---------|-----------------|
| **Duplicados por harness-generator** | `create-agent.js`, `create-subagent.js`, `create-specialized-agent.js`, `create-config.js`, `create-instructions.js`, `create-permission.js` | Consolidar o eliminar |
| **Duplicados por lib/** | `create-skill.js`, `create-script.js`, `create-command.js` | Consolidar con lib/ |
| **Únicos sin duplicación** | `create-mcp.js`, `create-prompt.js`, `create-rule.js`, `create-flow.js`, `create-reference.js`, `create-plugin.js`, `create-tool.js`, `create-architecture.js` | Mantener |
| **Orquestador roto** | `harness-creator` (skill) | Reescribir o eliminar |

---

## Propuesta de limpieza

### Fase 1: Consolidar generación de agentes

**Objetivo:** Un solo script `create-agent.js` que maneje todos los casos.

**Cambios:**
- Unificar `create-agent.js`, `create-subagent.js`, `create-specialized-agent.js` en un solo script
- Flags: `--mode primary|subagent`, `--preset reviewer|tester|docs|security|devops|architect`
- Eliminar `create-subagent.js` y `create-specialized-agent.js`
- Eliminar skills `subagent-creator` y `specialized-agent-creator`

**Archivos a modificar:**
- `shared/scripts/create-agent.js` — agregar `--mode` y `--preset`
- Eliminar `shared/scripts/create-subagent.js`
- Eliminar `shared/scripts/create-specialized-agent.js`
- Eliminar `shared/skills/subagent-creator/`
- Eliminar `shared/skills/specialized-agent-creator/`
- Actualizar `tests/commands/create-scripts.test.js`

### Fase 2: Eliminar duplicación con lib/

**Objetivo:** Los scripts standalone deben delegar a lib/, no reimplementar.

**Cambios:**
- `create-skill.js` → importar `generateSkill()` de `lib/generate.js`
- `create-script.js` → importar `generateScript()` de `lib/generate.js`
- `create-command.js` → importar `generateCommand()` de `lib/generate.js`

**Archivos a modificar:**
- `shared/scripts/create-skill.js`
- `shared/scripts/create-script.js`
- `shared/scripts/create-command.js`

### Fase 3: Reescribir harness-creator

**Objetivo:** Que el orquestador realmente delegue, o que se elimine si no aporta valor.

**Opción A (Reescribir):** Actualizar `harness-creator/SKILL.md` para que:
- Delegue a `create-agent.js` (unificado) en lugar de reimplementar
- Delegue a `create-config.js` en lugar de reimplementar
- Delegue a `create-instructions.js` en lugar de reimplementar
- `harness-generator.js` se convierta en un wrapper que llama a estos scripts

**Opción B (Eliminar):** Si el agente `new-harness` + skill `harness-generator` cubren el caso de uso:
- Eliminar `harness-creator` de `shared/skills/`
- Eliminar `harness-generator.js` de `shared/scripts/`
- Mantener solo el skill local `harness-generator` en `.opencode/skills/`

**Recomendación:** Opción B — el agente `new-harness` ya hace lo que `harness-creator` promete pero no cumple.

### Fase 4: Renombrar para claridad

**Objetivo:** Separar claramente lo que es "generador de harness" vs "creador de componentes".

**Renombrar:**
- `config-creator` → `config-generator` (genera opencode.json)
- `permission-creator` → `permission-generator` (genera reglas de permisos)
- `instructions-creator` → `instructions-generator` (genera AGENTS.md)

**Mantener sin cambio:**
- `agent-creator` — nombre claro
- `skill-creator` — nombre claro
- `script-creator` — nombre claro
- `mcp-creator` — nombre claro
- `command-creator` — nombre claro
- `prompt-creator` — nombre claro
- `rule-creator` — nombre claro
- `reference-creator` — nombre claro
- `flow-creator` — nombre claro
- `architecture-creator` — nombre claro
- `plugin-creator` — nombre claro
- `tool-creator` — nombre claro

---

## Resumen de eliminaciones

| Archivo | Razón |
|---------|-------|
| `shared/skills/subagent-creator/` | Duplicado de agent-creator con mode=subagent |
| `shared/skills/specialized-agent-creator/` | Duplicado de agent-creator con presets |
| `shared/scripts/create-subagent.js` | Consolidado en create-agent.js |
| `shared/scripts/create-specialized-agent.js` | Consolidado en create-agent.js |
| `shared/skills/harness-creator/` | Reemplazado por new-harness agent + harness-generator skill |
| `shared/scripts/harness-generator.js` | Reemplazado por new-harness agent + harness-generator skill |

---

## Resumen de cambios

| Archivo | Cambio |
|---------|--------|
| `shared/scripts/create-agent.js` | Agregar `--mode` y `--preset` |
| `shared/scripts/create-skill.js` | Delegar a lib/generate.js |
| `shared/scripts/create-script.js` | Delegar a lib/generate.js |
| `shared/scripts/create-command.js` | Delegar a lib/generate.js |
| `shared/skills/config-creator/` | Renombrar a config-generator |
| `shared/skills/permission-creator/` | Renombrar a permission-generator |
| `shared/skills/instructions-creator/` | Renombrar a instructions-generator |
| `opencode.json` | Actualizar referencias |
| `AGENTS.md` | Actualizar documentación |
| Tests | Actualizar para reflejar cambios |

---

## Orden de implementación

1. **Fase 3 primero** — Eliminar harness-creator y harness-generator.js (mayor impacto en claridad)
2. **Fase 1** — Consolidar agentes (reduce 3 scripts a 1)
3. **Fase 2** — Conectar scripts con lib/ (elimina duplicación)
4. **Fase 4** — Renombrar para claridad (cosmético)

---

## Verificación

```bash
# 1. Tests deben pasar después de cada fase
npm test

# 2. Verificar que no hay referencias rotas
node shared/scripts/ci-validate.js --strict

# 3. Verificar que los scripts consolidados funcionan
node shared/scripts/create-agent.js --help
node shared/scripts/create-agent.js --name test --description "test" --mode subagent --output /tmp/test.md --dry-run
node shared/scripts/create-agent.js --name test --description "test" --preset reviewer --output /tmp/test.md --dry-run

# 4. Verificar que el agente new-harness sigue funcionando
# (cambiar a agente new-harness en opencode y probar flujo completo)
```

---

## Preguntas para el usuario

1. **¿Opción A o B para harness-creator?** ¿Reescribir para que realmente delegue, o eliminar completamente?
2. **¿Renombrar los *-creator a *-generator?** ¿O mantener los nombres actuales para no romper compatibilidad?
3. **¿Los 8 scripts únicos sin duplicación se mantienen tal cual?** (mcp, prompt, rule, flow, reference, plugin, tool, architecture)
