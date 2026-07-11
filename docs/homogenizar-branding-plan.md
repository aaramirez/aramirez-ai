# Plan: Homogeneización de Branding en Documentos Generados

## Problema

Los documentos generados por docgen muestran **4 inconsistencias** visibles:

1. **Nombre de organización**: aparece como "aramirez-ai" (decks), "Nombre de la Organizacion" (reports), o string vacío
2. **Clasificación/confidencialidad**: valores mezclados — "Interno", "Uso interno", "Confidencial", "CONFIDENCIAL", "Ejecutivo", "Publico"
3. **Footer**: decks muestran "Contenido confidencial de aramirez-ai", reports muestran "Contenido confidencial de Nombre de la Organizacion"
4. **Cover page vacía**: si un spec no define `organization`, la portada del report muestra fila "Organización" vacía

---

## Hallazgos Clave

### Specs (29 archivos)

| Campo | Valores encontrados | Cantidad |
|-------|-------------------|----------|
| `organization` | "Nombre de la Organizacion" (con tilde) | 9 |
| `organization` | "Nombre de la Organizacion" (sin tilde) | 8 |
| `organization` | ausente en decks | 11 |
| `classification` | "Interno" | 8 |
| `classification` | "Uso interno" | 3 |
| `classification` | "Confidencial" | 1 |
| `classification` | "CONFIDENCIAL" | 1 |
| `classification` | "Ejecutivo" | 2 |
| `classification` | "Publico" | 1 |
| `classification` | ausente en decks | 13 |

### Rendering Engines (3 motores)

| Problema | html-theme.js | report-theme.js | index.js (SVG) |
|----------|---------------|-----------------|-----------------|
| Lee `meta.organization`? | **NO** — usa `brand.name` | **SÍ** — `meta.organization \|\| b.name` | **NO** — usa `brand.name` |
| Fallback si falta org | `'Contenido confidencial'` (sin org) | `b.name` (en footer), `''` (en cover) | `b.name` |
| Lee `meta.classification`? | N/A | **SÍ** — header + cover | N/A |

---

## Solución

### Fase 1: Homogeneizar `classification` en specs (16 archivos)

Normalizar a **una sola escala de clasificación**:

| Valor actual | Valor normalizado |
|-------------|-------------------|
| "Interno" | `"Interno"` |
| "Uso interno" | `"Interno"` |
| "Confidencial" | `"Confidencial"` |
| "CONFIDENCIAL" | `"Confidencial"` |
| "Ejecutivo" | `"Confidencial"` |
| "Publico" | `"Publico"` |

**Justificación**: "Ejecutivo" es contenido restringido → "Confidencial". "Uso interno" = "Interno". Casing normalizado a Capitalized.

**Archivos a modificar** (7 con cambios necesarios):

| Archivo | Cambio |
|---------|--------|
| `sprint-planning-report.json` | "Uso interno" → "Interno" |
| `sprint-review-report.json` | "Uso interno" → "Interno" |
| `weekly-status.json` | "Uso interno" → "Interno" |
| `api-specs-report.json` | "CONFIDENCIAL" → "Confidencial" |
| `sow.json` | "Confidencial" | Sin cambio |
| `project-charter.json` | "Ejecutivo" → "Confidencial" |
| `project-status-report.json` | "Ejecutivo" → "Confidencial" |

Los 9 restantes ya tienen `"Interno"` — sin cambio.

### Fase 2: Normalizar tilde en `organization` (8 archivos)

Todos los specs deben usar `"Nombre de la Organización"` (con tilde, consistente con español correcto).

**Archivos a modificar** (8 con tilde faltante):

- `tech-design-report.json`
- `weekly-status.json`
- `system-architecture-report.json`
- `sprint-review-report.json`
- `test-report.json`
- `sow.json`
- `sprint-planning-report.json`
- `api-specs-report.json` (verificar)

### Fase 3: Unificar motor de rendering — `meta.organization` como fuente única

**Objetivo**: Que todos los motores consulten `meta.organization` con fallback a `brand.name`.

#### 3a. `html-theme.js` — `resolveFooterText(s)`

```js
// ANTES (ignora meta.organization):
function resolveFooterText(s) {
  if (s?.footer) return s.footer;
  const b = brand();
  if (b.footer) return b.footer.replace('{{organization}}', b.name);
  return 'Contenido confidencial';
}

// DESPUÉS (recibe meta, usa meta.organization):
function resolveFooterText(s, meta) {
  if (s?.footer) return s.footer;
  const b = brand();
  const template = b.footer || 'Contenido confidencial de {{organization}}';
  const org = (meta && meta.organization) || b.name;
  return template.replace(/\{\{organization\}\}/g, org);
}
```

**Impacto**: Todas las llamadas a `resolveFooterText(s)` en las 21 funciones de layout deben pasar `meta` como segundo argumento. El parámetro `meta` ya está disponible en la mayoría de funciones de layout.

#### 3b. `report-theme.js` — `_pageFooter(meta)` ya es correcto

Sin cambios necesarios. Ya usa `meta.organization || b.name`.

#### 3c. `report-theme.js` — `_renderCover(meta)` — Cover con fallback

```js
// ANTES (muestra vacío si falta org):
const org = esc(meta.organization || '');

// DESPUÉS (usa brand como fallback):
const org = esc(meta.organization || b.name);
```

Igual para `classification`:
```js
const classification = esc(meta.classification || 'Interno');
```

#### 3d. `index.js` — SVG `profileCard()` ya es correcto

Sin cambios necesarios. Ya usa `slide.organizacion || b.name`.

### Fase 4: Agregar `classification` default en brand.json

Para que decks que no definen `classification` muestren un valor por defecto:

```json
{
  "brand": {
    "name": "aramirez-ai",
    "footer": "Contenido confidencial de {{organization}}",
    "classification": "Interno",
    ...
  }
}
```

Y usar `brand().classification` como fallback en `_pageHeader()` y `_renderCover()`.

### Fase 5: Agregar `meta` a specs de decks (11 archivos)

Los decks actualmente no tienen bloque `meta`. Agregar meta mínimo para que muestren organización y clasificación consistentes:

```json
{
  "meta": {
    "title": "...",
    "organization": "Nombre de la Organización",
    "classification": "Interno"
  },
  "slides": [...]
}
```

**Archivos**: adr-deck, api-specs, deployment-runbook, exec-dashboard, project-status, release-notes, sprint-planning, sprint-review, system-architecture, tech-design, weekly-status-deck.

---

## Resumen de Cambios

| Fase | Archivos tocados | Esfuerzo |
|------|-----------------|----------|
| 1. Normalizar classification | 7 specs | 5 min |
| 2. Normalizar tilde organization | 8 specs | 5 min |
| 3a. html-theme: recibir meta | 1 archivo (21 llamadas) | 15 min |
| 3c. report-theme: fallback cover | 1 archivo | 5 min |
| 4. brand.json: classification default | 1 archivo | 2 min |
| 5. Agregar meta a deck specs | 11 specs | 20 min |
| **Total** | **~30 archivos** | **~50 min** |

---

## Validación

```bash
# 1. Regenerar todos los documentos
# (run all 29 specs through their respective builders)

# 2. Inspección visual — buscar inconsistencias en footers
grep -r "Contenido confidencial" assets/docs/
# Debe mostrar "Contenido confidencial de Nombre de la Organización" en todos

# 3. Tests
npm test
node shared/scripts/ci-validate.js --strict --verbose
node shared/scripts/docgen/validate.js
```
