---
tags:
  - documentacion
  - deck
  - presentacion
created: 2026-07-05
---

# Generar decks

## Preparación

Asegúrate de tener Chrome/Chromium instalado para la generación de PDF.

## Paso 1: Crear un spec JSON

```json
{
  "title": "Mi Presentación",
  "slides": [
    {
      "layout": "title",
      "title": "Mi Presentación",
      "subtitle": "Subtítulo aquí"
    },
    {
      "layout": "content",
      "title": "Slide 1",
      "bullets": ["Punto uno", "Punto dos", "Punto tres"]
    },
    {
      "layout": "closing",
      "title": "Gracias"
    }
  ]
}
```

## Paso 2: Generar el deck

```bash
npm run docgen:deck assets/decks/mi-deck.json
```

O directamente:

```bash
node shared/scripts/docgen/build-deck.js assets/decks/mi-deck.json
```

## Paso 3: Ver el resultado

El PDF se genera en `assets/docs/` por defecto.

## Plantillas disponibles

```bash
npm run docgen:templates
```

Incluye plantillas para: weekly, sprint, planning, status, release, tech-design, ADR, API docs, architecture, runbook, y más.

---

**Siguiente**: [[09-Documentacion/02-generar-reportes.md|Generar reportes]]
