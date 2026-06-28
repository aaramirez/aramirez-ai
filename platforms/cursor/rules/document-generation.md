# document-generation

Generate branded PDF presentations, PowerPoint decks, HTML web presentations, reports, and images using content builders.


# Document generation

Generate branded content using builders in `shared/scripts/`. This pipeline uses source files (JSON, YAML, Markdown, Python) that define the content, which builders render into the final format.

## Pipeline

```
assets/decks/<name>.{json,md,py}  →  shared/scripts/build-*.py  →  assets/docs/<name>.pdf
                                                                  →  assets/images/<name>.png
```

## Available builders

| Command | Output | Purpose |
|---|---|---|
| `build-deck.py` | PDF (16:9) | Presentations via HTML+CSS or SVG engines |
| `build-image.py` | PNG / SVG | Standalone images, diagrams, profiles |
| `build-report.py` | PDF Letter | Structured executive reports |
| `build-pptx.py` | PPTX | Editable PowerPoint presentations |
| `build-web.py` | HTML | Self-contained navigable web presentation |
| `validate.py` | — | CI integrity checks (syntax, placeholders, builds) |

## Input formats

JSON, YAML (`.yaml`/`.yml`), Markdown (`.md`), Python (`.py`).

## Slide types

`portada`, `seccion`, `bullets`, `dos-columnas`, `n-columnas`, `tarjetas`, `kpis`, `personas`, `cita`, `imagen`, `tabla`, `lamina-completa`, `grafico`, `imagen-texto`, `destacado`, `comparativa`, `timeline`, `proceso`/`workflow`, `masonry`, `faq`.

## Chart types

`barras`, `barras-agrupadas`, `barras-apiladas`, `donut`, `pastel`, `lineas`, `progreso`, `gauge`, `gantt`, `radar`, `waterfall`, `heatmap`.

## Quick reference

```bash
python3 shared/scripts/build-deck.py  assets/decks/mi-deck.json    # PDF
python3 shared/scripts/build-image.py assets/decks/mi-imagen.py     # PNG/SVG
python3 shared/scripts/build-pptx.py  assets/decks/mi-deck.json    # PPTX
python3 shared/scripts/build-web.py   assets/decks/mi-deck.json    # HTML
python3 shared/scripts/build-report.py assets/decks/mi-reporte.json # PDF Letter
```

## Requirements

- Python 3.6+
- `python-pptx` for PPTX builds (`pip install python-pptx`)
- `PyYAML` for YAML input (`pip install pyyaml`)
- Chromium browser recommended for PDF engine `html`; falls back to `--engine svg` with `rsvg-convert` + `imagemagick`

## Reference

The document generation builders are adapted from the gda-ai project (`repos/GrupoConex/gda-ai/shared/scripts/`). The core library `deck_lib.py` provides SVG generation, browser detection, HTML→PDF conversion, and chart rendering.

