---
tags:
  - referencias
  - branding
created: 2026-07-05
---

# Branding

> **Objetivo**: Configurar la identidad visual de los documentos generados por el pipeline docgen: colores, logos y tipografía institucional.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Básico
**📋 Requisitos**: Archivo `shared/brand.json` disponible

## Resultado esperado

Poder definir y aplicar una identidad visual completa (colores primarios/secundarios, logo, nombre) a todos los PDFs, HTML y presentaciones generados.

## ¿Qué es el branding en arai?

El branding define la identidad visual de todos los documentos generados por el pipeline docgen. Incluye colores, logos y tipografía.

## Configurar branding

Edita `shared/brand.json` directamente para configurar:

- **Colores**: primario, secundario, fondo, texto, acento
- **Logos**: versiones azul y blanca (PNG)
- **Tipografía**: fuente principal y monoespaciada

## Archivo generado

`shared/brand.json`:

```json
{
  "name": "Mi Organización",
  "primary": "#3730a3",
  "secondary": "#6366f1",
  "bg": "#ffffff",
  "ink": "#23264f",
  "accent": "#f59e0b",
  "line": "#d9dee8",
  "font": "'Inter', sans-serif",
  "mono": "'SF Mono', 'Fira Code', monospace"
}
```

## Uso en documentos

El branding se carga automáticamente al generar documentos:

```bash
npm run docgen:deck assets/decks/mi-deck.json
```

Los colores se inyectan como variables CSS `:root` en el HTML antes de convertir a PDF.

## Skills asociadas

`branding` skill describe cómo aplicar y modificar la identidad visual.

---

**Siguiente**: [[08-Referencias/04-repos-referencia.md|Repositorios de referencia]]
