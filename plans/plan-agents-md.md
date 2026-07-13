> **DEPRECATED**: This plan references `arai generate`, which has been removed from the CLI.
> Creators (`.opencode/scripts/create-*.js`) are the canonical way to generate artifacts.
> See `plans/remove-arai-generate.md` for details.
>
# Plan de análisis y mejora — AGENTS.md

## Problema

AGENTS.md cumple **dos funciones distintas** que actualmente comparten un mismo archivo:
1. **Documentación del proyecto aramirez-ai** — describe qué hay en este repo y cómo usarlo
2. **Template para nuevos proyectos** (`arai init`) — se copia a proyectos generados con `shared/templates/partials/AGENTS.md`

Ambos usos tienen problemas, y además el template no se actualiza cuando se agregan componentes.

---

## Fase 1: Corregir AGENTS.md del propio aramirez-ai

### 1.1 Discrepancias de conteo

| Ítem | Lo que dice | Realidad | Corrección |
|------|-------------|----------|------------|
| Plantillas docgen | "28 plantillas" | 29 archivos (`team-member-profile.json`) | Cambiar a "29" e incluirlo en la tabla |
| Repos de referencia | 3 (anthropics, gentle-ai, gda-ai) | 5 (+ betta-tech/byo-coding-agent, anthropics/claude-quickstarts) | Actualizar tabla a 5 |

### 1.2 Archivos faltantes en el árbol de directorios

```
shared/
├── agents/             ← FALTA: plan-arai.md existe aquí
└── scripts/docgen/
    ├── components.js   ← FALTA: existe pero no en diagrama
    └── theme-utils.js  ← FALTA: existe pero no en diagrama
```

### 1.3 Scripts no documentados

- `shared/scripts/docgen-vault.js` — existe, exporta vaults Obsidian a PDF, no se menciona
- `shared/scripts/create-base.js` — existe, no tiene skill creator correspondiente ni documentación

### 1.4 README.md desactualizado (repos)

- La tabla de repos en README.md tiene 3 entradas, pero `repos.json` tiene 5
- `shared/scripts/deploy.sh` se menciona pero **no existe** (error)

### 1.5 Comandos opencode no documentados

AGENTS.md no menciona los 3 comandos opencode: `commit`, `deploy`, `test`

### 1.6 `tui.json` y `tui-plugins/` no documentados

Existen en `platforms/opencode/` pero no aparecen en ningún lado

---

## Fase 2: Rediseñar el template de AGENTS.md para `arai init`

### 2.1 Problemas del template actual

| Problema | Severidad | Descripción |
|----------|-----------|-------------|
| Mismo template para minimal y full | 🔴 Alta | Minimal recibe AGENTS.md que habla de skills que no tiene |
| Referencias a aramirez-ai | 🔴 Alta | "This repository is configured with **aramirez-ai**" habla de aramirez-ai como si fuera parte del proyecto, no como herramienta externa |
| CLI commands no aplican | 🟡 Media | `arai update` (hace git pull sobre aramirez-ai), `arai generate brand`, `arai sync` no aplican en proyectos init |
| Skills listadas que no existen | 🟡 Media | Minimal solo tiene 2 skills pero AGENTS.md lista 9 |
| Solo 2 placeholders | 🟡 Media | `{{project_name}}` y `{{project_description}}` — no hay forma de personalizar skills, agentes, scripts |
| Sin actualización post-install | 🟡 Media | `arai install skill`, `arai generate agent` no actualizan AGENTS.md |
| Bilingüe inconsistente | 🟢 Baja | Descripción de plan-arai en español ("Plan mode que documenta planes en docs/") en documento inglés |
| Tabla de agentes fija | 🟢 Baja | Siempre lista 6 agentes aunque se hayan agregado/quienado algunos |

### 2.2 Propuesta de template dinámico

**En lugar de un archivo estático**, el template debe ser una **función que genera contenido** basado en el template elegido (minimal/full) y los componentes instalados.

Estructura propuesta para `shared/templates/partials/AGENTS.md`:

```markdown
# {{project_name}} — AI Agent Instructions

{{project_description}}

This repository uses **arai** (open-code AI configuration manager) for multi-agent configuration.
Skills, scripts, and prompts are installed from the [aramirez-ai](https://github.com/aaramirez/aramirez-ai) repository.

## Repository structure

{{directory_tree}}

## Available agents

{{agents_table}}

## Available skills

{{skills_table}}

## CLI commands

{{cli_table}}

## When working

(follow existing code style)
```

**Los placeholders se reemplazan dinámicamente** en `bin/arai.js`:

- `{{directory_tree}}` — generado según lo que realmente se copió
- `{{agents_table}}` — construido desde `opencode.json` (filtrado por los agentes instalados)
- `{{skills_table}}` — construido desde `shared/skills/` (solo los que se copiaron)
- `{{cli_table}}` — comandos que aplican al proyecto (sin `arai update` si es proyecto independiente)

### 2.3 Eliminar referencias a aramirez-ai como "parte del proyecto"

Cambios en el template:

| Actual | Propuesto |
|--------|-----------|
| "This repository is configured with **aramirez-ai**" | "This repository uses **arai** for opencode AI configuration management" |
| Las tablas CLI documentan `arai update`, `arai sync` como comandos del proyecto | `arai update` solo aplica si el proyecto es aramirez-ai mismo; para proyectos init solo documentar `arai install`, `arai generate`, `arai list` |
| La estructura de directorios es la de aramirez-ai | La estructura refleja solo lo que se instaló en el proyecto |

### 2.4 Hook post-install/post-generate

Agregar mecanismo para que `arai install` y `arai generate` actualicen AGENTS.md:

```javascript
// En bin/arai.js, después de instalar un componente
function updateAgentsMd(projectDir) {
  const template = readFileSync(resolvePartial('AGENTS.md'), 'utf8');
  const vars = buildVarsFromProjectState(projectDir);
  writeFileSync(join(projectDir, 'AGENTS.md'), applyVars(template, vars));
}
```

Esto requiere que `buildVarsFromProjectState()` inspeccione el directorio del proyecto y genere:
- `{{directory_tree}}` — basado en lo que existe
- `{{agents_table}}` — basado en `opencode.json`
- `{{skills_table}}` — basado en `shared/skills/`
- `{{scripts_table}}` — basado en `shared/scripts/`
- `{{cli_table}}` — basado en `bin/arai.js` + comandos opencode

---

## Fase 3: Unificar o separar los dos roles

Actualmente hay **tres archivos** involucrados:

| Archivo | Rol |
|---------|-----|
| `AGENTS.md` (raíz) | Documentación del proyecto aramirez-ai |
| `shared/templates/partials/AGENTS.md` | Template para `arai init` |
| `shared/agents/plan-arai.md` | Agente plan-arai (duplicado en `platforms/opencode/agents/plan-arai.md`) |

### Opción A: Mantener separados (recomendado)

Dejar que `AGENTS.md` (raíz) y `shared/templates/partials/AGENTS.md` sigan siendo archivos distintos. Cada uno evoluciona independientemente:

- `AGENTS.md` (raíz) se actualiza manualmente con las correcciones de Fase 1
- `shared/templates/partials/AGENTS.md` se rediseña con placeholders dinámicos (Fase 2)
- `bin/arai.js` se modifica para generar las tablas dinámicamente

### Opción B: Unificar con un generador complejo

Un solo `AGENTS.md.template` que se procesa de forma diferente según el contexto:
- Si `process.cwd()` es aramirez-ai → genera documentación completa
- Si es un proyecto init → genera solo lo relevante

**No recomendado** porque añade complejidad innecesaria y hace más difícil mantener ambos.

---

## Resumen de cambios

### Archivos a modificar

| Archivo | Fase | Cambio |
|---------|------|--------|
| `AGENTS.md` (raíz) | 1 | 6 correcciones menores (conteos, árbol, scripts, comandos) |
| `README.md` | 1 | Actualizar repos (3→5), eliminar referencia a deploy.sh |
| `shared/templates/partials/AGENTS.md` | 2 | Rediseñar con placeholders dinámicos |
| `bin/arai.js` | 2 | Funciones generadoras de tablas + hook post-install |
| `tests/integration/outcome-init.test.js` | 2 | Tests para nuevo sistema de placeholders |

### Archivos a crear

| Archivo | Cambio |
|---------|--------|
| (ninguno) | No se requieren archivos nuevos |

### Verificación

1. `npm test` — tests de consistencia e integración deben pasar
2. `arai init /tmp/test-minimal --template minimal` → verificar AGENTS.md generado
3. `arai init /tmp/test-full --template full` → verificar AGENTS.md generado
4. Comparar skills listadas vs skills realmente copiadas en ambos templates
5. Verificar que `arai install skill <name>` actualice AGENTS.md (si se implementa hook)
