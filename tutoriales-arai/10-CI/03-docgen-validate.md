---
tags:
  - ci
  - docgen
created: 2026-07-05
---

# DocGen Validate

> **Objetivo**: Validar el pipeline de documentación: sintaxis de especificaciones, templates, builders y consistencia de datos.

**⏱ Tiempo estimado**: 4 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[10-CI/02-tests.md|Tests]]

## Resultado esperado

Ejecutar `docgen/validate.js` para detectar errores en especificaciones JSON, templates faltantes o inconsistencias en el pipeline.

## Descripción

Valida el pipeline de documentación: verifica que los specs JSON/MD, templates y builders estén correctos.

## Uso

```bash
# Validación completa
node shared/skills/document-generation/scripts/docgen/validate.js

# Validación rápida (solo sintaxis + templates)
node shared/skills/document-generation/scripts/docgen/validate.js --quick
```

## Qué verifica

- Archivos spec JSON: sintaxis, campos requeridos, tipos
- Archivos spec MD: frontmatter, formato
- Templates: todos los layouts y secciones
- Builders: exports de funciones requeridas
- Charts: tipos de gráficos soportados

## Integración en CI

```bash
npm run docgen:validate
```

---

**Siguiente**: [[10-CI/04-outcome-validation.md|Outcome Validation]]
