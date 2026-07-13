# Eliminar `arai generate` — Plan Completo

## Objective

Eliminar `arai generate` del CLI de arai. La creación es trabajo de los creators (`.opencode/scripts/create-*.js`). arai es solo distribución.

## Principle

> **arai = distribución. Creators = creación.** No hay overlap.

## Inventory: 52 archivos afectados

### 1. Core — eliminar/modificar (7 archivos)

| Archivo | Acción | Detalle |
|---------|--------|---------|
| `shared/scripts/lib/generate.js` | **DELETE** | 253 líneas, toda la implementación |
| `bin/arai.js` | MODIFY | Eliminar import línea 11 + bloque generate líneas 108-182 |
| `shared/scripts/lib/agents-md.js` | MODIFY | Eliminar 6 líneas de CLI table (107-112) que listan `arai generate` |
| `shared/templates/partials/skill.md` | **DELETE** | Solo usado por generateSkill() |
| `shared/templates/partials/agent.md` | **DELETE** | Solo usado por generateAgent() |
| `shared/templates/partials/script.js` | **DELETE** | Solo usado por generateScript() |
| `shared/templates/partials/command.md` | **DELETE** | Solo usado por generateCommand() |

### 2. Tests — eliminar/modificar (7 archivos)

| Archivo | Acción | Detalle |
|---------|--------|---------|
| `tests/commands/generate.test.js` | **DELETE** | 109 líneas, 10 tests de generate |
| `tests/commands/kb.test.js` | **DELETE** | 67 líneas, 7 tests de kb |
| `tests/integration/outcome-generate.test.js` | **DELETE** | 181 líneas, 9 tests de outcome |
| `tests/integration/outcome-init.test.js` | MODIFY | Eliminar tests "generated agent .md" (líneas 63-79) + assertion "arai generate" (línea 39) |
| `tests/consistency/docs-consistency.test.js` | MODIFY | Eliminar 'generate' de commands array (línea 54) |
| `tests/shared/commands.test.js` | **NO CAMBIAR** | 'generate' se refiere a `shared/commands/generate.md` (comando opencode para docgen), NO a `arai generate` |
| `tests/consistency/shared-packages.test.js` | **NO CAMBIAR** | 'generate.md' se refiere a `shared/commands/generate.md` |

### 3. Documentation — modificar (2 archivos)

| Archivo | Acción | Detalle |
|---------|--------|---------|
| `README.md` | MODIFY | Eliminar 15+ referencias a `arai generate` (tabla CLI, secciones detalladas, branding) |
| `AGENTS.md` | VERIFY | No tiene referencias directas a `arai generate`, pero verificar tabla CLI generada |

### 4. Skills — modificar (2 archivos)

| Archivo | Acción | Detalle |
|---------|--------|---------|
| `shared/skills/branding/SKILL.md` | MODIFY | Líneas 45, 48: reemplazar `arai generate brand` por instrucciones para crear `shared/brand.json` manualmente o vía agent |
| `.opencode/skills/harness-generator/SKILL.md` | MODIFY | Líneas 168-169: reemplazar `arai generate agent/skill` por `node .opencode/scripts/create-agent.js` |

### 5. Tutorials — modificar/eliminar (19 archivos)

| Archivo | Acción | Detalle |
|---------|--------|---------|
| `tutoriales-arai/02-Comandos/05-generate.md` | **DELETE** | Tutorial dedicado a `arai generate` |
| `tutoriales-arai/02-Comandos/04-status.md` | MODIFY | Eliminar referencia "Siguiente: arai generate" |
| `tutoriales-arai/02-Comandos/Index.md` | MODIFY | Eliminar entrada 5 de generate |
| `tutoriales-arai/01-Instalacion/01-instalar-arai.md` | MODIFY | Eliminar "generate" de la lista de comandos |
| `tutoriales-arai/01-Instalacion/04-solucion-problemas.md` | MODIFY | Eliminar `arai generate brand` |
| `tutoriales-arai/00-Introduccion/02-como-extender.md` | MODIFY | Reemplazar ejemplos `arai generate` por creators |
| `tutoriales-arai/00-Introduccion/03-arquitectura.md` | MODIFY | Eliminar "generate" del diagrama |
| `tutoriales-arai/06-Skills/02-crear-skills.md` | MODIFY | Reemplazar `arai generate skill` por creator |
| `tutoriales-arai/06-Skills/03-sincronizar-skills.md` | MODIFY | Reemplazar `arai generate skill` por creator |
| `tutoriales-arai/08-Referencias/01-prompt-y-reglas.md` | MODIFY | Reemplazar referencias |
| `tutoriales-arai/08-Referencias/03-branding.md` | MODIFY | Reemplazar `arai generate brand` |
| `tutoriales-arai/09-Documentacion/02-generar-reportes.md` | MODIFY | Eliminar `arai generate brand` |
| `tutoriales-arai/10-CI/02-tests.md` | MODIFY | Eliminar referencia a generate |
| `tutoriales-arai/10-CI/04-outcome-validation.md` | MODIFY | Reemplazar referencias |
| `tutoriales-arai/11-Casos-de-uso/01-curso-ia-vault.md` | VERIFY | Solo dice "generated/" (no es `arai generate`) |
| `tutoriales-arai/11-Casos-de-uso/02-crear-skills-personalizadas.md` | MODIFY | Reemplazar ejemplos |
| `tutoriales-arai/11-Casos-de-uso/03-automatizar-reportes.md` | MODIFY | Reemplazar `arai generate command` |
| `tutoriales-arai/11-Casos-de-uso/04-crear-harness-completo.md` | MODIFY | Reemplazar `arai generate rule` |
| `tutoriales-arai/Index.md` | MODIFY | Eliminar "generate" de la lista |

### 6. Plans — marcar como historical (13 archivos)

Los planes son documentos históricos. No se borran, pero se les agrega nota de deprecación al inicio:

| Archivo | Referencia |
|---------|------------|
| `plans/plan.md` | Líneas 17-18 |
| `plans/templates-plan.md` | Línea 380 |
| `plans/plan-unify-harness.md` | Línea 17 |
| `plans/outcome-validation-plan.md` | 15 referencias |
| `plans/creator-skills-cleanup.md` | Líneas 22, 76-78, 145-147 |
| `plans/plan-remediacion-actualizado.md` | Líneas 77, 87 |
| `plans/distributable-plan-command.md` | Línea 87 |
| `plans/restructure-docs.md` | Línea 69 |
| `plans/new-harness-agent.md` | Líneas 66, 76, 125 |
| `plans/move-creator-artifacts-local.md` | Línea 220 |
| `plans/plan-agents-md.md` | Líneas 60, 63, 116, 121 |
| `plans/fix-init-plan.md` | Línea 521 |
| `plans/remove-arai-generate.md` | El mismo plan |

### 7. Aspects adicionales a considerar

| Aspecto | Detalle |
|---------|---------|
| **`shared/commands/generate.md`** | NO se elimina — es el comando `/generate` de opencode para docgen, concepto diferente |
| **`template-utils.js`** | Verificar si `resolvePartial()` y `applyVars()` siguen siendo usados por scaffold.js después de eliminar los partials |
| **`helpers.js`** | `PARTIALS_DIR` puede eliminarse si ningún otro código lo usa |
| **`arai list commands`** | Ya no mostrará generate (era un .md en shared/commands/, NO en .opencode/commands/) |
| **`arai init --template full`** | El template full no copia los partials eliminados (solo copia skills, scripts, etc.) |
| **`arai install skill`** | No usa generate.js — no afectado |
| **`bin/arai.js` imports** | Verificar que el import de generate.js se elimina limpiamente |
| **CI validation** | `tests/consistency/` puede tener checks que fallen |
| **`AGENTS.md` dinámico** | `updateAgentsMd()` genera la tabla CLI — al eliminar las 6 líneas de generate, la tabla se actualiza automáticamente |

## TDD Flow

### Phase 1: Tests (MUST FAIL after partial deletion)

1. Eliminar `shared/templates/partials/skill.md` → `arai generate skill` falla
2. Eliminar test files → test count baja

### Phase 2: Implementation

1. Eliminar `generate.js`
2. Eliminar imports y subcommand de `bin/arai.js`
3. Eliminar CLI table entries de `agents-md.js`
4. Eliminar 4 template partials
5. Eliminar 3 test files
6. Actualizar tests afectados
7. Actualizar skills (branding, harness-generator)
8. Actualizar README.md
9. Actualizar 18 archivos de tutoriales
10. Agregar nota de deprecación a 13 planes

### Phase 3: Verify

1. `npm test` — todos los tests pasan
2. `arai list commands` — ya no muestra generate
3. `arai --help` — ya no muestra generate
4. No hay imports rotos
5. Tutoriales consistentes

## Verification Checklist

- [ ] `generate.js` eliminado
- [ ] `bin/arai.js` limpio de generate
- [ ] `agents-md.js` sin referencias a generate
- [ ] 4 template partials eliminados
- [ ] 3 test files eliminados
- [ ] Tests afectados actualizados
- [ ] README.md actualizado
- [ ] Skills (branding, harness-generator) actualizados
- [ ] 18 tutoriales actualizados
- [ ] 13 planes con nota de deprecación
- [ ] `npm test` pasa
- [ ] `arai --help` no muestra generate
- [ ] `shared/commands/generate.md` intacto (es opencode command, no arai generate)
- [ ] `template-utils.js` y `helpers.js` verificados (sin imports rotos)

## Execution Order

1. **Fase TDD — Tests que deben fallar** (eliminar partials → tests fallan)
2. **Core — eliminar generate** (generate.js, bin/arai.js, agents-md.js)
3. **Templates — eliminar partials** (skill.md, agent.md, script.js, command.md)
4. **Tests — eliminar y actualizar** (3 files delete + 2 modify)
5. **Documentation** (README.md, skills)
6. **Tutorials** (18 archivos)
7. **Plans** (13 planes — nota de deprecación)
8. **Verify** (npm test + manual)
