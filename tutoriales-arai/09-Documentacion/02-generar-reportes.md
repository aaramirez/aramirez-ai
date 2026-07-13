---
tags:
  - documentacion
  - reporte
created: 2026-07-05
---

# Generar reportes

> **Objetivo**: Crear documentos formales (reportes) con datos, tablas y secciones usando el pipeline docgen y sus 10 tipos de layout.

**⏱ Tiempo estimado**: 8 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: Node.js 18+, Chrome (para PDF)

## Resultado esperado

Generar reportes profesionales como SOW, project charter, ADR, postmortems o status reports desde una especificación JSON.

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

Edita `shared/brand.json` para configurar colores, logos y tipografía. Todos los documentos generados usarán estos valores automáticamente.

---

**Siguiente**: [[09-Documentacion/03-exportar-vault.md|Exportar vault a PDF]]
