# Transferir agents y skills de Copia-de-gda-ai a gda-ai

## Objective

Mover agents, skills, commands y scripts desde `../Copia-de-gda-ai/` (`.opencode/` y `shared/`) hacia `../gda-ai/.opencode/`, y eliminar los originales del directorio fuente.

## Inventario del fuente (`Copia-de-gda-ai/`)

### `.opencode/agents/` (4 archivos .md)
| Archivo | Agente |
|---------|--------|
| docs.md | Documentation specialist |
| plan-arai.md | Plan mode |
| reviewer.md | Code review |
| tester.md | Testing |

### `shared/agents/` (11 directorios con `AGENT.md`)
| Directorio | Agente |
|------------|--------|
| arch-docs | Architecture docs |
| arch-guardian | Architecture guardian |
| arch-reviewer | Architecture review |
| arch-techwatch | Tech watch |
| docs | Documentation |
| pmo-intake | PMO intake |
| pmo-integrator | PMO integrator |
| pmo-reporter | PMO reporter |
| pmo-tracker | PMO tracker |
| reviewer | Code review |
| tester | Testing |

### `.opencode/skills/` (1 skill)
| Skill | Notas |
|-------|-------|
| document-generation | Versión Node.js (aramirez-ai) |

### `shared/skills/` (10 skills)
| Skill | Notas |
|-------|-------|
| architecture-review | Solo en Copia |
| code-review | Duplicado |
| content-ingestion | Duplicado |
| document-generation | Versión Python/GDA (diferente a .opencode/) |
| git | Duplicado |
| github-projects | Solo en Copia |
| kb-management | Duplicado |
| pdf-extraction | Duplicado |
| teams-notifier | Solo en Copia |

### `shared/scripts/` (14 archivos Python/shell)
build-deck.py, build-image.py, build-pptx.py, build-report.py, build-web.py, charts.py, deck_lib.py, deploy.sh, extract-empleados.py, html_theme.py, pptx_theme.py, report_theme.py, validate.py

### `.opencode/commands/` (4 archivos .md)
commit.md, deploy.md, email.md, test.md

## Inventario del destino (`gda-ai/.opencode/`)

Actualmente tiene 12 agents, 14 skills, 12 commands (del template full de aramirez-ai).

## Requirements

1. **Agents de `.opencode/agents/`**: Copiar solo los .md que **no existan** en el destino — prioridad: **high**
2. **Agents de `shared/agents/`**: Convertir `AGENT.md` → `<nombre>.md` y copiar a `.opencode/agents/` solo si **no existe** — prioridad: **high**
3. **Skills de `shared/skills/`**: Copiar directorios SKILL.md a `.opencode/skills/` solo si el directorio **no existe** — prioridad: **high**
4. **Skills de `.opencode/skills/`**: `document-generation` — **no sobrescribir** si ya existe en destino — prioridad: **high**
5. **Scripts de `shared/scripts/`**: Copiar a `.opencode/scripts/` solo si el archivo **no existe** — prioridad: **medium**
6. **Commands de `.opencode/commands/`**: Copiar solo los que **no existan** en destino — prioridad: **medium**
7. **Eliminar originales** del directorio fuente después de copiar — prioridad: **high**
8. **No tocar** archivos que no son agents/skills/scripts/commands del fuente — prioridad: **high**
9. **No tocar** el `opencode.json` del destino — prioridad: **medium**
10. **Preservar** la estructura existente en gda-ai — prioridad: **high**
11. **Reportar** qué se copió y qué se omitió (ya existía) — prioridad: **medium**

## Architecture

### Decisiones

1. **Formato de agents**: `shared/agents/<name>/AGENT.md` → copiar como `.opencode/agents/<name>.md` (formato opencode nativo)
2. **Nada se sobrescribe**: Si el archivo/directorio ya existe en el destino, se **omite** con log
3. **Skills duplicados**: Se omite el del fuente si ya existe en el destino
4. **Scripts**: Copiar solo archivos que no existan en `.opencode/scripts/`
5. **Commands**: Copiar solo los que no existan en `.opencode/commands/`
6. **No modificar `opencode.json`**: Los agentes adicionales se registran después manualmente

### Flujo de copia (skip si existe)

```
Copia-de-gda-ai/.opencode/agents/*.md      → gda-ai/.opencode/agents/      (skip si existe)
Copia-de-gda-ai/shared/agents/*/AGENT.md   → gda-ai/.opencode/agents/<name>.md (skip si existe)
Copia-de-gda-ai/shared/skills/*/SKILL.md   → gda-ai/.opencode/skills/<name>/  (skip si existe)
Copia-de-gda-ai/.opencode/skills/doc-gen/  → gda-ai/.opencode/skills/document-generation/ (skip si existe)
Copia-de-gda-ai/shared/scripts/*           → gda-ai/.opencode/scripts/     (skip si existe)
Copia-de-gda-ai/.opencode/commands/*.md    → gda-ai/.opencode/commands/    (skip si existe)
```

### Eliminación del fuente

```
rm -rf Copia-de-gda-ai/.opencode/agents/
rm -rf Copia-de-gda-ai/shared/agents/
rm -rf Copia-de-gda-ai/shared/skills/
rm -rf Copia-de-gda-ai/shared/scripts/
rm -rf Copia-de-gda-ai/.opencode/commands/
```

## File Changes

### Crear: Script `scripts/transfer-gda.js`
Script Node.js que ejecuta la transferencia de forma cross-platform:
1. Lee el inventario de ambos directorios
2. Copia archivos al destino
3. Elimina originales del fuente
4. Reporta qué se copió y qué se eliminó

### No modificar
- `opencode.json` de gda-ai (se actualizará después)
- Ningún otro archivo fuera de los indicados

## Verification

- [ ] Agents nuevos aparecen en `gda-ai/.opencode/agents/` (los que ya existían no se tocaron)
- [ ] Skills nuevos aparecen en `gda-ai/.opencode/skills/` (los que ya existían no se tocaron)
- [ ] Scripts nuevos en `gda-ai/.opencode/scripts/` (los que ya existían no se tocaron)
- [ ] Commands nuevos en `gda-ai/.opencode/commands/` (los que ya existían no se tocaron)
- [ ] Originales eliminados de `Copia-de-gda-ai/`
- [ ] `gda-ai/opencode.json` intacto (no modificado)
- [ ] Archivos preexistentes en gda-ai intactos (sin sobrescrituras)
- [ ] Log muestra qué se copió y qué se omitió
