# Plan: Completar paquetes distribuibles en shared/

## Problema

shared/ tiene 12 skills pero la mayoría están incompletos. El usuario quiere que cada skill sea un **paquete completo**: agent + skill + scripts + commands, listo para instalar con `arai install skill <name>`.

## Principios

1. **TDD estricto** — cada fase empieza con tests que DEBEN fallar, luego implementación
2. **README.md y AGENTS.md** — se actualizan en cada fase que agregue/modifique artefactos
3. **Zero dependencies** — todos los scripts usan Node.js puro
4. **`arai list`** — todo artifact en shared/ debe ser listable

## Paquete distribuible completo

```
shared/
├── skills/<name>/SKILL.md     ← instrucciones + frontmatter (scripts: [...])
├── scripts/<name>.js          ← implementación CLI
├── agents/<name>.md           ← agente que carga el skill
├── commands/<name>.md         ← comando shortcut
└── (prompts/, rules/)         ← opcionales
```

---

## Análisis por skill

### Tipo A: Paquete completo (skill + script + agent + command)

| Skill | Script | Agent | Command |
|-------|--------|-------|---------|
| content-ingestion | `ingest-content.js` | `content-ingestion.md` | `ingest.md` |
| document-generation | `docgen/*` (existe) | `document-generation.md` | `generate.md` |
| email | `send-email.js` (existe) | `email.md` | `send-email.md` |
| kb-management | `kb-sync.js` | `kb-management.md` | `kb.md` |
| youtube | `youtube-transcript.js` (existe) | `youtube.md` | `youtube-cmd.md` |
| vault-pdf-export | `docgen-vault.js` (existe) | `vault-pdf-export.md` | `export-pdf.md` |

### Tipo B: Utilidad (skill + script)

| Skill | Script |
|-------|--------|
| branding | `create-brand.js` |
| pdf-extraction | `extract-pdf.js` |

### Tipo C: Instructivo/MCP (solo skill)

| Skill | Justificación |
|-------|---------------|
| code-review | Agente `reviewer` ya existe |
| git | Convenciones |
| google-workspace | MCP-based |
| m365 | MCP-based |

---

## Fase 0: Extender `installSkill()` — TDD

### Test (`tests/shared/install-skill-full.test.js`) — DEBE FALLAR
```js
test('installSkill() copies agent if exists in shared/agents/')
test('installSkill() copies command if exists in shared/commands/')
test('installSkill() registers agent in opencode.json')
test('installSkill() does not fail if no agent exists')
test('installSkill() does not fail if no command exists')
```

### Implementar (`shared/scripts/lib/install.js`)
- Después de `installSkillScripts()`, buscar `shared/agents/<name>.md`
- Si existe, copiar a `.opencode/agents/<name>.md` y registrar en opencode.json
- Buscar `shared/commands/<name>.md`, copiar a `.opencode/commands/<name>.md`

### Verificar
```bash
npm test -- tests/shared/install-skill-full.test.js
```

---

## Fase 1: Scripts nuevos — TDD

### Tests (DEBEN FALLAR)

**`tests/shared/create-brand.test.js`**:
```js
test('--help shows usage')
test('--validate without brand.json shows error')
test('--init generates valid brand.json')
test('--show without brand.json shows error')
test('brand.json has required fields (brand.name, brand.colors, brand.fonts)')
```

**`tests/shared/ingest-content.test.js`**:
```js
test('--help shows usage')
test('no args shows error')
test('--source with nonexistent file shows error')
test('--format markdown generates valid output')
test('output has frontmatter with title and source')
```

**`tests/shared/kb-sync.test.js`**:
```js
test('--help shows usage')
test('--validate without directory shows error')
test('--validate with valid vault returns 0')
test('--fix-links repairs broken wikilinks')
test('detects orphan notes')
```

**`tests/shared/extract-pdf.test.js`**:
```js
test('--help shows usage')
test('no file shows error')
test('--output generates file')
test('--format markdown generates markdown')
```

### Implementar scripts
- `shared/scripts/create-brand.js` — CLI `--init`, `--validate`, `--show`
- `shared/scripts/ingest-content.js` — CLI `--source`, `--batch`, `--source-url`, `--output`
- `shared/scripts/kb-sync.js` — CLI `--validate`, `--fix-links`, `--reindex`
- `shared/scripts/extract-pdf.js` — CLI `<file>`, `--output`, `--format`

### Actualizar README.md
- Agregar scripts a tabla de "Shared Scripts"

### Verificar
```bash
npm test -- tests/shared/create-brand.test.js tests/shared/ingest-content.test.js tests/shared/kb-sync.test.js tests/shared/extract-pdf.test.js
```

---

## Fase 2: Agents nuevos — TDD

### Test (`tests/shared/agents.test.js`) — DEBE FALLAR
```js
test('content-ingestion.md exists in shared/agents/')
test('document-generation.md exists in shared/agents/')
test('email.md exists in shared/agents/')
test('kb-management.md exists in shared/agents/')
test('youtube.md exists in shared/agents/')
test('vault-pdf-export.md exists in shared/agents/')
test('all agents have valid frontmatter (description, mode, permission)')
test('all agents reference their skill')
test('no duplicate agents in shared/agents/ and .opencode/agents/')
```

### Implementar agents en `shared/agents/`

| Agent | Mode | Skill |
|-------|------|-------|
| `content-ingestion.md` | subagent | content-ingestion |
| `document-generation.md` | subagent | document-generation |
| `email.md` | subagent | email |
| `kb-management.md` | subagent | kb-management |
| `youtube.md` | subagent | youtube |
| `vault-pdf-export.md` | subagent | vault-pdf-export |

**Frontmatter pattern**:
```yaml
---
description: <descripción>
mode: subagent
model: opencode/big-pickle
permission:
  edit: deny
  bash: allow
---
```

**Contenido**: instrucciones para cargar el skill y usar los scripts.

### Actualizar README.md
- Agregar agents a tabla de "Shared Agents"

### Actualizar AGENTS.md
- Agregar agents a tabla de "Agent Registry"

### Verificar
```bash
npm test -- tests/shared/agents.test.js
```

---

## Fase 3: Commands nuevos — TDD

### Test (`tests/shared/commands.test.js`) — DEBE FALLAR
```js
test('ingest.md exists in shared/commands/')
test('generate.md exists in shared/commands/')
test('send-email.md exists in shared/commands/')
test('kb.md exists in shared/commands/')
test('youtube-cmd.md exists in shared/commands/')
test('export-pdf.md exists in shared/commands/')
test('all commands have valid frontmatter (description)')
test('all commands have actionable content')
```

### Implementar commands en `shared/commands/`

| Command | Description |
|---------|-------------|
| `ingest.md` | Ingest content from file/URL into knowledge base |
| `generate.md` | Generate branded document from template |
| `send-email.md` | Send email via SMTP |
| `kb.md` | Sync and validate knowledge base |
| `youtube-cmd.md` | Fetch YouTube video transcript |
| `export-pdf.md` | Export vault content to PDF |

### Actualizar README.md
- Agregar commands a tabla de "Shared Commands"

### Verificar
```bash
npm test -- tests/shared/commands.test.js
```

---

## Fase 4: Skills nuevos — TDD

### Test (`tests/shared/skill-completeness.test.js`) — DEBE FALLAR
```js
test('ci-validate/SKILL.md exists')
test('repos-sync/SKILL.md exists')
test('ci-validate has valid frontmatter')
test('repos-sync has valid frontmatter')
test('ci-validate references ci-validate.js')
test('repos-sync references repos-sync.js')
```

### Implementar skills
- `shared/skills/ci-validate/SKILL.md`
- `shared/skills/repos-sync/SKILL.md`

### Actualizar README.md
- Agregar skills a tabla de "Shared Skills"

### Verificar
```bash
npm test -- tests/shared/skill-completeness.test.js
```

---

## Fase 5: Actualizar frontmatter existentes — TDD

### Test (`tests/shared/frontmatter-updates.test.js`) — DEBE FALLAR
```js
test('branding SKILL.md has scripts: [create-brand.js]')
test('content-ingestion SKILL.md has scripts: [ingest-content.js]')
test('kb-management SKILL.md has scripts: [kb-sync.js]')
test('pdf-extraction SKILL.md has scripts: [extract-pdf.js]')
```

### Actualizar frontmatter
- `shared/skills/branding/SKILL.md` → `scripts: [create-brand.js]`
- `shared/skills/content-ingestion/SKILL.md` → `scripts: [ingest-content.js]`
- `shared/skills/kb-management/SKILL.md` → `scripts: [kb-sync.js]`
- `shared/skills/pdf-extraction/SKILL.md` → `scripts: [extract-pdf.js]`

### Verificar
```bash
npm test -- tests/shared/frontmatter-updates.test.js
```

---

## Fase 6: Documentación — TDD

### Tests (`tests/consistency/docs-consistency.test.js`) — DEBEN FALLAR
```js
test('AGENTS.md mentions all 10 shared agents')
test('AGENTS.md mentions distributable package pattern')
test('README.md lists all 14 skills')
test('README.md lists all 9 scripts')
test('README.md lists all 10 agents')
test('README.md lists all 9 commands')
test('README.md architecture section matches actual structure')
```

### 6.1 AGENTS.md — sección "Distributable Package Pattern"

Agregar después de "Creator Triplet Pattern":

```markdown
### Distributable Package Pattern

Each distributable artifact in `shared/` follows a four-layer package:

\```
shared/
├── skills/<name>/SKILL.md     ← instructions + frontmatter
├── scripts/<name>.js          ← CLI implementation
├── agents/<name>.md           ← agent that loads the skill
└── commands/<name>.md         ← shortcut command
\```

When a user runs `arai install skill <name>`, all four layers are installed:
- Skill → `.opencode/skills/<name>/`
- Scripts → `shared/scripts/`
- Agent → `.opencode/agents/<name>/` + registered in `opencode.json`
- Command → `.opencode/commands/<name>/`

**Three package types:**
- **Full** (6): content-ingestion, document-generation, email, kb-management, youtube, vault-pdf-export
- **Utility** (2): branding, pdf-extraction
- **Instructive** (4): code-review, git, google-workspace, m365
```

### 6.2 Skill: `.opencode/skills/distribution-pattern/SKILL.md`
- Patrón detallado paso a paso
- Ejemplos de paquetes completos
- Cómo crear un nuevo paquete distribuible

### 6.3 README.md — actualizar tablas

**Shared Skills** (14):
| Skill | Scripts | Agent | Command | Tipo |
|-------|---------|-------|---------|------|
| branding | create-brand.js | — | — | utility |
| code-review | — | — | — | instructive |
| content-ingestion | ingest-content.js | content-ingestion.md | ingest.md | full |
| document-generation | docgen/* | document-generation.md | generate.md | full |
| email | send-email.js, mcp-email.js | email.md | send-email.md | full |
| git | — | — | — | instructive |
| google-workspace | — | — | — | mcp |
| kb-management | kb-sync.js | kb-management.md | kb.md | full |
| m365 | — | — | — | mcp |
| pdf-extraction | extract-pdf.js | — | — | utility |
| vault-pdf-export | docgen-vault.js | vault-pdf-export.md | export-pdf.md | full |
| youtube | youtube-transcript.js | youtube.md | youtube-cmd.md | full |
| ci-validate | ci-validate.js | — | — | utility |
| repos-sync | repos-sync.js | — | — | utility |

**Shared Agents** (10):
| Agent | Mode | Description |
|-------|------|-------------|
| content-ingestion | subagent | Orchestrate content ingestion pipeline |
| document-generation | subagent | Generate branded documents |
| docs | subagent | Documentation specialist |
| email | subagent | Manage email sending |
| kb-management | subagent | Manage knowledge base |
| plan-arai | primary | Plan mode for arai |
| reviewer | subagent | Code review specialist |
| tester | subagent | Testing specialist |
| vault-pdf-export | subagent | Export vault to PDF |
| youtube | subagent | Fetch YouTube transcripts |

**Shared Commands** (9):
| Command | Description |
|---------|-------------|
| commit | Stage all changes and create conventional commit |
| deploy | Deploy the current project |
| export-pdf | Export vault content to PDF |
| generate | Generate branded document from template |
| ingest | Ingest content from file/URL into knowledge base |
| kb | Sync and validate knowledge base |
| send-email | Send email via SMTP |
| test | Run the test suite |
| youtube-cmd | Fetch YouTube video transcript |

### Verificar
```bash
npm test -- tests/consistency/docs-consistency.test.js
```

---

## Fase 7: Tests de consistencia final — TDD

### Tests (`tests/consistency/shared-artifacts.test.js`) — DEBEN FALLAR
```js
test('every skill with scripts: has the referenced script in shared/scripts/')
test('every agent in shared/agents/ has valid frontmatter')
test('every command in shared/commands/ has valid frontmatter')
test('no orphan scripts (scripts without skills, except lib/ docgen/)')
test('no workflow skill without agent')
test('no workflow skill without command')
test('installSkill() installs all 4 layers for full packages')
```

### Verificar
```bash
npm test -- tests/consistency/shared-artifacts.test.js
```

---

## Verificación final

```bash
npm test                              # TODOS los tests pasan
node shared/scripts/ci-validate.js    # validación de integridad
arai list skills                      # 14 skills
arai list scripts                     # 9 scripts
arai list agents                      # 10 agents
arai list commands                    # 9 commands
```

---

## Conteo total

| Tipo | Nuevos | Modificados |
|------|--------|-------------|
| Scripts | 4 | 1 (install.js) |
| Agents | 6 | — |
| Commands | 6 | — |
| Skills | 2 | 4 (frontmatter) |
| Tests | 8 | — |
| Docs | 2 (skill + AGENTS section) | 2 (README + AGENTS) |
| **Total** | **28** | **7** |
