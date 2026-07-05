---
tags:
  - documentacion
  - reporte
created: 2026-07-05
---

# Generar reportes

## Diferencia entre deck y reporte

- **Deck**: presentación visual, diapositivas.
- **Reporte**: documento formal, orientado a lectura lineal.

## Paso 1: Crear un spec de reporte

```json
{
  "title": "Reporte de Estado",
  "sections": [
    {
      "type": "executive-summary",
      "content": "Resumen ejecutivo del proyecto..."
    },
    {
      "type": "metrics",
      "kpis": [
        { "label": "Completado", "value": "75%" },
        { "label": "En progreso", "value": "20%" }
      ]
    },
    {
      "type": "table",
      "headers": ["Tarea", "Estado", "Responsable"],
      "rows": [
        ["Módulo 1", "Completado", "Ana"],
        ["Módulo 2", "En progreso", "Luis"]
      ]
    }
  ]
}
```

## Paso 2: Generar el reporte

```bash
npm run docgen:report assets/decks/mi-reporte.json
```

## Paso 3: Personalizar con branding

```bash
arai generate brand
```

Esto configura colores, logos y tipografía en `shared/brand.json`. Todos los documentos generados usarán estos valores automáticamente.

---

**Siguiente**: [[09-Documentacion/03-exportar-vault.md|Exportar vault a PDF]]
