# aramirez-ai

Gestor centralizado de configuración multi-agente + generación de documentos técnicos.

Tres sistemas en un solo repositorio:

| Sistema | Descripción |
|---------|-------------|
| **AI Agent Config** | Configuración multi-agente para opencode |
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

```bash
git clone git@github.com:aaramirez/aramirez-ai.git ~/.config/aramirez
cd ~/.config/aramirez
npm install
npm link

# Uso básico en un proyecto
cd mi-proyecto
arai install               # instala opencode en el proyecto actual
# → Crea .opencode/agents, .opencode/skills, opencode.json
```

### Verificar instalación

```bash
arai status
```

Muestra el estado de opencode en el directorio actual.

---

## CLI: `arai`

### Referencia completa de comandos

| Comando | Descripción |
|---------|-------------|
| `arai install` | Instala plataforma opencode en el proyecto |
| `arai install <type> <name>` | Instala componente: skill, agent, script, prompt, rule |
| `arai uninstall` | Elimina plataforma opencode del proyecto |
| `arai uninstall <type> <name>` | Elimina componente específico |
| `arai status` | Estado de opencode en el directorio actual |
| `arai update` | `git pull` + `npm install` en el repo |
| `arai sync [type] [name]` | Sincroniza proyecto o componente (`skill <name>` para sincronizar una skill) |
| `arai generate kb [dir]` | Crea vault Obsidian (kb/) |
| `arai init <dir>` | Scaffolding de nuevo proyecto |
| `arai list skills\|agents\|scripts\|templates\|commands\|mcp` | Lista recursos |
| `arai generate skill <name>` | Crea nueva skill |
| `arai generate agent <name>` | Crea nuevo agente |
| `arai generate script <name>` | Crea nuevo script |
| `arai generate command <name>` | Crea nuevo comando opencode |
| `arai generate brand` | Configura identidad visual |

---

### Detalle de comandos

#### `arai install`

Instala la plataforma opencode en el proyecto. Siempre copia archivos (no usa env vars).

| Opción | Descripción |
|--------|-------------|
| `--project <dir>` | Directorio del proyecto (default: `.`) |

```bash
arai install                    # instala en el directorio actual
arai install --project ./app    # instala en ./app
```

#### `arai install <type> <name>`

Instala un componente específico. Tipos válidos: `skill`, `agent`, `script`, `prompt`, `rule`.

| Opción | Descripción |
|--------|-------------|
| `--project <dir>` | Directorio del proyecto (default: `.`) |

```bash
arai install skill git          # instala skill git
arai install agent reviewer     # instala agente reviewer
arai install script ci-validate # instala script
arai install prompt commit-message  # instala prompt
arai install rule code-style    # instala regla de estilo
```

#### `arai uninstall`

Elimina la plataforma opencode del proyecto.

| Opción | Descripción |
|--------|-------------|
| `--project <dir>` | Directorio del proyecto (default: `.`) |

```bash
arai uninstall                    # elimina del directorio actual
arai uninstall --project ./app    # elimina de ./app
```

#### `arai uninstall <type> <name>`

Elimina un componente específico. Tipos válidos: `skill`, `agent`, `script`, `prompt`, `rule`.

```bash
arai uninstall skill git
arai uninstall agent reviewer
```

#### `arai status`

Muestra el estado de opencode en el directorio actual.

```
$ arai status
  opencode     ✓ installed
  agents       3 installed (reviewer, tester, docs)
  skills       1 installed (git)
```

#### `arai update`

Ejecuta `git pull` + `npm install` en el repositorio y re-aplica configuraciones.

```bash
arai update
```

#### `arai sync [type] [name]`

Re-aplica la configuración de opencode en el proyecto actual. Útil después de `arai update`. Si se especifica un tipo y nombre, sincroniza solo ese componente.

```bash
arai sync                    # re-aplica plataforma
arai sync skill              # sincroniza todas las skills
arai sync skill pdf-extraction  # sincroniza una skill específica
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
| `full` | Todas las skills, scripts, opencode platform, branding, assets |

Las plantillas se definen en `shared/templates/<name>/template.json`.  
Plantillas personalizadas en `~/.config/arai/templates/`.

#### `arai sync [type] [name]`

Sincroniza la configuración del proyecto o un componente específico.

| Opción | Descripción |
|--------|-------------|
| `--project <dir>` | Directorio del proyecto (default: `.`) |

```bash
arai sync                                      # re-aplica config del proyecto
arai sync skill                                # sincroniza todas las skills
arai sync skill pdf-extraction                 # sincroniza solo una skill
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

  reviewer             mode: subagent   model: opencode/big-pickle
                       Code review specialist...

$ arai list mcp

  github               https://api.github.com/mcp
                       (disabled)
  playwright           npx -y @playwright/mcp
                       (disabled)
```

#### `arai generate kb [dir]`

Crea un vault Obsidian (`kb/`) en el directorio especificado.

| Opción | Descripción |
|--------|-------------|
| `--force` | Sobrescribe si existe |

```bash
arai generate kb                 # ./kb/
arai generate kb ~/my-vault
arai generate kb --force         # sobrescribe si existe
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

---

## Agentes disponibles

### Registrados en opencode.json

| Nombre | Modo | Descripción | Modelo | Permisos |
|--------|------|-------------|--------|----------|
| **build** | `primary` | Default build agent for coding tasks | `big-pickle` | — |
| **plan** | `primary` | Planning agent for architecture and design | `big-pickle` | `edit: deny` |
| **reviewer** | `subagent` | Code review specialist. Use for PR reviews and quality checks. | `big-pickle` | `edit: deny` |
| **tester** | `subagent` | Testing specialist. Use for writing and running tests. | `big-pickle` | `bash: allow` |
| **docs** | `subagent` | Documentation specialist. Use for README, docs, and changelogs. | `big-pickle` | `edit: allow`, `bash: deny` |

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
  "brand": {
    "name": "Mi Empresa",
    "colors": {
      "primary": "#1a365d",
      "secondary": "#2b6cb0",
      "accent": "#e53e3e",
      "text": "#1a202c",
      "background": "#ffffff",
      "light-bg": "#f7fafc"
    },
    "logo": "assets/images/logo.svg",
    "logo_white": "assets/images/logo-white.svg",
    "fonts": {
      "heading": "Inter, sans-serif",
      "body": "Inter, sans-serif"
    }
  }
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

## Test suite

El proyecto incluye **277 tests** con `node:test` (Node.js 22+ built-in, sin dependencias extra).

```bash
npm test              # ejecuta toda la suite
node --test           # alternativa directa
node --test tests/consistency/   # solo tests de consistencia
```

### Organización

| Directorio | Tests | Propósito |
|------------|-------|-----------|
| `tests/consistency/` | 46 | Estructura de skills, frontmatter YAML de agentes, calidad de contenido, consistencia plataforma→agentes |
| `tests/integration/` | 99 | Salida del pipeline docgen (HTML, SVG, reportes), validación de generación CLI, validación de init, ciclo de vida completo, validación asistida por IA (gated) |
| `tests/commands/` | 132 | Comandos CLI: init, install, uninstall, generate, list, status, sync, kb, command-templates |

### CI validation

```bash
# Validación de estructura del proyecto
node shared/scripts/ci-validate.js                  # validación básica
node shared/scripts/ci-validate.js --strict         # warnings fallan también
node shared/scripts/ci-validate.js --verbose        # muestra todos los checks

# Validación del pipeline docgen
node shared/scripts/docgen/validate.js              # sintaxis + templates + smoke tests
node shared/scripts/docgen/validate.js --quick      # solo sintaxis + templates
```

### Outcome validation (5 fases)

Fases 1–4 son deterministicas y corren en CI; Fase 5 requiere `TEST_AI=true` + API key.

| Fase | Tests | Estado |
|------|-------|--------|
| 1 — Calidad de contenido | 48 tests | 🟢 |
| 2 — Salida del pipeline docgen | 70 tests | 🟢 |
| 3 — Profundidad de generate/init | 26 tests | 🟢 |
| 4 — Seguridad de templates CLI | 9 tests | 🟢 |
| 5 — Validación asistida por IA | 3 suites (gated) | 🟢 |

Detalle completo en [`docs/outcome-validation-plan.md`](docs/outcome-validation-plan.md).

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
