# Plan: Skill de exportación a PDF desde vault Obsidian

## Objetivo

Crear un skill que tome contenido de un vault especificado por un usuario, pregunte al usuario el alcance y genere un PDF profesional usando la infraestructura de generación de documentos existente.

## Requisitos del usuario

- ✅ Usar el pipeline `document-generation` existente (NO Pandoc)
- ✅ Formato PDF solamente (sin DOCX)
- ✅ Excluir `Transcripciones/` del contenido
- ✅ Salida en `generated/<timestamp>/` (sin sobrescribir)
- ✅ `generated/` agregado a `.gitignore`
- ❌ ~~Pandoc~~ — usar `build-report.js` / `htmlToPdf`
- ❌ ~~DOCX~~ — solo PDF
- ❌ ~~No incluir transcripciones~~

## Arquitectura

```
curso-ia/*.md  ──→  docgen-vault.js  ──→  generated/<VAULT-NAME>-20260705-143000/
                                                ├── lesson-03.pdf
                                                ├── module-05.pdf
                                                └── curso-completo.pdf
```

El script `shared/scripts/docgen-vault.js` hace todo el trabajo:

```
1. Lee .md del vault (según scope)
2. Excluye Transcripciones/
3. Convierte .md → HTML (headers, bold, code, listas, tablas)
4. Ensambla HTML completo con:
   ├── brandCss() del report-theme
   ├── Portada tipo doc-cover
   ├── Cabezales/pies de página del reporte
   └── Contenido del curso en HTML
5. htmlToPdf(html, output) → PDF vía Chromium headless
```

### ¿Por qué no usar `build-report.js` directamente?

El report builder existente usa `_renderText` que escapa HTML (`esc()`), perdiendo formato (código, negritas, listas). En lugar de modificar el theme, generamos HTML directamente usando los mismos componentes de branding (`brandCss`, `logoHref`, `_pageHeader`, `_pageFooter`) y llamamos a `htmlToPdf` que ya existe en `index.js`.

## Skill: `vault-pdf-export`

### SKILL.md

```yaml
---
name: vault-pdf-export
description: Exporta contenido del vault Obsidian curso-ia a PDF profesional
license: MIT
---
```

Workflow documentado en el skill:

1. Preguntar alcance: lesson, module, all
2. Preguntar modo: merged (único), separate (uno por lección)
3. Ejecutar script
4. Los PDFs quedan en `generated/<VAULT-NAME>-<timestamp>/`

## Script: `shared/scripts/docgen-vault.js`

### Uso

```bash
# Una lección
node shared/scripts/docgen-vault.js --scope lesson --module "Módulo 5" --lesson "03"

# Módulo completo (documento único)
node shared/scripts/docgen-vault.js --scope module --module "Módulo 5" --mode merged

# Módulo completo (un PDF por lección)
node shared/scripts/docgen-vault.js --scope module --module "Módulo 5" --mode separate

# Todo el vault
node shared/scripts/docgen-vault.js --scope all --mode separate
```

### Flags

| Flag | Descripción | Default |
|------|-------------|---------|
| `--scope <lesson\|module\|all>` | Alcance | `module` |
| `--module <name>` | Módulo (para lesson o module) | — |
| `--lesson <num>` | N° lección (para lesson) | — |
| `--mode <merged\|separate>` | Documento único o separados | `merged` |
| `--output <dir>` | Directorio base de salida | `generated` |
| `--vault <path>` | Ruta al vault | `curso-ia/` |

### Funcionamiento interno

```javascript
import { htmlToPdf, brand, loadBrand } from './docgen/index.js';
import { brandCss, logoHref } from './docgen/theme-utils.js';

// 1. Resolver timestamp y directorio de salida
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outDir = join('generated', timestamp);

// 2. Colectar archivos .md según scope
//    - Excluye Transcripciones/, .obsidian/, Recursos/
//    - Ordena por módulo y número de lección

// 3. Convertir markdown a HTML
//    - ## → <h2>, ### → <h3>
//    - **texto** → <strong>texto</strong>
//    - `código` → <code>código</code>
//    - ``` ``` → <pre><code>
//    - Listas - → <ul><li>
//    - Párrafos separados por \n\n
//    - Líneas --- → <hr>

// 4. Ensamblar página HTML completa
const html = `<!DOCTYPE html>
<html><head>
  <style>${brandCss('report')} /* + report.css */</style>
</head><body>
  ${pageHeader(meta)}
  <section class="page cover-page">
    <div class="page-body">
      <h1>${titulo}</h1>
      ...
    </div>
  </section>
  <section class="page">
    <div class="page-body body-text">
      ${contenidoHTML}
    </div>
  </section>
  ${pageFooter(meta)}
</body></html>`;

// 5. Generar PDF
htmlToPdf(html, join(outDir, filename));
```

## Archivos a modificar/crear

| Archivo | Acción |
|---------|--------|
| `shared/skills/vault-pdf-export/SKILL.md` | **Crear** — definición del skill |
| `shared/scripts/docgen-vault.js` | **Crear** — script de generación (~200-300 líneas) |
| `generated/` | **Crear** — directorio de salida (vacío, con .gitkeep) |
| `.gitignore` | **Modificar** — agregar `generated/` |
| `shared/templates/partials/AGENTS.md` | **Actualizar** — agregar skill a tabla |
| `AGENTS.md` | **Actualizar** — agregar skill a tabla |

## Verificación

```bash
# 1. Skill aparece
node bin/arai.js list skills | grep vault-pdf

# 2. Exportar lección
node shared/scripts/docgen-vault.js --scope lesson --module "Módulo 5" --lesson "03"
ls -la generated/*/

# 3. Exportar módulo separado
node shared/scripts/docgen-vault.js --scope module --module "Módulo 5" --mode separate

# 4. Exportar vault completo
node shared/scripts/docgen-vault.js --scope all --mode merged

# 5. Tests pasan
npm test

# 6. generated/ no está en git
git status generated/
```
