---
tags:
  - documentacion
  - pipeline
  - docgen
created: 2026-07-05
---

# Arquitectura del pipeline docgen

## Visión general

```
spec.json/md → index.js (core) → charts.js (13 SVG chart types)
                               → html-theme.js (20+ slide layouts)
                               → report-theme.js (10 report layouts)
                               → SVG rendering (rsvg-convert / browser)
Builders: build-deck.js, build-report.js, build-image.js, build-web.js, build-pptx.js
```

## Builders

| Builder | Salida | Uso |
|---------|--------|-----|
| `build-deck.js` | PDF/HTML | Presentaciones de diapositivas |
| `build-report.js` | PDF/HTML | Documentos formales |
| `build-image.js` | PNG/SVG | Imágenes individuales |
| `build-web.js` | HTML | Presentaciones web interactivas |
| `build-pptx.js` | PPTX | PowerPoint (requiere Python) |

## npm scripts

```bash
npm run docgen:deck   assets/decks/deck.json
npm run docgen:report assets/decks/report.json
npm run docgen:image  assets/decks/slide.json -- --format png
npm run docgen:web    assets/decks/deck.json
npm run docgen:pptx   assets/decks/deck.json
npm run docgen:validate
```

## Output

Los artefactos se generan en `assets/docs/` y `assets/images/` por defecto. Se puede sobreescribir con `--output <path>`.

## 28 plantillas disponibles

```bash
npm run docgen:templates
```

Categorías:
- **Comunicación periódica**: weekly, sprint, planning, status, release
- **Documentación técnica**: tech-design, ADR, API, architecture, runbook
- **Gestión**: SOW, charter, decision-log
- **Calidad**: postmortem, test-report
- **Métricas**: dashboard, profile, team, minutes

---

**Siguiente**: [[09-Documentacion/05-todas-las-plantillas.md|Todas las plantillas]]
