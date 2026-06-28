# aramirez-ai

Gestor centralizado de configuración multi-agente + generación de documentos técnicos.

Tres sistemas en un solo repositorio:

| Sistema | Descripción |
|---------|-------------|
| **AI Agent Config** | Configuración multi-agente para opencode, Claude Code, Cursor y Codex |
| **Scaffolding** | `arai init` — genera estructura de agente AI en nuevos proyectos |
| **Document Pipeline** | Genera PDF, HTML, PNG, PowerPoint desde JSON/Markdown |

---

## Índice

- [Instalación](#instalación)
- [CLI: arai](#cli-arai)
- [Agentes disponibles](#agentes-disponibles)
- [Skills disponibles](#skills-disponibles)
- [Scripts disponibles](#scripts-disponibles)
- [Assets y plantillas](#assets-y-plantillas)
- [Document Pipeline (docgen)](#document-pipeline-docgen)
- [Brand identity](#brand-identity)
- [CI validation](#ci-validation)
- [Reference repos](#reference-repos)
- [Cross-platform](#cross-platform)
- [Requisitos](#requisitos)

---

## Instalación

### Global (tu máquina)

```bash
git clone git@github.com:aaramirez/aramirez-ai.git ~/.config/aramirez
cd ~/.config/aramirez
npm install
npm link

# Instalar agentes
arai install opencode --global   # symlink → ~/.config/opencode/
arai install claude --global     # symlink → ~/.claude/
arai install cursor --global     # symlink → ~/.cursor/
arai install codex --global      # symlink → ~/.codex/
```

### Por proyecto

```bash
cd mi-proyecto

# Modo OPENCODE_CONFIG_DIR (sin copias, recomendado para dev)
arai install opencode --project .
# → Crea .env con OPENCODE_CONFIG_DIR apuntando al repo

# Modo copia (portable, commiteable)
arai install opencode --project . --copy
# → Crea .opencode/agents, .opencode/skills, opencode.json, etc.
```

### Verificar instalación

```bash
arai status
```

Muestra el estado de todos los agentes instalados y su configuración.

---

## CLI: `arai`

### Referencia completa de comandos

| Comando | Descripción |
|---------|-------------|
| `arai install <agent>` | Instala agente (global o por proyecto) |
| `arai uninstall <agent>` | Elimina instalación de agente |
| `arai status` | Estado de todos los agentes |
| `arai update` | `git pull` + `npm install` en el repo |
| `arai sync [agent]` | Re-aplica config de proyecto |
| `arai skills sync` | Sincroniza skills a opencode |
| `arai skills sync --skill <name>` | Sincroniza solo una skill específica |
| `arai kb install [dir]` | Crea vault Obsidian (kb/) |
| `arai init <dir>` | Scaffolding de nuevo proyecto |
| `arai template list` | Lista plantillas disponibles |
| `arai list skills` | Lista skills disponibles |
| `arai list agents` | Lista agentes registrados |
| `arai list scripts` | Lista scripts disponibles |
| `arai list templates` | Lista plantillas disponibles |
| `arai list commands` | Lista comandos opencode |
| `arai list mcp` | Lista servidores MCP configurados |
| `arai generate skill <name>` | Crea nueva skill |
| `arai generate agent <name>` | Crea nuevo agente |
| `arai generate script <name>` | Crea nuevo script |
| `arai generate command <name>` | Crea nuevo comando opencode |
| `arai generate brand` | Configura identidad visual |
| `arai transform skills` | Transforma skills a otros formatos |

---

### Detalle de comandos

#### `arai install <agent>`

Instala la configuración de un agente AI.

| Opción | Descripción |
|--------|-------------|
| `--global` | Instala globalmente (symlinks en `~/.config/<agent>/`) |
| `--project <dir>` | Instala en un proyecto (crea `.env` con `OPENCODE_CONFIG_DIR`) |
| `--copy` | (requiere `--project`) Copia archivos en lugar de usar env var |

**Soportado para**: `opencode`, `claude`, `cursor`, `codex`

> Nota: Subagentes como `plan`, `reviewer`, `tester`, `docs` se definen dentro de `opencode.json` y vienen incluidos al instalar opencode. No se instalan por separado.

```bash
arai install opencode --global
arai install claude --global
arai install opencode --project . --copy
```

#### `arai uninstall <agent>`

Elimina la instalación de un agente.

| Opción | Descripción |
|--------|-------------|
| `--global` | Elimina symlinks globales |
| `--project <dir>` | Elimina config de proyecto |
| `--copy` | Elimina archivos copiados (`.opencode/`, `opencode.json`) |

```bash
arai uninstall opencode          # elimina global
arai uninstall opencode --project .      # elimina env-var config
arai uninstall opencode --project . --copy  # elimina copia
```

#### `arai status`

Muestra el estado de instalación de todos los agentes.

```
$ arai status
✓ opencode  → global (~/.config/opencode/)
✓ claude    → global (~/.claude/)
✗ cursor    → no instalado
✗ codex     → no instalado
```

#### `arai update`

Ejecuta `git pull` + `npm install` en el repositorio y re-aplica configuraciones.

```bash
arai update
```

#### `arai sync [agent]`

Re-aplica la configuración de un agente en proyectos. Útil después de `arai update` en modo `--copy`.

```bash
arai sync              # sincroniza todos
arai sync opencode     # solo opencode
```

#### `arai init <dir>`

Scaffolding: genera un nuevo proyecto con estructura de agente AI.

| Opción | Descripción |
|--------|-------------|
| `--template <name>` | Plantilla a usar (`minimal` por defecto, `full` para completo) |
| `--description <text>` | Descripción del proyecto |

```bash
arai init mi-proyecto                       # template minimal
arai init mi-proyecto --template full        # estructura completa
arai init mi-proyecto --description "API REST"
```

**Templates disponibles**:

| Template | Incluye |
|----------|---------|
| `minimal` | Skills git + code-review, commit-message prompt, code-style rule, opencode platform |
| `full` | Todas las skills, scripts, platforms, transforms, branding, assets |

Las plantillas se definen en `shared/templates/<name>/template.json`.  
Plantillas personalizadas en `~/.config/arai/templates/`.

#### `arai template list`

Lista todas las plantillas disponibles (built-in y personalizadas).

```bash
arai template list
```

#### `arai skills sync`

Sincroniza skills de `shared/skills/` al directorio de opencode.

| Opción | Descripción |
|--------|-------------|
| `--project <dir>` | Sincroniza al proyecto en lugar de global |
| `--skill <name>` | Sincroniza solo una skill específica (por nombre) |

```bash
arai skills sync                        # todas, global
arai skills sync --project .            # todas al proyecto actual
arai skills sync --skill pdf-extraction --project .   # solo una
```

#### `arai list <resource>`

Lista recursos disponibles en el repositorio.

| Subcomando | Descripción |
|------------|-------------|
| `arai list skills` | Lista skills disponibles con descripción |
| `arai list agents` | Lista agentes registrados en opencode.json (modo, modelo, descripción) |
| `arai list scripts` | Lista scripts en shared/scripts/ |
| `arai list templates` | Lista plantillas de scaffolding |
| `arai list commands` | Lista comandos opencode registrados |
| `arai list mcp` | Lista servidores MCP configurados |

```bash
arai list skills
arai list agents
arai list scripts
arai list templates
arai list commands
arai list mcp
```

### Output de ejemplo

```bash
$ arai list skills

  branding                 Define and apply brand identity — colors, logos...
  code-review              Use for reviewing pull requests, performing code...
  document-generation      Generate branded PDF presentations...
  ...

$ arai list agents

  build                mode: primary    model: -
                       Default build agent for coding tasks

  reviewer             mode: subagent   model: anthropic/claude-sonnet-4-6
                       Code review specialist...

$ arai list mcp

  github               https://api.github.com/mcp
                       (disabled)
  playwright           npx -y @playwright/mcp
                       (disabled)
```

#### `arai kb install [dir]`

Crea un vault Obsidian (`kb/`) en el directorio especificado.

| Opción | Descripción |
|--------|-------------|
| `--force` | Sobrescribe si existe |

```bash
arai kb install                  # ./kb/
arai kb install ~/my-vault
arai kb install --force          # sobrescribe si existe
```

#### `arai generate skill <name>`

Crea una nueva skill en `shared/skills/<name>/SKILL.md`.

| Opción | Descripción |
|--------|-------------|
| `--dir <path>` | Directorio del proyecto (default: `.`) |

```bash
arai generate skill api-client
arai generate skill data-pipeline --dir ~/proyectos/mi-app
```

#### `arai generate agent <name>`

Crea un nuevo agente y lo registra automáticamente en `opencode.json`.

| Opción | Descripción |
|--------|-------------|
| `--dir <path>` | Directorio del proyecto (default: `.`) |
| `--description <text>` | Descripción del agente |

```bash
arai generate agent security-reviewer --description "Security code review specialist"
```

#### `arai generate script <name>`

Crea un script reutilizable en `shared/scripts/`.

| Opción | Descripción |
|--------|-------------|
| `--dir <path>` | Directorio del proyecto (default: `.`) |
| `--description <text>` | Descripción del script |

```bash
arai generate script data-migration --description "DB migration utility"
```

#### `arai generate command <name>`

Crea un comando para opencode en `platforms/opencode/commands/`.

| Opción | Descripción |
|--------|-------------|
| `--dir <path>` | Directorio del proyecto (default: `.`) |
| `--description <text>` | Descripción del comando |

```bash
arai generate command lint --description "Run linter and fix issues"
```

#### `arai generate brand`

Configura la identidad visual del proyecto.

| Opción | Descripción |
|--------|-------------|
| `--dir <path>` | Directorio del proyecto (default: `.`) |
| `--name <name>` | Nombre de la empresa/marca |
| `--primary <hex>` | Color primario (ej. `#1a365d`) |
| `--secondary <hex>` | Color secundario |
| `--accent <hex>` | Color de acento |
| `--text <hex>` | Color de texto |
| `--background <hex>` | Color de fondo |
| `--light-bg <hex>` | Color de fondo claro |
| `--logo <path>` | Ruta al logo (SVG/PNG) |
| `--logo-white <path>` | Ruta al logo en blanco |

```bash
arai generate brand --name "Mi Empresa" --primary "#1a365d" --secondary "#2b6cb0"
arai generate brand --logo path/to/logo.svg --logo-white path/to/logo-white.svg
```

Actualiza `shared/brand.json` y copia los logos a `assets/images/`.

#### `arai transform skills`

Transforma skills del formato SKILL.md a formatos específicos de cada plataforma.

| Opción | Descripción |
|--------|-------------|
| `--to <agent>` | Transforma a una plataforma específica (`cursor`, `codex`) |
| `--all` | Transforma a todas las plataformas |

```bash
arai transform skills --to cursor
arai transform skills --all
```

---

## Agentes disponibles

### Registrados en opencode.json

| Nombre | Modo | Descripción | Modelo | Permisos |
|--------|------|-------------|--------|----------|
| **build** | `primary` | Default build agent for coding tasks | `big-pickle` | — |
| **plan** | `primary` | Planning agent for architecture and design | `big-pickle` | `edit: deny` |
| **build-sonnet** | `primary` | Build agent using Claude Sonnet 4.6 | `claude-sonnet-4-6` | — |
| **plan-sonnet** | `primary` | Planning agent using Claude Sonnet 4.6 | `claude-sonnet-4-6` | `edit: deny` |
| **reviewer** | `subagent` | Code review specialist. Use for PR reviews and quality checks. | `claude-sonnet-4-6` | `edit: deny` |
| **tester** | `subagent` | Testing specialist. Use for writing and running tests. | `claude-haiku-4-5` | `bash: allow` |
| **docs** | `subagent` | Documentation specialist. Use for README, docs, and changelogs. | `claude-haiku-4-5` | `edit: allow`, `bash: deny` |

**Default agent**: `build`

### Archivos de definición

| Archivo | Descripción |
|---------|-------------|
| `platforms/opencode/agents/reviewer.md` | Code review specialist checklist |
| `platforms/opencode/agents/tester.md` | Testing specialist instructions |
| `platforms/opencode/agents/docs.md` | Documentation specialist instructions |

### Comandos opencode

| Comando | Descripción |
|---------|-------------|
| `/test` | Ejecuta tests |
| `/deploy` | Despliega la aplicación |
| `/commit` | Crea commit convencional |

### Plugins y MCP

| Recurso | Estado | Descripción |
|---------|--------|-------------|
| `plugins/example.ts` | Template | Plugin de ejemplo |
| MCP: playwright | Deshabilitado por defecto | Navegador headless |
| MCP: github | Deshabilitado por defecto | API de GitHub |

---

## Skills disponibles

| Skill | Descripción |
|-------|-------------|
| **branding** | Define y aplica identidad visual (colores, logos, tipografía) para documentos generados |
| **code-review** | Revisión de PRs, auditorías de código y estándares de calidad |
| **content-ingestion** | Toma contenido de cualquier fuente (PDF, DOCX, web, texto, markdown) y lo estructura en una knowledge base con frontmatter, wikilinks y formato |
| **document-generation** | Genera presentaciones PDF, HTML decks, reportes e imágenes usando los builders Node.js |
| **git** | Operaciones git, estrategias de branching, convenciones de commit, gestión de repos |
| **kb-management** | Mantenimiento de vault knowledge base — actualizar notas, wikilinks, reestructurar, mantener workspace y graph sincronizados |
| **pdf-extraction** | Extrae texto literal de PDFs — maneja saltos de columna, reconstrucción de párrafos, detección de tablas y problemas de encoding |
| **youtube** | Obtiene y procesa transcripciones de YouTube para alimentar modelos AI, generar resúmenes, crear notas de curso o analizar contenido de video |

Todas las skills están en `shared/skills/<nombre>/SKILL.md` con formato estándar (frontmatter YAML + markdown).

### Compatibilidad por plataforma

| Skill | opencode | claude | cursor | codex |
|-------|----------|--------|--------|-------|
| branding | ✓ | ✓ | ✓ | ✓ |
| code-review | ✓ | ✓ | ✓ | ✓ |
| content-ingestion | ✓ | ✓ | ✓ | ✓ |
| document-generation | ✓ | ✓ | ✓ | ✓ |
| git | ✓ | ✓ | ✓ | ✓ |
| kb-management | ✓ | ✓ | ✓ | ✓ |
| pdf-extraction | ✓ | ✓ | ✓ | ✓ |
| youtube | ✓ | ✓ | ✓ | ✓ |

Las skills se transforman a formatos específicos con `arai transform skills --all`.

---

## Scripts disponibles

### Scripts independientes

| Script | Descripción |
|--------|-------------|
| `shared/scripts/ci-validate.js` | Validación CI/CD portable — estructura del proyecto, frontmatter de skills, placeholders, .gitignore, brand.json. Opciones: `--strict`, `--verbose`, `--dir <path>` |
| `shared/scripts/repos-sync.js` | Gestor de repositorios de referencia desde `repos.json`. Opciones: `--list`, `<name>` (repo específico) |
| `shared/scripts/youtube-transcript.js` | Obtenedor de transcripciones de YouTube (API youtube-transcript.ai). Opciones: `--lang <code>`. API programática: `fetchTranscript()`, `parseVideoId()` |
| `shared/scripts/deploy.sh` | Script placeholder de deploy |

### Docgen library (10 scripts)

| Script | Descripción |
|--------|-------------|
| `docgen/index.js` | Core library — brand loading, SVG primitives, HTML→PDF, SVG→PDF, source loading, browser detection |
| `docgen/charts.js` | Generación de gráficos SVG — 13 tipos (bar, grouped-bar, stacked-bar, donut, pie, line, progress, gauge, timeline, gantt, radar, waterfall, heatmap) |
| `docgen/html-theme.js` | Tema HTML para slides — 20+ tipos (portada, seccion, bullets, dos-columnas, n-columnas, tarjetas, kpis, personas, cita, imagen, tabla, lamina-completa, grafico, imagen-texto, destacado, comparativa, timeline, proceso, masonry, faq) |
| `docgen/report-theme.js` | Tema HTML para reportes ejecutivos — 10 tipos (doc-cover, section, text, callout, table, bullets, recommendation, roadmap, kpi-table, closing) |
| `docgen/build-deck.js` | Genera PDF de presentación (motor HTML o SVG). Opciones: `--engine <html\|svg>`, `--output <path>` |
| `docgen/build-image.js` | Genera imagen standalone PNG/SVG. Opciones: `--format <png\|svg>`, `--output <path>` |
| `docgen/build-report.js` | Genera PDF de reporte ejecutivo. Opciones: `--output <path>` |
| `docgen/build-web.js` | Genera presentación web HTML auto-contenida con navegación por teclado/touch. Opciones: `--output <path>` |
| `docgen/build-pptx.js` | Genera PowerPoint (.pptx) — requiere Python + python-pptx. Opciones: `--output <path>` |
| `docgen/validate.js` | Validación CI del pipeline docgen — sintaxis, templates, smoke tests. Opciones: `--quick` |

---

## Assets y plantillas

### Templates de scaffolding (`shared/templates/`)

| Nombre | Descripción |
|--------|-------------|
| **full** | Estructura completa: todas las skills, scripts, platforms, transforms, branding, assets |
| **minimal** | Mínimo: skills git + code-review, prompt commit-message, rule code-style, plataforma opencode |

### Partials (`shared/templates/partials/`)

12 archivos reutilizables: `.gitignore`, `AGENTS.md`, `agent.md`, `brand.json`, `command.md`, `logo-white.svg`, `logo.svg`, `opencode.json`, `package.json`, `repos.json`, `script.js`, `skill.md`

### Test decks (`assets/decks/`)

| Archivo | Descripción |
|---------|-------------|
| `test-deck.json` | Presentación completa (23 slides, todos los tipos de slide y gráficos) |
| `test-deck-svg-from-md.md` | Deck desde Markdown (4 slides, motor SVG) |
| `test-report.json` | Reporte ejecutivo (11 secciones, todos los tipos de reporte) |

### CSS templates (`assets/templates/`)

| Archivo | Descripción |
|---------|-------------|
| `deck.css` | CSS para presentaciones (357 lines, colores de marca inyectados en runtime) |
| `report.css` | CSS para reportes ejecutivos (354 lines) |

### Brand config (`shared/brand.json`)

Contiene la identidad visual centralizada: nombre, colores (primary, secondary, accent, text, background, light-bg), rutas de logos, fuentes.

### Generated outputs (`assets/docs/` y `assets/images/`)

| Archivo | Descripción |
|---------|-------------|
| `assets/docs/test-deck.pdf` | 23 slides (HTML engine) |
| `assets/docs/test-deck-svg-from-md.pdf` | 4 slides (SVG engine) |
| `assets/docs/test-report.pdf` | 11 secciones |
| `assets/images/test-deck.png` | 2000×1125 PNG |
| `assets/images/test-deck.svg` | SVG companion |
| `assets/images/logo.svg` | Logo por defecto |
| `assets/images/logo-white.svg` | Logo blanco por defecto |

---

## Document Pipeline (docgen)

Sistema completo de generación de documentos desde `shared/scripts/docgen/`.  
Portado de gda-ai (Python → Node.js ESM) sin dependencias externas.

### Arquitectura

```
                    ┌─────────────┐
                    │  brand.json  │
                    └──────┬──────┘
                           │ brand colors
                    ┌──────▼──────┐     ┌──────────────┐
spec.json/md ──────►│  index.js   │────►│  charts.js    │
                    │  (core)     │     │  (13 chart    │
                    └───┬──┬──┬───┘     │   types)      │
                        │  │  │         └──────────────┘
               ┌────────┘  │  └────────────┐
               ▼           ▼               ▼
        ┌──────────┐ ┌──────────┐ ┌──────────────┐
        │html-theme│ │report-   │ │SVG rendering │
        │.js       │ │theme.js  │ │(rsvg-convert │
        │(slides)  │ │(reports) │ │ /browser)    │
        └────┬─────┘ └────┬─────┘ └──────┬───────┘
             │            │              │
             ▼            ▼              ▼
     ┌───────────┐ ┌───────────┐ ┌────────────┐
     │build-deck │ │build-rep  │ │build-image │
     │.js (PDF)  │ │ort.js     │ │.js (PNG/   │
     │           │ │(PDF)      │ │ SVG)       │
     └───────────┘ └───────────┘ └────────────┘
     ┌───────────┐ ┌───────────┐
     │build-web  │ │build-pptx │
     │.js (HTML) │ │.js (shell │
     │           │ │ to python)│
     └───────────┘ └───────────┘
```

### Uso

```bash
# Deck PDF (motor HTML)
node shared/scripts/docgen/build-deck.js assets/decks/deck.json
npm run docgen:deck assets/decks/deck.json

# Deck PDF (motor SVG desde Markdown)
node shared/scripts/docgen/build-deck.js assets/decks/deck.md

# Reporte ejecutivo PDF
node shared/scripts/docgen/build-report.js assets/decks/report.json
npm run docgen:report assets/decks/report.json

# Imagen standalone (PNG o SVG)
node shared/scripts/docgen/build-image.js assets/decks/slide.json --format png
npm run docgen:image assets/decks/slide.json -- --format png

# Presentación web HTML (navegación por teclado/touch)
node shared/scripts/docgen/build-web.js assets/decks/deck.json
npm run docgen:web assets/decks/deck.json

# PowerPoint (requiere python-pptx)
node shared/scripts/docgen/build-pptx.js assets/decks/deck.json
npm run docgen:pptx assets/decks/deck.json
```

Los artefactos se generan en `assets/docs/` (PDF/HTML) y `assets/images/` (PNG/SVG).  
Usar `--output <path>` para sobrescribir la ruta de salida.

### npm scripts

```bash
npm run docgen:deck     assets/decks/deck.json
npm run docgen:report   assets/decks/report.json
npm run docgen:image    assets/decks/slide.json -- --format png
npm run docgen:web      assets/decks/deck.json
npm run docgen:pptx     assets/decks/deck.json
npm run docgen:validate
npm run docgen:validate -- --quick
```

### Validación CI

```bash
# Validación completa: sintaxis + templates + smoke tests
node shared/scripts/docgen/validate.js

# Solo sintaxis y templates (rápido)
node shared/scripts/docgen/validate.js --quick
```

### Requisitos

- **Node.js 18+** (obligatorio)
- **Opcional**: `rsvg-convert` (librsvg) para PDF basado en SVG
- **Opcional**: ImageMagick para PNG fallback
- **Opcional**: Chromium para PDF vía browser
- **Opcional**: Python 3.6+ con `python-pptx` para PowerPoint

Browser detection: `DOCGEN_BROWSER` env var > rutas comunes > nombres binarios Linux.  
Chrome detectado automáticamente en `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.

---

## Brand identity

La identidad visual se centraliza en `shared/brand.json`:

```json
{
  "name": "Mi Empresa",
  "primary": "#1a365d",
  "secondary": "#2b6cb0",
  "accent": "#ed8936",
  "text": "#1a202c",
  "background": "#ffffff",
  "lightBg": "#f7fafc"
}
```

Usar `arai generate brand` para configurar desde CLI:

```bash
# Configurar colores
arai generate brand --name "Mi Empresa" --primary "#1a365d" --secondary "#2b6cb0"

# Configurar logos
arai generate brand --logo path/to/logo.svg --logo-white path/to/logo-white.svg
```

Los colores se inyectan en runtime en las variables CSS `:root` de los temas HTML.  
El pipeline docgen consume `shared/brand.json` automáticamente.

---

## CI validation

### Validación de estructura del proyecto

```bash
node shared/scripts/ci-validate.js                  # validación básica
node shared/scripts/ci-validate.js --strict         # warnings fallan también
node shared/scripts/ci-validate.js --verbose        # muestra todos los checks
```

### Validación del pipeline docgen

```bash
node shared/scripts/docgen/validate.js              # sintaxis + templates + smoke tests
node shared/scripts/docgen/validate.js --quick      # solo sintaxis + templates
```

---

## Reference repos

Los repositorios de referencia se clonan bajo `repos/` (gitignored). Sirven como fuente de patrones, scripts, ejemplos y configuraciones — nunca modificarlos directamente.

### Configuración

Añadir entrada en `repos.json` (raíz del proyecto):

```json
{
  "name": "owner/repo",
  "url": "https://github.com/owner/repo.git",
  "description": "Para qué sirve este repo"
}
```

### Sincronización

```bash
# Sincronizar todos
node shared/scripts/repos-sync.js

# Sincronizar uno específico
node shared/scripts/repos-sync.js anthropics/skills

# Listar estado
node shared/scripts/repos-sync.js --list
```

### Repositorios configurados

| Repo | Descripción |
|------|-------------|
| `anthropics/skills` | Skills de Anthropic |
| `VoltAgent/awesome-claude-code-subagents` | Subagentes para Claude Code |
| `Gentleman-Programming/gentle-ai` | Configuración AI alternativa |
| `GrupoConex/gda-ai` | Fuente original del docgen pipeline (Python) |

### Cómo referenciar

```javascript
// Adaptado de repos/anthropics/skills/skills/mcp-builder/SKILL.md
```

---

## Cross-platform

Todo el código, scripts, configuraciones y herramientas en este repositorio **deben funcionar en macOS y Windows**.

- Scripts Node.js usan `path` nativo, `fileURLToPath` y `execSync` cross-platform
- Shell commands se evitan a menos que estén envueltos en scripts cross-platform
- `repos-sync.js` usa `fs` y `child_process` nativo, sin dependencias de shell Unix
- `deploy.sh` es placeholder — reemplazar con Node.js para Windows compat

---

## Requisitos

- Node.js 18+
- npm 9+
- opencode, Claude Code, Cursor o Codex (según el agente a usar)
- Opcional: `rsvg-convert`, ImageMagick, Chromium, python-pptx

---

## Licencia

MIT
