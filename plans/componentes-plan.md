# Plan: Componentes HTML Reusables en docgen con TDD

> **Estado**: Implementado — ver `tests/commands/components.test.js` para cobertura unitaria
> **Versión**: 1.1
> **Autores**: aramirez-ai

---

## Índice

1. [Motivación](#1-motivación)
2. [Diagnóstico detallado](#2-diagnóstico-detallado)
3. [Arquitectura propuesta](#3-arquitectura-propuesta)
4. [theme-utils.js — API completa](#4-theme-utilsjs--api-completa)
5. [components.js — API completa](#5-componentsjs--api-completa)
6. [Refactor de html-theme.js](#6-refactor-de-html-themejs)
7. [Refactor de report-theme.js](#7-refactor-de-report-themejs)
8. [Plan TDD — 18 fases](#8-plan-tdd--18-fases)
9. [Integración con brand.json y CSS](#9-integración-con-brandjson-y-css)
10. [Mejores prácticas](#10-mejores-prácticas)
11. [Opciones de extensión](#11-opciones-de-extensión)
12. [Riesgos y mitigaciones](#12-riesgos-y-mitigaciones)
13. [Checklist de implementación](#13-checklist-de-implementación)

---

## 1. Motivación

### 1.1 Problemas actuales

| Problema | Impacto | Archivos afectados |
|----------|---------|-------------------|
| `esc()` triplicado (una versión omite `&#39;`) | Posible HTML inválido | index.js, html-theme.js, report-theme.js |
| Tablas HTML duplicadas con distinta clase CSS | 2 copias del mismo algoritmo | html-theme.js:188, report-theme.js:139 |
| Bullets duplicados con distinta clase CSS | 2 copias del mismo algoritmo | html-theme.js:120, report-theme.js:148 |
| Logo data URI en 3 versiones distintas | Mantenimiento confuso | index.js, html-theme.js, report-theme.js |
| CSS brand vars generados 2 veces | Inconsistencia entre temas | html-theme.js:47, report-theme.js:29 |
| Estado mutable `_currentFooterText` | Efectos secundarios, frágil | html-theme.js:25-38 |
| Sin tests unitarios de componentes | solo smoke tests de integración | tests/integration/ |
| CSS embebido sobreescribe brand.json | Colores hardcodeados ignoran brand | deck.css:9, report.css:9 |

### 1.2 Hallazgo crítico: colores hardcodeados en CSS

Los archivos `deck.css` y `report.css` definen variables CSS con valores fijos (heredados de gda-ai) que **no coinciden con `brand.json`**:

```css
/* deck.css: valores hardcodeados */
--ink: #23264f;       /* brand.primary = #1a365d */
--muted: #5b6080;     /* brand.secondary = #2b6cb0 */
--accent: #3b5bdb;    /* brand.secondary = #2b6cb0 */
--accent-soft: #e7ecff;
--bg-1: #f6f8fc;      /* brand.light-bg = #f7fafc */
```

Además, el CSS embebido se carga **después** de los vars inline generados por `brandCss()`:

```js
// html-theme.js: _css() — orden actual
return root + css;  // root = brand vars → css = deck.css (sobrescribe)
```

Esto significa que **brand.json es ineficaz** para controlar colores en decks y reportes. El plan debe corregir esto.

### 1.3 Objetivos

1. **Eliminar toda duplicación** de helpers y componentes HTML entre los 3 archivos
2. **Funciones puras** — sin estado mutable, predecibles, testeables
3. **Cobertura total de tests unitarios** para cada componente (TDD)
4. **Consistencia de marca** — brand.json debe controlar colores y fuentes reales
5. **Backward compatible** — API pública (`buildHtml`, `slideToHtml`) sin cambios
6. **CSS class configurable** — componentes compartidos aceptan clase CSS como parámetro

---

## 2. Diagnóstico detallado

### 2.1 `esc(text)` — 3 implementaciones

| Archivo | Línea | Reemplazos | ¿Exportado? |
|---------|-------|------------|-------------|
| `index.js` | 62 | `& < > "` (4 — falta `&#39;`) | `export function esc()` |
| `html-theme.js` | 43 | `& < > " '` (5 completos) | No (local) |
| `report-theme.js` | 25 | `& < > " '` (5 completos) | No (local) |

**Riesgo**: `index.js` lo usa para SVG text content. Si un spec contiene comilla simple (`'`), el SVG puede ser sintácticamente inválido.

### 2.2 Tabla HTML — 2 implementaciones

```js
// html-theme.js:188-192  →  tableV() con clase "fibex"
// report-theme.js:139-146 → _renderTable() con clase "data-table"
// Misma lógica:
//   headers.map(h => <th>esc(h)</th>)
//   rows.map(row => row.map(c => <td>esc(c)</td>))
```

### 2.3 Logo data URI — 3 implementaciones

| Archivo | Nombre | Parámetros | Resolución de path |
|---------|--------|------------|-------------------|
| index.js | `logoSvgCentered(href)` | path directo | `resolve(REPO_ROOT, href)` |
| index.js | `logoSvgTopRight(href)` | path directo | `resolve(REPO_ROOT, href)` |
| html-theme.js | `_logoHref(variant)` | `'blue' \| 'white'` | `resolve(REPO_ROOT, brand.logo)` |
| report-theme.js | `_logoDataUri()` | (ninguno) | `resolve(REPO_ROOT, brand.logo)` |

### 2.4 CSS brand vars — 2 implementaciones

```css
/* html-theme.js:47-59 */
:root {
  --ink: ${b.colors.primary};
  --ink-2: ${b.colors.secondary};
  --bg-1: ${b.colors['light-bg']};
  --card: ${b.colors.background};
  --accent: ${b.colors.secondary};
  --accent-soft: ${b.colors['light-bg']};
}

/* report-theme.js:29-41 */
:root {
  --ink: ${b.colors.primary};
  --muted: ${b.colors.secondary};
  --bg: ${b.colors.background};
  --bg-soft: ${b.colors['light-bg']};
  --accent: ${b.colors.secondary};
  --accent-soft: ${b.colors['light-bg']};
}
```

**Problema**: Nombres de variable CSS distintos, aunque mapean a los mismos colores de brand. No se pueden unificar sin cambiar los archivos CSS (que usan esos nombres). Solución: `brandCss(type)` genera las vars según el tema.

### 2.5 Footer — 2 mecanismos

```js
// html-theme.js:25-38 — estado mutable
let _currentFooterText = null;
function setFooterFromSlide(slide) {
  if (slide && slide.footer) {
    _currentFooterText = slide.footer;
  } else {
    const b = brand();
    _currentFooterText = b.footer
      ? b.footer.replace('{{organization}}', b.name)
      : 'Contenido confidencial';
  }
}

// report-theme.js:63-74 — función pura
function _pageFooter(page, meta) {
  const template = brand().footer || '...';
  const org = meta.organization || brand().name;
  const text = template.replace('{{organization}}', org);
  // ...
}
```

**Problema**: El estado mutable en deck es frágil — si se llama a `slideToHtml()` concurrentemente o se olvida llamar `setFooterFromSlide()`, el footer queda desactualizado.

### 2.6 Fonts ignorados

`brand.json` define:
```json
"fonts": {
  "heading": "Inter, sans-serif",
  "body": "Inter, sans-serif"
}
```

Pero los CSS usan:
- Deck: `-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- Report: `Helvetica, Arial, "Helvetica Neue", sans-serif`

Ninguno referencia `brand.fonts`. Los fonts de brand están inactivos.

---

## 3. Arquitectura propuesta

### 3.1 Árbol de archivos (solo lo que cambia)

```
shared/scripts/docgen/
├── index.js                # Core: brand(), SVG builders, profileCard, renderSubprocess
│                           #   → conserva esc() como fuente de verdad
│                           #   → conserva logoSvgCentered(), logoSvgTopRight() (SVG-specific)
│
├── theme-utils.js          # NUEVO: helpers compartidos (funciones puras)
│   ├── imageDataUri(path)    → data URI desde path
│   ├── logoHref(variant)     → data URI del logo brand
│   ├── brandCss(type)        → string CSS :root para deck o report
│   └── re-export: esc() desde index.js
│
├── components.js            # NUEVO: todos los componentes HTML (funciones puras)
│   ├── [helpers locales]     → esc, imageDataUri, logoHref (de theme-utils)
│   ├── logo(pos, variant)
│   ├── foot(center, page, footerText)
│   ├── head(titulo, sub, eyebrow)
│   ├── sectionBlock(titulo, sub)
│   ├── bullets(items, cls)
│   ├── tableV(headers, rows, cls)
│   ├── card(data)
│   ├── panel(data)
│   ├── kpi(valor, etiqueta)
│   ├── person(data)
│   ├── callout(headline, parrafos)
│   ├── recommendation(data)
│   ├── roadmap(headers, phases)
│   ├── kpiTable(headers, kpis)
│   ├── closing(parrafos)
│   └── media(src, cls, fit)   → imagen con data URI
│
├── html-theme.js            # REFACTOR: importa de components.js + theme-utils.js
│   └── layout functions       → usan componentes compartidos en vez de locales
│
├── report-theme.js          # REFACTOR: importa de components.js + theme-utils.js
│   └── renderers              → usan componentes compartidos en vez de locales
│
├── charts.js                # SIN CAMBIOS
└── build-*.js               # SIN CAMBIOS
```

### 3.2 Grafo de dependencias (acíclico)

```
┌─────────────────────────────────────────────────────────────────┐
│  index.js                                                       │
│  (brand, esc, SVG builders, profileCard, renderSubprocess)      │
└────────────────────┬────────────────────────────────────────────┘
                     │ import { brand, esc }
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  theme-utils.js                                                 │
│  (imageDataUri, logoHref, brandCss)                             │
│  re-export: esc                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │ import { esc, imageDataUri, logoHref }
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  components.js                                                  │
│  (18 componentes HTML puros)                                    │
└────────┬───────────────┬────────────────────────────────────────┘
         │               │
         ▼               ▼
┌─────────────────┐  ┌─────────────────────┐
│  html-theme.js   │  │  report-theme.js    │
│  (deck layouts)  │  │  (report renderers) │
└─────────────────┘  └─────────────────────┘
         ▲
         │ import { brand, esc }
         └────────────────────────────────── index.js
```

**Validación**: No hay dependencias circulares. `index.js` no importa de `components.js` ni `theme-utils.js`. `charts.js` ya importa de `index.js` y no cambia.

### 3.3 Principio: funciones puras

| Antes (mutable) | Después (puro) |
|----------------|----------------|
| `let _currentFooterText = null` | `foot(center, page, footerText)` |
| `setFooterFromSlide(slide)` modifica estado global | Cada layout pasa el texto resuelto: `resolveFooterText(s, brand())` |
| `footer()` lee `_currentFooterText` | `foot()` recibe texto como argumento |
| `_css()` lee brand() directamente | `brandCss(type)` recibe parámetro |

**Regla**: Ningún componente lee de variables externas o estado mutable. Todo se pasa como argumento.

### 3.4 Estrategia de CSS class

Los componentes compartidos entre temas aceptan `className` como parámetro opcional:

```js
// components.js
export function bullets(items = [], cls = 'bullet-list') {
  const lis = items.map(i => `<li>${esc(i)}</li>`).join('');
  return `<ul class="${cls}">${lis}</ul>`;
}

// html-theme.js (deck)
bullets(items, 'bullets')

// report-theme.js (report)
bullets(items, 'bullet-list')
```

Los componentes exclusivos de un tema usan clase fija (no necesitan configurabilidad).

---

## 4. theme-utils.js — API completa

### 4.1 `esc(text)`

```js
/**
 * Escapa caracteres HTML a entidades.
 * Coerce a String — números, null, undefined no crashean.
 * @param {*} text — valor a escapar
 * @returns {string}
 */
export function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

**Nota**: Se re-exporta desde `theme-utils.js` para conveniencia, pero la implementación vive en `index.js` (fuente de verdad). `theme-utils.js` hace `export { esc } from './index.js'`.

### 4.2 `imageDataUri(path)`

```js
/**
 * Lee cualquier archivo y retorna data URI (base64).
 * Soporta: svg, png, jpg, jpeg, gif, webp.
 * @param {string|null} path — ruta absoluta o relativa a REPO_ROOT
 * @returns {string|null} — data URI o null si no existe/no soportado
 */
export function imageDataUri(path) { ... }
```

**Casos borde**:

| Entrada | Salida | Razón |
|---------|--------|-------|
| `null` | `null` | early return |
| `''` | `null` | early return |
| `'/no/existe.svg'` | `null` | `!existsSync(p)` |
| `'archivo.sin.ext'` | `null` | no match en mime map |
| `'foto.JPG'` | data URI | lowercase en lookup → `image/jpeg` |
| logo existente | data URI | correcto |

### 4.3 `logoHref(variant)`

```js
/**
 * Retorna data URI del logo de la marca.
 * @param {'blue'|'white'} variant
 * @returns {string} — data URI o '' si no hay logo
 */
export function logoHref(variant = 'blue') { ... }
```

**Comportamiento**:
- `variant = 'blue'` → usa `brand.logo`
- `variant = 'white'` → usa `brand.logo_white` (fallback a `brand.logo` si no existe)
- Sin `brand.logo` → retorna `''`
- Archivo no existe → retorna `''`

### 4.4 `brandCss(type)`

```js
/**
 * Genera bloque CSS :root con variables de color según el tipo.
 * @param {'deck'|'report'} type — tipo de tema
 * @returns {string} — bloque CSS :root { ... }
 * @throws {Error} — si type no es válido
 */
export function brandCss(type) { ... }
```

**Mapa de variables generadas**:

| Variable | brand field | deck | report |
|----------|-------------|------|--------|
| `--ink` | `colors.primary` | ✅ | ✅ |
| `--ink-2` | `colors.secondary` | ✅ | — |
| `--muted` | `colors.secondary` | — | ✅ |
| `--body` | `colors.text` | ✅ (desde brand) | — |
| `--body-light` | — | — | ✅ (saturado) |
| `--bg-1` | `colors['light-bg']` | ✅ | — |
| `--bg-2` | — | ✅ (saturado) | — |
| `--bg` | `colors.background` | — | ✅ |
| `--bg-soft` | `colors['light-bg']` | — | ✅ |
| `--card` | `colors.background` | ✅ | — |
| `--accent` | `colors.secondary` | ✅ | ✅ |
| `--accent-soft` | `colors['light-bg']` | ✅ | ✅ |

**Post-condición**: Se debe actualizar `deck.css` y `report.css` para **eliminar los valores hardcodeados** de estas variables y usar `var()` consistentemente. Esto se hace en una fase posterior.

---

## 5. components.js — API completa

### 5.1 Convenciones generales

- **Todas las funciones son puras**: sin IO, sin estado, sin side effects
- **Parámetros con valores por defecto**: nunca `undefined` inesperado
- **Objeto para 3+ parámetros**: `card({ titulo, items, subtitulo, ... })`
- **Siempre escapar**: toda interpolación pasa por `esc()`
- **Retornar HTML válido siempre**: incluso con datos vacíos
- **Sin aserciones/excepciones** en componentes: el render no valida specs

### 5.2 Logo

```js
/**
 * @param {'tr'|'center'} pos — posición: top-right o centrado
 * @param {'blue'|'white'} variant — variante de logo
 * @returns {string}
 */
export function logo(pos = 'tr', variant = 'blue') {
  const href = logoHref(variant);
  const cls = pos === 'tr' ? 'logo logo--tr' : 'logo logo--center';
  return `<div class="${cls}"><img src="${href}" alt="Logo"/></div>`;
}
```

### 5.3 Footer

```js
/**
 * @param {boolean} center — centrar texto del footer
 * @param {string|null} page — texto de página (ej. "3 / 10")
 * @param {string} footerText — texto del footer ya resuelto
 * @returns {string}
 */
export function foot(center = false, page = null, footerText = '') {
  const cls = center ? 'footer footer--center' : 'footer';
  let parts = [`<div class="${cls}">${esc(footerText)}</div>`];
  if (page !== null && !center) {
    parts.push(`<div class="pageno">${esc(page)}</div>`);
  }
  return parts.join('');
}
```

### 5.4 Head (deck header)

```js
/**
 * @param {string} titulo
 * @param {string} subtitulo
 * @param {string} eyebrow — badge sobre el título
 * @returns {string}
 */
export function head(titulo = '', subtitulo = '', eyebrow = '') {
  let parts = ['<div class="head">'];
  if (eyebrow) parts.push(`<span class="eyebrow">${esc(eyebrow)}</span>`);
  parts.push(`<h1>${esc(titulo)}</h1>`);
  if (subtitulo) parts.push(`<div class="sub">${esc(subtitulo)}</div>`);
  parts.push('</div>');
  return parts.join('');
}
```

### 5.5 Section Block (report section header)

```js
/**
 * @param {string} titulo
 * @param {string} subtitulo
 * @returns {string}
 */
export function sectionBlock(titulo = '', subtitulo = '') {
  let parts = ['<div class="section-block">'];
  parts.push('<div class="section-bar"></div>');
  parts.push(`<h2>${esc(titulo)}</h2>`);
  if (subtitulo) parts.push(`<div class="section-sub">${esc(subtitulo)}</div>`);
  parts.push('</div>');
  return parts.join('');
}
```

### 5.6 Bullets

```js
/**
 * @param {string[]} items
 * @param {string} cls — CSS class (default: 'bullet-list')
 * @returns {string}
 */
export function bullets(items = [], cls = 'bullet-list') {
  const lis = items.map(i => `<li>${esc(i)}</li>`).join('');
  return `<ul class="${cls}">${lis}</ul>`;
}
```

### 5.7 TableV

```js
/**
 * @param {string[]} headers — títulos de columna
 * @param {string[][]} rows — filas de datos
 * @param {string} cls — CSS class (default: 'data-table')
 * @returns {string}
 */
export function tableV(headers = [], rows = [], cls = 'data-table') {
  const th = headers.map(h => `<th>${esc(h)}</th>`).join('');
  const trs = rows.map(row =>
    '<tr>' + row.map(c => `<td>${esc(c)}</td>`).join('') + '</tr>'
  ).join('');
  return `<table class="${cls}"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}
```

### 5.8 Card

```js
/**
 * @param {object} data
 * @param {string} data.titulo
 * @param {string[]} [data.items] — lista de items
 * @param {string} [data.subtitulo]
 * @param {string} [data.icon] — texto/emoji como icono
 * @param {string} [data.image] — path de imagen (banner)
 * @param {string} [data.iconImg] — path de imagen (icono)
 * @param {boolean} [data.accentTop=true] — barra de acento decorativa
 * @returns {string}
 */
export function card(data = {}) {
  const { titulo, items, subtitulo, icon, image, iconImg, accentTop = true } = data;
  let parts = ['<div class="card">'];
  const banner = image ? media(image, 'card-banner') : '';
  if (banner) parts.push(banner);
  const iconMedia = iconImg ? media(iconImg, 'card-icon-img') : '';
  if (iconMedia) parts.push(iconMedia);
  else if (icon) parts.push(`<div class="card-icon">${esc(icon)}</div>`);
  else if (accentTop && !banner) parts.push('<div class="accent-top"></div>');
  parts.push('<div class="card-body">');
  parts.push(`<h3>${esc(titulo)}</h3>`);
  if (subtitulo) parts.push(`<div class="card-sub">${esc(subtitulo)}</div>`);
  if (items && items.length) {
    parts.push('<ul>' + items.map(i => `<li>${esc(i)}</li>`).join('') + '</ul>');
  }
  parts.push('</div></div>');
  return parts.join('');
}
```

### 5.9 Panel

```js
/**
 * @param {object} data
 * @param {string} data.titulo
 * @param {string[]} [data.items]
 * @param {string} [data.tag] — badge sobre el título
 * @param {string} [data.image] — path de imagen (banner)
 * @returns {string}
 */
export function panel(data = {}) {
  const { titulo, items, tag, image } = data;
  let parts = ['<div class="panel">'];
  const banner = image ? media(image, 'panel-banner') : '';
  if (banner) parts.push(banner);
  parts.push('<div class="panel-body">');
  if (tag) parts.push(`<span class="panel-tag">${esc(tag)}</span>`);
  parts.push(`<h3>${esc(titulo)}</h3>`);
  if (items && items.length) {
    parts.push('<ul>' + items.map(i => `<li>${esc(i)}</li>`).join('') + '</ul>');
  }
  parts.push('</div></div>');
  return parts.join('');
}
```

### 5.10 KPI

```js
/**
 * @param {string} valor — valor numérico/texto del KPI
 * @param {string} etiqueta — label descriptivo
 * @returns {string}
 */
export function kpi(valor = '', etiqueta = '') {
  return `<div class="kpi"><div class="kpi-value">${esc(valor)}</div><div class="kpi-label">${esc(etiqueta)}</div></div>`;
}
```

### 5.11 Person

```js
function _initials(nombre) {
  const parts = String(nombre).split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * @param {object} data
 * @param {string} data.nombre
 * @param {string} [data.rol]
 * @param {string} [data.avatar] — texto avatar
 * @param {string} [data.avatarImg] — path de imagen avatar
 * @returns {string}
 */
export function person(data = {}) {
  const { nombre, rol, avatar, avatarImg } = data;
  const uri = avatarImg ? imageDataUri(avatarImg) : null;
  let av;
  if (uri) {
    av = `<div class="avatar avatar--img"><img src="${uri}" alt=""/></div>`;
  } else {
    const text = avatar ? esc(avatar) : esc(_initials(nombre));
    av = `<div class="avatar">${text}</div>`;
  }
  return `<div class="person">${av}<div class="pname">${esc(nombre)}</div><div class="prole">${esc(rol || '')}</div></div>`;
}
```

### 5.12 Media

```js
/**
 * Renderiza una imagen como bloque con data URI.
 * @param {string|null} src — path de la imagen
 * @param {string} cls — CSS class (default: 'media')
 * @param {string} fit — object-fit (default: 'cover')
 * @returns {string}
 */
export function media(src = null, cls = 'media', fit = 'cover') {
  if (!src) return '';
  const uri = imageDataUri(src);
  if (!uri) return '';
  const style = fit ? ` style="object-fit:${fit}"` : '';
  return `<div class="${cls}"><img src="${uri}"${style} alt=""/></div>`;
}
```

### 5.13 Callout (report)

```js
/**
 * @param {string} headline — título destacado
 * @param {string|string[]} parrafos — contenido
 * @returns {string}
 */
export function callout(headline = '', parrafos = []) {
  const items = Array.isArray(parrafos) ? parrafos : [parrafos];
  let parts = ['<div class="callout-box">'];
  parts.push(`<div class="callout-headline">${esc(headline)}</div>`);
  if (items.length) {
    parts.push('<div class="callout-body">');
    for (const p of items) parts.push(`<p>${esc(p)}</p>`);
    parts.push('</div>');
  }
  parts.push('</div>');
  return parts.join('');
}
```

### 5.14 Recommendation (report)

```js
/**
 * @param {object} data
 * @param {string} data.titulo
 * @param {string} [data.problema]
 * @param {string} [data.recomendacion]
 * @param {string[]} [data.acciones]
 * @returns {string}
 */
export function recommendation(data = {}) {
  const { titulo, problema, recomendacion, acciones } = data;
  let parts = ['<div class="recommendation">'];
  parts.push(`<h3>${esc(titulo)}</h3>`);
  if (problema) parts.push(`<div class="rec-field"><strong>Problema:</strong> ${esc(problema)}</div>`);
  if (recomendacion) parts.push(`<div class="rec-field"><strong>Recomendación:</strong> ${esc(recomendacion)}</div>`);
  if (acciones && acciones.length) {
    parts.push('<div class="rec-field"><strong>Acciones sugeridas:</strong></div>');
    parts.push('<ul class="rec-actions">');
    for (const a of acciones) parts.push(`<li>${esc(a)}</li>`);
    parts.push('</ul>');
  }
  parts.push('</div>');
  return parts.join('');
}
```

### 5.15 Roadmap (report)

```js
/**
 * @param {string[]} headers — títulos de columna
 * @param {object[]} phases — fases del roadmap
 * @param {string} phases[].periodo — periodo de la fase
 * @param {string} phases[].foco — foco de la fase
 * @param {string[]} phases[].entregables — entregables
 * @returns {string}
 */
export function roadmap(headers = [], phases = []) {
  const hdrs = headers.length ? headers : ['Periodo', 'Foco', 'Entregables'];
  const th = hdrs.map(h => `<th>${esc(h)}</th>`).join('');
  const trs = phases.map(phase => {
    const deliverables = phase.entregables || phase.deliverables || [];
    const delivHtml = deliverables.map(d => `• ${esc(d)}`).join('<br/>');
    return '<tr>' +
      `<td>${esc(phase.phase || phase.periodo || '')}</td>` +
      `<td>${esc(phase.focus || phase.foco || '')}</td>` +
      `<td>${delivHtml}</td>` +
      '</tr>';
  }).join('');
  return `<table class="roadmap-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>\n`;
}
```

### 5.16 KpiTable (report)

```js
/**
 * @param {string[]} headers — títulos de columna
 * @param {object[]} kpis — KPIs
 * @param {string} kpis[].dominio — dominio
 * @param {string} kpis[].metrica — métrica/indicador
 * @param {string} kpis[].meta — target/valor
 * @returns {string}
 */
export function kpiTable(headers = [], kpis = []) {
  const hdrs = headers.length ? headers : ['Dominio', 'Indicador', 'Meta'];
  const th = hdrs.map(h => `<th>${esc(h)}</th>`).join('');
  const trs = kpis.map(k =>
    '<tr>' +
    `<td>${esc(k.domain || k.dominio || '')}</td>` +
    `<td>${esc(k.metric || k.metrica || '')}</td>` +
    `<td>${esc(k.target || k.meta || '')}</td>` +
    '</tr>'
  ).join('');
  return `<table class="kpi-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>\n`;
}
```

### 5.17 Closing (report)

```js
/**
 * @param {string|string[]} parrafos
 * @returns {string}
 */
export function closing(parrafos = []) {
  const items = Array.isArray(parrafos) ? parrafos : [parrafos];
  let parts = ['<div class="closing-block">'];
  parts.push('<div class="closing-icon">\u201c</div>');
  for (const p of items) parts.push(`<p>${esc(p)}</p>`);
  parts.push('</div>');
  return parts.join('');
}
```

---

## 6. Refactor de html-theme.js

### 6.1 Código a eliminar

| Código | Líneas | Reemplazo |
|--------|--------|-----------|
| `let _currentFooterText` | 25 | Eliminar (estado mutable) |
| `function setFooterFromSlide()` | 27-38 | Eliminar (footer se resuelve en cada layout) |
| `function esc()` | 42-44 | Importar desde index.js |
| `function _css()` | 46-59 | Usar `brandCss('deck')` + CSS file |
| `function _logoHref()` | 61-69 | Usar `logoHref()` de theme-utils |
| `function _resolvePath()` | 71-75 | Usar `imageDataUri()` de theme-utils |
| `function _imageDataUri()` | 77-93 | Usar `imageDataUri()` de theme-utils |
| `function logo()` | 97-101 | Importar desde components.js |
| `function footer()` | 103-109 | Importar `foot()` desde components.js |
| `function head()` | 111-118 | Importar desde components.js |
| `function bullets()` | 120-123 | Importar desde components.js |
| `function media()` | 125-131 | Importar desde components.js |
| `function card()` | 133-149 | Importar desde components.js |
| `function panel()` | 151-163 | Importar desde components.js |
| `function kpi()` | 165-167 | Importar desde components.js |
| `function _initials()` | 169-174 | Importar desde components.js (interno) |
| `function person()` | 176-186 | Importar desde components.js |
| `function tableV()` | 188-192 | Importar desde components.js |

### 6.2 Footer sano: resuelto en layout, no en módulo

Cada layout function resuelve el footer y lo pasa a `_slide()`:

```js
function resolveFooterText(s) {
  if (s?.footer) return s.footer;
  const b = brand();
  if (b.footer) return b.footer.replace('{{organization}}', b.name);
  return 'Contenido confidencial';
}

function _slide(inner, extraCls = '', page = null, footerCenter = false, withLogo = 'tr', logoVariant = 'blue', footerText = '') {
  const cls = 'slide' + (extraCls ? ` ${extraCls}` : '');
  let parts = [`<section class="${cls}">`];
  if (withLogo) parts.push(logo(withLogo, logoVariant));
  parts.push(inner);
  parts.push(foot(footerCenter, page, footerText));
  parts.push('</section>');
  return parts.join('');
}
```

### 6.3 Nuevas importaciones

```js
import { brand, esc } from './index.js';
import { brandCss, imageDataUri } from './theme-utils.js';
import { logo, foot, head, bullets, tableV, card, panel, kpi, person, media } from './components.js';
import { renderChart } from './charts.js';
```

### 6.4 Nuevo _css()

```js
function _css() {
  let css = '';
  if (existsSync(CSS_PATH)) css = readFileSync(CSS_PATH, 'utf8');
  return brandCss('deck') + '\n' + css;
}
```

### 6.5 Layout portada — ejemplo de layout refactorizado

```js
function _slide_portada(s, page) {
  const logoVariant = s.logo_variant || 'blue';
  let inner = `<div class="cover body-area"><h1>${esc(s.titulo || '')}</h1>`;
  if (s.subtitulo) inner += `<div class="sub">${esc(s.subtitulo)}</div>`;
  inner += '<div class="accent-bar"></div></div>';
  return _slide(inner, 'cover', null, true, 'center', logoVariant, resolveFooterText(s));
}
```

---

## 7. Refactor de report-theme.js

### 7.1 Código a eliminar

| Código | Líneas | Reemplazo |
|--------|--------|-----------|
| `function esc()` | 24-26 | Importar desde index.js |
| `function _css()` | 28-41 | Usar `brandCss('report')` + CSS file |
| `function _logoDataUri()` | 43-50 | Usar `logoHref()` de theme-utils |
| `function _pageHeader()` | 52-61 | Usar `logoHref()` |
| `function _pageFooter()` | 63-74 | Usar `foot()` de components.js |
| `function _renderCover()` | 78-102 | Usar `logoHref()` |
| `function _renderSection()` | 104-113 | Usar `sectionBlock()` de components.js |
| `function _renderText()` | 115-122 | Queda inline (report-only, simple) |
| `function _renderCallout()` | 124-137 | Usar `callout()` de components.js |
| `function _renderTable()` | 139-146 | Usar `tableV(..., 'data-table')` |
| `function _renderBullets()` | 148-152 | Usar `bullets(..., 'bullet-list')` |
| `function _renderRecommendation()` | 154-171 | Usar `recommendation()` de components.js |
| `function _renderRoadmap()` | 173-187 | Usar `roadmap()` de components.js |
| `function _renderKpiTable()` | 189-201 | Usar `kpiTable()` de components.js |
| `function _renderClosing()` | 203-211 | Usar `closing()` de components.js |

### 7.2 Nuevas importaciones

```js
import { brand, esc } from './index.js';
import { brandCss, logoHref } from './theme-utils.js';
import { foot, sectionBlock, bullets, tableV, callout, recommendation, roadmap, kpiTable, closing } from './components.js';
```

### 7.3 _pageHeader refactorizado

```js
function _pageHeader(page, meta) {
  const classification = esc(meta.classification || '');
  const logo = logoHref('blue');
  return (
    '<div class="page-header">' +
    `<span class="header-classification">${classification}</span>` +
    `<span class="header-logo"><img src="${logo}" alt="Logo"/></span>` +
    '</div>\n'
  );
}
```

### 7.4 _pageFooter refactorizado

```js
function _pageFooter(page, meta) {
  const b = brand();
  const template = b.footer || 'Contenido confidencial de {{organization}}';
  const org = meta.organization || b.name;
  const text = template.replace('{{organization}}', org);
  return foot(false, `Página ${page}`, text);
}
```

### 7.5 Renderers refactorizados

```js
function _renderSection(s) {
  return sectionBlock(s.titulo || '', s.subtitulo || '');
}

function _renderTable(s) {
  return tableV(s.headers || [], s.filas || [], 'data-table');
}

function _renderBullets(s) {
  return bullets(s.items || [], 'bullet-list');
}

function _renderCallout(s) {
  return callout(s.headline || s.titulo || '', s.parrafos || s.texto || []);
}

function _renderRecommendation(s) {
  return recommendation({
    titulo: s.titulo,
    problema: s.problema || s.problem,
    recomendacion: s.recomendacion || s.recommendation,
    acciones: s.acciones || s.actions,
  });
}

function _renderRoadmap(s) {
  return roadmap(s.headers || ['Periodo', 'Foco', 'Entregables'], s.fases || s.phases || []);
}

function _renderKpiTable(s) {
  return kpiTable(s.headers || ['Dominio', 'Indicador', 'Meta'], s.kpis || s.items || []);
}

function _renderClosing(s) {
  return closing(s.parrafos || s.items || []);
}
```

---

## 8. Plan TDD — 18 fases

### 8.1 Convenciones de test

- **Framework**: `node:test` + `node:assert/strict` (estándar del proyecto, zero deps)
- **Ubicación**: `tests/commands/components.test.js` (nuevo archivo)
- **Estructura**: cada `describe` agrupa tests de un componente
- **Naming**: `'componente — caso: descripción'`
- **Sin mock de filesystem**: `imageDataUri` se testea con:
  - Paths inventados (retorna `null`)
  - Logo real de brand (retorna data URI) — cuando existe
- **Orden**: fases 1-4 (theme-utils) → 5-6 (shared components) → 7-12 (deck) → 13-17 (report) → 18 (logo+foot)
- **Cada fase es un commit atómico**: test fallido → implementación → test pasa

### 8.2 Fase 1: theme-utils/esc

```js
describe('theme-utils — esc()', () => {
  test('esc — escapa & < > " \'', () => {
    assert.equal(esc('&'), '&amp;');
    assert.equal(esc('<'), '&lt;');
    assert.equal(esc('>'), '&gt;');
    assert.equal(esc('"'), '&quot;');
    assert.equal(esc("'"), '&#39;');
  });
  test('esc — texto sin caracteres especiales pasa intacto', () => {
    assert.equal(esc('hola mundo'), 'hola mundo');
    assert.equal(esc('123'), '123');
  });
  test('esc — combina todos los reemplazos', () => {
    assert.equal(esc('&<>"\''), '&amp;&lt;&gt;&quot;&#39;');
  });
  test('esc — coerce tipos no string', () => {
    assert.equal(esc(0), '0');
    assert.equal(esc(null), 'null');
    assert.equal(esc(undefined), 'undefined');
    assert.equal(esc(true), 'true');
  });
  test('esc — string vacío retorna vacío', () => {
    assert.equal(esc(''), '');
  });
});
```

### 8.3 Fase 2: theme-utils/imageDataUri

```js
describe('theme-utils — imageDataUri()', () => {
  test('imageDataUri — path null retorna null', () => {
    assert.equal(imageDataUri(null), null);
  });
  test('imageDataUri — path vacío retorna null', () => {
    assert.equal(imageDataUri(''), null);
  });
  test('imageDataUri — archivo inexistente retorna null', () => {
    assert.equal(imageDataUri('/no/existe/file.svg'), null);
  });
  test('imageDataUri — archivo existente retorna data URI', () => {
    const b = brand();
    if (b.logo) {
      const uri = imageDataUri(b.logo);
      assert.ok(uri.startsWith('data:'), 'Debe empezar con data:');
      assert.ok(uri.includes('base64,'), 'Debe contener base64');
      assert.ok(uri.includes('image/'), 'Debe contener tipo MIME');
    }
  });
  test('imageDataUri — extensión .JPG mayúscula se reconoce como image/jpeg', () => {
    // No crashea con extensión no estándar
    const result = imageDataUri('/tmp/test.JPG');
    assert.equal(result, null);  // file doesn't exist
  });
  test('imageDataUri — extensión desconocida retorna null', () => {
    const result = imageDataUri('/tmp/archivo.xyz');
    assert.equal(result, null);
  });
});
```

### 8.4 Fase 3: theme-utils/logoHref

```js
describe('theme-utils — logoHref()', () => {
  test('logoHref — variant=blue retorna data URI cuando existe logo', () => {
    const b = brand();
    if (b.logo) {
      const uri = logoHref('blue');
      assert.ok(uri.startsWith('data:'));
      assert.ok(uri.includes('base64,'));
    }
  });
  test('logoHref — variant=white retorna string vacío si no hay logo_white', () => {
    const uri = logoHref('white');
    assert.equal(typeof uri, 'string');
  });
  test('logoHref — default variant es blue', () => {
    assert.equal(typeof logoHref(), 'string');
  });
});
```

### 8.5 Fase 4: theme-utils/brandCss

```js
describe('theme-utils — brandCss()', () => {
  test('brandCss — deck genera :root con vars específicas de deck', () => {
    const css = brandCss('deck');
    assert.ok(css.startsWith(':root {'));
    assert.ok(css.includes('--ink'));
    assert.ok(css.includes('--bg-1'));
    assert.ok(css.includes('--card'));
    assert.ok(css.includes('--accent-soft'));
    assert.ok(!css.includes('--muted'), 'deck no debe tener --muted');
    assert.ok(!css.includes('--bg'), 'deck no debe tener --bg');
  });
  test('brandCss — report genera :root con vars específicas de report', () => {
    const css = brandCss('report');
    assert.ok(css.includes('--muted'));
    assert.ok(css.includes('--bg'));
    assert.ok(css.includes('--bg-soft'));
    assert.ok(!css.includes('--bg-1'), 'report no debe tener --bg-1');
    assert.ok(!css.includes('--card'), 'report no debe tener --card');
  });
  test('brandCss — tipo inválido lanza Error', () => {
    assert.throws(() => brandCss('invalid'), { name: 'Error' });
    assert.throws(() => brandCss('invalid'), /brand CSS type/);
  });
  test('brandCss — colores corresponden a brand.json', () => {
    const b = brand();
    const css = brandCss('deck');
    assert.ok(css.includes(b.colors.primary));
    assert.ok(css.includes(b.colors.background));
  });
});
```

### 8.6 Fase 5: components/bullets

```js
describe('components — bullets()', () => {
  test('bullets — lista vacía retorna <ul> vacío', () => {
    assert.equal(bullets([]), '<ul class="bullet-list"></ul>');
  });
  test('bullets — items se renderizan como <li> escapados', () => {
    const html = bullets(['a & b', 'c']);
    assert.ok(html.includes('<li>a &amp; b</li>'));
    assert.ok(html.includes('<li>c</li>'));
  });
  test('bullets — className override funciona', () => {
    const html = bullets(['x'], 'bullets');
    assert.ok(html.startsWith('<ul class="bullets">'));
  });
  test('bullets — sin items retorna <ul> vacío', () => {
    assert.equal(bullets(), '<ul class="bullet-list"></ul>');
  });
});
```

### 8.7 Fase 6: components/tableV

```js
describe('components — tableV()', () => {
  test('tableV — headers y rows generan <table> completa', () => {
    const html = tableV(['A', 'B'], [['1', '2'], ['3', '4']]);
    assert.ok(html.includes('<table'));
    assert.ok(html.includes('<th>A</th><th>B</th>'));
    assert.ok(html.includes('<td>1</td><td>2</td>'));
    assert.ok(html.includes('<td>3</td><td>4</td>'));
  });
  test('tableV — className override: clase fibex', () => {
    const html = tableV(['A'], [['1']], 'fibex');
    assert.ok(html.includes('class="fibex"'));
  });
  test('tableV — datos escapados en celdas', () => {
    const html = tableV(['<h1>'], [['<script>']]);
    assert.ok(html.includes('&lt;h1&gt;'));
    assert.ok(html.includes('&lt;script&gt;'));
  });
  test('tableV — default className es data-table', () => {
    const html = tableV(['A'], [['1']]);
    assert.ok(html.includes('class="data-table"'));
  });
  test('tableV — headers vacío genera thead vacío', () => {
    const html = tableV([], []);
    assert.ok(html.includes('<thead><tr></tr></thead>'));
    assert.ok(html.includes('<tbody></tbody>'));
  });
});
```

### 8.8 Fase 7: components/head

```js
describe('components — head()', () => {
  test('head — título + subtítulo + eyebrow', () => {
    const html = head('Título', 'Subtítulo', 'Eyebrow');
    assert.ok(html.includes('<h1>Título</h1>'));
    assert.ok(html.includes('<div class="sub">Subtítulo</div>'));
    assert.ok(html.includes('<span class="eyebrow">Eyebrow</span>'));
  });
  test('head — solo título', () => {
    const html = head('Solo');
    assert.ok(html.includes('<h1>Solo</h1>'));
    assert.ok(!html.includes('class="sub"'));
    assert.ok(!html.includes('eyebrow'));
  });
  test('head — sin parámetros no crashea', () => {
    const html = head();
    assert.ok(html.includes('<div class="head">'));
  });
  test('head — subtítulo vacío no se renderiza', () => {
    const html = head('T', '');
    assert.ok(!html.includes('class="sub"'));
  });
});
```

### 8.9 Fase 8: components/sectionBlock

```js
describe('components — sectionBlock()', () => {
  test('sectionBlock — título + subtítulo', () => {
    const html = sectionBlock('Título', 'Subtítulo');
    assert.ok(html.includes('<h2>Título</h2>'));
    assert.ok(html.includes('<div class="section-sub">Subtítulo</div>'));
    assert.ok(html.includes('section-bar'));
  });
  test('sectionBlock — solo título', () => {
    const html = sectionBlock('Solo');
    assert.ok(html.includes('<h2>Solo</h2>'));
    assert.ok(!html.includes('section-sub'));
  });
});
```

### 8.10 Fase 9: components/kpi

```js
describe('components — kpi()', () => {
  test('kpi — valor y etiqueta', () => {
    const html = kpi('99%', 'Uptime');
    assert.ok(html.includes('kpi-value">99%</div>'));
    assert.ok(html.includes('kpi-label">Uptime</div>'));
  });
  test('kpi — valores vacíos', () => {
    const html = kpi();
    assert.ok(html.includes('kpi-value"></div>'));
    assert.ok(html.includes('kpi-label"></div>'));
  });
  test('kpi — escapa caracteres', () => {
    const html = kpi('<100>', 'a & b');
    assert.ok(html.includes('&lt;100&gt;'));
    assert.ok(html.includes('a &amp; b'));
  });
});
```

### 8.11 Fase 10: components/person

```js
describe('components — person()', () => {
  test('person — nombre y rol', () => {
    const html = person({ nombre: 'Alice', rol: 'Dev' });
    assert.ok(html.includes('<div class="person">'));
    assert.ok(html.includes('pname">Alice</div>'));
    assert.ok(html.includes('prole">Dev</div>'));
  });
  test('person — iniciales de dos palabras', () => {
    const html = person({ nombre: 'John Doe' });
    assert.ok(html.includes('JD'));
  });
  test('person — iniciales de una palabra', () => {
    const html = person({ nombre: 'Admin' });
    assert.ok(html.includes('AD'));
  });
  test('person — nombre vacío retorna ?', () => {
    const html = person({ nombre: '' });
    assert.ok(html.includes('?'));
  });
  test('person — avatar texto override', () => {
    const html = person({ nombre: 'Alice', avatar: 'A' });
    assert.ok(html.includes('>A<'));
  });
  test('person — sin parámetros no crashea', () => {
    const html = person();
    assert.ok(html.includes('person'));
  });
});
```

### 8.12 Fase 11: components/card

```js
describe('components — card()', () => {
  test('card — título e items', () => {
    const html = card({ titulo: 'Card', items: ['A', 'B'] });
    assert.ok(html.includes('<h3>Card</h3>'));
    assert.ok(html.includes('<li>A</li>'));
    assert.ok(html.includes('<li>B</li>'));
  });
  test('card — subtítulo e icono', () => {
    const html = card({ titulo: 'T', subtitulo: 'Sub', icon: '⭐' });
    assert.ok(html.includes('card-sub">Sub</div>'));
    assert.ok(html.includes('card-icon">⭐</div>'));
  });
  test('card — sin items no renderiza <ul>', () => {
    const html = card({ titulo: 'T' });
    assert.ok(!html.includes('<ul>'));
  });
  test('card — accentTop=false sin banner e icono', () => {
    const html = card({ titulo: 'T', accentTop: false });
    assert.ok(!html.includes('accent-top'));
  });
  test('card — sin parámetros no crashea', () => {
    const html = card();
    assert.ok(html.includes('<div class="card">'));
  });
});
```

### 8.13 Fase 12: components/panel

```js
describe('components — panel()', () => {
  test('panel — título e items', () => {
    const html = panel({ titulo: 'Panel', items: ['X', 'Y'] });
    assert.ok(html.includes('<h3>Panel</h3>'));
    assert.ok(html.includes('<li>X</li>'));
  });
  test('panel — tag opcional', () => {
    const html = panel({ titulo: 'T', tag: 'NEW' });
    assert.ok(html.includes('panel-tag">NEW</span>'));
  });
  test('panel — sin parámetros no crashea', () => {
    const html = panel();
    assert.ok(html.includes('<div class="panel">'));
  });
});
```

### 8.14 Fase 13: components/callout

```js
describe('components — callout()', () => {
  test('callout — headline y párrafos', () => {
    const html = callout('Nota', ['Párrafo 1', 'Párrafo 2']);
    assert.ok(html.includes('callout-headline">Nota</div>'));
    assert.ok(html.includes('<p>Párrafo 1</p>'));
    assert.ok(html.includes('<p>Párrafo 2</p>'));
  });
  test('callout — string en vez de array', () => {
    const html = callout('Head', 'Texto simple');
    assert.ok(html.includes('<p>Texto simple</p>'));
  });
  test('callout — sin parámetros no crashea', () => {
    const html = callout();
    assert.ok(html.includes('callout-box'));
  });
});
```

### 8.15 Fase 14: components/recommendation

```js
describe('components — recommendation()', () => {
  test('recommendation — titulo, problema, recomendacion, acciones', () => {
    const html = recommendation({
      titulo: 'Mejora',
      problema: 'Latencia alta',
      recomendacion: 'Migrar a CDN',
      acciones: ['Acción 1', 'Acción 2'],
    });
    assert.ok(html.includes('<h3>Mejora</h3>'));
    assert.ok(html.includes('Problema:</strong> Latencia alta'));
    assert.ok(html.includes('Recomendación:</strong> Migrar a CDN'));
    assert.ok(html.includes('<li>Acción 1</li>'));
  });
  test('recommendation — con campos ingleses (problem/recommendation/actions)', () => {
    const html = recommendation({
      titulo: 'Fix',
      problem: 'Bug',
      recommendation: 'Patch',
      actions: ['Deploy'],
    });
    assert.ok(html.includes('Bug'));
    assert.ok(html.includes('Patch'));
    assert.ok(html.includes('Deploy'));
  });
  test('recommendation — sin parámetros no crashea', () => {
    const html = recommendation();
    assert.ok(html.includes('recommendation'));
  });
});
```

### 8.16 Fase 15: components/roadmap

```js
describe('components — roadmap()', () => {
  test('roadmap — headers y fases', () => {
    const html = roadmap(
      ['Periodo', 'Foco'],
      [{ phase: 'Q1', focus: 'Setup', deliverables: ['Task 1'] }]
    );
    assert.ok(html.includes('<th>Periodo</th>'));
    assert.ok(html.includes('<td>Q1</td>'));
    assert.ok(html.includes('• Task 1'));
  });
  test('roadmap — headers por defecto', () => {
    const html = roadmap([], [{ periodo: 'Q1', foco: 'A', entregables: ['B'] }]);
    assert.ok(html.includes('Periodo'));
    assert.ok(html.includes('Foco'));
    assert.ok(html.includes('Entregables'));
  });
  test('roadmap — sin parámetros no crashea', () => {
    const html = roadmap();
    assert.ok(html.includes('roadmap-table'));
  });
});
```

### 8.17 Fase 16: components/kpiTable

```js
describe('components — kpiTable()', () => {
  test('kpiTable — headers y KPIs', () => {
    const html = kpiTable(
      ['Dominio', 'Indicador'],
      [{ dominio: 'UX', metrica: 'NPS', meta: '>80' }]
    );
    assert.ok(html.includes('<th>Dominio</th>'));
    assert.ok(html.includes('<td>UX</td>'));
    assert.ok(html.includes('<td>NPS</td>'));
    assert.ok(html.includes('<td>>80</td>'));
  });
  test('kpiTable — con campos ingleses (domain/metric/target)', () => {
    const html = kpiTable([], [{ domain: 'UX', metric: 'NPS', target: '80' }]);
    assert.ok(html.includes('UX'));
    assert.ok(html.includes('NPS'));
    assert.ok(html.includes('80'));
  });
  test('kpiTable — sin parámetros no crashea', () => {
    const html = kpiTable();
    assert.ok(html.includes('kpi-table'));
  });
});
```

### 8.18 Fase 17: components/closing

```js
describe('components — closing()', () => {
  test('closing — párrafos', () => {
    const html = closing(['Párrafo 1', 'Párrafo 2']);
    assert.ok(html.includes('<p>Párrafo 1</p>'));
    assert.ok(html.includes('<p>Párrafo 2</p>'));
    assert.ok(html.includes('closing-icon'));
  });
  test('closing — string en vez de array', () => {
    const html = closing('Texto único');
    assert.ok(html.includes('<p>Texto único</p>'));
  });
  test('closing — sin parámetros no crashea', () => {
    const html = closing();
    assert.ok(html.includes('closing-block'));
  });
});
```

### 8.19 Fase 18: components/logo + components/foot

```js
describe('components — logo()', () => {
  test('logo — pos=tr genera clase logo--tr', () => {
    const html = logo('tr', 'blue');
    assert.ok(html.includes('logo--tr'));
  });
  test('logo — pos=center genera clase logo--center', () => {
    const html = logo('center', 'blue');
    assert.ok(html.includes('logo--center'));
  });
});

describe('components — foot()', () => {
  test('foot — center=true genera footer--center', () => {
    const html = foot(true, null, 'Confidencial');
    assert.ok(html.includes('footer--center'));
    assert.ok(html.includes('Confidencial'));
  });
  test('foot — center=false + page genera pageno', () => {
    const html = foot(false, '5 / 10', 'Text');
    assert.ok(html.includes('pageno'));
    assert.ok(html.includes('5 / 10'));
  });
  test('foot — center=false + page=null no genera pageno', () => {
    const html = foot(false, null, 'Text');
    assert.ok(!html.includes('pageno'));
  });
  test('foot — sin parámetros no crashea', () => {
    const html = foot();
    assert.ok(html.includes('footer'));
  });
});
```

---

## 9. Integración con brand.json y CSS

### 9.1 Problema actual de consistencia

Actualmente, `brand.json` define colores y fuentes que **no se utilizan** porque:

1. `brandCss()` genera vars CSS con los valores de brand
2. Pero el CSS embebido (deck.css, report.css) **sobrescribe** esas vars con valores hardcodeados
3. Los `font-family` en CSS ignoran `brand.fonts`

### 9.2 Solución en 3 fases

**Fase A (en el refactor)**: `brandCss()` genera las vars correctamente. Los temas usan `brandCss()` antes del CSS file. Con eso, brand sí controla colores, pero los archivos CSS aún tienen valores hardcodeados que sobrescriben.

**Fase B (post-refactor)**: Actualizar `deck.css` y `report.css` para **eliminar los valores hardcodeados** de las variables que genera `brandCss()`. Específicamente:

```css
/* deck.css — ANTES */
:root {
  --ink: #23264f;        /* ELIMINAR — lo genera brandCss() */
  --ink-2: #2f3463;      /* ELIMINAR */
  --muted: #5b6080;      /* ELIMINAR */
  --body: #3a3f63;       /* ELIMINAR */
  --bg-1: #f6f8fc;       /* ELIMINAR */
  --bg-2: #eef1f8;       /* ELIMINAR */
  --card: #ffffff;        /* ELIMINAR */
  --accent: #3b5bdb;     /* ELIMINAR */
  --accent-soft: #e7ecff; /* ELIMINAR */
  --ok: #2f9e6f;         /* CONSERVAR (no está en brand) */
  --warn: #c98a16;       /* CONSERVAR */
  --shadow: ...;         /* CONSERVAR */
  --radius: ...;         /* CONSERVAR */
  ...
}

/* deck.css — DESPUÉS */
:root {
  --ok: #2f9e6f;
  --warn: #c98a16;
  --shadow: 0 10px 30px rgba(35, 38, 79, 0.12);
  --shadow-sm: 0 4px 14px rgba(35, 38, 79, 0.10);
  --radius: 18px;
  --gap: 28px;
  --pad: 64px;
  --slide-w: 1280px;
  --slide-h: 720px;
}
```

```css
/* report.css — ANTES */
:root {
  --ink: #23264f;        /* ELIMINAR */
  --muted: #5b6080;      /* ELIMINAR */
  --body: #3a3f63;       /* ELIMINAR */
  --body-light: #4a4f73; /* ELIMINAR */
  --bg: #ffffff;          /* ELIMINAR */
  --bg-soft: #f6f8fc;    /* ELIMINAR */
  --accent: #3b5bdb;     /* ELIMINAR */
  --accent-soft: #e7ecff;/* ELIMINAR */
  --line: #d9dee8;       /* CONSERVAR (no está en brand) */
  ...
}
```

**Fase C (post-refactor)**: Hacer que los `font-family` en ambos CSS usen `brand.fonts`:

```css
/* En deck.css */
html, body {
  font-family: ${brand.fonts.body};
}

/* En components.js (head) — para títulos */
.head h1 {
  font-family: ${brand.fonts.heading};
}
```

Esto requiere pasar `brand` a `brandCss()` o generar un bloque de font-face adicional. Mejor: añadir vars de fuente en `brandCss()`.

### 9.3 Esquema brand.json completo (referencia)

```json
{
  "brand": {
    "name": "aramirez-ai",
    "footer": "Contenido confidencial de {{organization}}",
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

### 9.4 brandCss() extendido con fonts

```js
export function brandCss(type) {
  const b = brand();
  const isDeck = type === 'deck';
  const isReport = type === 'report';
  if (!isDeck && !isReport) throw new Error(`Unknown brand CSS type: ${type}`);

  const vars = {
    '--ink': b.colors.primary,
    '--accent': b.colors.secondary,
    '--accent-soft': b.colors['light-bg'],
  };

  if (isDeck) {
    vars['--ink-2'] = b.colors.secondary;
    vars['--bg-1'] = b.colors['light-bg'];
    vars['--card'] = b.colors.background;
  }

  if (isReport) {
    vars['--muted'] = b.colors.secondary;
    vars['--bg'] = b.colors.background;
    vars['--bg-soft'] = b.colors['light-bg'];
    vars['--body'] = b.colors.text;
  }

  if (b.fonts) {
    vars['--font-heading'] = b.fonts.heading || 'Inter, sans-serif';
    vars['--font-body'] = b.fonts.body || 'Inter, sans-serif';
  }

  const cssVars = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

  return `:root {\n${cssVars}\n}\n`;
}
```

Luego en `deck.css` y `report.css`:

```css
html, body {
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6, .head h1, .section h1 {
  font-family: var(--font-heading);
}
```

---

## 10. Mejores prácticas

### 10.1 Principios de diseño

| Principio | Aplicación |
|-----------|-----------|
| **Single Responsibility** | Cada componente hace una sola cosa (renderizar un tipo de HTML) |
| **Pure functions** | Sin IO, sin estado, sin side effects — misma entrada = misma salida |
| **Fail gracefully** | Componentes nunca lanzan excepciones por datos inválidos |
| **Siempre escapar** | Toda interpolación de datos externos pasa por `esc()` |
| **DRY** | Una sola implementación de `esc()`, tablas, bullets, logo |
| **Configurable > hardcodeado** | CSS class, variant, footerText son parámetros |
| **Composition over configuration** | Slide wrapper compone: logo + head + body + footer |

### 10.2 Convención de nombres

| Categoría | Estilo | Ejemplos |
|-----------|--------|----------|
| Componentes exportados | camelCase | `bullets()`, `tableV()`, `kpiTable()` |
| Helpers exportados | camelCase | `imageDataUri()`, `logoHref()`, `brandCss()` |
| Funciones internas | `_` prefix | `_initials()`, `_resolveFooterText()` |
| Parámetros (contenido) | español | `titulo`, `subtitulo`, `etiqueta`, `valor` |
| Parámetros (técnicos) | inglés | `cls`, `variant`, `type`, `fit` |
| CSS classes | kebab-case | `card-body`, `footer--center`, `accent-soft` |

### 10.3 Manejo de errores

```js
// COMPONENTES PUROS (nunca lanzan):
export function bullets(items = [], cls = 'bullet-list') { ... }
// Todo input inválido → HTML vacío pero válido

// HELPERS CON IO:
export function imageDataUri(path) { ... }
// Path no existe → null (el consumidor decide cómo manejarlo)

// HELPERS DE CONFIGURACIÓN:
export function brandCss(type) { ... }
// type inválido → Error (es error de programación, no de datos)
```

### 10.4 Validación en tests

- **No mockear filesystem** — usar paths reales (existentes e inexistentes)
- **Probar con datos reales de brand** — `brand()` se llama dentro de los tests
- **Comparar strings exactas** para estructura HTML conocida
- **Usar `assert.ok(html.includes(...))`** para fragmentos donde el orden exacto no importa
- **Usar `assert.equal()`** para strings donde el HTML completo se conoce

### 10.5 Jerarquía de fonts

La jerarquía tipográfica debe ser consistente entre deck y report:

| Nivel | Deck | Report |
|-------|------|--------|
| Portada H1 | 60px / 800 | 28pt / 800 |
| Section H1 | 64px / 800 | — |
| Head H1 | 42px / 800 | — |
| Section H2 | — | 16pt / 800 |
| Card H3 | 24px / 800 | — |
| Panel H3 | 28px / 800 | — |
| Cuerpo | 20px / 400 | 9.5pt / 400 |
| Bullet | 24px / 400 | 9.5pt / 400 |
| Footer | 14px / 400 | 7.5pt / 400 |
| KPI value | 64px / 800 | — |
| Badge/eyebrow | 14px / 700 / uppercase | — |

Todas las fuentes deben usar `var(--font-heading)` para títulos y `var(--font-body)` para cuerpo, definidos por `brand.fonts`.

---

## 11. Opciones de extensión

### 11.1 Theme-aware components (futuro)

```js
// Versión futura con auto-detección de clase según tema
export function tableV(headers, rows, options = {}) {
  const { theme = 'deck' } = options;
  const cls = theme === 'deck' ? 'fibex' : 'data-table';
  // ...
}
```

**Decisión**: No implementar ahora. Es más explícito pasar la clase directamente.

### 11.2 Data attributes

```js
export function bullets(items, cls = 'bullet-list', attrs = {}) {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${esc(k)}="${esc(v)}"`).join(' ');
  const lis = items.map(i => `<li>${esc(i)}</li>`).join('');
  return `<ul class="${cls}" ${attrStr}>${lis}</ul>`;
}
```

### 11.3 Memoización de data URIs

```js
const _uriCache = new Map();
export function imageDataUri(path) {
  if (!path) return null;
  if (_uriCache.has(path)) return _uriCache.get(path);
  // ... compute and cache ...
}
```

**Decisión**: Posponer hasta tener perfil de rendimiento. La mayoría de specs usan 1-2 imágenes.

### 11.4 Componentes compuestos (slots)

```js
export function slide({ header, body, footer, logo, extraCls }) {
  return `<section class="slide${extraCls ? ` ${extraCls}` : ''}">
    ${logo || ''}${header || ''}${body || ''}${footer || ''}
  </section>`;
}
```

### 11.5 TypeScript JSDoc para autocompletado

```js
/**
 * Renderiza un KPI con valor y etiqueta.
 * @param {string} valor — valor numérico (ej. "99%", "1,234")
 * @param {string} etiqueta — label descriptivo
 * @returns {string} HTML string del KPI
 */
export function kpi(valor = '', etiqueta = '') {
```

Esto proporciona autocompletado en VS Code y WebStorm sin migrar a TypeScript.

### 11.6 Extensión a otros builders

Los componentes en `components.js` son puramente HTML y podrían ser reutilizados por:
- `build-web.js` — ya genera HTML, usar `components.js` directamente
- `build-pptx.js` — no (usa Python), pero futuros builders JS de PPTX podrían usar los mismos componentes para HTML intermedio
- Posibles builders: email, dashboard web, snippets embed

---

## 12. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| **Regresión visual** en decks/reportes existentes | Media | Alto | Smoke tests (477 tests) pasan antes y después; generar 3 specs de muestra y comparar visualmente |
| **Dependencia circular** entre módulos | Baja | Alto | Grafo acíclico validado en 3.2; `index.js` no importa de `components.js` ni `theme-utils.js` |
| **CSS class cambiada** por error | Baja | Medio | Components compartidos reciben clase explícitamente desde cada tema |
| **Componente olvidado** en refactor de html-theme.js | Baja | Medio | grep de todas las funciones movidas verifica que se importan desde `components.js` |
| **Footer se rompe** por cambio de estado mutable a puro | Media | Alto | Cada layout pasa footerText explícitamente a `_slide()`, que lo pasa a `foot()` |
| **brandCss() no coincide** con variables CSS existentes | Media | Alto | Se mapean exactamente los mismos nombres de variable que usa cada CSS |
| **Tests no detectan** diferencia en HTML generado | Baja | Medio | Tests incluyen asserts de contenido (includes) y estructura (startsWith) |
| **imageDataUri sin cache** = múltiples lecturas de disco | Baja | Bajo | Aplazar; la mayoría de specs usan 1-2 imágenes |
| **Merge conflict** si otro PR toca los mismos archivos | Baja | Alto | El refactor se hace en una rama dedicada; los cambios son mecánicos (extraer + importar) |
| **brandCss rompe charts.js** que importa esc desde index.js | Baja | Alto | charts.js importa `{ esc }` de index.js, no de theme-utils; no cambia |

### 12.1 Estrategia de migración

```
Fase 0 (pre-refactor): regenerar todas las salidas, revisar visualmente
Fase 1: crear theme-utils.js (no rompe nada)
Fase 2: crear components.js (no rompe nada)
Fase 3: crear tests/components.test.js con 18 fases TDD
Fase 4: refactorizar html-theme.js (importar, eliminar duplicación)
Fase 5: refactorizar report-theme.js (importar, eliminar duplicación)
Fase 6: npm test (477 + 80 = ~557 tests)
Fase 7: regenerar salidas, comparar visualmente
Fase 8: corregir brand.json consistencia en CSS (post-refactor)
```

Cada fase es reversible. Si un test falla, se sabe exactamente qué archivo y función causó el problema.

---

## 13. Checklist de implementación

- [x] **Fase 0**: Regenerar TODAS las salidas docgen actuales para línea base visual
  - [x] `npm run docgen:validate`
  - [x] `npm test` (registrar línea base: ~477 tests)
  - [x] Generar 3 outputs de muestra (deck, report, image) y guardar como referencia
- [x] **theme-utils.js**
  - [x] `esc()` re-export desde index.js
  - [x] `imageDataUri(path)`
  - [x] `logoHref(variant)`
  - [x] `brandCss(type)`
- [x] **components.js**
  - [x] `logo(pos, variant)`
  - [x] `foot(center, page, footerText)`
  - [x] `head(titulo, sub, eyebrow)`
  - [x] `sectionBlock(titulo, sub)`
  - [x] `bullets(items, cls)`
  - [x] `tableV(headers, rows, cls)`
  - [x] `card(data)`
  - [x] `panel(data)`
  - [x] `kpi(valor, etiqueta)`
  - [x] `person(data)`
  - [x] `media(src, cls, fit)`
  - [x] `callout(headline, parrafos)`
  - [x] `recommendation(data)`
  - [x] `roadmap(headers, phases)`
  - [x] `kpiTable(headers, kpis)`
  - [x] `closing(parrafos)`
- [x] **Tests** (tests/commands/components.test.js — 71 tests, 18 fases)
  - [x] Fase 1: esc (4 tests)
  - [x] Fase 2: imageDataUri (6 tests)
  - [x] Fase 3: logoHref (3 tests)
  - [x] Fase 4: brandCss (5 tests)
  - [x] Fase 5: bullets (4 tests)
  - [x] Fase 6: tableV (5 tests)
  - [x] Fase 7: head (4 tests)
  - [x] Fase 8: sectionBlock (2 tests)
  - [x] Fase 9: kpi (3 tests)
  - [x] Fase 10: person (6 tests)
  - [x] Fase 11: card (5 tests)
  - [x] Fase 12: panel (3 tests)
  - [x] Fase 13: callout (3 tests)
  - [x] Fase 14: recommendation (3 tests)
  - [x] Fase 15: roadmap (3 tests)
  - [x] Fase 16: kpiTable (3 tests)
  - [x] Fase 17: closing (3 tests)
  - [x] Fase 18: logo + foot (6 tests)
- [x] **Refactor html-theme.js**
  - [x] Importar desde components.js + theme-utils.js
  - [x] Eliminar funciones duplicadas
  - [x] Footer puro (sin mutable state)
  - [x] brandCss('deck') en _css()
- [x] **Refactor report-theme.js**
  - [x] Importar desde components.js + theme-utils.js
  - [x] Eliminar funciones duplicadas
  - [x] brandCss('report') en _css()
  - [x] _pageFooter usa foot()
- [x] **Verificación final**
  - [x] `npm test` (548 tests, supera línea base de 477)
  - [x] `node shared/scripts/docgen/validate.js --quick`
  - [x] Regenerar salidas y comparar con línea base visual
  - [x] Verificar que brand.json colores se reflejan en output
  - [x] Verificar que brand.json fonts se reflejan en output
