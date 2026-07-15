# Reconciliar opencode.json de gda-ai

## Objective

Actualizar `../gda-ai/opencode.json` para registrar los agents y commands que existen como archivos `.md` en `.opencode/`, incorporando lo relevante de `Copia-de-gda-ai/opencode.json` y el repo.

## Análisis actual

### Fuentes de configuración

| Fuente | Ubicación | Contenido |
|--------|-----------|-----------|
| **Copia root** | `Copia-de-gda-ai/opencode.json` | 6 agents, 4 commands, MCP completo, permisos granulares |
| **Copia platform** | `Copia-de-gda-ai/platforms/opencode/opencode.json` | 10 agents (arch-* con modelos custom), 3 commands, model override |
| **gda-ai actual** | `gda-ai/opencode.json` | 6 agents, 4 commands, 2 MCP, permisos simples |

### Agents que existen como .md en gda-ai/.opencode/agents/ (20 total)

| Agente | En opencode.json actual | En Copia platform | Acción |
|--------|------------------------|-------------------|--------|
| build | ✅ | ✅ | mantener |
| plan | ✅ | ✅ | mantener |
| plan-arai | ✅ | ❌ | mantener |
| reviewer | ✅ | ✅ (model: sonnet) | **actualizar** con modelo |
| tester | ✅ | ✅ (model: haiku) | **actualizar** con modelo |
| docs | ✅ | ✅ (model: haiku) | **actualizar** con modelo |
| branding | ❌ | ❌ | **registrar** (del frontmatter) |
| content-ingestion | ❌ | ❌ | **registrar** |
| document-generation | ❌ | ❌ | **registrar** |
| email | ❌ | ❌ | **registrar** |
| kb-management | ❌ | ❌ | **registrar** |
| pdf-extraction | ❌ | ❌ | **registrar** |
| vault-pdf-export | ❌ | ❌ | **registrar** |
| youtube | ❌ | ❌ | **registrar** |
| arch-docs | ❌ | ✅ (model: haiku) | **registrar** con modelo de Copia platform |
| arch-guardian | ❌ | ✅ (model: sonnet) | **registrar** con modelo de Copia platform |
| arch-reviewer | ❌ | ✅ (model: sonnet) | **registrar** con modelo de Copia platform |
| arch-techwatch | ❌ | ✅ (model: haiku) | **registrar** con modelo de Copia platform |
| pmo-intake | ❌ | ❌ | **registrar** (del frontmatter) |
| pmo-integrator | ❌ | ❌ | **registrar** |
| pmo-reporter | ❌ | ❌ | **registrar** |
| pmo-tracker | ❌ | ❌ | **registrar** |

### Commands que existen como .md en gda-ai/.opencode/commands/ (13 total)

| Command | En opencode.json actual | Acción |
|---------|------------------------|--------|
| test | ✅ | mantener |
| deploy | ✅ | mantener |
| commit | ✅ | mantener |
| plan | ✅ | mantener |
| email | ❌ (Copia lo tenía) | **registrar** |
| export-pdf | ❌ | **registrar** |
| generate | ❌ | **registrar** |
| getrepo | ❌ | **registrar** |
| ingest | ❌ | **registrar** |
| kb | ❌ | **registrar** |
| send-email | ❌ | **registrar** |
| updaterepos | ❌ | **registrar** |
| youtube-cmd | ❌ | **registrar** |

### MCP servers (de Copia-de-gda-ai, los que tienen sentido)

| MCP | En gda-ai actual | Acción |
|-----|-----------------|--------|
| context7 | ❌ | **agregar** (remoto, útil siempre) |
| engram | ❌ | **agregar** (memoria persistente) |
| playwright | ✅ | mantener |
| github | ✅ | mantener |
| email | ❌ | **agregar** (Copia lo tenía) |
| google-workspace | ❌ | **agregar** (Copia lo tenía, disabled) |
| m365 | ❌ | **agregar** (Copia lo tenía, disabled) |

### Model override (de Copia platform)

Copia platform usa `model: "anthropic/claude-sonnet-4-6"` como model principal. gda-ai usa `opencode/big-pickle`. **Decisión**: Mantener `opencode/big-pickle` de gda-ai (es el modelo del repo).

Copia platform asigna modelos específicos a agents arch-* y otros:
- reviewer → `anthropic/claude-sonnet-4-6`
- tester → `anthropic/claude-haiku-4-5`
- docs → `anthropic/claude-haiku-4-5`
- arch-guardian → `anthropic/claude-sonnet-4-6`
- arch-reviewer → `anthropic/claude-sonnet-4-6`
- arch-techwatch → `anthropic/claude-haiku-4-5`
- arch-docs → `anthropic/claude-haiku-4-5`

**Decisión**: Aplicar estos model overrides en opencode.json.

### Permissions (reconciliar)

Copia-de-gda-ai tenía permisos más granulares:
- `bash.*`: "allow" (vs gda-ai: "ask")
- `bash.git push*`: "ask"
- `bash.git rebase*`: "ask"
- `bash.git reset --hard*`: "ask"
- `read` con deny patterns para archivos sensibles

Gda-ai actual es más simple: `bash.*: "ask"`, `read: "allow"`.

**Decisión**: Usar los permisos de Copia-de-gda-ai (más seguros y granulares).

### References (de Copia-de-gda-ai)

Copia platform tenía `references` con rutas absolutas a `/Users/administrador/P/opencode/gda-ai/shared/`. gda-ai no tiene directorio `shared/` — **omitir references**.

Copia root tenía `references` con rutas relativas `../shared/` — también **omitir** (gda-ai no tiene shared/).

### Skills paths

Copia platform tenía `skills.paths` con `/Users/administrador/.config/opencode/skills`. gda-ai actual no tiene `skills.paths` (descubrimiento nativo). **Decisión**: Mantener sin `skills.paths` (descubrimiento nativo de opencode).

## Requirements

1. Registrar los 14 agents nuevos que tienen .md pero no están en opencode.json — prioridad: **high**
2. Registrar los 9 commands nuevos que tienen .md pero no están en opencode.json — prioridad: **high**
3. Agregar MCP servers de Copia (context7, engram, email, google-workspace, m365) — prioridad: **medium**
4. Reconciliar permisos con la versión más granular de Copia — prioridad: **medium**
5. Mantener configuración actual de model, shell, compaction, tool_output — prioridad: **high**
6. No eliminar agents/commands que ya están registrados — prioridad: **high**
7. Usar la descripción de cada agente del frontmatter de su .md — prioridad: **low**

## Architecture

### Archivo a modificar

- `../gda-ai/opencode.json`

### Decisiones

1. **Agents**: Para cada .md en `.opencode/agents/`, registrar en `opencode.json`. Si Copia platform tiene model override para ese agent, usarlo. Si no, usar frontmatter del .md
2. **Commands**: Para cada .md en `.opencode/commands/`, registrar en `opencode.json` con `description` y `template` del frontmatter
3. **MCP**: Agregar servers de Copia root (context7, engram, email, google-workspace, m365), manteniendo `enabled: false` para los que requieren config externa
4. **Permissions**: Usar la versión granular de Copia root (bash con reglas git, read con deny patterns)
5. **Model**: Mantener `opencode/big-pickle` (no usar `anthropic/claude-sonnet-4-6` de Copia platform)
6. **No tocar**: shell, compaction, tool_output, formatter, lsp, instructions
7. **No agregar**: references, skills.paths (gda-ai no tiene shared/)

## File Changes

### Modificar: `../gda-ai/opencode.json`

Script Node.js que:
1. Lee el opencode.json actual de gda-ai
2. Lee `Copia-de-gda-ai/platforms/opencode/opencode.json` para model overrides de agents
3. Lee `Copia-de-gda-ai/opencode.json` para MCP servers y permisos
4. Lee cada .md de agents/ y commands/ para extraer frontmatter
5. Agrega agents faltantes (con model overrides de Copia platform si existen)
6. Agrega commands faltantes
7. Agrega MCP servers de Copia root
8. Reconcilia permisos
9. Escribe el resultado

## Verification

- [ ] Todos los agents de .opencode/agents/ están registrados en opencode.json
- [ ] Todos los commands de .opencode/commands/ están registrados en opencode.json
- [ ] MCP servers de Copia agregados (context7, engram, etc.)
- [ ] Permisos granulares de Copia aplicados
- [ ] Agents/commands existentes no eliminados
- [ ] model, shell, compaction intactos
