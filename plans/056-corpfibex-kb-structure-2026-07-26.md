# Plan: corpfibex-kb — Base de Conocimiento Corporativo

## Objective
Create a structured knowledge base for Corporación Fibex Telecom covering corporate governance, strategic plans, and organizational structure.

## Requirements
1. Directory structure under `../corpfibex-kb` — priority: high
2. Extract and organize content from `references/01 - Gobierno Corporativo de Tecnología/` — priority: high
3. Handle duplicate files (keep most recent versions) — priority: high
4. Create proper Obsidian-compatible markdown with wikilinks — priority: medium
5. Generate README.md index — priority: medium

## Architecture

### Source Files Analysis

| Source | Content | Notes |
|--------|---------|-------|
| `Gobierno Corporativo/Manual de Gobierno Corporativo - ...Versión Abril 2026.pdf` | Manual completo GC | **Keep** (latest version) |
| `Gobierno Corporativo/Manual de Gobierno Corporativo - ...pdf` | Manual GC original | **Skip** (duplicate, older) |
| `Gobierno Corporativo/Cronograma Gobierno Corporativo Holding Fibex.pdf` | Cronograma semanal comités | Keep |
| `Gobierno Corporativo/Tomo II Estratégia Operativa Fibex Telecom 2026.pdf` | Plan Maestro ejecutivo | Keep |
| `Comité de Dirección/25-03-2026/...pdf` | Reunión CD Marzo 2026 | Keep |
| `Comité de Dirección/22-05-2026/...pdf` | Taller CD Plan Maestro | Keep |
| `Comité ejecutivo de estabilización/*.pptx` | Presentaciones CE | Skip (PPTX not extractable) |
| `Objetivos estratégicos/Plan Estratégico 2026.pdf` | Plan estratégico completo | Keep |
| `Objetivos estratégicos/PMO FIBEX 253261.pdf` | Seguimiento PMO | Keep |
| `Objetivos estratégicos/INSTRUCTIVO DE LLENADO.pdf` | Instructivo PMO | Keep |
| `Objetivos estratégicos/*.docx` | Instrucciones, clasificación | Extract if possible |
| `COMITÉ DE DESARROLLO Y APLICACIONES.docx` | Comité D&A | Extract if possible |
| `Mensaje de Julián Sierra.docx` | Mensaje presidencia | Extract if possible |

### Target Structure

```
corpfibex-kb/
├── README.md
├── 01-Gobierno-Corporativo/
│   ├── manual-gobierno-corporativo.md      # Manual completo (Abril 2026)
│   ├── cronograma-comites.md               # Cronograma semanal
│   ├── principios-gobierno.md              # Principios y valores
│   └── estructura-gobierno.md              # Estructura de comités
├── 02-Estrategia/
│   ├── tomo-ii-estrategia-operativa.md     # Plan Maestro 2026
│   ├── plan-estrategico-2026.md            # Plan estratégico completo
│   ├── objetivos-estrategicos.md           # 11 objetivos de primer nivel
│   └── pmo-fibex.md                       # Seguimiento PMO
├── 03-Comites/
│   ├── comite-direccion.md                 # Comité de Dirección
│   ├── comite-ejecutivo-estabilizacion.md  # CE Estabilización
│   ├── comite-desarrollo-aplicaciones.md   # Comité D&A
│   └── comites-estrategicos.md            # Resumen comités estratégicos
├── 04-Documentos/
│   ├── mensaje-julian-sierra.md            # Mensaje presidencia
│   └── instructivo-pmo.md                 # Instructivo llenado PMO
└── 05- Diagramas/                         # Si hay imágenes
```

### Content Organization

**01-Gobierno Corporativo:**
- `manual-gobierno-corporativo.md`: Secciones 1-6 del manual (Introducción, Aspectos Generales, Órganos Estatuarios, Comités, Políticas, Procedimientos)
- `principios-gobierno.md`: Los 5 principios (Integridad, Transparencia, Responsabilidad, Equidad, Sostenibilidad)
- `estructura-gobierno.md`: Diagrama de comités (Estratégicos, Gobierno, Funcionales)
- `cronograma-comites.md`: Tabla del cronograma semanal

**02-Estrategia:**
- `tomo-ii-estrategia-operativa.md`: Plan Maestro ejecutivo (diagnóstico, objetivos, líneas de acción)
- `plan-estrategico-2026.md`: Plan estratégico completo
- `objetivos-estrategicos.md`: Los 11 objetivos de primer nivel con métricas
- `pmo-fibex.md`: Estructura PMO, hitos, entregables, sinergias

**03-Comites:**
- Información de cada comité: función, miembros, frecuencia, responsabilidades

## Decisions
1. **Skip duplicate Manual GC** — keep only Abril 2026 version
2. **Skip PPTX files** — cannot extract text reliably
3. **Use PyPDF2 fallback** — for PDFs that fail with pdftotext
4. **DOCX extraction** — use python-docx if available, otherwise skip
5. **Preserve original structure** — organize by topic, not by source folder

## File Changes

### New Files
- `../corpfibex-kb/README.md`
- `../corpfibex-kb/01-Gobierno-Corporativo/*.md` (4 files)
- `../corpfibex-kb/02-Estrategia/*.md` (4 files)
- `../corpfibex-kb/03-Comites/*.md` (4 files)
- `../corpfibex-kb/04-Documentos/*.md` (2 files)

### Modified Files
- None (new KB, no existing files)

## TDD Flow
1. Create directory structure → Verify directories exist
2. Extract PDFs → Verify content extracted
3. Create markdown files → Verify file count and content
4. Generate README → Verify links work

## Verification
- [ ] Directory structure created correctly
- [ ] All extractable PDFs processed
- [ ] Markdown files contain actual content (not placeholders)
- [ ] README.md has correct wikilinks
- [ ] No duplicate content between files
- [ ] Git init and initial commit completed

## Estimated Effort
- Directory setup: 5 min
- PDF extraction: 15 min
- Content organization: 30 min
- README generation: 5 min
- **Total: ~55 min**
