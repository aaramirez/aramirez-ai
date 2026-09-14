# Plan 055: Expand gda-kb with Architecture Documents

## Objective

Ingest architecture documents from `references/Arquitectura/` into gda-kb, creating structured markdown notes with proper frontmatter and wikilinks.

## Context

gda-kb currently has architecture content scattered across `Estructura/`, `Procesos/`. The new documents in `references/Arquitectura/` contain:
- 8+ PDFs (architecture guides, vision documents)
- 10+ DOCX files (architecture specs, value chain docs)
- 7 PowerPoint presentations (digital ecosystem, roadmaps)
- 9 diagram PNGs (architecture diagrams, API governance)

## Architecture

### Source Files to Process

| Category | Files | Target Section |
|----------|-------|----------------|
| Architecture Guides | Arquitectura de Fibex Telecom.pdf, Arquitectura general v2.pdf | `Arquitectura/01-Guías/` |
| Vision & Strategy | Visión Corporativa.pdf, Qué estamos construyendo.pdf | `Arquitectura/02-Estrategia/` |
| Value Chain | Cadena de Valor Telco/*.pdf | `Arquitectura/03-Cadena-Valor/` |
| Diagrams | Diagramas/*.png | `Arquitectura/04-Diagramas/` |
| Presentations | Presentaciones/*.pptx | `Arquitectura/05-Presentaciones/` |

### Processing Pipeline

1. **Extract text** from PDFs using `pdf-extraction` skill
2. **Convert DOCX** to markdown (using pandoc or similar)
3. **Create notes** with frontmatter following gda-kb conventions
4. **Copy diagrams** as image assets
5. **Link together** with wikilinks

## Requirements

1. Create `Arquitectura/` section in gda-kb — priority: high
2. Extract text from PDFs and create markdown notes — priority: high
3. Convert DOCX files to markdown — priority: high
4. Copy diagrams to gda-kb — priority: medium
5. Add frontmatter with proper tags — priority: high
6. Create Index.md for Arquitectura section — priority: high
7. Cross-reference with existing Procesos/ notes — priority: medium

## File Changes

### Files to Create in gda-kb

```
gda-kb/Arquitectura/
├── README.md                          # Section overview
├── 01-Guías/
│   ├── arquitectura-de-fibex-telecom.md
│   ├── arquitectura-general-v2.md
│   └── arquitectura-de-oficina-movil.md
├── 02-Estrategia/
│   ├── vision-corporativa.md
│   ├── que-estamos-construyendo.md
│   └── vision-corporativa-y-eficiencia.md
├── 03-Cadena-Valor/
│   ├── cadena-de-valor-telco.md
│   ├── arquitectura-operativa-telco.md
│   └── estrategia-cobranza.md
├── 04-Diagramas/
│   ├── gobierno-de-apis.md
│   ├── arquitectura-operativa.md
│   └── ... (other diagrams)
└── 05-Presentaciones/
    ├── ecosistema-digital-fibex.md
    ├── fibex-digital-blueprint.md
    └── ... (other presentations)
```

### Files to Modify

- `gda-kb/Index.md` — Add Arquitectura section
- `gda-kb/Procesos/` — Cross-reference with new notes

## TDD Flow

This is a content ingestion task, not code. Verification is manual:
1. Run kb-sync.js --validate to check structure
2. Verify frontmatter in all new notes
3. Verify wikilinks are valid

## Verification

- [ ] All PDFs extracted to markdown with frontmatter
- [ ] All DOCX converted to markdown
- [ ] Diagrams copied to gda-kb
- [ ] Index.md created for Arquitectura section
- [ ] kb-sync.js --validate passes
- [ ] Wikilinks between notes work
