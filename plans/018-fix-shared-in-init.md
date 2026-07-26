# Fix: Eliminar `shared/` de proyectos init — todo va a `.opencode/`

## Objective

Cuando `arai init <project> --template full` crea un nuevo proyecto, **no debe existir directorio `shared/`**. Todo debe ir a `.opencode/` (opencode-native).

## Problem

Actualmente `arai init` crea `shared/` en cada proyecto nuevo:

```
proyecto/
├── .opencode/          ← skills, agents, commands, plugins ✓
├── shared/             ← BUG: NO debería existir
│   ├── brand.json
│   ├── scripts/        ← 24 scripts copiados aquí
│   ├── prompts/        ← commit-message.md
│   └── rules/          ← code-style.md
└── assets/
```

### Raíz del problema

`destDirFor()` en `helpers.js` y `scaffold.js` envían scripts/prompts/rules a `shared/` en vez de `.opencode/`:

```javascript
// helpers.js:58-67
function destDirFor(type, projectRoot) {
  const map = {
    skill:  join(projectRoot, '.opencode', 'skills'),     // ✓
    agent:  join(projectRoot, '.opencode', 'agents'),     // ✓
    script: join(projectRoot, 'shared', 'scripts'),       // ✗ → .opencode/scripts
    prompt: join(projectRoot, 'shared', 'prompts'),       // ✗ → .opencode/prompts
    rule:   join(projectRoot, 'shared', 'rules'),         // ✗ → .opencode/rules
  };
}
```

### Referencias rotas en el proyecto generado

1. **`opencode.json`** tiene `references` apuntando a `../shared/scripts` — ruta fuera del proyecto
2. **`AGENTS.md`** lista scripts como `shared/scripts/<name>.js`
3. **Agentes .md** referencian `shared/scripts/` en sus comandos de ejemplo
4. **Skills SKILL.md** referencian `shared/scripts/` y `shared/brand.json`

## Scope del fix

### Archivos a modificar en el harness (aramirez-ai)

| Archivo | Cambio |
|---------|--------|
| `shared/scripts/lib/helpers.js` | `destDirFor()`: script→`.opencode/scripts`, prompt→`.opencode/prompts`, rule→`.opencode/rules` |
| `shared/scripts/lib/scaffold.js` | Líneas 49-76: scripts/prompts/rules van a `.opencode/` en vez de `shared/` |
| `shared/scripts/lib/scaffold.js` | Línea 146: brand.json va a `.opencode/brand.json` en vez de `shared/brand.json` |
| `shared/scripts/lib/scaffold.js` | Líneas 111-118: brand.json partial se escribe a `.opencode/` |
| `shared/scripts/lib/install.js` | `installSkillScripts()`, `installScript()`, `installPrompt()`, `installRule()`: cambiar destinos de `shared/` a `.opencode/` |
| `shared/scripts/lib/install.js` | `uninstallScript()`, `uninstallPrompt()`, `uninstallRule()`: actualizar paths |
| `shared/scripts/lib/agents-md.js` | `buildDirectoryTree()`: buscar scripts en `.opencode/scripts` |
| `shared/scripts/lib/agents-md.js` | `buildScriptsTable()`: leer de `.opencode/scripts` |
| `shared/templates/partials/opencode.json` | Eliminar `references` section (las rutas `../shared/` están rotas) |
| `shared/templates/partials/AGENTS.md` | Cambiar `shared/rules/code-style.md` → `.opencode/rules/code-style.md` |

### Skills/agents que referencian `shared/scripts/`

| Skill/Agent | Referencia | Nuevo path |
|-------------|-----------|------------|
| `shared/skills/youtube/SKILL.md` | `shared/scripts/youtube-transcript.js` | `.opencode/scripts/youtube-transcript.js` |
| `shared/skills/document-generation/SKILL.md` | `shared/scripts/docgen/build-*.js` | `.opencode/scripts/docgen/build-*.js` |
| `shared/skills/email/SKILL.md` | `shared/scripts/send-email.js`, `shared/scripts/mcp-email.js` | `.opencode/scripts/...` |
| `shared/skills/kb-management/SKILL.md` | `shared/scripts/kb-sync.js` | `.opencode/scripts/kb-sync.js` |
| `shared/skills/pdf-extraction/SKILL.md` | `shared/scripts/extract-pdf.js` | `.opencode/scripts/extract-pdf.js` |
| `shared/skills/repos-sync/SKILL.md` | `shared/scripts/repos-sync.js` | `.opencode/scripts/repos-sync.js` |
| `shared/skills/ci-validate/SKILL.md` | `shared/scripts/ci-validate.js` | `.opencode/scripts/ci-validate.js` |
| `shared/skills/vault-pdf-export/SKILL.md` | `shared/scripts/docgen-vault.js` | `.opencode/scripts/docgen-vault.js` |
| `shared/skills/content-ingestion/SKILL.md` | `shared/scripts/ingest-content.js` | `.opencode/scripts/ingest-content.js` |
| `shared/skills/branding/SKILL.md` | `shared/brand.json`, `shared/scripts/create-brand.js` | `.opencode/brand.json`, `.opencode/scripts/create-brand.js` |
| `.opencode/agents/youtube.md` | `shared/scripts/youtube-transcript.js` | `.opencode/scripts/youtube-transcript.js` |
| `.opencode/agents/email.md` | `shared/scripts/send-email.js` | `.opencode/scripts/send-email.js` |
| `.opencode/agents/vault-pdf-export.md` | `shared/scripts/docgen-vault.js` | `.opencode/scripts/docgen-vault.js` |
| `.opencode/agents/document-generation.md` | `shared/scripts/docgen/build-*.js` | `.opencode/scripts/docgen/build-*.js` |
| `.opencode/agents/branding.md` | `shared/brand.json`, `shared/scripts/create-brand.js` | `.opencode/brand.json`, `.opencode/scripts/create-brand.js` |

### Tests afectados

| Test | Cambio |
|------|--------|
| `tests/integration/outcome-init.test.js` | Verificar `.opencode/scripts/` en vez de `shared/scripts/` |
| `tests/consistency/shared-packages.test.js` | Actualizar paths de verificación |
| `tests/consistency/docs-consistency.test.js` | Actualizar paths de verificación |
| `tests/consistency/eliminated-skills.test.js` | Agregar `shared/scripts/` como eliminado |
| `tests/commands/install-platform.test.js` | Verificar `.opencode/scripts/` |

### Estructura resultado (antes vs después)

**ANTES (bug):**
```
proyecto/
├── .opencode/skills/...
├── .opencode/agents/...
├── .opencode/commands/...
├── shared/scripts/...      ← 24 scripts
├── shared/prompts/...      ← 1 prompt
├── shared/rules/...        ← 1 rule
└── shared/brand.json       ← brand
```

**DESPUÉS (correcto):**
```
proyecto/
├── .opencode/skills/...
├── .opencode/agents/...
├── .opencode/commands/...
├── .opencode/scripts/...   ← 24 scripts
├── .opencode/prompts/...   ← 1 prompt
├── .opencode/rules/...     ← 1 rule
└── .opencode/brand.json    ← brand
```

No hay directorio `shared/` en el proyecto generado.

## Risk: existing projects

Existing projects that already have `shared/scripts/` will not be migrated automatically. This is acceptable since `arai init` projects are new — users with existing `shared/` can migrate manually.

## Execution Order

1. **TDD: Tests que deben fallar** — agregar tests negativos para `shared/`
2. **Core: helpers.js** — cambiar `destDirFor()` para script/prompt/rule
3. **Core: scaffold.js** — cambiar destinos de scripts/prompts/rules/brand
4. **Core: install.js** — cambiar destinos de install/uninstall para scripts/prompts/rules
5. **Core: agents-md.js** — cambiar `buildDirectoryTree()` y `buildScriptsTable()`
6. **Partials: opencode.json** — eliminar `references` section
7. **Partials: AGENTS.md** — cambiar path de rules
8. **Skills/agents** — actualizar todas las referencias a `shared/scripts/` → `.opencode/scripts/`
9. **Tests** — actualizar todos los tests que verifican paths
10. **Verify** — npm test + arai init + verificar que shared/ no existe

## Verification

```bash
npm test                                    # todos pasan
arai init /tmp/verify --template full       # crear proyecto
ls /tmp/verify/shared/ 2>&1                # debe fallar (no existe)
ls /tmp/verify/.opencode/scripts/           # debe tener los 24 scripts
cat /tmp/verify/opencode.json               # sin references section
grep "shared/" /tmp/verify/AGENTS.md        # sin coincidencias
```


