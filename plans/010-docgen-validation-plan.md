# Plan: Validación completa del pipeline docgen

## Objetivo
Asegurar que el pipeline de generación de documentos funciona correctamente tanto en aramirez-ai (arness generator) como en harnesses generados por `arai init --template full`.

## Fases

### Fase 1: Validación cross-harness
**Nuevo archivo:** `tests/integration/docgen-cross-harness.test.js`

Verifica que un harness generado tiene todo lo necesario para docgen:
1. `arai init --template full` → proyecto destino
2. Verificar `assets/templates/deck.css` existe
3. Verificar `assets/templates/report.css` existe
4. Verificar `assets/templates/specs/` tiene 29 specs
5. Verificar `shared/scripts/docgen/` tiene todos los scripts (12 archivos)
6. Verificar `shared/brand.json` existe
7. Verificar `assets/images/logo.svg` existe
8. Verificar `assets/images/logo-white.svg` existe
9. Verificar que los scripts importan sin errores
10. Verificar que `deck.css` tiene contenido CSS válido
11. Verificar que `report.css` tiene contenido CSS válido
12. Verificar que `brand.json` tiene brand.name
13. Verificar que `brand.json` tiene brand.colors.primary
14. Verificar que `brand.json` tiene brand.logo path
15. Verificar que opencode.json tiene agentes definidos

### Fase 2: Brand integration tests
**Nuevo archivo:** `tests/commands/docgen-brand.test.js`

Verifica que la integración de brand funciona:
1. `brandCss('deck')` genera CSS con `:root` y variables de color
2. `brandCss('report')` genera CSS con `:root` y variables de color
3. `logoHref('blue')` produce data URI (no string vacío)
4. `logoHref('white')` produce data URI
5. HTML generado contiene brand colors en CSS custom properties
6. Footer text usa `brand.footer` template con `{{organization}}`
7. Cover page muestra logo (data URI en img src)
8. Brand colors coinciden con brand.json

### Fase 3: Output quality tests
**Nuevo archivo:** `tests/commands/docgen-output-quality.test.js`

Verifica calidad del output generado:
1. test-deck.json → HTML tiene `<style>` con CSS de brand
2. test-deck.json → Cada slide tiene la clase CSS correcta
3. test-deck.json → SVG charts tienen xmlns correcto
4. test-deck.json → Logo aparece en slides (data URI no vacío)
5. test-deck.json → Page numbers aparecen cuando `mostrar_paginas=true`
6. test-deck.json → Cover slide tiene titulo y subtitulo
7. test-report.json → Cover tiene organization, title, date
8. test-report.json → Tables tienen `<th>` y `<td>`
9. test-report.json → Bullets tienen `<li>`
10. test-report.json → Recommendation tiene problema/recomendacion/acciones
11. test-report.json → Roadmap tiene fases con periodo/foco/entregables
12. test-report.json → KPI table tiene dominio/metrica/meta

### Fase 4: PDF smoke test
**Nuevo archivo:** `tests/commands/docgen-pdf.test.js`

Genera PDFs reales y verifica:
1. `build-deck.js` con test-deck.json → genera PDF
2. PDF tiene tamaño > 10KB
3. PDF empieza con header `%PDF`
4. `build-report.js` con test-report.json → genera PDF
5. PDF tiene tamaño > 10KB
6. PDF empieza con header `%PDF`
7. `build-web.js` con test-deck.json → genera HTML standalone
8. HTML tiene tamaño > 5KB
9. **OUTPUTS SE GUARDAN EN `/tmp/docgen-test-outputs/` PARA REVISIÓN DEL USUARIO**

### Fase 5: Spec template validation
**Nuevo archivo:** `tests/commands/docgen-specs.test.js`

Valida todos los 29 spec templates:
1. Cada spec tiene `output` path
2. Cada spec tiene `slides[]`
3. Cada slide tiene `type` válido
4. Deck specs usan tipos de deck válidos
5. Report specs usan tipos de report válidos
6. Cada spec puede buildearse a HTML sin error
7. Deck specs buildean con `html-theme.js`
8. Report specs buildean con `report-theme.js`

## Output para revisión del usuario

Los PDFs y HTML generados en Fase 4 se guardan en:
```
/tmp/docgen-test-outputs/
├── test-deck.pdf        (deck PDF)
├── test-report.pdf      (report PDF)
├── test-deck.html       (deck HTML standalone)
└── test-report.html     (report HTML)
```

El usuario puede abrir estos archivos para verificar visualmente que:
- Los logos se ven correctamente
- Los colores de brand coinciden
- Los charts SVG se renderizan bien
- Los layouts de slides son correctos
- El contenido es legible

## Archivos a crear

| Archivo | Tests | Descripción |
|---|---|---|
| `tests/integration/docgen-cross-harness.test.js` | ~15 | Cross-harness validation |
| `tests/commands/docgen-brand.test.js` | ~8 | Brand integration |
| `tests/commands/docgen-output-quality.test.js` | ~12 | Output quality |
| `tests/commands/docgen-pdf.test.js` | ~9 | PDF generation + output for review |
| `tests/commands/docgen-specs.test.js` | ~8 | Spec template validation |

## Estimación
- Tests nuevos: ~52
- Total post-ejecución: ~867 tests
